import './utils.js'; // Load String prototype extensions
import {
  recalcMorphemes,
  findAllOf,
  SyllableAnalyser,
  ANCIENT_QUENYA_PROFILE,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const ancientQuenyaRules = {
  '1399041717': {
    orderId: '00100',
    pattern: '[ms] > [ns]',
    description: '[ms] became [ns]',
    mechanic: (str, options = {}) => {
      if (str.includes('ms') === false) return { in: str, out: str, morphemes: options.morphemes };

      const result = str.replaceAll('ms', 'ns');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2591378297': {
    orderId: '00200',
    pattern: '[ns] > [ss]',
    description: '[ns] became [ss]',
    mechanic: (str, options = {}) => {
      if (str.includes('ns') === false) return { in: str, out: str, morphemes: options.morphemes };

      const result = str.replaceAll('ns', 'ſ');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3116715705': {
    orderId: '00300',
    pattern: '[V₁CV̆₁CV] > [V₁CCV]',
    description: 'second short vowel of same quality lost',
    info: ['Part of the Quenya syncope'],
    /**
     * @todo Update this rule based on below points:
     * This rule has small nuances that weren't covered. For example, there's a concern about clusters.
     * Words with 3 syllables shouldn't have a cluster, unless it ends in w or y.
     * There's something about stress and length of the vowel.
     * Examples are lacking and I don't fully grasp how these mechanics work, so I'm delaying work on the exceptional cases.
     */
    mechanic: (str, { guessStress = false, morphemes } = {}) => {
      // Quenya syncope:
      // The word had at least three syllables.
      // There were two sequential syllables with vowels of the same quality.
      // The second vowel was short and unstressed (maybe).
      // The resulting consonant cluster was a "permitted cluster".

      const analyser = new SyllableAnalyser({ profile: ANCIENT_QUENYA_PROFILE });
      const syllableData = analyser.analyse(str);

      // The word had at least three syllables:
      if (syllableData.length < 3) return { in: str, out: str, morphemes };

      // There were two sequential syllables with vowels of the same quality:
      const firstSyllable = syllableData[0];
      const secondSyllable = syllableData[1];
      const quality1 = firstSyllable.nucleus.removeMarks();
      const quality2 = secondSyllable.nucleus.removeMarks();
      if (quality1 !== quality2) return { in: str, out: str, morphemes };

      // Assemble new word:
      const result = [firstSyllable.syllable];
      const removedIndices = [firstSyllable.syllable.length + secondSyllable.syllable.indexOf(secondSyllable.nucleus)];
      result.push(secondSyllable.syllable.replace(secondSyllable.nucleus, ''));
      result.push(...syllableData.slice(2).map(s => s.syllable));

      let joinedResult = result.join('');
      joinedResult = joinedResult.replaceAll('nkw', 'ŋkw');

      // console.log({ syllableData });
      const updatedMorphemes = (joinedResult !== str && morphemes)
        ? recalcMorphemes(joinedResult, morphemes, removedIndices)
        : (morphemes || [str]);

      return { in: str, out: joinedResult, morphemes: updatedMorphemes };
    },
  },
};
