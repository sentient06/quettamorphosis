import { describe, it, expect } from "vitest";
import { primitiveElvishRules } from "../src/primitive-elvish.js";

describe('Primitive Elvish rules', () => {
  it('00001 - aspirate became voiceless stop before [s]', () => {
    expect(primitiveElvishRules['2225058767'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['2225058767'].mechanic('aƥa')).toBe('aƥa');
    expect(primitiveElvishRules['2225058767'].mechanic('aŧa')).toBe('aŧa');
    expect(primitiveElvishRules['2225058767'].mechanic('aꝁa')).toBe('aꝁa');
    expect(primitiveElvishRules['2225058767'].mechanic('aƥsa')).toBe('apsa');
    expect(primitiveElvishRules['2225058767'].mechanic('aŧsa')).toBe('atsa');
    expect(primitiveElvishRules['2225058767'].mechanic('aꝁsa')).toBe('aksa');
  });

  it('00002 - aspirates became voiceless stops after [s], [h]', () => {
    expect(primitiveElvishRules['3915424757'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['3915424757'].mechanic('aƥa')).toBe('aƥa');
    expect(primitiveElvishRules['3915424757'].mechanic('aŧa')).toBe('aŧa');
    expect(primitiveElvishRules['3915424757'].mechanic('aꝁa')).toBe('aꝁa');
    expect(primitiveElvishRules['3915424757'].mechanic('asƥa')).toBe('aspa');
    expect(primitiveElvishRules['3915424757'].mechanic('asŧa')).toBe('asta');
    expect(primitiveElvishRules['3915424757'].mechanic('asꝁa')).toBe('aska');
    expect(primitiveElvishRules['3915424757'].mechanic('ahŧa')).toBe('ahta');
  });

  it('00003 - aspiration moved to end of group of stops', () => {
    expect(primitiveElvishRules['3183451073'].mechanic('abc')).toBe('abc');
    // [{ƥŧꝁ}{ptk|ƥŧꝁ}] > [{ptk}{ƥŧꝁ}]
    expect(primitiveElvishRules['3183451073'].mechanic('aƥpa')).toBe('apƥa');
    expect(primitiveElvishRules['3183451073'].mechanic('aƥƥa')).toBe('apƥa');
    expect(primitiveElvishRules['3183451073'].mechanic('aƥta')).toBe('apŧa');
    expect(primitiveElvishRules['3183451073'].mechanic('aŧta')).toBe('atŧa');
    expect(primitiveElvishRules['3183451073'].mechanic('aŧŧa')).toBe('atŧa');
    expect(primitiveElvishRules['3183451073'].mechanic('aꝁƥa')).toBe('akƥa');
    expect(primitiveElvishRules['3183451073'].mechanic('aꝁka')).toBe('akꝁa');
  });

  it('00004 - [bm], [dn] became [mb], [nd]', () => {
    expect(primitiveElvishRules['3882201769'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['3882201769'].mechanic('kabmā')).toBe('kambā');
    expect(primitiveElvishRules['3882201769'].mechanic('elednil')).toBe('elendil');
  });

  it('00005 - final [j], [w] became [i], [u]', () => {
    expect(primitiveElvishRules['2641132585'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['2641132585'].mechanic('low')).toBe('lou');
    expect(primitiveElvishRules['2641132585'].mechanic('baj')).toBe('bai'); // Non-existent word
  });

  it('00006 - final [j], [w] vanished after long vowels in monosyllables', () => {
    expect(primitiveElvishRules['1539930001'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['1539930001'].mechanic('ƥāj')).toBe('ƥā');
    expect(primitiveElvishRules['1539930001'].mechanic('rāw')).toBe('rā');
  });

  it('00007 - final [l] became [r]', () => {
    expect(primitiveElvishRules['3385004377'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['3385004377'].mechanic('bal')).toBe('bar'); // Non-existent word
  });

  it('00008 - final [m] became [n]', () => {
    expect(primitiveElvishRules['760163573'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['760163573'].mechanic('talam')).toBe('talan');
  });

  it('00009 - [hs] became [ss]', () => {
    expect(primitiveElvishRules['2177009433'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['2177009433'].mechanic('mahse')).toBe('masse');
    expect(primitiveElvishRules['2177009433'].mechanic('mahsē')).toBe('massē');
  });

  it('00010 - [ɣ] became [h] before voiceless consonants (skipped)', () => {
    expect(primitiveElvishRules['794129503'].mechanic('abc')).toBe('abc');
  });

  it('00011 - [lɣ] became [lg]', () => {
    expect(primitiveElvishRules['2151845509'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['2151845509'].mechanic('alɣa')).toBe('alga'); // Non-existent word
  });

  it('00012 - long vowels shortened before consonant clusters', () => {
    expect(primitiveElvishRules['542079381'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['542079381'].mechanic('etlāndorē')).toBe('etlandorē');
  });

  it('00013 - medial [ɣ]/[h] vanished except before [t]', () => {
    expect(primitiveElvishRules['2690267141'].mechanic('abc')).toBe('abc');
    // expect(primitiveElvishRules['2690267141'].mechanic('ahbahbah')).toBe('ababa');
    // These evolve into Quenya words:
    // [-h-] > [-ø-]:
    expect(primitiveElvishRules['2690267141'].mechanic('māh')).toBe('mā');
    expect(primitiveElvishRules['2690267141'].mechanic('maha')).toBe('mā');
    // [-ɣ-] > [-ø-]:
    expect(primitiveElvishRules['2690267141'].mechanic('aɣūlē')).toBe('aulē');
    expect(primitiveElvishRules['2690267141'].mechanic('eɣa')).toBe('ea');
    expect(primitiveElvishRules['2690267141'].mechanic('laɣa')).toBe('lā');
    // [aɣC] > [āC]:
    // [eɣC] > [ēC]:
    expect(primitiveElvishRules['2690267141'].mechanic('teɣmā')).toBe('tēmā');
    // [iɣC] > [īC]:
    expect(primitiveElvishRules['2690267141'].mechanic('riɣma')).toBe('rīma');
    // [uɣC] > [ūC]:
    // [ht] > [xt]:
    // Only Sindarin example:
    expect(primitiveElvishRules['2690267141'].mechanic('jujuɣal')).toBe('jujual'); // uial
  });

  it('00014 - medial nasal plus stop after another consonant became simple nasal', () => {
    expect(primitiveElvishRules['4126101193'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['4126101193'].mechanic('abmba')).toBe('abma');
    expect(primitiveElvishRules['4126101193'].mechanic('abnda')).toBe('abna');
    expect(primitiveElvishRules['4126101193'].mechanic('abŋga')).toBe('abŋa');
    expect(primitiveElvishRules['4126101193'].mechanic('abmda')).toBe('abma');
    expect(primitiveElvishRules['4126101193'].mechanic('abnga')).toBe('abna');
    expect(primitiveElvishRules['4126101193'].mechanic('abŋba')).toBe('abŋa');
    expect(primitiveElvishRules['4126101193'].mechanic('abmga')).toBe('abma');
    expect(primitiveElvishRules['4126101193'].mechanic('abnba')).toBe('abna');
    expect(primitiveElvishRules['4126101193'].mechanic('abŋda')).toBe('abŋa');
  });

  it('00015 - medial [ŋj], [ŋw] became [ŋgj], [ŋgw]', () => {
    expect(primitiveElvishRules['2233951333'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['2233951333'].mechanic('leŋwe')).toBe('leŋgwe');
    expect(primitiveElvishRules['2233951333'].mechanic('teŋwa')).toBe('teŋgwa');
    expect(primitiveElvishRules['2233951333'].mechanic('teŋwe')).toBe('teŋgwe');
  });

  it('00016 - medial [ŋ] usually became [ɣ]', () => {
    // This rule has not many attested examples for most forms.
    // So we're covering only the ones with examples.
    expect(primitiveElvishRules['768986721'].mechanic('abc')).toBe('abc');
    // These are all used in Quenya:
    // [-Vŋ] > [-Vɣ]:
    expect(primitiveElvishRules['768986721'].mechanic('peŋ')).toBe('peɣ');
    expect(primitiveElvishRules['768986721'].mechanic('lēŋ')).toBe('lēɣ');
    // [VŋV] > [VɣV]:
    expect(primitiveElvishRules['768986721'].mechanic('eŋa')).toBe('eɣa');
    expect(primitiveElvishRules['768986721'].mechanic('ēŋijē')).toBe('ēɣijē');
    expect(primitiveElvishRules['768986721'].mechanic('laŋa')).toBe('laɣa');
    expect(primitiveElvishRules['768986721'].mechanic('peŋe')).toBe('peɣe');
    expect(primitiveElvishRules['768986721'].mechanic('peŋe')).toBe('peɣe');
    // Only Sindarin example:
    expect(primitiveElvishRules['768986721'].mechanic('jujuŋal')).toBe('jujuɣal');
    // Missing coverage:
    // [ŋr] > [ɣr]
    // [ŋl] > [ɣl]
    // [-ŋ] > [-ɣ] <- This is weird because all examples have a vowel before
  });

  it('00017 - metathesis', () => {
    expect(primitiveElvishRules['3160359587'].mechanic('abc')).toBe('abc');
    // Quenya:
    expect(primitiveElvishRules['3160359587'].mechanic('lukma')).toBe('lumka');
    expect(primitiveElvishRules['3160359587'].mechanic('maslā', { slMetathesis: true })).toBe('malsā');
  });

  it('00018 - nasals assimilated to following stops and aspirates', () => {
    expect(primitiveElvishRules['2143444883'].mechanic('abc')).toBe('abc');
    // [np] > [mp]:
    expect(primitiveElvishRules['2143444883'].mechanic('lenpe')).toBe('lempe');
    // [nb] > [mb]:
    expect(primitiveElvishRules['2143444883'].mechanic('elenbarathī')).toBe('elembarathī'); // Sindarin
    // [ŋp] > [mp]:
    expect(primitiveElvishRules['2143444883'].mechanic('aŋpa')).toBe('ampa'); // Non-existent word
    // [mt] > [nt]:
    expect(primitiveElvishRules['2143444883'].mechanic('amtā')).toBe('antā');
    // [md] > [nd]:
    expect(primitiveElvishRules['2143444883'].mechanic('imdō')).toBe('indō');
    // [ŋt] > [nt]:
    expect(primitiveElvishRules['2143444883'].mechanic('aŋta')).toBe('anta'); // Non-existent word
    // [mk] > [ŋk]:
    expect(primitiveElvishRules['2143444883'].mechanic('lumka')).toBe('luŋka');
    // [nk] > [ŋk]:
    expect(primitiveElvishRules['2143444883'].mechanic('minkwē')).toBe('miŋkwē');
  });

  it('00019 - [ŋŋ], [ŋɣ] became [ŋg]', () => {
    expect(primitiveElvishRules['3404492995'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['3404492995'].mechanic('aŋŋal')).toBe('aŋgal');
    expect(primitiveElvishRules['3404492995'].mechanic('eŋŋe')).toBe('eŋge');
    expect(primitiveElvishRules['3404492995'].mechanic('eŋɣe')).toBe('eŋge'); // Non-existent word
  });

  it('00020 - [ŋs] became [ns]', () => {
    expect(primitiveElvishRules['484908271'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['484908271'].mechanic('aŋsa')).toBe('ansa'); // Non-existent word
    expect(primitiveElvishRules['484908271'].mechanic('aŋsabaŋsa')).toBe('ansabansa'); // Non-existent word
  });

  it('00021 - [pw], [pʰw] became [pp], [pʰp]', () => {
    expect(primitiveElvishRules['2859678213'].mechanic('abc')).toBe('abc');
    // [pw|ƥw] > [pp|ƥƥ]
    // Non-existent words:
    expect(primitiveElvishRules['2859678213'].mechanic('apwa')).toBe('appa');
    expect(primitiveElvishRules['2859678213'].mechanic('aƥwa')).toBe('aƥƥa');
    expect(primitiveElvishRules['2859678213'].mechanic('apwaƥwa')).toBe('appaƥƥa');
  });

  it('00022 - [s] became [z] before voiced stops', () => {
    expect(primitiveElvishRules['882174441'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['882174441'].mechanic('nisdo')).toBe('nizdo');
    expect(primitiveElvishRules['882174441'].mechanic('masgu')).toBe('mazgu');
  });

  it('00023 - short final [e], [a], [o] vanished', () => {
    expect(primitiveElvishRules['2794740763'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['2794740763'].mechanic('abata')).toBe('abat');
    expect(primitiveElvishRules['2794740763'].mechanic('gaiara')).toBe('gaiar');
    expect(primitiveElvishRules['2794740763'].mechanic('kenasita')).toBe('kenasit'); // Quenya
    expect(primitiveElvishRules['2794740763'].mechanic('mbara')).toBe('mbar');
    expect(primitiveElvishRules['2794740763'].mechanic('ṃbarta')).toBe('ṃbart');
    expect(primitiveElvishRules['2794740763'].mechanic('karane')).toBe('karan');
    expect(primitiveElvishRules['2794740763'].mechanic('lepene')).toBe('lepen');
    expect(primitiveElvishRules['2794740763'].mechanic('ruiste')).toBe('ruist');
    expect(primitiveElvishRules['2794740763'].mechanic('abaro')).toBe('abar');
    expect(primitiveElvishRules['2794740763'].mechanic('lepero')).toBe('leper');
    expect(primitiveElvishRules['2794740763'].mechanic('sataro')).toBe('satar');
    // Non-existent words:
    expect(primitiveElvishRules['2794740763'].mechanic('ababǝ')).toBe('abab');
  });

  it('00024 - short final [i], [u] became [e], [o]', () => {
    expect(primitiveElvishRules['3064357955'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['3064357955'].mechanic('auri')).toBe('aure');
    expect(primitiveElvishRules['3064357955'].mechanic('duini')).toBe('duine');
    expect(primitiveElvishRules['3064357955'].mechanic('imbi')).toBe('imbe');
    expect(primitiveElvishRules['3064357955'].mechanic('karani')).toBe('karane');
    expect(primitiveElvishRules['3064357955'].mechanic('lepettaroni')).toBe('lepettarone');
    expect(primitiveElvishRules['3064357955'].mechanic('liŋkwi')).toBe('liŋkwe');
    expect(primitiveElvishRules['3064357955'].mechanic('mori')).toBe('more');
    expect(primitiveElvishRules['3064357955'].mechanic('netti')).toBe('nette');
    expect(primitiveElvishRules['3064357955'].mechanic('netŧi')).toBe('netŧe');
    expect(primitiveElvishRules['3064357955'].mechanic('tumbu')).toBe('tumbo');
    expect(primitiveElvishRules['3064357955'].mechanic('turúŋku')).toBe('turúŋko');
    expect(primitiveElvishRules['3064357955'].mechanic('uruku')).toBe('uruko');
  });

  it('00025 - stressed [wŏ] became [wa]', () => {
    expect(primitiveElvishRules['1475928117'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['1475928117'].mechanic('ŋwalōŧ')).toBe('ŋwolōŧ');
    expect(primitiveElvishRules['1475928117'].mechanic('gwo-')).toBe('gwa-');
    expect(primitiveElvishRules['1475928117'].mechanic('-woite')).toBe('-waite');
  });

  it('00026 - [t+t], [d+d] from suffixion became [st], [zd]', () => {
    expect(primitiveElvishRules['2479050823'].mechanic('abc')).toBe('abc');
    // [{tŧd}t|dd] > [st|zd]
    // [tt] > [st]:
    expect(primitiveElvishRules['2479050823'].mechanic('lotta-')).toBe('losta-'); // Quenya
    // [ŧt] > [st]:
    expect(primitiveElvishRules['2479050823'].mechanic('ceŧta-')).toBe('cesta-'); // Quenya
    // [dt] > [st]:
    expect(primitiveElvishRules['2479050823'].mechanic('badta')).toBe('basta'); // Non-existent word
    // [dd] > [zd]:
    expect(primitiveElvishRules['2479050823'].mechanic('reddā')).toBe('rezdā'); // Sindarin
  });

  it('00027 - [tk] became [kk] or [kt] or [sk]', () => {
    expect(primitiveElvishRules['700934409'].mechanic('abc')).toBe('abc');
    // Sindarin examples:
    // [tk] > [kk]:
    expect(primitiveElvishRules['700934409'].mechanic('etkantē')).toBe('ekkantē');
    expect(primitiveElvishRules['700934409'].mechanic('etkat-')).toBe('ekkat-');
    // [tk] > [kt]:
    expect(primitiveElvishRules['700934409'].mechanic('atka', { useTkToKt: true })).toBe('akta'); // Non-existent word
    // [tk] > [sk]:
    expect(primitiveElvishRules['700934409'].mechanic('atka', { useTkToSk: true })).toBe('aska'); // Non-existent word
    // [tp] > [pp]:
    expect(primitiveElvishRules['700934409'].mechanic('etpel')).toBe('eppel');
  });

  it('00028 - unstressed long vowels shortened in medial syllables', () => {
    expect(primitiveElvishRules['951924569'].mechanic('abc')).toBe('abc');
    // All examples are Noldorin:
    expect(primitiveElvishRules['951924569'].mechanic('álākō')).toBe('álakō');
    expect(primitiveElvishRules['951924569'].mechanic('bálāre')).toBe('bálare');
    expect(primitiveElvishRules['951924569'].mechanic('ŧáurēnā')).toBe('ŧáurenā');
    expect(primitiveElvishRules['951924569'].mechanic('wā́jāro')).toBe('wā́jaro');
  });

  it('00029 - voiced stops unvoiced after voiceless stops and aspirates', () => {
    expect(primitiveElvishRules['2620200719'].mechanic('abc')).toBe('abc');
    // All Quenya:
    // [{ƥŧꝁptk}{bdg}|{bdg}{ƥŧꝁptk}] > [{ƥŧꝁptk}{ptk}|{ptk}{ƥŧꝁptk}]
    expect(primitiveElvishRules['2620200719'].mechanic('tekda')).toBe('tekta');
    expect(primitiveElvishRules['2620200719'].mechanic('kasd')).toBe('kast');
    expect(primitiveElvishRules['2620200719'].mechanic('kasda')).toBe('kasta');
  });

  it('00030 - voiced stops unvoiced before voiceless consonants', () => {
    expect(primitiveElvishRules['1944249607'].mechanic('abc')).toBe('abc');
    // [{bdg}{ptkƥŧꝁs}] > [{ptk}{ptkƥŧꝁs}]
    expect(primitiveElvishRules['1944249607'].mechanic('absene')).toBe('apsene');
    expect(primitiveElvishRules['1944249607'].mechanic('abta-')).toBe('apta-');
    expect(primitiveElvishRules['1944249607'].mechanic('magta-')).toBe('makta-'); // Sindarin
    expect(primitiveElvishRules['1944249607'].mechanic('weɣka')).toBe('wekka');
    // Don't change at the end:
    expect(primitiveElvishRules['1944249607'].mechanic('estolag')).toBe('estolag');
  });

  it('00031 - [wau] became [au] or [wā]', () => {
    expect(primitiveElvishRules['242344611'].mechanic('abc')).toBe('abc');
    // Only one example in Quenya:
    expect(primitiveElvishRules['242344611'].mechanic('ŋgwaumē')).toBe('ŋgwāmē');
    // Non-existent words:
    expect(primitiveElvishRules['242344611'].mechanic('ŋgwaumē', { useAu: true })).toBe('ŋgaumē');
  });

  it('00032 - [wou] became [wō]', () => {
    expect(primitiveElvishRules['3116232193'].mechanic('abc')).toBe('abc');
    // No examples
    expect(primitiveElvishRules['3116232193'].mechanic('bawouba')).toBe('bawōba'); // Non-existent word
  });

  it('00100 - [lr] became [ll]', () => {
    expect(primitiveElvishRules['4183190863'].mechanic('abc')).toBe('abc');
    expect(primitiveElvishRules['4183190863'].mechanic('kalrō')).toBe('kallō'); // Quenya
    expect(primitiveElvishRules['4183190863'].mechanic('kalrondō')).toBe('kallondō'); // Noldorin
    expect(primitiveElvishRules['4183190863'].mechanic('stalrā')).toBe('stallā'); // Ilkorin
    expect(primitiveElvishRules['4183190863'].mechanic('talrunja')).toBe('tallunja'); // Quenya & Noldorin
  });

  it('00200 - [ae], [ao] became [ā]', () => {
    expect(primitiveElvishRules['1056240093'].mechanic('abc')).toBe('abc');
    // No examples
    expect(primitiveElvishRules['1056240093'].mechanic('baeb')).toBe('bāb');
    expect(primitiveElvishRules['1056240093'].mechanic('baob')).toBe('bāb');
  });

  it('00300 - [j], [w] became [i], [u] before consonants', () => {
    expect(primitiveElvishRules['113345945'].mechanic('abc')).toBe('abc');
    // Mostly Quenya:
    expect(primitiveElvishRules['113345945'].mechanic('ajna')).toBe('aina');
    expect(primitiveElvishRules['113345945'].mechanic('gajra')).toBe('gaira');
    expect(primitiveElvishRules['113345945'].mechanic('kejta-')).toBe('keita-');
    expect(primitiveElvishRules['113345945'].mechanic('slǭjmā')).toBe('slǭimā');
    expect(primitiveElvishRules['113345945'].mechanic('awdelo')).toBe('audelo');
    // Non-existent words:
    expect(primitiveElvishRules['113345945'].mechanic('bewbaba')).toBe('beubaba');
    expect(primitiveElvishRules['113345945'].mechanic('biwbaba')).toBe('biubaba');
    expect(primitiveElvishRules['113345945'].mechanic('bowbaba')).toBe('boubaba');
  });
});

