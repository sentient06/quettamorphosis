import './utils.js'; // Load String prototype extensions
import {
  syllabify,
  breakIntoVowelsAndConsonants,
  findFirstOf,
  findAllOf,
  SyllableAnalyser,
  recalcMorphemes,
} from './utils.js';
import { sandhiRules, SANDHI_MASTER_RULE_ID } from './sandhi.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const sindarinRules = {
  '2002760597': {
    orderId: '00100',
    pattern: '[w-] > [gw-]',
    description: 'initial [w] became [gw]',
    url: 'https://eldamo.org/content/words/word-2002760597.html',
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const initialW = morphemes.some(m => m.nth(0) === 'w');
      if (initialW === false) return { in: str, out: str, morphemes: options.morphemes };
      
      if (morphemes.length > 1) {
        const updatedMorphemes = morphemes.map((m) => {
          if (m.nth(0) === 'w') {
            return 'gw' + m.substring(1);
          }
          return m;
        });
        return { in: str, out: updatedMorphemes.join(''), morphemes: updatedMorphemes };
      }
      return { in: str, out: `g${str}`, morphemes: [`g${str}`] };
    },
  },
  '3057844573': {
    orderId: '00200',
    pattern: '[{mb|nd|ŋg}-] > [{bdg}-]',
    description: 'initial nasals vanished before stops',
    url: 'https://eldamo.org/content/words/word-3057844573.html',
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const initialNasal = morphemes.some((m) => {
        const takeTwo = m.substring(0, 2);
        return takeTwo === 'mb' || takeTwo === 'nd' || takeTwo === 'ŋg';
      });
      if (initialNasal === false) return { in: str, out: str, morphemes: options.morphemes };

      const newMorphemes = morphemes.map((m) => {
        const takeTwo = m.substring(0, 2);
        if (takeTwo === 'mb') return 'b' + m.substring(2);
        if (takeTwo === 'nd') return 'd' + m.substring(2);
        if (takeTwo === 'ŋg') return 'g' + m.substring(2);
        return m;
      });

      return { in: str, out: newMorphemes.join(''), morphemes: newMorphemes };
    },
  },
  '876455981': {
    orderId: '00300',
    pattern: '[-V{mn}] > [-Vø]',
    description: 'final nasals vanished after vowels in unstressed final syllables',
    url: 'https://eldamo.org/content/words/word-876455981.html',
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];

      // Process each morpheme individually
      const newMorphemes = morphemes.map((m) => {
        const lastChar = m.nth(-1);
        const penultimateChar = m.nth(-2);

        // Check if ends in nasal after vowel
        if (!['m', 'n'].includes(lastChar)) return m;
        if (!penultimateChar || !penultimateChar.isVowel()) return m;

        // Only apply to polysyllables with unstressed final syllable
        const analyser = new SyllableAnalyser();
        const syllableData = analyser.analyse(m);

        // Monosyllables: final syllable is stressed, preserve nasal
        if (syllableData.length < 2) return m;

        // Polysyllables: check if final syllable is unstressed
        const finalSyllable = syllableData.at(-1);
        if (finalSyllable.stressed || finalSyllable.secondaryStress) return m;

        // Final syllable is unstressed - remove the nasal
        return m.substring(0, m.length - 1);
      });

      const result = newMorphemes.join('');
      return { in: str, out: result, morphemes: newMorphemes };
    },
  },
  '3841187313': {
    orderId: '00400',
    pattern: '[s{ɸθx}-] > [{ɸθx}-]',
    description: 'initial [s] vanished before spirants',
    url: 'https://eldamo.org/content/words/word-3841187313.html',
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const initialS = morphemes.some((m) => {
        const firstChar = m.nth(0);
        return firstChar === 's';
      });
      if (initialS === false) return { in: str, out: str, morphemes: options.morphemes };

      const newMorphemes = morphemes.map((m) => {
        const firstChar = m.nth(0);
        if (firstChar === 's') {
          const secondChar = m.nth(1);
          if (secondChar === 'ɸ' || secondChar === 'θ' || secondChar === 'x') {
            return m.substring(1);
          }
        }
        return m;
      });
      
      const result = newMorphemes.join('');
      return { in: str, out: result, morphemes: newMorphemes };
    },
  },
  '2178021811': {
    orderId: '00500',
    pattern: '[j̊-] > [x-]',
    description: 'initial voiceless [j̊] became [x]',
    url: 'https://eldamo.org/content/words/word-2178021811.html',
    mechanic: (str, options = {}) => {
      const initialJ = str.substring(0, 2) === 'hy';
      if (initialJ) {
        const result = str.replace('hy', 'ch');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '1590520649': {
    orderId: '00600',
    pattern: '[{rl}{bdg}] > [{rl}{vðɣ}]',
    description: 'voiced stops became spirants after liquids',
    url: 'https://eldamo.org/content/words/word-1590520649.html',
    mechanic: (str, options = {}) => {
      const rIndex = str.indexOf('r');
      const lIndex = str.indexOf('l');
      if (rIndex !== -1) {
        const nextChar = str.nth(rIndex + 1);
        if (nextChar === 'b' || nextChar === 'd' || nextChar === 'g') {
          const result = str.replace('rb', 'rv').replace('rd', 'rð').replace('rg', 'rɣ');
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }
      if (lIndex !== -1) {
        const nextChar = str.nth(lIndex + 1);
        if (nextChar === 'b' || nextChar === 'd' || nextChar === 'g') {
          const result = str.replace('lb', 'lv').replace('ld', 'lð').replace('lg', 'lɣ');
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '1951748921': {
    orderId: '00700',
    pattern: '[z{bg}] > [ð{βɣ}]',
    description: '[zb], [zg] became [ðβ], [ðɣ]',
    url: 'https://eldamo.org/content/words/word-1951748921.html',
    mechanic: (str, options = {}) => {
      const zIndex = str.indexOf('z');
      if (zIndex !== -1) {
        const nextChar = str.nth(zIndex + 1);
        if (nextChar === 'b' || nextChar === 'g') {
          const result = str.replace('zb', 'ðβ').replace('zg', 'ðɣ');
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '1593810649': {
    orderId: '00800',
    pattern: '[-{ĭŭ}{C|CC}a] > [-{eo}{C|CC}a]',
    description: 'short [i], [u] became [e], [o] preceding final [a]',
    url: 'https://eldamo.org/content/words/word-1593810649.html',
    mechanic: (str, options = {}) => {
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);
      if (syllableData.length === 1) return { in: str, out: str, morphemes: options.morphemes || [str] };

      // There is an [a] in the final syllable:
      const lastSyllable = syllableData.last().syllable.removeMarks();
      if (lastSyllable.indexOf('a') !== -1) {
        let resultArray = syllableData.map((i) => i.syllable);

        const penultimateSyllable = syllableData.last(2).syllable;
        const penultimateSyllableNucleus = syllableData.last(2).nucleus;
        if (penultimateSyllableNucleus.length === 2) return { in: str, out: str, morphemes: options.morphemes || [str] }; // Diphtong
        const { charIndex, found, matched } = findFirstOf(['u', 'i', 'ĭ', 'ŭ'], penultimateSyllable);
        const replacements = {
          'i': 'e',
          'u': 'o',
          'ĭ': 'e',
          'ŭ': 'o',
        };
        if (found) {
          const xMark = matched.getMark();
          const replacee = penultimateSyllable.nth(charIndex, matched.length);
          const replacer = replacements[matched].addMark(xMark);
          resultArray[syllableData.length - 2] = penultimateSyllable.replace(replacee, replacer);
        }
        const result = resultArray.join('');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '1726791627': {
    orderId: '00900',
    pattern: '[V{bdg}] > [V{vðɣ}]',
    description: 'voiced stops became spirants after vowels',
    url: 'https://eldamo.org/content/words/word-1726791627.html',
    mechanic: (str, options = {}) => {
      const aStr = str.split('');
      for (let i = 0; i < aStr.length; i++) {
        const char = aStr[i];
        if (char.isVowel()) {
          const nextChar = aStr[i + 1];
          if (nextChar === 'b') {
            aStr[i + 1] = 'v';
          } else if (nextChar === 'd') {
            aStr[i + 1] = 'ð';
          } else if (nextChar === 'g') {
            aStr[i + 1] = 'ɣ';
          }
        }
      }
      const result = aStr.join('');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '890563133': {
    orderId: '01000',
    pattern: '[ɸ|β] > [f|v]',
    description: '[ɸ], [β] became [f], [v]',
    url: 'https://eldamo.org/content/words/word-890563133.html',
    mechanic: (str, options = {}) => {
      const result = str.replaceAll('ɸ', 'f').replaceAll('β', 'v');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1679623085': {
    orderId: '01100',
    pattern: '[CjV] > [CiV]',
    description: 'medial [j] became [i]',
    url: 'https://eldamo.org/content/words/word-1679623085.html',
    mechanic: (str, options = {}) => {
      // Check: can a word have multiple [j]s?
      const jIndex = str.indexOf('j');
      if (jIndex !== -1) {
        const isInitial = str.nth(0) === 'j';
        const isFinal = str.nth(-1) === 'j';
        if (!isInitial && !isFinal) {
          const result = str.replace('j', 'i');
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '2646655607': {
    orderId: '01200',
    pattern: '[-{ĕŏ}{C|CC}i] > [-{iu}{C|CC}i]',
    description: 'short [e], [o] became [i], [u] in syllable before final [i]',
    url: 'https://eldamo.org/content/words/word-2646655607.html',
    mechanic: (str, options = {}) => {
      const syllables = syllabify(str);
      const lastSyllable = syllables[syllables.length - 1].removeMarks();
      if (lastSyllable.indexOf('i') !== -1 && syllables.length > 1) {
        const secondLastSyllable = syllables[syllables.length - 2];
        const secondLastSyllableUnmarked = secondLastSyllable.removeMarks();
        const eIndex = secondLastSyllableUnmarked.indexOf('e');
        const oIndex = secondLastSyllableUnmarked.indexOf('o');
        let newSyllable = secondLastSyllable;
        if (eIndex !== -1) {
          const eMark = secondLastSyllable.nth(eIndex).getMark();
          const iMark = 'i'.addMark(eMark);
          newSyllable = secondLastSyllable.replace('e', iMark);
        }
        if (oIndex !== -1) {
          const oMark = secondLastSyllable.nth(oIndex).getMark();
          const uMark = 'u'.addMark(oMark);
          newSyllable = secondLastSyllable.replace('o', uMark);
        }
        const result = str.replace(secondLastSyllable, newSyllable);
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '3958031275': {
    orderId: '01300',
    pattern: '[{ăŏŭ}{C|CC}i] > [{eœy}{C|CC}i]',
    description: 'short [a], [o], [u] became [e], [œ], [y] preceding [i]',
    url: 'https://eldamo.org/content/words/word-3958031275.html',
    mechanic: (str, options = {}) => {
      // Pattern configurations: longest to shortest
      // Each has: the VC string, positions of vowels to transform, and whether it's multi-vowel
      const patterns = [
        { str: 'VCCVCCV', vowelPos: [0, 3], multi: true },  // e.g., andundi
        { str: 'VCVCCV', vowelPos: [0, 2], multi: true },
        { str: 'VCCVCV', vowelPos: [0, 3], multi: true },
        { str: 'VCVCV', vowelPos: [0, 2], multi: true },    // e.g., balania
        { str: 'VCCV', vowelPos: [0], multi: false },       // e.g., balθil
        { str: 'VCV', vowelPos: [0], multi: false },        // e.g., bania
      ];

      const unmarkedStr = str.removeMarks();
      const vcPattern = breakIntoVowelsAndConsonants(str);
      let result = str;

      // Helper to check if a pattern is valid
      // Returns: false (invalid), 'single' (only transform closest vowel), 'multi' (transform all)
      const isValidStart = (start, isMultiVowel) => {
        // Don't cross diphthong boundaries (no vowel immediately before start)
        if (start > 0 && vcPattern.charAt(start - 1) === 'V') {
          return false;
        }
        // For multi-vowel patterns, check vowels before start
        if (isMultiVowel) {
          let hasVowelBefore = false;
          for (let k = 0; k < start; k++) {
            if (vcPattern.charAt(k) === 'V') {
              const vowel = unmarkedStr.charAt(k);
              // Blocking vowels (i, e, y) invalidate the pattern entirely
              if (vowel === 'i' || vowel === 'e' || vowel === 'y' || vowel === 'j') {
                return false;
              }
              hasVowelBefore = true;
            }
          }
          // If there's a non-blocking vowel before, only transform closest vowel to 'i'
          if (hasVowelBefore) {
            return 'single';
          }
        }
        return 'multi';
      };

      // Find all positions where 'i' appears as a vowel
      for (let i = 0; i < unmarkedStr.length; i++) {
        if (unmarkedStr.charAt(i) !== 'i' || vcPattern.charAt(i) !== 'V') {
          continue;
        }

        // Find the longest matching pattern
        let bestMatch = null;
        for (const { str: patternStr, vowelPos, multi } of patterns) {
          const len = patternStr.length;
          if (i < len - 1) continue;

          const start = i - (len - 1);
          const pattern = vcPattern.substring(start, i + 1);
          const validResult = isValidStart(start, multi);
          if (pattern !== patternStr || !validResult) continue;

          // Check all vowels in the pattern are transformable (short a/o/u only)
          // Long vowels (with macron ¯ or combining macron \u0304) should NOT be transformed
          const allTransformable = vowelPos.every(pos => {
            const v = unmarkedStr.charAt(start + pos);
            if (v !== 'a' && v !== 'o' && v !== 'u') return false;
            // Check if vowel has a length mark (macron) - if so, it's long and shouldn't transform
            const mark = str.charAt(start + pos).getMark();
            if (mark && (mark.includes('¯') || mark.includes('\u0304'))) return false;
            return true;
          });

          if (allTransformable) {
            // If 'single', only use the last vowel position (closest to 'i')
            const positionsToUse = validResult === 'single' ? [vowelPos[vowelPos.length - 1]] : vowelPos;
            bestMatch = { start, vowelPositions: positionsToUse };
            break; // Found longest match, stop searching
          }
        }

        if (bestMatch) {
          const { start, vowelPositions } = bestMatch;
          const segment = result.substring(start, i + 1);
          const unmarkedSegment = unmarkedStr.substring(start, i + 1);
          let newSegment = segment;

          // Transform each vowel at the specified positions
          for (const pos of vowelPositions) {
            const vowel = unmarkedSegment.charAt(pos);
            const originalChar = segment.charAt(pos);
            const mark = originalChar.getMark();
            let replacement = '';
            if (vowel === 'a') {
              replacement = 'e'.addMark(mark);
            } else if (vowel === 'o') {
              replacement = 'œ'.addMark(mark);
            } else if (vowel === 'u') {
              replacement = 'j'.addMark(mark);
            }
            if (replacement) {
              newSegment = newSegment.substring(0, pos) + replacement + newSegment.substring(pos + 1);
            }
          }

          if (newSegment !== segment) {
            result = result.substring(0, start) + newSegment + result.substring(i + 1);
          }
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3889365613': {
    orderId: '01400',
    pattern: '[ē|ō] > [ī|ū]',
    description: '[ē], [ō] became [ī], [ū]',
    url: 'https://eldamo.org/content/words/word-3889365613.html',
    mechanic: (str, options = {}) => {
      const unmarkedStr = str.removeVowelMarks();
      let result = str;
      if (unmarkedStr.includes('e')) {
        const indices = str.findAllChars('e', unmarkedStr);
        for (const index of indices) {
          const eMark = str.nth(index).getMark();
          if (eMark === '¯' || eMark === '´' || eMark === '^') {
            result = result.replaceAt(index, 'i'.addMark(eMark));
          }
        }
      }
      if (unmarkedStr.includes('o')) {
        const indices = str.findAllChars('o', unmarkedStr);
        for (const index of indices) {
          const oMark = str.nth(index).getMark();
          if (oMark === '¯' || oMark === '´' || oMark === '^') {
            result = result.replaceAt(index, 'u'.addMark(oMark));
          }
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '539122737': {
    orderId: '01500',
    pattern: '[V{ɣ}{lrmn}] > [Vi{lrmn}]',
    description: '[ɣ] vocalized before [l], [r], [m], [n]',
    url: 'https://eldamo.org/content/words/word-539122737.html',
    mechanic: (str, options = {}) => {
      if (str.includes('ɣ')) {
        let result = str;
        const indices = str.findAllChars('ɣ');
        const vcPattern = breakIntoVowelsAndConsonants(str);
        for (const index of indices) {
          if (vcPattern.charAt(index - 1) === 'V' && 'lrmn'.includes(str.charAt(index + 1))) {
            result = str.replaceAt(index, 'i');
          }
        }
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '4002924749': {
    orderId: '01600',
    pattern: '[Vx{θ}|Vɸ{θ}] > [Vi{θ}|Vu{θ}]',
    description: '[x], [ɸ] vocalized between a vowel and [θ]',
    url: 'https://eldamo.org/content/words/word-4002924749.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['x', 'ɸ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar, nextChar } = occurrences[i];
        if (matched === 'x') {
          if (prevChar.isVowel() && nextChar === 'θ') {
            result = result.replaceAt(charIndex, 'i');
          }
          if (result.indexOf('ii') !== -1) {
            result = result.replace('ii', 'ī');
            removedIndices.unshift(charIndex);
          }
        }
        if (matched === 'ɸ') {
          if (prevChar.isVowel() && nextChar === 'θ') {
            result = result.replaceAt(charIndex, 'u');
          }
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '2422841513': {
    orderId: '01700',
    pattern: '[xʲ] > [ix]',
    description: 'non-initial [xʲ] vocalized to [ix]',
    url: 'https://eldamo.org/content/words/word-2422841513.html',
    // Ask about this, as it's not clear if this is from Old Sindarin or not.
    // It's also not clear the characters used are different either.
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ꜧ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const morphemes = options.morphemes || [str];
      const morphemesWithXj = morphemes.some(m => m.indexOf('ꜧ') > 0);
      if (morphemesWithXj === false) return { in: str, out: str, morphemes: options.morphemes };

      const updatedMorphemes = morphemes.map((m) => {
        const charIndex = m.indexOf('ꜧ');
        if (charIndex === -1) return m;

        let result = m;
        if (charIndex > 0) {
          result = result.replaceAt(charIndex, 'ix', 1);
        }
        if (result.indexOf('ii') !== -1) {
          result = result.replace('ii', 'ī');
        }

        return result;
      });

      return { in: str, out: updatedMorphemes.join(''), morphemes: updatedMorphemes };
    },
  },
  '659168127': {
    orderId: '01800',
    pattern: '[{ij}u|jui] > [ȳ|jui]',
    description: '[iu] and [ju] became [ȳ]',
    url: 'https://eldamo.org/content/words/word-659168127.html',
    mechanic: (str, options = {}) => {
      // iu/ju (2 chars) → ȳ (1 char): -1 char per occurrence
      const occurrences = findAllOf(['iu', 'ju', 'jū'], str);
      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      let result = str;
      const removedIndices = [];
      // Process from end to start so indices remain valid
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + 'ȳ' + result.substring(charIndex + matched.length);
        // The second char of the pair is removed
        removedIndices.unshift(charIndex + 1);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '2740073851': {
    orderId: '01900',
    pattern: '[ŭ|uC{uwv}|u{mnŋ}] > [o|uC{uwv}|u{mnŋ}]',
    description: 'short [u] often became [o]',
    url: 'https://eldamo.org/content/words/word-2740073851.html',
    negativeExceptions: ['guruk'],
    /*
     * This is a rule with exceptions. The change occurs only when all exceptions are negative.
     */
    mechanic(str, options = {}) {
      if (str.includes('u') === false) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);

      /*
       * Split in syllables because it's easier to track multiple occurrences of "u" or "w".
       * Because the nucleus can be a diphtong, matching the nucleus against "u" or "w" discarts the diphtongs.
       * Then we exclude syllables in which the "u" is followed by a nasal.
       * We then return the word made out of the new syllables.
       */

      const allNuclei = syllableData.map((s) => s.nucleus);
      const uAmount = allNuclei.reduce((a, v) => (v === 'u' ? (a + 1) : a), 0);

      // There should be at least one syllable with a [u] as nucleus:
      if (uAmount === 0) return { in: str, out: str, morphemes: options.morphemes || [str] };

      // If there is 1 u nucleus:
      if (uAmount === 1) {
        // If u followed by a consonant...
        // If it's then followed by uwv, it is preserved:
        if (/u[^u][uwv]/.test(str)) return { in: str, out: str, morphemes: options.morphemes || [str] }; // buð·vo
        // If it's followed by mnŋ, it is preserved:
        if (/u[mnŋ]/.test(str)) return { in: str, out: str, morphemes: options.morphemes || [str] };

        // But if there are more nuclei and they are not u, modify it:
        if (allNuclei.length > uAmount) {
          const result = str.replaceAll('u', 'o');
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }

      // Multiple u.
      // If it's an exception, mutate.
      // Otherwise, ignore:
      if (this.negativeExceptions.includes(str)) {
        const result = str.replaceAll('u', 'o');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }

      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '3258926163': {
    orderId: '02000',
    pattern: '[{nŋ}m] > [{nŋ}w]',
    description: '[nm], [ŋm] became [nw], [ŋw]',
    url: 'https://eldamo.org/content/words/word-3258926163.html',
    mechanic: (str, options = {}) => {
      if (str.includes('nm') || str.includes('ŋm')) {
        const result = str.replace('nm', 'nw').replace('ŋm', 'ŋw');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '3707785609': {
    orderId: '02100',
    pattern: '[Vŋ{nw}] > [V̄{nw}]',
    description: '[ŋ] vanished with compensatory lengthening',
    url: 'https://eldamo.org/content/words/word-3707785609.html',
    mechanic: (str, options = {}) => {
      // Vŋ{nw} → V̄{nw}: ŋ is removed (-1 char), vowel gets macron
      if (str.includes('ŋ') === false) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      const unmarkedStr = str.removeMarks();
      const indices = str.findAllChars('ŋ');
      let result = str;
      const removedIndices = [];

      // Process from end to start so indices remain valid
      for (let i = indices.length - 1; i >= 0; i--) {
        const index = indices[i];
        const prevChar = unmarkedStr.nth(index - 1);
        const nextChar = unmarkedStr.nth(index + 1);
        if (prevChar.isVowel() && ['n', 'w'].includes(nextChar)) {
          // Replace vowel with lengthened version and remove ŋ
          result = result.substring(0, index - 1) + prevChar.addMark('¯') + result.substring(index + 1);
          removedIndices.unshift(index);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '558704171': {
    orderId: '02200',
    pattern: '[ǭ] > [au]',
    description: '[ǭ] became [au]',
    url: 'https://eldamo.org/content/words/word-558704171.html',
    mechanic: (str, options = {}) => {
      // ǭ (1 char) → au (2 chars): +1 char per occurrence
      const occurrences = findAllOf(['ǭ'], str);
      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      let result = str;
      const insertedIndices = [];
      // Process from end to start so indices remain valid
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'au' + result.substring(charIndex + 1);
        insertedIndices.unshift(charIndex);
      }

      // For length-increasing: add 1 to morpheme length for each insertion within it
      let morphemes = options.morphemes || [str];
      if (result !== str && options.morphemes) {
        morphemes = [];
        let pos = 0;
        let origPos = 0;
        for (const m of options.morphemes) {
          const origEnd = origPos + m.length;
          const inserted = insertedIndices.filter(idx => idx >= origPos && idx < origEnd).length;
          const newLen = m.length + inserted;
          morphemes.push(result.substring(pos, pos + newLen));
          pos += newLen;
          origPos = origEnd;
        }
      }

      return { in: str, out: result, morphemes };
    },
  },
  '2387695245': {
    orderId: '02300',
    pattern: '[ę̄] > [ai]',
    description: '[ę̄] became [ai]',
    url: 'https://eldamo.org/content/words/word-2387695245.html',
    mechanic: (str, options = {}) => {
      // ę̄ (2 chars: ę + macron) → ai (2 chars): same length in NFC
      if (str.includes('ę̄') === false) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }
      const result = str.replaceAll('ę̄', 'ai');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '813787869': {
    orderId: '02400',
    pattern: '[-S{ĕăŏ}] > [-Sø]',
    description: 'short final vowels vanished',
    url: 'https://eldamo.org/content/words/word-813787869.html',
    /**
     * This rule doesn't apply to morpheme boundaries.
     * Only the real final vowel disappears.
     * 
     * @param {*} str - The input string
     * @param {*} options - The options object
     * @returns {Object} - The result object
     */
    mechanic: (str, options = {}) => {
      const unmarkedStr = str.removeMarks();
      const lastChar = unmarkedStr.nth(-1);
      if (['e', 'a', 'o'].includes(lastChar) === false)
        return { in: str, out: str, morphemes: options.morphemes };
      
      const xMark = str.nth(-1).getMark();
      if (['¯', '´', '^'].includes(xMark)) {
        return { in: str, out: str, morphemes: options.morphemes };
      }

      const morphemes = options.morphemes
        ? recalcMorphemes(str, options.morphemes, [str.length - 1])
        : (options.morphemes || [str]);
      return { in: str, out: str.slice(0, -1), morphemes };
    },
  },
  '2399289739': {
    orderId: '02500',
    pattern: '[-VCi] > [-ViC]',
    description: 'final [i] intruded into preceding syllable',
    url: 'https://eldamo.org/content/words/word-2399289739.html',
    info: ['This rule is important for plural forms.'],
    mechanic: (str, options = {}) => {
      const unmarkedStr = str.removeMarks();
      const vcPattern = breakIntoVowelsAndConsonants(unmarkedStr);
      if (unmarkedStr.endsWith('i') === false || vcPattern.endsWith('VCV') === false) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      // Pattern mapping: some add 'i' (net 0 length change), some don't (net -1)
      const patterns = [
        { in: 'i', out: 'i', insertsI: false },  // -1 (final i removed, no insertion)
        { in: 'e', out: 'ei', insertsI: true },  // 0 (final i removed, i inserted)
        { in: 'y', out: 'y', insertsI: false },  // -1 (final i removed, no insertion)
        { in: 'œ', out: 'œi', insertsI: true },  // 0 (final i removed, i inserted)
        { in: 'o', out: 'oi', insertsI: true },  // 0 (final i removed, i inserted)
        { in: 'u', out: 'ui', insertsI: true },  // 0 (final i removed, i inserted)
      ];
      for (const pattern of patterns) {
        const secondLastChar = unmarkedStr.nth(-2);
        const thirdLastChar = unmarkedStr.nth(-3);
        if (thirdLastChar === pattern.in) {
          const index = unmarkedStr.length - 3;
          const result = str.substring(0, index) + pattern.out + secondLastChar;

          // Track morpheme changes
          let morphemes = options.morphemes || [str];
          if (result !== str && options.morphemes) {
            if (pattern.insertsI) {
              // Net 0: insertion at index+1, removal at end - positions shift but length same
              // recalcMorphemes with empty array works for same-length
              morphemes = recalcMorphemes(result, options.morphemes, []);
            } else {
              // Net -1: final i removed (at str.length - 1)
              const removedIndices = [str.length - 1];
              morphemes = recalcMorphemes(result, options.morphemes, removedIndices);
            }
          }
          return { in: str, out: result, morphemes };
        }
      }
      // [-iCi] > [-iC]
      // [-ĕCi] > [-eiC]
      // [-yCi] > [-yC]
      // [-œCi] > [-œiC]
      // [-ǭCi] > [-oiC]
      // [-ūCi] > [-uiC]
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '4211011237': {
    orderId: '02600',
    pattern: '[-Cw] > [-uC]', // Originally this is [-xw] > [-ux]
    description: 'final [w] sometimes intruded into preceding syllables',
    url: 'https://eldamo.org/content/words/word-4211011237.html',
    mechanic: (str, options = {}) => {
      const regularisedStr = str.toNormalScript().removeMarks();
      if (regularisedStr.endsWith('w')) {
        const vcPattern = breakIntoVowelsAndConsonants(regularisedStr);
        if (vcPattern.endsWith('VCC')) {
          const secondLastChar = regularisedStr.nth(-2);
          const thirdLastChar = regularisedStr.nth(-3);
          if (['a', 'e'].includes(thirdLastChar)) {
            const index = regularisedStr.length - 2;
            const result = str.substring(0, index) + 'u' + secondLastChar;
            const morphemes = (result !== str && options.morphemes)
              ? recalcMorphemes(result, options.morphemes, [])
              : (options.morphemes || [str]);
            return { in: str, out: result, morphemes };
          }
        }
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '4287595571': {
    orderId: '02700',
    pattern: '[x-|x{lr}-] > [h-|{l̥r̥}-]',
    description: 'initial [x-] became [h-]',
    url: 'https://eldamo.org/content/words/word-4287595571.html',
    mechanic: (str, options = {}) => {
      const initial2 = str.substring(0, 2).toLowerCase();
      let initialX = str.nth(0).toLowerCase();
      let result = str;
      if (initial2 === 'kh') {
        result = result.replace('kh', 'x');
        initialX = 'x';
      }
      if (['x', 'χ'].includes(initialX)) {
        const secondPhoneme = str.nth(1).toLowerCase();
        if (['l', 'r'].includes(secondPhoneme)) {
          const finalResult = result.replace('xl', 'l̥').replace('xr', 'r̥');
          const morphemes = (finalResult !== str && options.morphemes)
            ? recalcMorphemes(finalResult, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: finalResult, morphemes };
        }
        const finalResult = result.replace(initialX, 'h');
        const morphemes = (finalResult !== str && options.morphemes)
          ? recalcMorphemes(finalResult, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: finalResult, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '2240258959': {
    orderId: '02800',
    pattern: '[V{ptk}] > [V{bdg}]',
    description: 'voiceless stops voiced after vowels',
    url: 'https://eldamo.org/content/words/word-2240258959.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['p', 't', 'k'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const replacements = {
        'p': 'b',
        't': 'd',
        'k': 'g',
      };

      let result = str;
      // Process from end to start so indices remain valid
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, matched } = occurrences[i];
        if (prevChar.isVowel()) {
          result = result.replaceAt(charIndex, replacements[matched]);
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1053424933': {
    orderId: '02900',
    pattern: '[C*V̆C] > [C*V̄C]',
    description: 'short vowels generally lengthened in monosyllables',
    url: 'https://eldamo.org/content/words/word-1053424933.html',
    /*
     * @TODO: Find a way to signal unstressed words
     *
     * Lengthening did not occur for "minor" (unstressed?) words
     * Pronouns do not show vowel lengthening, except possessive pronouns.
     * Lengthening did not occur before unvoiced consonants: th, ch ([θ], [x]).
     * Long ss also did not lengthen, see rule 06300.
     * Exceptions:
     * - hîth "mist", nîth "sister", nîth "youth" -> these have primitive [ī] or [ē].
     * - Long û must derive from [ō] or [ū], because short u becomes o (rule 01900).
     * - iâth "fence" (but also appeared "iath").
     * Sindarin monosyllables ending in [m] and [ŋ] do not show vowel lengthening
     * Lengthening did (mostly) occur before voiced consonants: b, d, dh, f [v], g, l, n, r.
     * Cases where lengthening did not occur before voiced spirants and stops:
     * - cef "soil"
     * - glad "wood", lad "plain", nad "thing", pad "track, road", plad "palm", sad "place, spot", tad "two".
     * - peg "dot"
     * Cases where lengthening did not occur before [l]:
     * - ial "?cry, shout", el "star", del "horror", gil "star", tol "island", dol "hill"
     * Cases where lengthening did not occur before [r]:
     * - bar "home", far "enough", er "one, alone", cor "ring, circle", for "north", gor "horror, dread, fear"
     * Cases where lengthening did not occur before [n]:
     * - glan "boundary", fen "door", hen "eye", men "road", nen "water", min "one", tin "spark", ion "son"
     * Vowel lengthening does not occur in monosyllables ending a vowel, except these:
     * - a: hwâ "breeze", iâ "chasm"
     * - e: tê "line, way", thlê "fine thread, spider filament"
     * - i: dî "woman, bride", lî "people", glî "honey", gwî "net, web", rhî "crown", rî "wreath, garland", tî "line, row"
     * - o: l(h)ô "flood, fenland", nô "thigh"
     * [C*ĭC] > [C*īC]
     * [C*ĕC] > [C*ēC]
     * [C*ăC] > [C*āC]
     * [C*ŏC] > [C*ōC]
     * [C*yC] > [C*ȳC]
     */
    // Exception sets (defined once, not per call)
    vowelEndingExceptions: new Set(['hwa', 'ia', 'te', 'θle', 'di', 'ꝉi', 'gli', 'gwi', 'ꞧi', 'ri', 'ti', 'lo', 'no']),
    unvoicedExceptions: new Set(['hiθ', 'niθ', 'iaθ']),
    voicedExceptions: new Set([
      'bar', 'cef', 'cor', 'del', 'dol', 'el', 'er', 'far', 'fen', 'for', 'gil', 'glad', 'glan', 'gor',
      'hen', 'ial', 'ion', 'lad', 'men', 'min', 'nad', 'nen', 'pad', 'peg', 'plad', 'sad', 'tad', 'tin', 'tol',
    ]),
    mechanic(str, options = {}) {
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);

      if (syllableData.length === 1) {
        const { nucleus } = syllableData[0];
        if (nucleus.length === 2) return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      const vcPattern = breakIntoVowelsAndConsonants(str);
      if (!/^C{0,2}V{1,2}C{0,2}$/.test(vcPattern)) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const lastChar = str.nth(-1);
      const lengthen = (s, pos) => {
        const vowel = s.nth(pos);
        const hasMark = vowel.getMark();
        if (hasMark) return s.replace(vowel, vowel.removeMarks().addMark('¯'));
        return s.replace(vowel, vowel.addMark('¯'));
      };

      /*
       * Anything that gets this far is monosyllable, so we simply update the
       * one morpheme in the array.
       */
      const returnWithMorphemes = (result) => {
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      };

      if (lastChar.isVowel()) {
        const result = this.vowelEndingExceptions.has(str) ? lengthen(str, -1) : str;
        return returnWithMorphemes(result);
      }

      if (lastChar === 'θ' || lastChar === 'x') {
        const result = this.unvoicedExceptions.has(str) ? lengthen(str, -2) : str;
        return returnWithMorphemes(result);
      }

      if ('bdðfvglnrɣ'.includes(lastChar)) {
        if (this.voicedExceptions.has(str)) return { in: str, out: str, morphemes: options.morphemes || [str] };
        const penultimate = str.nth(-2);
        const result = penultimate.isVowel() ? lengthen(str, -2) : str;
        return returnWithMorphemes(result);
      }

      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '916418731': {
    orderId: '03000',
    pattern: '[-Cɣ|-Cɣi] > [-Ca|-Cī]',
    description: 'final [ɣ] became [a] after a consonant',
    url: 'https://eldamo.org/content/words/word-916418731.html',
    mechanic: (str, options = {}) => {
      // Process morphemes individually (morpheme-final, not just word-final)
      const morphemes = options.morphemes || [str];
      const hasG = morphemes.some(m => m.indexOf('ɣ') > -1);
      if (hasG === false) return { in: str, out: str, morphemes: options.morphemes };

      const newMorphemes = morphemes.map((morpheme) => {
        const lastChar = morpheme.nth(-1);
        const secondLastChar = morpheme.nth(-2);

        // Pattern: -Cɣ → -Ca (same length)
        if (lastChar === 'ɣ') {
          const penultimate = morpheme.nth(-2);
          if (penultimate.isConsonant()) {
            return morpheme.slice(0, -1) + 'a';
          }
        }

        // Pattern: -Cɣi → -Cī (length-changing: -1 char)
        if (lastChar === 'i' && secondLastChar === 'ɣ') {
          const thirdLastChar = morpheme.nth(-3);
          if (thirdLastChar.isConsonant()) {
            return morpheme.slice(0, -2) + 'ī';
          }
        }

        return morpheme;
      });

      const result = newMorphemes.join('');
      return { in: str, out: result, morphemes: newMorphemes };
    },
  },
  '2139740021': {
    orderId: '03100',
    pattern: '[{lrð}ɣV] > [{lrð}iV]',
    description: '[ɣ] became [i] between sonants and vowels',
    url: 'https://eldamo.org/content/words/word-2139740021.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf('ɣ', str);
      if (occurrences.length === 0)
        return { in: str, out: str, morphemes: options.morphemes };

      const sonants = ['b', 'd', 'g', 'v', 'f', 'ð', 'w', 'l', 'r', 'j'];
      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];

        if (sonants.includes(prevChar) && nextChar.isVowel()) {
          if (['u', 'y'].includes(nextChar)) {
            result = result.substring(0, charIndex) + nextChar + result.substring(charIndex + 2);
            removedIndices.unshift(charIndex);
            continue;
          }
          result = result.replaceAt(charIndex, 'i');
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '4164672875': {
    orderId: '03200',
    pattern: '[ɣ] > [ø]',
    description: '[ɣ] otherwise vanished',
    url: 'https://eldamo.org/content/words/word-4164672875.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ɣ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (prevChar === nextChar && prevChar.isVowel()) {
          result = result.substring(0, charIndex - 1) + prevChar.addMark('¯') + result.substring(charIndex + 2);
          removedIndices.unshift(charIndex + 1);
          removedIndices.unshift(charIndex);
          continue;
        }
        result = result.substring(0, charIndex) + result.substring(charIndex + 1);
        removedIndices.unshift(charIndex);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '677308549': {
    orderId: '03300',
    pattern: '[-wi] > [-y]',
    description: 'final [-wi] became [-y]',
    url: 'https://eldamo.org/content/words/word-677308549.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['wi', 'ui'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, lastChar } = occurrences[i];
        // Only final:
        if (lastChar) {
          result = result.substring(0, charIndex) + 'j';
          removedIndices.unshift(charIndex);
          continue;
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '875184187': {
    orderId: '03400',
    pattern: '[Vh] > [Vø]',
    description: '[h] vanished after vowels',
    url: 'https://eldamo.org/content/words/word-875184187.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['h'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar, lastChar } = occurrences[i];
        const anteriorChar = result.nth(charIndex - 2);

        // First character:
        if (charIndex === 0) continue;

        // Diphtong:
        if (prevChar.isVowel() && anteriorChar.isVowel()) continue;

        // Last character:
        if (lastChar && prevChar.isVowel()) {
          result = result.substring(0, result.length - 1);
          removedIndices.unshift(result.length);
          continue;
        }

        // Same vowel, before and after:
        if (prevChar === nextChar && prevChar.isVowel()) {
          // One more vowel:
          const followingChar = result.nth(charIndex + 2);
          if (followingChar.isVowel()) {
            result = result.substring(0, charIndex) + result.substring(charIndex + 2);
            removedIndices.unshift(charIndex + 1);
            removedIndices.unshift(charIndex);
            continue;
          }

          // No more vowels:
          result = result.substring(0, charIndex - 1) + prevChar.addMark('¯') + result.substring(charIndex + 2);
          removedIndices.unshift(charIndex + 1);
          removedIndices.unshift(charIndex);
          continue;
        }

        // Different vowels, before and after:
        if (prevChar.isVowel() && nextChar.isVowel()) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1815401039': {
    orderId: '03500',
    pattern: '[-S{ĭŭ}|-uCu|-Sī] > [-Sø|-uCu|-Sĭ]',
    description: 'final [i], [u] generally vanished',
    url: 'https://eldamo.org/content/words/word-1815401039.html',
    /**
     * This rule doesn't apply to morpheme boundaries at the moment.
     * Only the real final vowel disappears.
     * Double-check whether there is any case of morpheme changes.
     * 
     * @param {*} str - The input string
     * @param {*} options - The options object
     * @returns {Object} - The result object
     */
    mechanic(str, options = {}) {
      if (['u', 'i'].includes(str.nth(-1).removeVowelMarks()) === false)
        return { in: str, out: str, morphemes: options.morphemes };

      // Exception: uCu pattern is preserved (e.g., guru stays guru)
      if (str.length >= 3) {
        const last3 = str.slice(-3);
        if (last3[0] === 'u' && last3[1].isConsonant() && last3[2] === 'u') {
          return { in: str, out: str, morphemes: options.morphemes };
        }
      }

      // Final short i or u after consonant vanishes
      const unmarkedStr = str.removeMarks();
      const lastChar = unmarkedStr.nth(-1);
      let result = str;
      const removedIndices = [];

      const xMark = str.nth(-1).getMark();
      if (xMark === '¯') {
        result = str.slice(0, -1) + lastChar;
      } else {
        result = str.slice(0, -1);
        removedIndices.unshift(str.length - 1);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2749565259': {
    orderId: '03600',
    pattern: '[C{ĭĕăŏŭ}+C] > [Cø+C]',
    description: 'short vowels vanished before morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-2749565259.html',
    // skip: true,
    // info: ['Important in compounds.', 'Disabled by default.'],
    // input: [
    //   {
    //     name: 'guess',
    //     label: 'Guess boundary',
    //     type: 'boolean',
    //     default: false,
    //     description: 'Guess the syllable boundary if there is no marker'
    //   },
    //   {
    //     name: 'boundaryChar',
    //     label: 'Boundary marker',
    //     type: 'string',
    //     default: '-',
    //     description: 'The morpheme boundary marker',
    //   },
    // ],
    mechanic(str, options = {}) {
      const morphemes = options.morphemes || [str];
      const hasShortVowel = morphemes.some((m) => {
        const lastChar = m.nth(-1);
        if (!lastChar.isVowel()) return false;
        const mark = lastChar.getMark();
        if (['¯', '´', '^'].includes(mark)) return false;
        return true;
      });
      if (hasShortVowel === false) return { in: str, out: str, morphemes };

      const newMorphemes = [];
      for (let i = 0; i < morphemes.length; i++) {
        const morpheme = morphemes[i];
        const lastChar = morpheme.nth(-1);
        if (!lastChar.isVowel()) {
          newMorphemes.push(morpheme);
          continue;
        }
        const mark = lastChar.getMark();
        if (['¯', '´', '^'].includes(mark)) {
          newMorphemes.push(morpheme);
          continue;
        }
        newMorphemes.push(morpheme.slice(0, -1));
      }

      const result = newMorphemes.join('');
      return { in: str, out: result, morphemes: newMorphemes };
    },
    /**
     * @param {string} str - The input string
     * @param {Object} options - Options for the mechanic
     * @param {boolean} options.guess - Whether to guess boundary if no marker (default: false)
     * @param {string} options.boundaryChar - The morpheme boundary marker (default: '-')
     */
    mechanicOld(str, { guess = false, boundaryChar = '-', morphemes } = {}) {
      // Helper: check if char is a short vowel (no mark or caron ˇ)
      const isShortVowel = (char) => {
        if (!char || !char.isVowel()) return false;
        const mark = char.getMark();
        return mark === '' || mark === '\u030C'; // no mark or combining caron
      };

      // Helper: remove short vowel from end or middle of syllable
      const removeVowelFromSyllable = (syllable) => {
        const lastChar = syllable.nth(-1);

        // If syllable ends in short vowel, remove it
        if (isShortVowel(lastChar)) {
          return syllable.slice(0, -1);
        }

        // If syllable ends in consonant, look for short vowel before it
        // Pattern: C + shortV + C(s) at end → remove the vowel
        for (let i = syllable.length - 2; i >= 0; i--) {
          const char = syllable.nth(i);
          if (isShortVowel(char)) {
            // Found a short vowel - remove it
            return syllable.slice(0, i) + syllable.slice(i + 1);
          }
          if (char.isVowel()) {
            // Found a long vowel - stop looking
            break;
          }
        }

        return syllable; // No short vowel found
      };

      // === EXPLICIT MARKER MODE ===
      if (str.includes(boundaryChar)) {
        const parts = str.split(boundaryChar);
        const result = parts.map((part, index) => {
          // Don't process the last part (nothing follows it)
          if (index === parts.length - 1) return part;

          const nextPart = parts[index + 1];
          const nextFirstChar = nextPart.nth(0);

          // Only remove vowel if next part starts with consonant
          if (nextFirstChar && nextFirstChar.isConsonant()) {
            return removeVowelFromSyllable(part);
          }
          return part;
        });

        return { in: str, out: result.join(''), morphemes };
      }

      // === GUESSING MODE ===
      if (!guess) return { in: str, out: str, morphemes };

      const syllables = syllabify(str);
      if (syllables.length < 2) return { in: str, out: str, morphemes };

      // Split: first half gets extra syllable if odd
      const midpoint = Math.ceil(syllables.length / 2);
      const firstHalf = syllables.slice(0, midpoint);
      const secondHalf = syllables.slice(midpoint);

      // Check if second half starts with consonant
      const secondHalfStart = secondHalf[0]?.nth(0);
      if (!secondHalfStart || !secondHalfStart.isConsonant()) {
        return { in: str, out: str, morphemes };
      }

      // Try to remove vowel from last syllable of first half
      const lastSyllable = firstHalf[firstHalf.length - 1];
      const modifiedSyllable = removeVowelFromSyllable(lastSyllable);

      // If nothing changed, return original
      if (modifiedSyllable === lastSyllable) {
        return { in: str, out: str, morphemes };
      }

      // Rebuild the word
      firstHalf[firstHalf.length - 1] = modifiedSyllable;
      return { in: str, out: [...firstHalf, ...secondHalf].join(''), morphemes };
    },
  },
  '941153689': {
    orderId: '03700',
    pattern: '[ai|oi] > [ae|oe]',
    description: '[ai], [oi] became [ae], [oe]',
    url: 'https://eldamo.org/content/words/word-941153689.html',
    mechanic: (str, options = {}) => {
      const result = str.replace(/ai/g, 'ae').replace(/oi/g, 'oe');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1660291111': {
    orderId: '03800',
    pattern: '[-eiC|-ei] > [-aiC|-ai]',
    description: 'later [ei] became [ai] in final syllables',
    url: 'https://eldamo.org/content/words/word-1660291111.html',
    mechanic: (str, options = {}) => {
      const strLess1 = str.slice(0, -1);
      const lastChar = str.nth(-1);
      if (lastChar.isConsonant()) {
        const last2 = strLess1.slice(-2);
        if (last2 === 'ei') {
          const result = str.slice(0, -3) + 'ai' + lastChar;
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      } else {
        const last2 = str.slice(-2);
        if (last2 === 'ei') {
          const result = str.slice(0, -2) + 'ai';
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '3257758901': {
    orderId: '03900',
    pattern: '[y{iu}] > [ui]',
    description: 'diphthongs [yi], [yu] became [ui]',
    skip: true,
    info: ['This rule has no attested direct examples, it is mostly concerned with explaining plural formation.'],
    url: 'https://eldamo.org/content/words/word-3257758901.html',
    mechanic: (str, options = {}) => {
      const result = str.replace(/[yj]i/g, 'ui').replace(/[yj]u/g, 'ui');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1787434575': {
    orderId: '04000',
    pattern: '[œi] > [ui|y]',
    description: '[œi] became [ui] or [y]',
    skip: true,
    info: ['There is only one example of this rule. It also is mostly concerned with explaining plural formation.'],
    url: 'https://eldamo.org/content/words/word-1787434575.html',
    input: [
      {
        name: 'useUi',
        label: 'Use [ui]',
        type: 'boolean',
        default: false,
        description: 'Use [ui] instead of [y]'
      }
    ],
    mechanic: (str, { useUi = false, morphemes } = {}) => {
      const result = str.replace(/œi/g, useUi ? 'ui' : 'j');
      const updatedMorphemes = (result !== str && morphemes)
        ? recalcMorphemes(result, morphemes, [])
        : (morphemes || [str]);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },
  '1105959911': {
    orderId: '04100',
    pattern: '[nr] > [ðr]',
    description: '[nr] became [ðr]',
    url: 'https://eldamo.org/content/words/word-1105959911.html',
    dependsOn: [{ rule: '2749565259', param: 'cluster' }],
    /**
     * This logic depends on 03600:
     * Where n and r came into contact in compounds after the loss of vowels at morpheme
     * boundaries, the n became dh.
     * This change doesn't occur where there was another consonant between the n and r.
     *
     * @param {*} str
     * @param {*} options
     * @param {boolean} options.cluster - Whether a cluster existed previously (default: false)
     * @returns
     */
    mechanic: (str, { cluster = false, morphemes } = {}) => {
      if (cluster) return { in: str, out: str, morphemes: morphemes || [str] };
      const result = str.replace(/nr/g, 'ðr');
      const updatedMorphemes = (result !== str && morphemes)
        ? recalcMorphemes(result, morphemes, [])
        : (morphemes || [str]);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },
  '2090293737': {
    orderId: '04200',
    pattern: '[{θð}Sθ] > [{θð}Ss]',
    description: 'dissimilation of dental spirants',
    url: 'https://eldamo.org/content/words/word-2090293737.html',
    // This isn't great, but it has few examples anyway.
    mechanic: (str, options = {}) => {
      const results = findAllOf(['θ', 'ð'], str);
      if (results.length < 2) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const analyser = new SyllableAnalyser();
      const syllables = analyser.syllabify(str);

      if (syllables.length === 1) {
        const lastResult = results[results.length - 1];
        if (lastResult.prevChar !== lastResult.matched) {
          const result = str.substring(0, lastResult.charIndex) + 's' + str.substring(lastResult.charIndex + 1);
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        } else {
          return { in: str, out: str, morphemes: options.morphemes || [str] };
        }
      }

      // Multiple syllables:
      const reverseSyllables = syllables.reverse();
      let lastSyllable = -1;
      let matched = null;

      // Find the last syllable that contains a spirant and which spirant:
      for (let i in reverseSyllables) {
        const syllable = reverseSyllables[i];
        const allSpirants = findAllOf(['θ', 'ð'], syllable);
        if (allSpirants.length > 0) {
          lastSyllable = i;
          matched = allSpirants[allSpirants.length - 1].matched;
          break;
        }
      }

      // Remove the last spirant and replace it with an s:
      const resultArr = [];

      for (let i in reverseSyllables) {
        const syllable = reverseSyllables[i];
        if (i === lastSyllable) {
          const reversed = syllable.reverse();
          const newSyllable = reversed.replace(`${matched}${matched}`, matched).replace(matched, 's').reverse();
          resultArr.push(newSyllable);
        } else {
          resultArr.push(syllable);
        }
      }

      const finalResult = resultArr.reverse().join('');
      const morphemes = (finalResult !== str && options.morphemes)
        ? recalcMorphemes(finalResult, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: finalResult, morphemes };
    },
  },
  '298324969': {
    orderId: '04300',
    pattern: '[ls|rs] > [lθ|ss]',
    description: '[ls], [rs] became [lθ], [ss]',
    url: 'https://eldamo.org/content/words/word-298324969.html',
    mechanic: (str, options = {}) => {
      if (str.includes('ls') || str.includes('rs')) {
        const result = str.replace('ls', 'lθ').replace('rs', 'ss');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '1531741019': {
    orderId: '04400',
    pattern: '[-{mf|nθ|ŋx|lθ}] > [-{mp|nt|ŋk|lt}]',
    description: 'final [mf], [nθ], [ŋx], [lθ] became [mp], [nt], [ŋk], [lt]',
    url: 'https://eldamo.org/content/words/word-1531741019.html',
    mechanic: (str, options = {}) => {
      let result = str;
      if (str.endsWith('mf')) {
        result = str.slice(0, -2) + 'mp';
      } else if (str.endsWith('nθ')) {
        result = str.slice(0, -2) + 'nt';
      } else if (str.endsWith('ŋx')) {
        result = str.slice(0, -2) + 'ŋk';
      } else if (str.endsWith('lθ')) {
        result = str.slice(0, -2) + 'lt';
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1856165973': {
    orderId: '04500',
    pattern: '[{mnŋ}{fθxs}{lr}] > [ø{fθxs}{lr}]',
    description: 'nasals vanished before spirantal clusters',
    url: 'https://eldamo.org/content/words/word-1856165973.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['m', 'n', 'ŋ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar, lastChar } = occurrences[i];
        // Skip if first char:
        if (charIndex === 0) continue;
        // Skip if last char:
        if (lastChar) continue;

        // If next char is final, skip as well:
        const followingChar = str.nth(charIndex + 2);
        if (followingChar === '') continue;

        // It's medial:
        if (['f', 'θ', 'x', 's'].includes(nextChar) && ['l', 'r'].includes(followingChar)) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
          continue;
        }
        if (nextChar === 'f') {
          result = result.substring(0, charIndex) + 'ff' + result.substring(charIndex + 2);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '3282356701': {
    orderId: '04600',
    pattern: '[-{mnŋ}·{fθxsmnŋl}-] > [-ø·{fθxsmnŋl}-]',
    description: 'nasals vanished before morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-3282356701.html',
    // input: [
    //   {
    //     name: 'guess',
    //     label: 'Guess boundary',
    //     type: 'boolean',
    //     default: false,
    //     description: 'Guess the syllable boundary if there is no marker'
    //   },
    //   {
    //     name: 'boundaryChar',
    //     label: 'Boundary marker',
    //     type: 'string',
    //     default: '-',
    //     description: 'The morpheme boundary marker'
    //   },
    // ],
    mechanic(str, options = {}) {
      const morphemes = options.morphemes || [str];
      const hasNasal = morphemes.some((m) => {
        const lastChar = m.nth(-1);
        return ['m', 'n', 'ŋ'].includes(lastChar);
      });
      if (hasNasal === false) return { in: str, out: str, morphemes };

      const newMorphemes = [];
      for (let i = 0; i < morphemes.length; i++) {
        if (i === morphemes.length - 1) {
          newMorphemes.push(morphemes[i]);
          continue;
        }
        const morpheme = morphemes[i];
        const lastChar = morpheme.nth(-1);
        if (!['m', 'n', 'ŋ'].includes(lastChar)) {
          newMorphemes.push(morpheme);
          continue;
        }
        newMorphemes.push(morpheme.substring(0, morpheme.length - 1));
      }

      const result = newMorphemes.join('');
      return { in: str, out: result, morphemes: newMorphemes };
    },
    /**
     * @param {string} str - The input string
     * @param {Object} options - Options for the mechanic
     * @param {boolean} options.guess - Whether to guess boundary if no marker (default: true)
     * @param {string} options.boundaryChar - The morpheme boundary marker (default: '-')
     */
    mechanicOld(str, { guess = false, boundaryChar = '-', morphemes } = {}) {
      // Helper: remove nasal from end of syllable
      const removeNasalFromSyllable = (syllable) => {
        const lastChar = syllable.nth(-1);

        // If syllable ends in nasal, remove it
        if ('mnŋ'.includes(lastChar)) {
          return syllable.slice(0, -1);
        }

        return syllable; // No nasal found
      };

      // === EXPLICIT MARKER MODE ===
      if (str.includes(boundaryChar)) {
        const parts = str.split(boundaryChar);
        const result = parts.map((part, index) => {
          // Don't process the last part (nothing follows it)
          if (index === parts.length - 1) return part;

          const nextPart = parts[index + 1];
          const nextFirstChar = nextPart.nth(0);

          // Only remove vowel if next part starts with consonant
          if (nextFirstChar && nextFirstChar.isConsonant()) {
            return removeNasalFromSyllable(part);
          }
          return part;
        });

        return { in: str, out: result.join(boundaryChar), morphemes };
      }


      if (!guess) return { in: str, out: str, morphemes };

      // === GUESSING MODE ===
      const syllables = syllabify(str);
      if (syllables.length < 2) return { in: str, out: str, morphemes };

      // Split: first half gets extra syllable if odd
      const midpoint = Math.ceil(syllables.length / 2);
      const firstHalf = syllables.slice(0, midpoint);
      const secondHalf = syllables.slice(midpoint);

      // Try to remove nasal from last syllable of first half
      const lastSyllable = firstHalf[firstHalf.length - 1];
      const modifiedSyllable = removeNasalFromSyllable(lastSyllable);
      firstHalf[firstHalf.length - 1] = modifiedSyllable;
      return { in: str, out: [...firstHalf, ...secondHalf].join(''), morphemes };
    },
  },
  '3841960279': {
    orderId: '04700',
    pattern: '[ð{mnŋ}] > [ø{mnŋ}]',
    description: '[ð] vanished before nasals at morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-3841960279.html',
    mechanic(str, options = {}) {
      const morphemes = options.morphemes || [str];
      const hasDh = morphemes.some((m) => m.indexOf('ð') > -1);

      if (hasDh === false) return { in: str, out: str, morphemes };

      const newMorphemes = [];
      for (let i = 0; i < morphemes.length; i++) {
        if (i === morphemes.length - 1) {
          newMorphemes.push(morphemes[i]);
          continue;
        }
        const morpheme = morphemes[i];
        const nextMorpheme = morphemes[i + 1];
        const lastChar = morpheme.nth(-1);
        const firstChar = nextMorpheme.nth(0);
        if (lastChar === 'ð' && ['m', 'n', 'ŋ'].includes(firstChar)) {
          newMorphemes.push(morpheme.substring(0, morpheme.length - 1));
          continue;
        }
        newMorphemes.push(morpheme);
      }

      const result = newMorphemes.join('');
      return { in: str, out: result, morphemes: newMorphemes };
    },
    // info: ['Important in compounds.'],
    // input: [
    //   {
    //     name: 'guess',
    //     label: 'Guess boundary',
    //     type: 'boolean',
    //     default: false,
    //     description: 'Guess the syllable boundary if there is no marker'
    //   },
    //   {
    //     name: 'boundaryChar',
    //     label: 'Boundary marker',
    //     type: 'string',
    //     default: '-',
    //     description: 'The morpheme boundary marker',
    //   },
    // ],
    /**
     * @param {string} str - The input string
     * @param {Object} options - Options for the mechanic
     * @param {boolean} options.guess - Whether to guess boundary if no marker (default: false)
     * @param {string} options.boundaryChar - The morpheme boundary marker (default: '-')
     */
    mechanicOld(str, { guess = false, boundaryChar = '-', morphemes } = {}) {
      // Helper: remove nasal from end of syllable
      const removeDhFromSyllable = (syllable, nextSyllable) => {
        const { found, nextChar } = findFirstOf(['ð'], syllable);
        if (found) {
          // If syllable ends in nasal, remove it
          if (nextChar !== '' && 'mnŋ'.includes(nextChar)) {
            return syllable.replace('ð', '');
          } else {
            if ('mnŋ'.includes(nextSyllable.nth(0))) {
              return syllable.replace('ð', '');
            }
          }
        }
        return syllable; // No ð found
      };

      // === EXPLICIT MARKER MODE ===
      if (str.includes(boundaryChar)) {
        const parts = str.split(boundaryChar);
        const result = parts.map((part, index) => {
          // Don't process the last part (nothing follows it)
          if (index === parts.length - 1) return part;

          const nextPart = parts[index + 1];
          const nextFirstChar = nextPart.nth(0);

          // Only remove ð if next part starts with consonant
          if (nextFirstChar && nextFirstChar.isConsonant()) {
            return removeDhFromSyllable(part);
          }
          return part;
        });

        return { in: str, out: result.join(boundaryChar), morphemes };
      }

      if (!guess) return { in: str, out: str, morphemes };

      // === GUESSING MODE ===
      const syllables = syllabify(str);
      if (syllables.length < 2) return { in: str, out: str, morphemes };

      // Split: first half gets extra syllable if odd
      const midpoint = Math.ceil(syllables.length / 2);
      const firstHalf = syllables.slice(0, midpoint);
      const secondHalf = syllables.slice(midpoint);

      // Try to remove ð from last syllable of first half:
      const lastSyllable = firstHalf[firstHalf.length - 1];
      const modifiedSyllable = removeDhFromSyllable(lastSyllable, secondHalf[0]);
      firstHalf[firstHalf.length - 1] = modifiedSyllable;
      return { in: str, out: [...firstHalf, ...secondHalf].join(''), morphemes };
    },
  },
  '3123278727': {
    orderId: '04800',
    pattern: '[-{mnŋ}{vðɣ}-] > [-{mnŋ}{bdg}-]',
    description: 'voiced spirants restopped after nasals',
    url: 'https://eldamo.org/content/words/word-3123278727.html',
    mechanic: (str, options = {}) => {
      // klawarxaðmámadr
      const occurrences = findAllOf(['m', 'n', 'ŋ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const replacements = {
        'v': 'b',
        'ð': 'd',
        'ɣ': 'g',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (['v', 'ð', 'ɣ'].includes(nextChar)) {
          result = result.substring(0, charIndex + 1) + replacements[nextChar] + result.substring(charIndex + 2);
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2996915415': {
    orderId: '04900',
    pattern: '[-{mf|nθ|ŋx|lθ}-] > [-{mm|nn|ŋg|l̥l̥}-]',
    description: 'medial [mf], [nθ], [ŋx], [lθ] became [mm], [nn], [ŋg], [ll]',
    url: 'https://eldamo.org/content/words/word-2996915415.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['mf', 'nθ', 'ŋx', 'lθ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const replacements = {
        'mf': 'mm',
        'nθ': 'nn',
        'ŋx': 'ŋg',
        'lθ': 'll',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    }
  },
  '725943271': {
    orderId: '05000',
    pattern: '[m̥|n̥] > [m|n]',
    description: 'voiceless nasals were voiced',
    url: 'https://eldamo.org/content/words/word-725943271.html',
    mechanic: (str, options = {}) => {
      const result = str.replace(/m̥/g, 'm').replace(/n̥/g, 'n');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2083930569': {
    orderId: '05100',
    pattern: '[V̄CC] > [V̆CC]',
    description: 'long vowels shortened before clusters',
    url: 'https://eldamo.org/content/words/word-2083930569.html',
    mechanic: (str, options = {}) => {
      const exceptions = [
        'círdan',
        'dírhael',
        'íðra',
        'mírdain',
        'nírnaeθ',
      ];
      if (exceptions.includes(str.toLowerCase())) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const vcPattern = breakIntoVowelsAndConsonants(str);
      if (vcPattern.includes('VCC')) {
        const pIndex = vcPattern.indexOf('VCC');
        const vowel = str.charAt(pIndex);
        const mark = vowel.getMark();
        if ('¯´^'.includes(mark)) {
          const result = str.replace(vowel, vowel.removeVowelMarks());
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '302560565': {
    orderId: '05200',
    pattern: '[ī|ū] > [ĭ|ŭ]',
    description: '[ī], [ū] often shortened in polysyllables',
    url: 'https://eldamo.org/content/words/word-302560565.html',
    mechanic: (str, options = {}) => {
      const { found } = findFirstOf(['ī', 'ū'], str);
      if (!found) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);
      const isPollysyllable = syllableData.length > 1;
      if (isPollysyllable) {
        const resultArr = [];
        for (let i = 0; i < syllableData.length; i++) {
          const { syllable, stressed } = syllableData[i];
          if (stressed === false) {
            const { matched } = findFirstOf(['ī', 'ū'], syllable);
            if (matched) {
              resultArr.push(syllable.replace(matched, matched.removeVowelMarks()));
            } else {
              resultArr.push(syllable);
            }
          } else {
            resultArr.push(syllable);
          }
        }
        const result = resultArr.join('');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '671129175': {
    orderId: '05300',
    pattern: '[awa] > [au]',
    description: '[awa] sometimes became [au]',
    url: 'https://eldamo.org/content/words/word-671129175.html',
    // This rule is unclear because all examples seem to stress the "aw" at the beginning, because
    // these words have 2 syllables.
    // Also, all examples are iffy, as even the one example available seems to be an older form.
    mechanic: (str, options = {}) => {
      const { found } = findFirstOf(['awa'], str);
      if (!found) return { in: str, out: str, morphemes: options.morphemes };

      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);
      const result = [];
      const removedIndices = [];
      let foundAw = false;
      let currentLength = 0;
      for (let i = 0; i < syllableData.length; i++) {
        const { syllable, stressed } = syllableData[i];
        if (foundAw && stressed === false && syllable.nth(0) === 'a') {
          result[i-1] = result[i-1].replace('aw', 'au');
          result.push(syllable.substring(1));
          removedIndices.push(currentLength);
          foundAw = false;
        } else {
          const awIndex = syllable.indexOf('aw');
          foundAw = awIndex > -1;
          result.push(syllable);
          currentLength += syllable.length;
        }
      }

      const resultStr = result.join('');
      const morphemes = (resultStr !== str && options.morphemes)
        ? recalcMorphemes(resultStr, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: resultStr, morphemes };
    },
  },
  '567222053': {
    orderId: '05400',
    pattern: '[ˌau|ˌae] > [o|e]',
    description: '[au], [ae] became [o], [e] in polysyllables',
    url: 'https://eldamo.org/content/words/word-567222053.html',
    mechanic: (str, options = {}) => {
      // Rules for au/aw reduction in polysyllables:
      //
      // 1. If unstressed: au → o (short)
      //    Exception: inhibited if another syllable contains o or u (e.g., Rhudaur)
      //
      // 2. If stressed:
      //    a) Followed by single consonant → ō (long)
      //    b) Followed by consonant cluster → o (short) [but often retained]
      //    c) Inhibited by o/u in another syllable → retained OR → ō
      //    d) In recognized compounds → retained
      //
      // For ae → e: Only known cases are handled via word list, since ae remains
      // a valid diphthong in many words at this stage.

      // 'jau-vaug

      let morphemes = options.morphemes || [str];

      const AE_TO_E_WORDS = ['nifraed', 'naegro', 'athaelas', 'aθaelas'];
      const lowerStr = str.toLowerCase();
      for (const word of AE_TO_E_WORDS) {
        if (lowerStr === word) {
          const aeIndex = str.indexOf('ae');
          morphemes = (options.morphemes)
            ? recalcMorphemes(str.replace('ae', 'e'), options.morphemes, [aeIndex + 1])
            : [str.replace('ae', 'e')];
          return { in: str, out: str.replace(/ae/gi, 'e'), morphemes };
        }
      }

      const { found } = findFirstOf(['aw', 'au'], str);
      if (!found) return { in: str, out: str, morphemes };

      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);

      if (syllableData.length === 1) return { in: str, out: str, morphemes };

      // Check if any OTHER syllable contains o or u (inhibition check)
      const hasOtherOU = (excludeIndex) => {
        for (let j = 0; j < syllableData.length; j++) {
          if (j === excludeIndex) continue;
          const syl = syllableData[j].syllable.removeMarks().toLowerCase();
          if (syl.includes('o') || syl.includes('u')) {
            if (syllableData[j].nucleus.length > 1) {
              // It's a diphtong!
              return false;
            }
            return true;
          }
        }
        return false;
      };

      // Check what follows the au in a syllable
      // This includes: consonants after 'au' in current syllable + onset of next syllable
      const getFollowingConsonants = (syllableIndex) => {
        const syl = syllableData[syllableIndex].syllable;
        const auIndex = syl.toLowerCase().indexOf('au');
        if (auIndex === -1) return '';

        // Consonants after 'au' within current syllable (coda)
        const codaAfterAu = syl.slice(auIndex + 2);

        // If this is the last syllable, just return the coda
        if (syllableIndex >= syllableData.length - 1) {
          return codaAfterAu;
        }

        // Get the onset of the next syllable
        const nextSyl = syllableData[syllableIndex + 1].syllable;
        let nextOnset = '';
        for (let k = 0; k < nextSyl.length; k++) {
          if (nextSyl[k].isVowel(false, false)) {
            nextOnset = nextSyl.slice(0, k);
            break;
          }
        }

        // Combine coda + next onset
        return codaAfterAu + nextOnset;
      };

      const result = [];
      const removedIndices = [];
      let currentLength = 0;

      for (let i = 0; i < syllableData.length; i++) {
        const { syllable, stressed } = syllableData[i];
        const { charIndex, matched } = findFirstOf(['aw', 'au'], syllable);

        if (!matched) {
          result.push(syllable);
          currentLength += syllable.length;
          continue;
        }

        const inhibited = hasOtherOU(i);
        const followingConsonants = getFollowingConsonants(i);
        const followedBySingleConsonant = followingConsonants.length === 1;
        const followedByCluster = followingConsonants.length >= 2;

        if (stressed === false) {
          // Unstressed: au → o, unless inhibited
          if (inhibited) {
            result.push(syllable); // Retain au
            currentLength += syllable.length;
          } else {
            result.push(syllable.replace(matched, 'o'));
            removedIndices.push(currentLength + charIndex);
            currentLength += charIndex;
          }
        } else {
          // Stressed: more complex rules
          if (followedByCluster) {
            // Followed by cluster: often retained (Bauglir, Naugrim)
            result.push(syllable);
            currentLength += syllable.length;
          } else if (followedBySingleConsonant) {
            // Followed by single consonant:
            // - If followed by 'r': au → ō (long o) - e.g., Glauredhel, Rathlauriel
            // - Otherwise: au → o (short o) - e.g., r̥auvan, θauniel
            if (followingConsonants === 'r') {
              result.push(syllable.replace(matched, 'ó'));
              removedIndices.push(currentLength + charIndex);
              currentLength += charIndex;
            } else {
              result.push(syllable.replace(matched, 'o'));
              removedIndices.push(currentLength + charIndex);
              currentLength += charIndex;
            }
            /*
             * 'r' is a sonorant consonant that tends to lengthen preceding vowels in many languages.
             */
          } else {
            // No following consonants (end of word or before vowel): au → o
            if (inhibited) {
              result.push(syllable);
              currentLength += syllable.length;
            } else {
              result.push(syllable.replace(matched, 'o'));
              removedIndices.push(currentLength + charIndex);
              currentLength += charIndex;
            }
          }
        }
      }

      const fullStrResult = result.join('');
      // If nothing changed, return original to preserve case
      if (fullStrResult.toLowerCase() === str.toLowerCase()) {
        return { in: str, out: str, morphemes: options.morphemes };
      }
      morphemes = options.morphemes
        ? recalcMorphemes(fullStrResult, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: fullStrResult, morphemes };
    },
  },
  '226282629': {
    orderId: '05500',
    pattern: '[lð] > [ll]',
    description: '[lð] became [ll]',
    url: 'https://eldamo.org/content/words/word-226282629.html',
    mechanic: (str, options = {}) => {
      if (!str.includes('lð')) return { in: str, out: str, morphemes: options.morphemes || [str] };
      const result = str.replace('lð', 'll');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2759811879': {
    orderId: '05600',
    pattern: '[nl] > [ll]',
    description: '[nl] became [ll]',
    url: 'https://eldamo.org/content/words/word-2759811879.html',
    mechanic: (str, options = {}) => {
      if (!str.includes('nl')) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const exceptions = ['minlamad', 'gonlin'];
      if (exceptions.includes(str.toLowerCase())) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const result = str.replace('nl', 'll');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '868023175': {
    orderId: '05700',
    pattern: '[mb|nd] > [mm|nn]',
    description: '[mb], [nd] became [mm], [nn]',
    url: 'https://eldamo.org/content/words/word-868023175.html',
    mechanic: (str, options = {}) => {
      // Handles only a single replacement per word.
      // May need reviewing.

      const { found, matched, charIndex, nextChar } = findFirstOf(['mb', 'nd'], str);
      if (!found) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);

      if (matched === 'nd') {
        // Monosyllable:
        if (syllableData.length === 1) {
          const { weight } = syllableData[0];
          if (weight === 'heavy') {
            return { in: str, out: str, morphemes: options.morphemes || [str] };
          }
          if (charIndex === str.length - 2) return { in: str, out: str, morphemes: options.morphemes || [str] };
        }

        // Multiple syllables:
        if (nextChar === 'r') return { in: str, out: str, morphemes: options.morphemes || [str] };
      }
      const replacements = {
        'mb': 'mm',
        'nd': 'nn',
      }
      const result = str.replace(matched, replacements[matched]);
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3868328117': {
    orderId: '05800',
    pattern: 'Sandhi Rules (Master Switch)',
    description: 'Master switch for Sandhi sound changes at morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-3868328117.html',
    info: [
      'This is the master switch for the Sandhi sound changes that occur in Sindarin compounds at morpheme boundaries.',
      'When disabled, all sandhi rules (05801-05849) are also disabled.',
      'Enable this rule to activate individual sandhi rules below.',
      'These rules are documented on David Salo\'s book "A Gateway to Sindarin" (2004), pp. 51-59.',
    ],
    isSandhiMaster: true,
    skip: true,
    mechanic: (str, options = {}) => {
      // Master switch - no transformation, just enables/disables sandhi rules
      const morphemes = options.morphemes || [str];
      return { in: str, out: str, morphemes };
    },
  },
  // Merge sandhi rules immediately after the master switch
  ...sandhiRules,
  // End of sandhi rules - Rule 05800 now acts as master switch only
  '3736793827': {
    orderId: '05900',
    pattern: '[Vs{lr}] > [Vθ{lr}]',
    description: 'medial [s] became [θ] before [l], [r]',
    url: 'https://eldamo.org/content/words/word-3736793827.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['sl', 'sr'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes || [str] };

      const replacements = {
        'sl': 'θl',
        'sr': 'θr',
      };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, lastChar } = occurrences[i];
        if (charIndex === 0 || lastChar) continue;
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '586391091': {
    orderId: '06000',
    pattern: '[wo] > [o]',
    description: '[wo] became [o]',
    url: 'https://eldamo.org/content/words/word-586391091.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['wo'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes || [str] };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'o' + result.substring(charIndex + 2);
        removedIndices.unshift(charIndex);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1126284559': {
    orderId: '06100',
    pattern: '[n+{mb}] > [m+{mb}]',
    description: '[n] assimilated to following labial',
    url: 'https://eldamo.org/content/words/word-1126284559.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['n'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes || [str] };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        const nextTwo = result.substring(charIndex + 1, charIndex + 3);
        if (nextTwo === 'mb' || ['b', 'm'].includes(nextChar)) {
          result = result.substring(0, charIndex) + 'm' + result.substring(charIndex + 1);
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1838610927': {
    orderId: '06200',
    pattern: '[œ] > [e]',
    description: '[œ] became [e]',
    url: 'https://eldamo.org/content/words/word-1838610927.html',
    mechanic: (str, options = {}) => {
      if (str.includes('œ')) {
        const result = str.replaceAll('œ', 'e');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '1742178057': {
    orderId: '06300',
    pattern: '[-SS{ll|nn|ss}] > [-SS{l|n|s}]',
    description: 'final [ll], [nn], [ss] shortened in polysyllables',
    url: 'https://eldamo.org/content/words/word-1742178057.html',
    input: [
      {
        name: 'yAsVowel',
        label: 'Y as vowel',
        type: 'boolean',
        default: false,
        description: 'Consider y as a vowel when determining syllables'
      },
    ],
    mechanic: (str, { yAsVowel = false, morphemes } = {}) => {
      if (str.endsWith('ll') || str.endsWith('nn') || str.endsWith('ss') || str.endsWith('ſ')) {
        const analyser = new SyllableAnalyser({ includeY: yAsVowel });
        const syllableData = analyser.analyse(str);

        if (syllableData.length > 1) {
          const lastSyllable = syllableData.last().syllable;
          const lengthBeforeLast = str.length - lastSyllable.length;
          const { found, charIndex, matched } = findFirstOf(['ll', 'nn', 'ss', 'ſ'], lastSyllable);
          const replacements = {
            'll': 'l',
            'nn': 'n',
            'ss': 's',
            'ſ': 's',
          };
          const finalChars = lastSyllable.nth(-matched.length, matched.length);
          if (found && finalChars === matched) {
            const removedIndices = [];
            const result = str.slice(0, -matched.length) + replacements[matched];
            if (matched.length > replacements[matched].length) {
              removedIndices.push(lengthBeforeLast + charIndex);
            }
            const newMorphemes = (morphemes && removedIndices.length)
              ? recalcMorphemes(result, morphemes, removedIndices)
              : (morphemes || [str]);
            return { in: str, out: result, morphemes: newMorphemes };
          }
        }
      }
      return { in: str, out: str, morphemes };
    },
  },
  '311523279': {
    orderId: '06400',
    pattern: '[ŋg-|-ŋg] > [ŋ-|-ŋ]',
    description: 'final and initial [ŋg] became [ŋ]',
    url: 'https://eldamo.org/content/words/word-311523279.html',
    mechanic: (str, options = {}) => {
      if (str.startsWith('ŋg')) {
        const result = 'ŋ' + str.substring(2);
        const morphemes = (options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [0])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      if (str.endsWith('ŋg')) {
        const result = str.substring(0, str.length - 2) + 'ŋ';
        const morphemes = (options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [str.length - 2])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1951379117': {
    orderId: '06500',
    pattern: '[Vm|{lr}m|m{mbp}] > [Vv|{lr}v|m{mbp}]',
    description: 'non-initial [m] usually became [v]',
    url: 'https://eldamo.org/content/words/word-1951379117.html',
    input: [
      {
        name: 'northSindarin',
        label: 'North Sindarin',
        type: 'boolean',
        default: false,
        description: 'North Sindarin dialect: m was preserved after vowels and liquids'
      },
    ],
    // North Sindarin exceptions where m was preserved (lómin, Celegorm, etc.)
    northSindarinExceptions: new Set(['kelegorm', 'lomin', 'lómin']),
    mechanic: function(str, options = { northSindarin: false }) {
      // North Sindarin dialect preserved m entirely
      if (options.northSindarin) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      const occurrences = findAllOf(['m'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes || [str] };

      // Check if word is a known North Sindarin exception
      if (this.northSindarinExceptions.has(str.toLowerCase())) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar, prevChar } = occurrences[i];
        if (charIndex === 0) continue;

        // Skip if m is followed by m, b, or p (mm, mb, mp exceptions)
        // --> The "d" is an extra addition because of "glamdring". It's not on Eldamo.
        if (['m', 'b', 'p', 'd'].includes(nextChar)) {
          continue;
        }
        // Apply change when m follows a vowel, liquid (l, r), or ð
        if (prevChar.isVowel() || ['l', 'r', 'ð'].includes(prevChar)) {
          result = result.substring(0, charIndex) + 'v' + result.substring(charIndex + 1);
        }
      }

      // Examples:
      // parm -> parv (written parf)
      // gorm -> gorv (written gorf)
      // kelegorm -> kelegorm (North Sindarin exception)

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2192660503': {
    orderId: '06600',
    pattern: '[ðv] > [ðw]',
    description: '[ðv] became [ðw]',
    url: 'https://eldamo.org/content/words/word-2192660503.html',
    mechanic: (str, options = {}) => {
      if (str.includes('ðv')) {
        const result = str.replace('ðv', 'ðw');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '3689144303': {
    orderId: '06700',
    pattern: '[mm] > [m]',
    description: '[mm] shortened',
    url: 'https://eldamo.org/content/words/word-3689144303.html',
    exceptions: new Set([
      'ammor',
    ]),
    mechanic(str, options = {}) {
      // mm (2 chars) → m (1 char): -1 char per occurrence
      if (str.includes('mm') === false) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      if (this.exceptions.has(str)) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      const occurrences = findAllOf(['mm'], str);
      let result = str;
      const removedIndices = [];

      // Process from end to start so indices remain valid
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'm' + result.substring(charIndex + 2);
        // The second 'm' is removed
        removedIndices.unshift(charIndex + 1);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '3909760699': {
    orderId: '06800',
    pattern: '[-{ae|oe}v] > [-{ae|oe}w]',
    description: 'final [v] became [w] after [ae], [oe], and sometimes [i]',
    url: 'https://eldamo.org/content/words/word-3909760699.html',
    mechanic: (str, options = {}) => {
      if (['aev', 'oev'].includes(str.nth(-3, 3))) {
        const result = str.substring(0, str.length - 1) + 'w';
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '70600889': {
    orderId: '06900',
    pattern: '[-u{vw}] > [-u]',
    description: 'final [w], [v] vanished after [u]',
    url: 'https://eldamo.org/content/words/word-70600889.html',
    mechanic: (str, options = {}) => {
      const unmarkedStr = str.removeMarks();
      if (unmarkedStr.nth(-2, 2) === 'ov') {
        const result = str.substring(0, str.length - 2) + 'ou';
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      if (['uv', 'uw'].includes(unmarkedStr.nth(-2, 2))) {
        const result = str.substring(0, str.length - 1);
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [str.length - 1])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '2476983755': {
    orderId: '07000',
    pattern: '[ou] > [au]',
    description: '[ou] became [au]',
    url: 'https://eldamo.org/content/words/word-2476983755.html',
    input: [
      {
        name: 'useFinalU',
        label: 'Use final u',
        type: 'boolean',
        default: false,
        description: 'Use "au" at end of words instead of "aw"',
      },
    ],
    mechanic: (str, { useFinalU = false, morphemes } = {}) => {
      if (str.includes('ou')) {
        let result = str.replace('ou', 'au');
        if (useFinalU === false) {
          if (result.nth(-2, 2) === 'au') {
            result = result.substring(0, result.length - 2) + 'aw';
          }
        }
        const updatedMorphemes = (result !== str && morphemes)
          ? recalcMorphemes(result, morphemes, [])
          : (morphemes || [str]);
        return { in: str, out: result, morphemes: updatedMorphemes };
      }
      return { in: str, out: str, morphemes: morphemes || [str] };
    },
  },
  '1206014597': {
    orderId: '07100',
    pattern: '[θθ|xx] > [θ|x]',
    description: 'long voiceless spirants shortened',
    url: 'https://eldamo.org/content/words/word-1206014597.html',
    mechanic: (str, options = {}) => {
      // Various clusters (2-3 chars) → single char (1 char): length varies
      const clusterMap = {
        'χχ': 'χ',   // 2 → 1: -1
        'θθ': 'θ',   // 2 → 1: -1
        'tth': 'θ',  // 3 → 1: -2
        'tθ': 'θ',   // 2 → 1: -1
        'xx': 'x',   // 2 → 1: -1
        'kk': 'x',   // 2 → 1: -1
        'pph': 'f',  // 3 → 1: -2
        'pɸ': 'f',   // 2 → 1: -1
      };
      const clusterOpts = Object.keys(clusterMap);
      const occurrences = findAllOf(clusterOpts, str);
      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes: options.morphemes || [str] };
      }

      let result = str;
      const removedIndices = [];

      // Process from end to start so indices remain valid
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        const replacement = clusterMap[matched];
        result = result.substring(0, charIndex) + replacement + result.substring(charIndex + matched.length);
        // Track all removed character positions (all but the first char of the match)
        for (let j = matched.length - 1; j >= 1; j--) {
          removedIndices.unshift(charIndex + j);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '1942165347': {
    orderId: '07200',
    pattern: '[-C{lr}] > [-Co{lr}]',
    description: 'final [l], [r] usually became syllabic',
    url: 'https://eldamo.org/content/words/word-1942165347.html',
    mechanic: (str, options = {}) => {
      const lastChar = str.nth(-1);
      if (['l', 'r'].includes(lastChar)) {
        const secondLastChar = str.nth(-2);
        if (secondLastChar.isConsonant()) {
          // Exceptions:
          if (str === 'ygl') {
            return { in: str, out: 'ygil', morphemes: ['ygil'] };
          }
          if (secondLastChar === lastChar) {
            return { in: str, out: str, morphemes: options.morphemes };
          }
          const result = str.substring(0, str.length - 1) + 'o' + lastChar;
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [], [str.length - 1])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '2569469231': {
    orderId: '07300',
    pattern: '[-vn] > [-von]',
    description: 'final [vn] sometimes became [von]',
    url: 'https://eldamo.org/content/words/word-2569469231.html',
    skip: true,
    info: ['This rule has only Noldorin examples and one Sindarin counter-example.', 'This rule is disabled by default.'],
    mechanic: (str, options = {}) => {
      if (str.nth(-2, 2) === 'vn') {
        if (str === 'tavn') return { in: str, out: str, morphemes: options.morphemes };
        const result = str.substring(0, str.length - 2) + 'von';
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [], [str.length - 2])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '798091205': {
    orderId: '07400',
    pattern: '[-Cw|-aw] > [-Cu|-au]',
    description: 'final [w] usually became [u]',
    url: 'https://eldamo.org/content/words/word-798091205.html',
    mechanic: (str, options = {}) => {
      const lastChar = str.nth(-1);
      if (lastChar === 'w') {
        const secondLastChar = str.nth(-2);
        if (secondLastChar.isConsonant() || secondLastChar === 'a') {
          const result = str.substring(0, str.length - 1) + 'u';
          const morphemes = (result !== str && options.morphemes)
            ? recalcMorphemes(result, options.morphemes, [])
            : (options.morphemes || [str]);
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '1254294665': {
    orderId: '07500',
    pattern: '[-rr] > [-r]',
    description: 'final [rr] became [r]',
    url: 'https://eldamo.org/content/words/word-1254294665.html',
    mechanic: (str, options = {}) => {
      // NOTE: This is a length-CHANGING rule (rr→r removes 1 char)
      // Morpheme handling would require tracking removedIndices
      if (str.nth(-2, 2) === 'rr') {
        const result = str.substring(0, str.length - 1);
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [str.length - 1])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '1759587217': {
    orderId: '07600',
    pattern: '[s{pk}] > [s{bg}]',
    description: '[sk], [sp] usually became [sg], [sb]',
    url: 'https://eldamo.org/content/words/word-1759587217.html',
    mechanic: (str, options = {}) => {
      if (str.includes('sp') || str.includes('sk')) {
        const result = str.replace('sp', 'sb').replace('sk', 'sg');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '4188321265': {
    orderId: '07700',
    pattern: '[-x-] > [-h-]',
    description: 'medial [x] became [h] in Gondorian pronunciation',
    url: 'https://eldamo.org/content/words/word-4188321265.html',
    info: [
      'The user should determine whether to use Gondorian Sindarin or not.',
      'Skipped by default.'
    ],
    skip: true,
    mechanic: (str, options = {}) => {
      const normalizedStr = str.replace('χ', 'x');
      if (normalizedStr.includes('x')) {
        const initial = normalizedStr.nth(0);
        const final = normalizedStr.nth(-1);
        if (initial === 'x' || final === 'x') return { in: str, out: str, morphemes: options.morphemes || [str] };
        const result = normalizedStr.replace('x', 'h');
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes || [str] };
    },
  },
  '132402625': {
    orderId: '07800',
    pattern: '[{vð}{hx}] > [{fθ}]',
    description: 'voiced spirants unvoiced before voiceless spirants',
    url: 'https://eldamo.org/content/words/word-132402625.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['h'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'vh': 'f',
        'ðh': 'θ',
      };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        if (['v', 'ð'].includes(prevChar)) {
          result = result.substring(0, charIndex - 1) + replacements[`${prevChar}h`] + result.substring(charIndex + 1);
          // vh/ðh (2 chars) → f/θ (1 char): the 'h' at charIndex is removed
          removedIndices.unshift(charIndex);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
};
