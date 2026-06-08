import { primitiveElvishRules } from '../src/primitive-elvish.js';
import { ancientTelerinRules } from '../src/ancient-telerin.js';
import { oldSindarinRules } from '../src/old-sindarin.js';
import { sindarinRules } from '../src/sindarin.js';
import '../src/utils.js';

const inputWord = process.argv[2] || 'kundō';
const stopBefore = process.argv[3] || '03000';
const startFrom = process.argv[4] || 'AT'; // PE, AT, OS, or S

let word = inputWord;
console.log('Starting with:', word);
console.log('Starting from:', startFrom);

// PE rules
if (startFrom === 'PE') {
  console.log('--- Primitive Elvish ---');
  const peKeys = Object.keys(primitiveElvishRules).sort((a, b) =>
    primitiveElvishRules[a].orderId.localeCompare(primitiveElvishRules[b].orderId)
  );
  for (const ruleId of peKeys) {
    const rule = primitiveElvishRules[ruleId];
    const result = rule.mechanic(word);
    if (result.out !== word) {
      console.log('PE', rule.orderId + ':', word, '->', result.out);
      word = result.out;
    }
  }
}

// AT rules
if (['PE', 'AT'].includes(startFrom)) {
  console.log('--- Ancient Telerin ---');
  const atKeys = Object.keys(ancientTelerinRules).sort((a, b) =>
    ancientTelerinRules[a].orderId.localeCompare(ancientTelerinRules[b].orderId)
  );
  for (const ruleId of atKeys) {
    const rule = ancientTelerinRules[ruleId];
    const result = rule.mechanic(word);
    if (result.out !== word) {
      console.log('AT', rule.orderId + ':', word, '->', result.out);
      word = result.out;
    }
  }
}

// OS rules
if (['PE', 'AT', 'OS'].includes(startFrom)) {
  console.log('--- Old Sindarin ---');
  const osKeys = Object.keys(oldSindarinRules).sort((a, b) =>
    oldSindarinRules[a].orderId.localeCompare(oldSindarinRules[b].orderId)
  );
  for (const ruleId of osKeys) {
    const rule = oldSindarinRules[ruleId];
    const result = rule.mechanic(word);
    if (result.out !== word) {
      console.log('OS', rule.orderId + ':', word, '->', result.out);
      word = result.out;
    }
  }
}

// Sindarin rules (up to stopBefore)
console.log(`--- Sindarin (up to ${stopBefore}) ---`);
const sindarinKeys = Object.keys(sindarinRules).sort((a, b) =>
  sindarinRules[a].orderId.localeCompare(sindarinRules[b].orderId)
);
for (const ruleId of sindarinKeys) {
  const rule = sindarinRules[ruleId];
  if (rule.orderId >= stopBefore) break;
  const result = rule.mechanic(word);
  if (result.out !== word) {
    console.log('S', rule.orderId + ':', word, '->', result.out);
    word = result.out;
  }
}

console.log('\nFinal (before S', stopBefore + '):', word);

