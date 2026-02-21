import './utils.js'; // Load String prototype extensions
import {
  syllabify,
  breakIntoVowelsAndConsonants,
  removeDigraphs,
  restoreDigraphs,
  digraphsToSingle,
  findFirstOf,
  findAllOf,
  SyllableAnalyser,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const ancientTelerinRules = {
  '3648128347': {
    orderId: '00100',
    pattern: '[{ptkpʰkʰbdgm}V₁{rl}V́₁-] > [{ptkpʰkʰbdgm}ø{rl}V́₁-]',
    description: 'unstressed initial syllables reduced to favored clusters',
    url: 'https://eldamo.org/content/words/word-3648128347.html',
    mechanic: (str) => {
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);

      if (syllableData.length < 2) return str;

      const firstSyllable = syllableData[0];
      const secondSyllable = syllableData[1];

      // Both syllables have vowels of the same quality.
      const quality1 = firstSyllable.nucleus.removeMarks();
      const quality2 = secondSyllable.nucleus.removeMarks();
      if (quality1 !== quality2) return str;

      // The second syllable begins with r or l.
      const secondSyllableStart = secondSyllable.syllable.nth(0);
      if (!['r', 'l'].includes(secondSyllableStart)) return str;

      // The initial syllable begins with a stop, aspirate or (possibly) a nasal.
      const firstSyllableStart = firstSyllable.syllable.nth(0);
      if (!'ptkƥꝁbdgm'.includes(firstSyllableStart)) return str;

      // The first syllable is unstressed.
      // There's no way of telling which syllable is stressed in ancient Telerin.
      // And we can't apply Sindarin rules. So we skip this check.
      // if (firstSyllable.stressed) return str;

      // The second syllable is long and stressed. (Maybe.)
      // if (secondSyllable.weight !== 'heavy' || secondSyllable.stressed !== true) return str;

      const result = [];
      result.push(firstSyllable.syllable.replace(firstSyllable.nucleus, ''));
      result.push(secondSyllable.syllable.replace(secondSyllable.nucleus, secondSyllable.nucleus.removeMarks()));
      result.push(...syllableData.slice(2).map(s => s.syllable));

      const joinedResult = result.join('');
      const normalizedResult = joinedResult.normaliseToMany()
        .replace(/[\u0301\u0302]/g, '\u0304')  // acute/circumflex → macron
        .normaliseToOne();
      return normalizedResult;
    },
  },
  '171120983': {
    orderId: '00200',
    pattern: '[kw|kʰw|gw|ŋgw|ŋkw|ŋw-] > [p|pʰ|b|mb|mp|m-]',
    description: 'labialized velars became labials',
    url: 'https://eldamo.org/content/words/word-171120983.html',
    mechanic: (str) => {
      return str;
    },
  },
  'b': {
    orderId: '00300',
    pattern: '[{ttʰdnl}j-] > [{ttʰdnl}-]',
    description: '[j] was lost after initial dentals',
    url: 'https://eldamo.org/content/words/word-b.html',
    mechanic: (str) => {
      return str;
    },
  },
  'c': {
    orderId: '00400',
    pattern: '[ln] > [ll]',
    description: '[ln] became [ll]',
    url: 'https://eldamo.org/content/words/word-c.html',
    mechanic: (str) => {
      return str;
    },
  },
  'd': {
    orderId: '00500',
    pattern: '[-SV{ptks}] > [-SVø]',
    description: 'final voiceless stops and [s] vanished in polysyllables',
    url: 'https://eldamo.org/content/words/word-d.html',
    mechanic: (str) => {
      return str;
    },
  },
  'e': {
    orderId: '00600',
    pattern: '[{mn}s] > [ss]',
    description: '[ms], [ns] became [ss]',
    url: 'https://eldamo.org/content/words/word-e.html',
    mechanic: (str) => {
      return str;
    },
  },
};
