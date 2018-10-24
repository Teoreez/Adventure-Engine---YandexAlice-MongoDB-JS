const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  uid: {type: String},
  name: {type: String},
  stateofgame: {type: String},
});

module.exports = mongoose.model('Users', userSchema);