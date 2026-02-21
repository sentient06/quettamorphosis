import { describe, it, expect } from 'vitest';
import {
  preProcessingRules,
  interLanguageRules,
  postProcessingRules,
  preProcessingRuleKeys,
  interLanguageRuleKeys,
  postProcessingRuleKeys,
} from '../src/conversions.js';

describe('Conversion Rules', () => {
  describe('Pre-processing Rules', () => {
    it('should export preProcessingRuleKeys', () => {
      expect(Array.isArray(preProcessingRuleKeys)).toBe(true);
      expect(preProcessingRuleKeys.length).toBeGreaterThan(0);
    });

    it('pre-digraphs-to-single: converts digraphs to single characters', () => {
      const rule = preProcessingRules['pre-digraphs-to-single'];
      expect(rule).toBeDefined();
      expect(rule.orderId).toBe('PRE-01');

      // Test basic digraph conversions (only those in DIGRAPH_MAP)
      expect(rule.mechanic('th')).toBe('θ');
      expect(rule.mechanic('dh')).toBe('ð');
      expect(rule.mechanic('ch')).toBe('x');
      expect(rule.mechanic('ng')).toBe('ŋ');
      expect(rule.mechanic('ph')).toBe('ɸ');
      expect(rule.mechanic('hw')).toBe('ʍ');
      expect(rule.mechanic('gw')).toBe('ƣ');
      expect(rule.mechanic('gh')).toBe('ɣ');
      expect(rule.mechanic('ss')).toBe('ſ');

      // Note: lh and rh are commented out in DIGRAPH_MAP
      // expect(rule.mechanic('lh')).toBe('λ');
      // expect(rule.mechanic('rh')).toBe('ꝛ');

      // Test aspirated stops (distinct from spirants)
      expect(rule.mechanic('kʰ')).toBe('ꝁ');
      expect(rule.mechanic('pʰ')).toBe('ƥ');
      expect(rule.mechanic('tʰ')).toBe('ŧ');

      // Test full word
      expect(rule.mechanic('ithil')).toBe('iθil');
      expect(rule.mechanic('thorondor')).toBe('θorondor');
    });
  });

  describe('Inter-language Rules', () => {
    it('should export interLanguageRuleKeys (may be empty)', () => {
      expect(Array.isArray(interLanguageRuleKeys)).toBe(true);
      // Currently empty, but structure exists
    });

    it('interLanguageRules object exists', () => {
      expect(typeof interLanguageRules).toBe('object');
    });
  });

  describe('Post-processing Rules', () => {
    it('should export postProcessingRuleKeys', () => {
      expect(Array.isArray(postProcessingRuleKeys)).toBe(true);
      expect(postProcessingRuleKeys.length).toBeGreaterThan(0);
    });

    it('post-single-to-digraphs: converts single characters back to digraphs', () => {
      const rule = postProcessingRules['post-single-to-digraphs'];
      expect(rule).toBeDefined();
      expect(rule.orderId).toBe('POST-01');

      // Test basic single-char to digraph conversions
      expect(rule.mechanic('θ')).toBe('th');
      expect(rule.mechanic('ð')).toBe('dh');
      expect(rule.mechanic('x')).toBe('ch');
      expect(rule.mechanic('ŋ')).toBe('ng');
      expect(rule.mechanic('ɸ')).toBe('ph');
      expect(rule.mechanic('λ')).toBe('lh');
      expect(rule.mechanic('ꝛ')).toBe('rh');
      // Note: ʍ maps to 'wh' in SINGLE_TO_DIGRAPH_MAP
      expect(rule.mechanic('ʍ')).toBe('wh');
      expect(rule.mechanic('ƣ')).toBe('gw');
      expect(rule.mechanic('ɣ')).toBe('gh');
      expect(rule.mechanic('ſ')).toBe('ss');

      // Test aspirated stops convert back correctly
      expect(rule.mechanic('ꝁ')).toBe('kʰ');
      expect(rule.mechanic('ƥ')).toBe('pʰ');
      expect(rule.mechanic('ŧ')).toBe('tʰ');

      // Test full word
      expect(rule.mechanic('iθil')).toBe('ithil');
      expect(rule.mechanic('θorondor')).toBe('thorondor');
    });
  });

  describe('Round-trip conversion', () => {
    it('should preserve text when converting to single chars and back', () => {
      const preRule = preProcessingRules['pre-digraphs-to-single'];
      const postRule = postProcessingRules['post-single-to-digraphs'];

      // Note: Some digraphs may not round-trip perfectly due to alternate spellings
      // e.g., 'hw' → 'ʍ' → 'wh' (SINGLE_TO_DIGRAPH_MAP uses 'wh' as the canonical form)
      const testWords = [
        'ithil',
        'thorondor',
        'edhil',
        'galadh',
        'meleth',
        'angband',
        'gwaith',
        // 'hwesta' excluded - hw → ʍ → wh (different but equivalent)
      ];

      testWords.forEach((word) => {
        const toSingle = preRule.mechanic(word);
        const backToDigraph = postRule.mechanic(toSingle);
        expect(backToDigraph).toBe(word);
      });
    });

    it('should preserve aspirated stops through round-trip', () => {
      const preRule = preProcessingRules['pre-digraphs-to-single'];
      const postRule = postProcessingRules['post-single-to-digraphs'];

      // Aspirated stops should round-trip correctly
      expect(postRule.mechanic(preRule.mechanic('kʰjabab'))).toBe('kʰjabab');
      expect(postRule.mechanic(preRule.mechanic('pʰelga'))).toBe('pʰelga');
      expect(postRule.mechanic(preRule.mechanic('tʰáni'))).toBe('tʰáni');
    });
  });
});

