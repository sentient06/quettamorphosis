/**
 * Query string encoding/decoding for shareable URLs.
 * 
 * Encoding rules:
 * - Uppercase digraphs → convert to phonetic symbols (TH → θ)
 * - Lowercase digraphs → literal (th → th)
 * - Apostrophe after consonant → aspirated (p' → pʰ)
 * - Apostrophe after vowel → stressed (a' → á)
 * - Colon after vowel → long (a: → ā)
 * - Comma after sonorant → voiceless (m, → m̥)
 * - V~ → nasalized v (ɱ)
 */

// Uppercase digraphs → phonetic symbols
const DIGRAPH_CONVERSIONS = {
  'TH': 'θ',
  'DH': 'ð',
  'CH': 'x',
  'KH': 'x',
  'PH': 'ɸ',
  'NG': 'ŋ',
  'GH': 'ɣ',
  'GW': 'ƣ',
  'HW': 'ʍ',
  'SS': 'ſ',
  'XW': 'ƕ',
  'XJ': 'ꜧ',
};

// Aspirated consonants (consonant + ')
const ASPIRATED = {
  "p'": 'pʰ',
  "t'": 'tʰ',
  "k'": 'kʰ',
};

// Stressed vowels (vowel + ')
const STRESSED = {
  "a'": 'á',
  "e'": 'é',
  "i'": 'í',
  "o'": 'ó',
  "u'": 'ú',
  "A'": 'á',
  "E'": 'é',
  "I'": 'í',
  "O'": 'ó',
  "U'": 'ú',
};

// Long vowels (vowel + :)
const LONG_VOWELS = {
  'a:': 'ā',
  'e:': 'ē',
  'i:': 'ī',
  'o:': 'ō',
  'u:': 'ū',
  'A:': 'ā',
  'E:': 'ē',
  'I:': 'ī',
  'O:': 'ō',
  'U:': 'ū',
};

// Voiceless sonorants (sonorant + ,)
const VOICELESS = {
  'm,': 'm̥',
  'n,': 'n̥',
  'l,': 'l̥',
  'r,': 'r̥',
  'w,': 'w̥',
  'j,': 'j̊',
};

// Special symbols
const SPECIAL = {
  'V~': 'ɱ',
  'v~': 'ɱ',
  '.': '+',  // Morpheme boundary (+ is not URL-safe)
};

/**
 * Decode a query string value to phonetic symbols.
 * @param {string} encoded - The encoded string from URL
 * @returns {string} Decoded string with phonetic symbols
 */
export function decodeQueryString(encoded) {
  if (!encoded) return '';
  
  let result = encoded;
  
  // Process in order of specificity (longer patterns first)
  
  // Special symbols
  for (const [pattern, replacement] of Object.entries(SPECIAL)) {
    result = result.replaceAll(pattern, replacement);
  }
  
  // Uppercase digraphs (2 chars) - must be before single char processing
  // Sort by length descending to handle XW, XJ before others
  const sortedDigraphs = Object.entries(DIGRAPH_CONVERSIONS)
    .sort((a, b) => b[0].length - a[0].length);
  for (const [pattern, replacement] of sortedDigraphs) {
    result = result.replaceAll(pattern, replacement);
  }
  
  // Aspirated consonants
  for (const [pattern, replacement] of Object.entries(ASPIRATED)) {
    result = result.replaceAll(pattern, replacement);
  }
  
  // Stressed vowels (vowel + ')
  for (const [pattern, replacement] of Object.entries(STRESSED)) {
    result = result.replaceAll(pattern, replacement);
  }
  
  // Long vowels (vowel + :)
  for (const [pattern, replacement] of Object.entries(LONG_VOWELS)) {
    result = result.replaceAll(pattern, replacement);
  }
  
  // Voiceless sonorants (sonorant + ,)
  for (const [pattern, replacement] of Object.entries(VOICELESS)) {
    result = result.replaceAll(pattern, replacement);
  }
  
  return result;
}

/**
 * Encode a phonetic string to query string format.
 * @param {string} phonetic - String with phonetic symbols
 * @returns {string} Encoded string for URL
 */
export function encodeQueryString(phonetic) {
  if (!phonetic) return '';
  
  let result = phonetic;
  
  // Reverse mappings - phonetic → query string
  // Build reverse maps
  const reverseMap = {};
  
  // Add all reverse mappings (first entry wins for duplicates)
  for (const [pattern, replacement] of Object.entries(SPECIAL)) {
    if (!reverseMap[replacement]) reverseMap[replacement] = pattern;
  }
  for (const [pattern, replacement] of Object.entries(VOICELESS)) {
    reverseMap[replacement] = pattern;
  }
  for (const [pattern, replacement] of Object.entries(LONG_VOWELS)) {
    if (!reverseMap[replacement]) reverseMap[replacement] = pattern;
  }
  for (const [pattern, replacement] of Object.entries(STRESSED)) {
    if (!reverseMap[replacement]) reverseMap[replacement] = pattern;
  }
  for (const [pattern, replacement] of Object.entries(ASPIRATED)) {
    reverseMap[replacement] = pattern;
  }
  for (const [pattern, replacement] of Object.entries(DIGRAPH_CONVERSIONS)) {
    if (!reverseMap[replacement]) reverseMap[replacement] = pattern;
  }

  // Additional equivalents for encoding (symbols that map to the same output)
  // ñ is equivalent to ŋ, both encode to NG
  reverseMap['ñ'] = 'NG';

  // Sort by key length descending (longer phonetic symbols first)
  const sortedReverse = Object.entries(reverseMap)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [phonetic, encoded] of sortedReverse) {
    result = result.replaceAll(phonetic, encoded);
  }

  return result;
}

/**
 * Get the current input value from URL query string.
 * @returns {string|null} The decoded input value or null if not present
 */
export function getInputFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('i');
  return encoded ? decodeQueryString(encoded) : null;
}

/**
 * Update the URL with the current input value.
 * @param {string} input - The phonetic input string
 */
export function updateUrlWithInput(input) {
  const encoded = encodeQueryString(input);
  const url = new URL(window.location.href);

  if (encoded) {
    url.searchParams.set('i', encoded);
  } else {
    url.searchParams.delete('i');
  }

  // Use replaceState to avoid polluting browser history
  window.history.replaceState({}, '', url);
}

// =============================================================================
// Disabled Rules Query String Support
// =============================================================================

import { toBase36, fromBase36 } from './utils.js';

/**
 * Parse the ?off= parameter to get disabled rule IDs.
 * Supports:
 * - Single Base-36 IDs: 1617ZT
 * - Ranges: 1617ZT-2TVPSN (inclusive)
 * - Comma-separated: 1617ZT,2TVPSN,3QQ0SL
 * - Mixed: 1617ZT-2TVPSN,5PZ3TL
 * - Language prefixes: PE,AT,OS,S (disables entire languages)
 *
 * @param {string[]} allRuleIds - Array of all valid rule IDs (decimal strings)
 * @returns {{ disabledRules: Set<string>, disabledLanguages: Set<string> }}
 */
export function parseDisabledFromUrl(allRuleIds) {
  const params = new URLSearchParams(window.location.search);
  const offParam = params.get('off');

  return parseDisabledParam(offParam, allRuleIds);
}

/**
 * Parse a disabled rules parameter string.
 * @param {string|null} offParam - The raw ?off= parameter value
 * @param {string[]} allRuleIds - Array of all valid rule IDs (decimal strings)
 * @returns {{ disabledRules: Set<string>, disabledLanguages: Set<string> }}
 */
export function parseDisabledParam(offParam, allRuleIds) {
  const disabledRules = new Set();
  const disabledLanguages = new Set();

  if (!offParam) {
    return { disabledRules, disabledLanguages };
  }

  // Language shorthand mapping
  const LANGUAGE_CODES = {
    'PE': 'primitive-elvish',
    'AT': 'ancient-telerin',
    'OS': 'old-sindarin',
    'S': 'sindarin',
  };

  // Sort all rule IDs by their numeric value for range expansion
  const sortedRuleIds = [...allRuleIds].sort((a, b) => parseInt(a) - parseInt(b));

  // Split by comma to get individual entries
  const entries = offParam.split(',').map(e => e.trim().toUpperCase()).filter(Boolean);

  for (const entry of entries) {
    // Check if it's a language code
    if (LANGUAGE_CODES[entry]) {
      disabledLanguages.add(LANGUAGE_CODES[entry]);
      continue;
    }

    // Check if it's a range (contains -)
    if (entry.includes('-')) {
      const [startB36, endB36] = entry.split('-').map(s => s.trim());
      const startDec = parseInt(fromBase36(startB36), 10);
      const endDec = parseInt(fromBase36(endB36), 10);

      // Find all rule IDs in the range
      for (const ruleId of sortedRuleIds) {
        const ruleNum = parseInt(ruleId, 10);
        if (ruleNum >= startDec && ruleNum <= endDec) {
          disabledRules.add(ruleId);
        }
      }
    } else {
      // Single Base-36 ID
      const decimalId = fromBase36(entry);
      if (allRuleIds.includes(decimalId)) {
        disabledRules.add(decimalId);
      }
    }
  }

  return { disabledRules, disabledLanguages };
}

/**
 * Encode disabled rules/languages to a URL parameter value.
 * @param {Set<string>} disabledRules - Set of disabled rule IDs (decimal)
 * @param {Set<string>} disabledLanguages - Set of disabled language IDs
 * @param {string[]} allRuleIds - Array of all rule IDs for range compression
 * @returns {string} Encoded parameter value
 */
export function encodeDisabledParam(disabledRules, disabledLanguages, _allRuleIds) {
  // Note: _allRuleIds is reserved for future range compression optimization
  const parts = [];

  // Add language codes
  const LANGUAGE_CODES_REVERSE = {
    'primitive-elvish': 'PE',
    'ancient-telerin': 'AT',
    'old-sindarin': 'OS',
    'sindarin': 'S',
  };

  for (const lang of disabledLanguages) {
    if (LANGUAGE_CODES_REVERSE[lang]) {
      parts.push(LANGUAGE_CODES_REVERSE[lang]);
    }
  }

  // Sort disabled rules numerically
  const sortedDisabled = [...disabledRules]
    .map(id => parseInt(id, 10))
    .sort((a, b) => a - b);

  // Compress consecutive IDs into ranges
  // For now, just output individual IDs (range compression is an optimization)
  for (const ruleNum of sortedDisabled) {
    parts.push(toBase36(ruleNum));
  }

  return parts.join(',');
}

/**
 * Get disabled rules from URL and return them.
 * @param {string[]} allRuleIds - Array of all valid rule IDs
 * @returns {{ disabledRules: Set<string>, disabledLanguages: Set<string> }}
 */
export function getDisabledFromUrl(allRuleIds) {
  return parseDisabledFromUrl(allRuleIds);
}

/**
 * Update the URL with disabled rules/languages.
 * @param {Set<string>} disabledRules - Set of disabled rule IDs (decimal)
 * @param {Set<string>} disabledLanguages - Set of disabled language IDs
 * @param {string[]} allRuleIds - Array of all rule IDs
 */
export function updateUrlWithDisabled(disabledRules, disabledLanguages, allRuleIds) {
  const encoded = encodeDisabledParam(disabledRules, disabledLanguages, allRuleIds);
  const url = new URL(window.location.href);

  if (encoded) {
    url.searchParams.set('off', encoded);
  } else {
    url.searchParams.delete('off');
  }

  // Use replaceState to avoid polluting browser history
  window.history.replaceState({}, '', url);
}

/**
 * Check if share mode is active (via ?s parameter).
 * Share mode means: enable all rules first, then apply ?off= overrides.
 * @returns {boolean}
 */
export function isShareMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has('s');
}

/**
 * Remove all share-related parameters from the URL.
 * Called after share mode overrides have been applied.
 * Clears ?s, ?i, and ?off to avoid URL pollution.
 */
export function removeShareModeFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('s');
  url.searchParams.delete('i');
  url.searchParams.delete('off');
  window.history.replaceState({}, '', url);
}
