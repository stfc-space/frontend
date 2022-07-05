import officerAbilityFallback from './i/0.png';

export function officerAbilityThumb(id: number): string {
  const officerAbilityThumbs = import.meta.importGlob('./i/*.png', {
    import: 'default',
    eager: true
  });
  return (officerAbilityThumbs[`./i/${id}.png`] || officerAbilityFallback) as string;
}
