const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const token = process.env.BOT_TOKEN || "8097439513:AAE8UfQlPhMdXMmor2Dv4ZdG2kfnGI0_xro"; // Render envda saqlanadi
const driversGroupId = -1002949281611; // haydovchilar guruhi chat_id

const bot = new TelegramBot(token, { polling: false }); // endi polling emas
const app = express();
app.use(express.json());

// webhookni sozlash
bot.setWebHook(`https://sening-app.onrender.com/${token}`);

// vaqtinchalik saqlash
let userData = {};

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userData[chatId] = {};
  bot.sendMessage(chatId, "Assalomu alaykum! Telefon1 raqamingizni yuboring:");
});

// xabarlarni tutish
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // agar telefon raqam kiritilmagan bo‘lsa
  if (userData[chatId] && !userData[chatId].phone && text !== "/start") {
    userData[chatId].phone = text;
    return bot.sendMessage(
      chatId,
      "Qayerdan qayerga borasiz? (Masalan: Qoqon Farg‘ona)"
    );
  }

  // agar telefon raqam bor, lekin yo‘nalish yo‘q bo‘lsa
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

  // foydalanuvchiga xabar
  bot.sendMessage(
    chatId,
    "✅ Shofyorlar tez orada bog‘lanadi.\n\n🚕 Yangi taksi chaqirish uchun /start buyrug‘ini bosing."
  );

  // haydovchilar guruhiga xabar
  const order = userData[chatId];
  const msgToDrivers = `
🚖 Yangi buyurtma!
📞 Tel: ${order.phone}
📍 Yo'nalish: ${order.route}
👥 Odamlar soni: ${order.people}
  `;

  bot.sendMessage(driversGroupId, msgToDrivers);

  // malumotni tozalash
  delete userData[chatId];
});

// Telegram serverdan keladigan webhook requestlarni qabul qilish
app.post(`/${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// serverni ishga tushirish
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Bot server running on port " + PORT);
});
