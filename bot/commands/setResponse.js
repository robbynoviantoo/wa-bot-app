module.exports = async (msg, groupId, api) => {
  const body = msg.body.trim();

  if (body.startsWith("/setresponse ")) {
    const parts = body.slice(13).trim().split(" ");
    const command = parts[0]?.toLowerCase();
    const response = parts.slice(1).join(" ");

    if (!command || !response) {
      msg.reply("⚠️ Format salah. Gunakan: /setresponse [command] [isi pesan]");
      return;
    }

    try {
      await api.setResponse({
        groupWaId: groupId,
        command,
        response,
      });
      msg.reply(`✅ Respons untuk "/${command}" berhasil disimpan.`);
    } catch (err) {
      console.error("❌ Gagal set response:", err);
      msg.reply("⚠️ Gagal menyimpan respons.");
    }
  }
};
