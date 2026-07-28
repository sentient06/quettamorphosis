import { describe, it, expect } from "vitest";
import { quenyaRules } from "../src/quenya.js";
import { digraphsToSingle, singleToDigraphs } from "../src/utils.js";

// Helper to convert test input to single-char form (simulating pre-processing)
const toSingle = (str) => digraphsToSingle(str);

describe('Quenya rules', () => {
  it('00100 - [nm|ŋm] > [nw|ŋgw]', () => {
    expect(quenyaRules['1197128543'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['1197128543'].mechanic('anmā').out).toBe('anwā');
    expect(quenyaRules['1197128543'].mechanic('lenmē').out).toBe('lenwē');
    expect(quenyaRules['1197128543'].mechanic('teŋmā').out).toBe('teŋgwā');
    expect(quenyaRules['1197128543'].mechanic('waŋme').out).toBe('waŋgwe');
    
    const compound = quenyaRules['1197128543'].mechanic('nanmen', { morphemes: ['nan', 'men'] });
    expect(compound.out).toEqual('nanwen');
    expect(compound.morphemes).toEqual(['nan', 'wen']);

    const compound2 = quenyaRules['1197128543'].mechanic('waŋme', { morphemes: ['waŋ', 'me'] });
    expect(compound2.out).toEqual('waŋgwe');
    expect(compound2.morphemes).toEqual(['waŋ', 'gwe']);
  });

  it('00200 - [{iu}ŋn] > [V̄øn]', () => {
    expect(quenyaRules['2035963219'].mechanic('abc').out).toBe('abc');
    
    expect(quenyaRules['2035963219'].mechanic('teŋmā', { includeE: true, includeM: true }).out).toBe('tēmā');
    expect(quenyaRules['2035963219'].mechanic('riŋna').out).toBe('rīna');
    // Middle Quenya:
    expect(quenyaRules['2035963219'].mechanic('luŋne').out).toBe('lūne'); // Middle Quenya
    expect(quenyaRules['2035963219'].mechanic('θuŋnā').out).toBe('θūnā'); // Middle Quenya
    // Other examples:
    expect(quenyaRules['2035963219'].mechanic('raŋne', { includeA: true }).out).toBe('rāne'); // Middle Quenya
    expect(quenyaRules['2035963219'].mechanic('toŋnā', { includeO: true }).out).toBe('tōnā'); // Non-existent word
  });

  it('00300 - [-{nŋlr}ŋ-] > [-{nŋlr}g-]', () => {
    expect(quenyaRules['447633467'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['447633467'].mechanic('morŋoθ').out).toBe('morgoθ');
    // All non-existent words:
    expect(quenyaRules['447633467'].mechanic('banŋba').out).toBe('bangba');
    expect(quenyaRules['447633467'].mechanic('baŋŋba').out).toBe('baŋgba');
    expect(quenyaRules['447633467'].mechanic('balŋba').out).toBe('balgba');
    expect(quenyaRules['447633467'].mechanic('barŋba').out).toBe('bargba');
  });
});