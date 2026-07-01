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
        const { charIndex, matched, prevChar } = occurrences[i];
        if (prevChar.isVowel() === false) continue;
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
  '3279729471': {
    orderId: '01500',
    pattern: '[z{bdg}] > [s{ptk}]',
    description: '[z] plus voiced stop became unvoiced',
    url: 'https://eldamo.org/content/words/word-3279729471.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['d', 'b', 'g'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };
      const replacements = {
        'b': 'p',
        'd': 't',
        'g': 'k',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        if (prevChar === 'z') {
          result = result.substring(0, charIndex - 1) + 's' + replacements[matched] + result.substring(charIndex + 1);
        }
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3418086257': {
    orderId: '01600',
    pattern: '[{ptk}{nm}|{ptk}ʰ{nm}] > [{ptk}{tw}|{ptk}ʰ{tw}]',
    description: '[n], [m] became [t], [w] after voiceless stops and aspirates',
    url: 'https://eldamo.org/content/words/word-3418086257.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['m', 'n'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const voicelessStopsAndAspirates = ['p', 't', 'k', 'ƥ', 'ŧ', 'ꝁ'];
      const replacements = {
        'm': 'w',
        'n': 't',
        'ƥ': 'p',
        'ŧ': 't',
        'ꝁ': 'k',
      };
      let result = str;

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        if (voicelessStopsAndAspirates.includes(prevChar)) {
          if (aspirates.includes(prevChar)) {
            result = result.substring(0, charIndex - 1) + replacements[prevChar] + result.substring(charIndex);
          }
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3474357431': {
    orderId: '01700',
    pattern: '[mpʰ|ntʰ|ŋkʰ] > [ppʰ|ttʰ|kkʰ]',
    description: 'nasals became voiceless stops before aspirates',
    url: 'https://eldamo.org/content/words/word-3474357431.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['mƥ', 'nŧ', 'ŋꝁ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'mƥ': 'pƥ', // [mpʰ] > [ppʰ]
        'nŧ': 'tŧ', // [ntʰ] > [ttʰ]
        'ŋꝁ': 'kꝁ', // [ŋkʰ] > [kkʰ]
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
  '2190887743': {
    orderId: '01800',
    pattern: '[{ptk}{ptk}ʰ] > [{ptk}{ptk}]',
    description: 'aspirates became voiceless stops after voiceless stops',
    url: 'https://eldamo.org/content/words/word-2190887743.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ƥ', 'ŧ', 'ꝁ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'pƥ': 'pp', // [ppʰ] > [pp]
        'pŧ': 'pt', // [ptʰ] > [pt]
        'pꝁ': 'pk', // [pkʰ] > [pk]
        'tƥ': 'tp', // [tpʰ] > [tp]
        'tŧ': 'tt', // [ttʰ] > [tt]
        'tꝁ': 'tk', // [tkʰ] > [tk]
        'kŧ': 'kt', // [ktʰ] > [kt]
        'kƥ': 'kp', // [kpʰ] > [kp]
        'kꝁ': 'kk', // [kkʰ] > [kk]
      };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        if (!prevChar) continue;
        result = result.substring(0, charIndex - 1) + replacements[prevChar + matched] + result.substring(charIndex + 1);
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3262991621': {
    orderId: '01900',
    pattern: '[{ptk}ʰ] > [{ɸθx}]',
    description: 'aspirates became voiceless spirants',
    url: 'https://eldamo.org/content/words/word-3262991621.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ƥ', 'ŧ', 'ꝁ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'ƥ': 'ɸ',
        'ŧ': 'θ',
        'ꝁ': 'x',
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
  '785281061': {
    orderId: '02000',
    pattern: '[ṣ-] > [is-]',
    description: 'syllabic initial [s] became [is]',
    url: 'https://eldamo.org/content/words/word-785281061.html',
    mechanic: (str, options = {}) => {
      if (str.nth(0) !== 'ṣ') return { in: str, out: str, morphemes: options.morphemes };

      const result = 'is' + str.substring(1);
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1605344503': {
    orderId: '02100',
    pattern: '[sp-|st-|sk-] > [ɸ-|θ-|x-]',
    description: 'initial [s] plus voiceless stops became voiceless spirants',
    url: 'https://eldamo.org/content/words/word-1605344503.html',
    mechanic: (str, options = {}) => {
      const firstTwoChars = str.nth(0, 2);
      const replacements = {
        'sp': 'ɸ',
        'st': 'θ',
        'sk': 'x',
      };
      if (replacements[firstTwoChars]) {
        const result = replacements[firstTwoChars] + str.substring(2);
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1556924193': {
    orderId: '02200',
    pattern: '[sm-|sn-|sr-|sl-|sj-|sw-] > [m̥-|n̥-|r̥-|l̥-|j̊-|w̥-]',
    description: 'initial [s] unvoiced following continuant',
    url: 'https://eldamo.org/content/words/word-1556924193.html',
    mechanic: (str, options = {}) => {
      const firstChar = str.nth(0);
      if (firstChar !== 's') return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'sm': 'ᵯ',
        'sn': 'ꞃ',
        'sr': 'ꞧ',
        'sl': 'λ',
        'sj': 'ʝ',
        'sw': 'ẘ',
      };

      const takeTwo = str.nth(0, 2);
      if (replacements[takeTwo]) {
        const result = replacements[takeTwo] + str.substring(2);
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '2963647241': {
    orderId: '02300',
    pattern: '[xj|xw] > [j̊|w̥]',
    description: '[x] unvoiced following [j], [w]',
    url: 'https://eldamo.org/content/words/word-2963647241.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['xj', 'xw'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'xj': 'ʝ',
        'xw': 'ẘ',
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
  '2830908887': {
    orderId: '02400',
    pattern: '[{bdg}{mnŋ}] > [{mnŋ}{mnŋ}]',
    description: 'voiced stops became nasals before nasals',
    url: 'https://eldamo.org/content/words/word-2830908887.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['m', 'n', 'ŋ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'b': 'm',
        'd': 'n',
        'g': 'ŋ',
      };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        if (['b', 'd', 'g'].includes(prevChar)) {
          result = result.substring(0, charIndex - 1) + replacements[prevChar] + result.substring(charIndex);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '4294735057': {
    orderId: '02500',
    pattern: '[ṃb-|ṇd-|ŋ̣g-|ŋ̣gw-|ŋ̣gj-] > [umb-|and-|iŋg-|uŋgw-|iŋgj-]',
    description: 'syllabic nasals developed a preceding vowel of similar quality',
    url: 'https://eldamo.org/content/words/word-4294735057.html',
    mechanic: (str, options = {}) => {
      const defaultReturn = { in: str, out: str, morphemes: options.morphemes };

      const occurrences = findAllOf(['ṃb', 'ṇd', 'ŋ̣g', 'ŋ̣ƣ', 'ŋ̣gj'], str);
      if (occurrences.length === 0) return defaultReturn;

      const match = occurrences.find((o) => o.charIndex === 0);
      if (!match) return defaultReturn;

      const replacements = {
        'ṃb': 'umb',
        'ṇd': 'and',
        'ŋ̣g': 'iŋg',
        'ŋ̣ƣ': 'uŋƣ',
        'ŋ̣gj': 'iŋgj',
      };

      const { matched } = match;
      const result = replacements[matched] + str.substring(matched.length);
      
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3688462237': {
    orderId: '02600',
    pattern: '[dr-|dl-] > [r-|l-]',
    description: 'initial [dr-], [dl-] became [r-], [l-]',
    url: 'https://eldamo.org/content/words/word-3688462237.html',
    mechanic: (str, options = {}) => {
      const firstChars = str.nth(0, 2);
      if (['dr', 'dl'].includes(firstChars)) {
        const result = str.substring(1);
        const morphemes = (result !== str && options.morphemes)
          ? recalcMorphemes(result, options.morphemes, [0])
          : (options.morphemes || [str]);
        return { in: str, out: result, morphemes };
      }
      return { in: str, out: str, morphemes: options.morphemes };
    },
  },
  '1574644731': {
    orderId: '02700',
    pattern: '[dj] > [lj]',
    description: 'initial [dj] became [lj]',
    info: ['Occurs initially and medially'],
    url: 'https://eldamo.org/content/words/word-1574644731.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['dj'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, lastChar } = occurrences[i];
        if (lastChar) continue;
        result = result.substring(0, charIndex) + 'lj' + result.substring(charIndex + 2);
      }
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '3325625207': {
    orderId: '02800',
    pattern: '[d-] > [l-]',
    description: 'initial [d] became [l]; [d-] > [l-]',
    url: 'https://eldamo.org/content/words/word-3325625207.html',
    mechanic: (str, options = {}) => {
      const firstChar = str.nth(0);
      if (firstChar !== 'd') return { in: str, out: str, morphemes: options.morphemes };

      const result = 'l' + str.substring(1);
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [0])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1141570065': {
    orderId: '02900',
    pattern: '[{bdg}|{mnŋ}{bdg}] > [{βðɣ}|{mnŋ}{bdg}]',
    description: 'voiced stops became spirants except after nasals',
    url: 'https://eldamo.org/content/words/word-1141570065.html',
    dependsOn: [{ rule: '3192302915', param: 'changedStop' }],
    // This dependency needs confirmation from Paul.
    mechanic: (str, { changedStop = false, morphemes } = {}) => {
      const defaultReturn = { in: str, out: str, morphemes: morphemes || [str] };
      if (changedStop) return defaultReturn;

      const occurrences = findAllOf(['b', 'd', 'g', 'ƣ'], str);
      if (occurrences.length === 0) return defaultReturn;
      
      const replacements = {
        'b': 'β',
        'd': 'ð',
        'g': 'ɣ',
        'ƣ': 'ɣw',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        if (['m', 'n', 'ŋ'].includes(prevChar)) continue;
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
      }

      const newMorphemes = (result !== str && morphemes)
        ? recalcMorphemes(result, morphemes, [])
        : (morphemes || [str]);
      return { in: str, out: result, morphemes: newMorphemes };
    },
  },
  '3703720537': {
    orderId: '03000',
    pattern: '[{kgŋ}j|ŋkj|{rlŋ}gj] > [{tdn}j|ntj|{rln}dj]',
    description: 'velars were dentalized before [j]',
    url: 'https://eldamo.org/content/words/word-3703720537.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['kj', 'ŋgj', 'ŋj', 'gj', 'ŋkj'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'kj': 'tj',
        'ŋgj': 'ndj',
        'ŋj': 'nj',
        'gj': 'dj',
        'ŋkj': 'ntj',
      };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + matched.length);
      }

      const newMorphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes: newMorphemes };
    },
  },
  '1987898661': {
    orderId: '03100',
    pattern: '[ɣ{rl}V₁-] > [V₁{rl}V₁-]',
    description: 'initial [ɣ] before [l], [r] sometimes became a vowel',
    url: 'https://eldamo.org/content/words/word-1987898661.html',
    info: ['This rule a rare development and shows mostly on archaic forms.', 'This rule is disabled by default.'],
    skip: true,
    mechanic: (str, options = {}) => {
      const firstChar = str.nth(0);
      const secondChar = str.nth(1);
      const thirdChar = str.nth(2);

      if (firstChar !== 'ɣ' || !['r', 'l'].includes(secondChar) || !thirdChar.isVowel())
        return { in: str, out: str, morphemes: options.morphemes };

      const result = thirdChar + str.substring(1);
      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [0])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
  '1408301067': {
    orderId: '03200',
    pattern: '[CC{jw}|C{td}j|C{kg}w] > [CC{iu}|C{td}j|C{kg}w]',
    description: '[j], [w] often became [i], [u] after consonant groups',
    url: 'https://eldamo.org/content/words/word-1408301067.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['j', 'w'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const replacements = {
        'j': 'i',
        'w': 'u',
      };

      const protoClusters = ['lh', 'rh', 'λ', 'ꞧ'];

      const allowedClusters = {
        'j': ['ht', 'st', 'nt', 'nd', 'lt', 'rt', 'ld', 'rd', 'lth', 'rth', 'lθ', 'rθ'],
        'w': ['sk', 'ŋk', 'ŋg', 'lk', 'rk'],
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        const prevChar2 = str.nth(charIndex - 2);
        const prevChar3 = str.nth(charIndex - 3);

        // Matching single point λ and ꞧ:
        if (protoClusters.includes(prevChar)) continue;
        // Matching double point lh and rh:
        if (protoClusters.includes(prevChar2 + prevChar)) continue;
        // Matching allowed clusters with 2 characters:
        if (allowedClusters[matched].includes(prevChar2 + prevChar)) continue;
        // Matching allowed clusters with 3 characters:
        if (allowedClusters[matched].includes(prevChar3 + prevChar2 + prevChar)) continue;

        // If we got this far, it means the character mutates:
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
      }

      const newMorphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes: newMorphemes };
    },
  },
  '1363608031': {
    orderId: '03300',
    pattern: '[ę̄|ǭ] > [ē|ō]',
    description: '[ę̄], [ǭ] became [ē], [ō]',
    url: 'https://eldamo.org/content/words/word-1363608031.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ę̄', 'ǭ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      const result = str.replace('ę̄', 'ē').replace('ǭ', 'ō');
      const newMorphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes: newMorphemes };
    },
  },
  '1293037291': {
    orderId: '03400',
    pattern: '[V́CV̄] > [V́CV̆]',
    description: 'unstressed medial long vowels shortened',
    url: 'https://eldamo.org/content/words/word-1293037291.html',
    mechanic: (str, options = {}) => {
      const analyser = new SyllableAnalyser({ profile: ANCIENT_QUENYA_PROFILE });
      const syllableData = analyser.analyse(str);

      // Monosyllables:
      if (syllableData.length === 1) return { in: str, out: str, morphemes: options.morphemes };

      const result = [];
      for (let i = 0; i < syllableData.length; i++) {
        const { syllable, stressed } = syllableData[i];
        // Only medial syllables:
        if (i === 0 || i === syllableData.length - 1) {
          result.push(syllable);
          continue;
        }
        // Only unstressed syllables:
        if (stressed) {
          result.push(syllable);
          continue;
        }
        const sVowel = syllableData[i].nucleus;
        const sVowelMark = sVowel.getMark();
        if (sVowelMark === '¯') {
          result.push(syllable.replace(sVowel, sVowel.removeMarks()));
        } else {
          result.push(syllable);
        }
      }

      const joinedResult = result.join('');
      const updatedMorphemes = (joinedResult !== str && options.morphemes)
        ? recalcMorphemes(joinedResult, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: joinedResult, morphemes: updatedMorphemes };
    },
  },
  '2619518313': {
    orderId: '03500',
    pattern: '[{rl}ɣ{ae}] > [{rl}j{ae}]',
    description: '[ɣ] became [j] between liquids and [e], [a]',
    url: 'https://eldamo.org/content/words/word-2619518313.html',
    mechanic: (str, options = {}) => {
      const occurrences = findAllOf(['ɣ'], str);
      if (occurrences.length === 0) return { in: str, out: str, morphemes: options.morphemes };

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        console.log(prevChar, nextChar);
        if (['r', 'l'].includes(prevChar) && ['a', 'e'].includes(nextChar.removeMarks())) {
          result = result.substring(0, charIndex) + 'j' + result.substring(charIndex + 1);
        }
      }

      const morphemes = (result !== str && options.morphemes)
        ? recalcMorphemes(result, options.morphemes, [])
        : (options.morphemes || [str]);
      return { in: str, out: result, morphemes };
    },
  },
};
