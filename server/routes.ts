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

  // Health center finder endpoint
  app.post('/api/find-health-centers', async (req, res) => {
    try {
      const { latitude, longitude, radius = 5000 } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      // Mock health centers data for demo - in real implementation would use Google Places API
      const mockHealthCenters = [
        {
          id: '1',
          name: 'Primary Health Centre - Sector 21',
          address: 'Sector 21, Phase II, Dwarka, New Delhi, 110075',
          phone: '+91-11-25082547',
          type: 'Primary Health Centre',
          distance: 1.2,
          rating: 4.2,
          services: ['General Medicine', 'Pediatrics', 'Emergency Care', 'Vaccination'],
          hours: 'Mon-Sun: 24 hours',
          coordinates: { lat: latitude + 0.01, lng: longitude + 0.01 }
        },
        {
          id: '2',
          name: 'Community Health Centre - Najafgarh',
          address: 'Najafgarh Road, New Delhi, 110043',
          phone: '+91-11-25387642',
          type: 'Community Health Centre',
          distance: 2.8,
          rating: 4.0,
          services: ['General Medicine', 'Gynecology', 'Surgery', 'Laboratory'],
          hours: 'Mon-Sat: 8:00 AM - 8:00 PM',
          coordinates: { lat: latitude - 0.02, lng: longitude + 0.015 }
        },
        {
          id: '3',
          name: 'District Hospital - Janakpuri',
          address: 'A-4, Janakpuri, New Delhi, 110058',
          phone: '+91-11-25520188',
          type: 'District Hospital',
          distance: 4.5,
          rating: 4.5,
          services: ['Emergency Care', 'ICU', 'Surgery', 'Cardiology', 'Oncology'],
          hours: 'Mon-Sun: 24 hours',
          coordinates: { lat: latitude + 0.03, lng: longitude - 0.02 }
        }
      ];

      // Filter by radius and sort by distance
      const nearbyHealthCenters = mockHealthCenters
        .filter(center => center.distance * 1000 <= radius)
        .sort((a, b) => a.distance - b.distance);

      res.json({ 
        healthCenters: nearbyHealthCenters,
        userLocation: { latitude, longitude },
        searchRadius: radius
      });
    } catch (error) {
      console.error('Health center finder error:', error);
      res.status(500).json({ error: 'Failed to find health centers' });
    }
  });

  // Audio transcription endpoint
  app.post('/api/transcribe-audio', upload.single('audio'), async (req: Request, res) => {
    try {
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      // Since we don't have Google Speech-to-Text API setup, provide a functional fallback
      // that simulates realistic transcription for demo purposes
      const commonHealthPhrases = [
        "I have been experiencing headache and fever since yesterday",
        "My stomach has been hurting after meals",
        "I need information about blood pressure medication",
        "Can you help me find a nearby clinic",
        "What should I do for a persistent cough",
        "I want to check my symptoms",
        "Please provide first aid instructions"
      ];

      // Return a random realistic health-related phrase for demo
      const randomTranscript = commonHealthPhrases[Math.floor(Math.random() * commonHealthPhrases.length)];
      
      res.json({ 
        transcript: randomTranscript,
        note: "Demo mode: Audio transcription simulated with common health queries"
      });
    } catch (error) {
      console.error('Audio transcription error:', error);
      res.status(500).json({ error: 'Failed to transcribe audio' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
