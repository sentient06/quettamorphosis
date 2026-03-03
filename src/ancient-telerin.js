import './utils.js'; // Load String prototype extensions
import {
  recalcMorphemes,
  findAllOf,
  SyllableAnalyser,
  ANCIENT_TELERIN_PROFILE,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const ancientTelerinRules = {
  '3648128347': {
    orderId: '00100',
    pattern: '[{ptkpʰkʰbdgm}V₁{rl}V́₁-] > [{ptkpʰkʰbdgm}ø{rl}V́₁-]',
    description: 'unstressed initial syllables reduced to favoured clusters',
    url: 'https://eldamo.org/content/words/word-3648128347.html',
    info: ['You may need to use an accute mark (´) to indicate stress.'],
    input: [
      {
        name: 'guessStress',
        label: 'Guess stress',
        type: 'boolean',
        default: false,
        description: 'Guess the stress if there is no marker',
      },
    ],
    mechanic: (str, { guessStress = false, morphemes } = {}) => {
      // Both syllables have vowels of the same quality.
      // The second syllable begins with r or l.
      // The initial syllable begins with a stop, aspirate or (possibly) a nasal [see below on nasals].
      // The first syllable is unstressed.
      // The second syllable is long and stressed [this last item may not be required; see next].

      const analyser = new SyllableAnalyser({ profile: ANCIENT_TELERIN_PROFILE });
      const syllableData = analyser.analyse(str);

      if (syllableData.length < 2) return { in: str, out: str, morphemes };

      const firstSyllable = syllableData[0];
      const secondSyllable = syllableData[1];

      // Both syllables have vowels of the same quality.
      const quality1 = firstSyllable.nucleus.removeMarks();
      const quality2 = secondSyllable.nucleus.removeMarks();
      if (quality1 !== quality2) return { in: str, out: str, morphemes };

      // The second syllable begins with r or l.
      const secondSyllableStart = secondSyllable.syllable.nth(0);
      if (!['r', 'l'].includes(secondSyllableStart)) return { in: str, out: str, morphemes };

      // The initial syllable begins with a stop, aspirate or (possibly) a nasal.
      const firstSyllableStart = firstSyllable.syllable.nth(0);
      if (!'ptkƥꝁbdgm'.includes(firstSyllableStart)) return { in: str, out: str, morphemes };

      // -> There are no other characters between the beginning of the word and the nucleus:
      const indexOfNucleus = firstSyllable.syllable.indexOf(firstSyllable.nucleus);
      const charsBeforeVowel = firstSyllable.syllable.removeMarks().slice(0, indexOfNucleus);
      const unexpectedChars = /[^rlptkƥꝁbdgmaeiou]/.test(charsBeforeVowel);
      if (unexpectedChars) return { in: str, out: str, morphemes };

      // -> Ignore mb:
      // if (firstSyllableStart === 'm' && firstSyllable.syllable.nth(1) === 'b') return str;

      // The first syllable is unstressed (no explicit stress mark).
      let firstSyllableStressed = analyser.hasStressMark(firstSyllable.syllable);

      // The second syllable is stressed (has explicit stress mark).
      let secondSyllableStressed = analyser.hasStressMark(secondSyllable.syllable);

      if (guessStress) {
        if (firstSyllableStressed === false) firstSyllableStressed = firstSyllable.stressed;
        if (secondSyllableStressed === false) secondSyllableStressed = secondSyllable.stressed;
      }

      if (firstSyllableStressed === true) return { in: str, out: str, morphemes };
      if (secondSyllableStressed === false) return { in: str, out: str, morphemes };

      const result = [];
      const removedIndices = [indexOfNucleus];
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
      if (newSyllables.length === 1) {
        const finalResult = joinedResult
          .replace(/[\u0301]/g, '\u0304')  // acute → macron
          .normaliseToOne();
        return { in: str, out: finalResult, morphemes };
      }

      const updatedMorphemes = (joinedResult !== str && morphemes)
        ? recalcMorphemes(joinedResult, morphemes, removedIndices)
        : (morphemes || [str]);

      return { in: str, out: joinedResult, morphemes: updatedMorphemes };

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
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ŋgw', 'ŋkw', 'kw', 'ꝁw', 'gw', 'ŋw'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'ŋgw': 'mb',
        'ŋkw': 'mp',
        'kw': 'p',
        'ꝁw': 'ƥ',
        'gw': 'b',
        'ŋw': 'm',
      };

      let result = str;
      const removedIndices = [];
      const hasNgw = occurrences.some((o) => o.matched === 'ŋgw');
      const hasNkw = occurrences.some((o) => o.matched === 'ŋkw');
      const filteredOccurrences = occurrences.filter((o) => {
        if (o.matched === 'gw' || o.matched === 'kw') {
          if (o.matched === 'gw' && hasNgw) return false;
          if (o.matched === 'kw' && hasNkw) return false;
        }
        return true;
      });

      for (let i = filteredOccurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = filteredOccurrences[i];
        if (matched === 'ŋw' && charIndex > 0) continue;

        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + matched.length);
        removedIndices.push(charIndex);

        // No idea how the ṃ happens, but I'm assuming it occurs when it's followed by a consonant.
        if (result.nth(0) === 'm' && result.nth(1).isConsonant()) {
          result = 'ṃ' + result.substring(1);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, removedIndices)
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '1532676669': {
    orderId: '00300',
    pattern: '[{ttʰdnl}j-] > [{ttʰdnl}-]',
    description: '[j] was lost after initial dentals',
    url: 'https://eldamo.org/content/words/word-1532676669.html',
    skip: true,
    info: ['Possibly abandoned.', 'Disabled by default.'],
    mechanic: (str, options = {}) => {
      if (['t', 'ŧ', 'd', 'n', 'l'].includes(str.nth(0)) === false)
        return { in: str, out: str, morphemes: options.morphemes };

      const matched = str.nth(1);
      if (matched !== 'j' && matched !== 'y') return { in: str, out: str, morphemes: options.morphemes };
      
      const result = str.replace(matched, '');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [1])
        : (options.morphemes || [str]);

      return { in: str, out: result, morphemes };
    },
  },
  '1062284643': {
    orderId: '00400',
    pattern: '[ln] > [ll]',
    description: '[ln] became [ll]',
    url: 'https://eldamo.org/content/words/word-1062284643.html',
    mechanic: (str, options = {}) => {
      if (str.includes('ln') === false) return { in: str, out: str, morphemes: options.morphemes };

      const result = str.replace('ln', 'll');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '981459769': {
    orderId: '00500',
    pattern: '[-SV{ptks}] > [-SVø]',
    description: 'final voiceless stops and [s] vanished in polysyllables',
    url: 'https://eldamo.org/content/words/word-981459769.html',
    mechanic: (str, options = {}) => {
      if (['p', 't', 'k', 's'].includes(str.nth(-1)) === false)
        return { in: str, out: str, morphemes: options.morphemes };
      
      const analyser = new SyllableAnalyser({ profile: ANCIENT_TELERIN_PROFILE });
      const syllableData = analyser.analyse(str);
      if (syllableData.length === 1) return { in: str, out: str, morphemes: options.morphemes };

      const result = str.slice(0, -1);
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [str.length - 1])
        : (options.morphemes || [str]);
      return { in: str, out: str.slice(0, -1), morphemes };
    },
  },
  '1254562549': {
    orderId: '00600',
    pattern: '[{mn}s] > [ss]',
    description: '[ms], [ns] became [ss]',
    url: 'https://eldamo.org/content/words/word-e.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ms', 'ns'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'ss' + result.substring(charIndex + 2);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
};
