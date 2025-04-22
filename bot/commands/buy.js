const api = require("../lib/api");
const pending = require("../lib/pendingOrders");
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
    console.error("❌ Client tidak tersedia!");
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

    // Simpan order sementara di pending
    pending.setOrder(msg.from, result.order_id);

    // Menghasilkan barcode dengan padding putih
    const barcodeBuffer = Buffer.from(result.barcode, "base64");

    // Tambahkan padding 50px di sekitar barcode dengan latar putih
    const barcodeWithPadding = await sharp(barcodeBuffer)
      .extend({
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .resize(400, 400, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();

    const media = new MessageMedia(
      "image/png",
      barcodeWithPadding.toString("base64")
    );

    const paymentDeadline = new Date(Date.now() + 30 * 60 * 1000); // 30 menit dari sekarang
    const paymentTimeStr = paymentDeadline.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const fancyCaption = `🧾 MENUNGGU PEMBAYARAN 🧾

    🆔 Order ID: ${result.order_id}
    Produk ID: ${code}
    Produk 𝖭𝖺𝗆𝖾: ${result.product_name || "Tidak diketahui"}
    Harga: Rp${result.price?.toLocaleString("id-ID") || "0"}
    𝖩𝗎𝗆𝗅𝖺𝗁: ${qty}
    Total: Rp${result.total_price?.toLocaleString("id-ID") || "0"}
    Waktu: 30 𝗆𝖾𝗇𝗂𝗍
    
    Silahkan scan QRis diatas 𝗌𝖾𝖻𝖾𝗅𝗎𝗆 ${paymentTimeStr} untuk melakukan pembayaran.`;
    

    const sentMessage = await client.sendMessage(msg.from, media, {
      caption: fancyCaption,
    });

    // Cek status pembayaran berkala (tiap 10 detik, maksimal 3 menit)
    const maxRetries = 2;
    let paid = false;
    let paymentStatus = null;
    let sentMessageId = sentMessage.id._serialized; // Simpan ID pesan untuk dihapus nanti

    // Menambahkan log payment URL yang benar
    console.log("🔗 Payment URL:", result.payment_url);

    for (let i = 0; i < maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // delay 10 detik
      paymentStatus = await api.checkPaymentStatus(result.order_id);

      console.log(
        `🔄 Cek status pembayaran (percobaan ${i + 1}): ${paymentStatus}`
      );

      if (paymentStatus === "settlement") {
        paid = true;
        break;
      } else if (paymentStatus === "expire") {
        console.log("⌛ Pembayaran telah kadaluarsa.");
        break;
      } else if (paymentStatus === "cancel") {
        console.log("⌛ Pembayaran telah dicancel.");
        break;
      }
    }

    if (paid) {
      try {
        // Hapus pesan barcode setelah pembayaran terverifikasi
        const chat = await msg.getChat();
        const barcodeMessage = await chat.fetchMessages({
          limit: 1,
          fromMe: true,
        });

        if (
          barcodeMessage.length > 0 &&
          barcodeMessage[0].id._serialized === sentMessageId
        ) {
          await barcodeMessage[0].delete(true); // true untuk menghapus untuk semua
        }

        // Update stok dan status available akun setelah pembayaran berhasil
        const accountLines = result.accounts_reserved
          .map(
            (acc, i) =>
              `🔐 *Akun ${i + 1}*\n📧 ${acc.email}\n🔑 ${acc.password}`
          )
          .join("\n\n");

        // Menyusun format transaksi yang lebih jelas
        const transactionDetails = `
╭────「 TRANSAKSI DETAIL 」───
┊・ 🧾| Reff Id: ${result.order_id}  // Mengganti Reff Id dengan order_id
┊・ 📦| Nama Barang: ${code} // Produk yang dibeli
┊・ 🏷️️| Harga Barang: Rp${
          result.price
        } // Menampilkan harga barang jika tersedia
┊・ 🛍️| Jumlah Order: ${qty}
┊・ 💰| Total Bayar: Rp${result.total_price} // Total bayar (bisa disesuaikan)
┊・ 📅| Tanggal: ${new Date().toLocaleDateString("id-ID")}
┊・ ⏰| Jam: ${new Date().toLocaleTimeString("id-ID")}
╰┈┈┈┈┈┈┈┈
`;

        // Kirimkan informasi akun setelah pembayaran berhasil
        await client.sendMessage(
          msg.from,
          `✅ Pembayaran *berhasil* untuk ${qty} produk *${code}*!\n\n${transactionDetails}\n\nBerikut detail akun kamu:\n\n${accountLines}\n\n⚠️ Simpan informasi ini dengan aman!`
        );

        // Update status produk di database (ubah status stok dan akun)
        await api.updateStockAfterPayment(result.order_id);
      } catch (deleteErr) {
        console.error("❌ Gagal menghapus pesan barcode:", deleteErr.message);
        // Lanjutkan mengirim detail akun meskipun gagal hapus barcode
        const accountLines = result.accounts_reserved
          .map(
            (acc, i) =>
              `🔐 *Akun ${i + 1}*\n📧 ${acc.email}\n🔑 ${acc.password}`
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
      // Pembatalan transaksi
      console.log(`❌ Pembayaran gagal atau kadaluarsa`);
      // Kembalikan akun ke stok jika pembayaran gagal atau kadaluarsa
      await api.rollbackStockAndAccount(result.order_id);

      await client.sendMessage(
        msg.from,
        `❌ Pembayaran tidak terverifikasi untuk order *${code}*. Silakan coba lagi atau hubungi support.`
      );
    }
  } catch (err) {
    console.error("❌ Gagal memproses pembelian:", err.message);
    return msg.reply(
      "⚠️ Gagal memproses pembelian. Cek kode produk atau stok. Error: " +
        err.message
    );
  }
};
