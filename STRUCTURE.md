# Project Structure Documentation

## Overview
This is a React + TypeScript application using Tailwind CSS for styling.

## Directory Structure

```
logbook/
├── public/                 # Static files
│   └── index.html         # HTML template
├── src/
│   ├── components/        # Reusable UI components
│   │   └── .gitkeep
│   ├── pages/            # Page-level components
│   │   ├── Login/
│   │   │   └── index.tsx
│   │   ├── StudentDashboard/
│   │   │   └── index.tsx
│   │   ├── SupervisorSelection/
│   │   │   └── index.tsx
│   │   ├── SupervisorDashboard/
│   │   │   └── index.tsx
│   │   └── NewStudentEntry/
│   │       └── index.tsx
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── hooks/            # Custom React hooks
│   │   └── .gitkeep
│   ├── utils/            # Utility functions
│   │   └── .gitkeep
│   ├── App.tsx           # Main app component with routing
│   ├── index.tsx         # Application entry point
│   ├── index.css         # Global styles (Tailwind)
│   └── react-app-env.d.ts # React types
├── .vscode/              # VS Code settings
│   └── settings.json
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── postcss.config.js     # PostCSS configuration
├── package.json          # Dependencies
└── README.md             # Project documentation

```

## Key Files

### Configuration Files

- **tsconfig.json**: TypeScript compiler configuration with strict mode and path aliases
- **tailwind.config.js**: Tailwind CSS configuration with custom gradients
- **postcss.config.js**: PostCSS configuration for Tailwind processing

### Source Files

- **src/index.tsx**: Application entry point, renders the root component
- **src/App.tsx**: Main app component with React Router configuration
- **src/types/index.ts**: Central type definitions for the application

### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
import Component from '@pages/Component';
import { Type } from '@types/index';
import useHook from '@hooks/useHook';
import { utility } from '@utils/utility';
```

## Component Organization

Each page component is in its own folder with an `index.tsx` file. This allows for:
- Easy addition of page-specific components
- Better organization of related files
- Cleaner imports (import from folder name)

## Type Definitions

All TypeScript interfaces and types are defined in `src/types/index.ts`:
- User
- Student
- Supervisor
- LogbookEntry
- TabType

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Gradients**: Defined in tailwind.config.js
- **Responsive Design**: Mobile-first approach

## Future Additions

Suggested folders to add as the project grows:
- `src/contexts/` - React Context providers
- `src/services/` - API services
- `src/constants/` - Application constants
- `src/assets/` - Images, fonts, etc.
- `src/layouts/` - Layout components
