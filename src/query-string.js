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
  'BH': 'β',
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
 * Encode enabled rules (rules with skip:true that user explicitly enabled) to URL parameter.
 * @param {Set<string>} enabledRules - Set of enabled rule IDs (decimal)
 * @returns {string} Encoded parameter value
 */
export function encodeEnabledParam(enabledRules) {
  if (enabledRules.size === 0) return '';

  // Sort enabled rules numerically
  const sortedEnabled = [...enabledRules]
    .map(id => parseInt(id, 10))
    .sort((a, b) => a - b);

  // Convert to Base-36
  return sortedEnabled.map(ruleNum => toBase36(ruleNum)).join(',');
}

/**
 * Parse enabled rules from URL parameter.
 * @param {string|null} onParam - The raw ?on= parameter value
 * @param {string[]} allRuleIds - Array of all valid rule IDs (decimal strings)
 * @returns {Set<string>} Set of enabled rule IDs
 */
export function parseEnabledParam(onParam, allRuleIds) {
  const enabledRules = new Set();

  if (!onParam) return enabledRules;

  // Split by comma to get individual entries
  const entries = onParam.split(',').map(e => e.trim().toUpperCase()).filter(Boolean);

  for (const entry of entries) {
    // Single Base-36 ID
    const decimalId = fromBase36(entry);
    if (allRuleIds.includes(decimalId)) {
      enabledRules.add(decimalId);
    }
  }

  return enabledRules;
}

/**
 * Get enabled rules from URL.
 * @param {string[]} allRuleIds - Array of all valid rule IDs
 * @returns {Set<string>} Set of enabled rule IDs
 */
export function getEnabledFromUrl(allRuleIds) {
  const params = new URLSearchParams(window.location.search);
  const onParam = params.get('on');
  return parseEnabledParam(onParam, allRuleIds);
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
 * Clears ?s, ?i, ?off, ?on, ?ri, and ?mb to avoid URL pollution.
 */
export function removeShareModeFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('s');
  url.searchParams.delete('i');
  url.searchParams.delete('off');
  url.searchParams.delete('on');
  url.searchParams.delete('ri');
  url.searchParams.delete('mb');
  window.history.replaceState({}, '', url);
}

// =============================================================================
// Rule Inputs Query String Support
// =============================================================================

/**
 * Encode rule inputs to a URL parameter value.
 * Only encodes non-default values to keep URLs short.
 * Format: RULEID_B36:inputName=value,inputName2=value2;RULEID2_B36:inputName=value
 *
 * @param {Object} ruleInputs - Map of ruleId -> { inputName: value, ... }
 * @param {Object} allRules - Map of ruleId -> rule object (to check defaults)
 * @returns {string} Encoded parameter value
 */
export function encodeRuleInputs(ruleInputs, allRules) {
  const parts = [];

  for (const [ruleId, inputs] of Object.entries(ruleInputs)) {
    const rule = allRules[ruleId];
    if (!rule || !rule.input) continue;

    const nonDefaultInputs = [];
    for (const inputDef of rule.input) {
      const currentValue = inputs[inputDef.name];
      const defaultValue = inputDef.default;

      // Only include if different from default
      if (currentValue !== undefined && currentValue !== defaultValue) {
        // Encode value: booleans as 1/0, strings as-is
        const encodedValue = typeof currentValue === 'boolean'
          ? (currentValue ? '1' : '0')
          : encodeURIComponent(String(currentValue));
        nonDefaultInputs.push(`${inputDef.name}=${encodedValue}`);
      }
    }

    if (nonDefaultInputs.length > 0) {
      const ruleB36 = toBase36(parseInt(ruleId, 10));
      parts.push(`${ruleB36}:${nonDefaultInputs.join(',')}`);
    }
  }

  return parts.join(';');
}

/**
 * Parse rule inputs from URL parameter.
 * @param {string|null} riParam - The raw ?ri= parameter value
 * @param {Object} allRules - Map of ruleId -> rule object (to validate and get types)
 * @returns {Object} Map of ruleId -> { inputName: value, ... }
 */
export function parseRuleInputs(riParam, allRules) {
  const result = {};

  if (!riParam) return result;

  // Split by semicolon to get per-rule entries
  const ruleEntries = riParam.split(';').filter(Boolean);

  for (const entry of ruleEntries) {
    const colonIndex = entry.indexOf(':');
    if (colonIndex === -1) continue;

    const ruleB36 = entry.substring(0, colonIndex);
    const inputsStr = entry.substring(colonIndex + 1);

    // Convert Base-36 rule ID to decimal
    const ruleId = fromBase36(ruleB36);
    const rule = allRules[ruleId];
    if (!rule || !rule.input) continue;

    // Build a map of input name -> input definition for type info
    const inputDefMap = {};
    for (const inputDef of rule.input) {
      inputDefMap[inputDef.name] = inputDef;
    }

    // Parse individual inputs
    const inputs = {};
    const inputPairs = inputsStr.split(',').filter(Boolean);
    for (const pair of inputPairs) {
      const eqIndex = pair.indexOf('=');
      if (eqIndex === -1) continue;

      const name = pair.substring(0, eqIndex);
      const rawValue = pair.substring(eqIndex + 1);

      const inputDef = inputDefMap[name];
      if (!inputDef) continue;

      // Decode value based on type
      if (inputDef.type === 'boolean') {
        inputs[name] = rawValue === '1';
      } else {
        inputs[name] = decodeURIComponent(rawValue);
      }
    }

    if (Object.keys(inputs).length > 0) {
      result[ruleId] = inputs;
    }
  }

  return result;
}

/**
 * Get rule inputs from URL.
 * @param {Object} allRules - Map of ruleId -> rule object
 * @returns {Object} Map of ruleId -> { inputName: value, ... }
 */
export function getRuleInputsFromUrl(allRules) {
  const params = new URLSearchParams(window.location.search);
  const riParam = params.get('ri');
  return parseRuleInputs(riParam, allRules);
}

// =============================================================================
// Morpheme Boundaries Query String Support
// =============================================================================

/**
 * Encode morpheme boundary states to a URL parameter value.
 * Only encodes merged boundaries (non-default state).
 * Format: RULEID_B36:0,2;RULEID2_B36:1
 *
 * @param {Object} boundaryState - Map of ruleId -> Set<mergedBoundaryIndex>
 * @returns {string} Encoded parameter value
 */
export function encodeMorphemeBoundaries(boundaryState) {
  const parts = [];

  for (const [ruleId, mergedIndices] of Object.entries(boundaryState)) {
    if (mergedIndices.size === 0) continue;

    const ruleB36 = toBase36(parseInt(ruleId, 10));
    const indices = [...mergedIndices].sort((a, b) => a - b).join(',');
    parts.push(`${ruleB36}:${indices}`);
  }

  return parts.join(';');
}

/**
 * Parse morpheme boundary states from URL parameter.
 * @param {string|null} mbParam - The raw ?mb= parameter value
 * @param {string[]} allRuleIds - Array of all valid rule IDs (decimal strings)
 * @returns {Object} Map of ruleId -> Set<mergedBoundaryIndex>
 */
export function parseMorphemeBoundaries(mbParam, allRuleIds) {
  const result = {};

  if (!mbParam) return result;

  // Split by semicolon to get per-rule entries
  const ruleEntries = mbParam.split(';').filter(Boolean);

  for (const entry of ruleEntries) {
    const colonIndex = entry.indexOf(':');
    if (colonIndex === -1) continue;

    const ruleB36 = entry.substring(0, colonIndex);
    const indicesStr = entry.substring(colonIndex + 1);

    // Convert Base-36 rule ID to decimal
    const ruleId = fromBase36(ruleB36);
    if (!allRuleIds.includes(ruleId)) continue;

    // Parse indices
    const indices = new Set();
    const indexParts = indicesStr.split(',').filter(Boolean);
    for (const idx of indexParts) {
      const num = parseInt(idx, 10);
      if (!isNaN(num) && num >= 0) {
        indices.add(num);
      }
    }

    if (indices.size > 0) {
      result[ruleId] = indices;
    }
  }

  return result;
}

/**
 * Get morpheme boundary states from URL.
 * @param {string[]} allRuleIds - Array of all valid rule IDs
 * @returns {Object} Map of ruleId -> Set<mergedBoundaryIndex>
 */
export function getMorphemeBoundariesFromUrl(allRuleIds) {
  const params = new URLSearchParams(window.location.search);
  const mbParam = params.get('mb');
  return parseMorphemeBoundaries(mbParam, allRuleIds);
}
