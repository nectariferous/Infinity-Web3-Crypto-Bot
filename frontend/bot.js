const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const token = '';
const bot = new TelegramBot(token, { polling: true });
const uri = "";
const client = new MongoClient(uri);
const webAppBaseUrl = 'https://app.likhon.xyz/';

async function connectToMongo() {
  try {
    await client.connect();
    console.log("MongoDB connection successful.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

connectToMongo();

function generateWebAppUrl(user) {
  const userData = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name || "",
    username: user.username,
    language_code: user.language_code,
    is_premium: user.is_premium || false,
    allows_write_to_pm: true
  };
  const chatInstance = Date.now().toString();
  const authDate = Math.floor(Date.now() / 1000);
  const dataCheckString = Object.keys(userData).sort().map(key => `${key}=${userData[key]}`).join('\n');
  const secretKey = crypto.createHmac('sha256', bot.token).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(`auth_date=${authDate}\nchat_instance=${chatInstance}\nuser=${dataCheckString}`).digest('hex');
  const tgWebAppData = { user: userData, chat_instance: chatInstance, auth_date: authDate, hash: hash };
  const encodedData = encodeURIComponent(JSON.stringify(tgWebAppData));
  const webAppUrl = `${webAppBaseUrl}#tgWebAppData=${encodedData}`;
  return webAppUrl;
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || "Anonymous";
  try {
    const userCollection = client.db("taskapp").collection("users");
    let user = await userCollection.findOne({ userId: userId });
    if (!user) {
      user = { userId, username, points: 0, completedTasks: [], referredBy: null, referralCode: userId.toString(), lastPointUpdate: new Date(), joinDate: new Date() };
      await userCollection.insertOne(user);
    }
    const referralLink = `https://t.me/InfinityWeb3CryptoBot?start=${user.referralCode}`;
    const webAppUrl = generateWebAppUrl(msg.from);
    const message = `🚀 Welcome to Infinity Web3 Crypto Bot, ${username}!\n\n📊 Points: ${user.points}\n💰 Earn 100 points per referral!\n✨ Start your crypto journey now!`;
    const keyboard = {
      keyboard: [
        [{ text: "🌐 Open Web App", web_app: { url: webAppUrl } }],
        [{ text: "🔗 My Referral Link" }, { text: "📊 My Stats" }],
        [{ text: "ℹ️ How to Earn" }, { text: "🎯 Daily Task" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML', reply_markup: JSON.stringify(keyboard) });
    await bot.setChatMenuButton(chatId, { type: 'web_app', text: 'Open Web App', web_app: { url: webAppUrl } });
  } catch (error) {
    console.error("Error in /start command:", error);
    await bot.sendMessage(chatId, "Error occurred. Please try again later or contact support.");
  }
});

bot.on('message', async (msg) => {
  if (msg.text === "🔗 My Referral Link") {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const userCollection = client.db("taskapp").collection("users");
      const user = await userCollection.findOne({ userId: userId });

      if (user) {
        const referralLink = `https://t.me/InfinityWeb3CryptoBot?start=${user.referralCode}`;
        const message = `Here's your unique referral link:\n\n${referralLink}\n\nShare this link with your friends. When they join using your link, you'll earn 100 points!`;
        await bot.sendMessage(chatId, message);
      } else {
        await bot.sendMessage(chatId, "Sorry, we couldn't find your user information. Please try starting the bot again with /start.");
      }
    } catch (error) {
      console.error("Error generating referral link:", error);
      await bot.sendMessage(chatId, "An error occurred while generating your referral link. Please try again later.");
    }
  }
  // Handle other button clicks or messages here
});

console.log('Bot is running...');