const api = require("../lib/api");
const { MessageMedia } = require("whatsapp-web.js");
const sharp = require("sharp");

module.exports = async (msg, client) => {
  const parts = msg.body.trim().split(" ");
  const code = parts[1];
  const qty = parseInt(parts[2]);
  const rawId = msg.from;
  const cleanId = rawId.replace(/@.+$/, ""); // Hilangkan @c.us / @g.us / @s.whatsapp.net
  const email = `${cleanId}@gmail.com`;

  // Validasi format input
  if (!code || isNaN(qty)) {
    return msg.reply(
      "⚠️ Gunakan format: /buy [kode] [jumlah]\nContoh: /buy yt1b 1"
    );
  }

  // Periksa jika client tersedia
  if (!client) {
    console.error('❌ Client tidak tersedia!');
    return msg.reply("⚠️ Gagal mengirim pesan, client tidak tersedia.");
  }

  try {
    // Lakukan pembelian produk
    const result = await api.buyProduct({
      code,
      quantity: qty,
      name: msg._data?.notifyName || "User", // Menggunakan notifyName atau fallback ke "User"
      email: email,
    });

    // Menghasilkan barcode dengan padding putih
    const barcodeBuffer = Buffer.from(result.barcode, 'base64');
    
    // Tambahkan padding 50px di sekitar barcode dengan latar putih
    const barcodeWithPadding = await sharp(barcodeBuffer)
      .extend({
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .resize(400, 400, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toBuffer();

    const media = new MessageMedia("image/png", barcodeWithPadding.toString("base64"));

    // Kirimkan barcode ke pengguna dan simpan referensi pesan
    const sentMessage = await client.sendMessage(msg.from, media, {
      caption: `🛒 *Pembelian ${qty} produk ${code} berhasil dibuat!*\n\nSilakan bayar menggunakan barcode ini dalam waktu 30 menit.`,
    });

    // Menambahkan log payment URL yang benar
    console.log("🔗 Payment URL:", result.payment_url);

    // Cek status pembayaran berkala (tiap 10 detik, maksimal 3 menit)
    const maxRetries = 18;
    let paid = false;
    let paymentStatus = null;
    let sentMessageId = sentMessage.id._serialized; // Simpan ID pesan untuk dihapus nanti

    for (let i = 0; i < maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // delay 10 detik
      paymentStatus = await api.checkPaymentStatus(result.order_id);

      console.log(`🔄 Cek status pembayaran (percobaan ${i + 1}): ${paymentStatus}`);

      if (paymentStatus === "settlement") {
        paid = true;
        break;
      } else if (paymentStatus === "expire") {
        console.log("⌛ Pembayaran telah kadaluarsa.");
        break;
      }
    }

    if (paid) {
      try {
        // Hapus pesan barcode setelah pembayaran terverifikasi
        const chat = await msg.getChat();
        const barcodeMessage = await chat.fetchMessages({ limit: 1, fromMe: true });
        
        if (barcodeMessage.length > 0 && barcodeMessage[0].id._serialized === sentMessageId) {
          await barcodeMessage[0].delete(true); // true untuk menghapus untuk semua
        }

        // Tampilkan akun ke user setelah pembayaran berhasil
        const accountLines = result.accounts_reserved
          .map(
            (acc, i) => `🔐 *Akun ${i + 1}*\n📧 ${acc.email}\n🔑 ${acc.password}`
          )
          .join("\n\n");

        // Kirimkan informasi akun setelah pembayaran berhasil
        await client.sendMessage(
          msg.from,
          `✅ Pembayaran *berhasil* untuk ${qty} produk *${code}*!\n\nBerikut detail akun kamu:\n\n${accountLines}\n\n⚠️ Simpan informasi ini dengan aman!`
        );
      } catch (deleteErr) {
        console.error("❌ Gagal menghapus pesan barcode:", deleteErr.message);
        // Lanjutkan mengirim detail akun meskipun gagal hapus barcode
        const accountLines = result.accounts_reserved
          .map(
            (acc, i) => `🔐 *Akun ${i + 1}*\n📧 ${acc.email}\n🔑 ${acc.password}`
          )
          .join("\n\n");
        
        await client.sendMessage(
          msg.from,
          `✅ Pembayaran *berhasil* untuk ${qty} produk *${code}*!\n\nBerikut detail akun kamu:\n\n${accountLines}\n\n⚠️ Simpan informasi ini dengan aman!`
        );
      }
    } else if (paymentStatus === "pending") {
      await client.sendMessage(
        msg.from,
        `⏳ Pembayaran untuk order *${code}* masih menunggu konfirmasi. Harap selesaikan pembayaran dalam 30 menit.`
      );
    } else {
      await client.sendMessage(
        msg.from,
        `❌ Pembayaran tidak terverifikasi untuk order *${code}*. Silakan coba lagi atau hubungi support.`
      );
    }
  } catch (err) {
    console.error("❌ Gagal memproses pembelian:", err.message);
    return msg.reply(
      "⚠️ Gagal memproses pembelian. Cek kode produk atau stok. Error: " + err.message
    );
  }
};