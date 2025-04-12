import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text || "";

  try {
    const completion = await openai.chat.completions.create({
      model: "openrouter/auto", // You can also use "mistralai/mistral-7b-instruct"
      messages: [
        {
          role: "system",
          content:
            "You are a knowledgeable assistant that answers factual questions accurately. If you don't know the answer, say 'I don't know'.",
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 500,
    });

    const choices = completion.choices;
    if (!choices || choices.length === 0) {
      console.error("⚠️ No choices returned from GPT");
      console.log("Completion:", completion);
      bot.sendMessage(
        chatId,
        "🤖 Sorry, I didn’t get a response from the model."
      );
      return;
    }

    const reply = choices[0].message.content || "🤖 GPT gave no reply.";
    bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error("GPT Error:", err);
    bot.sendMessage(chatId, "⚠️ An error occurred while contacting GPT.");
  }
});
