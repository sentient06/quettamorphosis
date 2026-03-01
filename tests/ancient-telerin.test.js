import { describe, it, expect } from "vitest";
import { ancientTelerinRules } from "../src/ancient-telerin.js";
import { digraphsToSingle, singleToDigraphs } from "../src/utils.js";

// Helper to convert test input to single-char form (simulating pre-processing)
const toSingle = (str) => digraphsToSingle(str);

describe('Ancient Telerin rules', () => {
  it('00100 - unstressed initial syllables reduced to favored clusters', () => {
    expect(ancientTelerinRules['3648128347'].mechanic('abc').out).toBe('abc');
    expect(ancientTelerinRules['3648128347'].mechanic('barándā').out).toBe('brandā');
    expect(ancientTelerinRules['3648128347'].mechanic('barándē').out).toBe('brandē');
    expect(ancientTelerinRules['3648128347'].mechanic('barássē').out).toBe('brassē');
    expect(ancientTelerinRules['3648128347'].mechanic('barásta-').out).toBe('brasta-');
    expect(ancientTelerinRules['3648128347'].mechanic('barátʰil').out).toBe('bratʰil');
    // The one below fails when using Sindarin rules for stressed syllables:
    expect(ancientTelerinRules['3648128347'].mechanic('kalánt-').out).toBe('klant-');
    expect(ancientTelerinRules['3648128347'].mechanic('kalā́t-').out).toBe('klāt-');
    expect(ancientTelerinRules['3648128347'].mechanic('kirísse').out).toBe('krisse');
    expect(ancientTelerinRules['3648128347'].mechanic('kiríste').out).toBe('kriste');
    expect(ancientTelerinRules['3648128347'].mechanic('palátā').out).toBe('platā');
    expect(ancientTelerinRules['3648128347'].mechanic('ƥilíŋke').out).toBe('ƥliŋke');
    expect(ancientTelerinRules['3648128347'].mechanic('turúŋko').out).toBe('truŋko');
    expect(ancientTelerinRules['3648128347'].mechanic('turuŋko', { guessStress: true }).out).toBe('truŋko');
    // Initial clusters shouldn't trigger change:
    expect(ancientTelerinRules['3648128347'].mechanic('kjelekormo').out).toBe('kjelekormo');
    expect(ancientTelerinRules['3648128347'].mechanic('mbelektā').out).toBe('mbelektā');
  });

  it('00200 - labialized velars became labials', () => {
    expect(ancientTelerinRules['171120983'].mechanic('abc').out).toBe('abc');
    // [kw] > [p]:
    expect(ancientTelerinRules['171120983'].mechanic('aklarikwā').out).toBe('aklaripā');
    expect(ancientTelerinRules['171120983'].mechanic('alkwa').out).toBe('alpa');
    expect(ancientTelerinRules['171120983'].mechanic('makwā').out).toBe('mapā');
    expect(ancientTelerinRules['171120983'].mechanic('kwārē').out).toBe('pārē');
    expect(ancientTelerinRules['171120983'].mechanic('kwindē').out).toBe('pindē');
    // [kʰw] > [pʰ]:
    expect(ancientTelerinRules['171120983'].mechanic(toSingle('akʰwa')).out).toBe(toSingle('apʰa')); // Non-existent word
    // [gw] > [b]:
    expect(ancientTelerinRules['171120983'].mechanic('gwain').out).toBe('bain');
    expect(ancientTelerinRules['171120983'].mechanic('gwalka').out).toBe('balka');
    expect(ancientTelerinRules['171120983'].mechanic('gwanja').out).toBe('banja');
    // [ŋgw] > [mb]:
    expect(ancientTelerinRules['171120983'].mechanic('aŋgwa').out).toBe('amba'); // Non-existent word
    // [ŋkw] > [mp]:
    expect(ancientTelerinRules['171120983'].mechanic('liŋkwe').out).toBe('limpe');
    expect(ancientTelerinRules['171120983'].mechanic('ŋkwala').out).toBe('ṃpala');
    expect(ancientTelerinRules['171120983'].mechanic('niŋkwe').out).toBe('nimpe');
    expect(ancientTelerinRules['171120983'].mechanic('niŋkwiraite').out).toBe('nimpiraite');
    // [ŋw-] > [m-]:
    expect(ancientTelerinRules['171120983'].mechanic('ŋwaba').out).toBe('maba'); // Non-existent word
    // [ŋw] matches only at the beginning:
    expect(ancientTelerinRules['171120983'].mechanic('aŋwa').out).toBe('aŋwa'); // Non-existent word
  });

  it('00300 - [j] was lost after initial dentals', () => {
    expect(ancientTelerinRules['1532676669'].mechanic('abc').out).toBe('abc');
    // All words are made up unless otherwise noted:
    // [tj-] > [t-]:
    expect(ancientTelerinRules['1532676669'].mechanic('tyab').out).toBe('tab');
    expect(ancientTelerinRules['1532676669'].mechanic('tjab').out).toBe('tab');
    // [tʰj-] > [tʰ-]:
    expect(ancientTelerinRules['1532676669'].mechanic('ŧyab').out).toBe('ŧab');
    expect(ancientTelerinRules['1532676669'].mechanic('ŧjab').out).toBe('ŧab');
    // [dj-] > [d-]:
    expect(ancientTelerinRules['1532676669'].mechanic('dyel').out).toBe('del'); // √DYEL > N. deleb
    expect(ancientTelerinRules['1532676669'].mechanic('djel').out).toBe('del'); // √DYEL > N. deleb
    // [nj-] > [n-]:
    expect(ancientTelerinRules['1532676669'].mechanic('nyel').out).toBe('nel'); // √NYEL > N. nell
    expect(ancientTelerinRules['1532676669'].mechanic('njel').out).toBe('nel'); // √NYEL > N. nell
    // [lj-] > [l-]:
    expect(ancientTelerinRules['1532676669'].mechanic('lyab').out).toBe('lab');
    expect(ancientTelerinRules['1532676669'].mechanic('ljab').out).toBe('lab');
  });

  it('00400 - [ln] became [ll]', () => {
    expect(ancientTelerinRules['1062284643'].mechanic('abc').out).toBe('abc');
    expect(ancientTelerinRules['1062284643'].mechanic('ꝁolnina').out).toBe('ꝁollina'); // kʰollina
    expect(ancientTelerinRules['1062284643'].mechanic('melnā').out).toBe('mellā');
  });

  it('00500 - final voiceless stops and [s] vanished in polysyllables', () => {
    expect(ancientTelerinRules['981459769'].mechanic('abc').out).toBe('abc');
    expect(ancientTelerinRules['981459769'].mechanic('nelek').out).toBe('nele');
    expect(ancientTelerinRules['981459769'].mechanic('ƥilik').out).toBe('ƥili'); // pʰili
    expect(ancientTelerinRules['981459769'].mechanic('usuk').out).toBe('usu');
    expect(ancientTelerinRules['981459769'].mechanic('kjelep').out).toBe('kjele');
    expect(ancientTelerinRules['981459769'].mechanic('ƥolos').out).toBe('ƥolo'); // tʰolo
    // Monosyllables are not affected:
    expect(ancientTelerinRules['981459769'].mechanic('suk').out).toBe('suk');
  });

  it('00600 - [ms], [ns] became [ss]', () => {
    expect(ancientTelerinRules['1254562549'].mechanic('abc').out).toBe('abc');
    // Only one example:
    expect(ancientTelerinRules['1254562549'].mechanic('rinse').out).toBe('risse');
    // Guessing:
    expect(ancientTelerinRules['1254562549'].mechanic('aransuil').out).toBe('arassuil');
    // Made up words:
    expect(ancientTelerinRules['1254562549'].mechanic('amsa').out).toBe('assa');
    expect(ancientTelerinRules['1254562549'].mechanic('ansa').out).toBe('assa');
  });
});
