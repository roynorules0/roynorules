import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import https from 'https';

// Robust environment-agnostic ESM/CJS path resolution
const _filename = typeof __filename !== 'undefined'
  ? __filename
  : (typeof import.meta !== 'undefined' && import.meta.url
    ? fileURLToPath(import.meta.url)
    : '');

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(_filename);

// Standard import for default data
import { defaultShayaris, defaultCategories } from './src/data/defaultShayaris.js';
import { emotionalQuestionPages } from './src/data/emotionalQuestions.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Search Console Verification
app.get('/google59b50fef3e93f851.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send('google-site-verification: google59b50fef3e93f851.html');
});

const DB_FILE_PATH = path.join(process.cwd(), 'server_db.json');

// Memory cache of server-side community submissions & integrations
let db = {
  approved: [] as any[],
  pending: [] as any[],
  categories: defaultCategories,
  telegramConfig: {
    botToken: '',
    chatId: '',
    enabled: false
  },
  telegramLogs: [] as any[]
};

// HTML Escaping for safe Telegram HTML parsing mode (prevents client markdown/HTML crashes)
function escapeTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Native https POST helper to communicate with Telegram Bot API without extra libraries
function postToTelegram(botToken: string, chatId: string, text: string, replyMarkup?: any): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup || undefined
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000 // 10 second timeout limit
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (res.statusCode === 200 && parsed.ok) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: parsed.description || `HTTP ${res.statusCode}` });
          }
        } catch (e: any) {
          resolve({ success: false, error: `Invalid JSON response: ${e?.message || e}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message || 'Network error' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });

    req.write(payload);
    req.end();
  });
}

// Auto-resolves channel usernames, links (e.g. t.me/username), and numeric IDs safely
function parseTelegramChatId(input: string): string {
  if (!input) return '';
  input = input.trim();
  // Match t.me/username, t.me/joinchat, or t.me/c/..., etc.
  const urlMatch = input.match(/(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/);
  if (urlMatch && urlMatch[1]) {
    // Check if it's not a generic page or numeric redirect
    return '@' + urlMatch[1];
  }
  // Check if it's a numeric ID (which could start with - or -100)
  if (/^-?\d+$/.test(input)) {
    return input;
  }
  // If it's a username but doesn't have @, prepend it
  if (!input.startsWith('@')) {
    return '@' + input;
  }
  return input;
}

// Native https getChat POST helper to resolve usernames and check permissions
function getTelegramChat(botToken: string, chatId: string): Promise<{ success: boolean; chat?: any; error?: string }> {
  return new Promise((resolve) => {
    const cleanChatId = parseTelegramChatId(chatId);
    if (!cleanChatId) {
      return resolve({ success: false, error: 'Empty Chat identifier' });
    }

    const payload = JSON.stringify({
      chat_id: cleanChatId
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/getChat`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (res.statusCode === 200 && parsed.ok) {
            resolve({ success: true, chat: parsed.result });
          } else {
            resolve({ success: false, error: parsed.description || `HTTP ${res.statusCode}` });
          }
        } catch (e: any) {
          resolve({ success: false, error: `Invalid JSON response: ${e?.message || e}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message || 'Network error' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });

    req.write(payload);
    req.end();
  });
}

// Sends an approved/published Shayari dynamically to the Telegram Automation channel if enabled
async function sendShayariToTelegram(shayari: any): Promise<{ success: boolean; error?: string; logId?: string; chat?: any }> {
  const config = db.telegramConfig;
  if (!config || !config.enabled || !config.botToken || !config.chatId) {
    console.log('[Telegram Automation] Auto Post is disabled or config is incomplete.');
    return { success: false, error: 'Telegram configuration is disabled or incomplete.' };
  }

  // Prevent duplicate sending
  db.telegramLogs = db.telegramLogs || [];
  const alreadySent = db.telegramLogs.some(log => log.shayariId === shayari.id && log.status === 'Sent');
  if (alreadySent) {
    console.log(`[Telegram Automation] Skipping duplicate post for Shayari ID: ${shayari.id}`);
    return { success: true, error: 'This Shayari is already published on Telegram.', logId: '' };
  }

  const category = shayari.category || 'Vibe';
  const authorName = shayari.author || 'Roy No Rules';
  const shayariText = shayari.text || '';
  const id = shayari.id;
  
  // Clean slug generation path standard fallback matching sitemaps
  const cleanCat = category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const romanized = transliterateDevanagari(shayariText);
  const cleanText = romanized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
  const parts = cleanText.split('-').filter(Boolean).slice(0, 5).join('-');
  const finalPart = parts || 'vibe';
  const slugPath = shayari.slug || `${cleanCat}/${finalPart}-${id}`;

  const websiteOrigin = 'https://royversehub.netlify.app';
  const postUrl = `${websiteOrigin}/${slugPath}`;

  // Auto hashtags based on category
  const simpleCat = category.replace(/[^a-zA-Z0-9]/g, '');
  const tagsSet = new Set(['RoyVerse', 'Shayari']);
  if (simpleCat && simpleCat.toLowerCase() !== 'all') {
    tagsSet.add(simpleCat);
  }
  const hashtags = Array.from(tagsSet).map(t => `#${t}`).join(' ');

  // Form structured Telegram post layout
  const formattedDate = new Date(shayari.createdAt || Date.now()).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const escapedText = escapeTelegramHtml(shayariText);
  const escapedAuthor = escapeTelegramHtml(authorName);
  
  const messageText = `✨ <b>Roy Verse Hub</b> ✨\n\n${escapedText}\n\n━━━━━━━━━━━━━━\n\n👤 <b>Author:</b> ${escapedAuthor}\n📅 ${formattedDate}`;

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '❤️ Like', url: postUrl },
        { text: '🌐 Visit Website', url: 'https://royversehub.netlify.app' }
      ]
    ]
  };

  // Create active pending ledger trace
  const logId = 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const newLog = {
    id: logId,
    shayariId: id,
    shayariText: shayariText.substring(0, 60) + (shayariText.length > 60 ? '...' : ''),
    category: category,
    status: 'Pending' as 'Sent' | 'Failed' | 'Pending',
    timestamp: new Date().toISOString(),
    getChatResponse: null as any,
    approvalId: null as string | null,
    telegramRequest: null as any,
    telegramResponse: null as any
  };
  db.telegramLogs.unshift(newLog);
  saveDb();

  console.log(`[Telegram Automation] Resolving Chat coordinates for ID/Username: ${config.chatId}`);
  
  // Call getChat API (Requirement 4)
  const chatResult = await getTelegramChat(config.botToken, config.chatId);
  const logIndex = db.telegramLogs.findIndex(l => l.id === logId);

  if (!chatResult.success) {
    console.error(`[Telegram Automation] getChat validation failed for target: ${config.chatId}. Error: ${chatResult.error}`);
    if (logIndex !== -1) {
      db.telegramLogs[logIndex].status = 'Failed';
      db.telegramLogs[logIndex].error = `getChat: ${chatResult.error || 'Chat not found'}`;
    }
    saveDb();
    return { success: false, error: chatResult.error || 'Chat not found', logId };
  }

  // Display getChat response in logs (Requirement 5)
  if (logIndex !== -1) {
    db.telegramLogs[logIndex].getChatResponse = chatResult.chat;
  }

  // Determine exact resolved channel target ID (Requirement 3)
  const resolvedChatId = chatResult.chat ? chatResult.chat.id.toString() : config.chatId;

  // Fire execution request to resolved chat ID
  const result = await postToTelegram(config.botToken, resolvedChatId, messageText, replyMarkup);

  // Patch database logs with ultimate status response
  if (logIndex !== -1) {
    db.telegramLogs[logIndex].status = result.success ? 'Sent' : 'Failed';
    if (!result.success) {
      db.telegramLogs[logIndex].error = result.error;
    }
  }
  saveDb();
  console.log(`[Telegram Automation] Auto-post job finished. Status: ${result.success ? 'Success' : 'Failed'}`);
  return {
    success: result.success,
    error: result.error,
    logId,
    chat: chatResult.chat
  };
}

// Global pipeline tracking wrapper to automate approved user-submitted Shayari syncs (Requirement 1, 2, 4, 5, 7)
async function publishApprovedShayariToTelegram(shayari: any): Promise<{ success: boolean; error?: string; approvalId: string }> {
  const approvalId = 'approval-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  
  console.log(`[Telegram Approval Pipeline] [LOG START] Approval ID: ${approvalId}`);
  console.log(`[Telegram Approval Pipeline] Telegram Request Payload Prep for Shayari ID: ${shayari.id}`);
  
  // Clean duplicate prevention (Requirement 7)
  db.telegramLogs = db.telegramLogs || [];
  const alreadySent = db.telegramLogs.some(log => log.shayariId === shayari.id && log.status === 'Sent');
  if (alreadySent) {
    console.log(`[Telegram Approval Pipeline] Aborting duplicate post prevention: Shayari ID ${shayari.id} is already published.`);
    return { success: true, error: 'A duplicate post was prevented. Already published upstream.', approvalId };
  }

  // Execute the exact same shared Telegram posting logic (Requirement 3)
  const result = await sendShayariToTelegram(shayari);

  // Retrieve the generated ledger item and hook in the approval tracer telemetry (Requirement 5)
  if (result.logId) {
    const logIdx = db.telegramLogs.findIndex(l => l.id === result.logId);
    if (logIdx !== -1) {
      db.telegramLogs[logIdx].approvalId = approvalId;
      db.telegramLogs[logIdx].telegramRequest = {
        chatId: db.telegramConfig.chatId,
        category: shayari.category,
        author: shayari.author,
        textLength: shayari.text ? shayari.text.length : 0
      };
      db.telegramLogs[logIdx].telegramResponse = {
        success: result.success,
        chat: result.chat,
        error: result.error || null
      };
    }
    saveDb();
  }

  console.log(`[Telegram Approval Pipeline] [LOG END] Approval ID: ${approvalId}. Success: ${result.success}. Error: ${result.error || 'None'}`);

  return {
    success: result.success,
    error: result.error,
    approvalId
  };
}

// Load community shayaris from disk
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      db = JSON.parse(content);
      // Ensure arrays and default lists are synchronized
      if (!Array.isArray(db.approved)) db.approved = [];
      if (!Array.isArray(db.pending)) db.pending = [];
      if (!Array.isArray(db.categories)) db.categories = defaultCategories;
      if (!db.telegramConfig) {
        db.telegramConfig = {
          botToken: '',
          chatId: '',
          enabled: false
        };
      }
      if (!Array.isArray(db.telegramLogs)) {
        db.telegramLogs = [];
      }
    } else {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error loading server DB, using fresh template', err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server DB to disk', err);
  }
}

// Automatically load database on launch
loadDb();

// Unified transliteration + slugs helper
function transliterateDevanagari(text: string): string {
  const map: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ं': 'n', 'ः': 'h', 'ँ': 'n', '़': '', '्': '',
    'ज़': 'z', 'फ़': 'f', 'ख़': 'kh', 'ग़': 'g', 'ढ़': 'dh', 'ड़': 'd'
  };

  let transliterated = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1] || '';
    const combo = char + nextChar;
    
    if (map[combo] !== undefined) {
      transliterated += map[combo];
      i++; // skip next character
    } else if (map[char] !== undefined) {
      transliterated += map[char];
    } else {
      transliterated += char;
    }
  }
  return transliterated;
}

function buildSimpleSlug(category: string, text: string, id: string): string {
  const cleanCat = category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const romanized = transliterateDevanagari(text);
  const clean = romanized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
    
  const parts = clean.split('-').filter(Boolean).slice(0, 5).join('-');
  const finalPart = parts || 'vibe';
  return `${cleanCat}/${finalPart}-${id}`;
}

// API Routes
app.get('/api/community-db', (req, res) => {
  res.json({
    approved: db.approved,
    pending: db.pending,
    categories: db.categories
  });
});

function verifyTelegramToken(botToken: string): Promise<{ valid: boolean; botName?: string; error?: string }> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/getMe`,
      method: 'GET',
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode === 200 && parsed.ok) {
            resolve({ valid: true, botName: parsed.result.username || parsed.result.first_name });
          } else {
            resolve({ valid: false, error: parsed.description || `HTTP ${res.statusCode}` });
          }
        } catch (e: any) {
          resolve({ valid: false, error: `JSON Parse error: ${e.message}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ valid: false, error: err.message || 'Verification network error' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ valid: false, error: 'Verification timed out' });
    });

    req.end();
  });
}

app.get('/api/telegram-config', (req, res) => {
  const cfg = db.telegramConfig || { botToken: '', chatId: '', enabled: false };
  const hasToken = !!cfg.botToken;
  // Return the full unshortened token so user can toggle unmasking via the eye icon. No truncation.
  res.json({
    botToken: cfg.botToken || '',
    hasToken,
    chatId: cfg.chatId || '',
    enabled: !!cfg.enabled,
    logs: db.telegramLogs || []
  });
});

app.post('/api/telegram-config', async (req, res) => {
  const { botToken, chatId, enabled } = req.body;
  if (!db.telegramConfig) {
    db.telegramConfig = { botToken: '', chatId: '', enabled: false };
  }
  
  const originalLength = botToken ? botToken.length : 0;

  // Fully preserve special symbols/characters and handle tokens > 100 characters. No truncation.
  if (botToken !== undefined) {
    if (botToken !== '' && !botToken.includes('••••')) {
      db.telegramConfig.botToken = botToken;
    } else if (botToken === '') {
      db.telegramConfig.botToken = '';
    }
  }

  let resolvedChatId = chatId;
  let validationResult = null;

  if (chatId !== undefined) {
    const parsedInput = parseTelegramChatId(chatId);
    db.telegramConfig.chatId = parsedInput; // Save the raw parsed version (e.g. @username or ID)
    
    // Attempt automatic resolution of channel to immutable channel ID using getChat API (Requirement 1, 3, 9)
    const activeToken = db.telegramConfig.botToken;
    if (activeToken && parsedInput) {
      const getChatRes = await getTelegramChat(activeToken, parsedInput);
      if (getChatRes.success && getChatRes.chat && getChatRes.chat.id) {
        resolvedChatId = getChatRes.chat.id.toString();
        db.telegramConfig.chatId = resolvedChatId; // Store physical numeric ID automatically
        validationResult = {
          valid: true,
          chat: getChatRes.chat
        };
      } else {
        validationResult = {
          valid: false,
          error: getChatRes.error || 'Chat not found or bot lacks administrative privileges.'
        };
      }
    }
  }

  if (enabled !== undefined) {
    db.telegramConfig.enabled = !!enabled;
  }
  saveDb();

  const savedLength = db.telegramConfig.botToken ? db.telegramConfig.botToken.length : 0;

  // Add precise debug log as required (Requirement 8)
  console.log(`[DEBUG] Save Telegram Config: Original token length: ${originalLength}, Saved token length: ${savedLength}, Stored ChatId: ${db.telegramConfig.chatId}`);

  // Perform backend verification using Telegram getMe API (Requirement 5 & 6)
  let valStatus = { valid: false, botName: '', error: 'No token specified' };
  if (db.telegramConfig.botToken) {
    try {
      const vResult = await verifyTelegramToken(db.telegramConfig.botToken);
      valStatus = {
        valid: vResult.valid,
        botName: vResult.botName || '',
        error: vResult.error || ''
      };
    } catch (err: any) {
      valStatus = { valid: false, botName: '', error: err?.message || 'Verification exception' };
    }
  }

  res.json({ 
    success: true, 
    tokenLength: savedLength,
    validationStatus: valStatus,
    chatResolution: validationResult,
    savedChatId: db.telegramConfig.chatId
  });
});

app.post('/api/telegram-test', async (req, res) => {
  const { botToken, chatId } = req.body;
  let finalToken = botToken;
  if (!finalToken || finalToken.includes('••••')) {
    finalToken = db.telegramConfig?.botToken || '';
  }
  const finalChatId = chatId || db.telegramConfig?.chatId || '';
  
  if (!finalToken || !finalChatId) {
    return res.status(400).json({ success: false, error: 'Bot Token and Chat ID/Username are required for test connection.' });
  }

  // 1. Verify Bot Token
  const meResult = await verifyTelegramToken(finalToken);
  if (!meResult.valid) {
    return res.status(400).json({ success: false, error: `Invalid bot token verified: ${meResult.error}` });
  }

  // 2. Resolve Chat with getChat (Requirement 4)
  const cleanChatId = parseTelegramChatId(finalChatId);
  const chatResult = await getTelegramChat(finalToken, cleanChatId);
  if (!chatResult.success) {
    return res.status(400).json({ 
      success: false, 
      error: `Channel resolution failed: ${chatResult.error}. Ensure the bot is added to your Telegram channel as an Administrator with administrative permissions.` 
    });
  }

  const resolvedChatId = chatResult.chat.id.toString();
  const channelDisplay = chatResult.chat.username ? `@${chatResult.chat.username}` : (chatResult.chat.title || cleanChatId);

  // Send the specific formatted test message (Requirement 3)
  const testMessageText = `✅ <b>Telegram Connected Successfully</b>\n\nChannel: ${channelDisplay}\nWebsite: https://royversehub.netlify.app`;
  
  const result = await postToTelegram(finalToken, resolvedChatId, testMessageText);
  if (result.success) {
    // If testing succeeds, automatically save the resolved physical ID to db settings to prevent "chat not found"
    if (db.telegramConfig && db.telegramConfig.chatId !== resolvedChatId) {
      db.telegramConfig.chatId = resolvedChatId;
      saveDb();
    }
    res.json({ success: true, chat: chatResult.chat });
  } else {
    res.status(400).json({ success: false, error: `Failed to broadcast message: ${result.error}. Check channel permission rights.` });
  }
});

app.post('/api/telegram-verify-channel', async (req, res) => {
  const { botToken, chatId } = req.body;
  let finalToken = botToken;
  if (!finalToken || finalToken.includes('••••')) {
    finalToken = db.telegramConfig?.botToken || '';
  }
  const finalChatId = chatId || db.telegramConfig?.chatId || '';

  if (!finalToken || !finalChatId) {
    return res.status(400).json({ success: false, error: 'Bot Token and Chat ID/Username are required for verification.' });
  }

  // 1. Verify Bot Token
  const meResult = await verifyTelegramToken(finalToken);
  if (!meResult.valid) {
    return res.status(400).json({ 
      success: false, 
      errorType: 'TOKEN_INVALID',
      error: `Token validation failed: ${meResult.error || 'Invalid API Token'}`
    });
  }

  // 2. Resolve Chat (Requirement 4)
  const cleanChatId = parseTelegramChatId(finalChatId);
  const result = await getTelegramChat(finalToken, cleanChatId);
  if (result.success) {
    const resolvedChatId = result.chat.id.toString();
    // Save resolved numeric ID automatically to prevent "Bad Request: chat not found"
    if (db.telegramConfig) {
      db.telegramConfig.chatId = resolvedChatId;
      saveDb();
    }
    res.json({ 
      success: true, 
      bot: { username: meResult.botName },
      chat: result.chat 
    });
  } else {
    const rawError = result.error || '';
    let description = rawError;
    let type = 'CHANNEL_NOT_FOUND';
    
    if (rawError.includes('chat not found')) {
      description = `The channel details for "${cleanChatId}" were not found. Verify the username or ID spelling. The channel must be PUBLIC for usernames to resolve, or private channels must use the numeric Channel ID (e.g. -100xxxxxxxxxx).`;
    } else if (rawError.includes('bot is not a member') || rawError.includes('Forbidden') || rawError.includes('admin') || rawError.includes('privileges')) {
      type = 'BOT_NOT_ADMIN';
      description = `The bot was found, but lacks administrator privileges. Open your channel settings on Telegram, add the bot as an Administrator, and ensure "Post Messages" is checked.`;
    }
    
    res.status(400).json({ 
      success: false, 
      errorType: type,
      error: `getChat API Error: ${description} (Raw: "${rawError}")`
    });
  }
});

app.post('/api/submit-shayari', (req, res) => {
  const { text, category, author, highlightedWords, uploaderUsername, newCategory } = req.body;
  if (!text || !category) {
    return res.status(400).json({ error: 'Text and Category are required.' });
  }

  const id = Date.now().toString() + '-' + Math.floor(Math.random() * 900 + 100);
  const slug = buildSimpleSlug(category, text, id);

  const newShayari = {
    id,
    text,
    category,
    author: author || 'Anonymous',
    highlightedWords: highlightedWords || [],
    likes: 0,
    shares: 0,
    createdAt: new Date().toISOString(),
    status: 'pending',
    uploaderUsername,
    slug,
    seoTitle: `${category} Shayari - Pure Emotions of ${author || 'Anonymous'}`,
    seoDesc: text.substring(0, 150).replace(/\n/g, ' ')
  };

  db.pending.unshift(newShayari);

  // Auto include new category
  if (newCategory && !db.categories.includes(newCategory)) {
    db.categories.push(newCategory);
  }

  saveDb();
  res.status(201).json({ success: true, shayari: newShayari });
});

app.post('/api/approve-shayari', async (req, res) => {
  const { id } = req.body;
  const index = db.pending.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pending shayari not found.' });
  }

  const item = db.pending[index];
  item.status = 'approved';
  // Standard title upgrade
  item.seoTitle = `${item.category} Shayari - "${item.text.substring(0, 30).trim()}..." | Roy No Rules`;
  
  db.pending.splice(index, 1);
  db.approved.unshift(item);
  saveDb();

  // Automate auto-post to Telegram if enabled (Requirement 1, 2)
  let telegramResult: { success: boolean; error?: string; approvalId: string } = { success: false, error: 'Telegram configuration disabled or inactive.', approvalId: '' };
  try {
    telegramResult = await publishApprovedShayariToTelegram(item);
  } catch (err: any) {
    telegramResult = { success: false, error: err?.message || 'Verification exception', approvalId: '' };
  }

  res.json({ 
    success: true, 
    shayari: item,
    telegram: telegramResult
  });
});

app.post('/api/decline-shayari', (req, res) => {
  const { id } = req.body;
  const index = db.pending.findIndex(s => s.id === id);
  if (index !== -1) {
    db.pending.splice(index, 1);
    saveDb();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Pending shayari not found.' });
});

app.post('/api/delete-shayari', (req, res) => {
  const { id } = req.body;
  const index = db.approved.findIndex(s => s.id === id);
  if (index !== -1) {
    db.approved.splice(index, 1);
    saveDb();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Approved shayari not found.' });
});

app.post('/api/add-official-shayari', (req, res) => {
  const { text, category, author, highlightedWords } = req.body;
  if (!text || !category) {
    return res.status(400).json({ error: 'Text and Category are required.' });
  }

  const id = Date.now().toString();
  const slug = buildSimpleSlug(category, text, id);

  const officialShayari = {
    id,
    text,
    category,
    author: author || 'Roy No Rules',
    highlightedWords: highlightedWords || [],
    likes: Math.floor(Math.random() * 50) + 120,
    shares: Math.floor(Math.random() * 20) + 40,
    createdAt: new Date().toISOString(),
    status: 'approved',
    slug,
    seoTitle: `${category} Shayari by ${author || 'Roy No Rules'} - Heart Touching Status`,
    seoDesc: text.substring(0, 160).replace(/\n/g, ' ')
  };

  db.approved.unshift(officialShayari);
  saveDb();

  // Automate auto-post to Telegram if enabled
  sendShayariToTelegram(officialShayari).catch(err => {
    console.error('[Telegram] Official post integration failure:', err);
  });

  res.status(201).json({ success: true, shayari: officialShayari });
});

// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const origin = 'https://royversehub.netlify.app';

  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`);
});

// Dynamic sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const origin = 'https://royversehub.netlify.app';

  // Collect all approved shayaris (Default + Community approved)
  const allApproved = [...defaultShayaris, ...db.approved];
  const lastmod = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 1. Homepage URL
  xml += `
  <url>
    <loc>${origin}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // 2. Trust pages
  const trustPaths = ['/about-us', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/contact-us'];
  trustPaths.forEach(tp => {
    xml += `
  <url>
    <loc>${origin}${tp}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
  });

  // 3. Category URLs
  const activeCategories = Array.from(new Set([...defaultCategories, ...db.categories])).filter(c => c !== 'All');
  activeCategories.forEach(cat => {
    const cleanCat = cat.toLowerCase().replace(/\s+/g, '-');
    xml += `
  <url>
    <loc>${origin}/${cleanCat}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // 4. Individual Shayari pages
  allApproved.forEach(s => {
    const slugPath = s.slug || buildSimpleSlug(s.category, s.text, s.id);
    xml += `
  <url>
    <loc>${origin}/${slugPath}</loc>
    <lastmod>${s.createdAt ? s.createdAt.split('T')[0] : lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // 5. Emotional Question Pages (High intent sentiment search nodes)
  emotionalQuestionPages.forEach(eq => {
    xml += `
  <url>
    <loc>${origin}/${eq.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // 6. Creator Portfolio pages
  const defaultCreators = ['roynorules', 'KabirSpeaks', 'AadyaRoy', 'RitikRai'];
  defaultCreators.forEach(c => {
    xml += `
  <url>
    <loc>${origin}/creator/${c}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  xml += `\n</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Dynamic pre-rendering metadata injector
function generateSeoHtml(template: string, requestPath: string, host: string, protocol: string): string {
  let title = 'Roy No Rules | Premium Hindi & Hinglish Shayari';
  let description = 'Discover premium Hinglish emotional shayari, motivation, attitude customizer, free recitation players, and premium HD wallpaper creation studio.';
  const currentOrigin = `${protocol}://${host}`;
  let canonical = `${currentOrigin}${requestPath}`;

  const cleanPath = requestPath.split('?')[0];

  const matchedEq = emotionalQuestionPages.find(eq => '/' + eq.slug === cleanPath);

  // Match emotional pages, trust pages, and dynamically generated profiles
  if (matchedEq) {
    title = matchedEq.seoTitle;
    description = matchedEq.seoDesc;
  } else if (cleanPath === '/about-us') {
    title = 'About Our Sanctuary | Roy No Rules';
    description = 'Learn about Roy No Rules shayari sanctuary, emotional dark aesthetics, and our community.';
  } else if (cleanPath === '/privacy-policy') {
    title = 'Privacy Safeguards | Roy No Rules';
    description = 'Full details on local-first secure client states and cookies privacy policies.';
  } else if (cleanPath === '/terms-and-conditions') {
    title = 'Terms & Conditions | Roy No Rules';
    description = 'Respectful conduct guidelines, copyright standards, and community moderator rules.';
  } else if (cleanPath === '/disclaimer') {
    title = 'Creative Disclaimers | Roy No Rules';
    description = 'Intellectual property and copyright claims disclaimers for fan-made shayaris.';
  } else if (cleanPath === '/contact-us') {
    title = 'Contact Us Direct | Roy No Rules';
    description = 'Get in touch with us at +91 9027671630 or email roynoruless@gmail.com for support.';
  } else {
    // Check if it's a category or shayari page or creator
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 1) {
      // Category index or landing format (e.g. /sad or /sad-shayari)
      const rawCat = segments[0].toLowerCase().replace('-shayari', '');
      const matchedCat = [...defaultCategories, ...db.categories].find(
        c => c.toLowerCase() === rawCat || c.toLowerCase().replace(/\s+/g, '-') === rawCat
      );
      if (matchedCat) {
        title = `${matchedCat} Shayari & Status | Roy No Rules 👑`;
        description = `Discover handpicked, trending ${matchedCat} Hinglish and Hindi Shayari. Read, recite softly with room audio ambient players, and download custom aesthetic wallpaper cards.`;
      }
    } else if (segments.length === 2) {
      if (segments[0] === 'creator') {
        const creatorName = decodeURIComponent(segments[1]);
        title = `Creator @${creatorName} | Premium Creator Portfolio - Roy No Rules`;
        description = `Explore creative collections, daily active engagement metrics, and custom HD status cards designed by @${creatorName} inside the Roy No Rules content ecosystem.`;
      } else {
        const slugSubpart = segments[1].toLowerCase();
        // Find Shayari (default or community approved)
        const allShayaris = [...defaultShayaris, ...db.approved];
        const matchedShayari = allShayaris.find(s => {
          const itemSlug = s.slug || '';
          return itemSlug.toLowerCase().endsWith(slugSubpart) || s.id === slugSubpart;
        });

        if (matchedShayari) {
          title = matchedShayari.seoTitle || `${matchedShayari.category} Shayari by ${matchedShayari.author} | Roy No Rules`;
          description = matchedShayari.seoDesc || `${matchedShayari.text.substring(0, 160).replace(/\n/g, ' ')}`;
        }
      }
    }
  }

  // Replace tags in head dynamically
  let output = template;

  // Real-time dynamic JSON-LD Schema Markup injection
  let schemaData: any = null;
  const currentEq = emotionalQuestionPages.find(eq => '/' + eq.slug === cleanPath);
  if (currentEq) {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": currentEq.heading,
      "description": currentEq.seoDesc,
      "articleBody": currentEq.intro,
      "author": {
        "@type": "Person",
        "name": "Roy No Rules Editorial Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Roy No Rules",
        "logo": {
          "@type": "ImageObject",
          "url": `${currentOrigin}/favicon.ico`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonical
      }
    };
  } else if (cleanPath === '/' || cleanPath === '') {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Roy No Rules",
      "url": currentOrigin,
      "description": description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${currentOrigin}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  } else {
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 1) {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${segments[0].replace('-shayari', '').toUpperCase()} Vibe Station`,
        "url": canonical,
        "description": description,
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": currentOrigin },
            { "@type": "ListItem", "position": 2, "name": segments[0], "item": canonical }
          ]
        }
      };
    } else if (segments.length === 2) {
      if (segments[0] === 'creator') {
        schemaData = {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "name": segments[1],
            "description": description,
            "url": canonical
          }
        };
      } else {
        schemaData = {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": title,
          "genre": segments[0],
          "creator": {
            "@type": "Person",
            "name": title.split('by ')[1]?.split(' |')[0] || "Roy No Rules Guest Author"
          },
          "text": description,
          "url": canonical
        };
      }
    }
  }

  if (schemaData) {
    const schemaTag = `\n    <script type="application/ld+json">${JSON.stringify(schemaData)}</script>`;
    output = output.replace(/<\/head>/i, `${schemaTag}</head>`);
  }

  // Title replacement
  if (output.includes('<title>')) {
    output = output.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  } else {
    output = output.replace(/<\/head>/i, `<title>${title}</title></head>`);
  }

  // Description meta tag replacement/injection
  const descTag = `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`;
  if (output.includes('name="description"')) {
    output = output.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, descTag);
  } else {
    output = output.replace(/<\/head>/i, `${descTag}</head>`);
  }

  // Canonical tag
  const canonTag = `<link rel="canonical" href="${canonical}" />`;
  if (output.includes('rel="canonical"')) {
    output = output.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, canonTag);
  } else {
    output = output.replace(/<\/head>/i, `${canonTag}</head>`);
  }

  // Open Graph
  const ogTags = `
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Roy No Rules..." />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
  `;
  output = output.replace(/<\/head>/i, `${ogTags}</head>`);

  return output;
}

// Vite integration or static file rendering
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);

    // Serve index.html transformed with Vite and dynamic SEO meta tags
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.resolve(_dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);

        const host = req.get('host') || 'localhost:3000';
        const protocol = req.secure ? 'https' : 'http';
        const html = generateSeoHtml(template, url, host, protocol);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

  } else {
    // Production mode
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files with 1-year max-age Cache-Control headers for performance
    app.use(express.static(distPath, { 
      index: false,
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.match(/\.(js|css|woff2?|eot|ttf|otf|png|svg|ico)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
        }
      }
    }));

    app.get('*', (req, res) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.join(distPath, 'index.html');
        if (!fs.existsSync(templatePath)) {
          return res.status(404).send('Application build in progress. Please refresh.');
        }
        const template = fs.readFileSync(templatePath, 'utf-8');

        const host = req.get('host') || 'roynorules.com';
        const protocol = req.secure ? 'https' : 'http';
        const html = generateSeoHtml(template, url, host, protocol);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error('Production serve error:', e);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Roy No Rules] SEO and Sitemap enabled server running on port ${PORT}`);
  });
}

startServer();
