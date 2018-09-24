const mongoose = require('mongoose');

// Category
const categoriesSchema = new mongoose.Schema({
  name: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('categories', categoriesSchema);