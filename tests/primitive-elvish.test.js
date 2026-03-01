import { describe, it, expect } from "vitest";
import { primitiveElvishRules } from "../src/primitive-elvish.js";

describe('Primitive Elvish rules', () => {
  it('00001 - aspirate became voiceless stop before [s]', () => {
    expect(primitiveElvishRules['2225058767'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['2225058767'].mechanic('aƥa').out).toBe('aƥa');
    expect(primitiveElvishRules['2225058767'].mechanic('aŧa').out).toBe('aŧa');
    expect(primitiveElvishRules['2225058767'].mechanic('aꝁa').out).toBe('aꝁa');
    expect(primitiveElvishRules['2225058767'].mechanic('aƥsa').out).toBe('apsa');
    expect(primitiveElvishRules['2225058767'].mechanic('aŧsa').out).toBe('atsa');
    expect(primitiveElvishRules['2225058767'].mechanic('aꝁsa').out).toBe('aksa');
  });

  it('00002 - aspirates became voiceless stops after [s], [h]', () => {
    expect(primitiveElvishRules['3915424757'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['3915424757'].mechanic('aƥa').out).toBe('aƥa');
    expect(primitiveElvishRules['3915424757'].mechanic('aŧa').out).toBe('aŧa');
    expect(primitiveElvishRules['3915424757'].mechanic('aꝁa').out).toBe('aꝁa');
    expect(primitiveElvishRules['3915424757'].mechanic('asƥa').out).toBe('aspa');
    expect(primitiveElvishRules['3915424757'].mechanic('asŧa').out).toBe('asta');
    expect(primitiveElvishRules['3915424757'].mechanic('asꝁa').out).toBe('aska');
    expect(primitiveElvishRules['3915424757'].mechanic('ahŧa').out).toBe('ahta');
  });

  it('00003 - aspiration moved to end of group of stops', () => {
    expect(primitiveElvishRules['3183451073'].mechanic('abc').out).toBe('abc');
    // [{ƥŧꝁ}{ptk|ƥŧꝁ}] > [{ptk}{ƥŧꝁ}]
    expect(primitiveElvishRules['3183451073'].mechanic('aƥpa').out).toBe('apƥa');
    expect(primitiveElvishRules['3183451073'].mechanic('aƥƥa').out).toBe('apƥa');
    expect(primitiveElvishRules['3183451073'].mechanic('aƥta').out).toBe('apŧa');
    expect(primitiveElvishRules['3183451073'].mechanic('aŧta').out).toBe('atŧa');
    expect(primitiveElvishRules['3183451073'].mechanic('aŧŧa').out).toBe('atŧa');
    expect(primitiveElvishRules['3183451073'].mechanic('aꝁƥa').out).toBe('akƥa');
    expect(primitiveElvishRules['3183451073'].mechanic('aꝁka').out).toBe('akꝁa');
  });

  it('00004 - [bm], [dn] became [mb], [nd]', () => {
    expect(primitiveElvishRules['3882201769'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['3882201769'].mechanic('kabmā').out).toBe('kambā');
    expect(primitiveElvishRules['3882201769'].mechanic('elednil').out).toBe('elendil');
  });

  it('00005 - final [j], [w] became [i], [u]', () => {
    expect(primitiveElvishRules['2641132585'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['2641132585'].mechanic('low').out).toBe('lou');
    expect(primitiveElvishRules['2641132585'].mechanic('baj').out).toBe('bai'); // Non-existent word
  });

  it('00006 - final [j], [w] vanished after long vowels in monosyllables', () => {
    expect(primitiveElvishRules['1539930001'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['1539930001'].mechanic('ƥāj').out).toBe('ƥā');
    expect(primitiveElvishRules['1539930001'].mechanic('rāw').out).toBe('rā');
  });

  it('00007 - final [l] became [r]', () => {
    expect(primitiveElvishRules['3385004377'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['3385004377'].mechanic('bal').out).toBe('bar'); // Non-existent word
  });

  it('00008 - final [m] became [n]', () => {
    expect(primitiveElvishRules['760163573'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['760163573'].mechanic('talam').out).toBe('talan');
  });

  it('00009 - [hs] became [ss]', () => {
    expect(primitiveElvishRules['2177009433'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['2177009433'].mechanic('mahse').out).toBe('masse');
    expect(primitiveElvishRules['2177009433'].mechanic('mahsē').out).toBe('massē');
  });

  it('00010 - [ɣ] became [h] before voiceless consonants (skipped)', () => {
    expect(primitiveElvishRules['794129503'].mechanic('abc').out).toBe('abc');
  });

  it('00011 - [lɣ] became [lg]', () => {
    expect(primitiveElvishRules['2151845509'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['2151845509'].mechanic('alɣa').out).toBe('alga'); // Non-existent word
  });

  it('00012 - long vowels shortened before consonant clusters', () => {
    expect(primitiveElvishRules['542079381'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['542079381'].mechanic('etlāndorē').out).toBe('etlandorē');
  });

  it('00013 - medial [ɣ]/[h] vanished except before [t]', () => {
    expect(primitiveElvishRules['2690267141'].mechanic('abc').out).toBe('abc');
    // expect(primitiveElvishRules['2690267141'].mechanic('ahbahbah').out).toBe('ababa');
    // These evolve into Quenya words:
    // [-h-] > [-ø-]:
    expect(primitiveElvishRules['2690267141'].mechanic('māh').out).toBe('mā');
    expect(primitiveElvishRules['2690267141'].mechanic('maha').out).toBe('mā');
    // [-ɣ-] > [-ø-]:
    expect(primitiveElvishRules['2690267141'].mechanic('aɣūlē').out).toBe('aulē');
    expect(primitiveElvishRules['2690267141'].mechanic('eɣa').out).toBe('ea');
    expect(primitiveElvishRules['2690267141'].mechanic('laɣa').out).toBe('lā');
    // [aɣC] > [āC]:
    // [eɣC] > [ēC]:
    expect(primitiveElvishRules['2690267141'].mechanic('teɣmā').out).toBe('tēmā');
    // [iɣC] > [īC]:
    expect(primitiveElvishRules['2690267141'].mechanic('riɣma').out).toBe('rīma');
    // [uɣC] > [ūC]:
    // [ht] > [xt]:
    // Only Sindarin example:
    expect(primitiveElvishRules['2690267141'].mechanic('jujuɣal').out).toBe('jujual'); // uial
  });

  it('00014 - medial nasal plus stop after another consonant became simple nasal', () => {
    expect(primitiveElvishRules['4126101193'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['4126101193'].mechanic('abmba').out).toBe('abma');
    expect(primitiveElvishRules['4126101193'].mechanic('abnda').out).toBe('abna');
    expect(primitiveElvishRules['4126101193'].mechanic('abŋga').out).toBe('abŋa');
    expect(primitiveElvishRules['4126101193'].mechanic('abmda').out).toBe('abma');
    expect(primitiveElvishRules['4126101193'].mechanic('abnga').out).toBe('abna');
    expect(primitiveElvishRules['4126101193'].mechanic('abŋba').out).toBe('abŋa');
    expect(primitiveElvishRules['4126101193'].mechanic('abmga').out).toBe('abma');
    expect(primitiveElvishRules['4126101193'].mechanic('abnba').out).toBe('abna');
    expect(primitiveElvishRules['4126101193'].mechanic('abŋda').out).toBe('abŋa');
  });

  it('00015 - medial [ŋj], [ŋw] became [ŋgj], [ŋgw]', () => {
    expect(primitiveElvishRules['2233951333'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['2233951333'].mechanic('leŋwe').out).toBe('leŋgwe');
    expect(primitiveElvishRules['2233951333'].mechanic('teŋwa').out).toBe('teŋgwa');
    expect(primitiveElvishRules['2233951333'].mechanic('teŋwe').out).toBe('teŋgwe');
  });

  it('00016 - medial [ŋ] usually became [ɣ]', () => {
    // This rule has not many attested examples for most forms.
    // So we're covering only the ones with examples.
    expect(primitiveElvishRules['768986721'].mechanic('abc').out).toBe('abc');
    // These are all used in Quenya:
    // [-Vŋ] > [-Vɣ]:
    expect(primitiveElvishRules['768986721'].mechanic('peŋ').out).toBe('peɣ');
    expect(primitiveElvishRules['768986721'].mechanic('lēŋ').out).toBe('lēɣ');
    // [VŋV] > [VɣV]:
    expect(primitiveElvishRules['768986721'].mechanic('eŋa').out).toBe('eɣa');
    expect(primitiveElvishRules['768986721'].mechanic('ēŋijē').out).toBe('ēɣijē');
    expect(primitiveElvishRules['768986721'].mechanic('laŋa').out).toBe('laɣa');
    expect(primitiveElvishRules['768986721'].mechanic('peŋe').out).toBe('peɣe');
    expect(primitiveElvishRules['768986721'].mechanic('peŋe').out).toBe('peɣe');
    // Only Sindarin example:
    expect(primitiveElvishRules['768986721'].mechanic('jujuŋal').out).toBe('jujuɣal');
    // Missing coverage:
    // [ŋr] > [ɣr]
    // [ŋl] > [ɣl]
    // [-ŋ] > [-ɣ] <- This is weird because all examples have a vowel before
  });

  it('00017 - metathesis', () => {
    expect(primitiveElvishRules['3160359587'].mechanic('abc').out).toBe('abc');
    // Quenya:
    expect(primitiveElvishRules['3160359587'].mechanic('lukma').out).toBe('lumka');
    expect(primitiveElvishRules['3160359587'].mechanic('maslā', { slMetathesis: true }).out).toBe('malsā');
  });

  it('00018 - nasals assimilated to following stops and aspirates', () => {
    expect(primitiveElvishRules['2143444883'].mechanic('abc').out).toBe('abc');
    // [np] > [mp]:
    expect(primitiveElvishRules['2143444883'].mechanic('lenpe').out).toBe('lempe');
    // [nb] > [mb]:
    expect(primitiveElvishRules['2143444883'].mechanic('elenbarathī').out).toBe('elembarathī'); // Sindarin
    // [ŋp] > [mp]:
    expect(primitiveElvishRules['2143444883'].mechanic('aŋpa').out).toBe('ampa'); // Non-existent word
    // [mt] > [nt]:
    expect(primitiveElvishRules['2143444883'].mechanic('amtā').out).toBe('antā');
    // [md] > [nd]:
    expect(primitiveElvishRules['2143444883'].mechanic('imdō').out).toBe('indō');
    // [ŋt] > [nt]:
    expect(primitiveElvishRules['2143444883'].mechanic('aŋta').out).toBe('anta'); // Non-existent word
    // [mk] > [ŋk]:
    expect(primitiveElvishRules['2143444883'].mechanic('lumka').out).toBe('luŋka');
    // [nk] > [ŋk]:
    expect(primitiveElvishRules['2143444883'].mechanic('minkwē').out).toBe('miŋkwē');
  });

  it('00019 - [ŋŋ], [ŋɣ] became [ŋg]', () => {
    expect(primitiveElvishRules['3404492995'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['3404492995'].mechanic('aŋŋal').out).toBe('aŋgal');
    expect(primitiveElvishRules['3404492995'].mechanic('eŋŋe').out).toBe('eŋge');
    expect(primitiveElvishRules['3404492995'].mechanic('eŋɣe').out).toBe('eŋge'); // Non-existent word
  });

  it('00020 - [ŋs] became [ns]', () => {
    expect(primitiveElvishRules['484908271'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['484908271'].mechanic('aŋsa').out).toBe('ansa'); // Non-existent word
    expect(primitiveElvishRules['484908271'].mechanic('aŋsabaŋsa').out).toBe('ansabansa'); // Non-existent word
  });

  it('00021 - [pw], [pʰw] became [pp], [pʰp]', () => {
    expect(primitiveElvishRules['2859678213'].mechanic('abc').out).toBe('abc');
    // [pw|ƥw] > [pp|ƥƥ]
    // Non-existent words:
    expect(primitiveElvishRules['2859678213'].mechanic('apwa').out).toBe('appa');
    expect(primitiveElvishRules['2859678213'].mechanic('aƥwa').out).toBe('aƥƥa');
    expect(primitiveElvishRules['2859678213'].mechanic('apwaƥwa').out).toBe('appaƥƥa');
  });

  it('00022 - [s] became [z] before voiced stops', () => {
    expect(primitiveElvishRules['882174441'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['882174441'].mechanic('nisdo').out).toBe('nizdo');
    expect(primitiveElvishRules['882174441'].mechanic('masgu').out).toBe('mazgu');
  });

  it('00023 - short final [e], [a], [o] vanished', () => {
    expect(primitiveElvishRules['2794740763'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['2794740763'].mechanic('abata').out).toBe('abat');
    expect(primitiveElvishRules['2794740763'].mechanic('gaiara').out).toBe('gaiar');
    expect(primitiveElvishRules['2794740763'].mechanic('kenasita').out).toBe('kenasit'); // Quenya
    expect(primitiveElvishRules['2794740763'].mechanic('mbara').out).toBe('mbar');
    expect(primitiveElvishRules['2794740763'].mechanic('ṃbarta').out).toBe('ṃbart');
    expect(primitiveElvishRules['2794740763'].mechanic('karane').out).toBe('karan');
    expect(primitiveElvishRules['2794740763'].mechanic('lepene').out).toBe('lepen');
    expect(primitiveElvishRules['2794740763'].mechanic('ruiste').out).toBe('ruist');
    expect(primitiveElvishRules['2794740763'].mechanic('abaro').out).toBe('abar');
    expect(primitiveElvishRules['2794740763'].mechanic('lepero').out).toBe('leper');
    expect(primitiveElvishRules['2794740763'].mechanic('sataro').out).toBe('satar');
    // Non-existent words:
    expect(primitiveElvishRules['2794740763'].mechanic('ababǝ').out).toBe('abab');
  });

  it('00024 - short final [i], [u] became [e], [o]', () => {
    expect(primitiveElvishRules['3064357955'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['3064357955'].mechanic('auri').out).toBe('aure');
    expect(primitiveElvishRules['3064357955'].mechanic('duini').out).toBe('duine');
    expect(primitiveElvishRules['3064357955'].mechanic('imbi').out).toBe('imbe');
    expect(primitiveElvishRules['3064357955'].mechanic('karani').out).toBe('karane');
    expect(primitiveElvishRules['3064357955'].mechanic('lepettaroni').out).toBe('lepettarone');
    expect(primitiveElvishRules['3064357955'].mechanic('liŋkwi').out).toBe('liŋkwe');
    expect(primitiveElvishRules['3064357955'].mechanic('mori').out).toBe('more');
    expect(primitiveElvishRules['3064357955'].mechanic('netti').out).toBe('nette');
    expect(primitiveElvishRules['3064357955'].mechanic('netŧi').out).toBe('netŧe');
    expect(primitiveElvishRules['3064357955'].mechanic('tumbu').out).toBe('tumbo');
    expect(primitiveElvishRules['3064357955'].mechanic('turúŋku').out).toBe('turúŋko');
    expect(primitiveElvishRules['3064357955'].mechanic('uruku').out).toBe('uruko');
  });

  it('00025 - stressed [wŏ] became [wa]', () => {
    expect(primitiveElvishRules['1475928117'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['1475928117'].mechanic('ŋwalōŧ').out).toBe('ŋwolōŧ');
    expect(primitiveElvishRules['1475928117'].mechanic('gwo-').out).toBe('gwa-');
    expect(primitiveElvishRules['1475928117'].mechanic('-woite').out).toBe('-waite');
  });

  it('00026 - [t+t], [d+d] from suffixion became [st], [zd]', () => {
    expect(primitiveElvishRules['2479050823'].mechanic('abc').out).toBe('abc');
    // [{tŧd}t|dd] > [st|zd]
    // [tt] > [st]:
    expect(primitiveElvishRules['2479050823'].mechanic('lotta-').out).toBe('losta-'); // Quenya
    // [ŧt] > [st]:
    expect(primitiveElvishRules['2479050823'].mechanic('ceŧta-').out).toBe('cesta-'); // Quenya
    // [dt] > [st]:
    expect(primitiveElvishRules['2479050823'].mechanic('badta').out).toBe('basta'); // Non-existent word
    // [dd] > [zd]:
    expect(primitiveElvishRules['2479050823'].mechanic('reddā').out).toBe('rezdā'); // Sindarin
  });

  it('00027 - [tk] became [kk] or [kt] or [sk]', () => {
    expect(primitiveElvishRules['700934409'].mechanic('abc').out).toBe('abc');
    // Sindarin examples:
    // [tk] > [kk]:
    expect(primitiveElvishRules['700934409'].mechanic('etkantē').out).toBe('ekkantē');
    expect(primitiveElvishRules['700934409'].mechanic('etkat-').out).toBe('ekkat-');
    // [tk] > [kt]:
    expect(primitiveElvishRules['700934409'].mechanic('atka', { useTkToKt: true }).out).toBe('akta'); // Non-existent word
    // [tk] > [sk]:
    expect(primitiveElvishRules['700934409'].mechanic('atka', { useTkToSk: true }).out).toBe('aska'); // Non-existent word
    // [tp] > [pp]:
    expect(primitiveElvishRules['700934409'].mechanic('etpel').out).toBe('eppel');
  });

  it('00028 - unstressed long vowels shortened in medial syllables', () => {
    expect(primitiveElvishRules['951924569'].mechanic('abc').out).toBe('abc');
    // All examples are Noldorin:
    expect(primitiveElvishRules['951924569'].mechanic('álākō').out).toBe('álakō');
    expect(primitiveElvishRules['951924569'].mechanic('bálāre').out).toBe('bálare');
    expect(primitiveElvishRules['951924569'].mechanic('ŧáurēnā').out).toBe('ŧáurenā');
    expect(primitiveElvishRules['951924569'].mechanic('wā́jāro').out).toBe('wā́jaro');
  });

  it('00029 - voiced stops unvoiced after voiceless stops and aspirates', () => {
    expect(primitiveElvishRules['2620200719'].mechanic('abc').out).toBe('abc');
    // All Quenya:
    // [{ƥŧꝁptk}{bdg}|{bdg}{ƥŧꝁptk}] > [{ƥŧꝁptk}{ptk}|{ptk}{ƥŧꝁptk}]
    expect(primitiveElvishRules['2620200719'].mechanic('tekda').out).toBe('tekta');
    expect(primitiveElvishRules['2620200719'].mechanic('kasd').out).toBe('kast');
    expect(primitiveElvishRules['2620200719'].mechanic('kasda').out).toBe('kasta');
  });

  it('00030 - voiced stops unvoiced before voiceless consonants', () => {
    expect(primitiveElvishRules['1944249607'].mechanic('abc').out).toBe('abc');
    // [{bdg}{ptkƥŧꝁs}] > [{ptk}{ptkƥŧꝁs}]
    expect(primitiveElvishRules['1944249607'].mechanic('absene').out).toBe('apsene');
    expect(primitiveElvishRules['1944249607'].mechanic('abta-').out).toBe('apta-');
    expect(primitiveElvishRules['1944249607'].mechanic('magta-').out).toBe('makta-'); // Sindarin
    expect(primitiveElvishRules['1944249607'].mechanic('weɣka').out).toBe('wekka');
    // Don't change at the end:
    expect(primitiveElvishRules['1944249607'].mechanic('estolag').out).toBe('estolag');
  });

  it('00031 - [wau] became [au] or [wā]', () => {
    expect(primitiveElvishRules['242344611'].mechanic('abc').out).toBe('abc');
    // Only one example in Quenya:
    expect(primitiveElvishRules['242344611'].mechanic('ŋgwaumē').out).toBe('ŋgwāmē');
    // Non-existent words:
    expect(primitiveElvishRules['242344611'].mechanic('ŋgwaumē', { useAu: true }).out).toBe('ŋgaumē');
  });

  it('00032 - [wou] became [wō]', () => {
    expect(primitiveElvishRules['3116232193'].mechanic('abc').out).toBe('abc');
    // No examples
    expect(primitiveElvishRules['3116232193'].mechanic('bawouba').out).toBe('bawōba'); // Non-existent word
  });

  it('00100 - [lr] became [ll]', () => {
    expect(primitiveElvishRules['4183190863'].mechanic('abc').out).toBe('abc');
    expect(primitiveElvishRules['4183190863'].mechanic('kalrō').out).toBe('kallō'); // Quenya
    expect(primitiveElvishRules['4183190863'].mechanic('kalrondō').out).toBe('kallondō'); // Noldorin
    expect(primitiveElvishRules['4183190863'].mechanic('stalrā').out).toBe('stallā'); // Ilkorin
    expect(primitiveElvishRules['4183190863'].mechanic('talrunja').out).toBe('tallunja'); // Quenya & Noldorin
  });

  it('00200 - [ae], [ao] became [ā]', () => {
    expect(primitiveElvishRules['1056240093'].mechanic('abc').out).toBe('abc');
    // No examples
    expect(primitiveElvishRules['1056240093'].mechanic('baeb').out).toBe('bāb');
    expect(primitiveElvishRules['1056240093'].mechanic('baob').out).toBe('bāb');
  });

  it('00300 - [j], [w] became [i], [u] before consonants', () => {
    expect(primitiveElvishRules['113345945'].mechanic('abc').out).toBe('abc');
    // Mostly Quenya:
    expect(primitiveElvishRules['113345945'].mechanic('ajna').out).toBe('aina');
    expect(primitiveElvishRules['113345945'].mechanic('gajra').out).toBe('gaira');
    expect(primitiveElvishRules['113345945'].mechanic('kejta-').out).toBe('keita-');
    expect(primitiveElvishRules['113345945'].mechanic('slǭjmā').out).toBe('slǭimā');
    expect(primitiveElvishRules['113345945'].mechanic('awdelo').out).toBe('audelo');
    // Non-existent words:
    expect(primitiveElvishRules['113345945'].mechanic('bewbaba').out).toBe('beubaba');
    expect(primitiveElvishRules['113345945'].mechanic('biwbaba').out).toBe('biubaba');
    expect(primitiveElvishRules['113345945'].mechanic('bowbaba').out).toBe('boubaba');
  });
});

