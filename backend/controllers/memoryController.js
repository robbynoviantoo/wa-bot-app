const Memory = require('../models/Memory');

// Set atau update memory (upsert)
exports.setMemory = async (req, res) => {
  const { groupWaId, key, value, expiresAt } = req.body;

  try {
    const memory = await Memory.findOneAndUpdate(
      { groupWaId, key },
      { value, expiresAt, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil memory tertentu
exports.getMemory = async (req, res) => {
  const { groupWaId, key } = req.params;

  try {
    const memory = await Memory.findOne({ groupWaId, key });
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil semua memory 1 grup
exports.getAllMemory = async (req, res) => {
  const { groupWaId } = req.params;

  try {
    const memory = await Memory.find({ groupWaId });
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
