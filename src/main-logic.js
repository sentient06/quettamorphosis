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
  postProcessingRules,
  preProcessingRuleKeys,
  interLanguageRuleKeys,
  postProcessingRuleKeys,
} from './conversions.js';

// Separate rule keys for each language, sorted by orderId
export const peRuleKeys = Object.keys(primitiveElvishRules).sort((a, b) => {
  return primitiveElvishRules[a].orderId.localeCompare(primitiveElvishRules[b].orderId);
});

export const atRuleKeys = Object.keys(ancientTelerinRules).sort((a, b) => {
  return ancientTelerinRules[a].orderId.localeCompare(ancientTelerinRules[b].orderId);
});

export const osRuleKeys = Object.keys(oldSindarinRules).sort((a, b) => {
  return oldSindarinRules[a].orderId.localeCompare(oldSindarinRules[b].orderId);
});

export const sindarinRuleKeys = Object.keys(sindarinRules).sort((a, b) => {
  return sindarinRules[a].orderId.localeCompare(sindarinRules[b].orderId);
});

// Combined keys: all conversions + languages in execution order
// Pre-processing → PE → AT → OS → Inter-language → Sindarin → Post-processing
export const allRuleKeys = [
  ...preProcessingRuleKeys,
  ...peRuleKeys,
  ...atRuleKeys,
  ...osRuleKeys,
  ...interLanguageRuleKeys,
  ...sindarinRuleKeys,
  ...postProcessingRuleKeys,
];

// Helper to check if a rule is a conversion rule
export function isConversionRule(ruleId) {
  return !!(preProcessingRules[ruleId] || interLanguageRules[ruleId] || postProcessingRules[ruleId]);
}

// Helper to get rules object for a given ruleId
export function getRulesObject(ruleId) {
  if (preProcessingRules[ruleId]) return preProcessingRules;
  if (primitiveElvishRules[ruleId]) return primitiveElvishRules;
  if (ancientTelerinRules[ruleId]) return ancientTelerinRules;
  if (oldSindarinRules[ruleId]) return oldSindarinRules;
  if (interLanguageRules[ruleId]) return interLanguageRules;
  if (sindarinRules[ruleId]) return sindarinRules;
  if (postProcessingRules[ruleId]) return postProcessingRules;
  return null;
}

// Helper to get language/section name for a given ruleId
export function getLanguage(ruleId) {
  if (preProcessingRules[ruleId]) return 'pre-processing';
  if (primitiveElvishRules[ruleId]) return 'primitive-elvish';
  if (ancientTelerinRules[ruleId]) return 'ancient-telerin';
  if (oldSindarinRules[ruleId]) return 'old-sindarin';
  if (interLanguageRules[ruleId]) return 'inter-language';
  if (sindarinRules[ruleId]) return 'sindarin';
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
    const anchor = `<a href="#rule-${ruleId}">${rulesObj[ruleId].orderId}</a>`;
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
    return `<a href="#rule-${ruleId}">${rulesObj[ruleId].orderId}</a>`;
  }).join('\n');
}

/**
 * Check if a rule is effectively enabled (language AND rule must both be enabled)
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

  return langEnabled && ruleEnabled;
}

/**
 * Get the results object for a given ruleId
 * @param {string} ruleId - The rule ID
 * @param {Object} peRuleResults - Primitive Elvish results
 * @param {Object} atRuleResults - Ancient Telerin results
 * @param {Object} osRuleResults - Old Sindarin results
 * @param {Object} sindarinRuleResults - Sindarin results
 * @returns {Object|null}
 */
export function getResultsObject(ruleId, peRuleResults, atRuleResults, osRuleResults, sindarinRuleResults) {
  if (primitiveElvishRules[ruleId]) return peRuleResults;
  if (ancientTelerinRules[ruleId]) return atRuleResults;
  if (oldSindarinRules[ruleId]) return osRuleResults;
  if (sindarinRules[ruleId]) return sindarinRuleResults;
  return null;
}

