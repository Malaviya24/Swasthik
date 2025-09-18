# 🏥 Swasthik - AI Healthcare Assistant

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21.2-000000?logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-06B6D4?logo=tailwindcss&logoColor=white)

**AI-powered healthcare assistant for rural and semi-urban communities across India**

[Live Demo](https://your-demo-link.com) • [Documentation](https://your-docs-link.com) • [Report Bug](https://github.com/your-username/swasthik/issues)

</div>

---

## ✨ Features

### 🤖 **AI Health Assistant**
- 24/7 health guidance powered by Google Gemini AI
- Multilingual support (English, Hindi, Bengali, Tamil, Telugu, Marathi)
- Voice interaction and contextual conversations

### 🔍 **Smart Health Tools**
- **Symptom Checker** - AI-powered symptom analysis with severity assessment
- **Medication Database** - Comprehensive drug information with dosage guidelines
- **Health Center Finder** - Location-based search for nearby healthcare facilities
- **Image Analysis** - Upload photos for AI-powered medical guidance

### 📱 **Modern Experience**
- Responsive design for all devices
- Progressive Web App capabilities
- Intuitive interface with accessibility features
- Health reminders and appointment tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API key
- PostgreSQL database (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/swasthik.git
cd swasthik

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
PORT=5000
```

**Get your Google Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in and create a new API key
3. Add it to your `.env` file

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, TailwindCSS, Wouter |
| **Backend** | Express.js, Node.js, TypeScript |
| **AI** | Google Gemini AI |
| **Database** | PostgreSQL, Drizzle ORM |
| **UI** | Radix UI, Framer Motion |
| **Tools** | Vite, ESBuild, Zod |

---

## 📁 Project Structure

```
swasthik/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/          # Utilities
├── server/                # Express backend
│   ├── index.ts          # Server entry
│   ├── routes.ts         # API routes
│   └── storage.ts        # Database ops
├── shared/               # Shared schemas
└── package.json          # Dependencies
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:unix         # Start dev server (Unix)

# Production
npm run build            # Build for production
npm start                # Start production server
npm start:unix           # Start production server (Unix)

# Database
npm run db:push          # Push database schema

# Utilities
npm run check            # Type checking
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send message to AI assistant |
| `POST` | `/api/analyze-image` | Analyze uploaded images |
| `POST` | `/api/analyze-symptoms` | Analyze user symptoms |
| `GET` | `/api/medications/search` | Search medication info |
| `POST` | `/api/health-centers/search` | Find healthcare facilities |

---

## 🌍 Supported Languages

- 🇬🇧 **English**
- 🇮🇳 **हिंदी (Hindi)**
- 🇧🇩 **বাংলা (Bengali)**
- 🇮🇳 **தமிழ் (Tamil)**
- 🇮🇳 **తెలుగు (Telugu)**
- 🇮🇳 **मराठी (Marathi)**

---

## ⚠️ Important Disclaimers

> **⚠️ This application provides general health information only and is not a substitute for professional medical advice. Always consult qualified healthcare professionals for medical diagnosis and treatment.**

- Not a medical diagnosis tool
- Professional consultation recommended
- For emergencies, call 108 or visit nearest hospital
- AI responses should not replace medical judgment

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Emergency**: Call 108 (India)
- **General Health**: Use the chat interface
- **Technical Issues**: [Create an issue](https://github.com/your-username/swasthik/issues)

---

<div align="center">

**🏥 Bridging Healthcare Gaps with AI Technology 🏥**

Made with ❤️ for rural and semi-urban communities across India

</div>