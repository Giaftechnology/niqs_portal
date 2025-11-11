# Logbook System

A React + TypeScript logbook management system for students and supervisors built with Tailwind CSS.

## Features

- **Login Page**: Authentication interface with gradient styling
- **Student Dashboard**: View progress, supervision status, and logbook access
- **Supervisor Selection**: Browse and select supervisors
- **Supervisor Dashboard**: Review and supervise student entries
- **New Student Entry**: View student's logbook entries by week

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components (each in own folder)
│   ├── Login/
│   ├── StudentDashboard/
│   ├── SupervisorSelection/
│   ├── SupervisorDashboard/
│   └── NewStudentEntry/
├── types/           # TypeScript type definitions
│   └── index.ts
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── App.tsx          # Main app component
├── index.tsx        # Entry point
└── index.css        # Global styles with Tailwind
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Navigation Flow

1. **Login** (`/login`) → Student Dashboard
2. **Student Dashboard** (`/student-dashboard`) → Supervisor Selection or Sign Out
3. **Supervisor Selection** (`/supervisor-selection`) → Supervisor Dashboard
4. **Supervisor Dashboard** (`/supervisor-dashboard`) → New Student Entry or Logout
5. **New Student Entry** (`/new-student-entry`) → Back to Supervisor Dashboard

## Pages

- `/login` - Login page with purple gradient
- `/student-dashboard` - Student dashboard with progress cards and supervision status
- `/supervisor-selection` - Select a supervisor from available users
- `/supervisor-dashboard` - Supervisor's view with tabs and student list
- `/new-student-entry` - View student's logbook entries by week

## Technologies Used

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **React Router DOM 6** - Routing
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icons
- **PostCSS & Autoprefixer** - CSS processing

## Type Safety

The project uses TypeScript with strict mode enabled for better type safety and developer experience. All components are fully typed with proper interfaces and type definitions.
