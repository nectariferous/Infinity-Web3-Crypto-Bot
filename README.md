# Infinity Web3 Crypto Bot 🚀

## Project Overview
Infinity Web3 Crypto Bot is an interactive Telegram bot and web application designed to engage users in the world of cryptocurrency and Web3 technologies. The project offers a gamified experience with a referral system, daily tasks, and a points-based reward system to encourage user participation and community growth.

## 🌟 Features
- User registration and profile management
- Referral system with point rewards
- Daily tasks for user engagement
- Web app integration for enhanced user experience
- User statistics and leaderboard
- Telegram bot commands for easy interaction
- Boost feature for additional point earning opportunities
- Random tips to guide and motivate users

## 🛠 Technology Stack
- Backend: Node.js (Express.js) and Python
- Database: MongoDB
- Telegram Bot API: node-telegram-bot-api (Node.js) and python-telegram-bot (Python)
- Frontend: HTML, CSS, JavaScript

## 📁 Project Structure
```
infinity-web3-crypto-bot/
├── backend/
│   ├── bot.js
│   ├── bot.py
│   ├── server.js
│   └── database.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── user.js
│   ├── referrals.js
│   └── app.js
├── package.json
└── README.md
```

## 🚀 Setup and Installation

### Prerequisites
- Node.js (v14 or later)
- Python (v3.7 or later)
- MongoDB

### Installation Steps
1. Clone the repository:
   ```
   git clone https://github.com/nectariferous/infinity-web3-crypto-bot.git
   cd infinity-web3-crypto-bot
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   MONGODB_URI=your_mongodb_connection_string
   WEB_APP_BASE_URL=your_web_app_url
   ```

5. Start the Node.js server:
   ```
   node server.js
   ```

6. Start the Python bot:
   ```
   python bot.py
   ```

## 🤖 Bot Commands
- `/start`: Initiates the bot and provides a welcome message

## 🌐 API Endpoints
- `GET /getUserData`: Fetches user data
- `POST /updateUserData`: Updates user data
- `GET /verifyMembership`: Verifies user membership in a Telegram group
- `GET /getStatistics`: Retrieves overall bot statistics
- `POST /trackReferral`: Tracks and rewards referrals
- `GET /getReferrals`: Fetches referral data for a user
- `GET /getUserProfilePhoto`: Fetches user's profile photo

## 💻 Web App Features
- User profile display
- Task management system
- Referral system with link generation and tracking
- Statistics view with community contributors
- Boost feature for earning additional points
- Random tips display

## 📊 Database Operations
The `database.js` file handles all database operations, including:
- Connecting to MongoDB
- Fetching and updating user data
- Adding completed tasks
- Boosting user points

## 🎨 Frontend Structure
- `index.html`: Main structure of the web app
- `style.css`: Styles for the web app, including responsive design and dark mode support
- `script.js`: General JavaScript functionality
- `user.js`: User-specific functionality, including data fetching and management
- `referrals.js`: Referral system management
- `app.js`: Main application logic, including task rendering, boost feature, and statistics display

## 🤝 Connect & Collaborate
We welcome contributions to the Infinity Web3 Crypto Bot project! Here's how you can get involved:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Join our community channels to discuss ideas, report bugs, or get help:
- Telegram: [https://t.me/Inf_bsc](https://t.me/Inf_bsc)
- Twitter: [https://twitter.com/Inf_bsc](https://twitter.com/Inf_bsc)
- GitHub: [https://github.com/nectariferous](https://github.com/nectariferous)

## 📜 License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 💖 Support My Work
If you find value in this project or want to support its development:

```
ETH: 0x3A06322e9F1124F6B2de8F343D4FDce4D1009869
Telegram: https://t.me/nectariferous 
```

## 🙏 Acknowledgements
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Node.js](https://nodejs.org/)
- [Python](https://www.python.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- All our amazing contributors and community members!
