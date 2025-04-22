const pending = require("../lib/pendingOrders");
const api = require("../lib/api");

module.exports = async (msg, client) => {
  const userId = msg.from;

  if (!pending.hasOrder(userId)) {
    return msg.reply("⚠️ Kamu tidak memiliki transaksi yang bisa dibatalkan.");
  }

  const orderId = pending.getOrder(userId);

  try {
    // Batalkan lewat API Midtrans atau internal
    const result = await api.cancelPayment(orderId); // Pastikan fungsi ini ada di `api.js`
    pending.deleteOrder(userId);

    return msg.reply(`✅ Transaksi dengan ID *${orderId}* berhasil dibatalkan.`);
  } catch (err) {
    console.error("❌ Gagal membatalkan order:", err.message);
    return msg.reply(
      "⚠️ Gagal membatalkan transaksi. Mungkin sudah dibayar atau expired."
    );
  }
};
