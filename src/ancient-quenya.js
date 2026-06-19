import './utils.js'; // Load String prototype extensions
import {
  recalcMorphemes,
  findAllOf,
  SyllableAnalyser,
  ANCIENT_QUENYA_PROFILE,
  findFirstOf,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const voicelessStops = ['p', 't', 'k'];
const aspirates = ['ƥ', 'ŧ', 'ꝁ', 'f'];
const nasals = ['m', 'n', 'ŋ'];
const liquids = ['l', 'r'];

export const ancientQuenyaRules = {
  '1399041717': {
    orderId: '00100',
    pattern: '[ms] > [ns]',
    description: '[ms] became [ns]',
    url: 'https://eldamo.org/content/words/word-1399041717.html',
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
    url: 'https://eldamo.org/content/words/word-2591378297.html',
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
    url: 'https://eldamo.org/content/words/word-3116715705.html',
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
  '2232975397': {
    orderId: '00400',
    pattern: '[VjC|VwC] > [ViC|VuC]',
    description: 'later [j], [w] became [i], [u] before consonants',
    url: 'https://eldamo.org/content/words/word-2232975397.html',
    mechanic: (str, options = {}) => {
      // [VjC] > [ViC]
      // [VwC] > [VuC]
      const occurrences = findAllOf(['j', 'w'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'j': 'i',
        'w': 'u',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '367860887': {
    orderId: '00500',
    pattern: '[ls] > [ll]',
    description: '[ls] became [ll] or [ld]',
    url: 'https://eldamo.org/content/words/word-367860887.html',
    info: ['There are very few attested words for this one.', 'This rule is disabled by default.'],
    skip: true,
    input: [
      {
        name: 'ld',
        label: 'Use [ld]',
        type: 'boolean',
        default: false,
        description: 'Use [ld] instead of [ll]',
      },
    ],
    mechanic: (str, options = { ld: false }) => {
      if (str.includes('ls') === false) return { in: str, out: str, morphemes: options.morphemes };

      const result = str.replaceAll('ls', options.ld ? 'ld' : 'll');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3192302915': {
    orderId: '00600',
    pattern: '[{ptk}{mnŋlr}|{pʰtʰkʰbdg}{mnŋ}|{tʰd}l] > [{mnŋlr}{ptk}|{mnŋ}{pʰtʰkʰbdg}|l{tʰd}]',
    description: 'stops frequently underwent metathesis with nasals and liquids',
    url: 'https://eldamo.org/content/words/word-3192302915.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['kl', 'ml', 'pn', 'tn', 'bm', 'pm', 'pn', 'kn', 'tr', 'dl'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };
     
      const replacements = {
        'kl': 'lk',
        'ml': 'lm',
        'pn': 'np',
        'tn': 'nt',
        'bm': 'mb',
        'pm': 'mp',
        'kn': 'ŋk',
        'tr': 'rt',
        'dl': 'ld',
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
  '1625553255': {
    orderId: '00700',
    pattern: '[nl|nr] > [ll|rr]',
    description: '[nl], [nr] became [ll], [rr]',
    url: 'https://eldamo.org/content/words/word-1625553255.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['nl', 'nr'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'nl': 'll',
        'nr': 'rr',
      };
      let result = str;

      // [nl] > [ll]
      // [nr] > [rr]
      // [anr] > [ār]
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        if (prevChar.removeMarks() === 'a' && matched === 'nr') {
          result = result.substring(0, charIndex - 1) + 'ār' + result.substring(charIndex + 2);
        } else {
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1606156545': {
    orderId: '00800',
    pattern: '[sr] > [ss]',
    description: '[sr] became [ss]',
    url: 'https://eldamo.org/content/words/word-1606156545.html',
    info: ['There are no examples of this rule.', 'This rule is disabled by default.'],
    skip: true,
    mechanic: (str, options = {}) => {
      if (str.includes('sr') === false) return { in: str, out: str, morphemes: options.morphemes };
      const result = str.replaceAll('sr', 'ss');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1550655669': {
    orderId: '00900',
    pattern: '[rl|lr] > [ll|ll]',
    description: '[rl] and [lr] became [ll]',
    url: 'https://eldamo.org/content/words/word-1550655669.html',
    info: ['This rule also exists in Primitive Elvish.', 'This rule is disabled by default.'],
    skip: true,
    mechanic: (str, options = {}) => {
      if (['rl', 'lr'].some(pattern => str.includes(pattern)) === false) return { in: str, out: str, morphemes: options.morphemes };

      const result = str.replaceAll('rl', 'll').replaceAll('lr', 'll');
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '825670671': {
    orderId: '01000',
    pattern: '[V₁Cḷ|CCr] > [V₁CV₁l|CCar]',
    description: '[r], [l] often became syllabic in clusters',
    url: 'https://eldamo.org/content/words/word-825670671.html',
    input: [
      {
        name: 'mlu',
        label: 'ml > mul',
        type: 'boolean',
        default: false,
        description: 'ml > mul (imula instead of imila, etc.)',
      },
      {
        name: 'eoToIU',
        label: '[{eo}Cl] > [{eo}C{iu}l]',
        type: 'boolean',
        default: true,
        description: 'e develops to il, o develops to ul',
      }
    ],
    mechanic: (str, options = {}) => {
      const { mlu = false, eoToIU = true } = options;
      const occurrences = findAllOf(['l', 'r'], str);
      const defaultReturn = { in: str, out: str, morphemes: options.morphemes };
      if (occurrences.length === 0) return defaultReturn;

      let result = str;

      const newVowel = {
        'a': 'a',
        'i': 'i',
        'u': 'u',
        'e': eoToIU ? 'i' : 'e',
        'o': eoToIU ? 'u' : 'o',
      };

      const getPreviousVowel = (index) => {
        let previousVowel = '';
        for (let j = index - 1; j >= 0; j--) {
          if (result.nth(j).isVowel()) {
            previousVowel = newVowel[result.nth(j).removeMarks()];
            break;
          }
        }
        return previousVowel;
      };

      let morphemes = options.morphemes || [str];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar, lastChar } = occurrences[i];

        // Must occur medially or finally:
        if (charIndex === 0) continue;

        let previousVowel = '';

        // If it's an L:
        if (matched === 'l') {
          // Voiceless stops or aspirates + l:
          if (voicelessStops.includes(prevChar) || aspirates.includes(prevChar)) {
            // Get the previous vowel:
            previousVowel = getPreviousVowel(charIndex);
          } else
          if (nasals.includes(prevChar)) {
            // m > u (imlu instead of imla):
            previousVowel = mlu ? 'u' : getPreviousVowel(charIndex);
          }
        }

        // If it's an R:
        if (matched === 'r') {
          // Cluster of 3 consonants:
          if (prevChar.isConsonant() && result.nth(charIndex - 2).isConsonant()) {
            previousVowel = 'a';
          }
          if (prevChar === 'm') {
            previousVowel = 'a';
          }
        }

        if (previousVowel) {
          result = result.substring(0, charIndex) + previousVowel + matched + result.substring(charIndex + 1);
          
          morphemes = (result !== str && morphemes)
            ? recalcMorphemes(result, morphemes, [], [charIndex])
            : (morphemes || [str]);
        }
      }

      return { in: str, out: result, morphemes };
    },
  },
  '1071202939': {
    orderId: '01100',
    pattern: '[{ptkpʰtʰkʰ}r] > [{ptkpʰtʰkʰ}s]',
    description: '[r] became [s] after voiceless stops and aspirates',
    url: 'https://eldamo.org/content/words/word-1071202939.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['r'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };
      const voicelessStopsAndAspirates = ['p', 't', 'k', 'ƥ', 'ŧ', 'ꝁ'];

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        if (voicelessStopsAndAspirates.includes(prevChar)) {
          result = result.substring(0, charIndex) + 's' + result.substring(charIndex + 1);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '2885687903': {
    orderId: '01200',
    pattern: '[dVXn-] > [nVXn-]',
    description: 'initial [d] assimilated to following nasal',
    url: 'https://eldamo.org/content/words/word-2885687903.html',
    info: ['This rule was abandoned in the 1960s, but was used for many previous words.', 'This rule is disabled by default.'],
    skip: true,
    input: [
      {
        name: 'morphemeSensitive',
        label: 'Sensitive to morphemes',
        type: 'boolean',
        default: true,
        description: 'Ignore when a morpheme starts with nasal',
      }
    ],
    mechanic: (str, options = { morphemeSensitive: true }) => {
      const { morphemeSensitive = true } = options;

      const defaultReturn = { in: str, out: str, morphemes: options.morphemes };
      if (str.nth(0) !== 'd') return defaultReturn;

      const firstNasal = findFirstOf(['n'], str);
      if (firstNasal.found === false) return defaultReturn;

      if (morphemeSensitive) {
        const { morphemes } = options;
        if (morphemes.length > 1) {
          if (morphemes[1].nth(0) === 'n') {
            return defaultReturn;
          }
        }
      }
      
      const { charIndex } = firstNasal;
      const result = 'n' + str.substring(1);
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return {
        in: str,
        out: result,
        morphemes,
      };
    },
  },
  '3316553555': {
    orderId: '01300',
    pattern: '[ɣ-] > [h-]',
    description: 'initial [ɣ] became [h]',
    url: 'https://eldamo.org/content/words/word-3316553555.html',
    info: ['This transformation was likely abandoned in the 1960s and there\'s very little evidence of it.'],
    mechanic: (str, options = {}) => {
      if (str.nth(0) !== 'ɣ') return { in: str, out: str, morphemes: options.morphemes };
      const result = 'h' + str.substring(1);
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1625077395': {
    orderId: '01400',
    pattern: '[{bdg}{bdg}] > [{ptk}{ptk}]',
    description: 'combinations of voiced stops were unvoiced',
    url: 'https://eldamo.org/content/words/word-1625077395.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['d', 'b', 'g'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const combos = [];
      for (let i = 0; i < occurrences.length; i++) {
        const { charIndex, matched, nextChar } = occurrences[i];
        if (['b', 'd', 'g'].includes(nextChar)) {
          combos.push(charIndex);
        }
      }

      const replacements = {
        'b': 'p',
        'd': 't',
        'g': 'k',
      };
      let result = str;

      for (let i = 0; i < combos.length; i++) {
        const charIndex = combos[i];
        const char1 = replacements[result.nth(charIndex)];
        const char2 = replacements[result.nth(charIndex + 1)];
        result = result.substring(0, charIndex) + char1 + char2 + result.substring(charIndex + 2);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
};
