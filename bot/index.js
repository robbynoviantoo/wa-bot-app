const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const api = require("./lib/api");
const handleCommand = require("./commands/commandRouter"); // pakai file yang kamu buat sendiri

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
});

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
    await handleCommand(msg, groupId, api);
  }

  if (body.startsWith("/")) {
    const commandName = body.slice(1).split(" ")[0].toLowerCase();
    const menu = await api.getMenu(groupId);

    if (menu?.commands?.includes(commandName)) {
      const response = await api.getMemory(groupId, `command:${commandName}`);
      if (response) {
        msg.reply(response);
      } else {
        msg.reply(`⚠️ Tidak ada respons untuk command "/${commandName}"`);
      }
    }
  }
});

client.initialize();
