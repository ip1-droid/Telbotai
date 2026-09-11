import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';

// خواندن متغیرهای محیطی
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const AGENTROUTER_API_KEY = process.env.AGENTROUTER_API_KEY;
const AGENTROUTER_BASE_URL = process.env.AGENTROUTER_BASE_URL || 'https://agentrouter.org/v1';
const MODEL_NAME = process.env.MODEL_NAME || 'claude-3-5-sonnet';

if (!TELEGRAM_TOKEN || !AGENTROUTER_API_KEY) {
  console.error('Error: TELEGRAM_TOKEN and AGENTROUTER_API_KEY must be set.');
  process.exit(1);
}

// مقداردهی اولیه کلاینت OpenAI برای Agent Router
const openai = new OpenAI({
  apiKey: AGENTROUTER_API_KEY,
  baseURL: AGENTROUTER_BASE_URL
});

// مقداردهی اولیه ربات تلگرام (Polling)
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/start')) {
    return bot.sendMessage(chatId, 'سلام! من ربات متصل به Agent Router هستم. پیام خود را ارسال کنید.');
  }

  // ارسال حالت Typing به کاربر
  bot.sendChatAction(chatId, 'typing');

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: text }
      ]
    });

    const reply = response.choices[0]?.message?.content || 'پاسخی دریافت نشد.';
    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error('API Error:', error.message);
    bot.sendMessage(chatId, 'خطایی در ارتباط با مدل هوش مصنوعی رخ داد.');
  }
});

console.log('Bot is running...');
