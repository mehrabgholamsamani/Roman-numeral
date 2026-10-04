import { romanToDecimal } from '../dist/src/converter.js';

test.each([
  ['I', 1],
  ['IV', 4],
  ['MCMXCIV', 1994],
  ['MMMCMXCIX', 3999],
])('%s converts to %i', (roman, decimal) => {
  expect(romanToDecimal(roman)).toEqual({ ok: true, value: decimal });
});

test.each([
  ['', 'EMPTY_INPUT'],
  ['IIII', 'TOO_MANY_REPEATS'],
  ['IC', 'INVALID_SUBTRACTION'],
  ['ABC', 'INVALID_SYMBOL'],
])('%s is rejected with %s', (roman, code) => {
  expect(romanToDecimal(roman)).toMatchObject({ ok: false, error: { code } });
});
