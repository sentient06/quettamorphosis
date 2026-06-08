import { describe, it, expect } from "vitest";
import { ancientQuenyaRules } from "../src/ancient-quenya.js";
import { digraphsToSingle, singleToDigraphs } from "../src/utils.js";

// Helper to convert test input to single-char form (simulating pre-processing)
const toSingle = (str) => digraphsToSingle(str);

describe('Ancient Quenya rules', () => {
  it('00100 - [ms] > [ns]', () => {
    expect(ancientQuenyaRules['1399041717'].mechanic('abc').out).toBe('abc');
    // This rule lacks examples.
    // Non-existent words:
    expect(ancientQuenyaRules['1399041717'].mechanic(toSingle('amsa')).out).toBe(toSingle('ansa'));
    expect(ancientQuenyaRules['1399041717'].mechanic(toSingle('amsamsa')).out).toBe(toSingle('ansansa'));

    // Morphemes: amsoria = lofty (Gnomish example)
    const compound = ancientQuenyaRules['1399041717'].mechanic('amsoria', { morphemes: ['amso', 'ria'] });
    expect(compound.out).toEqual('ansoria');
    expect(compound.morphemes).toEqual(['anso', 'ria']);

    // Non-existent compound:
    const compound2 = ancientQuenyaRules['1399041717'].mechanic('amsamsa', { morphemes: ['amsa', 'msa'] });
    expect(compound2.out).toEqual('ansansa');
    expect(compound2.morphemes).toEqual(['ansa', 'nsa']);
  });
  it('00200 - [ns] > [ss]', () => {
    expect(ancientQuenyaRules['2591378297'].mechanic('abc').out).toBe('abc');
    // There are no real examples, but there's a couple of past tense ancient words that seem to fit:
    expect(ancientQuenyaRules['2591378297'].mechanic(toSingle('hrinse')).out).toBe(toSingle('hriſe'));
  });
  it('00300 - [V₁CV̆₁CV] > [V₁CCV]', () => {
    expect(ancientQuenyaRules['3116715705'].mechanic('abc').out).toBe('abc');

    // Exception:
    // expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('atatja')).out).toBe(toSingle('atatja')); // atatya

    // [aCaCV] > [aCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('arata')).out).toBe(toSingle('arta'));
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('barane')).out).toBe(toSingle('barne'));
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('galadā')).out).toBe(toSingle('galdā'));
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('kalatārīgelle')).out).toBe(toSingle('kaltārīgelle'));
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('ƥarane')).out).toBe(toSingle('ƥarne'));
    // [eCeCV] > [eCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('enekwe')).out).toBe(toSingle('eŋkwe'));
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('kwenedē')).out).toBe(toSingle('kwendē'));
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('mbelekōr')).out).toBe(toSingle('mbelkōr'));
    // [iCiCV] > [iCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('silimā')).out).toBe(toSingle('silmā'));
    // [oCoCV] > [oCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('ŋgolodō')).out).toBe(toSingle('ŋgoldō'));
    // [uCuCV] > [uCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic(toSingle('uruŧa')).out).toBe(toSingle('urŧa'));
  });
});