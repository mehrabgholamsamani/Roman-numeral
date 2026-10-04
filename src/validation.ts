export type ErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_SYMBOL'
  | 'TOO_MANY_REPEATS'
  | 'REPEATED_FIVE_SYMBOL'
  | 'INVALID_SUBTRACTION'
  | 'REPEATED_SUBTRACTOR'
  | 'INVALID_ORDER';

export type ConversionResult =
  | { readonly ok: true; readonly value: number }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: ErrorCode;
        readonly position: number;
        readonly message: string;
      };
    };

export type ConversionFailure = Extract<ConversionResult, { ok: false }>;
export type Converter = (input: string) => ConversionResult;

const values: Readonly<Record<string, number>> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};

export function symbolValue(symbol: string): number | undefined {
  return Object.hasOwn(values, symbol) ? values[symbol] : undefined;
}

export function failure(
  code: ErrorCode,
  index: number,
  message: string,
): ConversionFailure {
  return { ok: false, error: { code, position: index + 1, message } };
}

export function validateSymbols(input: string): ConversionFailure | undefined {
  if (input.length === 0) {
    return failure('EMPTY_INPUT', 0, 'Enter a Roman numeral from I to MMMCMXCIX (1–3999).');
  }

  let previous = '';
  let run = 0;
  const seenFives = new Set<string>();

  for (let index = 0; index < input.length; index += 1) {
    const symbol = input.charAt(index);
    if (symbolValue(symbol) === undefined) {
      const invalidSymbol = String.fromCodePoint(input.codePointAt(index)!);
      return failure('INVALID_SYMBOL', index,
        `Invalid symbol ${JSON.stringify(invalidSymbol)}. Use uppercase I, V, X, L, C, D, or M.`);
    }

    run = symbol === previous ? run + 1 : 1;
    const isFive = symbol === 'V' || symbol === 'L' || symbol === 'D';
    const limit = isFive ? 1 : 3;
    if (run > limit) {
      return failure('TOO_MANY_REPEATS', index,
        `${symbol} may appear at most ${limit} time${limit === 1 ? '' : 's'} consecutively; found ${run}.`);
    }
    if (isFive && seenFives.has(symbol)) {
      return failure('REPEATED_FIVE_SYMBOL', index, `${symbol} may appear only once in a Roman numeral.`);
    }
    if (isFive) seenFives.add(symbol);
    previous = symbol;
  }

  for (let index = 0; index + 1 < input.length; index += 1) {
    const current = input.charAt(index);
    const next = input.charAt(index + 1);
    if (symbolValue(current)! >= symbolValue(next)!) continue;

    const allowed =
      (current === 'I' && (next === 'V' || next === 'X')) ||
      (current === 'X' && (next === 'L' || next === 'C')) ||
      (current === 'C' && (next === 'D' || next === 'M'));
    if (!allowed) {
      return failure('INVALID_SUBTRACTION', index,
        `${current} cannot be subtracted from ${next}. Allowed pairs are IV, IX, XL, XC, CD, and CM.`);
    }
    if (index > 0 && input.charAt(index - 1) === current) {
      return failure('REPEATED_SUBTRACTOR', index,
        `Only one ${current} may precede ${next} in a subtractive pair; ${current} is repeated.`);
    }
  }
  return undefined;
}
