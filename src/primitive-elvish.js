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
  PRIMITIVE_ELVISH_PROFILE,
} from './utils.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const primitiveElvishRules = {
  // Rules without order IDs (numbered 00001-00030)
  '2225058767': {
    orderId: '00001',
    pattern: '[{ptk}ʰs] > [{ptk}s]',
    description: 'aspirate became voiceless stop before [s]',
    url: 'https://eldamo.org/content/words/word-2225058767.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ƥ', 'ŧ', 'ꝁ'], str);
      if (occurrences.length > 0) {
        const replacements = {
          'ƥ': 'p',
          'ŧ': 't',
          'ꝁ': 'k',
        };
        let result = str;
        for (const occurrence of occurrences) {
          const { charIndex, matched, nextChar } = occurrence;
          if (nextChar === 's') {
            result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
          }
        }
        return result;
      }
      return str;
    },
  },
  '3915424757': {
    orderId: '00002',
    pattern: '[s{ptk}ʰ|htʰ] > [s{ptk}|ht]',
    description: 'aspirates became voiceless stops after [s], [h]',
    url: 'https://eldamo.org/content/words/word-3915424757.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ƥ', 'ŧ', 'ꝁ'], str);
      if (occurrences.length > 0) {
        const replacements = {
          'ƥ': 'p',
          'ŧ': 't',
          'ꝁ': 'k',
        };
        let result = str;
        for (const occurrence of occurrences) {
          const { charIndex, matched, prevChar } = occurrence;
          if (prevChar === 's') {
            result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
          }
          if (prevChar === 'h' && matched === 'ŧ') {
            result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
          }
        }
        return result;
      }
      return str;
    },
  },
  '3183451073': {
    orderId: '00003',
    pattern: '[{ptk}ʰ{ptk|pʰtʰkʰ}] > [{ptk}{ptk}ʰ]',
    description: 'aspiration moved to end of group of stops',
    url: 'https://eldamo.org/content/words/word-3183451073.html',
    mechanic: (str) => {
      const { found, charIndex, matched, prevChar, nextChar } = findFirstOf(['ƥ', 'ŧ', 'ꝁ'], str);
      if (found) {
        const firstReplacements = {
          'ƥ': 'p',
          'ŧ': 't',
          'ꝁ': 'k',
        };
        const secondReplacements = {
          'p': 'ƥ',
          't': 'ŧ',
          'k': 'ꝁ',
          'ƥ': 'ƥ',
          'ŧ': 'ŧ',
          'ꝁ': 'ꝁ',
        };
        let result = str;
        // [{ƥŧꝁ}{ptk|ƥŧꝁ}] > [{ptk}{ƥŧꝁ}]
        if (['ƥ', 'ŧ', 'ꝁ', 'p', 't', 'k'].includes(nextChar)) {
          result = result.substring(0, charIndex) + firstReplacements[matched] + secondReplacements[nextChar] + result.substring(charIndex + 2);
        }
        return result;
      }
      return str;
    },
  },
  '3882201769': {
    orderId: '00004',
    pattern: '[bm|dn] > [mb|nd]',
    description: '[bm], [dn] became [mb], [nd]',
    url: 'https://eldamo.org/content/words/word-3882201769.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['bm', 'dn'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'bm': 'mb',
          'dn': 'nd',
        };
        for (const occurrence of occurrences) {
          const { charIndex, matched } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        return result;
      }
      return str;
    },
  },
  '2641132585': {
    orderId: '00005',
    pattern: '[-{jw}] > [-{iu}]',
    description: 'final [j], [w] became [i], [u]',
    url: 'https://eldamo.org/content/words/word-2641132585.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      if (['j', 'w'].includes(lastChar)) {
        const replacements = {
          'j': 'i',
          'w': 'u',
        };
        return str.substring(0, str.length - 1) + replacements[lastChar];
      }
      return str;
    },
  },
  '1539930001': {
    orderId: '00006',
    pattern: '[CV̄{jw}] > [CV̄]',
    description: 'final [j], [w] vanished after long vowels in monosyllables',
    url: 'https://eldamo.org/content/words/word-1539930001.html',
    mechanic: (str) => {
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);
      if (syllableData.length === 1) {
        const { nucleus, syllable } = syllableData[0];
        const mark = nucleus.length === 1 ? nucleus.getMark() : nucleus.nth(0).getMark();
        if (mark === '¯') {
          const vowelIndex = syllable.indexOf(nucleus);
          const nextChar = syllable.nth(vowelIndex + 1);
          if (['j', 'w'].includes(nextChar)) {
            return str.substring(0, str.length - 1);
          }
        }
      }
      return str;
    },
  },
  '3385004377': {
    orderId: '00007',
    pattern: '[-l] > [-r]',
    description: 'final [l] became [r]',
    url: 'https://eldamo.org/content/words/word-3385004377.html',
    mechanic: (str) => {
      if (str.endsWith('l')) {
        return str.substring(0, str.length - 1) + 'r';
      }
      return str;
    },
  },
  '760163573': {
    orderId: '00008',
    pattern: '[-m] > [-n]',
    description: 'final [m] became [n]',
    url: 'https://eldamo.org/content/words/word-760163573.html',
    mechanic: (str) => {
      if (str.endsWith('m')) {
        return str.substring(0, str.length - 1) + 'n';
      }
      return str;
    },
  },
  '2177009433': {
    orderId: '00009',
    pattern: '[hs] > [ss]',
    description: '[hs] became [ss]',
    url: 'https://eldamo.org/content/words/word-2177009433.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['hs'], str);
      if (occurrences.length > 0) {
        let result = str;
        for (const occurrence of occurrences) {
          const { charIndex } = occurrence;
          result = result.substring(0, charIndex) + 'ss' + result.substring(charIndex + 2);
        }
        return result;
      }
      return str;
    },
  },
  '794129503': {
    orderId: '00010',
    pattern: '[ɣ{ptkpʰtʰkʰs}] > [h{ptkpʰtʰkʰs}]',
    description: '[ɣ] became [h] before voiceless consonants',
    url: 'https://eldamo.org/content/words/word-794129503.html',
    skip: true, // Marked as deleted in source
    info: ['Marked as deleted in source', 'This rule isn\'t implemented yet and will return the same as the input.'],
    mechanic: (str) => str,
  },
  '2151845509': {
    orderId: '00011',
    pattern: '[lɣ] > [lg]',
    description: '[lɣ] became [lg]',
    url: 'https://eldamo.org/content/words/word-2151845509.html',
    mechanic: (str) => {
      if (str.includes('lɣ')) {
        return str.replaceAll('lɣ', 'lg');
      }
      return str;
    },
  },
  '542079381': {
    orderId: '00012',
    pattern: '[V̄CC] > [V̆CC]',
    description: 'long vowels shortened before consonant clusters',
    url: 'https://eldamo.org/content/words/word-542079381.html',
    mechanic: (str) => {
      const vcPattern = breakIntoVowelsAndConsonants(str);
      if (vcPattern.includes('VCC')) {
        let result = str;
        const patternMatches = findAllOf(['VCC'], vcPattern);
        for (const match of patternMatches) {
          const { charIndex } = match;
          const vowel = str.nth(charIndex);
          const mark = vowel.getMark();
          if (mark === '¯') {
            result = result.substring(0, charIndex) + vowel.removeVowelMarks() + result.substring(charIndex + 1);
          }
        }
        return result;
      }
      return str;
    },
  },
  '2690267141': {
    orderId: '00013',
    pattern: '[-h-|VhC|ht] > [-ø-|V̄øC|xt]',
    description: 'medial [ɣ]/[h] vanished except before [t]',
    url: 'https://eldamo.org/content/words/word-2690267141.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['h', 'ɣ'], str);
      if (occurrences.length === 0) return str;

      let result = str;
      // Process from end to start so indices remain valid
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];

        // Exception: before [t] - keep the h/ɣ
        if (nextChar === 't') continue;

        // Final h/ɣ - just remove it
        if (charIndex === result.length - 1) {
          result = result.slice(0, -1);
          continue;
        }

        // V + h/ɣ + V: merge vowels
        if (prevChar.isVowel() && nextChar.isVowel()) {
          if (prevChar.removeMarks() === nextChar.removeMarks()) {
            // Same vowel: lengthen it
            result = result.slice(0, charIndex - 1) + prevChar.addMark('¯') + result.slice(charIndex + 2);
          } else {
            // Different vowels: remove h and keep both vowels (remove length marks)
            result = result.slice(0, charIndex - 1) + prevChar.removeMarks() + nextChar.removeMarks() + result.slice(charIndex + 2);
          }
          continue;
        }

        // V + h/ɣ + C: lengthen vowel and remove h/ɣ
        if (prevChar.isVowel() && nextChar.isConsonant()) {
          result = result.slice(0, charIndex - 1) + prevChar.addMark('¯') + result.slice(charIndex + 1);
          continue;
        }

        // Default: just remove h/ɣ
        result = result.slice(0, charIndex) + result.slice(charIndex + 1);
      }

      return result;
    },
  },
  '4126101193': {
    orderId: '00014',
    pattern: '[-C{mnŋ}{bdg}-] > [-C{mnŋ}-]',
    description: 'medial nasal plus stop after another consonant became simple nasal',
    url: 'https://eldamo.org/content/words/word-4126101193.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['m', 'n', 'ŋ'], str);
      if (occurrences.length === 0) return str;
      let result = str;
      // Process from end to start so indices remain valid
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (['b', 'd', 'g'].includes(nextChar)) {
          result = result.substring(0, charIndex + 1) + result.substring(charIndex + 2);
        }
      }
      return result;
    },
  },
  '2233951333': {
    orderId: '00015',
    pattern: '[-ŋ{wj}-] > [-ŋg{wj}-]',
    description: 'medial [ŋj], [ŋw] became [ŋgj], [ŋgw]',
    url: 'https://eldamo.org/content/words/word-2233951333.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ŋj', 'ŋw'], str);
      if (occurrences.length === 0) return str;
      let result = str;
      // Process from end to start so indices remain valid
      const replacements = {
        'ŋj': 'ŋgj',
        'ŋw': 'ŋgw',
      };
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        if (charIndex === 0) continue;
        if (charIndex === result.length - 1) continue;
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      return result;
    },
  },
  '768986721': {
    orderId: '00016',
    pattern: '[VŋV|ŋ{rl}|-ŋ] > [VɣV|ɣ{rl}|-ɣ]',
    description: 'medial [ŋ] usually became [ɣ]',
    url: 'https://eldamo.org/content/words/word-768986721.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ŋ'], str);
      if (occurrences.length === 0) return str;
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (prevChar.isVowel() && nextChar.isVowel()) {
          result = result.substring(0, charIndex) + 'ɣ' + result.substring(charIndex + 1);
        }
        if (['r', 'l'].includes(nextChar)) {
          result = result.substring(0, charIndex) + 'ɣ' + result.substring(charIndex + 1);
        }
        // This logic is not attested on Eldamo.
        // If it's final, it shouldn't matter if the penultimate char is a vowel.
        // But all examples have vowels.
        if (charIndex === result.length - 1 && prevChar.isVowel()) {
          result = result.substring(0, charIndex) + 'ɣ';
        }
      }
      return result;
    },
  },
  '3160359587': {
    orderId: '00017',
    pattern: '[km] > [mk]',
    description: 'metathesis',
    url: 'https://eldamo.org/content/words/word-3160359587.html',
    input: [
      {
        name: 'slMetathesis',
        label: '[sl] metathesis',
        type: 'boolean',
        default: false,
        description: 'Perform metathesis of [sl] to [ls]',
      },
    ],
    mechanic: (str, { slMetathesis = false } = {}) => {
      if (str.includes('km') || (slMetathesis && str.includes('sl'))) {
        let result = str;
        if (result.includes('km')) {
          result = result.replaceAll('km', 'mk');
        }
        if (result.includes('sl')) {
          result = result.replaceAll('sl', 'ls');
        }
        return result;
      }
      return str;
    },
  },
  '2143444883': {
    orderId: '00018',
    pattern: '[{nŋ}{ppʰb}|{mŋ}{ttʰd}|{mn}{kkʰg}] > [m{ppʰb}|n{ttʰd}|ŋ{kkʰg}]',
    description: 'nasals assimilated to following stops and aspirates',
    url: 'https://eldamo.org/content/words/word-2143444883.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['np', 'nb', 'ŋp', 'mt', 'md', 'ŋt', 'mk', 'nk'], str);
      if (occurrences.length === 0) return str;

      const replacements = {
        'np': 'mp',
        'nb': 'mb',
        'ŋp': 'mp',
        'mt': 'nt',
        'md': 'nd',
        'ŋt': 'nt',
        'mk': 'ŋk',
        'nk': 'ŋk',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      return result;
    },
  },
  '3404492995': {
    orderId: '00019',
    pattern: '[ŋ{ŋɣ}] > [ŋg]',
    description: '[ŋŋ], [ŋɣ] became [ŋg]',
    url: 'https://eldamo.org/content/words/word-3404492995.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ŋŋ', 'ŋɣ'], str);
      if (occurrences.length === 0) return str;
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'ŋg' + result.substring(charIndex + 2);
      }
      return result;
    },
  },
  '484908271': {
    orderId: '00020',
    pattern: '[ŋs] > [ns]',
    description: '[ŋs] became [ns]',
    url: 'https://eldamo.org/content/words/word-484908271.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ŋs'], str);
      if (occurrences.length === 0) return str;
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'ns' + result.substring(charIndex + 2);
      }
      return result;
    },
  },
  '2859678213': {
    orderId: '00021',
    pattern: '[pw|pʰw] > [pp|pʰpʰ]',
    description: '[pw], [pʰw] became [pp], [pʰp]',
    url: 'https://eldamo.org/content/words/word-2859678213.html',
    mechanic: (str) => {
      // [pw|ƥw] > [pp|ƥƥ]
      const occurrences = findAllOf(['pw', 'ƥw'], str);
      if (occurrences.length === 0) return str;
      const replacements = {
        'pw': 'pp',
        'ƥw': 'ƥƥ',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      return result;
    },
  },
  '882174441': {
    orderId: '00022',
    pattern: '[s{bdg}] > [z{bdg}]',
    description: '[s] became [z] before voiced stops',
    url: 'https://eldamo.org/content/words/word-882174441.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['sb', 'sd', 'sg'], str);
      if (occurrences.length === 0) return str;
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'z' + result.substring(charIndex + 1);
      }
      return result;
    },
  },
  '2794740763': {
    orderId: '00023',
    pattern: '[-S{ĕăŏǝ}] > [-Sø]',
    description: 'short final [e], [a], [o] vanished',
    url: 'https://eldamo.org/content/words/word-2794740763.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      if (['e', 'a', 'o', 'ǝ'].includes(lastChar)) {
        return str.substring(0, str.length - 1);
      }
      return str;
    },
  },
  '3064357955': {
    orderId: '00024',
    pattern: '[-S{ĭŭ}] > [-S{eo}]',
    description: 'short final [i], [u] became [e], [o]',
    url: 'https://eldamo.org/content/words/word-3064357955.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      if ('iu'.includes(lastChar)) {
        const replacements = {
          'i': 'e',
          'u': 'o',
        };
        return str.substring(0, str.length - 1) + replacements[lastChar];
      }
      return str;
    },
  },
  '1475928117': {
    orderId: '00025',
    pattern: '[wŏ́] > [wa]',
    description: 'stressed [wŏ] became [wa]',
    url: 'https://eldamo.org/content/words/word-1475928117.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['wŏ́', 'wa', 'wo', 'wó'], str);
      if (occurrences.length === 0) return str;

      const replacements = {
        'wo': 'wa',
        'wa': 'wo',
      };
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);
      if (syllableData.length === 1) {
        const unmarkedMatch = occurrences[0].matched.removeMarks();
        return str.replaceAll(occurrences[0].matched, replacements[unmarkedMatch]);
      }
      for (const { charIndex, matched } of occurrences) {
        const syllable = syllableData.find((s) => s.syllable.includes(matched));
        if (syllable.stressed) {
          const unmarkedMatch = matched.removeMarks();
          str = str.substring(0, charIndex) + replacements[unmarkedMatch] + str.substring(charIndex + matched.length);
        }
      }
      return str;
    },
  },
  '2479050823': {
    orderId: '00026',
    pattern: '[{ttʰd}+t|d+d] > [st|zd]',
    description: '[t+t], [d+d] from suffixion became [st], [zd]',
    url: 'https://eldamo.org/content/words/word-2479050823.html',
    skip: true,
    info: [
      'It\'s up to the user to determine whether these are from suffixion.',
      'This rule is disabled by default.'
    ],
    mechanic: (str) => {
      const occurrences = findAllOf(['tt', 'ŧt', 'dt', 'dd'], str);
      if (occurrences.length === 0) return str;
      // [{tŧd}t|dd] > [st|zd]
      const replacements = {
        'tt': 'st',
        'ŧt': 'st',
        'dt': 'st',
        'dd': 'zd',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      return result;
    },
  },
  '700934409': {
    orderId: '00027',
    pattern: '[tk] > [kk]',
    description: '[tk] became [kk] or [kt] or [sk]',
    url: 'https://eldamo.org/content/words/word-700934409.html',
    input: [
      {
        name: 'useTkToSk',
        label: '[tk] to [sk]',
        type: 'boolean',
        default: false,
        group: 'tkToggle',
        description: 'Convert [tk] to [sk] instead of [kk]',
      },
      {
        name: 'useTkToKt',
        label: '[tk] to [kt]',
        type: 'boolean',
        default: false,
        group: 'tkToggle',
        description: 'Convert [tk] to [kt] instead of [kk]',
      },
    ],
    mechanic: (str, { useTkToSk = false, useTkToKt = false } = {}) => {
      const occurrences = findAllOf(['tk', 'tp'], str);
      if (occurrences.length === 0) return str;
      const replacements = {
        'tk': useTkToSk ? 'sk' : useTkToKt ? 'kt' : 'kk',
        'tp': 'pp',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
      }
      return result;
    },
  },
  '951924569': {
    orderId: '00028',
    pattern: '[ˌV̄S] > [V̆S]',
    description: 'unstressed long vowels shortened in medial syllables',
    url: 'https://eldamo.org/content/words/word-951924569.html',
    mechanic: (str) => {
      const analyser = new SyllableAnalyser({ profile: PRIMITIVE_ELVISH_PROFILE });
      const syllableData = analyser.analyse(str);
      const result = [];

      // Macron can be spacing (¯) or combining (U+0304)
      const MACRON_SPACING = '¯';
      const MACRON_COMBINING = '\u0304';

      for (let i = 0; i < syllableData.length; i++) {
        const { syllable, stressed, nucleus } = syllableData[i];

        // First and last syllables: keep as-is
        if (i === 0 || i === syllableData.length - 1) {
          result.push(syllable);
          continue;
        }

        // Medial syllables: shorten unstressed long vowels
        const marks = nucleus.getMark();
        const hasLength = marks.includes(MACRON_SPACING) || marks.includes(MACRON_COMBINING);

        if (!stressed && hasLength) {
          // Remove macron, keep other marks (like stress)
          const newMarks = marks
            .replace(MACRON_SPACING, '')
            .replace(MACRON_COMBINING, '');
          const newNucleus = nucleus.removeMarks().addMark(newMarks);
          result.push(syllable.replace(nucleus, newNucleus));
        } else {
          result.push(syllable);
        }
      }

      return result.join('');
    },
  },
  '2620200719': {
    orderId: '00029',
    pattern: '[{pʰtʰkʰptk}{bdg}|{bdg}{pʰtʰkʰptk}] > [{pʰtʰkʰptk}{ptk}|{ptk}{pʰtʰkʰptk}]',
    description: 'voiced stops unvoiced after voiceless stops and aspirates',
    url: 'https://eldamo.org/content/words/word-2620200719.html',
    mechanic: (str) => {
      // [{ƥŧꝁptk}{bdg}|{bdg}{ƥŧꝁptk}] > [{ƥŧꝁptk}{ptk}|{ptk}{ƥŧꝁptk}]
      const occurrences = findAllOf(['b', 'd', 'g', 'ɣ'], str);
      if (occurrences.length === 0) return str;
      const replacements = {
        'b': 'p',
        'd': 't',
        'g': 'k',
        'ɣ': 'k',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        if ('ptkƥŧꝁs'.includes(prevChar)) {
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
        }
      }
      return result;
    },
  },
  '1944249607': {
    orderId: '00030',
    pattern: '[{bdg}{ptkpʰtʰkʰs}] > [{ptk}{ptkpʰtʰkʰs}]',
    description: 'voiced stops unvoiced before voiceless consonants',
    url: 'https://eldamo.org/content/words/word-1944249607.html',
    mechanic: (str) => {
      // [{bdg}{ptkƥŧꝁs}] > [{ptk}{ptkƥŧꝁs}]
      const occurrences = findAllOf(['b', 'd', 'g', 'ɣ'], str);
      if (occurrences.length === 0) return str;
      const replacements = {
        'b': 'p',
        'd': 't',
        'g': 'k',
        'ɣ': 'k',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, nextChar } = occurrences[i];
        if (['p', 't', 'k', 'ƥ', 'ŧ', 'ꝁ', 's'].includes(nextChar)) {
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
        }
      }
      return result;
    },
  },
  '242344611': {
    orderId: '00031',
    pattern: '[wau] > [au|wā]',
    description: '[wau] became [au] or [wā]',
    url: 'https://eldamo.org/content/words/word-242344611.html',
    input: [
      {
        name: 'useAu',
        label: 'Use [au]',
        type: 'boolean',
        default: false,
        description: 'Use [au] instead of [wā]',
      },
    ],
    mechanic: (str, { useAu = false } = {}) => {
      if (str.includes('wau')) {
        if (useAu) {
          return str.replaceAll('wau', 'au');
        }
        return str.replaceAll('wau', 'wā');
      }
      return str;
    },
  },
  '3116232193': {
    orderId: '00032',
    pattern: '[wou] > [wō]',
    description: '[wou] became [wō]',
    url: 'https://eldamo.org/content/words/word-3116232193.html',
    mechanic: (str) => {
      if (str.includes('wou')) {
        return str.replaceAll('wou', 'wō');
      }
      return str;
    },
  },

  // Rules with order IDs (00100, 00200, 00300)
  '4183190863': {
    orderId: '00100',
    pattern: '[lr] > [ll]',
    description: '[lr] became [ll]',
    url: 'https://eldamo.org/content/words/word-4183190863.html',
    mechanic: (str) => {
      if (str.includes('lr')) {
        return str.replaceAll('lr', 'll');
      }
      return str;
    },
  },
  '1056240093': {
    orderId: '00200',
    pattern: '[a{eo}] > [ā]',
    description: '[ae], [ao] became [ā]',
    url: 'https://eldamo.org/content/words/word-1056240093.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ae', 'ao'], str);
      if (occurrences.length === 0) return str;
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'ā' + result.substring(charIndex + 2);
      }
      return result;
    },
  },
  '113345945': {
    orderId: '00300',
    pattern: '[V{jw}C] > [V{iu}C]',
    description: '[j], [w] became [i], [u] before consonants',
    url: 'https://eldamo.org/content/words/word-113345945.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['j', 'w'], str);
      if (occurrences.length === 0) return str;
      const replacements = {
        'j': 'i',
        'w': 'u',
      };
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar, nextChar } = occurrences[i];
        if (prevChar.isVowel() && nextChar.isConsonant()) {
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
        }
      }
      return result;
    },
  },
};