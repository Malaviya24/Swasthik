# Swasthik Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Frontend
```bash
npm run build
```

### 3. Set Environment Variables
Create a `.env` file in the root directory:
```env
# Google Gemini AI API Key (Required for AI chat)
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration (Optional for demo)
DATABASE_URL=your_database_connection_string_here

# Server Configuration
NODE_ENV=development
PORT=5000
```

### 4. Get Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 5. Run the Application
```bash
npm run dev
```

## 🔧 Troubleshooting

### Error: "Could not find the build directory"
**Solution**: Run `npm run build` first

### Error: "EADDRINUSE: address already in use"
**Solution**: 
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID [process_id] /F

# Or use different port
set PORT=3000 && npm run dev
```

### Error: "ENOTSUP: operation not supported on socket"
**Solution**: This is fixed in the current version

### Error: "PERMISSION_DENIED" from Google API
**Solution**: 
1. Get a valid Google Gemini API key
2. Add it to your `.env` file
3. Restart the server

## 🎯 Demo Mode

If you don't have a Google Gemini API key, the app will run in demo mode with:
- Basic health information
- Symptom checking (mock responses)
- Medication information
- Health center finder
- All UI features working

## 📱 Access the App

Once running, visit: `http://localhost:5000`

## 🛠️ Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check
```
