const MessageLog = require('../models/MessageLog');

exports.saveMessage = async (req, res) => {
  try {
    const { from, to, message, groupId, direction } = req.body;

    const log = new MessageLog({ from, to, message, groupId, direction });
    await log.save();

    res.json({ status: 'ok', data: log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessagesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await MessageLog.find({ groupId }).sort({ timestamp: -1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
