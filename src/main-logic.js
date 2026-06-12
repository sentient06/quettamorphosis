/**
 * Sindarin pipeline logic.
 * Thin wrapper around pipeline-logic.js with Sindarin-specific configuration.
 * These functions have no DOM dependencies.
 */

import { sindarinRules } from './sindarin.js';
import { oldSindarinRules } from './old-sindarin.js';
import { ancientTelerinRules } from './ancient-telerin.js';
import { primitiveElvishRules } from './primitive-elvish.js';
import {
  sindarinPostProcessingRules,
  sindarinPostProcessingRuleKeys,
} from './conversions.js';
import { createPipelineLogic } from './pipeline-logic.js';

// =============================================================================
// Sindarin Pipeline Configuration
// =============================================================================

const PIPELINE = [
  { id: 'primitive-elvish', name: 'Primitive Elvish', acronym: 'PE', rules: primitiveElvishRules, hasSandhi: false },
  { id: 'ancient-telerin', name: 'Ancient Telerin', acronym: 'AT', rules: ancientTelerinRules, hasSandhi: false },
  { id: 'old-sindarin', name: 'Old Sindarin', acronym: 'OS', rules: oldSindarinRules, hasSandhi: false },
  { id: 'sindarin', name: 'Sindarin', acronym: 'S', rules: sindarinRules, hasSandhi: true },
];

const logic = createPipelineLogic(PIPELINE, sindarinPostProcessingRules, sindarinPostProcessingRuleKeys);

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

// Export individual key arrays for backward compatibility
export const peRuleKeys = PIPELINE[0].ruleKeys;
export const atRuleKeys = PIPELINE[1].ruleKeys;
export const osRuleKeys = PIPELINE[2].ruleKeys;
export const sindarinRuleKeys = PIPELINE[3].ruleKeys;
