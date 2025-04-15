const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api'; // Ganti jika beda host/port backend

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

module.exports = {
  // Log pesan ke database
  logMessage: async ({ from, to, message, groupId, direction }) => {
    try {
      await api.post('/message', { from, to, message, groupId, direction });
    } catch (err) {
      console.error('❌ Gagal log message:', err.message);
    }
  },

  // Set memory temporer (key-value)
  setMemory: async ({ groupWaId, key, value, expiresAt = null }) => {
    try {
      await api.post('/memory', { groupWaId, key, value, expiresAt });
    } catch (err) {
      console.error('❌ Gagal set memory:', err.message);
    }
  },

  // Ambil data memory berdasarkan grup dan key
  getMemory: async (groupWaId, key) => {
    try {
      const res = await api.get(`/memory/${groupWaId}/${key}`);
      return res.data?.value || null;
    } catch (err) {
      console.error('❌ Gagal get memory:', err.message);
      return null;
    }
  },

  // Ambil daftar command (menu) dari grup tertentu
  getMenu: async (groupWaId) => {
    try {
      const res = await api.get(`/menu/${groupWaId}`);
      return res.data; // langsung return object { commands: [...] }
    } catch (err) {
      console.error('❌ Gagal mendapatkan menu:', err.message);
      return { commands: [] }; // fallback biar aman
    }
  },
  
  // Tambah command ke menu grup
  addCommand: async ({ groupWaId, command }) => {
    try {
      await api.post('/menu', { groupWaId, command });
    } catch (err) {
      console.error('❌ Gagal menambahkan command ke menu:', err.message);
    }
  },

  // Hapus command dari menu grup
  removeCommand: async ({ groupWaId, command }) => {
    try {
      await api.post('/menu/remove', { groupWaId, command });
    } catch (err) {
      console.error('❌ Gagal menghapus command dari menu:', err.message);
    }
  },

  // Set custom response untuk command tertentu
  setResponse: async ({ groupWaId, command, response }) => {
    try {
      await api.post('/memory', {
        groupWaId,
        key: `command:${command}`,
        value: response
      });
    } catch (err) {
      console.error('❌ Gagal set response command:', err.message);
    }
  }
};
