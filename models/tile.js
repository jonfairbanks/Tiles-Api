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
  dateCreated:{type:Date},

},{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

tileSchema.virtual('updateCount').get(function() {  
  return this.boardLog.length
});

module.exports = mongoose.model('Tile', tileSchema);