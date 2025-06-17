const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mobile: String,
  address: String,
  photo: String,
  role: { type: String, default: 'user' },
  walletbalance: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema, 'users'); // Force 'users' collection
