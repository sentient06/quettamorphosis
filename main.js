// =============================================================================
// Pipeline detection: determine which language pipeline to use from the page URL
// =============================================================================
const isQuenya = /quenya/i.test(location.pathname);
const logicModule = isQuenya
  ? await import('./src/quenya-main-logic.js')
  : await import('./src/main-logic.js');
const storagePrefix = isQuenya ? 'quenya-' : '';

const {
  PIPELINE,
  allRuleKeys,
  isConversionRule,
  getRulesObject,
  getLanguage,
  getPreviousRule,
  getNextRule,
  formatTripped,
  formatSkipped,
  isRuleEffectivelyEnabled: _isRuleEffectivelyEnabled,
} = logicModule;

import { SANDHI_MASTER_RULE_ID, getSandhiRuleId, shouldSkipSandhi } from './src/sandhi.js';

// Sandhi rule range constants
const FIRST_SANDHI_RULE_ID = getSandhiRuleId(116);
const LAST_SANDHI_RULE_ID = getSandhiRuleId(170);
import {
  preProcessingRuleKeys,
  interLanguageRuleKeys,
} from './src/conversions.js';

// Post-processing keys come from the logic module's pipeline
// (last item in allRuleKeys that starts with 'post-')
const postProcessingRuleKeys = allRuleKeys.filter(k => k.startsWith('post-'));

import { setupDebugTools } from './src/debug.js';
import {
  getInputFromUrl,
  updateUrlWithInput,
  isShareMode,
  removeShareModeFromUrl,
  getDisabledFromUrl,
  getEnabledFromUrl,
  encodeQueryString,
  encodeDisabledParam,
  encodeEnabledParam,
  encodeRuleInputs,
  getRuleInputsFromUrl,
  encodeMorphemeBoundaries,
  getMorphemeBoundariesFromUrl,
} from './src/query-string.js';
import { toBase36, singleToPhonetic } from './src/utils.js';

// =============================================================================
// Pipeline-derived helpers
// =============================================================================

// Derived lookup maps
const stageByLangId = Object.fromEntries(PIPELINE.map(s => [s.id, s]));
const stageResults = Object.fromEntries(PIPELINE.map(s => [s.id, {}]));
const allLanguageIds = PIPELINE.map(s => s.id);

// Sandhi helpers (only present in some pipelines)
const sandhiStage = PIPELINE.find(s => s.hasSandhi);
function getSandhiMasterRule() {
  return sandhiStage ? sandhiStage.rules[SANDHI_MASTER_RULE_ID] : null;
}

// =============================================================================
// DOM Elements
// =============================================================================

const $wrapper = document.getElementById('wrapper');
const $originalInput = document.getElementById('input');
const $originalOutput = document.getElementById('output');
const $topWrapper = document.querySelector('.top-wrapper');
const $helpers = document.querySelector('.userInput .helpers');
const $toggleHelpers = document.getElementById('toggle-helpers');
const $shareUrlButton = document.getElementById('share-url');
const $resetButton = document.getElementById('reset');
const $resetOrderButton = document.getElementById('reset-order');
const $resultsTripped = document.getElementById('results-tripped');
const $resultsSkipped = document.getElementById('results-skipped');
const $copyChainButton = document.getElementById('copy-chain');
const $notes = document.getElementById('notes');
const $openNotes = document.getElementById('open-notes');
const $closeNotes = document.getElementById('close-notes');
const $toggleResults = document.getElementById('toggle-results');
const $sideWrapper = document.querySelector('.side-wrapper');
const $drawerOverlay = document.querySelector('.drawer-overlay');

// =============================================================================
// State
// =============================================================================

// Languages that are disabled by default (temporary for incomplete implementations)
const LANGUAGES_DISABLED_BY_DEFAULT = [];

// localStorage helpers — prefix keys so Sindarin and Quenya don't share state
const storageKey = (key) => `${storagePrefix}${key}`;

// Track morphemes for each rule (needed when toggling rules mid-chain)
const ruleMorphemes = {};
// Track input morphemes for each rule (to detect rule-removed boundaries)
const ruleInputMorphemes = {};
// Track morpheme boundary states: ruleId -> Set<mergedBoundaryIndex>
// Merged boundaries mean adjacent morphemes are combined when passed to next rule
// Load from localStorage (stored as arrays, convert to Sets)
const storedBoundaries = JSON.parse(localStorage.getItem(storageKey('morpheme-boundaries')) || '{}');
const morphemeBoundaryState = {};
for (const [ruleId, indices] of Object.entries(storedBoundaries)) {
  morphemeBoundaryState[ruleId] = new Set(indices);
}
// Track sandhi execution state for master rule aggregation
let sandhiInputValue = null;
let sandhiInputMorphemes = null;
let anySandhiTripped = false;
const ruleState = JSON.parse(localStorage.getItem(storageKey('rules')) || '{}');
const languageState = JSON.parse(localStorage.getItem(storageKey('languages')) || '{}');
const optionState = JSON.parse(localStorage.getItem(storageKey('options')) || '{}');
const orderState = JSON.parse(localStorage.getItem(storageKey('order')) || '{}');

// Build a flat map of all rules for rule input parsing
const allRulesMap = {};
for (const stage of PIPELINE) {
  Object.assign(allRulesMap, stage.rules);
}

// Check for share mode: ?s parameter signals override mode
// In share mode: enable all rules/languages first, then apply ?off= and ?on= overrides
// Capture the input BEFORE removing params (since removeShareModeFromUrl clears ?i)
let shareModeInput = null;
let shareModeRuleInputs = null;
if (isShareMode()) {
  // Save input from URL before we clear the params
  shareModeInput = getInputFromUrl();

  // Parse ?ri= parameter for rule inputs before clearing
  shareModeRuleInputs = getRuleInputsFromUrl(allRulesMap);

  // Clear all rule overrides (all rules default to enabled)
  Object.keys(ruleState).forEach(key => delete ruleState[key]);

  // Enable all languages
  Object.keys(languageState).forEach(key => delete languageState[key]);

  // Get all rule IDs for parsing ranges
  const allRuleIds = PIPELINE.flatMap(stage => Object.keys(stage.rules));

  // Parse ?off= parameter and apply disabled state
  const { disabledRules, disabledLanguages } = getDisabledFromUrl(allRuleIds);

  // Parse ?on= parameter for rules with skip:true that should be enabled
  const enabledRules = getEnabledFromUrl(allRuleIds);

  // Parse ?mb= parameter for morpheme boundary states
  const boundaryStates = getMorphemeBoundariesFromUrl(allRuleIds);
  Object.assign(morphemeBoundaryState, boundaryStates);

  // Disable specified rules
  disabledRules.forEach(ruleId => {
    ruleState[ruleId] = false;
  });

  // Enable specified rules (overrides skip:true default)
  enabledRules.forEach(ruleId => {
    ruleState[ruleId] = true;
  });

  // Disable specified languages
  disabledLanguages.forEach(langId => {
    languageState[langId] = false;
  });

  // Remove all share params from URL (?s, ?i, ?off, ?on, ?ri, ?mb)
  removeShareModeFromUrl();
}

// Apply default disabled state for languages not yet stored
LANGUAGES_DISABLED_BY_DEFAULT.forEach(langId => {
  if (languageState[langId] === undefined) {
    languageState[langId] = false;
  }
});

// =============================================================================
// Rule Ordering
// =============================================================================

// Initialize order state with default orderId-based sorting if not present
function initializeOrderState() {
  PIPELINE.forEach(stage => {
    if (!orderState[stage.id]) {
      orderState[stage.id] = [...stage.ruleKeys];
    }
    // Add any new rules that might have been added since last save
    stage.ruleKeys.forEach(ruleId => {
      if (!orderState[stage.id].includes(ruleId)) {
        orderState[stage.id].push(ruleId);
      }
    });
    // Remove any rules that no longer exist
    orderState[stage.id] = orderState[stage.id].filter(id => stage.ruleKeys.includes(id));
  });
}

initializeOrderState();

// Get ordered rule keys for a language
function getOrderedRuleKeys(language) {
  return orderState[language] || [];
}

// Build the complete ordered list of all rule keys
function getAllOrderedRuleKeys() {
  const keys = [...preProcessingRuleKeys];
  PIPELINE.forEach((stage, i) => {
    // Insert inter-language conversions before the last stage
    if (i === PIPELINE.length - 1 && interLanguageRuleKeys.length > 0) {
      keys.push(...interLanguageRuleKeys);
    }
    keys.push(...getOrderedRuleKeys(stage.id));
  });
  keys.push(...postProcessingRuleKeys);
  return keys;
}

// Save order state to localStorage
function saveOrderState() {
  localStorage.setItem(storageKey('order'), JSON.stringify(orderState));
}

// Get options for a rule from DOM inputs
function getOptions(ruleId, rule) {
  const options = {};
  if (rule.input) {
    rule.input.forEach((inputDef) => {
      const $input = document.getElementById(`input-${ruleId}-${inputDef.name}`);
      if ($input) {
        options[inputDef.name] = inputDef.type === 'boolean'
          ? $input.checked
          : ($input.value || inputDef.default);
      }
    });
  }
  if (rule.dependsOn) {
    rule.dependsOn.forEach((dependency) => {
      const $checkbox = document.getElementById(`dep-${ruleId}-${dependency.param}`);
      if ($checkbox) {
        options[dependency.param] = $checkbox.checked;
      }
    });
  }
  return options;
}

// Update reorder button states for affected rules after a move
function updateReorderButtons(language) {
  const order = orderState[language] || [];
  order.forEach((ruleId, index) => {
    const $upBtn = document.getElementById(`move-up-${ruleId}`);
    const $downBtn = document.getElementById(`move-down-${ruleId}`);
    if ($upBtn) $upBtn.disabled = index === 0;
    if ($downBtn) $downBtn.disabled = index === order.length - 1;
  });
}

// Move a rule up (earlier in execution order)
function moveRuleUp(ruleId) {
  const language = getLanguage(ruleId);
  if (!language || isConversionRule(ruleId)) return; // Can't move conversion rules

  const order = orderState[language];
  const index = order.indexOf(ruleId);
  if (index <= 0) return; // Already at top

  // Swap with previous rule
  [order[index - 1], order[index]] = [order[index], order[index - 1]];
  saveOrderState();

  // Move DOM element
  const $rule = document.getElementById(`rule-${toBase36(ruleId)}`);
  const $prevRule = document.getElementById(`rule-${toBase36(order[index])}`);
  if ($rule && $prevRule) {
    $prevRule.parentNode.insertBefore($rule, $prevRule);
  }

  // Update button states
  updateReorderButtons(language);

  // Re-run rules from the earlier position
  rerunFromPosition(language, index - 1);
}

// Move a rule down (later in execution order)
function moveRuleDown(ruleId) {
  const language = getLanguage(ruleId);
  if (!language || isConversionRule(ruleId)) return; // Can't move conversion rules

  const order = orderState[language];
  const index = order.indexOf(ruleId);
  if (index >= order.length - 1) return; // Already at bottom

  // Swap with next rule
  [order[index], order[index + 1]] = [order[index + 1], order[index]];
  saveOrderState();

  // Move DOM element
  const $rule = document.getElementById(`rule-${toBase36(ruleId)}`);
  const $nextRule = document.getElementById(`rule-${toBase36(order[index])}`);
  if ($rule && $nextRule) {
    $nextRule.parentNode.insertBefore($nextRule, $rule);
  }

  // Update button states
  updateReorderButtons(language);

  // Re-run rules from the current position (which is now earlier)
  rerunFromPosition(language, index);
}

// Re-run rules starting from a specific position in a language
function rerunFromPosition(language, startIndex) {
  const order = orderState[language];
  if (startIndex >= order.length) return;

  // Get the input value for the first rule to re-run
  const firstRuleToRerun = order[startIndex];
  const $input = document.getElementById(`input-${firstRuleToRerun}`);

  if ($input && $input.value) {
    // Find what the next rule should be after the last rule in this language
    const allOrdered = getAllOrderedRuleKeys();
    const lastRuleInLanguage = order[order.length - 1];
    const lastIndex = allOrdered.indexOf(lastRuleInLanguage);
    const nextRuleAfterLanguage = allOrdered[lastIndex + 1];

    // Re-run the chain starting from this rule
    runRuleChain(firstRuleToRerun, $input.value, nextRuleAfterLanguage);
  }
}

// Run a chain of rules within a language, then continue to the next rule after
function runRuleChain(startRuleId, inputValue, nextRuleAfterChain, morphemes = null) {
  const language = getLanguage(startRuleId);
  const order = orderState[language];
  const startIndex = order.indexOf(startRuleId);

  let currentInput = inputValue;
  let currentMorphemes = morphemes;

  // Track sandhi aggregation within the chain
  let chainSandhiInput = null;
  let chainSandhiInputMorphemes = null;
  let chainAnySandhiTripped = false;

  // Run each rule in sequence within the language
  for (let i = startIndex; i < order.length; i++) {
    const ruleId = order[i];

    // Update the input field
    const $input = document.getElementById(`input-${ruleId}`);
    if ($input) {
      $input.value = currentInput;
    }

    // Run the rule and capture output for next iteration
    const rulesObj = getRulesObject(ruleId);
    const rule = rulesObj[ruleId];
    const options = getOptions(ruleId, rule);

    // Pass morphemes to rule via options (if available)
    const inputMorphemes = currentMorphemes; // Save for visual comparison
    if (currentMorphemes) {
      options.morphemes = currentMorphemes;
    }

    const isEnabled = isRuleEffectivelyEnabled(ruleId);
    const compoundsOnly = rule.isSandhi && getSandhiMasterRule() ? getOptions(SANDHI_MASTER_RULE_ID, getSandhiMasterRule()).compoundsOnly !== false : false;
    const sandhiCheck = shouldSkipSandhi(rule, currentInput, options, compoundsOnly);
    const result = !isEnabled ? { in: currentInput, out: currentInput }
      : sandhiCheck.skip ? sandhiCheck.result
      : rule.mechanic(currentInput, options);
    const output = result.out;

    // Get morphemes from result, or keep existing morphemes if not returned
    currentMorphemes = result.morphemes || currentMorphemes;

    // Update visual state
    const isTripped = result.in !== result.out;
    const resultsObj = getResultsObject(ruleId);
    if (isTripped) {
      resultsObj[ruleId] = result;
    } else {
      delete resultsObj[ruleId];
    }

    const $ruleElement = document.getElementById(`rule-${toBase36(ruleId)}`);
    if ($ruleElement) {
      $ruleElement.classList.toggle('rule-tripped', isTripped);
      const hasFocus = $ruleElement.contains(document.activeElement);
      if (isTripped || !hasFocus) {
        $ruleElement.classList.toggle('rule-collapsed', !isTripped);
      }
    }

    // Update output field with morpheme-aware rendering
    // Clear any stale boundary state if morpheme count changed
    if (morphemeBoundaryState[ruleId] && currentMorphemes) {
      const maxBoundary = currentMorphemes.length - 2;
      const staleBoundaries = [...morphemeBoundaryState[ruleId]].filter(i => i > maxBoundary);
      staleBoundaries.forEach(i => morphemeBoundaryState[ruleId].delete(i));
    }
    renderMorphemeOutput(ruleId, currentMorphemes, nextRuleInChain, inputMorphemes);

    // Track sandhi rule execution for master rule aggregation
    if (rule.isSandhi) {
      // First sandhi rule: capture input value
      if (ruleId === FIRST_SANDHI_RULE_ID) {
        chainSandhiInput = currentInput;
        chainSandhiInputMorphemes = currentMorphemes;
        chainAnySandhiTripped = false;
      }
      // Track if any sandhi rule tripped
      if (isTripped) {
        chainAnySandhiTripped = true;
      }
      // Last sandhi rule: update master rule's visual state and output
      if (ruleId === LAST_SANDHI_RULE_ID) {
        updateSandhiMasterRule(chainSandhiInput, output, chainSandhiInputMorphemes, currentMorphemes, chainAnySandhiTripped);
      }
    }

    currentInput = output;
  }

  // Continue to next rule after this language's chain
  if (nextRuleAfterChain) {
    const $nextInput = document.getElementById(`input-${nextRuleAfterChain}`);
    if ($nextInput) {
      $nextInput.value = currentInput;
    }
    runRule(nextRuleAfterChain, currentInput, getNextRule(nextRuleAfterChain), currentMorphemes);
  } else {
    // This was the last chain, update final output
    $originalOutput.value = currentInput;
    printResults();
  }
}

// =============================================================================
// Rule Utilities
// =============================================================================

const firstRuleId = allRuleKeys[0];

// Wrapper functions that use module-level state
function getResultsObject(ruleId) {
  const langId = getLanguage(ruleId);
  return langId ? stageResults[langId] : null;
}

function isRuleEffectivelyEnabled(ruleId) {
  return _isRuleEffectivelyEnabled(ruleId, ruleState, languageState);
}

function draw(type, parent, options = {}) {
  const $element = document.createElement(type);
  const { innerHtml = '', callback = { trigger: null, callback: null }, checked, ...otherOptions } = options;
  $element.innerHTML = innerHtml;
  Object.entries(otherOptions).forEach(([key, value]) => {
    $element.setAttribute(key, value);
  });
  // Handle 'checked' - set both property and attribute for CSS :checked to work
  if (checked === 'checked' || checked === true) {
    $element.checked = true;
    $element.setAttribute('checked', 'checked');
  } else if (checked === false) {
    $element.checked = false;
    $element.removeAttribute('checked');
  }
  if (callback.trigger && callback.callback) {
    $element.addEventListener(callback.trigger, callback.callback);
  }
  parent.appendChild($element);
  return $element;
}

// Create a language wrapper with header and skip checkbox
function createLanguageWrapper(langId, langName) {
  const isSkipped = languageState[langId] === false;
  const wrapperClass = isSkipped ? 'language-wrapper language-skipped' : 'language-wrapper';

  const $langWrapper = draw('div', $wrapper, {
    class: wrapperClass,
    id: `lang-${langId}`
  });

  const $header = draw('div', $langWrapper, { class: 'language-header' });
  draw('h2', $header, { innerHtml: langName });

  const $skipLabel = draw('label', $header);
  draw('input', $skipLabel, {
    type: 'checkbox',
    id: `skip-${langId}`,
    checked: !isSkipped,
    callback: {
      trigger: 'change',
      callback: (e) => toggleLanguage(langId, e.target.checked)
    }
  });
  draw('span', $skipLabel, { innerHtml: ' Enable all' });

  return $langWrapper;
}

// Create a conversion wrapper with header (no toggle - conversions always run)
function createConversionWrapper(sectionId, sectionName) {
  const $convWrapper = draw('div', $wrapper, {
    class: 'conversion-wrapper',
    id: `conv-${sectionId}`
  });

  const $header = draw('div', $convWrapper, { class: 'conversion-header' });
  draw('h3', $header, { innerHtml: sectionName });

  return $convWrapper;
}

// Update visual state of a rule based on effective enabled state
function updateRuleVisualState(ruleId) {
  const $rule = document.getElementById(`rule-${toBase36(ruleId)}`);
  const $toggle = document.getElementById(`toggle-${ruleId}`);
  const isEnabled = isRuleEffectivelyEnabled(ruleId);

  if ($rule) {
    $rule.classList.toggle('rule-enabled', isEnabled);
  }
  if ($toggle) {
    $toggle.checked = isEnabled;
  }
}

// Toggle an entire language on/off
function toggleLanguage(langId, isEnabled) {
  languageState[langId] = isEnabled;
  localStorage.setItem(storageKey('languages'), JSON.stringify(languageState));

  const $langWrapper = document.getElementById(`lang-${langId}`);
  if ($langWrapper) {
    $langWrapper.classList.toggle('language-skipped', !isEnabled);
  }

  // Clear results for this language (they will be repopulated on re-run if enabled)
  const stage = stageByLangId[langId];
  const ruleKeys = stage ? stage.ruleKeys : [];
  const resultsObj = stage ? stageResults[langId] : {};
  ruleKeys.forEach((ruleId) => {
    delete resultsObj[ruleId];
    updateRuleVisualState(ruleId);
  });

  // Re-run from the first rule to update the chain
  const storedInput = $originalInput.value;
  if (storedInput) {
    const $firstRuleInput = document.getElementById(`input-${firstRuleId}`);
    $firstRuleInput.value = storedInput;
    const secondRuleId = getNextRule(firstRuleId);
    runRule(firstRuleId, storedInput, secondRuleId);
  } else {
    // No input to re-run, but still update the results display
    printResults();
  }
}

// Re-run a rule from its current input value
function rerunRule(ruleId) {
  const $input = document.getElementById(`input-${ruleId}`);
  if ($input && $input.value) {
    const nextRuleId = getNextRule(ruleId);
    // Get morphemes from the previous rule (needed to preserve morpheme boundaries)
    const previousRuleId = getPreviousRule(ruleId);
    const morphemes = previousRuleId ? ruleMorphemes[previousRuleId] : null;
    runRule(ruleId, $input.value, nextRuleId, morphemes);
  }
}

function toggleRule(ruleId, isEnabled) {
  const rulesObj = getRulesObject(ruleId);
  const resultsObj = getResultsObject(ruleId);
  const rule = rulesObj[ruleId];
  const isDefaultSkipped = rule?.skip === true;

  // Save the rule's own state (regardless of language state)
  if (isDefaultSkipped && isEnabled) {
    // Enabling a default-skipped rule - save override
    ruleState[ruleId] = true;
  } else if (isDefaultSkipped && !isEnabled) {
    // Disabling a default-skipped rule - remove override (back to default)
    delete ruleState[ruleId];
  } else {
    // Normal rule - save state
    ruleState[ruleId] = isEnabled;
  }
  localStorage.setItem(storageKey('rules'), JSON.stringify(ruleState));

  // Update visual state based on effective enabled (considers language too)
  updateRuleVisualState(ruleId);

  // If this is the sandhi master switch, update all sandhi rules' visual states
  if (ruleId === SANDHI_MASTER_RULE_ID && sandhiStage) {
    sandhiStage.ruleKeys.forEach(sandhiRuleId => {
      const sandhiRule = sandhiStage.rules[sandhiRuleId];
      if (sandhiRule?.isSandhi) {
        updateRuleVisualState(sandhiRuleId);
      }
    });
  }

  const previousRuleId = getPreviousRule(ruleId);
  const nextRuleId = getNextRule(ruleId);

  const outputValue = previousRuleId
    ? getOutputValue(previousRuleId)
    : $originalInput.value;

  // Get morphemes from the previous rule (if any)
  const previousMorphemes = previousRuleId ? ruleMorphemes[previousRuleId] : null;

  // Check effective enabled state for execution
  const effectivelyEnabled = isRuleEffectivelyEnabled(ruleId);

  if (!effectivelyEnabled) {
    // Clear this rule's result since it's now disabled
    delete resultsObj[ruleId];

    // Pass input to next rule (skipping this one)
    if (outputValue && nextRuleId) {
      const $nextInput = document.getElementById(`input-${nextRuleId}`);
      $nextInput.value = outputValue;
      runRule(nextRuleId, outputValue, getNextRule(nextRuleId), previousMorphemes);
      return; // runRule will call printResults() at the end
    } else if (outputValue) {
      // This was the last rule - update output
      $originalOutput.value = outputValue;
    }
  } else {
    // Rule is enabled - re-run it using the previous rule's output
    if (outputValue) {
      // Update this rule's input field with the correct value from previous rule
      const $input = document.getElementById(`input-${ruleId}`);
      if ($input) {
        $input.value = outputValue;
      }
      runRule(ruleId, outputValue, nextRuleId, previousMorphemes);
      return; // runRule will call printResults() at the end
    }
  }

  // Always update the skipped results display
  printResults();
}

function drawRule(ruleId, nextRuleId, $parentContainer) {
  const rulesObj = getRulesObject(ruleId);
  const rule = rulesObj[ruleId];
  const isConversion = isConversionRule(ruleId);
  const isEffectivelyEnabled = isRuleEffectivelyEnabled(ruleId);
  const hasOptions = rule.hasOwnProperty('input');
  const isSandhi = rule.isSandhi === true;
  // Start collapsed if enabled (will expand when tripped), but keep conversion rules expanded
  const startCollapsed = isEffectivelyEnabled && !isConversion;
  let ruleClass = isEffectivelyEnabled ? 'rule rule-enabled' : 'rule';
  if (startCollapsed) ruleClass += ' rule-collapsed';
  if (hasOptions) ruleClass += ' rule-has-options';
  if (isSandhi) ruleClass += ' rule-sandhi';
  const $rule = draw('div', $parentContainer, { class: ruleClass, id: `rule-${toBase36(ruleId)}` });

  // Header row: expand arrow + checkbox + order-id + pattern + description (inline when collapsed)
  const $headerRow = draw('div', $rule, { class: 'rule-header' });

  // Expand/collapse arrow
  draw('span', $headerRow, {
    class: 'rule-expand',
    innerHtml: '▶',
    callback: {
      trigger: 'click',
      callback: () => $rule.classList.toggle('rule-collapsed')
    }
  });

  // Checkbox (non-conversion rules only)
  if (!isConversion) {
    draw('input', $headerRow, {
      id: `toggle-${ruleId}`,
      type: 'checkbox',
      checked: isEffectivelyEnabled ? 'checked' : '',
      class: 'rule-toggle',
      callback: {
        trigger: 'change',
        callback: (e) => toggleRule(ruleId, e.target.checked)
      }
    });
  }

  // For sandhi rules, prepend the master rule's orderId
  let displayOrderId = rule.orderId;
  if (isSandhi) {
    const masterRule = getRulesObject(SANDHI_MASTER_RULE_ID)[SANDHI_MASTER_RULE_ID];
    displayOrderId = `${masterRule.orderId}.${rule.orderId}`;
  }
  draw('span', $headerRow, { class: 'rule-order-id', innerHtml: displayOrderId });
  draw('span', $headerRow, { class: 'rule-pattern', innerHtml: rule.pattern });
  // Options indicator (shown when collapsed and has options)
  if (hasOptions) {
    draw('span', $headerRow, { class: 'rule-options-icon', innerHtml: '⚙', title: 'This rule has configurable options' });
  }
  // Inline description (shown when collapsed)
  draw('span', $headerRow, { class: 'rule-description-inline', innerHtml: rule.description });

  // Source + Rule ID + Reorder buttons (top right)
  if (!isConversion) {
    const $rightGroup = draw('span', $rule, { class: 'rule-right' });

    // Reorder buttons - check position in language order
    const language = getLanguage(ruleId);
    const order = orderState[language] || [];
    const index = order.indexOf(ruleId);
    const isFirst = index === 0;
    const isLast = index === order.length - 1;

    const $reorderBtns = draw('span', $rightGroup, { class: 'rule-reorder' });
    const $upBtn = draw('button', $reorderBtns, {
      id: `move-up-${ruleId}`,
      class: 'rule-move-up',
      innerHtml: '↑',
      title: 'Move rule earlier',
      callback: {
        trigger: 'click',
        callback: () => moveRuleUp(ruleId)
      }
    });
    $upBtn.disabled = isFirst;

    const $downBtn = draw('button', $reorderBtns, {
      id: `move-down-${ruleId}`,
      class: 'rule-move-down',
      innerHtml: '↓',
      title: 'Move rule later',
      callback: {
        trigger: 'click',
        callback: () => moveRuleDown(ruleId)
      }
    });
    $downBtn.disabled = isLast;

    if (rule.url) {
      draw('a', $rightGroup, { class: 'rule-source', innerHtml: '🔗', href: rule.url, target: '_blank', title: 'Source' });
    }
    // Display Base-36 ID with decimal shown on hover
    const b36Id = toBase36(ruleId);
    draw('span', $rightGroup, { class: 'rule-id', innerHtml: b36Id, title: `Eldamo ID: ${ruleId}` });
  }

  // Description (below pattern, shown when expanded)
  draw('div', $rule, { class: 'rule-description', innerHtml: rule.description });
  if (rule.hasOwnProperty('info')) {
    rule.info.forEach((info) => {
      draw('div', $rule, { class: 'rule-info', innerHtml: info });
    });
  }

  if (rule.hasOwnProperty('input')) {
    // Use multi-column layout if there are many boolean inputs
    const booleanCount = rule.input.filter(i => i.type === 'boolean').length;
    const optionsClass = booleanCount > 5 ? 'rule-options rule-options-columns' : 'rule-options';
    const $inputRules = draw('div', $rule, { class: optionsClass });
    rule.input.forEach((input) => {
      // { name: 'guess', label: 'Guess', type: 'boolean', default: true, description: 'Whether to guess boundary if no marker' },
      // { name: 'boundaryChar', label: 'Boundary', type: 'string', default: '-', description: 'The morpheme boundary marker' },
      const inputType = input.type === 'boolean' ? 'checkbox' : 'text';
      const label = input.label || input.name;
      const description = input.description || label;
      const optionKey = `${ruleId}-${input.name}`;
      const savedValue = optionState[optionKey];
      const inputAttrs = {
        type: inputType,
        id: `input-${ruleId}-${input.name}`,
        placeholder: description,
        title: description,
        callback: {
          trigger: 'change',
          callback: (e) => {
            // Save option value to localStorage
            if (inputType === 'checkbox') {
              optionState[optionKey] = e.target.checked;
            } else {
              optionState[optionKey] = e.target.value;
            }
            localStorage.setItem(storageKey('options'), JSON.stringify(optionState));
            rerunRule(ruleId);
          },
        },
      };
      if (inputType === 'checkbox') {
        // Use saved value if exists, otherwise use default
        const isChecked = savedValue !== undefined ? savedValue : input.default;
        if (isChecked) {
          inputAttrs.checked = 'checked';
        }
      } else {
        // Use saved value if exists, otherwise use default
        inputAttrs.value = savedValue !== undefined ? savedValue : (input.default || '');
      }
      const $optWrapper = draw('div', $inputRules, { class: 'rule-option' });
      if (inputType === 'checkbox') {
        draw('input', $optWrapper, inputAttrs);
        draw('label', $optWrapper, { for: `input-${ruleId}-${input.name}`, innerHtml: label, title: description });
      } else {
        draw('label', $optWrapper, { for: `input-${ruleId}-${input.name}`, innerHtml: label + ':', title: description });
        draw('input', $optWrapper, inputAttrs);
      }
    });
  }

  if (rule.hasOwnProperty('dependsOn')) {
    const $dependencies = draw('div', $rule, { class: 'rule-dependencies' });
    rule.dependsOn.forEach((dependency) => {
      // Create a checkbox for each dependency param that can be overridden
      const checkboxId = `dep-${ruleId}-${dependency.param}`;
      const depRuleB36 = toBase36(dependency.rule);
      draw('input', $dependencies, {
        type: 'checkbox',
        id: checkboxId,
        'data-rule': dependency.rule,
        'data-param': dependency.param,
        callback: {
          trigger: 'change',
          callback: () => rerunRule(ruleId),
        },
      });
      // Create label with clickable rule link
      const $label = draw('label', $dependencies, {
        for: checkboxId,
        innerHtml: `${dependency.param} (from <a href="#rule-${depRuleB36}" class="dep-rule-link">${depRuleB36}</a>)`,
      });
      // Prevent checkbox toggle when clicking the link, and scroll to the rule
      const $link = $label.querySelector('.dep-rule-link');
      if ($link) {
        $link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const $targetRule = document.getElementById(`rule-${depRuleB36}`);
          if ($targetRule) {
            $targetRule.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Briefly highlight the target rule
            $targetRule.classList.add('rule-highlighted');
            setTimeout(() => $targetRule.classList.remove('rule-highlighted'), 2000);
          }
        });
      }
    });
  }

  const $inputWrapper = draw('div', $rule, { class: 'rule-inputs' });

  draw('label', $inputWrapper, { for: `input-${ruleId}`, innerHtml: 'In:' });
  draw('input', $inputWrapper, {
    type: 'text',
    id: `input-${ruleId}`,
    placeholder: 'Input',
    callback: {
      trigger: 'input',
      callback: (e) => runRule(ruleId, e.target.value, nextRuleId),
    },
  });

  draw('label', $inputWrapper, { for: `output-${ruleId}`, innerHtml: 'Out:' });
  // Output input field (copyable)
  draw('input', $inputWrapper, {
    type: 'text',
    id: `output-${ruleId}`,
    placeholder: 'Output',
    readonly: 'readonly',
  });
  // Morpheme boundary display (to the right of output)
  draw('span', $inputWrapper, {
    className: 'morpheme-output',
    id: `morphemes-${ruleId}`,
  });

}

/**
 * Get the output value from a rule's output field.
 * @param {string} ruleId - The rule ID
 * @returns {string} The output value
 */
function getOutputValue(ruleId) {
  const $output = document.getElementById(`output-${ruleId}`);
  return $output ? $output.value : '';
}

/**
 * Render morphemes with clickable boundaries into an output container.
 * Also updates the output input field with the plain text value.
 * Shows visual cues when morpheme boundaries were removed by the rule transformation.
 * @param {string} ruleId - The rule ID
 * @param {string[]} morphemes - Array of morpheme strings (output morphemes)
 * @param {string|null} nextRuleId - ID of the next rule in the chain (for re-running)
 * @param {string[]|null} inputMorphemes - Array of input morphemes (to detect rule-removed boundaries)
 */
function renderMorphemeOutput(ruleId, morphemes, nextRuleId, inputMorphemes = null) {
  const $output = document.getElementById(`output-${ruleId}`);
  const $morphemes = document.getElementById(`morphemes-${ruleId}`);

  // Update the output input field with plain text
  const outputText = morphemes ? morphemes.join('') : '';
  if ($output) {
    $output.value = outputText;
  }

  // If no morphemes container or single/no morpheme, hide the morpheme display
  if (!$morphemes) return;
  $morphemes.innerHTML = '';

  // Check if the rule reduced the number of morphemes (removed boundaries)
  const inputCount = inputMorphemes ? inputMorphemes.length : 0;
  const outputCount = morphemes ? morphemes.length : 0;
  const boundariesRemoved = inputCount > outputCount;

  if (!morphemes || morphemes.length <= 1) {
    // If boundaries were removed by the rule, show a visual indicator
    if (boundariesRemoved && inputCount > 1) {
      $morphemes.style.display = '';
      const $indicator = document.createElement('span');
      $indicator.className = 'morpheme-boundary-removed';
      $indicator.textContent = `(${inputCount - 1} boundary${inputCount > 2 ? 'ies' : ''} merged by rule)`;
      $indicator.title = `Input had ${inputCount} morphemes, output has ${outputCount}`;
      $morphemes.appendChild($indicator);
    } else {
      // Hide morpheme display for single morpheme (no boundaries to show)
      $morphemes.style.display = 'none';
    }
    return;
  }

  // Show morpheme display
  $morphemes.style.display = '';

  // Get or initialize boundary state for this rule
  if (!morphemeBoundaryState[ruleId]) {
    morphemeBoundaryState[ruleId] = new Set();
  }
  const mergedBoundaries = morphemeBoundaryState[ruleId];

  // Show indicator if some (but not all) boundaries were removed
  if (boundariesRemoved) {
    const removedCount = inputCount - outputCount;
    const $indicator = document.createElement('span');
    $indicator.className = 'morpheme-boundary-removed';
    $indicator.textContent = `(-${removedCount})`;
    $indicator.title = `${removedCount} boundary${removedCount > 1 ? 'ies' : ''} merged by rule`;
    $morphemes.appendChild($indicator);
  }

  // Render each morpheme with boundaries between them
  for (let i = 0; i < morphemes.length; i++) {
    // Add morpheme text
    const $segment = document.createElement('span');
    $segment.className = 'morpheme-segment';
    $segment.textContent = morphemes[i];
    $morphemes.appendChild($segment);

    // Add boundary button (except after last morpheme)
    if (i < morphemes.length - 1) {
      const $boundary = document.createElement('span');
      $boundary.className = 'morpheme-boundary';
      const isMerged = mergedBoundaries.has(i);
      if (isMerged) {
        $boundary.classList.add('merged');
        $boundary.textContent = '·';
        $boundary.title = 'Click to split morphemes';
      } else {
        $boundary.textContent = '+';
        $boundary.title = 'Click to merge morphemes';
      }

      // Click handler to toggle boundary
      const boundaryIndex = i;
      $boundary.addEventListener('click', () => {
        toggleMorphemeBoundary(ruleId, boundaryIndex, nextRuleId);
      });

      $morphemes.appendChild($boundary);
    }
  }
}

/**
 * Save morpheme boundary state to localStorage.
 * Converts Sets to arrays for JSON serialization.
 */
function saveMorphemeBoundaryState() {
  const toStore = {};
  for (const [ruleId, indices] of Object.entries(morphemeBoundaryState)) {
    if (indices.size > 0) {
      toStore[ruleId] = [...indices];
    }
  }
  localStorage.setItem(storageKey('morpheme-boundaries'), JSON.stringify(toStore));
}

/**
 * Toggle a morpheme boundary between split (+) and merged (·).
 * When toggled, re-run the pipeline from this rule with updated morphemes.
 * @param {string} ruleId - The rule ID
 * @param {number} boundaryIndex - Index of the boundary to toggle
 * @param {string|null} nextRuleId - ID of the next rule in the chain
 */
function toggleMorphemeBoundary(ruleId, boundaryIndex, nextRuleId) {
  // Initialize if needed
  if (!morphemeBoundaryState[ruleId]) {
    morphemeBoundaryState[ruleId] = new Set();
  }

  const mergedBoundaries = morphemeBoundaryState[ruleId];

  // Toggle the boundary
  if (mergedBoundaries.has(boundaryIndex)) {
    mergedBoundaries.delete(boundaryIndex);
  } else {
    mergedBoundaries.add(boundaryIndex);
  }

  // Clean up empty sets
  if (mergedBoundaries.size === 0) {
    delete morphemeBoundaryState[ruleId];
  }

  // Persist to localStorage
  saveMorphemeBoundaryState();

  // Get current morphemes for this rule
  const currentMorphemes = ruleMorphemes[ruleId];
  if (!currentMorphemes || currentMorphemes.length <= 1) return;

  // Apply merges to get effective morphemes for next rule
  const effectiveMorphemes = applyMorphemeMerges(currentMorphemes, mergedBoundaries);

  // Re-render this rule's output with updated boundary states
  renderMorphemeOutput(ruleId, currentMorphemes, nextRuleId);

  // Run the next rule with merged morphemes
  if (nextRuleId) {
    const outputValue = getOutputValue(ruleId);
    runRule(nextRuleId, outputValue, getNextRule(nextRuleId), effectiveMorphemes);
  }
}

/**
 * Apply merged boundaries to get effective morphemes.
 * @param {string[]} morphemes - Original morphemes
 * @param {Set<number>} mergedBoundaries - Set of merged boundary indices
 * @returns {string[]} - Effective morphemes after merging
 */
function applyMorphemeMerges(morphemes, mergedBoundaries) {
  if (!morphemes || morphemes.length <= 1 || mergedBoundaries.size === 0) {
    return morphemes;
  }

  const result = [];
  let current = morphemes[0];

  for (let i = 1; i < morphemes.length; i++) {
    if (mergedBoundaries.has(i - 1)) {
      // Merge with previous
      current += morphemes[i];
    } else {
      // Start new morpheme
      result.push(current);
      current = morphemes[i];
    }
  }
  result.push(current);

  return result;
}

// Get language acronym for logging
function getLanguageAcronym(ruleId) {
  const lang = getLanguage(ruleId);
  const stage = stageByLangId[lang];
  return stage ? stage.acronym.padStart(2) : '??';
}

function runRule(ruleId, input, nextRuleId, morphemes = null) {
  const rulesObj = getRulesObject(ruleId);
  const resultsObj = getResultsObject(ruleId);
  const rule = rulesObj[ruleId];

  // Skip if rule is not effectively enabled (language disabled OR rule disabled)
  if (!isRuleEffectivelyEnabled(ruleId)) {
    console.log('Rule', getLanguageAcronym(ruleId), rule.orderId, String(ruleId).padStart(10, ' '), 'in:', input.padStart(10, '.'), 'out:', 'N/A'.padEnd(10, ' '), 'next:', String(nextRuleId).padStart(10, ' '), 'enabled:', isRuleEffectivelyEnabled(ruleId));
    // Clear tripped state when rule is skipped
    const $ruleElement = document.getElementById(`rule-${toBase36(ruleId)}`);
    if ($ruleElement) {
      $ruleElement.classList.remove('rule-tripped');
    }
    // Store morphemes even for skipped rules (needed when toggling rules mid-chain)
    ruleMorphemes[ruleId] = morphemes;

    // Track sandhi rule skipping for master rule aggregation
    if (rule.isSandhi) {
      // First sandhi rule: capture input value
      if (ruleId === FIRST_SANDHI_RULE_ID) {
        sandhiInputValue = input;
        sandhiInputMorphemes = morphemes;
        anySandhiTripped = false;
      }
      // Last sandhi rule: update master rule (no rules tripped since all skipped)
      if (ruleId === LAST_SANDHI_RULE_ID) {
        updateSandhiMasterRule(sandhiInputValue, input, sandhiInputMorphemes, morphemes, anySandhiTripped);
      }
    }

    if (nextRuleId) {
      const $nextInput = document.getElementById(`input-${nextRuleId}`);
      $nextInput.value = input;
      // Pass morphemes unchanged when skipping
      runRule(nextRuleId, input, getNextRule(nextRuleId), morphemes);
    } else {
      $originalOutput.value = input;
      printResults();
    }
    return;
  }

  // Collect extra parameters from input fields
  const options = {};
  if (rule.input) {
    rule.input.forEach((inputDef) => {
      const $input = document.getElementById(`input-${ruleId}-${inputDef.name}`);
      if ($input) {
        options[inputDef.name] = inputDef.type === 'boolean'
          ? $input.checked
          : ($input.value || inputDef.default);
      }
    });
  }

  // Collect dependency overrides
  if (rule.dependsOn) {
    rule.dependsOn.forEach((dependency) => {
      const $checkbox = document.getElementById(`dep-${ruleId}-${dependency.param}`);
      if ($checkbox) {
        options[dependency.param] = $checkbox.checked;
      }
    });
  }

  // Pass morphemes to rule via options (if available)
  if (morphemes) {
    options.morphemes = morphemes;
  }

  const isEnabled = isRuleEffectivelyEnabled(ruleId);
  const compoundsOnly = rule.isSandhi && getSandhiMasterRule() ? getOptions(SANDHI_MASTER_RULE_ID, getSandhiMasterRule()).compoundsOnly !== false : false;
  const sandhiCheck = shouldSkipSandhi(rule, input, options, compoundsOnly);
  const result = !isEnabled ? { in: input, out: input }
    : sandhiCheck.skip ? sandhiCheck.result
    : rule.mechanic(input, options);
  const output = result.out;

  // Get morphemes from result, or keep existing morphemes if not returned
  const outputMorphemes = result.morphemes || morphemes;

  // Store input and output morphemes for this rule
  ruleInputMorphemes[ruleId] = morphemes;
  ruleMorphemes[ruleId] = outputMorphemes;

  console.log('Rule', getLanguageAcronym(ruleId), rule.orderId, String(ruleId).padStart(10, ' '), 'in:', result.in.padStart(10, '.'), 'out:', output.padStart(10, '.'), 'next:', String(nextRuleId).padStart(10, ' '), 'enabled:', isRuleEffectivelyEnabled(ruleId), 'morphemes:', outputMorphemes);

  // Track rule result (skip for conversion rules - they don't appear in tripped/skipped)
  const isTripped = result.in !== result.out;
  if (resultsObj) {
    if (isTripped) {
      resultsObj[ruleId] = result;
    } else {
      delete resultsObj[ruleId];
    }
  }

  // Update tripped visual state and auto-expand if tripped
  const $ruleElement = document.getElementById(`rule-${toBase36(ruleId)}`);
  if ($ruleElement) {
    $ruleElement.classList.toggle('rule-tripped', isTripped);
    // Auto-expand when tripped, but don't collapse if user is interacting with this rule
    const hasFocus = $ruleElement.contains(document.activeElement);
    if (isTripped || !hasFocus) {
      $ruleElement.classList.toggle('rule-collapsed', !isTripped);
    }
  }

  // Auto-update dependency checkboxes that depend on this rule
  document.querySelectorAll(`input[data-rule="${ruleId}"]`).forEach(($depCheckbox) => {
    $depCheckbox.checked = isTripped;
  });

  // Update output field with morpheme-aware rendering
  // Clear any stale boundary state if morpheme count changed
  if (morphemeBoundaryState[ruleId] && outputMorphemes) {
    const maxBoundary = outputMorphemes.length - 2;
    const staleBoundaries = [...morphemeBoundaryState[ruleId]].filter(i => i > maxBoundary);
    staleBoundaries.forEach(i => morphemeBoundaryState[ruleId].delete(i));
  }
  renderMorphemeOutput(ruleId, outputMorphemes, nextRuleId, morphemes);

  // Track sandhi rule execution for master rule aggregation
  if (rule.isSandhi) {
    // First sandhi rule: capture input value
    if (ruleId === FIRST_SANDHI_RULE_ID) {
      sandhiInputValue = input;
      sandhiInputMorphemes = morphemes;
      anySandhiTripped = false;
    }
    // Track if any sandhi rule tripped
    if (isTripped) {
      anySandhiTripped = true;
    }
    // Last sandhi rule: update master rule's visual state and output
    if (ruleId === LAST_SANDHI_RULE_ID) {
      updateSandhiMasterRule(sandhiInputValue, output, sandhiInputMorphemes, outputMorphemes, anySandhiTripped);
    }
  }

  // Continue to next rule or finish
  if (!nextRuleId) {
    $originalOutput.value = output;
    printResults();
    return;
  }

  // Apply any merged boundaries before passing to next rule
  const mergedBoundaries = morphemeBoundaryState[ruleId];
  const effectiveMorphemes = mergedBoundaries && mergedBoundaries.size > 0
    ? applyMorphemeMerges(outputMorphemes, mergedBoundaries)
    : outputMorphemes;

  const $nextInput = document.getElementById(`input-${nextRuleId}`);
  $nextInput.value = output;
  runRule(nextRuleId, output, getNextRule(nextRuleId), effectiveMorphemes);
}

/**
 * Update the sandhi master rule's visual state and input/output fields
 * based on the aggregated results of all sandhi sub-rules.
 */
function updateSandhiMasterRule(inputValue, outputValue, inputMorphemes, outputMorphemes, anyTripped) {
  const masterRuleId = SANDHI_MASTER_RULE_ID;
  const $masterRule = document.getElementById(`rule-${toBase36(masterRuleId)}`);
  const $masterInput = document.getElementById(`input-${masterRuleId}`);
  const $masterOutput = document.getElementById(`output-${masterRuleId}`);

  // Update input/output fields
  if ($masterInput) {
    $masterInput.value = inputValue || '';
  }
  // Master rule output uses morpheme rendering too
  // Get next rule after master for click handling
  const nextRuleId = getNextRule(masterRuleId);
  renderMorphemeOutput(masterRuleId, outputMorphemes, nextRuleId, inputMorphemes);

  // Update visual state
  if ($masterRule) {
    $masterRule.classList.toggle('rule-tripped', anyTripped);
    // Auto-expand when tripped, but don't collapse if user is interacting with this rule
    const hasFocus = $masterRule.contains(document.activeElement);
    if (anyTripped || !hasFocus) {
      $masterRule.classList.toggle('rule-collapsed', !anyTripped);
    }
  }

  // Track result for the master rule
  const resultsObj = getResultsObject(masterRuleId);
  if (resultsObj) {
    if (anyTripped) {
      resultsObj[masterRuleId] = {
        in: inputValue,
        out: outputValue,
        morphemes: outputMorphemes
      };
    } else {
      delete resultsObj[masterRuleId];
    }
  }

  // Store morphemes for master rule
  ruleMorphemes[masterRuleId] = outputMorphemes;
}

function resetRule(ruleId) {
  const $input = document.getElementById(`input-${ruleId}`);
  const $output = document.getElementById(`output-${ruleId}`);
  const $morphemes = document.getElementById(`morphemes-${ruleId}`);
  $input.value = "";
  if ($output) {
    $output.value = "";
  }
  if ($morphemes) {
    $morphemes.innerHTML = '';
    $morphemes.style.display = 'none';
  }

  // Clear morpheme boundary state for this rule
  delete morphemeBoundaryState[ruleId];

  // Clear tripped visual state
  const $rule = document.getElementById(`rule-${toBase36(ruleId)}`);
  if ($rule) {
    $rule.classList.remove('rule-tripped');
    // Collapse the rule since it's no longer tripped
    if ($rule.classList.contains('rule-enabled')) {
      $rule.classList.add('rule-collapsed');
    }
  }
}

function resetAllRules() {
  allRuleKeys.forEach((k) => {
    resetRule(k);
  });
  // Persist cleared boundary state
  saveMorphemeBoundaryState();
}

function softResetPage() {
  resetAllRules();
  $originalOutput.value = "";
  $resultsTripped.innerHTML = "";
  $resultsSkipped.innerHTML = "";
}

// =============================================================================
// Results Display
// =============================================================================

function printResults() {
  // Build tripped results from pipeline stages
  let trippedHtml = '';
  PIPELINE.forEach(stage => {
    const tripped = formatTripped(stage.rules, stageResults[stage.id]);
    if (tripped) {
      trippedHtml += `<strong>${stage.name}:</strong>\n` + tripped + '\n\n';
    }
  });
  $resultsTripped.innerHTML = trippedHtml.trim();

  // Build skipped results from pipeline stages
  let skippedHtml = '';
  PIPELINE.forEach(stage => {
    const skipped = formatSkipped(stage.rules, stage.ruleKeys, ruleState);
    if (skipped) {
      skippedHtml += `<strong>${stage.name}:</strong>\n` + skipped + '\n\n';
    }
  });
  $resultsSkipped.innerHTML = skippedHtml.trim();

  // Update sticky header height since results may have changed the top-wrapper size
  document.documentElement.style.setProperty('--sticky-h', $topWrapper.offsetHeight + 'px');
}

/**
 * Build a markdown evolution chain from the tripped results.
 * Format: input [>](url) step1 [>](url) step2 ... finalResult
 */
function buildEvolutionChain() {
  const steps = [];

  PIPELINE.forEach(stage => {
    const resultsObj = stageResults[stage.id];
    // Sort tripped rules by orderId
    const trippedIds = Object.keys(resultsObj).sort((a, b) => {
      return stage.rules[a].orderId.localeCompare(stage.rules[b].orderId);
    });

    for (const ruleId of trippedIds) {
      const result = resultsObj[ruleId];
      const rule = stage.rules[ruleId];
      steps.push({
        input: singleToPhonetic(result.in),
        output: singleToPhonetic(result.out),
        url: rule.experimental ? null : rule.url || null,
      });
    }
  });

  if (steps.length === 0) return '';

  // Build the chain: input [>](url) output [>](url) output ...
  const parts = [steps[0].input];
  for (const step of steps) {
    const arrow = step.url ? `[>](${step.url})` : '>';
    parts.push(arrow);
    parts.push(step.output);
  }

  return parts.join(' ');
}

// Handle copy chain button
$copyChainButton.addEventListener('click', async () => {
  const chain = buildEvolutionChain();
  if (!chain) return;

  try {
    await navigator.clipboard.writeText(chain);
    const original = $copyChainButton.textContent;
    $copyChainButton.textContent = '✓';
    setTimeout(() => { $copyChainButton.textContent = original; }, 2000);
  } catch (err) {
    console.error('Failed to copy chain:', err);
  }
});

// =============================================================================
// Event Handlers
// =============================================================================

// Handle input changes - save to storage, update URL, and run rules
$originalInput.addEventListener('input', (e) => {
  const inputValue = e.target.value;

  localStorage.setItem(storageKey('original-input'), inputValue);
  updateUrlWithInput(inputValue);

  // Clear all morpheme boundary states when input changes
  // User's manual merges are no longer relevant to the new input
  for (const ruleId of Object.keys(morphemeBoundaryState)) {
    delete morphemeBoundaryState[ruleId];
  }
  saveMorphemeBoundaryState();

  if (inputValue === '') {
    softResetPage();
    return;
  }

  const $firstRuleInput = document.getElementById(`input-${firstRuleId}`);
  $firstRuleInput.value = inputValue;

  const secondRuleId = getNextRule(firstRuleId);
  runRule(firstRuleId, inputValue, secondRuleId);
});

// Toggle special character helpers visibility
$toggleHelpers.addEventListener('click', () => {
  $helpers.classList.toggle('hidden');
  $toggleHelpers.title = $helpers.classList.contains('hidden')
    ? 'Show special characters'
    : 'Hide special characters';
});

// Handle helper character insertion
$helpers.addEventListener('click', (e) => {
  const char = e.target.innerHTML;
  const start = $originalInput.selectionStart;
  const end = $originalInput.selectionEnd;
  const value = $originalInput.value;

  $originalInput.value = value.slice(0, start) + char + value.slice(end);

  // Move cursor to after the inserted character
  const newPos = start + char.length;
  $originalInput.setSelectionRange(newPos, newPos);
  $originalInput.dispatchEvent(new Event('input'));
  $originalInput.focus();
});

// Handle share URL button - generates a shareable URL with current state
$shareUrlButton.addEventListener('click', async () => {
  const input = $originalInput.value;

  // Build disabled/enabled rules sets
  const disabledRules = new Set();
  const enabledRules = new Set(); // Rules with skip:true that user explicitly enabled
  const disabledLanguages = new Set();

  // Check language states
  allLanguageIds.forEach(langId => {
    if (languageState[langId] === false) {
      disabledLanguages.add(langId);
    }
  });

  // Get all rule IDs
  const allRuleIds = PIPELINE.flatMap(stage => Object.keys(stage.rules));

  // Check each rule's state
  allRuleIds.forEach(ruleId => {
    const rulesObj = getRulesObject(ruleId);
    const rule = rulesObj ? rulesObj[ruleId] : null;
    const isDefaultEnabled = !rule.skip;
    const currentState = ruleState[ruleId];

    // Determine current enabled state
    const isEnabled = currentState !== undefined ? currentState : isDefaultEnabled;

    if (!isEnabled) {
      // Rule is disabled
      disabledRules.add(ruleId);
    } else if (rule.skip && currentState === true) {
      // Rule has skip:true but user explicitly enabled it
      enabledRules.add(ruleId);
    }
  });

  // Collect current rule input values (non-default only)
  const ruleInputs = {};
  allRuleIds.forEach(ruleId => {
    const rulesObj = getRulesObject(ruleId);
    const rule = rulesObj ? rulesObj[ruleId] : null;
    if (rule && rule.input) {
      const inputs = {};
      rule.input.forEach(inputDef => {
        const $input = document.getElementById(`input-${ruleId}-${inputDef.name}`);
        if ($input) {
          const value = inputDef.type === 'boolean' ? $input.checked : $input.value;
          inputs[inputDef.name] = value;
        }
      });
      if (Object.keys(inputs).length > 0) {
        ruleInputs[ruleId] = inputs;
      }
    }
  });

  // Build the URL
  const url = new URL(window.location.href);
  url.search = ''; // Clear existing params

  // Add share mode flag
  url.searchParams.set('s', '');

  // Add input if present
  if (input) {
    const encodedInput = encodeQueryString(input);
    url.searchParams.set('i', encodedInput);
  }

  // Add disabled rules/languages if any
  const offParam = encodeDisabledParam(disabledRules, disabledLanguages, allRuleIds);
  if (offParam) {
    url.searchParams.set('off', offParam);
  }

  // Add enabled rules (skip:true rules that user enabled) if any
  const onParam = encodeEnabledParam(enabledRules);
  if (onParam) {
    url.searchParams.set('on', onParam);
  }

  // Add rule inputs if any differ from defaults
  const riParam = encodeRuleInputs(ruleInputs, allRulesMap);
  if (riParam) {
    url.searchParams.set('ri', riParam);
  }

  // Add morpheme boundary states if any are merged
  const mbParam = encodeMorphemeBoundaries(morphemeBoundaryState);
  if (mbParam) {
    url.searchParams.set('mb', mbParam);
  }

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(url.toString());
    // Visual feedback
    const originalTitle = $shareUrlButton.title;
    $shareUrlButton.title = 'Copied!';
    $shareUrlButton.textContent = '✓';
    setTimeout(() => {
      $shareUrlButton.title = originalTitle;
      $shareUrlButton.textContent = '🔗';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy URL:', err);
    // Fallback: show the URL in an alert
    alert('Share URL:\n' + url.toString());
  }
});

// Handle reset order button (only resets rule order)
$resetOrderButton.addEventListener('click', () => {
  localStorage.removeItem(storageKey('order'));
  location.reload();
});

// Handle reset button (resets everything)
$resetButton.addEventListener('click', () => {
  localStorage.removeItem(storageKey('rules'));
  localStorage.removeItem(storageKey('languages'));
  localStorage.removeItem(storageKey('options'));
  localStorage.removeItem(storageKey('order'));
  localStorage.removeItem(storageKey('original-input'));
  location.reload();
});

// Smooth scroll animation helper
function smoothScrollTo(targetY, duration = 400) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime = null;

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    // Ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    window.scrollTo(0, startY + diff * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// Handle scroll to top link - seamless without page reload
document.getElementById('scroll-top').addEventListener('click', (e) => {
  e.preventDefault();
  smoothScrollTo(0);
  // Remove hash from URL without reload
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
});

// Handle smooth scroll for rule anchor links in results area
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#rule-"]');
  if (!anchor) return;

  e.preventDefault();
  const targetId = anchor.getAttribute('href').slice(1); // Remove leading #
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    const stickyHeight = $topWrapper.offsetHeight + 20;
    const targetY = targetElement.getBoundingClientRect().top + window.scrollY - stickyHeight;
    smoothScrollTo(targetY);
    // Update URL hash without triggering scroll
    history.replaceState(null, '', '#' + targetId);
  }
});

// Toggle mobile results drawer
const openDrawer = () => {
  $sideWrapper.classList.add('drawer-open');
  $drawerOverlay.classList.add('visible');
};

const closeDrawer = () => {
  $sideWrapper.classList.remove('drawer-open');
  $drawerOverlay.classList.remove('visible');
};

$toggleResults.addEventListener('click', () => {
  if ($sideWrapper.classList.contains('drawer-open')) {
    closeDrawer();
  } else {
    openDrawer();
  }
});

$drawerOverlay.addEventListener('click', closeDrawer);

$openNotes.addEventListener('click', (e) => {
  e.preventDefault();
  $notes.style.display = 'block';
});

$closeNotes.addEventListener('click', (e) => {
  e.preventDefault();
  $notes.style.display = 'none';
});

// =============================================================================
// Initialization
// =============================================================================

// Set sticky header height CSS variable for scroll-margin-top
document.documentElement.style.setProperty('--sticky-h', $topWrapper.offsetHeight + 'px');

// Helper to calculate the next rule ID for a given index in ordered keys
function getNextRuleIdAtIndex(orderedKeys, index) {
  return orderedKeys[index + 1];
}

// Create conversion and language wrappers in execution order
const allOrderedKeys = getAllOrderedRuleKeys();

// 1. Pre-processing conversions
if (preProcessingRuleKeys.length > 0) {
  const $preWrapper = createConversionWrapper('pre-processing', 'Pre-processing');
  preProcessingRuleKeys.forEach((ruleId) => {
    const globalIndex = allOrderedKeys.indexOf(ruleId);
    const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
    drawRule(ruleId, nextRuleId, $preWrapper);
  });
}

// 2. Language stages (from pipeline)
PIPELINE.forEach((stage, i) => {
  // Insert inter-language conversions before the last stage
  if (i === PIPELINE.length - 1 && interLanguageRuleKeys.length > 0) {
    const prevStage = PIPELINE[i - 1];
    const $interWrapper = createConversionWrapper('inter-language', `${prevStage.name} → ${stage.name} Transition`);
    interLanguageRuleKeys.forEach((ruleId) => {
      const globalIndex = allOrderedKeys.indexOf(ruleId);
      const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
      drawRule(ruleId, nextRuleId, $interWrapper);
    });
  }

  const $stageWrapper = createLanguageWrapper(stage.id, stage.name);
  getOrderedRuleKeys(stage.id).forEach((ruleId) => {
    const globalIndex = allOrderedKeys.indexOf(ruleId);
    const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
    drawRule(ruleId, nextRuleId, $stageWrapper);
  });
});

// 7. Post-processing conversions
if (postProcessingRuleKeys.length > 0) {
  const $postWrapper = createConversionWrapper('post-processing', 'Post-processing');
  postProcessingRuleKeys.forEach((ruleId) => {
    const globalIndex = allOrderedKeys.indexOf(ruleId);
    const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
    drawRule(ruleId, nextRuleId, $postWrapper);
  });
}

// Apply rule inputs from share mode URL (must happen after rules are drawn)
if (shareModeRuleInputs) {
  for (const [ruleId, inputs] of Object.entries(shareModeRuleInputs)) {
    for (const [inputName, value] of Object.entries(inputs)) {
      const $input = document.getElementById(`input-${ruleId}-${inputName}`);
      if ($input) {
        if ($input.type === 'checkbox') {
          $input.checked = value;
        } else {
          $input.value = value;
        }
      }
    }
  }
}

// Restore input from URL query string (or share mode) or storage
// shareModeInput was captured before URL params were cleared
const urlInput = shareModeInput || getInputFromUrl();
const storedInput = urlInput || localStorage.getItem(storageKey('original-input')) || '';
if (storedInput) {
  $originalInput.value = storedInput;
  const $firstRuleInput = document.getElementById(`input-${firstRuleId}`);
  $firstRuleInput.value = storedInput;

  const secondRuleId = getNextRule(firstRuleId);
  runRule(firstRuleId, storedInput, secondRuleId);

  // Sync URL if we loaded from localStorage
  if (!urlInput && storedInput) {
    updateUrlWithInput(storedInput);
  }
}

// =============================================================================
// Live debugging tools
// =============================================================================

setupDebugTools({
  toggleRule,
  resetRule,
  resetAllRules,
  getRuleState: () => ruleState,
  isRuleEffectivelyEnabled,
  smoothScrollTo,
  getStickyHeight: () => $topWrapper.offsetHeight + 20,
  logicModule,
});