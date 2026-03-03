import { describe, it, expect } from "vitest";
import { ancientTelerinRules } from "../src/ancient-telerin.js";
import { digraphsToSingle, singleToDigraphs } from "../src/utils.js";

// Helper to convert test input to single-char form (simulating pre-processing)
const toSingle = (str) => digraphsToSingle(str);

describe('Ancient Telerin rules', () => {
  it('00100 - unstressed initial syllables reduced to favoured clusters', () => {
    expect(ancientTelerinRules['3648128347'].mechanic('abc').out).toBe('abc');
    expect(ancientTelerinRules['3648128347'].mechanic('barándā').out).toBe('brandā');
    expect(ancientTelerinRules['3648128347'].mechanic('barándē').out).toBe('brandē');
    expect(ancientTelerinRules['3648128347'].mechanic('baráſē').out).toBe('braſē');
    expect(ancientTelerinRules['3648128347'].mechanic('barásta-').out).toBe('brasta-');
    expect(ancientTelerinRules['3648128347'].mechanic('baráŧil').out).toBe('braŧil');
    // The one below fails when using Sindarin rules for stressed syllables:
    expect(ancientTelerinRules['3648128347'].mechanic('kalánt-').out).toBe('klant-');
    expect(ancientTelerinRules['3648128347'].mechanic('kalā́t-').out).toBe('klāt-');
    expect(ancientTelerinRules['3648128347'].mechanic('kiríſe').out).toBe('kriſe');
    expect(ancientTelerinRules['3648128347'].mechanic('kiríste').out).toBe('kriste');
    expect(ancientTelerinRules['3648128347'].mechanic('palátā').out).toBe('platā');
    expect(ancientTelerinRules['3648128347'].mechanic('ƥilíŋke').out).toBe('ƥliŋke');
    expect(ancientTelerinRules['3648128347'].mechanic('turúŋko').out).toBe('truŋko');
    expect(ancientTelerinRules['3648128347'].mechanic('turuŋko', { guessStress: true }).out).toBe('truŋko');
    // Initial clusters shouldn't trigger change:
    expect(ancientTelerinRules['3648128347'].mechanic('kjelekormo').out).toBe('kjelekormo');
    expect(ancientTelerinRules['3648128347'].mechanic('mbelektā').out).toBe('mbelektā');

    // kirissi PE - criss OS
    // aik PE - aik OS - aeg S
    // rimbē PE - rimē OS - -rim S
    // Morphemes:
    // This rule won't apply for kiriſiaikrimbē because the second syllable is not stressed.
    // I've added an artificial stress for testing purposes:
    const compound = ancientTelerinRules['3648128347'].mechanic('kiríſiaikrimbē', { morphemes: ['kiríſi', 'aik', 'rimbē'] });
    expect(compound.out).toEqual('kriſiaikrimbē');
    expect(compound.morphemes).toEqual(['kriſi', 'aik', 'rimbē']);
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

    // Morphemes:
    const compound = ancientTelerinRules['171120983'].mechanic('minikwē', { morphemes: ['mini', 'kwē'] });
    expect(compound.out).toEqual('minipē');
    expect(compound.morphemes).toEqual(['mini', 'pē']);
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

    // Morphemes: (Noldorin)
    const compound = ancientTelerinRules['1532676669'].mechanic('tjalaŋgando', { morphemes: ['tjal', 'aŋgando'] });
    expect(compound.out).toEqual('talaŋgando');
    expect(compound.morphemes).toEqual(['tal', 'aŋgando']);
  });

  it('00400 - [ln] became [ll]', () => {
    expect(ancientTelerinRules['1062284643'].mechanic('abc').out).toBe('abc');
    expect(ancientTelerinRules['1062284643'].mechanic('ꝁolnina').out).toBe('ꝁollina'); // kʰollina
    expect(ancientTelerinRules['1062284643'].mechanic('melnā').out).toBe('mellā');

    // Morphemes: melnā + annā > Melian (maybe)
    const compound = ancientTelerinRules['1062284643'].mechanic('melnānnā', { morphemes: ['melnā', 'nnā'] });
    expect(compound.out).toEqual('mellānnā');
    expect(compound.morphemes).toEqual(['mellā', 'nnā']);
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

    // Morphemes: kyelepē + d'rāk = teledraug (maybe? "silver wolf")
    const compound = ancientTelerinRules['981459769'].mechanic('kyeledrāk', { morphemes: ['kyele', 'drāk'] });
    expect(compound.out).toEqual('kyeledrā');
    expect(compound.morphemes).toEqual(['kyele', 'drā']);
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

    // Morphemes (non-existent word):
    const compound = ancientTelerinRules['1254562549'].mechanic('amsansui', { morphemes: ['amsa', 'nsui'] });
    expect(compound.out).toEqual('assassui');
    expect(compound.morphemes).toEqual(['assa', 'ssui']);
  });
});
