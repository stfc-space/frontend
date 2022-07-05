import buildingFallback from './i/0.png';

const buildingThumbs = import.meta.importGlob<string>('./i/*.png', {
  import: 'default',
  eager: true
});

export function buildingThumb(id: number): string {
  if (id == 2 || id == 3 || id == 50 || id == 51 || id == 52 || id == 53 || id == 54) {
    id = 1;
  } else if (id == 6 || id == 7 || id == 56 || id == 57 || id == 58 || id == 59 || id == 60) {
    id = 5;
  } else if (id == 10 || id == 11 || id == 62 || id == 63 || id == 64 || id == 65 || id == 66) {
    id = 9;
  } else if (id == 4) {
    id = 55;
  } else if (id == 8) {
    id = 61;
  } else if (id == 12) {
    id = 67;
  } else if (id == 18 || id == 19 || id == 20 || id == 21 || id == 22 || id == 44) {
    id = 17;
  } else if (id == 35 || id == 36 || id == 37 || id == 38 || id == 39) {
    id = 34;
  }

  return buildingThumbs[`./i/${id}.png`] || buildingFallback;
}
