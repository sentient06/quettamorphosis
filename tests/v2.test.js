import { describe, it, expect } from "vitest";
import { processCharReplacement, isMatch, processAt } from "../src/v2.js";

describe.skip('processCharReplacement', () => {
  it('can process a string', () => {
    const result = processCharReplacement('a', 'a');
    expect(result).toBe('a');
  });

  it('can process a string', () => {
    const result = processCharReplacement('a', 'b');
    expect(result).toBe('');
  });

  it('can process an array', () => {
    const result = processCharReplacement('a', ['b', 'a']);
    expect(result).toBe('a');
  });

  it('can process V', () => {
    const result = processCharReplacement('a', 'V');
    expect(result).toBe('a');
  });
  
  it('can process C', () => {
    const result = processCharReplacement('b', 'C');
    expect(result).toBe('b');
  });

  it('can process ø', () => {
    const result = processCharReplacement('a', 'ø');
    expect(result).toBe('');
  });

  it('can process marks', () => {
    const result = processCharReplacement('a', 'V́');
    expect(result).toBe('á');
  });
});

describe.skip('isMatch', () => {
  it('can match a literal', () => {
    const result = isMatch('a', 'a');
    expect(result).toBe(true);
  });

  it('can match a vowel', () => {
    const result = isMatch('a', 'V');
    expect(result).toBe(true);
  });

  it('can match a consonant', () => {
    const result = isMatch('f', 'C');
    expect(result).toBe(true);
  });

  it('can match a marked vowel', () => {
    const result = isMatch('á', 'V́');
    expect(result).toBe(true);
  });

  it('can reject a marked vowel', () => {
    const result = isMatch('a', 'V́');
    expect(result).toBe(false);
  });
});

describe('processAt', () => {
  it.skip('can process a word with 00100', () => {
    const result = processAt('bará');
    expect(result).toBe('brá');
  });

  it('can process a word with 00200', () => {
    const result = processAt('gwa');
    expect(result).toBe('ba');
  });
});