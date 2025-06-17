const mongoose = require('mongoose');

const psaUserSchema = new mongoose.Schema({
  fullname: String,
  username: String,
  fulladdress: String,
  village: String,
  city: String,
  state: String,
  pin: String,
  shopname: String,
  mobile: String,
  email: String,
  aadhaar: String,
  pan: String,
  accountType: String,
  rate: String
}, { timestamps: true });

module.exports = mongoose.model('PsaUser', psaUserSchema);
