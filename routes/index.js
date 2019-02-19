const express = require("express");
const router = express.Router();
const Tile = require('../controllers/tile');

router.get("/", (req,res) => {
  res.send({ response: "I am alive"}).status(200);
});

router.get("/tiles", Tile.list)
router.get("/tiles/:boardId", Tile.get)
router.get("/tiles/:boardId/log", Tile.log)
router.post("/tiles", Tile.post)

module.exports = router;
