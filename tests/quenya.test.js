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

  it('00400 - [ei|ou] > [ī|ū]', () => {
    expect(quenyaRules['2315722009'].mechanic('abc').out).toBe('abc');

    // ei > ī
    // ou > ū
    // but
    // ei > ē after y
    // ou > ō after w
    
    expect(quenyaRules['2315722009'].mechanic('keneite').out).toBe('kenīte');
    expect(quenyaRules['2315722009'].mechanic('laſeinen').out).toBe('laſīnen');
    expect(quenyaRules['2315722009'].mechanic('meinā').out).toBe('mīnā');
    expect(quenyaRules['2315722009'].mechanic('lou').out).toBe('lū');
    expect(quenyaRules['2315722009'].mechanic('loun').out).toBe('lūn');
    
    // No examples of the ones below. All words are non-existent.
    expect(quenyaRules['2315722009'].mechanic('bjeiba').out).toBe('bjēba');
    expect(quenyaRules['2315722009'].mechanic('bwouba').out).toBe('bwōba');
    // Regular change when j and w are not immediately before the diphthong:
    expect(quenyaRules['2315722009'].mechanic('bjbeiba').out).toBe('bjbība');
    expect(quenyaRules['2315722009'].mechanic('bwbouba').out).toBe('bwbūba');
  });

  it('00500 - [ji|wu] > [i|u]', () => {
    expect(quenyaRules['1167483479'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['1167483479'].mechanic('orōrjie').out).toBe('orōrie');
    expect(quenyaRules['1167483479'].mechanic('awuva').out).toBe('auva');
  });

  it('00600 - [V̄jV] > [VijV]', () => {
    expect(quenyaRules['3458631869'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['3458631869'].mechanic('ājan').out).toBe('aijan');
    expect(quenyaRules['3458631869'].mechanic('lājā').out).toBe('laijā');
    expect(quenyaRules['3458631869'].mechanic('mājar').out).toBe('maijar');
    expect(quenyaRules['3458631869'].mechanic('mōja').out).toBe('moija');
  });

  it('00700 - [{rl}{ɸθxð}] > [{rl}{ptkd}]', () => {
    expect(quenyaRules['3516399115'].mechanic('abc').out).toBe('abc');
    // lx > lk:
    expect(quenyaRules['3516399115'].mechanic('tulxast').out).toBe('tulkast');
    // lð > ld:
    expect(quenyaRules['3516399115'].mechanic('ɣalðā').out).toBe('ɣaldā');
    // lð > ld:
    expect(quenyaRules['3516399115'].mechanic('-lðe').out).toBe('-lde');
    // lβ > lb:
    expect(quenyaRules['3516399115'].mechanic('olβā').out).toBe('olbā');
    // rx > rk:
    expect(quenyaRules['3516399115'].mechanic('tarxildī').out).toBe('tarkildī');
    // rɸ > rp:
    expect(quenyaRules['3516399115'].mechanic('arɸō').out).toBe('arpō');
    // rθ > rt:
    expect(quenyaRules['3516399115'].mechanic('cerθa').out).toBe('certa');
  });

  it('00800 - [mɸ|nθ|ŋx|nð] > [mp|nt|ŋk|nd]', () => {
    expect(quenyaRules['545708645'].mechanic('abc').out).toBe('abc');

    // [mɸ] > [mp]:
    expect(quenyaRules['545708645'].mechanic('bamɸaba').out).toBe('bampaba'); // Non-existent word
    // [nθ] > [nt]:
    expect(quenyaRules['545708645'].mechanic('banθaba').out).toBe('bantaba'); // Non-existent word
    // [ŋx] > [ŋk]:
    expect(quenyaRules['545708645'].mechanic('baŋxaba').out).toBe('baŋkaba'); // Non-existent word

    // [nð] > [nd]:
    // The only example:
    expect(quenyaRules['545708645'].mechanic('inðil').out).toBe('indil');
  });

  it('00900 - [wo-] > [o-]', () => {
    expect(quenyaRules['1082322649'].mechanic('abc').out).toBe('abc');
    
    // Only real example that matters:
    expect(quenyaRules['1082322649'].mechanic('wo-').out).toBe('o-');

    // All of these are non-existent words:
    expect(quenyaRules['1082322649'].mechanic('wolme').out).toBe('olme');
    expect(quenyaRules['1082322649'].mechanic('wome').out).toBe('ome');
    expect(quenyaRules['1082322649'].mechanic('bawome').out).toBe('bawome');
    expect(quenyaRules['1082322649'].mechanic('bawome', { replaceAll: true }).out).toBe('baome');
  });
});