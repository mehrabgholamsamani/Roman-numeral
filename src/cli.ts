import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { romanToDecimal } from './converter.js';

export { romanToDecimal };
export type { ConversionResult, ConversionFailure, Converter, ErrorCode } from './validation.js';

const usage = `Usage: npm start -- [ROMAN]

Without ROMAN, read one numeral per line from stdin (Ctrl+D / Ctrl+Z to finish).
Accepts canonical uppercase numerals I–MMMCMXCIX (1–3999).
Outer whitespace is trimmed. Invalid lines go to stderr and set exit code 1.
Enter one numeral as an argument, or leave it out to read from stdin.`;

function main(args: string[]): void {
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    console.log(usage);
    return;
  }
  if (args.length > 1 || args[0]?.startsWith('--')) {
    console.error(`Error: supply one numeral, or use stdin for multiple lines.\n${usage}`);
    process.exitCode = 2;
    return;
  }

  function print(input: string): void {
    const result = romanToDecimal(input.trim());
    if (result.ok) {
      console.log(result.value);
    } else {
      console.error(`Error at position ${result.error.position}: ${result.error.message}`);
      process.exitCode = 1;
    }
  }

  if (args.length === 1) {
    print(args[0]!);
    return;
  }
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  if (interactive) console.log('Roman numeral converter. Enter a numeral, then press Enter. Ctrl+D / Ctrl+Z to finish.');
  lines.on('line', print);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
