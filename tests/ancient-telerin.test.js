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

  it('00200 - labialized velars became labials', () => {
    expect(ancientTelerinRules['171120983'].mechanic('abc')).toBe('abc');
    // [kw] > [p]:
    expect(ancientTelerinRules['171120983'].mechanic('aklarikwā')).toBe('aklaripā');
    expect(ancientTelerinRules['171120983'].mechanic('alkwa')).toBe('alpa');
    expect(ancientTelerinRules['171120983'].mechanic('makwā')).toBe('mapā');
    expect(ancientTelerinRules['171120983'].mechanic('kwārē')).toBe('pārē');
    expect(ancientTelerinRules['171120983'].mechanic('kwindē')).toBe('pindē');
    // [kʰw] > [pʰ]:
    expect(ancientTelerinRules['171120983'].mechanic(toSingle('akʰwa'))).toBe(toSingle('apʰa')); // Non-existent word
    // [gw] > [b]:
    expect(ancientTelerinRules['171120983'].mechanic('gwain')).toBe('bain');
    expect(ancientTelerinRules['171120983'].mechanic('gwalka')).toBe('balka');
    expect(ancientTelerinRules['171120983'].mechanic('gwanja')).toBe('banja');
    // [ŋgw] > [mb]:
    expect(ancientTelerinRules['171120983'].mechanic('aŋgwa')).toBe('amba'); // Non-existent word
    // [ŋkw] > [mp]:
    expect(ancientTelerinRules['171120983'].mechanic('liŋkwe')).toBe('limpe');
    expect(ancientTelerinRules['171120983'].mechanic('ŋkwala')).toBe('ṃpala');
    expect(ancientTelerinRules['171120983'].mechanic('niŋkwe')).toBe('nimpe');
    expect(ancientTelerinRules['171120983'].mechanic('niŋkwiraite')).toBe('nimpiraite');
    // [ŋw-] > [m-]:
    expect(ancientTelerinRules['171120983'].mechanic('ŋwaba')).toBe('maba'); // Non-existent word
    // [ŋw] matches only at the beginning:
    expect(ancientTelerinRules['171120983'].mechanic('aŋwa')).toBe('aŋwa'); // Non-existent word
  });

  it('1532676669 - [j] was lost after initial dentals', () => {
    expect(ancientTelerinRules['1532676669'].mechanic('abc')).toBe('abc');
    // All words are made up unless otherwise noted:
    // [tj-] > [t-]:
    expect(ancientTelerinRules['1532676669'].mechanic('tyab')).toBe('tab');
    expect(ancientTelerinRules['1532676669'].mechanic('tjab')).toBe('tab');
    // [tʰj-] > [tʰ-]:
    expect(ancientTelerinRules['1532676669'].mechanic('ŧyab')).toBe('ŧab');
    expect(ancientTelerinRules['1532676669'].mechanic('ŧjab')).toBe('ŧab');
    // [dj-] > [d-]:
    expect(ancientTelerinRules['1532676669'].mechanic('dyel')).toBe('del'); // √DYEL > N. deleb
    expect(ancientTelerinRules['1532676669'].mechanic('djel')).toBe('del'); // √DYEL > N. deleb
    // [nj-] > [n-]:
    expect(ancientTelerinRules['1532676669'].mechanic('nyel')).toBe('nel'); // √NYEL > N. nell
    expect(ancientTelerinRules['1532676669'].mechanic('njel')).toBe('nel'); // √NYEL > N. nell
    // [lj-] > [l-]:
    expect(ancientTelerinRules['1532676669'].mechanic('lyab')).toBe('lab');
    expect(ancientTelerinRules['1532676669'].mechanic('ljab')).toBe('lab');
  });

  it('1062284643 - [ln] became [ll]', () => {
    expect(ancientTelerinRules['1062284643'].mechanic('abc')).toBe('abc');
    expect(ancientTelerinRules['1062284643'].mechanic('ꝁolnina')).toBe('ꝁollina'); // kʰollina
    expect(ancientTelerinRules['1062284643'].mechanic('melnā')).toBe('mellā');
  });
});
