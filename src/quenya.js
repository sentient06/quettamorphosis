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
};
