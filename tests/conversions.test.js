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
      expect(rule.mechanic('th').out).toBe('θ');
      expect(rule.mechanic('dh').out).toBe('ð');
      expect(rule.mechanic('ch').out).toBe('x');
      expect(rule.mechanic('ng').out).toBe('ŋ');
      expect(rule.mechanic('ph').out).toBe('ɸ');
      expect(rule.mechanic('hw').out).toBe('ʍ');
      expect(rule.mechanic('gw').out).toBe('ƣ');
      expect(rule.mechanic('gh').out).toBe('ɣ');
      expect(rule.mechanic('ss').out).toBe('ſ');

      // Note: lh and rh are commented out in DIGRAPH_MAP
      // expect(rule.mechanic('lh').out).toBe('λ');
      // expect(rule.mechanic('rh').out).toBe('ꝛ');

      // Test aspirated stops (distinct from spirants)
      expect(rule.mechanic('kʰ').out).toBe('ꝁ');
      expect(rule.mechanic('pʰ').out).toBe('ƥ');
      expect(rule.mechanic('tʰ').out).toBe('ŧ');

      // Test full word
      expect(rule.mechanic('ithil').out).toBe('iθil');
      expect(rule.mechanic('thorondor').out).toBe('θorondor');
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
      expect(rule.mechanic('θ').out).toBe('th');
      expect(rule.mechanic('ð').out).toBe('dh');
      expect(rule.mechanic('x').out).toBe('ch');
      expect(rule.mechanic('ŋ').out).toBe('ng');
      expect(rule.mechanic('ɸ').out).toBe('ph');
      expect(rule.mechanic('λ').out).toBe('lh');
      expect(rule.mechanic('ꝛ').out).toBe('rh');
      // Note: ʍ maps to 'wh' in SINGLE_TO_DIGRAPH_MAP
      expect(rule.mechanic('ʍ').out).toBe('wh');
      expect(rule.mechanic('ƣ').out).toBe('gw');
      expect(rule.mechanic('ɣ').out).toBe('gh');
      expect(rule.mechanic('ſ').out).toBe('ss');

      // Test aspirated stops convert back to regular text (no phonetic symbols)
      expect(rule.mechanic('ꝁ').out).toBe('ch');
      expect(rule.mechanic('ƥ').out).toBe('ph');
      expect(rule.mechanic('ŧ').out).toBe('th');

      // Test full word
      expect(rule.mechanic('iθil').out).toBe('ithil');
      expect(rule.mechanic('θorondor').out).toBe('thorondor');
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
        const toSingle = preRule.mechanic(word).out;
        const backToDigraph = postRule.mechanic(toSingle).out;
        expect(backToDigraph).toBe(word);
      });
    });

    it('should convert aspirated stops to regular text through round-trip', () => {
      const preRule = preProcessingRules['pre-digraphs-to-single'];
      const postRule = postProcessingRules['post-single-to-digraphs'];

      // Aspirated stops convert to regular digraphs (no phonetic symbols in output)
      expect(postRule.mechanic(preRule.mechanic('kʰjabab').out).out).toBe('chyabab');
      expect(postRule.mechanic(preRule.mechanic('pʰelga').out).out).toBe('phelga');
      expect(postRule.mechanic(preRule.mechanic('tʰáni').out).out).toBe('tháni');
    });
  });
});

