/**
 * Debug tools for browser console.
 * Usage: debug('word') and rules.enable('pe100'), etc.
 */

import { SyllableAnalyser, digraphsToSingle, singleToDigraphs, SINDARIN_PROFILE, OLD_SINDARIN_PROFILE, ANCIENT_TELERIN_PROFILE, toBase36, fromBase36 } from './utils.js';
import {
  allRuleKeys,
  isConversionRule,
  getRulesObject,
  getLanguage,
} from './main-logic.js';

// Language prefix mapping for rule references
const langPrefixMap = {
  'pe': 'primitive-elvish',
  'at': 'ancient-telerin',
  'os': 'old-sindarin',
  's': 'sindarin',
};

const langToPrefix = {
  'primitive-elvish': 'PE',
  'ancient-telerin': 'AT',
  'old-sindarin': 'OS',
  'sindarin': 'S',
};

/**
 * Parse a rule reference into its actual ruleId.
 * Supports: PE 00100, PE00100, PE100, pe100, 3868328117 (number or string), 1RZ3P2T (Base-36)
 */
function parseRuleRef(ref) {
  if (typeof ref === 'number') {
    ref = String(ref);
  }

  // Check if it's a direct decimal ruleId
  const rulesObj = getRulesObject(ref);
  if (rulesObj) {
    return ref;
  }

  const normalized = ref.toString().trim().toUpperCase();

  // Check if it's an order ID format (PE 00100, PE100, s5800, etc.)
  const match = normalized.match(/^(PE|AT|OS|S)\s*(\d+)$/);
  if (match) {
    const [, langPrefix, numPart] = match;
    const targetLang = langPrefixMap[langPrefix.toLowerCase()];
    const paddedOrderId = numPart.padStart(5, '0');

    for (const ruleId of allRuleKeys) {
      const rulesObj = getRulesObject(ruleId);
      if (!rulesObj) continue;
      const rule = rulesObj[ruleId];
      const lang = getLanguage(ruleId);
      if (lang === targetLang && rule.orderId === paddedOrderId) {
        return ruleId;
      }
    }
  }

  // Check if it's a Base-36 ID (alphanumeric, try to convert)
  if (/^[0-9A-Z]+$/i.test(normalized)) {
    const decimalId = fromBase36(normalized);
    const rulesObj = getRulesObject(decimalId);
    if (rulesObj) {
      return decimalId;
    }
  }

  return null;
}

/**
 * Parse a range of rules (e.g., "pe100-pe500", "at300-s1000")
 */
function parseRuleRange(rangeStr) {
  const [startRef, endRef] = rangeStr.split('-');
  const startId = parseRuleRef(startRef);
  const endId = parseRuleRef(endRef);
  
  if (!startId || !endId) {
    console.error('Could not parse range:', rangeStr);
    return [];
  }
  
  const startIndex = allRuleKeys.indexOf(startId);
  const endIndex = allRuleKeys.indexOf(endId);
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('Rules not found in allRuleKeys:', startId, endId);
    return [];
  }
  
  const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
  return allRuleKeys.slice(from, to + 1);
}

/**
 * Parse wildcard patterns like '*', 'pe*', 'at*', 'os*', 's*'
 */
function parseWildcard(pattern) {
  const normalized = pattern.trim().toLowerCase();
  
  if (normalized === '*') {
    return allRuleKeys.filter(ruleId => !isConversionRule(ruleId));
  }
  
  const match = normalized.match(/^(pe|at|os|s)\*$/);
  if (match) {
    const [, langPrefix] = match;
    const targetLang = langPrefixMap[langPrefix];
    return allRuleKeys.filter(ruleId => {
      if (isConversionRule(ruleId)) return false;
      return getLanguage(ruleId) === targetLang;
    });
  }
  
  return null;
}

/**
 * Parse rule parameter(s) - handles single refs, ranges, arrays, wildcards
 */
function parseRuleParams(param) {
  if (Array.isArray(param)) {
    return param.flatMap(p => parseRuleParams(p));
  }

  const paramStr = String(param).trim();

  const wildcardResult = parseWildcard(paramStr);
  if (wildcardResult) {
    return wildcardResult;
  }

  if (paramStr.includes('-') && !paramStr.startsWith('-')) {
    return parseRuleRange(paramStr);
  }

  const ruleId = parseRuleRef(param);
  return ruleId ? [ruleId] : [];
}

/**
 * Format a ruleId for display
 */
function formatRuleDisplay(ruleId) {
  const rulesObj = getRulesObject(ruleId);
  if (!rulesObj) return ruleId;
  const rule = rulesObj[ruleId];
  const lang = getLanguage(ruleId);
  const prefix = langToPrefix[lang] || '';
  return `${prefix} ${rule.orderId}`;
}

/**
 * Setup debug tools on window object.
 * @param {Object} deps - Dependencies from main.js
 * @param {Function} deps.toggleRule - Function to toggle a rule
 * @param {Function} deps.resetRule - Function to reset a rule
 * @param {Function} deps.resetAllRules - Function to reset all rules
 * @param {Function} deps.getRuleState - Function to get current rule state
 * @param {Function} deps.smoothScrollTo - Function to smooth scroll to a Y position
 * @param {Function} deps.getStickyHeight - Function to get the sticky header height offset
 */
export function setupDebugTools({ toggleRule, resetRule, resetAllRules, getRuleState, smoothScrollTo, getStickyHeight }) {
  console.log('Commands: debug(word), rules(), rule(ref), goto(ref)');

  // Word debug tool
  window.debug = (str, lang = 's') => {
    if (!str) {
      return 'Usage: debug(\'word\', \'<s|os|at>\')';
    }
    const toSingle = digraphsToSingle(str);
    const toDigraphs = singleToDigraphs(str);
    const toSingleAndToDigraphs = singleToDigraphs(toSingle);
    const profile = lang === 's' ? SINDARIN_PROFILE : (lang === 'os' ? OLD_SINDARIN_PROFILE : ANCIENT_TELERIN_PROFILE);
    const sAnalyser = new SyllableAnalyser({ profile });
    const syllables = sAnalyser.analyse(str);
    return {
      toSingle,
      toDigraphs,
      toSingleAndToDigraphs,
      syllables,
    };
  };

  // Rules management API
  const api = {
    enable: (...params) => {
      const ruleIds = params.flatMap(p => parseRuleParams(p));
      const enabled = [];
      ruleIds.forEach(ruleId => {
        if (isConversionRule(ruleId)) return;
        toggleRule(ruleId, true);
        enabled.push(formatRuleDisplay(ruleId));
      });
      console.log(`Enabled ${enabled.length} rule(s):`, enabled.join(', '));
      return enabled;
    },

    disable: (...params) => {
      const ruleIds = params.flatMap(p => parseRuleParams(p));
      const disabled = [];
      ruleIds.forEach(ruleId => {
        if (isConversionRule(ruleId)) return;
        toggleRule(ruleId, false);
        disabled.push(formatRuleDisplay(ruleId));
      });
      console.log(`Disabled ${disabled.length} rule(s):`, disabled.join(', '));
      return disabled;
    },

    toggle: (...params) => {
      const ruleIds = params.flatMap(p => parseRuleParams(p));
      const toggled = [];
      ruleIds.forEach(ruleId => {
        if (isConversionRule(ruleId)) return;
        const rulesObj = getRulesObject(ruleId);
        const rule = rulesObj[ruleId];
        const ruleState = getRuleState();
        const currentState = ruleState[ruleId] !== undefined ? ruleState[ruleId] : !rule.skip;
        toggleRule(ruleId, !currentState);
        toggled.push(`${formatRuleDisplay(ruleId)} → ${!currentState ? 'ON' : 'OFF'}`);
      });
      console.log(`Toggled ${toggled.length} rule(s):`, toggled.join(', '));
      return toggled;
    },

    reset: (...params) => {
      const ruleIds = params.flatMap(p => parseRuleParams(p));
      const reset = [];
      ruleIds.forEach(ruleId => {
        if (isConversionRule(ruleId)) return;
        resetRule(ruleId);
        reset.push(formatRuleDisplay(ruleId));
      });
      console.log(`Reset ${reset.length} rule(s):`, reset.join(', '));
      return reset;
    },

    resetAll: () => {
      resetAllRules();
      console.log('All rules reset to default state.');
    },

    list: (langFilter = null) => {
      const results = [];
      const ruleState = getRuleState();
      allRuleKeys.forEach(ruleId => {
        if (isConversionRule(ruleId)) return;
        const rulesObj = getRulesObject(ruleId);
        const rule = rulesObj[ruleId];
        const lang = getLanguage(ruleId);

        if (langFilter) {
          const filterNorm = langFilter.toLowerCase();
          const matchesLang = lang === filterNorm ||
            (langPrefixMap[filterNorm] && lang === langPrefixMap[filterNorm]);
          if (!matchesLang) return;
        }

        const prefix = langToPrefix[lang] || '';
        const isEnabled = ruleState[ruleId] !== undefined ? ruleState[ruleId] : !rule.skip;
        results.push({
          ref: `${prefix} ${rule.orderId}`,
          id: ruleId,
          enabled: isEnabled,
          skip: rule.skip || false,
        });
      });
      console.table(results);
      return results;
    },

    find: (searchTerm) => {
      const results = [];
      const searchLower = searchTerm.toLowerCase();
      allRuleKeys.forEach(ruleId => {
        if (isConversionRule(ruleId)) return;
        const rulesObj = getRulesObject(ruleId);
        const rule = rulesObj[ruleId];
        const desc = (rule.description || '').toLowerCase();
        if (desc.includes(searchLower) || ruleId.includes(searchLower)) {
          const lang = getLanguage(ruleId);
          const prefix = langToPrefix[lang] || '';
          results.push({
            ref: `${prefix} ${rule.orderId}`,
            id: ruleId,
            description: rule.description,
          });
        }
      });
      console.table(results);
      return results;
    },
  };

  const rulesHelp = () => {
    console.log('Rule management functions:');
    console.log('  rules.enable(ref, ...)  - Enable rule(s)');
    console.log('  rules.disable(ref, ...) - Disable rule(s)');
    console.log('  rules.toggle(ref, ...)  - Toggle rule(s)');
    console.log('  rules.reset(ref, ...)   - Reset rule(s) to default');
    console.log('  rules.resetAll()        - Reset all rules');
    console.log('  rules.list([lang])      - List all rules (optionally by language)');
    console.log('  rules.find(term)        - Find rules by description');
    console.log('');
    console.log('Reference formats:');
    console.log('  "PE 00100", "PE00100", "PE100", "pe100" - by orderId');
    console.log('  "3868328117" or 3868328117             - by full ruleId');
    console.log('  "pe100-pe500", "at300-s1000"           - range');
    console.log('  "*", "pe*", "at*", "os*", "s*"         - wildcard (all rules)');
    console.log('  ["pe100", "at200", "s300"]             - array');
    return api;
  };

  Object.assign(rulesHelp, api);
  window.rules = rulesHelp;

  // rule() command - shows all identifiers for a given rule
  window.rule = (ref) => {
    if (!ref) {
      console.log('Usage: rule(ref)');
      console.log('Shows all identifiers that can be used to reference a rule.');
      console.log('Example: rule("s5800"), rule("PE100"), rule(3868328117)');
      return;
    }

    const ruleId = parseRuleRef(ref);
    if (!ruleId) {
      console.error(`Could not find rule: ${ref}`);
      return null;
    }

    const rulesObj = getRulesObject(ruleId);
    if (!rulesObj) {
      console.error(`Could not find rules object for: ${ruleId}`);
      return null;
    }

    const rule = rulesObj[ruleId];
    const lang = getLanguage(ruleId);
    const prefix = langToPrefix[lang] || '';
    const base36Id = toBase36(ruleId);

    const identifiers = {
      'Order ID': `${prefix}${rule.orderId}`,
      'Decimal ID': ruleId,
      'Base-36 ID': base36Id,
      'Description': rule.description || '(none)',
    };

    console.log(`Rule identifiers for: ${prefix} ${rule.orderId}`);
    console.table(identifiers);
    return identifiers;
  };

  // goto() command - scrolls to a rule in the UI
  window.goto = (ref) => {
    if (!ref) {
      console.log('Usage: goto(ref)');
      console.log('Scrolls the UI to the specified rule.');
      console.log('Example: goto("s5800"), goto("PE100"), goto(3868328117)');
      return;
    }

    const ruleId = parseRuleRef(ref);
    if (!ruleId) {
      console.error(`Could not find rule: ${ref}`);
      return null;
    }

    const base36Id = toBase36(ruleId);
    const targetElement = document.getElementById(`rule-${base36Id}`);

    if (!targetElement) {
      console.error(`Rule element not found in DOM: rule-${base36Id}`);
      return null;
    }

    // Calculate target position accounting for sticky header
    const stickyHeight = getStickyHeight();
    const targetY = targetElement.getBoundingClientRect().top + window.scrollY - stickyHeight;
    smoothScrollTo(targetY);

    // Update URL hash
    history.replaceState(null, '', `#rule-${base36Id}`);

    // Format for display
    const rulesObj = getRulesObject(ruleId);
    const rule = rulesObj[ruleId];
    const lang = getLanguage(ruleId);
    const prefix = langToPrefix[lang] || '';

    console.log(`Scrolled to: ${prefix} ${rule.orderId}`);
    return `${prefix} ${rule.orderId}`;
  };
}

