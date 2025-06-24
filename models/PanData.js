const mongoose = require('mongoose');

const panSchema = new mongoose.Schema({
  acknowledgmentNo: String,
  pannumber: String,
  fullName: String,
  email: String,
  status: String,
  pdfFileName: String,
}, { timestamps: true });

module.exports = mongoose.model('PanData', panSchema);
