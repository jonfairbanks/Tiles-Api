// Import dependencies
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4001;
const index = require("./routes/index");

// Define and setup server
const app = express();
app.use(index);

const server = http.createServer(app);
const io = socketIo(server);

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
  baseColor: baseColor,
  tiles: createTileGrid(110, 275, baseColor)
};

// use below link to create 2D array function
//https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938


// Define basic socket events
io.on("connection", socket => {
  console.log("New client connected");

  boardCurrentState.connections = boardCurrentState.connections + 1;
  socket.broadcast.emit('setBoardState', boardCurrentState);

  //Tell new client of current boardState
  emitBoardState(socket);



  socket.on("updateTiles", tileUpdateData => {
    console.log("Tile change received" + tileUpdateData);
    //boardCurrentState = desiredState;
    socket.broadcast.emit('updateTiles', tileUpdateData);
    
  });

  //Log disconnects
  socket.on("disconnect", () => {

    boardCurrentState.connections = boardCurrentState.connections - 1;
    socket.broadcast.emit('setBoardState', boardCurrentState);
    console.log("Client disconnected");
  });
});

// Function to broadcast board state
const emitBoardState = async socket => {
    socket.emit("setBoardState", boardCurrentState);
    console.log("Board state emitted.");
};

// Tell server to start/listen
server.listen(port, () => console.log(`Listening on port ${port}`));
