export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  messageType?: 'text' | 'image' | 'voice';
  metadata?: any;
}

export interface HealthAnalysis {
  condition: string;
  symptoms: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  disclaimer: string;
}

export interface MedicationInfo {
  name: string;
  uses: string[];
  dosage: string;
  sideEffects: string[];
  warnings: string[];
}

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = [],
  language: string = 'en'
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: conversationHistory,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export async function analyzeImage(imageFile: File, question: string = "What do you see in this image?"): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('question', question);

    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

export async function analyzeSymptoms(symptoms: string[]): Promise<HealthAnalysis> {
  try {
    const response = await fetch('/api/analyze-symptoms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
}

export async function getMedicationInfo(medicationName: string): Promise<MedicationInfo> {
  try {
    const response = await fetch('/api/medication-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ medicationName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.info;
  } catch (error) {
    console.error('Error getting medication info:', error);
    throw error;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
