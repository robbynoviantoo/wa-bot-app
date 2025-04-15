const menuCommand = require("./menu");
const addCommand = require("./addCommand");
const removeCommand = require("./removeCommand");
const setResponse = require("./setResponse");
const stickerCommand = require("./sticker");

module.exports = async (msg, groupId, api) => {
  const body = msg.body.trim();

  if (body.startsWith("/")) {
    await menuCommand(msg, groupId, api);
    await addCommand(msg, groupId, api);
    await removeCommand(msg, groupId, api);
    await setResponse(msg, groupId, api);
  }

  // Command stiker
  await stickerCommand(msg);
};
