const os = require('os');
const Tile = require("../models/tile");

var boardCurrentState = {
  connections: 0,
};

var currentRoom;

module.exports = function(io, socket) {

  socket.on("joinChannel", (channelId,username) => {
    socket.join(channelId);
    socket.username = username

    //console.log(socket.id + "/" + username + " joined channel: " + channelId)
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

    //console.log("Change received on channel " + channelId + ". " + tileUpdateData.length);
    socket.to(channelId).emit('updateTiles', tileUpdateData);

    for (var i = 0; i < tileUpdateData.length; i++){
      boardCurrentState.tiles[tileUpdateData[i].x][tileUpdateData[i].y] = tileUpdateData[i].color
      
      //update current board state
      Tile.updateOne({_id:channelId},{
        $set : {
          ['boardData.' + tileUpdateData[i].x + '.' + tileUpdateData[i].y]: tileUpdateData[i].color
        }
      }).then({
        //console.log("sucess")
      }).catch({
        //console.log(error);
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
    }).then({
      //console.log("sucess")
    }).catch({
      //console.log(error);
    });
    
    
    
  });

  //Handle messages
  socket.on("message", (channelId, message) => {
    //console.log("message received");
    io.in(currentRoom).emit('message', message);
    Tile.updateOne({_id:currentRoom},{
      $push : {
        'boardMessages': message
      },
      $set : {
        'lastUpdate': new Date().toISOString()
      }
    }).then({
      //console.log("sucess")
    }).catch({
      //console.log(error);
    });
  });

  //Log disconnects
  socket.on("disconnect", () => {
    //console.log(socket.id + "/" + socket.username + " left channel: " + currentRoom)
    socket.to(currentRoom).emit('userLeft', socket.username)
  });

};