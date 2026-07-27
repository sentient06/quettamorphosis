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
};
