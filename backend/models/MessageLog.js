const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
  from: String,
  to: String,
  message: String,
  groupId: String, // kaitkan ke waId dari Group
  direction: { type: String, enum: ['inbound', 'outbound'], default: 'inbound' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MessageLog', messageLogSchema);
