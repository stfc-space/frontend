import officerFallback from './i/0.png';

export function officerThumb(id: number): string {
  const officerThumbs = import.meta.importGlob('./i/*.png', { import: 'default', eager: true });
  return (officerThumbs[`./i/${id}.png`] || officerFallback) as string;
}
