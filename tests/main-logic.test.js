import { describe, it, expect, beforeEach } from 'vitest';
import {
  peRuleKeys,
  atRuleKeys,
  osRuleKeys,
  sindarinRuleKeys,
  allRuleKeys,
  isConversionRule,
  getRulesObject,
  getLanguage,
  getPreviousRule,
  getNextRule,
  formatTripped,
  formatSkipped,
  isRuleEffectivelyEnabled,
  getResultsObject,
} from '../src/main-logic.js';
import { sindarinRules } from '../src/sindarin.js';
import { oldSindarinRules } from '../src/old-sindarin.js';
import { ancientTelerinRules } from '../src/ancient-telerin.js';
import { primitiveElvishRules } from '../src/primitive-elvish.js';
import { preProcessingRules } from '../src/conversions.js';

describe('main-logic', () => {
  describe('rule keys', () => {
    it('atRuleKeys should be sorted by orderId', () => {
      for (let i = 1; i < atRuleKeys.length; i++) {
        const prevOrderId = ancientTelerinRules[atRuleKeys[i - 1]].orderId;
        const currOrderId = ancientTelerinRules[atRuleKeys[i]].orderId;
        expect(prevOrderId.localeCompare(currOrderId)).toBeLessThanOrEqual(0);
      }
    });

    it('osRuleKeys should be sorted by orderId', () => {
      for (let i = 1; i < osRuleKeys.length; i++) {
        const prevOrderId = oldSindarinRules[osRuleKeys[i - 1]].orderId;
        const currOrderId = oldSindarinRules[osRuleKeys[i]].orderId;
        expect(prevOrderId.localeCompare(currOrderId)).toBeLessThanOrEqual(0);
      }
    });

    it('sindarinRuleKeys should be sorted by orderId', () => {
      for (let i = 1; i < sindarinRuleKeys.length; i++) {
        const prevOrderId = sindarinRules[sindarinRuleKeys[i - 1]].orderId;
        const currOrderId = sindarinRules[sindarinRuleKeys[i]].orderId;
        expect(prevOrderId.localeCompare(currOrderId)).toBeLessThanOrEqual(0);
      }
    });

    it('allRuleKeys should contain all rule keys', () => {
      expect(allRuleKeys).toContain(atRuleKeys[0]);
      expect(allRuleKeys).toContain(osRuleKeys[0]);
      expect(allRuleKeys).toContain(sindarinRuleKeys[0]);
    });
  });

  describe('isConversionRule', () => {
    it('should return true for pre-processing rules', () => {
      const preProcessingKeys = Object.keys(preProcessingRules);
      if (preProcessingKeys.length > 0) {
        expect(isConversionRule(preProcessingKeys[0])).toBe(true);
      }
    });

    it('should return false for language rules', () => {
      expect(isConversionRule(osRuleKeys[0])).toBe(false);
      expect(isConversionRule(sindarinRuleKeys[0])).toBe(false);
      expect(isConversionRule(atRuleKeys[0])).toBe(false);
    });
  });

  describe('getRulesObject', () => {
    it('should return ancientTelerinRules for AT rule IDs', () => {
      expect(getRulesObject(atRuleKeys[0])).toBe(ancientTelerinRules);
    });

    it('should return oldSindarinRules for OS rule IDs', () => {
      expect(getRulesObject(osRuleKeys[0])).toBe(oldSindarinRules);
    });

    it('should return sindarinRules for Sindarin rule IDs', () => {
      expect(getRulesObject(sindarinRuleKeys[0])).toBe(sindarinRules);
    });

    it('should return null for unknown rule IDs', () => {
      expect(getRulesObject('nonexistent-rule')).toBe(null);
    });
  });

  describe('getLanguage', () => {
    it('should return ancient-telerin for AT rules', () => {
      expect(getLanguage(atRuleKeys[0])).toBe('ancient-telerin');
    });

    it('should return old-sindarin for OS rules', () => {
      expect(getLanguage(osRuleKeys[0])).toBe('old-sindarin');
    });

    it('should return sindarin for Sindarin rules', () => {
      expect(getLanguage(sindarinRuleKeys[0])).toBe('sindarin');
    });

    it('should return null for unknown rule IDs', () => {
      expect(getLanguage('nonexistent-rule')).toBe(null);
    });
  });

  describe('getPreviousRule / getNextRule', () => {
    it('getPreviousRule should return the previous rule in allRuleKeys', () => {
      const secondRuleId = allRuleKeys[1];
      expect(getPreviousRule(secondRuleId)).toBe(allRuleKeys[0]);
    });

    it('getNextRule should return the next rule in allRuleKeys', () => {
      const firstRuleId = allRuleKeys[0];
      expect(getNextRule(firstRuleId)).toBe(allRuleKeys[1]);
    });

    it('getPreviousRule should return undefined for first rule', () => {
      expect(getPreviousRule(allRuleKeys[0])).toBeUndefined();
    });

    it('getNextRule should return undefined for last rule', () => {
      const lastRuleId = allRuleKeys[allRuleKeys.length - 1];
      expect(getNextRule(lastRuleId)).toBeUndefined();
    });
  });

  describe('formatTripped', () => {
    it('should format tripped rules as HTML anchors', () => {
      const mockRules = {
        'rule1': { orderId: '00100' },
        'rule2': { orderId: '00200' },
      };
      const mockResults = {
        'rule1': { in: 'input1', out: 'output1' },
        'rule2': { in: 'input2', out: 'output2' },
      };
      const result = formatTripped(mockRules, mockResults);
      expect(result).toContain('<a href="#rule-rule1">00100</a> - output1');
      expect(result).toContain('<a href="#rule-rule2">00200</a> - output2');
    });

    it('should return empty string for empty results', () => {
      const mockRules = { 'rule1': { orderId: '00100' } };
      const result = formatTripped(mockRules, {});
      expect(result).toBe('');
    });

    it('should sort by orderId', () => {
      const mockRules = {
        'rule1': { orderId: '00200' },
        'rule2': { orderId: '00100' },
      };
      const mockResults = {
        'rule1': { in: 'input1', out: 'output1' },
        'rule2': { in: 'input2', out: 'output2' },
      };
      const result = formatTripped(mockRules, mockResults);
      const lines = result.split('\n');
      expect(lines[0]).toContain('00100');
      expect(lines[1]).toContain('00200');
    });
  });

  describe('formatSkipped', () => {
    it('should include rules with skip: true', () => {
      const mockRules = {
        'rule1': { orderId: '00100', skip: true },
        'rule2': { orderId: '00200' },
      };
      const ruleKeys = ['rule1', 'rule2'];
      const ruleState = {};
      const result = formatSkipped(mockRules, ruleKeys, ruleState);
      expect(result).toContain('00100');
      expect(result).not.toContain('00200');
    });

    it('should include rules with ruleState[ruleId] === false', () => {
      const mockRules = {
        'rule1': { orderId: '00100' },
        'rule2': { orderId: '00200' },
      };
      const ruleKeys = ['rule1', 'rule2'];
      const ruleState = { 'rule2': false };
      const result = formatSkipped(mockRules, ruleKeys, ruleState);
      expect(result).not.toContain('00100');
      expect(result).toContain('00200');
    });

    it('should return empty string when no rules are skipped', () => {
      const mockRules = {
        'rule1': { orderId: '00100' },
        'rule2': { orderId: '00200' },
      };
      const ruleKeys = ['rule1', 'rule2'];
      const ruleState = {};
      const result = formatSkipped(mockRules, ruleKeys, ruleState);
      expect(result).toBe('');
    });
  });

  describe('isRuleEffectivelyEnabled', () => {
    it('should return true for conversion rules regardless of state', () => {
      const preProcessingKeys = Object.keys(preProcessingRules);
      if (preProcessingKeys.length > 0) {
        expect(isRuleEffectivelyEnabled(preProcessingKeys[0], {}, {})).toBe(true);
        expect(isRuleEffectivelyEnabled(preProcessingKeys[0], { [preProcessingKeys[0]]: false }, {})).toBe(true);
      }
    });

    it('should return false when language is disabled', () => {
      const ruleId = osRuleKeys[0];
      const ruleState = {};
      const languageState = { 'old-sindarin': false };
      expect(isRuleEffectivelyEnabled(ruleId, ruleState, languageState)).toBe(false);
    });

    it('should return false when rule is disabled via ruleState', () => {
      const ruleId = osRuleKeys[0];
      const ruleState = { [ruleId]: false };
      const languageState = {};
      expect(isRuleEffectivelyEnabled(ruleId, ruleState, languageState)).toBe(false);
    });

    it('should return true when both language and rule are enabled', () => {
      const ruleId = osRuleKeys[0];
      const ruleState = {};
      const languageState = {};
      expect(isRuleEffectivelyEnabled(ruleId, ruleState, languageState)).toBe(true);
    });

    it('should return false for rules with skip: true by default', () => {
      // Find a rule with skip: true
      const skippedRule = osRuleKeys.find(id => oldSindarinRules[id]?.skip === true)
        || sindarinRuleKeys.find(id => sindarinRules[id]?.skip === true)
        || atRuleKeys.find(id => ancientTelerinRules[id]?.skip === true);

      if (skippedRule) {
        const ruleState = {};
        const languageState = {};
        expect(isRuleEffectivelyEnabled(skippedRule, ruleState, languageState)).toBe(false);
      }
    });

    it('should return true for skip: true rules when overridden in ruleState', () => {
      // Find a rule with skip: true
      const skippedRule = osRuleKeys.find(id => oldSindarinRules[id]?.skip === true)
        || sindarinRuleKeys.find(id => sindarinRules[id]?.skip === true)
        || atRuleKeys.find(id => ancientTelerinRules[id]?.skip === true);

      if (skippedRule) {
        const ruleState = { [skippedRule]: true };
        const languageState = {};
        expect(isRuleEffectivelyEnabled(skippedRule, ruleState, languageState)).toBe(true);
      }
    });
  });

  describe('getResultsObject', () => {
    it('should return the PE results object for PE rules', () => {
      const peResults = {};
      const atResults = {};
      const osResults = {};
      const sindarinResults = {};
      expect(getResultsObject(peRuleKeys[0], peResults, atResults, osResults, sindarinResults)).toBe(peResults);
    });

    it('should return the AT results object for AT rules', () => {
      const peResults = {};
      const atResults = {};
      const osResults = {};
      const sindarinResults = {};
      expect(getResultsObject(atRuleKeys[0], peResults, atResults, osResults, sindarinResults)).toBe(atResults);
    });

    it('should return the OS results object for OS rules', () => {
      const peResults = {};
      const atResults = {};
      const osResults = {};
      const sindarinResults = {};
      expect(getResultsObject(osRuleKeys[0], peResults, atResults, osResults, sindarinResults)).toBe(osResults);
    });

    it('should return the Sindarin results object for Sindarin rules', () => {
      const peResults = {};
      const atResults = {};
      const osResults = {};
      const sindarinResults = {};
      expect(getResultsObject(sindarinRuleKeys[0], peResults, atResults, osResults, sindarinResults)).toBe(sindarinResults);
    });

    it('should return null for unknown rules', () => {
      expect(getResultsObject('nonexistent', {}, {}, {}, {})).toBe(null);
    });

    it('should return null for conversion rules', () => {
      const preProcessingKeys = Object.keys(preProcessingRules);
      if (preProcessingKeys.length > 0) {
        expect(getResultsObject(preProcessingKeys[0], {}, {}, {}, {})).toBe(null);
      }
    });
  });
});

