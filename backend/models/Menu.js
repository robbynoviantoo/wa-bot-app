const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  groupWaId: { type: String, required: true, unique: true },
  commands: [{ type: String }]  // Daftar command yang bisa disimpan
}, {
  timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);
