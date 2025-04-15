const Menu = require('../models/Menu');
const Memory = require('../models/Memory'); // pastikan sudah di-import

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
const getGroupMenu = async (req, res) => {
  const { groupWaId } = req.params;

  try {
    const menu = await Menu.findOne({ groupWaId });
    if (!menu) {
      return res.status(404).json({ error: 'Menu tidak ditemukan untuk grup ini' });
    }
    res.json({ commands: menu.commands });
  } catch (err) {
    console.error('❌ Error saat get menu:', err);
    res.status(500).json({ error: err.message });
  }
};

const removeCommand = async (req, res) => {
  const { groupWaId, command } = req.body;

  if (!groupWaId || !command) {
    return res.status(400).json({ error: 'groupWaId dan command wajib diisi' });
  }

  try {
    // 1. Hapus command dari Menu
    const menu = await Menu.findOneAndUpdate(
      { groupWaId },
      { $pull: { commands: command } },
      { new: true }
    );

    // 2. Hapus memory dengan key = command di grup yang sama
    await Memory.deleteOne({ groupWaId, key: `command:${command}` });

    res.json({ success: true, data: menu });
  } catch (err) {
    console.error('❌ Error saat remove command:', err);
    res.status(500).json({ error: err.message });
  }
};

// Controller untuk mengambil daftar grup
const getGroups = async (req, res) => {
  try {
    // Fetch groups dengan memilih hanya groupWaId dan commands
    const groups = await Menu.find().select('groupWaId commands');

    // Jika tidak ada grup, kembalikan array kosong
    if (groups.length === 0) {
      return res.json({ groups: [] });
    }

    // Kirim response dengan daftar grup
    res.json({ groups });
  } catch (err) {
    console.error('❌ Error saat mengambil daftar grup:', err);
    res.status(500).json({ error: 'Gagal mengambil daftar grup' });
  }
};

module.exports = { setMenu, removeCommand, getGroups, getGroupMenu};
