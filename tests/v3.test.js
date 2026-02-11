import { describe, it, expect } from "vitest";
import {
  at,
  singularise,
  isMark,
  isSubscriptDigit,
  subscriptToNormal,
  generateRuleObjects,
  generateRuleObj,
  extractRules,
  extractRulesPos,
  correlateRules,
  extractMarks,
  makeRuleFromChars,
  extractGroupPatterns,
  applyRules,
} from "../src/v3.js";

describe('Helper functions', () => {
  it('singularise should replace multiple characters for a phonetical value for a single token', () => {
    expect(singularise(at['00100'])).toEqual('[{ptkПФbdgm}V₁{rl}V́₁-] > [{ptkПФbdgm}ø{rl}V́₁-]');
    expect(singularise(at['00200'])).toEqual('[Ѯ|Ж|Ҕ|Ч|Ш|Ҩ-] > [p|П|b|Ц|Ю|m-]');
    expect(singularise(at['00300'])).toEqual('[{tДdnl}j-] > [{tДdnl}ø-]');
    expect(singularise(at['00400'])).toEqual('[ln] > [ll]');
    expect(singularise(at['00500'])).toEqual('[-SV{ptks}] > [-SVø]');
    expect(singularise(at['00600'])).toEqual('[{mn}s] > [ss]');
  });

  it('isMark should identify combining marks', () => {
    expect(isMark('a')).toBe(false);
    expect(isMark('́')).toBe(true); // U+0301 COMBINING ACUTE ACCENT
    expect(isMark('̩')).toBe(true); // U+0329 COMBINING VERTICAL LINE BELOW
    expect(isMark('á')).toBe(true); // 'a' + U+0301
    expect(isMark('')).toBe(false);
    expect(isMark(null)).toBe(false);
    expect(isMark(undefined)).toBe(false);
  });

  it('isSubscriptDigit should identify subscript digits', () => {
    expect(isSubscriptDigit('₀')).toBe(true); // U+2080
    expect(isSubscriptDigit('₁')).toBe(true); // U+2081
    expect(isSubscriptDigit('₂')).toBe(true); // U+2082
    expect(isSubscriptDigit('₃')).toBe(true); // U+2083
    expect(isSubscriptDigit('₄')).toBe(true); // U+2084
    expect(isSubscriptDigit('₅')).toBe(true); // U+2085
    expect(isSubscriptDigit('₆')).toBe(true); // U+2086
    expect(isSubscriptDigit('₇')).toBe(true); // U+2087
    expect(isSubscriptDigit('₈')).toBe(true); // U+2088
    expect(isSubscriptDigit('₉')).toBe(true); // U+2089
    expect(isSubscriptDigit('a')).toBe(false);
    expect(isSubscriptDigit('1')).toBe(false);
    expect(isSubscriptDigit('')).toBe(false);
    expect(isSubscriptDigit(null)).toBe(false);
    expect(isSubscriptDigit(undefined)).toBe(false);
  });

  it('subscriptToNormal should convert subscript digits to normal digits', () => {
    expect(subscriptToNormal('H₂O')).toBe('H2O');
    expect(subscriptToNormal('C₆H₁₂O₆')).toBe('C6H12O6');
    expect(subscriptToNormal('₀₁₂₃₄₅₆₇₈₉')).toBe('0123456789');
    expect(subscriptToNormal('No subscripts here!')).toBe('No subscripts here!');
    expect(subscriptToNormal('')).toBe('');
    expect(subscriptToNormal(null)).toBe(null);
    expect(subscriptToNormal(undefined)).toBe(undefined);
  });
});

describe('Rule generation and extraction', () => {
  it('extractGroupPatterns should extract group patterns and their elements', () => {
    const rule = 'a{nŋ}{pПb}|b{mŋ}{tДd}|{mn}{kФg}z';
    const { patterns, elements, rulePostGroup } = extractGroupPatterns(rule);
    expect(patterns).toEqual(['{nŋ}', '{pПb}', '{mŋ}', '{tДd}', '{mn}', '{kФg}']);
    expect(elements).toEqual(['nŋ', 'pПb', 'mŋ', 'tДd', 'mn', 'kФg']);
    expect(rulePostGroup).toBe('a$$|b$$|$$z');
  });

  it('makeRuleFromChars should create a rule from character arrays', () => {
    const oldChars = ['$', 'V', '$', 'V', '-'];
    const newChars = ['$', 'ø', '$', 'V', '-'];
    const oldElements = ['ptkПФbdgm', 'rl'];
    const newElements = ['ptkПФbdgm', 'rl'];
    const oldMarks = { '3': '́' };
    const newMarks = { '3': '́' };
    const oldCoindex = { '1': '1', '3': '1' };
    const newCoindex = { '3': '1' };
    const rule = makeRuleFromChars(oldChars, newChars, oldElements, newElements, oldMarks, newMarks, oldCoindex, newCoindex);
    expect(rule).toEqual([
      { find: ['p', 't', 'k', 'pʰ', 'kʰ', 'b', 'd', 'g', 'm'], replace: ['p', 't', 'k', 'pʰ', 'kʰ', 'b', 'd', 'g', 'm'] },
      { find: ['V'], replace: ['ø'], oidx: '1' },
      { find: ['r', 'l'], replace: ['r', 'l'] },
      { find: ['V'], replace: ['V'], oidx: '1', nidx: '1', omrk: '́', nmrk: '́' },
      { find: ['-'], replace: ['-'] },
    ]);
  });

  it('extractMarks should extract marks and coindexing from a rule string', () => {
    const rule = 'V́b₁c̩d₂é';
    const { marks, rulePostGroup, coindex } = extractMarks(rule);
    expect(marks).toEqual({ '0': '́', '3': '̩', '6': '́' });
    expect(coindex).toEqual({ '5': '2', '2': '1' });
    expect(rulePostGroup).toBe('V́bc̩dé');
  });

  it('correlateRules should correlate old and new rules correctly', () => {
    const oldRule = '{ptkПФbdgm}V₁{rl}V́₁-';
    const newRule = '{ptkПФbdgm}ø{rl}V́₁-';
    const ruleObj = correlateRules(oldRule, newRule);
    expect(ruleObj).toEqual([
      { find: ['p', 't', 'k', 'pʰ', 'kʰ', 'b', 'd', 'g', 'm'], replace: ['p', 't', 'k', 'pʰ', 'kʰ', 'b', 'd', 'g', 'm'] },
      { find: ['V'], replace: ['ø'], oidx: '1' },
      { find: ['r', 'l'], replace: ['r', 'l'] },
      { find: ['V'], replace: ['V'], oidx: '1', nidx: '1', omrk: '́', nmrk: '́' },
      { find: ['-'], replace: ['-'] },
    ]);
  });

  it('extractRulesPos should extract rules with positions', () => {
    const ruleA = '{abc}d{ef}-';
    const ruleB = '-{abc}d{ef}-';
    const ruleC = '-{abc}d{ef}';
    const ruleD = '{abc}d{ef}';
    const posA = extractRulesPos(ruleA);
    const posB = extractRulesPos(ruleB);
    const posC = extractRulesPos(ruleC);
    const posD = extractRulesPos(ruleD);
    expect(posA).toBe('initial');
    expect(posB).toBe('medial');
    expect(posC).toBe('final');
    expect(posD).toBe('any');
  });

  it('extractRules should extract and correlate rules correctly', () => {
    const oldRule = 'l|{ptkПФbdgm}V₁{rl}V́₁-';
    const newRule = 'r|{ptkПФbdgm}ø{rl}V́₁-';
    const ruleObj = extractRules(oldRule, newRule);
    expect(ruleObj).toEqual({
      pos: 'initial',
      rules: [
        [
          {
            find: ["l"],
            replace: ["r"],
          }
        ],
        [
          {
            find: ["p", "t", "k", "pʰ", "kʰ", "b", "d", "g", "m"],
            replace: ["p", "t", "k", "pʰ", "kʰ", "b", "d", "g", "m"],
          },
          {
            find: ["V"],
            oidx: "1",
            replace: ["ø"],
          },
          {
            find: ["r","l"],
            replace: ["r","l"],
          },
          {
            find: ["V"],
            nidx: "1",
            nmrk: "́",
            oidx: "1",
            omrk: "́",
            replace: ["V"],
          },
          {
            "find": ["-"],
            "replace": ["-"],
          },
        ]
    ],
    });
  });

  it('generateRuleObj should generate a rule from a string', () => {
    const ruleStr = '[{ppʰ}V-] > [{pt}V-]';
    const ruleObj = generateRuleObj('666', ruleStr);
    expect(ruleObj).toEqual({
      pos: 'initial',
      rules: [
        [
          { find: ['p', 'pʰ'], replace: ['p', 't'] },
          { find: ['V'], replace: ['V'] },
          { find: ['-'], replace: ['-'] },
        ],
      ],
    });
  });
});

describe.skip('Apply rules', () => {
  it('applyRules should apply rules to a word', () => {
    // https://eldamo.org/content/words/word-405178457.html
  });
});