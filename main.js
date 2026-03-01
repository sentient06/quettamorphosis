import { sindarinRules } from './src/sindarin.js';
import { oldSindarinRules } from './src/old-sindarin.js';
import { ancientTelerinRules } from './src/ancient-telerin.js';
import { primitiveElvishRules } from './src/primitive-elvish.js';
import { SyllableAnalyser, digraphsToSingle, singleToDigraphs, SINDARIN_PROFILE, OLD_SINDARIN_PROFILE, ANCIENT_TELERIN_PROFILE } from './src/utils.js';
import {
  preProcessingRuleKeys,
  interLanguageRuleKeys,
  postProcessingRuleKeys,
} from './src/conversions.js';
import {
  peRuleKeys,
  atRuleKeys,
  osRuleKeys,
  sindarinRuleKeys,
  allRuleKeys,
  isConversionRule,
  getRulesObject,
  getLanguage,
  getPreviousRule,
  getNextRule,
  formatTripped,
  formatSkipped,
  isRuleEffectivelyEnabled as _isRuleEffectivelyEnabled,
  getResultsObject as _getResultsObject,
} from './src/main-logic.js';

// =============================================================================
// DOM Elements
// =============================================================================

const $wrapper = document.getElementById('wrapper');
const $originalInput = document.getElementById('input');
const $originalOutput = document.getElementById('output');
const $topWrapper = document.querySelector('.top-wrapper');
const $helpers = document.querySelector('.userInput .helpers');
const $toggleHelpers = document.getElementById('toggle-helpers');
const $resetButton = document.getElementById('reset');
const $resetOrderButton = document.getElementById('reset-order');
const $resultsTripped = document.getElementById('results-tripped');
const $resultsSkipped = document.getElementById('results-skipped');
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

const peRuleResults = {};
const atRuleResults = {};
const osRuleResults = {};
const sindarinRuleResults = {};
const ruleState = JSON.parse(localStorage.getItem('rules') || '{}');
const languageState = JSON.parse(localStorage.getItem('languages') || '{}');
const optionState = JSON.parse(localStorage.getItem('options') || '{}');
const orderState = JSON.parse(localStorage.getItem('order') || '{}');

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
  if (!orderState['primitive-elvish']) {
    orderState['primitive-elvish'] = [...peRuleKeys];
  }
  if (!orderState['ancient-telerin']) {
    orderState['ancient-telerin'] = [...atRuleKeys];
  }
  if (!orderState['old-sindarin']) {
    orderState['old-sindarin'] = [...osRuleKeys];
  }
  if (!orderState['sindarin']) {
    orderState['sindarin'] = [...sindarinRuleKeys];
  }
  // Add any new rules that might have been added since last save
  peRuleKeys.forEach(ruleId => {
    if (!orderState['primitive-elvish'].includes(ruleId)) {
      orderState['primitive-elvish'].push(ruleId);
    }
  });
  atRuleKeys.forEach(ruleId => {
    if (!orderState['ancient-telerin'].includes(ruleId)) {
      orderState['ancient-telerin'].push(ruleId);
    }
  });
  osRuleKeys.forEach(ruleId => {
    if (!orderState['old-sindarin'].includes(ruleId)) {
      orderState['old-sindarin'].push(ruleId);
    }
  });
  sindarinRuleKeys.forEach(ruleId => {
    if (!orderState['sindarin'].includes(ruleId)) {
      orderState['sindarin'].push(ruleId);
    }
  });
  // Remove any rules that no longer exist
  orderState['primitive-elvish'] = orderState['primitive-elvish'].filter(id => peRuleKeys.includes(id));
  orderState['ancient-telerin'] = orderState['ancient-telerin'].filter(id => atRuleKeys.includes(id));
  orderState['old-sindarin'] = orderState['old-sindarin'].filter(id => osRuleKeys.includes(id));
  orderState['sindarin'] = orderState['sindarin'].filter(id => sindarinRuleKeys.includes(id));
}

initializeOrderState();

// Get ordered rule keys for a language
function getOrderedRuleKeys(language) {
  return orderState[language] || [];
}

// Build the complete ordered list of all rule keys
function getAllOrderedRuleKeys() {
  return [
    ...preProcessingRuleKeys,
    ...getOrderedRuleKeys('primitive-elvish'),
    ...getOrderedRuleKeys('ancient-telerin'),
    ...getOrderedRuleKeys('old-sindarin'),
    ...interLanguageRuleKeys,
    ...getOrderedRuleKeys('sindarin'),
    ...postProcessingRuleKeys,
  ];
}

// Save order state to localStorage
function saveOrderState() {
  localStorage.setItem('order', JSON.stringify(orderState));
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
  const $rule = document.getElementById(`rule-${ruleId}`);
  const $prevRule = document.getElementById(`rule-${order[index]}`);
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
  const $rule = document.getElementById(`rule-${ruleId}`);
  const $nextRule = document.getElementById(`rule-${order[index]}`);
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
function runRuleChain(startRuleId, inputValue, nextRuleAfterChain) {
  const language = getLanguage(startRuleId);
  const order = orderState[language];
  const startIndex = order.indexOf(startRuleId);

  let currentInput = inputValue;

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
    const isEnabled = ruleState[ruleId] !== undefined ? ruleState[ruleId] : !rule.skip;
    const result = isEnabled ? rule.mechanic(currentInput, options) : { in: currentInput, out: currentInput };
    const output = result.out;

    // Update visual state
    const isTripped = result.in !== result.out;
    const resultsObj = getResultsObject(ruleId);
    if (isTripped) {
      resultsObj[ruleId] = result;
    } else {
      delete resultsObj[ruleId];
    }

    const $ruleElement = document.getElementById(`rule-${ruleId}`);
    if ($ruleElement) {
      $ruleElement.classList.toggle('rule-tripped', isTripped);
      const hasFocus = $ruleElement.contains(document.activeElement);
      if (isTripped || !hasFocus) {
        $ruleElement.classList.toggle('rule-collapsed', !isTripped);
      }
    }

    // Update output field
    const $output = document.getElementById(`output-${ruleId}`);
    if ($output) {
      $output.value = output;
    }

    currentInput = output;
  }

  // Continue to next rule after this language's chain
  if (nextRuleAfterChain) {
    const $nextInput = document.getElementById(`input-${nextRuleAfterChain}`);
    if ($nextInput) {
      $nextInput.value = currentInput;
    }
    runRule(nextRuleAfterChain, currentInput, getNextRule(nextRuleAfterChain));
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
  return _getResultsObject(ruleId, peRuleResults, atRuleResults, osRuleResults, sindarinRuleResults);
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
  const $rule = document.getElementById(`rule-${ruleId}`);
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
  localStorage.setItem('languages', JSON.stringify(languageState));

  const $langWrapper = document.getElementById(`lang-${langId}`);
  if ($langWrapper) {
    $langWrapper.classList.toggle('language-skipped', !isEnabled);
  }

  // Clear results for this language (they will be repopulated on re-run if enabled)
  const ruleKeysMap = {
    'primitive-elvish': peRuleKeys,
    'ancient-telerin': atRuleKeys,
    'old-sindarin': osRuleKeys,
    'sindarin': sindarinRuleKeys,
  };
  const resultsObjMap = {
    'primitive-elvish': peRuleResults,
    'ancient-telerin': atRuleResults,
    'old-sindarin': osRuleResults,
    'sindarin': sindarinRuleResults,
  };
  const ruleKeys = ruleKeysMap[langId] || [];
  const resultsObj = resultsObjMap[langId] || {};
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
    runRule(ruleId, $input.value, nextRuleId);
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
  localStorage.setItem('rules', JSON.stringify(ruleState));

  // Update visual state based on effective enabled (considers language too)
  updateRuleVisualState(ruleId);

  const previousRuleId = getPreviousRule(ruleId);
  const nextRuleId = getNextRule(ruleId);

  const outputValue = previousRuleId
    ? document.getElementById(`output-${previousRuleId}`).value
    : $originalInput.value;

  // Check effective enabled state for execution
  const effectivelyEnabled = isRuleEffectivelyEnabled(ruleId);

  if (!effectivelyEnabled) {
    // Clear this rule's result since it's now disabled
    delete resultsObj[ruleId];

    // Pass input to next rule (skipping this one)
    if (outputValue && nextRuleId) {
      const $nextInput = document.getElementById(`input-${nextRuleId}`);
      $nextInput.value = outputValue;
      runRule(nextRuleId, outputValue, getNextRule(nextRuleId));
      return; // runRule will call printResults() at the end
    } else if (outputValue) {
      // This was the last rule - update output
      $originalOutput.value = outputValue;
    }
  } else {
    // Rule is enabled - re-run it if there's input
    if (outputValue) {
      rerunRule(ruleId);
      return; // rerunRule -> runRule will call printResults() at the end
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
  // Start collapsed if enabled (will expand when tripped)
  let ruleClass = isEffectivelyEnabled ? 'rule rule-enabled rule-collapsed' : 'rule';
  if (hasOptions) ruleClass += ' rule-has-options';
  const $rule = draw('div', $parentContainer, { class: ruleClass, id: `rule-${ruleId}` });

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

  draw('span', $headerRow, { class: 'rule-order-id', innerHtml: rule.orderId });
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
    draw('span', $rightGroup, { class: 'rule-id', innerHtml: ruleId });
  }

  // Description (below pattern, shown when expanded)
  draw('div', $rule, { class: 'rule-description', innerHtml: rule.description });
  if (rule.hasOwnProperty('info')) {
    rule.info.forEach((info) => {
      draw('div', $rule, { class: 'rule-info', innerHtml: info });
    });
  }

  if (rule.hasOwnProperty('input')) {
    const $inputRules = draw('div', $rule, { class: 'rule-options' });
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
            localStorage.setItem('options', JSON.stringify(optionState));
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
      draw('label', $dependencies, {
        for: checkboxId,
        innerHtml: `${dependency.param} (from ${dependency.rule})`,
      });
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
  draw('input', $inputWrapper, {
    type: 'text',
    id: `output-${ruleId}`,
    placeholder: 'Output',
    readonly: 'readonly',
  });

}

function runRule(ruleId, input, nextRuleId) {
  const rulesObj = getRulesObject(ruleId);
  const resultsObj = getResultsObject(ruleId);
  const rule = rulesObj[ruleId];

  // Skip if rule is not effectively enabled (language disabled OR rule disabled)
  if (!isRuleEffectivelyEnabled(ruleId)) {
    console.log('Rule', getLanguage(ruleId) === 'old-sindarin' ? 'OS' : ' S', rule.orderId, String(ruleId).padStart(10, ' '), 'in:', input.padStart(10, '.'), 'out:', 'N/A'.padEnd(10, ' '), 'next:', String(nextRuleId).padStart(10, ' '), 'enabled:', isRuleEffectivelyEnabled(ruleId));
    // Clear tripped state when rule is skipped
    const $ruleElement = document.getElementById(`rule-${ruleId}`);
    if ($ruleElement) {
      $ruleElement.classList.remove('rule-tripped');
    }
    if (nextRuleId) {
      const $nextInput = document.getElementById(`input-${nextRuleId}`);
      $nextInput.value = input;
      runRule(nextRuleId, input, getNextRule(nextRuleId));
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

  const isEnabled = ruleState[ruleId] !== undefined ? ruleState[ruleId] : true;
  const result = isEnabled ? rule.mechanic(input, options) : { in: input, out: input };
  const output = result.out;

  console.log('Rule', getLanguage(ruleId) === 'old-sindarin' ? 'OS' : ' S', rule.orderId, String(ruleId).padStart(10, ' '), 'in:', result.in.padStart(10, '.'), 'out:', output.padStart(10, '.'), 'next:', String(nextRuleId).padStart(10, ' '), 'enabled:', isRuleEffectivelyEnabled(ruleId));

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
  const $ruleElement = document.getElementById(`rule-${ruleId}`);
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

  // Update output field
  const $output = document.getElementById(`output-${ruleId}`);
  $output.value = output;

  // Continue to next rule or finish
  if (!nextRuleId) {
    $originalOutput.value = output;
    printResults();
    return;
  }

  const $nextInput = document.getElementById(`input-${nextRuleId}`);
  $nextInput.value = output;
  runRule(nextRuleId, output, getNextRule(nextRuleId));
}

function resetRule(ruleId) {
  const $input = document.getElementById(`input-${ruleId}`);
  const $output = document.getElementById(`output-${ruleId}`);
  $input.value = "";
  $output.value = "";

  // Clear tripped visual state
  const $rule = document.getElementById(`rule-${ruleId}`);
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
  // Build tripped results: Primitive Elvish, Ancient Telerin, then OS, then Sindarin
  const peTripped = formatTripped(primitiveElvishRules, peRuleResults);
  const atTripped = formatTripped(ancientTelerinRules, atRuleResults);
  const osTripped = formatTripped(oldSindarinRules, osRuleResults);
  const sindarinTripped = formatTripped(sindarinRules, sindarinRuleResults);

  let trippedHtml = '';
  if (peTripped) {
    trippedHtml += '<strong>Primitive Elvish:</strong>\n' + peTripped + '\n\n';
  }
  if (atTripped) {
    trippedHtml += '<strong>Ancient Telerin:</strong>\n' + atTripped + '\n\n';
  }
  if (osTripped) {
    trippedHtml += '<strong>Old Sindarin:</strong>\n' + osTripped + '\n\n';
  }
  if (sindarinTripped) {
    trippedHtml += '<strong>Sindarin:</strong>\n' + sindarinTripped;
  }
  $resultsTripped.innerHTML = trippedHtml.trim();

  // Build skipped results: Primitive Elvish, Ancient Telerin, then OS, then Sindarin
  const peSkipped = formatSkipped(primitiveElvishRules, peRuleKeys, ruleState);
  const atSkipped = formatSkipped(ancientTelerinRules, atRuleKeys, ruleState);
  const osSkipped = formatSkipped(oldSindarinRules, osRuleKeys, ruleState);
  const sindarinSkipped = formatSkipped(sindarinRules, sindarinRuleKeys, ruleState);

  let skippedHtml = '';
  if (peSkipped) {
    skippedHtml += '<strong>Primitive Elvish:</strong>\n' + peSkipped + '\n\n';
  }
  if (atSkipped) {
    skippedHtml += '<strong>Ancient Telerin:</strong>\n' + atSkipped + '\n\n';
  }
  if (osSkipped) {
    skippedHtml += '<strong>Old Sindarin:</strong>\n' + osSkipped + '\n\n';
  }
  if (sindarinSkipped) {
    skippedHtml += '<strong>Sindarin:</strong>\n' + sindarinSkipped;
  }
  $resultsSkipped.innerHTML = skippedHtml.trim();

  // Update sticky header height since results may have changed the top-wrapper size
  document.documentElement.style.setProperty('--sticky-h', $topWrapper.offsetHeight + 'px');
}

// =============================================================================
// Event Handlers
// =============================================================================

// Handle input changes - save to storage and run rules
$originalInput.addEventListener('input', (e) => {
  localStorage.setItem('original-input', e.target.value);

  const inputValue = e.target.value;
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

// Handle reset order button (only resets rule order)
$resetOrderButton.addEventListener('click', () => {
  localStorage.removeItem('order');
  location.reload();
});

// Handle reset button (resets everything)
$resetButton.addEventListener('click', () => {
  localStorage.removeItem('rules');
  localStorage.removeItem('languages');
  localStorage.removeItem('options');
  localStorage.removeItem('order');
  localStorage.removeItem('original-input');
  location.reload();
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

// 2. Primitive Elvish rules
const $peWrapper = createLanguageWrapper('primitive-elvish', 'Primitive Elvish');
getOrderedRuleKeys('primitive-elvish').forEach((ruleId) => {
  const globalIndex = allOrderedKeys.indexOf(ruleId);
  const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
  drawRule(ruleId, nextRuleId, $peWrapper);
});

// 3. Ancient Telerin rules
const $atWrapper = createLanguageWrapper('ancient-telerin', 'Ancient Telerin');
getOrderedRuleKeys('ancient-telerin').forEach((ruleId) => {
  const globalIndex = allOrderedKeys.indexOf(ruleId);
  const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
  drawRule(ruleId, nextRuleId, $atWrapper);
});

// 4. Old Sindarin rules
const $osWrapper = createLanguageWrapper('old-sindarin', 'Old Sindarin');
getOrderedRuleKeys('old-sindarin').forEach((ruleId) => {
  const globalIndex = allOrderedKeys.indexOf(ruleId);
  const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
  drawRule(ruleId, nextRuleId, $osWrapper);
});

// 5. Inter-language conversions (currently empty but structure is ready)
if (interLanguageRuleKeys.length > 0) {
  const $interWrapper = createConversionWrapper('inter-language', 'OS → Sindarin Transition');
  interLanguageRuleKeys.forEach((ruleId) => {
    const globalIndex = allOrderedKeys.indexOf(ruleId);
    const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
    drawRule(ruleId, nextRuleId, $interWrapper);
  });
}

// 6. Sindarin rules
const $sindarinWrapper = createLanguageWrapper('sindarin', 'Sindarin');
getOrderedRuleKeys('sindarin').forEach((ruleId) => {
  const globalIndex = allOrderedKeys.indexOf(ruleId);
  const nextRuleId = getNextRuleIdAtIndex(allOrderedKeys, globalIndex);
  drawRule(ruleId, nextRuleId, $sindarinWrapper);
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

// Restore input from storage and run rules
const storedInput = localStorage.getItem('original-input') || '';
if (storedInput) {
  $originalInput.value = storedInput;
  const $firstRuleInput = document.getElementById(`input-${firstRuleId}`);
  $firstRuleInput.value = storedInput;

  const secondRuleId = getNextRule(firstRuleId);
  runRule(firstRuleId, storedInput, secondRuleId);
}

// =============================================================================
// Live debugging tools
// =============================================================================

console.log('Type debug() to debug.');

window.debug = (str, lang = 's') => {
  if (!str) {
    return 'Usage: debug(\'word\', language \'<s|os|at>\')';
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