const TelegramBot = require("node-telegram-bot-api");

const token = "8097439513:AAE8UfQlPhMdXMmor2Dv4ZdG2kfnGI0_xro"; // BotFather dan olingan token
const driversGroupId = -1002949281611; // Shaxsiy haydovchilar guruhi chat_id

const bot = new TelegramBot(token, { polling: true });

let userData = {}; // vaqtinchalik saqlash

// START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userData[chatId] = {};
  bot.sendMessage(chatId, "Assalomu alaykum! Telefon raqamingizni yuboring:");
});

// Telefon raqam qabul qilish
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Agar userData mavjud bo'lsa va telefon bo'sh bo'lsa
  if (userData[chatId] && !userData[chatId].phone && text !== "/start") {
    userData[chatId].phone = text;
    return bot.sendMessage(chatId, "Qayerdan qayerga borasiz? (Masalan: Qoqon Fargona)");
  }

  // Agar telefon kiritilgan bo'lsa, endi yo'nalishni so'raymiz
  if (userData[chatId] && userData[chatId].phone && !userData[chatId].route) {
    userData[chatId].route = text;

    // Buttonlar (1–4 kishi)
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

// Button bosilganda
// Button bosilganda
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const people = query.data;

  userData[chatId].people = people;

  // Foydalanuvchiga xabar
  bot.sendMessage(
    chatId,
    "✅ Shofyorlar tez orada bog‘lanadi.\n\n🚕 Yangi taksi chaqirish uchun /start buyrug‘ini bosing."
  );

  // Haydovchilar guruhiga buyurtmani yuborish
  const order = userData[chatId];
  const msgToDrivers = `
🚖 Yangi buyurtma!
📞 Tel: ${order.phone}
📍 Yo'nalish: ${order.route}
👥 Odamlar soni: ${order.people}
  `;
  bot.sendMessage(driversGroupId, msgToDrivers);

  // Malumotni tozalash
  delete userData[chatId];
});

