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

export const oldSindarinRules = {
  '71909447': {
    orderId: '00100',
    pattern: '[-SVi] > [-Sī]',
    description: 'final i-diphthongs became long [ī] in polysyllables',
    url: 'https://eldamo.org/content/words/word-71909447.html',
    mechanic: (str) => {
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(str);
      // 1. It's polysyllable:
      if (syllableData.length > 1) {
        // 2. Ends in -i:
        const lastChar = str.nth(-1);
        if (lastChar === 'i') {
          // 3. Penultimate is a vowel:
          const secondLastChar = str.nth(-2).removeMarks();
          if (secondLastChar.isVowel()) {
            // 4. It's a valid diphthong:
            if (['a', 'e', 'o'].includes(secondLastChar)) {
              return str.substring(0, str.length - 2) + 'ī';
            }
          }
        }
      }
      return str;
    },
  },
  '1989991061': {
    orderId: '00200',
    pattern: '[ŋ-] > [ŋg-]',
    description: 'initial [ŋ] became [ŋg] or [g]',
    url: 'https://eldamo.org/content/words/word-1989991061.html',
    mechanic: (str) => {
      const normalizedStr = str.replaceAll('ñ', 'ŋ');
      if (normalizedStr.startsWith('ŋ')) {
        const nextChar = normalizedStr.nth(1);
        const i = nextChar === 'g' ? 2 : 1;
        return 'g' + normalizedStr.substring(i, normalizedStr.length);
      }
      return str;
    },
  },
  '4282797219': {
    orderId: '00300',
    pattern: '[Vb{bdg}|Vg{bdg}] > [Vu{bdg}|Vi{bdg}]',
    description: 'first in pair of voiced stops vocalized',
    url: 'https://eldamo.org/content/words/word-4282797219.html',
    mechanic: (str) => {
      if (str.includes('d')) {
        const normalizedStr = str.toNormalScript();
        const { found, matched } = findFirstOf(['bd', 'gd'], normalizedStr);
        if (found) {
          const replacements = {
            'bd': 'ud',
            'gd': 'id',
          }
          return normalizedStr.replace(matched, replacements[matched]);
        }
      }
      return str;
    },
  },
  '107931923': {
    orderId: '00400',
    pattern: '[ɣ{mnlr}] > [g{mnlr}]',
    description: '[ɣ] became [g] before nasals and liquids',
    url: 'https://eldamo.org/content/words/word-107931923.html',
    mechanic: (str) => {
      if (str.includes('ɣ')) {
        const normalizedStr = str.toNormalScript();
        const { charIndex, nextChar } = findFirstOf(['ɣ'], normalizedStr);
        if (nextChar === 'r') {
          return normalizedStr.substring(0, charIndex) + 'g' + normalizedStr.substring(charIndex + 1);
        }
      }
      return str;
    },
  },
  '1117448055': {
    orderId: '00500',
    pattern: '[{ɣh}-] > [ø-]',
    description: 'initial [ɣ]/[h] vanished',
    url: 'https://eldamo.org/content/words/word-1117448055.html',
    mechanic: (str) => {
      if (str.startsWith('ɣ')) {
        return str.slice(1);
      }
      return str;
    },
  },
  '345959193': {
    orderId: '00600',
    pattern: '[{kkʰg}j-|skj-|ŋgj] > [{kkʰg}-|sk-|ŋg]',
    description: '[j] was lost after initial velars',
    url: 'https://eldamo.org/content/words/word-345959193.html',
    mechanic: (str) => {
      // kʰ is already ꝁ (single char), so search for ꝁj (not kʰj)
      const { found, matched } = findFirstOf(['kj', 'ꝁj', 'gj', 'skj', 'ŋgj'], str);
      if (found) {
        const replacements = {
          'kj': 'k',
          'ꝁj': 'ꝁ',
          'gj': 'g',
          'skj': 'sk',
          'ŋgj': 'ŋg',
        };
        return str.replaceAll(matched, replacements[matched]);
      }
      return str;
    },
  },
  '1484184939': {
    orderId: '00700',
    pattern: '[m{jw}|-mw] > [n{jw}|-mm]',
    description: 'medial [m] became [n] before [j], [w]',
    url: 'https://eldamo.org/content/words/word-1484184939.html',
    mechanic: (str) => {
      if (str.includes('m')) {
        const { found, charIndex, nextChar } = findFirstOf(['m'], str);
        if (found && charIndex > 0) {
          if (['j', 'w'].includes(nextChar)) {
            if (charIndex === str.length - 2 && nextChar === 'w') {
              return str.substring(0, charIndex) + 'mm';
            }
            return str.substring(0, charIndex) + 'n' + str.substring(charIndex + 1);
          }
        }
      }
      return str;
    },
  },
  '1955360003': {
    orderId: '00800',
    pattern: '[m{lr}-] > [b{lr}-]',
    description: 'initial [ml], [mr] became [bl], [br]',
    url: 'https://eldamo.org/content/words/word-1955360003.html',
    mechanic: (str) => {
      if (str.nth(0) === 'm') {
        const nextChar = str.nth(1);
        if (['l', 'r'].includes(nextChar)) {
          return 'b' + str.substring(1);
        }
      }
      return str;
    },
  },
  '1024355367': {
    orderId: '00900',
    pattern: '[{ṃṇŋ̣}-] > [a{mnŋ}-]',
    description: 'initial syllabic [m], [n], [ŋ] became [am], [an], [aŋ]',
    url: 'https://eldamo.org/content/words/word-1024355367.html',
    mechanic: (str) => {
      const firstChar = str.nth(0);
      const firstChars = str.nth(0, 2);
      if (['ṃ', 'ṇ'].includes(firstChar)) {
        const replacements = {
          'ṃ': 'am',
          'ṇ': 'an',
        };
        return replacements[firstChar] + str.substring(1);
      }
      if (firstChars === 'ŋ̣') {
        return 'aŋ' + str.substring(2);
      }
      return str;
    },
  },
  '3463937975': {
    orderId: '01000',
    pattern: '[{ptk}{mn}] > [{bdg}{mnŋ}]',
    description: 'voiceless stops were voiced before nasals',
    url: 'https://eldamo.org/content/words/word-3463937975.html',
    mechanic: (str) => {
      const { found, matched } = findFirstOf(['pn', 'tn', 'kn', 'pm', 'tm', 'km'], str);
      if (found) {
        const replacements = {
          'pn': 'bn',
          'tn': 'dn',
          'kn': 'gn',
          'pm': 'bm',
          'tm': 'dm',
          'km': 'gm',
        };
        return str.replaceAll(matched, replacements[matched]);
      }
      return str;
    },
  },
  '3883770909': {
    orderId: '01100',
    pattern: '[{ptk}ʰm] > [{ptk}ʰw]',
    description: '[m] became [w] after aspirates',
    url: 'https://eldamo.org/content/words/word-3883770909.html',
    mechanic: (str) => {
      // ŧ=tʰ, ƥ=pʰ, ꝁ=kʰ (single char forms)
      const { found, matched } = findFirstOf(['ŧm', 'ƥm', 'ꝁm'], str);
      if (found) {
        const replacements = {
          'ŧm': 'ŧw',
          'ƥm': 'ƥw',
          'ꝁm': 'ꝁw',
        };
        return str.replace(matched, replacements[matched]);
      }
      return str;
    },
  },
  '1757900715': {
    orderId: '01200',
    pattern: '[tʰn] > [ttʰ]',
    description: '[tʰn] became [ttʰ]',
    url: 'https://eldamo.org/content/words/word-1757900715.html',
    mechanic: (str) => {
      // ŧ = tʰ (single char form)
      const { found } = findFirstOf(['ŧn'], str);
      if (found) {
        return str.replace('ŧn', 'tŧ');
      }
      return str;
    },
  },
  '1789116309': {
    orderId: '01300',
    pattern: '[-Vd] > [-V̄ø]',
    description: 'final [d] spirantalized and vanished',
    url: 'https://eldamo.org/content/words/word-1789116309.html',
    mechanic: (str) => {
      if (str.endsWith('d')) {
        const penultimateChar = str.nth(-2);
        if (penultimateChar.isVowel()) {
          const longVowel = penultimateChar.addMark('¯');
          return str.substring(0, str.length - 2) + longVowel;
        }
      }
      return str;
    },
  },
  '300026073': {
    orderId: '01400',
    pattern: '[-tʰ] > [-t]',
    description: 'final [tʰ] became [t]',
    url: 'https://eldamo.org/content/words/word-300026073.html',
    mechanic: (str) => {
      // ŧ = tʰ (single char form)
      if (str.endsWith('ŧ')) {
        return str.substring(0, str.length - 1) + 't';
      }
      return str;
    },
  },
  '3229649933': {
    orderId: '01500',
    pattern: '[-sj-|-sw-] > [-xʲ-|-xʷ-]',
    description: 'medial [sj], [sw] became [xʲ], [xʷ]',
    url: 'https://eldamo.org/content/words/word-3229649933.html',
    mechanic: (str) => {
      // ꜧ = xʲ, ƕ = xʷ (single char forms)
      if (str.includes('sj') || str.includes('sw')) {
        return str.replaceAll('sj', 'ꜧ').replaceAll('sw', 'ƕ');
      }
      return str;
    },
  },
  '2753394075': {
    orderId: '01600',
    pattern: '[-SV̄] > [-SV̆]',
    description: 'long final vowels were shortened',
    url: 'https://eldamo.org/content/words/word-2753394075.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      const mark = lastChar.getMark();
      if (['¯', '´', '^'].includes(mark)) {
        return str.substring(0, str.length - 1) + lastChar.removeMarks();
      }
      return str;
    },
  },
  '1249932447': {
    orderId: '01700',
    pattern: '[Vzd] > [V̄d]',
    description: '[z] vanished before [d] lengthening preceding vowel',
    url: 'https://eldamo.org/content/words/word-1249932447.html',
    mechanic: (str) => {
      if (str.includes('zd')) {
        const { found, charIndex, nextChar, prevChar } = findFirstOf(['z'], str);
        if (found && nextChar === 'd' && prevChar.isVowel()) {
          return str.substring(0, charIndex - 1) + prevChar.addMark('¯') + str.substring(charIndex + 1);
        }
      }
      return str;
    },
  },
  '2107885715': {
    orderId: '01800',
    pattern: '[ṣ-] > [es-]',
    description: 'syllabic initial [s] became [es]',
    url: 'https://eldamo.org/content/words/word-2107885715.html',
    mechanic: (str) => {
      if (str.startsWith('ṣ')) {
        const secondChar = str.nth(1);
        if (['c', 'k', 'p', 't'].includes(secondChar)) {
          return 'es' + str.substring(1);
        }
      }
      return str;
    },
  },
  '3923357111': {
    orderId: '01900',
    pattern: '[s{jwmnrl}-] > [{j̊w̥m̥n̥l̥r̥}-]',
    description: 'initial [s] unvoiced following consonants',
    url: 'https://eldamo.org/content/words/word-3923357111.html',
    mechanic: (str) => {
      if (str.startsWith('s')) {
        const { found, charIndex } = findFirstOf(['sj', 'sw', 'sm', 'sn', 'sl', 'sr'], str);
        if (found && charIndex === 0) {
          // Convert to unvoiced consonant: mh, nh, lh, rh, etc.
          // These become single chars via the DIGRAPH_MAP
          const secondChar = str.nth(1);
          const unvoiced = secondChar + 'h';
          // Use the DIGRAPH_MAP mappings: mh→ꟃ, nh→ꞃ, lh→ꝉ, rh→ꞧ, wh→ƕ
          const unvoicedMap = {
            'j': 'j̊',
            'w': 'ƕ',
            'm': 'ꟃ',
            'n': 'ꞃ',
            'l': 'ꝉ',
            'r': 'ꞧ',
          };
          return (unvoicedMap[secondChar] || unvoiced) + str.substring(2);
        }
      }
      return str;
    },
  },
  '1763851339': {
    orderId: '02000',
    pattern: '[-se|-ste|-sse] > [-sa|-sta|-sse]',
    description: 'final [e] became [a] after single [s] and [st]',
    url: 'https://eldamo.org/content/words/word-1763851339.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      if (lastChar === 'e') {
        const secondLastChar = str.nth(-2);
        const thirdLastChar = str.nth(-3);
        if (thirdLastChar === 's') {
          if (secondLastChar === 't') {
            return str.substring(0, str.length - 1) + 'a';
          }
          if (secondLastChar === 's') {
            return str;
          }
        }
        if (secondLastChar === 's') {
          return str.substring(0, str.length - 1) + 'a';
        }
        if (thirdLastChar === 'r' && secondLastChar === 't') {
          return str.substring(0, str.length - 1) + 'a';
        }
      }
      return str;
    },
  },
  '798037075': {
    orderId: '02100',
    pattern: '[s{ptk}-] > [s{ɸθx}-]',
    description: 'voiceless stops became spirants after initial [s]',
    url: 'https://eldamo.org/content/words/word-798037075.html',
    mechanic: (str) => {
      const firstChar = str.nth(0);
      if (firstChar === 's') {
        const secondChar = str.nth(1);
        if (secondChar === 'p') {
          return 'sɸ' + str.substring(2);
        }
        if (secondChar === 't') {
          return 'sθ' + str.substring(2);
        }
        if (secondChar === 'k') {
          return 'sx' + str.substring(2);
        }
      }
      return str;
    },
  },
  '1683955225': {
    orderId: '02200',
    pattern: '[{ptkmnŋlr}{ptk}] > [{ptkmnŋlr}{ptk}ʰ]',
    description: 'voiceless stops aspirated after consonants except [s]',
    url: 'https://eldamo.org/content/words/word-1683955225.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['p', 't', 'k', 'c'], str);
      if (occurrences.length > 0) {
        const validConsonants = ['r', 'l', 'm', 'n', 'ŋ', 'd', 'b', 'g', 'p', 't', 'k', 'c', 'x'];
        const results = [];
        for (const occurrence of occurrences) {
          const { charIndex, prevChar } = occurrence;
          if (validConsonants.includes(prevChar)) {
            results.push(charIndex);
          }
        }
        let result = str;
        for (const charIndex of results) {
          const mutatedChar = digraphsToSingle(result.nth(charIndex) + 'ʰ');
          result = result.substring(0, charIndex) + mutatedChar + result.substring(charIndex + 1);
        }
        return result;
      }
      return str;
    },
  },
  '883570327': {
    orderId: '02300',
    pattern: '[{ptk}ʰ|{ptk}{ptk}ʰ] > [{ɸθx}|{ɸθx}{ɸθx}]',
    description: 'aspirates became voiceless spirants',
    url: 'https://eldamo.org/content/words/word-883570327.html',
    mechanic: (str) => {
      // ƥ=pʰ, ŧ=tʰ, ꝁ=kʰ (single char forms for aspirated stops)
      const { found, matched, prevChar } = findFirstOf(['ƥ', 'ŧ', 'ꝁ'], str);
      if (found) {
        const replacements = {
          'pƥ': 'ɸɸ',
          'pŧ': 'ɸθ',
          'tŧ': 'θθ',
          'tꝁ': 'xx',
          'kŧ': 'xθ',
          'kꝁ': 'xx',
        };
        const simpleReplacements = {
          'ƥ': 'ɸ',
          'ŧ': 'θ',
          'ꝁ': 'x',
        };

        const sequence = `${prevChar}${matched}`;
        let replacee = null;
        let replacer = null;

        if (replacements[sequence]) {
          replacee = sequence;
          replacer = replacements[sequence];
        } else if (simpleReplacements[matched]) {
          replacee = matched;
          replacer = simpleReplacements[matched];
        }

        if (replacee && replacer) {
          return str.replaceAll(replacee, replacer);
        }
      }
      return str;
    },
  },
  '2662025405': {
    orderId: '02400',
    pattern: '[eu] > [iu]',
    description: '[eu] became [iu]',
    url: 'https://eldamo.org/content/words/word-2662025405.html',
    mechanic: (str) => {
      if (str.includes('eu')) {
        return str.replaceAll('eu', 'iu');
      }
      return str;
    },
  },
  '2858643115': {
    orderId: '02500',
    pattern: '[ā|au] > [ǭ]',
    description: '[ā], [au] became [ǭ]',
    url: 'https://eldamo.org/content/words/word-2858643115.html',
    mechanic: (str) => {
      const { found, matched } = findFirstOf(['ā', 'á', 'â', 'au'], str);
      if (found) {
        const result = str.replaceAll(matched, 'ǭ');
        return result;
      }
      return str;
    },
  },
  '161840619': {
    orderId: '02600',
    pattern: '[VjV|-Vj] > [ViV|-Vi]',
    description: '[j] became [i] after vowels',
    url: 'https://eldamo.org/content/words/word-161840619.html',
    mechanic: (str) => {
      if (str.includes('j')) {
        const { found, charIndex, nextChar, prevChar } = findFirstOf(['j'], str);
        if (found) {
          let result = str;
          if (nextChar) {
            if (prevChar.isVowel() && nextChar.isVowel()) {
              result = str.substring(0, charIndex) + 'i' + str.substring(charIndex + 1);
            }
          }
          if (prevChar.isVowel() && charIndex === str.length - 1) {
            result = str.substring(0, charIndex) + 'i';
          }
          return result.replace('ii', 'ī');
        }
      }
      return str;
    },
  },
  '1942848653': {
    orderId: '02700',
    pattern: '[ei|ou] > [ī|ū]',
    description: '[ei], [ou] became [ī], [ū]',
    url: 'https://eldamo.org/content/words/word-1942848653.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ei', 'ou'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'ei': 'ī',
          'ou': 'ū',
        };
        for(const occurrence of occurrences) {
          const { matched, charIndex, nextChar } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
          if (nextChar) {
            if (nextChar.isVowel()) {
              const hasMark = nextChar.getMark();
              if (hasMark) {
                result = result.substring(0, result.length - 1) + nextChar.removeMarks();
              }
            }
          }
        }
        return result;
      }
      return str;
    },
  },
  '2010669085': {
    orderId: '02800',
    pattern: '[oi|ǭi] > [ui|oi]',
    description: '[oi], [ǭi] became [ui], [oi]',
    url: 'https://eldamo.org/content/words/word-2010669085.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['oi', 'ǭi'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'oi': 'ui',
          'ǭi': 'oi',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        return result;
      }
      return str;
    },
  },
  '1716741635': {
    orderId: '02900',
    pattern: '[-{sm|sn}-] > [-{mm|nn}-]',
    description: 'medial [s] assimilated to following nasal',
    url: 'https://eldamo.org/content/words/word-1716741635.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['sm', 'sn'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'sm': 'mm',
          'sn': 'nn',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex, prevChar, nextChar } = occurrence;
          if (charIndex === 0 || nextChar === '') continue;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        return result;
      }
      return str;
    },
  },
  '3388236413': {
    orderId: '03000',
    pattern: '[VsV|-Vs] > [VhV|-Vh]',
    description: 'intervocalic [s] became [h]',
    url: 'https://eldamo.org/content/words/word-3388236413.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['s'], str);
      if (occurrences.length > 0) {
        let result = str;
        for (const occurrence of occurrences) {
          const { charIndex, prevChar, nextChar } = occurrence;
          if (charIndex === 0 || nextChar === '') continue;
          if (prevChar.isVowel() && nextChar.isVowel()) {
            result = result.substring(0, charIndex) + 'h' + result.substring(charIndex + 1);
          }
        }
        return result;
      }
      return str;
    },
  },
  '1516403107': {
    orderId: '03100',
    pattern: '[ps|ts|ks] > [ɸɸ|θθ|xx]',
    description: '[p], [t], [k] spirantalized before [s]',
    url: 'https://eldamo.org/content/words/word-1516403107.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ps', 'ts', 'ks'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'ps': 'ɸɸ',
          'ts': 'θθ',
          'ks': 'xx',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        return result;
      }
      return str;
    },
  },
  '1288402337': {
    orderId: '03200',
    pattern: '[rl] > [ll]',
    description: '[rl] became [ll]',
    url: 'https://eldamo.org/content/words/word-1288402337.html',
    skip: true,
    info: ['This was not true of later or reformed compounds.', 'This rule is skipped by default.'],
    mechanic: (str) => {
      const occurrences = findAllOf(['rl'], str);
      if (occurrences.length > 0) {
        let result = str;
        for (const occurrence of occurrences) {
          const { charIndex } = occurrence;
          result = result.substring(0, charIndex) + 'll' + result.substring(charIndex + 2);
        }
        return result;
      }
      return str;
    },
  },
  '2851583127': {
    orderId: '03300',
    pattern: '[{ji|jui}-] > [{i|ui}-]',
    description: '[j] vanished before [i], [ui]',
    url: 'https://eldamo.org/content/words/word-2851583127.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['ji', 'jui'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'ji': 'i',
          'jui': 'ui',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + matched.length);
        }
        return result;
      }
      return str;
    },
  },
  '2167009353': {
    orderId: '03400',
    pattern: '[{uw|wu}] > [u]',
    description: '[w] vanished before [u]',
    url: 'https://eldamo.org/content/words/word-2167009353.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      const occurrences = findAllOf(['uw', 'wu'], unmarkedStr);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'uw': 'u',
          'wu': 'u',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + matched.length);
        }
        return result;
      }
      return str;
    },
  },
  '2615312913': {
    orderId: '03500',
    pattern: '[bm|dn] > [mm|nn]',
    description: '[bm], [dn] became [mm], [nn]',
    url: 'https://eldamo.org/content/words/word-2615312913.html',
    mechanic: (str) => {
      const occurrences = findAllOf(['bm', 'dn'], str);
      if (occurrences.length > 0) {
        let result = str;
        const replacements = {
          'bm': 'mm',
          'dn': 'nn',
        };
        for (const occurrence of occurrences) {
          const { matched, charIndex } = occurrence;
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        }
        return result;
      }
      return str;
    },
  },
};
