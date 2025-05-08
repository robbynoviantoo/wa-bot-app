const axios = require("axios");

const API_KEY = process.env.OPENROUTER_API_KEY || "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";

const askAI = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0]?.message?.content?.trim() || "Tidak ada respons.";
  } catch (error) {
    console.error("❌ Gagal memproses AI:", error.message);
    return "⚠️ Terjadi kesalahan saat menghubungi AI.";
  }
};

module.exports = askAI;
