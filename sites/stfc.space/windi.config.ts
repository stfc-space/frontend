import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  darkMode: 'class',
  theme: {
    extend: {
      'fontFamily': {
        'sans':
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"'
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem'
      },
      gridTemplateColumns: {
        list: '3.5rem minmax(0, 20ch) 1fr'
      }
    }
  },
  // Move these to the UI package
  shortcuts: {
    'input-bg-color': 'bg-dark-50 dark:bg-dark-600 dark:text-dark-50',
    'input-bg': 'dark:border-transparent border bg-light-400 dark:bg-dark-200 dark:text-light-50',
    'input-focus':
      'focus:outline-none focus:ring-1 dark:focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500',
    'detail-page-header':
      'bg-light-400 dark:bg-dark-400 dark:text-light-300 w-full shadow relative p-2 px-2 sm:px-4'
  }
});
