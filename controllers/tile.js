
let Tile = require('../models/tile');

// Retrieve a list of all tiles (optionally filter by url params)
exports.list = (req, res) => {
	Tile.find()
		.then(tiles => {
			res.json(tiles);
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});
};

// Retrieve a list of all tiles (optionally filter by url params)
exports.log = (req, res) => {
	Tile.findOne({_id: req.params.boardId})
		.then(board => {
			res.json(board.boardLog);
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});
};

// Retrieve a list of all tiles (optionally filter by url params)
exports.get = (req, res) => {
	Tile.findOne({_id: req.params.boardId})
		.then(board => {
      var result = {}
      result.name = board.name
      result._id = board._id
      result.lastUpdate = board.lastUpdate
      result.dateCreated = board.dateCreated
      result.updateCount = board.updateCount
      result.boardData = board.boardData
			res.json(result);
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});
};

// Create a new tile
exports.post = (req, res) => {
	if (!req.body.name) {
    res.json({success: false, msg: 'Please provide a name'});
  } else {
    var newTile = new Tile({
      name: req.body.name,
      boardData: createTileGrid(135, 275, req.body.baseColor),
      dateCreated: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    });
    // save the user
    newTile.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Error saving tile'});

      }
      res.json({success: true, boardId: newTile._id});

    });

  }
};


function createTileGrid(width, height, baseColor){
  var result = [];
  for (var i = 0 ; i < width; i++) {
      result[i] = [];
      for (var j = 0; j < height; j++) {
          result[i][j] = baseColor;// (Math.random() * 5 | 0) + 6;
      }
  }
  return result;
}