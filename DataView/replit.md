# DataViz Pro - Analytics Dashboard

## Overview

DataViz Pro is a modern, responsive web application that serves as a comprehensive data dashboard and reporting tool. The application allows users to import data from multiple sources (CSV uploads and Firebase Firestore), automatically generates interactive visualizations, and provides AI-powered insights for data analysis. Built with React, TypeScript, and Express.js, it features a professional turquoise-black-white color scheme and offers export capabilities for both PDF reports and CSV data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom turquoise color palette and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Chart Library**: Chart.js for data visualizations and interactive charts

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful API with dedicated endpoints for AI insights and dashboard data management
- **Storage**: In-memory storage implementation with interface for future database integration
- **AI Integration**: OpenAI GPT-4o integration for automated data analysis and insight generation

### Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL with schema definitions
- **Current Storage**: Memory-based storage for development with planned PostgreSQL migration
- **Schema Design**: Structured tables for users, dashboard data, and AI insights with proper relationships

### Authentication and Authorization
- **User Management**: Basic user schema with username/password authentication
- **Session Management**: Express session handling with PostgreSQL session store configuration
- **Data Isolation**: User-specific dashboard data with proper foreign key relationships

### External Service Integrations
- **Firebase**: Direct Firestore integration for real-time data fetching using project ID and collection name
- **OpenAI**: AI-powered data analysis using GPT-4o for trend detection, anomaly identification, and recommendations
- **PDF Generation**: jsPDF with html2canvas for comprehensive dashboard report exports
- **CSV Processing**: Custom CSV parser with data type inference and validation

### Key Design Patterns
- **Component Architecture**: Modular dashboard components (KPI cards, charts, data tables, AI insights)
- **Data Flow**: Unidirectional data flow with React Query for caching and synchronization
- **Error Handling**: Comprehensive error boundaries and toast notifications for user feedback
- **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities
- **Real-time Updates**: Firebase real-time listeners for live data synchronization

### Performance Optimizations
- **Code Splitting**: Vite-based bundling with automatic code splitting
- **Query Caching**: TanStack Query with intelligent cache management
- **Chart Optimization**: Chart.js with performance-optimized rendering for large datasets
- **Memory Management**: Proper cleanup of chart instances and event listeners

## External Dependencies

### Core Technologies
- React 18.x with TypeScript for type-safe component development
- Express.js for backend API server with middleware support
- Drizzle ORM with PostgreSQL for robust data persistence
- Vite for fast development and optimized production builds

### UI and Styling
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system
- Lucide React for consistent iconography

### Data Visualization
- Chart.js for interactive charts (bar, line, pie, donut charts)
- jsPDF and html2canvas for PDF report generation with charts
- Custom CSV parser with Papa Parse for data import

### External APIs
- OpenAI API (GPT-4o) for AI-powered data analysis and insights
- Firebase SDK for Firestore data integration and real-time updates
- Neon Database (PostgreSQL) for production data storage

### Development Tools
- TypeScript for type safety and better developer experience
- TanStack Query for server state management and caching
- React Hook Form with Zod validation for form handling
- Wouter for lightweight routing without React Router overhead