# 🌟 Mwinda — Agent WhatsApp
> Créé par **Axdrel OBA** · Pointe-Noire, Congo

Mwinda est un chatbot WhatsApp intelligent qui accompagne les jeunes Congolais en matière d'orientation scolaire, de bourses, de finances personnelles et de plans de vie au Congo.

---

## 📁 Structure du projet

```
mwinda/
├── index.js              ← Serveur Express + Webhook WhatsApp
├── src/
│   ├── claude.js         ← Logique IA (Claude + mémoire par utilisateur)
│   └── mwinda_prompt.js  ← Prompt système de Mwinda
├── .env.example          ← Variables d'environnement à configurer
├── package.json
└── README.md
```

---

## 🚀 Installation locale

```bash
# 1. Cloner et installer
git clone <ton-repo>
cd mwinda
npm install

# 2. Configurer les variables
cp .env.example .env
# → Remplis les valeurs dans .env

# 3. Lancer
npm start
```

---

## ☁️ Déploiement sur Railway

1. Crée un compte sur [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Dans les paramètres Railway, ajoute les variables d'environnement de ton `.env`
4. Railway te donnera une URL publique ex: `https://mwinda.up.railway.app`
5. Utilise cette URL comme webhook dans le Meta Developer Portal

---

## 📱 Configuration WhatsApp Cloud API (Meta)

1. Va sur [developers.facebook.com](https://developers.facebook.com)
2. Crée une app → "Business" → ajoute "WhatsApp"
3. Récupère :
   - `WHATSAPP_TOKEN` → Access Token temporaire (ou permanent)
   - `WHATSAPP_PHONE_NUMBER_ID` → dans les paramètres WhatsApp
4. Configure le webhook :
   - URL : `https://ton-url-railway.app/webhook`
   - Verify Token : la valeur de `WHATSAPP_VERIFY_TOKEN` dans ton `.env`
   - Souscris à l'événement : `messages`

---

## 💬 Commandes utilisateur

| Commande | Action |
|----------|--------|
| N'importe quel message | Mwinda répond intelligemment |
| `/reset` | Remet la conversation à zéro |

---

## 🔧 Variables d'environnement

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Clé API Anthropic (claude.ai) |
| `WHATSAPP_TOKEN` | Token d'accès Meta WhatsApp |
| `WHATSAPP_PHONE_NUMBER_ID` | ID du numéro WhatsApp Business |
| `WHATSAPP_VERIFY_TOKEN` | Token de vérification webhook (tu le choisis) |
| `PORT` | Port du serveur (Railway le gère auto) |

---

## 👤 Contact

**Axdrel OBA** — Consultant IA, Pointe-Noire, Congo
