const mongoose = require('mongoose');

const UpdatePancarddocSchema = new mongoose.Schema({
  application_id: String,
  aadhar_file: String,
  pancard_pdf: String,
  photo: String,
  signature: String,
  processing_fee: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UpdatePancarddoc', UpdatePancarddocSchema);
