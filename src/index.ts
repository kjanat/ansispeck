/**
 * Terminal ANSI color formatting with explicit entrypoints:
 * - {@linkcode [auto.ts] | ansispeck/auto} (this, auto-detected),
 * - {@linkcode [raw.ts] | ansispeck/raw},
 * - {@linkcode [noop.ts] | ansispeck/noop},
 * - {@linkcode [safe.ts] | ansispeck/safe},
 * - {@linkcode [rope.ts] | ansispeck/rope}.
 *
 * @module ansispeck
 */

export * from './internal/default.ts';
export { default } from './internal/default.ts';
