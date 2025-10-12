/**
 * JSONLogic Rules Engine
 *
 * A TypeScript wrapper around JSONLogic for evaluating business rules
 * in Cloudflare Workers and other JavaScript environments.
 *
 * @packageDocumentation
 */

export { evaluateRule } from './evaluator.js';
export { getRequiredKeys } from './analyzer.js';
export { canExecuteRule } from './validator.js';
export type { JsonLogicRule, JsonData, DataKey } from './types.js';
