export const at = {
  '00100': '[{ptkpʰkʰbdgm}V₁{rl}V́₁-] > [{ptkpʰkʰbdgm}ø{rl}V́₁-]',
  '00200': '[kw|kʰw|gw|ŋgw|ŋkw|ŋw-] > [p|pʰ|b|mb|mp|m-]',
  '00300': '[{ttʰdnl}j-] > [{ttʰdnl}ø-]',
  '00400': '[ln] > [ll]',
  '00500': '[-SV{ptks}] > [-SVø]',
  '00600': '[{mn}s] > [ss]',
  '99999': '[{nŋ}{ppʰb}|{mŋ}{ttʰd}|{mn}{kkʰg}] > [m{ppʰb}|n{ttʰd}|ŋ{kkʰg}]',
};

const toOne = 'NFC';
const toMany = 'NFD';

const charMap = {
  "kʰw": "Ж",   // U+0416
  "ŋgw": "Ч",   // U+0427
  "ŋkw": "Ш",   // U+0428
  "mb":  "Ц",   // U+0426
  "mp":  "Ю",   // U+042E
  "tʰ":  "Д",   // U+0414
  "pʰ":  "П",   // U+041F
  "kʰ":  "Ф",   // U+0424
  "kw":  "Ѯ",   // U+046E
  "gw":  "Ҕ",   // U+0494
  "ŋw":  "Ҩ",   // U+04A8
};

const symbols = [
  'j̊'
];

const reverseMap = Object.fromEntries(
  Object.entries(charMap).map(([k, v]) => [v, k])
);

/**
 * Singularise a string by replacing multi-character tokens with single-character representations.
 * @param {*} _input a string potentially containing multi-character tokens.
 * @returns a string with multi-character tokens replaced by single-character representations.
 */
export function singularise(_input) {
  const input = _input.normalize(toOne);
  const sortedTokens = Object.keys(charMap).sort((a, b) => b.length - a.length);
  let output = input;

  for (const token of sortedTokens) {
    // Escape regex special chars in token (e.g. if needed in future)
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'g');
    output = output.replace(re, charMap[token]);
  }

  return output;
}

/**
 * Check if a character is a combining mark.
 * @param {*} char 
 * @returns true if the character is a combining mark, false otherwise.
 */
export function isMark(char) {
  return /\p{Mn}/u.test(char); // nonspacing only (most common)
}

/**
 * Check if a character is a subscript digit.
 * @param {*} char 
 * @returns true if the character is a subscript digit, false otherwise.
 */
export function isSubscriptDigit(char) {
  if (!char) return false;
  const code = char.codePointAt(0);
  return code >= 0x2080 && code <= 0x2089;
}

/**
 * Convert subscript characters to their normal (non-subscript) counterparts.
 * @param {*} str 
 * @returns a string with subscript characters converted to normal characters.
 */
export function subscriptToNormal(str) {
  if (!str) return str;
  return str.replace(/[\u2080-\u2089]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x2050) // offset: 8320 - 48
  );
}

/**
 * Generate rule objects from the `at` mapping.
 * This function processes each rule in the `at` object, extracts the old and new forms,
 * singularises them, and then extracts the transformation rules.
 * @param {*} mapping an object mapping keys to rule strings.
 */
export function generateRuleObjects(mapping) {
  for (const key in mapping) {
    generateRuleObj(key, mapping[key]);
  }
}

/**
 * Generate a rule object from a key and a rule string.
 * @param {*} key 
 * @param {*} rule 
 */
export function generateRuleObj(key, rule) {
  // Extract the first blob:
  const oldFormRegex = /\[([^\]]*)/u;
  const oldForm = oldFormRegex.exec(rule)?.[1];
  // Extract the second blob:
  const newFormRegex = /\> \[([^\]]*)/;
  const newForm = newFormRegex.exec(rule)?.[1];

  const oldStr = singularise(oldForm);
  const newStr = singularise(newForm);

  console.log(`Old: ${key}: '${oldStr}'`);
  console.log(`New: ${key}: '${newStr}'`);

  const rules = extractRules(oldStr, newStr);

  // console.log('\nRules:');
  // console.dir(rules, { depth: null });
  return rules;
}

/**
 * Extract transformation rules from old and new string forms.
 * @param {*} _oldStr
 * @param {*} _newStr
 * @returns an array of rule objects representing the transformations.
 */
export function extractRules(_oldStr, _newStr) {
  // console.log('--------------------------');
  
  // Decompose the strings:
  const oldStr = _oldStr.normalize(toMany);
  const newStr = _newStr.normalize(toMany);

  const rules = [];

  let oldDigest = oldStr;
  let newDigest = newStr;

  const pos = extractRulesPos(oldStr);

  // Split on pipes:
  oldDigest = oldDigest.split('|');
  newDigest = newDigest.split('|');

  if (oldDigest.length !== newDigest.length) {
    throw new Error('Mismatched number of pipe-separated options between old and new forms.');
  }

  // console.log('Pipes split -->');
  // console.log('Old:', {oldDigest});
  // console.log('New:', {newDigest});
  // console.log('\nProcessing old rules:');
  for (let i = 0; i < oldDigest.length; i++) {
    const oldR = oldDigest[i];
    const newR = newDigest[i];
    // console.log(`Old ${oldR}.`);
    // console.log(`New ${newR}.`);
    rules.push(correlateRules(oldR, newR));
  }
  // console.log('-> Final rules:');
  // console.dir(rules, { depth: null });
  return { pos, rules };
}

/**
 * Extract the position of a rule from its string representation.
 * @param {*} str 
 * @returns 'initial', 'medial', 'final', or 'any' based on the rule's position.
 */
export function extractRulesPos(str) {
  const finalRegex = /^\-([^-]*)$/;
  const initialRegex = /(^[^\-]*)\-$/;
  const medialRegex = /^\-([^\-]*)\-$/;

  let pos = 'any';
    // Determine position (initial, medial, final):
  if (finalRegex.test(str)) {
    pos = 'final';
  } else
  if (initialRegex.test(str)) {
    pos = 'initial';
  } else
  if (medialRegex.test(str)) {
    pos = 'medial';
  }
  return pos;
}

/**
 * Correlate transformation rules between old and new representations.
 * @param {*} oldR 
 * @param {*} newR 
 * @returns a rule object representing the correlated transformations.
 */
export function correlateRules(oldR, newR) {
  // console.log('\n-> Correlating rules:');
  const { patterns: oldPatterns, elements: oldElements, rulePostGroup: oldRulePostGroupProto } = extractGroupPatterns(oldR);
  const { patterns: newPatterns, elements: newElements, rulePostGroup: newRulePostGroupProto } = extractGroupPatterns(newR);
  const { marks: oldMarks, rulePostGroup: oldRulePostGroup, coindex: oldCoindex } = extractMarks(oldRulePostGroupProto);
  const { marks: newMarks, rulePostGroup: newRulePostGroup, coindex: newCoindex } = extractMarks(newRulePostGroupProto);

  // console.log('-- Old rule:', { oldR, oldPatterns, oldElements, oldRulePostGroup, oldMarks, oldCoindex });
  // console.log('-- New rule:', { newR, newPatterns, newElements, newRulePostGroup, newMarks, newCoindex });

  const flattenedOldPatterns = removeMarksAndCoindex(oldRulePostGroup);
  const flattenedNewPatterns = removeMarksAndCoindex(newRulePostGroup);

  if (flattenedOldPatterns.length !== flattenedNewPatterns.length) {
    throw new Error(`Mismatched lengths after extracting group patterns. ${flattenedOldPatterns} !== ${flattenedNewPatterns}`);
  }

  const oldChars = oldRulePostGroup.split('');
  const newChars = newRulePostGroup.split('');
  
  return makeRuleFromChars(oldChars, newChars, oldElements, newElements, oldMarks, newMarks, oldCoindex, newCoindex);
}

/**
 * Extract marks and their coindices from a rule string.
 * @param {*} _str 
 * @returns an object containing marks, rulePostGroup, and coindex.
 */
export function extractMarks(_str) {
  const str = _str.normalize(toMany);
  const coindex = {};
  const marks = {};
  const rulePostGroupArray = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const next = str[i + 1];

    if (isMark(next)) {
      marks[rulePostGroupArray.length] = next;
    }
    if (isMark(char) && isSubscriptDigit(next)) {
      coindex[rulePostGroupArray.length - 1] = subscriptToNormal(next);
      i++;
      continue;
    } else
    if (isSubscriptDigit(char)) {
      coindex[rulePostGroupArray.length - 1] = subscriptToNormal(char);
    } else {
      rulePostGroupArray.push(char);
    }
  }
  return { marks, rulePostGroup: rulePostGroupArray.join(''), coindex };
}

/**
 * Correlate transformation rules between old and new representations.
 * @param {*} oldChars Array of single characters representing the old form.
 * @param {*} newChars Array of single characters representing the new form.
 * @param {*} oldElements Array of the groups that replace '$' in the old form.
 * @param {*} newElements Array of the groups that replace '$' in the new form.
 * @param {*} oldMarks Object mapping positions to old mark characters.
 * @param {*} newMarks Object mapping positions to new mark characters.
 * @param {*} oldCoindex Object mapping positions to old coindex digits.
 * @param {*} newCoindex Object mapping positions to new coindex digits.
 * @returns a rule object representing the correlated transformations.
 */
export function makeRuleFromChars(oldChars, newChars, oldElements, newElements, oldMarks, newMarks, oldCoindex, newCoindex) {
  // console.log(' --> Making rule from chars');
  const rules = [];

  for (let i = 0; i < oldChars.length; i++) {
    const rule = {};
    const oldChar = oldChars[i];
    const newChar = newChars[i];
    // console.log(` --- Char pair: '${oldChar}' -> '${newChar}'`);

    let oldCharElement = oldChar;
    let newCharElement = newChar;

    if (oldChar === '$') {
      oldCharElement = oldElements.shift();
    }
    if (newChar === '$') {
      newCharElement = newElements.shift();
    }

    // console.log(`Char pair: '${oldCharElement}' -> '${newCharElement}'`);

    rule.find = oldCharElement.split('').map(c => reverseMap[c] || c);
    rule.replace = newCharElement.split('').map(c => reverseMap[c] || c);

    if (oldMarks.hasOwnProperty(i)) {
      rule.omrk = oldMarks[i];
    }
    if (newMarks.hasOwnProperty(i)) {
      rule.nmrk = newMarks[i];
    }
    if (oldCoindex.hasOwnProperty(i)) {
      rule.oidx = oldCoindex[i];
    }
    if (newCoindex.hasOwnProperty(i)) {
      rule.nidx = newCoindex[i];
    }

    // console.log(' --- elements:', rule);
    rules.push(rule);
  }

  // console.log('Final rules:');
  // console.dir(rules, { depth: null });
  return rules;
}

/**
 * Extract group patterns and their elements from a rule string.
 * @param {*} rule 
 * @returns an object containing patterns, elements, and rulePostGroup.
 */
export function extractGroupPatterns(rule) {
  const groupRegex = /(\{([^\}]*)\})/g;
  let regexMatch;
  let patterns = [];
  let elements = [];

  let rulePostGroup = rule;
  while ((regexMatch = groupRegex.exec(rule)) !== null) {
    if (regexMatch[1].length > 1) {
      patterns.push(regexMatch[1]);
      rulePostGroup = rulePostGroup.replace(regexMatch[1], '$');
    }
    if (regexMatch[2].length > 1) {
      elements.push(regexMatch[2]);
    }
  }

  return { patterns, elements, rulePostGroup };
}

export function isVowel(char) {
  return 'aeiouāēīōūAEIOUĀĒĪŌŪ'.includes(char);
}

export function removeMarksAndCoindex(str) {
  return str.normalize(toMany).replace(/[\p{Mn}\u2080-\u2089]/gu, '').normalize(toOne);
}
