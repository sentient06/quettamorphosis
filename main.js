import { sindarinRules } from './src/sindarin.js';
import { oldSindarinRules } from './src/old-sindarin.js';
import { SyllableAnalyser, digraphsToSingle, singleToDigraphs } from './src/utils.js';

// =============================================================================
// DOM Elements
// =============================================================================

const $wrapper = document.getElementById('wrapper');
const $originalInput = document.getElementById('input');
const $originalOutput = document.getElementById('output');
const $topWrapper = document.querySelector('.top-wrapper');
const $helpers = document.querySelector('.userInput .helpers');
const $resetButton = document.getElementById('reset');
const $resultsTripped = document.getElementById('results-tripped');
const $resultsSkipped = document.getElementById('results-skipped');

// =============================================================================
// State
// =============================================================================

const osRuleResults = {};
const sindarinRuleResults = {};
const ruleState = JSON.parse(localStorage.getItem('rules') || '{}');
const languageState = JSON.parse(localStorage.getItem('languages') || '{}');

// =============================================================================
// Rule Utilities
// =============================================================================

// Separate rule keys for each language, sorted by orderId
const osRuleKeys = Object.keys(oldSindarinRules).sort((a, b) => {
  return oldSindarinRules[a].orderId.localeCompare(oldSindarinRules[b].orderId);
});

const sindarinRuleKeys = Object.keys(sindarinRules).sort((a, b) => {
  return sindarinRules[a].orderId.localeCompare(sindarinRules[b].orderId);
});

// Combined keys: OS first, then Sindarin
const allRuleKeys = [...osRuleKeys, ...sindarinRuleKeys];

const firstRuleId = allRuleKeys[0];

// Helper to get rules object for a given ruleId
function getRulesObject(ruleId) {
  if (oldSindarinRules[ruleId]) return oldSindarinRules;
  if (sindarinRules[ruleId]) return sindarinRules;
  return null;
}

// Helper to get results object for a given ruleId
function getResultsObject(ruleId) {
  if (oldSindarinRules[ruleId]) return osRuleResults;
  if (sindarinRules[ruleId]) return sindarinRuleResults;
  return null;
}

// Helper to get language name for a given ruleId
function getLanguage(ruleId) {
  if (oldSindarinRules[ruleId]) return 'old-sindarin';
  if (sindarinRules[ruleId]) return 'sindarin';
  return null;
}

function draw(type, parent, options = {}) {
  const $element = document.createElement(type);
  const { innerHtml = '', callback = { trigger: null, callback: null }, checked, ...otherOptions } = options;
  $element.innerHTML = innerHtml;
  Object.entries(otherOptions).forEach(([key, value]) => {
    $element.setAttribute(key, value);
  });
  // Handle 'checked' - set both property and attribute for CSS :checked to work
  if (checked === 'checked') {
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

function getPreviousRule(currentRuleId) {
  const index = allRuleKeys.indexOf(currentRuleId);
  return allRuleKeys[index - 1];
}

function getNextRule(currentRuleId) {
  const index = allRuleKeys.indexOf(currentRuleId);
  return allRuleKeys[index + 1];
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

// Check if a rule is effectively enabled (language AND rule must both be enabled)
function isRuleEffectivelyEnabled(ruleId) {
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
  const ruleKeys = langId === 'old-sindarin' ? osRuleKeys : sindarinRuleKeys;
  const resultsObj = langId === 'old-sindarin' ? osRuleResults : sindarinRuleResults;
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
    } else if (outputValue) {
      // This was the last rule - update output and results
      $originalOutput.value = outputValue;
      printResults();
    }
  } else {
    // Rule is enabled - re-run it
    rerunRule(ruleId);
  }
}

function drawRule(ruleId, nextRuleId, $parentContainer) {
  const rulesObj = getRulesObject(ruleId);
  const rule = rulesObj[ruleId];
  const isEffectivelyEnabled = isRuleEffectivelyEnabled(ruleId);
  const ruleClass = isEffectivelyEnabled ? 'rule rule-enabled' : 'rule';
  const $rule = draw('div', $parentContainer, { class: ruleClass, id: `rule-${ruleId}` });

  const $label = draw('label', $rule, { for: `toggle-${ruleId}`, class: 'rule-label' });
  draw('input', $label, {
    id: `toggle-${ruleId}`,
    type: 'checkbox',
    checked: isEffectivelyEnabled ? 'checked' : '',
    class: 'rule-toggle',
    callback: {
      trigger: 'change',
      callback: (e) => toggleRule(ruleId, e.target.checked)
    }
  });

  draw('span', $label, { class: 'rule-id', innerHtml: ruleId });
  draw('div', $rule, { class: 'rule-order-id', innerHtml: rule.orderId });
  draw('div', $rule, { class: 'rule-pattern', innerHtml: rule.pattern });
  draw('div', $rule, { class: 'rule-description', innerHtml: rule.description });
  if (rule.hasOwnProperty('info')) {
    rule.info.forEach((info) => {
      draw('div', $rule, { class: 'rule-info', innerHtml: info });
    });
  }

  if (rule.hasOwnProperty('input')) {
    const $inputRules = draw('div', $rule, { class: 'rule-options' });
    rule.input.forEach((input) => {
      // { name: 'guess', type: 'boolean', default: true, description: 'Whether to guess boundary if no marker' },
      // { name: 'boundaryChar', type: 'string', default: '-', description: 'The morpheme boundary marker' },
      const inputType = input.type === 'boolean' ? 'checkbox' : 'text';
      const description = input.description || input.name;
      const inputAttrs = {
        type: inputType,
        id: `input-${ruleId}-${input.name}`,
        placeholder: description,
        callback: {
          trigger: 'change',
          callback: () => rerunRule(ruleId),
        },
      };
      if (inputType === 'checkbox') {
        if (input.default) {
          inputAttrs.checked = 'checked';
        }
      } else {
        inputAttrs.value = input.default || '';
      }
      const $optWrapper = draw('div', $inputRules);
      if (inputType === 'checkbox') {
        draw('input', $optWrapper, inputAttrs);
        draw('label', $optWrapper, { for: `input-${ruleId}-${input.name}`, innerHtml: description });
      } else {
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

  draw('input', $inputWrapper, {
    type: 'text',
    id: `input-${ruleId}`,
    placeholder: 'Input',
    callback: {
      trigger: 'input',
      callback: (e) => runRule(ruleId, e.target.value, nextRuleId),
    },
  });

  draw('input', $inputWrapper, {
    type: 'text',
    id: `output-${ruleId}`,
    placeholder: 'Output',
  });

  const $anchorWrapper = draw('div', $rule, { class: 'rule-anchor' });
  draw('a', $anchorWrapper, { innerHtml: 'source', href: rule.url, target: '_blank' });
}

function runRule(ruleId, input, nextRuleId) {
  const rulesObj = getRulesObject(ruleId);
  const resultsObj = getResultsObject(ruleId);
  const rule = rulesObj[ruleId];

  // Skip if rule is not effectively enabled (language disabled OR rule disabled)
  if (!isRuleEffectivelyEnabled(ruleId)) {
    console.log('Rule', getLanguage(ruleId) === 'old-sindarin' ? 'OS' : ' S', rule.orderId, String(ruleId).padStart(10, ' '), 'in:', input.padStart(10, '.'), 'out:', 'N/A'.padEnd(10, ' '), 'next:', String(nextRuleId).padStart(10, ' '), 'enabled:', isRuleEffectivelyEnabled(ruleId));
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
  const output = isEnabled ? rule.mechanic(input, options) : input;

  console.log('Rule', getLanguage(ruleId) === 'old-sindarin' ? 'OS' : ' S', rule.orderId, String(ruleId).padStart(10, ' '), 'in:', input.padStart(10, '.'), 'out:', output.padStart(10, '.'), 'next:', String(nextRuleId).padStart(10, ' '), 'enabled:', isRuleEffectivelyEnabled(ruleId));

  // Track rule result
  if (input !== output) {
    resultsObj[ruleId] = output;
  } else {
    delete resultsObj[ruleId];
  }

  // Auto-update dependency checkboxes that depend on this rule
  document.querySelectorAll(`input[data-rule="${ruleId}"]`).forEach(($depCheckbox) => {
    $depCheckbox.checked = input !== output;
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
  // Helper to format tripped rules for a language
  function formatTripped(rulesObj, resultsObj) {
    const rulesUsed = Object.keys(resultsObj).sort((a, b) => {
      return rulesObj[a].orderId.localeCompare(rulesObj[b].orderId);
    });
    return rulesUsed.map((ruleId) => {
      const anchor = `<a href="#rule-${ruleId}">${rulesObj[ruleId].orderId}</a>`;
      return `${anchor} - ${resultsObj[ruleId]}`;
    }).join('\n');
  }

  // Helper to format skipped rules for a language
  function formatSkipped(rulesObj, ruleKeys) {
    const skippedRules = ruleKeys.filter((ruleId) => {
      const rule = rulesObj[ruleId];
      return rule?.skip === true || ruleState[ruleId] === false;
    });
    return skippedRules.map((ruleId) => {
      return `<a href="#rule-${ruleId}">${rulesObj[ruleId].orderId}</a>`;
    }).join('\n');
  }

  // Build tripped results: OS first, then Sindarin
  const osTripped = formatTripped(oldSindarinRules, osRuleResults);
  const sindarinTripped = formatTripped(sindarinRules, sindarinRuleResults);

  let trippedHtml = '';
  if (osTripped) {
    trippedHtml += '<strong>Old Sindarin:</strong>\n' + osTripped + '\n\n';
  }
  if (sindarinTripped) {
    trippedHtml += '<strong>Sindarin:</strong>\n' + sindarinTripped;
  }
  $resultsTripped.innerHTML = trippedHtml.trim();

  // Build skipped results: OS first, then Sindarin
  const osSkipped = formatSkipped(oldSindarinRules, osRuleKeys);
  const sindarinSkipped = formatSkipped(sindarinRules, sindarinRuleKeys);

  let skippedHtml = '';
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

// Handle reset button
$resetButton.addEventListener('click', () => {
  localStorage.removeItem('rules');
  localStorage.removeItem('languages');
  localStorage.removeItem('original-input');
  location.reload();
});

// =============================================================================
// Initialization
// =============================================================================

// Set sticky header height CSS variable for scroll-margin-top
document.documentElement.style.setProperty('--sticky-h', $topWrapper.offsetHeight + 'px');

// Create language wrappers
const $osWrapper = createLanguageWrapper('old-sindarin', 'Old Sindarin');
const $sindarinWrapper = createLanguageWrapper('sindarin', 'Sindarin');

// Draw Old Sindarin rules
osRuleKeys.forEach((ruleId, index) => {
  const nextRuleId = allRuleKeys[index + 1];
  const isEnabled = ruleState[ruleId] !== undefined ? ruleState[ruleId] : true;
  drawRule(ruleId, nextRuleId, $osWrapper, isEnabled);
});

// Draw Sindarin rules
sindarinRuleKeys.forEach((ruleId, index) => {
  const globalIndex = osRuleKeys.length + index;
  const nextRuleId = allRuleKeys[globalIndex + 1];
  const isEnabled = ruleState[ruleId] !== undefined ? ruleState[ruleId] : true;
  drawRule(ruleId, nextRuleId, $sindarinWrapper, isEnabled);
});

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

const sAnalyser = new SyllableAnalyser();

console.log('Type debug() to debug.');

window.debug = (str) => {
  if (!str) {
    return 'Usage: debug(\'word\')';
  }
  const toSingle = digraphsToSingle(str);
  const toDigraphs = singleToDigraphs(str);
  const toSingleAndToDigraphs = singleToDigraphs(toSingle);
  const syllables = sAnalyser.analyse(str);
  return {
    toSingle,
    toDigraphs,
    toSingleAndToDigraphs,
    syllables,
  };
};