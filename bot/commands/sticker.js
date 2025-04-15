module.exports = async (msg) => {
    if (msg.hasMedia && msg.body.trim() === "/s") {
      const media = await msg.downloadMedia();
      if (media) {
        msg.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerAuthor: "Bot-Robby",
          stickerName: "Sticker Custom",
        });
      } else {
        msg.reply("❌ Gagal mengunduh media.");
      }
    }
  };
  