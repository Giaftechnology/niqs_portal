# Setup Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## What's Included

### ✅ TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@pages`, `@types`, `@components`, etc.)
- React types included

### ✅ Tailwind CSS
- Configured with custom gradients
- PostCSS setup
- Responsive utilities

### ✅ Project Structure
```
src/
├── components/       # Shared components (empty, ready for use)
├── pages/           # Page components (each in own folder)
│   ├── Login/
│   ├── StudentDashboard/
│   ├── SupervisorSelection/
│   ├── SupervisorDashboard/
│   └── NewStudentEntry/
├── types/           # TypeScript definitions
├── hooks/           # Custom hooks (empty, ready for use)
├── utils/           # Utility functions (empty, ready for use)
├── App.tsx          # Main app with routing
└── index.tsx        # Entry point
```

### ✅ VS Code Settings
- TypeScript IntelliSense configured
- Tailwind CSS IntelliSense ready
- Format on save enabled

## Development Workflow

### 1. Running the App
```bash
npm start
```

### 2. Building for Production
```bash
npm run build
```

### 3. Running Tests
```bash
npm test
```

## Imports

Use relative imports from the src directory:

```typescript
// From App.tsx
import Login from './pages/Login';
import { User } from './types';

// From a page component
import { TabType } from '../../types';
```

## TypeScript Tips

### Component Definition
```typescript
const MyComponent: React.FC = () => {
  return <div>Content</div>;
};
```

### With Props
```typescript
interface Props {
  title: string;
  count?: number; // Optional
}

const MyComponent: React.FC<Props> = ({ title, count = 0 }) => {
  return <div>{title}: {count}</div>;
};
```

### Event Handlers
```typescript
const handleClick = (): void => {
  console.log('clicked');
};

const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
  setValue(e.target.value);
};
```

### State with Types
```typescript
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);
```

## Tailwind CSS

### Custom Gradients
```typescript
className="bg-gradient-to-r from-indigo-500 to-purple-500"
```

### Responsive Design
```typescript
className="w-full md:w-1/2 lg:w-1/3"
```

### Hover States
```typescript
className="hover:bg-gray-100 transition-all"
```

## Adding New Pages

1. Create folder in `src/pages/`
2. Add `index.tsx` file
3. Define component with TypeScript
4. Add route in `App.tsx`

Example:
```typescript
// src/pages/NewPage/index.tsx
import React from 'react';

const NewPage: React.FC = () => {
  return <div>New Page</div>;
};

export default NewPage;
```

```typescript
// src/App.tsx
import NewPage from '@pages/NewPage';

// Add route
<Route path="/new-page" element={<NewPage />} />
```

## Adding Shared Components

Create components in `src/components/`:

```typescript
// src/components/Button/index.tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all';
  const variantClasses = variant === 'primary' 
    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {label}
    </button>
  );
};

export default Button;
```

## Troubleshooting

### TypeScript Errors
- Make sure you've run `npm install`
- Restart your IDE
- Check `tsconfig.json` configuration

### Tailwind Not Working
- Verify `tailwind.config.js` content paths
- Check `postcss.config.js` exists
- Restart development server

### Import Errors
- Check path aliases in `tsconfig.json`
- Ensure file extensions are `.tsx` or `.ts`
- Restart TypeScript server in IDE

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)
