const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  groupWaId: { type: String, required: true },
  key: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed,  // bisa simpan object, string, number
  expiresAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now }
});

memorySchema.index({ groupWaId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Memory', memorySchema);
