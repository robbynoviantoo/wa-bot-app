module.exports = async (msg, groupId, api) => {
    const body = msg.body.trim();
  
    if (body.startsWith("/removecommand ")) {
      const command = body.slice(15).trim();
      if (command) {
        try {
          await api.removeCommand({ groupWaId: groupId, command });
          msg.reply(`✅ Command "${command}" berhasil dihapus dari menu.`);
        } catch (err) {
          console.error("❌ Error menghapus command:", err);
          msg.reply("⚠️ Terjadi kesalahan saat menghapus command.");
        }
      } else {
        msg.reply("⚠️ Mohon masukkan command yang valid.");
      }
    }
  };
  