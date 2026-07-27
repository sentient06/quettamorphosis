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
    
    expect(quenyaRules['1197128543'].mechanic('nanmen').out).toBe('nanwen');
  });
});