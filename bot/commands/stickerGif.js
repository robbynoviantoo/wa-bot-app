const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { MessageMedia } = require("whatsapp-web.js");

module.exports = async (msg) => {
  const command = msg.body.trim().toLowerCase();
  const chat = await msg.getChat();

  if (command === "/gif") {
    let mediaMsg = msg;

    if (!msg.hasMedia && msg.hasQuotedMsg) {
      const quoted = await msg.getQuotedMessage();
      if (quoted.hasMedia) {
        mediaMsg = quoted;
      } else {
        return chat.sendMessage("⚠️ Pesan yang direply tidak mengandung media.");
      }
    }

    if (!mediaMsg.hasMedia) {
      return chat.sendMessage("⚠️ Tidak ada media video untuk diproses.");
    }

    try {
      await chat.sendMessage("⏳ Sedang proses video menjadi stiker 5 detik...");

      // Setup path
      const projectRoot = path.resolve(__dirname, "../../");
      const tempDir = path.join(projectRoot, "temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const inputPath = path.join(tempDir, `video_${Date.now()}.mp4`);
      const outputPath = path.join(tempDir, `output_${Date.now()}.webm`);

      // Simpan file video
      const media = await mediaMsg.downloadMedia();
      const buffer = Buffer.from(media.data, "base64");
      fs.writeFileSync(inputPath, buffer);

      // ffmpeg command: ambil 5 detik pertama, ubah ke webm animasi
      const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -t 5 -an -vf "scale=512:-1" -c:v libvpx -b:v 1M "${outputPath}"`;

      console.log("🎬 Menjalankan ffmpeg:", ffmpegCmd);
      exec(ffmpegCmd, async (err, stdout, stderr) => {
        console.log("📤 ffmpeg stdout:\n", stdout);
        console.log("📤 ffmpeg stderr:\n", stderr);

        if (err) {
          console.error("❌ Error saat proses ffmpeg:", err);
          await chat.sendMessage("⚠️ Gagal memproses video.");
          return;
        }

        if (!fs.existsSync(outputPath)) {
          return chat.sendMessage("❌ File output tidak ditemukan.");
        }

        try {
          const resultBuffer = fs.readFileSync(outputPath);
          const stickerMedia = new MessageMedia("video/webm", resultBuffer.toString("base64"));

          await msg.reply(stickerMedia, undefined, {
            sendMediaAsSticker: true,
            stickerAuthor: "Bot-Robby",
            stickerName: "5s Video",
          });

          await chat.sendMessage("✅ Stiker animasi berhasil dibuat!");
        } catch (sendErr) {
          console.error("❌ Gagal mengirim sticker:", sendErr);
          await chat.sendMessage("⚠️ Gagal mengirim stiker.");
        }

        // Hapus file sementara
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error("❌ Error utama:", error);
      await chat.sendMessage("⚠️ Terjadi kesalahan saat memproses.");
    }
  }
};
