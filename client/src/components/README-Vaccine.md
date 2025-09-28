# Swasthik Vaccine Engine

A comprehensive vaccine tracking and management system for India, built as part of the Swasthik healthcare application.

## Features

### 🛡️ Core Functionality
- **Vaccine Database**: Comprehensive database of vaccines available in India
- **Personalized Schedules**: Generate custom vaccination schedules based on age, medical conditions, and history
- **Verification System**: Verify vaccine information against official sources (MoHFW, WHO, ICMR)
- **Real-time Analytics**: Track verification status, confidence levels, and database health
- **Multi-language Support**: Available in English, Hindi, and other Indian languages

### 📊 System Architecture

#### 1. System Prompt & Constraints
The vaccine engine operates with a comprehensive system prompt that ensures:
- Accuracy and up-to-date information
- Citation of official sources
- No hallucination of specific guidelines or dates
- Confidence scoring (0.0-1.0)
- Source verification with URLs and retrieval dates

#### 2. JSON Schema
Strict adherence to a comprehensive JSON schema including:
- Vaccine identification and metadata
- Scheduling information
- Indications and contraindications
- Cost estimates (public/private)
- Regional variations
- Verification status and confidence levels
- UI-ready content for display

#### 3. Verification Pipeline
Two-step verification process:
1. **Generator Model**: Creates candidate vaccine records
2. **Verifier Model**: Validates against official sources

### 🏗️ Component Structure

```
client/src/
├── lib/
│   ├── vaccine.ts                 # Core vaccine engine and data structures
│   └── vaccineVerification.ts     # Verification service and caching
├── components/
│   ├── VaccineTracker.tsx         # Main vaccine tracking interface
│   ├── VaccineAnalytics.tsx       # Analytics and reporting dashboard
│   └── README-Vaccine.md          # This documentation
└── pages/
    └── vaccine-tracker-page.tsx   # Vaccine tracker page
```

### 🔧 Key Components

#### VaccineTracker
Main interface with four tabs:
- **Search Vaccines**: Browse and search vaccine database
- **My Schedule**: Generate personalized vaccination schedules
- **Analytics**: View verification status and database analytics
- **Vaccine Info**: Learn about the vaccine system and sources

#### VaccineAnalytics
Comprehensive analytics dashboard featuring:
- Verification status charts
- Confidence level tracking
- Source reliability metrics
- Real-time database health monitoring

#### VaccineEngine (Singleton)
Core engine providing:
- Vaccine database management
- Personalized schedule generation
- Search and filtering capabilities
- Age-based calculations

#### VaccineVerificationService
Handles verification with:
- Source validation against trusted domains
- Caching with configurable TTL
- Batch verification capabilities
- Confidence scoring

### 📋 Data Sources

Trusted sources in order of preference:
1. **MoHFW** (mohfw.gov.in) - Ministry of Health & Family Welfare
2. **NHM** (nhm.gov.in) - National Health Mission
3. **WHO** (who.int) - World Health Organization
4. **ICMR** (icmr.gov.in) - Indian Council of Medical Research
5. **State Health Departments** - Regional variations

### 🎯 Usage Examples

#### Generate Personalized Schedule
```typescript
const schedule = await vaccineEngine.generatePersonalizedSchedule(
  '2000-01-15', // Date of birth
  [{ vaccine_name: 'BCG', date_given: '2000-01-15' }], // History
  ['pregnant'] // Medical conditions
);
```

#### Verify Vaccine Information
```typescript
const verification = await vaccineVerificationService.verifyVaccine('bcg');
console.log(verification.verified); // true/false
console.log(verification.confidence); // 0.0-1.0
```

#### Search Vaccines
```typescript
const results = vaccineEngine.searchVaccines('hepatitis');
const allVaccines = vaccineEngine.getAllVaccines();
```

### 🔒 Security & Privacy

- **Data Encryption**: Vaccination history encrypted at rest
- **Source Verification**: All sources validated against whitelist
- **Confidence Scoring**: Transparent confidence levels for all data
- **Audit Trail**: Complete source tracking with retrieval dates

### 🌍 Localization

- **Multi-language Support**: English, Hindi, Bengali, Tamil, Telugu, Marathi
- **Regional Variations**: State-specific vaccination programs
- **Cultural Sensitivity**: Appropriate for Indian healthcare context

### 📈 Performance

- **Caching**: Intelligent caching with 7-day TTL
- **Batch Operations**: Efficient bulk verification
- **Lazy Loading**: On-demand data loading
- **Responsive Design**: Mobile-first approach

### 🚀 Future Enhancements

- **AI Integration**: Real-time AI model integration for dynamic updates
- **API Integration**: Direct integration with health authority APIs
- **Push Notifications**: Vaccine reminder notifications
- **Offline Support**: Offline vaccine database access
- **Integration**: EHR and hospital system integration

### 🛠️ Development

#### Adding New Vaccines
1. Add vaccine record to `initializeDatabase()` in `vaccine.ts`
2. Follow the `VaccineRecord` interface schema
3. Include proper sources and verification data
4. Test with verification service

#### Customizing Verification
1. Modify `performVerification()` in `vaccineVerification.ts`
2. Add new trusted sources to `TRUSTED_SOURCES`
3. Update verification logic as needed

#### UI Customization
1. Modify components in `components/` directory
2. Update translations in `utils/translations.ts`
3. Customize styling with Tailwind CSS

### 📞 Support

For technical support or feature requests, please refer to the main Swasthik documentation or contact the development team.

---

**Note**: This vaccine engine is designed specifically for the Indian healthcare system and follows official guidelines from MoHFW, UIP, WHO, and ICMR. Always consult with healthcare professionals for medical advice.
