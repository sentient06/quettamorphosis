import { describe, it, expect } from "vitest";
import {
  decodeQueryString,
  encodeQueryString,
  parseDisabledParam,
  encodeDisabledParam,
} from "../src/query-string.js";
import { toBase36, fromBase36 } from "../src/utils.js";

describe('Query string encoding/decoding', () => {
  describe('decodeQueryString', () => {
    it('should convert uppercase digraphs to phonetic symbols', () => {
      expect(decodeQueryString('TH')).toBe('θ');
      expect(decodeQueryString('DH')).toBe('ð');
      expect(decodeQueryString('PH')).toBe('ɸ');
      expect(decodeQueryString('CH')).toBe('x');
      expect(decodeQueryString('KH')).toBe('x');
      expect(decodeQueryString('NG')).toBe('ŋ');
      expect(decodeQueryString('GH')).toBe('ɣ');
      expect(decodeQueryString('GW')).toBe('ƣ');
      expect(decodeQueryString('HW')).toBe('ʍ');
      expect(decodeQueryString('SS')).toBe('ſ');
      expect(decodeQueryString('XW')).toBe('ƕ');
      expect(decodeQueryString('XJ')).toBe('ꜧ');
    });

    it('should keep lowercase digraphs as literal', () => {
      expect(decodeQueryString('th')).toBe('th');
      expect(decodeQueryString('dh')).toBe('dh');
      expect(decodeQueryString('ph')).toBe('ph');
      expect(decodeQueryString('ng')).toBe('ng');
    });

    it('should convert aspirated consonants', () => {
      expect(decodeQueryString("p'")).toBe('pʰ');
      expect(decodeQueryString("t'")).toBe('tʰ');
      expect(decodeQueryString("k'")).toBe('kʰ');
    });

    it('should convert stressed vowels', () => {
      expect(decodeQueryString("a'")).toBe('á');
      expect(decodeQueryString("e'")).toBe('é');
      expect(decodeQueryString("i'")).toBe('í');
      expect(decodeQueryString("o'")).toBe('ó');
      expect(decodeQueryString("u'")).toBe('ú');
    });

    it('should convert long vowels', () => {
      expect(decodeQueryString('a:')).toBe('ā');
      expect(decodeQueryString('e:')).toBe('ē');
      expect(decodeQueryString('i:')).toBe('ī');
      expect(decodeQueryString('o:')).toBe('ō');
      expect(decodeQueryString('u:')).toBe('ū');
    });

    it('should convert voiceless sonorants', () => {
      expect(decodeQueryString('m,')).toBe('m̥');
      expect(decodeQueryString('n,')).toBe('n̥');
      expect(decodeQueryString('l,')).toBe('l̥');
      expect(decodeQueryString('r,')).toBe('r̥');
      expect(decodeQueryString('w,')).toBe('w̥');
      expect(decodeQueryString('j,')).toBe('j̊');
    });

    it('should convert nasalized v', () => {
      expect(decodeQueryString('V~')).toBe('ɱ');
      expect(decodeQueryString('v~')).toBe('ɱ');
    });

    it('should convert morpheme boundary', () => {
      expect(decodeQueryString('.')).toBe('+');
      expect(decodeQueryString('kwenta:.korma')).toBe('kwentā+korma');
    });

    it('should handle full words', () => {
      expect(decodeQueryString('kwenda:')).toBe('kwendā');
      expect(decodeQueryString('THorondor')).toBe('θorondor');
      expect(decodeQueryString('NGoldo')).toBe('ŋoldo');
      expect(decodeQueryString("p'a'rma")).toBe('pʰárma');
    });

    it('should handle empty string', () => {
      expect(decodeQueryString('')).toBe('');
      expect(decodeQueryString(null)).toBe('');
      expect(decodeQueryString(undefined)).toBe('');
    });
  });

  describe('encodeQueryString', () => {
    it('should convert phonetic symbols to uppercase digraphs', () => {
      expect(encodeQueryString('θ')).toBe('TH');
      expect(encodeQueryString('ð')).toBe('DH');
      expect(encodeQueryString('ɸ')).toBe('PH');
      expect(encodeQueryString('x')).toBe('CH');
      expect(encodeQueryString('ŋ')).toBe('NG');
      expect(encodeQueryString('ɣ')).toBe('GH');
      expect(encodeQueryString('ƣ')).toBe('GW');
      expect(encodeQueryString('ʍ')).toBe('HW');
      expect(encodeQueryString('ſ')).toBe('SS');
      expect(encodeQueryString('ƕ')).toBe('XW');
      expect(encodeQueryString('ꜧ')).toBe('XJ');
    });

    it('should convert aspirated consonants', () => {
      expect(encodeQueryString('pʰ')).toBe("p'");
      expect(encodeQueryString('tʰ')).toBe("t'");
      expect(encodeQueryString('kʰ')).toBe("k'");
    });

    it('should convert stressed vowels', () => {
      expect(encodeQueryString('á')).toBe("a'");
      expect(encodeQueryString('é')).toBe("e'");
      expect(encodeQueryString('í')).toBe("i'");
      expect(encodeQueryString('ó')).toBe("o'");
      expect(encodeQueryString('ú')).toBe("u'");
    });

    it('should convert long vowels', () => {
      expect(encodeQueryString('ā')).toBe('a:');
      expect(encodeQueryString('ē')).toBe('e:');
      expect(encodeQueryString('ī')).toBe('i:');
      expect(encodeQueryString('ō')).toBe('o:');
      expect(encodeQueryString('ū')).toBe('u:');
    });

    it('should convert voiceless sonorants', () => {
      expect(encodeQueryString('m̥')).toBe('m,');
      expect(encodeQueryString('n̥')).toBe('n,');
      expect(encodeQueryString('l̥')).toBe('l,');
      expect(encodeQueryString('r̥')).toBe('r,');
      expect(encodeQueryString('w̥')).toBe('w,');
      expect(encodeQueryString('j̊')).toBe('j,');
    });

    it('should convert nasalized v', () => {
      expect(encodeQueryString('ɱ')).toBe('V~');
    });

    it('should convert morpheme boundary', () => {
      expect(encodeQueryString('+')).toBe('.');
      expect(encodeQueryString('kwentā+korma')).toBe('kwenta:.korma');
    });

    it('should convert ñ to NG (equivalent to ŋ)', () => {
      expect(encodeQueryString('ñ')).toBe('NG');
      expect(encodeQueryString('añk')).toBe('aNGk');
    });

    it('should handle full words', () => {
      expect(encodeQueryString('kwendā')).toBe('kwenda:');
      expect(encodeQueryString('θorondor')).toBe('THorondor');
      expect(encodeQueryString('ŋoldo')).toBe('NGoldo');
      expect(encodeQueryString('pʰárma')).toBe("p'a'rma");
    });

    it('should handle empty string', () => {
      expect(encodeQueryString('')).toBe('');
      expect(encodeQueryString(null)).toBe('');
      expect(encodeQueryString(undefined)).toBe('');
    });
  });

  describe('round-trip encoding/decoding', () => {
    it('should decode what was encoded', () => {
      const testCases = ['kwendā', 'θorondor', 'ŋoldo', 'pʰárma', 'ɱala', 'm̥oria'];
      for (const original of testCases) {
        const encoded = encodeQueryString(original);
        const decoded = decodeQueryString(encoded);
        expect(decoded).toBe(original);
      }
    });

    it('should encode what was decoded', () => {
      const testCases = ['kwenda:', 'THorondor', 'NGoldo', "p'a'rma", 'V~ala', 'm,oria'];
      for (const original of testCases) {
        const decoded = decodeQueryString(original);
        const encoded = encodeQueryString(decoded);
        expect(encoded).toBe(original);
      }
    });
  });
});

describe('Disabled rules query string', () => {
  // Sample rule IDs for testing (simulating real Eldamo IDs)
  const sampleRuleIds = [
    '70600889',   // Base-36: 1617ZT
    '71909447',   // Base-36: 16T9ON
    '107931923',  // Base-36: 1S9CSZ
    '113345945',  // Base-36: 1VHEAH
    '132402625',  // Base-36: 26TUIP
    '171120983',  // Base-36: 2TVPSN
    '345959193',  // Base-36: 5PZ3TL
  ];

  describe('toBase36 / fromBase36', () => {
    it('should convert decimal to Base-36', () => {
      expect(toBase36('70600889')).toBe('1617ZT');
      expect(toBase36('171120983')).toBe('2TVPSN');
      expect(toBase36('345959193')).toBe('5PZ3TL');
    });

    it('should convert Base-36 to decimal', () => {
      expect(fromBase36('1617ZT')).toBe('70600889');
      expect(fromBase36('2TVPSN')).toBe('171120983');
      expect(fromBase36('5PZ3TL')).toBe('345959193');
    });

    it('should be case-insensitive for fromBase36', () => {
      expect(fromBase36('1617zt')).toBe('70600889');
      expect(fromBase36('2tvpsn')).toBe('171120983');
    });

    it('should handle round-trip conversion', () => {
      for (const id of sampleRuleIds) {
        const b36 = toBase36(id);
        const back = fromBase36(b36);
        expect(back).toBe(id);
      }
    });
  });

  describe('parseDisabledParam', () => {
    it('should return empty sets for null/empty input', () => {
      const result = parseDisabledParam(null, sampleRuleIds);
      expect(result.disabledRules.size).toBe(0);
      expect(result.disabledLanguages.size).toBe(0);
    });

    it('should parse single Base-36 ID', () => {
      const result = parseDisabledParam('1617ZT', sampleRuleIds);
      expect(result.disabledRules.has('70600889')).toBe(true);
      expect(result.disabledRules.size).toBe(1);
    });

    it('should parse multiple comma-separated IDs', () => {
      const result = parseDisabledParam('1617ZT,2TVPSN,5PZ3TL', sampleRuleIds);
      expect(result.disabledRules.has('70600889')).toBe(true);
      expect(result.disabledRules.has('171120983')).toBe(true);
      expect(result.disabledRules.has('345959193')).toBe(true);
      expect(result.disabledRules.size).toBe(3);
    });

    it('should parse language codes', () => {
      const result = parseDisabledParam('PE', sampleRuleIds);
      expect(result.disabledLanguages.has('primitive-elvish')).toBe(true);
      expect(result.disabledLanguages.size).toBe(1);
    });

    it('should parse multiple language codes', () => {
      const result = parseDisabledParam('PE,AT,OS,S', sampleRuleIds);
      expect(result.disabledLanguages.has('primitive-elvish')).toBe(true);
      expect(result.disabledLanguages.has('ancient-telerin')).toBe(true);
      expect(result.disabledLanguages.has('old-sindarin')).toBe(true);
      expect(result.disabledLanguages.has('sindarin')).toBe(true);
      expect(result.disabledLanguages.size).toBe(4);
    });

    it('should parse ranges with dash', () => {
      // Range from 70600889 to 113345945 should include:
      // 70600889, 71909447, 107931923, 113345945
      const result = parseDisabledParam('1617ZT-1VHEAH', sampleRuleIds);
      expect(result.disabledRules.has('70600889')).toBe(true);
      expect(result.disabledRules.has('71909447')).toBe(true);
      expect(result.disabledRules.has('107931923')).toBe(true);
      expect(result.disabledRules.has('113345945')).toBe(true);
      expect(result.disabledRules.has('132402625')).toBe(false); // Outside range
      expect(result.disabledRules.size).toBe(4);
    });

    it('should parse mixed languages, IDs, and ranges', () => {
      const result = parseDisabledParam('PE,1617ZT,2TVPSN-5PZ3TL', sampleRuleIds);
      // Language
      expect(result.disabledLanguages.has('primitive-elvish')).toBe(true);
      // Single ID
      expect(result.disabledRules.has('70600889')).toBe(true);
      // Range (171120983 to 345959193 includes 171120983, 345959193)
      expect(result.disabledRules.has('171120983')).toBe(true);
      expect(result.disabledRules.has('345959193')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result = parseDisabledParam('pe,1617zt', sampleRuleIds);
      expect(result.disabledLanguages.has('primitive-elvish')).toBe(true);
      expect(result.disabledRules.has('70600889')).toBe(true);
    });

    it('should ignore unknown IDs', () => {
      const result = parseDisabledParam('XXXXXX', sampleRuleIds);
      expect(result.disabledRules.size).toBe(0);
    });
  });

  describe('encodeDisabledParam', () => {
    it('should return empty string for empty sets', () => {
      const result = encodeDisabledParam(new Set(), new Set(), sampleRuleIds);
      expect(result).toBe('');
    });

    it('should encode single rule ID to Base-36', () => {
      const result = encodeDisabledParam(new Set(['70600889']), new Set(), sampleRuleIds);
      expect(result).toBe('1617ZT');
    });

    it('should encode multiple rule IDs', () => {
      const result = encodeDisabledParam(
        new Set(['70600889', '171120983']),
        new Set(),
        sampleRuleIds
      );
      // Should be sorted numerically
      expect(result).toBe('1617ZT,2TVPSN');
    });

    it('should encode language codes', () => {
      const result = encodeDisabledParam(new Set(), new Set(['primitive-elvish']), sampleRuleIds);
      expect(result).toBe('PE');
    });

    it('should encode both languages and rules', () => {
      const result = encodeDisabledParam(
        new Set(['70600889']),
        new Set(['sindarin']),
        sampleRuleIds
      );
      expect(result).toBe('S,1617ZT');
    });
  });

  describe('round-trip disabled params', () => {
    it('should parse what was encoded', () => {
      const disabledRules = new Set(['70600889', '171120983']);
      const disabledLanguages = new Set(['primitive-elvish']);

      const encoded = encodeDisabledParam(disabledRules, disabledLanguages, sampleRuleIds);
      const parsed = parseDisabledParam(encoded, sampleRuleIds);

      expect(parsed.disabledRules).toEqual(disabledRules);
      expect(parsed.disabledLanguages).toEqual(disabledLanguages);
    });
  });
});
