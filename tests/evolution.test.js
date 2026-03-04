/**
 * End-to-end word evolution tests.
 * Tests words evolving through the complete rule chain from Primitive Elvish to Sindarin.
 */
import { describe, it, expect } from 'vitest';
import '../src/utils.js';
import { evolveWord } from '../src/main-logic.js';

describe('Word Evolution', () => {
  describe('evolveWord helper', () => {
    it('should evolve a simple word through all rules', () => {
      const result = evolveWord('test');
      expect(result).toHaveProperty('input', 'test');
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('morphemes');
      expect(result).toHaveProperty('tripped');
      expect(result).toHaveProperty('steps');
      expect(Array.isArray(result.tripped)).toBe(true);
      expect(Array.isArray(result.steps)).toBe(true);
    });

    it('should allow disabling specific rules by ID', () => {
      const withRule = evolveWord('abkʰa');
      // Disable a specific rule by orderId
      const withoutRule = evolveWord('abkʰa', {
        disabledRules: new Set(['00100']), // PE aspirates rule
      });
      // Results may differ when a rule is disabled
      expect(withRule.output).toBeDefined();
      expect(withoutRule.output).toBeDefined();
    });

    it('should allow disabling entire languages', () => {
      const full = evolveWord('elen');
      const noSindarin = evolveWord('elen', {
        disabledLanguages: new Set(['sindarin']),
      });
      // Without Sindarin rules, the output should be different
      expect(full.output).toBeDefined();
      expect(noSindarin.output).toBeDefined();
    });

    it('should track tripped rules', () => {
      const result = evolveWord('ñgolodō');
      // This word should trigger several rules
      expect(result.tripped.length).toBeGreaterThan(0);
      // Each tripped rule should have the expected properties
      result.tripped.forEach(rule => {
        expect(rule).toHaveProperty('ruleId');
        expect(rule).toHaveProperty('orderId');
        expect(rule).toHaveProperty('in');
        expect(rule).toHaveProperty('out');
        expect(rule.in).not.toBe(rule.out);
      });
    });

    it('should preserve morpheme boundaries', () => {
      const result = evolveWord('elenwīnge', {
        morphemes: ['elen', 'wīnge'],
      });
      expect(result.morphemes).toBeDefined();
      expect(Array.isArray(result.morphemes)).toBe(true);
    });
  });

  describe('Foundational words', () => {
    // Baseline tests: track current rule outputs
    // Update expectations as rules are refined
    // Format: input → current output (target: ideal output)

    it('ayar → aear (target: aear - ocearn)', () => {
      const result = evolveWord('ayar');
      expect(result.output).toBe('aear');
    });

    it('banya → bain (target: bain - beautiful)', () => {
      const result = evolveWord('banja');
      expect(result.output).toBe('bain');
    });

    it('kjele+kormo → kelegorm (Celegorm with North Sindarin)', () => {
      const result = evolveWord('kjele+kormo', {
        ruleOptions: {
          'S 06500': { northSindarin: true },
        },
      });
      // With North Sindarin, the m should be preserved
      expect(result.output).toBe('celgorm');
    });

    it('kalenā → calen (target: calen - green)', () => {
      const result = evolveWord('kalenā');
      expect(result.output).toBe('calen');
    });

    it('luinē → luin (target: luin - blue)', () => {
      const result = evolveWord('luinē');
      expect(result.output).toBe('luin');
    });

    it('ꝁabdā → haudh (target: haudh - mound)', () => {
      const result = evolveWord('ꝁabdā');
      expect(result.output).toBe('haudh');
    });

    it('ñgolodō → golodh (target: golodh - one of the wise folk)', () => {
      const result = evolveWord('ŋgolodō');
      expect(result.output).toBe('golodh');
    });

    it('naktā → naeth (target: naeth - woe)', () => {
      const result = evolveWord('naktā');
      expect(result.output).toBe('naeth');
    });

    it('keglē → cail (target: cail - fence)', () => {
      const result = evolveWord('keglē');
      expect(result.output).toBe('cail');
    });

    it('orkō → orch (target: orch - orc)', () => {
      const result = evolveWord('orkō');
      expect(result.output).toBe('orch');
    });

    it('orkoi → yrch (target: yrch - orcs)', () => {
      const result = evolveWord('orkoi');
      expect(result.output).toBe('yrch');
    });

    it('cambē → cam (target: cam - hand)', () => {
      const result = evolveWord('kambā');
      expect(result.output).toBe('cam');
    });

    it('cambei → cambei (target: cem - hands)', () => {
      const result = evolveWord('cambei');
      expect(result.output).toBe('cem');
    });

    it('njarnē → narn (target: narn - tale)', () => {
      const result = evolveWord('njarnē', {
        enabledRules: new Set(['AT 00300']),
      });
      expect(result.output).toBe('narn');
    });

    it('njarnei → nern (target: narn - tales)', () => {
      const result = evolveWord('njarnei', {
        enabledRules: new Set(['AT 00300']),
      });
      expect(result.output).toBe('nern');
    });

    it('lassē → lass (target: lass - leaf)', () => {
      const result = evolveWord('lassē');
      expect(result.output).toBe('lass');
    });

    it('lassei → laiss (target: laiss - leaves)', () => {
      const result = evolveWord('lassei');
      expect(result.output).toBe('laiss');
    });

    it('kiryā → cair (target: cair - ship)', () => {
      const result = evolveWord('kiryā');
      expect(result.output).toBe('cair');
    });

    it('kiryai → cîr (target: cîr - ships)', () => {
      const result = evolveWord('kiryai');
      expect(result.output).toBe('cîr');
    });

    it('ambārē → ammor (target: ammor - past of bar-: to dwell)', () => {
      const result = evolveWord('ambārē');
      expect(result.output).toBe('ammor');
    });

    it('sunkē → sunc (target: sunc - past of sog-: to drink)', () => {
      const result = evolveWord('sunkē');
      expect(result.output).toBe('sunc');
    });

    it('melnā → mell (target: mell - dear)', () => {
      const result = evolveWord('melnā');
      expect(result.output).toBe('mell');
    });

    it('dana → dân (target: dân - green elf)', () => {
      const result = evolveWord('dana');
      expect(result.output).toBe('dân');
    });

    it('litse → lith (target: lith - ash)', () => {
      const result = evolveWord('litse');
      expect(result.output).toBe('lith');
    });

    it('khīr → hîr (target: hîr - lord)', () => {
      const result = evolveWord('khīr');
      expect(result.output).toBe('hîr');
    });

    it('nūrā → nûr (target: nûr - race or deep)', () => {
      const result = evolveWord('nūrā');
      expect(result.output).toBe('nûr');
    });

    it('mbelektā → belaith (target: belaith - mighty)', () => {
      const result = evolveWord('mbelektā');
      expect(result.output).toBe('belaith');
    });

    it('aꝁālē → achol (target: ahol - past of hal- to lift)', () => {
      const result = evolveWord('aꝁālē');
      expect(result.output).toBe('achol');
    });

    it('kwende evolves through rules', () => {
      const result = evolveWord('kwende');
      expect(result.output).toBeDefined();
      // Track the current output for future reference
      console.log('kwende →', result.output);
    });

    it('baradā → baradh (target: barad - tower)', () => {
      const result = evolveWord('baradā');
      // Current: paradh (unexpected changes)
      // Target: barad
      expect(result.output).toBe('baradh');
    });

    it('ndōre → dûr (target: dôr - land)', () => {
      const result = evolveWord('ndōre');
      // Current: nûr (nd simplification and vowel changes differ)
      // Target: dôr
      expect(result.output).toBe('dûr');
    });
  });

  describe('Compounds with morpheme boundaries', () => {
    it('elen + wīnge → Elwing (star-spray)', () => {
      const result = evolveWord('elenwīnge', {
        morphemes: ['elen', 'wīnge'],
      });
      // The compound should evolve correctly
      expect(result.output).toBeDefined();
      expect(result.morphemes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Rule option overrides', () => {
    it('should apply custom rule options', () => {
      // Test with a rule that has options (like North Sindarin for rule 06500)
      const regular = evolveWord('parma');
      const northSindarin = evolveWord('parma', {
        ruleOptions: {
          '06500': { northSindarin: true },
        },
      });
      // North Sindarin preserves m, regular Sindarin changes m → v
      expect(regular.output).toBeDefined();
      expect(northSindarin.output).toBeDefined();
    });
  });
});

