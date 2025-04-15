module.exports = async (msg, groupId, api) => {
  const body = msg.body.trim();

  if (body === "/menu") {
    try {
      const menu = await api.getMenu(groupId);
      if (menu && menu.commands && menu.commands.length > 0) {
        msg.reply(`Menu untuk grup ini:\n${menu.commands.join("\n")}`);
      } else {
        msg.reply("⚠️ Belum ada command dalam menu grup ini.");
      }
    } catch (err) {
      console.error("❌ Error mengambil menu:", err);
      msg.reply("⚠️ Terjadi kesalahan saat mengambil menu.");
    }
  }
};
