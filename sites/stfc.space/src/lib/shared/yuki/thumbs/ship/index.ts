import shipFallback from './i/0.png';
const shipThumbs = import.meta.importGlob<string>('./i/*.png', { import: 'default', eager: true });

export function shipThumb(id: number): string {
  return shipThumbs[`./i/${id}.png`] || shipFallback;
}
