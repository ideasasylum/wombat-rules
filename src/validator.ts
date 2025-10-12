import { getRequiredKeys } from './analyzer.js';
import type { JsonLogicRule, JsonData, DataKey } from './types.js';

/**
 * Checks if a rule can be executed with the provided data.
 *
 * This function analyzes the rule to determine what data keys it requires,
 * then verifies that all required keys exist in the provided data object.
 * It supports nested key paths (e.g., "user.profile.age").
 *
 * @param rule - The JSONLogic rule to validate
 * @param data - The data object to check against
 * @returns true if all required keys exist in data, false otherwise
 *
 * @example
 * ```typescript
 * // All keys present
 * const rule = { ">": [{ "var": "age" }, 18] };
 * const data = { age: 25 };
 * const canRun = canExecuteRule(rule, data);
 * // canRun: true
 *
 * // Missing key
 * const rule = { ">": [{ "var": "age" }, 18] };
 * const data = { name: "Alice" };
 * const canRun = canExecuteRule(rule, data);
 * // canRun: false
 *
 * // Nested keys
 * const rule = { "==": [{ "var": "user.profile.role" }, "admin"] };
 * const data = { user: { profile: { role: "admin" } } };
 * const canRun = canExecuteRule(rule, data);
 * // canRun: true
 *
 * // Static rule (no variables)
 * const rule = { "==": [1, 1] };
 * const data = {};
 * const canRun = canExecuteRule(rule, data);
 * // canRun: true (no keys required)
 * ```
 */
export function canExecuteRule(rule: JsonLogicRule, data: JsonData): boolean {
  const requiredKeys = getRequiredKeys(rule);

  // If no keys are required, rule can always execute
  if (requiredKeys.length === 0) {
    return true;
  }

  // Check if each required key exists in data
  for (const key of requiredKeys) {
    if (!hasKey(data, key)) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a key path exists in a data object.
 * Supports nested keys like "user.profile.age".
 *
 * @param data - The data object to search
 * @param keyPath - The key path to check (e.g., "user.profile.age")
 * @returns true if the key path exists, false otherwise
 */
function hasKey(data: JsonData, keyPath: DataKey): boolean {
  const keys = keyPath.split('.');
  let current: unknown = data;

  for (const key of keys) {
    // Check if current is an object and has the key
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return true;
}
