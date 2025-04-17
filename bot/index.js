const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const api = require("./lib/api");
const handleCommand = require("./commands/commandRouter");
const fs = require("fs");
const path = require("path");

// 🔧 Hapus SingletonLock jika ada (untuk hindari error Chromium)
const singletonLockPath = path.join(__dirname, "session", "Default", "SingletonLock");
if (fs.existsSync(singletonLockPath)) {
  console.warn("⚠️ SingletonLock ditemukan, menghapus...");
  try {
    fs.unlinkSync(singletonLockPath);
    console.log("✅ SingletonLock dihapus");
  } catch (err) {
    console.error("❌ Gagal menghapus SingletonLock:", err.message);
  }
}

// Docker config
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

// // Windows
// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: { headless: true },
// });


client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot WA siap digunakan!");
});

client.on("message", async (msg) => {
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
    try {
      await handleCommand(msg, groupId, api);
    } catch (err) {
      console.error("❌ Error di handleCommand:", err.message);
      msg.reply("⚠️ Terjadi error saat memproses perintah.");
    }
  }
});

client.initialize();
