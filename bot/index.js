const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const api = require("./lib/api");
const handleCommand = require("./commands/commandRouter");

// Docker
const client = new Client({
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// // Untuk Windows development
// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: { headless: true },
// });

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("✅ Bot WA siap digunakan!");

  try {
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);

    console.log(`📦 Total grup ditemukan: ${groups.length}`);
    groups.forEach(group => {
      console.log(`📣 ${group.name} (${group.id._serialized})`);
    });

    // Optional: kamu bisa simpan grup ke database lewat api.saveGroups(groups)
  } catch (error) {
    console.error("❌ Gagal mengambil daftar grup:", error.message);
  }
});

client.on("message", async (msg) => {
  try {
    const chat = await msg.getChat();
    const isGroup = chat.isGroup;
    const groupId = isGroup ? chat.id._serialized : null;

    const body = msg.body.trim();

    if (isGroup) {
      await api.logMessage({
        from: msg.from,
        to: msg.to,
        message: msg.body,
        groupId,
        direction: "inbound",
      });
    }

    if (body.startsWith("/")) {
      await handleCommand(msg, groupId, api);
    }
  } catch (err) {
    console.error("❌ Error saat proses message:", err.message);
    msg.reply("⚠️ Terjadi error saat memproses pesan.");
  }
});

client.initialize();
