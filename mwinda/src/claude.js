const Anthropic = require('@anthropic-ai/sdk');
const MWINDA_SYSTEM_PROMPT = require('./mwinda_prompt');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Mémoire de conversation par utilisateur (en RAM, simple pour démarrer)
const conversations = new Map();

const MAX_HISTORY = 10; // nb de tours max gardés en mémoire

async function askMwinda(userId, userMessage) {
  // Récupérer ou créer l'historique de l'utilisateur
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }

  const history = conversations.get(userId);

  // Ajouter le message de l'utilisateur
  history.push({ role: 'user', content: userMessage });

  // Tronquer si trop long
  if (history.length > MAX_HISTORY * 2) {
    history.splice(0, 2); // supprimer le plus vieux tour
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: MWINDA_SYSTEM_PROMPT,
    messages: history,
  });

  const assistantMessage = response.content[0].text;

  // Sauvegarder la réponse dans l'historique
  history.push({ role: 'assistant', content: assistantMessage });

  return assistantMessage;
}

function clearHistory(userId) {
  conversations.delete(userId);
}

module.exports = { askMwinda, clearHistory };
