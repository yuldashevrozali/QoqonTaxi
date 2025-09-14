// bot.js
require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const port = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN;
const url = process.env.RENDER_EXTERNAL_URL; // Render url (https://project.onrender.com)

// haydovchilar guruhi
const driversGroupId = -1002949281611;

// vaqtinchalik saqlash
let userData = {};

// botni webhook rejimida yaratamiz
const bot = new TelegramBot(token, { polling: false });

// webhook URL
const webhookUrl = `${url}/bot${token}`;
bot.setWebHook(webhookUrl);

// Express json parser
app.use(express.json());

// Telegram webhookni qabul qilish
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userData[chatId] = {};
  bot.sendMessage(chatId, "Assalomu alaykum! Telefon raqamingizni yuboring:");
});

// xabarlarni tutish
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (userData[chatId] && !userData[chatId].phone && text !== "/start") {
    userData[chatId].phone = text;
    return bot.sendMessage(
      chatId,
      "Qayerdan qayerga borasiz? (Masalan: Qoqon Farg‘ona)"
    );
  }

  if (userData[chatId] && userData[chatId].phone && !userData[chatId].route) {
    userData[chatId].route = text;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "1 kishi", callback_data: "1" },
            { text: "2 kishi", callback_data: "2" },
          ],
          [
            { text: "3 kishi", callback_data: "3" },
            { text: "4 kishi", callback_data: "4" },
          ],
        ],
      },
    };

    return bot.sendMessage(chatId, "Necha kishi bo‘lasiz?", options);
  }
});

// button bosilganda
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const people = query.data;

  userData[chatId].people = people;

  bot.sendMessage(
    chatId,
    "✅ Shofyorlar tez orada bog‘lanadi.\n\n🚕 Yangi taksi chaqirish uchun /start buyrug‘ini bosing."
  );

  const order = userData[chatId];
  const msgToDrivers = `
🚖 Yangi buyurtma!
📞 Tel: ${order.phone}
📍 Yo'nalish: ${order.route}
👥 Odamlar soni: ${order.people}
  `;

  bot.sendMessage(driversGroupId, msgToDrivers);

  delete userData[chatId];
});

// serverni ishga tushirish
app.listen(port, () => {
  console.log(`🚀 Server ${port}-portda ishlayapti`);
});
