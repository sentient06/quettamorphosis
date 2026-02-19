import './utils.js'; // Load String prototype extensions
import {
  digraphsToSingle,
  singleToDigraphs,
  syllabify,
  breakIntoVowelsAndConsonants,
  removeDigraphs,
  restoreDigraphs,
  shouldRevertToDigraphs,
  findFirstOf,
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
      const singleCharsStr = digraphsToSingle(str);
      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(singleCharsStr);
      // 1. It's polysyllable:
      if (syllableData.length > 1) {
        // 2. Ends in -i:
        const lastChar = singleCharsStr.nth(-1);
        if (lastChar === 'i') {
          // 3. Penultimate is a vowel:
          const secondLastChar = singleCharsStr.nth(-2).removeMarks();
          if (secondLastChar.isVowel()) {
            // 4. It's a valid diphthong:
            if (['a', 'e', 'o'].includes(secondLastChar)) {
              const revert = shouldRevertToDigraphs(str, singleCharsStr);
              const result = singleCharsStr.substring(0, singleCharsStr.length - 2) + 'ī';
              return revert ? singleToDigraphs(result) : result;
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
      const singleCharsStr = digraphsToSingle(str).replaceAll('ñ', 'ŋ');
      if (singleCharsStr.startsWith('ŋ')) {
        const nextChar = singleCharsStr.nth(1);
        const i = nextChar === 'g' ? 2 : 1;
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const result = 'g' + singleCharsStr.substring(i, singleCharsStr.length);
        return revert ? singleToDigraphs(result) : result;
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
        const singleCharsStr = digraphsToSingle(str.toNormalScript());
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const { found, matched } = findFirstOf(['bd', 'gd'], singleCharsStr);
        if (found) {
          const replacements = {
            'bd': 'ud',
            'gd': 'id',
          }
          const result = singleCharsStr.replace(matched, replacements[matched]);
          return revert ? singleToDigraphs(result) : result;
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
        const singleCharsStr = digraphsToSingle(str.toNormalScript());
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const { charIndex, nextChar } = findFirstOf(['ɣ'], singleCharsStr);
        if (nextChar === 'r') {
          const result = singleCharsStr.substring(0, charIndex) + 'g' + singleCharsStr.substring(charIndex + 1);
          if (revert) return singleToDigraphs(result);
          return result;
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
    skip: true,
    mechanic: (str) => {
      // Convert digraphs first (before toNormalScript would destroy kʰ → kh distinction)
      const singleCharsStr = digraphsToSingle(str);
      // After digraph conversion: kʰ→ꝁ, so search for ꝁj (not kʰj)
      const { found, matched, charIndex, nextChar, prevChar } = findFirstOf(['kj', 'ꝁj', 'gj', 'skj', 'ŋgj'], singleCharsStr);
      if (found) {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const replacements = {
          'kj': 'k',
          'ꝁj': 'ꝁ',
          'gj': 'g',
          'skj': 'sk',
          'ŋgj': 'ŋg',
        },
        result = singleCharsStr.replaceAll(matched, replacements[matched]);
        if (revert) return singleToDigraphs(result);
        return result;
      }
      return str;
    },
  },
  '1484184939': {
    orderId: '00700',
    pattern: '[m{jw}|-mw] > [n{jw}|-mm]',
    description: 'medial [m] became [n] before [j], [w]',
    url: 'https://eldamo.org/content/words/word-1484184939.html',
    skip: true,
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
    skip: true,
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
    skip: true,
    mechanic: (str) => {
      const firstChar = str.nth(0);
      if (['ṃ', 'ṇ', 'ŋ̣', 'm', 'n', 'ŋ'].includes(firstChar)) {
        const replacements = {
          'ṃ': 'am',
          'ṇ': 'an',
          'ŋ̣': 'aŋ',
          'm': 'am',
          'n': 'an',
          'ŋ': 'aŋ',
        };
        return replacements[firstChar] + str.substring(1);
      }
      return str;
    },
  },
  '3463937975': {
    orderId: '01000',
    pattern: '[{ptk}{mn}] > [{bdg}{mnŋ}]',
    description: 'voiceless stops were voiced before nasals',
    url: 'https://eldamo.org/content/words/word-3463937975.html',
    skip: true,
    mechanic: (str) => {
      const { found, matched, charIndex, nextChar } = findFirstOf(['pn', 'tn', 'kn', 'pm', 'tm', 'km'], str);
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
    skip: true,
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const { found, matched, charIndex, nextChar, prevChar } = findFirstOf(['ŧm', 'ƥm', 'ꝁm'], singleCharsStr);
      if (found) {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const replacements = {
          'ŧm': 'ŧw',
          'ƥm': 'ƥw',
          'ꝁm': 'ꝁw',
        };
        const result = singleCharsStr.replace(matched, replacements[matched]);
        if (revert) return singleToDigraphs(result);
        return result;
      }
      return str;
    },
  },
  // '1757900715': {
  //   orderId: '01200',
  //   pattern: '[tʰn] > [ttʰ]',
  //   description: '[tʰn] became [ttʰ]',
  //   url: 'https://eldamo.org/content/words/word-1757900715.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '1789116309': {
  //   orderId: '01300',
  //   pattern: '[-Vd] > [-V̄ø]',
  //   description: 'final [d] spirantalized and vanished',
  //   url: 'https://eldamo.org/content/words/word-1789116309.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '300026073': {
  //   orderId: '01400',
  //   pattern: '[-tʰ] > [-t]',
  //   description: 'final [tʰ] became [t]',
  //   url: 'https://eldamo.org/content/words/word-300026073.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '3229649933': {
  //   orderId: '01500',
  //   pattern: '[-sj-|-sw-] > [-xʲ-|-xʷ-]',
  //   description: 'medial [sj], [sw] became [xʲ], [xʷ]',
  //   url: 'https://eldamo.org/content/words/word-3229649933.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '2753394075': {
  //   orderId: '01600',
  //   pattern: '[-SV̄] > [-SV̆]',
  //   description: 'long final vowels were shortened',
  //   url: 'https://eldamo.org/content/words/word-2753394075.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '1249932447': {
  //   orderId: '01700',
  //   pattern: '[Vzd] > [V̄d]',
  //   description: '[z] vanished before [d] lengthening preceding vowel',
  //   url: 'https://eldamo.org/content/words/word-1249932447.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '2107885715': {
  //   orderId: '01800',
  //   pattern: '[ṣ-] > [es-]',
  //   description: 'syllabic initial [s] became [es]',
  //   url: 'https://eldamo.org/content/words/word-2107885715.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '3923357111': {
  //   orderId: '01900',
  //   pattern: '[s{jwmnrl}-] > [{j̊w̥m̥n̥l̥r̥}-]',
  //   description: 'initial [s] unvoiced following consonants',
  //   url: 'https://eldamo.org/content/words/word-3923357111.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '1763851339': {
  //   orderId: '02000',
  //   pattern: '[-se|-ste|-sse] > [-sa|-sta|-sse]',
  //   description: 'final [e] became [a] after single [s] and [st]',
  //   url: 'https://eldamo.org/content/words/word-1763851339.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '798037075': {
  //   orderId: '02100',
  //   pattern: '[s{ptk}-] > [s{ɸθx}-]',
  //   description: 'voiceless stops became spirants after initial [s]',
  //   url: 'https://eldamo.org/content/words/word-798037075.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '1683955225': {
  //   orderId: '02200',
  //   pattern: '[{ptkmnŋlr}{ptk}] > [{ptkmnŋlr}{ptk}ʰ]',
  //   description: 'voiceless stops aspirated after consonants except [s]',
  //   url: 'https://eldamo.org/content/words/word-1683955225.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '883570327': {
  //   orderId: '02300',
  //   pattern: '[{ptk}ʰ|{ptk}{ptk}ʰ] > [{ɸθx}|{ɸθx}{ɸθx}]',
  //   description: 'aspirates became voiceless spirants',
  //   url: 'https://eldamo.org/content/words/word-883570327.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '2662025405': {
  //   orderId: '02400',
  //   pattern: '[eu] > [iu]',
  //   description: '[eu] became [iu]',
  //   url: 'https://eldamo.org/content/words/word-2662025405.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '2858643115': {
  //   orderId: '02500',
  //   pattern: '[ā|au] > [ǭ]',
  //   description: '[ā], [au] became [ǭ]',
  //   url: 'https://eldamo.org/content/words/word-2858643115.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '161840619': {
  //   orderId: '02600',
  //   pattern: '[VjV|-Vj] > [ViV|-Vi]',
  //   description: '[j] became [i] after vowels',
  //   url: 'https://eldamo.org/content/words/word-161840619.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '1942848653': {
  //   orderId: '02700',
  //   pattern: '[ei|ou] > [ī|ū]',
  //   description: '[ei], [ou] became [ī], [ū]',
  //   url: 'https://eldamo.org/content/words/word-1942848653.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '2010669085': {
  //   orderId: '02800',
  //   pattern: '[oi|ǭi] > [ui|oi]',
  //   description: '[oi], [ǭi] became [ui], [oi]',
  //   url: 'https://eldamo.org/content/words/word-2010669085.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '1716741635': {
  //   orderId: '02900',
  //   pattern: '[-{sm|sn}-] > [-{mm|nn}-]',
  //   description: 'medial [s] assimilated to following nasal',
  //   url: 'https://eldamo.org/content/words/word-1716741635.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '3388236413': {
  //   orderId: '03000',
  //   pattern: '[VsV|-Vs] > [VhV|-Vh]',
  //   description: 'intervocalic [s] became [h]',
  //   url: 'https://eldamo.org/content/words/word-3388236413.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '1516403107': {
  //   orderId: '03100',
  //   pattern: '[ps|ts|ks] > [ɸɸ|θθ|xx]',
  //   description: '[p], [t], [k] spirantalized before [s]',
  //   url: 'https://eldamo.org/content/words/word-1516403107.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '1288402337': {
  //   orderId: '03200',
  //   pattern: '[rl] > [ll]',
  //   description: '[rl] became [ll]',
  //   url: 'https://eldamo.org/content/words/word-1288402337.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '2851583127': {
  //   orderId: '03300',
  //   pattern: '[{ji|jui}-] > [{i|ui}-]',
  //   description: '[j] vanished before [i], [ui]',
  //   url: 'https://eldamo.org/content/words/word-2851583127.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '2167009353': {
  //   orderId: '03400',
  //   pattern: '[{uw|wu}] > [u]',
  //   description: '[w] vanished before [u]',
  //   url: 'https://eldamo.org/content/words/word-2167009353.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
  // '2615312913': {
  //   orderId: '03500',
  //   pattern: '[bm|dn] > [mm|nn]',
  //   description: '[bm], [dn] became [mm], [nn]',
  //   url: 'https://eldamo.org/content/words/word-2615312913.html',
  //   skip: true,
  //   mechanic: (str) => {
  //     // @TODO: implement
  //     return str;
  //   },
  // },
};
