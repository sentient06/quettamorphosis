/**
 * Quenya pipeline logic.
 * Thin wrapper around pipeline-logic.js with Quenya-specific configuration.
 * These functions have no DOM dependencies.
 */

import { quenyaRules } from './quenya.js';
import { ancientQuenyaRules } from './ancient-quenya.js';
import { primitiveElvishRules } from './primitive-elvish.js';
import {
  quenyaPostProcessingRules,
  quenyaPostProcessingRuleKeys,
} from './conversions.js';
import { createPipelineLogic } from './pipeline-logic.js';

// =============================================================================
// Quenya Pipeline Configuration
// =============================================================================

const PIPELINE = [
  { id: 'primitive-elvish', name: 'Primitive Elvish', acronym: 'PE', rules: primitiveElvishRules, hasSandhi: false },
  { id: 'ancient-quenya', name: 'Ancient Quenya', acronym: 'AQ', rules: ancientQuenyaRules, hasSandhi: false },
  { id: 'quenya', name: 'Quenya', acronym: 'Q', rules: quenyaRules, hasSandhi: false },
];

const logic = createPipelineLogic(PIPELINE, quenyaPostProcessingRules, quenyaPostProcessingRuleKeys);

// Re-export everything from the pipeline logic
export const {
  allRuleKeys,
  isConversionRule,
  getRulesObject,
  getLanguage,
  getPreviousRule,
  getNextRule,
  formatTripped,
  formatSkipped,
  isRuleEffectivelyEnabled,
  evolveWord,
} = logic;

export { PIPELINE };

// Export individual key arrays
export const peRuleKeys = PIPELINE[0].ruleKeys;
export const aqRuleKeys = PIPELINE[1].ruleKeys;
export const qRuleKeys = PIPELINE[2].ruleKeys;