const axios = require("axios");

const BASE_URL = "http://localhost:3009/api"; // Ganti jika beda host/port backend
// const BASE_URL = "http://backend:3009/api"; // Ganti dengan nama service backend di Docker

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

module.exports = {
  // Log pesan ke database
  logMessage: async ({ from, to, message, groupId, direction }) => {
    try {
      await api.post("/message", { from, to, message, groupId, direction });
    } catch (err) {
      console.error("❌ Gagal log message:", err.message);
    }
  },

  // Set memory temporer (key-value)
  setMemory: async ({ groupWaId, key, value, expiresAt = null }) => {
    try {
      await api.post("/memory", { groupWaId, key, value, expiresAt });
    } catch (err) {
      console.error("❌ Gagal set memory:", err.message);
    }
  },

  // Ambil data memory berdasarkan grup dan key
  getMemory: async (groupWaId, key) => {
    try {
      const res = await api.get(`/memory/${groupWaId}/${key}`);
      return res.data?.value || null;
    } catch (err) {
      console.error("❌ Gagal get memory:", err.message);
      return null;
    }
  },

  // Ambil daftar command (menu) dari grup tertentu
  getMenu: async (groupWaId) => {
    try {
      const res = await api.get(`/menu/${groupWaId}`);
      return res.data; // langsung return object { commands: [...] }
    } catch (err) {
      console.error("❌ Gagal mendapatkan menu:", err.message);
      return { commands: [] }; // fallback biar aman
    }
  },

  // Tambah command ke menu grup
  addCommand: async ({ groupWaId, command }) => {
    try {
      await api.post("/menu/set", { groupWaId, command });
    } catch (err) {
      console.error("❌ Gagal menambahkan command ke menu:", err.message);
    }
  },

  // Ambil stok produk
  getStock: async () => {
    try {
      const res = await api.get("/payment/stock");
      return res.data;
    } catch (err) {
      console.error("❌ Gagal ambil stok:", err.message);
      return [];
    }
  },

  // Buat pembelian
  buyProduct: async ({ code, quantity, name, email }) => {
    try {
      const res = await api.post("/payment/buy", {
        code,
        quantity,
        name,
        email,
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Gagal membeli produk.");
    }
  },

  // Finalisasi order: ubah status ke "settlement" dan tandai akun tidak available
  finalizeOrder: async (order_id) => {
    try {
      const res = await api.post("/payment/finalize", { order_id });
      return res.data;
    } catch (err) {
      console.error("❌ Gagal finalize order:", err.message);
      throw new Error("Gagal menyelesaikan pesanan.");
    }
  },

  // Batalkan order dan kembalikan akun ke available
  cancelOrder: async (order_id) => {
    try {
      const res = await api.post("/payment/cancel", { order_id });
      return res.data;
    } catch (err) {
      console.error("❌ Gagal cancel order:", err.message);
      throw new Error("Gagal membatalkan pesanan.");
    }
  },

  // Rollback stok & akun jika pembayaran gagal / kadaluarsa
  rollbackStockAndAccount: async (order_id) => {
    try {
      const res = await api.post("/payment/rollback", { order_id });
      return res.data;
    } catch (err) {
      console.error("❌ Gagal rollback stok & akun:", err.message);
      throw new Error("Rollback gagal.");
    }
  },

  // checkPaymentStatus: async (order_id) => {
  //   try {
  //     const res = await api.post("/payment/verify", { order_id });
  //     return res.data.status.transaction_status;
  //   } catch (err) {
  //     console.error('❌ Gagal cek status pembayaran:', err.message);
  //     return null;
  //   }
  // },

  checkPaymentStatus: async (order_id) => {
    try {
      const res = await api.post("/payment/check", { order_id });
      return res.data.status.transaction_status; // "capture", "pending", "expire", dll
    } catch (err) {
      console.error(
        "Gagal cek status pembayaran:",
        err.response?.data || err.message
      );
      return null;
    }
  },

  // Hapus command dari menu grup
  removeCommand: async ({ groupWaId, command }) => {
    try {
      await api.post("/menu/remove", { groupWaId, command });
    } catch (err) {
      console.error("❌ Gagal menghapus command dari menu:", err.message);
    }
  },

  // Set custom response untuk command tertentu
  setResponse: async ({ groupWaId, command, response }) => {
    try {
      await api.post("/memory", {
        groupWaId,
        key: `command:${command}`,
        value: response,
      });
    } catch (err) {
      console.error("❌ Gagal set response command:", err.message);
    }
  },
};
