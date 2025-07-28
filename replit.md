# AI Chat Application

## Overview

This is a full-stack AI chat application built with React, Express.js, and TypeScript. The application provides a ChatGPT-like interface where users can have conversations with an AI assistant that supports text and image inputs. The system is designed with a modular architecture separating frontend, backend, and shared components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system (shadcn/ui components)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Comprehensive set of Radix UI-based components

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful API with JSON responses
- **File Uploads**: Multer for handling image uploads (up to 10MB)
- **AI Integration**: OpenAI API for chat completions (GPT-4o model)
- **Development**: Hot reloading with Vite integration

### Data Storage Strategy
- **Database**: PostgreSQL with Drizzle ORM
- **Development Storage**: In-memory storage implementation for development
- **Schema**: Separate conversations and messages tables with proper relationships

## Key Components

### Core Chat Features
1. **Conversation Management**: Create, list, and delete chat conversations
2. **Message System**: Send text and image messages with AI responses
3. **File Upload**: Support for image attachments in conversations
4. **Real-time UI**: Typing indicators and smooth message rendering

### UI Components
1. **Chat Interface**: Modern chat UI with message bubbles and input area
2. **Sidebar Navigation**: Conversation list with mobile-responsive design
3. **Theme System**: Light/dark mode toggle with persistent preferences
4. **Responsive Design**: Mobile-first approach with adaptive layouts

### Shared Schema
- **Type Safety**: Zod validation schemas shared between frontend and backend
- **Database Schema**: Drizzle ORM schema definitions with PostgreSQL types
- **API Contracts**: Consistent data structures across the application

## Data Flow

### Message Flow
1. User types message in chat input
2. Frontend sends POST request to `/api/conversations/{id}/messages`
3. Backend validates input and creates user message
4. Backend calls OpenAI API for AI response
5. Backend stores AI response and returns both messages
6. Frontend updates UI with new messages

### Conversation Flow
1. User creates new conversation via UI
2. Frontend sends POST request to `/api/conversations`
3. Backend creates conversation with default title
4. Frontend navigates to new conversation
5. Messages are loaded and displayed in real-time

### File Upload Flow
1. User selects images in chat input
2. Files are validated (size, type) on frontend
3. FormData with message content and images sent to backend
4. Backend processes files using Multer
5. Images are included in OpenAI API request for vision analysis

## External Dependencies

### Core Runtime Dependencies
- **OpenAI**: GPT-4o model for chat completions and vision analysis
- **Neon Database**: PostgreSQL hosting (configured for production)
- **Drizzle ORM**: Type-safe database operations and migrations

### Frontend Libraries
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation

### Development Tools
- **TypeScript**: Static type checking across the stack
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Static Serving**: Express serves frontend build in production

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Single Express server serves both API and static files
- **Database**: Environment-based connection string configuration

### Key Scripts
- `npm run dev`: Start development server with hot reloading
- `npm run build`: Build both frontend and backend for production
- `npm run start`: Start production server
- `npm run db:push`: Push database schema changes

### Production Considerations
- Static file serving with proper caching headers
- Error handling middleware for graceful failure responses
- Request logging for API monitoring
- File upload limits and validation for security