const Groq = require('groq-sdk');
const MWINDA_SYSTEM_PROMPT = require('./mwinda_prompt');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

const conversations = new Map();
const MAX_HISTORY = 10;

async function askMwinda(userId, userMessage) {
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }

  const history = conversations.get(userId);
  history.push({ role: 'user', content: userMessage });

  if (history.length > MAX_HISTORY * 2) {
    history.splice(0, 2);
  }

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: MWINDA_SYSTEM_PROMPT },
      ...history,
    ],
  });

  const assistantMessage = response.choices[0].message.content;
  history.push({ role: 'assistant', content: assistantMessage });

  return assistantMessage;
}

function clearHistory(userId) {
  conversations.delete(userId);
}

module.exports = { askMwinda, clearHistory };