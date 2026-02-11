// Extensing the String prototype

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
  value(n) {
    const index = n < 0 ? this.length + n : n;
    return this.charAt(index) || '';
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
const DIPHTHONGS = ['ae', 'ai', 'au', 'ei', 'eu', 'oe', 'ui'];

/**
 * Array of legal consonant clusters that can begin a syllable in Sindarin.
 * Uses single-char representations after digraph conversion: th→θ, dh→ð, ch→x, rh→ꝛ, lh→λ, gw→ƣ, ng→ŋ, wh→ʍ, ph→ɸ, ss→ſ
 * @type {string[]}
 */
const LEGAL_ONSETS = [
  // Single consonants (these go with the following syllable in VCV patterns)
  'b', 'c', 'd', 'f', 'g', 'h', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w',
  'θ', 'ð', 'x', 'ꝛ', 'λ', 'ƣ', 'ŋ', 'ʍ', 'ɸ',
  // Two-consonant clusters that are truly indivisible medially
  // Removed: dr, tr, θr, gl, gr (these split medially in Sindarin)
  // Kept: s+consonant clusters, labial+liquid clusters
  'bl', 'br', 'cl', 'cr', 'fl', 'fr', 'pl', 'pr',
  'sc', 'sp', 'st', 'sl', 'sm', 'sn', 'sw',
  'ƣl', 'ƣr',
  // Prenasalized stop: ŋg stays together (ŋ is only used for the velar nasal phoneme)
  // Note: mb and nd are NOT included because they often split (e.g., Gondor → Gon.dor)
  'ŋg',
  // Three-consonant clusters (rare)
  'scr', 'spr', 'str',
];

/**
 * Converts digraphs to single characters for easier processing.
 * @param {string} str - The string to convert
 * @returns {string} String with digraphs replaced by single characters
 */
function digraphsToSingle(str) {
  return str
    .replace(/ng/g, 'ŋ')
    .replace(/wh/g, 'ʍ')
    .replace(/ph/g, 'ɸ')
    .replace(/dh/g, 'ð')
    .replace(/th/g, 'θ')
    .replace(/ch/g, 'x')
    .replace(/kh/g, 'x')
    .replace(/rh/g, 'ꝛ')
    .replace(/lh/g, 'λ')
    .replace(/ss/g, 'ſ')
    .replace(/gw/g, 'ƣ');
}

/**
 * Converts single characters back to digraphs.
 * @param {string} str - The string to convert
 * @returns {string} String with single characters replaced by digraphs
 */
function singleToDigraphs(str) {
  return str
    .replace(/ŋ/g, 'ng')
    .replace(/ʍ/g, 'wh')
    .replace(/ɸ/g, 'ph')
    .replace(/ð/g, 'dh')
    .replace(/θ/g, 'th')
    .replace(/x/g, 'ch')
    .replace(/λ/g, 'lh')
    .replace(/ꝛ/g, 'rh')
    .replace(/ſ/g, 'ss')
    .replace(/ƣ/g, 'gw');
}

/**
 * Checks if a two-character string is a valid Sindarin diphthong.
 * @param {string} str - The two-character string to check
 * @returns {boolean} True if the string is a diphthong
 */
function isDiphthong(str) {
  return DIPHTHONGS.includes(str.toLowerCase());
}

/**
 * Splits a word into syllables according to Sindarin phonotactics.
 * Handles digraphs by converting them to single characters, syllabifying,
 * then converting back. Preserves original case.
 *
 * @param {string} word - The word to syllabify
 * @returns {string[]} Array of syllables
 * @example
 * syllabify("Galadriel") // returns ["Ga", "lad", "ri", "el"]
 * syllabify("Eldamar")   // returns ["El", "da", "mar"]
 * syllabify("athelas")   // returns ["a", "the", "las"]
 */
export function syllabify(word) {
  const originalWord = word;
  const lowerWord = word.toLowerCase();

  // Convert digraphs to single characters
  const converted = digraphsToSingle(lowerWord);

  // 1. Detect nuclei (vowels and diphthongs)
  const nuclei = [];
  for (let i = 0; i < converted.length; i++) {
    const two = converted.slice(i, i + 2);
    if (isDiphthong(two)) {
      nuclei.push({ start: i, end: i + 2 });
      i++; // Skip next char as it's part of diphthong
    } else if (converted[i].isVowel(false, false)) {
      // isVowel(includeY=false, includeW=false) - only pure vowels
      nuclei.push({ start: i, end: i + 1 });
    }
  }

  // No vowels or single syllable
  if (nuclei.length === 0) return [originalWord];
  if (nuclei.length === 1) return [originalWord];

  // 2. Split between nuclei using maximal onset principle
  const syllableBoundaries = [0];

  for (let n = 0; n < nuclei.length - 1; n++) {
    const leftNucleus = nuclei[n];
    const rightNucleus = nuclei[n + 1];
    const between = converted.slice(leftNucleus.end, rightNucleus.start);

    if (between.length === 0) {
      // Adjacent vowels (hiatus) - split between them
      syllableBoundaries.push(rightNucleus.start);
    } else {
      // Find maximal legal onset for the next syllable
      let onsetLength = 0;
      for (let k = between.length; k > 0; k--) {
        const potentialOnset = between.slice(between.length - k);
        if (LEGAL_ONSETS.includes(potentialOnset)) {
          onsetLength = k;
          break;
        }
      }
      // Boundary is where the onset begins
      const boundary = rightNucleus.start - onsetLength;
      syllableBoundaries.push(boundary);
    }
  }

  syllableBoundaries.push(converted.length);

  // 3. Extract syllables from converted string
  const convertedSyllables = [];
  for (let i = 0; i < syllableBoundaries.length - 1; i++) {
    convertedSyllables.push(converted.slice(syllableBoundaries[i], syllableBoundaries[i + 1]));
  }

  // 4. Convert back to digraphs
  const syllables = convertedSyllables.map(syl => singleToDigraphs(syl));

  // Mapping of digraphs to their single-character equivalents
  const digraphToSingle = {
    'th': 'θ', 'dh': 'ð', 'ch': 'x', 'kh': 'x',
    'rh': 'ꝛ', 'lh': 'λ', 'ng': 'ŋ', 'wh': 'ʍ',
    'ph': 'ɸ', 'ss': 'ſ', 'gw': 'ƣ',
  };
  const digraphList = Object.keys(digraphToSingle);

  // 5. Restore original case by mapping back
  // Build a case map from original word
  const result = [];
  let origIndex = 0;
  for (const syl of syllables) {
    let restoredSyl = '';
    for (let i = 0; i < syl.length && origIndex < originalWord.length; i++) {
      // Handle digraphs in output matching original
      if (i < syl.length - 1) {
        const digraph = syl.slice(i, i + 2).toLowerCase();
        const origChar = originalWord[origIndex].toLowerCase();
        const origDigraph = originalWord.slice(origIndex, origIndex + 2).toLowerCase();

        if (digraphList.includes(digraph)) {
          // Check if original has the digraph as ASCII (e.g., "th")
          if (digraph === origDigraph) {
            restoredSyl += originalWord.slice(origIndex, origIndex + 2);
            origIndex += 2;
            i++; // Skip next char in syl
            continue;
          }
          // Check if original has the single-char equivalent (e.g., "θ")
          if (origChar === digraphToSingle[digraph]) {
            restoredSyl += originalWord[origIndex];
            origIndex += 1;
            i++; // Skip next char in syl (we consumed 2 chars from syllable but 1 from original)
            continue;
          }
        }
      }
      restoredSyl += originalWord[origIndex];
      origIndex++;
    }
    result.push(restoredSyl);
  }

  return result;
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
      };
    }
  }
  return {
    found: false,
    matched: null,
    charIndex: -1,
    nextChar: null,
  }
}


export class SyllableAnalyser {
  legalVowels = [
    'a', 'á', 'e', 'é', 'i', 'í', 'o', 'ó', 'u', 'ú', 'y'
  ];
  legalDiphthongs = [
    'ae', 'ai', 'au', 'aw', 'ei', 'oe', 'ui'
  ];
  legalConsonants = [
    'b', 'c', 'k', 'd', 'f', 'g', 'h', 'i', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w'
  ];
  legalDigraphs = [
    'ch', 'chw', 'dh', 'hw', 'lh', 'ng', 'nth', 'ph', 'rh', 'th'
  ];
  digraphMap = {
    'ch': 'x',
    'chw': 'ꭓ', //'xʍ',
    'dh': 'ð',
    'gw': 'ƣ',
    'hw': 'ʍ',
    'lh': 'λ',
    'ng': 'ŋ',
    'nth': 'ꞥ',// 'nθ',
    'ph': 'ɸ',
    'rh': 'ꝛ',
    'th': 'θ',
  };
  validInitialConsonants = [
    'b', 'c', 'd', 'f', 'g', 'h', 'ʍ', 'i', 'l', 'λ', 'm', 'n', 'p', 'r', 'ꝛ', 's', 't', 'θ'
  ];
  validInitialClusters = [
    'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'gl', 'gr', 'gw', 'pr', 'tr'
  ];
  lenitedInitialConsonants = [
    'b', 'x', 'ꭓ', 'd', 'ð', 'g', 'g', 'h', 'i', 'l', 'm', 'n', 'ŋ', 'r', 'θ', 'v', 'w'
  ];
  lenitedInitialClusters = [
    'br', 'xl', 'xr', 'dr', 'ðr', 'fl', 'fr', 'ml', 'mr', 'θl', 'θr', 'vl', 'vr'
  ];
  validFinalConsonants = [
    'b', 'x', 'd', 'ð', 'ɸ', 'w'
  ];
  validFinalClusters = [
    'fn', 'lx', 'lɸ', 'll', 'lt', 'lv', 'mp', 'nc', 'nd', 'nt', 'rx', 'rð', 'rn', 'rθ', 'rv', 'sg', 'sp', 'st'
  ];
  finalClusterAlternateSpelling = {
    'f': 'v',
    'lf': 'lv',
    'rf': 'rv'
  };
  alternateSpelling = {
    'm': 'mm',
    's': 'ss'
  };

  // Syllable rules:
  // A syllable consists of a vocalic core with at least one vowel and attached consonants.
  // If a word has only one vowel, it has only one syllable.
  // The simplest syllable is a single vowel.
  // A vowel can be preceded by one or two consonants.
  // A vowel can be followed by up to two consonants.
  // A syllable can consist of a diphtong with associated consonants.
  // The elements of a diphthong are never split between two syllables.
  // If more than one consonant begins a syllable, the second consonant must be l, r, or w (the latter only in the cluster "gw").
  // When no consonant follows a vowel, and the vowels don't form a diphtong, they split between syllables.
  // When a single consonant follows a vowel, the syllable break almost always comes before the following consonant, except when that's final.
  // The rule above has an exception with the letter m.
  // When only two consonants follow each other in the middle of a word, the division occurs between them.
  // When 3 consonants follows each other, the split occurs after the first one if the two others are an allowed pattern for words or syllables.
  // 4 consonants in the middle of a word are illegal.
  // All digraphs in this code must use the single character pattern for syllable logic.

  // Light and heavy, open and closed syllables:
  // A light syllable consists of a short vowel, by itself, or preceded by one or more consonants. All other syllables are heavy.
  // An open syllable is followed by a single consonant or none. All other syllables are closed.
  // All closed syllables are heavy.
  // Open syllables can be light or heavy.

  // Stress:
  // Monosyllables tend to be unstressed depending on their role.
  // Words with two syllables are stressed on the first syllable.
  // Longer words have the stress placed on the penultimate or antepenultimate syllable.
  // Stress falls on the penultimate syllable when it is heavy.
  // Stress falls on the antepenultimate syllable when the penultimate is light.

  // Long consonants:
  // Long consonants are written as double consonants.
  // Except for 'mm' and 'ss'.

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
      } else if (converted[i].isVowel(false, false)) {
        // isVowel(includeY=false, includeW=false) - only pure vowels
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
        // Rule: When no consonant follows a vowel, and the vowels don't form a diphthong, they split between syllables.
        syllableBoundaries.push(rightNucleus.start);
      } else if (between.length === 1) {
        // Single consonant between vowels
        // Rule: When a single consonant follows a vowel, the syllable break almost always comes before the following consonant, except when that's final.
        // Check if this is the last syllable boundary and the consonant is final
        if (n === nuclei.length - 2 && rightNucleus.end === converted.length) {
          // The consonant precedes the final vowel - goes with the final syllable
          syllableBoundaries.push(leftNucleus.end);
        } else {
          // Consonant goes with the following syllable
          syllableBoundaries.push(leftNucleus.end);
        }
      } else if (between.length === 2) {
        // Two consonants
        // Rule: When only two consonants follow each other in the middle of a word, the division occurs between them.
        // No exceptions - always split between them in medial position.
        syllableBoundaries.push(leftNucleus.end + 1);
      } else if (between.length === 3) {
        // Three consonants
        // Rule: When 3 consonants follow each other, the split occurs after the first one if the two others are an allowed pattern for words or syllables.
        const lastTwo = between.slice(1);
        if (this.isValidOnset(lastTwo)) {
          // Split after first consonant
          syllableBoundaries.push(leftNucleus.end + 1);
        } else {
          // Split after second consonant
          syllableBoundaries.push(leftNucleus.end + 2);
        }
      } else {
        // 4+ consonants - split in the middle (this shouldn't happen in legal Sindarin)
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

    // 4. Convert back to digraphs
    const syllables = convertedSyllables.map(syl => this.singleToDigraphs(syl));

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
    for (const char of [...syllable]) {
      if (char.isVowel(false, false)) {
        const mark = char.getMark();
        // Long vowels have macron (¯), acute (´), or circumflex (^)
        if (mark === '¯' || mark === '´' || mark === '^') {
          return true;
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
      // Light: short vowel, by itself, or preceded by consonants (open syllable with short vowel)
      // Heavy: long vowel, diphthong, or ends in consonant
      const hasLong = this.hasLongVowel(syllable);
      const hasDiph = this.containsDiphthong(syllable);
      const endsConsonant = this.endsInConsonant(syllable);

      let weight;
      if (hasLong || hasDiph || endsConsonant) {
        weight = 'heavy';
      } else {
        weight = 'light';
      }

      // Determine structure (open or closed)
      // Closed: ends in consonant
      // Open: ends in vowel (or diphthong's final vowel)
      const structure = endsConsonant ? 'closed' : 'open';

      result.push({
        syllable,
        weight,
        structure,
        stressed: false // Will be set below
      });
    }

    // Determine stress
    if (syllables.length === 1) {
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



// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const sindarinRules = {
  '00100': {
    pattern: '[w-] > [gw-]',
    description: 'initial [w] became [gw]',
    url: 'https://eldamo.org/content/words/word-2002760597.html',
    mechanic: (str) => {
      const initialW = str.nth(0).toLowerCase() === 'w';
      if (initialW) {
        return str.replace('w', 'gw');
      }
      return str;
    },
  },
  '00200': {
    pattern: '[{mb|nd|ŋg}-] > [{bdg}-]',
    description: 'initial nasals vanished before stops',
    url: 'https://eldamo.org/content/words/word-3057844573.html',
    mechanic: (str) => {
      const initialNasal = str.substring(0, 2) === 'mb' || str.substring(0, 2) === 'nd' || str.substring(0, 2) === 'ŋg';
      if (initialNasal) {
        return str.replace('mb', 'b').replace('nd', 'd').replace('ŋg', 'g');
      }
      return str;
    },
  },
  '00300': {
    pattern: '[-V{mn}] > [-Vø]',
    description: 'final nasals vanished after vowels',
    url: 'https://eldamo.org/content/words/word-876455981.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      const penultimateChar = str.nth(-2);
      const isPenultimateVowel = penultimateChar.isVowel();
      if (isPenultimateVowel && (lastChar === 'm' || lastChar === 'n')) {
        return str.substring(0, str.length - 1);
      }
      return str;
    },
  },
  '00400': {
    pattern: '[s{ɸθx}-] > [{ɸθx}-]',
    description: 'initial [s] vanished before spirants',
    url: 'https://eldamo.org/content/words/word-3841187313.html',
    mechanic: (str) => {
      const initialS = str.nth(0).toLowerCase() === 's';
      if (initialS) {
        const secondPhoneme = str.nth(1).toLowerCase();
        if (secondPhoneme === 'ɸ' || secondPhoneme === 'θ' || secondPhoneme === 'x') {
          return str.replace('s', '');
        }
      }
      return str;
    },
  },
  '00500': {
    pattern: '[j̊-] > [x-]',
    description: 'initial voiceless [j̊] became [x]',
    url: 'https://eldamo.org/content/words/word-2178021811.html',
    mechanic: (str) => {
      const initialJ = str.substring(0, 2) === 'hy';
      if (initialJ) {
        return str.replace('hy', 'ch');
      }
      return str;
    },
  },
  '00600': {
    pattern: '[{rl}{bdg}] > [{rl}{vðɣ}]',
    description: 'voiced stops became spirants after liquids',
    url: 'https://eldamo.org/content/words/word-1590520649.html',
    mechanic: (str) => {
      const rIndex = str.indexOf('r');
      const lIndex = str.indexOf('l');
      if (rIndex !== -1) {
        const nextChar = str.nth(rIndex + 1);
        if (nextChar === 'b' || nextChar === 'd' || nextChar === 'g') {
          return str.replace('rb', 'rv').replace('rd', 'rð').replace('rg', 'rɣ');
        }
      }
      if (lIndex !== -1) {
        const nextChar = str.nth(lIndex + 1);
        if (nextChar === 'b' || nextChar === 'd' || nextChar === 'g') {
          return str.replace('lb', 'lv').replace('ld', 'lð').replace('lg', 'lɣ');
        }
      }
      return str;
    },
  },
  '00700': {
    pattern: '[z{bg}] > [ð{βɣ}]',
    description: '[zb], [zg] became [ðβ], [ðɣ]',
    url: 'https://eldamo.org/content/words/word-1951748921.html',
    mechanic: (str) => {
      const zIndex = str.indexOf('z');
      if (zIndex !== -1) {
        const nextChar = str.nth(zIndex + 1);
        if (nextChar === 'b' || nextChar === 'g') {
          return str.replace('zb', 'ðβ').replace('zg', 'ðɣ');
        }
      }
      return str;
    },
  },
  '00800': {
    pattern: '[-{ĭŭ}{C|CC}a] > [-{eo}{C|CC}a]',
    description: 'short [i], [u] became [e], [o] preceding final [a]',
    url: 'https://eldamo.org/content/words/word-1593810649.html',
    mechanic: (str) => {
      const syllables = syllabify(str);
      const lastSyllable = syllables[syllables.length - 1].removeMarks();
      if (lastSyllable.indexOf('a') !== -1) {
        const noMarksStr = str.removeMarks();
        const iIndex = noMarksStr.indexOf('i');
        const uIndex = noMarksStr.indexOf('u');
        if (iIndex !== -1) {
          const iChar = str.nth(iIndex);
          if (iChar.isMark()) {
            const iMark = iChar.getMark();
            const eMark = 'e'.addMark(iMark);
            return str.replace('i', eMark);
          } else {
            return str.replace('i', 'e');
          }
        }
        if (uIndex !== -1) {
          const uChar = str.nth(uIndex);
          if (uChar.isMark()) {
            const uMark = uChar.getMark();
            const oMark = 'o'.addMark(uMark);
            return str.replace('u', oMark);
          } else {
            return str.replace('u', 'o');
          }
        }
      }
      return str;
    },
  },
  '00900': {
    pattern: '[V{bdg}] > [V{vðɣ}]',
    description: 'voiced stops became spirants after vowels',
    url: 'https://eldamo.org/content/words/word-1726791627.html',
    mechanic: (str) => {
      const aStr = str.split('');
      for (let i = 0; i < aStr.length; i++) {
        const char = aStr[i];
        if (char.isVowel()) {
          const nextChar = aStr[i + 1];
          if (nextChar === 'b') {
            aStr[i + 1] = 'v';
          } else if (nextChar === 'd') {
            aStr[i + 1] = 'ð';
          } else if (nextChar === 'g') {
            aStr[i + 1] = 'ɣ';
          }
        }
      }
      return aStr.join('');
    },
  },
  '01000': {
    pattern: '[ɸ|β] > [f|v]',
    description: '[ɸ], [β] became [f], [v]',
    url: 'https://eldamo.org/content/words/word-890563133.html',
    mechanic: (str) => {
      return str.replaceAll('ɸ', 'f').replaceAll('β', 'v');
    },
  },
  '01100': {
    pattern: '[CjV] > [CiV]',
    description: 'medial [j] became [i]',
    url: 'https://eldamo.org/content/words/word-1679623085.html',
    mechanic: (str) => {
      // Check: can a word have multiple [j]s?
      const jIndex = str.indexOf('j');
      if (jIndex !== -1) {
        const isInitial = str.nth(0) === 'j';
        const isFinal = str.nth(-1) === 'j';
        if (!isInitial && !isFinal) {
          return str.replace('j', 'i');
        }
      }
      return str;
    },
  },
  '01200': {
    pattern: '[-{ĕŏ}{C|CC}i] > [-{iu}{C|CC}i]',
    description: 'short [e], [o] became [i], [u] in syllable before final [i]',
    url: 'https://eldamo.org/content/words/word-2646655607.html',
    mechanic: (str) => {
      const syllables = syllabify(str);
      const lastSyllable = syllables[syllables.length - 1].removeMarks();
      if (lastSyllable.indexOf('i') !== -1) {
        const secondLastSyllable = syllables[syllables.length - 2];
        const secondLastSyllableUnmarked = secondLastSyllable.removeMarks();
        const eIndex = secondLastSyllableUnmarked.indexOf('e');
        const oIndex = secondLastSyllableUnmarked.indexOf('o');
        let newSyllable = secondLastSyllable;
        if (eIndex !== -1) {
          const eMark = secondLastSyllable.nth(eIndex).getMark();
          const iMark = 'i'.addMark(eMark);
          newSyllable = secondLastSyllable.replace('e', iMark);
        }
        if (oIndex !== -1) {
          const oMark = secondLastSyllable.nth(oIndex).getMark();
          const uMark = 'u'.addMark(oMark);
          newSyllable = secondLastSyllable.replace('o', uMark);
        }
        return str.replace(secondLastSyllable, newSyllable);
      }
      return str;
    },
  },
  '01300': {
    pattern: '[{ăŏŭ}{C|CC}i] > [{eœy}{C|CC}i]',
    description: 'short [a], [o], [u] became [e], [œ], [y] preceding [i]',
    url: 'https://eldamo.org/content/words/word-3958031275.html',
    mechanic: (str) => {
      // Pattern configurations: longest to shortest
      // Each has: the VC string, positions of vowels to transform, and whether it's multi-vowel
      const patterns = [
        { str: 'VCCVCCV', vowelPos: [0, 3], multi: true },  // e.g., andundi
        { str: 'VCVCCV', vowelPos: [0, 2], multi: true },
        { str: 'VCCVCV', vowelPos: [0, 3], multi: true },
        { str: 'VCVCV', vowelPos: [0, 2], multi: true },    // e.g., balania
        { str: 'VCCV', vowelPos: [0], multi: false },       // e.g., balθil
        { str: 'VCV', vowelPos: [0], multi: false },        // e.g., bania
      ];

      const unmarkedStr = str.removeMarks();
      const vcPattern = breakIntoVowelsAndConsonants(str);
      let result = str;

      // Helper to check if a pattern is valid
      const isValidStart = (start, isMultiVowel) => {
        // Don't cross diphthong boundaries (no vowel immediately before start)
        if (start > 0 && vcPattern.charAt(start - 1) === 'V') {
          return false;
        }
        // For multi-vowel patterns, check for blocking vowels (i, e, y) before start
        if (isMultiVowel) {
          for (let k = 0; k < start; k++) {
            if (vcPattern.charAt(k) === 'V') {
              const vowel = unmarkedStr.charAt(k);
              if (vowel === 'i' || vowel === 'e' || vowel === 'y') {
                return false;
              }
            }
          }
        }
        return true;
      };

      // Find all positions where 'i' appears as a vowel
      for (let i = 0; i < unmarkedStr.length; i++) {
        if (unmarkedStr.charAt(i) !== 'i' || vcPattern.charAt(i) !== 'V') {
          continue;
        }

        // Find the longest matching pattern
        let bestMatch = null;
        for (const { str: patternStr, vowelPos, multi } of patterns) {
          const len = patternStr.length;
          if (i < len - 1) continue;

          const start = i - (len - 1);
          const pattern = vcPattern.substring(start, i + 1);
          if (pattern !== patternStr || !isValidStart(start, multi)) continue;

          // Check all vowels in the pattern are transformable (a/o/u)
          const allTransformable = vowelPos.every(pos => {
            const v = unmarkedStr.charAt(start + pos);
            return v === 'a' || v === 'o' || v === 'u';
          });

          if (allTransformable) {
            bestMatch = { start, vowelPositions: vowelPos };
            break; // Found longest match, stop searching
          }
        }

        if (bestMatch) {
          const { start, vowelPositions } = bestMatch;
          const segment = result.substring(start, i + 1);
          const unmarkedSegment = unmarkedStr.substring(start, i + 1);
          let newSegment = segment;

          // Transform each vowel at the specified positions
          for (const pos of vowelPositions) {
            const vowel = unmarkedSegment.charAt(pos);
            if (vowel === 'a') {
              newSegment = newSegment.replaceWithMark('a', 'e');
            } else if (vowel === 'o') {
              newSegment = newSegment.replaceWithMark('o', 'œ');
            } else if (vowel === 'u') {
              newSegment = newSegment.replaceWithMark('u', 'y');
            }
          }

          if (newSegment !== segment) {
            result = result.substring(0, start) + newSegment + result.substring(i + 1);
          }
        }
      }

      return result;
    },
  },
  '01400': {
    pattern: '[ē|ō] > [ī|ū]',
    description: '[ē], [ō] became [ī], [ū]',
    url: 'https://eldamo.org/content/words/word-3889365613.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeVowelMarks();
      let result = str;
      if (unmarkedStr.includes('e')) {
        const indices = str.findAllChars('e', unmarkedStr);
        for (const index of indices) {
          const eMark = str.nth(index).getMark();
          if (eMark === '¯' || eMark === '´' || eMark === '^') {
            result = result.replaceAt(index, 'i'.addMark(eMark));
          }
        }
      }
      if (unmarkedStr.includes('o')) {
        const indices = str.findAllChars('o', unmarkedStr);
        for (const index of indices) {
          const oMark = str.nth(index).getMark();
          if (oMark === '¯' || oMark === '´' || oMark === '^') {
            result = result.replaceAt(index, 'u'.addMark(oMark));
          }
        }
      }
      return result;
    },
  },
  '01500': {
    pattern: '[V{ɣ}{lrmn}] > [Vi{lrmn}]',
    description: '[ɣ] vocalized before [l], [r], [m], [n]',
    url: 'https://eldamo.org/content/words/word-539122737.html',
    mechanic: (str) => {
      if (str.includes('ɣ')) {
        let result = str;
        const indices = str.findAllChars('ɣ');
        const vcPattern = breakIntoVowelsAndConsonants(str);
        for (const index of indices) {
          if (vcPattern.charAt(index - 1) === 'V' && 'lrmn'.includes(str.charAt(index + 1))) {
            result = str.replaceAt(index, 'i');
          }
        }
        return result;
      }
      return str;
    },
  },
  '01600': {
    pattern: '[Vx{θ}|Vɸ{θ}] > [Vi{θ}|Vu{θ}]',
    description: '[x], [ɸ] vocalized between a vowel and [θ]',
    url: 'https://eldamo.org/content/words/word-4002924749.html',
    mechanic: (str) => {
      if (str.includes('x') || str.includes('ɸ')) {
        let result = str.normaliseToOne();
        const unmarkedStr = str.removeMarks();
        if (unmarkedStr.includes('x')) {
          const indices = unmarkedStr.findAllChars('x');
          for (const index of indices) {
            if (unmarkedStr.nth(index - 1).isVowel() && unmarkedStr.nth(index + 1) === 'θ') {
              result = result.replaceAt(index, 'i');
            }
            if (result.indexOf('ii') !== -1) {
              result = result.replace('ii', 'ī');
            }
          }
        }
        if (unmarkedStr.includes('ɸ')) {
          const indices = unmarkedStr.findAllChars('ɸ');
          for (const index of indices) {
            if (unmarkedStr.nth(index - 1).isVowel() && unmarkedStr.nth(index + 1) === 'θ') {
              result = result.replaceAt(index, 'u');
            }
          }
        }
        return result;
      }
      return str;
    },
  },
  '01700': {
    pattern: '[xʲ] > [ix]',
    description: 'non-initial [xʲ] vocalized to [ix]',
    url: 'https://eldamo.org/content/words/word-2422841513.html',
    // Ask about this, as it's not clear if this is from Old Sindarin or not.
    // It's also not clear the characters used are different either.
    mechanic: (str) => {
      if (str.includes('xʲ') || str.includes('ꜧ')) {
        const newStr = str.replace('xʲ', 'ꜧ');
        let result = newStr;
        const indices = newStr.findAllChars('ꜧ');
        for (const index of indices) {
          if (index > 0) {
            result = result.replaceAt(index, 'ix', 1);
          }
        }
        if (result.indexOf('ii') !== -1) {
          result = result.replace('ii', 'ī');
        }
        return result;
      }
      return str;
    },
  },
  '01800': {
    pattern: '[{ij}u|jui] > [ȳ|jui]',
    description: '[iu] and [ju] became [ȳ]',
    url: 'https://eldamo.org/content/words/word-659168127.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      if (unmarkedStr.includes('iu') || unmarkedStr.includes('ju')) {
        let result = str;
        if (unmarkedStr.includes('iu')) {
          result = result.replace('iu', 'ȳ');
        }
        if (unmarkedStr.includes('ju')) {
          result = result.replace('ju', 'ȳ').replace('jū', 'ȳ');
        }
        return result;
      }
      return str;
    },
  },
  '01900': {
    pattern: '[ŭ|uC{uw}|u{mnŋ}] > [o|uC{uw}|u{mnŋ}]',
    description: 'short [u] often became [o]',
    url: 'https://eldamo.org/content/words/word-2740073851.html',
    /*
     * This is a rule with exceptions. The change occurs only when all exceptions are negative.
     */
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      if (unmarkedStr.includes('u')) {
        let result = str;
        const indices = unmarkedStr.findAllChars('u');
        const vcPattern = breakIntoVowelsAndConsonants(str);
        const skip = new Set();
        for (const index of indices) {
          if (skip.has(index)) continue;
          const nextChar = unmarkedStr.nth(index + 1);
          const followingChar = unmarkedStr.nth(index + 2);
          const nextCharVcPattern = vcPattern.charAt(index + 1);
          if (['m', 'n', 'ŋ'].includes(nextChar)) {
            continue;
          } else if (nextCharVcPattern === 'C' && ['u', 'w'].includes(followingChar)) {
            skip.add(index + 2); // Skip the 'u' that's part of this pattern
            continue;
          } else {
            result = result.replaceAt(index, 'o');
          }
        }
        return result;
      }
      return str;
    },
  },
  '02000': {
    pattern: '[{nŋ}m] > [{nŋ}w]',
    description: '[nm], [ŋm] became [nw], [ŋw]',
    url: 'https://eldamo.org/content/words/word-3258926163.html',
    mechanic: (str) => {
      if (str.includes('nm') || str.includes('ŋm')) {
        return str.replace('nm', 'nw').replace('ŋm', 'ŋw');
      }
      return str;
    },
  },
  '02100': {
    pattern: '[Vŋ{nw}] > [V̄{nw}]',
    description: '[ŋ] vanished with compensatory lengthening',
    url: 'https://eldamo.org/content/words/word-3707785609.html',
    mechanic: (str) => {
      if (str.includes('ŋ')) {
        let result = str;
        const unmarkedStr = str.removeMarks();
        const vcPattern = breakIntoVowelsAndConsonants(unmarkedStr);
        const indices = str.findAllChars('ŋ');
        for (const index of indices) {
          const prevChar = unmarkedStr.nth(index - 1);
          const nextChar = unmarkedStr.nth(index + 1);
          if (prevChar.isVowel() && ['n', 'w'].includes(nextChar)) {
            result = result.replaceAt(index - 1, prevChar.addMark('¯'), 2);
          }
        }
        return result;
      }
      return str;
    },
  },
  '02200': {
    pattern: '[ǭ] > [au]',
    description: '[ǭ] became [au]',
    url: 'https://eldamo.org/content/words/word-558704171.html',
    mechanic: (str) => {
      if (str.includes('ǭ')) {
        return str.replaceAll('ǭ', 'au');
      }
      return str;
    },
  },
  '02300': {
    pattern: '[ę̄] > [ai]',
    description: '[ę̄] became [ai]',
    url: 'https://eldamo.org/content/words/word-2387695245.html',
    mechanic: (str) => {
      if (str.includes('ę̄')) {
        return str.replaceAll('ę̄', 'ai');
      }
      return str;
    },
  },
  '02400': {
    pattern: '[-S{ĕăŏ}] > [-Sø]',
    description: 'short final vowels vanished',
    url: 'https://eldamo.org/content/words/word-813787869.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      const lastChar = unmarkedStr.nth(-1);
      if (['e', 'a', 'o'].includes(lastChar)) {
        const xMark = str.nth(-1).getMark();
        if (['¯', '´', '^'].includes(xMark)) {
          return str;
        }
        return str.slice(0, -1);
      }
      return str;
    },
  },
  '02500': {
    pattern: '[-VCi] > [-ViC]',
    description: 'final [i] intruded into preceding syllable',
    url: 'https://eldamo.org/content/words/word-2399289739.html',
    mechanic: (str) => {
      const unmarkedStr = str.removeMarks();
      const vcPattern = breakIntoVowelsAndConsonants(unmarkedStr);
      if (unmarkedStr.endsWith('i') && vcPattern.endsWith('VCV')) {
        const patterns = [
          { in: 'i', out: 'i' },
          { in: 'e', out: 'ei' },
          { in: 'y', out: 'y' },
          { in: 'œ', out: 'œi' },
          { in: 'o', out: 'oi' },
          { in: 'u', out: 'ui' },
        ];
        for (const pattern of patterns) {
          const secondLastChar = unmarkedStr.nth(-2);
          const thirdLastChar = unmarkedStr.nth(-3);
          if (thirdLastChar === pattern.in) {
            const index = unmarkedStr.length - 3;
            return str.substring(0, index) + pattern.out + secondLastChar;
          }
        }
      }
      // [-iCi] > [-iC]
      // [-ĕCi] > [-eiC]
      // [-yCi] > [-yC]
      // [-œCi] > [-œiC]
      // [-ǭCi] > [-oiC]
      // [-ūCi] > [-uiC]
      return str;
    },
  },
  '02600': {
    pattern: '[-Cw] > [-uC]', // Originally this is [-xw] > [-ux]
    description: 'final [w] sometimes intruded into preceding syllables',
    url: 'https://eldamo.org/content/words/word-4211011237.html',
    mechanic: (str) => {
      const regularisedStr = str.toNormalScript().removeMarks();
      if (regularisedStr.endsWith('w')) {
        const vcPattern = breakIntoVowelsAndConsonants(regularisedStr);
        if (vcPattern.endsWith('VCC')) {
          const secondLastChar = regularisedStr.nth(-2);
          const thirdLastChar = regularisedStr.nth(-3);
          if (['a', 'e'].includes(thirdLastChar)) {
            const index = regularisedStr.length - 2;
            return str.substring(0, index) + 'u' + secondLastChar;
          }
        }
      }
      return str;
    },
  },
  '02700': {
    pattern: '[x-|x{lr}-] > [h-|{l̥r̥}-]',
    description: 'initial [x-] became [h-]',
    url: 'https://eldamo.org/content/words/word-4287595571.html',
    mechanic: (str) => {
      const initial2 = str.substring(0, 2).toLowerCase();
      let initialX = str.nth(0).toLowerCase();
      let result = str;
      if (initial2 === 'kh') {
        result = result.replace('kh', 'x');
        initialX = 'x';
      }
      if (['x', 'χ'].includes(initialX)) {
        const secondPhoneme = str.nth(1).toLowerCase();
        if (['l', 'r'].includes(secondPhoneme)) {
          return result.replace('xl', 'l̥').replace('xr', 'r̥');
        }
        return result.replace(initialX, 'h');
      }
      return str;
    },
  },
  '02800': {
    pattern: '[V{ptk}] > [V{bdg}]',
    description: 'voiceless stops voiced after vowels',
    url: 'https://eldamo.org/content/words/word-2240258959.html',
    mechanic: (str) => {
      if (str.includes('p') || str.includes('t') || str.includes('k')) {
        const pIndex = str.indexOf('p');
        const tIndex = str.indexOf('t');
        const kIndex = str.indexOf('k');
        if (pIndex !== -1) {
          const prevChar = str.nth(pIndex - 1);
          if (prevChar.isVowel()) {
            return str.replace('p', 'b');
          }
        }
        if (tIndex !== -1) {
          const prevChar = str.nth(tIndex - 1);
          if (prevChar.isVowel()) {
            return str.replace('t', 'd');
          }
        }
        if (kIndex !== -1) {
          const prevChar = str.nth(kIndex - 1);
          if (prevChar.isVowel()) {
            return str.replace('k', 'g');
          }
        }
      }
      return str;
    },
  },
  '02900': {
    pattern: '[C*V̆C] > [C*V̄C]',
    description: 'short vowels generally lengthened in monosyllables',
    url: 'https://eldamo.org/content/words/word-1053424933.html',
    /*
     * @TODO: Find a way to signal unstressed words
     *
     * Lengthening did not occur for "minor" (unstressed?) words
     * Pronouns do not show vowel lengthening, except possessive pronouns.
     * Lengthening did not occur before unvoiced consonants: th, ch ([θ], [x]).
     * Long ss also did not lengthen, see rule 06300.
     * Exceptions:
     * - hîth "mist", nîth "sister", nîth "youth" -> these have primitive [ī] or [ē].
     * - Long û must derive from [ō] or [ū], because short u becomes o (rule 01900).
     * - iâth "fence" (but also appeared "iath").
     * Sindarin monosyllables ending in [m] and [ŋ] do not show vowel lengthening
     * Lengthening did (mostly) occur before voiced consonants: b, d, dh, f [v], g, l, n, r.
     * Cases where lengthening did not occur before voiced spirants and stops:
     * - cef "soil"
     * - glad "wood", lad "plain", nad "thing", pad "track, road", plad "palm", sad "place, spot", tad "two".
     * - peg "dot"
     * Cases where lengthening did not occur before [l]:
     * - ial "?cry, shout", el "star", del "horror", gil "star", tol "island", dol "hill"
     * Cases where lengthening did not occur before [r]:
     * - bar "home", far "enough", er "one, alone", cor "ring, circle", for "north", gor "horror, dread, fear"
     * Cases where lengthening did not occur before [n]:
     * - glan "boundary", fen "door", hen "eye", men "road", nen "water", min "one", tin "spark", ion "son"
     * Vowel lengthening does not occur in monosyllables ending a vowel, except these:
     * - a: hwâ "breeze", iâ "chasm"
     * - e: tê "line, way", thlê "fine thread, spider filament"
     * - i: dî "woman, bride", lî "people", glî "honey", gwî "net, web", rhî "crown", rî "wreath, garland", tî "line, row"
     * - o: l(h)ô "flood, fenland", nô "thigh"
     * [C*ĭC] > [C*īC]
     * [C*ĕC] > [C*ēC]
     * [C*ăC] > [C*āC]
     * [C*ŏC] > [C*ōC]
     * [C*yC] > [C*ȳC]
     */
    // Exception sets (defined once, not per call)
    vowelEndingExceptions: new Set(['hwa', 'ia', 'te', 'thle', 'di', 'lhi', 'gli', 'gwi', 'rhi', 'ri', 'ti', 'lo', 'no']),
    unvoicedExceptions: new Set(['hith', 'nith', 'iath']),
    voicedExceptions: new Set([
      'bar', 'cef', 'cor', 'del', 'dol', 'el', 'er', 'far', 'fen', 'for', 'gil', 'glad', 'glan', 'gor',
      'hen', 'ial', 'ion', 'lad', 'men', 'min', 'nad', 'nen', 'pad', 'peg', 'plad', 'sad', 'tad', 'tin', 'tol',
    ]),
    mechanic(str) {
      const singleCharsStr = removeDigraphs(str);
      const vcPattern = breakIntoVowelsAndConsonants(singleCharsStr);
      if (!/^C{0,2}V{1,2}C{0,2}$/.test(vcPattern)) return str;

      const lastChar = singleCharsStr.nth(-1);
      const lengthen = (s, pos) => {
        const vowel = s.nth(pos);
        const lengthened = s.replace(vowel, vowel.addMark('¯'));
        return singleCharsStr !== str ? restoreDigraphs(lengthened) : lengthened;
      };

      if (lastChar.isVowel()) {
        return this.vowelEndingExceptions.has(str) ? lengthen(str, -1) : str;
      }

      if (lastChar === 'θ' || lastChar === 'x') {
        return this.unvoicedExceptions.has(str) ? lengthen(singleCharsStr, -2) : str;
      }

      if ('bdðfvglnrɣ'.includes(lastChar)) {
        if (this.voicedExceptions.has(str)) return str;
        const penultimate = singleCharsStr.nth(-2);
        return penultimate.isVowel() ? lengthen(singleCharsStr, -2) : str;
      }

      return str;
    },
  },
  '03000': {
    pattern: '[-Cɣ|-Cɣi] > [-Ca|-Cī]',
    description: 'final [ɣ] became [a] after a consonant',
    url: 'https://eldamo.org/content/words/word-916418731.html',
    mechanic: (str) => {
      const lastChar = str.nth(-1);
      const secondLastChar = str.nth(-2);
      if (lastChar === 'ɣ') {
        const penultimate = str.nth(-2);
        if (penultimate.isConsonant()) {
          return str.replace('ɣ', 'a');
        }
      }
      if (lastChar === 'i' && secondLastChar === 'ɣ') {
        const thirdLastChar = str.nth(-3);
        if (thirdLastChar.isConsonant()) {
          return str.replace('ɣi', 'ī');
        }
      }
      return str;
    },
  },
  '03100': {
    pattern: '[{lrð}ɣV] > [{lrð}iV]',
    description: '[ɣ] became [i] between sonants and vowels',
    url: 'https://eldamo.org/content/words/word-2139740021.html',
    mechanic: (str) => {
      if (str.includes('ɣ')) {
        const singleCharsStr = removeDigraphs(str);
        const sonants = ['b', 'd', 'g', 'v', 'f', 'ð', 'w', 'l', 'r', 'j'];
        const indices = singleCharsStr.findAllChars('ɣ');
        for (const index of indices) {
          const prevChar = singleCharsStr.nth(index - 1);
          const nextChar = singleCharsStr.nth(index + 1);
          if (sonants.includes(prevChar) && nextChar.isVowel()) {
            if (nextChar === 'u') {
              return singleCharsStr.replaceAt(index, 'u', 2);
            }
            if (nextChar === 'y') {
              return singleCharsStr.replaceAt(index, 'y', 2);
            }
            if (singleCharsStr !== str) {
              return restoreDigraphs(singleCharsStr.replaceAt(index, 'i'));
            }
            return singleCharsStr.replaceAt(index, 'i');
          }
        }
      }
      return str;
    },
  },
  '03200': {
    pattern: '[ɣ] > [ø]',
    description: '[ɣ] otherwise vanished',
    url: 'https://eldamo.org/content/words/word-4164672875.html',
    mechanic: (str) => {
      if (str.includes('ɣ')) {
        const gIndex = str.indexOf('ɣ');
        const prevChar = str.nth(gIndex - 1);
        const nextChar = str.nth(gIndex + 1);
        if (prevChar === nextChar && prevChar.isVowel()) {
          return str.replace(`${prevChar}ɣ${nextChar}`, prevChar.addMark('¯'));
        }
        return str.replace('ɣ', '');
      }
      return str;
    },
  },
  '03300': {
    pattern: '[-wi] > [-y]',
    description: 'final [-wi] became [-y]',
    url: 'https://eldamo.org/content/words/word-677308549.html',
    mechanic: (str) => {
      if (str.endsWith('wi') || str.endsWith('ui')) {
        return str.replace('wi', 'y').replace('ui', 'y');
      }
      return str;
    },
  },
  '03400': {
    pattern: '[Vh] > [Vø]',
    description: '[h] vanished after vowels',
    url: 'https://eldamo.org/content/words/word-875184187.html',
    mechanic: (str) => {
      if (str.includes('h')) {
        const hIndex = str.indexOf('h');
        const prevChar = str.nth(hIndex - 1);
        const nextChar = str.nth(hIndex + 1);
        if (prevChar === nextChar && prevChar.isVowel()) {
          const followingChar = str.nth(hIndex + 2);
          if (followingChar.isVowel()) {
            return str.replace(`h${nextChar}`, '');
          }
          return str.replace(`${prevChar}h${nextChar}`, prevChar.addMark('¯'));
        }
        return str.replace('h', '');
      }
      return str;
    },
  },
  '03500': {
    pattern: '[-S{ĭŭ}|-uCu|-Sī] > [-Sø|-uCu|-Sĭ]',
    description: 'final [i], [u] generally vanished',
    url: 'https://eldamo.org/content/words/word-1815401039.html',
    mechanic(str) {
      // Exception: uCu pattern is preserved (e.g., guru stays guru)
      if (str.length >= 3) {
        const last3 = str.slice(-3);
        if (last3[0] === 'u' && last3[1].isConsonant() && last3[2] === 'u') {
          return str;
        }
      }

      // Final short i or u after consonant vanishes
      const unmarkedStr = str.removeMarks();
      const lastChar = unmarkedStr.nth(-1);
      if (lastChar === 'i') {
        const iMark = str.nth(-1).getMark();
        if (iMark === '¯') {
          return str.slice(0, -1) + 'i';
        }
        return str.slice(0, -1);
      }
      if (lastChar === 'u') {
        const iMark = str.nth(-1).getMark();
        if (iMark === '¯') {
          return str.slice(0, -1) + 'u';
        }
        return str.slice(0, -1);
      }
      
      return str;
    },
  },
  '03600': {
    pattern: '[C{ĭĕăŏŭ}+C] > [Cø+C]',
    description: 'short vowels vanished before morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-2749565259.html',
    input: [
      { name: 'guess', type: 'boolean', default: true, description: 'Whether to guess boundary if no marker' },
      { name: 'boundaryChar', type: 'string', default: '-', description: 'The morpheme boundary marker' },
    ],
    /**
     * @param {string} str - The input string
     * @param {Object} options - Options for the mechanic
     * @param {boolean} options.guess - Whether to guess boundary if no marker (default: true)
     * @param {string} options.boundaryChar - The morpheme boundary marker (default: '-')
     */
    mechanic(str, { guess = true, boundaryChar = '-' } = {}) {
      // Helper: check if char is a short vowel (no mark or caron ˇ)
      const isShortVowel = (char) => {
        if (!char || !char.isVowel()) return false;
        const mark = char.getMark();
        return mark === '' || mark === '\u030C'; // no mark or combining caron
      };

      // Helper: remove short vowel from end or middle of syllable
      const removeVowelFromSyllable = (syllable) => {
        const lastChar = syllable.nth(-1);

        // If syllable ends in short vowel, remove it
        if (isShortVowel(lastChar)) {
          return syllable.slice(0, -1);
        }

        // If syllable ends in consonant, look for short vowel before it
        // Pattern: C + shortV + C(s) at end → remove the vowel
        for (let i = syllable.length - 2; i >= 0; i--) {
          const char = syllable.nth(i);
          if (isShortVowel(char)) {
            // Found a short vowel - remove it
            return syllable.slice(0, i) + syllable.slice(i + 1);
          }
          if (char.isVowel()) {
            // Found a long vowel - stop looking
            break;
          }
        }

        return syllable; // No short vowel found
      };

      // === EXPLICIT MARKER MODE ===
      if (str.includes(boundaryChar)) {
        const parts = str.split(boundaryChar);
        const result = parts.map((part, index) => {
          // Don't process the last part (nothing follows it)
          if (index === parts.length - 1) return part;

          const nextPart = parts[index + 1];
          const nextFirstChar = nextPart.nth(0);

          // Only remove vowel if next part starts with consonant
          if (nextFirstChar && nextFirstChar.isConsonant()) {
            return removeVowelFromSyllable(part);
          }
          return part;
        });

        return result.join('');
      }

      // === GUESSING MODE ===
      if (!guess) return str;

      const syllables = syllabify(str);
      if (syllables.length < 2) return str;

      // Split: first half gets extra syllable if odd
      const midpoint = Math.ceil(syllables.length / 2);
      const firstHalf = syllables.slice(0, midpoint);
      const secondHalf = syllables.slice(midpoint);

      // Check if second half starts with consonant
      const secondHalfStart = secondHalf[0]?.nth(0);
      if (!secondHalfStart || !secondHalfStart.isConsonant()) {
        return str;
      }

      // Try to remove vowel from last syllable of first half
      const lastSyllable = firstHalf[firstHalf.length - 1];
      const modifiedSyllable = removeVowelFromSyllable(lastSyllable);

      // If nothing changed, return original
      if (modifiedSyllable === lastSyllable) {
        return str;
      }

      // Rebuild the word
      firstHalf[firstHalf.length - 1] = modifiedSyllable;
      return [...firstHalf, ...secondHalf].join('');
    },
  },
  '03700': {
    pattern: '[ai|oi] > [ae|oe]',
    description: '[ai], [oi] became [ae], [oe]',
    url: 'https://eldamo.org/content/words/word-941153689.html',
    mechanic: (str) => {
      return str.replace(/ai/g, 'ae').replace(/oi/g, 'oe');
    },
  },
  '03800': {
    pattern: '[-eiC|-ei] > [-aiC|-ai]',
    description: 'later [ei] became [ai] in final syllables',
    url: 'https://eldamo.org/content/words/word-1660291111.html',
    mechanic: (str) => {
      const strLess1 = str.slice(0, -1);
      const lastChar = str.nth(-1);
      if (lastChar.isConsonant()) {
        const last2 = strLess1.slice(-2);
        if (last2 === 'ei') {
          return str.slice(0, -3) + 'ai' + lastChar;
        }
      } else {
        const last2 = str.slice(-2);
        if (last2 === 'ei') {
          return str.slice(0, -2) + 'ai';
        }
      }
      return str;
    },
  },
  '03900': {
    pattern: '[y{iu}] > [ui]',
    description: 'diphthongs [yi], [yu] became [ui]',
    url: 'https://eldamo.org/content/words/word-3257758901.html',
    mechanic: (str) => {
      return str.replace(/yi/g, 'ui').replace(/yu/g, 'ui');
    },
  },
  '04000': {
    pattern: '[œi] > [ui|y]',
    description: '[œi] became [ui] or [y]',
    url: 'https://eldamo.org/content/words/word-1787434575.html',
    input: [{ name: 'useUi', type: 'boolean', default: false, description: 'Whether to use [ui] instead of [y]' }],
    mechanic: (str, { useUi = false } = {}) => {
      return str.replace(/œi/g, useUi ? 'ui' : 'y');
    },
  },
  '04100': {
    pattern: '[nr] > [ðr]',
    description: '[nr] became [ðr]',
    url: 'https://eldamo.org/content/words/word-1105959911.html',
    dependsOn: [{ rule: '03600', param: 'cluster' }],
    /**
     * This logic depends on 03600:
     * Where n and r came into contact in compounds after the loss of vowels at morpheme
     * boundaries, the n became dh.
     * This change doesn't occur where there was another consonant between the n and r.
     * 
     * @param {*} str
     * @param {*} options
     * @param {boolean} options.cluster - Whether a cluster existed previously (default: false)
     * @returns 
     */
    mechanic: (str, { cluster = false } = {}) => {
      if (cluster) return str;
      return str.replace(/nr/g, 'ðr');
    },
  },
  '04200': {
    pattern: '[{θð}Sθ] > [{θð}Ss]',
    description: 'dissimilation of dental spirants',
    url: 'https://eldamo.org/content/words/word-2090293737.html',
    // This isn't great, but it has few examples anyway.
    mechanic: (str) => {
      const singleCharsStr = removeDigraphs(str);
      const shouldRevert = str !== singleCharsStr;
      const count = (singleCharsStr.match(/[θð]/g) || []).length;
      if (count > 1) {
        const result = singleCharsStr.reverse().replace('θ', 's').reverse();
        return shouldRevert ? restoreDigraphs(result) : result;
      }
      return str;
    },
  },
  '04300': {
    pattern: '[ls|rs] > [lθ|ss]',
    description: '[ls], [rs] became [lθ], [ss]',
    url: 'https://eldamo.org/content/words/word-298324969.html',
    mechanic: (str) => {
      if (str.includes('ls') || str.includes('rs')) {
        const singleCharsStr = digraphsToSingle(str);
        const digraphsStr = singleToDigraphs(str);
        const hasDigraphs = singleCharsStr !== digraphsStr;
        const shouldRevert = str !== singleCharsStr;
        const result = singleCharsStr.replace('ls', 'lθ').replace('rs', 'ss');
        if (hasDigraphs === shouldRevert) return singleToDigraphs(result);
        return result;
      }
      return str;
    },
  },
  '04400': {
    pattern: '[-{mf|nθ|ŋx|lθ}] > [-{mp|nt|ŋk|lt}]',
    description: 'final [mf], [nθ], [ŋx], [lθ] became [mp], [nt], [ŋk], [lt]',
    url: 'https://eldamo.org/content/words/word-1531741019.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const digraphsStr = singleToDigraphs(str);
      const hasDigraphs = singleCharsStr !== digraphsStr;
      const shouldRevert = str !== singleCharsStr;
      let result = str;

      if (singleCharsStr.endsWith('mf')) {
        result = singleCharsStr.slice(0, -2) + 'mp';
      }
      if (singleCharsStr.endsWith('nθ')) {
        result = singleCharsStr.slice(0, -2) + 'nt';
      }
      if (singleCharsStr.endsWith('ŋx')) {
        result = singleCharsStr.slice(0, -2) + 'ŋk';
      }
      if (singleCharsStr.endsWith('lθ')) {
        result = singleCharsStr.slice(0, -2) + 'lt';
      }

      if (hasDigraphs === shouldRevert) return singleToDigraphs(result);

      return result;
    },
  },
  '04500': {
    pattern: '[{mnŋ}{fθxs}{lr}] > [ø{fθxs}{lr}]',
    description: 'nasals vanished before spirantal clusters',
    url: 'https://eldamo.org/content/words/word-1856165973.html',
    mechanic: (str) => {
      if (str.includes('m') || str.includes('n') || str.includes('ŋ')) {
        const mIndex = str.indexOf('m');
        const nIndex = str.indexOf('n');
        const ngIndex = str.indexOf('ŋ');
        const foundIndex = mIndex > -1 ? mIndex : nIndex > -1 ? nIndex : ngIndex;
        if (foundIndex > -1) {
          const nextChar = str.nth(foundIndex + 1);
          const followingChar = str.nth(foundIndex + 2);
          if ('fθxs'.includes(nextChar) && 'lr'.includes(followingChar)) {
            return str.replaceAt(foundIndex, '', 1);
          }
          if (nextChar === 'f') {
            return str.replaceAt(foundIndex, 'ff', 2);
          }
        }
      }
      return str;
    },
  },
  '04600': {
    pattern: '[-{mnŋ}·{fθxsmnŋl}-] > [-ø·{fθxsmnŋl}-]',
    description: 'nasals vanished before morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-3282356701.html',
    input: [
      { name: 'guess', type: 'boolean', default: true, description: 'Whether to guess boundary if no marker' },
      { name: 'boundaryChar', type: 'string', default: '-', description: 'The morpheme boundary marker' },
    ],
    /**
     * @param {string} str - The input string
     * @param {Object} options - Options for the mechanic
     * @param {boolean} options.guess - Whether to guess boundary if no marker (default: true)
     * @param {string} options.boundaryChar - The morpheme boundary marker (default: '-')
     */
    mechanic(str, { guess = true, boundaryChar = '-' } = {}) {
      // Helper: remove nasal from end of syllable
      const removeNasalFromSyllable = (syllable) => {
        const lastChar = syllable.nth(-1);

        // If syllable ends in nasal, remove it
        if ('mnŋ'.includes(lastChar)) {
          return syllable.slice(0, -1);
        }

        return syllable; // No nasal found
      };

      // === EXPLICIT MARKER MODE ===
      if (str.includes(boundaryChar)) {
        const parts = str.split(boundaryChar);
        const result = parts.map((part, index) => {
          // Don't process the last part (nothing follows it)
          if (index === parts.length - 1) return part;

          const nextPart = parts[index + 1];
          const nextFirstChar = nextPart.nth(0);

          // Only remove vowel if next part starts with consonant
          if (nextFirstChar && nextFirstChar.isConsonant()) {
            return removeNasalFromSyllable(part);
          }
          return part;
        });

        return result.join(boundaryChar);
      }


      if (!guess) return str;

      // === GUESSING MODE ===
      const syllables = syllabify(str);
      if (syllables.length < 2) return str;

      // Split: first half gets extra syllable if odd
      const midpoint = Math.ceil(syllables.length / 2);
      const firstHalf = syllables.slice(0, midpoint);
      const secondHalf = syllables.slice(midpoint);

      // Try to remove nasal from last syllable of first half
      const lastSyllable = firstHalf[firstHalf.length - 1];
      const modifiedSyllable = removeNasalFromSyllable(lastSyllable);
      firstHalf[firstHalf.length - 1] = modifiedSyllable;
      return [...firstHalf, ...secondHalf].join('');
    },
  },
  '04700': {
    pattern: '[ð{mnŋ}] > [ø{mnŋ}]',
    description: '[ð] vanished before nasals at morpheme boundaries',
    url: 'https://eldamo.org/content/words/word-3841960279.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const { found, nextChar } = findFirstOf(['ð'], singleCharsStr);
      if (found) {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        if ('mnŋ'.includes(nextChar)) {
          const result = singleCharsStr.replace('ð', '');
          if (revert) return singleToDigraphs(result);
          return result;
        }
      }
      return str;
    },
  },
  '04800': {
    pattern: '[-{mnŋ}{vðɣ}-] > [-{mnŋ}{bdg}-]',
    description: 'voiced spirants restopped after nasals',
    url: 'https://eldamo.org/content/words/word-3123278727.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const { found, charIndex, nextChar } = findFirstOf(['m', 'n', 'ŋ'], singleCharsStr);
      if (found) {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        if ('vðɣ'.includes(nextChar)) {
          const replacements = {
            'v': 'b',
            'ð': 'd',
            'ɣ': 'g',
          }
          const result = singleCharsStr.replace(nextChar, replacements[nextChar]);
          if (revert) return singleToDigraphs(result);
          return result;
        }
      }
      return str;
    },
  },
  '04900': {
    pattern: '[-{mf|nθ|ŋx|lθ}-] > [-{mm|nn|ŋg|l̥l̥}-]',
    description: 'medial [mf], [nθ], [ŋx], [lθ] became [mm], [nn], [ŋg], [ll]',
    url: 'https://eldamo.org/content/words/word-2996915415.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const { found, matched, charIndex } = findFirstOf(['mf', 'nθ', 'ŋx', 'lθ'], singleCharsStr);
      if (found) {
        const revert = shouldRevertToDigraphs(str, singleCharsStr);
        const replacements = {
          'mf': 'mm',
          'nθ': 'nn',
          'ŋx': 'ŋg',
          'lθ': 'll',
        }
        const result = singleCharsStr.replace(matched, replacements[matched]);
        if (revert) return singleToDigraphs(result);
        return result;
      }
      return str;
    }
  },
  '05000': {
    pattern: '[m̥|n̥] > [m|n]',
    description: 'voiceless nasals were voiced',
    url: 'https://eldamo.org/content/words/word-725943271.html',
    mechanic: (str) => {
      return str.replace(/m̥/g, 'm').replace(/n̥/g, 'n');
    },
  },
  '05100': {
    pattern: '[V̄CC] > [V̆CC]',
    description: 'long vowels shortened before clusters',
    url: 'https://eldamo.org/content/words/word-2083930569.html',
    mechanic: (str) => {
      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);
      const exceptions = [
        'círdan',
        'dírhael',
        'íðra',
        'mírdain',
        'nírnaeθ',
      ];
      if (exceptions.includes(singleCharsStr.toLowerCase())) return str;

      const vcPattern = breakIntoVowelsAndConsonants(singleCharsStr);
      if (vcPattern.includes('VCC')) {
        const pIndex = vcPattern.indexOf('VCC');
        const vowel = singleCharsStr.charAt(pIndex);
        const mark = vowel.getMark();
        let result = singleCharsStr;
        if ('¯´^'.includes(mark)) {
          result = singleCharsStr.replace(vowel, vowel.removeVowelMarks());
        }
        return revert ? singleToDigraphs(result) : result;
      }
      return str;
    },
  },
  '05200': {
    pattern: '[ī|ū] > [ĭ|ŭ]',
    description: '[ī], [ū] often shortened in polysyllables',
    url: 'https://eldamo.org/content/words/word-302560565.html',
    mechanic: (str) => {
      const { found } = findFirstOf(['ī', 'ū'], str);
      if (!found) return str;

      const singleCharsStr = digraphsToSingle(str);
      const revert = shouldRevertToDigraphs(str, singleCharsStr);

      const analyser = new SyllableAnalyser();
      const syllableData = analyser.analyse(singleCharsStr);
      const isPollysyllable = syllableData.length > 1;
      
      if (isPollysyllable) {
        console.log({str, singleCharsStr, syllableData, isPollysyllable, revert});
        const result = [];
        for (let i = 0; i < syllableData.length; i++) {
          const { syllable, weight, stressed } = syllableData[i];
          if (stressed === false) {
            const { matched } = findFirstOf(['ī', 'ū'], syllable);
            console.log({ syllable, matched });
            if (matched) {
              result.push(syllable.replace(matched, matched.removeVowelMarks()));
            } else {
              result.push(syllable);
            }
          } else {
            result.push(syllable);
          }
        }
        const fullStrResult = result.join('');
        const singleCharsResult = digraphsToSingle(fullStrResult);
        return revert ? fullStrResult : singleCharsResult;
      }
    },
  },
  '05300': {
    pattern: '[awa] > [au]',
    description: '[awa] sometimes became [au]',
    url: 'https://eldamo.org/content/words/word-671129175.html',
    mechanic: (str) => {
      // TODO: implement
      return str;
    },
  },
  '05400': {
    pattern: '[ˌau|ˌae] > [o|e]',
    description: '[au], [ae] became [o], [e] in polysyllables',
    url: 'https://eldamo.org/content/words/word-567222053.html',
    mechanic: (str) => {
      // TODO: implement
      return str;
    },
  },
  '05500': {
    pattern: '[lð] > [ll]',
    description: '[lð] became [ll]',
    url: 'https://eldamo.org/content/words/word-226282629.html',
    mechanic: (str) => {
      // TODO: implement
      return str;
    },
  },
  '05600': {
    pattern: '[nl] > [ll]',
    description: '[nl] became [ll]',
    url: 'https://eldamo.org/content/words/word-2759811879.html',
    mechanic: (str) => {
      // TODO: implement
      return str;
    },
  },
  '05700': {
    pattern: '[mb|nd] > [mm|nn]',
    description: '[mb], [nd] became [mm], [nn]',
    url: 'https://eldamo.org/content/words/word-868023175.html',
    mechanic: (str) => {
      // TODO: implement
      return str;
    },
  },
  '05800': {
    pattern: '[CCC] > [CC]',
    description: 'middle consonants frequently vanished in clusters',
    url: 'https://eldamo.org/content/words/word-3868328117.html',
    mechanic: (str) => {
      // TODO: implement
      return str;
    },
  },
  '05900': {
    pattern: '[Vs{lr}] > [Vθ{lr}]',
    description: 'medial [s] became [θ] before [l], [r]',
    url: 'https://eldamo.org/content/words/word-3736793827.html',
    mechanic: (str) => {
      // TODO: implement
      return str;
    },
  },
  '06000': {
    pattern: '[wo] > [o]',
    description: '[wo] became [o]',
    url: 'https://eldamo.org/content/words/word-586391091.html',
    mechanic: (str) => {
      // TODO: implement
      return str;
    },
  },


// [n] assimilated to following labial - [n+{mb}] > [m+{mb}] - 06100
// [œ] became [e] - [œ] > [e] - 06200
// final [ll], [nn], [ss] shortened in polysyllables - [-SS{ll|nn|ss}] > [-SS{l|n|s}] - 06300
// final and initial [ŋg] became [ŋ] - [ŋg-|-ŋg] > [ŋ-|-ŋ] - 06400
// non-initial [m] usually became [v] - [Vm|{lr}m|m{mbp}] > [Vv|{lr}v|m{mbp}] - 06500
// [ðv] became [ðw] - [ðv] > [ðw] - 06600
// [mm] shortened - [mm] > [m] - 06700
// final [v] became [w] after [ae], [oe], and sometimes [i] - [-{ae|oe}v] > [-{ae|oe}w] - 06800
// final [w], [v] vanished after [u] - [-u{vw}] > [-u] - 06900
// [ou] became [au] - [ou] > [au] - 07000

// long voiceless spirants shortened - [θθ|xx] > [θ|x] - 07100
// final [l], [r] usually became syllabic - [-C{lr}] > [-Co{lr}] - 07200
// final [vn] sometimes became [von] - [-vn] > [-von] - 07300
// final [w] usually became [u] - [-Cw|-aw] > [-Cu|-au] - 07400
// final [rr] became [r] - [-rr] > [-r] - 07500
// [sk], [sp] usually became [sg], [sb] - [s{pk}] > [s{bg}] - 07600
// medial [x] became [h] in Gondorian pronunciation - [-x-] > [-h-] - 07700
// voiced spirants unvoiced before voiceless spirants - [{vð}{hx}] > [{fθ}] - 07800
};