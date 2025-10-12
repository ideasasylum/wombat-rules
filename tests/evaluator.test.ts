import { describe, it, expect } from 'vitest';
import { evaluateRule } from '../src/evaluator';

describe('evaluateRule', () => {
  describe('simple equality rules', () => {
    it('should evaluate true equality', () => {
      const rule = { '==': [1, 1] };
      expect(evaluateRule(rule)).toBe(true);
    });

    it('should evaluate false equality', () => {
      const rule = { '==': [1, 2] };
      expect(evaluateRule(rule)).toBe(false);
    });

    it('should evaluate string equality', () => {
      const rule = { '==': ['hello', 'hello'] };
      expect(evaluateRule(rule)).toBe(true);
    });
  });

  describe('comparison operators', () => {
    it('should evaluate greater than', () => {
      const rule = { '>': [5, 3] };
      expect(evaluateRule(rule)).toBe(true);
    });

    it('should evaluate less than', () => {
      const rule = { '<': [3, 5] };
      expect(evaluateRule(rule)).toBe(true);
    });

    it('should evaluate greater than or equal', () => {
      const rule = { '>=': [5, 5] };
      expect(evaluateRule(rule)).toBe(true);
    });

    it('should evaluate less than or equal', () => {
      const rule = { '<=': [3, 5] };
      expect(evaluateRule(rule)).toBe(true);
    });
  });

  describe('logical operators', () => {
    it('should evaluate AND with true conditions', () => {
      const rule = {
        and: [{ '==': [1, 1] }, { '==': [2, 2] }],
      };
      expect(evaluateRule(rule)).toBe(true);
    });

    it('should evaluate AND with false condition', () => {
      const rule = {
        and: [{ '==': [1, 1] }, { '==': [2, 3] }],
      };
      expect(evaluateRule(rule)).toBe(false);
    });

    it('should evaluate OR with one true condition', () => {
      const rule = {
        or: [{ '==': [1, 2] }, { '==': [2, 2] }],
      };
      expect(evaluateRule(rule)).toBe(true);
    });

    it('should evaluate NOT', () => {
      const rule = { '!': { '==': [1, 2] } };
      expect(evaluateRule(rule)).toBe(true);
    });
  });

  describe('variable references', () => {
    it('should evaluate rule with single variable', () => {
      const rule = { '==': [{ var: 'age' }, 25] };
      const data = { age: 25 };
      expect(evaluateRule(rule, data)).toBe(true);
    });

    it('should evaluate rule with nested variable', () => {
      const rule = { '==': [{ var: 'user.name' }, 'Alice'] };
      const data = { user: { name: 'Alice' } };
      expect(evaluateRule(rule, data)).toBe(true);
    });

    it('should handle missing variable with default', () => {
      const rule = { '==': [{ var: ['missing', 'default'] }, 'default'] };
      const data = {};
      expect(evaluateRule(rule, data)).toBe(true);
    });

    it('should handle deeply nested variables', () => {
      const rule = {
        '==': [{ var: 'user.profile.settings.theme' }, 'dark'],
      };
      const data = {
        user: {
          profile: {
            settings: {
              theme: 'dark',
            },
          },
        },
      };
      expect(evaluateRule(rule, data)).toBe(true);
    });
  });

  describe('complex nested rules', () => {
    it('should evaluate complex AND/OR combination', () => {
      const rule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          {
            or: [
              { '==': [{ var: 'status' }, 'active'] },
              { '==': [{ var: 'status' }, 'pending'] },
            ],
          },
        ],
      };
      const data = { age: 25, status: 'active' };
      expect(evaluateRule(rule, data)).toBe(true);
    });

    it('should evaluate temperature range check', () => {
      const rule = {
        and: [{ '>': [{ var: 'temp' }, 0] }, { '<': [{ var: 'temp' }, 100] }],
      };
      const data = { temp: 72 };
      expect(evaluateRule(rule, data)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty data object', () => {
      const rule = { '==': [1, 1] };
      expect(evaluateRule(rule, {})).toBe(true);
    });

    it('should handle undefined data', () => {
      const rule = { '==': [1, 1] };
      expect(evaluateRule(rule)).toBe(true);
    });

    it('should handle null values in rule', () => {
      const rule = { '==': [{ var: 'value' }, null] };
      const data = { value: null };
      expect(evaluateRule(rule, data)).toBe(true);
    });

    it('should handle boolean values', () => {
      const rule = { '==': [{ var: 'flag' }, true] };
      const data = { flag: true };
      expect(evaluateRule(rule, data)).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should evaluate user permission check', () => {
      const rule = {
        and: [
          { '==': [{ var: 'user.role' }, 'admin'] },
          { '==': [{ var: 'user.active' }, true] },
        ],
      };
      const data = {
        user: {
          role: 'admin',
          active: true,
        },
      };
      expect(evaluateRule(rule, data)).toBe(true);
    });

    it('should evaluate discount eligibility', () => {
      const rule = {
        or: [
          { '>=': [{ var: 'orderTotal' }, 100] },
          { '==': [{ var: 'vipMember' }, true] },
        ],
      };
      const data = {
        orderTotal: 150,
        vipMember: false,
      };
      expect(evaluateRule(rule, data)).toBe(true);
    });

    it('should evaluate content access rule', () => {
      const rule = {
        and: [
          { '>=': [{ var: 'user.age' }, 18] },
          {
            or: [
              { '==': [{ var: 'user.subscription' }, 'premium'] },
              { '==': [{ var: 'content.free' }, true] },
            ],
          },
        ],
      };
      const data = {
        user: {
          age: 25,
          subscription: 'free',
        },
        content: {
          free: true,
        },
      };
      expect(evaluateRule(rule, data)).toBe(true);
    });
  });
});
