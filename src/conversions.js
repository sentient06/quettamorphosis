import { digraphsToSingle, singleToDigraphs } from './utils.js';

// =============================================================================
// Pre-processing Rules (before Old Sindarin)
// Convert digraphs to single characters for consistent rule processing
// =============================================================================

export const preProcessingRules = {
  'pre-digraphs-to-single': {
    orderId: 'PRE-01',
    pattern: 'digraphs → single characters',
    description: 'Convert digraphs to single characters for rule processing',
    mechanic: (str) => digraphsToSingle(str),
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
    mechanic: (str) => singleToDigraphs(str),
  },
};

// =============================================================================
// Exports for key arrays (similar to language rule files)
// =============================================================================

export const preProcessingRuleKeys = Object.keys(preProcessingRules);
export const interLanguageRuleKeys = Object.keys(interLanguageRules);
export const postProcessingRuleKeys = Object.keys(postProcessingRules);

