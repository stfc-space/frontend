import researchFallback from './i/0.png';
const researchThumbs = import.meta.importGlob<string>('./i/*.png', {
  import: 'default',
  eager: true
});
export function researchThumb(id: number): string {
  return researchThumbs[`./i/${id}.png`] || researchFallback;
}
