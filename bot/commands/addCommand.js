module.exports = async (msg, groupId, api) => {
  const body = msg.body.trim();

  if (body.startsWith("/addcommand ")) {
    const command = body.slice(12).trim();

    if (command) {
      try {
        await api.addCommand({ groupWaId: groupId, command });
        msg.reply(`✅ Command "${command}" berhasil ditambahkan ke menu.`);
      } catch (err) {
        console.error("❌ Error menambahkan command:", err);
        msg.reply("⚠️ Terjadi kesalahan saat menambahkan command.");
      }
    } else {
      msg.reply("⚠️ Mohon masukkan command yang valid.");
    }
  }
};
