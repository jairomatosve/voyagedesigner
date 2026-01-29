# VoyageDesigner

## Overview

VoyageDesigner is an AI-powered travel planning mobile application built with Expo/React Native. The app enables users to create trips, generate intelligent itineraries using AI, track budgets, and dynamically reoptimize plans when activities are skipped or plans change. The application supports multiple languages (English, Spanish, Portuguese, French) and runs on iOS, Android, and Web platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation v7 with native stack navigators and bottom tabs
- **State Management**: Zustand for global state with AsyncStorage/SecureStore persistence
- **Styling**: Custom theme system with light/dark mode support using React Native StyleSheet
- **Animations**: React Native Reanimated for fluid animations and gestures
- **Internationalization**: i18next with react-i18next for multi-language support (en, es, pt, fr)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Structure**: RESTful endpoints prefixed with `/api`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration

### Directory Structure
```
client/           # React Native/Expo frontend
├── components/   # Reusable UI components
├── screens/      # Screen components
├── navigation/   # React Navigation setup
├── store/        # Zustand state management
├── hooks/        # Custom React hooks
├── i18n/         # Internationalization config
├── locales/      # Translation JSON files
├── constants/    # Theme and design tokens
└── types/        # TypeScript type definitions

server/           # Express backend
├── index.ts      # Server entry point
├── routes.ts     # API route registration
└── storage.ts    # Data storage interface

shared/           # Shared code between client/server
└── schema.ts     # Drizzle database schema
```

### Key Design Patterns
- **Component Architecture**: Themed components (ThemedText, ThemedView) that adapt to light/dark modes
- **Navigation Pattern**: Root stack with authentication flow, main tab navigator with nested stacks
- **State Persistence**: Secure storage for sensitive data, async storage for preferences
- **Error Handling**: ErrorBoundary component with development-mode debugging

### Data Flow
1. User interactions trigger Zustand store actions
2. Store persists state to AsyncStorage/SecureStore
3. API calls use TanStack Query for server state management
4. Backend routes handle business logic with Drizzle ORM for database operations

## External Dependencies

### Database
- **PostgreSQL**: Primary database via Drizzle ORM
- **Drizzle Kit**: Database migrations and schema management

### AI Services (Planned)
- **OpenAI GPT-4o Mini**: Itinerary generation
- **Anthropic Claude Haiku**: Smart reoptimization when plans change

### External APIs (Planned)
- **Google Maps**: Distance calculations and location services
- **OpenWeather**: Weather data for trip planning

### Development Tools
- **TanStack Query**: Server state management and caching
- **Expo modules**: expo-secure-store, expo-haptics, expo-image, expo-linear-gradient
- **React Native Keyboard Controller**: Keyboard-aware input handling

### Build & Deployment
- **Expo**: Build system for iOS/Android/Web
- **esbuild**: Server-side TypeScript bundling
- **Metro**: React Native bundler with Replit proxy configuration