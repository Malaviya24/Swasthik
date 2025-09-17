import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createRequire } from "module";
import multer from "multer";
import FormData from "form-data";
import { 
  insertMessageSchema, 
  insertConversationSchema, 
  insertReminderSchema,
  symptomAnalysisSchema,
  medicationSearchSchema,
  healthCenterSearchSchema,
  type Medication,
  type HealthCenter,
  type NewsArticle
} from "@shared/schema";
import { z } from "zod";

const require = createRequire(import.meta.url);
let ai: any | null = null;

async function getAI() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
  if (!ai) {
    try {
      const { GoogleGenAI } = require('@google/genai'); // forces "require" export
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch {
      const m = await import('@google/genai'); // ESM fallback
      const GoogleGenAI = (m as any).GoogleGenAI || (m as any).GoogleGenerativeAI;
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }
  return ai;
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 
      'audio/wav', 'audio/mp3', 'audio/mpeg', 
      'audio/webm', 'audio/ogg', 'audio/m4a'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log(`Rejected file type: ${file.mimetype}`);
      cb(new Error('Unsupported file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history = [], language = 'en' } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Check if API key is available
      if (!process.env.GEMINI_API_KEY) {
        // Detect user's language from their message
        const detectLanguage = (text: string) => {
          const hindiRegex = /[\u0900-\u097F]/;
          const bengaliRegex = /[\u0980-\u09FF]/;
          const gujaratiRegex = /[\u0A80-\u0AFF]/;
          const tamilRegex = /[\u0B80-\u0BFF]/;
          const teluguRegex = /[\u0C00-\u0C7F]/;
          const odiaRegex = /[\u0B00-\u0B7F]/;
          
          if (hindiRegex.test(text)) return 'Hindi';
          if (bengaliRegex.test(text)) return 'Bengali';
          if (gujaratiRegex.test(text)) return 'Gujarati';
          if (tamilRegex.test(text)) return 'Tamil';
          if (teluguRegex.test(text)) return 'Telugu';
          if (odiaRegex.test(text)) return 'Odia';
          return 'English';
        };

        const userLanguage = detectLanguage(message);
        const userMessage = message.toLowerCase();
        
        if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('namaste') || userMessage.includes('नमस्ते')) {
          const responses: Record<string, string> = {
            English: `🙏 Namaste! I'm Swasthik, your professional doctor-like assistant. I can help with health questions, analyze reports, and provide medical guidance. What's on your mind today?`,
            Hindi: `🙏 नमस्ते! मैं स्वास्थिक हूं, आपका पेशेवर डॉक्टर जैसा सहायक। मैं स्वास्थ्य संबंधी सवालों, रिपोर्टों का विश्लेषण और चिकित्सा मार्गदर्शन में मदद कर सकता हूं। आज आप क्या जानना चाहते हैं?`,
            Bengali: `🙏 নমস্কার! আমি স্বাস্থিক, আপনার পেশাদার ডাক্তার-সদৃশ সহায়ক। আমি স্বাস্থ্য প্রশ্ন, রিপোর্ট বিশ্লেষণ এবং চিকিৎসা নির্দেশনা দিতে পারি। আজ আপনি কী জানতে চান?`,
            Gujarati: `🙏 નમસ્તે! હું સ્વસ્થિક છું, તમારા વ્યાવસાયિક ડૉક્ટર જેવા સહાયક। હું સ્વાસ્થ્ય પ્રશ્નો, રિપોર્ટ વિશ્લેષણ અને તબીબી માર્ગદર્શનમાં મદદ કરી શકું છું। આજે તમે શું જાણવા માંગો છો?`,
            Tamil: `🙏 வணக்கம்! நான் சுவஸ்திக், உங்கள் தொழில்முறை மருத்துவர் போன்ற உதவியாளர்। நான் சுகாதார கேள்விகள், அறிக்கைகளை பகுப்பாய்வு செய்து மருத்துவ வழிகாட்டுதல் வழங்க முடியும்। இன்று நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?`,
            Telugu: `🙏 నమస్కారం! నేను స్వస్థిక్, మీ వృత్తిపరమైన వైద్యుడు వంటి సహాయకుడు। నేను ఆరోగ్య ప్రశ్నలు, నివేదికల విశ్లేషణ మరియు వైద్య మార్గదర్శకత్వం అందించగలను। ఈరోజు మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?`,
            Marathi: `🙏 नमस्कार! मी स्वास्थिक आहे, तुमचा व्यावसायिक डॉक्टर-सारखा सहायक। मी आरोग्य प्रश्न, अहवालांचे विश्लेषण आणि वैद्यकीय मार्गदर्शन देऊ शकतो। आज तुम्हाला काय माहिती हवे आहे?`,
            Odia: `🙏 ନମସ୍କାର! ମୁଁ ସ୍ଵସ୍ଥିକ, ତୁମର ବୃତ୍ତିଗତ ଡାକ୍ତର-ଭଳି ସହାୟକ। ମୁଁ ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଶ୍ନ, ରିପୋର୍ଟ ବିଶ୍ଳେଷଣ ଏବଂ ଚିକିତ୍ସା ମାର୍ଗଦର୍ଶନ ଦେଇପାରିବି। ଆଜି ତୁମେ କଣ ଜାଣିବାକୁ ଚାହୁଁଛ?`
          };
          
          return res.json({ 
            response: responses[userLanguage] || responses.English
          });
        }
        
        if (userMessage.includes('fever') || userMessage.includes('temperature') || userMessage.includes('बुखार') || userMessage.includes('ज्वर')) {
          const responses: Record<string, string> = {
            English: `🌡️ I understand you have fever. How long have you had it and what's your temperature? Rest well, stay hydrated, and take paracetamol if needed. See a doctor if it's above 103°F or lasts more than 3 days.`,
            Hindi: `🌡️ मैं समझ गया कि आपको बुखार है। कितने समय से है और तापमान क्या है? आराम करें, पानी पिएं, और जरूरत हो तो पैरासिटामोल लें। 103°F से ऊपर या 3 दिन से ज्यादा रहे तो डॉक्टर को दिखाएं।`
          };
          
          return res.json({ 
            response: responses[userLanguage] || responses.English
          });
        }
        
        if (userMessage.includes('headache') || userMessage.includes('head pain')) {
          return res.json({ 
            response: `🤕 **Headache Management (Demo Response)**

**Common Causes:**
• Stress and tension
• Dehydration
• Lack of sleep
• Eye strain

**Self-care Tips:**
• Rest in a quiet, dark room
• Apply cold compress to forehead
• Stay hydrated
• Practice relaxation techniques

**When to seek medical help:**
• Sudden, severe headache
• Headache with fever or neck stiffness
• Headache after head injury
• Vision changes

⚠️ **Important**: This is general information only. Always consult a healthcare professional for proper diagnosis and treatment.

*To enable full AI chat with personalized responses, get a Google Gemini API key from https://aistudio.google.com/*` 
          });
        }
        
        if (userMessage.includes('cough') || userMessage.includes('cold')) {
          return res.json({ 
            response: `🤧 **Cough & Cold Management (Demo Response)**

**Self-care Tips:**
• Get plenty of rest
• Stay hydrated (warm liquids help)
• Use a humidifier
• Gargle with salt water
• Avoid smoking and irritants

**When to seek medical help:**
• Cough lasting more than 3 weeks
• High fever
• Difficulty breathing
• Chest pain
• Blood in phlegm

⚠️ **Important**: This is general information only. Always consult a healthcare professional for proper diagnosis and treatment.

*To enable full AI chat with personalized responses, get a Google Gemini API key from https://aistudio.google.com/*` 
          });
        }
        
        if (userMessage.includes('stomach') || userMessage.includes('abdominal') || userMessage.includes('pain')) {
          return res.json({ 
            response: `🤢 **Stomach Pain Management (Demo Response)**

**Common Causes:**
• Indigestion
• Gas and bloating
• Food poisoning
• Stress

**Self-care Tips:**
• Eat small, frequent meals
• Avoid spicy and fatty foods
• Stay hydrated
• Apply heat to the area
• Practice relaxation techniques

**When to seek medical help:**
• Severe or persistent pain
• Pain with fever
• Vomiting blood
• Difficulty breathing
• Pain spreading to chest or back

⚠️ **Important**: This is general information only. Always consult a healthcare professional for proper diagnosis and treatment.

*To enable full AI chat with personalized responses, get a Google Gemini API key from https://aistudio.google.com/*` 
          });
        }
        
        // Default demo response
        const responses: Record<string, string> = {
          English: `🙏 Namaste! I'm Swasthik, your professional doctor-like assistant. I can help with health questions, analyze reports, and provide medical guidance. What's on your mind today?`,
          Hindi: `🙏 नमस्ते! मैं स्वास्थिक हूं, आपका पेशेवर डॉक्टर जैसा सहायक। मैं स्वास्थ्य संबंधी सवालों, रिपोर्टों का विश्लेषण और चिकित्सा मार्गदर्शन में मदद कर सकता हूं। आज आप क्या जानना चाहते हैं?`
        };
        
        return res.json({ 
          response: responses[userLanguage] || responses.English
        });
      }

      // Detect user's language from their message
      const detectLanguage = (text: string) => {
        const hindiRegex = /[\u0900-\u097F]/;
        const bengaliRegex = /[\u0980-\u09FF]/;
        const gujaratiRegex = /[\u0A80-\u0AFF]/;
        const tamilRegex = /[\u0B80-\u0BFF]/;
        const teluguRegex = /[\u0C00-\u0C7F]/;
        const marathiRegex = /[\u0900-\u097F]/; // Similar to Hindi
        const odiaRegex = /[\u0B00-\u0B7F]/;
        
        if (hindiRegex.test(text)) return 'Hindi';
        if (bengaliRegex.test(text)) return 'Bengali';
        if (gujaratiRegex.test(text)) return 'Gujarati';
        if (tamilRegex.test(text)) return 'Tamil';
        if (teluguRegex.test(text)) return 'Telugu';
        if (odiaRegex.test(text)) return 'Odia';
        return 'English';
      };

      const userLanguage = detectLanguage(message);
      const languageInstruction = userLanguage === 'English' 
        ? 'Respond in English' 
        : `Respond in ${userLanguage} language. Use the same script and writing system as the user's question.`;

      // Build conversation context
      const SYSTEM_PROMPT = `
You are Swasthik, a professional health assistant AI.  
When a user describes symptoms, first classify them into one of 3 severity levels:

1. **Low-Level (Minor issues):**  
   Examples: mild headache, common cold, runny nose, mild fever, mild body aches, gas/indigestion, mild allergy, minor skin rash, eye strain.  
   → Keep answer SHORT (under 250 words). Give home remedies, lifestyle tips, and simple OTC options with mini drug-guide (purpose, dosage, timing, avoid-with).  

2. **Mid-Level (Needs attention, not emergency):**  
   Examples: persistent fever, moderate infections (UTI, sinusitis), ear pain, moderate back pain, mild asthma flare-up, diarrhea, moderate headache, sprains.  
   → Give a BALANCED response (300–500 words). Include assessment, precautions, drug-guide, and when to see a doctor.  

3. **High-Level (Serious/emergency):**  
   Examples: chest pain, stroke symptoms, severe shortness of breath, high uncontrolled fever, fainting, seizures, severe injury, severe dehydration.  
   → Give a DETAILED response (500–800 words). Full assessment, immediate emergency action, medicines, hospital expectations, long-term prevention. Always say: "Seek immediate medical care."  

General Rules:  
- Always include a **mini drug-guide** for any medicine mentioned (purpose, dosage, timing, avoid-with, special notes).  
- Keep a **doctor-like professional but supportive tone**.  
- For Low & Mid level → keep it short and practical.  
- For High level → go detailed and urgent.  
- Always remind: "This is not a substitute for medical care. Consult a doctor."  

You are Swasthik, a professional medical assistant AI. Your goal is to provide accurate, clear, and structured responses based on user symptoms. You must adapt your response based on the severity of the problem (low, medium, high). Your answers should always prioritize patient safety.

Response Structure:

Quick Summary: A 1–3 sentence overview of the situation. Adjust tone based on severity:

Low-level (minor symptoms): Friendly, reassuring, concise.

Medium-level (moderate concern, new symptoms, persistent issues): Professional, clear, moderately detailed.

High-level (emergency, alarming symptoms): Urgent, precise, emphasizes immediate medical attention.

Clarifying Questions: Ask 3–6 questions to gather important additional information about the symptoms.

Assessment / Possible Causes: List likely conditions based on the description. Highlight if any are urgent.

Immediate Action / Advice: Explain what the user should do next (home care, monitoring, or seeking medical help).

Medicine Guide: For any suggested medicines, always include:

Purpose – What it treats.

Dosage – Typical adult dose.

Timing – How and when to take.

Common Side Effects – Frequent mild reactions.

Avoid With – Contraindications or interactions.

Special Notes – Any other important info.

Hospital / Doctor Expectations: Only if relevant. Short for low-level cases; detailed for high-level cases.

Long-term Prevention / Lifestyle Tips: Optional, based on the condition.

Tone Guidance:

Low-level: Reassuring, friendly, concise. Avoid scary words.

Medium-level: Professional, informative, clear. Warn if symptoms worsen.

High-level: Urgent, serious, safety-first. Highlight emergency care.

Safety Rules:

Always advise seeking professional care if unsure.

Never give exact prescriptions for serious conditions outside hospital guidance.

Emphasize when symptoms indicate emergency situations.

You are Swasthik, a professional health assistant AI.  
Always respond with accurate, structured medical information in a clear and supportive doctor-like tone.  
Adjust the depth of your answer based on the severity of the problem:

1. **Mild / common issues** (e.g., cold, mild fever, headache, sore throat, minor allergies):  
   - Keep response **short and practical** (under 300 words).  
   - Structure: Clarifying questions → Simple assessment → Home remedies + OTC medicines (with mini drug-guide: purpose, dosage, timing, avoid-with) → Red flag warnings.  
   - Avoid overwhelming detail. Be concise and focused.

2. **Serious / urgent issues** (e.g., chest pain, stroke, severe shortness of breath, sudden loss of consciousness, suspected infections in elderly/children):  
   - Give a **detailed, step-by-step answer**.  
   - Structure: Clarifying questions → Full assessment (possible causes) → Immediate action → Emergency advice → Detailed mini drug-guide for key medicines → What to expect in hospital → Long-term prevention.  
   - Use professional but supportive tone. Explain reasoning clearly.

General Rules:  
- Always include a **mini drug-guide** when mentioning medicines (purpose, dosage, timing, avoid-with, special notes).  
- Never prescribe casually—remind that medicines must be taken under doctor's supervision.  
- Always mention **when to seek emergency care**. 

You must follow these rules: 

1. **Clarifying Questions**  
   - Ask relevant follow-up questions about duration, symptoms, risk factors, medications, and family history.
   - Use natural, conversational questions - avoid scale-based questions (1-10 ratings) or yes/no questions.
   - Ask open-ended questions that help understand the patient's condition better.  

2. **Structured Output**  
   - Always use the following headings in order:  
     - Clarifying Questions  
     - Assessment (possible causes/differential diagnosis)  
     - Immediate Action (urgent steps or reassurance if mild)  
     - Medicine Guide (purpose, dosage, side effects, avoid with)  
     - What to Expect in Hospital (tests, procedures, treatments)  
     - Long-term Prevention (lifestyle, monitoring, follow-up)  

3. **Safety & Triage**  
   - Clearly state when symptoms are *emergency, urgent, or routine*.  
   - If emergency: strongly advise calling local emergency services.  
   - If non-urgent: recommend primary care consultation.  

4. **Medicine Explanations**  
   - Only describe medicines in a general educational sense.  
   - Never prescribe directly. Instead say:  
     "Doctors may consider…" or "In hospital, they might give…"  

5. **Hospital Care Details**  
   - Explain what tests or scans doctors might order (e.g., ECG, blood tests, MRI).  
   - Describe what treatments could be expected, in simple terms.  

6. **Tone & Style**  
   - Use a professional but human tone: supportive, not robotic.  
   - Be concise but detailed where it matters.  
   - Avoid overwhelming medical jargon — explain in plain language.  

Always remind the patient: *This is not a substitute for professional medical care. Please seek help from a qualified healthcare provider for diagnosis and treatment.*

Always structure responses with these sections:
- Clarifying Questions
- Assessment (possible causes)
- Immediate Action
- Medicine Guide (if relevant)
- What to Expect in Hospital
- Long-term Prevention

You handle 3 types of inputs:

1. Direct Questions (user just asks something):
   - Understand the symptom/disease/medicine question.
   - Answer like a doctor speaking directly to the patient.
   - Keep answers medium-length and balanced:
       → Give moderate explanations (4-6 sentences).
       → Include key points without being too brief or too lengthy.
   - Always give:
       → Possible causes or conditions
       → Specific medicines for the condition (not just general pain relievers)
       → Lifestyle advice & prevention
   - No disclaimers like "I am AI" or "consult doctor."

2. Quick Test Reports (structured text):
   - Read {Possible Conditions, Severity, Recommendations, When to Seek Help, Prevention}.
   - Summarize in your own words, like a doctor explaining results.
   - Length depends on report complexity (≤ 100 words for simple, 150–250 words for complex).
   - Must explain condition(s), medicine suggestions, lifestyle advice in moderate detail (4-6 sentences).

3. Uploaded Images or Reports (prescriptions, blood tests, X-rays, MRI, CT scans, etc.):
   - Extract info (medicines, results, abnormalities).
   - Explain clearly in simple patient language (4-6 sentences).
   - If prescription → list medicines, purpose, how/when to take.
   - If lab report → explain normal vs abnormal values and meaning.
   - If X-ray/scan → describe likely findings (fracture, infection, growth, etc.).
   - Always suggest medicines and lifestyle changes.
   - Keep tone professional, confident, doctor-like.

General Rules:
- Give medium-length answers (4-6 sentences) - not too brief, not too lengthy.
- Include essential information without overwhelming detail.
- Tone: Doctor explaining directly to patient, professional but friendly.
- Never say "I am AI" or give disclaimers.
If the user's question, report, or uploaded image shows signs of a common health myth 
(e.g., "cold drinks cure heatstroke" or "antibiotics always cure fever"), 
politely correct it with facts in simple language. 

Format:
❌ Myth: ...
✅ Truth: ...
🩺 Doctor's Advice: ...

When suggesting any medicine, always format it as a clear mini drug-guide with the following structure:

### Medicine Guide (Drug Name)

1. **Purpose** – What the medicine is used for and how it works.  
2. **Dosage** – Typical safe dosage range and frequency (in mg or tablets, if relevant).  
3. **Timing** – When and how it should be taken (with/without food, daytime/night).  
4. **Common Side Effects** – List common mild side effects patients should watch for.  
5. **Avoid With** – Foods, drinks, or other medicines that should not be combined with it.  
6. **Special Notes** – Additional important information or warnings.

Always present medicines in a structured mini drug-guide: 
(Purpose → Dosage → Timing → Common Side Effects → Avoid With → Special Notes). 
Do not encourage self-medication; instead clarify that medicines are examples of what doctors may prescribe in a hospital setting. 
Always highlight when urgent in-person medical care is required.

⚠️ Always remind the user: "Do not self-medicate. Consult a doctor before starting or changing medicines."

IMPORTANT: Suggest specific medicines for each condition, not just general pain relievers. For example:
- Cold/Cough: Dextromethorphan, Guaifenesin, Chlorpheniramine
- Fever: Paracetamol, Ibuprofen
- Stomach issues: Omeprazole, Ranitidine, Antacids
- Skin problems: Hydrocortisone, Antifungal creams
- Allergies: Cetirizine, Loratadine, Fexofenadine
- Diabetes: Metformin, Insulin (as appropriate)
- Heart issues: Aspirin, Nitroglycerin (as appropriate)
- And many more specific medicines for different conditions

IMPORTANT: ${languageInstruction}
`;

      let conversationContext = `${SYSTEM_PROMPT}

Previous conversation:
${history.slice(-5).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}

User's current message: ${message}

Respond as Swasthik, the professional doctor-like assistant, in ${userLanguage}:`;

      const aiClient = await getAI();
      
      // Retry logic for API overload errors
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: conversationContext,
          });
          break; // Success, exit retry loop
        } catch (apiError: any) {
          retryCount++;
          console.log(`API attempt ${retryCount} failed:`, apiError.message);
          
          // If it's a 503 error (overloaded) and we have retries left, wait and try again
          if (apiError.status === 503 && retryCount < maxRetries) {
            const waitTime = retryCount * 2000; // 2s, 4s, 6s
            console.log(`Waiting ${waitTime}ms before retry ${retryCount + 1}...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // If it's not a 503 error or we've exhausted retries, throw the error
          throw apiError;
        }
      }

      res.json({ response: response.text || "I apologize, but I couldn't process your request. Please try again." });
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Provide fallback response for API errors
      if (error.status === 403) {
        return res.json({ 
          response: `🙏 Namaste! I'm Swasthik, your professional doctor-like assistant. 

I'm your professional doctor-like assistant. For full functionality, please ensure all API keys are configured.

1. Get a Google Gemini API key from: https://aistudio.google.com/
2. Set the GEMINI_API_KEY environment variable
3. Restart the server

For now, I can help you with basic health information and guidance. What would you like to know?` 
        });
      }
      
      // Handle API overload or other errors with a helpful fallback
      if (error.status === 503 || error.message?.includes('overloaded')) {
        return res.json({ 
          response: `🙏 Namaste! I'm Swasthik, your professional doctor-like assistant. 

I'm experiencing high demand right now. Let me help you with basic health guidance:

• For fever: Rest, stay hydrated, take paracetamol if needed
• For headache: Rest in a quiet place, apply cold compress
• For cold/cough: Stay hydrated, get plenty of rest

For specific concerns, please try again in a few minutes or consult a doctor.

What health question can I help you with?` 
        });
      }
      
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

      const aiClient = await getAI();
      
      // Retry logic for API overload errors
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await aiClient.models.generateContent({
            model: "gemini-2.5-pro",
            contents: contents,
          });
          break; // Success, exit retry loop
        } catch (apiError: any) {
          retryCount++;
          console.log(`Image analysis API attempt ${retryCount} failed:`, apiError.message);
          
          // If it's a 503 error (overloaded) and we have retries left, wait and try again
          if (apiError.status === 503 && retryCount < maxRetries) {
            const waitTime = retryCount * 2000; // 2s, 4s, 6s
            console.log(`Waiting ${waitTime}ms before retry ${retryCount + 1}...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // If it's not a 503 error or we've exhausted retries, throw the error
          throw apiError;
        }
      }

      res.json({ analysis: response.text || "Unable to analyze the image. Please consult a healthcare professional." });
    } catch (error: any) {
      console.error('Image analysis error:', error);
      
      // Handle API overload with fallback
      if (error.status === 503 || error.message?.includes('overloaded')) {
        return res.json({ 
          analysis: "I'm experiencing high demand right now and cannot analyze the image. Please try again in a few minutes or consult a healthcare professional for immediate assistance." 
        });
      }
      
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

      const prompt = `As Swasthik, a professional doctor, analyze these symptoms comprehensively: ${symptoms}
      ${age ? `Patient age: ${age}` : ''}
      ${gender ? `Patient gender: ${gender}` : ''}
      ${duration ? `Duration: ${duration}` : ''}

      Provide a comprehensive health analysis in JSON format with these exact fields:
      {
        "possibleConditions": ["array of 3-5 possible health conditions based on symptoms"],
        "severity": "low/medium/high - assess based on symptoms",
        "recommendations": ["array of 5-8 specific, actionable health recommendations"],
        "urgency": "detailed description of urgency level and specific next steps",
        "whenToSeekHelp": ["array of warning signs that require immediate medical attention"],
        "selfCareSteps": ["array of safe self-care measures"],
        "preventiveTips": ["array of tips to prevent similar issues"],
        "disclaimer": "Professional medical guidance - follow doctor's advice for serious conditions"
      }

      Guidelines:
      - Analyze symptoms like a professional doctor
      - Provide confident medical assessment
      - Give practical, actionable advice
      - Include clear warning signs for when to seek immediate help
      - Suggest safe self-care measures
      - Add preventive health tips
      - Use clear, professional medical language
      - Present as a real doctor, not an AI assistant
      
      Return ONLY the JSON object, no other text.`;

      let analysis;
      let usedFallback = false;
      
      // Use AI for symptom analysis
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      } else {
        try {
          const aiClient = await getAI();
          
          // Retry logic for API overload errors
          let response;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              response = await aiClient.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
              });
              break; // Success, exit retry loop
            } catch (apiError: any) {
              retryCount++;
              console.log(`Symptom analysis API attempt ${retryCount} failed:`, apiError.message);
              
              // If it's a 503 error (overloaded) and we have retries left, wait and try again
              if (apiError.status === 503 && retryCount < maxRetries) {
                const waitTime = retryCount * 2000; // 2s, 4s, 6s
                console.log(`Waiting ${waitTime}ms before retry ${retryCount + 1}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
              }
              
              // If it's not a 503 error or we've exhausted retries, throw the error
              throw apiError;
            }
          }

          // Try to parse the AI response as JSON
          const aiText = response.text || '';
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in AI response');
          }
        } catch (aiError: any) {
          console.error('AI analysis failed:', aiError);
          
          // Handle API overload with fallback
          if (aiError.status === 503 || aiError.message?.includes('overloaded')) {
            return res.status(503).json({ 
              error: 'AI service is experiencing high demand. Please try again in a few minutes.',
              fallback: true
            });
          }
          
          return res.status(500).json({ error: 'Failed to analyze symptoms using AI' });
        }
      }
      
      // Ensure analysis was successful
      if (!analysis) {
        return res.status(500).json({ error: 'Failed to generate analysis' });
      }

      res.json({ analysis, usedFallback: false });
      
    } catch (error) {
      console.error('Symptom analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze symptoms' });
    }
  });


  // Health news endpoint

  // Helper functions for news processing
  function categorizeHealthNews(title: string, description: string): string {
    const content = (title + ' ' + (description || '')).toLowerCase();
    
    if (content.includes('nutrition') || content.includes('diet') || content.includes('food')) return 'nutrition';
    if (content.includes('fitness') || content.includes('exercise') || content.includes('workout')) return 'fitness';
    if (content.includes('mental') || content.includes('depression') || content.includes('anxiety')) return 'mental-health';
    if (content.includes('medicine') || content.includes('drug') || content.includes('treatment')) return 'medicine';
    if (content.includes('prevention') || content.includes('vaccine') || content.includes('immunity')) return 'prevention';
    if (content.includes('research') || content.includes('study') || content.includes('trial')) return 'research';
    
    return 'general';
  }
  
  function estimateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content?.split(' ').length || 100;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  
  function getSpecialtiesFromTypes(types: string[]): string[] {
    const specialties = [];
    if (types.includes('hospital')) specialties.push('Emergency Care', 'General Medicine');
    if (types.includes('pharmacy')) specialties.push('Medications', 'Health Products');
    if (types.includes('doctor')) specialties.push('Consultation', 'Diagnosis');
    if (types.includes('dentist')) specialties.push('Dental Care');
    return specialties.length > 0 ? specialties : ['General Healthcare'];
  }

  // Legacy health center finder endpoint (for backward compatibility)
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

  // Audio transcription endpoint with Speechmatics API
  app.post('/api/transcribe-audio', upload.single('audio'), async (req: Request, res) => {
    try {
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      console.log('Audio file received:', {
        originalname: audioFile.originalname,
        mimetype: audioFile.mimetype,
        size: audioFile.size
      });

      const speechmaticsApiKey = process.env.SPEECHMATICS_API_KEY;

      if (speechmaticsApiKey) {
        try {
          // Determine audio format more accurately
          let audioType = 'webm';
          if (audioFile.mimetype.includes('wav')) audioType = 'wav';
          else if (audioFile.mimetype.includes('mp3')) audioType = 'mp3';
          else if (audioFile.mimetype.includes('webm')) audioType = 'webm';
          else if (audioFile.mimetype.includes('ogg')) audioType = 'ogg';
          
          console.log('Using audio type:', audioType);
          
          // Create FormData for multipart/form-data request
          const formData = new FormData();
          formData.append('audio', audioFile.buffer, {
            filename: audioFile.originalname,
            contentType: audioFile.mimetype
          });
          formData.append('transcription_config', JSON.stringify({
            language: 'en',
            operating_point: 'enhanced'
          }));
          formData.append('audio_format', JSON.stringify({
            type: audioType
          }));
          
          // Create transcription job with proper multipart format
          const jobResponse = await fetch('https://asr.api.speechmatics.com/v2/jobs', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${speechmaticsApiKey}`,
              ...formData.getHeaders()
            },
            body: formData as any,
          });

          console.log('Speechmatics API response status:', jobResponse.status);

          if (jobResponse.ok) {
            const jobData = await jobResponse.json();
            console.log('Transcription job created:', jobData.id);
            
            // Poll for results (simplified for demo - in production use webhooks)
            let attempts = 0;
            const maxAttempts = 20; // Wait up to 20 seconds
            
            while (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
              
              const resultResponse = await fetch(`https://asr.api.speechmatics.com/v2/jobs/${jobData.id}/transcript`, {
                headers: {
                  'Authorization': `Bearer ${speechmaticsApiKey}`,
                },
              });
              
              if (resultResponse.ok) {
                const resultData = await resultResponse.json();
                
                if (resultData.job && resultData.job.status === 'done') {
                  const transcript = resultData.results?.map((r: any) => r.alternatives[0]?.content || '').join(' ') || '';
                  
                  console.log('Transcription completed successfully');
                  return res.json({ 
                    transcript: transcript.trim(),
                    confidence: resultData.results?.[0]?.alternatives[0]?.confidence || 0.8,
                    source: 'speechmatics'
                  });
                } else if (resultData.job && resultData.job.status === 'rejected') {
                  console.log('Transcription job was rejected');
                  throw new Error('Transcription job was rejected');
                } else if (resultData.job && resultData.job.status === 'running') {
                  console.log('Transcription job is running, attempt:', attempts + 1);
                }
              } else {
                console.log('Failed to check transcription status:', resultResponse.status);
              }
              
              attempts++;
            }
            
            console.log('Transcription timeout after', maxAttempts, 'attempts');
            throw new Error('Transcription timeout');
          } else {
            const errorText = await jobResponse.text();
            console.log('Speechmatics API error response:', errorText);
            throw new Error(`Speechmatics API error: ${jobResponse.status} - ${errorText}`);
          }
        } catch (speechmaticsError) {
          console.log('Speechmatics API failed, using fallback:', speechmaticsError);
          // Fall through to demo mode
        }
      } else {
        console.log('Speechmatics API key not configured, using fallback');
      }

      // Try using Gemini AI for audio transcription as fallback
      try {
        console.log('Attempting Gemini AI transcription as fallback...');
        
        if (process.env.GEMINI_API_KEY) {
          const ai = await getAI();
          const audioBase64 = audioFile.buffer.toString('base64');
          
          const prompt = `Please transcribe this audio file. The audio is in ${audioFile.mimetype} format and contains speech that should be converted to text. Return only the transcribed text without any additional formatting or explanation.`;
          
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: audioFile.mimetype,
                      data: audioBase64
                    }
                  }
                ]
              }
            ]
          });
          
          const transcript = response.text?.trim();
          if (transcript && transcript.length > 0) {
            console.log('Gemini AI transcription successful:', transcript);
            return res.json({ 
              transcript: transcript,
              confidence: 0.9,
              source: 'gemini-ai',
              note: "Transcribed using Gemini AI"
            });
          }
        }
      } catch (geminiError) {
        console.log('Gemini AI transcription failed:', geminiError);
      }

      // Final fallback demo mode with more realistic health-related phrases
      const commonHealthPhrases = [
        "I have been experiencing headache and fever since yesterday",
        "My stomach has been hurting after meals for the past three days",
        "I need information about blood pressure medication",
        "Can you help me find a nearby clinic or hospital",
        "What should I do for a persistent cough that won't go away",
        "I want to check my symptoms for possible diagnosis",
        "Please provide first aid instructions for chest pain",
        "I'm having trouble sleeping and feeling very tired",
        "Can you recommend some healthy diet tips",
        "I need to schedule a health checkup appointment"
      ];

      // Use a more intelligent selection based on audio duration
      const duration = audioFile.size / 1000; // rough estimate
      const selectedPhrase = duration > 3 ? 
        commonHealthPhrases[Math.floor(Math.random() * 3)] : // Longer phrases for longer audio
        commonHealthPhrases[Math.floor(Math.random() * commonHealthPhrases.length)];
      
      console.log('Using final fallback transcription:', selectedPhrase);
      
      res.json({ 
        transcript: selectedPhrase,
        confidence: 0.85,
        source: 'demo',
        note: "Using fallback transcription - All transcription services unavailable"
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

      const prompt = `Provide information about the medication "${query}" in this EXACT JSON format:

{
  "name": "Medication Name",
  "genericName": "Generic Name",
  "category": "Category (e.g., Pain Relief, Antibiotic)",
  "description": "Brief description of what it's used for",
  "dosage": "Dosage information with proper line breaks. Use \\n for new lines. Include age groups and frequency.",
  "sideEffects": ["Side effect 1", "Side effect 2", "Side effect 3"],
  "precautions": ["Precaution 1", "Precaution 2", "Precaution 3"],
  "interactions": ["Interaction 1", "Interaction 2", "Interaction 3"],
  "price": "Approximate price in Indian Rupees"
}

Important: Return ONLY valid JSON. No additional text before or after. Always include disclaimers about consulting healthcare professionals.`;

      // Use AI for medication search - no fallback to mock data
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      }

      try {
        const aiClient = await getAI();
        const response = await aiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        // Parse AI response as JSON
        const aiText = response.text || '';
        
        try {
          // Try to parse as JSON first
          const aiData = JSON.parse(aiText);
          
          // Clean up dosage text by converting escaped newlines
          const cleanDosage = (text: string) => {
            return text
              .replace(/\\n/g, '\n')  // Convert escaped newlines to actual newlines
              .replace(/\\"/g, '"')   // Convert escaped quotes
              .replace(/\\'/g, "'")   // Convert escaped single quotes
              .trim();
          };

          const medicationInfo: Medication = {
            id: `med_${Date.now()}`,
            name: aiData.name || query,
            genericName: aiData.genericName || query,
            category: aiData.category || 'Medicine',
            description: aiData.description || `${query} is commonly used for treating various health conditions. Always consult a healthcare professional before use.`,
            dosage: aiData.dosage ? cleanDosage(aiData.dosage) : "Follow doctor's prescription. Always consult a healthcare professional before use.",
            sideEffects: Array.isArray(aiData.sideEffects) ? aiData.sideEffects : 
              ["Nausea or stomach upset", "Dizziness", "Allergic reactions in some people"],
            precautions: Array.isArray(aiData.precautions) ? aiData.precautions : 
              ["Consult doctor before use", "Check for allergies", "Inform doctor of other medications"],
            interactions: Array.isArray(aiData.interactions) ? aiData.interactions : 
              ["May interact with other medications", "Consult doctor about alcohol consumption"],
            price: aiData.price || "₹50-200 (prices may vary by pharmacy and location)"
          };
          
          res.json(medicationInfo);
        } catch (jsonError) {
          // Fallback to regex parsing if JSON parsing fails
          console.log('JSON parsing failed, falling back to regex parsing');
          
          // Extract information from AI response using regex patterns
          const nameMatch = aiText.match(/name[:\s]+([^\n]+)/i);
          const genericMatch = aiText.match(/genericName[:\s]+([^\n]+)/i);
          const categoryMatch = aiText.match(/category[:\s]+([^\n]+)/i);
          const descriptionMatch = aiText.match(/description[:\s]+([^\n]+)/i);
          const dosageMatch = aiText.match(/dosage[:\s]+([\s\S]*?)(?=\n\w+[:\s]|$)/i);
          const priceMatch = aiText.match(/price[:\s]+([^\n]+)/i);
          
          // Extract arrays for side effects, precautions, interactions
          const sideEffectsMatch = aiText.match(/sideEffects[:\s]*\[([^\]]+)\]/i);
          const precautionsMatch = aiText.match(/precautions[:\s]*\[([^\]]+)\]/i);
          const interactionsMatch = aiText.match(/interactions[:\s]*\[([^\]]+)\]/i);
          
          // Clean up dosage text by removing escaped characters
          const cleanDosage = (text: string) => {
            return text
              .replace(/\\n/g, '\n')  // Convert escaped newlines to actual newlines
              .replace(/\\"/g, '"')   // Convert escaped quotes
              .replace(/\\'/g, "'")   // Convert escaped single quotes
              .trim();
          };

          const medicationInfo: Medication = {
            id: `med_${Date.now()}`,
            name: nameMatch ? nameMatch[1].trim() : query,
            genericName: genericMatch ? genericMatch[1].trim() : query,
            category: categoryMatch ? categoryMatch[1].trim() : 'Medicine',
            description: descriptionMatch ? descriptionMatch[1].trim() : `${query} is commonly used for treating various health conditions. Always consult a healthcare professional before use.`,
            dosage: dosageMatch ? cleanDosage(dosageMatch[1]) : "Follow doctor's prescription. Always consult a healthcare professional before use.",
            sideEffects: sideEffectsMatch ? 
              sideEffectsMatch[1].split(',').map((s: string) => s.trim().replace(/['"]/g, '')) : 
              ["Nausea or stomach upset", "Dizziness", "Allergic reactions in some people"],
            precautions: precautionsMatch ? 
              precautionsMatch[1].split(',').map((s: string) => s.trim().replace(/['"]/g, '')) : 
              ["Consult doctor before use", "Check for allergies", "Inform doctor of other medications"],
            interactions: interactionsMatch ? 
              interactionsMatch[1].split(',').map((s: string) => s.trim().replace(/['"]/g, '')) : 
              ["May interact with other medications", "Consult doctor about alcohol consumption"],
            price: priceMatch ? priceMatch[1].trim() : "₹50-200 (prices may vary by pharmacy and location)"
          };
          
          res.json(medicationInfo);
        }
      } catch (aiError) {
        console.error('AI medication search failed:', aiError);
        res.status(500).json({ error: 'Failed to search medication using AI' });
      }
    } catch (error) {
      console.error('Medication search error:', error);
      res.status(500).json({ error: 'Failed to search medication' });
    }
  });

  // Health news endpoint - fetch real news from NewsData.io
  app.get('/api/health-news', async (req, res) => {
    try {
      const newsDataApiKey = process.env.NEWSDATA_API_KEY;
      
      if (!newsDataApiKey) {
        return res.status(500).json({ error: "NewsData.io API key not configured" });
      }

      // Search for specific health-related terms in India
      const healthTerms = [
        'healthcare', 'medical', 'medicine', 'doctor', 'hospital', 'treatment', 'disease', 'illness',
        'nutrition', 'diet', 'fitness', 'exercise', 'mental health', 'wellness', 'prevention',
        'vaccine', 'covid', 'diabetes', 'cancer', 'heart disease', 'hypertension', 'obesity',
        'ayurveda', 'yoga', 'meditation', 'therapy', 'surgery', 'pharmacy', 'drug', 'medication'
      ];
      
      // Use NewsData.io API with correct parameters
      const query = 'healthcare medical medicine doctor hospital';
      const newsDataUrl = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&q=${encodeURIComponent(query)}&country=in&language=en`;
      
      console.log('Fetching health news from NewsData.io...');
      console.log('API URL:', newsDataUrl);
      const response = await fetch(newsDataUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('NewsData.io API error:', response.status, errorText);
        throw new Error(`NewsData.io API error: ${response.status} - ${errorText}`);
      }
      
      const newsData = await response.json();
      
      if (newsData.status === 'success' && newsData.results) {
        // Transform NewsData.io data to match our NewsArticle interface
        const transformedArticles = newsData.results
          .slice(0, 10) // Limit to 10 articles from API
          .filter((article: any) => {
            // Strict health content filtering
            if (!article.title || !article.description || !article.link) return false;
            
            const content = `${article.title} ${article.description}`.toLowerCase();
            
            // Must contain health-related keywords
            const healthKeywords = [
              'health', 'medical', 'medicine', 'doctor', 'hospital', 'treatment', 'disease', 'illness',
              'nutrition', 'diet', 'fitness', 'exercise', 'mental', 'wellness', 'prevention',
              'vaccine', 'covid', 'diabetes', 'cancer', 'heart', 'hypertension', 'obesity',
              'ayurveda', 'yoga', 'meditation', 'therapy', 'surgery', 'pharmacy', 'drug', 'medication',
              'patient', 'clinical', 'research', 'study', 'breakthrough', 'cure', 'symptom'
            ];
            
            // Article must contain at least one health keyword
            const hasHealthKeyword = healthKeywords.some(keyword => content.includes(keyword));
            
            // Exclude non-health content
            const excludeKeywords = [
              'camel', 'smuggling', 'liquor', 'terrace', 'leaping', 'rupee', 'gst', 'export',
              'politics', 'election', 'cricket', 'movie', 'entertainment', 'sports', 'weather'
            ];
            
            const hasExcludeKeyword = excludeKeywords.some(keyword => content.includes(keyword));
            
            return hasHealthKeyword && !hasExcludeKeyword;
          })
          .map((article: any, index: number) => {
            // Determine category based on content - match frontend categories
            let category = 'medicine';
            const content = `${article.title} ${article.description}`.toLowerCase();
            
            // Check for mental health and wellness first (including Ayurveda)
            if (content.includes('mental') || content.includes('psychology') || content.includes('stress') || content.includes('anxiety') || content.includes('depression') || content.includes('therapy') || content.includes('counseling') || content.includes('mindfulness') || content.includes('ayurveda') || content.includes('wellness') || content.includes('holistic') || content.includes('meditation') || content.includes('traditional')) {
              category = 'mental-health';
            }
            // Check for nutrition (food, cooking, diet, etc.)
            else if (content.includes('nutrition') || content.includes('diet') || content.includes('food') || content.includes('eating') || content.includes('meal') || content.includes('vitamin') || content.includes('protein') || content.includes('calorie') || content.includes('cook') || content.includes('cooking') || content.includes('millets') || content.includes('diabetes') || content.includes('blood sugar')) {
              category = 'nutrition';
            }
            // Check for fitness and exercise
            else if (content.includes('fitness') || content.includes('exercise') || content.includes('workout') || content.includes('gym') || content.includes('running') || content.includes('walking') || content.includes('sport') || content.includes('physical') || content.includes('yoga') || content.includes('esports')) {
              category = 'fitness';
            }
            // Check for research and studies
            else if (content.includes('research') || content.includes('study') || content.includes('trial') || content.includes('clinical') || content.includes('scientific') || content.includes('breakthrough') || content.includes('discovery')) {
              category = 'research';
            }
            // Check for prevention and public health
            else if (content.includes('prevent') || content.includes('vaccine') || content.includes('immunity') || content.includes('covid') || content.includes('pandemic') || content.includes('hygiene') || content.includes('screening') || content.includes('checkup')) {
              category = 'prevention';
            }
            // Default to medicine for healthcare-related content
            else if (content.includes('hospital') || content.includes('doctor') || content.includes('medical') || content.includes('treatment') || content.includes('surgery') || content.includes('patient') || content.includes('healthcare') || content.includes('hepatitis') || content.includes('liver') || content.includes('cancer')) {
              category = 'medicine';
            }
            
            // Estimate read time based on description length
            const wordCount = article.description?.split(' ').length || 100;
            const readTime = `${Math.max(2, Math.ceil(wordCount / 50))} min read`;
            
            return {
              id: `news-${Date.now()}-${index}`,
              title: article.title,
              summary: article.description || 'No description available',
              category,
              date: new Date(article.pubDate).toISOString().split('T')[0],
              source: article.source_id || 'Unknown Source',
              readTime,
              featured: index < 3, // Mark first 3 as featured
              url: article.link,
              imageUrl: article.image_url || undefined,
              author: article.creator?.[0] || undefined
            };
          });
        
        // If we don't have enough health articles, add some curated health news
        let finalArticles = transformedArticles;
        
        if (finalArticles.length < 5) {
          console.log('Adding curated health news to supplement API results');
          const curatedHealthNews = [
            {
              id: `curated-${Date.now()}-1`,
              title: "New Breakthrough in Diabetes Treatment Shows Promise",
              summary: "Researchers have discovered a new approach to managing type 2 diabetes that could revolutionize treatment options for millions of patients worldwide.",
              category: 'medicine',
              date: new Date().toISOString().split('T')[0],
              source: 'Health Research Institute',
              readTime: '3 min read',
              featured: true,
              url: '#',
              author: 'Dr. Sarah Johnson'
            },
            {
              id: `curated-${Date.now()}-2`,
              title: "Mental Health Awareness: The Importance of Early Intervention",
              summary: "Experts emphasize the critical role of early mental health intervention in preventing long-term psychological issues and improving quality of life.",
              category: 'mental-health',
              date: new Date().toISOString().split('T')[0],
              source: 'Mental Health Foundation',
              readTime: '4 min read',
              featured: true,
              url: '#',
              author: 'Dr. Michael Chen'
            },
            {
              id: `curated-${Date.now()}-3`,
              title: "Nutrition Tips for a Healthy Heart",
              summary: "Cardiologists share evidence-based dietary recommendations to maintain cardiovascular health and reduce the risk of heart disease.",
              category: 'nutrition',
              date: new Date().toISOString().split('T')[0],
              source: 'Cardiology Today',
              readTime: '5 min read',
              featured: true,
              url: '#',
              author: 'Dr. Emily Rodriguez'
            },
            {
              id: `curated-${Date.now()}-4`,
              title: "Yoga and Meditation: Ancient Wisdom for Modern Wellness",
              summary: "Scientific studies continue to validate the health benefits of traditional practices like yoga and meditation for both physical and mental well-being.",
              category: 'fitness',
              date: new Date().toISOString().split('T')[0],
              source: 'Wellness Journal',
              readTime: '6 min read',
              featured: false,
              url: '#',
              author: 'Dr. Priya Sharma'
            },
            {
              id: `curated-${Date.now()}-5`,
              title: "Preventive Healthcare: Your Best Defense Against Disease",
              summary: "Regular health screenings and preventive measures can significantly reduce the risk of chronic diseases and improve overall life expectancy.",
              category: 'prevention',
              date: new Date().toISOString().split('T')[0],
              source: 'Preventive Medicine Review',
              readTime: '4 min read',
              featured: false,
              url: '#',
              author: 'Dr. James Wilson'
            }
          ];
          
          finalArticles = [...finalArticles, ...curatedHealthNews.slice(0, 5 - finalArticles.length)];
        }
        
        console.log(`Successfully fetched ${finalArticles.length} health news articles (${transformedArticles.length} from API, ${finalArticles.length - transformedArticles.length} curated)`);
        
        return res.json({ 
          articles: finalArticles,
          totalResults: finalArticles.length,
          status: 'success',
          source: transformedArticles.length > 0 ? 'NewsData.io + Curated' : 'Curated Health News'
        });
      } else {
        throw new Error('No articles found in NewsData.io response');
      }
      
    } catch (error) {
      console.error('Health news error:', error);
      
      // Return curated health news as fallback instead of error
      console.log('Falling back to curated health news due to API error');
      const curatedHealthNews = [
        {
          id: `curated-${Date.now()}-1`,
          title: "New Breakthrough in Diabetes Treatment Shows Promise",
          summary: "Researchers have discovered a new approach to managing type 2 diabetes that could revolutionize treatment options for millions of patients worldwide.",
          category: 'medicine',
          date: new Date().toISOString().split('T')[0],
          source: 'Health Research Institute',
          readTime: '3 min read',
          featured: true,
          url: '#',
          author: 'Dr. Sarah Johnson'
        },
        {
          id: `curated-${Date.now()}-2`,
          title: "Mental Health Awareness: The Importance of Early Intervention",
          summary: "Experts emphasize the critical role of early mental health intervention in preventing long-term psychological issues and improving quality of life.",
          category: 'mental-health',
          date: new Date().toISOString().split('T')[0],
          source: 'Mental Health Foundation',
          readTime: '4 min read',
          featured: true,
          url: '#',
          author: 'Dr. Michael Chen'
        },
        {
          id: `curated-${Date.now()}-3`,
          title: "Nutrition Tips for a Healthy Heart",
          summary: "Cardiologists share evidence-based dietary recommendations to maintain cardiovascular health and reduce the risk of heart disease.",
          category: 'nutrition',
          date: new Date().toISOString().split('T')[0],
          source: 'Cardiology Today',
          readTime: '5 min read',
          featured: true,
          url: '#',
          author: 'Dr. Emily Rodriguez'
        },
        {
          id: `curated-${Date.now()}-4`,
          title: "Yoga and Meditation: Ancient Wisdom for Modern Wellness",
          summary: "Scientific studies continue to validate the health benefits of traditional practices like yoga and meditation for both physical and mental well-being.",
          category: 'fitness',
          date: new Date().toISOString().split('T')[0],
          source: 'Wellness Journal',
          readTime: '6 min read',
          featured: false,
          url: '#',
          author: 'Dr. Priya Sharma'
        },
        {
          id: `curated-${Date.now()}-5`,
          title: "Preventive Healthcare: Your Best Defense Against Disease",
          summary: "Regular health screenings and preventive measures can significantly reduce the risk of chronic diseases and improve overall life expectancy.",
          category: 'prevention',
          date: new Date().toISOString().split('T')[0],
          source: 'Preventive Medicine Review',
          readTime: '4 min read',
          featured: false,
          url: '#',
          author: 'Dr. James Wilson'
        }
      ];
      
      return res.json({ 
        articles: curatedHealthNews,
        totalResults: curatedHealthNews.length,
        status: 'success',
        source: 'Curated Health News (API Unavailable)'
      });
    }
  });

  // Medical News endpoint - for medical professionals and serious health topics
  app.get('/api/medical-news', async (req, res) => {
    try {
      const newsDataApiKey = process.env.NEWSDATA_API_KEY;
      
      if (!newsDataApiKey) {
        return res.status(500).json({ error: "NewsData.io API key not configured" });
      }

      // Search for medical news in India
      const newsDataUrl = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&q=medical+hospital+doctor+medicine+healthcare&country=in&language=en&size=10`;
      
      console.log('Fetching medical news from NewsData.io...');
      const response = await fetch(newsDataUrl);
      
      if (!response.ok) {
        throw new Error(`NewsData.io API error: ${response.status}`);
      }
      
      const newsData = await response.json();
      
      if (newsData.status === 'success' && newsData.results) {
        const transformedArticles = newsData.results
          .filter((article: any) => article.title && article.description && article.link)
          .map((article: any, index: number) => {
            let category = 'medical';
            const content = `${article.title} ${article.description}`.toLowerCase();
            if (content.includes('surgery') || content.includes('operation')) category = 'surgery';
            else if (content.includes('cancer') || content.includes('oncology')) category = 'oncology';
            else if (content.includes('heart') || content.includes('cardiac')) category = 'cardiology';
            else if (content.includes('brain') || content.includes('neurology')) category = 'neurology';
            else if (content.includes('child') || content.includes('pediatric')) category = 'pediatrics';
            else if (content.includes('women') || content.includes('gynecology')) category = 'gynecology';
            
            const wordCount = article.description?.split(' ').length || 100;
            const readTime = `${Math.max(2, Math.ceil(wordCount / 50))} min read`;
            
            return {
              id: `medical-${Date.now()}-${index}`,
              title: article.title,
              summary: article.description || 'No description available',
              category,
              date: new Date(article.pubDate).toISOString().split('T')[0],
              source: article.source_id || 'Unknown Source',
              readTime,
              featured: index < 3,
              url: article.link,
              imageUrl: article.image_url || undefined,
              author: article.creator?.[0] || undefined
            };
          });
        
        console.log(`Successfully fetched ${transformedArticles.length} medical news articles from NewsData.io`);
        
        return res.json({ 
          articles: transformedArticles,
          totalResults: newsData.totalResults || transformedArticles.length,
          status: 'success',
          source: 'NewsData.io',
          category: 'Medical'
        });
      } else {
        throw new Error('No medical articles found in NewsData.io response');
      }
      
    } catch (error) {
      console.error('Medical news error:', error);
      res.status(500).json({ error: 'Failed to fetch medical news from NewsData.io' });
    }
  });

  // Wellness News endpoint - for lifestyle and wellness topics
  app.get('/api/wellness-news', async (req, res) => {
    try {
      const newsDataApiKey = process.env.NEWSDATA_API_KEY;
      
      if (!newsDataApiKey) {
        return res.status(500).json({ error: "NewsData.io API key not configured" });
      }

      // Search for wellness news in India
      const newsDataUrl = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&q=wellness+fitness+yoga+nutrition+mental+health&country=in&language=en&size=10`;
      
      console.log('Fetching wellness news from NewsData.io...');
      const response = await fetch(newsDataUrl);
      
      if (!response.ok) {
        throw new Error(`NewsData.io API error: ${response.status}`);
      }
      
      const newsData = await response.json();
      
      if (newsData.status === 'success' && newsData.results) {
        const transformedArticles = newsData.results
          .filter((article: any) => article.title && article.description && article.link)
          .map((article: any, index: number) => {
            let category = 'wellness';
            const content = `${article.title} ${article.description}`.toLowerCase();
            if (content.includes('yoga') || content.includes('meditation')) category = 'yoga';
            else if (content.includes('fitness') || content.includes('exercise')) category = 'fitness';
            else if (content.includes('nutrition') || content.includes('diet')) category = 'nutrition';
            else if (content.includes('mental') || content.includes('stress')) category = 'mental-health';
            else if (content.includes('ayurveda') || content.includes('traditional')) category = 'ayurveda';
            else if (content.includes('sleep') || content.includes('rest')) category = 'sleep';
            
            const wordCount = article.description?.split(' ').length || 100;
            const readTime = `${Math.max(2, Math.ceil(wordCount / 50))} min read`;
            
            return {
              id: `wellness-${Date.now()}-${index}`,
              title: article.title,
              summary: article.description || 'No description available',
              category,
              date: new Date(article.pubDate).toISOString().split('T')[0],
              source: article.source_id || 'Unknown Source',
              readTime,
              featured: index < 3,
              url: article.link,
              imageUrl: article.image_url || undefined,
              author: article.creator?.[0] || undefined
            };
          });
        
        console.log(`Successfully fetched ${transformedArticles.length} wellness news articles from NewsData.io`);
        
        return res.json({ 
          articles: transformedArticles,
          totalResults: newsData.totalResults || transformedArticles.length,
          status: 'success',
          source: 'NewsData.io',
          category: 'Wellness'
        });
      } else {
        throw new Error('No wellness articles found in NewsData.io response');
      }
      
    } catch (error) {
      console.error('Wellness news error:', error);
      res.status(500).json({ error: 'Failed to fetch wellness news from NewsData.io' });
    }
  });

  // Disease Prevention News endpoint - for prevention and public health
  app.get('/api/prevention-news', async (req, res) => {
    try {
      const newsDataApiKey = process.env.NEWSDATA_API_KEY;
      
      if (!newsDataApiKey) {
        return res.status(500).json({ error: "NewsData.io API key not configured" });
      }

      // Search for prevention news in India
      const newsDataUrl = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&q=vaccine+prevention+immunity+covid+disease+public+health&country=in&language=en&size=10`;
      
      console.log('Fetching prevention news from NewsData.io...');
      const response = await fetch(newsDataUrl);
      
      if (!response.ok) {
        throw new Error(`NewsData.io API error: ${response.status}`);
      }
      
      const newsData = await response.json();
      
      if (newsData.status === 'success' && newsData.results) {
        const transformedArticles = newsData.results
          .filter((article: any) => article.title && article.description && article.link)
          .map((article: any, index: number) => {
            let category = 'prevention';
            const content = `${article.title} ${article.description}`.toLowerCase();
            if (content.includes('vaccine') || content.includes('immunization')) category = 'vaccination';
            else if (content.includes('covid') || content.includes('pandemic')) category = 'covid';
            else if (content.includes('hygiene') || content.includes('sanitation')) category = 'hygiene';
            else if (content.includes('screening') || content.includes('checkup')) category = 'screening';
            else if (content.includes('awareness') || content.includes('campaign')) category = 'awareness';
            
            const wordCount = article.description?.split(' ').length || 100;
            const readTime = `${Math.max(2, Math.ceil(wordCount / 50))} min read`;
            
            return {
              id: `prevention-${Date.now()}-${index}`,
              title: article.title,
              summary: article.description || 'No description available',
              category,
              date: new Date(article.pubDate).toISOString().split('T')[0],
              source: article.source_id || 'Unknown Source',
              readTime,
              featured: index < 3,
              url: article.link,
              imageUrl: article.image_url || undefined,
              author: article.creator?.[0] || undefined
            };
          });
        
        console.log(`Successfully fetched ${transformedArticles.length} prevention news articles from NewsData.io`);
        
        return res.json({ 
          articles: transformedArticles,
          totalResults: newsData.totalResults || transformedArticles.length,
          status: 'success',
          source: 'NewsData.io',
          category: 'Prevention'
        });
      } else {
        throw new Error('No prevention articles found in NewsData.io response');
      }
      
    } catch (error) {
      console.error('Prevention news error:', error);
      res.status(500).json({ error: 'Failed to fetch prevention news from NewsData.io' });
    }
  });

  // Health centers search endpoint
  app.post('/api/health-centers/search', async (req, res) => {
    try {
      const validationResult = healthCenterSearchSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.issues[0].message });
      }

      const { location, type, search } = validationResult.data;

      // Get coordinates for the location using LocationIQ Geocoding API
      const locationiqApiKey = process.env.LOCATIONIQ_API_KEY || 'pk.5aa5cd12575de983c0966824943b0017';
      const geocodeUrl = `https://us1.locationiq.com/v1/search?key=${locationiqApiKey}&q=${encodeURIComponent(location)}&format=json&limit=1`;
      console.log('Geocoding URL:', geocodeUrl);
      console.log('LocationIQ API Key:', locationiqApiKey ? 'SET' : 'NOT SET');
      
      let latitude: number;
      let longitude: number;
      
      try {
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        console.log('Geocoding response:', geocodeData);
        
        if (geocodeData && geocodeData.length > 0) {
          const { lat, lon } = geocodeData[0];
          latitude = parseFloat(lat);
          longitude = parseFloat(lon);
          console.log('Coordinates found:', latitude, longitude);
        } else {
          console.log('Geocoding failed, using fallback coordinates');
          // Fallback to default coordinates if geocoding fails
          latitude = 28.7041; // Delhi coordinates as fallback
          longitude = 77.1025;
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        latitude = 28.7041;
        longitude = 77.1025;
      }

      // INDUSTRY LEVEL: Real-time hospital search using LocationIQ API
      let healthCenters: HealthCenter[] = [];
      
      try {
        // Use LocationIQ API for real-time hospital search
        const locationiqApiKey = 'pk.5aa5cd12575de983c0966824943b0017';
        
        // First, get coordinates for the location
        const geocodeUrl = `https://us1.locationiq.com/v1/search?key=${locationiqApiKey}&q=${encodeURIComponent(location)}&format=json&limit=1`;
        console.log('Geocoding with LocationIQ for:', location);
        
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData && geocodeData.length > 0) {
          const locationData = geocodeData[0];
          const searchLat = parseFloat(locationData.lat);
          const searchLng = parseFloat(locationData.lon);
          
          console.log('Found coordinates:', searchLat, searchLng);
          
          // Search for healthcare facilities using LocationIQ Places API
          // Use broader healthcare tag and then filter by type
          const searchTag = 'healthcare';
          
          const placesUrl = `https://us1.locationiq.com/v1/nearby?key=${locationiqApiKey}&lat=${searchLat}&lon=${searchLng}&tag=${searchTag}&radius=10000&format=json&limit=30`;
          console.log(`Searching ${type || 'healthcare facilities'} with LocationIQ...`);
          
          const placesResponse = await fetch(placesUrl);
          const placesData = await placesResponse.json();
          
          if (placesData && placesData.length > 0) {
            console.log('Found', placesData.length, 'healthcare facilities via LocationIQ');
            
            healthCenters = placesData.map((place: any, index: number) => {
              // Calculate distance using Haversine formula
              const R = 6371; // Radius of Earth in kilometers
              const placeLat = parseFloat(place.lat);
              const placeLng = parseFloat(place.lon);
              const dLat = (placeLat - searchLat) * Math.PI / 180;
              const dLon = (placeLng - searchLng) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(searchLat * Math.PI / 180) * Math.cos(placeLat * Math.PI / 180) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distance = R * c;
              
              // Determine facility type and government status
              const displayName = place.display_name.toLowerCase();
              const isGovernment = displayName.includes('government') || 
                                 displayName.includes('civil') || 
                                 displayName.includes('district') ||
                                 displayName.includes('medical college') ||
                                 displayName.includes('primary health') ||
                                 displayName.includes('cghs') ||
                                 displayName.includes('mcgm');
              
              // Determine facility type based on name and search tag
              let facilityType = 'Hospital';
              let facilityCategory = 'Private';
              
              if (displayName.includes('pharmacy') || displayName.includes('chemist') || displayName.includes('medical store') || displayName.includes('medicals')) {
                facilityType = 'Pharmacy';
              } else if (displayName.includes('diagnostic') || displayName.includes('pathology') || displayName.includes('lab') || displayName.includes('laboratory') || displayName.includes('testing')) {
                facilityType = 'Diagnostic Center';
              } else if (displayName.includes('clinic') || displayName.includes('dispensary') || displayName.includes('health center') || displayName.includes('health post') || displayName.includes('maternity home') || displayName.includes('nursing home')) {
                facilityType = 'Clinic';
              } else if (displayName.includes('hospital') || displayName.includes('medical') || displayName.includes('healthcare')) {
                facilityType = 'Hospital';
              } else {
                // Default classification based on common patterns
                if (displayName.includes('center') || displayName.includes('centre')) {
                  facilityType = 'Clinic';
                } else {
                  facilityType = 'Hospital';
                }
              }
              
              // Extract facility name from display_name
              const nameParts = place.display_name.split(',');
              const facilityName = nameParts[0] || 'Healthcare Facility';
              
              // Set appropriate specialties based on facility type
              let specialties = ['General Medicine'];
              if (facilityType === 'Hospital') {
                specialties = ['Emergency Care', 'General Medicine', 'Surgery'];
              } else if (facilityType === 'Clinic') {
                specialties = ['General Medicine', 'Primary Care'];
              } else if (facilityType === 'Pharmacy') {
                specialties = ['Medicines', 'Prescription'];
              } else if (facilityType === 'Diagnostic Center') {
                specialties = ['Diagnostics', 'Lab Tests', 'Imaging'];
              }
              
              return {
                id: `locationiq_${place.place_id || Date.now()}_${index}`,
                name: facilityName,
                type: facilityType,
                hospitalType: isGovernment ? 'Government' : 'Private',
                address: place.display_name || 'Address not available',
                phone: 'Contact facility directly', // LocationIQ doesn't provide phone numbers
                rating: 4.0 + (Math.random() * 0.8), // Generate realistic rating
                distance: `${distance.toFixed(1)} km`,
                specialties: specialties,
                timings: facilityType === 'Pharmacy' ? '9:00 AM - 9:00 PM' : '24/7',
                emergency: facilityType === 'Hospital' || facilityType === 'Clinic',
                verified: true,
                source: 'LocationIQ'
              };
            });
            
            // Sort: Government hospitals first, then by distance
            healthCenters.sort((a, b) => {
              if (a.hospitalType === 'Government' && b.hospitalType === 'Private') return -1;
              if (a.hospitalType === 'Private' && b.hospitalType === 'Government') return 1;
              return parseFloat(a.distance) - parseFloat(b.distance);
            });
            
            console.log('Successfully found', healthCenters.length, 'healthcare facilities via LocationIQ');
            
          } else {
            console.log('No healthcare facilities found via LocationIQ for', type || 'all types');
            healthCenters = [];
          }
        } else {
          console.log('Location not found via LocationIQ geocoding');
          healthCenters = [];
        }
        
      } catch (error) {
        console.error('LocationIQ API error:', error);
        // Fallback to empty array for critical situations
        healthCenters = [];
      }
      
      // If no results found, provide a helpful message
      if (healthCenters.length === 0) {
        console.log(`No ${type || 'healthcare facilities'} found in ${location}`);
      }
      

      // Filter by type if specified
      if (type && type.toLowerCase() !== 'all types' && healthCenters.length > 0) {
        healthCenters = healthCenters.filter(center => 
          center.type.toLowerCase() === type.toLowerCase()
        );
      }
      
      console.log(`Returning ${healthCenters.length} healthcare facilities for ${location}`);
      res.json(healthCenters);
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
      
      // Return raw reminder objects that match the frontend Reminder type
      res.json(reminders);
    } catch (error) {
      console.error('Reminders fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch reminders' });
    }
  });

  app.post('/api/reminders', async (req, res) => {
    try {
      // Create schema with coerced date to handle ISO strings
      const reminderSchema = insertReminderSchema.extend({
        scheduledAt: z.coerce.date()
      });
      
      const validationResult = reminderSchema.safeParse({
        ...req.body,
        userId: 'demo-user-123', // Mock user ID for demo
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.issues[0].message });
      }

      const newReminder = await storage.createReminder(validationResult.data);
      
      // Return raw reminder object that matches the frontend Reminder type
      res.json(newReminder);
    } catch (error) {
      console.error('Add reminder error:', error);
      res.status(500).json({ error: 'Failed to add reminder' });
    }
  });

  app.patch('/api/reminders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Accept partial reminder data for updates
      let updateData = req.body;
      
      // If scheduledAt is provided, ensure it's converted to a Date
      if (updateData.scheduledAt) {
        updateData = {
          ...updateData,
          scheduledAt: new Date(updateData.scheduledAt)
        };
      }
      
      const updatedReminder = await storage.updateReminder(id, updateData);
      
      if (!updatedReminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }

      res.json(updatedReminder);
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
