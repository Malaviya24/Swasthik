# Swasthik - AI Healthcare Assistant

## Overview

Swasthik is a comprehensive AI-powered healthcare assistant designed specifically for rural and semi-urban communities across India. The application provides 24/7 health guidance through an intelligent chatbot powered by Google Gemini AI, featuring multilingual support in 6 Indian languages. Key capabilities include symptom analysis, medication information lookup, health center finder with geolocation, voice interaction, image analysis for health conditions, and personalized health reminders. The system maintains conversation history and provides contextual health recommendations while always including appropriate medical disclaimers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: React 18.3.1 with TypeScript and Vite for build tooling
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **State Management**: TanStack React Query for server state and local React state for UI
- **Routing**: Wouter for lightweight client-side routing
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Backend Architecture
- **Framework**: Express.js server with TypeScript
- **Development Mode**: Full-stack development server with Vite middleware
- **Production Mode**: Separate frontend (static) and backend (API) deployment
- **API Structure**: RESTful endpoints for chat, symptom analysis, medication lookup, and health centers
- **File Handling**: Multer middleware for image and audio uploads with 5MB size limits

### Database Design
- **ORM**: Drizzle with PostgreSQL support
- **Schema**: Users, conversations, messages, reminders, and health records
- **Session Management**: Session-based authentication with potential for Firebase Auth
- **Data Models**: Structured for healthcare data with proper relationships and constraints

### AI Integration
- **Primary AI**: Google Gemini API for chat responses, image analysis, and voice transcription
- **Context Management**: Maintains conversation history for coherent interactions
- **Multilingual Support**: Dynamic language switching with translation utilities
- **Safety**: Medical disclaimers and appropriate health guidance protocols

### Authentication Strategy
- **Primary**: Firebase Authentication with Google OAuth
- **Fallback**: Can operate without authentication for basic functionality
- **User Management**: Profile management with language preferences and health records

### Deployment Configuration
- **Frontend**: Vercel deployment with static build output
- **Backend**: Render deployment with serverless function support
- **Environment**: Separate development and production configurations
- **Build Process**: Optimized bundling with esbuild for backend and Vite for frontend

## External Dependencies

### AI and Machine Learning
- **Google Gemini AI**: Core AI functionality for chat, image analysis, and transcription
- **Speechmatics API**: Optional advanced speech-to-text capabilities

### Location and Maps
- **LocationIQ API**: Geocoding and health center location services
- **Browser Geolocation**: User location detection for nearby health centers

### News and Information
- **NewsData API**: Real-time health news and information updates

### Database and Storage
- **Neon Database**: Serverless PostgreSQL for production data
- **Firebase Firestore**: User authentication and profile management
- **Local Storage**: Language preferences and temporary data

### Development and Deployment
- **Vercel**: Frontend hosting and serverless functions
- **Render**: Backend API hosting
- **Railway**: Alternative deployment platform support

### UI and Components
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library
- **Framer Motion**: Animation and transitions