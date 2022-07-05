const skinThumbs = import.meta.importGlob<string>('./i/*.png', { import: 'default', eager: true });

export function skinThumb(id: number, type: string): string {
  return skinThumbs[`./i/ship_${type}_${id}.png`];
}
