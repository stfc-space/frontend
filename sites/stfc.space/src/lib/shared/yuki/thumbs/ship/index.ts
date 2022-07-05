import shipFallback from './i/0.png';
const shipThumbs = import.meta.importGlob<string>('./i/*.png', { import: 'default', eager: true });

export function shipThumb(id: number): string {
  return shipThumbs[`./i/${String(id || 0).padStart(3, '0')}.png`] || shipFallback;
}
