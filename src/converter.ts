import { failure, validateSymbols, type ConversionResult } from './validation.js';

export function romanToDecimal(input: string): ConversionResult {
  let cursor = 0;
  let value = 0;
  let lastGroup = '';
  let lastPlace = '';

  while (cursor < 3 && input.charAt(cursor) === 'M') {
    value += 1000;
    cursor += 1;
  }
  if (cursor > 0) {
    lastGroup = input.slice(0, cursor);
    lastPlace = 'thousands';
  }

  for (const [one, five, ten, scale, place] of [
    ['C', 'D', 'M', 100, 'hundreds'],
    ['X', 'L', 'C', 10, 'tens'],
    ['I', 'V', 'X', 1, 'ones'],
  ] as const) {
    const start = cursor;
    const next = input.charAt(cursor + 1);
    if (input.charAt(cursor) === one && (next === five || next === ten)) {
      value += (next === five ? 4 : 9) * scale;
      cursor += 2;
    } else {
      if (input.charAt(cursor) === five) {
        value += 5 * scale;
        cursor += 1;
      }
      for (let repeats = 0; repeats < 3 && input.charAt(cursor) === one; repeats += 1) {
        value += scale;
        cursor += 1;
      }
    }
    if (cursor > start) {
      lastGroup = input.slice(start, cursor);
      lastPlace = place;
    }
  }

  if (cursor === 0 || cursor !== input.length) {
    const invalid = validateSymbols(input);
    if (invalid) return invalid;

    return failure('INVALID_ORDER', cursor,
      `Unexpected ${input.charAt(cursor)}: ${lastGroup} already completes the ${lastPlace} place.`);
  }
  return { ok: true, value };
}