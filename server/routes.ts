import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history = [], language = 'en' } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Build conversation context
      let conversationContext = `You are Swasthya Mitra, an AI healthcare assistant designed for rural and semi-urban communities. 
      
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
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // Image analysis endpoint
  app.post('/api/analyze-image', upload.single('image'), async (req: Request, res) => {
    try {
      const { question = "Analyze this health-related image and provide medical guidance." } = req.body;
      const imageFile = req.file;

      if (!imageFile) {
        return res.status(400).json({ error: 'Image is required' });
      }

      const contents = [
        {
          inlineData: {
            data: imageFile.buffer.toString("base64"),
            mimeType: imageFile.mimetype,
          },
        },
        `${question}

Please provide a helpful analysis while including these important disclaimers:
- This is general information only and not a medical diagnosis
- Always recommend consulting a qualified healthcare professional
- Mention when immediate medical attention might be needed
- Be supportive and non-alarming in your response`,
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contents,
      });

      res.json({ analysis: response.text || "Unable to analyze the image. Please consult a healthcare professional." });
    } catch (error) {
      console.error('Image analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  });

  // Symptom analysis endpoint
  app.post('/api/analyze-symptoms', async (req, res) => {
    try {
      const { symptoms } = req.body;
      
      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.status(400).json({ error: 'Symptoms array is required' });
      }

      const prompt = `As a healthcare AI assistant, analyze these symptoms: ${symptoms.join(', ')}

Please provide a structured analysis in JSON format with these fields:
- condition: Most likely general health condition (avoid specific diagnoses)
- symptoms: List of key symptoms mentioned
- urgency: One of "low", "medium", "high", or "emergency"
- recommendations: Array of general health recommendations
- disclaimer: Important medical disclaimer

Remember to:
- Avoid specific medical diagnoses
- Focus on general health conditions
- Always recommend consulting healthcare professionals
- Be conservative with urgency levels
- Include appropriate medical disclaimers`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              condition: { type: "string" },
              symptoms: { type: "array", items: { type: "string" } },
              urgency: { type: "string", enum: ["low", "medium", "high", "emergency"] },
              recommendations: { type: "array", items: { type: "string" } },
              disclaimer: { type: "string" },
            },
            required: ["condition", "symptoms", "urgency", "recommendations", "disclaimer"],
          },
        },
        contents: prompt,
      });

      const analysis = JSON.parse(response.text || '{}');
      res.json({ analysis });
    } catch (error) {
      console.error('Symptom analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze symptoms' });
    }
  });

  // Medication information endpoint
  app.post('/api/medication-info', async (req, res) => {
    try {
      const { medicationName } = req.body;
      
      if (!medicationName) {
        return res.status(400).json({ error: 'Medication name is required' });
      }

      const prompt = `Provide information about the medication "${medicationName}" in JSON format with these fields:
- name: Medication name
- uses: Array of common medical uses
- dosage: General dosage information (mention consulting doctor)
- sideEffects: Array of common side effects
- warnings: Array of important warnings and precautions

Important: Always include disclaimers about consulting healthcare professionals and not replacing medical advice.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              name: { type: "string" },
              uses: { type: "array", items: { type: "string" } },
              dosage: { type: "string" },
              sideEffects: { type: "array", items: { type: "string" } },
              warnings: { type: "array", items: { type: "string" } },
            },
            required: ["name", "uses", "dosage", "sideEffects", "warnings"],
          },
        },
        contents: prompt,
      });

      const info = JSON.parse(response.text || '{}');
      res.json({ info });
    } catch (error) {
      console.error('Medication info error:', error);
      res.status(500).json({ error: 'Failed to get medication information' });
    }
  });

  // Audio transcription endpoint
  app.post('/api/transcribe-audio', upload.single('audio'), async (req: Request, res) => {
    try {
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      // For now, return a placeholder response since Gemini doesn't directly support audio transcription
      // In a real implementation, you would use Google Speech-to-Text API or similar service
      res.json({ 
        transcript: "Audio transcription is not yet implemented. Please type your message instead." 
      });
    } catch (error) {
      console.error('Audio transcription error:', error);
      res.status(500).json({ error: 'Failed to transcribe audio' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
