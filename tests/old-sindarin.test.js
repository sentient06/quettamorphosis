import { describe, it, expect } from "vitest";
import { oldSindarinRules } from "../src/old-sindarin.js";
import { digraphsToSingle, singleToDigraphs } from "../src/utils.js";

// Helper to convert test input to single-char form (simulating pre-processing)
const toSingle = (str) => digraphsToSingle(str);

describe('Old Sindarin rules', () => {
  it('00100 - final i-diphthongs became long [ī] in polysyllables', () => {
    expect(oldSindarinRules['71909447'].mechanic('abc')).toBe('abc');

    // [-Sai] > [-Sī]:
    expect(oldSindarinRules['71909447'].mechanic('ossai')).toBe('ossī');
    expect(oldSindarinRules['71909447'].mechanic('pʰelgai')).toBe('pʰelgī');
    // [-Sei] > [-Sī]:
    expect(oldSindarinRules['71909447'].mechanic('wendēi')).toBe('wendī');
    // [-Soi] > [-Sī]:
    expect(oldSindarinRules['71909447'].mechanic('etlōi')).toBe('etlī');
    expect(oldSindarinRules['71909447'].mechanic('tonōi')).toBe('tonī');
  });

  it('00200 - initial [ŋ] became [ŋg] or [g]', () => {
    expect(oldSindarinRules['1989991061'].mechanic('abc')).toBe('abc');
    // There are not many examples and the ones existent are ambiguous.
    expect(oldSindarinRules['1989991061'].mechanic('ñgalatārigel')).toBe('galatārigel');
    expect(oldSindarinRules['1989991061'].mechanic('ŋgalatārigel')).toBe('galatārigel');
    expect(oldSindarinRules['1989991061'].mechanic('ŋab')).toBe('gab'); // Non-existent word
  });

  it('00300 - first in pair of voiced stops vocalized', () => {
    expect(oldSindarinRules['4282797219'].mechanic('abc')).toBe('abc');
    // Input uses single-char form: ꝁ=kʰ, x=kh/ch
    // [Vbd] > [Vud]:
    expect(oldSindarinRules['4282797219'].mechanic('ꝁabdā')).toBe('ꝁaudā');
    expect(oldSindarinRules['4282797219'].mechanic('labdē')).toBe('laudē');
    // [Vgd] > [Vid]:
    expect(oldSindarinRules['4282797219'].mechanic('negdē')).toBe('neidē');
    expect(oldSindarinRules['4282797219'].mechanic('snagdē')).toBe('snaidē');
  });

  it('00400 - [ɣ] became [g] before nasals and liquids', () => {
    expect(oldSindarinRules['107931923'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['107931923'].mechanic('taɣra')).toBe('tagra');
    // Negative:
    expect(oldSindarinRules['107931923'].mechanic('taɣda')).toBe('taɣda'); // Non-existent word
  });

  it('00500 - initial [ɣ]/[h] vanished', () => {
    expect(oldSindarinRules['1117448055'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['1117448055'].mechanic('ɣekā-')).toBe('ekā-');
    expect(oldSindarinRules['1117448055'].mechanic('ɣeklambar')).toBe('eklambar');
    expect(oldSindarinRules['1117448055'].mechanic('ɣenet')).toBe('enet');
    expect(oldSindarinRules['1117448055'].mechanic('ɣor-')).toBe('or-');
  });

  it('00600 - [j] was lost after initial velars', () => {
    expect(oldSindarinRules['345959193'].mechanic('abc')).toBe('abc');
    // Input uses single-char form: ꝁ=kʰ
    // [kj-] > [k-]:
    expect(oldSindarinRules['345959193'].mechanic('akjāwen')).toBe('akāwen');
    expect(oldSindarinRules['345959193'].mechanic('kjawathāne')).toBe('kawathāne');
    expect(oldSindarinRules['345959193'].mechanic('kjelepē')).toBe('kelepē');
    // [kʰj-] > [kʰ-] (using ꝁ for kʰ):
    expect(oldSindarinRules['345959193'].mechanic('ꝁjabab')).toBe('ꝁabab'); // Non-existent word
    // [gj-] > [g-]:
    expect(oldSindarinRules['345959193'].mechanic('gjabab')).toBe('gabab'); // Non-existent word
    // [skj-] > [sk-]:
    expect(oldSindarinRules['345959193'].mechanic('skjabab')).toBe('skabab'); // Non-existent word
    // [ŋgj] > [ŋg]:
    expect(oldSindarinRules['345959193'].mechanic('ŋgjabab')).toBe('ŋgabab'); // Non-existent word
    // Replace all occurrences:
    expect(oldSindarinRules['345959193'].mechanic('kjawathānekjāwen')).toBe('kawathānekāwen'); // Non-existent word
  });

  it('00700 - medial [m] became [n] before [j], [w]', () => {
    expect(oldSindarinRules['1484184939'].mechanic('abc')).toBe('abc');
    // [mj] > [nj]:
    expect(oldSindarinRules['1484184939'].mechanic('amja-')).toBe('anja-');
    // [mw] > [nw]:
    expect(oldSindarinRules['1484184939'].mechanic('amwa')).toBe('anwa'); // Non-existent word
    // [-mw] > [-mm]:
    expect(oldSindarinRules['1484184939'].mechanic('abamw')).toBe('abamm'); // Non-existent word
  });

  it('00800 - initial [ml], [mr] became [bl], [br]', () => {
    expect(oldSindarinRules['1955360003'].mechanic('abc')).toBe('abc');
    // There are no Sindarin examples for this.
    // Examples have been taken from Noldorin and Gnomish.
    // Gnomish transformations are entirely ficticious.
    // [ml-] > [bl-]:
    expect(oldSindarinRules['1955360003'].mechanic('mloss')).toBe('bloss'); // Gnomish word, ficticious transformation
    // [mr-] > [br-]:
    expect(oldSindarinRules['1955360003'].mechanic('mrekāla')).toBe('brekāla'); // Noldorin
  });

  it('00900 - initial syllabic [m], [n], [ŋ] became [am], [an], [aŋ]', () => {
    // Ask about marking under the nasals: ṃ vs m
    expect(oldSindarinRules['1024355367'].mechanic('abc')).toBe('abc');
    // [ṃ-] > [am-]:
    expect(oldSindarinRules['1024355367'].mechanic('ṃbar')).toBe('ambar');
    // [ṇ-] > [an-]:
    expect(oldSindarinRules['1024355367'].mechanic('ṇdūnē')).toBe('andūnē');
    // [ŋ̣-] > [aŋ-]:
    expect(oldSindarinRules['1024355367'].mechanic('ŋ̣golodō')).toBe('aŋgolodō');
  });

  it('01000 - voiceless stops were voiced before nasals', () => {
    expect(oldSindarinRules['3463937975'].mechanic('abc')).toBe('abc');
    // Sindarin examples:
    // [km] > [gm]:
    expect(oldSindarinRules['3463937975'].mechanic('okma')).toBe('ogma');
    expect(oldSindarinRules['3463937975'].mechanic('tekmā')).toBe('tegmā');
    
    // All the rest is Noldorin (or non-existent):
    // [pn] > [bn]:
    expect(oldSindarinRules['3463937975'].mechanic('lepnar')).toBe('lebnar');
    // [tn] > [dn]:
    expect(oldSindarinRules['3463937975'].mechanic('matna')).toBe('madna');
    // [kn] > [gn]:
    expect(oldSindarinRules['3463937975'].mechanic('ndakno')).toBe('ndagno');
    // [pm] > [bm]:
    expect(oldSindarinRules['3463937975'].mechanic('bapma')).toBe('babma'); // Non-existent word
    // [tm] > [dm]:
    expect(oldSindarinRules['3463937975'].mechanic('jatmē')).toBe('jadmē');
    // [km] > [gm]:
    expect(oldSindarinRules['3463937975'].mechanic('tulukmē')).toBe('tulugmē');
  });

  it('01100 - [m] became [w] after aspirates', () => {
    expect(oldSindarinRules['3883770909'].mechanic('abc')).toBe('abc');
    // Input uses single-char forms: ŧ=tʰ, ƥ=pʰ, ꝁ=kʰ
    // All examples are Noldorin (or non-existent):
    expect(oldSindarinRules['3883770909'].mechanic('paŧmā')).toBe('paŧwā');
    expect(oldSindarinRules['3883770909'].mechanic('abaƥma')).toBe('abaƥwa'); // Non-existent word
    expect(oldSindarinRules['3883770909'].mechanic('abaꝁma')).toBe('abaꝁwa'); // Non-existent word
  });

  it('01200 - [tʰn] became [ttʰ]', () => {
    expect(oldSindarinRules['1757900715'].mechanic('abc')).toBe('abc');
    // Input uses single-char form: ŧ=tʰ
    // Only one example, and it's Old Noldorin:
    expect(oldSindarinRules['1757900715'].mechanic('paŧnā')).toBe('patŧā');
  });

  it('01300 - final [d] spirantalized and vanished', () => {
    expect(oldSindarinRules['1789116309'].mechanic('abc')).toBe('abc');
    // Only one example:
    expect(oldSindarinRules['1789116309'].mechanic('tad')).toBe('tā');
    // These are all made up:
    expect(oldSindarinRules['1789116309'].mechanic('badad')).toBe('badā');
    expect(oldSindarinRules['1789116309'].mechanic('dadad')).toBe('dadā');
    expect(oldSindarinRules['1789116309'].mechanic('dadadad')).toBe('dadadā');
  });

  it('01400 - final [tʰ] became [t]', () => {
    expect(oldSindarinRules['300026073'].mechanic('abc')).toBe('abc');
    // Input uses single-char form: ŧ=tʰ, x=kh/ch
    // Only example, from Noldorin:
    expect(oldSindarinRules['300026073'].mechanic('xōŧ')).toBe('xōt');
  });

  it('01500 - medial [sj], [sw] became [xʲ], [xʷ]', () => {
    expect(oldSindarinRules['3229649933'].mechanic('abc')).toBe('abc');
    // Output uses single-char forms: ꜧ=xʲ, ƕ=xʷ
    expect(oldSindarinRules['3229649933'].mechanic('lisjā')).toBe('liꜧā');
    expect(oldSindarinRules['3229649933'].mechanic('teswā')).toBe('teƕā');
    // Made-up value to test multiple occurrences:
    expect(oldSindarinRules['3229649933'].mechanic('tesjaswā')).toBe('teꜧaƕā');
  });

  it('01600 - long final vowels were shortened', () => {
    expect(oldSindarinRules['2753394075'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['2753394075'].mechanic('aklaripā')).toBe('aklaripa');
    expect(oldSindarinRules['2753394075'].mechanic('glossōjā')).toBe('glossōja');
    expect(oldSindarinRules['2753394075'].mechanic('pʰiniŋgornā')).toBe('pʰiniŋgorna');
    expect(oldSindarinRules['2753394075'].mechanic('andūnē')).toBe('andūne');
    expect(oldSindarinRules['2753394075'].mechanic('brassē')).toBe('brasse');
    expect(oldSindarinRules['2753394075'].mechanic('kʰītʰilōmē')).toBe('kʰītʰilōme');
    expect(oldSindarinRules['2753394075'].mechanic('kʰerunī')).toBe('kʰeruni');
    expect(oldSindarinRules['2753394075'].mechanic('rembinī')).toBe('rembini');
    expect(oldSindarinRules['2753394075'].mechanic('ŋgolodō')).toBe('ŋgolodo');
    expect(oldSindarinRules['2753394075'].mechanic('ŋgorotʰūsō')).toBe('ŋgorotʰūso');
    expect(oldSindarinRules['2753394075'].mechanic('kamprū')).toBe('kampru');
    expect(oldSindarinRules['2753394075'].mechanic('kamprú')).toBe('kampru');
    expect(oldSindarinRules['2753394075'].mechanic('kamprû')).toBe('kampru');
  });

  it('01700 - [z] vanished before [d] lengthening preceding vowel', () => {
    expect(oldSindarinRules['1249932447'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['1249932447'].mechanic('ezde')).toBe('ēde');
    expect(oldSindarinRules['1249932447'].mechanic('mizde')).toBe('mīde');
    expect(oldSindarinRules['1249932447'].mechanic('rezda')).toBe('rēda');
  });

  it('01800 - syllabic initial [s] became [es]', () => {
    expect(oldSindarinRules['2107885715'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['2107885715'].mechanic('ṣkala')).toBe('eskala');
    expect(oldSindarinRules['2107885715'].mechanic('ṣpine')).toBe('espine');
    expect(oldSindarinRules['2107885715'].mechanic('ṣtenna')).toBe('estenna');
    expect(oldSindarinRules['2107885715'].mechanic('ṣtenta')).toBe('estenta');
  });

  it('01900 - initial [s] unvoiced following consonants', () => {
    expect(oldSindarinRules['3923357111'].mechanic('abc')).toBe('abc');
    // Output uses single-char forms: ꟃ=mh, ꞃ=nh, ꝉ=lh, ꞧ=rh, ƕ=wh
    expect(oldSindarinRules['3923357111'].mechanic('sjerwa')).toBe('j̊erwa');
    expect(oldSindarinRules['3923357111'].mechanic('slasu')).toBe('ꝉasu');
    expect(oldSindarinRules['3923357111'].mechanic('snaide')).toBe('ꞃaide');
    expect(oldSindarinRules['3923357111'].mechanic('srāba')).toBe('ꞧāba');
    expect(oldSindarinRules['3923357111'].mechanic('swa')).toBe('ƕa');
    expect(oldSindarinRules['3923357111'].mechanic('swaiwar')).toBe('ƕaiwar');
  });

  it('02000 - final [e] became [a] after single [s] and [st]', () => {
    expect(oldSindarinRules['1763851339'].mechanic('abc')).toBe('abc');
    // [-se] > [-sa]:
    expect(oldSindarinRules['1763851339'].mechanic('karakse')).toBe('karaksa'); // Old Noldorin
    // [-ste] > [-sta]:
    expect(oldSindarinRules['1763851339'].mechanic('pʰaste')).toBe('pʰasta'); // Old Noldorin
    // [-rte] > [-rta]:
    expect(oldSindarinRules['1763851339'].mechanic('kirte')).toBe('kirta');
    // [-sse] > [-sse]:
    expect(oldSindarinRules['1763851339'].mechanic('glasse')).toBe('glasse'); // Old Noldorin
  });

  it('02100 - voiceless stops became spirants after initial [s]', () => {
    // In this rule, we really could use single characters representation instead of digraphs.
    // However, it makes no sense to force it unless we use the same standard for all rules.
    // Maybe we should just use single characters for all rules.
    expect(oldSindarinRules['798037075'].mechanic('abc')).toBe('abc');
    // [sp-] > [sɸ-]:
    expect(oldSindarinRules['798037075'].mechanic('spinde')).toBe('sɸinde');
    // [st-] > [sθ-]:
    expect(oldSindarinRules['798037075'].mechanic('stenna')).toBe('sθenna');
    // [sk-] > [sx-]:
    expect(oldSindarinRules['798037075'].mechanic('skalja-')).toBe('sxalja-'); // Old Noldorin
  });

  it('02200 - voiceless stops aspirated after consonants except [s]', () => {
    expect(oldSindarinRules['1683955225'].mechanic('xyz')).toBe('xyz');
    // [pp] > [ppʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('eppel')).toBe('epƥel');
    // [pt] > [ptʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('lepta-')).toBe('lepŧa-');
    // [tt] > [ttʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('grotta')).toBe('grotŧa');
    // [tp] > [tpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('batpa')).toBe('batƥa'); // Non-existent word

    // [kk] > [kkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('rokko')).toBe('rokꝁo');
    // [kt] > [ktʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('ekta')).toBe('ekŧa');
    // [gt] > [gtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('agta')).toBe('agŧa'); // Non-existent word

    // [np] > [npʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('enpet-')).toBe('enƥet-');
    // [mp] > [mpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('gampa')).toBe('gamƥa');
    // [nt] > [ntʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('anta-')).toBe('anŧa-');
    // [ŋk] > [ŋkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('taŋka')).toBe('taŋꝁa');
    // [lp] > [lpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('alpa')).toBe('alƥa');
    // [lt] > [ltʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('maltorne')).toBe('malŧorne');
    // [lk] > [lkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('balka')).toBe('balꝁa');
    // [rp] > [rpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('karpa-')).toBe('karƥa-');
    // [rt] > [rtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('ambarta')).toBe('ambarŧa');
    // [rk] > [rkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('urko')).toBe('urꝁo');
    // [xt] > [xtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('axta')).toBe('axŧa'); // Non-existent word
  });

  it('02300 - aspirates became voiceless spirants', () => {
    expect(oldSindarinRules['883570327'].mechanic('xyz')).toBe('xyz');
    // Input uses single-char forms: ƥ=pʰ, ŧ=tʰ, ꝁ=kʰ
    // [pʰ] > [ɸ]:
    expect(oldSindarinRules['883570327'].mechanic('ƥelga')).toBe('ɸelga');
    // [tʰ] > [θ]:
    expect(oldSindarinRules['883570327'].mechanic('iŧil')).toBe('iθil');
    // [kʰ] > [x]:
    expect(oldSindarinRules['883570327'].mechanic('karꝁa')).toBe('karxa');
    // [ppʰ] > [ɸɸ]:
    expect(oldSindarinRules['883570327'].mechanic('epƥel')).toBe('eɸɸel');
    // [ptʰ] > [ɸθ]:
    expect(oldSindarinRules['883570327'].mechanic('lepŧa-')).toBe('leɸθa-');
    // [ttʰ] > [θθ]:
    expect(oldSindarinRules['883570327'].mechanic('grotŧa')).toBe('groθθa');
    // [tkʰ] > [xx]:
    expect(oldSindarinRules['883570327'].mechanic('abatꝁa')).toBe('abaxxa'); // Non-existent word
    // [ktʰ] > [xθ]:
    expect(oldSindarinRules['883570327'].mechanic('ekŧa')).toBe('exθa');
    // [kkʰ] > [xx]:
    expect(oldSindarinRules['883570327'].mechanic('rokꝁo')).toBe('roxxo');
  });

  it('02400 - [eu] became [iu]', () => {
    expect(oldSindarinRules['2662025405'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['2662025405'].mechanic('deule')).toBe('diule');
    expect(oldSindarinRules['2662025405'].mechanic('deura')).toBe('diura');
    expect(oldSindarinRules['2662025405'].mechanic('keule')).toBe('kiule');
    expect(oldSindarinRules['2662025405'].mechanic('keurāna')).toBe('kiurāna');
    expect(oldSindarinRules['2662025405'].mechanic('leuka')).toBe('liuka');
  });

  it('02500 - [ā], [au] became [ǭ]', () => {
    expect(oldSindarinRules['2858643115'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['2858643115'].mechanic('agāle')).toBe('agǭle');
    expect(oldSindarinRules['2858643115'].mechanic('amān')).toBe('amǭn');
    expect(oldSindarinRules['2858643115'].mechanic('bakār')).toBe('bakǭr');
    expect(oldSindarinRules['2858643115'].mechanic('gāja')).toBe('gǭja');
    expect(oldSindarinRules['2858643115'].mechanic('gwābandina')).toBe('gwǭbandina');
    expect(oldSindarinRules['2858643115'].mechanic('kawathāne')).toBe('kawathǭne');
    expect(oldSindarinRules['2858643115'].mechanic('lindāna')).toBe('lindǭna');
    expect(oldSindarinRules['2858643115'].mechanic('narāka')).toBe('narǭka');
    expect(oldSindarinRules['2858643115'].mechanic('r̥āba')).toBe('r̥ǭba');
    expect(oldSindarinRules['2858643115'].mechanic('tasāre')).toBe('tasǭre');
    expect(oldSindarinRules['2858643115'].mechanic('wāja')).toBe('wǭja');
    expect(oldSindarinRules['2858643115'].mechanic('xaðād')).toBe('xaðǭd');
    expect(oldSindarinRules['2858643115'].mechanic('ɸindarāto')).toBe('ɸindarǭto');
    // These are all Old Noldorin:
    expect(oldSindarinRules['2858643115'].mechanic('glaure')).toBe('glǭre');
    expect(oldSindarinRules['2858643115'].mechanic('gotʰombauko')).toBe('gotʰombǭko');
    expect(oldSindarinRules['2858643115'].mechanic('pʰauka')).toBe('pʰǭka');
    expect(oldSindarinRules['2858643115'].mechanic('tʰaurena')).toBe('tʰǭrena');

  });

  it('02600 - [j] became [i] after vowels', () => {
    expect(oldSindarinRules['161840619'].mechanic('abc')).toBe('abc');
    // [VjV] > [ViV]:
    expect(oldSindarinRules['161840619'].mechanic('aθaja')).toBe('aθaia');
    expect(oldSindarinRules['161840619'].mechanic('gwajalauto')).toBe('gwaialauto');
    expect(oldSindarinRules['161840619'].mechanic('kasraja')).toBe('kasraia');
    expect(oldSindarinRules['161840619'].mechanic('r̥aja')).toBe('r̥aia');
    expect(oldSindarinRules['161840619'].mechanic('sarnije')).toBe('sarnīe');
    expect(oldSindarinRules['161840619'].mechanic('waja')).toBe('waia');
    expect(oldSindarinRules['161840619'].mechanic('wǭja')).toBe('wǭia');
    // Not sure about this one:
    // expect(oldSindarinRules['161840619'].mechanic('ɸereja')).toBe('ɸereiā');
    // The a becomes long. It seems related to the preceding 'e', but I can't be sure without more data.
    // [-Vj] > [-Vi]:
    // These are all Old Noldorin:
    expect(oldSindarinRules['161840619'].mechanic('mbǭj')).toBe('mbǭi');
    expect(oldSindarinRules['161840619'].mechanic('nǭj')).toBe('nǭi');
  });

  it('02700 - [ei], [ou] became [ī], [ū]', () => {
    expect(oldSindarinRules['1942848653'].mechanic('abc')).toBe('abc');
    // [ei] > [ī]:
    expect(oldSindarinRules['1942848653'].mechanic('neide')).toBe('nīde');
    expect(oldSindarinRules['1942848653'].mechanic('ɸereiā')).toBe('ɸerīa');
    // [ou] > [ū]:
    expect(oldSindarinRules['1942848653'].mechanic('θouo')).toBe('θūo');
    expect(oldSindarinRules['1942848653'].mechanic('θouson')).toBe('θūson');
  });

  it('02800 - [oi], [ǭi] became [ui], [oi]', () => {
    expect(oldSindarinRules['2010669085'].mechanic('abc')).toBe('abc');
    // [oi] > [ui]:
    expect(oldSindarinRules['2010669085'].mechanic('glossoia')).toBe('glossuia');
    expect(oldSindarinRules['2010669085'].mechanic('oio')).toBe('uio');
    expect(oldSindarinRules['2010669085'].mechanic('oiomalθina')).toBe('uiomalθina');
    // [ǭi] > [oi]:
    expect(oldSindarinRules['2010669085'].mechanic('gǭia')).toBe('goia');
    expect(oldSindarinRules['2010669085'].mechanic('l̥ǭire')).toBe('l̥oire');
    expect(oldSindarinRules['2010669085'].mechanic('ɸanǭia')).toBe('ɸanoia');
  });

  it('02900 - medial [s] assimilated to following nasal', () => {
    expect(oldSindarinRules['1716741635'].mechanic('abc')).toBe('abc');
    // All examples are Old Noldorin:
    // [-sm-] > [-mm-]:
    expect(oldSindarinRules['1716741635'].mechanic('asmale')).toBe('ammale');
    expect(oldSindarinRules['1716741635'].mechanic('asmalinde')).toBe('ammalinde');
    expect(oldSindarinRules['1716741635'].mechanic('kasma')).toBe('kamma');
    // [-sn-] > [-nn-]:
    expect(oldSindarinRules['1716741635'].mechanic('besno')).toBe('benno');
    expect(oldSindarinRules['1716741635'].mechanic('xerbesno')).toBe('xerbenno');
    // [-sr-] > [-rr-]: did not occur in Old Sindarin.
    // expect(oldSindarinRules['1716741635'].mechanic('gę̄sra')).toBe('gę̄rra');
    // Initial and final clusters are not affected:
    expect(oldSindarinRules['1716741635'].mechanic('babas')).toBe('babas'); // Non-existent word
    expect(oldSindarinRules['1716741635'].mechanic('sababa')).toBe('sababa'); // Non-existent word
    expect(oldSindarinRules['1716741635'].mechanic('sbaba')).toBe('sbaba'); // Non-existent word
  });

  it('03000 - intervocalic [s] became [h]', () => {
    expect(oldSindarinRules['3388236413'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['3388236413'].mechanic('asa')).toBe('aha');
    expect(oldSindarinRules['3388236413'].mechanic('asǭme')).toBe('ahǭme');
    expect(oldSindarinRules['3388236413'].mechanic('ŋgoroθūso')).toBe('ŋgoroθūho');
    expect(oldSindarinRules['3388236413'].mechanic('pelesendore')).toBe('pelehendore');
    expect(oldSindarinRules['3388236413'].mechanic('tindōmiselde')).toBe('tindōmihelde');
    expect(oldSindarinRules['3388236413'].mechanic('θūse')).toBe('θūhe');
    expect(oldSindarinRules['3388236413'].mechanic('θūson')).toBe('θūhon');
    expect(oldSindarinRules['3388236413'].mechanic('wanaso')).toBe('wanaho');
    // Other s sounds are not affected:
    expect(oldSindarinRules['3388236413'].mechanic('sababa')).toBe('sababa'); // Non-existent word
    expect(oldSindarinRules['3388236413'].mechanic('ababas')).toBe('ababas'); // Non-existent word
    expect(oldSindarinRules['3388236413'].mechanic('sbaba')).toBe('sbaba'); // Non-existent word
    expect(oldSindarinRules['3388236413'].mechanic('asbaba')).toBe('asbaba'); // Non-existent word
    expect(oldSindarinRules['3388236413'].mechanic('absaba')).toBe('absaba'); // Non-existent word
  });

  it('03100 - [p], [t], [k] spirantalized before [s]', () => {
    expect(oldSindarinRules['1516403107'].mechanic('abc')).toBe('abc');
    // [ps] > [ɸɸ]:
    expect(oldSindarinRules['1516403107'].mechanic('apsa')).toBe('aɸɸa'); // Non-existent word
    expect(oldSindarinRules['1516403107'].mechanic('abapsaba')).toBe('abaɸɸaba'); // Non-existent word
    // [ks] > [xx]:
    expect(oldSindarinRules['1516403107'].mechanic('akse')).toBe('axxe');
    // [ts] > [θθ]:
    expect(oldSindarinRules['1516403107'].mechanic('lotse')).toBe('loθθe');
    expect(oldSindarinRules['1516403107'].mechanic('otsōja')).toBe('oθθōja');
  });

  it('03200 - [rl] became [ll]', () => {
    expect(oldSindarinRules['1288402337'].mechanic('abc')).toBe('abc');
    // Only one example:
    expect(oldSindarinRules['1288402337'].mechanic('glawarlinde')).toBe('glawallinde');
  });

  it('03300 - [j] vanished before [i], [ui]', () => {
    // It looks like this is only for initial clusters. Double-check!
    expect(oldSindarinRules['2851583127'].mechanic('abc')).toBe('abc');
    // Only one example:
    // [jui-] > [ui-]:
    expect(oldSindarinRules['2851583127'].mechanic('juial')).toBe('uial');
    // [ji] > [i]:
    expect(oldSindarinRules['2851583127'].mechanic('jiabc')).toBe('iabc'); // Non-existent word
  });

  it('03400 - [w] vanished before [u]', () => {
    expect(oldSindarinRules['2167009353'].mechanic('abc')).toBe('abc');
    // All examples are from Old Noldorin:
    // [uw] > [u]:
    expect(oldSindarinRules['2167009353'].mechanic('kukūwa')).toBe('kukua');
    // [wu] > [u]:
    expect(oldSindarinRules['2167009353'].mechanic('gwuin')).toBe('guin');
    expect(oldSindarinRules['2167009353'].mechanic('wuia')).toBe('uia');
    expect(oldSindarinRules['2167009353'].mechanic('wuiar')).toBe('uiar');
  });

  it('03500 - [bm], [dn] became [mm], [nn]', () => {
    expect(oldSindarinRules['2615312913'].mechanic('abc')).toBe('abc');
    // [bm] > [mm]:
    expect(oldSindarinRules['2615312913'].mechanic('abma')).toBe('amma'); // Non-existent word
    // [dn] > [nn]:
    expect(oldSindarinRules['2615312913'].mechanic('padna')).toBe('panna'); // Old Noldorin
    expect(oldSindarinRules['2615312913'].mechanic('madna')).toBe('manna'); // Old Noldorin
  });
});
