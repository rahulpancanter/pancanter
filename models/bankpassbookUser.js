const mongoose = require('mongoose');

const bankpassbookSchema = new mongoose.Schema({
  fullname: String,
  username: String,
  fulladdress: String,
  accountType: String,
  ifsc: String,
  state: String,
  pin: String,
  shopname: String,
  mobile: String,
  email: String,
  aadhaar: String,
  pan: String,
  bankName: String,
  pdfPath: String, // 📎 path to the uploaded PDF
}, { timestamps: true });

module.exports = mongoose.model('bankpassbookUser', bankpassbookSchema);
