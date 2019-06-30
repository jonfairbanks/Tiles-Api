// Import dependencies
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const index = require("./routes/index");
const socketsHandler = require("./routes/socket");
const bodyParser = require('body-parser');

// Initialize database models and connect.
const { connectDb } = require("./models");
connectDb()

// Define and setup server
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

// Tell socket.io to use redis adapter if specified
if(process.env.Redis_Hostname){
  var redis = require('socket.io-redis');
  io.adapter(redis({ host: process.env.Redis_Hostname, port: 6379 }));
}

// Tell socket events to go to socket handler. Similar to how routes work
io.on("connection", socket => {
  console.log("New client connected");
  socketsHandler(socket)
});

module.exports = server;