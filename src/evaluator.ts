import jsonLogic from 'json-logic-js';
import type { JsonLogicRule, JsonData } from './types.js';

/**
 * Evaluates a JSONLogic rule against provided data.
 *
 * This is a thin wrapper around the json-logic-js library that adds
 * TypeScript types and consistent error handling.
 *
 * @param rule - The JSONLogic rule to evaluate
 * @param data - The data context to evaluate against (optional)
 * @returns The result of evaluating the rule
 *
 * @example
 * ```typescript
 * // Simple equality check
 * const result = evaluateRule({ "==": [1, 1] });
 * // result: true
 *
 * // Using data variables
 * const rule = { ">": [{ "var": "age" }, 18] };
 * const data = { age: 25 };
 * const result = evaluateRule(rule, data);
 * // result: true
 *
 * // Complex logic
 * const rule = {
 *   "and": [
 *     { ">": [{ "var": "temp" }, 0] },
 *     { "<": [{ "var": "temp" }, 100] }
 *   ]
 * };
 * const data = { temp: 72 };
 * const result = evaluateRule(rule, data);
 * // result: true
 * ```
 */
export function evaluateRule(rule: JsonLogicRule, data?: JsonData): unknown {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jsonLogic.apply(rule as any, data ?? {});
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to evaluate rule: ${error.message}`);
    }
    throw new Error('Failed to evaluate rule: Unknown error');
  }
}
