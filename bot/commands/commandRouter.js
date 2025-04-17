const menuCommand = require("./menu");
const addCommand = require("./addCommand");
const removeCommand = require("./removeCommand");
const setResponse = require("./setResponse");
const stickerCommand = require("./sticker");
const ytmp3Command = require("./youtube");
const askAI = require("../lib/ai"); // ✅ Jangan tambahkan tanda `()` saat require


module.exports = async (msg, groupId, api) => {
  const body = msg.body.trim();

  // Hanya proses jika command diawali dengan "/"
  if (!body.startsWith("/")) return;

  const commandName = body.slice(1).split(" ")[0].toLowerCase();

  // ✅ Tangani /bot (AI chat)
  if (commandName === "bot") {
    const prompt = body.slice(5).trim(); // ambil teks setelah "/bot "
    if (!prompt) {
      return msg.reply("⚠️ Mohon masukkan pertanyaan setelah /bot");
    }

    try {
      const reply = await askAI(prompt);
      return msg.reply(reply);
    } catch (err) {
      console.error("❌ Gagal memproses AI:", err);
      return msg.reply("⚠️ Terjadi kesalahan saat menghubungi AI.");
    }
  }

  // ✅ Cek apakah command termasuk custom command
  const menu = await api.getMenu(groupId);
  if (menu?.commands?.includes(commandName)) {
    const response = await api.getMemory(groupId, `command:${commandName}`);
    if (response) {
      return msg.reply(response);
    } else {
      return msg.reply(`⚠️ Tidak ada respons untuk command "/${commandName}"`);
    }
  }

  // ✅ Hardcoded command
  switch (commandName) {
    case "menu":
      return await menuCommand(msg, groupId, api);
  
    case "addcommand":
      return await addCommand(msg, groupId, api);
  
    case "removecommand":
      return await removeCommand(msg, groupId, api);
  
    case "setresponse":
      return await setResponse(msg, groupId, api);
  
    case "sticker":
    case "stiker":
    case "s":
      return await stickerCommand(msg);
  
    case "ytmp3":
      return await ytmp3Command(msg);
  
    case "gif":
      return await stickerGif5Command(msg); // 👈 Tambahan baru
  
    default:
      return msg.reply("⚠️ Command tidak dikenali.");
  }
  
};
