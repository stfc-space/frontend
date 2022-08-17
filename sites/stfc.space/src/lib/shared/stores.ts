import storage from '$lib/persistentStore';

function defaultThemeValue() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}
export const theme = storage('theme', defaultThemeValue());
