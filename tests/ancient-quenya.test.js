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
    expect(ancientQuenyaRules['1399041717'].mechanic('amsa').out).toBe('ansa');
    expect(ancientQuenyaRules['1399041717'].mechanic('amsamsa').out).toBe('ansansa');

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
    expect(ancientQuenyaRules['2591378297'].mechanic('hrinse').out).toBe('hriſe');
  });

  it('00300 - [V₁CV̆₁CV] > [V₁CCV]', () => {
    expect(ancientQuenyaRules['3116715705'].mechanic('abc').out).toBe('abc');

    // Exception:
    // expect(ancientQuenyaRules['3116715705'].mechanic('atatja').out).toBe('atatja'); // atatya

    // [aCaCV] > [aCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic('arata').out).toBe('arta');
    expect(ancientQuenyaRules['3116715705'].mechanic('barane').out).toBe('barne');
    expect(ancientQuenyaRules['3116715705'].mechanic('galadā').out).toBe('galdā');
    expect(ancientQuenyaRules['3116715705'].mechanic('kalatārīgelle').out).toBe('kaltārīgelle');
    expect(ancientQuenyaRules['3116715705'].mechanic('ƥarane').out).toBe('ƥarne');
    // [eCeCV] > [eCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic('enekwe').out).toBe('eŋkwe');
    expect(ancientQuenyaRules['3116715705'].mechanic('kwenedē').out).toBe('kwendē');
    expect(ancientQuenyaRules['3116715705'].mechanic('mbelekōr').out).toBe('mbelkōr');
    // [iCiCV] > [iCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic('silimā').out).toBe('silmā');
    // [oCoCV] > [oCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic('ŋgolodō').out).toBe('ŋgoldō');
    // [uCuCV] > [uCCV]:
    expect(ancientQuenyaRules['3116715705'].mechanic('uruŧa').out).toBe('urŧa');
  });

  it('00400 - [VjC|VwC] > [ViC|VuC]', () => {
    // [VjC] > [ViC]:
    expect(ancientQuenyaRules['2232975397'].mechanic('ajna-').out).toBe('aina-');
    expect(ancientQuenyaRules['2232975397'].mechanic('gajkā').out).toBe('gaikā');
    // [VwC] > [VuC]:
    expect(ancientQuenyaRules['2232975397'].mechanic('glawrē').out).toBe('glaurē');
  });

  it('00500 - [ls] > [ll]', () => {
    expect(ancientQuenyaRules['367860887'].mechanic('abc').out).toBe('abc');
    // Examples from middle AQ:
    expect(ancientQuenyaRules['367860887'].mechanic('matilsa', { ld: true }).out).toBe('matilda');
    expect(ancientQuenyaRules['367860887'].mechanic('telsā').out).toBe('tellā');
    expect(ancientQuenyaRules['367860887'].mechanic('telse').out).toBe('telle');
  });

  it('00600 - [{ptk}{mnŋlr}|{pʰtʰkʰbdg}{mnŋ}|{tʰd}l] > [{mnŋlr}{ptk}|{mnŋ}{pʰtʰkʰbdg}|l{tʰd}]', () => {
    expect(ancientQuenyaRules['3192302915'].mechanic('abc').out).toBe('abc');

    // [kl] > [lk]:
    expect(ancientQuenyaRules['3192302915'].mechanic('akla').out).toBe('alka');
    expect(ancientQuenyaRules['3192302915'].mechanic('aklar').out).toBe('alkar');

    // [ml] > [lm]:
    expect(ancientQuenyaRules['3192302915'].mechanic('ꝁomlō').out).toBe('ꝁolmō');

    // [pn] > [np]:
    expect(ancientQuenyaRules['3192302915'].mechanic('lepne').out).toBe('lenpe');

    // [tn] > [nt]:
    expect(ancientQuenyaRules['3192302915'].mechanic('matnā').out).toBe('mantā');

    // [bm] > [mb]:
    expect(ancientQuenyaRules['3192302915'].mechanic('ubmē').out).toBe('umbē');

    // [pm] > [mp]:
    expect(ancientQuenyaRules['3192302915'].mechanic('gapma').out).toBe('gampa'); // Non-existent origin word (it is actually gapna)

    // [kn] > [ŋk]:
    expect(ancientQuenyaRules['3192302915'].mechanic('ndaknā').out).toBe('ndaŋkā');

    // [tr] > [rt]:
    expect(ancientQuenyaRules['3192302915'].mechanic('netre').out).toBe('nerte');
    expect(ancientQuenyaRules['3192302915'].mechanic('satrā').out).toBe('sartā');
    expect(ancientQuenyaRules['3192302915'].mechanic('satrō').out).toBe('sartō');
    
    // [dl] > [ld]:
    expect(ancientQuenyaRules['3192302915'].mechanic('edlā').out).toBe('eldā');
  });

  it('00700 - [nl|nr] > [ll|rr]', () => {
    expect(ancientQuenyaRules['1625553255'].mechanic('abc').out).toBe('abc');

    // [nl] > [ll]:
    // nelle = brook:
    const compound = ancientQuenyaRules['1625553255'].mechanic('nenle', { morphemes: ['nen', 'le'] });
    expect(compound.out).toEqual('nelle');
    expect(compound.morphemes).toEqual(['nel', 'le']);

    // [nr] > [rr]:
    expect(ancientQuenyaRules['1625553255'].mechanic('enrā').out).toBe('errā'); // Non-existent word

    // [anr] > [ār]:
    expect(ancientQuenyaRules['1625553255'].mechanic('manrā').out).toBe('mārā');
  });

  it('00800 - [sr] > [ss]', () => {
    expect(ancientQuenyaRules['1606156545'].mechanic('abc').out).toBe('abc');
    expect(ancientQuenyaRules['1606156545'].mechanic('asre').out).toBe('asse'); // Non-existent word
  });

  it('00900 - [rl|lr] > [ll|ll]', () => {
    expect(ancientQuenyaRules['1550655669'].mechanic('abc').out).toBe('abc');
    expect(ancientQuenyaRules['1550655669'].mechanic('orlā').out).toBe('ollā');
    expect(ancientQuenyaRules['1550655669'].mechanic('stalrā').out).toBe('stallā'); // Ilkorin word
  });

  it('01000 - [V₁Cḷ|CCr] > [V₁CV₁l|CCar]', () => {
    expect(ancientQuenyaRules['825670671'].mechanic('abc').out).toBe('abc');
    
    // L after stops (p, t, k) 
    // vowel copies preceding vowel quality:
    expect(ancientQuenyaRules['825670671'].mechanic('makla').out).toBe('makala');
    expect(ancientQuenyaRules['825670671'].mechanic('mikla').out).toBe('mikila'); // Non-existent word
    expect(ancientQuenyaRules['825670671'].mechanic('mukla').out).toBe('mukula'); // Non-existent word

    // R in clusters of 3 consonants
    // always ar:
    expect(ancientQuenyaRules['825670671'].mechanic('ꝗentrō').out).toBe('ꝗentarō');
    
    // L after aspirates (ph/f, th/þ, kh/h)
    // same rule as stops:
    expect(ancientQuenyaRules['825670671'].mechanic('baꝁla').out).toBe('baꝁala'); // Non-existent word
    expect(ancientQuenyaRules['825670671'].mechanic('bafla').out).toBe('bafala'); // Non-existent word
    
    // L after m
    // OP1 - vowel copies preceding quality:
    expect(ancientQuenyaRules['825670671'].mechanic('amla').out).toBe('amala');
    expect(ancientQuenyaRules['825670671'].mechanic('imla').out).toBe('imila');

    // OP2 - always u regardless: (this is more recent)
    expect(ancientQuenyaRules['825670671'].mechanic('amla', { mlu: true }).out).toBe('amula'); // Not attested
    expect(ancientQuenyaRules['825670671'].mechanic('imla', { mlu: true }).out).toBe('imula');

    // R after m
    // always ar:
    expect(ancientQuenyaRules['825670671'].mechanic('amra').out).toBe('amara'); // Non-existent word

    // E and O:
    expect(ancientQuenyaRules['825670671'].mechanic('eml', { eoToIU: false }).out).toBe('emel'); // Non-existent word
    expect(ancientQuenyaRules['825670671'].mechanic('oml', { eoToIU: false }).out).toBe('omol'); // Non-existent word
    expect(ancientQuenyaRules['825670671'].mechanic('eml').out).toBe('emil'); // Non-existent word
    expect(ancientQuenyaRules['825670671'].mechanic('oml').out).toBe('omul'); // Non-existent word
    expect(ancientQuenyaRules['825670671'].mechanic('eml', { mlu: true }).out).toBe('emul'); // Non-existent word

    // General words:
    expect(ancientQuenyaRules['825670671'].mechanic('kantrō').out).toBe('kantarō');
    expect(ancientQuenyaRules['825670671'].mechanic('rantlā').out).toBe('rantalā');
    expect(ancientQuenyaRules['825670671'].mechanic('taŋkl').out).toBe('taŋkal');
    expect(ancientQuenyaRules['825670671'].mechanic('taŋklā').out).toBe('taŋkalā');
  });

  it('01100 - [{ptkpʰtʰkʰ}r] > [{ptkpʰtʰkʰ}s]', () => {
    expect(ancientQuenyaRules['1071202939'].mechanic('abc').out).toBe('abc');
    expect(ancientQuenyaRules['1071202939'].mechanic('mikrā').out).toBe('miksā');
    expect(ancientQuenyaRules['1071202939'].mechanic('nekra').out).toBe('neksa');
  });

  it('01200 - [dVXn-] > [nVXn-]', () => {
    expect(ancientQuenyaRules['2885687903'].mechanic('abc').out).toBe('abc');
    expect(ancientQuenyaRules['2885687903'].mechanic('donda', { morphemeSensitive: false }).out).toBe('nonda');
    expect(ancientQuenyaRules['2885687903'].mechanic('denda', { morphemeSensitive: false }).out).toBe('nenda');
    expect(ancientQuenyaRules['2885687903'].mechanic('dorna', { morphemeSensitive: false }).out).toBe('norna');
    expect(ancientQuenyaRules['2885687903'].mechanic('dorno', { morphemeSensitive: false }).out).toBe('norno');
    
    // Counterexamples:

    // lanta-
    const compoundA = ancientQuenyaRules['2885687903'].mechanic('danta', { morphemes: ['da', 'n', 'ta'] });
    expect(compoundA.out).toEqual('danta');
    expect(compoundA.morphemes).toEqual(['da', 'n', 'ta']);

    // luine
    const compoundB = ancientQuenyaRules['2885687903'].mechanic('duinē', { morphemes: ['dui', 'nē'] });
    expect(compoundB.out).toEqual('duinē');
    expect(compoundB.morphemes).toEqual(['dui', 'nē']);
  });

  it('01300 - [ɣ-] > [h-]', () => {
    expect(ancientQuenyaRules['3316553555'].mechanic('abc').out).toBe('abc');
    expect(ancientQuenyaRules['3316553555'].mechanic('ɣalda').out).toBe('halda');
  });

  it('01400 - [{bdg}{bdg}] > [{ptk}{ptk}]', () => {
    expect(ancientQuenyaRules['1625077395'].mechanic('abc').out).toBe('abc');
    expect(ancientQuenyaRules['1625077395'].mechanic('lubbo').out).toBe('luppo');
    expect(ancientQuenyaRules['1625077395'].mechanic('labdē').out).toBe('laptē');
    expect(ancientQuenyaRules['1625077395'].mechanic('ꝁagdā').out).toBe('ꝁaktā');
    expect(ancientQuenyaRules['1625077395'].mechanic('negdē').out).toBe('nektē');
    expect(ancientQuenyaRules['1625077395'].mechanic('snagdē').out).toBe('snaktē');
  });

  it('01500 - [z{bdg}] > [s{ptk}]', () => {
    expect(ancientQuenyaRules['3279729471'].mechanic('abc').out).toBe('abc');

    expect(ancientQuenyaRules['3279729471'].mechanic('buzbō').out).toBe('buspō');
    expect(ancientQuenyaRules['3279729471'].mechanic('ezdē').out).toBe('estē');
    expect(ancientQuenyaRules['3279729471'].mechanic('mbazdā').out).toBe('mbastā');
    expect(ancientQuenyaRules['3279729471'].mechanic('mizdē').out).toBe('mistē');
    expect(ancientQuenyaRules['3279729471'].mechanic('nizdo').out).toBe('nisto');
    expect(ancientQuenyaRules['3279729471'].mechanic('rezdā').out).toBe('restā');
    expect(ancientQuenyaRules['3279729471'].mechanic('mazgō').out).toBe('maskō');
    expect(ancientQuenyaRules['3279729471'].mechanic('nazga').out).toBe('naska');
    expect(ancientQuenyaRules['3279729471'].mechanic('nazgwē').out).toBe('naskwē');
  });

  it('01600 - [{ptk}{nm}|{ptk}ʰ{nm}] > [{ptk}{tw}|{ptk}ʰ{tw}]', () => {
    expect(ancientQuenyaRules['3418086257'].mechanic('abc').out).toBe('abc');

    // Extant examples:
    expect(ancientQuenyaRules['3418086257'].mechanic('lukma').out).toBe('lukwa'); // [km] > [kw]
    expect(ancientQuenyaRules['3418086257'].mechanic('paknā').out).toBe('paktā'); // [kn] > [kt]
    expect(ancientQuenyaRules['3418086257'].mechanic('napma').out).toBe('napwa'); // [pm] > [pw]
    expect(ancientQuenyaRules['3418086257'].mechanic('matnā').out).toBe('mattā'); // [tn] > [tt]
    expect(ancientQuenyaRules['3418086257'].mechanic('paŧnā').out).toBe('pattā'); // [tʰn] > [tt]

    // Non-existent words:
    expect(ancientQuenyaRules['3418086257'].mechanic('bapna').out).toBe('bapta'); // [pn] > [pt]
    expect(ancientQuenyaRules['3418086257'].mechanic('batma').out).toBe('batwa'); // [tm] > [tw]
    expect(ancientQuenyaRules['3418086257'].mechanic('baƥna').out).toBe('bapta'); // [pʰn] > [pt]
    expect(ancientQuenyaRules['3418086257'].mechanic('baꝁna').out).toBe('bakta'); // [kʰn] > [kt]
    expect(ancientQuenyaRules['3418086257'].mechanic('baƥma').out).toBe('bapwa'); // [pʰm] > [pw]
    expect(ancientQuenyaRules['3418086257'].mechanic('baŧma').out).toBe('batwa'); // [tʰm] > [tw]
    expect(ancientQuenyaRules['3418086257'].mechanic('baꝁma').out).toBe('bakwa'); // [kʰm] > [kw]
  });

  it('01700 - [mpʰ|ntʰ|ŋkʰ] > [ppʰ|ttʰ|kkʰ]', () => {
    expect(ancientQuenyaRules['3474357431'].mechanic('abc').out).toBe('abc');
    // [mpʰ] > [ppʰ]:
    expect(ancientQuenyaRules['3474357431'].mechanic('ramƥe').out).toBe('rapƥe');
    // [ntʰ] > [ttʰ]:
    expect(ancientQuenyaRules['3474357431'].mechanic('panŧe').out).toBe('patŧe');
    // [ŋkʰ] > [kkʰ]:
    expect(ancientQuenyaRules['3474357431'].mechanic('baŋꝁe').out).toBe('bakꝁe'); // Non-existent word
  });

  it('01800 - [{ptk}{ptk}ʰ] > [{ptk}{ptk}]', () => {
    expect(ancientQuenyaRules['2190887743'].mechanic('abc').out).toBe('abc');

    // [ppʰ] > [pp]:
    expect(ancientQuenyaRules['2190887743'].mechanic('rapƥe').out).toBe('rappe');
    // [ptʰ] > [pt]:
    expect(ancientQuenyaRules['2190887743'].mechanic('bapŧe').out).toBe('bapte'); // Non-existent word
    // [pkʰ] > [pk]:
    expect(ancientQuenyaRules['2190887743'].mechanic('bapꝁe').out).toBe('bapke'); // Non-existent word
    // [tpʰ] > [tp]:
    expect(ancientQuenyaRules['2190887743'].mechanic('batƥe').out).toBe('batpe'); // Non-existent word
    // [ttʰ] > [tt]:
    expect(ancientQuenyaRules['2190887743'].mechanic('netŧe').out).toBe('nette');
    expect(ancientQuenyaRules['2190887743'].mechanic('patŧe').out).toBe('patte');
    // [tkʰ] > [tk]:
    expect(ancientQuenyaRules['2190887743'].mechanic('rutꝁā').out).toBe('rutkā');
    // [ktʰ] > [kt]:
    expect(ancientQuenyaRules['2190887743'].mechanic('nakŧa-').out).toBe('nakta-');
    expect(ancientQuenyaRules['2190887743'].mechanic('okŧa').out).toBe('okta');
    // [kpʰ] > [kp]:
    expect(ancientQuenyaRules['2190887743'].mechanic('bakƥe').out).toBe('bakpe'); // Non-existent word
    // [kkʰ] > [kk]:
    expect(ancientQuenyaRules['2190887743'].mechanic('nakꝁa').out).toBe('nakka');
  });

  it('01900 - [{ptk}ʰ] > [{ɸθx}]', () => {
    expect(ancientQuenyaRules['3262991621'].mechanic('abc').out).toBe('abc');

    expect(ancientQuenyaRules['3262991621'].mechanic('ƥirja').out).toBe('ɸirja');
    expect(ancientQuenyaRules['3262991621'].mechanic('arƥō').out).toBe('arɸō');
    expect(ancientQuenyaRules['3262991621'].mechanic('raƥe').out).toBe('raɸe');

    expect(ancientQuenyaRules['3262991621'].mechanic('ŧaura').out).toBe('θaura');
    expect(ancientQuenyaRules['3262991621'].mechanic('aŧa-').out).toBe('aθa-');
    expect(ancientQuenyaRules['3262991621'].mechanic('rūŧe').out).toBe('rūθe');
    expect(ancientQuenyaRules['3262991621'].mechanic('ŋwolōŧ').out).toBe('ŋwolōθ');

    expect(ancientQuenyaRules['3262991621'].mechanic('ꝁ-').out).toBe('x-');
    expect(ancientQuenyaRules['3262991621'].mechanic('ꝁabar').out).toBe('xabar');
    expect(ancientQuenyaRules['3262991621'].mechanic('nāꝁa').out).toBe('nāxa');
  });
});