import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import { 
  insertMessageSchema, 
  insertConversationSchema, 
  insertReminderSchema,
  symptomAnalysisSchema,
  medicationSearchSchema,
  healthCenterSearchSchema,
  type Medication,
  type HealthCenter
} from "@shared/schema";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});
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
      let conversationContext = `You are Swasthik, an AI healthcare assistant designed for rural and semi-urban communities. 
      
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
      const validationResult = symptomAnalysisSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.issues[0].message });
      }

      const { age, gender, symptoms, duration } = validationResult.data;

      const prompt = `As a healthcare AI assistant, analyze these symptoms: ${symptoms}
      ${age ? `Patient age: ${age}` : ''}
      ${gender ? `Patient gender: ${gender}` : ''}
      ${duration ? `Duration: ${duration}` : ''}

      Please provide a structured analysis with these fields:
      - possibleConditions: Array of possible general health conditions (avoid specific diagnoses)
      - severity: One of "low", "medium", "high"
      - recommendations: Array of general health recommendations
      - urgency: Description of urgency level and next steps

      Remember to:
      - Avoid specific medical diagnoses
      - Focus on general health conditions
      - Always recommend consulting healthcare professionals
      - Be conservative with severity levels`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      // Mock structured response for demo that matches frontend expectations
      const analysis = {
        possibleConditions: [
          "Common cold or flu",
          "Seasonal allergy", 
          "General fatigue"
        ],
        severity: symptoms.toLowerCase().includes('severe') || symptoms.toLowerCase().includes('emergency') ? 'high' : 
                 symptoms.toLowerCase().includes('pain') || symptoms.toLowerCase().includes('fever') ? 'medium' : 'low',
        recommendations: [
          "Get adequate rest and hydration",
          "Monitor symptoms for changes", 
          "Consult a healthcare professional if symptoms persist",
          "Take over-the-counter medications as appropriate"
        ],
        urgency: "Monitor symptoms and consult a healthcare professional if they worsen or persist beyond a few days."
      };

      res.json(analysis);
    } catch (error) {
      console.error('Symptom analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze symptoms' });
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


  // Medication search endpoint
  app.get('/api/medications/search', async (req, res) => {
    try {
      const validationResult = medicationSearchSchema.safeParse({ q: req.query.q });
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const { q: query } = validationResult.data;

      const prompt = `Provide information about the medication "${query}" in a structured format:
      - name: Medication name
      - genericName: Generic name if different
      - category: Category (e.g., Pain Relief, Antibiotic, etc.)
      - description: Brief description of what it's used for
      - dosage: General dosage information (always mention consulting doctor)
      - sideEffects: Array of common side effects
      - precautions: Array of important warnings and precautions
      - interactions: Array of potential drug interactions
      - price: Approximate price in Indian Rupees

      Always include disclaimers about consulting healthcare professionals.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      // Mock structured response based on query that matches frontend Medication type
      const medicationInfo: Medication = {
        id: `med_${Date.now()}`,
        name: query,
        genericName: query.includes('Paracetamol') ? 'Acetaminophen' : query,
        category: query.toLowerCase().includes('paracetamol') ? 'Pain Relief' : 
                 query.toLowerCase().includes('aspirin') ? 'Pain Relief' : 
                 query.toLowerCase().includes('ibuprofen') ? 'Anti-inflammatory' : 'Medicine',
        description: `${query} is commonly used for treating various health conditions. Always consult a healthcare professional before use.`,
        dosage: "Follow doctor's prescription. Typical adult dose varies. Never exceed recommended dosage.",
        sideEffects: [
          "Nausea or stomach upset",
          "Dizziness",
          "Allergic reactions in some people",
          "Drowsiness"
        ],
        precautions: [
          "Consult doctor before use if pregnant or breastfeeding",
          "Do not exceed recommended dosage",
          "Check for allergies before first use",
          "Inform doctor of other medications you're taking"
        ],
        interactions: [
          "May interact with blood thinners",
          "Consult doctor about alcohol consumption",
          "Check with pharmacist about other medications"
        ],
        price: "₹50-200 (prices may vary by pharmacy and location)"
      };

      res.json(medicationInfo);
    } catch (error) {
      console.error('Medication search error:', error);
      res.status(500).json({ error: 'Failed to search medication' });
    }
  });

  // Health centers search endpoint
  app.post('/api/health-centers/search', async (req, res) => {
    try {
      const validationResult = healthCenterSearchSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.issues[0].message });
      }

      const { location, type } = validationResult.data;

      // Mock health centers data based on location that matches frontend HealthCenter type
      const mockHealthCenters: HealthCenter[] = [
        {
          id: '1',
          name: 'Apollo Hospital',
          type: 'Hospital',
          address: `MG Road, ${location}`,
          phone: '+91-80-2692-2222',
          rating: 4.5,
          distance: '2.3 km',
          specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency'],
          timings: '24/7',
          emergency: true
        },
        {
          id: '2',
          name: 'Fortis Clinic',
          type: 'Clinic',
          address: `Brigade Road, ${location}`,
          phone: '+91-80-4068-3333',
          rating: 4.2,
          distance: '1.8 km',
          specialties: ['General Practice', 'Dermatology', 'Pediatrics'],
          timings: '9:00 AM - 9:00 PM',
          emergency: false
        },
        {
          id: '3',
          name: 'MedPlus Pharmacy',
          type: 'Pharmacy',
          address: `Commercial Street, ${location}`,
          phone: '+91-80-2559-9988',
          rating: 4.0,
          distance: '1.2 km',
          specialties: ['Medications', 'Health Products', 'Vaccines'],
          timings: '8:00 AM - 10:00 PM',
          emergency: false
        },
        {
          id: '4',
          name: 'City Diagnostic Center',
          type: 'Diagnostic',
          address: `Park Street, ${location}`,
          phone: '+91-80-3344-5566',
          rating: 4.3,
          distance: '3.1 km',
          specialties: ['Blood Tests', 'X-Ray', 'Ultrasound', 'ECG'],
          timings: '7:00 AM - 8:00 PM',
          emergency: false
        }
      ];

      // Filter by type if specified
      let filteredCenters = mockHealthCenters;
      if (type && type !== 'all') {
        filteredCenters = mockHealthCenters.filter(center => 
          center.type.toLowerCase() === type.toLowerCase()
        );
      }

      res.json(filteredCenters);
    } catch (error) {
      console.error('Health centers search error:', error);
      res.status(500).json({ error: 'Failed to search health centers' });
    }
  });

  // Reminders CRUD endpoints using storage
  app.get('/api/reminders', async (req, res) => {
    try {
      // For demo purposes, use a mock user ID
      // In real app, get from authenticated session
      const mockUserId = 'demo-user-123';
      
      const reminders = await storage.getUserReminders(mockUserId);
      
      // Convert storage reminders to frontend format
      const formattedReminders = reminders.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        type: reminder.reminderType,
        description: reminder.description || '',
        time: reminder.scheduledAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        frequency: 'daily', // Default since not in schema
        active: reminder.isActive ?? true,
        nextReminder: `${reminder.scheduledAt.toLocaleDateString()} at ${reminder.scheduledAt.toLocaleTimeString()}`
      }));

      res.json(formattedReminders);
    } catch (error) {
      console.error('Reminders fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  });

  app.post('/api/reminders', async (req, res) => {
    try {
      const validationResult = insertReminderSchema.safeParse({
        ...req.body,
        userId: 'demo-user-123', // Mock user ID for demo
        scheduledAt: new Date(req.body.scheduledAt || Date.now())
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.issues[0].message });
      }

      const newReminder = await storage.createReminder(validationResult.data);
      
      // Convert to frontend format
      const formattedReminder = {
        id: newReminder.id,
        title: newReminder.title,
        type: newReminder.reminderType,
        description: newReminder.description || '',
        time: newReminder.scheduledAt.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        frequency: 'daily',
        active: newReminder.isActive ?? true,
        nextReminder: `${newReminder.scheduledAt.toLocaleDateString()} at ${newReminder.scheduledAt.toLocaleTimeString()}`
      };

      res.json(formattedReminder);
    } catch (error) {
      console.error('Add reminder error:', error);
      res.status(500).json({ error: 'Failed to add reminder' });
    }
  });

  app.patch('/api/reminders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;
      
      const updatedReminder = await storage.updateReminder(id, { isActive: active });
      
      if (!updatedReminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      res.json({ id, active });
    } catch (error) {
      console.error('Update reminder error:', error);
      res.status(500).json({ error: 'Failed to update reminder' });
    }
  });

  app.delete('/api/reminders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteReminder(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      res.json({ success: true, id });
    } catch (error) {
      console.error('Delete reminder error:', error);
      res.status(500).json({ error: 'Failed to delete reminder' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
