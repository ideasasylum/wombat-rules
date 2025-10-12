# Architecture

## Project Structure

```
/rules
├── src/
│   ├── index.ts          # Main entry point with exported API
│   ├── evaluator.ts      # Rule evaluation logic
│   ├── analyzer.ts       # Extract required data keys from rules
│   ├── validator.ts      # Validate if rules can execute
│   └── types.ts          # TypeScript type definitions
├── tests/
│   ├── evaluator.test.ts # Tests for rule evaluation
│   ├── analyzer.test.ts  # Tests for key extraction
│   └── validator.test.ts # Tests for rule validation
├── dist/                 # Compiled JavaScript output (gitignored)
├── node_modules/         # Dependencies (gitignored)
├── package.json          # Project configuration and scripts
├── tsconfig.json         # TypeScript compiler configuration
├── vitest.config.ts      # Vitest test runner configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier code formatter configuration
├── .gitignore            # Git ignore rules
├── README.md             # Project overview and usage
├── ARCHITECTURE.md       # This file - technical design
└── TASKS.md              # Implementation roadmap
```

## Core Modules

### 1. evaluator.ts

**Purpose**: Wrapper around `json-logic-js` for evaluating rules

**Exports**:
- `evaluateRule(rule: JsonLogicRule, data?: JsonData): any`
  - Evaluates a JSONLogic rule against provided data
  - Returns the result of the evaluation
  - Handles errors gracefully

**Implementation Notes**:
- Thin wrapper around `jsonLogic.apply(rule, data)`
- Add error handling for malformed rules
- Type-safe inputs and outputs

### 2. analyzer.ts

**Purpose**: Extract data dependencies from rules

**Exports**:
- `getRequiredKeys(rule: JsonLogicRule): string[]`
  - Recursively traverses rule structure
  - Identifies all `{"var": "key.path"}` references
  - Returns array of unique data keys required
  - Handles nested keys (e.g., "user.profile.age")

**Implementation Strategy**:
- Recursive traversal of rule object
- Look for `{"var": "key"}` patterns
- Handle arrays and nested objects
- Deduplicate keys before returning

### 3. validator.ts

**Purpose**: Verify if a rule can execute with given data

**Exports**:
- `canExecuteRule(rule: JsonLogicRule, data: JsonData): boolean`
  - Uses `getRequiredKeys()` to find dependencies
  - Checks if all required keys exist in provided data
  - Returns true if rule can execute, false otherwise

**Implementation Strategy**:
- Call `getRequiredKeys(rule)` to get dependencies
- For each key, check if it exists in data object
- Support nested key paths (e.g., "user.profile.age")
- Return boolean result

### 4. types.ts

**Purpose**: TypeScript type definitions

**Exports**:
```typescript
// JSONLogic rule structure (recursive)
type JsonLogicRule =
  | { [operator: string]: any }
  | any;

// Data object (arbitrary JSON)
type JsonData = Record<string, any>;

// Result of getRequiredKeys
type DataKey = string;
```

### 5. index.ts

**Purpose**: Main entry point

**Exports**:
- Re-exports all public functions from other modules
- Provides clean API surface

```typescript
export { evaluateRule } from './evaluator';
export { getRequiredKeys } from './analyzer';
export { canExecuteRule } from './validator';
export type { JsonLogicRule, JsonData } from './types';
```

## Dependencies

### Runtime
- `json-logic-js` (^2.0.5): Core JSONLogic implementation
- `@types/json-logic-js` (^2.0.8): TypeScript type definitions

### Development
- `typescript` (^5.7.x): TypeScript compiler
- `vitest` (^3.x): Fast test runner (Vite-powered)
- `@vitest/ui` (^3.x): Optional UI for test results
- `eslint` (^9.x): Code linting
- `@typescript-eslint/parser` (^8.x): TypeScript parser for ESLint
- `@typescript-eslint/eslint-plugin` (^8.x): TypeScript linting rules
- `prettier` (^3.x): Code formatting

## TypeScript Configuration

**tsconfig.json** key settings:
```json
{
  "compilerOptions": {
    "target": "ES2022",              // Modern JavaScript
    "module": "ES2022",              // ES modules
    "moduleResolution": "bundler",   // Modern resolution
    "lib": ["ES2022"],               // Modern APIs
    "outDir": "./dist",              // Output directory
    "rootDir": "./src",              // Source directory
    "declaration": true,             // Generate .d.ts files
    "strict": true,                  // Strict type checking
    "esModuleInterop": true,         // Better CommonJS interop
    "skipLibCheck": true,            // Faster builds
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## Testing Strategy

**Framework**: Vitest (fast, modern, good for edge runtimes)

**Test Files**:
- One test file per module
- Co-located in `tests/` directory
- Follow naming: `{module}.test.ts`

**Coverage Goals**:
- All exported functions tested
- Edge cases covered (empty rules, missing data, etc.)
- Error conditions tested

**Example Test Structure**:
```typescript
import { describe, it, expect } from 'vitest';
import { evaluateRule } from '../src/evaluator';

describe('evaluateRule', () => {
  it('should evaluate simple equality rule', () => {
    const rule = { "==": [1, 1] };
    expect(evaluateRule(rule)).toBe(true);
  });

  // More tests...
});
```

## Build & Scripts

**package.json scripts**:
```json
{
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src tests",
    "format": "prettier --write src tests",
    "typecheck": "tsc --noEmit",
    "prepublish": "npm run typecheck && npm run lint && npm run test && npm run build"
  }
}
```

## Module Format

**Export**: ES Modules (ESM)
- `"type": "module"` in package.json
- Native support in Cloudflare Workers
- Modern JavaScript standard

**Entry Points**:
- `"main": "./dist/index.js"` - Compiled JavaScript
- `"types": "./dist/index.d.ts"` - TypeScript definitions
- `"exports"` field for proper ESM resolution

## Code Quality

**Linting**: ESLint with TypeScript plugin
- Catch common errors
- Enforce consistent style
- TypeScript-aware rules

**Formatting**: Prettier
- Consistent code style
- Auto-format on save (IDE integration)
- No debates about formatting

**Type Checking**: TypeScript strict mode
- Catch type errors at compile time
- Better IDE support
- Self-documenting code

## Design Decisions

### Why Vitest over Jest?
- Faster (Vite-powered)
- Better ESM support
- Simpler configuration
- Modern and actively maintained

### Why ESM over CommonJS?
- Cloudflare Workers native support
- Modern JavaScript standard
- Better tree-shaking
- Future-proof

### Why Separate Modules?
- Clear separation of concerns
- Easier to test
- More maintainable
- Each function has single responsibility

### Why Not Add Custom Operators?
- Keep it simple - JSONLogic is the standard
- Users can extend json-logic-js directly if needed
- This is a wrapper, not a replacement
- Focus on the three core utilities

## Cloudflare Workers Compatibility

This library is designed for Cloudflare Workers:
- ES Modules format
- No Node.js-specific APIs
- Minimal dependencies
- Small bundle size
- Can be used with Workers bundler (esbuild/Wrangler)

**Usage in Workers**:
```typescript
import { evaluateRule, getRequiredKeys, canExecuteRule } from './rules';

export default {
  async fetch(request: Request): Promise<Response> {
    const rule = { "==": [{ "var": "method" }, "GET"] };
    const data = { method: request.method };

    if (evaluateRule(rule, data)) {
      return new Response("GET request allowed");
    }
    return new Response("Method not allowed", { status: 405 });
  }
}
```

## Extension Points

If users need to extend functionality:

1. **Custom Operators**: Use `json-logic-js` directly
2. **Custom Validation**: Wrap `canExecuteRule` with additional logic
3. **Rule Transformation**: Pre-process rules before passing to `evaluateRule`
4. **Performance**: Cache `getRequiredKeys` results for repeated rules
