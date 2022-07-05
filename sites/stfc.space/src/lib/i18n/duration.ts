import * as luxon from 'luxon';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';

function customFormat(
  dur: luxon.Duration,
  opts: luxon.ToHumanDurationOptions & {
    precision?: luxon.DurationLikeObject;
    smallestUnit?: luxon.DurationUnit;
    biggestUnit?: luxon.DurationUnit;
    maxUnits?: number;
    stripZeroUnits?: string;
  } = {}
): string {
  let duration = dur.normalize();
  let durationUnits: luxon.DurationUnit[] = [];
  let precision: luxon.Duration;
  if (typeof opts.precision === 'object') {
    precision = luxon.Duration.fromObject(opts.precision);
  }
  let remainingDuration = duration;
  //list of all available units
  const allUnits: luxon.DurationUnit[] = [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds'
  ];
  let smallestUnitIndex: number;
  let biggestUnitIndex: number;
  // check if user has specified a smallest unit that should be displayed
  if (opts.smallestUnit) {
    smallestUnitIndex = allUnits.indexOf(opts.smallestUnit);
  }
  // check if user has specified a biggest unit
  if (opts.biggestUnit) {
    biggestUnitIndex = allUnits.indexOf(opts.biggestUnit);
  }
  // use seconds and years as default for smallest and biggest unit
  if (!(smallestUnitIndex >= 0 && smallestUnitIndex < allUnits.length))
    smallestUnitIndex = allUnits.indexOf('seconds');
  if (!(biggestUnitIndex <= smallestUnitIndex && biggestUnitIndex < allUnits.length))
    biggestUnitIndex = allUnits.indexOf('years');

  for (const unit of allUnits.slice(biggestUnitIndex, smallestUnitIndex + 1)) {
    const durationInUnit = remainingDuration.as(unit);
    if (durationInUnit >= 1) {
      durationUnits.push(unit);
      const tmp = {};
      tmp[unit] = Math.floor(remainingDuration.as(unit));
      remainingDuration = remainingDuration.minus(luxon.Duration.fromObject(tmp)).normalize();

      // check if remaining duration is smaller than precision
      if (remainingDuration < precision) {
        // ok, we're allowed to remove the remaining parts and to round the current unit
        break;
      }
    }

    // check if we have already the maximum count of units allowed
    if (durationUnits.length >= opts.maxUnits) {
      break;
    }
  }
  // after gathering of units that shall be displayed has finished, remove the remaining duration to avoid non-integers
  duration = duration.minus(remainingDuration).normalize();
  duration = duration.shiftTo(...durationUnits);
  if (opts.stripZeroUnits === 'all') {
    durationUnits = durationUnits.filter((unit) => duration.get(unit) > 0);
  } else if (opts.stripZeroUnits == 'end') {
    let mayStrip = true;
    durationUnits = durationUnits.reverse().filter((unit) => {
      if (!mayStrip) return true;
      if (duration.get(unit) === 0) {
        return false;
      } else {
        mayStrip = false;
      }
      return true;
    });
  }

  return duration.shiftTo(...durationUnits).toHuman(opts);
}

export function formatDuration(seconds: number) {
  const currentLocale = get(locale);
  return customFormat(luxon.Duration.fromMillis(seconds * 1000, { locale: currentLocale }), {
    unitDisplay: 'short'
  });
}
