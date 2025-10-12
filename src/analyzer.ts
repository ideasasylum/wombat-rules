import type { JsonLogicRule, DataKey } from './types.js';

/**
 * Extracts all data keys required by a JSONLogic rule.
 *
 * This function recursively traverses a rule structure and identifies
 * all `{"var": "key"}` references, returning a deduplicated array of
 * required data keys.
 *
 * @param rule - The JSONLogic rule to analyze
 * @returns Array of unique data keys required by the rule
 *
 * @example
 * ```typescript
 * // Single variable
 * const keys = getRequiredKeys({ "var": "age" });
 * // keys: ["age"]
 *
 * // Multiple variables
 * const rule = {
 *   "and": [
 *     { ">": [{ "var": "age" }, 18] },
 *     { "==": [{ "var": "status" }, "active"] }
 *   ]
 * };
 * const keys = getRequiredKeys(rule);
 * // keys: ["age", "status"]
 *
 * // Nested keys
 * const rule = { ">": [{ "var": "user.profile.age" }, 18] };
 * const keys = getRequiredKeys(rule);
 * // keys: ["user.profile.age"]
 *
 * // No variables (static rule)
 * const keys = getRequiredKeys({ "==": [1, 1] });
 * // keys: []
 * ```
 */
export function getRequiredKeys(rule: JsonLogicRule): DataKey[] {
  const keys = new Set<DataKey>();

  /**
   * Recursively traverse the rule structure to find var references
   */
  function traverse(node: unknown): void {
    // Handle null and undefined
    if (node == null) {
      return;
    }

    // Handle arrays - traverse each element
    if (Array.isArray(node)) {
      for (const item of node) {
        traverse(item);
      }
      return;
    }

    // Handle objects
    if (typeof node === 'object') {
      const obj = node as Record<string, unknown>;

      // Check if this is a var reference
      if ('var' in obj) {
        const varValue = obj.var;
        // var can be a string (key name) or number (array index) or array [key, default]
        if (typeof varValue === 'string') {
          keys.add(varValue);
        } else if (Array.isArray(varValue) && typeof varValue[0] === 'string') {
          // Handle {"var": ["key", defaultValue]} format
          keys.add(varValue[0]);
        }
      }

      // Recursively traverse all object values
      for (const value of Object.values(obj)) {
        traverse(value);
      }
    }

    // Primitives (string, number, boolean) don't contain var references
  }

  traverse(rule);

  return Array.from(keys);
}
