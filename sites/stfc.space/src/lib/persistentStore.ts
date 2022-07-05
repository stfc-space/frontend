import { browser } from '$app/env';
import type { Writable } from 'svelte/store';
import { writable, get } from 'svelte/store';

const storage = <T>(key: string, initValue: T): Writable<T> => {
  const store = writable(initValue);
  if (!browser) return store;

  const storedValueStr = localStorage.getItem(key);
  try {
    if (storedValueStr != null)
      store.set(typeof initValue !== 'string' ? JSON.parse(storedValueStr) : storedValueStr);
  } catch {
    console.info('failed to parse');
    // Intentionally left empty
  }

  store.subscribe((val) => {
    if ([null, undefined].includes(val)) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, typeof val !== 'string' ? JSON.stringify(val) : val);
    }
  });

  window.addEventListener('storage', () => {
    const storedValueStr = localStorage.getItem(key);
    if (storedValueStr == null) return;

    const localValue: T =
      typeof initValue !== 'string' ? JSON.parse(storedValueStr) : storedValueStr;
    if (localValue !== get(store)) store.set(localValue);
  });

  return store;
};

export default storage;
