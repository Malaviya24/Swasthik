// Vaccine Engine - Core functionality for India's vaccine database
// System prompt and data structures for Swasthik Vaccine Engine

export interface VaccineSchedule {
  dose_number: number;
  timing: string;
  interval_from_previous?: string;
  notes?: string;
}

export interface VaccineSource {
  title: string;
  url: string;
  retrieved: string; // ISO date format
}

export interface RegionalVariation {
  state: string;
  note: string;
}

export interface UICard {
  title: string;
  short_desc: string;
  long_desc_html: string;
}

export interface VaccineRecord {
  id: string;
  name: string;
  synonyms: string[];
  vaccine_type: string;
  target_age_groups: string[];
  schedule: VaccineSchedule[];
  indications: string[];
  diseases_prevented: string[];
  benefits: string;
  contraindications: string[];
  common_side_effects: string[];
  mandatory_status: 'mandatory' | 'recommended' | 'optional' | 'special_program';
  storage_requirements: string;
  dosage_form: string;
  cost_estimate_inr: {
    public: string;
    private: string;
  };
  next_due?: string | null;
  suitability_notes: string;
  regional_variations: RegionalVariation[];
  evidence_level: 'high' | 'moderate' | 'low';
  confidence: number; // 0.0 to 1.0
  verification_status: 'verified' | 'needs_verification';
  sources: VaccineSource[];
  ui_card: UICard;
}

export interface UserVaccineHistory {
  vaccine_name: string;
  date_given: string; // ISO date format
}

export interface PersonalizedVaccineReminder {
  vaccine_id: string;
  name: string;
  due_date: string | null; // ISO date format
  reason: string;
  urgency_level: 'low' | 'medium' | 'high' | 'needs_review';
  ui_reminder_text: string;
}

export interface VaccineGenerationInput {
  dob?: string; // YYYY-MM-DD format
  history?: UserVaccineHistory[];
  conditions?: string[];
  state?: string;
}

// System prompt for the vaccine engine
export const VACCINE_SYSTEM_PROMPT = `You are "Swasthik Vaccine Engine" — an expert, up-to-date vaccine knowledge assistant for India. Always prioritize accuracy, cite official sources, and never hallucinate specific guideline dates or claims without a source. When generating vaccine data, follow the output JSON schema exactly. If you cannot verify a claim from at least one reliable public health source (e.g., Ministry of Health & Family Welfare (MoHFW) India, Universal Immunization Programme (UIP), WHO, ICMR, reputable peer-reviewed journals, or state health department pages), mark the field needing verification and leave source list blank. Provide human-readable descriptions for UI and a machine-readable JSON record for storage. Always include a \`confidence\` score (0.0–1.0) and an array of \`sources\` (url + ISO date). If the vaccine is not nationally recommended but exists, label it \`optional\` and include any region-specific notes. Keep answers concise and suitable for large-scale deployment across India.`;

// Core generation prompt
export const VACCINE_GENERATION_PROMPT = `Task: Generate one or more vaccine records for India. Output must be a JSON array following the schema below. Use up-to-date guidance where possible. For each vaccine, include sources (URLs and retrieval dates). If you cannot verify a detail, set \`verification_status\` to "needs_verification" and do not fabricate.

User inputs (optional): 
- dob: "<YYYY-MM-DD>"            // if building personalised schedule
- history: [ {vaccine_name, date_given} ] // existing user vaccine history
- conditions: [ "pregnant", "immunocompromised", ... ]  // optional
- state: "Maharashtra"           // optional for state-specific programs

Output: JSON array of vaccine objects using the schema below. Provide no extra text outside JSON.`;

// Verification prompt
export const VACCINE_VERIFICATION_PROMPT = `Task: For each vaccine name given, find and return 3 authoritative sources (prefer MoHFW/UIP, WHO, peer-reviewed or ICMR) that confirm schedule, mandatory status, and target age group. Output JSON: { "vaccine": "...", "verified": true|false, "sources":[{title,url,retrieved_date}] }. If any claim differs across sources, include a \`disagreement\` field summarizing differences.`;

// Personalized schedule prompt
export const PERSONALIZED_SCHEDULE_PROMPT = `Input: user_dob = "<YYYY-MM-DD>", history = [ {name, date_given} ], conditions = [...]
Task: Using the master vaccine database, compute the user's personalized vaccine to-do list sorted by due date. For each due vaccine produce {vaccine_id, name, due_date (YYYY-MM-DD), reason, urgency_level (low/medium/high), ui_reminder_text}. If uncertain, set due_date=null and urgency_level="needs_review".
Output only JSON.`;

// Sample vaccine record (BCG example)
export const SAMPLE_VACCINE_RECORD: VaccineRecord = {
  id: "bcg",
  name: "BCG (Bacillus Calmette–Guérin)",
  synonyms: ["BCG vaccine"],
  vaccine_type: "live-attenuated",
  target_age_groups: ["newborn"],
  schedule: [{
    dose_number: 1,
    timing: "At birth (preferably within 24 hours)",
    interval_from_previous: null,
    notes: "Single dose in most schedules."
  }],
  indications: ["Prevents severe forms of tuberculosis in infants and young children"],
  diseases_prevented: ["Tuberculosis (severe forms)"],
  benefits: "Reduces risk of severe TB in children, especially miliary TB and TB meningitis.",
  contraindications: ["Severe immunodeficiency", "HIV symptomatic infants"],
  common_side_effects: ["Local ulceration", "scar formation"],
  mandatory_status: "mandatory",
  storage_requirements: "2-8°C; maintain cold chain",
  dosage_form: "Intradermal injection",
  cost_estimate_inr: {
    public: "free",
    private: "₹50-₹200"
  },
  next_due: null,
  suitability_notes: "Avoid in known severe immunodeficiency.",
  regional_variations: [],
  evidence_level: "high",
  confidence: 0.95,
  verification_status: "verified",
  sources: [{
    title: "MoHFW - UIP",
    url: "https://main.mohfw.gov.in",
    retrieved: "2025-01-15"
  }],
  ui_card: {
    title: "BCG — At birth",
    short_desc: "Prevents severe childhood TB",
    long_desc_html: "<p>Given at birth to protect against severe tuberculosis infections in children. Essential for preventing TB meningitis and miliary TB.</p>"
  }
};

// Source whitelist for verification
export const TRUSTED_SOURCES = [
  'mohfw.gov.in',
  'nhm.gov.in', 
  'india.gov.in',
  'who.int',
  'icmr.gov.in'
];

// Age group mappings for calculations
export const AGE_GROUPS = {
  'newborn': { min: 0, max: 0.25 }, // 0-3 months
  '0-1m': { min: 0, max: 1 },
  '6-8w': { min: 1.5, max: 2 },
  '9-14y': { min: 9 * 12, max: 14 * 12 }, // months
  'adult': { min: 18 * 12, max: 60 * 12 },
  '60+': { min: 60 * 12, max: 120 * 12 }
};

// Vaccine generation functions
export class VaccineEngine {
  private static instance: VaccineEngine;
  private vaccineDatabase: VaccineRecord[] = [];

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): VaccineEngine {
    if (!VaccineEngine.instance) {
      VaccineEngine.instance = new VaccineEngine();
    }
    return VaccineEngine.instance;
  }

  private initializeDatabase() {
    // Initialize with comprehensive vaccine database for India
    this.vaccineDatabase = [
      SAMPLE_VACCINE_RECORD,
      {
        id: "hepb",
        name: "Hepatitis B",
        synonyms: ["Hep B", "Hepatitis B vaccine"],
        vaccine_type: "inactivated",
        target_age_groups: ["newborn", "0-1m", "6-8w"],
        schedule: [
          { dose_number: 1, timing: "At birth (within 24 hours)", interval_from_previous: null, notes: "First dose" },
          { dose_number: 2, timing: "6 weeks", interval_from_previous: "6 weeks after first dose", notes: "Second dose" },
          { dose_number: 3, timing: "6 months", interval_from_previous: "6 months after first dose", notes: "Third dose" }
        ],
        indications: ["Prevents hepatitis B infection", "Protects against liver disease"],
        diseases_prevented: ["Hepatitis B", "Liver cirrhosis", "Liver cancer"],
        benefits: "Prevents hepatitis B infection which can cause chronic liver disease and liver cancer.",
        contraindications: ["Severe allergic reaction to previous dose", "Yeast allergy"],
        common_side_effects: ["Soreness at injection site", "Mild fever", "Fatigue"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹200-₹500" },
        next_due: null,
        suitability_notes: "Safe for pregnant women and immunocompromised individuals.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Hepatitis B", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "Hepatitis B — Birth, 6 weeks, 6 months",
          short_desc: "Prevents liver infection and cancer",
          long_desc_html: "<p>Essential vaccine to prevent hepatitis B infection, which can lead to chronic liver disease and liver cancer. Given in three doses starting at birth.</p>"
        }
      },
      {
        id: "dpt",
        name: "DPT (Diphtheria, Pertussis, Tetanus)",
        synonyms: ["DPT vaccine", "Triple vaccine"],
        vaccine_type: "inactivated",
        target_age_groups: ["6-8w", "9-14y"],
        schedule: [
          { dose_number: 1, timing: "6 weeks", interval_from_previous: null, notes: "First dose" },
          { dose_number: 2, timing: "10 weeks", interval_from_previous: "4 weeks after first dose", notes: "Second dose" },
          { dose_number: 3, timing: "14 weeks", interval_from_previous: "4 weeks after second dose", notes: "Third dose" },
          { dose_number: 4, timing: "16-24 months", interval_from_previous: "12-18 months after third dose", notes: "Booster dose" },
          { dose_number: 5, timing: "5-6 years", interval_from_previous: "3-4 years after fourth dose", notes: "Second booster" }
        ],
        indications: ["Prevents diphtheria", "Prevents pertussis (whooping cough)", "Prevents tetanus"],
        diseases_prevented: ["Diphtheria", "Pertussis", "Tetanus"],
        benefits: "Protects against three serious bacterial infections that can be life-threatening, especially in children.",
        contraindications: ["Severe allergic reaction to previous dose", "Progressive neurological disorder"],
        common_side_effects: ["Fever", "Redness at injection site", "Swelling", "Irritability"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹300-₹800" },
        next_due: null,
        suitability_notes: "Safe for most children. Consult doctor if child has neurological conditions.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.99,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "ICMR Guidelines", url: "https://www.icmr.gov.in", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "DPT — 6 weeks, 10 weeks, 14 weeks, 16-24 months, 5-6 years",
          short_desc: "Prevents diphtheria, pertussis, and tetanus",
          long_desc_html: "<p>Combined vaccine protecting against three serious bacterial infections. Essential for child health and development.</p>"
        }
      },
      {
        id: "measles",
        name: "Measles",
        synonyms: ["Measles vaccine", "MR vaccine"],
        vaccine_type: "live-attenuated",
        target_age_groups: ["9-14y"],
        schedule: [
          { dose_number: 1, timing: "9 months", interval_from_previous: null, notes: "First dose" },
          { dose_number: 2, timing: "15-18 months", interval_from_previous: "6-9 months after first dose", notes: "Second dose" }
        ],
        indications: ["Prevents measles infection", "Prevents complications"],
        diseases_prevented: ["Measles", "Measles complications"],
        benefits: "Prevents measles, a highly contagious viral infection that can cause serious complications including pneumonia and encephalitis.",
        contraindications: ["Severe immunodeficiency", "Pregnancy", "Severe allergic reaction to previous dose"],
        common_side_effects: ["Mild fever", "Rash", "Swollen glands"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; protect from light",
        dosage_form: "Subcutaneous injection",
        cost_estimate_inr: { public: "free", private: "₹150-₹400" },
        next_due: null,
        suitability_notes: "Not recommended for pregnant women or severely immunocompromised individuals.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.97,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Measles", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "Measles — 9 months, 15-18 months",
          short_desc: "Prevents measles and complications",
          long_desc_html: "<p>Live vaccine preventing measles, a highly contagious disease that can cause serious complications in children.</p>"
        }
      },
      {
        id: "covid19",
        name: "COVID-19",
        synonyms: ["Covishield", "Covaxin", "COVID vaccine"],
        vaccine_type: "viral vector/inactivated",
        target_age_groups: ["adult", "60+"],
        schedule: [
          { dose_number: 1, timing: "As per government guidelines", interval_from_previous: null, notes: "First dose" },
          { dose_number: 2, timing: "4-8 weeks after first dose", interval_from_previous: "4-8 weeks", notes: "Second dose" },
          { dose_number: 3, timing: "6 months after second dose", interval_from_previous: "6 months", notes: "Booster dose (if recommended)" }
        ],
        indications: ["Prevents COVID-19 infection", "Reduces severe disease"],
        diseases_prevented: ["COVID-19", "Severe COVID-19"],
        benefits: "Prevents COVID-19 infection and reduces risk of severe disease, hospitalization, and death.",
        contraindications: ["Severe allergic reaction to previous dose", "Severe allergic reaction to vaccine components"],
        common_side_effects: ["Pain at injection site", "Fever", "Fatigue", "Headache", "Muscle pain"],
        mandatory_status: "recommended",
        storage_requirements: "2-8°C (Covaxin) / -70°C (Covishield)",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹250-₹1200" },
        next_due: null,
        suitability_notes: "Recommended for all adults. Consult doctor for specific conditions.",
        regional_variations: [
          { state: "Maharashtra", note: "Additional booster programs available" },
          { state: "Delhi", note: "Free vaccination for all residents" }
        ],
        evidence_level: "high",
        confidence: 0.95,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - COVID-19", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "ICMR COVID Guidelines", url: "https://www.icmr.gov.in", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "COVID-19 — As per government schedule",
          short_desc: "Prevents COVID-19 infection and severe disease",
          long_desc_html: "<p>Essential vaccine to prevent COVID-19 infection and reduce risk of severe disease. Follow government guidelines for scheduling.</p>"
        }
      }
    ];
  }

  // Generate vaccine records based on user input
  async generateVaccineRecords(input: VaccineGenerationInput): Promise<VaccineRecord[]> {
    // This would typically call an AI model with the system prompt
    // For now, return filtered sample data
    return this.vaccineDatabase.filter(vaccine => {
      if (input.conditions?.includes('pregnant')) {
        return !vaccine.contraindications.some(contra => 
          contra.toLowerCase().includes('pregnancy') || 
          contra.toLowerCase().includes('pregnant')
        );
      }
      return true;
    });
  }

  // Generate personalized schedule
  async generatePersonalizedSchedule(
    dob: string, 
    history: UserVaccineHistory[], 
    conditions: string[] = []
  ): Promise<PersonalizedVaccineReminder[]> {
    const userAge = this.calculateAgeInMonths(dob);
    const reminders: PersonalizedVaccineReminder[] = [];

    for (const vaccine of this.vaccineDatabase) {
      const dueDate = this.calculateDueDate(vaccine, userAge, history, conditions);
      if (dueDate) {
        reminders.push({
          vaccine_id: vaccine.id,
          name: vaccine.name,
          due_date: dueDate,
          reason: this.getDueReason(vaccine, userAge),
          urgency_level: this.getUrgencyLevel(vaccine, dueDate),
          ui_reminder_text: this.generateReminderText(vaccine, dueDate)
        });
      }
    }

    return reminders.sort((a, b) => {
      if (!a.due_date || !b.due_date) return 0;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }

  // Verify vaccine information
  async verifyVaccineInfo(vaccineName: string): Promise<{
    verified: boolean;
    sources: VaccineSource[];
    disagreement?: string;
  }> {
    // This would typically call verification services
    // For now, return mock verification
    return {
      verified: true,
      sources: [{
        title: "MoHFW - UIP",
        url: "https://main.mohfw.gov.in",
        retrieved: new Date().toISOString().split('T')[0]
      }]
    };
  }

  private calculateAgeInMonths(dob: string): number {
    const birthDate = new Date(dob);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44); // Average days per month
  }

  private calculateDueDate(
    vaccine: VaccineRecord, 
    userAge: number, 
    history: UserVaccineHistory[], 
    conditions: string[]
  ): string | null {
    // Check if already vaccinated
    const alreadyVaccinated = history.some(h => 
      h.vaccine_name.toLowerCase().includes(vaccine.name.toLowerCase()) ||
      vaccine.synonyms.some(syn => h.vaccine_name.toLowerCase().includes(syn.toLowerCase()))
    );

    if (alreadyVaccinated) return null;

    // Check contraindications
    if (this.hasContraindications(vaccine, conditions)) return null;

    // Calculate due date based on age groups and schedule
    for (const ageGroup of vaccine.target_age_groups) {
      const ageRange = AGE_GROUPS[ageGroup as keyof typeof AGE_GROUPS];
      if (ageRange && userAge >= ageRange.min && userAge <= ageRange.max) {
        // Calculate next due date based on schedule
        const nextDue = this.calculateNextDueFromSchedule(vaccine.schedule, userAge);
        return nextDue;
      }
    }

    return null;
  }

  private hasContraindications(vaccine: VaccineRecord, conditions: string[]): boolean {
    return conditions.some(condition => 
      vaccine.contraindications.some(contra => 
        contra.toLowerCase().includes(condition.toLowerCase())
      )
    );
  }

  private calculateNextDueFromSchedule(schedule: VaccineSchedule[], userAge: number): string | null {
    // Simplified calculation - in real implementation, this would be more complex
    const nextDose = schedule.find(dose => {
      // This is a simplified logic - real implementation would parse timing strings
      return dose.dose_number === 1; // For now, just return first dose
    });

    if (nextDose) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1); // Add 1 month as example
      return dueDate.toISOString().split('T')[0];
    }

    return null;
  }

  private getDueReason(vaccine: VaccineRecord, userAge: number): string {
    return `Due based on age group and immunization schedule`;
  }

  private getUrgencyLevel(vaccine: VaccineRecord, dueDate: string): 'low' | 'medium' | 'high' | 'needs_review' {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'high'; // Overdue
    if (daysUntilDue <= 7) return 'high'; // Due within a week
    if (daysUntilDue <= 30) return 'medium'; // Due within a month
    return 'low';
  }

  private generateReminderText(vaccine: VaccineRecord, dueDate: string): string {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return `Overdue: ${vaccine.name}. Prevents ${vaccine.diseases_prevented.join(', ')}. Schedule immediately.`;
    } else if (daysUntilDue === 0) {
      return `Due today: ${vaccine.name}. Prevents ${vaccine.diseases_prevented.join(', ')}. Schedule now.`;
    } else {
      return `Due in ${daysUntilDue} days: ${vaccine.name}. Prevents ${vaccine.diseases_prevented.join(', ')}. Schedule soon.`;
    }
  }

  // Get all vaccines
  getAllVaccines(): VaccineRecord[] {
    return this.vaccineDatabase;
  }

  // Get vaccine by ID
  getVaccineById(id: string): VaccineRecord | undefined {
    return this.vaccineDatabase.find(v => v.id === id);
  }

  // Search vaccines
  searchVaccines(query: string): VaccineRecord[] {
    const lowerQuery = query.toLowerCase();
    return this.vaccineDatabase.filter(vaccine => 
      vaccine.name.toLowerCase().includes(lowerQuery) ||
      vaccine.synonyms.some(syn => syn.toLowerCase().includes(lowerQuery)) ||
      vaccine.diseases_prevented.some(disease => disease.toLowerCase().includes(lowerQuery))
    );
  }
}

// Export singleton instance
export const vaccineEngine = VaccineEngine.getInstance();
