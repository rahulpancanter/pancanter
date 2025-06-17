const mongoose = require('mongoose');

const newAcceptEnPanSchema = new mongoose.Schema({
  parentName: { type: String, required: true },
  dob: { type: String, required: true },
  mobile: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: String, required: true },
  ackNo: { type: String, required: true },
  remark: { type: String }
}, { timestamps: true });

const Newacceptenpan = mongoose.model('Newacceptenpan', newAcceptEnPanSchema);
module.exports = Newacceptenpan;
