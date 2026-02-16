import { sindarinRules } from './src/v4.js';
const wrapper = document.getElementById('wrapper');
const originalInput = document.getElementById('input');
const originalOutput = document.getElementById('output');
const firstRule = '00100';
const ruleResults = {};
const ruleState = JSON.parse(localStorage.getItem("rules") || "{}");
const originalInputFromStorage = localStorage.getItem("original-input") || "";

originalInput.addEventListener('input', (e) => {
  localStorage.setItem("original-input", e.target.value);
});

console.log( { originalInputFromStorage });

const ruleKeys = Object.keys(sindarinRules);

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
  ruleState[ruleId] = isEnabled;
  localStorage.setItem("rules", JSON.stringify(ruleState));
  // Update the rule div's class
  const $rule = document.getElementById(`rule-${ruleId}`);
  
  console.log(`Toggle rule ${ruleId} to ${ruleState[ruleId]}`);
  
  const previousRuleId = getPreviousRule(ruleId);
  const nextRuleId = getNextRule(ruleId);
  const followingRule = getNextRule(nextRuleId);

  console.log(`- previous rule is ${previousRuleId}`);
  console.log(`- next rule is ${nextRuleId}`);
  console.log(`- following rule is ${followingRule}`);

  const outputValue = previousRuleId ? document.getElementById(`output-${previousRuleId}`).value : originalInput.value;

  console.log(`- value to be used: "${outputValue}"`);

  if (outputValue && !isEnabled) {
    const $nextInput = document.getElementById(`input-${nextRuleId}`);
    $nextInput.value = outputValue;
    runRule(nextRuleId, outputValue, followingRule);
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
  const ruleClass = isEnabled ? 'rule rule-enabled' : 'rule';
  const $rule = draw('div', wrapper, { class: ruleClass, id: `rule-${ruleId}` });
  draw('input', $rule, {
    type: 'checkbox',
    checked: isEnabled,
    class: 'rule-toggle',
    callback: {
      trigger: 'change',
      callback: (e) => toggleRule(ruleId, e.target.checked)
    }
  });
  draw('div', $rule, { class: 'rule-id', innerHtml: ruleId });
  draw('div', $rule, { class: 'rule-pattern', innerHtml: rule.pattern });
  draw('div', $rule, { class: 'rule-description', innerHtml: rule.description });
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
  console.log('Running rule', ruleId);
  const rule = sindarinRules[ruleId];
  if (ruleState[ruleId] === false) {
    const $nextInput = document.getElementById(`input-${nextRuleId}`);
    $nextInput.value = input;
    const followingRule = getNextRule(nextRuleId);
    runRule(nextRuleId, input, followingRule);
    return;
  }

  // Collect extra parameters from input fields if the rule has them
  const options = {};
  if (rule.input) {
    rule.input.forEach((inputDef) => {
      const $input = document.getElementById(`input-${ruleId}-${inputDef.name}`);
      if ($input) {
        if (inputDef.type === 'boolean') {
          options[inputDef.name] = $input.checked;
        } else {
          options[inputDef.name] = $input.value || inputDef.default;
        }
      }
    });
  }

  if (rule.dependsOn) {
    rule.dependsOn.forEach((dependency) => {
      const checkboxId = `dep-${ruleId}-${dependency.param}`;
      const $checkbox = document.getElementById(checkboxId);
      if ($checkbox) {
        // Read from checkbox (allows manual override)
        options[dependency.param] = $checkbox.checked;
      }
    });
  }

  const isEnabled = ruleState[ruleId] !== undefined ? ruleState[ruleId] : true;
  const output = isEnabled ? rule.mechanic(input, options) : input;

  // Track if this rule caused a change
  if (input !== output) {
    ruleResults[ruleId] = output;
  } else {
    delete ruleResults[ruleId];
  }

  // Auto-update any dependency checkboxes that depend on this rule
  document.querySelectorAll(`input[data-rule="${ruleId}"]`).forEach(($depCheckbox) => {
    $depCheckbox.checked = input !== output;
  });
  console.log({ input, output, options });

  const $output = document.getElementById(`output-${ruleId}`);
  $output.value = output;
  if (!nextRuleId) {
    originalOutput.value = output;
    console.log({ ruleResults });
    return;
  }
  const $nextInput = document.getElementById(`input-${nextRuleId}`);
  $nextInput.value = output;
  const followingRule = getNextRule(nextRuleId);
  runRule(nextRuleId, output, followingRule);
}

ruleKeys.forEach((rule, index, array) => {
  const nextRule = array[index + 1];
  const isEnabled = ruleState[rule] !== undefined ? ruleState[rule] : true;
  drawRule(rule, nextRule, isEnabled);
});

if (originalInputFromStorage) {
  originalInput.value = originalInputFromStorage;
  const $input = document.getElementById(`input-${firstRule}`);
  $input.value = originalInputFromStorage;
  const secondRule = getNextRule(firstRule);
  runRule(firstRule, originalInputFromStorage, secondRule);
}

originalInput.addEventListener('input', (e) => {
  const firstInput = e.target.value;
  if (firstInput === '') return;
  const $input = document.getElementById(`input-${firstRule}`);
  $input.value = firstInput;
  const secondRule = getNextRule(firstRule);
  runRule(firstRule, firstInput, secondRule);
});

const $helpers = document.querySelector('#userInput .helpers');
$helpers.addEventListener('click', (e) => {
  const char = e.target.innerHTML;
  const start = originalInput.selectionStart;
  const end = originalInput.selectionEnd;
  const value = originalInput.value;
  originalInput.value = value.slice(0, start) + char + value.slice(end);
  // Move cursor to after the inserted character
  const newPos = start + char.length;
  originalInput.setSelectionRange(newPos, newPos);
  originalInput.dispatchEvent(new Event('input'));
  originalInput.focus();
});
