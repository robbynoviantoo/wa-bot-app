const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const { MessageMedia } = require("whatsapp-web.js");

module.exports = async (msg) => {
  const command = msg.body.trim();
  if (!command.startsWith("/ytmp3 ")) return;

  const url = command.slice(7).trim();
  console.log("📥 Command diterima:", command);
  console.log("🔗 URL yang diterima:", url);

  // Validasi URL
  if (
    !url.match(/^https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/)
  ) {
    return msg.reply("⚠️ URL tidak valid.");
  }

  // Path setup
  const projectRoot = path.resolve(__dirname, "../../");
  const tempDir = path.join(projectRoot, "temp");
  const ytDlpPath = path.join(projectRoot, "yt-dlp.exe");
  const ffmpegPath = path.join(projectRoot, "ffmpeg", "bin");
  const cookiesPath = path.join(projectRoot, "cookies.txt");

  console.log("📁 Root project:", projectRoot);
  console.log("📁 Temp folder:", tempDir);
  console.log("📦 yt-dlp path:", ytDlpPath);
  console.log("📦 ffmpeg path:", ffmpegPath);
  console.log("📄 Cookies path:", cookiesPath);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
    console.log("📂 Folder temp dibuat.");
  }

  await msg.reply("⏳ Mengonversi video ke MP3...");

  try {
    const outputFile = path.join(tempDir, `audio_${Date.now()}.mp3`);
    console.log("📄 Output file MP3:", outputFile);
    // // Docker
    // const shellCommand = `yt-dlp --cookies "${cookiesPath}" -f bestaudio --extract-audio --audio-format mp3 -o "${outputFile}" "${url}"`;
    // Windows
    const shellCommand = `"${ytDlpPath}" --cookies "${cookiesPath}" --ffmpeg-location "${ffmpegPath}" -f bestaudio --extract-audio --audio-format mp3 -o "${outputFile}" "${url}"`;

    console.log("💻 Menjalankan perintah yt-dlp:");
    console.log(shellCommand);

    exec(shellCommand, async (error, stdout, stderr) => {
      console.log("📤 yt-dlp STDOUT:\n", stdout);
      console.log("📤 yt-dlp STDERR:\n", stderr);

      if (error) {
        console.error("❌ Terjadi error saat menjalankan yt-dlp:");
        console.error(error);
        return msg.reply("⚠️ Gagal mengonversi video.");
      }

      if (!fs.existsSync(outputFile)) {
        console.error("❌ File output tidak ditemukan:", outputFile);
        return msg.reply("⚠️ File MP3 tidak ditemukan setelah konversi.");
      }

      console.log("✅ File berhasil dikonversi. Mengirim ke WhatsApp...");

      try {
        // Mengirim file sebagai dokumen dengan MIME type audio/mp3
        const media = MessageMedia.fromFilePath(outputFile);
        await msg.reply(media, undefined, {
          caption: "✅ MP3 berhasil dikonversi!",
          sendMediaAsDocument: true, // Menyatakan untuk mengirim sebagai dokumen
        });
        console.log("✅ File berhasil dikirim.");
      } catch (err) {
        console.error("❌ Gagal mengirim media:", err);
        await msg.reply("⚠️ Gagal mengirim file MP3 ke chat.");
      }

      console.log("🧹 Menghapus file sementara:", outputFile);
      fs.unlinkSync(outputFile);
    });
  } catch (err) {
    console.error("❌ Terjadi kesalahan dalam try-catch utama:");
    console.error(err);
    msg.reply("⚠️ Terjadi kesalahan saat memproses permintaan.");
  }
};
