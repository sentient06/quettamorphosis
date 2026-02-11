const at = {
//   '00100': '[{ptkpʰkʰbdgm}V₁{rl}V́₁-] > [{ptkpʰkʰbdgm}ø{rl}V́₁-]',
  '00200': '[kw|kʰw|gw|ŋgw|ŋkw|ŋw-] > [p|pʰ|b|mb|mp|m-]',
//   '00300': '[{ttʰdnl}j-] > [{ttʰdnl}-]',
//   '00400': '[ln] > [ll]',
//   '00500': '[-SV{ptks}] > [-SVø]',
//   '00600': '[{mn}s] > [ss]',
};

const toOne = 'NFC';
const toMany = 'NFD';

export function isVowel(ch) {
  return 'aeiouáéíóúAEIOUÁÉÍÓÚ'.includes(ch);
}

export function assembleMatchRules(_pattern) {
    const pattern = _pattern.normalize(toOne);
    const charMatches = [];
    const groupMatches = [];
    let startedGroup = false;
    let pipeDetected = false;

    for (let i = 0; i < pattern.length; i++) {
        const next = pattern[i + 1];
        const double = next === 'ʰ' || next === '₁';
        const char = `${pattern[i]}${double ? next : ''}`;
        if (char === '|') {
            pipeDetected = true;
        }

        if (char === '[' || char === ']' || char === '|') {
            continue;
        }

        // Groups:
        if (char === '{') {
            startedGroup = true;
        } else
        if (char === '}' && startedGroup) {
            startedGroup = false;
            charMatches.push({ val: groupMatches, type: 'any' });
        } else
        // Pipes:
        if (pipeDetected) {
            charMatches.push({ val: [char] , type: 'single' });
            pipeDetected = false;
        } else
        // Add to array:
        if (startedGroup) {
            groupMatches.push(char);
        } else {
            if (charMatches.length > 0) {
                charMatches[charMatches.length - 1].type = 'either';
                charMatches[charMatches.length - 1].val[0] += char;
            } else {
                charMatches.push({ val: [char] , type: 'single' });
            }
        }

        // Skip double chars:
        if (double) {
            i++;
        }
    }
    return charMatches;
}

export function isMatch(idx, word, matchRule) {
    const barriers = ['{', '}', '[', ']', '|', '-'];
    let _c = '';
    let _char = '';
    let c = 0;
    let vowel = false;
    let consonant = false;
    do {
        _c = word.substring(idx + c, idx + c + 1);
        if (consonant && isVowel(_c)) {
            break;
        }
        if (vowel && !isVowel(_c)) {
            break;
        }
        vowel = isVowel(_c);
        consonant = !vowel;
        _char += _c;
        c++;
    } while (barriers.indexOf(_c) === -1 && c < word.length);
    
    console.log('- isMatch:', word, idx, _char);

    let result = { idx: idx + 1, result: false };

    if (matchRule?.constructor === Object) {
        console.log(' -- Match rule is object:', matchRule);
        const { val, type } = matchRule;
        if (type === 'single' || type === 'any') {
            result = isMatch(idx, _char, val);
        } else
        if (type === 'either') {
            result = isMatch(0, _char, val);
        }
    } else
    if (Array.isArray(matchRule)) {
        console.log(' -- Match rule is array:', matchRule);
        for (const rule of matchRule) {
             const nestedR = isMatch(0, _char, rule);
             result.result = result.result || nestedR.result;
             result.idx = nestedR.idx;
        }
    } else
    if (typeof matchRule === 'string') {
        console.log(' -- Match rule is string:', matchRule);

        if (_char.length > 1) {
            result.result = result.result || (_char === matchRule);
            result.idx = idx + _char.length;
            result = isMatch(result.idx, _char, matchRule);
        }
        else {
            const [char, mark] = _char.normalize(toMany);
            const [ruleBase, ruleMark] = matchRule.normalize(toMany);
            if (ruleBase === 'V') {
                result.result = isVowel(char);
            } else if (ruleBase === 'C') {
                result.result = !isVowel(char);
            } else {
                console.log({char, ruleBase});
                result.result = char === ruleBase;
            }

            if (result.result && ruleMark) {
                result.result = mark === ruleMark;
            }
        }
    }
    return result;
}

export function assembleReplacementRules(replacement) {
    let charReplacements = [];
    let startedGroupReplacement = false;
    const groupMatchesReplacement = [];
    for (let i = 0; i < replacement.length; i++) {
        let rep = replacement[i];
        const next = replacement[i + 1];
        const double = next === 'ʰ' || next === '₁';
        
        if (double) {
            rep += next;
        }
        if (rep === '[' || rep === ']') {
            continue;
        }

        if (rep === '{') {
            startedGroupReplacement = true;
        } else if (rep === '}' && startedGroupReplacement) {
            startedGroupReplacement = false;
            charReplacements.push({ val: groupMatchesReplacement, type: 'any' });
        } else
        if (startedGroupReplacement) {
            groupMatchesReplacement.push(rep);
        } else {
            charReplacements.push({ val: [rep], type: 'single' });
        }

        if (double) {
            i++;
        }
    }
    return charReplacements;
}

export function processCharReplacement(char, replacement) {
    // console.log('- processCharReplacement:', char);
    let result = '';

    if (replacement.constructor === Object) {
        // console.log(' -- Replacement rule is object:', replacement);
        const { val, type } = replacement;
        if (type === 'single' || type === 'any') {
            result = result || processCharReplacement(char, val);
        }
    } else
    if (Array.isArray(replacement)) {
        // console.log(' -- Replacement rule is array:', replacement);
        for (const rep of replacement) {
            result = result || processCharReplacement(char, rep);
        }
    } else {
        // console.log(' -- Replacement rule is other:', replacement);
        const normalised = replacement.normalize(toMany);
        let base = normalised[0];
        let mark = normalised.length === 2 ? normalised[1] : null;
        if (base === 'ø') {
            result = '';
        }
        if (base === 'V') {
            if (isVowel(char)) {
                result = char;
            }
        } else if (base === 'C') {
            if (!isVowel(char)) {
                result = char;
            }
        } else {
            if (base === char) {
                result = char;
            }
        }
        if (result !== '' && mark) {
            result = (result + mark).normalize(toOne);
        }
    }

    return result;
}

export function processAt(word) {
    const rules = Object.values(at);
    let charMatches = [];
    let charReplacements = [];
    const newWord = [];
    let digestedWord = word;

    for (const rule of rules) {
        const [pattern, replacement] = rule.split(' > ').map(part => part.trim().normalize(toOne));
        // console.log(`Applying rule: ${pattern} -> ${replacement}`);
        charMatches = assembleMatchRules(pattern);
        // console.log('Char matches:', charMatches);
        charReplacements = assembleReplacementRules(replacement);
        // console.log('Char replacements:', charReplacements);

        for (let i = 0; i < digestedWord.length; i++) {
            console.log(digestedWord, i);
            
            // let char = digestedWord[i];
            // const next = digestedWord[i + 1];
            // const aspirated = next === 'ʰ';
            // if (aspirated) {
            //     char += next;
            // }
            // const charIsVowel = isVowel(char);
            // const charIsConsonant = !charIsVowel;
            const matchRule = charMatches[i];
            const matchTest = isMatch(i, digestedWord, matchRule);
            console.log('Match test:', matchTest);
            if (matchTest.result === false) {
                i = matchTest.idx - 1;
            }
            // const replacementRule = charReplacements[i];
            // // console.log({char, matchRule, replacementRule});

            // if (isMatch(i, digestedWord, matchRule)) {
            //     console.log(`Matched ${char} with rule ${matchRule}`);
            //     const replaced = processCharReplacement(char, replacementRule);
            //     console.log(`Replaced ${char} with ${replaced} using rule ${replacementRule}`);
            //     newWord.push(replaced);
            // }
            
            // if (aspirated) {
            //     i++;
            // }
        }

        digestedWord = newWord.join('');
    }

    return digestedWord;
}