// Extending the String prototype

Object.defineProperty(String.prototype, 'normaliseToOne', {
  value() {
    return this.normalize('NFC');
  }
});

Object.defineProperty(String.prototype, 'normaliseToMany', {
  value() {
    return this.normalize('NFD');
  }
});

Object.defineProperty(String.prototype, 'isVowel', {
  value(includeY = true, includeW = false) {
    let vowels = 'aeiouœ';
    if (includeY) {
      vowels += 'y';
    }
    if (includeW) {
      vowels += 'w';
    }
    return vowels.includes(this.normaliseToMany()[0].toLowerCase());
  }
});

Object.defineProperty(String.prototype, 'isConsonant', {
  value() {
    return !this.isVowel();
  }
});

Object.defineProperty(String.prototype, 'isMark', {
  value() {
    return /\p{M}/u.test(this);
  }
});

Object.defineProperty(String.prototype, 'isSubscript', {
  value() {
    const code = this.codePointAt(0);
    return (
      // Superscripts and Subscripts block (₀-₉, ₊, ₋, ₌, ₍, ₎, ₐ, ₑ, ₒ, ₓ, ₔ, ₕ, ₖ, ₗ, ₘ, ₙ, ₚ, ₛ, ₜ)
      (code >= 0x2080 && code <= 0x209C) ||
      // Latin Extended-C block (ⱼ)
      (code === 0x2C7C) ||
      // Phonetic Extensions block (ᵢ, ᵣ, ᵤ, ᵥ, ᵦ, ᵧ, ᵨ, ᵩ, ᵪ)
      (code >= 0x1D62 && code <= 0x1D6A) ||
      // Cyrillic Extended-D block (Cyrillic subscripts 𞁑-𞁪)
      (code >= 0x1E051 && code <= 0x1E06A) ||
      // Combining Diacritical Marks Supplement block (combining subscript ◌᷊)
      (code === 0x1DCA) ||
      // Combining Diacritical Marks Extended block (combining subscripts ◌ᪿ ◌ᫀ)
      (code === 0x1ABF || code === 0x1AC0)
    );
  }
});

Object.defineProperty(String.prototype, 'isSuperscript', {
  value() {
    const code = this.codePointAt(0);
    return (
      // Latin-1 Supplement block (¹, ², ³ - legacy superscript digits)
      (code === 0x00B9 || code === 0x00B2 || code === 0x00B3) ||
      // Superscripts and Subscripts block (⁰, ⁴-⁹, ⁱ, ⁿ, ⁺, ⁻, ⁼, ⁽, ⁾)
      (code >= 0x2070 && code <= 0x207F) ||
      // Spacing Modifier Letters block (ʰ, ʲ, ˡ, ʳ, ˢ, ʷ, ˣ, ʸ)
      (code >= 0x02B0 && code <= 0x02B8) ||
      (code >= 0x02E0 && code <= 0x02E3) ||
      // Phonetic Extensions block (ᵃ, ᵇ, ᵈ, ᵉ, ᵍ, ᵏ, ᵐ, ᵒ, ᵖ, ᵗ, ᵘ, ᵛ, ᴬ-ᴺ, ᴼ, ᴾ, ᴿ, ᵀ, ᵁ, ᵂ, ᴭ)
      (code >= 0x1D2C && code <= 0x1D42) ||
      (code >= 0x1D43 && code <= 0x1D5B) ||
      // Phonetic Extensions Supplement block (ᶜ, ᶠ, ᶻ)
      (code >= 0x1D9C && code <= 0x1DBB) ||
      // Latin Extended-C block (ⱽ)
      (code === 0x2C7D) ||
      // Latin Extended-D block (ꟲ, ꟳ, ꟴ, ꟹ)
      (code === 0xA7F2 || code === 0xA7F3 || code === 0xA7F4 || code === 0xA7F9 || code === 0xA7FD) ||
      // Latin Extended-F block (𐞥, ʏ)
      (code === 0x107A5 || code === 0x107B2) ||
      // Combining Diacritical Marks block (combining superscripts)
      (code >= 0x0363 && code <= 0x036F) ||
      // Combining Diacritical Marks Supplement block (more combining superscripts)
      (code >= 0x1DD4 && code <= 0x1DF1)
    );
  }
});

Object.defineProperty(String.prototype, 'toNormalScript', {
  value() {
    // Mapping of subscript/superscript characters to their normal equivalents
    // Includes all available Latin alphabet (a-z) and numerals (0-9)
    const scriptMap = {
      // Subscript letters (not all letters have Unicode subscript forms)
      'ₐ': 'a', 'ₑ': 'e', 'ₕ': 'h', 'ᵢ': 'i', 'ⱼ': 'j', 'ₖ': 'k', 'ₗ': 'l',
      'ₘ': 'm', 'ₙ': 'n', 'ₒ': 'o', 'ₚ': 'p', 'ᵣ': 'r', 'ₛ': 's', 'ₜ': 't',
      'ᵤ': 'u', 'ᵥ': 'v', 'ₓ': 'x',
      // Subscript numerals
      '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
      '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
      // Superscript letters
      'ᵃ': 'a', 'ᵇ': 'b', 'ᶜ': 'c', 'ᵈ': 'd', 'ᵉ': 'e', 'ᶠ': 'f', 'ᵍ': 'g',
      'ʰ': 'h', 'ⁱ': 'i', 'ʲ': 'j', 'ᵏ': 'k', 'ˡ': 'l', 'ᵐ': 'm', 'ⁿ': 'n',
      'ᵒ': 'o', 'ᵖ': 'p', 'ʳ': 'r', 'ˢ': 's', 'ᵗ': 't', 'ᵘ': 'u', 'ᵛ': 'v',
      'ʷ': 'w', 'ˣ': 'x', 'ʸ': 'y', 'ᶻ': 'z',
      // Superscript numerals
      '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
      '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    };

    return [...this].map(char => scriptMap[char] ?? char).join('');
  }
});

Object.defineProperty(String.prototype, 'getMark', {
  value() {
    // First normalize to decomposed form to check for marks
    const normalised = this.normaliseToMany();

    // Check if there are any marks in the normalized form
    if (/\p{M}/u.test(normalised)) {
      let combiningMark = '';

      // If the first character is already a mark, return the whole string
      if (/\p{M}/u.test(normalised[0])) {
        combiningMark = normalised;
      } else {
        // Otherwise, it's a base character + mark(s), so return everything after the base
        combiningMark = normalised.slice(1) || '';
      }

      // Map of combining diacritics to spacing diacritics
      const combiningToSpacing = {
        '\u0301': '´', // COMBINING ACUTE ACCENT → ACUTE ACCENT
        '\u0300': '`', // COMBINING GRAVE ACCENT → GRAVE ACCENT
        '\u0302': '^', // COMBINING CIRCUMFLEX ACCENT → CIRCUMFLEX ACCENT
        '\u0303': '~', // COMBINING TILDE → TILDE
        '\u0308': '¨', // COMBINING DIAERESIS → DIAERESIS
        '\u0304': '¯', // COMBINING MACRON → MACRON
        '\u0306': '˘', // COMBINING BREVE → BREVE
        '\u0307': '˙', // COMBINING DOT ABOVE → DOT ABOVE
        '\u0327': '¸', // COMBINING CEDILLA → CEDILLA
        '\u030B': '˝', // COMBINING DOUBLE ACUTE ACCENT → DOUBLE ACUTE ACCENT
        '\u030C': 'ˇ', // COMBINING CARON → CARON
        '\u030A': '˚', // COMBINING RING ABOVE → RING ABOVE
      };

      // Convert combining diacritic to spacing if a mapping exists
      return combiningToSpacing[combiningMark] || combiningMark;
    }
    return '';
  }
});

Object.defineProperty(String.prototype, 'addMark', {
  value(mark) {
    // Map of spacing diacritics to combining diacritics
    const spacingToCombining = {
      '´': '\u0301', // ACUTE ACCENT → COMBINING ACUTE ACCENT
      '`': '\u0300', // GRAVE ACCENT → COMBINING GRAVE ACCENT
      '^': '\u0302', // CIRCUMFLEX ACCENT → COMBINING CIRCUMFLEX ACCENT
      '~': '\u0303', // TILDE → COMBINING TILDE
      '¨': '\u0308', // DIAERESIS → COMBINING DIAERESIS
      '¯': '\u0304', // MACRON → COMBINING MACRON
      '˘': '\u0306', // BREVE → COMBINING BREVE
      '˙': '\u0307', // DOT ABOVE → COMBINING DOT ABOVE
      '¸': '\u0327', // CEDILLA → COMBINING CEDILLA
      '˝': '\u030B', // DOUBLE ACUTE ACCENT → COMBINING DOUBLE ACUTE ACCENT
      'ˇ': '\u030C', // CARON → COMBINING CARON
      '˚': '\u030A', // RING ABOVE → COMBINING RING ABOVE
    };

    // Convert spacing diacritic to combining if needed
    const combiningMark = spacingToCombining[mark] || mark;

    return (this + combiningMark).normaliseToOne();
  }
});

Object.defineProperty(String.prototype, 'nth', {
  value(n, length = 1) {
    const index = n < 0 ? this.length + n : n;
    return this.substring(index, index + length) || '';
  }
});

Object.defineProperty(String.prototype, 'removeMarks', {
  value() {
    // First normalise to decomposed form (NFD), then remove all marks, then normalise back to composed form (NFC)
    return this.normaliseToMany().replace(/\p{M}/gu, '').normaliseToOne();
  }
});

Object.defineProperty(String.prototype, 'removeVowelMarks', {
  value() {
    // Only remove vowel-related diacritics, preserve consonant diacritics (e.g., ring below for voiceless)
    // Vowel marks: combining grave (0300), acute (0301), circumflex (0302), macron (0304), breve (0306), diaeresis (0308)
    const vowelMarks = /[\u0300-\u0304\u0306\u0308]/gu;
    return this.normaliseToMany().replace(vowelMarks, '').normaliseToOne();
  }
});

Object.defineProperty(String.prototype, 'replaceWithMark', {
  value(baseChar, replacement) {
    const normalised = this.normaliseToOne();
    const withoutMarks = normalised.removeMarks();
    const result = [];

    for (let i = 0; i < withoutMarks.length; i++) {
      const charWithoutMark = withoutMarks.charAt(i);
      if (charWithoutMark === baseChar) {
        const originalChar = normalised.charAt(i);
        const mark = originalChar.getMark();
        result.push(replacement.addMark(mark));
      } else {
        result.push(normalised.charAt(i));
      }
    }
    return result.join('');
  }
});

Object.defineProperty(String.prototype, 'findAllChars', {
  value(char, unmarkedStr = null) {
    const searchStr = unmarkedStr ?? this.removeMarks();
    const regex = new RegExp(char, 'gi');
    let _result = [];
    const indices = [];
    while ( (_result = regex.exec(searchStr)) ) {
      indices.push(_result.index);
    }
    return indices;
  }
});

Object.defineProperty(String.prototype, 'replaceAt', {
  value(index, replacement, max = -1) {
    return this.substring(0, index) + replacement + this.substring(index + (max === -1 ? replacement.length : max));
  }
});

Object.defineProperty(String.prototype, 'reverse', {
  value() {
    return this.split('').reverse().join('');
  }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Utils

// ------------------------------------------------------------------------------------------------
// Sindarin Syllabification Algorithm
// Based on Eldamo phonotactics + Inside Language notes (PE17, PE19, VT45)

/**
 * Array of Sindarin vowels including both short and long (accented) forms.
 * Used for phonological analysis and syllable detection.
 * @type {string[]}
 */
const VOWELS = ['a','e','i','o','u','y','á','é','í','ó','ú','ý'];

/**
 * Array of valid Sindarin diphthongs.
 * @type {string[]}
 */
/**
 * Unified digraph-to-single-character mapping.
 * Used by global functions for sound change rules.
 * Note: 'wh' and 'hw' both map to 'ʍ' (different spellings of same sound)
 * Note: 'kh' is an alternate spelling of 'ch', both map to 'x'
 * Note: 'nth' and 'chw' are NOT included here - they are only used in SyllableAnalyser
 *       for compound word handling. In sound change rules, 'nth' is 'n' + 'th' (two sounds).
 */
const DIGRAPH_MAP = {
  'dh': 'ð',
  'gw': 'ƣ',
  'hw': 'ʍ',
  'ch': 'x',   // spirant
  'kh': 'x',   // alternate spelling of 'ch'
  'kʰ': 'ꝁ',   // aspirated voiceless stop
  // 'lh': 'λ',
  'ng': 'ŋ',
  'ph': 'ɸ',   // spirant
  'pʰ': 'ƥ',   // aspirated voiceless stop
  // 'rh': 'ꝛ',
  'ss': 'ſ',
  'th': 'θ',   // spirant
  'tʰ': 'ŧ',   // aspirated voiceless stop
  // 'wh': 'ʍ',   // alternate spelling of 'hw'
  'gh': 'ɣ',
  'xʲ': 'ꜧ',
  'xʷ': 'ƕ',
  // 'jh': 'j̊',
  // 'wh': 'w̥',
  // 'mh': 'm̥',
  // 'nh': 'n̥',
  // 'lh': 'l̥',
  // 'rh': 'r̥', // This is a common consonantal encounter, risky to generalise
};

// Pre-sorted digraphs by length descending for correct replacement order
const SORTED_DIGRAPHS = Object.keys(DIGRAPH_MAP).sort((a, b) => b.length - a.length);

// Reverse map for converting single chars back to digraphs
// Note: 'x' maps back to 'ch' (not 'kh'), 'ʍ' maps back to 'hw' (not 'wh')
const SINGLE_TO_DIGRAPH_MAP = {
  'ð': 'dh',
  'ƣ': 'gw',
  'x': 'ch',   // spirant
  'ꝁ': 'kʰ',   // aspirated voiceless stop
  'λ': 'lh',
  'ŋ': 'ng',
  'ɸ': 'ph',   // spirant
  'ƥ': 'pʰ',   // aspirated voiceless stop
  'ꝛ': 'rh',
  'ſ': 'ss',
  'θ': 'th',   // spirant
  'ŧ': 'tʰ',   // aspirated voiceless stop
  'ʍ': 'wh',   // alternate spelling of 'hw'
  'ɣ': 'gh',
  'ꜧ': 'xʲ',
  'ƕ': 'xʷ',
  'j̊': 'jh',
  'w̥': 'wh',
  'm̥': 'mh',
  'n̥': 'nh',
  'l̥': 'lh',
  'r̥': 'rh',
};

/**
 * Converts digraphs to single characters for easier processing.
 * @param {string} str - The string to convert
 * @returns {string} String with digraphs replaced by single characters
 */
export function digraphsToSingle(str) {
  let result = str;
  for (const digraph of SORTED_DIGRAPHS) {
    const regex = new RegExp(digraph, 'gi');
    result = result.replace(regex, DIGRAPH_MAP[digraph]);
  }
  return result;
}

/**
 * Converts single characters back to digraphs.
 * @param {string} str - The string to convert
 * @returns {string} String with single characters replaced by digraphs
 */
export function singleToDigraphs(str) {
  let result = str;
  for (const [single, digraph] of Object.entries(SINGLE_TO_DIGRAPH_MAP)) {
    const regex = new RegExp(single, 'g');
    result = result.replace(regex, digraph);
  }
  return result;
}

// Singleton instance of SyllableAnalyser for the global syllabify function
let _syllableAnalyser = null;
function getSyllableAnalyser() {
  if (!_syllableAnalyser) {
    _syllableAnalyser = new SyllableAnalyser();
  }
  return _syllableAnalyser;
}

/**
 * Splits a word into syllables according to Sindarin phonotactics.
 * Handles digraphs by converting them to single characters, syllabifying,
 * then converting back. Preserves original case.
 *
 * This is a convenience wrapper around SyllableAnalyser.syllabify().
 *
 * @param {string} word - The word to syllabify
 * @param {boolean} compoundWord - If true, treats ng/nth as separate sounds (n+g, n+th) rather than digraphs
 * @returns {string[]} Array of syllables
 * @example
 * syllabify("Galadriel") // returns ["Ga", "lad", "ri", "el"]
 * syllabify("Eldamar")   // returns ["El", "da", "mar"]
 * syllabify("athelas")   // returns ["a", "the", "las"]
 */
export function syllabify(word, compoundWord = false) {
  return getSyllableAnalyser().syllabify(word, compoundWord);
}

export function breakIntoVowelsAndConsonants(str) {
  const chars = str.normaliseToOne().split('');
  const pattern = [];
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char.isVowel()) {
      pattern[i] = 'V';
    } else {
      pattern[i] = 'C';
    }
  }
  return pattern.join('');
}

export function removeDigraphs(str) {
  return str
    .replaceAll('dh', 'ð')
    .replaceAll('th', 'θ')
    .replaceAll('ch', 'x')
    .replaceAll('kh', 'x')
    .replaceAll('rh', 'ꝛ')
    .replaceAll('lh', 'λ')
    .replaceAll('ss', 'ſ')
    .replaceAll('gw', 'ƣ');
}

export function restoreDigraphs(str) {
  return str
    .replaceAll('ð', 'dh')
    .replaceAll('θ', 'th')
    .replaceAll('x', 'ch')
    .replaceAll('χ', 'kh')
    .replaceAll('λ', 'lh')
    .replaceAll('ꝛ', 'rh')
    .replaceAll('ſ', 'ss')
    .replaceAll('ƣ', 'gw');
}

export function swapSemiVowel(char, vowel = true) {
  if (char === 'y') {
    return vowel ? 'ɏ' : 'j';
  }
  if (char === 'w') {
    return vowel ? 'ʉ' : 'ʋ';
  }
  if (char === 'ɏ' || char === 'j') {
    return 'y';
  }
  if (char === 'ʉ' || char === 'ʋ') {
    return 'w';
  }
}

export function semiVowelToVowel(char) {
  return swapSemiVowel(char, true);
}

export function semiVowelToConsonant(char) {
  return swapSemiVowel(char, false);
}

export function shouldRevertToDigraphs(_str, _scs) {
  const digraphsStr = singleToDigraphs(_str);
  const hasDigraphs = _scs !== digraphsStr;
  const shouldRevert = _str !== _scs;
  return hasDigraphs === shouldRevert;
}

export function findFirstOf(chars, str) {
  for (const c of chars) {
    const i = str.indexOf(c);
    if (i > -1) {
      return {
        found: true,
        matched: c,
        charIndex: i,
        nextChar: str.nth(i + c.length),
        prevChar: str.nth(i - 1),
      };
    }
  }
  return {
    found: false,
    matched: null,
    charIndex: -1,
    nextChar: null,
    prevChar: null,
  }
}

export function findAllOf(chars, str) {
  const results = [];
  for (const c of chars) {
    let i = str.indexOf(c);
    while (i > -1) {
      results.push({
        matched: c,
        charIndex: i,
        nextChar: str.nth(i + c.length),
        prevChar: str.nth(i - 1),
      });
      i = str.indexOf(c, i + c.length);
    }
  }
  // Sort by charIndex so results are in order of appearance
  results.sort((a, b) => a.charIndex - b.charIndex);
  return results;
}

// =============================================================================
// Language Profiles
// =============================================================================

export const SINDARIN_PROFILE = {
  diphthongs: ['ae', 'ai', 'au', 'aw', 'ei', 'oe', 'ui'],
  vowels: ['a', 'á', 'e', 'é', 'i', 'í', 'o', 'ó', 'u', 'ú', 'y'],
  consonants: ['b', 'c', 'k', 'd', 'f', 'g', 'h', 'i', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w'],
  digraphs: ['ch', 'chw', 'dh', 'hw', 'lh', 'ng', 'nth', 'ph', 'rh', 'th'],
  digraphMap: {
    'ch': 'x',
    'chw': 'ꭓ',
    'dh': 'ð',
    'gw': 'ƣ',
    'hw': 'ʍ',
    'lh': 'λ',
    'ñ': 'ŋ',
    'ng': 'ŋ',
    'nth': 'ꞥ',
    'ph': 'ɸ',
    'rh': 'ꝛ',
    'th': 'θ',
  },
  validInitialConsonants: ['b', 'c', 'd', 'f', 'g', 'h', 'ʍ', 'i', 'l', 'λ', 'm', 'n', 'p', 'r', 'ꝛ', 's', 't', 'θ'],
  validInitialClusters: ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'gl', 'gr', 'gw', 'pr', 'tr'],
  lenitedInitialConsonants: ['b', 'x', 'ꭓ', 'd', 'ð', 'g', 'g', 'h', 'i', 'l', 'm', 'n', 'ŋ', 'r', 'θ', 'v', 'w'],
  lenitedInitialClusters: ['br', 'xl', 'xr', 'dr', 'ðr', 'fl', 'fr', 'ml', 'mr', 'θl', 'θr', 'vl', 'vr'],
  validFinalConsonants: ['b', 'x', 'd', 'ð', 'ɸ', 'w'],
  validFinalClusters: ['fn', 'lx', 'lɸ', 'll', 'lt', 'lv', 'mp', 'nc', 'nd', 'nt', 'rx', 'rð', 'rn', 'rθ', 'rv', 'sg', 'sp', 'st'],
  finalClusterAlternateSpelling: { 'f': 'v', 'lf': 'lv', 'rf': 'rv' },
  alternateSpelling: { 'm': 'mm', 's': 'ss' },
};

export const OLD_SINDARIN_PROFILE = {
  ...SINDARIN_PROFILE,
  diphthongs: ['ai', 'ui', 'iu'],
};

export const ANCIENT_TELERIN_PROFILE = {
  ...SINDARIN_PROFILE,
  diphthongs: ['ai', 'ui', 'iu'],
  longVowelMarks: ['¯'],      // Only macron = long vowel
  stressMarks: ['´']          // Acute = stress marker
};

// =============================================================================
// SyllableAnalyser Class
// =============================================================================

export class SyllableAnalyser {
  // Options for vowel detection
  includeY = false;
  includeW = false;

  // Default values (Sindarin)
  legalVowels = SINDARIN_PROFILE.vowels;
  legalDiphthongs = SINDARIN_PROFILE.diphthongs;
  // Marks that indicate long vowels (macron, acute, circumflex by default)
  longVowelMarks = ['¯', '´', '^'];
  // Marks that indicate stress (empty = use positional rules)
  stressMarks = [];
  legalConsonants = SINDARIN_PROFILE.consonants;
  legalDigraphs = SINDARIN_PROFILE.digraphs;
  digraphMap = SINDARIN_PROFILE.digraphMap;
  validInitialConsonants = SINDARIN_PROFILE.validInitialConsonants;
  validInitialClusters = SINDARIN_PROFILE.validInitialClusters;
  lenitedInitialConsonants = SINDARIN_PROFILE.lenitedInitialConsonants;
  lenitedInitialClusters = SINDARIN_PROFILE.lenitedInitialClusters;
  validFinalConsonants = SINDARIN_PROFILE.validFinalConsonants;
  validFinalClusters = SINDARIN_PROFILE.validFinalClusters;
  finalClusterAlternateSpelling = SINDARIN_PROFILE.finalClusterAlternateSpelling;
  alternateSpelling = SINDARIN_PROFILE.alternateSpelling;

  constructor(options = {}) {
    // Vowel detection options
    if (options.includeY !== undefined) this.includeY = options.includeY;
    if (options.includeW !== undefined) this.includeW = options.includeW;

    // Apply language profile if provided
    if (options.profile) {
      const p = options.profile;
      if (p.vowels) this.legalVowels = p.vowels;
      if (p.diphthongs) this.legalDiphthongs = p.diphthongs;
      if (p.consonants) this.legalConsonants = p.consonants;
      if (p.digraphs) this.legalDigraphs = p.digraphs;
      if (p.digraphMap) this.digraphMap = p.digraphMap;
      if (p.validInitialConsonants) this.validInitialConsonants = p.validInitialConsonants;
      if (p.validInitialClusters) this.validInitialClusters = p.validInitialClusters;
      if (p.lenitedInitialConsonants) this.lenitedInitialConsonants = p.lenitedInitialConsonants;
      if (p.lenitedInitialClusters) this.lenitedInitialClusters = p.lenitedInitialClusters;
      if (p.validFinalConsonants) this.validFinalConsonants = p.validFinalConsonants;
      if (p.validFinalClusters) this.validFinalClusters = p.validFinalClusters;
      if (p.finalClusterAlternateSpelling) this.finalClusterAlternateSpelling = p.finalClusterAlternateSpelling;
      if (p.alternateSpelling) this.alternateSpelling = p.alternateSpelling;
      if (p.longVowelMarks) this.longVowelMarks = p.longVowelMarks;
      if (p.stressMarks) this.stressMarks = p.stressMarks;
    }
  }

  /**
   * Convert digraphs to single characters using the class's digraphMap.
   * Handles 3-character digraphs first (chw, nth).
   * @param {string} str - The string to convert
   * @param {boolean} compoundWord - If true, skip digraph conversion entirely (for compound words where digraphs may span morpheme boundaries)
   * @returns {string} String with digraphs replaced by single characters
   */
  digraphsToSingle(str, compoundWord = false) {
    // For compound words, don't convert any digraphs - they may span morpheme boundaries
    if (compoundWord) {
      return str;
    }
    let result = str;
    // Sort by length descending to handle 3-char digraphs first
    const sortedDigraphs = Object.keys(this.digraphMap).sort((a, b) => b.length - a.length);
    for (const digraph of sortedDigraphs) {
      const regex = new RegExp(digraph, 'gi');
      result = result.replace(regex, this.digraphMap[digraph]);
    }
    return result;
  }

  /**
   * Convert single characters back to digraphs.
   * @param {string} str - The string to convert
   * @returns {string} String with single characters replaced by digraphs
   */
  singleToDigraphs(str) {
    let result = str;
    // Reverse the map and sort by value length descending
    const reverseMap = {};
    for (const [digraph, single] of Object.entries(this.digraphMap)) {
      reverseMap[single] = digraph;
    }
    for (const [single, digraph] of Object.entries(reverseMap)) {
      result = result.replace(new RegExp(single, 'g'), digraph);
    }
    return result;
  }

  /**
   * Check if a two-character string is a diphthong.
   * @param {string} str - The string to check
   * @returns {boolean} True if it's a diphthong
   */
  isDiphthong(str) {
    return this.legalDiphthongs.includes(str.toLowerCase());
  }

  /**
   * Check if a cluster is a valid initial cluster (can begin a syllable).
   * @param {string} cluster - The cluster to check
   * @returns {boolean} True if it's a valid initial cluster
   */
  isValidOnset(cluster) {
    if (cluster.length === 0) return true;
    if (cluster.length === 1) {
      // Single consonant - check if it's a valid consonant
      const c = cluster.toLowerCase();
      return this.legalConsonants.includes(c) ||
             Object.values(this.digraphMap).includes(c) ||
             this.validInitialConsonants.includes(c) ||
             this.lenitedInitialConsonants.includes(c);
    }
    // Multi-character cluster
    const lowerCluster = cluster.toLowerCase();
    return this.validInitialClusters.includes(lowerCluster) ||
           this.lenitedInitialClusters.includes(lowerCluster);
  }

  /**
   * Split a word into syllables following the Sindarin syllable rules.
   * 
   * Syllable rules:
   *   A syllable consists of a vocalic core with at least one vowel and attached consonants.
   *   If a word has only one vowel, it has only one syllable.
   *   The simplest syllable is a single vowel.
   *   A vowel can be preceded by one or two consonants.
   *   A vowel can be followed by up to two consonants.
   *   A syllable can consist of a diphtong with associated consonants.
   *   The elements of a diphthong are never split between two syllables.
   *   If more than one consonant begins a syllable, the second consonant must be l, r, or w (the latter only in the cluster "gw").
   *   When no consonant follows a vowel, and the vowels don't form a diphtong, they split between syllables.
   *   When a single consonant follows a vowel, the syllable break almost always comes before the following consonant, except when that's final.
   *   The rule above has an exception with the letter m.
   *   When only two consonants follow each other in the middle of a word, the division occurs between them.
   *   When 3 consonants follows each other, the split occurs after the first one if the two others are an allowed pattern for words or syllables.
   *   4 consonants in the middle of a word are illegal.
   *   All digraphs in this code must use the single character pattern for syllable logic.
   *
   *   Light and heavy, open and closed syllables:
   *   A light syllable consists of a short vowel, by itself, or preceded by one or more consonants. All other syllables are heavy.
   *   An open syllable is followed by a single consonant or none. All other syllables are closed.
   *   All closed syllables are heavy.
   *   Open syllables can be light or heavy.
   *
   *   Stress:
   *   Monosyllables tend to be unstressed depending on their role.
   *   Words with two syllables are stressed on the first syllable.
   *   Longer words have the stress placed on the penultimate or antepenultimate syllable.
   *   Stress falls on the penultimate syllable when it is heavy.
   *   Stress falls on the antepenultimate syllable when the penultimate is light.
   *
   *   Long consonants:
   *   Long consonants are written as double consonants.
   *   Except for 'mm' and 'ss'.
   * 
   * @param {string} word - The word to syllabify
   * @param {boolean} compoundWord - If true, treats ng/nth as separate sounds (n+g, n+th) rather than digraphs
   * @returns {string[]} Array of syllables
   */
  syllabify(word, compoundWord = false) {
    const originalWord = word;
    const lowerWord = word.toLowerCase();

    // Convert digraphs to single characters
    // For compound words, only convert "safe" digraphs (th, dh, ch, etc.) not ng/nth
    const converted = this.digraphsToSingle(lowerWord, compoundWord);

    // 1. Detect nuclei (vowels and diphthongs)
    const nuclei = [];
    for (let i = 0; i < converted.length; i++) {
      const two = converted.slice(i, i + 2);
      if (this.isDiphthong(two)) {
        nuclei.push({ start: i, end: i + 2 });
        i++; // Skip next char as it's part of diphthong
      } else if (converted[i].isVowel(this.includeY, this.includeW)) {
        nuclei.push({ start: i, end: i + 1 });
      }
    }

    // No vowels or single syllable
    if (nuclei.length === 0) return [originalWord];
    if (nuclei.length === 1) return [originalWord];

    // 2. Split between nuclei based on consonant rules
    const syllableBoundaries = [0];

    for (let n = 0; n < nuclei.length - 1; n++) {
      const leftNucleus = nuclei[n];
      const rightNucleus = nuclei[n + 1];
      const between = converted.slice(leftNucleus.end, rightNucleus.start);

      if (between.length === 0) {
        // Adjacent vowels (hiatus) - split between them
        syllableBoundaries.push(rightNucleus.start);
      } else if (between.length === 1) {
        // Single consonant between vowels
        if (n === nuclei.length - 2 && rightNucleus.end === converted.length) {
          syllableBoundaries.push(leftNucleus.end);
        } else {
          syllableBoundaries.push(leftNucleus.end);
        }
      } else if (between.length === 2) {
        // Two consonants - split between them
        syllableBoundaries.push(leftNucleus.end + 1);
      } else if (between.length === 3) {
        // Three consonants
        const lastTwo = between.slice(1);
        if (this.isValidOnset(lastTwo)) {
          syllableBoundaries.push(leftNucleus.end + 1);
        } else {
          syllableBoundaries.push(leftNucleus.end + 2);
        }
      } else {
        // 4+ consonants - split in the middle
        const mid = Math.floor(between.length / 2);
        syllableBoundaries.push(leftNucleus.end + mid);
      }
    }

    syllableBoundaries.push(converted.length);

    // 3. Extract syllables from converted string
    const convertedSyllables = [];
    for (let i = 0; i < syllableBoundaries.length - 1; i++) {
      convertedSyllables.push(converted.slice(syllableBoundaries[i], syllableBoundaries[i + 1]));
    }

    // 4. Decide whether to convert back to digraphs or keep single chars
    const singleCharSymbols = Object.values(this.digraphMap);
    const inputHadSingleChars = singleCharSymbols.some(sym => lowerWord.includes(sym));

    const syllables = inputHadSingleChars
      ? convertedSyllables
      : convertedSyllables.map(syl => this.singleToDigraphs(syl));

    // 5. Restore original case
    let origIndex = 0;
    const casedSyllables = syllables.map(syl => {
      let cased = '';
      for (const char of [...syl]) {
        if (origIndex < originalWord.length) {
          const origChar = originalWord[origIndex];
          if (origChar === origChar.toUpperCase() && origChar !== origChar.toLowerCase()) {
            cased += char.toUpperCase();
          } else {
            cased += char;
          }
          origIndex++;
        } else {
          cased += char;
        }
      }
      return cased;
    });

    return casedSyllables;
  }

  /**
   * Check if a syllable contains a long vowel (has a macron or acute accent).
   * @param {string} syllable - The syllable to check
   * @returns {boolean} True if it contains a long vowel
   */
  hasLongVowel(syllable) {
    // Use grapheme segmentation to keep combining marks with their base characters
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const graphemes = [...segmenter.segment(syllable)].map(s => s.segment);
    for (const char of graphemes) {
      const base = char.removeMarks();
      if (base && base.isVowel(false, false)) {
        // Check each combining mark individually (vowel may have multiple marks)
        const normalised = char.normaliseToMany();
        for (const cp of [...normalised]) {
          if (cp.isMark() && this.longVowelMarks.includes(cp.getMark() || cp)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if a syllable has an explicit stress mark.
   * @param {string} syllable - The syllable to check
   * @returns {boolean} True if it has a stress mark
   */
  hasStressMark(syllable) {
    // Use grapheme segmentation to keep combining marks with their base characters
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const graphemes = [...segmenter.segment(syllable)].map(s => s.segment);
    for (const char of graphemes) {
      const base = char.removeMarks();
      if (base && base.isVowel(false, false)) {
        // Check each combining mark individually (vowel may have multiple marks)
        const normalised = char.normaliseToMany();
        for (const cp of [...normalised]) {
          if (cp.isMark() && this.stressMarks.includes(cp.getMark() || cp)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if a syllable contains a diphthong.
   * @param {string} syllable - The syllable to check
   * @returns {boolean} True if it contains a diphthong
   */
  containsDiphthong(syllable) {
    const lower = syllable.toLowerCase().removeMarks();
    for (const diph of this.legalDiphthongs) {
      if (lower.includes(diph)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a syllable ends in a consonant.
   * @param {string} syllable - The syllable to check
   * @returns {boolean} True if it ends in a consonant
   */
  endsInConsonant(syllable) {
    const lastChar = syllable.nth(-1);
    return lastChar.isConsonant();
  }

  /**
   * Extract the vowel nucleus (single vowel or diphthong) with any marks.
   * @param {string} syllable - The syllable to extract from
   * @returns {string} The vowel nucleus with marks, or empty string
   */
  extractNucleus(syllable) {
    // Use grapheme segmentation to keep combining marks with their base characters
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const chars = [...segmenter.segment(syllable)].map(s => s.segment);

    // Find first vowel position
    for (let i = 0; i < chars.length; i++) {
      const base = chars[i].removeMarks();
      if (base && base.isVowel(this.includeY, this.includeW)) {
        // Check for diphthong (next char is also a vowel and together they form a legal diphthong)
        if (i + 1 < chars.length) {
          const nextBase = chars[i + 1].removeMarks();
          const pair = (base + nextBase).toLowerCase();
          if (this.isDiphthong(pair)) {
            return chars[i] + chars[i + 1];
          }
        }
        return chars[i];
      }
    }
    return '';
  }

  /**
   * Analyse a word and return detailed data on each syllable.
   * @param {string} word - The word to analyse
   * @param {boolean} compoundWord - If true, treats ng/nth as separate sounds (n+g, n+th) rather than digraphs
   * @returns {Object[]} Array of syllable analysis objects
   */
  analyse(word, compoundWord = false) {
    const syllables = this.syllabify(word, compoundWord);
    const result = [];

    for (let i = 0; i < syllables.length; i++) {
      const syllable = syllables[i];

      // Determine weight (light or heavy)
      const hasLong = this.hasLongVowel(syllable);
      const hasDiph = this.containsDiphthong(syllable);
      const endsConsonant = this.endsInConsonant(syllable);
      const nucleus = this.extractNucleus(syllable);

      let weight;
      if (hasLong || hasDiph || endsConsonant) {
        weight = 'heavy';
      } else {
        weight = 'light';
      }

      // Determine structure (open or closed)
      const structure = endsConsonant ? 'closed' : 'open';

      result.push({
        syllable,
        weight,
        structure,
        stressed: false, // Will be set below
        nucleus,
      });
    }

    // Determine stress
    // Check for explicit stress marks first
    const explicitlyStressed = result.filter(s => this.hasStressMark(s.syllable));
    if (explicitlyStressed.length > 0) {
      explicitlyStressed.forEach(s => s.stressed = true);
    } else if (syllables.length === 1) {
      // Monosyllables: unstressed
      result[0].stressed = false;
    } else if (syllables.length === 2) {
      // Disyllabic: stress first syllable
      result[0].stressed = true;
    } else {
      // Polysyllabic: stress penultimate if heavy, antepenultimate if penultimate is light
      const penultimate = result[result.length - 2];
      if (penultimate.weight === 'heavy') {
        penultimate.stressed = true;
      } else {
        // Stress antepenultimate (third from last)
        if (result.length >= 3) {
          result[result.length - 3].stressed = true;
        } else {
          // If only 2 syllables and penultimate is light, stress first anyway
          result[0].stressed = true;
        }
      }
    }

    return result;
  }
}
