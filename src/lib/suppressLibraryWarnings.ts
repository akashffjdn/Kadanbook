/**
 * Filter out specific noisy console warnings from third-party libraries.
 * Runs once at app entry. Other warnings/errors still bubble through.
 *
 * Currently silenced:
 *  - "Accessing element.ref was removed in React 19" — emitted by
 *    `react-native-svg`, `@gorhom/bottom-sheet`, and
 *    `react-native-gesture-handler`. They still ship pre-React-19 ref access
 *    patterns; not a real bug, will go away once they release React-19
 *    compatible versions.
 */

const SILENCED_PATTERNS: RegExp[] = [
  /Accessing element\.ref was removed in React 19/i,
];

const matchesAny = (msg: string) => SILENCED_PATTERNS.some((p) => p.test(msg));

const shouldSuppress = (args: unknown[]): boolean => {
  for (const arg of args) {
    if (typeof arg === 'string' && matchesAny(arg)) return true;
    if (arg instanceof Error && matchesAny(arg.message)) return true;
  }
  return false;
};

let installed = false;

export const suppressLibraryWarnings = () => {
  if (installed) return;
  installed = true;

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    originalError.apply(console, args as []);
  };

  console.warn = (...args: unknown[]) => {
    if (shouldSuppress(args)) return;
    originalWarn.apply(console, args as []);
  };
};
