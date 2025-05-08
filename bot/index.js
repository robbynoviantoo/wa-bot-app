const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const socketIo = require("socket.io");
const http = require("http");
const api = require("./lib/api");
const handleCommand = require("./commands/commandRouter");
const fs = require("fs");
const path = require("path");
const os = require("os");

const server = http.createServer();
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://10.20.10.106:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

let client;
let isBotReady = false;

function createClient() {
  client = new Client({
    authStrategy: new LocalAuth({ clientId: "bot" }), // Konsisten dengan folder sesi
    puppeteer: {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    isBotReady = false;
    io.emit("qr", qr);
  });

  client.on("ready", async () => {
    console.log("✅ Bot WA siap digunakan!");
    isBotReady = true;
    io.emit("loggedIn", true);

    try {
      const chats = await client.getChats();
      const groups = chats.filter((chat) => chat.isGroup);
      console.log(`📦 Total grup ditemukan: ${groups.length}`);
      groups.forEach((group) => {
        console.log(`📣 ${group.name} (${group.id._serialized})`);
      });
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
        await handleCommand(msg, groupId, api, client);
      }
    } catch (err) {
      console.error("❌ Error saat proses message:", err.message);
      msg.reply("⚠️ Terjadi error saat memproses pesan.");
    }
  });

  client.initialize();
}

// Jalankan pertama kali
createClient();

// Handle koneksi dari frontend
io.on("connection", (socket) => {
  console.log("🔌 Frontend terhubung");

  socket.on("check-login", () => {
    socket.emit("loggedIn", isBotReady);
  });

  socket.on("logout", async () => {
    try {
      console.log("🔒 Logout request diterima");
      
      // Hentikan client
      await client.destroy();
      isBotReady = false;

      // Path untuk sesi dan cache
      const sessionPath = path.join(os.homedir(), ".wwebjs_auth", "bot");
      const cachePath = path.join(os.homedir(), ".wwebjs_cache");

      // Menghapus folder sesi dan cache jika ada
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log("🗑️ Session bot dihapus");
      }

      if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true, force: true });
        console.log("🗑️ Cache dihapus");
      }

      // Buat ulang client agar QR muncul lagi
      createClient();
    } catch (err) {
      console.error("❌ Error saat logout:", err.message);
    }
  });
});

server.listen(3009, "0.0.0.0", () => {
  console.log("🚀 WhatsApp bot berjalan di http://localhost:3009");
});
