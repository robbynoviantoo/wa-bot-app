const Menu = require('../models/Menu');

// Menyimpan atau memperbarui menu (commands) untuk grup
const setMenu = async (req, res) => {
  const { groupWaId, command } = req.body;

  if (!groupWaId || !command) {
    return res.status(400).json({ error: 'groupWaId dan command wajib diisi' });
  }

  try {
    const menu = await Menu.findOneAndUpdate(
      { groupWaId },
      { $addToSet: { commands: command } }, // Menambahkan command jika belum ada
      { new: true, upsert: true }
    );
    res.json({ success: true, data: menu });
  } catch (err) {
    console.error('❌ Error saat set menu:', err);
    res.status(500).json({ error: err.message });
  }
};

// Mengambil menu (commands) untuk grup
const getMenu = async (req, res) => {
  const { groupWaId } = req.params;

  try {
    const menu = await Menu.findOne({ groupWaId });
    if (!menu) return res.status(404).json({ error: 'Menu tidak ditemukan untuk grup ini' });
    res.json({ commands: menu.commands });
  } catch (err) {
    console.error('❌ Error saat get menu:', err);
    res.status(500).json({ error: err.message });
  }
};

// Menghapus command dari menu
const removeCommand = async (req, res) => {
  const { groupWaId, command } = req.body;

  if (!groupWaId || !command) {
    return res.status(400).json({ error: 'groupWaId dan command wajib diisi' });
  }

  try {
    const menu = await Menu.findOneAndUpdate(
      { groupWaId },
      { $pull: { commands: command } }, // Menghapus command dari daftar
      { new: true }
    );
    res.json({ success: true, data: menu });
  } catch (err) {
    console.error('❌ Error saat remove command:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { setMenu, getMenu, removeCommand };
