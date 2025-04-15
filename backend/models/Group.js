const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  waId: { type: String, required: true, unique: true }, // ID WhatsApp grup
  name: { type: String },
  participants: [String], // list nomor WA
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);
