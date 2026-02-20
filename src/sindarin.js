import './utils.js'; // Load String prototype extensions
import {
  digraphsToSingle,
  singleToDigraphs,
  syllabify,
  breakIntoVowelsAndConsonants,
  removeDigraphs,
  restoreDigraphs,
  shouldRevertToDigraphs,
  findFirstOf,
  SyllableAnalyser,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const sindarinRules = {
  '2002760597': {
    orderId: '00100',
    pattern: '[w-] > [gw-]',
    description: 'initial [w] became [gw]',
    url: 'https://eldamo.org/content/words/word-2002760597.html',
    mechanic: (str) => {
      const initialW = str.nth(0).toLowerCase() === 'w';
      if (initialW) {
        return str.replace('w', 'gw');
      }
      return str;
    },
  },
  '3057844573': {
    orderId: '00200',
    pattern: '[{mb|nd|ŋg}-] > [{bdg}-]',
    description: 'initial nasals vanished before stops',
    url: 'https://eldamo.org/content/words/word-3057844573.html',
    mechanic: (str) => {
      const initialNasal = str.substring(0, 2) === 'mb' || str.substring(0, 2) === 'nd' || str.substring(0, 2) === 'ŋg';
      if (initialNasal) {
        return str.replace('mb', 'b').replace('nd', 'd').replace('ŋg', 'g');
      }
      return str;
    },
  },
  '876455981': {
    orderId: '00300',
    pattern: '[-V{mn}] > [-Vø]',
    description: 'final nasals vanished after vowels',
    url: 'https://eldamo.org/content/words/word-876455981.html',
    mechanic: (str) => {
      if (str.endsWith('m') || str.endsWith('n')) {
        const lastChar = str.nth(-1);
        const penultimateChar = str.nth(-2);
        const isPenultimateVowel = penultimateChar.isVowel();
        if (isPenultimateVowel && (lastChar === 'm' || lastChar === 'n')) {
          return str.substring(0, str.length - 1);
        }
      }
      return str;
    },
  },
  '3841187313': {
    orderId: '00400',
    pattern: '[s{ɸθx}-] > [{ɸθx}-]',
    description: 'initial [s] vanished before spirants',
    url: 'https://eldamo.org/content/words/word-3841187313.html',
    mechanic: (str) => {
      const initialS = str.nth(0).toLowerCase() === 's';
      if (initialS) {
        const secondPhoneme = str.nth(1).toLowerCase();
        if (secondPhoneme === 'ɸ' || secondPhoneme === 'θ' || secondPhoneme === 'x') {
          return str.replace('s', '');
        }
      }
      return str;
    },
  },
  '2178021811': {
    orderId: '00500',
    pattern: '[j̊-] > [x-]',
    description: 'initial voiceless [j̊] became [x]',
    url: 'https://eldamo.org/content/words/word-2178021811.html',
    mechanic: (str) => {
      const initialJ = str.substring(0, 2) === 'hy';
      if (initialJ) {
        return str.replace('hy', 'ch');
      }
      return str;
    },
  },
  '1590520649': {
    orderId: '00600',
    pattern: '[{rl}{bdg}] > [{rl}{vðɣ}]',
    description: 'voiced stops became spirants after liquids',
    url: 'https://eldamo.org/content/words/word-1590520649.html',
    mechanic: (str) => {
      const rIndex = str.indexOf('r');
      const lIndex = str.indexOf('l');
      if (rIndex !== -1) {
        const nextChar = str.nth(rIndex + 1);
        if (nextChar === 'b' || nextChar === 'd' || nextChar === 'g') {
          return str.replace('rb', 'rv').replace('rd', 'rð').replace('rg', 'rɣ');
        }
      }
      if (lIndex !== -1) {
        const nextChar = str.nth(lIndex + 1);
        if (nextChar === 'b' || nextChar === 'd' || nextChar === 'g') {
          return str.replace('lb', 'lv').replace('ld', 'lð').replace('lg', 'lɣ');
        }
      }
      return str;
    },
  },
  '1951748921': {
    orderId: '00700',
    pattern: '[z{bg}] > [ð{βɣ}]',
    description: '[zb], [zg] became [ðβ], [ðɣ]',
    url: 'https://eldamo.org/content/words/word-1951748921.html',
    mechanic: (str) => {
      const zIndex = str.indexOf('z');
      if (zIndex !== -1) {
        const nextChar = str.nth(zIndex + 1);
        if (nextChar === 'b' || nextChar === 'g') {
          return str.replace('zb', 'ðβ').replace('zg', 'ðɣ');
        }
      }
      return str;
    },
  },
  '1593810649': {
    orderId: '00800',
    pattern: '[-{ĭŭ}{C|CC}a] > [-{eo}{C|CC}a]',
    description: 'short [i], [u] became [e], [o] preceding final [a]',
    url: 'https://eldamo.org/content/words/word-1593810649.html',
    mechanic: (str) => {
      const syllables = syllabify(str);
      const lastSyllable = syllables[syllables.length - 1].removeMarks();
      if (lastSyllable.indexOf('a') !== -1) {
        const noMarksStr = str.removeMarks();
        const iIndex = noMarksStr.indexOf('i');
        const uIndex = noMarksStr.indexOf('u');
        if (iIndex !== -1) {
          const iChar = str.nth(iIndex);
          if (iChar.isMark()) {
            const iMark = iChar.getMark();
            const eMark = 'e'.addMark(iMark);
            return str.replace('i', eMark);
          } else {
            return str.replace('i', 'e');
          }
        }
        if (uIndex !== -1) {
          const uChar = str.nth(uIndex);
          if (uChar.isMark()) {
            const uMark = uChar.getMark();
            const oMark = 'o'.addMark(uMark);
            return str.replace('u', oMark);
          } else {
            return str.replace('u', 'o');
          }
        }
      }
      return str;
    },
  },
  '1726791627': {
    orderId: '00900',
    pattern: '[V{bdg}] > [V{vðɣ}]',
    description: 'voiced stops became spirants after vowels',
    url: 'https://eldamo.org/content/words/word-1726791627.html',
    mechanic: (str) => {
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
      return aStr.join('');
    },
  },
  '890563133': {
    orderId: '01000',
    pattern: '[ɸ|β] > [f|v]',
    description: '[ɸ], [β] became [f], [v]',
    url: 'https://eldamo.org/content/words/word-890563133.html',
    mechanic: (str) => {
      return str.replaceAll('ɸ', 'f').replaceAll('β', 'v');
    },
  },
  '1679623085': {
    orderId: '01100',
    pattern: '[CjV] > [CiV]',
    description: 'medial [j] became [i]',
    url: 'https://eldamo.org/content/words/word-1679623085.html',
    mechanic: (str) => {
      // Check: can a word have multiple [j]s?
      const jIndex = str.indexOf('j');
      if (jIndex !== -1) {
        const isInitial = str.nth(0) === 'j';
        const isFinal = str.nth(-1) === 'j';
        if (!isInitial && !isFinal) {
          return str.replace('j', 'i');
        }
      }
      return str;
    },
  },
  '2646655607': {
    orderId: '01200',
    pattern: '[-{ĕŏ}{C|CC}i] > [-{iu}{C|CC}i]',
    description: 'short [e], [o] became [i], [u] in syllable before final [i]',
    url: 'https://eldamo.org/content/words/word-2646655607.html',
    mechanic: (str) => {
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
        return str.replace(secondLastSyllable, newSyllable);
      }
      return str;
    },
  },
  '3958031275': {
    orderId: '01300',
    pattern: '[{ăŏŭ}{C|CC}i] > [{eœy}{C|CC}i]',
    description: 'short [a], [o], [u] became [e], [œ], [y] preceding [i]',
    url: 'https://eldamo.org/content/words/word-3958031275.html',
    mechanic: (str) => {
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
              if (vowel === 'i' || vowel === 'e' || vowel === 'y') {
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

          // Check all vowels in the pattern are transformable (a/o/u)
          const allTransformable = vowelPos.every(pos => {
            const v = unmarkedStr.charAt(start + pos);
            return v === 'a' || v === 'o' || v === 'u';
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
              replacement = 'y'.addMark(mark);
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

      return result;
    },
  },
  '3889365613': {
    orderId: '01400',
    pattern: '[ē|ō] > [ī|ū]',
    description: '[ē], [ō] became [ī], [ū]',
    url: 'https://eldamo.org/content/words/word-3889365613.html',
    mechanic: (str) => {
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
      return result;
    },
  },
  '539122737': {
    orderId: '01500',
    pattern: '[V{ɣ}{lrmn}] > [Vi{lrmn}]',
    description: '[ɣ] vocalized before [l], [r], [m], [n]',
    url: 'https://eldamo.org/content/words/word-539122737.html',
    mechanic: (str) => {
      if (str.includes('ɣ')) {
        let result = str;
        const indices = str.findAllChars('ɣ');
        const vcPattern = breakIntoVowelsAndConsonants(str);
        for (const index of indices) {
          if (vcPattern.charAt(index - 1) === 'V' && 'lrmn'.includes(str.charAt(index + 1))) {
            result = str.replaceAt(index, 'i');
          }
        }
        return result;
      }
      return str;
    },
  },
  '4002924749': {
    orderId: '01600',
    pattern: '[Vx{θ}|Vɸ{θ}] > [Vi{θ}|Vu{θ}]',
    description: '[x], [ɸ] vocalized between a vowel and [θ]',
    url: 'https://eldamo.org/content/words/word-4002924749.html',
    mechanic: (str) => {
      if (str.includes('x') || str.includes('ɸ')) {
        let result = str.normaliseToOne();
        const unmarkedStr = str.removeMarks();
        if (unmarkedStr.includes('x')) {
          const indices = unmarkedStr.findAllChars('x');
          for (const index of indices) {
            if (unmarkedStr.nth(index - 1).isVowel() && unmarkedStr.nth(index + 1) === 'θ') {
              result = result.replaceAt(index, 'i');
            }
            if (result.indexOf('ii') !== -1) {
              result = result.replace('ii', 'ī');
            }
          }
        }
        if (unmarkedStr.includes('ɸ')) {
          const indices = unmarkedStr.findAllChars('ɸ');
          for (const index of indices) {
            if (unmarkedStr.nth(index - 1).isVowel() && unmarkedStr.nth(index + 1) === 'θ') {
              result = result.replaceAt(index, 'u');
            }
          }
        }
        return result;
      }
      return str;
    },
  },
  '2422841513': {
    orderId: '01700',
    pattern: '[xʲ] > [ix]',
    description: 'non-initial [xʲ] vocalized to [ix]',
    url: 'https://eldamo.org/content/words/word-2422841513.html',
    // Ask about this, as it's not clear if this is from Old Sindarin or not.
    // It's also not clear the characters used are different either.
    mechanic: (str) => {
      if (str.includes('xʲ') || str.includes('ꜧ')) {
        const newStr = str.replace('xʲ', 'ꜧ');
        let result = newStr;
        const indices = newStr.findAllChars('ꜧ');
        for (const index of indices) {
          if (index > 0) {
            result = result.replaceAt(index, 'ix', 1);
          }
        }
        if (result.indexOf('ii') !== -1) {
          result = result.replace('ii', 'ī');
        }
        return result;
      }
      return str;
    },
  },
  '659168127': {
    orderId: '01800',
    pattern: '[{ij}u|jui] > [ȳ|jui]',
    description: '[iu] and [ju] became [ȳ]',
    url: 'https://eldamo.org/content/words/word-659168127.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      if (unmarkedStr.includes('iu') || unmarkedStr.includes('ju')) {
        let result = str;
        if (unmarkedStr.includes('iu')) {
          result = result.replace('iu', 'ȳ');
        }
        if (unmarkedStr.includes('ju')) {
          result = result.replace('ju', 'ȳ').replace('jū', 'ȳ');
        }
        return result;
      }
      return str;
    },
  },
  '2740073851': {
    orderId: '01900',
    pattern: '[ŭ|uC{uw}|u{mnŋ}] > [o|uC{uw}|u{mnŋ}]',
    description: 'short [u] often became [o]',
    url: 'https://eldamo.org/content/words/word-2740073851.html',
    /*
     * This is a rule with exceptions. The change occurs only when all exceptions are negative.
     */
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      if (unmarkedStr.includes('u')) {
        let result = str;
        const indices = unmarkedStr.findAllChars('u');
        const vcPattern = breakIntoVowelsAndConsonants(str);
        const skip = new Set();
        for (const index of indices) {
          if (skip.has(index)) continue;
          const nextChar = unmarkedStr.nth(index + 1);
          const followingChar = unmarkedStr.nth(index + 2);
          const nextCharVcPattern = vcPattern.charAt(index + 1);
          if (['m', 'n', 'ŋ'].includes(nextChar)) {
            continue;
          } else if (nextCharVcPattern === 'C' && ['u', 'w'].includes(followingChar)) {
            skip.add(index + 2); // Skip the 'u' that's part of this pattern
            continue;
          } else {
            result = result.replaceAt(index, 'o');
          }
        }
        return result;
      }
      return str;
    },
  },
  '3258926163': {
    orderId: '02000',
    pattern: '[{nŋ}m] > [{nŋ}w]',
    description: '[nm], [ŋm] became [nw], [ŋw]',
    url: 'https://eldamo.org/content/words/word-3258926163.html',
    mechanic: (str) => {
      if (str.includes('nm') || str.includes('ŋm')) {
        return str.replace('nm', 'nw').replace('ŋm', 'ŋw');
      }
      return str;
    },
  },
  '3707785609': {
    orderId: '02100',
    pattern: '[Vŋ{nw}] > [V̄{nw}]',
    description: '[ŋ] vanished with compensatory lengthening',
    url: 'https://eldamo.org/content/words/word-3707785609.html',
    mechanic: (str) => {
      if (str.includes('ŋ')) {
        let result = str;
        const unmarkedStr = str.removeMarks();
        const vcPattern = breakIntoVowelsAndConsonants(unmarkedStr);
        const indices = str.findAllChars('ŋ');
        for (const index of indices) {
          const prevChar = unmarkedStr.nth(index - 1);
          const nextChar = unmarkedStr.nth(index + 1);
          if (prevChar.isVowel() && ['n', 'w'].includes(nextChar)) {
            result = result.replaceAt(index - 1, prevChar.addMark('¯'), 2);
          }
        }
        return result;
      }
      return str;
    },
  },
  '558704171': {
    orderId: '02200',
    pattern: '[ǭ] > [au]',
    description: '[ǭ] became [au]',
    url: 'https://eldamo.org/content/words/word-558704171.html',
    mechanic: (str) => {
      if (str.includes('ǭ')) {
        return str.replaceAll('ǭ', 'au');
      }
      return str;
    },
  },
  '2387695245': {
    orderId: '02300',
    pattern: '[ę̄] > [ai]',
    description: '[ę̄] became [ai]',
    url: 'https://eldamo.org/content/words/word-2387695245.html',
    mechanic: (str) => {
      if (str.includes('ę̄')) {
        return str.replaceAll('ę̄', 'ai');
      }
      return str;
    },
  },
  '813787869': {
    orderId: '02400',
    pattern: '[-S{ĕăŏ}] > [-Sø]',
    description: 'short final vowels vanished',
    url: 'https://eldamo.org/content/words/word-813787869.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      const lastChar = unmarkedStr.nth(-1);
      if (['e', 'a', 'o'].includes(lastChar)) {
        const xMark = str.nth(-1).getMark();
        if (['¯', '´', '^'].includes(xMark)) {
          return str;
        }
        return str.slice(0, -1);
      }
      return str;
    },
  },
  '2399289739': {
    orderId: '02500',
    pattern: '[-VCi] > [-ViC]',
    description: 'final [i] intruded into preceding syllable',
    url: 'https://eldamo.org/content/words/word-2399289739.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      const vcPattern = breakIntoVowelsAndConsonants(unmarkedStr);
      if (unmarkedStr.endsWith('i') && vcPattern.endsWith('VCV')) {
        const patterns = [
          { in: 'i', out: 'i' },
          { in: 'e', out: 'ei' },
          { in: 'y', out: 'y' },
          { in: 'œ', out: 'œi' },
          { in: 'o', out: 'oi' },
          { in: 'u', out: 'ui' },
        ];
        for (const pattern of patterns) {
          const secondLastChar = unmarkedStr.nth(-2);
          const thirdLastChar = unmarkedStr.nth(-3);
          if (thirdLastChar === pattern.in) {
            const index = unmarkedStr.length - 3;
            return str.substring(0, index) + pattern.out + secondLastChar;
          }
        }
      }
      // [-iCi] > [-iC]
      // [-ĕCi] > [-eiC]
      // [-yCi] > [-yC]
      // [-œCi] > [-œiC]
      // [-ǭCi] > [-oiC]
      // [-ūCi] > [-uiC]
      return str;
    },
  },
  '4211011237': {
    orderId: '02600',
    pattern: '[-Cw] > [-uC]', // Originally this is [-xw] > [-ux]
    description: 'final [w] sometimes intruded into preceding syllables',
    url: 'https://eldamo.org/content/words/word-4211011237.html',
    mechanic: (str) => {
      const regularisedStr = str.toNormalScript().removeMarks();
      if (regularisedStr.endsWith('w')) {
        const vcPattern = breakIntoVowelsAndConsonants(regularisedStr);
        if (vcPattern.endsWith('VCC')) {
          const secondLastChar = regularisedStr.nth(-2);
          const thirdLastChar = regularisedStr.nth(-3);
          if (['a', 'e'].includes(thirdLastChar)) {
            const index = regularisedStr.length - 2;
            return str.substring(0, index) + 'u' + secondLastChar;
          }
        }
      }
      return str;
    },
  },
  '4287595571': {
    orderId: '02700',
    pattern: '[x-|x{lr}-] > [h-|{l̥r̥}-]',
    description: 'initial [x-] became [h-]',
    url: 'https://eldamo.org/content/words/word-4287595571.html',
    mechanic: (str) => {
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
          return result.replace('xl', 'l̥').replace('xr', 'r̥');
        }
        return result.replace(initialX, 'h');
      }
      return str;
    },
  },
  '2240258959': {
    orderId: '02800',
    pattern: '[V{ptk}] > [V{bdg}]',
    description: 'voiceless stops voiced after vowels',
    url: 'https://eldamo.org/content/words/word-2240258959.html',
    mechanic: (str) => {
      if (str.includes('p') || str.includes('t') || str.includes('k')) {
        const pIndex = str.indexOf('p');
        const tIndex = str.indexOf('t');
        const kIndex = str.indexOf('k');
        if (pIndex !== -1) {
          const prevChar = str.nth(pIndex - 1);
          if (prevChar.isVowel()) {
            return str.replace('p', 'b');
          }
        }
        if (tIndex !== -1) {
          const prevChar = str.nth(tIndex - 1);
          if (prevChar.isVowel()) {
            return str.replace('t', 'd');
          }
        }
        if (kIndex !== -1) {
          const prevChar = str.nth(kIndex - 1);
          if (prevChar.isVowel()) {
            return str.replace('k', 'g');
          }
        }
      }
      return str;
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
    vowelEndingExceptions: new Set(['hwa', 'ia', 'te', 'thle', 'di', 'lhi', 'gli', 'gwi', 'rhi', 'ri', 'ti', 'lo', 'no']),
    unvoicedExceptions: new Set(['hith', 'nith', 'iath']),
    voicedExceptions: new Set([
      'bar', 'cef', 'cor', 'del', 'dol', 'el', 'er', 'far', 'fen', 'for', 'gil', 'glad', 'glan', 'gor',
      'hen', 'ial', 'ion', 'lad', 'men', 'min', 'nad', 'nen', 'pad', 'peg', 'plad', 'sad', 'tad', 'tin', 'tol',
    ]),
    mechanic(str) {
      const singleCharsStr = removeDigraphs(str);
      const vcPattern = breakIntoVowelsAndConsonants(singleCharsStr);
      if (!/^C{0,2}V{1,2}C{0,2}$/.test(vcPattern)) return str;

      const lastChar = singleCharsStr.nth(-1);
      const lengthen = (s, pos) => {
        const vowel = s.nth(pos);
        const lengthened = s.replace(vowel, vowel.addMark('¯'));
        return singleCharsStr !== str ? restoreDigraphs(lengthened) : lengthened;
      };

      if (lastChar.isVowel()) {
        return this.vowelEndingExceptions.has(str) ? lengthen(str, -1) : str;
      }

      if (lastChar === 'θ' || lastChar === 'x') {
        return this.unvoicedExceptions.has(str) ? lengthen(singleCharsStr, -2) : str;
      }

      if ('bdðfvglnrɣ'.includes(lastChar)) {
        if (this.voicedExceptions.has(str)) return str;
        const penultimate = singleCharsStr.nth(-2);
        return penultimate.isVowel() ? lengthen(singleCharsStr, -2) : str;
      }

      return str;
    },
  },
  '916418731': {
    orderId: '03000',
    pattern: '[-Cɣ|-Cɣi] > [-Ca|-Cī]',
    description: 'final [ɣ] became [a] after a consonant',
    url: 'https://eldamo.org/content/words/word-916418731.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      const secondLastChar = str.nth(-2);
      if (lastChar === 'ɣ') {
        const penultimate = str.nth(-2);
        if (penultimate.isConsonant()) {
          return str.replace('ɣ', 'a');
        }
      }
      if (lastChar === 'i' && secondLastChar === 'ɣ') {
        const thirdLastChar = str.nth(-3);
        if (thirdLastChar.isConsonant()) {
          return str.replace('ɣi', 'ī');
        }
      }
      return str;
    },
  },
  '2139740021': {
    orderId: '03100',
    pattern: '[{lrð}ɣV] > [{lrð}iV]',
    description: '[ɣ] became [i] between sonants and vowels',
    url: 'https://eldamo.org/content/words/word-2139740021.html',
    mechanic: (str) => {
      if (str.includes('ɣ')) {
        const singleCharsStr = removeDigraphs(str);
        const sonants = ['b', 'd', 'g', 'v', 'f', 'ð', 'w', 'l', 'r', 'j'];
        const indices = singleCharsStr.findAllChars('ɣ');
        for (const index of indices) {
          const prevChar = singleCharsStr.nth(index - 1);
          const nextChar = singleCharsStr.nth(index + 1);
          if (sonants.includes(prevChar) && nextChar.isVowel()) {
            if (nextChar === 'u') {
              return singleCharsStr.replaceAt(index, 'u', 2);
            }
            if (nextChar === 'y') {
              return singleCharsStr.replaceAt(index, 'y', 2);
            }
            if (singleCharsStr !== str) {
              return restoreDigraphs(singleCharsStr.replaceAt(index, 'i'));
            }
            return singleCharsStr.replaceAt(index, 'i');
          }
        }
      }
      return str;
    },
  },
  '4164672875': {
    orderId: '03200',
    pattern: '[ɣ] > [ø]',
    description: '[ɣ] otherwise vanished',
    url: 'https://eldamo.org/content/words/word-4164672875.html',
    mechanic: (str) => {
      if (str.includes('ɣ')) {
        const gIndex = str.indexOf('ɣ');
        const prevChar = str.nth(gIndex - 1);
        const nextChar = str.nth(gIndex + 1);
        if (prevChar === nextChar && prevChar.isVowel()) {
          return str.replace(`${prevChar}ɣ${nextChar}`, prevChar.addMark('¯'));
        }
        return str.replace('ɣ', '');
      }
      return str;
    },
  },
  '677308549': {
    orderId: '03300',
    pattern: '[-wi] > [-y]',
    description: 'final [-wi] became [-y]',
    url: 'https://eldamo.org/content/words/word-677308549.html',
    mechanic: (str) => {
      if (str.endsWith('wi') || str.endsWith('ui')) {
        return str.replace('wi', 'y').replace('ui', 'y');
      }
      return str;
    },
  },
  '875184187': {
    orderId: '03400',
    pattern: '[Vh] > [Vø]',
    description: '[h] vanished after vowels',
    url: 'https://eldamo.org/content/words/word-875184187.html',
    mechanic: (str) => {
      if (str.includes('h')) {
        const hIndex = str.indexOf('h');
        const prevChar = str.nth(hIndex - 1);
        const nextChar = str.nth(hIndex + 1);
        if (prevChar === nextChar && prevChar.isVowel()) {
          const followingChar = str.nth(hIndex + 2);
          if (followingChar.isVowel()) {
            return str.replace(`h${nextChar}`, '');
          }
          return str.replace(`${prevChar}h${nextChar}`, prevChar.addMark('¯'));
        }
        return str.replace('h', '');
      }
      return str;
    },
  },
  '1815401039': {
    orderId: '03500',
    pattern: '[-S{ĭŭ}|-uCu|-Sī] > [-Sø|-uCu|-Sĭ]',
    description: 'final [i], [u] generally vanished',
    url: 'https://eldamo.org/content/words/word-1815401039.html',
    mechanic(str) {
      // Exception: uCu pattern is preserved (e.g., guru stays guru)
      if (str.length >= 3) {
        const last3 = str.slice(-3);
        if (last3[0] === 'u' && last3[1].isConsonant() && last3[2] === 'u') {
          return str;
        }
      }

      // Final short i or u after consonant vanishes
      const unmarkedStr = str.removeMarks();
      const lastChar = unmarkedStr.nth(-1);
      if (lastChar === 'i') {
        const iMark = str.nth(-1).getMark();
        if (iMark === '¯') {
          return str.slice(0, -1) + 'i';
        }
        return str.slice(0, -1);
      }
      if (lastChar === 'u') {
        const iMark = str.nth(-1).getMark();
        if (iMark === '¯') {
          return str.slice(0, -1) + 'u';
        }
        return str.slice(0, -1);
      }
      
      return str;
    },
  },
  '2749565259': {
    orderId: '03600',
    pattern: '[C{ĭĕăŏŭ}+C] > [Cø+C]',
    description: 'short vowels vanished before morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-2749565259.html',
    input: [
      { name: 'guess', type: 'boolean', default: true, description: 'Guess the syllable boundary if there is no marker' },
      { name: 'boundaryChar', type: 'string', default: '-', description: 'The morpheme boundary marker' },
    ],
    /**
     * @param {string} str - The input string
     * @param {Object} options - Options for the mechanic
     * @param {boolean} options.guess - Whether to guess boundary if no marker (default: true)
     * @param {string} options.boundaryChar - The morpheme boundary marker (default: '-')
     */
    mechanic(str, { guess = true, boundaryChar = '-' } = {}) {
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

        return result.join('');
      }

      // === GUESSING MODE ===
      if (!guess) return str;

      const syllables = syllabify(str);
      if (syllables.length < 2) return str;

      // Split: first half gets extra syllable if odd
      const midpoint = Math.ceil(syllables.length / 2);
      const firstHalf = syllables.slice(0, midpoint);
      const secondHalf = syllables.slice(midpoint);

      // Check if second half starts with consonant
      const secondHalfStart = secondHalf[0]?.nth(0);
      if (!secondHalfStart || !secondHalfStart.isConsonant()) {
        return str;
      }

      // Try to remove vowel from last syllable of first half
      const lastSyllable = firstHalf[firstHalf.length - 1];
      const modifiedSyllable = removeVowelFromSyllable(lastSyllable);

      // If nothing changed, return original
      if (modifiedSyllable === lastSyllable) {
        return str;
      }

      // Rebuild the word
      firstHalf[firstHalf.length - 1] = modifiedSyllable;
      return [...firstHalf, ...secondHalf].join('');
    },
  },
  '941153689': {
    orderId: '03700',
    pattern: '[ai|oi] > [ae|oe]',
    description: '[ai], [oi] became [ae], [oe]',
    url: 'https://eldamo.org/content/words/word-941153689.html',
    mechanic: (str) => {
      return str.replace(/ai/g, 'ae').replace(/oi/g, 'oe');
    },
  },
  '1660291111': {
    orderId: '03800',
    pattern: '[-eiC|-ei] > [-aiC|-ai]',
    description: 'later [ei] became [ai] in final syllables',
    url: 'https://eldamo.org/content/words/word-1660291111.html',
    mechanic: (str) => {
      const strLess1 = str.slice(0, -1);
      const lastChar = str.nth(-1);
      if (lastChar.isConsonant()) {
        const last2 = strLess1.slice(-2);
        if (last2 === 'ei') {
          return str.slice(0, -3) + 'ai' + lastChar;
        }
      } else {
        const last2 = str.slice(-2);
        if (last2 === 'ei') {
          return str.slice(0, -2) + 'ai';
        }
      }
      return str;
    },
  },
  '3257758901': {
    orderId: '03900',
    pattern: '[y{iu}] > [ui]',
    description: 'diphthongs [yi], [yu] became [ui]',
    skip: true,
    info: ['This rule has no attested direct examples, it is mostly concerned with explaining plural formation.'],
    url: 'https://eldamo.org/content/words/word-3257758901.html',
    mechanic: (str) => {
      return str.replace(/yi/g, 'ui').replace(/yu/g, 'ui');
    },
  },
  '1787434575': {
    orderId: '04000',
    pattern: '[œi] > [ui|y]',
    description: '[œi] became [ui] or [y]',
    skip: true,
    info: ['There is only one example of this rule. It also is mostly concerned with explaining plural formation.'],
    url: 'https://eldamo.org/content/words/word-1787434575.html',
    input: [{ name: 'useUi', type: 'boolean', default: false, description: 'Use [ui] instead of [y]' }],
    mechanic: (str, { useUi = false } = {}) => {
      return str.replace(/œi/g, useUi ? 'ui' : 'y');
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
    mechanic: (str, { cluster = false } = {}) => {
      if (cluster) return str;
      return str.replace(/nr/g, 'ðr');
    },
  },
  '2090293737': {
    orderId: '04200',
    pattern: '[{θð}Sθ] > [{θð}Ss]',
    description: 'dissimilation of dental spirants',
    url: 'https://eldamo.org/content/words/word-2090293737.html',
    // This isn't great, but it has few examples anyway.
    mechanic: (str) => {
      const singleCharsStr = removeDigraphs(str);
      const shouldRevert = str !== singleCharsStr;
      const count = (singleCharsStr.match(/[θð]/g) || []).length;
      if (count > 1) {
        const result = singleCharsStr.reverse().replace('θ', 's').reverse();
        return shouldRevert ? restoreDigraphs(result) : result;
      }
      return str;
    },
  },
  '298324969': {
    orderId: '04300',
    pattern: '[ls|rs] > [lθ|ss]',
    description: '[ls], [rs] became [lθ], [ss]',
    url: 'https://eldamo.org/content/words/word-298324969.html',
    mechanic: (str) => {
      if (str.includes('ls') || str.includes('rs')) {
        const singleCharsStr = digraphsToSingle(str);
        const digraphsStr = singleToDigraphs(str);
        const hasDigraphs = singleCharsStr !== digraphsStr;
        const shouldRevert = str !== singleCharsStr;
        const result = singleCharsStr.replace('ls', 'lθ').replace('rs', 'ss');
        if (hasDigraphs === shouldRevert) return singleToDigraphs(result);
        return result;
      }
      return str;
    },
  },
  '1531741019': {
    orderId: '04400',
    pattern: '[-{mf|nθ|ŋx|lθ}] > [-{mp|nt|ŋk|lt}]',
    description: 'final [mf], [nθ], [ŋx], [lθ] became [mp], [nt], [ŋk], [lt]',
    url: 'https://eldamo.org/content/words/word-1531741019.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const digraphsStr = singleToDigraphs(str);
      const hasDigraphs = singleCharsStr !== digraphsStr;
      const shouldRevert = str !== singleCharsStr;
      let result = str;

      if (singleCharsStr.endsWith('mf')) {
        result = singleCharsStr.slice(0, -2) + 'mp';
      }
      if (singleCharsStr.endsWith('nθ')) {
        result = singleCharsStr.slice(0, -2) + 'nt';
      }
      if (singleCharsStr.endsWith('ŋx')) {
        result = singleCharsStr.slice(0, -2) + 'ŋk';
      }
      if (singleCharsStr.endsWith('lθ')) {
        result = singleCharsStr.slice(0, -2) + 'lt';
      }

      if (hasDigraphs === shouldRevert) return singleToDigraphs(result);

      return result;
    },
  },
  '1856165973': {
    orderId: '04500',
    pattern: '[{mnŋ}{fθxs}{lr}] > [ø{fθxs}{lr}]',
    description: 'nasals vanished before spirantal clusters',
    url: 'https://eldamo.org/content/words/word-1856165973.html',
    mechanic: (str) => {
      if (str.includes('m') || str.includes('n') || str.includes('ŋ')) {
        const mIndex = str.indexOf('m');
        const nIndex = str.indexOf('n');
        const ngIndex = str.indexOf('ŋ');
        const foundIndex = mIndex > -1 ? mIndex : nIndex > -1 ? nIndex : ngIndex;
        if (foundIndex > -1) {
          const nextChar = str.nth(foundIndex + 1);
          const followingChar = str.nth(foundIndex + 2);
          if ('fθxs'.includes(nextChar) && 'lr'.includes(followingChar)) {
            return str.replaceAt(foundIndex, '', 1);
          }
          if (nextChar === 'f') {
            return str.replaceAt(foundIndex, 'ff', 2);
          }
        }
      }
      return str;
    },
  },
  '3282356701': {
    orderId: '04600',
    pattern: '[-{mnŋ}·{fθxsmnŋl}-] > [-ø·{fθxsmnŋl}-]',
    description: 'nasals vanished before morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-3282356701.html',
    input: [
      { name: 'guess', type: 'boolean', default: true, description: 'Guess the syllable boundary if there is no marker' },
      { name: 'boundaryChar', type: 'string', default: '-', description: 'The morpheme boundary marker' },
    ],
    /**
     * @param {string} str - The input string
     * @param {Object} options - Options for the mechanic
     * @param {boolean} options.guess - Whether to guess boundary if no marker (default: true)
     * @param {string} options.boundaryChar - The morpheme boundary marker (default: '-')
     */
    mechanic(str, { guess = true, boundaryChar = '-' } = {}) {
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

        return result.join(boundaryChar);
      }


      if (!guess) return str;

      // === GUESSING MODE ===
      const syllables = syllabify(str);
      if (syllables.length < 2) return str;

      // Split: first half gets extra syllable if odd
      const midpoint = Math.ceil(syllables.length / 2);
      const firstHalf = syllables.slice(0, midpoint);
      const secondHalf = syllables.slice(midpoint);

      // Try to remove nasal from last syllable of first half
      const lastSyllable = firstHalf[firstHalf.length - 1];
      const modifiedSyllable = removeNasalFromSyllable(lastSyllable);
      firstHalf[firstHalf.length - 1] = modifiedSyllable;
      return [...firstHalf, ...secondHalf].join('');
    },
  },
  '3841960279': {
    orderId: '04700',
    pattern: '[ð{mnŋ}] > [ø{mnŋ}]',
    description: '[ð] vanished before nasals at morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-3841960279.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const { found, nextChar } = findFirstOf(['ð'], singleCharsStr);
      if (found) {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        if (nextChar !== '' && 'mnŋ'.includes(nextChar)) {
          const result = singleCharsStr.replace('ð', '');
          if (revert) return singleToDigraphs(result);
          return result;
        }
      }
      return str;
    },
  },
  '3123278727': {
    orderId: '04800',
    pattern: '[-{mnŋ}{vðɣ}-] > [-{mnŋ}{bdg}-]',
    description: 'voiced spirants restopped after nasals',
    url: 'https://eldamo.org/content/words/word-3123278727.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const { found, charIndex, nextChar } = findFirstOf(['m', 'n', 'ŋ'], singleCharsStr);
      if (found && nextChar !== '') {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        if ('vðɣ'.includes(nextChar)) {
          const replacements = {
            'v': 'b',
            'ð': 'd',
            'ɣ': 'g',
          }
          const result = singleCharsStr.replace(nextChar, replacements[nextChar]);
          if (revert) return singleToDigraphs(result);
          return result;
        }
      }
      return str;
    },
  },
  '2996915415': {
    orderId: '04900',
    pattern: '[-{mf|nθ|ŋx|lθ}-] > [-{mm|nn|ŋg|l̥l̥}-]',
    description: 'medial [mf], [nθ], [ŋx], [lθ] became [mm], [nn], [ŋg], [ll]',
    url: 'https://eldamo.org/content/words/word-2996915415.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const { found, matched, charIndex } = findFirstOf(['mf', 'nθ', 'ŋx', 'lθ'], singleCharsStr);
      if (found) {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const replacements = {
          'mf': 'mm',
          'nθ': 'nn',
          'ŋx': 'ŋg',
          'lθ': 'll',
        }
        const result = singleCharsStr.replace(matched, replacements[matched]);
        if (revert) return singleToDigraphs(result);
        return result;
      }
      return str;
    }
  },
  '725943271': {
    orderId: '05000',
    pattern: '[m̥|n̥] > [m|n]',
    description: 'voiceless nasals were voiced',
    url: 'https://eldamo.org/content/words/word-725943271.html',
    mechanic: (str) => {
      return str.replace(/m̥/g, 'm').replace(/n̥/g, 'n');
    },
  },
  '2083930569': {
    orderId: '05100',
    pattern: '[V̄CC] > [V̆CC]',
    description: 'long vowels shortened before clusters',
    url: 'https://eldamo.org/content/words/word-2083930569.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      const exceptions = [
        'círdan',
        'dírhael',
        'íðra',
        'mírdain',
        'nírnaeθ',
      ];
      if (exceptions.includes(singleCharsStr.toLowerCase())) return str;

      const vcPattern = breakIntoVowelsAndConsonants(singleCharsStr);
      if (vcPattern.includes('VCC')) {
        const pIndex = vcPattern.indexOf('VCC');
        const vowel = singleCharsStr.charAt(pIndex);
        const mark = vowel.getMark();
        let result = singleCharsStr;
        if ('¯´^'.includes(mark)) {
          result = singleCharsStr.replace(vowel, vowel.removeVowelMarks());
        }
        return revert ? singleToDigraphs(result) : result;
      }
      return str;
    },
  },
  '302560565': {
    orderId: '05200',
    pattern: '[ī|ū] > [ĭ|ŭ]',
    description: '[ī], [ū] often shortened in polysyllables',
    url: 'https://eldamo.org/content/words/word-302560565.html',
    mechanic: (str) => {
      const { found } = findFirstOf(['ī', 'ū'], str);
      if (!found) return str;

      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(singleCharsStr);
      const isPollysyllable = syllableData.length > 1;
      if (isPollysyllable) {
        const result = [];
        for (let i = 0; i < syllableData.length; i++) {
          const { syllable, stressed } = syllableData[i];
          if (stressed === false) {
            const { matched } = findFirstOf(['ī', 'ū'], syllable);
            if (matched) {
              result.push(syllable.replace(matched, matched.removeVowelMarks()));
            } else {
              result.push(syllable);
            }
          } else {
            result.push(syllable);
          }
        }
        const fullStrResult = result.join('');
        return revert ? singleToDigraphs(fullStrResult) : fullStrResult;
      }
      return str;
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
    mechanic: (str) => {
      const { found } = findFirstOf(['awa'], str);
      if (found) {
        const singleCharsStr = digraphsToSingle(str);
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const analyser = new SyllableAnalyser();
        const syllableData = analyser.analyse(singleCharsStr);
        const result = [];
        // console.log({ str });
        let foundAw = false;
        for (let i = 0; i < syllableData.length; i++) {
          const { syllable, stressed } = syllableData[i];
          // console.log({ syllable, stressed, foundAw });
          if (foundAw && stressed === false && syllable.substring(0, 1) === 'a') {
            // console.log('found a', result);
            result[i-1] = result[i-1].replace('aw', 'au');
            result.push(syllable.substring(1));
            foundAw = false;
          } else {
            const awIndex = syllable.indexOf('aw');
            foundAw = awIndex > -1;
            result.push(syllable);
          }
        }
        const fullStrResult = result.join('');
        // console.log({ result });
        // console.log('-------------');
        return revert ? singleToDigraphs(fullStrResult) : fullStrResult;
      }
      return str;
    },
  },
  '567222053': {
    orderId: '05400',
    pattern: '[ˌau|ˌae] > [o|e]',
    description: '[au], [ae] became [o], [e] in polysyllables',
    url: 'https://eldamo.org/content/words/word-567222053.html',
    mechanic: (str) => {
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
      const AE_TO_E_WORDS = ['nifraed', 'naegro', 'athaelas', 'aθaelas'];
      const lowerStr = str.toLowerCase();
      for (const word of AE_TO_E_WORDS) {
        if (lowerStr === word) {
          return str.replace(/ae/gi, 'e');
        }
      }

      const { found } = findFirstOf(['aw', 'au'], str);
      if (!found) return str;

      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(singleCharsStr);

      if (syllableData.length === 1) return str;

      // Check if any OTHER syllable contains o or u (inhibition check)
      const hasOtherOU = (excludeIndex) => {
        for (let j = 0; j < syllableData.length; j++) {
          if (j === excludeIndex) continue;
          const syl = syllableData[j].syllable.removeMarks().toLowerCase();
          if (syl.includes('o') || syl.includes('u')) {
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

      for (let i = 0; i < syllableData.length; i++) {
        const { syllable, stressed } = syllableData[i];
        const { matched } = findFirstOf(['aw', 'au'], syllable);

        if (!matched) {
          result.push(syllable);
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
          } else {
            result.push(syllable.replace(matched, 'o'));
          }
        } else {
          // Stressed: more complex rules
          if (followedByCluster) {
            // Followed by cluster: often retained (Bauglir, Naugrim)
            result.push(syllable);
          } else if (followedBySingleConsonant) {
            // Followed by single consonant:
            // - If followed by 'r': au → ō (long o) - e.g., Glauredhel, Rathlauriel
            // - Otherwise: au → o (short o) - e.g., r̥auvan, θauniel
            if (followingConsonants === 'r') {
              result.push(syllable.replace(matched, 'ó'));
            } else {
              result.push(syllable.replace(matched, 'o'));
            }
            /*
             * 'r' is a sonorant consonant that tends to lengthen preceding vowels in many languages.
             */
          } else {
            // No following consonants (end of word or before vowel): au → o
            if (inhibited) {
              result.push(syllable);
            } else {
              result.push(syllable.replace(matched, 'o'));
            }
          }
        }
      }

      const fullStrResult = result.join('');
      // If nothing changed, return original to preserve case
      if (fullStrResult.toLowerCase() === singleCharsStr.toLowerCase()) {
        return str;
      }
      return revert ? singleToDigraphs(fullStrResult) : fullStrResult;
    },
  },
  '226282629': {
    orderId: '05500',
    pattern: '[lð] > [ll]',
    description: '[lð] became [ll]',
    url: 'https://eldamo.org/content/words/word-226282629.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      if (!singleCharsStr.includes('lð')) return str;

      const result = singleCharsStr.replace('lð', 'll');
      if (revert) return singleToDigraphs(result);
      return result;
    },
  },
  '2759811879': {
    orderId: '05600',
    pattern: '[nl] > [ll]',
    description: '[nl] became [ll]',
    url: 'https://eldamo.org/content/words/word-2759811879.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      if (!singleCharsStr.includes('nl')) return str;

      const exceptions = ['minlamad', 'gonlin'];
      if (exceptions.includes(singleCharsStr.toLowerCase())) return str;

      const result = singleCharsStr.replace('nl', 'll');
      if (revert) return singleToDigraphs(result);
      return result;
    },
  },
  '868023175': {
    orderId: '05700',
    pattern: '[mb|nd] > [mm|nn]',
    description: '[mb], [nd] became [mm], [nn]',
    url: 'https://eldamo.org/content/words/word-868023175.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      if (!singleCharsStr.includes('mb') && !singleCharsStr.includes('nd')) return str;

      const { found, matched, charIndex, nextChar } = findFirstOf(['mb', 'nd'], singleCharsStr);

      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(singleCharsStr);

      if (found) {
        if (matched === 'nd') {
          if (syllableData.length === 1) {
            const { weight } = syllableData[0];
            if (weight === 'heavy') {
              return str;
            }
            if (charIndex === singleCharsStr.length - 2) return str;
          }
          if (nextChar === 'r') return str;
        }
        const replacements = {
          'mb': 'mm',
          'nd': 'nn',
        }
        const result = singleCharsStr.replace(matched, replacements[matched]);
        if (revert) return singleToDigraphs(result);
        return result;
      }
      return str;
    },
  },
  '3868328117': {
    orderId: '05800',
    pattern: '[CCC] > [CC]',
    description: 'middle consonants frequently vanished in clusters',
    url: 'https://eldamo.org/content/words/word-3868328117.html',
    info: ['This is a placeholder for all the Sandhi sound changes that occur in Sindarin compounds at morpheme boundaries.', 'This rule is skipped by default.'],
    skip: true,
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      const vcPattern = breakIntoVowelsAndConsonants(singleCharsStr);
      // console.log({ str, singleCharsStr, vcPattern });
      if (vcPattern.includes('CCC')) {
        let result = singleCharsStr;
        const index = vcPattern.indexOf('CCC');
        const char = singleCharsStr.charAt(index);
        const nextChar = singleCharsStr.charAt(index + 2);
        const removeExtra = char === nextChar;
        if (!removeExtra) {
          result = singleCharsStr.slice(0, index + 1) + singleCharsStr.slice(index + 2);
        } else {
          result = singleCharsStr.slice(0, index + 1) + singleCharsStr.slice(index + 3);
        }
        if (revert) return singleToDigraphs(result);
        return result;
      }
      return str;
    },
  },
  '3736793827': {
    orderId: '05900',
    pattern: '[Vs{lr}] > [Vθ{lr}]',
    description: 'medial [s] became [θ] before [l], [r]',
    url: 'https://eldamo.org/content/words/word-3736793827.html',
    mechanic: (str) => {
      const { found, matched, charIndex, nextChar } = findFirstOf(['sl', 'sr'], str);

      if (found) {
        const replacements = {
          'sl': 'θl',
          'sr': 'θr',
        };
        if (charIndex === 0 || charIndex === str.length - 2) return str;
        const result = str.replace(matched, replacements[matched]);
        return singleToDigraphs(result);
      }
      return str;
    },
  },
  '586391091': {
    orderId: '06000',
    pattern: '[wo] > [o]',
    description: '[wo] became [o]',
    url: 'https://eldamo.org/content/words/word-586391091.html',
    mechanic: (str) => {
      const { found, charIndex } = findFirstOf(['wo'], str);
      if (found) {
        const result = str.slice(0, charIndex) + 'o' + str.slice(charIndex + 2);
        // const result = str.replace('wo', 'o');
        return singleToDigraphs(result);
      }
      return str;
    },
  },
  '1126284559': {
    orderId: '06100',
    pattern: '[n+{mb}] > [m+{mb}]',
    description: '[n] assimilated to following labial',
    url: 'https://eldamo.org/content/words/word-1126284559.html',
    mechanic: (str) => {
      const { found, charIndex, nextChar } = findFirstOf(['n'], str);
      if (found) {
        const nextTwo = str.slice(charIndex + 1, charIndex + 3);
        if (nextTwo === 'mb' || ['b', 'm'].includes(nextChar)) return str.replace('n', 'm');
      }
      return str;
    },
  },
  '1838610927': {
    orderId: '06200',
    pattern: '[œ] > [e]',
    description: '[œ] became [e]',
    url: 'https://eldamo.org/content/words/word-1838610927.html',
    mechanic: (str) => {
      if (str.includes('œ')) {
        return str.replace('œ', 'e');
      }
      return str;
    },
  },
  '1742178057': {
    orderId: '06300',
    pattern: '[-SS{ll|nn|ss}] > [-SS{l|n|s}]',
    description: 'final [ll], [nn], [ss] shortened in polysyllables',
    url: 'https://eldamo.org/content/words/word-1742178057.html',
    input: [{ name: 'yAsVowel', type: 'boolean', default: false, description: 'Consider y as a vowel when determining syllables' }],
    mechanic: (str, { yAsVowel = false } = {}) => {
      if (str.endsWith('ll') || str.endsWith('nn') || str.endsWith('ss') || str.endsWith('ſ')) {
        const singleCharsStr = digraphsToSingle(str);
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const analyser = new SyllableAnalyser({ includeY: yAsVowel });
        const syllableData = analyser.analyse(singleCharsStr);

        if (syllableData.length > 1) {
          const lastSyllable = syllableData[syllableData.length - 1].syllable;
          const { found, matched, charIndex, nextChar } = findFirstOf(['ll', 'nn', 'ss', 'ſ'], lastSyllable);
          const replacements = {
            'll': 'l',
            'nn': 'n',
            'ss': 's',
            'ſ': 's',
          };
          const finalChars = lastSyllable.nth(-matched.length, matched.length);
          if (found && finalChars === matched) {
            const result = singleCharsStr.slice(0, -matched.length) + replacements[matched];
            if (revert) return singleToDigraphs(result);
            return result;
          }
        }
      }
      return str;
    },
  },
  '311523279': {
    orderId: '06400',
    pattern: '[ŋg-|-ŋg] > [ŋ-|-ŋ]',
    description: 'final and initial [ŋg] became [ŋ]',
    url: 'https://eldamo.org/content/words/word-311523279.html',
    mechanic: (str) => {
      if (str.startsWith('ŋg')) {
        return str.replace('ŋg', 'ŋ');
      }
      if (str.endsWith('ŋg')) {
        return str.slice(0, -2) + 'ŋ';
      }
      return str;
    },
  },
  '1951379117': {
    orderId: '06500',
    pattern: '[Vm|{lr}m|m{mbp}] > [Vv|{lr}v|m{mbp}]',
    description: 'non-initial [m] usually became [v]',
    url: 'https://eldamo.org/content/words/word-1951379117.html',
    mechanic: (str) => {
      if (str.includes('m')) {
        const singleCharsStr = digraphsToSingle(str);
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const { found, charIndex, nextChar, prevChar } = findFirstOf(['m'], singleCharsStr);
        if (found) {
          if (charIndex === 0) {
            return str;
          }
          let result = singleCharsStr;
          if (prevChar.isVowel()) {
            result = singleCharsStr.substring(0, charIndex) + 'v' + singleCharsStr.substring(charIndex + 1);
          }
          if (['l', 'r', 'ð'].includes(prevChar)) {
            result = singleCharsStr.substring(0, charIndex) + 'v' + singleCharsStr.substring(charIndex + 1);
          }
          if (['m', 'b', 'p'].includes(nextChar)) {
            result = singleCharsStr;
          }
          if (revert) return singleToDigraphs(result);
          return result;
        }
      }
      return str;
    },
  },
  '2192660503': {
    orderId: '06600',
    pattern: '[ðv] > [ðw]',
    description: '[ðv] became [ðw]',
    url: 'https://eldamo.org/content/words/word-2192660503.html',
    mechanic: (str) => {
      if (str.includes('ðv')) {
        return str.replace('ðv', 'ðw');
      }
      return str;
    },
  },
  '3689144303': {
    orderId: '06700',
    pattern: '[mm] > [m]',
    description: '[mm] shortened',
    url: 'https://eldamo.org/content/words/word-3689144303.html',
    mechanic: (str) => {
      if (str.includes('mm')) {
        return str.replace('mm', 'm');
      }
      return str;
    },
  },
  '3909760699': {
    orderId: '06800',
    pattern: '[-{ae|oe}v] > [-{ae|oe}w]',
    description: 'final [v] became [w] after [ae], [oe], and sometimes [i]',
    url: 'https://eldamo.org/content/words/word-3909760699.html',
    mechanic: (str) => {
      if (['aev', 'oev'].includes(str.nth(-3, 3))) {
        return str.substring(0, str.length - 1) + 'w';
      }
      return str;
    },
  },
  '70600889': {
    orderId: '06900',
    pattern: '[-u{vw}] > [-u]',
    description: 'final [w], [v] vanished after [u]',
    url: 'https://eldamo.org/content/words/word-70600889.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      if (unmarkedStr.nth(-2, 2) === 'ov') {
        return str.substring(0, str.length - 2) + 'ou';
      }
      if (['uv', 'uw'].includes(unmarkedStr.nth(-2, 2))) {
        return str.substring(0, str.length - 1);
      }
      return str;
    },
  },
  '2476983755': {
    orderId: '07000',
    pattern: '[ou] > [au]',
    description: '[ou] became [au]',
    url: 'https://eldamo.org/content/words/word-2476983755.html',
    input: [{ name: 'useFinalU', type: 'boolean', default: false, description: 'Use "au" at end of words instead of "aw"' }],
    mechanic: (str, { useFinalU = false } = {}) => {
      if (str.includes('ou')) {
        const result = str.replace('ou', 'au');
        if (useFinalU === false) {
          if (result.nth(-2, 2) === 'au') {
            return result.substring(0, result.length - 2) + 'aw';
          }
        }
        return result;
      }
      return str;
    },
  },
  '1206014597': {
    orderId: '07100',
    pattern: '[θθ|xx] > [θ|x]',
    description: 'long voiceless spirants shortened',
    url: 'https://eldamo.org/content/words/word-1206014597.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const reverted = singleToDigraphs(singleCharsStr);
      // console.log({ str, singleCharsStr, reverted });
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      const clusterMap = {
        'χχ': 'χ',
        'θθ': 'θ',
        'tth': 'θ',
        'tθ': 'θ',
        'xx': 'x',
        'kk': 'x',
        'pph': 'f',
        'pɸ': 'f',
      };
      const clusterOpts = Object.keys(clusterMap);
      const { found, matched } = findFirstOf(clusterOpts, singleCharsStr);
      if (found) {
        const result = singleCharsStr.replace(matched, clusterMap[matched]);
        if (revert) return singleToDigraphs(result);
        return result;
      }
      return str;
    },
  },
  '1942165347': {
    orderId: '07200',
    pattern: '[-C{lr}] > [-Co{lr}]',
    description: 'final [l], [r] usually became syllabic',
    url: 'https://eldamo.org/content/words/word-1942165347.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      if (['l', 'r'].includes(lastChar)) {
        const secondLastChar = str.nth(-2);
        if (secondLastChar.isConsonant()) {
          // Only exception:
          if (str === 'ygl') {
            return 'ygil';
          }
          return str.substring(0, str.length - 1) + 'o' + lastChar;
        }
      }
      return str;
    },
  },
  '2569469231': {
    orderId: '07300',
    pattern: '[-vn] > [-von]',
    description: 'final [vn] sometimes became [von]',
    url: 'https://eldamo.org/content/words/word-2569469231.html',
    skip: true,
    info: ['This rule has only Noldorin examples and one Sindarin counter-example.', 'This rule is disabled by default.'],
    mechanic: (str) => {
      if (str.nth(-2, 2) === 'vn') {
        if (str === 'tavn') return str;
        return str.substring(0, str.length - 2) + 'von';
      }
      return str;
    },
  },
  '798091205': {
    orderId: '07400',
    pattern: '[-Cw|-aw] > [-Cu|-au]',
    description: 'final [w] usually became [u]',
    url: 'https://eldamo.org/content/words/word-798091205.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      if (lastChar === 'w') {
        const secondLastChar = str.nth(-2);
        if (secondLastChar.isConsonant() || secondLastChar === 'a') {
          return str.substring(0, str.length - 1) + 'u';
        }
      }
      return str;
    },
  },
  '1254294665': {
    orderId: '07500',
    pattern: '[-rr] > [-r]',
    description: 'final [rr] became [r]',
    url: 'https://eldamo.org/content/words/word-1254294665.html',
    mechanic: (str) => {
      if (str.nth(-2, 2) === 'rr') {
        return str.substring(0, str.length - 1);
      }
      return str;
    },
  },
  '1759587217': {
    orderId: '07600',
    pattern: '[s{pk}] > [s{bg}]',
    description: '[sk], [sp] usually became [sg], [sb]',
    url: 'https://eldamo.org/content/words/word-1759587217.html',
    mechanic: (str) => {
      if (str.includes('sp') || str.includes('sk')) {
        return str.replace('sp', 'sb').replace('sk', 'sg');
      }
      return str;
    },
  },
  '4188321265': {
    orderId: '07700',
    pattern: '[-x-] > [-h-]',
    description: 'medial [x] became [h] in Gondorian pronunciation',
    url: 'https://eldamo.org/content/words/word-4188321265.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str).replace('χ', 'x');
      if (singleCharsStr.includes('x')) {
        const initial = singleCharsStr.nth(0);
        const final = singleCharsStr.nth(-1);
        if (initial === 'x' || final === 'x') return str;
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const result = singleCharsStr.replace('x', 'h');
        if (revert) return singleToDigraphs(result);
        return result;
      }
      return str;
    },
  },
  '132402625': {
    orderId: '07800',
    pattern: '[{vð}{hx}] > [{fθ}]',
    description: 'voiced spirants unvoiced before voiceless spirants',
    url: 'https://eldamo.org/content/words/word-132402625.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const { found, matched, charIndex, nextChar, prevChar } = findFirstOf(['h'], singleCharsStr);
      if (found) {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        if (['v', 'ð'].includes(prevChar)) {
          const result = singleCharsStr
            .replace('vh', 'f')
            .replace('ðh', 'θ');
          if (revert) return singleToDigraphs(result);
          return result;
        }
      }
      return str;
    },
  },
};
