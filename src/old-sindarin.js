import './utils.js'; // Load String prototype extensions
import {
  recalcMorphemes,
  digraphsToSingle,
  findAllOf,
  SyllableAnalyser,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const oldSindarinRules = {
  '71909447': {
    orderId: '00100',
    pattern: '[-SVi] > [-Sī]',
    description: 'final i-diphthongs became long [ī] in polysyllables',
    url: 'https://eldamo.org/content/words/word-71909447.html',
    mechanic: (str, options = {}) => {
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);
      let result = str;
      const removedIndices = [];
      // 1. It's polysyllable:
      if (syllableData.length > 1) {
        // 2. Ends in -i:
        const lastChar = str.nth(-1);
        if (lastChar === 'i') {
          // 3. Penultimate is a vowel:
          const secondLastChar = str.nth(-2).removeMarks();
          if (secondLastChar.isVowel()) {
            // 4. It's a valid diphthong:
            if (['a', 'e', 'o'].includes(secondLastChar)) {
              result = str.substring(0, str.length - 2) + 'ī';
              removedIndices.push(str.length - 2);
            }
          }
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1989991061': {
    orderId: '00200',
    pattern: '[ŋ-] > [ŋg-]',
    description: 'initial [ŋ] became [ŋg] or [g]',
    url: 'https://eldamo.org/content/words/word-1989991061.html',
    mechanic: (str, options = {}) => {
      // Normalise to NFD for consistent character handling
      const originalStr = str;
      str = str.normaliseToMany();
      const morphemes = options.morphemes?.map(m => m.normaliseToMany());

      if (str.startsWith('ŋ') === false) {
        return { in: originalStr, out: originalStr, morphemes: options.morphemes || [originalStr] };
      }

      const nextChar = str.nth(1);
      const i = nextChar === 'g' ? 2 : 1;
      const result = 'g' + str.substring(i, str.length);
      // Only index 0 is removed when ŋg → g; when ŋ → g it's same-length
      const removedIndices = nextChar === 'g' ? [0] : [];
      const updatedMorphemes = morphemes
        ? recalcMorphemes(result, morphemes, removedIndices).map(m => m.normaliseToOne())
        : [result.normaliseToOne()];
      return { in: originalStr, out: result.normaliseToOne(), morphemes: updatedMorphemes };
    },
  },
  '4282797219': {
    orderId: '00300',
    pattern: '[Vb{bdg}|Vg{bdg}] > [Vu{bdg}|Vi{bdg}]',
    description: 'first in pair of voiced stops vocalized',
    url: 'https://eldamo.org/content/words/word-4282797219.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['bd', 'gd'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'bd': 'ud',
        'gd': 'id',
      }
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { matched, charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '107931923': {
    orderId: '00400',
    pattern: '[ɣ{mnlr}] > [g{mnlr}]',
    description: '[ɣ] became [g] before nasals and liquids',
    url: 'https://eldamo.org/content/words/word-107931923.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ɣ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (nextChar === 'r') {
          result = result.substring(0, charIndex) + 'g' + result.substring(charIndex + 1);
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1117448055': {
    orderId: '00500',
    pattern: '[{ɣh}-] > [ø-]',
    description: 'initial [ɣ]/[h] vanished',
    url: 'https://eldamo.org/content/words/word-1117448055.html',
    mechanic: (str, options = {}) => {
      if (str.startsWith('ɣ') === false && str.startsWith('h') === false)
        return { in: str, out: str, morphemes: options.morphemes };

      const result = str.slice(1);
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [0])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '345959193': {
    orderId: '00600',
    pattern: '[{kkʰg}j-|skj-|ŋgj] > [{kkʰg}-|sk-|ŋg]',
    description: '[j] was lost after initial velars',
    url: 'https://eldamo.org/content/words/word-345959193.html',
    mechanic: (str, options = {}) => {
      // kʰ is already ꝁ (single char), so search for ꝁj (not kʰj)
      const occurrences = findAllOf(['skj', 'ŋgj', 'kj', 'ꝁj', 'gj'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'skj': 'sk',
        'ŋgj': 'ŋg',
        'kj': 'k',
        'ꝁj': 'ꝁ',
        'gj': 'g',
      };

      const removedIndices = [];

      const processMatches = (occ, _res) => {
        let res = _res;
        for (let i = occ.length - 1; i >= 0; i--) {
          const { charIndex, matched } = occ[i];
          res = res.substring(0, charIndex) + replacements[matched] + res.substring(charIndex + matched.length);
          removedIndices.unshift(charIndex);
        }
        return res;
      };

      let result = str;

      const occA = occurrences.filter((o) => ['skj', 'ŋgj'].indexOf(o.matched) > -1);
      result = processMatches(occA, result);

      const occB = findAllOf(['kj', 'ꝁj', 'gj'], result);
      result = processMatches(occB, result);

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '1484184939': {
    orderId: '00700',
    pattern: '[m{jw}|-mw] > [n{jw}|-mm]',
    description: 'medial [m] became [n] before [j], [w]',
    url: 'https://eldamo.org/content/words/word-1484184939.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['m'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (charIndex > 0) {
          if (['j', 'w'].includes(nextChar)) {
            if (charIndex === str.length - 2 && nextChar === 'w') {
              result = result.substring(0, charIndex) + 'mm';
              continue;
            }
            result = result.substring(0, charIndex) + 'n' + result.substring(charIndex + 1);
          }
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '1955360003': {
    orderId: '00800',
    pattern: '[m{lr}-] > [b{lr}-]',
    description: 'initial [ml], [mr] became [bl], [br]',
    url: 'https://eldamo.org/content/words/word-1955360003.html',
    mechanic: (str, options = {}) => {
      if (str.nth(0) === 'm') {
        const nextChar = str.nth(1);
        if (['l', 'r'].includes(nextChar)) {
          const result = 'b' + str.substring(1);
          const morphemes = options.morphemes
            ? recalcMorphemes(result, options.morphemes, [])
            : [str];
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1024355367': {
    orderId: '00900',
    pattern: '[{ṃṇŋ̣}-] > [a{mnŋ}-]',
    description: 'initial syllabic [m], [n], [ŋ] became [am], [an], [aŋ]',
    url: 'https://eldamo.org/content/words/word-1024355367.html',
    mechanic: (str, options = {}) => {
      // Normalise to NFD so syllabic nasals are consistently 2 chars (base + combining dot)
      // ṃ (NFC U+1E43) → m + ̣ (NFD), ṇ (NFC U+1E47) → n + ̣ (NFD), ŋ̣ already 2 chars
      const originalStr = str;
      str = str.normaliseToMany();
      const morphemes = options.morphemes?.map(m => m.normaliseToMany());

      const firstChars = str.nth(0, 2);
      const replacements = {
        'm\u0323': 'am', // ṃ in NFD
        'n\u0323': 'an', // ṇ in NFD
        'ŋ\u0323': 'aŋ', // ŋ̣ in NFD
      };

      if (replacements[firstChars]) {
        const result = replacements[firstChars] + str.substring(2);
        // Same-length replacement (2 chars → 2 chars), so use empty removedIndices
        const updatedMorphemes = morphemes
          ? recalcMorphemes(result, morphemes, []).map(m => m.normaliseToOne())
          : [result.normaliseToOne()];
        return { in: originalStr, out: result.normaliseToOne(), morphemes: updatedMorphemes };
      }
      return { in: originalStr, out: originalStr, morphemes: options.morphemes || [originalStr] };
    },
  },
  '3463937975': {
    orderId: '01000',
    pattern: '[{ptk}{mn}] > [{bdg}{mnŋ}]',
    description: 'voiceless stops were voiced before nasals',
    url: 'https://eldamo.org/content/words/word-3463937975.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['pn', 'tn', 'kn', 'pm', 'tm', 'km'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'pn': 'bn',
        'tn': 'dn',
        'kn': 'gn',
        'pm': 'bm',
        'tm': 'dm',
        'km': 'gm',
      };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { matched, charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3883770909': {
    orderId: '01100',
    pattern: '[{ptk}ʰm] > [{ptk}ʰw]',
    description: '[m] became [w] after aspirates',
    url: 'https://eldamo.org/content/words/word-3883770909.html',
    mechanic: (str, options = {}) => {
      // ŧ=tʰ, ƥ=pʰ, ꝁ=kʰ (single char forms)
      const occurrences = findAllOf(['ŧm', 'ƥm', 'ꝁm'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'ŧm': 'ŧw',
        'ƥm': 'ƥw',
        'ꝁm': 'ꝁw',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { matched, charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1757900715': {
    orderId: '01200',
    pattern: '[tʰn] > [ttʰ]',
    description: '[tʰn] became [ttʰ]',
    url: 'https://eldamo.org/content/words/word-1757900715.html',
    mechanic: (str, options = {}) => {
      // ŧ = tʰ (single char form)
      const occurrences = findAllOf(['ŧn'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'tŧ' + result.substring(charIndex + 2);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1789116309': {
    orderId: '01300',
    pattern: '[-Vd] > [-V̄ø]',
    description: 'final [d] spirantalized and vanished',
    url: 'https://eldamo.org/content/words/word-1789116309.html',
    mechanic: (str, options = {}) => {
      const lastChar = str.nth(-1);
      if (lastChar !== 'd') return { in: str, out: str, morphemes: options.morphemes };

      const penultimateChar = str.nth(-2);
      let result = str;
      const removedIndices = [];
      if (penultimateChar.isVowel()) {
        const longVowel = penultimateChar.addMark('¯');
        result = str.substring(0, str.length - 2) + longVowel;
        removedIndices.push(str.length - 1);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '300026073': {
    orderId: '01400',
    pattern: '[-tʰ] > [-t]',
    description: 'final [tʰ] became [t]',
    url: 'https://eldamo.org/content/words/word-300026073.html',
    mechanic: (str, options = {}) => {
      // ŧ = tʰ (single char form)
      if (str.endsWith('ŧ')) {
        const result = str.substring(0, str.length - 1) + 't';
        const morphemes = options.morphemes
          ? recalcMorphemes(result, options.morphemes, [])
          : [str];
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '3229649933': {
    orderId: '01500',
    pattern: '[-sj-|-sw-] > [-xʲ-|-xʷ-]',
    description: 'medial [sj], [sw] became [xʲ], [xʷ]',
    url: 'https://eldamo.org/content/words/word-3229649933.html',
    mechanic: (str, options = {}) => {
      // ꜧ = xʲ, ƕ = xʷ (single char forms)
      const occurrences = findAllOf(['sj', 'sw'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'sj': 'ꜧ',
        'sw': 'ƕ',
      };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { matched, charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        removedIndices.unshift(charIndex);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '2753394075': {
    orderId: '01600',
    pattern: '[-SV̄] > [-SV̆]',
    description: 'long final vowels were shortened',
    url: 'https://eldamo.org/content/words/word-2753394075.html',
    mechanic: (str, options = {}) => {
      const lastChar = str.nth(-1);
      const mark = lastChar.getMark();
      if (['¯', '´', '^'].includes(mark)) {
        const result = str.substring(0, str.length - 1) + lastChar.removeMarks();
        const morphemes = options.morphemes
          ? recalcMorphemes(result, options.morphemes, [])
          : [str];
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1249932447': {
    orderId: '01700',
    pattern: '[Vzd] > [V̄d]',
    description: '[z] vanished before [d] lengthening preceding vowel',
    url: 'https://eldamo.org/content/words/word-1249932447.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['z'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar, prevChar } = occurrences[i];
        if (nextChar === 'd' && prevChar.isVowel()) {
          result = result.substring(0, charIndex - 1) + prevChar.removeMarks().addMark('¯') + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2107885715': {
    orderId: '01800',
    pattern: '[ṣ-] > [es-]',
    description: 'syllabic initial [s] became [es]',
    url: 'https://eldamo.org/content/words/word-2107885715.html',
    mechanic: (str, options = {}) => {
      const normalised = str.normaliseToMany();
      if (normalised.nth(0, 2) === 's\u0323') {
        const secondChar = normalised.nth(2);
        if (['c', 'k', 'p', 't'].includes(secondChar)) {
          const result = 'es' + normalised.substring(2);
          const normalisedMorphemesIn = (options.morphemes || []).map(m => m.normaliseToMany());
          const morphemes = options.morphemes
            ? recalcMorphemes(result, normalisedMorphemesIn, [])
            : [str];
          const normalisedMorphemesOut = morphemes.map(m => m.normaliseToOne());
          return { in: str, out: result.normaliseToOne(), morphemes: normalisedMorphemesOut };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '3923357111': {
    orderId: '01900',
    pattern: '[s{jwmnrl}-] > [{j̊w̥m̥n̥l̥r̥}-]',
    description: 'initial [s] unvoiced following consonants',
    url: 'https://eldamo.org/content/words/word-3923357111.html',
    mechanic: (str, options = {}) => {
      const firstChar = str.nth(0);
      if (firstChar !== 's') return { in: str, out: str, morphemes: options.morphemes };

      const secondChar = str.nth(1);
      const replacements = {
        'j': 'j̊',
        'w': 'ƕ',
        'm': 'ᵯ',
        'n': 'ꞃ',
        'l': 'ꝉ',
        'r': 'ꞧ',
      };
      const validNext = Object.keys(replacements);

      if (validNext.includes(secondChar)) {
        const result = replacements[secondChar] + str.substring(2);
        const morphemes = options.morphemes
          ? recalcMorphemes(result, options.morphemes, [0])
          : [str];
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1763851339': {
    orderId: '02000',
    pattern: '[-se|-ste|-sse] > [-sa|-sta|-sse]',
    description: 'final [e] became [a] after single [s] and [st]',
    url: 'https://eldamo.org/content/words/word-1763851339.html',
    skip: true,
    info: ['This rule is skipped by default because evidence for it is rather shaky.'],
    mechanic: (str, options = {}) => {
      const lastChar = str.nth(-1);
      if (lastChar === 'e') {
        const secondLastChar = str.nth(-2);
        const thirdLastChar = str.nth(-3);
        if (thirdLastChar === 's') {
          if (secondLastChar === 't') {
            const result = str.substring(0, str.length - 1) + 'a';
            const morphemes = options.morphemes
              ? recalcMorphemes(result, options.morphemes, [])
              : [str];
            return { in: str, out: result, morphemes };
          }
          if (secondLastChar === 's') {
            return { in: str, out: str, morphemes: options.morphemes };
          }
        }
        // This is not attested and it's basically guessing:
        if (thirdLastChar === 't' && secondLastChar === 's') {
          return { in: str, out: str, morphemes: options.morphemes };
        }
        // - - - - - - - - - - - - - - - - - - - - - - - - - -
        if (secondLastChar === 's') {
          const result = str.substring(0, str.length - 1) + 'a';
          const morphemes = options.morphemes
            ? recalcMorphemes(result, options.morphemes, [])
            : [str];
          return { in: str, out: result, morphemes };
        }
        if (thirdLastChar === 'r' && secondLastChar === 't') {
          const result = str.substring(0, str.length - 1) + 'a';
          const morphemes = options.morphemes
            ? recalcMorphemes(result, options.morphemes, [])
            : [str];
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '798037075': {
    orderId: '02100',
    pattern: '[s{ptk}-] > [s{ɸθx}-]',
    description: 'voiceless stops became spirants after initial [s]',
    url: 'https://eldamo.org/content/words/word-798037075.html',
    mechanic: (str, options = {}) => {
      const firstChar = str.nth(0);
      if (firstChar === 's') {
        const secondChar = str.nth(1);
        const replacements = { 'p': 'ɸ', 't': 'θ', 'k': 'x' };
        if (replacements[secondChar]) {
          const result = 's' + replacements[secondChar] + str.substring(2);
          const morphemes = options.morphemes
            ? recalcMorphemes(result, options.morphemes, [])
            : [str];
          return { in: str, out: result, morphemes };
        }
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1683955225': {
    orderId: '02200',
    pattern: '[{ptkmnŋlr}{ptk}] > [{ptkmnŋlr}{ptk}ʰ]',
    description: 'voiceless stops aspirated after consonants except [s]',
    url: 'https://eldamo.org/content/words/word-1683955225.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['p', 't', 'k', 'c'], str);
      if (occurrences.length > 0) {
        const validConsonants = ['r', 'l', 'm', 'n', 'ŋ', 'd', 'b', 'g', 'p', 't', 'k', 'c', 'x'];
        const results = [];
        for (const occurrence of occurrences) {
          const { charIndex, prevChar } = occurrence;
          if (validConsonants.includes(prevChar)) {
            results.push(charIndex);
          }
        }
        let result = str;
        for (const charIndex of results) {
          const mutatedChar = digraphsToSingle(result.nth(charIndex) + 'ʰ');
          result = result.substring(0, charIndex) + mutatedChar + result.substring(charIndex + 1);
        }
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '883570327': {
    orderId: '02300',
    pattern: '[{ptk}ʰ|{ptk}{ptk}ʰ] > [{ɸθx}|{ɸθx}{ɸθx}]',
    description: 'aspirates became voiceless spirants',
    url: 'https://eldamo.org/content/words/word-883570327.html',
    mechanic: (str, options = {}) => {
      // ƥ=pʰ, ŧ=tʰ, ꝁ=kʰ (single char forms for aspirated stops)

      const occurrences = findAllOf(['ƥ', 'ŧ', 'ꝁ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const dualReplacements = {
        'pƥ': 'ɸɸ',
        'pŧ': 'ɸθ',
        'tŧ': 'θθ',
        'tꝁ': 'xx',
        'kŧ': 'xθ',
        'kꝁ': 'xx',
      };
      const singleReplacements = {
        'ƥ': 'ɸ',
        'ŧ': 'θ',
        'ꝁ': 'x',
      };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];

        const sequence = `${prevChar}${matched}`;
        let replacer = null;
        let startingPoint = 0;

        if (dualReplacements[sequence]) {
          replacer = dualReplacements[sequence];
          startingPoint = charIndex - 1;
        } else
        if (singleReplacements[matched]) {
          replacer = singleReplacements[matched];
          startingPoint = charIndex;
        }

        result = result.substring(0, startingPoint) + replacer + result.substring(startingPoint + replacer.length);

      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2662025405': {
    orderId: '02400',
    pattern: '[eu] > [iu]',
    description: '[eu] became [iu]',
    url: 'https://eldamo.org/content/words/word-2662025405.html',
    mechanic: (str, options = {}) => {
      if (str.includes('eu')) {
        const result = str.replaceAll('eu', 'iu');
        const morphemes = options.morphemes
          ? recalcMorphemes(result, options.morphemes, [])
          : [str];
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '2858643115': {
    orderId: '02500',
    pattern: '[ā|au] > [ǭ]',
    description: '[ā], [au] became [ǭ]',
    url: 'https://eldamo.org/content/words/word-2858643115.html',
    mechanic: (str, options = {}) => {
      // Normalise to NFD so marked vowels are consistently 2 chars (base + combining mark)
      // ā (NFC U+0101) → a + ̄ (NFD), á (NFC U+00E1) → a + ́ (NFD), â → a + ̂, au = 2 chars
      // Output ǭ in NFD = o + combining ogonek + combining macron = 3 chars (adds 1 char!)
      const originalStr = str;
      str = str.normaliseToMany();
      const morphemes = options.morphemes?.map(m => m.normaliseToMany());

      // In NFD: ā = a\u0304, á = a\u0301, â = a\u0302, au = au
      const occurrences = findAllOf(['a\u0304', 'a\u0301', 'a\u0302', 'au'], str);
      if (occurrences.length === 0) {
        return { in: originalStr, out: originalStr, morphemes: options.morphemes || [originalStr] };
      }

      let result = str;
      // ǭ in NFD = o + combining ogonek + combining macron (3 chars)
      const replacement = 'ǭ'.normaliseToMany();
      // Track indices where we INSERT a character (each replacement adds 1 char)
      const insertedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacement + result.substring(charIndex + matched.length);
        // Each 2-char match becomes 3-char replacement, inserting at charIndex
        insertedIndices.unshift(charIndex);
      }

      // Handle morphemes with length-increasing replacement
      let updatedMorphemes;
      if (morphemes) {
        let originalPos = 0;
        let resultPos = 0;
        updatedMorphemes = morphemes.map((m) => {
          const morphemeEnd = originalPos + m.length;
          // Count inserted chars in this morpheme's range
          const inserted = insertedIndices.filter(
            idx => idx >= originalPos && idx < morphemeEnd
          ).length;
          const newLength = m.length + inserted;
          const newMorpheme = result.substring(resultPos, resultPos + newLength);
          originalPos = morphemeEnd;
          resultPos += newLength;
          return newMorpheme.normaliseToOne();
        });
      } else {
        updatedMorphemes = [result.normaliseToOne()];
      }
      return { in: originalStr, out: result.normaliseToOne(), morphemes: updatedMorphemes };
    },
  },
  '161840619': {
    orderId: '02600',
    pattern: '[VjV|-Vj] > [ViV|-Vi]',
    description: '[j] became [i] after vowels',
    url: 'https://eldamo.org/content/words/word-161840619.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['j'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (nextChar) {
          if (prevChar.isVowel() && nextChar.isVowel()) {
            result = result.substring(0, charIndex) + 'i' + result.substring(charIndex + 1);
          }
        }

        if (prevChar.isVowel()) {
          const mark = prevChar.getMark();
          if (mark === '¯') {
            result = result.substring(0, charIndex - 1) + prevChar.removeMarks() + result.substring(charIndex);
          }
        }

        if (prevChar.isVowel() && charIndex === str.length - 1) {
          result = result.substring(0, charIndex) + 'i';
        }
        // There should be only one, because 'ii' wouldn't survive this far.
        // If there is an 'ii' from this rule, it would be one per loop, so we're safe.
        if (result.indexOf('ii') !== -1) {
          result = result.replace('ii', 'ī');
          removedIndices.unshift(charIndex + 1);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1942848653': {
    orderId: '02700',
    pattern: '[ei|ou] > [ī|ū]',
    description: '[ei], [ou] became [ī], [ū]',
    url: 'https://eldamo.org/content/words/word-1942848653.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ei', 'ou'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const replacements = {
        'ei': 'ī',
        'ou': 'ū',
      };
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { matched, charIndex, nextChar } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        removedIndices.unshift(charIndex + 1);
        if (nextChar) {
          if (nextChar.isVowel()) {
            const hasMark = nextChar.getMark();
            if (hasMark) {
              result = result.substring(0, result.length - 1) + nextChar.removeMarks();
            }
          }
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2010669085': {
    orderId: '02800',
    pattern: '[oi|ǭi] > [ui|oi]',
    description: '[oi], [ǭi] became [ui], [oi]',
    url: 'https://eldamo.org/content/words/word-2010669085.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['oi', 'ǭi'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'oi': 'ui',
          'ǭi': 'oi',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1716741635': {
    orderId: '02900',
    pattern: '[-{sm|sn}-] > [-{mm|nn}-]',
    description: 'medial [s] assimilated to following nasal',
    url: 'https://eldamo.org/content/words/word-1716741635.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['sm', 'sn'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'sm': 'mm',
          'sn': 'nn',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex, nextChar } = occurrence;
          if (charIndex === 0 || nextChar === '') continue;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '3388236413': {
    orderId: '03000',
    pattern: '[VsV|-Vs] > [VhV|-Vh]',
    description: 'intervocalic [s] became [h]',
    url: 'https://eldamo.org/content/words/word-3388236413.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['s'], str);
      if (occurrences.length > 0) {
        let result = str;
        for (const occurrence of occurrences) {
          const { charIndex, prevChar, nextChar } = occurrence;
          if (charIndex === 0 || nextChar === '') continue;
          if (prevChar.isVowel() && nextChar.isVowel()) {
            result = result.substring(0, charIndex) + 'h' + result.substring(charIndex + 1);
          }
        }
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1516403107': {
    orderId: '03100',
    pattern: '[ps|ts|ks] > [ɸɸ|θθ|xx]',
    description: '[p], [t], [k] spirantalized before [s]',
    url: 'https://eldamo.org/content/words/word-1516403107.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ps', 'ts', 'ks'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'ps': 'ɸɸ',
          'ts': 'θθ',
          'ks': 'xx',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1288402337': {
    orderId: '03200',
    pattern: '[rl] > [ll]',
    description: '[rl] became [ll]',
    url: 'https://eldamo.org/content/words/word-1288402337.html',
    skip: true,
    info: ['This was not true of later or reformed compounds.', 'This rule is skipped by default.'],
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['rl'], str);
      if (occurrences.length > 0) {
        let result = str;
        for (const occurrence of occurrences) {
          const { charIndex } = occurrence;
          result = result.substring(0, charIndex) + 'll' + result.substring(charIndex + 2);
        }
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '2851583127': {
    orderId: '03300',
    pattern: '[{ji|jui}-] > [{i|ui}-]',
    description: '[j] vanished before [i], [ui]',
    url: 'https://eldamo.org/content/words/word-2851583127.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ji', 'jui'], str);
      if (occurrences.length === 0)
        return { in: str, out: str, morphemes: options.morphemes };
      
      const replacements = {
        'ji': 'i',
        'jui': 'ui',
      };
      let result = str;
      const removedIndices = [];
      for (const occurrence of occurrences) {
        const { matched, charIndex } = occurrence;
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + matched.length);
        removedIndices.unshift(charIndex);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2167009353': {
    orderId: '03400',
    pattern: '[{uw|wu}] > [u]',
    description: '[w] vanished before [u]',
    url: 'https://eldamo.org/content/words/word-2167009353.html',
    mechanic: (str, options = {}) => {
      const unmarkedStr = str.removeMarks();
      const occurrences = findAllOf(['uw', 'wu'], unmarkedStr);
      if (occurrences.length === 0)
        return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'uw': 'u',
        'wu': 'u',
      };
      let result = str;
      const removedIndices = [];
      for (const occurrence of occurrences) {
        const { matched, charIndex } = occurrence;
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + matched.length);
        removedIndices.unshift(charIndex + 1);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2615312913': {
    orderId: '03500',
    pattern: '[bm|dn] > [mm|nn]',
    description: '[bm], [dn] became [mm], [nn]',
    url: 'https://eldamo.org/content/words/word-2615312913.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['bm', 'dn'], str);
      if (occurrences.length === 0)
        return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'bm': 'mm',
        'dn': 'nn',
      };
      let result = str;
      for (const occurrence of occurrences) {
        const { matched, charIndex } = occurrence;
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
};
