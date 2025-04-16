const menuCommand = require("./menu");
const addCommand = require("./addCommand");
const removeCommand = require("./removeCommand");
const setResponse = require("./setResponse");
const stickerCommand = require("./sticker");
const ytmp3Command = require("./youtube");

module.exports = async (msg, groupId, api) => {
  const body = msg.body.trim();
  const commandName = body.slice(1).split(" ")[0].toLowerCase();

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
      return await ytmp3Command(msg); // Menambahkan command YTMP3

    default:
      // Bisa diabaikan atau balas tidak dikenal
      msg.reply("⚠️ Command tidak dikenali.");
      return;
  }
};
