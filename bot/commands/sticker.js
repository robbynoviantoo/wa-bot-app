module.exports = async (msg) => {
  const command = msg.body.trim().toLowerCase();
  const chat = await msg.getChat();

  if (command === "/s") {
    let mediaMsg = msg;

    if (!msg.hasMedia && msg.hasQuotedMsg) {
      const quoted = await msg.getQuotedMessage();
      if (quoted.hasMedia) {
        mediaMsg = quoted; 
      } else {
        return chat.sendMessage("⚠️ Pesan yang direply tidak mengandung media.");
      }
    }

    if (mediaMsg.hasMedia) {
      try {
        await chat.sendMessage("⏳ Mohon tunggu...");
        const media = await mediaMsg.downloadMedia();

        if (media) {
          await msg.reply(media, undefined, {
            sendMediaAsSticker: true,
            stickerAuthor: "Bot-Robby",
            stickerName: "Sticker Custom",
          });

          await chat.sendMessage("✅ Sudah jadi, Tuan!");
        } else {
          await chat.sendMessage("❌ Gagal mengunduh media.");
        }
      } catch (err) {
        console.error("❌ Error saat membuat stiker:", err.message);
        await chat.sendMessage("⚠️ Terjadi kesalahan saat membuat stiker.");
      }
    } else {
      await chat.sendMessage("⚠️ Tidak ada media untuk dijadikan stiker.");
    }
  }
};
