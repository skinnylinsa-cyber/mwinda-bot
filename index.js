require('dotenv').config();
const express = require('express');
const { askMwinda, clearHistory } = require('./src/claude');

const app = express();
app.use(express.json());

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const PORT = process.env.PORT || 3000;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages || messages.length === 0) return;
    const msg = messages[0];
    const from = msg.from;
    let userText = msg.type === 'text' ? msg.text.body.trim() : '[fichier recu]';
    if (userText.toLowerCase() === '/reset') {
      clearHistory(from);
      await sendMessage(from, 'Conversation reinitialisee. Je suis Mwinda !');
      return;
    }
    const reply = await askMwinda(from, userText);
    await sendMessage(from, reply);
  } catch (err) {
    console.error('Erreur:', err.message);
  }
});

async function sendMessage(to, text) {
  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await fetch(url, {
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
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', agent: 'Mwinda by Axdrel OBA' });
});

app.listen(PORT, () => {
  console.log('Mwinda en ligne sur le port ' + PORT);
});