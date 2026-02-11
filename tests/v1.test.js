import { describe, it, expect } from "vitest";
import { isSubscriptDigit, subscriptToNormal, normalToSubscript, makeRegexObj, makeRegex } from "../src/v1.js";

describe.skip('utilities', () => {
  it('isSubscriptDigit identifies subscript digits', () => {
    expect(isSubscriptDigit('₂')).toBe(true);
    expect(isSubscriptDigit('₉')).toBe(true);
    expect(isSubscriptDigit('a')).toBe(false);
    expect(isSubscriptDigit('1')).toBe(false);
  });

  it('subscriptToNormalconverts subscript digits to normal digits', () => {
    expect(subscriptToNormal('H₂O')).toBe('H2O');
    expect(subscriptToNormal('C₆H₁₂O₆')).toBe('C6H12O6');
    expect(subscriptToNormal('NaCl')).toBe('NaCl'); // No subscripts
  });

  it('normalToSubscript converts normal digits to subscript digits', () => {
    expect(normalToSubscript('H2O')).toBe('H₂O');
    expect(normalToSubscript('C6H12O6')).toBe('C₆H₁₂O₆');
    expect(normalToSubscript('NaCl')).toBe('NaCl'); // No digits
  });
});

describe.skip('makeRegexObj', () => {
  it('handles single char', () => {
    const r = makeRegexObj('p');
    expect(r).toEqual([{ val: ['p'] }]);
  });

  it('handles nultiple chars', () => {
    const r = makeRegexObj('pt');
    expect(r).toEqual([{ val: ['p'] }, { val: ['t'] }]);
  });

  it('handles a list of chars', () => {
    const r = makeRegexObj('{pt}');
    expect(r).toEqual([{ val: ['p', 't'] }]);
  });

  it('handles a prefix', () => {
    const r = makeRegexObj('pʰp');
    expect(r).toEqual([
      {
        pre: {
          val: ['p'],
          suf: 'ʰ',
          group: true,
          capture: false,
          post: '|',
        },
      },
      {
        val: ['p'],
      }
    ]);
  });

  it('handles a prefix in a list', () => {
    const r = makeRegexObj('{pʰp}');
    expect(r).toEqual([
      {
        pre: {
          val: ['p'],
          suf: 'ʰ',
          group: true,
          capture: false,
          post: '|',
        },
        val: ['p'],
      }
    ]);
  });

  it('handles vowels', () => {
    const r = makeRegexObj('V');
    expect(r).toEqual([{ val: ['a', 'e', 'i', 'o', 'u'] }]);
  });

  it('handles a capture group', () => {
    const r = makeRegexObj('V₁');
    expect(r).toEqual([{ val: ['a', 'e', 'i', 'o', 'u'], group: true, capture: true, name: '1' }]);
  });

  it('handles coindexed vowels', () => {
    const r = makeRegexObj('V₁pV₁');
    expect(r).toEqual([{ val: ['a', 'e', 'i', 'o', 'u'], group: true, capture: true, name: '1' }, { val: ['p'] }, { match: '1' }]);
  });

  it('handles coindexed vowels with a mark', () => {
    const r = makeRegexObj('V₁pV́₁');
    expect(r).toEqual([{ val: ['a', 'e', 'i', 'o', 'u'], group: true, capture: true, name: '1' }, { val: ['p'] }, { match: '1', suf: '\\u0301' }]);
  });

  it('handles any character', () => {
    const r = makeRegexObj('-');
    expect(r).toEqual([{ any: true }]);
  });

  it('handles complex example', () => {
    const r = makeRegexObj('{ptkpʰkʰbdgm}V₁{rl}V́₁-');
    expect(r).toEqual([
      {
        pre: {
          capture: false,
          group: true,
          post: '|',
          suf: 'ʰ',
          val: ['p', 'k'],
        },
        val: ['p', 't', 'k', 'b', 'd', 'g', 'm'],
      },
      {
        val: ['a', 'e', 'i', 'o', 'u'],
        group: true,
        capture: true,
        name: '1',
      },
      { val: ['r', 'l'] },
      {
        match: '1',
        suf: '\\u0301',
      },
      { any: true },
    ]);
  });
});

describe('makeRegex', () => {
  it('can handle single characters', () => {
    const obj = makeRegexObj('pt');
    const r = makeRegex(obj);
    expect(r).toEqual(/pt/u);
  });

  it('can handle lists', () => {
    const obj = makeRegexObj('{pt}');
    const r = makeRegex(obj);
    expect(r).toEqual(/[pt]/u);
  });

  it('can handle groups', () => {
    const obj = makeRegexObj('V₁');
    const r = makeRegex(obj);
    expect(r).toEqual(/([aeiou])/u);
  });

  it('can handle prefixes', () => {
    const obj = makeRegexObj('pʰp');
    const r = makeRegex(obj);
    expect(r).toEqual(/(?:p\u02B0)|p/u);
  });

  it('can handle vowels', () => {
    const obj = makeRegexObj('V');
    const r = makeRegex(obj);
    expect(r).toEqual(/[aeiou]/u);
  });

  it('can handle coindexed groups', () => {
    const obj = makeRegexObj('V₁pV₁');
    const r = makeRegex(obj);
    expect(r).toEqual(/([aeiou])p\1/u);
  });

  it('can handle coindexed groups with marks', () => {
    const obj = makeRegexObj('V₁pV́₁');
    const r = makeRegex(obj);
    expect(r).toEqual(/([aeiou])p\1\u0301/u);
  });

  it('can handle any character', () => {
    const obj = makeRegexObj('-');
    const r = makeRegex(obj);
    expect(r).toEqual(/.*/u);
  });

  it('can handle complex example', () => {
    const obj = makeRegexObj('{ptkpʰkʰbdgm}V₁{rl}V́₁-');
    const r = makeRegex(obj);
    expect(r).toEqual(/(?:[pk]\u02B0)|[ptkbdgm]([aeiou])[rl]\1\u0301.*/u);
  });

  it('can match complex example with no accents', () => {
    const obj = makeRegexObj('{ptkpʰkʰbdgm}V₁{rl}V₁-');
    const r = makeRegex(obj);
    const tara = 'tara';
    expect(r).toEqual(/(?:[pk]\u02B0)|[ptkbdgm]([aeiou])[rl]\1.*/u);
    expect(tara).toMatch(r);
  });

  it('can match complex example with accents', () => {
    const obj = makeRegexObj('{ptkpʰkʰbdgm}V₁{rl}V́₁-');
    const r = makeRegex(obj);
    const tara = 'tará'.normalize('NFD');
    expect(r).toEqual(/(?:[pk]\u02B0)|[ptkbdgm]([aeiou])[rl]\1\u0301.*/u);
    expect(tara).toMatch(r);
  });

  // {ptkpʰkʰbdgm}ø{rl}V́₁-
});

// (?<=(?:[pk]\u02B0)|[ptkbdgm])(.?)(?=[rl]\1)

// Tests:

/*

'{ptkpʰkʰbdgm}V₁{rl}V́₁-'

[
  {
    pre: {
      val: ['p', 'k'],
      suf: '\u02B0',
      group: true,
      capture: false,
      post: '|',
    },
    val: ['p', 't', 'k', 'b', 'd', 'g', 'm'],
  },
  {
    val: ['a', 'e', 'i', 'o', 'u']
    group: true,
    capture: true,
    name: 'a',
  },
  { val: ['r', 'l'] },
  {
    match: 'a'
    suf: '\u0301',
  },
  { any: true },
]

/(?:[pk]\u02B0)|[ptkbdgm]([aeiou])[rl]\1\u0301.* /u


if pre -> process pre first

if anti: add anti

if array: list
else: single char

if suf -> process suf before moving on

if array: list
else if char: single char
else (there's nothing) continue

if match:
find previous group name
add \{index}

if any:
add .*

if group:
add brackets

if capture: do nothing.
else add ?:

if post: add post

next


*/