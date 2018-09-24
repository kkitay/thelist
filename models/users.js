const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Item
const userSchema = new mongoose.Schema ({
  username: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.validPassword = function(pass) {
  let match = bcrypt.compareSync(pass, this.passwordHash);
  if(match) {
    return true;
  } else {
    return false;
  }
};

userSchema.virtual('password').set(function(pass) {
  console.log('hashing a new password');
  this.passwordHash = bcrypt.hashSync(pass, 12);
});

module.exports = mongoose.model('user', userSchema);