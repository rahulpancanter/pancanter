const mongoose = require('mongoose');

const panRequestSchema = new mongoose.Schema({
  fullname: String,
  mobile: String,
  email: String,
  pan_mode: String,
  pan_type: String,
  orderid: String,
  txnid: String,
  redirecting_url: String,
  aadharNumber: String,
  pannumber: String,
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PanRequest', panRequestSchema);
