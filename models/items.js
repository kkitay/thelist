const mongoose = require('mongoose');

// Item
const itemSchema = new mongoose.Schema ({
  title: String,
  url: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: null
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  deleted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }
});

module.exports = mongoose.model('item', itemSchema);