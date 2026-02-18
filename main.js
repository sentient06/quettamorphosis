import { sindarinRules } from './src/sindarin.js';

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

const ruleResults = {};
const ruleState = JSON.parse(localStorage.getItem('rules') || '{}');

// =============================================================================
// Rule Utilities
// =============================================================================

const ruleKeys = Object.keys(sindarinRules).sort((a, b) => {
  return sindarinRules[a].orderId.localeCompare(sindarinRules[b].orderId);
});

const firstRuleId = ruleKeys[0];

function draw(type, parent, options = {}) {
  const $element = document.createElement(type);
  const { innerHtml = '', callback = { trigger: null, callback: null }, checked, ...otherOptions } = options;
  $element.innerHTML = innerHtml;
  Object.entries(otherOptions).forEach(([key, value]) => {
    $element.setAttribute(key, value);
  });
  // Handle 'checked' - set both property and attribute for CSS :checked to work
  if (checked === true) {
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
  const index = ruleKeys.indexOf(currentRuleId);
  return ruleKeys[index - 1];
}

function getNextRule(currentRuleId) {
  const index = ruleKeys.indexOf(currentRuleId);
  return ruleKeys[index + 1];
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
  const rule = sindarinRules[ruleId];
  const isDefaultSkipped = rule?.skip === true;

  // Only persist to localStorage if user is overriding a non-default-skipped rule
  if (isDefaultSkipped) {
    delete ruleState[ruleId];
  } else {
    ruleState[ruleId] = isEnabled;
  }
  localStorage.setItem('rules', JSON.stringify(ruleState));

  const $rule = document.getElementById(`rule-${ruleId}`);
  const previousRuleId = getPreviousRule(ruleId);
  const nextRuleId = getNextRule(ruleId);
  const followingRuleId = getNextRule(nextRuleId);

  const outputValue = previousRuleId
    ? document.getElementById(`output-${previousRuleId}`).value
    : $originalInput.value;

  if (outputValue && !isEnabled) {
    const $nextInput = document.getElementById(`input-${nextRuleId}`);
    $nextInput.value = outputValue;
    runRule(nextRuleId, outputValue, followingRuleId);
  }

  if (isEnabled) {
    rerunRule(ruleId);
  }

  if ($rule) {
    $rule.classList.toggle('rule-enabled', isEnabled);
  }
}

function drawRule(ruleId, nextRuleId, isEnabled = true) {
  const rule = sindarinRules[ruleId];
  const isDefaultEnabled = rule?.skip ? false : isEnabled;
  const ruleClass = isDefaultEnabled ? 'rule rule-enabled' : 'rule';
  const $rule = draw('div', $wrapper, { class: ruleClass, id: `rule-${ruleId}` });

  const $label = draw('label', $rule, { for: `toggle-${ruleId}`, class: 'rule-label' });
  draw('input', $label, {
    id: `toggle-${ruleId}`,
    type: 'checkbox',
    checked: isDefaultEnabled,
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
  const $anchorWrapper = draw('div', $rule, { class: 'rule-anchor' });
  draw('a', $anchorWrapper, { innerHtml: 'source', href: rule.url, target: '_blank' });

  if (rule.hasOwnProperty('input')) {
    const $inputRules = draw('div', $rule, { class: 'rule-inputs' });
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
      draw('input', $inputRules, inputAttrs);
      if (inputType === 'checkbox') {
        draw('label', $inputRules, { for: `input-${ruleId}-${input.name}`, innerHtml: description });
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
}

function runRule(ruleId, input, nextRuleId) {
  const rule = sindarinRules[ruleId];

  // Skip disabled rules - pass input directly to next rule
  if (ruleState[ruleId] === false) {
    const $nextInput = document.getElementById(`input-${nextRuleId}`);
    $nextInput.value = input;
    const followingRuleId = getNextRule(nextRuleId);
    runRule(nextRuleId, input, followingRuleId);
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

  // Track rule result
  if (input !== output) {
    ruleResults[ruleId] = output;
  } else {
    delete ruleResults[ruleId];
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

// =============================================================================
// Results Display
// =============================================================================

function printResults() {
  // Get rules that caused changes (sorted by orderId)
  const rulesUsed = Object.keys(ruleResults).sort((a, b) => {
    return sindarinRules[a].orderId.localeCompare(sindarinRules[b].orderId);
  });

  // Display rules that were triggered
  $resultsTripped.innerHTML = rulesUsed.map((ruleId) => {
    const anchor = `<a href="#rule-${ruleId}">${sindarinRules[ruleId].orderId}</a>`;
    return `${anchor} - ${ruleResults[ruleId]}`;
  }).join('\n');

  // Get all skipped rules: user-disabled OR default-skipped
  const skippedRules = ruleKeys.filter((ruleId) => {
    const rule = sindarinRules[ruleId];
    return rule?.skip === true || ruleState[ruleId] === false;
  });

  // Display skipped rules
  $resultsSkipped.innerHTML = skippedRules.map((ruleId) => {
    return `<a href="#rule-${ruleId}">${sindarinRules[ruleId].orderId}</a>`;
  }).join('\n');
}

// =============================================================================
// Event Handlers
// =============================================================================

// Handle input changes - save to storage and run rules
$originalInput.addEventListener('input', (e) => {
  localStorage.setItem('original-input', e.target.value);

  const inputValue = e.target.value;
  if (inputValue === '') return;

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
  localStorage.removeItem('original-input');
  location.reload();
});

// =============================================================================
// Initialization
// =============================================================================

// Set sticky header height CSS variable for scroll-margin-top
document.documentElement.style.setProperty('--sticky-h', $topWrapper.offsetHeight + 'px');

// Draw all rules
ruleKeys.forEach((ruleId, index, array) => {
  const nextRuleId = array[index + 1];
  const isEnabled = ruleState[ruleId] !== undefined ? ruleState[ruleId] : true;
  drawRule(ruleId, nextRuleId, isEnabled);
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
