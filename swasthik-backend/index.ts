// Vercel serverless function entry point
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { type Request, Response, NextFunction } from "express";

// Debug environment variables
console.log('Environment variables loaded:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('LOCATIONIQ_API_KEY:', process.env.LOCATIONIQ_API_KEY ? 'SET' : 'NOT SET');
console.log('NEWSDATA_API_KEY:', process.env.NEWSDATA_API_KEY ? 'SET' : 'NOT SET');
console.log('SPEECHMATICS_API_KEY:', process.env.SPEECHMATICS_API_KEY ? 'SET' : 'NOT SET');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      // Provide helpful responses based on user input
      const userMessage = message.toLowerCase();
      
      if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('namaste')) {
        return res.json({ 
          response: `🙏 Namaste! I'm Swasthik, your AI healthcare assistant. 

I'm your AI healthcare assistant. I can help you with health information and guidance.

What health concern can I help you with today?` 
        });
      }
      
      if (userMessage.includes('fever') || userMessage.includes('temperature')) {
        return res.json({ 
          response: `🌡️ **Fever Management (Demo Response)**

**General Guidelines:**
• Rest and stay hydrated
• Monitor temperature regularly
• Use cool compresses
• Take paracetamol if needed (follow dosage instructions)

**When to seek medical help:**
• Fever above 103°F (39.4°C)
• Fever lasting more than 3 days
• Severe headache or neck stiffness
• Difficulty breathing

⚠️ **Important**: This is general information only. Always consult a healthcare professional for proper diagnosis and treatment.

*To enable full AI chat with personalized responses, get a Google Gemini API key from https://aistudio.google.com/*` 
        });
      }
      
      // Default demo response
      return res.json({ 
        response: `🙏 Namaste! I'm Swasthik, your AI healthcare assistant. 

I can help you with health information about:

• **Fever & Temperature** - Ask about fever management
• **Headaches** - Ask about headache relief
• **Cough & Cold** - Ask about respiratory symptoms  
• **Stomach Issues** - Ask about digestive problems
• **General Health** - Ask about wellness tips

**To enable full AI chat with personalized responses:**
1. Get a Google Gemini API key from https://aistudio.google.com/
2. Set the GEMINI_API_KEY environment variable
3. Restart the server

What health concern can I help you with today?` 
      });
    }

    // Use Gemini AI for full chat functionality
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const conversationContext = `You are Swasthik, an AI healthcare assistant designed for rural and semi-urban communities. 
      
Your key responsibilities:
- Provide accurate, helpful health information in simple language
- Always include medical disclaimers when giving health advice
- Suggest consulting healthcare professionals for serious concerns
- Be culturally sensitive and respectful
- Respond in ${language === 'en' ? 'English' : 'the requested language'}
- Focus on preventive healthcare and general wellness

Important guidelines:
- Never provide specific medical diagnoses
- Always recommend consulting qualified healthcare professionals
- Include appropriate disclaimers about the limitations of AI health advice
- Be empathetic and supportive
- Provide practical, actionable advice when appropriate

Previous conversation:
${history.slice(-5).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

User's current message: ${message}

Respond helpfully and safely:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversationContext,
      });

      res.json({ response: response.text || "I apologize, but I couldn't process your request. Please try again." });
    } catch (aiError) {
      console.error('AI chat error:', aiError);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error('Error:', err);
});

// Export the app for Vercel
export default app;