/**
 * Sandhi Rules for Sindarin
 *
 * These are experimental phonetic rules that occur at morpheme boundaries
 * and in consonant clusters. They were originally sub-rules of Rule 05800.
 *
 * Rule IDs: 5800000116 - 5800000165
 * Order IDs: 05801 - 05850 (formula: 5800 + sandhiNumber - 115)
 *
 * Master Switch: Rule 3868328117 (orderId 05800) controls all sandhi rules.
 * When the master switch is disabled, all sandhi rules are effectively disabled.
 */

import './utils.js'; // Load String prototype extensions
import {
  findAllOf,
  recalcMorphemes,
  SyllableAnalyser,
} from './utils.js';

// Master switch rule ID (Rule 05800)
export const SANDHI_MASTER_RULE_ID = '3868328117';

/**
 * Helper to generate sandhi rule ID from the sandhi number (116-164)
 * @param {number} sandhiNumber - The sandhi rule number (116-164)
 * @returns {string} - The rule ID as a string
 */
export function getSandhiRuleId(sandhiNumber) {
  return String(5800000000 + sandhiNumber);
}

/**
 * Helper to generate orderId from the sandhi number
 * @param {number} sandhiNumber - The sandhi rule number (116-164)
 * @returns {string} - The orderId (e.g., '05801' for rule 116)
 */
function getOrderId(sandhiNumber) {
  return String(5800 + sandhiNumber - 115).padStart(5, '0');
}

// =============================================================================
// Sandhi Rules
// =============================================================================

export const sandhiRules = {
  // ---------------------------------------------------------------------------
  // Rule 116: h was deleted before a following consonant
  // [hC] > [øC]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(116)]: {
    orderId: getOrderId(116),
    pattern: '[hC] > [øC]',
    description: '§4.116. h was deleted before a following consonant',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['h'], str);
      
      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }
      
      let result = str;
      const removedIndices = [];
      
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (nextChar.isConsonant()) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }
      
      const updatedMorphemes = removedIndices.length > 0
        ? recalcMorphemes(result, morphemes, removedIndices)
        : morphemes;
      
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 117: nθ, mɸ, ŋx became nt, mp, ŋk at the end of a morpheme or word
  // [-{nθ|mɸ|ŋx}] > [-{nt|mp|ŋk}]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(117)]: {
    orderId: getOrderId(117),
    pattern: '[-{nθ|mɸ|ŋx}] > [-{nt|mp|ŋk}]',
    description: '§4.117. nθ, mɸ, ŋx became nt, mp, ŋk at the end of a morpheme or word',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['nθ', 'mɸ', 'ŋx'], str);
      
      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }
      
      const replacements = {
        'nθ': 'nt',
        'mɸ': 'mp',
        'ŋx': 'ŋk',
      };
      
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        const replacement = replacements[matched];
        result = result.substring(0, charIndex) + replacement + result.substring(charIndex + 2);
      }
      
      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 118: medial nθ, mɸ, ŋx became nn, mm, ŋŋ
  // [-{nθ|mɸ|ŋx}-] > [-{nn|mm|ŋŋ}-]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(118)]: {
    orderId: getOrderId(118),
    pattern: '[-{nθ|mɸ|ŋx}-] > [-{nn|mm|ŋŋ}-]',
    description: '§4.118. medial nθ, mɸ, ŋx became nn, mm, ŋŋ',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['nθ', 'mɸ', 'ŋx'], str);
      
      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }
      
      const replacements = {
        'nθ': 'nn',
        'mɸ': 'mm',
        'ŋx': 'ŋŋ',
      };
      
      let result = str;
      const removedIndices = [];
      
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, nextChar, lastChar } = occurrences[i];
        // Skip if at start or end (not medial)
        if (charIndex === 0 || lastChar) continue;
        
        const replacement = replacements[matched];
        
        if (matched === 'ŋx' && nextChar === 'j') {
          result = result.substring(0, charIndex) + 'ŋ' + result.substring(charIndex + 2);
          removedIndices.unshift(charIndex + 1);
        } else {
          result = result.substring(0, charIndex) + replacement + result.substring(charIndex + 2);
        }
      }
      
      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 119: ð was deleted before nasals
  // [ð{mnŋ}] > [ø{mnŋ}]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(119)]: {
    orderId: getOrderId(119),
    pattern: '[ð{mnŋ}] > [ø{mnŋ}]',
    description: '§4.119. ð was deleted before nasals',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ðm', 'ðn', 'ðŋ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + result.substring(charIndex + 1);
        removedIndices.unshift(charIndex);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 120: long voiceless liquids became short and voiced after any consonant or vowel
  // [X{r̥r̥|l̥l̥}] > [X{r|l}]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(120)]: {
    orderId: getOrderId(120),
    pattern: '[X{r̥r̥|l̥l̥}] > [X{r|l}]',
    description: '§4.120. long voiceless liquids became short and voiced after any consonant or vowel',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ꞧꞧ', 'ꝉꝉ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      const replacements = {
        'ꞧꞧ': 'r',
        'ꝉꝉ': 'l',
      };

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched } = occurrences[i];
        result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 2);
        removedIndices.unshift(charIndex);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 121: n, short or long, assimilated to following stop, fricative, or nasal
  // [n{bm}|n{ɣŋg}] > [m{bm}|ŋ{ɣŋg}]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(121)]: {
    orderId: getOrderId(121),
    pattern: '[n{bm}|n{ɣŋg}] > [m{bm}|ŋ{ɣŋg}]',
    description: '§4.121. n, short or long, assimilated to following stop, fricative, or nasal',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['n'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { matched, charIndex, nextChar, prevChar } = occurrences[i];
        if (['b', 'm', 'g', 'ɣ', 'ŋ'].includes(nextChar) === false) continue;

        let replacePrevious = ['b', 'm', 'g'].includes(nextChar);
        let replaceWith = ['b', 'm'].includes(nextChar) ? 'm' : 'ŋ';

        if (replacePrevious && prevChar === matched) {
          result = result.substring(0, charIndex - 1) + replaceWith + result.substring(charIndex);
        }
        result = result.substring(0, charIndex) + `${replaceWith}${nextChar}` + result.substring(charIndex + 2);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 122: ɣ disappeared between consonants
  // [CɣC] > [CøC]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(122)]: {
    orderId: getOrderId(122),
    pattern: '[CɣC] > [CøC]',
    description: '§4.122. ɣ disappeared between consonants',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ɣ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (prevChar.isConsonant() && nextChar.isConsonant()) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 123: ð became d before voiced stops
  // [ð{bdg}] > [d{bdg}]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(123)]: {
    orderId: getOrderId(123),
    pattern: '[ð{bdg}] > [d{bdg}]',
    description: '§4.123. ð became d before voiced stops',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ð'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (['b', 'd', 'g'].includes(nextChar)) {
          result = result.substring(0, charIndex) + 'd' + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 124: ð became d before l
  // [ðl] > [dl]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(124)]: {
    orderId: getOrderId(124),
    pattern: '[ðl] > [dl]',
    description: '§4.124. ð became d before l',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ð'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (nextChar === 'l') {
          result = result.substring(0, charIndex) + 'd' + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 125: ð became d at the beginning of morpheme boundaries after consonants
  // [C·ðX] > [C·dX]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(125)]: {
    orderId: getOrderId(125),
    pattern: '[C·ðX] > [C·dX]',
    description: '§4.125. ð became d at the beginning of morpheme boundaries after consonants',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ð'], str);

      if (occurrences.length === 0 || morphemes.length <= 1) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        // Check if ð is at start of a morpheme (except first)
        let posInStr = 0;
        for (let m = 0; m < morphemes.length; m++) {
          if (m > 0 && posInStr === charIndex) {
            // ð is at morpheme boundary, check if previous morpheme ends with consonant
            const prevMorpheme = morphemes[m - 1];
            const lastCharOfPrev = prevMorpheme.nth(-1);
            if (lastCharOfPrev.isConsonant()) {
              result = result.substring(0, charIndex) + 'd' + result.substring(charIndex + 1);
            }
            break;
          }
          posInStr += morphemes[m].length;
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 126: w disappeared after a vowel at the end of a morpheme before a consonant
  // [Vw·C] > [Vø·C]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(126)]: {
    orderId: getOrderId(126),
    pattern: '[Vw·C] > [Vø·C]',
    description: '§4.126. w disappeared after a vowel at the end of a morpheme before a consonant',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['w'], str);

      if (occurrences.length === 0 || morphemes.length <= 1) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        // Check if w is at end of morpheme
        let posInStr = 0;
        for (let m = 0; m < morphemes.length - 1; m++) {
          posInStr += morphemes[m].length;
          if (posInStr - 1 === charIndex) {
            // w is at end of morpheme m
            if (prevChar.isVowel() && nextChar.isConsonant()) {
              result = result.substring(0, charIndex) + result.substring(charIndex + 1);
              removedIndices.unshift(charIndex);
            }
            break;
          }
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 127: m became ɱ after a vowel, semivowel or liquid
  // [{Vwjrl}m] > [{Vwjrl}ɱ]
  // Exception: doesn't apply when m is part of a geminate cluster (mm) or followed by i/ī
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(127)]: {
    orderId: getOrderId(127),
    pattern: '[{Vwjrl}m] > [{Vwjrl}ɱ]',
    description: '§4.127. m became ɱ (nasalized v) after a vowel, semivowel or liquid',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['m'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        // Must be preceded by vowel, semivowel, or liquid
        if (!(prevChar.isVowel() || ['w', 'j', 'r', 'l'].includes(prevChar))) {
          continue;
        }
        // Exception: don't change if followed by another m (geminate cluster)
        if (nextChar === 'm') {
          continue;
        }
        // Exception: don't change if followed by i or ī
        if (['i', 'ī'].includes(nextChar)) {
          continue;
        }
        result = result.substring(0, charIndex) + 'ɱ' + result.substring(charIndex + 1);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 128: n became ð before r
  // [nr] > [ðr]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(128)]: {
    orderId: getOrderId(128),
    pattern: '[nr] > [ðr]',
    description: '§4.128. n became ð before r',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['n'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (nextChar === 'r') {
          result = result.substring(0, charIndex) + 'ð' + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 129: a long or double consonant became short when preceding another consonant
  // [C₁C₁C] > [C₁C]
  // Also handles: ſ (ss) → s, and consonant at morpheme boundary simplification
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(129)]: {
    orderId: getOrderId(129),
    pattern: '[C₁C₁C] > [C₁C]',
    description: '§4.129. a long or double consonant became short when preceding another consonant',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      let result = str;
      const removedIndices = [];

      // Handle ſ (ss) → s unconditionally (ſ represents long/double s)
      const ssOccurrences = findAllOf(['ſ'], result);
      for (let i = ssOccurrences.length - 1; i >= 0; i--) {
        const { charIndex } = ssOccurrences[i];
        result = result.substring(0, charIndex) + 's' + result.substring(charIndex + 1);
      }

      // Find morpheme boundary positions
      const morphemeBoundaries = [];
      let pos = 0;
      for (const m of morphemes) {
        pos += m.length;
        morphemeBoundaries.push(pos);
      }
      morphemeBoundaries.pop(); // Remove the last one (end of string)

      // Handle NASAL at morpheme boundary followed by another consonant
      // This is nasal assimilation/simplification at morpheme boundaries
      // Process from end to preserve indices
      const nasals = ['m', 'n', 'ŋ'];
      for (let i = morphemeBoundaries.length - 1; i >= 0; i--) {
        const boundaryIdx = morphemeBoundaries[i];
        const charBeforeBoundary = result.nth(boundaryIdx - 1 - removedIndices.length);
        const charTwoBeforeBoundary = result.nth(boundaryIdx - 2 - removedIndices.length);
        const charAtBoundary = result.nth(boundaryIdx - removedIndices.length);

        // Skip if this is a double consonant at the boundary (will be handled by double consonant logic)
        const isDoubleConsonant = charBeforeBoundary === charTwoBeforeBoundary &&
                                  charBeforeBoundary && charBeforeBoundary.isConsonant();

        // Only apply if the char before boundary is a NASAL
        if (nasals.includes(charBeforeBoundary) &&
            charAtBoundary && charAtBoundary.isConsonant() &&
            !isDoubleConsonant) {
          // Remove the nasal before the boundary
          const actualIdx = boundaryIdx - 1 - removedIndices.length;
          result = result.substring(0, actualIdx) + result.substring(actualIdx + 1);
          removedIndices.unshift(boundaryIdx - 1);
        }
      }

      // Find double consonants (after boundary processing)
      const occurrences = [];
      let match;
      const regexWithIndex = /(.)\1/g;
      while ((match = regexWithIndex.exec(result)) !== null) {
        const char = match[1];
        if (char.isConsonant()) {
          occurrences.push({
            charIndex: match.index,
            char,
            nextChar: result.nth(match.index + 2),
          });
        }
      }

      // Process from end to preserve indices
      // Shorten when: preceding another consonant OR at word-final position
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        const isWordFinal = !nextChar; // No next char = word-final
        if ((nextChar && nextChar.isConsonant()) || isWordFinal) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 130: initial x became h
  // [x-] > [h-]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(130)]: {
    orderId: getOrderId(130),
    pattern: '[x-] > [h-]',
    description: '§4.130. initial x became h',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const firstChar = str.nth(0);

      if (firstChar !== 'x') {
        return { in: str, out: str, morphemes };
      }

      const result = 'h' + str.substring(1);
      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 131: h disappeared before r
  // [hr] > [ør]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(131)]: {
    orderId: getOrderId(131),
    pattern: '[hr] > [ør]',
    description: '§4.131. h disappeared before r',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['hꞧ', 'hr'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + result.substring(charIndex + 1);
        removedIndices.unshift(charIndex);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 132: x became h at the beginning of a morpheme after a consonant, except w and liquids
  // [{^Vwrl}·x] > [{^Vwrl}·h]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(132)]: {
    orderId: getOrderId(132),
    pattern: '[{^Vwrl}·x] > [{^Vwrl}·h]',
    description: '§4.132. x became h at the beginning of a morpheme after a consonant, except w and liquids',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['x'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        // Check if x is at start of a morpheme
        let posInStr = 0;
        for (let m = 0; m < morphemes.length; m++) {
          if (m > 0 && posInStr === charIndex) {
            // x is at morpheme boundary
            if (prevChar.isConsonant() && !['w', 'r', 'l'].includes(prevChar)) {
              result = result.substring(0, charIndex) + 'h' + result.substring(charIndex + 1);
            }
            break;
          }
          posInStr += morphemes[m].length;
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 133: voiced stops (b, d, g) became voiceless (p, t, k) before h and θ
  // [{bdg}{hθ}] > [{ptk}{hθ}]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(133)]: {
    orderId: getOrderId(133),
    pattern: '[{bdg}{hθ}] > [{ptk}{hθ}]',
    description: '§4.133. voiced stops (b, d, g) became voiceless (p, t, k) before h and θ',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['b', 'd', 'g'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      const replacements = { 'b': 'p', 'd': 't', 'g': 'k' };
      let result = str;

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, nextChar } = occurrences[i];
        if (['h', 'θ'].includes(nextChar)) {
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 134: voiceless stops (p, t, k) became voiceless fricatives (f, θ, x) preceding h
  // [{ptk}h] > [{fθx}h]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(134)]: {
    orderId: getOrderId(134),
    pattern: '[{ptk}h] > [{fθx}h]',
    description: '§4.134. voiceless stops (p, t, k) became voiceless fricatives (f, θ, x) preceding h',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['p', 't', 'k'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      // Note: p → ɸ (not f) to match the ph spirant convention
      const replacements = { 'p': 'ɸ', 't': 'θ', 'k': 'x' };
      let result = str;

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, nextChar } = occurrences[i];
        if (nextChar === 'h') {
          result = result.substring(0, charIndex) + replacements[matched] + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 135: ð became θ before a voiceless sound
  // [ð{ptkfsθhxw̥l̥r̥}] > [θ{ptkfsθhxw̥l̥r̥}]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(135)]: {
    orderId: getOrderId(135),
    pattern: '[ð{ptkfsθhxw̥l̥r̥}] > [θ{ptkfsθhxw̥l̥r̥}]',
    description: '§4.135. ð became θ before a voiceless sound',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ð'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      const voiceless = ['p', 't', 'k', 'f', 's', 'θ', 'h', 'x', 'ƕ', 'ꝉ', 'ꞧ'];
      let result = str;

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (voiceless.includes(nextChar)) {
          result = result.substring(0, charIndex) + 'θ' + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 136: h disappeared after voiceless fricatives
  // [{ɸfsθhx}h] > [{ɸfsθhx}ø]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(136)]: {
    orderId: getOrderId(136),
    pattern: '[{ɸfsθhx}h] > [{ɸfsθhx}ø]',
    description: '§4.136. h disappeared after voiceless fricatives',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['h'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      // Include ſ (ss) as a voiceless fricative
      const fricatives = ['ɸ', 'f', 's', 'ſ', 'θ', 'h', 'x'];
      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        if (fricatives.includes(prevChar)) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 137: p disappeared between m and another consonant
  // [mpC] > [møC]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(137)]: {
    orderId: getOrderId(137),
    pattern: '[mpC] > [møC]',
    description: '§4.137. p disappeared between m and another consonant',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['p'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        if (prevChar === 'm' && nextChar.isConsonant()) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 138: ɣ became g after nasals
  // [{mnŋ}ɣ] > [{mnŋ}g]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(138)]: {
    orderId: getOrderId(138),
    pattern: '[{mnŋ}ɣ] > [{mnŋ}g]',
    description: '§4.138. ɣ became g after nasals',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ɣ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        if (['m', 'n', 'ŋ'].includes(prevChar)) {
          result = result.substring(0, charIndex) + 'g' + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 139: β became b after consonants except r
  // [{^Vr}β] > [{^Vr}b]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(139)]: {
    orderId: getOrderId(139),
    pattern: '[{^Vr}β] > [{^Vr}b]',
    description: '§4.139. β became b after consonants except r',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['β'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        if (prevChar.isConsonant() && prevChar !== 'r') {
          result = result.substring(0, charIndex) + 'b' + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 140: nasals disappeared between a nasal or liquid and voiced consonants
  // [{mnŋlr}{mnŋ}{bdgvðɣlr}] > [{mnŋlr}ø{bdgvðɣlr}]
  // Morpheme boundary logic:
  // - If removed nasal is at morpheme START and previous morpheme ENDS with same nasal,
  //   shrink the previous morpheme (e.g., briθaum+mbar → briθau+mbar)
  // - Otherwise, shrink the morpheme containing the removed nasal
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(140)]: {
    orderId: getOrderId(140),
    pattern: '[{mnŋlr}{mnŋ}{bdgvðɣlr}] > [{mnŋlr}ø{bdgvðɣlr}]',
    description: '§4.140. nasals disappeared between a nasal or liquid and voiced consonants, except semivowels',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      let precheckOccurrences = findAllOf(['m', 'n', 'ŋ'], str);

      if (precheckOccurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      const nasalsAndLiquids = ['m', 'n', 'ŋ', 'l', 'r'];
      const nasals = ['m', 'n', 'ŋ'];
      // Include nasals as voiced consonants - they are phonetically voiced
      const voicedConsonants = ['b', 'd', 'g', 'v', 'ð', 'ɣ', 'l', 'r', 'm', 'n', 'ŋ'];

      // Build morpheme boundary info
      const morphemeInfo = [];
      let pos = 0;
      for (let i = 0; i < morphemes.length; i++) {
        morphemeInfo.push({
          start: pos,
          end: pos + morphemes[i].length,
          content: morphemes[i],
        });
        pos += morphemes[i].length;
      }

      let result = str;
      // Track removals with info: { originalIndex, removedChar, shrinkPrevMorpheme }
      const removals = [];

      // Re-check occurrences after each removal (iterate fresh each time)
      let changed = true;
      while (changed) {
        changed = false;
        const occurrences = findAllOf(['m', 'n', 'ŋ'], result);

        for (let i = occurrences.length - 1; i >= 0; i--) {
          const { charIndex, matched, prevChar, nextChar } = occurrences[i];
          if (nasalsAndLiquids.includes(prevChar) && voicedConsonants.includes(nextChar)) {
            // Calculate original index: count how many removals were at or before this position
            // Each removal that was BEFORE or AT this position shifts the index up by 1
            let offset = 0;
            for (const r of removals) {
              if (r.originalIndex <= charIndex + offset) {
                offset++;
              }
            }
            const originalIndex = charIndex + offset;

            // Check if this nasal is at a morpheme start
            const morphemeIdx = morphemeInfo.findIndex(m => originalIndex >= m.start && originalIndex < m.end);
            const isAtMorphemeStart = morphemeInfo.some(m => m.start === originalIndex);

            // Check if previous morpheme ends with the SAME nasal
            // ONLY shrink prev morpheme if the nasal at prev morpheme's end does NOT independently match the removal pattern
            let shrinkPrevMorpheme = false;
            if (isAtMorphemeStart && morphemeIdx > 0) {
              const prevMorpheme = morphemeInfo[morphemeIdx - 1];
              const prevMorphemeLastChar = prevMorpheme.content.nth(-1);
              if (prevMorphemeLastChar === matched) {
                // Check if the nasal at prev morpheme's end would independently match
                // It matches if: its prev char is nasal/liquid AND its next char is voiced consonant
                const prevMorphemeLastIdx = prevMorpheme.end - 1;
                const charBeforePrevEnd = str.nth(prevMorphemeLastIdx - 1) || '';
                const charAfterPrevEnd = str.nth(prevMorphemeLastIdx + 1) || '';
                const prevEndMatchesIndependently =
                  nasalsAndLiquids.includes(charBeforePrevEnd) && voicedConsonants.includes(charAfterPrevEnd);

                // Only shrink prev morpheme if the nasal there does NOT match on its own
                if (!prevEndMatchesIndependently) {
                  shrinkPrevMorpheme = true;
                }
              }
            }

            result = result.substring(0, charIndex) + result.substring(charIndex + 1);
            removals.push({ originalIndex, removedChar: matched, shrinkPrevMorpheme, morphemeIdx });
            changed = true;
            break; // Re-scan after removal
          }
        }
      }

      // Custom morpheme recalculation
      // We need to track how many chars have been removed from each morpheme
      const morphemeOffsets = morphemes.map(() => ({ fromStart: 0, fromEnd: 0 }));

      for (const removal of removals) {
        if (removal.shrinkPrevMorpheme) {
          // The nasal at the START of morpheme N matched the nasal at the END of morpheme N-1
          // Remove from the END of the previous morpheme
          morphemeOffsets[removal.morphemeIdx - 1].fromEnd++;
        } else {
          // Find where in the morpheme this removal is
          let morphemeStart = 0;
          for (let i = 0; i < removal.morphemeIdx; i++) {
            morphemeStart += morphemes[i].length;
          }
          const localIdx = removal.originalIndex - morphemeStart;

          // If it's at the start of the morpheme, remove from start
          if (localIdx === 0) {
            morphemeOffsets[removal.morphemeIdx].fromStart++;
          } else if (localIdx === morphemes[removal.morphemeIdx].length - 1) {
            // If it's at the end, remove from end
            morphemeOffsets[removal.morphemeIdx].fromEnd++;
          } else {
            // It's in the middle - this shouldn't happen much, but handle it
            // Just mark it as fromEnd for simplicity
            morphemeOffsets[removal.morphemeIdx].fromEnd++;
          }
        }
      }

      // Apply the offsets to create updated morphemes
      const updatedMorphemes = morphemes.map((m, i) => {
        const start = morphemeOffsets[i].fromStart;
        const end = m.length - morphemeOffsets[i].fromEnd;
        return m.substring(start, end);
      });

      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 141: nasals were lost between two stops of the same place of articulation
  // [{ptkbdg}₁{mnŋ}{ptkbdg}₁] > [{ptkbdg}₁ø{ptkbdg}₁]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(141)]: {
    orderId: getOrderId(141),
    pattern: '[{ptkbdg}₁{mnŋ}{ptkbdg}₁] > [{ptkbdg}₁ø{ptkbdg}₁]',
    description: '§4.141. nasals were lost between two stops of the same place of articulation',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const precheckOccurrences = findAllOf(['m', 'n', 'ŋ'], str);

      if (precheckOccurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      // Same place of articulation pairs
      const labials = ['p', 'b', 'm'];
      const dentals = ['t', 'd', 'n'];
      const velars = ['k', 'g', 'ŋ'];

      function samePlace(c1, c2) {
        return (labials.includes(c1) && labials.includes(c2)) ||
               (dentals.includes(c1) && dentals.includes(c2)) ||
               (velars.includes(c1) && velars.includes(c2));
      }

      let result = str;
      const removedIndices = [];

      const occurrences = findAllOf(['m', 'n', 'ŋ'], result);
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        const stops = ['p', 't', 'k', 'b', 'd', 'g'];
        if (stops.includes(prevChar) && stops.includes(nextChar) && samePlace(prevChar, nextChar)) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 142: nd and mb became the nasals n and m
  // This is a combined rule (142-1 through 142-5):
  // 142-1: after non-nasal stops (p, t, k, b, d, g)
  // 142-2: after spirants (f, s, θ, h, x, v, ð, ɣ)
  // 142-3: after semivowels (j, w)
  // 142-4: after vowels
  // 142-5: after nasals following nonliquids
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(142)]: {
    orderId: getOrderId(142),
    pattern: '[{stops|spirants|semivowels|vowels|^lr·nasals}{nd|mb}] > [...{n|m}]',
    description: '§4.142. nd and mb became n and m after stops, spirants, semivowels, vowels, or ‹nasals following nonliquids›',
    info: [
      '142-1: [{ptkbdg}nd|mb] > [{ptkbdg}n|m]',
      '142-2: [{fsθhxvðɣ}nd|mb] > [{fsθhxvðɣ}n|m]',
      '142-3: [{jw}nd|mb] > [{jw}n|m]',
      '142-4: [Vnd|Vmb] > [Vn|Vm]',
      '142-5: [{{^rl}mnŋ}nd|mb] > [{{^rl}mnŋ}n|m]',
    ],
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['nd', 'mb'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      // Define character classes for each sub-rule
      const nonNasalStops = ['p', 't', 'k', 'b', 'd', 'g'];  // 142-1
      const spirants = ['f', 's', 'θ', 'h', 'x', 'v', 'ð', 'ɣ'];  // 142-2
      const semivowels = ['j', 'w'];  // 142-3
      const nasals = ['m', 'n', 'ŋ'];  // 142-5
      const liquids = ['l', 'r', 'ꞧ', 'ꝉ'];  // exception for 142-5

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, matched, prevChar } = occurrences[i];
        let shouldTransform = false;

        // 142-1: after non-nasal stops
        if (nonNasalStops.includes(prevChar)) {
          shouldTransform = true;
        }
        // 142-2: after spirants
        else if (spirants.includes(prevChar)) {
          shouldTransform = true;
        }
        // 142-3: after semivowels
        else if (semivowels.includes(prevChar)) {
          shouldTransform = true;
        }
        // 142-4: after vowels
        else if (prevChar && prevChar.isVowel()) {
          shouldTransform = true;
        }
        // 142-5: after nasals following nonliquids
        else if (nasals.includes(prevChar)) {
          const charBeforeNasal = charIndex >= 2 ? str.nth(charIndex - 2) : '';
          if (!liquids.includes(charBeforeNasal)) {
            shouldTransform = true;
          }
        }

        if (shouldTransform) {
          // Remove the stop (d or b), keeping only the nasal (n or m)
          const replacement = matched === 'nd' ? 'n' : 'm';
          result = result.substring(0, charIndex) + replacement + result.substring(charIndex + 2);
          removedIndices.unshift(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 143: st simplifies to s before a consonant
  // [stC] > [sC]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(143)]: {
    orderId: getOrderId(143),
    pattern: '[stC] > [sC]',
    description: '§4.143. st simplifies to s before a consonant',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['st'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        // nextChar is the char after 'st', so we need to check str.nth(charIndex + 2)
        const charAfterSt = str.nth(charIndex + 2);
        if (charAfterSt && charAfterSt.isConsonant()) {
          result = result.substring(0, charIndex + 1) + result.substring(charIndex + 2);
          removedIndices.unshift(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 144: s became θ before liquids l and r
  // [s{lr}] > [θ{lr}]
  // Includes voiceless liquids ꞧ (rh) and ꝉ (lh)
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(144)]: {
    orderId: getOrderId(144),
    pattern: '[s{lr}] > [θ{lr}]',
    description: '§4.144. s became θ before liquids l and r',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['s'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      // Include voiceless liquids ꞧ (rh) and ꝉ (lh)
      const liquids = ['l', 'r', 'ꝉ', 'ꞧ'];
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (liquids.includes(nextChar)) {
          result = result.substring(0, charIndex) + 'θ' + result.substring(charIndex + 1);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 145: θ became t after s
  // [sθ] > [st]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(145)]: {
    orderId: getOrderId(145),
    pattern: '[sθ] > [st]',
    description: '§4.145. θ became t after s',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['sθ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex + 1) + 't' + result.substring(charIndex + 2);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 146: n became nd before liquids l and r
  // [n{lr}] > [nd{lr}]
  // Exception: liquid+vowel+d pattern blocks this
  // The 'd' joins the morpheme containing the 'n'
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(146)]: {
    orderId: getOrderId(146),
    pattern: '[n{lr}] > [nd{lr}]',
    description: '§4.146. n became nd before liquids l and r',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['n'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      // Track which morpheme boundaries need adjustment
      // We process right-to-left, so we track insertions for morpheme update
      const insertions = []; // { origIndex, morphemeIndex }

      // Calculate original morpheme boundaries
      const morphBoundaries = [];
      let pos = 0;
      for (let m = 0; m < morphemes.length; m++) {
        morphBoundaries.push({ start: pos, end: pos + [...morphemes[m]].length - 1 });
        pos += [...morphemes[m]].length;
      }

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (['l', 'r'].includes(nextChar)) {
          // Check for exception: liquid+vowel/diphthong+d pattern after the n{lr}
          // Scan for: liquid, then vowel(s), then 'd'
          let exceptionApplies = false;
          const charAfterLiquid = str.nth(charIndex + 2);
          if (charAfterLiquid && charAfterLiquid.isVowel()) {
            // Look for 'd' after the vowels
            let scanIdx = charIndex + 3;
            while (str.nth(scanIdx) && str.nth(scanIdx).isVowel()) {
              scanIdx++;
            }
            if (str.nth(scanIdx) === 'd') {
              exceptionApplies = true;
            }
          }
          if (exceptionApplies) {
            continue; // Skip - exception applies
          }
          result = result.substring(0, charIndex + 1) + 'd' + result.substring(charIndex + 1);
          // Find which morpheme the 'n' belongs to
          for (let m = 0; m < morphBoundaries.length; m++) {
            if (charIndex >= morphBoundaries[m].start && charIndex <= morphBoundaries[m].end) {
              insertions.unshift({ origIndex: charIndex + 1, morphemeIndex: m });
              break;
            }
          }
        }
      }

      // Build updated morphemes - add 'd' to the morpheme containing 'n'
      let updatedMorphemes = [...morphemes];
      for (const ins of insertions) {
        // Calculate position within morpheme
        const posInMorph = ins.origIndex - morphBoundaries[ins.morphemeIndex].start;
        const morph = updatedMorphemes[ins.morphemeIndex];
        updatedMorphemes[ins.morphemeIndex] = morph.substring(0, posInMorph) + 'd' + morph.substring(posInMorph);
      }

      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 147: ŋ became ŋg before l, r, w
  // [ŋ{lrw}] > [ŋg{lrw}]
  // If ŋ is at morpheme boundary, 'g' joins the following morpheme
  // If ŋ and next char are in same morpheme, 'g' is inserted within that morpheme
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(147)]: {
    orderId: getOrderId(147),
    pattern: '[ŋ{lrw}] > [ŋg{lrw}]',
    description: '§4.147. ŋ became ŋg before l, r, w',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ŋ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const insertions = []; // { morphemeIndex, posInMorph }

      // Calculate original morpheme boundaries
      const morphBoundaries = [];
      let pos = 0;
      for (let m = 0; m < morphemes.length; m++) {
        morphBoundaries.push({ start: pos, end: pos + [...morphemes[m]].length - 1 });
        pos += [...morphemes[m]].length;
      }

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (['l', 'r', 'w'].includes(nextChar)) {
          result = result.substring(0, charIndex + 1) + 'g' + result.substring(charIndex + 1);

          // Find morpheme containing ŋ and morpheme containing next char
          let ŋMorphIdx = -1, nextMorphIdx = -1;
          const nextCharIndex = charIndex + 1;
          for (let m = 0; m < morphBoundaries.length; m++) {
            if (charIndex >= morphBoundaries[m].start && charIndex <= morphBoundaries[m].end) {
              ŋMorphIdx = m;
            }
            if (nextCharIndex >= morphBoundaries[m].start && nextCharIndex <= morphBoundaries[m].end) {
              nextMorphIdx = m;
            }
          }

          if (ŋMorphIdx === nextMorphIdx) {
            // Same morpheme - insert 'g' after ŋ within that morpheme
            const posInMorph = charIndex + 1 - morphBoundaries[ŋMorphIdx].start;
            insertions.unshift({ morphemeIndex: ŋMorphIdx, posInMorph });
          } else {
            // Different morphemes - 'g' goes at start of next morpheme
            insertions.unshift({ morphemeIndex: nextMorphIdx, posInMorph: 0 });
          }
        }
      }

      // Build updated morphemes
      let updatedMorphemes = [...morphemes];
      for (const ins of insertions) {
        const morph = updatedMorphemes[ins.morphemeIndex];
        updatedMorphemes[ins.morphemeIndex] =
          morph.substring(0, ins.posInMorph) + 'g' + morph.substring(ins.posInMorph);
      }

      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 148: nd became ŋg before l
  // [ndl] > [ŋgl]
  // The 'ŋ' stays in first morpheme, 'g' joins the second morpheme with the 'l'
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(148)]: {
    orderId: getOrderId(148),
    pattern: '[ndl] > [ŋgl]',
    description: '§4.148. nd became ŋg before l',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ndl'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      // Calculate original morpheme boundaries
      const morphBoundaries = [];
      let pos = 0;
      for (let m = 0; m < morphemes.length; m++) {
        morphBoundaries.push({ start: pos, end: pos + [...morphemes[m]].length - 1 });
        pos += [...morphemes[m]].length;
      }

      let result = str;
      const changes = []; // { ndIndex, firstMorphIdx, secondMorphIdx }

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'ŋg' + result.substring(charIndex + 2);

        // Find morpheme containing 'n' (index charIndex) and morpheme containing 'l' (index charIndex + 2)
        let firstMorphIdx = -1, secondMorphIdx = -1;
        for (let m = 0; m < morphBoundaries.length; m++) {
          if (charIndex >= morphBoundaries[m].start && charIndex <= morphBoundaries[m].end) {
            firstMorphIdx = m;
          }
          if ((charIndex + 2) >= morphBoundaries[m].start && (charIndex + 2) <= morphBoundaries[m].end) {
            secondMorphIdx = m;
          }
        }
        if (firstMorphIdx !== -1 && secondMorphIdx !== -1) {
          changes.unshift({ charIndex, firstMorphIdx, secondMorphIdx });
        }
      }

      // Build updated morphemes
      // For each change: replace 'nd' at end of first morpheme with 'ŋ', add 'g' to start of second
      let updatedMorphemes = [...morphemes];
      for (const ch of changes) {
        // First morpheme: remove 'd' and change 'n' to 'ŋ'
        const firstMorph = updatedMorphemes[ch.firstMorphIdx];
        // Find position of 'nd' in this morpheme
        const posInFirstMorph = ch.charIndex - morphBoundaries[ch.firstMorphIdx].start;
        updatedMorphemes[ch.firstMorphIdx] =
          firstMorph.substring(0, posInFirstMorph) + 'ŋ' + firstMorph.substring(posInFirstMorph + 2);

        // Second morpheme: add 'g' at start
        updatedMorphemes[ch.secondMorphIdx] = 'g' + updatedMorphemes[ch.secondMorphIdx];
      }

      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 149: ɱ (nasalized v) disappeared after w
  // [wɱ] > [wø]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(149)]: {
    orderId: getOrderId(149),
    pattern: '[wɱ] > [wø]',
    description: '§4.149. ɱ (nasalized v) disappeared after w',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['wɱ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex + 1) + result.substring(charIndex + 2);
        removedIndices.unshift(charIndex + 1);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 150: lɱ became lw
  // [lɱ] > [lw]
  // Exception: doesn't change when pattern is non-liquid consonant + a + l + ɱ
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(150)]: {
    orderId: getOrderId(150),
    pattern: '[lɱ] > [lw]',
    description: '§4.150. lɱ became lw (hypothesis)',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['lɱ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      const liquids = ['l', 'r'];
      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        // Exception: non-liquid + a + l + ɱ doesn't change
        // Check 2 chars before the 'l'
        if (charIndex >= 2) {
          const vowelBeforeL = str.nth(charIndex - 1);
          const consonantBeforeVowel = str.nth(charIndex - 2);
          if (vowelBeforeL === 'a' && consonantBeforeVowel && !liquids.includes(consonantBeforeVowel) && !consonantBeforeVowel.isVowel()) {
            continue;
          }
        }
        result = result.substring(0, charIndex + 1) + 'w' + result.substring(charIndex + 2);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 151: w disappeared before o, œ, ǭ
  // [w{oœǭ}] > [ø{oœǭ}]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(151)]: {
    orderId: getOrderId(151),
    pattern: '[w{oœǭ}] > [ø{oœǭ}]',
    description: '§4.151. w disappeared before o, œ, ǭ',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['w'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, nextChar } = occurrences[i];
        if (['o', 'œ', 'ǭ', 'ō', 'ø̄'].includes(nextChar)) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 152: rɣ, lɣ became ri, li before vowel (hypothesis)
  // [{rl}ɣV] > [{rl}iV]
  // Note: j (y) is also treated as a vowel for this rule
  // Exception: when 'e' before liquid and back vowel 'o' after ɣ, ɣ just disappears
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(152)]: {
    orderId: getOrderId(152),
    pattern: '[{rl}ɣV] > [{rl}iV]',
    description: '§4.152. rɣ, lɣ became ri, li before vowel (hypothesis)',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ɣ'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar, nextChar } = occurrences[i];
        // j (y) is treated as vowel for this rule
        if (['r', 'l'].includes(prevChar) && (nextChar.isVowel() || nextChar === 'j')) {
          // Check for exception: e before liquid and back vowel 'o' after ɣ
          const vowelBeforeLiquid = str.nth(charIndex - 2);
          if (vowelBeforeLiquid === 'e' && nextChar === 'o') {
            // Exception: just delete ɣ
            result = result.substring(0, charIndex) + result.substring(charIndex + 1);
            removedIndices.unshift(charIndex);
          } else {
            result = result.substring(0, charIndex) + 'i' + result.substring(charIndex + 1);
          }
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 153: i disappeared before j
  // [ij] > [øj] (or [ji] > [j])
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(153)]: {
    orderId: getOrderId(153),
    pattern: '[ij] > [j]',
    description: '§4.153. i before j disappeared',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ij'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + result.substring(charIndex + 1);
        removedIndices.unshift(charIndex);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 154: ɣ disappeared at end of polysyllable
  // [-Sɣ] > [-Sø]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(154)]: {
    orderId: getOrderId(154),
    pattern: '[-Sɣ] > [-Sø]',
    description: '§4.154. ɣ disappeared at end of polysyllable',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];

      // Check if word ends with ɣ
      if (!str.endsWith('ɣ')) {
        return { in: str, out: str, morphemes };
      }

      // Check if polysyllable (more than one syllable)
      const analyser = new SyllableAnalyser();
      const syllables = analyser.syllabify(str);
      if (syllables.length <= 1) {
        return { in: str, out: str, morphemes };
      }

      const result = str.substring(0, str.length - 1);
      const removedIndices = [str.length - 1];

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 155: ɣ became a at end of monosyllable after a or e
  // [-{^S}{ae}ɣ] > [-{^S}{ae}a]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(155)]: {
    orderId: getOrderId(155),
    pattern: '[-{^S}{ae}ɣ] > [-{^S}{ae}a]',
    description: '§4.155. ɣ became a at end of monosyllable after a or e',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];

      // Check if word ends with ɣ
      if (!str.endsWith('ɣ')) {
        return { in: str, out: str, morphemes };
      }

      // Check if monosyllable
      const analyser = new SyllableAnalyser();
      const syllables = analyser.syllabify(str);
      if (syllables.length !== 1) {
        return { in: str, out: str, morphemes };
      }

      // Check if nucleus vowel is a or e (not i)
      const nucleus = analyser.extractNucleus(str);
      const lastNucleusChar = nucleus.nth(-1)?.removeMarks()?.toLowerCase();
      if (!['a', 'e'].includes(lastNucleusChar)) {
        return { in: str, out: str, morphemes };
      }

      const result = str.substring(0, str.length - 1) + 'a';
      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 156: ɣ became i at end of monosyllable after i
  // [-{^S}iɣ] > [-{^S}ii]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(156)]: {
    orderId: getOrderId(156),
    pattern: '[-{^S}iɣ] > [-{^S}ii]',
    description: '§4.156. ɣ became i at end of monosyllable after i',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];

      // Check if word ends with ɣ
      if (!str.endsWith('ɣ')) {
        return { in: str, out: str, morphemes };
      }

      // Check if monosyllable
      const analyser = new SyllableAnalyser();
      const syllables = analyser.syllabify(str);
      if (syllables.length !== 1) {
        return { in: str, out: str, morphemes };
      }

      // Check if nucleus vowel is i (including diphthongs ending in i like 'ei')
      const nucleus = analyser.extractNucleus(str);
      const lastNucleusChar = nucleus.nth(-1)?.removeMarks()?.toLowerCase();
      if (lastNucleusChar !== 'i') {
        return { in: str, out: str, morphemes };
      }

      const result = str.substring(0, str.length - 1) + 'i';
      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 157: lð became ll
  // [lð] > [ll]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(157)]: {
    orderId: getOrderId(157),
    pattern: '[lð] > [ll]',
    description: '§4.157. lð became ll',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['lð'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex + 1) + 'l' + result.substring(charIndex + 2);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 158: nl became ll (hypothesis)
  // [nl] > [ll]
  // Exception: stays unchanged when vowel before n is 'i'
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(158)]: {
    orderId: getOrderId(158),
    pattern: '[nl] > [ll]',
    description: '§4.158. nl became ll (hypothesis)',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['nl'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        // Exception: don't change when vowel before n is 'i' or 'ī'
        if (['i', 'ī'].includes(prevChar)) {
          continue;
        }
        result = result.substring(0, charIndex) + 'll' + result.substring(charIndex + 2);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 159: n disappeared after long vowel before another n
  // [V̄nn] > [V̄øn]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(159)]: {
    orderId: getOrderId(159),
    pattern: '[V̄nn] > [V̄øn]',
    description: '§4.159. n disappeared after long vowel before another n',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['nn'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      const longVowels = ['ā', 'ē', 'ī', 'ō', 'ū', 'ǣ', 'œ̄', 'ӯ'];
      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];
        if (longVowels.includes(prevChar)) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 160: lr became ll in suffixes
  // [lr] > [ll]
  // Hypothesis: blocked when first morpheme ≤2 chars (compound)
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(160)]: {
    orderId: getOrderId(160),
    pattern: '[lr] > [ll]',
    description: '§4.160. lr became ll in suffixes (hypothesis: blocked in compounds)',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['lr'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];

        // Check if this is at a morpheme boundary and first morpheme is short (compound)
        let posInStr = 0;
        let isCompound = false;
        for (let m = 0; m < morphemes.length - 1; m++) {
          posInStr += morphemes[m].length;
          if (posInStr - 1 === charIndex) {
            // l is at end of morpheme m
            if (morphemes[m].length <= 2) {
              isCompound = true;
            }
            break;
          }
        }

        if (!isCompound) {
          result = result.substring(0, charIndex) + 'll' + result.substring(charIndex + 2);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 161: rl sometimes became ll
  // [rl] > [ll]
  // Hypothesis: blocked when vowel before r is 'o'
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(161)]: {
    orderId: getOrderId(161),
    pattern: '[rl] > [ll]',
    description: '§4.161. rl sometimes became ll (hypothesis: blocked when vowel before r is o)',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['rl'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];

        // Block if vowel before r is 'o'
        if (['o', 'ō'].includes(prevChar)) {
          continue;
        }

        result = result.substring(0, charIndex) + 'll' + result.substring(charIndex + 2);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 162: r+r simplified to r
  // [rr] > [r]
  // Hypothesis: occurs when vowel before r is 'a' or diphthong ending (i/u)
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(162)]: {
    orderId: getOrderId(162),
    pattern: '[rr] > [r]',
    description: '§4.162. r+r simplified to r (hypothesis: when vowel before is a or diphthong ending)',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['rr'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex, prevChar } = occurrences[i];

        // Check if vowel before is 'a' or diphthong ending (i/u)
        if (['a', 'ā', 'i', 'u'].includes(prevChar)) {
          result = result.substring(0, charIndex) + result.substring(charIndex + 1);
          removedIndices.unshift(charIndex);
        }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 163: ç became h
  // [ç] > [h]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(163)]: {
    orderId: getOrderId(163),
    pattern: '[ç] > [h]',
    description: '§4.163. ç became h',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const occurrences = findAllOf(['ç'], str);

      if (occurrences.length === 0) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      for (let i = occurrences.length - 1; i >= 0; i--) {
        const { charIndex } = occurrences[i];
        result = result.substring(0, charIndex) + 'h' + result.substring(charIndex + 1);
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, []);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 164: uu, jj and ii became ū, ӯ and ī
  // [uu|jj|ii] > [ū|ӯ|ī]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(164)]: {
    orderId: getOrderId(164),
    pattern: '[uu|jj|ii] > [ū|ӯ|ī]',
    description: '§4.164. Double vowels became long',
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];
      const replacements = [
        { pattern: 'ii', replacement: 'ī' },
        { pattern: 'jj', replacement: 'ӯ' },
        { pattern: 'uu', replacement: 'ū' },
      ];

      let result = str;
      const removedIndices = [];

      for (const { pattern, replacement } of replacements) {
        const occurrences = findAllOf([pattern], result);
        for (let i = occurrences.length - 1; i >= 0; i--) {
          const { charIndex } = occurrences[i];
          result = result.substring(0, charIndex) + replacement + result.substring(charIndex + 2);
          removedIndices.unshift(charIndex + 1); // Second char removed
        }
      }

      const updatedMorphemes = removedIndices.length > 0
        ? recalcMorphemes(result, morphemes, removedIndices)
        : morphemes;

      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

  // ---------------------------------------------------------------------------
  // Rule 165: Final conversion of sandhi-specific phonetic symbols
  // Converts any remaining IPA-style symbols to their Sindarin romanized forms
  // [ɱ|β|ɣ] > [m|b|ø]
  // ---------------------------------------------------------------------------
  [getSandhiRuleId(170)]: {
    orderId: getOrderId(170),
    pattern: 'POST-sandhi',
    description: 'Final conversion of sandhi-specific phonetic symbols',
    info: [
      'ɱ/ṽ (labiodental nasal) → m',
      'β (voiced bilabial fricative) → b',
      // 'ɣ (voiced velar fricative) → deleted',
    ],
    isSandhi: true,
    mechanic: (str, options = {}) => {
      const morphemes = options.morphemes || [str];

      // Check if any convertible symbols exist
      const hasConvertible = /[ɱβɣ]/.test(str);
      if (!hasConvertible) {
        return { in: str, out: str, morphemes };
      }

      let result = str;
      const removedIndices = [];

      // Process character by character from end to preserve indices
      for (let i = result.length - 1; i >= 0; i--) {
        const char = result.nth(i);
        if (char === 'ɱ') {
          // ɱ → m (labiodental nasal → bilabial nasal)
          result = result.substring(0, i) + 'm' + result.substring(i + 1);
        } else if (char === 'β') {
          // β → b (voiced bilabial fricative → voiced bilabial stop)
          result = result.substring(0, i) + 'b' + result.substring(i + 1);
        }
        // else if (char === 'ɣ') {
        //   // ɣ → deleted (voiced velar fricative disappears)
        //   result = result.substring(0, i) + result.substring(i + 1);
        //   removedIndices.unshift(i);
        // }
      }

      const updatedMorphemes = recalcMorphemes(result, morphemes, removedIndices);
      return { in: str, out: result, morphemes: updatedMorphemes };
    },
  },

    /*
    {
      name: 'r165',
      label: '[] > []',
      type: 'boolean',
      default: true,
      description: '165: accent shift',
    },
    /*
    {
      name: 'r166',
      label: '[ī|ū{^nlr}] > [i|u]',
      type: 'boolean',
      default: true,
      description: '166: ī and ū became short, except before n, l, or r',
    },

    /*
    {
      name: 'r167',
      label: '[{VV̄}C?^C] > [{V̄}C?]',
      type: 'boolean',
      default: true,
      description: '167: all vowels became long in monosyllables when followed by a single consonant or none, otherwise, they were short',
    },
    */


};

