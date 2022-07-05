import storage from '$lib/persistentStore';

export const user = storage('user', {});
// export const theme = storage('theme', typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light');
