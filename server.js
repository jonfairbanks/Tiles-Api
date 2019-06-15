
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
  

  socket.on("joinChannel", (channelId,username) => {
    socket.join(channelId);
    socket.username = username

    console.log(socket.id + "/" + username + " joined channel: " + channelId)
    currentRoom = channelId

      Tile.findOne({_id:channelId}).then(board => {
        boardCurrentState.tiles = board.boardData
        boardCurrentState.connections = 0
        boardCurrentState.messages = board.boardMessages
        boardCurrentState.apiHost = socket.handshake.address + " is connecting to: " + os.hostname()
        socket.emit('setBoardState', boardCurrentState);
      });

    socket.to(channelId).emit('userJoined', username)

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
  socket.on("message", (channelId, message) => {
    console.log("message received");
    io.in(currentRoom).emit('message', message);
    Tile.updateOne({_id:currentRoom},{
      $push : {
        'boardMessages': message
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
    console.log(socket.id + "/" + socket.username + " left channel: " + currentRoom)
    socket.to(currentRoom).emit('userLeft', socket.username)
  });
});


// InitializeDB and Tell server to start/listen
connectDb().then(async () => {
  server.listen(port, () => 
    console.log(`Listening on port ${port}`)
  );

});