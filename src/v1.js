const at = {
  '00100': '[{ptkpʰkʰbdgm}V₁{rl}V́₁-] > [{ptkpʰkʰbdgm}ø{rl}V́₁-]',
  '00200': '[kw|kʰw|gw|ŋgw|ŋkw|ŋw-] > [p|pʰ|b|mb|mp|m-]',
  '00300': '[{ttʰdnl}j-] > [{ttʰdnl}-]',
  '00400': '[ln] > [ll]',
  '00500': '[-SV{ptks}] > [-SVø]',
  '00600': '[{mn}s] > [ss]',
};

export function isSubscriptDigit(char) {
  const code = char.codePointAt(0);
  return code >= 0x2080 && code <= 0x2089;
}

export function subscriptToNormal(str) {
  return str.replace(/[\u2080-\u2089]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x2050) // offset: 8320 - 48
  );
}

export function normalToSubscript(str) {
  return str.replace(/\d/g, d =>
    String.fromCharCode(d.charCodeAt(0) + 0x2050)
  );
}

function isCombiningMark(ch) {
  return /\p{M}/u.test(ch);  // "M" = Mark (Mn, Mc, Me)
}

function toUnicodeEscape(ch) {
  const cp = ch.codePointAt(0);
  return cp <= 0xFFFF
    ? "\\u" + cp.toString(16).padStart(4, "0")
    : "\\u{" + cp.toString(16) + "}";
}

export function runAtRule(ruleId, word) {
  const rule = at[ruleId];
  return runRule(rule, word);
}

export function runRule(rule, word) {
  return make
RegexObj(rule);
}

function normaliseForRegex(str) {
  // Case 1: looks like an escape sequence already
  if (/^\\u[0-9a-fA-F]{4}$/.test(str)) {
    // Preserve but normalise hex to uppercase
    const hex = str.slice(2).toUpperCase();
    return "\\u" + hex;
  }
  // Case 2: actual character
  const cp = str.codePointAt(0);
  if (cp <= 0xFFFF) {
    return "\\u" + cp.toString(16).toUpperCase().padStart(4, "0");
  } else {
    return "\\u{" + cp.toString(16).toUpperCase() + "}"; // needs /u flag
  }
}

export function makeRegex(obj) {
  let pattern = '';

  for (let i = 0; i < obj.length; i++) {
    const bit = obj[i];

    if (bit.hasOwnProperty('pre')) {
      const pre = makeRegex([bit.pre]);
      pattern += pre.source;
    }

    if (bit.group) {
      pattern += '(';
      if (!bit.capture) {
        pattern += '?:';
      }
    }

    if (bit.hasOwnProperty('val')) {
      if (bit.val.length === 1) {
        pattern += bit.val[0];
      } else {
        pattern += `[${bit.val.join('')}]`;
      }
    }

    if (bit.hasOwnProperty('match')) {
      pattern += `\\${bit.match}`;
    }

    if (bit.hasOwnProperty('any') && bit.any === true) {
      pattern += '.*';
    }

    if (bit.hasOwnProperty('suf')) {
      pattern += normaliseForRegex(bit.suf);
    }

    if (bit.group) {
      pattern += ')';
    }

    if (bit.hasOwnProperty('post')) {
      pattern += bit.post;
    }
  }
  return new RegExp(pattern, 'u');
}

export function makeOldRegexObj(rule) {
  // Extract the first blob:
  const oldFormRegex = /\[([^\]]*)/u;
  const oldForm = oldFormRegex.exec(rule)?.[1];
  return makeRegexObj(oldForm);
}

export function makeNewRegexObj(rule) {
  // Extract the second blob:
  const newFormRegex = /\> \[([^\]]*)/;
  const newForm = newFormRegex.exec(rule)?.[1];
  return makeRegexObj(newForm);
}

export function makeRegexObj(formStr) {
  // Try to parse the code:

  const charChecks = [];
  let checksIdx = 0;
  let inMulti = false;
  const captureGroups = [];

  for (let i = 0; i < formStr.length; i++) {

    let char = formStr[i];
    let next = formStr[i + 1];
    let mark = null;

    const normal = char.normalize('NFD');
    if (normal.length > 1) {
      char = normal[0];
      mark = normal[1];
    }

    if (isCombiningMark(next)) {
      console.log('-> next is mark, skipping mark');
      mark = next;
      next = formStr[i + 2];
    }

    if (isCombiningMark(char)) {
      console.log('-> char is mark, skipping char');
      continue;
    }

    console.log({char, next});

    // Handle lists:
    if (char === '{') {
      inMulti = true;
      console.log('skip {');
      continue;
    }
    if (char === '}') {
      inMulti = false;
      console.log('skip }');
      console.log('-> next object');
      checksIdx++;
      continue;
    }

    if (char === 'ʰ' || isSubscriptDigit(char) ) {
      console.log('skip aspirated or group number');
      continue;
    }

    // Set object:
    if (typeof charChecks[checksIdx] === 'undefined') {
      if (charChecks[checksIdx] === undefined) {
        console.log('object set');
        charChecks[checksIdx] = {};
      }
    }

    // Handle coindexed characters group capture:
    if (next && isSubscriptDigit(next)) {
      console.log('capture group', next);
      const groupName = `${subscriptToNormal(next)}`;
      if (captureGroups.includes(groupName)) {
        console.log('coindexed group');
        charChecks[checksIdx].match = groupName;
        if (mark !== null) {
          charChecks[checksIdx].suf = toUnicodeEscape(mark);
        }
      } else {
        console.log('new group');
        charChecks[checksIdx].group = true;
        charChecks[checksIdx].capture = true;
        charChecks[checksIdx].name = groupName;
        captureGroups.push(groupName);
      }
    }

    // Aspirated consonants:
    if (next === 'ʰ') {
      console.log('aspirated consonant');
      if (typeof charChecks[checksIdx].pre === 'undefined') {
        charChecks[checksIdx].pre = { val: [], suf: '', group: true, capture: false, post: '|' };
      }
      charChecks[checksIdx].pre.suf = next;
      charChecks[checksIdx].pre.val.push(char);
    } else

    // If we have a match group set, the whole value must be the previous group's name, so it's skipped:
    if (!charChecks[checksIdx].match) {
      if (charChecks[checksIdx].hasOwnProperty('val') === false) {
        charChecks[checksIdx].val = [];
      }
      if (char === 'V') {
        console.log('added vowel');
        charChecks[checksIdx].val = ['a', 'e', 'i', 'o', 'u'];
      } else
      // Handle any character:  
      if (char === '-') {
        console.log('any character');
        charChecks[checksIdx] = { any: true };
      } else {
        console.log('added char');
        charChecks[checksIdx].val.push(normal);
      }
    } else {
      console.log('skipped char, match group already set');
    }

    if (!inMulti) {
      console.log('-> next object');
      checksIdx++;
    }
  }
  return charChecks;
}




