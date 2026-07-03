import { digraphsToSingle, singleToDigraphs } from './utils.js';

// =============================================================================
// Pre-processing Rules (before Old Sindarin)
// Convert digraphs to single characters for consistent rule processing
// =============================================================================

export const preProcessingRules = {
  'pre-digraphs-to-single': {
    orderId: 'PRE-01',
    pattern: 'digraphs → single characters, parse morphemes',
    description: 'Convert digraphs to single characters and extract morpheme boundaries',
    mechanic: (str) => {
      // Parse morpheme boundaries (marked with '+')
      // If no '+' markers, treat the whole word as a single morpheme
      const morphemeParts = digraphsToSingle(str)
        .replaceAll('c', 'k')
        .replaceAll('y', 'j')
        .replaceAll('ñ', 'ŋ')
        .toLowerCase().split('+');
      const cleanedStr = morphemeParts.join('');

      // Convert digraphs to single characters in both the word and morphemes
      const morphemes = morphemeParts.map(m => digraphsToSingle(m).toLowerCase());

      return {
        in: str,
        out: cleanedStr,
        morphemes
      };
    },
  },
};

// =============================================================================
// Inter-language Rules (between Old Sindarin and Sindarin)
// Any conversions needed when transitioning between language stages
// =============================================================================

export const interLanguageRules = {
  // Currently no inter-language conversions needed
  // This section is reserved for future use
};

// =============================================================================
// Sindarin Post-processing Rules (after Sindarin stage)
// Convert single characters back to digraphs and apply Sindarin-specific
// orthographic conventions. Other pipelines (e.g. Quenya) will define their
// own post-processing.
// =============================================================================

export const sindarinPostProcessingRules = {
  'post-single-to-digraphs': {
    orderId: 'POST-01',
    pattern: 'single characters → digraphs',
    description: 'Convert single characters back to digraphs for final output',
    mechanic: (str) => {
      let result = str;
      result = singleToDigraphs(result);
      result = result.replace('k', 'c');
      result = result.replace('j', 'y');
      result = result.replace('ꞥ', 'nth');
      result = result.replace('ꞃ', 'n');
      if (['j', 'y'].includes(result.nth(0))) {
        if (result !== 'yrch') result = 'i' + result.substring(1);
      }
      if (result.nth(0, 2) === 'xʷ') {
        result = 'wh' + result.substring(2);
      }
      if (result.nth(-1) === 'v') {
        result = result.substring(0, result.length - 1) + 'f';
      }
      if (result.nth(-1) === 'u') {
        if (result.nth(-2).isVowel()) {
          result = result.substring(0, result.length - 1) + 'w';
        }
      }
      if (result.nth(-1) === 'w') {
        if (result.nth(-2).isConsonant()) {
          if (['g', 'k'].includes(result.nth(-2)) === false) {
            result = result.substring(0, result.length - 1) + 'u';
          }
        }
      }
      // Replace macrons with circumflexes: NFD decompose → swap combining marks → NFC recompose
      result = result.normalize('NFD').replace(/\u0304/g, '\u0302').normalize('NFC');
      result = result.toNormalScript();
      return { in: str, out: result };
    },
  },
};

// =============================================================================
// Quenya Post-processing Rules (after Quenya stage)
// Convert single characters back to digraphs and apply Quenya-specific
// orthographic conventions.
// =============================================================================

export const quenyaPostProcessingRules = {
  'post-quenya-single-to-digraphs': {
    orderId: 'POST-01',
    pattern: 'single characters → digraphs',
    description: 'Convert single characters back to digraphs for final output (Quenya)',
    mechanic: (str) => {
      let result = str;
      result = singleToDigraphs(result);
      result = result.replace('k', 'c');
      // Quenya keeps macrons (no circumflex conversion)
      result = result.toNormalScript();
      return { in: str, out: result };
    },
  },
};

// =============================================================================
// Exports for key arrays (similar to language rule files)
// =============================================================================

export const preProcessingRuleKeys = Object.keys(preProcessingRules);
export const interLanguageRuleKeys = Object.keys(interLanguageRules);
export const sindarinPostProcessingRuleKeys = Object.keys(sindarinPostProcessingRules);
export const quenyaPostProcessingRuleKeys = Object.keys(quenyaPostProcessingRules);

