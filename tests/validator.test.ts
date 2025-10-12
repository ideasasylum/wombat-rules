import { describe, it, expect } from 'vitest';
import { canExecuteRule } from '../src/validator';

describe('canExecuteRule', () => {
  describe('all keys present', () => {
    it('should return true when single key exists', () => {
      const rule = { '>': [{ var: 'age' }, 18] };
      const data = { age: 25 };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return true when multiple keys exist', () => {
      const rule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          { '==': [{ var: 'status' }, 'active'] },
        ],
      };
      const data = { age: 25, status: 'active' };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return true for nested keys', () => {
      const rule = { '==': [{ var: 'user.name' }, 'Alice'] };
      const data = { user: { name: 'Alice' } };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return true for deeply nested keys', () => {
      const rule = { '==': [{ var: 'user.profile.settings.theme' }, 'dark'] };
      const data = {
        user: {
          profile: {
            settings: {
              theme: 'dark',
            },
          },
        },
      };
      expect(canExecuteRule(rule, data)).toBe(true);
    });
  });

  describe('missing keys', () => {
    it('should return false when key is missing', () => {
      const rule = { '>': [{ var: 'age' }, 18] };
      const data = { name: 'Alice' };
      expect(canExecuteRule(rule, data)).toBe(false);
    });

    it('should return false when one of multiple keys is missing', () => {
      const rule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          { '==': [{ var: 'status' }, 'active'] },
        ],
      };
      const data = { age: 25 };
      expect(canExecuteRule(rule, data)).toBe(false);
    });

    it('should return false when nested key is missing', () => {
      const rule = { '==': [{ var: 'user.name' }, 'Alice'] };
      const data = { user: {} };
      expect(canExecuteRule(rule, data)).toBe(false);
    });

    it('should return false when parent object is missing', () => {
      const rule = { '==': [{ var: 'user.name' }, 'Alice'] };
      const data = { name: 'Alice' };
      expect(canExecuteRule(rule, data)).toBe(false);
    });

    it('should return false when deeply nested key is missing', () => {
      const rule = { '==': [{ var: 'user.profile.settings.theme' }, 'dark'] };
      const data = {
        user: {
          profile: {
            settings: {},
          },
        },
      };
      expect(canExecuteRule(rule, data)).toBe(false);
    });

    it('should return false when intermediate nested key is missing', () => {
      const rule = { '==': [{ var: 'user.profile.settings.theme' }, 'dark'] };
      const data = {
        user: {},
      };
      expect(canExecuteRule(rule, data)).toBe(false);
    });
  });

  describe('static rules (no variables)', () => {
    it('should return true for static rule', () => {
      const rule = { '==': [1, 1] };
      const data = {};
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return true for static rule with any data', () => {
      const rule = { '>': [5, 3] };
      const data = { foo: 'bar', baz: 123 };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return true for static logical rule', () => {
      const rule = {
        and: [{ '==': [1, 1] }, { '>': [5, 3] }],
      };
      const data = {};
      expect(canExecuteRule(rule, data)).toBe(true);
    });
  });

  describe('extra data (should pass)', () => {
    it('should return true when data has extra keys', () => {
      const rule = { '>': [{ var: 'age' }, 18] };
      const data = { age: 25, name: 'Alice', email: 'alice@example.com' };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return true when nested data has extra keys', () => {
      const rule = { '==': [{ var: 'user.name' }, 'Alice'] };
      const data = {
        user: {
          name: 'Alice',
          age: 25,
          email: 'alice@example.com',
        },
      };
      expect(canExecuteRule(rule, data)).toBe(true);
    });
  });

  describe('null and undefined handling', () => {
    it('should return true when key exists with null value', () => {
      const rule = { '==': [{ var: 'value' }, null] };
      const data = { value: null };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return true when key exists with undefined value', () => {
      const rule = { '==': [{ var: 'value' }, undefined] };
      const data = { value: undefined };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return false when key does not exist (vs null)', () => {
      const rule = { '==': [{ var: 'value' }, null] };
      const data = {};
      expect(canExecuteRule(rule, data)).toBe(false);
    });

    it('should return false when nested path has null intermediate', () => {
      const rule = { '==': [{ var: 'user.name' }, 'Alice'] };
      const data = { user: null };
      expect(canExecuteRule(rule, data)).toBe(false);
    });
  });

  describe('repeated variables', () => {
    it('should handle repeated variables correctly', () => {
      const rule = {
        and: [{ '>': [{ var: 'age' }, 18] }, { '<': [{ var: 'age' }, 65] }],
      };
      const data = { age: 25 };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return false when repeated variable is missing', () => {
      const rule = {
        and: [{ '>': [{ var: 'age' }, 18] }, { '<': [{ var: 'age' }, 65] }],
      };
      const data = { name: 'Alice' };
      expect(canExecuteRule(rule, data)).toBe(false);
    });
  });

  describe('complex nested rules', () => {
    it('should validate complex AND/OR with all keys present', () => {
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
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should return false when one key in complex rule is missing', () => {
      const rule = {
        and: [
          { '>': [{ var: 'age' }, 18] },
          {
            or: [
              { '==': [{ var: 'role' }, 'admin'] },
              { '==': [{ var: 'permission' }, 'write'] },
            ],
          },
        ],
      };
      const data = { age: 25, role: 'admin' };
      expect(canExecuteRule(rule, data)).toBe(false);
    });

    it('should validate deeply nested rule structure', () => {
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
      const data = {
        user: { age: 25, subscription: 'free' },
        content: { free: true, duration: 120 },
      };
      expect(canExecuteRule(rule, data)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty rule object', () => {
      const rule = {};
      const data = { foo: 'bar' };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should handle empty data object with static rule', () => {
      const rule = { '==': [1, 1] };
      const data = {};
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should handle primitive rule value', () => {
      const rule = 42;
      const data = { foo: 'bar' };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should handle array rule', () => {
      const rule = [1, 2, 3];
      const data = { foo: 'bar' };
      expect(canExecuteRule(rule, data)).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should validate user permission check', () => {
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
          email: 'admin@example.com',
        },
      };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should reject incomplete user data', () => {
      const rule = {
        and: [
          { '==': [{ var: 'user.role' }, 'admin'] },
          { '==': [{ var: 'user.active' }, true] },
        ],
      };
      const data = {
        user: {
          role: 'admin',
        },
      };
      expect(canExecuteRule(rule, data)).toBe(false);
    });

    it('should validate discount eligibility check', () => {
      const rule = {
        or: [
          { '>=': [{ var: 'orderTotal' }, 100] },
          { '==': [{ var: 'vipMember' }, true] },
        ],
      };
      const data = {
        orderTotal: 150,
        vipMember: false,
        customerId: 'abc123',
      };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should validate content access rule', () => {
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
          title: 'Sample Content',
        },
      };
      expect(canExecuteRule(rule, data)).toBe(true);
    });

    it('should reject incomplete content access data', () => {
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
        },
        // missing content object
      };
      expect(canExecuteRule(rule, data)).toBe(false);
    });
  });
});
