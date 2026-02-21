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
  ANCIENT_TELERIN_PROFILE,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const ancientTelerinRules = {
  '3648128347': {
    orderId: '00100',
    pattern: '[{ptkpʰkʰbdgm}V₁{rl}V́₁-] > [{ptkpʰkʰbdgm}ø{rl}V́₁-]',
    description: 'unstressed initial syllables reduced to favored clusters',
    url: 'https://eldamo.org/content/words/word-3648128347.html',
    mechanic: (str) => {
      const analyser = new SyllableAnalyser({ profile: ANCIENT_TELERIN_PROFILE });
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
      // Stressed syllables in Old Telerin use the accute mark.
      // We can't apply Sindarin rules. So we skip this check.
      if (firstSyllable.stressed) return str;

      // The second syllable is long and stressed. (Maybe.)
      // if (secondSyllable.weight !== 'heavy' || secondSyllable.stressed !== true) return str;

      const result = [];
      result.push(firstSyllable.syllable.replace(firstSyllable.nucleus, ''));
      // Remove only the stress mark (acute), but keep the length mark (macron)
      const nucleusWithoutStress = secondSyllable.nucleus.normaliseToMany()
        .replace(/\u0301/g, '')  // Remove combining acute (stress mark)
        .normaliseToOne();
      result.push(secondSyllable.syllable.replace(secondSyllable.nucleus, nucleusWithoutStress));
      result.push(...syllableData.slice(2).map(s => s.syllable));

      const joinedResult = result.join('');

      const newSyllables = analyser.analyse(joinedResult);
      // console.log({ newSyllables, joinedResult, a: joinedResult.removeMarks() });
      if (newSyllables.length === 1) return joinedResult
        .replace(/[\u0301]/g, '\u0304')  // acute → macron
        .normaliseToOne();

      return joinedResult;

      // const normalizedResult = joinedResult.normaliseToMany()
        // .replace(/[\u0301\u0302]/g, '\u0304')  // acute/circumflex → macron
        // .normaliseToOne();
      // return normalizedResult;
    },
  },
  '171120983': {
    orderId: '00200',
    pattern: '[kw|kʰw|gw|ŋgw|ŋkw|ŋw-] > [p|pʰ|b|mb|mp|m-]',
    description: 'labialized velars became labials',
    url: 'https://eldamo.org/content/words/word-171120983.html',
    mechanic: (str) => {
      const { found, matched, charIndex } = findFirstOf(['ŋgw', 'ŋkw', 'kw', 'ꝁw', 'gw', 'ŋw'], str);

      if (found) {
        const replacements = {
          'ŋgw': 'mb',
          'ŋkw': 'mp',
          'kw': 'p',
          'ꝁw': 'ƥ',
          'gw': 'b',
          'ŋw': 'm',
        };
        if (matched === 'ŋw' && charIndex > 0) return str;

        let result = str;
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + matched.length);

        // No idea how the ṃ happens, but I'm assuming it occurs when it's followed by a consonant.
        if (result.nth(0) === 'm' && result.nth(1).isConsonant()) {
          result = 'ṃ' + result.substring(1);
        }
        return result;
      }
      return str;
    },
  },
  '1532676669': {
    orderId: '00300',
    pattern: '[{ttʰdnl}j-] > [{ttʰdnl}-]',
    description: '[j] was lost after initial dentals',
    url: 'https://eldamo.org/content/words/word-1532676669.html',
    skip: true,
    mechanic: (str) => {
      if (['t', 'ŧ', 'd', 'n', 'l'].includes(str.nth(0))) {
        if (str.nth(1) === 'j') {
          return str.replace('j', '');
        }
        if (str.nth(1) === 'y') {
          return str.replace('y', '');
        }
      }
      return str;
    },
  },
  '1062284643': {
    orderId: '00400',
    pattern: '[ln] > [ll]',
    description: '[ln] became [ll]',
    url: 'https://eldamo.org/content/words/word-1062284643.html',
    mechanic: (str) => {
      if (str.includes('ln')) {
        return str.replace('ln', 'll');
      }
      return str;
    },
  },
  '981459769': {
    orderId: '00500',
    pattern: '[-SV{ptks}] > [-SVø]',
    description: 'final voiceless stops and [s] vanished in polysyllables',
    url: 'https://eldamo.org/content/words/word-981459769.html',
    mechanic: (str) => {
      if (['p', 't', 'k', 's'].includes(str.nth(-1))) {
        return str.slice(0, -1);
      }
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
