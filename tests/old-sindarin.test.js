import { describe, it, expect } from "vitest";
import { oldSindarinRules } from "../src/old-sindarin.js";

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
    // [Vbd] > [Vud]:
    expect(oldSindarinRules['4282797219'].mechanic('kʰabdā')).toBe('chaudā');
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
    // [kj-] > [k-]:
    expect(oldSindarinRules['345959193'].mechanic('akjāwen')).toBe('akāwen');
    expect(oldSindarinRules['345959193'].mechanic('kjawathāne')).toBe('kawathāne');
    expect(oldSindarinRules['345959193'].mechanic('kjelepē')).toBe('kelepē');
    // [kʰj-] > [kʰ-]:
    expect(oldSindarinRules['345959193'].mechanic('kʰjabab')).toBe('kʰabab'); // Non-existent word
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
    expect(oldSindarinRules['1024355367'].mechanic('mbar')).toBe('ambar');
    // [ṇ-] > [an-]:
    expect(oldSindarinRules['1024355367'].mechanic('ndūnē')).toBe('andūnē');
    // [ŋ̣-] > [aŋ-]:
    expect(oldSindarinRules['1024355367'].mechanic('ŋgolodō')).toBe('aŋgolodō');
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
    // All examples are Noldorin (or non-existent):
    expect(oldSindarinRules['3883770909'].mechanic('patʰmā')).toBe('patʰwā');
    expect(oldSindarinRules['3883770909'].mechanic('abapʰma')).toBe('abapʰwa'); // Non-existent word
    expect(oldSindarinRules['3883770909'].mechanic('abakʰma')).toBe('abakʰwa'); // Non-existent word

  });

  it('01200 - [tʰn] became [ttʰ]', () => {
    expect(oldSindarinRules['1757900715'].mechanic('abc')).toBe('abc');
    // Only one example, and it's Old Noldorin:
    expect(oldSindarinRules['1757900715'].mechanic('patʰnā')).toBe('pattʰā');
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
    // Only example, from Noldorin:
    expect(oldSindarinRules['300026073'].mechanic('khōtʰ')).toBe('chōt');
    // The result is "khōt", but "ch" is equivalent to "kh".
  });

  it('01500 - medial [sj], [sw] became [xʲ], [xʷ]', () => {
    expect(oldSindarinRules['3229649933'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['3229649933'].mechanic('lisjā')).toBe('lixʲā');
    expect(oldSindarinRules['3229649933'].mechanic('teswā')).toBe('texʷā');
    // Made-up value to test multiple occurrences:
    expect(oldSindarinRules['3229649933'].mechanic('tesjaswā')).toBe('texʲaxʷā');
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
    expect(oldSindarinRules['2107885715'].mechanic('stenna')).toBe('estenna');
    expect(oldSindarinRules['2107885715'].mechanic('ṣtenta')).toBe('estenta');
  });

  it('01900 - initial [s] unvoiced following consonants', () => {
    expect(oldSindarinRules['3923357111'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['3923357111'].mechanic('sjerwa')).toBe('jherwa');
    expect(oldSindarinRules['3923357111'].mechanic('slasu')).toBe('lhasu');
    expect(oldSindarinRules['3923357111'].mechanic('snaide')).toBe('nhaide');
    expect(oldSindarinRules['3923357111'].mechanic('srāba')).toBe('rhāba');
    expect(oldSindarinRules['3923357111'].mechanic('swa')).toBe('wha');
    expect(oldSindarinRules['3923357111'].mechanic('swaiwar')).toBe('whaiwar');
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
    expect(oldSindarinRules['798037075'].mechanic('spinde', { useSingleCharacters: true })).toBe('sɸinde');
    // [st-] > [sθ-]:
    expect(oldSindarinRules['798037075'].mechanic('stenna', { useSingleCharacters: true })).toBe('sθenna');
    // [sk-] > [sx-]:
    expect(oldSindarinRules['798037075'].mechanic('skalja-', { useSingleCharacters: true })).toBe('sxalja-'); // Old Noldorin
  });

  it('02200 - voiceless stops aspirated after consonants except [s]', () => {
    expect(oldSindarinRules['1683955225'].mechanic('xyz')).toBe('xyz');
    // [pp] > [ppʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('eppel')).toBe('eppʰel');
    // [pt] > [ptʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('lepta-')).toBe('leptʰa-');
    // [tt] > [ttʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('grotta')).toBe('grottʰa');
    // [tp] > [tpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('batpa')).toBe('batpʰa'); // Non-existent word

    // [kk] > [kkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('rokko')).toBe('rokkʰo');
    // [kt] > [ktʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('ekta')).toBe('ektʰa');
    // [gt] > [gtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('agta')).toBe('agtʰa'); // Non-existent word

    // [np] > [npʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('enpet-')).toBe('enpʰet-');
    // [mp] > [mpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('gampa')).toBe('gampʰa');
    // [nt] > [ntʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('anta-')).toBe('antʰa-');
    // [ŋk] > [ŋkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('taŋka')).toBe('taŋkʰa');
    // [lp] > [lpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('alpa')).toBe('alpʰa');
    // [lt] > [ltʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('maltorne')).toBe('maltʰorne');
    // [lk] > [lkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('balka')).toBe('balkʰa');
    // [rp] > [rpʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('karpa-')).toBe('karpʰa-');
    // [rt] > [rtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('ambarta')).toBe('ambartʰa');
    // [rk] > [rkʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('urko')).toBe('urkʰo');
    // [xt] > [xtʰ]:
    expect(oldSindarinRules['1683955225'].mechanic('axta')).toBe('axtʰa'); // Non-existent word
  });

  it('02300 - aspirates became voiceless spirants', () => {
    expect(oldSindarinRules['883570327'].mechanic('xyz')).toBe('xyz');
    // [pʰ] > [ɸ]:
    expect(oldSindarinRules['883570327'].mechanic('pʰelga', { useSingleCharacters: true })).toBe('ɸelga');
    // [tʰ] > [θ]:
    expect(oldSindarinRules['883570327'].mechanic('itʰil', { useSingleCharacters: true })).toBe('iθil');
    // [kʰ] > [x]:
    expect(oldSindarinRules['883570327'].mechanic('karkʰa', { useSingleCharacters: true })).toBe('karxa');
    // [ppʰ] > [ɸɸ]:
    expect(oldSindarinRules['883570327'].mechanic('eppʰel', { useSingleCharacters: true })).toBe('eɸɸel');
    // [ptʰ] > [ɸθ]:
    expect(oldSindarinRules['883570327'].mechanic('leptʰa-', { useSingleCharacters: true })).toBe('leɸθa-');
    // [ttʰ] > [θθ]:
    expect(oldSindarinRules['883570327'].mechanic('grottʰa', { useSingleCharacters: true })).toBe('groθθa');
    // [tkʰ] > [xx]:
    expect(oldSindarinRules['883570327'].mechanic('abatkʰa', { useSingleCharacters: true })).toBe('abaxxa'); // Non-existent word
    // [ktʰ] > [xθ]:
    expect(oldSindarinRules['883570327'].mechanic('ektʰa', { useSingleCharacters: true })).toBe('exθa');
    // [kkʰ] > [xx]:
    expect(oldSindarinRules['883570327'].mechanic('rokkʰo', { useSingleCharacters: true })).toBe('roxxo');
  });

  it('02400 - [eu] became [iu]', () => {
    expect(oldSindarinRules['2662025405'].mechanic('abc')).toBe('abc');
    expect(oldSindarinRules['2662025405'].mechanic('deule')).toBe('diule');
    expect(oldSindarinRules['2662025405'].mechanic('deura')).toBe('diura');
    expect(oldSindarinRules['2662025405'].mechanic('keule')).toBe('kiule');
    expect(oldSindarinRules['2662025405'].mechanic('keurāna')).toBe('kiurāna');
    expect(oldSindarinRules['2662025405'].mechanic('leuka')).toBe('liuka');
  });

//   it('02500 - [ā], [au] became [ǭ]', () => {
//     expect(oldSindarinRules['2858643115'].mechanic('abc')).toBe('abc');
//   });

//   it('02600 - [j] became [i] after vowels', () => {
//     expect(oldSindarinRules['161840619'].mechanic('abc')).toBe('abc');
//   });

//   it('02700 - [ei], [ou] became [ī], [ū]', () => {
//     expect(oldSindarinRules['1942848653'].mechanic('abc')).toBe('abc');
//   });

//   it('02800 - [oi], [ǭi] became [ui], [oi]', () => {
//     expect(oldSindarinRules['2010669085'].mechanic('abc')).toBe('abc');
//   });

//   it('02900 - medial [s] assimilated to following nasal', () => {
//     expect(oldSindarinRules['1716741635'].mechanic('abc')).toBe('abc');
//   });

//   it('03000 - intervocalic [s] became [h]', () => {
//     expect(oldSindarinRules['3388236413'].mechanic('abc')).toBe('abc');
//   });

//   it('03100 - [p], [t], [k] spirantalized before [s]', () => {
//     expect(oldSindarinRules['1516403107'].mechanic('abc')).toBe('abc');
//   });

//   it('03200 - [rl] became [ll]', () => {
//     expect(oldSindarinRules['1288402337'].mechanic('abc')).toBe('abc');
//   });

//   it('03300 - [j] vanished before [i], [ui]', () => {
//     expect(oldSindarinRules['2851583127'].mechanic('abc')).toBe('abc');
//   });

//   it('03400 - [w] vanished before [u]', () => {
//     expect(oldSindarinRules['2167009353'].mechanic('abc')).toBe('abc');
//   });

//   it('03500 - [bm], [dn] became [mm], [nn]', () => {
//     expect(oldSindarinRules['2615312913'].mechanic('abc')).toBe('abc');
//   });
});
