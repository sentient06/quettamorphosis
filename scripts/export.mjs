import { primitiveElvishRules } from '../src/primitive-elvish.js';
import { ancientTelerinRules } from '../src/ancient-telerin.js';
import { oldSindarinRules } from '../src/old-sindarin.js';
import { sindarinRules } from '../src/sindarin.js';

const ruleMap = {
    "p": primitiveElvishRules,
    "at": ancientTelerinRules,
    "os": oldSindarinRules,
    "s": sindarinRules,
};

const rulesById = {};

for (const [lang_code, langRules] of Object.entries(ruleMap)) {
    for (const [id, rule] of Object.entries(langRules)) {
        if (rule.isSandhi) {
            continue;
        }
        rulesById[id] = {
            id,
            orderId: rule.orderId,
            pattern: rule.pattern,
            description: rule.description,
            lang: lang_code
        };
    }
}

console.log(JSON.stringify(rulesById, null, 2));