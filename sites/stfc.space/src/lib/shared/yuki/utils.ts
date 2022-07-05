import { get } from 'svelte/store';

import { getNumberFormatter } from 'svelte-i18n';

import { getStaticData } from '../api';
import type { ShipComponentWeapon, ShipDetailComponent } from './models';

export function calculateShipStats(components: ShipDetailComponent[]) {
  const WeaponDPR = (weapon: ShipComponentWeapon) => {
    const AVGDmg = (weapon.minimum_damage + weapon.maximum_damage) * 0.5;
    const Shots = weapon.shots;
    const ReloadingTime = weapon.cool_down;
    const CriticalChance = weapon.crit_chance;
    const CriticalDamage = weapon.crit_modifier;
    return (
      ((AVGDmg * Shots) / ReloadingTime) * (CriticalChance * CriticalDamage) +
      (AVGDmg * Shots) / ReloadingTime
    );
  };
  const AttackRatingForComponent = (weapon: ShipComponentWeapon) => {
    return (
      WeaponDPR(weapon) + weapon.accuracy * 0.5 + weapon.penetration * 0.5 + weapon.modulation * 0.5
    );
  };

  const stats = {
    attack: 0,
    defense: 0,
    health: 0,

    // Health Parts
    shield_hp: 0,
    hull_hp: 0,

    // Attack Parts
    dpr: 0,
    armor_piercing: 0,
    shield_piercing: 0,
    accuracy: 0,
    critical_chance: 0,
    critical_damage: 0,

    // Defense Parts
    armor: 0,
    absorption: 0,
    dodge: 0,

    strength: 0
  };

  let weapon_count = 0;
  for (const component of components) {
    if (component.data.tag === 'Shield') {
      stats.shield_hp = component.data.hp;
      stats.absorption = component.data.absorption;
    } else if (component.data.tag === 'Cargo') {
      // Intentionally left empty
    } else if (component.data.tag === 'Armor') {
      stats.armor = component.data.plating;
      stats.hull_hp = component.data.hp;
    } else if (component.data.tag === 'Weapon') {
      const dpr = WeaponDPR(component.data);
      const rating = AttackRatingForComponent(component.data);
      stats.attack += rating;
      stats.dpr += dpr;
      const attack_part = component.data;
      stats.accuracy += attack_part.accuracy;
      stats.shield_piercing += attack_part.modulation;
      stats.armor_piercing += attack_part.penetration;
      stats.critical_chance += attack_part.crit_chance;
      stats.critical_damage += attack_part.crit_modifier;
      weapon_count++;
    } else if (component.data.tag === 'Impulse') {
      stats.dodge = component.data.dodge;
    }
  }

  const RoundAwayFromZero = (startValue: number, digits: number) => {
    let decimalValue = 0;
    digits = digits || 0;
    startValue *= Math.pow(10, digits + 1);
    decimalValue = Math.floor(startValue) - Math.floor(startValue / 10) * 10;
    startValue = Math.floor(startValue / 10);
    if (decimalValue >= 5) {
      startValue += 1;
    }
    startValue /= Math.pow(10, digits);
    return startValue;
  };

  stats.health = stats.hull_hp * 0.5 + stats.shield_hp * 0.5;
  stats.defense = stats.armor * 5 + stats.dodge * 5 + stats.absorption * 5;
  stats.accuracy /= weapon_count;
  stats.armor_piercing /= weapon_count;
  stats.shield_piercing /= weapon_count;
  stats.critical_chance /= weapon_count;
  stats.critical_damage /= weapon_count;

  stats.accuracy = RoundAwayFromZero(stats.accuracy, 0);
  stats.armor_piercing = RoundAwayFromZero(stats.armor_piercing, 0);
  stats.shield_piercing = RoundAwayFromZero(stats.shield_piercing, 0);
  stats.critical_chance = RoundAwayFromZero(stats.critical_chance, 3);
  stats.critical_damage = RoundAwayFromZero(stats.critical_damage, 3);

  stats.dpr = RoundAwayFromZero(stats.dpr, 0);
  stats.attack = RoundAwayFromZero(stats.attack, 0);
  stats.defense = RoundAwayFromZero(stats.defense, 0);
  stats.health = RoundAwayFromZero(stats.health, 0);
  stats.strength = stats.attack + stats.defense + stats.health;

  return stats;
}

// export function sortCosts<T>(resources: (T & { resource_id: number })[]): (T & { resource_id: number })[] {
//     const dataStore = useYukiDataStore();
//     return resources.sort((a, b) => {
//         const aResource = dataStore.resources.get(a.resource_id);
//         const bResource = dataStore.resources.get(b.resource_id);
//         const aIndex = aResource?.sorting_index ?? 0;
//         const bIndex = bResource?.sorting_index ?? 0;
//         const index = aIndex - bIndex;
//         if (index === 0) {
//             // Secondary sortying by rarity :)
//             const rarity = (aResource?.rarity ?? 0) - (bResource?.rarity ?? 0);
//             if (rarity == 0) {
//                 // Last resort is grad
//                 return (aResource?.grade || 0) - (bResource?.grade || 0);
//             }
//             return rarity;
//         }
//         return index;
//     });
// }
//
// export function sortRewards(resources: Reward[]): Reward[] {
//     return sortCosts(resources);
// }
//
// export function sortRewardRanges(resources: ResourceRewardRange[]): ResourceRewardRange[] {
//     return sortCosts(resources);
// }

export function sortResourceList<T>(
  resources: (T & { resource_id: number })[]
): (T & { resource_id: number })[] {
  const allResources = get(getStaticData().resources);
  return resources.sort((a, b) => {
    const aResource = allResources.get(a.resource_id);
    const bResource = allResources.get(b.resource_id);
    const aIndex = aResource?.sorting_index ?? 0;
    const bIndex = bResource?.sorting_index ?? 0;
    const index = aIndex - bIndex;
    if (index === 0) {
      // Secondary sortying by rarity :)
      const rarity = (aResource?.rarity ?? 0) - (bResource?.rarity ?? 0);
      if (rarity == 0) {
        // Last resort is grade
        return (aResource?.grade || 0) - (bResource?.grade || 0);
      }
      return rarity;
    }
    return index;
  });
}

// export function mapRequirement(requirement: Requirement, researchList: Research[]) {
//   return {
//     id: requirement.requirement_id,
//     link:
//       requirement.requirement_type == RequirementType.BuildingLevel
//         ? '/buildings/' + requirement.requirement_id + '?level=' + requirement.requirement_level
//         : '/research/' + requirement.requirement_id + '?level=' + requirement.requirement_level,
//     name:
//       requirement.requirement_type == RequirementType.BuildingLevel
//         ? $_(`buildings_${requirement.requirement_id}_name`)
//         : $_(`research_${requirement.requirement_id}_name`),
//     icon:
//       requirement.requirement_type == RequirementType.BuildingLevel
//         ? buildingThumb(requirement.requirement_id)
//         : researchThumb(researchList.find((r) => r.id == requirement.requirement_id).art_id),
//     level: requirement.requirement_level
//   };
// }

export function yukiFormat(text: string, ...a: unknown[]) {
  const args = a;
  return text.replace(
    /{(\d+)(?::((.*?)(.))){0,1}}/g,
    function (match, number, _group2, group3, group4) {
      const n = args[number];
      if (n == undefined) {
        return match;
      }
      if (group4 == '%' || group3 == 'P') {
        return getNumberFormatter({
          style: 'percent',
          useGrouping: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 6
        }).format(Number(n));
        // return formatPercentageNumber(n);
      } else {
        return n.toString();
      }
    }
  );
}

function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1).toLocaleLowerCase();
}

export function formatPrimeText(
  text: string,
  options?: {
    stripLines?: number;
    stripLinesBack?: number;
    vars?: unknown[];
    uf?: boolean;
  }
): string {
  const cleanedText = (
    text
      ? text
          .replace(/<color=(#[A-F0-9]+)>/g, '<b style="color: $1; filter: brightness(85%);">')
          .replace(/<\/color>/g, '</b>')
      : 'Missing Translation'
  ).split('\n');

  if (options?.stripLines) {
    let steps = options.stripLines;
    if (typeof options.stripLines === 'string') {
      steps = parseInt(options.stripLines);
    }
    for (let i = 0; i < steps; ++i) {
      if (cleanedText.length > 1) cleanedText.shift();

      if (cleanedText.length > 1 && cleanedText[0].trim().length == 0) {
        steps += 1;
      }
    }
  }

  if (options?.stripLinesBack) {
    let steps = options?.stripLinesBack;
    if (typeof options?.stripLinesBack === 'string') {
      steps = parseInt(this.stripLinesBack);
    }
    for (let i = 0; i < steps; ++i) {
      if (cleanedText.length > 1) cleanedText.pop();

      if (cleanedText.length > 1 && cleanedText[cleanedText.length - 1].trim().length == 0) {
        steps += 1;
      }
    }
  }

  const finalText = cleanedText.join('<br>');
  const cap = options?.uf ? capitalizeFirstLetter : (t: string) => t;

  const nText = finalText
    ? yukiFormat(finalText, ...(options?.vars ? options.vars : []))
    : 'Missing Translation';
  if (options?.uf) {
    return nText
      .split(' ')
      .map((x) => cap(x))
      .join(' ');
  } else {
    return nText;
  }
}
