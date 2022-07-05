export { researchThumb } from './research';
export { officerThumb } from './officer';
export { officerAbilityThumb } from './officer_ability';
export { shipThumb } from './ship';
export { resourceThumb, consumableThumb } from './resource';
export { buildingThumb } from './building';
export { skinThumb } from './skins';

import IndependentIcon from '$lib/assets/icons/factions/independent.png';
import FederationIcon from '$lib/assets/icons/factions/federation.png';
import RomulanIcon from '$lib/assets/icons/factions/romulan.png';
import KlingonIcon from '$lib/assets/icons/factions/klingon.png';
import AndorianIcon from '$lib/assets/icons/factions/andorian.png';
import RogueIcon from '$lib/assets/icons/factions/rogue.png';
import AugmentIcon from '$lib/assets/icons/factions/augment.png';

export function factionThumb(id: number): string {
  if (id == -1) {
    return IndependentIcon;
  } else if (id == 2064723306) {
    return FederationIcon;
  } else if (id == 4153667145) {
    return KlingonIcon;
  } else if (id == 669838839) {
    return RomulanIcon;
  } else if (id == 2720916152) {
    return AndorianIcon;
  } else if (id == 2143656960) {
    return RogueIcon;
  } else if (id == 2113010081) {
    return AugmentIcon;
  }
  console.warn('Unknown faction thumb', id);
  return IndependentIcon;
}
