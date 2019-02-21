const mongoose = require('mongoose');

const tileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  boardData: {
    type: Array,
    require: true,
  },
  boardLog: {
    type: Array
  },
  lastUpdate:{type:Date},
  dateCreated:{type:Date}
});

module.exports = mongoose.model('Tile', tileSchema);