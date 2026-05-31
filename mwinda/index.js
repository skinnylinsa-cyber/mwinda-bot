require('dotenv').config();
const express = require('express');
const { askMwinda, clearHistory } = require('./src/claude');

const app = express();
app.use(express.json());

const {
  WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  PORT = 3000,
} = process.env;

// ─── Vérification du webhook Meta (une seule fois au départ) ───────────────
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook vérifié par Meta');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ─── Réception des messages WhatsApp ──────────────────────────────────────
app.post('/webhook', async (req, res) => {
  // Répondre 200 immédiatement (sinon Meta retente)
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const msg = messages[0];
    const from = msg.from;           // numéro de l'utilisateur
    const msgType = msg.type;

    let userText = null;

    if (msgType === 'text') {
      userText = msg.text.body.trim();
    } else {
      // Pour les types non-texte (image, audio...) on informe poliment
      userText = '[L\'utilisateur a envoyé un fichier non textuel]';
    }

    // Commande reset (optionnel)
    if (userText.toLowerCase() === '/reset') {
      clearHistory(from);
      await sendWhatsAppMessage(from, '🔄 Conversation réinitialisée. Bonjour, je suis Mwinda ! Comment puis-je t\'aider ?');
      return;
    }

    console.log(`📩 Message de ${from}: ${userText}`);

    // Appel à Claude / Mwinda
    const reply = await askMwinda(from, userText);

    // Envoi de la réponse WhatsApp
    await sendWhatsAppMessage(from, reply);
    console.log(`📤 Réponse envoyée à ${from}`);

  } catch (err) {
    console.error('❌ Erreur webhook:', err.message);
  }
});

// ─── Envoi d'un message WhatsApp via l'API Meta ───────────────────────────
async function sendWhatsAppMessage(to, text) {
  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(err)}`);
  }
}

// ─── Route de santé ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', agent: 'Mwinda by Axdrel OBA' });
});

app.listen(PORT, () => {
  console.log(`🟢 Mwinda en ligne sur le port ${PORT}`);
});
