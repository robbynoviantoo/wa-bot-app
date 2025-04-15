const Group = require('../models/Group');

exports.registerGroup = async (req, res) => {
  try {
    const { waId, name, participants } = req.body;
    const group = await Group.findOneAndUpdate(
      { waId },
      { name, participants },
      { upsert: true, new: true }
    );
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
