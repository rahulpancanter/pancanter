const mongoose = require('mongoose');

const panDataSchema = new mongoose.Schema({
  pannumber: { type: String, required: true },
  acknowledgmentNo: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, required: true },
  pdfFileName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PanData', panDataSchema);
