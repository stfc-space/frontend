import type { Writable } from 'svelte/store';

export function setCookie(name: string, value: string) {
  const name_ = encodeURIComponent(name)
    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
    .replace(/[()]/g, function (n) {
      return n === '(' ? '%28' : '%29';
    });
  const value_ = encodeURIComponent(value).replace(
    /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
    decodeURIComponent
  );
  document.cookie = `${name_}=${value_};Path=/`;
}

export function toggleTheme<T extends Writable<string>>(theme: T, themeV: string): void {
  if (themeV === 'light') {
    theme.update(() => {
      return 'dark';
    });
    try {
      localStorage.setItem('theme', 'dark');
    } catch {
      // Intentionally left empty
    }
    updateDocument('theme', 'dark', 'light');
  } else {
    theme.update(() => {
      return 'light';
    });
    try {
      localStorage.setItem('theme', 'light');
    } catch {
      // Intentionally left empty
    }
    updateDocument('theme', 'light', 'dark');
  }
}

function updateDocument(_name: string, klass: string, other: string) {
  document.documentElement.classList.remove(other);
  document.documentElement.classList.add(klass);
  setCookie('theme', klass);
}

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1).toLocaleLowerCase();
}

export function capFirstChar(text: string): string {
  return text
    .split(' ')
    .map((x) => capitalizeFirstLetter(x))
    .join(' ');
}

import { onDestroy } from 'svelte';

export function onInterval<TArgs extends any[]>(
  callback: (...args: TArgs) => void,
  ms?: number,
  ...args: TArgs
) {
  const interval = setInterval(callback, ms, ...args);
  onDestroy(() => {
    clearInterval(interval);
  });
}
