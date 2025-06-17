const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  email: String,
  amount: Number,
  type: String,
  date: { type: Date, default: Date.now },
  reference: String
});

module.exports = mongoose.model('Transaction', transactionSchema);
