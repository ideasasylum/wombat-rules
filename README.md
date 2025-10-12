# JSONLogic Rules Engine

A TypeScript wrapper around JSONLogic for evaluating business rules in Cloudflare Workers and other JavaScript environments.

## Overview

This library provides a simple, type-safe interface for working with JSONLogic rules. It wraps the `json-logic-js` library and adds utilities for analyzing and validating rules before execution.

## Features

- **Evaluate Rules**: Execute JSONLogic rules against provided data
- **Analyze Dependencies**: Extract all data keys required by a rule
- **Validate Execution**: Verify if a rule can be executed with given data
- **Type Safety**: Full TypeScript support with proper type definitions
- **Cloudflare Workers Ready**: Designed to run in edge environments
- **Zero Dependencies**: Minimal footprint with only JSONLogic as a dependency

## Use Cases

- Business rule evaluation in serverless functions
- Dynamic permission systems
- Feature flags and A/B testing logic
- Data validation and filtering
- Conditional workflows

## API Overview

```typescript
import { evaluateRule, getRequiredKeys, canExecuteRule } from 'jsonlogic-rules';

// 1. Evaluate a rule with data
const rule = { "==": [{ "var": "user.age" }, 18] };
const data = { user: { age: 18 } };
const result = evaluateRule(rule, data); // true

// 2. Get required data keys from a rule
const keys = getRequiredKeys(rule); // ['user.age']

// 3. Check if rule can execute with provided data
const canRun = canExecuteRule(rule, data); // true
```

## Installation

```bash
npm install
```

## Development

See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details and [TASKS.md](./TASKS.md) for implementation roadmap.

## Target Runtime

This library is designed to work in Cloudflare Workers but is compatible with any JavaScript environment that supports ES modules.

## Design Principles

- **Simple**: Minimal API surface with clear, focused functions
- **Type-Safe**: Leverage TypeScript for better developer experience
- **Tested**: Comprehensive unit tests for all functionality
- **Standards**: Follow JavaScript/TypeScript ecosystem best practices
- **Maintainable**: Clear code structure with good separation of concerns

## JSONLogic Primer

JSONLogic rules are expressed as JSON objects with operators and values:

```json
{
  "and": [
    { ">": [{ "var": "temp" }, 0] },
    { "<": [{ "var": "temp" }, 100] }
  ]
}
```

This rule checks if temperature is between 0 and 100. Learn more at [jsonlogic.com](https://jsonlogic.com/).

## License

MIT
