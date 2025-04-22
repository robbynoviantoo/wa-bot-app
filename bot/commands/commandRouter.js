const menuCommand = require("./menu");
const addCommand = require("./addCommand");
const removeCommand = require("./removeCommand");
const setResponse = require("./setResponse");
const stickerCommand = require("./sticker");
const stickerGifCommand = require("./stickerGif");
const ytmp3Command = require("./youtube");
const stockCommand = require("./stock");
const buyCommand = require("./buy");
const askAI = require("../lib/ai");

module.exports = async (msg, groupId, api, client) => {
  const body = msg.body.trim();

  if (!body.startsWith("/")) return;

  const commandName = body.slice(1).split(" ")[0].toLowerCase();

  if (commandName === "bot") {
    const prompt = body.slice(5).trim();
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

  const menu = await api.getMenu(groupId);
  if (menu?.commands?.includes(commandName)) {
    const response = await api.getMemory(groupId, `command:${commandName}`);
    if (response) {
      return msg.reply(response);
    } else {
      return msg.reply(`⚠️ Tidak ada respons untuk command "/${commandName}"`);
    }
  }

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
      return await stickerGifCommand(msg);

    case "stock":
      return await stockCommand(msg);

    case "buy":
      return await buyCommand(msg, client);
    default:
      return msg.reply("⚠️ Command tidak dikenali.");
  }
};
