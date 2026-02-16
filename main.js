import { sindarinRules } from './src/v4.js';
const wrapper = document.getElementById('wrapper');
const originalInput = document.getElementById('input');
const originalOutput = document.getElementById('output');
const firstRule = '00100';

const ruleKeys = Object.keys(sindarinRules);

function draw(type, parent, options = {}) {
  const $element = document.createElement(type);
  const { innerHtml = '', callback = { trigger: null, callback: null }, ...otherOptions } = options;
  $element.innerHTML = innerHtml;
  Object.entries(otherOptions).forEach(([key, value]) => {
    $element.setAttribute(key, value);
  });
  if (callback.trigger && callback.callback) {
    $element.addEventListener(callback.trigger, callback.callback);
  }
  parent.appendChild($element);
  return $element;
}

function drawRule(ruleId, nextRuleId) {
  const rule = sindarinRules[ruleId];
  const $rule = draw('div', wrapper, { class: 'rule' });
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

function getNextRule(currentRuleId) {
  const index = ruleKeys.indexOf(currentRuleId);
  return ruleKeys[index + 1];
}

function runRule(ruleId, input, nextRuleId) {
  console.log('Running rule', ruleId);
  const rule = sindarinRules[ruleId];

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

  const output = rule.mechanic(input, options);
  console.log({ input, output, options });

  const $output = document.getElementById(`output-${ruleId}`);
  $output.value = output;
  // if (input !== output) {
  //   $output.value = output;
  // } else {
  //   $output.value = input;
  // }
  if (!nextRuleId) {
    originalOutput.value = output;
    return;
  }
  const $nextInput = document.getElementById(`input-${nextRuleId}`);
  $nextInput.value = output;
  const followingRule = getNextRule(nextRuleId);
  runRule(nextRuleId, output, followingRule);
}

ruleKeys.forEach((rule, index, array) => {
  const nextRule = array[index + 1];
  drawRule(rule, nextRule);
});

originalInput.addEventListener('input', (e) => {
  const firstInput = e.target.value;
  if (firstInput === '') return;
  const $input = document.getElementById(`input-${firstRule}`);
  $input.value = firstInput;
  const secondRule = getNextRule(firstRule);
  runRule(firstRule, firstInput, secondRule);
});
