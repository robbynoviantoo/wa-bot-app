const menuCommand = require("./menu");
const addCommand = require("./addCommand");
const removeCommand = require("./removeCommand");
const setResponse = require("./setResponse");
const stickerCommand = require("./sticker");
const ytmp3Command = require("./youtube");

module.exports = async (msg, groupId, api) => {
  const body = msg.body.trim();

  // Hanya proses jika command diawali dengan "/"
  if (!body.startsWith("/")) return;

  const commandName = body.slice(1).split(" ")[0].toLowerCase();

  // Cek apakah command termasuk custom command yang disimpan di database
  const menu = await api.getMenu(groupId);
  if (menu?.commands?.includes(commandName)) {
    const response = await api.getMemory(groupId, `command:${commandName}`);
    if (response) {
      return msg.reply(response);
    } else {
      return msg.reply(`⚠️ Tidak ada respons untuk command "/${commandName}"`);
    }
  }

  // Kalau bukan custom command, cek hardcoded command
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

    default:
      return msg.reply("⚠️ Command tidak dikenali.");
  }
};
