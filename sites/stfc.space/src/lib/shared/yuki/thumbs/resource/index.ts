import resourceFallback from './i/1.png';
import { getStaticData } from '$lib/shared/api';
import { get } from 'svelte/store';

const resourceThumbs = import.meta.importGlob('./i/*.png', { import: 'default', eager: true });

export function resourceThumb(id?: number): string {
  const artId = get(getStaticData().resources).get(id)?.art_id ?? id;
  return (resourceThumbs[`./i/${artId}.png`] || resourceFallback) as string;
}

export function consumableThumb(id: number): string {
  return (resourceThumbs[`./i/consumable_${id}.png`] || resourceFallback) as string;
}
