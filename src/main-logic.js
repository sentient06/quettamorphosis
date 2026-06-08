/**
 * Pure logic functions extracted from main.js for testability.
 * These functions have no DOM dependencies.
 */

import { sindarinRules } from './sindarin.js';
import { oldSindarinRules } from './old-sindarin.js';
import { ancientTelerinRules } from './ancient-telerin.js';
import { primitiveElvishRules } from './primitive-elvish.js';
import {
  preProcessingRules,
  interLanguageRules,
  sindarinPostProcessingRules,
  preProcessingRuleKeys,
  interLanguageRuleKeys,
  sindarinPostProcessingRuleKeys,
} from './conversions.js';

// Alias: the current pipeline uses Sindarin post-processing.
// When Quenya is added, a separate pipeline config will reference different post-processing.
const postProcessingRules = sindarinPostProcessingRules;
const postProcessingRuleKeys = sindarinPostProcessingRuleKeys;
import { toBase36 } from './utils.js';
import { SANDHI_MASTER_RULE_ID, shouldSkipSandhi } from './sandhi.js';

// =============================================================================
// Pipeline Configuration
// =============================================================================

// Defines the language stages in execution order.
// Each stage has: id, name, acronym, rules object, and optionally hasSandhi.
const PIPELINE = [
  { id: 'primitive-elvish', name: 'Primitive Elvish', acronym: 'PE', rules: primitiveElvishRules, hasSandhi: false },
  { id: 'ancient-telerin', name: 'Ancient Telerin', acronym: 'AT', rules: ancientTelerinRules, hasSandhi: false },
  { id: 'old-sindarin', name: 'Old Sindarin', acronym: 'OS', rules: oldSindarinRules, hasSandhi: false },
  { id: 'sindarin', name: 'Sindarin', acronym: 'S', rules: sindarinRules, hasSandhi: true },
];

// Export the pipeline so consumers (e.g., main.js) can use it
export { PIPELINE };

// Derived lookups
const stageByLangId = Object.fromEntries(PIPELINE.map(s => [s.id, s]));
const sandhiStage = PIPELINE.find(s => s.hasSandhi);

// Build sorted rule keys per stage
PIPELINE.forEach(stage => {
  stage.ruleKeys = Object.keys(stage.rules).sort((a, b) => {
    return stage.rules[a].orderId.localeCompare(stage.rules[b].orderId);
  });
});

// Export individual key arrays for backward compatibility
export const peRuleKeys = PIPELINE[0].ruleKeys;
export const atRuleKeys = PIPELINE[1].ruleKeys;
export const osRuleKeys = PIPELINE[2].ruleKeys;
export const sindarinRuleKeys = PIPELINE[3].ruleKeys;

// Combined keys: all conversions + languages in execution order
// Pre-processing → PE → ... → Inter-language → last stage → Post-processing
export const allRuleKeys = [
  ...preProcessingRuleKeys,
  ...PIPELINE.flatMap((stage, i) => {
    if (i === PIPELINE.length - 1 && interLanguageRuleKeys.length > 0) {
      return [...interLanguageRuleKeys, ...stage.ruleKeys];
    }
    return stage.ruleKeys;
  }),
  ...postProcessingRuleKeys,
];

// Reverse lookup: ruleId → stage (for language rules only)
const ruleIdToStage = new Map();
PIPELINE.forEach(stage => {
  for (const ruleId of stage.ruleKeys) {
    ruleIdToStage.set(ruleId, stage);
  }
});

// Helper to check if a rule is a conversion rule
export function isConversionRule(ruleId) {
  return !!(preProcessingRules[ruleId] || interLanguageRules[ruleId] || postProcessingRules[ruleId]);
}

// Helper to get rules object for a given ruleId
export function getRulesObject(ruleId) {
  if (preProcessingRules[ruleId]) return preProcessingRules;
  const stage = ruleIdToStage.get(ruleId);
  if (stage) return stage.rules;
  if (interLanguageRules[ruleId]) return interLanguageRules;
  if (postProcessingRules[ruleId]) return postProcessingRules;
  return null;
}

// Helper to get language/section name for a given ruleId
export function getLanguage(ruleId) {
  if (preProcessingRules[ruleId]) return 'pre-processing';
  const stage = ruleIdToStage.get(ruleId);
  if (stage) return stage.id;
  if (interLanguageRules[ruleId]) return 'inter-language';
  if (postProcessingRules[ruleId]) return 'post-processing';
  return null;
}

export function getPreviousRule(currentRuleId) {
  const index = allRuleKeys.indexOf(currentRuleId);
  return allRuleKeys[index - 1];
}

export function getNextRule(currentRuleId) {
  const index = allRuleKeys.indexOf(currentRuleId);
  return allRuleKeys[index + 1];
}

/**
 * Format tripped rules for display
 * @param {Object} rulesObj - The rules object (e.g., sindarinRules)
 * @param {Object} resultsObj - The results tracking object (values are {in, out} objects)
 * @returns {string} Formatted HTML string
 */
export function formatTripped(rulesObj, resultsObj) {
  const rulesUsed = Object.keys(resultsObj).sort((a, b) => {
    return rulesObj[a].orderId.localeCompare(rulesObj[b].orderId);
  });
  return rulesUsed.map((ruleId) => {
    const anchor = `<a href="#rule-${toBase36(ruleId)}">${rulesObj[ruleId].orderId}</a>`;
    const result = resultsObj[ruleId];
    return `${anchor} - ${result.out}`;
  }).join('\n');
}

/**
 * Format skipped rules for display
 * @param {Object} rulesObj - The rules object (e.g., sindarinRules)
 * @param {string[]} ruleKeys - Array of rule IDs
 * @param {Object} ruleState - The rule state object tracking enabled/disabled
 * @returns {string} Formatted HTML string
 */
export function formatSkipped(rulesObj, ruleKeys, ruleState) {
  const skippedRules = ruleKeys.filter((ruleId) => {
    const rule = rulesObj[ruleId];
    const isDefaultSkipped = rule?.skip === true;
    const isExplicitlyEnabled = ruleState[ruleId] === true;
    const isExplicitlyDisabled = ruleState[ruleId] === false;
    // Skipped if: (default-skipped and not overridden to enabled) OR explicitly disabled
    return (isDefaultSkipped && !isExplicitlyEnabled) || isExplicitlyDisabled;
  });
  return skippedRules.map((ruleId) => {
    return `<a href="#rule-${toBase36(ruleId)}">${rulesObj[ruleId].orderId}</a>`;
  }).join('\n');
}

/**
 * Check if a rule is effectively enabled (language AND rule must both be enabled)
 * For sandhi rules, the master switch must also be enabled.
 * @param {string} ruleId - The rule ID
 * @param {Object} ruleState - The rule state object
 * @param {Object} languageState - The language state object
 * @returns {boolean}
 */
export function isRuleEffectivelyEnabled(ruleId, ruleState, languageState) {
  // Conversion rules are always enabled
  if (isConversionRule(ruleId)) {
    return true;
  }

  const langId = getLanguage(ruleId);
  const rulesObj = getRulesObject(ruleId);
  const rule = rulesObj[ruleId];

  // Language must be enabled (default true)
  const langEnabled = languageState[langId] !== false;

  // Rule must be enabled: check user override, then default (skip means disabled by default)
  const ruleEnabled = ruleState[ruleId] !== undefined
    ? ruleState[ruleId]
    : (rule?.skip !== true);

  // For sandhi rules (isSandhi: true), also check if master switch is enabled
  if (rule?.isSandhi && sandhiStage) {
    const masterRule = sandhiStage.rules[SANDHI_MASTER_RULE_ID];
    const masterEnabled = ruleState[SANDHI_MASTER_RULE_ID] !== undefined
      ? ruleState[SANDHI_MASTER_RULE_ID]
      : (masterRule?.skip !== true);
    return langEnabled && ruleEnabled && masterEnabled;
  }

  return langEnabled && ruleEnabled;
}

/**
 * Evolve a word through all rules from Primitive Elvish to the final stage.
 * This is the core test helper for end-to-end word evolution testing.
 *
 * @param {string} input - The input word (in Primitive Elvish form)
 * @param {Object} config - Configuration object
 * @param {Set<string>} [config.disabledRules] - Set of rule IDs to disable (by ruleId or qualified orderId like 'S 06500')
 * @param {Set<string>} [config.enabledRules] - Set of rule IDs to force-enable (overrides skip: true)
 * @param {Set<string>} [config.disabledLanguages] - Set of language IDs to disable ('primitive-elvish', 'ancient-telerin', 'old-sindarin', 'sindarin')
 * @param {Object} [config.ruleOptions] - Map of ruleId -> options object for rules with inputs
 * @param {Array<string>} [config.morphemes] - Initial morpheme boundaries
 * @returns {Object} Result object with evolution details
 */
export function evolveWord(input, config = {}) {
  const {
    disabledRules = new Set(),
    enabledRules = new Set(),
    disabledLanguages = new Set(),
    ruleOptions = {},
    morphemes: initialMorphemes = null,
  } = config;

  let currentValue = input;
  let currentMorphemes = initialMorphemes || [input];
  const tripped = [];
  const steps = [];

  for (const ruleId of allRuleKeys) {
    const rulesObj = getRulesObject(ruleId);
    if (!rulesObj) continue;

    const rule = rulesObj[ruleId];
    const language = getLanguage(ruleId);
    const stage = stageByLangId[language];
    const langPrefix = stage ? stage.acronym : '';
    const qualifiedOrderId = langPrefix ? `${langPrefix} ${rule.orderId}` : rule.orderId;

    // Check if language is disabled
    if (language && disabledLanguages.has(language)) {
      continue;
    }

    // Check if rule is disabled (by ID or qualified orderId)
    if (disabledRules.has(ruleId) || disabledRules.has(qualifiedOrderId)) {
      continue;
    }

    // Check if rule is explicitly enabled (overrides skip: true)
    const isExplicitlyEnabled = enabledRules.has(ruleId) || enabledRules.has(qualifiedOrderId);

    // Check if rule has skip: true and is not explicitly enabled
    if (rule.skip === true && !isExplicitlyEnabled) {
      continue;
    }

    // For sandhi rules, check if master switch is enabled
    if (rule.isSandhi && sandhiStage) {
      const masterRule = sandhiStage.rules[SANDHI_MASTER_RULE_ID];
      const masterQualifiedOrderId = `${sandhiStage.acronym} ${masterRule.orderId}`;
      const isMasterExplicitlyEnabled = enabledRules.has(SANDHI_MASTER_RULE_ID) || enabledRules.has(masterQualifiedOrderId);
      const isMasterDisabled = disabledRules.has(SANDHI_MASTER_RULE_ID) || disabledRules.has(masterQualifiedOrderId);
      // Master switch has skip: true, so it must be explicitly enabled and not disabled
      if (!isMasterExplicitlyEnabled || isMasterDisabled) {
        continue;
      }
    }

    // Build options: start with rule defaults, then apply custom options
    const options = { morphemes: currentMorphemes };
    if (rule.input) {
      rule.input.forEach(inputDef => {
        options[inputDef.name] = inputDef.default;
      });
    }
    // Apply custom options for this rule (by ruleId or qualified orderId)
    const customOpts = ruleOptions[ruleId] || ruleOptions[qualifiedOrderId] || {};
    Object.assign(options, customOpts);

    // Run the rule (skip sandhi for non-compound words if compoundsOnly is enabled on master switch)
    let compoundsOnly = false;
    if (rule.isSandhi && sandhiStage) {
      const masterRule = sandhiStage.rules[SANDHI_MASTER_RULE_ID];
      const masterQualifiedOrderId = `${sandhiStage.acronym} ${masterRule.orderId}`;
      const masterCustomOpts = ruleOptions[SANDHI_MASTER_RULE_ID] || ruleOptions[masterQualifiedOrderId] || {};
      compoundsOnly = masterCustomOpts.compoundsOnly !== undefined
        ? masterCustomOpts.compoundsOnly
        : (masterRule.input?.find(i => i.name === 'compoundsOnly')?.default ?? true);
    }
    const sandhiCheck = shouldSkipSandhi(rule, currentValue, options, compoundsOnly);
    const result = sandhiCheck.skip ? sandhiCheck.result : rule.mechanic(currentValue, options);
    const isTripped = result.in !== result.out;

    steps.push({
      ruleId,
      orderId: rule.orderId,
      language,
      in: result.in,
      out: result.out,
      tripped: isTripped,
    });

    if (isTripped) {
      tripped.push({
        ruleId,
        orderId: rule.orderId,
        language,
        in: result.in,
        out: result.out,
      });
    }

    currentValue = result.out;
    currentMorphemes = result.morphemes || currentMorphemes;
  }

  return {
    input,
    output: currentValue,
    morphemes: currentMorphemes,
    tripped,
    steps,
  };
}

