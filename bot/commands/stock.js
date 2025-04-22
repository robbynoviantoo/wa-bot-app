const api = require("../lib/api");

module.exports = async (msg) => {
  try {
    const res = await api.getStock();
    const products = res || [];

    if (products.length === 0) {
      return msg.reply("📦 Saat ini tidak ada stok yang tersedia.");
    }

    const stockList = products.map(p => {
      return `
╭──〔 ${p.name} 〕─
┊・ 🔐| Kode: *${p.code}*
┊・ 🏷️| Harga: Rp${p.price}
┊・ 📦| Stok Tersedia: ${p.stock}
┊・ 📝| Desk: ${p.description || "Tidak ada deskripsi."}
┊・ ✍️| Ketik: buy ${p.code} 1
╰┈┈┈┈┈┈┈┈`;
    }).join("\n\n");

    return msg.reply(`📦 *Daftar Stok Saat Ini:*\n\n${stockList}`);
  } catch (error) {
    console.error("❌ Gagal mengambil data stok:", error.message);
    return msg.reply("⚠️ Gagal mengambil data stok dari server.");
  }
};
