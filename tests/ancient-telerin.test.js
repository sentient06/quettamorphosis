import { describe, it, expect } from "vitest";
import { ancientTelerinRules } from "../src/ancient-telerin.js";
import { digraphsToSingle, singleToDigraphs } from "../src/utils.js";

// Helper to convert test input to single-char form (simulating pre-processing)
const toSingle = (str) => digraphsToSingle(str);

describe('Ancient Telerin rules', () => {
  it('00100 - unstressed initial syllables reduced to favored clusters', () => {
    expect(ancientTelerinRules['3648128347'].mechanic('abc')).toBe('abc');
    expect(ancientTelerinRules['3648128347'].mechanic('barándā')).toBe('brandā');
    expect(ancientTelerinRules['3648128347'].mechanic('barándē')).toBe('brandē');
    expect(ancientTelerinRules['3648128347'].mechanic('barássē')).toBe('brassē');
    expect(ancientTelerinRules['3648128347'].mechanic('barásta-')).toBe('brasta-');
    expect(ancientTelerinRules['3648128347'].mechanic('barátʰil')).toBe('bratʰil');
    // The one below fails when using Sindarin rules for stressed syllables:
    expect(ancientTelerinRules['3648128347'].mechanic('kalánt-')).toBe('klant-');
    expect(ancientTelerinRules['3648128347'].mechanic('kalā́t-')).toBe('klāt-');
    expect(ancientTelerinRules['3648128347'].mechanic('kirísse')).toBe('krisse');
    expect(ancientTelerinRules['3648128347'].mechanic('kiríste')).toBe('kriste');
    expect(ancientTelerinRules['3648128347'].mechanic('palátā')).toBe('platā');
    expect(ancientTelerinRules['3648128347'].mechanic('pʰilíŋke')).toBe('pʰliŋke');
    expect(ancientTelerinRules['3648128347'].mechanic('turuŋko')).toBe('truŋko');
  });
});
