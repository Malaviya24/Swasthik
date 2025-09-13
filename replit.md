# Overview

Swasthik is an AI-powered healthcare chatbot web application designed specifically for rural and semi-urban communities. The application provides multilingual health assistance, symptom checking, medication information, voice interactions, and image analysis capabilities. It aims to achieve 80% accuracy in health query responses while maintaining appropriate medical disclaimers and encouraging users to consult healthcare professionals for serious concerns.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React hooks with custom state management for chat functionality
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management and caching

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Uploads**: Multer middleware for handling multipart form data
- **Authentication**: Firebase Authentication for user management
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple

## Database Design
- **Users Table**: Stores user profiles with Firebase UID integration, display names, preferred languages
- **Conversations Table**: Manages chat sessions with timestamps and user associations
- **Messages Table**: Stores individual chat messages with role-based content (user/assistant), message types (text/image/voice), and metadata
- **Reminders Table**: Handles healthcare reminders with scheduling and completion tracking
- **Health Records Table**: Stores symptom checks, medication lookups, and image analysis results

## AI Integration
- **Primary AI Service**: Google Gemini 2.5 Flash API for natural language processing and generation
- **Capabilities**: Text generation, image analysis, voice transcription, and audio synthesis
- **Context Management**: Conversation history maintenance with intelligent prompt engineering
- **Safety Measures**: Built-in medical disclaimers and encouragement to consult healthcare professionals

## Authentication & Authorization
- **Provider**: Firebase Authentication with Google OAuth integration
- **Session Handling**: Server-side session management with secure cookie storage
- **User Context**: Global authentication state management via React context

## Real-time Features
- **Voice Recording**: Browser-based speech recognition with WebRTC media capture
- **File Upload**: Client-side image processing and analysis
- **Responsive Chat**: Real-time message streaming with typing indicators
- **Mobile Optimization**: Touch-friendly interface with responsive design patterns

# External Dependencies

## Core AI Services
- **Google Gemini API**: Primary AI model for natural language understanding and generation
- **Firebase Suite**: Authentication, Firestore for data persistence, and cloud storage

## Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database queries and schema management

## Frontend Libraries
- **Radix UI**: Headless component primitives for accessibility and customization
- **Framer Motion**: Animation library for smooth user interactions
- **React Hook Form**: Form state management with validation
- **Date-fns**: Date manipulation and formatting utilities

## Development Tools
- **Vite**: Fast development server and build tool with HMR
- **Replit Integration**: Development environment plugins for cartographer and dev banner
- **ESBuild**: JavaScript bundling for production builds

## Styling & Design
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Google Fonts**: Typography with Inter font family
- **Font Awesome**: Icon library for UI elements

## Validation & Type Safety
- **Zod**: Schema validation for API requests and database operations
- **TypeScript**: Static type checking across the entire application stack