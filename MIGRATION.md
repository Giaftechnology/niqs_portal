# Migration Guide: JavaScript to TypeScript

## What Changed

### 1. File Extensions
- `.js` → `.tsx` (for files with JSX)
- `.js` → `.ts` (for files without JSX)

### 2. Project Structure

**Before:**
```
src/
├── pages/
│   ├── Login.js
│   ├── Login.css
│   ├── StudentDashboard.js
│   └── StudentDashboard.css
```

**After:**
```
src/
├── pages/
│   ├── Login/
│   │   └── index.tsx
│   ├── StudentDashboard/
│   │   └── index.tsx
├── types/
│   └── index.ts
├── components/
├── hooks/
└── utils/
```

### 3. Type Safety

All components now have proper TypeScript types:

```typescript
// Event handlers
const handleClick = (): void => {
  // ...
};

const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
  // ...
};

// Component props
interface Props {
  title: string;
  count: number;
}

const Component: React.FC<Props> = ({ title, count }) => {
  // ...
};
```

### 4. Relative Imports

Use relative imports from the src directory:
```typescript
// From App.tsx
import Login from './pages/Login';

// From a page component
import { TabType } from '../../types';
```

### 5. State Types

```typescript
// Before
const [email, setEmail] = useState('');

// After
const [email, setEmail] = useState<string>('');
```

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Benefits

✅ **Type Safety**: Catch errors at compile time
✅ **Better IDE Support**: Autocomplete, refactoring, etc.
✅ **Self-Documenting Code**: Types serve as inline documentation
✅ **Easier Refactoring**: TypeScript helps track changes across files
✅ **Better Team Collaboration**: Clear interfaces and contracts

## Common TypeScript Patterns

### Component Definition
```typescript
import React from 'react';

const MyComponent: React.FC = () => {
  return <div>Hello</div>;
};

export default MyComponent;
```

### Props Interface
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean; // Optional prop
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
```

### Custom Hooks
```typescript
const useAuth = (): { user: User | null; login: (email: string) => void } => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = (email: string): void => {
    // Login logic
  };
  
  return { user, login };
};
```

## Troubleshooting

### Module Not Found
If you see path alias errors, make sure:
1. `tsconfig.json` has the correct `baseUrl` and `paths`
2. Restart your IDE/development server

### Type Errors
The IDE may show type errors until you run `npm install` to install the type definitions.

## Next Steps

Consider adding:
- ESLint with TypeScript rules
- Prettier for code formatting
- Husky for pre-commit hooks
- Jest with TypeScript support for testing
