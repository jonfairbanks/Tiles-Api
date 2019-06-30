const express = require("express");
const router = express.Router();
const Tile = require('../controllers/tile');
const os = require('os');

router.get("/", (req,res) => {
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : "Unknown");
  res.send({ response: {msg:"I am alive", host: os.hostname(), clientSourceIP: ip}}).status(200);
});
router.get("/healthz", (req,res) => {
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : "Unknown");
  res.send({ response: {msg:"I am alive", host: os.hostname(), clientSourceIP: ip}}).status(200);
});

router.get("/tiles", Tile.list)
router.get("/tiles/:boardId", Tile.get)
router.get("/tiles/:boardId/log", Tile.log)
router.post("/tiles", Tile.post)

module.exports = router;
