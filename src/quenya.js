import './utils.js'; // Load String prototype extensions
import {
  recalcMorphemes,
  findAllOf,
  SyllableAnalyser,
  QUENYA_PROFILE,
  findFirstOf,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const quenyaRules = {
  '1197128543': {
    orderId: '00100',
    pattern: '[nm|ŋm] > [nw|ŋgw]',
    description: '[nm], [ŋm] became [nw], [ŋgw]',
    url: 'https://eldamo.org/content/words/word-1197128543.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['nm', 'ŋm'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };
      let result = str;
      const replacements = {
        'nm': 'nw',
        'ŋm': 'ŋgw',
      };
      const addedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        if (replacements[matched].length > matched.length) {
          addedIndices.push(charIndex + 1);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [], addedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2035963219': {
    orderId: '00200',
    pattern: '[{iu}ŋn] > [V̄øn]',
    description: '[ŋ] vanished between [i], [u] and [n] with compensatory lengthening',
    url: 'https://eldamo.org/content/words/word-2035963219.html',
    input: [
      {
        name: 'includeA',
        label: 'Include [a] in the pattern',
        type: 'boolean',
        default: false,
        description: 'Include [a] in the pattern',
      },
      {
        name: 'includeE',
        label: 'Include [e] in the pattern',
        type: 'boolean',
        default: false,
        description: 'Include [e] in the pattern',
      },
      {
        name: 'includeO',
        label: 'Include [o] in the pattern',
        type: 'boolean',
        default: false,
        description: 'Include [o] in the pattern',
      },
      {
        name: 'includeM',
        label: 'Include [m] in the pattern',
        type: 'boolean',
        default: false,
        description: 'Include [m] in the pattern',
      },
    ],
    mechanic: (str, options = {
      includeA: false,
      includeE: false,
      includeO: false,
      includeM: false,
    }) => {
      const _str = str.normaliseToOne();
      const occurrences = findAllOf(['ŋ'], _str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const validPrevious = ['i', 'u'];
      if (options.includeA) validPrevious.push('a');
      if (options.includeE) validPrevious.push('e');
      if (options.includeO) validPrevious.push('o');

      const validNext = ['n'];
      if (options.includeM) validNext.push('m');

      let result = _str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        const _prevChar = prevChar.removeMarks();
        if (validPrevious.includes(_prevChar) && validNext.includes(nextChar)) {
          result = result.substring(0, charIndex - 1) + prevChar.addMark('¯') + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '447633467': {
    orderId: '00300',
    pattern: '[-{nŋlr}ŋ-] > [-{nŋlr}g-]',
    description: 'medial [ŋ] after a [n], [ŋ], [l], [r] became [g]',
    url: 'https://eldamo.org/content/words/word-447633467.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ŋ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };
      const validPrevious = ['n', 'ŋ', 'l', 'r'];
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        if (validPrevious.includes(prevChar)) {
          result = result.substring(0, charIndex) + 'g' + result.substring(charIndex + 1);
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2315722009': {
    orderId: '00400',
    pattern: '[ei|ou] > [ī|ū]',
    description: '[ei], [ou] generally became [ī], [ū]',
    url: 'https://eldamo.org/content/words/word-2315722009.html',
    mechanic: (str, options = {}) => {
      // ei > ī
      // ou > ū
      // but
      // ei > ē after y
      // ou > ō after w
      const occurrences = findAllOf(['ei', 'ou'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'ei': 'ī',
        'ou': 'ū',
      };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        if (prevChar === 'j' && matched === 'ei') {
          result = result.substring(0, charIndex) + 'ē' + result.substring(charIndex + 2);
        } else
        if (prevChar === 'w' && matched === 'ou') {
          result = result.substring(0, charIndex) + 'ō' + result.substring(charIndex + 2);
        } else {
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        removedIndices.push(charIndex + 1);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1167483479': {
    orderId: '00500',
    pattern: '[ji|wu] > [i|u]',
    description: '[ji], [wu] became [i], [u]',
    url: 'https://eldamo.org/content/words/word-1167483479.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ji', 'wu'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + matched[1] + result.substring(charIndex + 2);
        removedIndices.push(charIndex + 1);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3458631869': {
    orderId: '00600',
    pattern: '[V̄jV] > [VijV]',
    description: 'intervocalic [j] diphthongized after long vowel',
    url: 'https://eldamo.org/content/words/word-3458631869.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['j'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const addedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (prevChar.isVowel() && nextChar.isVowel()) {
          const longVowel = prevChar.getMark() === '¯';
          if (longVowel) {
            const prevVowel = prevChar.removeMarks();
            result = result.substring(0, charIndex - 1) + prevVowel + 'i' + result.substring(charIndex);
            addedIndices.push(charIndex);
          }
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [], addedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3516399115': {
    orderId: '00700',
    pattern: '[{rl}{ɸθxð}] > [{rl}{ptkd}]',
    description: 'spirants became stops after [r], [l]',
    url: 'https://eldamo.org/content/words/word-3516399115.html',
    mechanic: (str, options = {}) => {
      const replacements = {
        'lx': 'lk',
        'lð': 'ld',
        'lβ': 'lb',
        'rx': 'rk',
        'rɸ': 'rp',
        'rθ': 'rt',
      };
      const occurrences = findAllOf(Object.keys(replacements), str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '545708645': {
    orderId: '00800',
    pattern: '[mɸ|nθ|ŋx|nð] > [mp|nt|ŋk|nd]',
    description: 'spirants became stops after nasals',
    url: 'https://eldamo.org/content/words/word-545708645.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['mɸ', 'nθ', 'ŋx', 'nð'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };
      const replacements = {
        'mɸ': 'mp',
        'nθ': 'nt',
        'ŋx': 'ŋk',
        'nð': 'nd',
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
    },
  },
  '1082322649': {
    orderId: '00900',
    pattern: '[wo-] > [o-]',
    description: '[wo] became [o]',
    url: 'https://eldamo.org/content/words/word-1082322649.html',
    info: ['The exact conditions under which this change occurred are unclear.', 'This rule is disabled by default.'],
    skip: true,
    input: [
      {
        name: 'replaceAll',
        label: 'Replace [wo] in any position',
        type: 'boolean',
        default: false,
        description: 'Replace [wo] in any position, not just initially.',
      },
    ],
    mechanic: (str, options = { replaceAll: false }) => {
      const occurrences = findAllOf(['wo'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        if (options.replaceAll || charIndex === 0) {
          result = result.substring(0, charIndex) + 'o' + result.substring(charIndex + 2);
          removedIndices.push(charIndex);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3625908403': {
    orderId: '01000',
    pattern: '[w-|VwV|aiw] > [β-|VβV|aiw]',
    description: '[w] became [β] initially and between vowels',
    url: 'https://eldamo.org/content/words/word-3625908403.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['w'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (prevChar.isVowel() && nextChar.isVowel()) {
          const anterior = result.nth(charIndex - 2);
          if (anterior === 'a' && prevChar === 'i') continue;
          result = result.substring(0, charIndex) + 'β' + result.substring(charIndex + 1);
        } else
        if (charIndex === 0) {
          result = 'β' + result.substring(1);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1833409085': {
    orderId: '01100',
    pattern: '[ɣ] > [ø]',
    description: '[ɣ] from [g] vanished',
    url: 'https://eldamo.org/content/words/word-1833409085.html',
    dependsOn: [{ rule: '1141570065', param: 'gBecameSpirantal' }],
    mechanic: (str, options = { gBecameSpirantal: false }) => {
      const occurrences = findAllOf(['ɣ'], str);
      if (options.gBecameSpirantal === false || occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str.normaliseToOne();
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (prevChar.isVowel() && nextChar.isVowel()) {
          const prevLong = prevChar.getMark() === '¯';
          const nextLong = nextChar.getMark() === '¯';

          // Combined vowels:
          if (!prevLong && !nextLong && prevChar === nextChar) {
            result = result.substring(0, charIndex - 1) + prevChar.addMark('¯') + result.substring(charIndex + 1);
            removedIndices.push(charIndex, charIndex + 1);
            continue;
          }

          // Diphthongs:
          const { diphthongs } = QUENYA_PROFILE;
          const combo = prevChar.removeMarks() + nextChar.removeMarks();

          if (diphthongs.includes(combo)) {
            result = result.substring(0, charIndex - 1) + combo + result.substring(charIndex + 2);
            removedIndices.push(charIndex, charIndex + 1);
            continue;
          }
        }
        result = result.substring(0, charIndex) + result.substring(charIndex + 1);
        removedIndices.push(charIndex);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1132141441': {
    orderId: '01200',
    pattern: '[ae|ao|ā{ĕŏ}] > [ē|ō|ā]',
    description: '[ae], [ao] generally became [ē], [ō]',
    url: 'https://eldamo.org/content/words/word-1132141441.html',
    mechanic: (str, options = {}) => {
      const _str = str.normaliseToOne();
      const occurrences = findAllOf(['a', 'ā'], _str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar, nextChar } = occurrences[i];
        if (nextChar.isVowel() === false) continue;
        const vowel = nextChar.removeMarks();
        if (['e', 'o'].includes(vowel)) {
          const charLong = matched.getMark() === '¯';
          const nextLong = nextChar.getMark() === '¯';
          if (nextLong) continue;
          if (charLong) {
            result = result.substring(0, charIndex) + 'ā' + result.substring(charIndex + 2);
          } else {
            result = result.substring(0, charIndex) + nextChar.addMark('¯') + result.substring(charIndex + 2);
          }
          removedIndices.push(charIndex);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1102872571': {
    orderId: '01300',
    pattern: '[ɸu] > [hu]',
    description: '[ɸu] became [hu]',
    url: 'https://eldamo.org/content/words/word-1102872571.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ɸu'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'hu' + result.substring(charIndex + 2);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1771463731': {
    orderId: '01400',
    pattern: '[Vβu] > [Vu]',
    description: '[β] vanished before [u] after vowels',
    url: 'https://eldamo.org/content/words/word-1771463731.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['β'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (prevChar.isVowel() && nextChar === 'u') {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.push(charIndex);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
};
