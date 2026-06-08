/**
 * Generic pipeline logic factory.
 * Creates all the functions needed by main.js and tests, parameterized by
 * which language stages and post-processing rules to use.
 *
 * Usage:
 *   const logic = createPipelineLogic(PIPELINE, postProcessingRules, postProcessingRuleKeys);
 *   const { allRuleKeys, evolveWord, getRulesObject, ... } = logic;
 */

import {
  preProcessingRules,
  interLanguageRules,
  preProcessingRuleKeys,
  interLanguageRuleKeys,
} from './conversions.js';
import { toBase36 } from './utils.js';
import { SANDHI_MASTER_RULE_ID, shouldSkipSandhi } from './sandhi.js';

/**
 * @param {Array} PIPELINE - Array of { id, name, acronym, rules, hasSandhi } stage objects
 * @param {Object} postProcessingRules - The post-processing rules object for this pipeline
 * @param {string[]} postProcessingRuleKeys - Keys of the post-processing rules
 * @returns {Object} All the functions and values needed by consumers
 */
export function createPipelineLogic(PIPELINE, postProcessingRules, postProcessingRuleKeys) {
  // Derived lookups
  const stageByLangId = Object.fromEntries(PIPELINE.map(s => [s.id, s]));
  const sandhiStage = PIPELINE.find(s => s.hasSandhi);

  // Build sorted rule keys per stage
  PIPELINE.forEach(stage => {
    stage.ruleKeys = Object.keys(stage.rules).sort((a, b) => {
      return stage.rules[a].orderId.localeCompare(stage.rules[b].orderId);
    });
  });

  // Combined keys: all conversions + languages in execution order
  const allRuleKeys = [
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

  function isConversionRule(ruleId) {
    return !!(preProcessingRules[ruleId] || interLanguageRules[ruleId] || postProcessingRules[ruleId]);
  }

  function getRulesObject(ruleId) {
    if (preProcessingRules[ruleId]) return preProcessingRules;
    const stage = ruleIdToStage.get(ruleId);
    if (stage) return stage.rules;
    if (interLanguageRules[ruleId]) return interLanguageRules;
    if (postProcessingRules[ruleId]) return postProcessingRules;
    return null;
  }

  function getLanguage(ruleId) {
    if (preProcessingRules[ruleId]) return 'pre-processing';
    const stage = ruleIdToStage.get(ruleId);
    if (stage) return stage.id;
    if (interLanguageRules[ruleId]) return 'inter-language';
    if (postProcessingRules[ruleId]) return 'post-processing';
    return null;
  }

  function getPreviousRule(currentRuleId) {
    const index = allRuleKeys.indexOf(currentRuleId);
    return allRuleKeys[index - 1];
  }

  function getNextRule(currentRuleId) {
    const index = allRuleKeys.indexOf(currentRuleId);
    return allRuleKeys[index + 1];
  }

  function formatTripped(rulesObj, resultsObj) {
    const rulesUsed = Object.keys(resultsObj).sort((a, b) => {
      return rulesObj[a].orderId.localeCompare(rulesObj[b].orderId);
    });
    return rulesUsed.map((ruleId) => {
      const anchor = `<a href="#rule-${toBase36(ruleId)}">${rulesObj[ruleId].orderId}</a>`;
      const result = resultsObj[ruleId];
      return `${anchor} - ${result.out}`;
    }).join('\n');
  }

  function formatSkipped(rulesObj, ruleKeys, ruleState) {
    const skippedRules = ruleKeys.filter((ruleId) => {
      const rule = rulesObj[ruleId];
      const isDefaultSkipped = rule?.skip === true;
      const isExplicitlyEnabled = ruleState[ruleId] === true;
      const isExplicitlyDisabled = ruleState[ruleId] === false;
      return (isDefaultSkipped && !isExplicitlyEnabled) || isExplicitlyDisabled;
    });
    return skippedRules.map((ruleId) => {
      return `<a href="#rule-${toBase36(ruleId)}">${rulesObj[ruleId].orderId}</a>`;
    }).join('\n');
  }

  function isRuleEffectivelyEnabled(ruleId, ruleState, languageState) {
    if (isConversionRule(ruleId)) {
      return true;
    }
    const langId = getLanguage(ruleId);
    const rulesObj = getRulesObject(ruleId);
    const rule = rulesObj[ruleId];
    const langEnabled = languageState[langId] !== false;
    const ruleEnabled = ruleState[ruleId] !== undefined
      ? ruleState[ruleId]
      : (rule?.skip !== true);

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
   * @param {string} input - The input word (in Primitive Elvish form)
   * @param {Object} config - Configuration object
   * @param {Set<string>} [config.disabledRules] - Set of rule IDs to disable
   * @param {Set<string>} [config.enabledRules] - Set of rule IDs to force-enable
   * @param {Set<string>} [config.disabledLanguages] - Set of language IDs to disable
   * @param {Object} [config.ruleOptions] - Map of ruleId -> options object
   * @param {Array<string>} [config.morphemes] - Initial morpheme boundaries
   * @returns {Object} Result object with evolution details
   */
  function evolveWord(input, config = {}) {
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

      if (language && disabledLanguages.has(language)) continue;
      if (disabledRules.has(ruleId) || disabledRules.has(qualifiedOrderId)) continue;

      const isExplicitlyEnabled = enabledRules.has(ruleId) || enabledRules.has(qualifiedOrderId);
      if (rule.skip === true && !isExplicitlyEnabled) continue;

      if (rule.isSandhi && sandhiStage) {
        const masterRule = sandhiStage.rules[SANDHI_MASTER_RULE_ID];
        const masterQualifiedOrderId = `${sandhiStage.acronym} ${masterRule.orderId}`;
        const isMasterExplicitlyEnabled = enabledRules.has(SANDHI_MASTER_RULE_ID) || enabledRules.has(masterQualifiedOrderId);
        const isMasterDisabled = disabledRules.has(SANDHI_MASTER_RULE_ID) || disabledRules.has(masterQualifiedOrderId);
        if (!isMasterExplicitlyEnabled || isMasterDisabled) continue;
      }

      const options = { morphemes: currentMorphemes };
      if (rule.input) {
        rule.input.forEach(inputDef => {
          options[inputDef.name] = inputDef.default;
        });
      }
      const customOpts = ruleOptions[ruleId] || ruleOptions[qualifiedOrderId] || {};
      Object.assign(options, customOpts);

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

      steps.push({ ruleId, orderId: rule.orderId, language, in: result.in, out: result.out, tripped: isTripped });
      if (isTripped) {
        tripped.push({ ruleId, orderId: rule.orderId, language, in: result.in, out: result.out });
      }

      currentValue = result.out;
      currentMorphemes = result.morphemes || currentMorphemes;
    }

    return { input, output: currentValue, morphemes: currentMorphemes, tripped, steps };
  }

  return {
    PIPELINE,
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
  };
}
