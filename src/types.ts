/**
 * Represents a JSONLogic rule structure.
 * Rules are expressed as JSON objects with operators and values.
 *
 * @example
 * ```typescript
 * const rule: JsonLogicRule = { "==": [1, 1] };
 * const complexRule: JsonLogicRule = {
 *   "and": [
 *     { ">": [{ "var": "temp" }, 0] },
 *     { "<": [{ "var": "temp" }, 100] }
 *   ]
 * };
 * ```
 */
export type JsonLogicRule =
  | { [operator: string]: JsonLogicRule | JsonLogicRule[] | unknown }
  | unknown;

/**
 * Represents arbitrary JSON data that can be used with rules.
 * This is the data context against which rules are evaluated.
 *
 * @example
 * ```typescript
 * const data: JsonData = {
 *   user: {
 *     age: 25,
 *     name: "Alice"
 *   },
 *   temp: 72
 * };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonData = Record<string, any>;

/**
 * Represents a data key path used in JSONLogic var references.
 * Can be a simple key or a nested path (e.g., "user.profile.age").
 *
 * @example
 * ```typescript
 * const key1: DataKey = "age";
 * const key2: DataKey = "user.profile.name";
 * ```
 */
export type DataKey = string;
