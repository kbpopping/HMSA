# HMSA Clinician Portal

Clinician and staff portal for the Hospital Management System Admin (HMSA) application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The portal will be available at http://localhost:5175

## Port Configuration

- Super Admin Portal: http://localhost:5173
- Hospital Admin Portal: http://localhost:5174
- **Clinician Portal**: http://localhost:5175

## Backend Integration

This portal shares the same backend API and database as the hospital admin and super admin portals.

API Base URL: `http://localhost:8082`

## Features

- Forced password change on first login
- Comprehensive onboarding flow
- Role-based patient access
- Appointments management
- Earnings tracking
- Availability settings
- Profile and document management

## Tech Stack

- React 18
- TypeScript
- Vite
- TanStack Query
- Zustand (State Management)
- React Router
- Tailwind CSS
- Recharts (Charts)
- React Hook Form + Zod (Forms)

