// Import dependencies
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const bodyParser = require('body-parser');
const os = require('os');

// Import models and initialize database
const { connectDb } = require("./models");
const Tile = require("./models/tile");

// Define and setup server
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(index);


const server = http.createServer(app);
const io = socketIo(server);

if(process.env.Redis_Hostname){
  var redis = require('socket.io-redis');
  io.adapter(redis({ host: process.env.Redis_Hostname, port: 6379 }));
}



baseColor = '#222';
activeColor = '#888';

function createTileGrid(width, height, baseColor){
    var result = [];
    for (var i = 0 ; i < width; i++) {
        result[i] = [];
        for (var j = 0; j < height; j++) {
            result[i][j] = baseColor;//(Math.random() * 5 | 0) + 6;
        }
    }
    return result;
}

var boardCurrentState = {
  connections: 0,
  activeColor: activeColor,
  baseColor: baseColor
};

// use below link to create 2D array function
//https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938

var currentRoom;
// Define basic socket events
io.on("connection", socket => {
  console.log("New client connected");
  

  socket.on("joinChannel", channelId => {
    socket.join(channelId);
    console.log(socket.id + " joined channel: " + channelId)
    currentRoom = channelId

    var room = io.sockets.adapter.rooms[currentRoom]
    var numClients = (typeof room !== 'undefined') ? Object.keys(room.sockets).length : 0;
    socket.to(currentRoom).emit('updateConnections', numClients);
    console.log(numClients);

    Tile.findOne({_id:channelId}).then(board => {
      boardCurrentState.tiles = board.boardData
      boardCurrentState.connections = numClients
      boardCurrentState.apiHost = os.hostname()
      socket.emit('setBoardState', boardCurrentState);
    });
    
    
    
  })

  socket.on("updateTiles", (channelId, tileUpdateData) => {

    console.log("Change received on channel " + channelId + ". " + tileUpdateData.length);
    socket.to(channelId).emit('updateTiles', tileUpdateData);

    for (var i = 0; i < tileUpdateData.length; i++){
      boardCurrentState.tiles[tileUpdateData[i].x][tileUpdateData[i].y] = tileUpdateData[i].color
      
      //update current board state
      Tile.updateOne({_id:channelId},{
        $set : {
          ['boardData.' + tileUpdateData[i].x + '.' + tileUpdateData[i].y]: tileUpdateData[i].color
        }
      }).then(board => {
        //console.log("sucess")
      }).catch(error => {
        console.log(error);
      });
    }

    //Add to the transaction log for the board.
    Tile.updateOne({_id:channelId},{
      $push : {
        'boardLog': tileUpdateData
      },
      $set : {
        'lastUpdate': new Date().toISOString()
      }
    }).then(board => {
      //console.log("sucess")
    }).catch(error => {
      console.log(error);
    });
    
    
    
  });

  //Log disconnects
  socket.on("disconnect", () => {
    //boardCurrentState.connections = boardCurrentState.connections - 1;
    //socket.broadcast.emit('setBoardState', boardCurrentState);
    console.log("Client disconnected");

    var room = io.sockets.adapter.rooms[currentRoom]
    var numClients = (typeof room !== 'undefined') ? Object.keys(room.sockets).length : 0;
    socket.to(currentRoom).emit('updateConnections', numClients);

  });
});


// InitializeDB and Tell server to start/listen
connectDb().then(async () => {
  server.listen(port, () => 
    console.log(`Listening on port ${port}`)
  );
});