import { describe, it, expect } from 'vitest';
import { getRequiredKeys } from '../src/analyzer';

describe('getRequiredKeys', () => {
  describe('single variable', () => {
    it('should extract single variable', () => {
      const rule = { var: 'age' };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['age']);
    });

    it('should extract variable from comparison', () => {
      const rule = { '>': [{ var: 'age' }, 18] };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['age']);
    });

    it('should extract nested variable', () => {
      const rule = { '==': [{ var: 'user.name' }, 'Alice'] };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['user.name']);
    });

    it('should extract deeply nested variable', () => {
      const rule = { '==': [{ var: 'user.profile.settings.theme' }, 'dark'] };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['user.profile.settings.theme']);
    });
  });

  describe('multiple variables', () => {
    it('should extract multiple variables from AND', () => {
      const rule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          { '==': [{ var: 'status' }, 'active'] },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['age', 'status']);
    });

    it('should extract multiple variables from OR', () => {
      const rule = {
        or: [
          { '==': [{ var: 'role' }, 'admin'] },
          { '==': [{ var: 'permission' }, 'write'] },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['role', 'permission']);
    });

    it('should extract multiple nested variables', () => {
      const rule = {
        and: [
          { '==': [{ var: 'user.role' }, 'admin'] },
          { '==': [{ var: 'user.active' }, true] },
          { '>': [{ var: 'user.age' }, 18] },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['user.role', 'user.active', 'user.age']);
    });
  });

  describe('deduplication', () => {
    it('should deduplicate repeated variables', () => {
      const rule = {
        and: [{ '>': [{ var: 'age' }, 18] }, { '<': [{ var: 'age' }, 65] }],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['age']);
    });

    it('should deduplicate variables in complex rules', () => {
      const rule = {
        or: [
          {
            and: [
              { '>': [{ var: 'score' }, 80] },
              { '==': [{ var: 'grade' }, 'A'] },
            ],
          },
          {
            and: [
              { '>': [{ var: 'score' }, 60] },
              { '==': [{ var: 'grade' }, 'B'] },
            ],
          },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['score', 'grade']);
    });
  });

  describe('variable with default value', () => {
    it('should extract variable from array format', () => {
      const rule = { '==': [{ var: ['status', 'inactive'] }, 'active'] };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['status']);
    });

    it('should handle multiple variables with defaults', () => {
      const rule = {
        and: [
          { '==': [{ var: ['role', 'user'] }, 'admin'] },
          { '==': [{ var: ['status', 'inactive'] }, 'active'] },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['role', 'status']);
    });
  });

  describe('no variables (static rules)', () => {
    it('should return empty array for static rule', () => {
      const rule = { '==': [1, 1] };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });

    it('should return empty array for static comparison', () => {
      const rule = { '>': [5, 3] };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });

    it('should return empty array for static logical rule', () => {
      const rule = {
        and: [{ '==': [1, 1] }, { '>': [5, 3] }],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });
  });

  describe('deeply nested rules', () => {
    it('should extract variables from deeply nested AND/OR', () => {
      const rule = {
        and: [
          {
            or: [{ '==': [{ var: 'a' }, 1] }, { '==': [{ var: 'b' }, 2] }],
          },
          {
            or: [{ '==': [{ var: 'c' }, 3] }, { '==': [{ var: 'd' }, 4] }],
          },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle complex nested structure', () => {
      const rule = {
        and: [
          { '>': [{ var: 'user.age' }, 18] },
          {
            or: [
              { '==': [{ var: 'user.subscription' }, 'premium'] },
              {
                and: [
                  { '==': [{ var: 'content.free' }, true] },
                  { '<': [{ var: 'content.duration' }, 300] },
                ],
              },
            ],
          },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([
        'user.age',
        'user.subscription',
        'content.free',
        'content.duration',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const rule = {};
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });

    it('should handle null', () => {
      const rule = null;
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });

    it('should handle undefined', () => {
      const rule = undefined;
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });

    it('should handle primitive values', () => {
      const rule = 42;
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });

    it('should handle string rule', () => {
      const rule = 'test';
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });

    it('should handle array of values', () => {
      const rule = [1, 2, 3];
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([]);
    });

    it('should handle array with var', () => {
      const rule = [{ var: 'a' }, { var: 'b' }];
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual(['a', 'b']);
    });
  });

  describe('real-world scenarios', () => {
    it('should extract keys from permission check', () => {
      const rule = {
        and: [
          { '==': [{ var: 'user.role' }, 'admin'] },
          { '==': [{ var: 'user.active' }, true] },
          { in: [{ var: 'resource.id' }, { var: 'user.allowedResources' }] },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([
        'user.role',
        'user.active',
        'resource.id',
        'user.allowedResources',
      ]);
    });

    it('should extract keys from discount eligibility', () => {
      const rule = {
        or: [
          { '>=': [{ var: 'order.total' }, 100] },
          { '==': [{ var: 'customer.vip' }, true] },
          { in: [{ var: 'customer.id' }, { var: 'promotions.eligibleIds' }] },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([
        'order.total',
        'customer.vip',
        'customer.id',
        'promotions.eligibleIds',
      ]);
    });

    it('should extract keys from content access rule', () => {
      const rule = {
        and: [
          { '>=': [{ var: 'user.age' }, 18] },
          {
            or: [
              { '==': [{ var: 'user.subscription.tier' }, 'premium'] },
              { '==': [{ var: 'content.pricing.free' }, true] },
              { '<': [{ var: 'content.pricing.cost' }, 5] },
            ],
          },
        ],
      };
      const keys = getRequiredKeys(rule);
      expect(keys).toEqual([
        'user.age',
        'user.subscription.tier',
        'content.pricing.free',
        'content.pricing.cost',
      ]);
    });
  });
});
