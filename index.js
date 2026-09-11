import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN?.trim();
const AGENTROUTER_API_KEY = process.env.AGENTROUTER_API_KEY?.trim();
// حذف فواضل احتمالی و تنظیم آدرس پیش‌فرض معتبر
const AGENTROUTER_BASE_URL = (process.env.AGENTROUTER_BASE_URL || 'https://agentrouter.org/v1').trim();
const MODEL_NAME = (process.env.MODEL_NAME || 'claude-3-5-sonnet').trim();

if (!TELEGRAM_TOKEN || !AGENTROUTER_API_KEY) {
  console.error('Error: TELEGRAM_TOKEN and AGENTROUTER_API_KEY must be set.');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: AGENTROUTER_API_KEY,
  baseURL: AGENTROUTER_BASE_URL
});

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/start')) {
    return bot.sendMessage(chatId, 'سلام! من ربات متصل به Agent Router هستم. پیام خود را ارسال کنید.');
  }

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
    bot.sendMessage(chatId, `خطا در ارتباط با API:\n${error.message}`);
  }
});

console.log('Bot is running...');
