module.exports = async (msg, groupId, api) => {
  const body = msg.body.trim();

  if (body === "/menu") {
    try {
      // 🔹 Command hardcoded (default bawaan bot)
      const defaultCommands = [
        "/menu",
        "/addcommand [commandbaru]",
        "/removecommand",
        "/setresponse",
        "/s (atau /stiker /sticker)",
        "/gif",
        "/ytmp3 [link]"
      ];

      // 🔹 Ambil custom command dari API
      const menu = await api.getMenu(groupId);
      const customCommands = (menu && menu.commands) || [];

      // 🔹 Gabungkan & format
      const allCommands = [
        "📌 *Command Default:*",
        ...defaultCommands.map(cmd => `• ${cmd}`),
        "",
        "🧩 *Command Custom:*",
        ...(customCommands.length > 0
          ? customCommands.map(cmd => `• /${cmd}`)
          : ["(Belum ada custom command)"]),
      ];

      await msg.reply(allCommands.join("\n"));
    } catch (err) {
      console.error("❌ Error mengambil menu:", err);
      await msg.reply("⚠️ Terjadi kesalahan saat mengambil menu.");
    }
  }
};
