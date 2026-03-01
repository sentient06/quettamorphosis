import { describe, it, expect } from "vitest";
import { oldSindarinRules } from "../src/old-sindarin.js";
import { digraphsToSingle, singleToDigraphs } from "../src/utils.js";

// Helper to convert test input to single-char form (simulating pre-processing)
const toSingle = (str) => digraphsToSingle(str);

describe('Old Sindarin rules', () => {
  it('00100 - final i-diphthongs became long [ī] in polysyllables', () => {
    expect(oldSindarinRules['71909447'].mechanic('abc').out).toBe('abc');

    // [-Sai] > [-Sī]:
    expect(oldSindarinRules['71909447'].mechanic('ossai').out).toBe('ossī');
    expect(oldSindarinRules['71909447'].mechanic('pʰelgai').out).toBe('pʰelgī');
    // [-Sei] > [-Sī]:
    expect(oldSindarinRules['71909447'].mechanic('wendēi').out).toBe('wendī');
    // [-Soi] > [-Sī]:
    expect(oldSindarinRules['71909447'].mechanic('etlōi').out).toBe('etlī');
    expect(oldSindarinRules['71909447'].mechanic('tonōi').out).toBe('tonī');
  });

  it('00200 - initial [ŋ] became [ŋg] or [g]', () => {
    expect(oldSindarinRules['1989991061'].mechanic('abc').out).toBe('abc');
    // There are not many examples and the ones existent are ambiguous.
    expect(oldSindarinRules['1989991061'].mechanic('ñgalatārigel').out).toBe('galatārigel');
    expect(oldSindarinRules['1989991061'].mechanic('ŋgalatārigel').out).toBe('galatārigel');
    expect(oldSindarinRules['1989991061'].mechanic('ŋab').out).toBe('gab'); // Non-existent word
  });

  it('00300 - first in pair of voiced stops vocalized', () => {
    expect(oldSindarinRules['4282797219'].mechanic('abc').out).toBe('abc');
    // Input uses single-char form: ꝁ=kʰ, x=kh/ch
    // [Vbd] > [Vud]:
    expect(oldSindarinRules['4282797219'].mechanic('ꝁabdā').out).toBe('ꝁaudā');
    expect(oldSindarinRules['4282797219'].mechanic('labdē').out).toBe('laudē');
    // [Vgd] > [Vid]:
    expect(oldSindarinRules['4282797219'].mechanic('negdē').out).toBe('neidē');
    expect(oldSindarinRules['4282797219'].mechanic('snagdē').out).toBe('snaidē');
  });

  it('00400 - [ɣ] became [g] before nasals and liquids', () => {
    expect(oldSindarinRules['107931923'].mechanic('abc').out).toBe('abc');
    expect(oldSindarinRules['107931923'].mechanic('taɣra').out).toBe('tagra');
    // Negative:
    expect(oldSindarinRules['107931923'].mechanic('taɣda').out).toBe('taɣda'); // Non-existent word
  });

  it('00500 - initial [ɣ]/[h] vanished', () => {
    expect(oldSindarinRules['1117448055'].mechanic('abc').out).toBe('abc');
    expect(oldSindarinRules['1117448055'].mechanic('ɣekā-').out).toBe('ekā-');
    expect(oldSindarinRules['1117448055'].mechanic('ɣeklambar').out).toBe('eklambar');
    expect(oldSindarinRules['1117448055'].mechanic('ɣenet').out).toBe('enet');
    expect(oldSindarinRules['1117448055'].mechanic('ɣor-').out).toBe('or-');
  });

  it('00600 - [j] was lost after initial velars', () => {
    expect(oldSindarinRules['345959193'].mechanic('abc').out).toBe('abc');
    // Input uses single-char form: ꝁ=kʰ
    // [kj-] > [k-]:
    expect(oldSindarinRules['345959193'].mechanic('akjāwen').out).toBe('akāwen');
    expect(oldSindarinRules['345959193'].mechanic('kjawathāne').out).toBe('kawathāne');
    expect(oldSindarinRules['345959193'].mechanic('kjelepē').out).toBe('kelepē');
    // [kʰj-] > [kʰ-] (using ꝁ for kʰ):
    expect(oldSindarinRules['345959193'].mechanic('ꝁjabab').out).toBe('ꝁabab'); // Non-existent word
    // [gj-] > [g-]:
    expect(oldSindarinRules['345959193'].mechanic('gjabab').out).toBe('gabab'); // Non-existent word
    // [skj-] > [sk-]:
    expect(oldSindarinRules['345959193'].mechanic('skjabab').out).toBe('skabab'); // Non-existent word
    // [ŋgj] > [ŋg]:
    expect(oldSindarinRules['345959193'].mechanic('ŋgjabab').out).toBe('ŋgabab'); // Non-existent word
    // Replace all occurrences:
    expect(oldSindarinRules['345959193'].mechanic('kjawathānekjāwen').out).toBe('kawathānekāwen'); // Non-existent word
  });

  it('00700 - medial [m] became [n] before [j], [w]', () => {
    expect(oldSindarinRules['1484184939'].mechanic('abc').out).toBe('abc');
    // [mj] > [nj]:
    expect(oldSindarinRules['1484184939'].mechanic('amja-').out).toBe('anja-');
    // [mw] > [nw]:
    expect(oldSindarinRules['1484184939'].mechanic('amwa').out).toBe('anwa'); // Non-existent word
    // [-mw] > [-mm]:
    expect(oldSindarinRules['1484184939'].mechanic('abamw').out).toBe('abamm'); // Non-existent word
  });

  it('00800 - initial [ml], [mr] became [bl], [br]', () => {
    expect(oldSindarinRules['1955360003'].mechanic('abc').out).toBe('abc');
    // There are no Sindarin examples for this.
    // Examples have been taken from Noldorin and Gnomish.
    // Gnomish transformations are entirely ficticious.
    // [ml-] > [bl-]:
    expect(oldSindarinRules['1955360003'].mechanic('mloss').out).toBe('bloss'); // Gnomish word, ficticious transformation
    // [mr-] > [br-]:
    expect(oldSindarinRules['1955360003'].mechanic('mrekāla').out).toBe('brekāla'); // Noldorin
  });

  it('00900 - initial syllabic [m], [n], [ŋ] became [am], [an], [aŋ]', () => {
    // Ask about marking under the nasals: ṃ vs m
    expect(oldSindarinRules['1024355367'].mechanic('abc').out).toBe('abc');
    // [ṃ-] > [am-]:
    expect(oldSindarinRules['1024355367'].mechanic('ṃbar').out).toBe('ambar');
    // [ṇ-] > [an-]:
    expect(oldSindarinRules['1024355367'].mechanic('ṇdūnē').out).toBe('andūnē');
    // [ŋ̣-] > [aŋ-]:
    expect(oldSindarinRules['1024355367'].mechanic('ŋ̣golodō').out).toBe('aŋgolodō');
  });

  it('01000 - voiceless stops were voiced before nasals', () => {
    expect(oldSindarinRules['3463937975'].mechanic('abc').out).toBe('abc');
    // Sindarin examples:
    // [km] > [gm]:
    expect(oldSindarinRules['3463937975'].mechanic('okma').out).toBe('ogma');
    expect(oldSindarinRules['3463937975'].mechanic('tekmā').out).toBe('tegmā');

    // All the rest is Noldorin (or non-existent):
    // [pn] > [bn]:
    expect(oldSindarinRules['3463937975'].mechanic('lepnar').out).toBe('lebnar');
    // [tn] > [dn]:
    expect(oldSindarinRules['3463937975'].mechanic('matna').out).toBe('madna');
    // [kn] > [gn]:
    expect(oldSindarinRules['3463937975'].mechanic('ndakno').out).toBe('ndagno');
    // [pm] > [bm]:
    expect(oldSindarinRules['3463937975'].mechanic('bapma').out).toBe('babma'); // Non-existent word
    // [tm] > [dm]:
    expect(oldSindarinRules['3463937975'].mechanic('jatmē').out).toBe('jadmē');
    // [km] > [gm]:
    expect(oldSindarinRules['3463937975'].mechanic('tulukmē').out).toBe('tulugmē');
  });

  it('01100 - [m] became [w] after aspirates', () => {
    expect(oldSindarinRules['3883770909'].mechanic('abc').out).toBe('abc');
    // Input uses single-char forms: ŧ=tʰ, ƥ=pʰ, ꝁ=kʰ
    // All examples are Noldorin (or non-existent):
    expect(oldSindarinRules['3883770909'].mechanic('paŧmā').out).toBe('paŧwā');
    expect(oldSindarinRules['3883770909'].mechanic('abaƥma').out).toBe('abaƥwa'); // Non-existent word
    expect(oldSindarinRules['3883770909'].mechanic('abaꝁma').out).toBe('abaꝁwa'); // Non-existent word
  });

  it('01200 - [tʰn] became [ttʰ]', () => {
    expect(oldSindarinRules['1757900715'].mechanic('abc').out).toBe('abc');
    // Input uses single-char form: ŧ=tʰ
    // Only one example, and it's Old Noldorin:
    expect(oldSindarinRules['1757900715'].mechanic('paŧnā').out).toBe('patŧā');
  });

  it('01300 - final [d] spirantalized and vanished', () => {
    expect(oldSindarinRules['1789116309'].mechanic('abc').out).toBe('abc');
    // Only one example:
    expect(oldSindarinRules['1789116309'].mechanic('tad').out).toBe('tā');
    // These are all made up:
    expect(oldSindarinRules['1789116309'].mechanic('badad').out).toBe('badā');
    expect(oldSindarinRules['1789116309'].mechanic('dadad').out).toBe('dadā');
    expect(oldSindarinRules['1789116309'].mechanic('dadadad').out).toBe('dadadā');
  });

  it('01400 - final [tʰ] became [t]', () => {
    expect(oldSindarinRules['300026073'].mechanic('abc').out).toBe('abc');
    // Input uses single-char form: ŧ=tʰ, x=kh/ch
    // Only example, from Noldorin:
    expect(oldSindarinRules['300026073'].mechanic('xōŧ').out).toBe('xōt');
  });

  it('01500 - medial [sj], [sw] became [xʲ], [xʷ]', () => {
    expect(oldSindarinRules['3229649933'].mechanic('abc').out).toBe('abc');
    // Output uses single-char forms: ꜧ=xʲ, ƕ=xʷ
    expect(oldSindarinRules['3229649933'].mechanic('lisjā').out).toBe('liꜧā');
    expect(oldSindarinRules['3229649933'].mechanic('teswā').out).toBe('teƕā');
    // Made-up value to test multiple occurrences:
    expect(oldSindarinRules['3229649933'].mechanic('tesjaswā').out).toBe('teꜧaƕā');
  });

  it('01600 - long final vowels were shortened', () => {
    expect(oldSindarinRules['2753394075'].mechanic('abc').out).toBe('abc');
    expect(oldSindarinRules['2753394075'].mechanic('aklaripā').out).toBe('aklaripa');
    expect(oldSindarinRules['2753394075'].mechanic('glossōjā').out).toBe('glossōja');
    expect(oldSindarinRules['2753394075'].mechanic('pʰiniŋgornā').out).toBe('pʰiniŋgorna');
    expect(oldSindarinRules['2753394075'].mechanic('andūnē').out).toBe('andūne');
    expect(oldSindarinRules['2753394075'].mechanic('brassē').out).toBe('brasse');
    expect(oldSindarinRules['2753394075'].mechanic('kʰītʰilōmē').out).toBe('kʰītʰilōme');
    expect(oldSindarinRules['2753394075'].mechanic('kʰerunī').out).toBe('kʰeruni');
    expect(oldSindarinRules['2753394075'].mechanic('rembinī').out).toBe('rembini');
    expect(oldSindarinRules['2753394075'].mechanic('ŋgolodō').out).toBe('ŋgolodo');
    expect(oldSindarinRules['2753394075'].mechanic('ŋgorotʰūsō').out).toBe('ŋgorotʰūso');
    expect(oldSindarinRules['2753394075'].mechanic('kamprū').out).toBe('kampru');
    expect(oldSindarinRules['2753394075'].mechanic('kamprú').out).toBe('kampru');
    expect(oldSindarinRules['2753394075'].mechanic('kamprû').out).toBe('kampru');
  });

  it('01700 - [z] vanished before [d] lengthening preceding vowel', () => {
    expect(oldSindarinRules['1249932447'].mechanic('abc').out).toBe('abc');
    expect(oldSindarinRules['1249932447'].mechanic('ezde').out).toBe('ēde');
    expect(oldSindarinRules['1249932447'].mechanic('mizde').out).toBe('mīde');
    expect(oldSindarinRules['1249932447'].mechanic('rezda').out).toBe('rēda');
  });

  it('01800 - syllabic initial [s] became [es]', () => {
    expect(oldSindarinRules['2107885715'].mechanic('abc').out).toBe('abc');
    expect(oldSindarinRules['2107885715'].mechanic('ṣkala').out).toBe('eskala');
    expect(oldSindarinRules['2107885715'].mechanic('ṣpine').out).toBe('espine');
    expect(oldSindarinRules['2107885715'].mechanic('ṣtenna').out).toBe('estenna');
    expect(oldSindarinRules['2107885715'].mechanic('ṣtenta').out).toBe('estenta');
  });

  it('01900 - initial [s] unvoiced following consonants', () => {
    expect(oldSindarinRules['3923357111'].mechanic('abc').out).toBe('abc');
    // Output uses single-char forms: ꟃ=mh, ꞃ=nh, ꝉ=lh, ꞧ=rh, ƕ=wh
    expect(oldSindarinRules['3923357111'].mechanic('sjerwa').out).toBe('j̊erwa');
    expect(oldSindarinRules['3923357111'].mechanic('slasu').out).toBe('ꝉasu');
    expect(oldSindarinRules['3923357111'].mechanic('snaide').out).toBe('ꞃaide');
    expect(oldSindarinRules['3923357111'].mechanic('srāba').out).toBe('ꞧāba');
    expect(oldSindarinRules['3923357111'].mechanic('swa').out).toBe('ƕa');
    expect(oldSindarinRules['3923357111'].mechanic('swaiwar').out).toBe('ƕaiwar');
  });

  it('02000 - final [e] became [a] after single [s] and [st]', () => {
    expect(oldSindarinRules['1763851339'].mechanic('abc').out).toBe('abc');
    // [-se] > [-sa]:
    expect(oldSindarinRules['1763851339'].mechanic('karakse').out).toBe('karaksa'); // Old Noldorin
    // [-ste] > [-sta]:
    expect(oldSindarinRules['1763851339'].mechanic('pʰaste').out).toBe('pʰasta'); // Old Noldorin
    // [-rte] > [-rta]:
    expect(oldSindarinRules['1763851339'].mechanic('kirte').out).toBe('kirta');
    // [-sse] > [-sse]:
    expect(oldSindarinRules['1763851339'].mechanic('glasse').out).toBe('glasse'); // Old Noldorin
    // Shouldn't trigger:
    expect(oldSindarinRules['1763851339'].mechanic('litse').out).toBe('litse');
  });

  it('02100 - voiceless stops became spirants after initial [s]', () => {
    // In this rule, we really could use single characters representation instead of digraphs.
    // However, it makes no sense to force it unless we use the same standard for all rules.
    // Maybe we should just use single characters for all rules.
    expect(oldSindarinRules['798037075'].mechanic('abc').out).toBe('abc');
    // [sp-] > [sɸ-]:
    expect(oldSindarinRules['798037075'].mechanic('spinde').out).toBe('sɸinde');
    // [st-] > [sθ-]:
    expect(oldSindarinRules['798037075'].mechanic('stenna').out).toBe('sθenna');
    // [sk-] > [sx-]:
    expect(oldSindarinRules['798037075'].mechanic('skalja-').out).toBe('sxalja-'); // Old Noldorin
  });

  it('02200 - voiceless stops aspirated after consonants except [s]', () => {
    expect(oldSindarinRules['1683955225'].mechanic('xyz').out).toBe('xyz');
    // [pp] > [ppʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('eppel').out).toBe('epƥel');
    // [pt] > [ptʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('lepta-').out).toBe('lepŧa-');
    // [tt] > [ttʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('grotta').out).toBe('grotŧa');
    // [tp] > [tpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('batpa').out).toBe('batƥa'); // Non-existent word

    // [kk] > [kkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('rokko').out).toBe('rokꝁo');
    // [kt] > [ktʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('ekta').out).toBe('ekŧa');
    // [gt] > [gtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('agta').out).toBe('agŧa'); // Non-existent word

    // [np] > [npʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('enpet-').out).toBe('enƥet-');
    // [mp] > [mpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('gampa').out).toBe('gamƥa');
    // [nt] > [ntʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('anta-').out).toBe('anŧa-');
    // [ŋk] > [ŋkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('taŋka').out).toBe('taŋꝁa');
    // [lp] > [lpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('alpa').out).toBe('alƥa');
    // [lt] > [ltʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('maltorne').out).toBe('malŧorne');
    // [lk] > [lkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('balka').out).toBe('balꝁa');
    // [rp] > [rpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('karpa-').out).toBe('karƥa-');
    // [rt] > [rtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('ambarta').out).toBe('ambarŧa');
    // [rk] > [rkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('urko').out).toBe('urꝁo');
    // [xt] > [xtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('axta').out).toBe('axŧa'); // Non-existent word
  });

  it('02300 - aspirates became voiceless spirants', () => {
    expect(oldSindarinRules['883570327'].mechanic('xyz').out).toBe('xyz');
    // Input uses single-char forms: ƥ=pʰ, ŧ=tʰ, ꝁ=kʰ
    // [pʰ] > [ɸ]:
    expect(oldSindarinRules['883570327'].mechanic('ƥelga').out).toBe('ɸelga');
    // [tʰ] > [θ]:
    expect(oldSindarinRules['883570327'].mechanic('iŧil').out).toBe('iθil');
    // [kʰ] > [x]:
    expect(oldSindarinRules['883570327'].mechanic('karꝁa').out).toBe('karxa');
    // [ppʰ] > [ɸɸ]:
    expect(oldSindarinRules['883570327'].mechanic('epƥel').out).toBe('eɸɸel');
    // [ptʰ] > [ɸθ]:
    expect(oldSindarinRules['883570327'].mechanic('lepŧa-').out).toBe('leɸθa-');
    // [ttʰ] > [θθ]:
    expect(oldSindarinRules['883570327'].mechanic('grotŧa').out).toBe('groθθa');
    // [tkʰ] > [xx]:
    expect(oldSindarinRules['883570327'].mechanic('abatꝁa').out).toBe('abaxxa'); // Non-existent word
    // [ktʰ] > [xθ]:
    expect(oldSindarinRules['883570327'].mechanic('ekŧa').out).toBe('exθa');
    // [kkʰ] > [xx]:
    expect(oldSindarinRules['883570327'].mechanic('rokꝁo').out).toBe('roxxo');
  });

  it('02400 - [eu] became [iu]', () => {
    expect(oldSindarinRules['2662025405'].mechanic('abc').out).toBe('abc');
    expect(oldSindarinRules['2662025405'].mechanic('deule').out).toBe('diule');
    expect(oldSindarinRules['2662025405'].mechanic('deura').out).toBe('diura');
    expect(oldSindarinRules['2662025405'].mechanic('keule').out).toBe('kiule');
    expect(oldSindarinRules['2662025405'].mechanic('keurāna').out).toBe('kiurāna');
    expect(oldSindarinRules['2662025405'].mechanic('leuka').out).toBe('liuka');
  });

  it('02500 - [ā], [au] became [ǭ]', () => {
    expect(oldSindarinRules['2858643115'].mechanic('abc').out).toBe('abc');
    expect(oldSindarinRules['2858643115'].mechanic('agāle').out).toBe('agǭle');
    expect(oldSindarinRules['2858643115'].mechanic('amān').out).toBe('amǭn');
    expect(oldSindarinRules['2858643115'].mechanic('bakār').out).toBe('bakǭr');
    expect(oldSindarinRules['2858643115'].mechanic('gāja').out).toBe('gǭja');
    expect(oldSindarinRules['2858643115'].mechanic('gwābandina').out).toBe('gwǭbandina');
    expect(oldSindarinRules['2858643115'].mechanic('kawathāne').out).toBe('kawathǭne');
    expect(oldSindarinRules['2858643115'].mechanic('lindāna').out).toBe('lindǭna');
    expect(oldSindarinRules['2858643115'].mechanic('narāka').out).toBe('narǭka');
    expect(oldSindarinRules['2858643115'].mechanic('r̥āba').out).toBe('r̥ǭba');
    expect(oldSindarinRules['2858643115'].mechanic('tasāre').out).toBe('tasǭre');
    expect(oldSindarinRules['2858643115'].mechanic('wāja').out).toBe('wǭja');
    expect(oldSindarinRules['2858643115'].mechanic('xaðād').out).toBe('xaðǭd');
    expect(oldSindarinRules['2858643115'].mechanic('ɸindarāto').out).toBe('ɸindarǭto');
    // These are all Old Noldorin:
    expect(oldSindarinRules['2858643115'].mechanic('glaure').out).toBe('glǭre');
    expect(oldSindarinRules['2858643115'].mechanic('gotʰombauko').out).toBe('gotʰombǭko');
    expect(oldSindarinRules['2858643115'].mechanic('pʰauka').out).toBe('pʰǭka');
    expect(oldSindarinRules['2858643115'].mechanic('tʰaurena').out).toBe('tʰǭrena');

  });

  it('02600 - [j] became [i] after vowels', () => {
    expect(oldSindarinRules['161840619'].mechanic('abc').out).toBe('abc');
    // [VjV] > [ViV]:
    expect(oldSindarinRules['161840619'].mechanic('aθaja').out).toBe('aθaia');
    expect(oldSindarinRules['161840619'].mechanic('gwajalauto').out).toBe('gwaialauto');
    expect(oldSindarinRules['161840619'].mechanic('kasraja').out).toBe('kasraia');
    expect(oldSindarinRules['161840619'].mechanic('r̥aja').out).toBe('r̥aia');
    expect(oldSindarinRules['161840619'].mechanic('sarnije').out).toBe('sarnīe');
    expect(oldSindarinRules['161840619'].mechanic('waja').out).toBe('waia');
    expect(oldSindarinRules['161840619'].mechanic('wǭja').out).toBe('wǭia');
    // Not sure about this one:
    // expect(oldSindarinRules['161840619'].mechanic('ɸereja').out).toBe('ɸereiā');
    // The a becomes long. It seems related to the preceding 'e', but I can't be sure without more data.
    // [-Vj] > [-Vi]:
    // These are all Old Noldorin:
    expect(oldSindarinRules['161840619'].mechanic('mbǭj').out).toBe('mbǭi');
    expect(oldSindarinRules['161840619'].mechanic('nǭj').out).toBe('nǭi');
  });

  it('02700 - [ei], [ou] became [ī], [ū]', () => {
    expect(oldSindarinRules['1942848653'].mechanic('abc').out).toBe('abc');
    // [ei] > [ī]:
    expect(oldSindarinRules['1942848653'].mechanic('neide').out).toBe('nīde');
    expect(oldSindarinRules['1942848653'].mechanic('ɸereiā').out).toBe('ɸerīa');
    // [ou] > [ū]:
    expect(oldSindarinRules['1942848653'].mechanic('θouo').out).toBe('θūo');
    expect(oldSindarinRules['1942848653'].mechanic('θouson').out).toBe('θūson');
  });

  it('02800 - [oi], [ǭi] became [ui], [oi]', () => {
    expect(oldSindarinRules['2010669085'].mechanic('abc').out).toBe('abc');
    // [oi] > [ui]:
    expect(oldSindarinRules['2010669085'].mechanic('glossoia').out).toBe('glossuia');
    expect(oldSindarinRules['2010669085'].mechanic('oio').out).toBe('uio');
    expect(oldSindarinRules['2010669085'].mechanic('oiomalθina').out).toBe('uiomalθina');
    // [ǭi] > [oi]:
    expect(oldSindarinRules['2010669085'].mechanic('gǭia').out).toBe('goia');
    expect(oldSindarinRules['2010669085'].mechanic('l̥ǭire').out).toBe('l̥oire');
    expect(oldSindarinRules['2010669085'].mechanic('ɸanǭia').out).toBe('ɸanoia');
  });

  it('02900 - medial [s] assimilated to following nasal', () => {
    expect(oldSindarinRules['1716741635'].mechanic('abc').out).toBe('abc');
    // All examples are Old Noldorin:
    // [-sm-] > [-mm-]:
    expect(oldSindarinRules['1716741635'].mechanic('asmale').out).toBe('ammale');
    expect(oldSindarinRules['1716741635'].mechanic('asmalinde').out).toBe('ammalinde');
    expect(oldSindarinRules['1716741635'].mechanic('kasma').out).toBe('kamma');
    // [-sn-] > [-nn-]:
    expect(oldSindarinRules['1716741635'].mechanic('besno').out).toBe('benno');
    expect(oldSindarinRules['1716741635'].mechanic('xerbesno').out).toBe('xerbenno');
    // [-sr-] > [-rr-]: did not occur in Old Sindarin.
    // expect(oldSindarinRules['1716741635'].mechanic('gę̄sra').out).toBe('gę̄rra');
    // Initial and final clusters are not affected:
    expect(oldSindarinRules['1716741635'].mechanic('babas').out).toBe('babas'); // Non-existent word
    expect(oldSindarinRules['1716741635'].mechanic('sababa').out).toBe('sababa'); // Non-existent word
    expect(oldSindarinRules['1716741635'].mechanic('sbaba').out).toBe('sbaba'); // Non-existent word
  });

  it('03000 - intervocalic [s] became [h]', () => {
    expect(oldSindarinRules['3388236413'].mechanic('abc').out).toBe('abc');
    expect(oldSindarinRules['3388236413'].mechanic('asa').out).toBe('aha');
    expect(oldSindarinRules['3388236413'].mechanic('asǭme').out).toBe('ahǭme');
    expect(oldSindarinRules['3388236413'].mechanic('ŋgoroθūso').out).toBe('ŋgoroθūho');
    expect(oldSindarinRules['3388236413'].mechanic('pelesendore').out).toBe('pelehendore');
    expect(oldSindarinRules['3388236413'].mechanic('tindōmiselde').out).toBe('tindōmihelde');
    expect(oldSindarinRules['3388236413'].mechanic('θūse').out).toBe('θūhe');
    expect(oldSindarinRules['3388236413'].mechanic('θūson').out).toBe('θūhon');
    expect(oldSindarinRules['3388236413'].mechanic('wanaso').out).toBe('wanaho');
    // Other s sounds are not affected:
    expect(oldSindarinRules['3388236413'].mechanic('sababa').out).toBe('sababa'); // Non-existent word
    expect(oldSindarinRules['3388236413'].mechanic('ababas').out).toBe('ababas'); // Non-existent word
    expect(oldSindarinRules['3388236413'].mechanic('sbaba').out).toBe('sbaba'); // Non-existent word
    expect(oldSindarinRules['3388236413'].mechanic('asbaba').out).toBe('asbaba'); // Non-existent word
    expect(oldSindarinRules['3388236413'].mechanic('absaba').out).toBe('absaba'); // Non-existent word
  });

  it('03100 - [p], [t], [k] spirantalized before [s]', () => {
    expect(oldSindarinRules['1516403107'].mechanic('abc').out).toBe('abc');
    // [ps] > [ɸɸ]:
    expect(oldSindarinRules['1516403107'].mechanic('apsa').out).toBe('aɸɸa'); // Non-existent word
    expect(oldSindarinRules['1516403107'].mechanic('abapsaba').out).toBe('abaɸɸaba'); // Non-existent word
    // [ks] > [xx]:
    expect(oldSindarinRules['1516403107'].mechanic('akse').out).toBe('axxe');
    // [ts] > [θθ]:
    expect(oldSindarinRules['1516403107'].mechanic('lotse').out).toBe('loθθe');
    expect(oldSindarinRules['1516403107'].mechanic('otsōja').out).toBe('oθθōja');
  });

  it('03200 - [rl] became [ll]', () => {
    expect(oldSindarinRules['1288402337'].mechanic('abc').out).toBe('abc');
    // Only one example:
    expect(oldSindarinRules['1288402337'].mechanic('glawarlinde').out).toBe('glawallinde');
  });

  it('03300 - [j] vanished before [i], [ui]', () => {
    // It looks like this is only for initial clusters. Double-check!
    expect(oldSindarinRules['2851583127'].mechanic('abc').out).toBe('abc');
    // Only one example:
    // [jui-] > [ui-]:
    expect(oldSindarinRules['2851583127'].mechanic('juial').out).toBe('uial');
    // [ji] > [i]:
    expect(oldSindarinRules['2851583127'].mechanic('jiabc').out).toBe('iabc'); // Non-existent word
  });

  it('03400 - [w] vanished before [u]', () => {
    expect(oldSindarinRules['2167009353'].mechanic('abc').out).toBe('abc');
    // All examples are from Old Noldorin:
    // [uw] > [u]:
    expect(oldSindarinRules['2167009353'].mechanic('kukūwa').out).toBe('kukua');
    // [wu] > [u]:
    expect(oldSindarinRules['2167009353'].mechanic('gwuin').out).toBe('guin');
    expect(oldSindarinRules['2167009353'].mechanic('wuia').out).toBe('uia');
    expect(oldSindarinRules['2167009353'].mechanic('wuiar').out).toBe('uiar');
  });

  it('03500 - [bm], [dn] became [mm], [nn]', () => {
    expect(oldSindarinRules['2615312913'].mechanic('abc').out).toBe('abc');
    // [bm] > [mm]:
    expect(oldSindarinRules['2615312913'].mechanic('abma').out).toBe('amma'); // Non-existent word
    // [dn] > [nn]:
    expect(oldSindarinRules['2615312913'].mechanic('padna').out).toBe('panna'); // Old Noldorin
    expect(oldSindarinRules['2615312913'].mechanic('madna').out).toBe('manna'); // Old Noldorin
  });
});
