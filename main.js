import { sindarinRules } from './src/sindarin.js';
import { oldSindarinRules } from './src/old-sindarin.js';
import { ancientTelerinRules } from './src/ancient-telerin.js';
import { SyllableAnalyser, digraphsToSingle, singleToDigraphs, SINDARIN_PROFILE, OLD_SINDARIN_PROFILE, ANCIENT_TELERIN_PROFILE } from './src/utils.js';
import {
  preProcessingRuleKeys,
  interLanguageRuleKeys,
  postProcessingRuleKeys,
} from './src/conversions.js';
import {
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
const $resetButton = document.getElementById('reset');
const $resultsTripped = document.getElementById('results-tripped');
const $resultsSkipped = document.getElementById('results-skipped');
const $notes = document.getElementById('notes');
const $openNotes = document.getElementById('open-notes');
const $closeNotes = document.getElementById('close-notes');

// =============================================================================
// State
// =============================================================================

const atRuleResults = {};
const osRuleResults = {};
const sindarinRuleResults = {};
const ruleState = JSON.parse(localStorage.getItem('rules') || '{}');
const languageState = JSON.parse(localStorage.getItem('languages') || '{}');

// =============================================================================
// Rule Utilities
// =============================================================================

const firstRuleId = allRuleKeys[0];

// Wrapper functions that use module-level state
function getResultsObject(ruleId) {
  return _getResultsObject(ruleId, atRuleResults, osRuleResults, sindarinRuleResults);
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
  const ruleKeys = langId === 'ancient-telerin' ? atRuleKeys : (langId === 'old-sindarin' ? osRuleKeys : sindarinRuleKeys);
  const resultsObj = langId === 'ancient-telerin' ? atRuleResults : (langId === 'old-sindarin' ? osRuleResults : sindarinRuleResults);
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
  const ruleClass = isEffectivelyEnabled ? 'rule rule-enabled' : 'rule';
  const $rule = draw('div', $parentContainer, { class: ruleClass, id: `rule-${ruleId}` });

  // Conversion rules don't have toggles (they always run)
  if (!isConversion) {
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
  }

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

  // Conversion rules don't have source URLs
  if (!isConversion && rule.url) {
    const $anchorWrapper = draw('div', $rule, { class: 'rule-anchor' });
    draw('a', $anchorWrapper, { innerHtml: 'source', href: rule.url, target: '_blank' });
  }
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

  const langLabel = isConversionRule(ruleId) ? 'CV' : (getLanguage(ruleId) === 'old-sindarin' ? 'OS' : ' S');
  console.log('Rule', langLabel, rule.orderId, String(ruleId).padStart(25, ' '), 'in:', input.padStart(10, '.'), 'out:', output.padStart(10, '.'), 'next:', String(nextRuleId).padStart(25, ' '), 'enabled:', isRuleEffectivelyEnabled(ruleId));

  // Track rule result (skip for conversion rules - they don't appear in tripped/skipped)
  if (resultsObj) {
    if (input !== output) {
      resultsObj[ruleId] = output;
    } else {
      delete resultsObj[ruleId];
    }
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
  // Build tripped results: Ancient Telerin, then OS, then Sindarin
  const atTripped = formatTripped(ancientTelerinRules, atRuleResults);
  const osTripped = formatTripped(oldSindarinRules, osRuleResults);
  const sindarinTripped = formatTripped(sindarinRules, sindarinRuleResults);

  let trippedHtml = '';
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

  // Build skipped results: Ancient Telerin, then OS, then Sindarin
  const atSkipped = formatSkipped(ancientTelerinRules, atRuleKeys, ruleState);
  const osSkipped = formatSkipped(oldSindarinRules, osRuleKeys, ruleState);
  const sindarinSkipped = formatSkipped(sindarinRules, sindarinRuleKeys, ruleState);

  let skippedHtml = '';
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

// Helper to calculate the next rule ID for a given index in allRuleKeys
function getNextRuleIdAtIndex(index) {
  return allRuleKeys[index + 1];
}

// Create conversion and language wrappers in execution order

// 1. Pre-processing conversions
if (preProcessingRuleKeys.length > 0) {
  const $preWrapper = createConversionWrapper('pre-processing', 'Pre-processing');
  preProcessingRuleKeys.forEach((ruleId) => {
    const globalIndex = allRuleKeys.indexOf(ruleId);
    const nextRuleId = getNextRuleIdAtIndex(globalIndex);
    drawRule(ruleId, nextRuleId, $preWrapper);
  });
}

// 2. Ancient Telerin rules
const $atWrapper = createLanguageWrapper('ancient-telerin', 'Ancient Telerin');
atRuleKeys.forEach((ruleId) => {
  const globalIndex = allRuleKeys.indexOf(ruleId);
  const nextRuleId = getNextRuleIdAtIndex(globalIndex);
  drawRule(ruleId, nextRuleId, $atWrapper);
});

// 3. Old Sindarin rules
const $osWrapper = createLanguageWrapper('old-sindarin', 'Old Sindarin');
osRuleKeys.forEach((ruleId) => {
  const globalIndex = allRuleKeys.indexOf(ruleId);
  const nextRuleId = getNextRuleIdAtIndex(globalIndex);
  drawRule(ruleId, nextRuleId, $osWrapper);
});

// 4. Inter-language conversions (currently empty but structure is ready)
if (interLanguageRuleKeys.length > 0) {
  const $interWrapper = createConversionWrapper('inter-language', 'OS → Sindarin Transition');
  interLanguageRuleKeys.forEach((ruleId) => {
    const globalIndex = allRuleKeys.indexOf(ruleId);
    const nextRuleId = getNextRuleIdAtIndex(globalIndex);
    drawRule(ruleId, nextRuleId, $interWrapper);
  });
}

// 5. Sindarin rules
const $sindarinWrapper = createLanguageWrapper('sindarin', 'Sindarin');
sindarinRuleKeys.forEach((ruleId) => {
  const globalIndex = allRuleKeys.indexOf(ruleId);
  const nextRuleId = getNextRuleIdAtIndex(globalIndex);
  drawRule(ruleId, nextRuleId, $sindarinWrapper);
});

// 6. Post-processing conversions
if (postProcessingRuleKeys.length > 0) {
  const $postWrapper = createConversionWrapper('post-processing', 'Post-processing');
  postProcessingRuleKeys.forEach((ruleId) => {
    const globalIndex = allRuleKeys.indexOf(ruleId);
    const nextRuleId = getNextRuleIdAtIndex(globalIndex);
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
    return 'Usage: debug(\'word\')';
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