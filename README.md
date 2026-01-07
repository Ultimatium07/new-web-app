# Nexus Media - Telegram WebApp

Cyberpunk UI bilan Telegram WebApp integratsiyasi.

## Xususiyatlar

- 🎨 **Cyberpunk UI** - Glassmorphism, neon ranglar, animatsiyalar
- 🔐 **AES-256 shifrlash** - Xavfsiz payload uzatish
- 📱 **4 ta tab** - Profil, Ta'lim, Gamification, Premium
- 🛡️ **Xavfsizlik** - Rate limiting, honeypot, TTL tekshiruvi
- 📊 **Chart.js** - XP tarixi grafigi
- 🎴 **Swiper.js** - Flashcard slider

## O'rnatish

### 1. Dependencylarni o'rnatish

```bash
pip install -r requirements.txt
```

### 2. Environment o'zgaruvchilarini sozlash

```bash
# Windows PowerShell
$env:BOT_TOKEN = "your_bot_token_here"
$env:WEBAPP_URL = "https://your-domain.com/asadbekjon.html"
$env:AES_KEY = "nexus_secret_key_32bytes_long!!"

# Linux/Mac
export BOT_TOKEN="your_bot_token_here"
export WEBAPP_URL="https://your-domain.com/asadbekjon.html"
export AES_KEY="nexus_secret_key_32bytes_long!!"
```

### 3. WebApp'ni deploy qilish

`asadbekjon.html` faylini HTTPS server'ga joylashtiring:
- Netlify
- Vercel
- GitHub Pages
- Heroku

### 4. Botni ishga tushirish

```bash
python bot.py
```

## Fayl tuzilishi

```
nexus-webapp/
├── asadbekjon.html    # WebApp UI (Cyberpunk dizayn)
├── bot.py             # Telegram bot backend
├── requirements.txt   # Python dependencies
└── README.md          # Hujjatlar
```

## Bot buyruqlari

| Buyruq | Tavsif |
|--------|--------|
| `/start` | Boshlash va asosiy menyu |
| `/profile` | Profil WebApp |
| `/edu` | Ta'lim WebApp |
| `/gamification` | O'yinlashtirish WebApp |
| `/premium` | Premium WebApp |
| `/help` | Yordam |

## Xavfsizlik

- **AES-256-CBC** shifrlash
- **TTL** - 5 daqiqa (300 soniya)
- **Nonce** - Har bir so'rov uchun unikal
- **Rate limiting** - 30 so'rov/daqiqa
- **Honeypot** - Bot aniqlash
- **DevTools bloklash** - Xavfsizlik ogohlantirishi

## API

### WebApp → Bot

```javascript
// Flashcard javob
tg.sendData(JSON.stringify({
    action: 'flashcard_answer',
    card_id: 1,
    correct: true
}));

// Do'kon xaridi
tg.sendData(JSON.stringify({
    action: 'shop_purchase',
    item_id: 'boost_xp',
    price: 100
}));

// Premium xarid
tg.sendData(JSON.stringify({
    action: 'premium_purchase',
    plan: 'monthly'
}));
```

### Bot → WebApp (URL payload)

```python
# Encrypted payload structure
{
    "user_id": 123456789,
    "username": "user",
    "xp": 500,
    "gold": 1000,
    "level": 5,
    "streak": 7,
    "is_premium": false,
    "initial_tab": "profile",
    "timestamp": 1699999999,
    "nonce": "abc123..."
}
```

## Litsenziya

MIT License
