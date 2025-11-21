import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = (): T => {
    try {
      if (!key || key === '__noop__') return initialValue;
      const item = window.localStorage.getItem(key);
      if (item == null) return initialValue;
      try {
        return JSON.parse(item) as T;
      } catch {
        // legacy fallback: stored as plain string/primitive
        return (item as unknown) as T;
      }
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(readValue);

  // When key changes, re-read value
  useEffect(() => {
    setValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist when value changes
  useEffect(() => {
    try {
      if (!key || key === '__noop__') return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  const remove = () => {
    try {
      if (!key || key === '__noop__') return;
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  };

  return [value, setValue, remove] as const;
}
