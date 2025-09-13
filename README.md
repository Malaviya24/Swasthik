# Swasthik - AI Healthcare Assistant

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?logo=react" alt="React Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.3-blue?logo=typescript" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/Express-4.21.2-green?logo=express" alt="Express Version" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.17-blue?logo=tailwindcss" alt="TailwindCSS Version" />
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-orange?logo=google" alt="Google Gemini AI" />
</div>

## 🏥 Overview

**Swasthik** (स्वास्थिक) is an AI-powered healthcare assistant designed specifically for rural and semi-urban communities across India. The application provides comprehensive health guidance, symptom analysis, medication information, and healthcare facility location services in multiple Indian languages.

## ✨ Key Features

### 🤖 AI Health Assistant
- **24/7 Health Chat**: Get instant health guidance powered by Google Gemini AI
- **Multilingual Support**: Available in English, Hindi, Bengali, Tamil, Telugu, and Marathi
- **Contextual Conversations**: Maintains conversation history for better assistance
- **Voice Interaction**: Speak your health concerns and receive voice responses

### 🔍 Symptom Analysis
- **Intelligent Symptom Checker**: Analyze symptoms with AI-powered recommendations
- **Severity Assessment**: Get urgency levels and appropriate next steps
- **Personalized Recommendations**: Tailored health advice based on symptoms
- **Medical Disclaimers**: Always includes appropriate health disclaimers

### 💊 Medication Information
- **Drug Database**: Search and get detailed information about medications
- **Dosage Guidelines**: Safe dosage recommendations with doctor consultation reminders
- **Side Effects & Interactions**: Comprehensive medication safety information
- **Price Information**: Approximate pricing in Indian Rupees

### 📍 Health Center Finder
- **Location-Based Search**: Find nearby hospitals, clinics, and healthcare facilities
- **Detailed Information**: Contact details, services, ratings, and timings
- **Emergency Services**: Quick access to emergency healthcare facilities
- **Multiple Healthcare Types**: Hospitals, clinics, pharmacies, and diagnostic centers

### 📸 Image Analysis
- **Health Image Analysis**: Upload photos for AI-powered medical guidance
- **Visual Symptom Assessment**: Analyze skin conditions, wounds, and other visible symptoms
- **Medical Image Interpretation**: Get insights from X-rays, scans, and medical images

### ⏰ Health Reminders
- **Medication Reminders**: Set reminders for medication schedules
- **Appointment Alerts**: Never miss important health appointments
- **Vaccination Reminders**: Track vaccination schedules
- **Health Checkup Alerts**: Regular health monitoring reminders

### 📱 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, modern design with easy navigation
- **Accessibility**: Designed for users with varying technical expertise
- **Progressive Web App**: Fast loading and offline capabilities

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **TypeScript 5.6.3** - Type-safe JavaScript
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **Wouter 3.3.5** - Lightweight routing
- **Framer Motion 11.13.1** - Smooth animations
- **Radix UI** - Accessible component primitives
- **React Query** - Data fetching and caching

### Backend
- **Express.js 4.21.2** - Web application framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe backend development
- **Multer** - File upload handling
- **WebSocket** - Real-time communication

### AI & Database
- **Google Gemini AI** - Advanced AI for health assistance
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Robust database system
- **Neon Database** - Serverless PostgreSQL

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESBuild** - JavaScript bundler
- **Drizzle Kit** - Database migrations
- **Zod** - Schema validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-chabot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=development
   PORT=5000
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open your browser and navigate to `http://localhost:5000`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
health-chabot/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # Base UI components (Radix UI)
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── SymptomChecker.tsx
│   │   │   └── ...
│   │   ├── pages/         # Application pages
│   │   │   ├── chat.tsx
│   │   │   ├── landing.tsx
│   │   │   └── ...
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utility libraries
│   │   └── main.tsx      # Application entry point
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route handlers
│   └── storage.ts        # Database operations
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schemas and types
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # TailwindCSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 API Endpoints

### Chat & AI
- `POST /api/chat` - Send chat message to AI assistant
- `POST /api/analyze-image` - Analyze uploaded health images
- `POST /api/analyze-symptoms` - Analyze user symptoms
- `POST /api/transcribe-audio` - Convert voice to text

### Health Services
- `GET /api/medications/search` - Search medication information
- `POST /api/health-centers/search` - Search healthcare facilities
- `POST /api/find-health-centers` - Find nearby health centers

### Reminders
- `GET /api/reminders` - Get user reminders
- `POST /api/reminders` - Create new reminder
- `PATCH /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

## 🌐 Supported Languages

- **English** 🇬🇧
- **हिंदी (Hindi)** 🇮🇳
- **বাংলা (Bengali)** 🇧🇩
- **தமிழ் (Tamil)** 🇮🇳
- **తెలుగు (Telugu)** 🇮🇳
- **मराठी (Marathi)** 🇮🇳

## 🎯 Target Audience

- **Rural Communities**: Accessible healthcare information for underserved areas
- **Semi-Urban Areas**: Bridge the gap between rural and urban healthcare
- **Multilingual Users**: Native language support for better understanding
- **Mobile-First Users**: Optimized for smartphone usage
- **Healthcare Seekers**: General health information and guidance

## ⚠️ Important Disclaimers

- **Not a Medical Diagnosis**: This application provides general health information only
- **Professional Consultation**: Always consult qualified healthcare professionals for medical advice
- **Emergency Situations**: For medical emergencies, call 108 or visit the nearest hospital
- **Data Privacy**: User health data is handled with strict privacy measures
- **AI Limitations**: AI responses should not replace professional medical judgment

## 🔒 Security & Privacy

- **Data Encryption**: All data transmission is encrypted
- **User Privacy**: No personal health data is stored permanently
- **Secure Authentication**: Firebase-based user authentication
- **API Security**: Protected API endpoints with proper validation
- **File Upload Security**: Secure file handling with type validation

## 🚀 Deployment

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_connection_string
NODE_ENV=production
PORT=5000
```

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Emergency**: Call 108 (India)
- **General Health**: Use the chat interface
- **Technical Issues**: Create an issue in the repository

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced language processing
- **Radix UI** for accessible component primitives
- **TailwindCSS** for utility-first styling
- **React Community** for excellent tooling and libraries
- **Indian Healthcare Community** for inspiration and guidance

---

<div align="center">
  <strong>🏥 Swasthik - Bridging Healthcare Gaps with AI Technology 🏥</strong>
</div>
