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
      const morphemeParts = str.split('+');
      const cleanedStr = morphemeParts.join('');

      // Convert digraphs to single characters in both the word and morphemes
      const processedWord = digraphsToSingle(cleanedStr)
        .replaceAll('c', 'k')
        .replaceAll('y', 'j')
        .toLowerCase();
      const morphemes = morphemeParts.map(m => digraphsToSingle(m).toLowerCase());

      return {
        in: str,
        out: processedWord,
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
// Post-processing Rules (after Sindarin)
// Convert single characters back to digraphs for final output
// =============================================================================

export const postProcessingRules = {
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
      if (['j', 'y'].includes(result.nth(0))) {
        if (result !== 'yrch') result = 'i' + result.substring(1);
      }
      if (result.nth(-1) === 'v') {
        result = result.substring(0, result.length - 1) + 'f';
      }
      // Replace macrons with circumflexes: NFD decompose → swap combining marks → NFC recompose
      result = result.normalize('NFD').replace(/\u0304/g, '\u0302').normalize('NFC');
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
export const postProcessingRuleKeys = Object.keys(postProcessingRules);

