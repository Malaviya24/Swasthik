import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  MapPin,
  DollarSign,
  Thermometer,
  Syringe,
  Users
} from 'lucide-react';
import { 
  VaccineRecord, 
  vaccineEngine
} from '@/lib/vaccine';
import { searchVaccineWithAI, VaccineSearchResult } from '@/lib/gemini';
import { useLanguage } from '@/contexts/LanguageContext';

interface VaccineTrackerProps {
  className?: string;
}

export function VaccineTracker({ className }: VaccineTrackerProps) {
  const { translate } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineRecord | null>(null);
  const [aiSearchResult, setAiSearchResult] = useState<VaccineSearchResult | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [vaccineTodos, setVaccineTodos] = useState<{[key: string]: boolean}>({});
  const [vaccineProgress, setVaccineProgress] = useState({
    total: 0,
    completed: 0,
    remaining: 0,
    percentage: 0
  });

  useEffect(() => {
    loadVaccines();
    loadComprehensiveVaccines();
  }, []);

  // Update progress whenever vaccines or todos change
  useEffect(() => {
    const totalVaccines = vaccines.length;
    const completedVaccines = Object.values(vaccineTodos).filter(Boolean).length;
    const remainingVaccines = totalVaccines - completedVaccines;
    const progressPercentage = totalVaccines > 0 ? (completedVaccines / totalVaccines) * 100 : 0;
    
    setVaccineProgress({
      total: totalVaccines,
      completed: completedVaccines,
      remaining: remainingVaccines,
      percentage: Math.round(progressPercentage)
    });
    
    console.log('Progress updated:', {
      total: totalVaccines,
      completed: completedVaccines,
      remaining: remainingVaccines,
      percentage: Math.round(progressPercentage)
    });
  }, [vaccines, vaccineTodos]);

  const loadComprehensiveVaccines = () => {
    const comprehensiveVaccines: VaccineRecord[] = [
      // Birth to 6 weeks
      {
        id: "bcg",
        name: "BCG (Bacillus Calmette-Guérin)",
        synonyms: ["BCG", "Tuberculosis vaccine"],
        vaccine_type: "live attenuated",
        target_age_groups: ["birth", "0-1y"],
        schedule: [
          { dose_number: 1, timing: "At birth or within 1 year", interval_from_previous: null, notes: "Prevents tuberculosis" }
        ],
        indications: ["Prevents tuberculosis (TB)", "Required for all newborns"],
        diseases_prevented: ["Tuberculosis", "TB"],
        benefits: "Prevents tuberculosis, a serious lung infection that can be life-threatening.",
        contraindications: ["Severe immunodeficiency", "HIV positive with low CD4 count"],
        common_side_effects: ["Small scar at injection site", "Mild fever", "Swollen lymph nodes"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; protect from light",
        dosage_form: "Intradermal injection",
        cost_estimate_inr: { public: "free", private: "₹50-₹200" },
        next_due: null,
        suitability_notes: "Given at birth or within first year of life.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - BCG", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "BCG — At birth",
          short_desc: "Prevents tuberculosis",
          long_desc_html: "<p>Essential vaccine to prevent tuberculosis, given at birth or within the first year of life.</p>"
        }
      },
      {
        id: "hepb-birth",
        name: "Hepatitis B (First Dose)",
        synonyms: ["Hep B", "Hepatitis B vaccine"],
        vaccine_type: "inactivated",
        target_age_groups: ["birth", "0-1m"],
        schedule: [
          { dose_number: 1, timing: "At birth (within 24 hours)", interval_from_previous: null, notes: "First dose" }
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
        suitability_notes: "Safe for newborns and immunocompromised individuals.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Hepatitis B", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "Hepatitis B — At birth",
          short_desc: "Prevents liver infection",
          long_desc_html: "<p>Essential vaccine to prevent hepatitis B infection, given at birth within 24 hours.</p>"
        }
      },
      // 6 weeks to 6 months
      {
        id: "dpt-1",
        name: "DPT (First Dose)",
        synonyms: ["DPT", "Diphtheria Pertussis Tetanus"],
        vaccine_type: "inactivated",
        target_age_groups: ["6w", "6-8w"],
        schedule: [
          { dose_number: 1, timing: "6 weeks", interval_from_previous: "6 weeks after birth", notes: "First dose" }
        ],
        indications: ["Prevents diphtheria", "Prevents whooping cough", "Prevents tetanus"],
        diseases_prevented: ["Diphtheria", "Pertussis", "Tetanus"],
        benefits: "Prevents three serious bacterial infections that can be life-threatening, especially in children.",
        contraindications: ["Severe allergic reaction to previous dose", "Progressive neurological disorder"],
        common_side_effects: ["Fever", "Soreness at injection site", "Fussiness", "Loss of appetite"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹300-₹800" },
        next_due: null,
        suitability_notes: "Safe for most children, including those with mild illnesses.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - DPT", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "DPT — 6 weeks",
          short_desc: "Prevents diphtheria, pertussis, tetanus",
          long_desc_html: "<p>Essential combination vaccine to prevent three serious bacterial infections.</p>"
        }
      },
      {
        id: "opv-1",
        name: "OPV (First Dose)",
        synonyms: ["OPV", "Oral Polio Vaccine"],
        vaccine_type: "live attenuated",
        target_age_groups: ["6w", "6-8w"],
        schedule: [
          { dose_number: 1, timing: "6 weeks", interval_from_previous: "6 weeks after birth", notes: "First dose" }
        ],
        indications: ["Prevents polio", "Eradicates polio virus"],
        diseases_prevented: ["Polio", "Poliomyelitis"],
        benefits: "Prevents polio, a crippling and potentially deadly disease that affects the nervous system.",
        contraindications: ["Severe immunodeficiency", "HIV positive with low CD4 count"],
        common_side_effects: ["None (oral vaccine)", "Very rarely: vaccine-associated polio"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; protect from light",
        dosage_form: "Oral drops",
        cost_estimate_inr: { public: "free", private: "₹50-₹150" },
        next_due: null,
        suitability_notes: "Safe for most children, given as oral drops.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Polio", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "OPV — 6 weeks",
          short_desc: "Prevents polio",
          long_desc_html: "<p>Essential oral vaccine to prevent polio, given as drops.</p>"
        }
      },
      {
        id: "ipv-1",
        name: "IPV (First Dose)",
        synonyms: ["IPV", "Inactivated Polio Vaccine"],
        vaccine_type: "inactivated",
        target_age_groups: ["6w", "6-8w"],
        schedule: [
          { dose_number: 1, timing: "6 weeks", interval_from_previous: "6 weeks after birth", notes: "First dose" }
        ],
        indications: ["Additional polio protection", "Inactivated polio vaccine"],
        diseases_prevented: ["Polio", "Poliomyelitis"],
        benefits: "Provides additional protection against polio using inactivated virus.",
        contraindications: ["Severe allergic reaction to previous dose"],
        common_side_effects: ["Soreness at injection site", "Mild fever", "Fussiness"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹200-₹500" },
        next_due: null,
        suitability_notes: "Safe for immunocompromised individuals.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Polio", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "IPV — 6 weeks",
          short_desc: "Additional polio protection",
          long_desc_html: "<p>Inactivated polio vaccine for additional protection against polio.</p>"
        }
      },
      {
        id: "hib-1",
        name: "Hib (First Dose)",
        synonyms: ["Hib", "Haemophilus influenzae type b"],
        vaccine_type: "inactivated",
        target_age_groups: ["6w", "6-8w"],
        schedule: [
          { dose_number: 1, timing: "6 weeks", interval_from_previous: "6 weeks after birth", notes: "First dose" }
        ],
        indications: ["Prevents Hib infections", "Prevents meningitis"],
        diseases_prevented: ["Hib meningitis", "Hib pneumonia", "Hib epiglottitis"],
        benefits: "Prevents serious infections caused by Haemophilus influenzae type b bacteria.",
        contraindications: ["Severe allergic reaction to previous dose"],
        common_side_effects: ["Fever", "Soreness at injection site", "Fussiness"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹400-₹1000" },
        next_due: null,
        suitability_notes: "Safe for most children, prevents serious bacterial infections.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Hib", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "Hib — 6 weeks",
          short_desc: "Prevents Hib infections",
          long_desc_html: "<p>Essential vaccine to prevent serious Hib infections including meningitis.</p>"
        }
      },
      // Continue with more vaccines...
      {
        id: "dpt-2",
        name: "DPT (Second Dose)",
        synonyms: ["DPT", "Diphtheria Pertussis Tetanus"],
        vaccine_type: "inactivated",
        target_age_groups: ["10w", "10-12w"],
        schedule: [
          { dose_number: 2, timing: "10 weeks", interval_from_previous: "4 weeks after first dose", notes: "Second dose" }
        ],
        indications: ["Prevents diphtheria", "Prevents whooping cough", "Prevents tetanus"],
        diseases_prevented: ["Diphtheria", "Pertussis", "Tetanus"],
        benefits: "Second dose for complete protection against three serious bacterial infections.",
        contraindications: ["Severe allergic reaction to previous dose", "Progressive neurological disorder"],
        common_side_effects: ["Fever", "Soreness at injection site", "Fussiness", "Loss of appetite"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹300-₹800" },
        next_due: null,
        suitability_notes: "Safe for most children, including those with mild illnesses.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - DPT", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "DPT — 10 weeks",
          short_desc: "Second dose DPT",
          long_desc_html: "<p>Second dose of DPT vaccine for complete protection.</p>"
        }
      },
      {
        id: "opv-2",
        name: "OPV (Second Dose)",
        synonyms: ["OPV", "Oral Polio Vaccine"],
        vaccine_type: "live attenuated",
        target_age_groups: ["10w", "10-12w"],
        schedule: [
          { dose_number: 2, timing: "10 weeks", interval_from_previous: "4 weeks after first dose", notes: "Second dose" }
        ],
        indications: ["Prevents polio", "Eradicates polio virus"],
        diseases_prevented: ["Polio", "Poliomyelitis"],
        benefits: "Second dose for complete polio protection.",
        contraindications: ["Severe immunodeficiency", "HIV positive with low CD4 count"],
        common_side_effects: ["None (oral vaccine)", "Very rarely: vaccine-associated polio"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; protect from light",
        dosage_form: "Oral drops",
        cost_estimate_inr: { public: "free", private: "₹50-₹150" },
        next_due: null,
        suitability_notes: "Safe for most children, given as oral drops.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Polio", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "OPV — 10 weeks",
          short_desc: "Second dose OPV",
          long_desc_html: "<p>Second dose of oral polio vaccine.</p>"
        }
      },
      {
        id: "hib-2",
        name: "Hib (Second Dose)",
        synonyms: ["Hib", "Haemophilus influenzae type b"],
        vaccine_type: "inactivated",
        target_age_groups: ["10w", "10-12w"],
        schedule: [
          { dose_number: 2, timing: "10 weeks", interval_from_previous: "4 weeks after first dose", notes: "Second dose" }
        ],
        indications: ["Prevents Hib infections", "Prevents meningitis"],
        diseases_prevented: ["Hib meningitis", "Hib pneumonia", "Hib epiglottitis"],
        benefits: "Second dose for complete Hib protection.",
        contraindications: ["Severe allergic reaction to previous dose"],
        common_side_effects: ["Fever", "Soreness at injection site", "Fussiness"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹400-₹1000" },
        next_due: null,
        suitability_notes: "Safe for most children, prevents serious bacterial infections.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Hib", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "Hib — 10 weeks",
          short_desc: "Second dose Hib",
          long_desc_html: "<p>Second dose of Hib vaccine for complete protection.</p>"
        }
      },
      {
        id: "dpt-3",
        name: "DPT (Third Dose)",
        synonyms: ["DPT", "Diphtheria Pertussis Tetanus"],
        vaccine_type: "inactivated",
        target_age_groups: ["14w", "14-16w"],
        schedule: [
          { dose_number: 3, timing: "14 weeks", interval_from_previous: "4 weeks after second dose", notes: "Third dose" }
        ],
        indications: ["Prevents diphtheria", "Prevents whooping cough", "Prevents tetanus"],
        diseases_prevented: ["Diphtheria", "Pertussis", "Tetanus"],
        benefits: "Third dose for complete protection against three serious bacterial infections.",
        contraindications: ["Severe allergic reaction to previous dose", "Progressive neurological disorder"],
        common_side_effects: ["Fever", "Soreness at injection site", "Fussiness", "Loss of appetite"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹300-₹800" },
        next_due: null,
        suitability_notes: "Safe for most children, including those with mild illnesses.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - DPT", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "DPT — 14 weeks",
          short_desc: "Third dose DPT",
          long_desc_html: "<p>Third dose of DPT vaccine for complete protection.</p>"
        }
      },
      {
        id: "opv-3",
        name: "OPV (Third Dose)",
        synonyms: ["OPV", "Oral Polio Vaccine"],
        vaccine_type: "live attenuated",
        target_age_groups: ["14w", "14-16w"],
        schedule: [
          { dose_number: 3, timing: "14 weeks", interval_from_previous: "4 weeks after second dose", notes: "Third dose" }
        ],
        indications: ["Prevents polio", "Eradicates polio virus"],
        diseases_prevented: ["Polio", "Poliomyelitis"],
        benefits: "Third dose for complete polio protection.",
        contraindications: ["Severe immunodeficiency", "HIV positive with low CD4 count"],
        common_side_effects: ["None (oral vaccine)", "Very rarely: vaccine-associated polio"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; protect from light",
        dosage_form: "Oral drops",
        cost_estimate_inr: { public: "free", private: "₹50-₹150" },
        next_due: null,
        suitability_notes: "Safe for most children, given as oral drops.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Polio", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "OPV — 14 weeks",
          short_desc: "Third dose OPV",
          long_desc_html: "<p>Third dose of oral polio vaccine.</p>"
        }
      },
      {
        id: "ipv-2",
        name: "IPV (Second Dose)",
        synonyms: ["IPV", "Inactivated Polio Vaccine"],
        vaccine_type: "inactivated",
        target_age_groups: ["14w", "14-16w"],
        schedule: [
          { dose_number: 2, timing: "14 weeks", interval_from_previous: "8 weeks after first dose", notes: "Second dose" }
        ],
        indications: ["Additional polio protection", "Inactivated polio vaccine"],
        diseases_prevented: ["Polio", "Poliomyelitis"],
        benefits: "Second dose for complete polio protection using inactivated virus.",
        contraindications: ["Severe allergic reaction to previous dose"],
        common_side_effects: ["Soreness at injection site", "Mild fever", "Fussiness"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹200-₹500" },
        next_due: null,
        suitability_notes: "Safe for immunocompromised individuals.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Polio", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "IPV — 14 weeks",
          short_desc: "Second dose IPV",
          long_desc_html: "<p>Second dose of inactivated polio vaccine.</p>"
        }
      },
      {
        id: "hib-3",
        name: "Hib (Third Dose)",
        synonyms: ["Hib", "Haemophilus influenzae type b"],
        vaccine_type: "inactivated",
        target_age_groups: ["14w", "14-16w"],
        schedule: [
          { dose_number: 3, timing: "14 weeks", interval_from_previous: "4 weeks after second dose", notes: "Third dose" }
        ],
        indications: ["Prevents Hib infections", "Prevents meningitis"],
        diseases_prevented: ["Hib meningitis", "Hib pneumonia", "Hib epiglottitis"],
        benefits: "Third dose for complete Hib protection.",
        contraindications: ["Severe allergic reaction to previous dose"],
        common_side_effects: ["Fever", "Soreness at injection site", "Fussiness"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "free", private: "₹400-₹1000" },
        next_due: null,
        suitability_notes: "Safe for most children, prevents serious bacterial infections.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - Hib", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "Hib — 14 weeks",
          short_desc: "Third dose Hib",
          long_desc_html: "<p>Third dose of Hib vaccine for complete protection.</p>"
        }
      },
      // 6 months to 1 year
      {
        id: "mmr-1",
        name: "MMR (First Dose)",
        synonyms: ["MMR", "Measles Mumps Rubella"],
        vaccine_type: "live attenuated",
        target_age_groups: ["9m", "9-12m"],
        schedule: [
          { dose_number: 1, timing: "9 months", interval_from_previous: "9 months after birth", notes: "First dose" }
        ],
        indications: ["Prevents measles", "Prevents mumps", "Prevents rubella"],
        diseases_prevented: ["Measles", "Mumps", "Rubella"],
        benefits: "Prevents three serious viral infections that can cause complications in children.",
        contraindications: ["Severe immunodeficiency", "Pregnancy", "Severe allergic reaction to previous dose"],
        common_side_effects: ["Fever", "Rash", "Swollen glands", "Joint pain"],
        mandatory_status: "mandatory",
        storage_requirements: "2-8°C; protect from light",
        dosage_form: "Subcutaneous injection",
        cost_estimate_inr: { public: "free", private: "₹500-₹1500" },
        next_due: null,
        suitability_notes: "Safe for most children, prevents serious viral infections.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.98,
        verification_status: "verified",
        sources: [
          { title: "MoHFW - UIP", url: "https://main.mohfw.gov.in", retrieved: "2025-01-15" },
          { title: "WHO - MMR", url: "https://www.who.int", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "MMR — 9 months",
          short_desc: "Prevents measles, mumps, rubella",
          long_desc_html: "<p>Essential vaccine to prevent three serious viral infections.</p>"
        }
      },
      {
        id: "varicella-1",
        name: "Varicella (First Dose)",
        synonyms: ["Chickenpox vaccine", "Varicella vaccine"],
        vaccine_type: "live attenuated",
        target_age_groups: ["12m", "12-15m"],
        schedule: [
          { dose_number: 1, timing: "12-15 months", interval_from_previous: "12-15 months after birth", notes: "First dose" }
        ],
        indications: ["Prevents chickenpox", "Prevents varicella"],
        diseases_prevented: ["Chickenpox", "Varicella"],
        benefits: "Prevents chickenpox, a highly contagious viral infection that can cause serious complications.",
        contraindications: ["Severe immunodeficiency", "Pregnancy", "Severe allergic reaction to previous dose"],
        common_side_effects: ["Fever", "Rash", "Soreness at injection site"],
        mandatory_status: "optional",
        storage_requirements: "2-8°C; protect from light",
        dosage_form: "Subcutaneous injection",
        cost_estimate_inr: { public: "not available", private: "₹800-₹2000" },
        next_due: null,
        suitability_notes: "Recommended for all children, prevents chickenpox.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.95,
        verification_status: "verified",
        sources: [
          { title: "WHO - Varicella", url: "https://www.who.int", retrieved: "2025-01-15" },
          { title: "CDC - Varicella", url: "https://www.cdc.gov", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "Varicella — 12-15 months",
          short_desc: "Prevents chickenpox",
          long_desc_html: "<p>Vaccine to prevent chickenpox, a highly contagious viral infection.</p>"
        }
      },
      {
        id: "pcv-1",
        name: "PCV (First Dose)",
        synonyms: ["Pneumococcal Conjugate", "PCV"],
        vaccine_type: "inactivated",
        target_age_groups: ["6w", "6-8w"],
        schedule: [
          { dose_number: 1, timing: "6 weeks", interval_from_previous: "6 weeks after birth", notes: "First dose" }
        ],
        indications: ["Prevents pneumococcal disease", "Prevents pneumonia"],
        diseases_prevented: ["Pneumococcal pneumonia", "Pneumococcal meningitis", "Pneumococcal bacteremia"],
        benefits: "Prevents serious infections caused by pneumococcal bacteria.",
        contraindications: ["Severe allergic reaction to previous dose"],
        common_side_effects: ["Fever", "Soreness at injection site", "Fussiness"],
        mandatory_status: "optional",
        storage_requirements: "2-8°C; do not freeze",
        dosage_form: "Intramuscular injection",
        cost_estimate_inr: { public: "not available", private: "₹2000-₹4000" },
        next_due: null,
        suitability_notes: "Recommended for all children, prevents serious bacterial infections.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.95,
        verification_status: "verified",
        sources: [
          { title: "WHO - PCV", url: "https://www.who.int", retrieved: "2025-01-15" },
          { title: "CDC - PCV", url: "https://www.cdc.gov", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "PCV — 6 weeks",
          short_desc: "Prevents pneumococcal disease",
          long_desc_html: "<p>Vaccine to prevent serious pneumococcal infections.</p>"
        }
      },
      {
        id: "rotavirus-1",
        name: "Rotavirus (First Dose)",
        synonyms: ["Rotavirus vaccine"],
        vaccine_type: "live attenuated",
        target_age_groups: ["6w", "6-8w"],
        schedule: [
          { dose_number: 1, timing: "6 weeks", interval_from_previous: "6 weeks after birth", notes: "First dose" }
        ],
        indications: ["Prevents rotavirus diarrhea", "Prevents severe diarrhea"],
        diseases_prevented: ["Rotavirus diarrhea", "Severe diarrhea", "Dehydration"],
        benefits: "Prevents severe diarrhea caused by rotavirus, a leading cause of child mortality.",
        contraindications: ["Severe immunodeficiency", "Intussusception history", "Severe allergic reaction to previous dose"],
        common_side_effects: ["Mild diarrhea", "Vomiting", "Fussiness"],
        mandatory_status: "optional",
        storage_requirements: "2-8°C; protect from light",
        dosage_form: "Oral drops",
        cost_estimate_inr: { public: "not available", private: "₹1000-₹2500" },
        next_due: null,
        suitability_notes: "Recommended for all children, prevents severe diarrhea.",
        regional_variations: [],
        evidence_level: "high",
        confidence: 0.95,
        verification_status: "verified",
        sources: [
          { title: "WHO - Rotavirus", url: "https://www.who.int", retrieved: "2025-01-15" },
          { title: "CDC - Rotavirus", url: "https://www.cdc.gov", retrieved: "2025-01-15" }
        ],
        ui_card: {
          title: "Rotavirus — 6 weeks",
          short_desc: "Prevents severe diarrhea",
          long_desc_html: "<p>Vaccine to prevent severe diarrhea caused by rotavirus.</p>"
        }
      }
    ];

    setVaccines(comprehensiveVaccines);
  };

  const loadVaccines = async () => {
    setIsLoading(true);
    try {
      const allVaccines = vaccineEngine.getAllVaccines();
      setVaccines(allVaccines);
    } catch (error) {
      console.error('Error loading vaccines:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsAiSearching(true);
    setAiSearchResult(null);
    
    try {
      const result = await searchVaccineWithAI(searchQuery);
      setAiSearchResult(result);
    } catch (error) {
      console.error('Error searching with AI:', error);
      
      // Fallback: Show a message that AI search is not available
      setAiSearchResult({
        name: searchQuery,
        description: "AI search is currently unavailable. Please try the regular search below or check your internet connection.",
        diseasesPrevented: [],
        ageGroups: [],
        schedule: "Information not available",
        sideEffects: [],
        contraindications: [],
        cost: "Please consult a healthcare provider",
        availability: "Please consult a healthcare provider",
        sources: [],
        confidence: 0.0
      });
    } finally {
      setIsAiSearching(false);
    }
  };

  const toggleVaccineTodo = (vaccineId: string) => {
    setVaccineTodos(prev => ({
      ...prev,
      [vaccineId]: !prev[vaccineId]
    }));
  };

  const filteredVaccines = vaccines.filter(vaccine => 
    vaccine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vaccine.diseases_prevented.some(disease => 
      disease.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );


  const getMandatoryStatusColor = (status: string) => {
    switch (status) {
      case 'mandatory': return 'bg-red-100 text-red-800';
      case 'recommended': return 'bg-blue-100 text-blue-800';
      case 'optional': return 'bg-gray-100 text-gray-800';
      case 'special_program': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-4 sm:py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Swasthik Vaccine Tracker</h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            Get personalized vaccination schedules and comprehensive vaccine information for India. 
            Stay up-to-date with the latest immunization guidelines from official health authorities.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="search" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-3">
              <span className="hidden sm:inline">Search Vaccines</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-3">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="info" className="text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-3">
              <span className="hidden sm:inline">Vaccine Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Vaccines Tab */}
          <TabsContent value="search" className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search vaccines by name or disease..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAiSearch();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleAiSearch}
                disabled={!searchQuery.trim() || isAiSearching}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
              >
                {isAiSearching ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">AI Search</span>
                    <span className="sm:hidden">Search</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">AI Search</span>
                    <span className="sm:hidden">Search</span>
                  </>
                )}
              </Button>
            </div>

            {/* AI Search Results */}
            {aiSearchResult && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <CardTitle className="text-blue-900 flex items-center space-x-2 text-sm sm:text-base">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="truncate">AI Search Result: {aiSearchResult.name}</span>
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm w-fit">
                      Confidence: {Math.round(aiSearchResult.confidence * 100)}%
                    </Badge>
                  </div>
                  <CardDescription className="text-blue-700 text-sm sm:text-base">
                    {aiSearchResult.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Prevents</h4>
                      <div className="flex flex-wrap gap-1">
                        {aiSearchResult.diseasesPrevented.map((disease, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {disease}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Age Groups</h4>
                      <div className="flex flex-wrap gap-1">
                        {aiSearchResult.ageGroups.map((age, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {age}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Schedule</h4>
                    <p className="text-xs sm:text-sm text-blue-800 break-words">{aiSearchResult.schedule}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Side Effects</h4>
                      <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                        {aiSearchResult.sideEffects.map((effect, index) => (
                          <li key={index} className="break-words">• {effect}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Contraindications</h4>
                      <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                        {aiSearchResult.contraindications.map((contra, index) => (
                          <li key={index} className="break-words">• {contra}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Cost</h4>
                      <p className="text-xs sm:text-sm text-blue-800 break-words">{aiSearchResult.cost}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Availability</h4>
                      <p className="text-xs sm:text-sm text-blue-800 break-words">{aiSearchResult.availability}</p>
                    </div>
                  </div>
                  
                  {aiSearchResult.sources.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Sources</h4>
                      <div className="flex flex-wrap gap-1">
                        {aiSearchResult.sources.map((source, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid gap-3 sm:gap-4">
              {filteredVaccines.map((vaccine) => (
                <Card key={vaccine.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg break-words">{vaccine.name}</CardTitle>
                        <CardDescription className="mt-1 text-sm sm:text-base break-words">
                          {vaccine.ui_card.short_desc}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${getMandatoryStatusColor(vaccine.mandatory_status)} text-xs`}>
                          {vaccine.mandatory_status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {vaccine.vaccine_type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-xs sm:text-sm text-gray-700 mb-1">Prevents:</h4>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {vaccine.diseases_prevented.join(', ')}
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="break-words">{vaccine.target_age_groups.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Syringe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="break-words">{vaccine.dosage_form}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="break-words">{vaccine.cost_estimate_inr.public}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVaccine(vaccine)}
                          className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>


          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            {/* Progress Overview */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <i className="fas fa-chart-pie text-blue-600"></i>
                  <span>My Vaccination Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {vaccineProgress.percentage}%
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                      <div className="font-semibold text-sm sm:text-base">{vaccineProgress.completed} of {vaccineProgress.total}</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                      style={{ width: `${vaccineProgress.percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">{vaccineProgress.completed}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <div className="text-lg sm:text-2xl font-bold text-orange-600">{vaccineProgress.remaining}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Remaining</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">{vaccineProgress.total}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vaccine Todo List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <i className="fas fa-tasks text-green-600"></i>
                  <span>My Vaccine Checklist</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Check off vaccines you've received to track your immunization progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {vaccines.map((vaccine) => (
                    <div 
                      key={vaccine.id}
                      className={`flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border transition-all ${
                        vaccineTodos[vaccine.id] 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => toggleVaccineTodo(vaccine.id)}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                          vaccineTodos[vaccine.id]
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {vaccineTodos[vaccine.id] && (
                          <i className="fas fa-check text-xs"></i>
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <h4 className={`font-medium text-sm sm:text-base break-words ${
                            vaccineTodos[vaccine.id] ? 'text-green-800 line-through' : 'text-gray-900'
                          }`}>
                            {vaccine.name}
                          </h4>
                          <Badge 
                            variant={vaccine.mandatory_status === 'mandatory' ? 'default' : 'secondary'}
                            className="text-xs w-fit"
                          >
                            {vaccine.mandatory_status}
                          </Badge>
                        </div>
                        <p className={`text-xs sm:text-sm break-words ${
                          vaccineTodos[vaccine.id] ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {vaccine.diseases_prevented.join(', ')}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
                          <span className={`text-xs ${
                            vaccineTodos[vaccine.id] ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            <i className="fas fa-calendar mr-1"></i>
                            {vaccine.schedule[0]?.timing || 'Check schedule'}
                          </span>
                          <span className={`text-xs ${
                            vaccineTodos[vaccine.id] ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            <i className="fas fa-rupee-sign mr-1"></i>
                            {vaccine.cost_estimate_inr.public === 'free' ? 'Free' : vaccine.cost_estimate_inr.private}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVaccine(vaccine)}
                          className="text-blue-600 hover:text-blue-700 p-1 sm:p-2"
                        >
                          <i className="fas fa-info-circle text-xs sm:text-sm"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Charts Section */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-800 flex items-center space-x-2 text-sm sm:text-base">
                  <i className="fas fa-chart-bar text-purple-600"></i>
                  <span>Vaccination Progress Charts</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Visual representation of your vaccination progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar Chart */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-purple-700 text-sm sm:text-base">Overall Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Completed: {vaccineProgress.completed}</span>
                      <span>Remaining: {vaccineProgress.remaining}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 sm:h-6">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-4 sm:h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-1 sm:pr-2"
                        style={{ width: `${vaccineProgress.percentage}%` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {vaccineProgress.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pie Chart Representation */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-purple-700 text-sm sm:text-base">Progress Distribution</h4>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                      {/* Pie Chart using CSS */}
                      <div className="absolute inset-0 rounded-full border-4 sm:border-8 border-gray-200"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 sm:border-8 border-green-500 transition-all duration-1000"
                        style={{
                          background: `conic-gradient(from 0deg, #10b981 0deg ${vaccineProgress.percentage * 3.6}deg, #e5e7eb ${vaccineProgress.percentage * 3.6}deg 360deg)`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg sm:text-2xl font-bold text-purple-800">
                            {vaccineProgress.percentage}%
                          </div>
                          <div className="text-xs sm:text-sm text-purple-600">Complete</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Age Group Progress */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-purple-700 text-sm sm:text-base">Progress by Age Group</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    {(() => {
                      const ageGroups = [
                        { name: 'Birth-6w', vaccines: vaccines.filter(v => v.target_age_groups.some(age => ['birth', '0-1m', '6w', '6-8w'].includes(age))) },
                        { name: '6w-6m', vaccines: vaccines.filter(v => v.target_age_groups.some(age => ['6w', '6-8w', '10w', '10-12w', '14w', '14-16w'].includes(age))) },
                        { name: '6m-1y', vaccines: vaccines.filter(v => v.target_age_groups.some(age => ['9m', '9-12m', '12m', '12-15m'].includes(age))) },
                        { name: '1y+', vaccines: vaccines.filter(v => v.target_age_groups.some(age => ['1-2y', '2-5y', '5-18y', '18+', '60+'].includes(age))) }
                      ];

                      return ageGroups.map((group, index) => {
                        const completedInGroup = group.vaccines.filter(v => vaccineTodos[v.id]).length;
                        const totalInGroup = group.vaccines.length;
                        const groupPercentage = totalInGroup > 0 ? Math.round((completedInGroup / totalInGroup) * 100) : 0;
                        
                        return (
                          <div key={index} className="text-center">
                            <div className="text-sm sm:text-lg font-bold text-purple-800">{groupPercentage}%</div>
                            <div className="text-xs sm:text-sm text-purple-600">{group.name}</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-1">
                              <div 
                                className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 sm:h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${groupPercentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {completedInGroup}/{totalInGroup}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Monthly Progress Timeline */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-purple-700 text-sm sm:text-base">Vaccination Timeline</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {(() => {
                      const timelineData = [
                        { month: 'Birth', vaccines: ['BCG', 'Hepatitis B (First Dose)'] },
                        { month: '6 Weeks', vaccines: ['DPT (First Dose)', 'OPV (First Dose)', 'IPV (First Dose)', 'Hib (First Dose)', 'PCV (First Dose)', 'Rotavirus (First Dose)'] },
                        { month: '10 Weeks', vaccines: ['DPT (Second Dose)', 'OPV (Second Dose)', 'Hib (Second Dose)'] },
                        { month: '14 Weeks', vaccines: ['DPT (Third Dose)', 'OPV (Third Dose)', 'IPV (Second Dose)', 'Hib (Third Dose)'] },
                        { month: '9 Months', vaccines: ['MMR (First Dose)'] },
                        { month: '12-15 Months', vaccines: ['Varicella (First Dose)'] }
                      ];

                      return timelineData.map((timeline, index) => {
                        const completedInTimeline = timeline.vaccines.filter(vaccineName => {
                          const vaccine = vaccines.find(v => v.name === vaccineName);
                          return vaccine && vaccineTodos[vaccine.id];
                        }).length;
                        const totalInTimeline = timeline.vaccines.length;
                        const timelinePercentage = totalInTimeline > 0 ? Math.round((completedInTimeline / totalInTimeline) * 100) : 0;

                        return (
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="w-16 sm:w-20 text-xs sm:text-sm font-medium text-purple-700">{timeline.month}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-4">
                              <div 
                                className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 sm:h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-1 sm:pr-2"
                                style={{ width: `${timelinePercentage}%` }}
                              >
                                <span className="text-white text-xs font-medium">
                                  {timelinePercentage}%
                                </span>
                              </div>
                            </div>
                            <div className="w-12 sm:w-16 text-xs text-gray-600 text-right">
                              {completedInTimeline}/{totalInTimeline}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed vs Remaining Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Completed Vaccines */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-green-800 flex items-center space-x-2 text-sm sm:text-base">
                    <i className="fas fa-check-circle text-green-600"></i>
                    <span>Completed Vaccines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 sm:space-y-2">
                    {vaccines.filter(v => vaccineTodos[v.id]).length > 0 ? (
                      vaccines
                        .filter(v => vaccineTodos[v.id])
                        .map(vaccine => (
                          <div key={vaccine.id} className="flex items-center space-x-2 text-xs sm:text-sm">
                            <i className="fas fa-check text-green-600"></i>
                            <span className="text-green-800 break-words">{vaccine.name}</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-green-600 text-xs sm:text-sm">No vaccines completed yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Remaining Vaccines */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-orange-800 flex items-center space-x-2 text-sm sm:text-base">
                    <i className="fas fa-clock text-orange-600"></i>
                    <span>Remaining Vaccines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 sm:space-y-2">
                    {vaccines.filter(v => !vaccineTodos[v.id]).length > 0 ? (
                      vaccines
                        .filter(v => !vaccineTodos[v.id])
                        .map(vaccine => (
                          <div key={vaccine.id} className="flex items-center space-x-2 text-xs sm:text-sm">
                            <i className="fas fa-circle text-orange-600"></i>
                            <span className="text-orange-800 break-words">{vaccine.name}</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-orange-600 text-xs sm:text-sm">All vaccines completed! 🎉</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>

          {/* Vaccine Info Tab */}
          <TabsContent value="info" className="space-y-4 sm:space-y-6">
            {/* Header Section */}
            <div className="text-center py-6 sm:py-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 px-4">
                Complete Vaccination Guide for India
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                Comprehensive vaccination schedule from birth to old age, following 
                Universal Immunization Programme (UIP) and WHO guidelines for India.
              </p>
            </div>

            {/* Information Banner */}
            <Alert>
              <Info className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">
                Swasthik Vaccine Engine provides up-to-date vaccine information for India, 
                sourced from official health authorities like MoHFW, UIP, WHO, and ICMR.
              </AlertDescription>
            </Alert>

            {/* Age-based Vaccination Schedule */}
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 text-center px-4">
                Vaccination Schedule by Age Group
              </h4>

              {/* Birth to 6 weeks */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-800 flex items-center space-x-2 text-sm sm:text-base">
                    <i className="fas fa-baby text-green-600"></i>
                    <span>Birth to 6 Weeks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-green-700 text-sm sm:text-base">BCG (Bacillus Calmette-Guérin)</h5>
                      <p className="text-xs sm:text-sm text-green-600">Prevents tuberculosis (TB)</p>
                      <p className="text-xs text-gray-600">Given at birth or within 1 year</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-green-700 text-sm sm:text-base">Hepatitis B (Hep B)</h5>
                      <p className="text-xs sm:text-sm text-green-600">Prevents hepatitis B infection</p>
                      <p className="text-xs text-gray-600">First dose at birth, 2nd at 6 weeks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 6 weeks to 6 months */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center space-x-2">
                    <i className="fas fa-child text-blue-600"></i>
                    <span>6 Weeks to 6 Months</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-blue-700">DPT (Diphtheria, Pertussis, Tetanus)</h5>
                      <p className="text-sm text-blue-600">Prevents diphtheria, whooping cough, tetanus</p>
                      <p className="text-xs text-gray-600">3 doses: 6, 10, 14 weeks</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-blue-700">OPV (Oral Polio Vaccine)</h5>
                      <p className="text-sm text-blue-600">Prevents polio</p>
                      <p className="text-xs text-gray-600">3 doses: 6, 10, 14 weeks</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-blue-700">IPV (Inactivated Polio Vaccine)</h5>
                      <p className="text-sm text-blue-600">Additional polio protection</p>
                      <p className="text-xs text-gray-600">2 doses: 6, 14 weeks</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-blue-700">Hib (Haemophilus influenzae type b)</h5>
                      <p className="text-sm text-blue-600">Prevents Hib infections</p>
                      <p className="text-xs text-gray-600">3 doses: 6, 10, 14 weeks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 6 months to 1 year */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-800 flex items-center space-x-2">
                    <i className="fas fa-baby-carriage text-purple-600"></i>
                    <span>6 Months to 1 Year</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-purple-700">Measles, Mumps, Rubella (MMR)</h5>
                      <p className="text-sm text-purple-600">Prevents measles, mumps, rubella</p>
                      <p className="text-xs text-gray-600">First dose at 9 months</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-purple-700">Varicella (Chickenpox)</h5>
                      <p className="text-sm text-purple-600">Prevents chickenpox</p>
                      <p className="text-xs text-gray-600">2 doses: 12-15 months</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-purple-700">Pneumococcal Conjugate (PCV)</h5>
                      <p className="text-sm text-purple-600">Prevents pneumococcal disease</p>
                      <p className="text-xs text-gray-600">3 doses: 6, 10, 14 weeks</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-purple-700">Rotavirus</h5>
                      <p className="text-sm text-purple-600">Prevents severe diarrhea</p>
                      <p className="text-xs text-gray-600">3 doses: 6, 10, 14 weeks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 1-2 years */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center space-x-2">
                    <i className="fas fa-toddler text-orange-600"></i>
                    <span>1-2 Years</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-orange-700">DPT Booster</h5>
                      <p className="text-sm text-orange-600">Booster for diphtheria, pertussis, tetanus</p>
                      <p className="text-xs text-gray-600">16-18 months</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-orange-700">OPV Booster</h5>
                      <p className="text-sm text-orange-600">Booster for polio</p>
                      <p className="text-xs text-gray-600">16-18 months</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-orange-700">Hib Booster</h5>
                      <p className="text-sm text-orange-600">Booster for Hib infections</p>
                      <p className="text-xs text-gray-600">16-18 months</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-orange-700">MMR Second Dose</h5>
                      <p className="text-sm text-orange-600">Second dose of MMR</p>
                      <p className="text-xs text-gray-600">15-18 months</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2-5 years */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center space-x-2">
                    <i className="fas fa-child text-yellow-600"></i>
                    <span>2-5 Years</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-yellow-700">DPT Booster</h5>
                      <p className="text-sm text-yellow-600">Second booster for DPT</p>
                      <p className="text-xs text-gray-600">4-6 years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-yellow-700">OPV Booster</h5>
                      <p className="text-sm text-yellow-600">Second booster for polio</p>
                      <p className="text-xs text-gray-600">4-6 years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-yellow-700">Typhoid</h5>
                      <p className="text-sm text-yellow-600">Prevents typhoid fever</p>
                      <p className="text-xs text-gray-600">2-3 years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-yellow-700">Hepatitis A</h5>
                      <p className="text-sm text-yellow-600">Prevents hepatitis A</p>
                      <p className="text-xs text-gray-600">2 doses: 2-3 years</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5-18 years */}
              <Card className="border-indigo-200 bg-indigo-50">
                <CardHeader>
                  <CardTitle className="text-indigo-800 flex items-center space-x-2">
                    <i className="fas fa-user-graduate text-indigo-600"></i>
                    <span>5-18 Years (School Age)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-indigo-700">Tdap (Tetanus, Diphtheria, Pertussis)</h5>
                      <p className="text-sm text-indigo-600">Booster for tetanus, diphtheria, pertussis</p>
                      <p className="text-xs text-gray-600">11-12 years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-indigo-700">HPV (Human Papillomavirus)</h5>
                      <p className="text-sm text-indigo-600">Prevents cervical cancer (girls)</p>
                      <p className="text-xs text-gray-600">11-12 years (2-3 doses)</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-indigo-700">Meningococcal</h5>
                      <p className="text-sm text-indigo-600">Prevents meningococcal disease</p>
                      <p className="text-xs text-gray-600">11-12 years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-indigo-700">Influenza (Flu)</h5>
                      <p className="text-sm text-indigo-600">Prevents seasonal flu</p>
                      <p className="text-xs text-gray-600">Annual vaccination</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 18+ years (Adults) */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center space-x-2">
                    <i className="fas fa-user text-red-600"></i>
                    <span>18+ Years (Adults)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-red-700">Td (Tetanus, Diphtheria)</h5>
                      <p className="text-sm text-red-600">Booster every 10 years</p>
                      <p className="text-xs text-gray-600">18+ years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-red-700">COVID-19</h5>
                      <p className="text-sm text-red-600">Prevents COVID-19 infection</p>
                      <p className="text-xs text-gray-600">As recommended by government</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-red-700">Influenza (Flu)</h5>
                      <p className="text-sm text-red-600">Annual flu vaccination</p>
                      <p className="text-xs text-gray-600">Especially for high-risk groups</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-red-700">Pneumococcal (PPSV23)</h5>
                      <p className="text-sm text-red-600">Prevents pneumococcal disease</p>
                      <p className="text-xs text-gray-600">65+ years or high-risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 60+ years (Elderly) */}
              <Card className="border-gray-200 bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center space-x-2">
                    <i className="fas fa-user-friends text-gray-600"></i>
                    <span>60+ Years (Elderly)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-700">Td Booster</h5>
                      <p className="text-sm text-gray-600">Tetanus and diphtheria booster</p>
                      <p className="text-xs text-gray-600">Every 10 years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-700">Pneumococcal (PCV13 + PPSV23)</h5>
                      <p className="text-sm text-gray-600">Prevents pneumococcal disease</p>
                      <p className="text-xs text-gray-600">65+ years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-700">Shingles (Herpes Zoster)</h5>
                      <p className="text-sm text-gray-600">Prevents shingles</p>
                      <p className="text-xs text-gray-600">50+ years</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-700">Influenza (High-dose)</h5>
                      <p className="text-sm text-gray-600">High-dose flu vaccine</p>
                      <p className="text-xs text-gray-600">65+ years</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Important Notes */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800 flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle text-amber-600"></i>
                  <span>Important Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-amber-700 mb-2">Government vs. Private</h5>
                    <ul className="text-sm text-amber-600 space-y-1">
                      <li>• Government vaccines are FREE at public health centers</li>
                      <li>• Private vaccines cost ₹200-₹2000 depending on type</li>
                      <li>• Some vaccines are only available privately</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-amber-700 mb-2">Safety & Side Effects</h5>
                    <ul className="text-sm text-amber-600 space-y-1">
                      <li>• Most side effects are mild (fever, soreness)</li>
                      <li>• Serious side effects are very rare</li>
                      <li>• Always consult your doctor before vaccination</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Call to Action */}
              <div className="text-center py-4 sm:py-6">
                <div className="space-y-3 sm:space-y-4">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
                    onClick={() => {
                      setActiveTab('search');
                    }}
                  >
                    <i className="fas fa-search mr-2"></i>
                    Search My Vaccination Status
                  </Button>
                  
                  <div className="text-xs sm:text-sm text-gray-600 px-4">
                    <p>Use AI search to check specific vaccines or browse all available vaccines</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setActiveTab('search');
                      }}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <i className="fas fa-list mr-2"></i>
                      Browse All Vaccines
                    </Button>
                  </div>
                </div>
              </div>
          </TabsContent>
        </Tabs>

        {/* Vaccine Detail Modal */}
        {selectedVaccine && (
          <Dialog open={!!selectedVaccine} onOpenChange={() => setSelectedVaccine(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>{selectedVaccine.name}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Vaccine Type</h4>
                    <Badge variant="outline">{selectedVaccine.vaccine_type}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <Badge className={getMandatoryStatusColor(selectedVaccine.mandatory_status)}>
                      {selectedVaccine.mandatory_status}
                    </Badge>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h4 className="font-medium mb-3">Vaccination Schedule</h4>
                  <div className="space-y-2">
                    {selectedVaccine.schedule.map((dose, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {dose.dose_number}
                          </div>
                          <div>
                            <p className="font-medium">{dose.timing}</p>
                            {dose.notes && (
                              <p className="text-sm text-gray-600">{dose.notes}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Prevents</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedVaccine.diseases_prevented.map((disease, index) => (
                        <li key={index}>• {disease}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Target Age Groups</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedVaccine.target_age_groups.map((age, index) => (
                        <Badge key={index} variant="secondary">{age}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Common Side Effects</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedVaccine.common_side_effects.map((effect, index) => (
                        <li key={index}>• {effect}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Cost Estimate</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Public: {selectedVaccine.cost_estimate_inr.public}</p>
                      <p>Private: {selectedVaccine.cost_estimate_inr.private}</p>
                    </div>
                  </div>
                </div>

                {/* Storage Requirements */}
                <div>
                  <h4 className="font-medium mb-2">Storage Requirements</h4>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{selectedVaccine.storage_requirements}</span>
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <h4 className="font-medium mb-2">Sources</h4>
                  <div className="space-y-1">
                    {selectedVaccine.sources.map((source, index) => (
                      <div key={index} className="text-sm">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {source.title}
                        </a>
                        <span className="text-gray-500 ml-2">({source.retrieved})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
