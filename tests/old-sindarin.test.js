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

//   it('00200 - initial [ŋ] became [ŋg] or [g]', () => {
//     expect(oldSindarinRules['1989991061'].mechanic('abc')).toBe('abc');
//   });

//   it('00300 - first in pair of voiced stops vocalized', () => {
//     expect(oldSindarinRules['4282797219'].mechanic('abc')).toBe('abc');
//   });

//   it('00400 - [ɣ] became [g] before nasals and liquids', () => {
//     expect(oldSindarinRules['107931923'].mechanic('abc')).toBe('abc');
//   });

//   it('00500 - initial [ɣ]/[h] vanished', () => {
//     expect(oldSindarinRules['1117448055'].mechanic('abc')).toBe('abc');
//   });

//   it('00600 - [j] was lost after initial velars', () => {
//     expect(oldSindarinRules['345959193'].mechanic('abc')).toBe('abc');
//   });

//   it('00700 - medial [m] became [n] before [j], [w]', () => {
//     expect(oldSindarinRules['1484184939'].mechanic('abc')).toBe('abc');
//   });

//   it('00800 - initial [ml], [mr] became [bl], [br]', () => {
//     expect(oldSindarinRules['1955360003'].mechanic('abc')).toBe('abc');
//   });

//   it('00900 - initial syllabic [m], [n], [ŋ] became [am], [an], [aŋ]', () => {
//     expect(oldSindarinRules['1024355367'].mechanic('abc')).toBe('abc');
//   });

//   it('01000 - voiceless stops were voiced before nasals', () => {
//     expect(oldSindarinRules['3463937975'].mechanic('abc')).toBe('abc');
//   });

//   it('01100 - [m] became [w] after aspirates', () => {
//     expect(oldSindarinRules['3883770909'].mechanic('abc')).toBe('abc');
//   });

//   it('01200 - [tʰn] became [ttʰ]', () => {
//     expect(oldSindarinRules['1757900715'].mechanic('abc')).toBe('abc');
//   });

//   it('01300 - final [d] spirantalized and vanished', () => {
//     expect(oldSindarinRules['1789116309'].mechanic('abc')).toBe('abc');
//   });

//   it('01400 - final [tʰ] became [t]', () => {
//     expect(oldSindarinRules['300026073'].mechanic('abc')).toBe('abc');
//   });

//   it('01500 - medial [sj], [sw] became [xʲ], [xʷ]', () => {
//     expect(oldSindarinRules['3229649933'].mechanic('abc')).toBe('abc');
//   });

//   it('01600 - long final vowels were shortened', () => {
//     expect(oldSindarinRules['2753394075'].mechanic('abc')).toBe('abc');
//   });

//   it('01700 - [z] vanished before [d] lengthening preceding vowel', () => {
//     expect(oldSindarinRules['1249932447'].mechanic('abc')).toBe('abc');
//   });

//   it('01800 - syllabic initial [s] became [es]', () => {
//     expect(oldSindarinRules['2107885715'].mechanic('abc')).toBe('abc');
//   });

//   it('01900 - initial [s] unvoiced following consonants', () => {
//     expect(oldSindarinRules['3923357111'].mechanic('abc')).toBe('abc');
//   });

//   it('02000 - final [e] became [a] after single [s] and [st]', () => {
//     expect(oldSindarinRules['1763851339'].mechanic('abc')).toBe('abc');
//   });

//   it('02100 - voiceless stops became spirants after initial [s]', () => {
//     expect(oldSindarinRules['798037075'].mechanic('abc')).toBe('abc');
//   });

//   it('02200 - voiceless stops aspirated after consonants except [s]', () => {
//     expect(oldSindarinRules['1683955225'].mechanic('abc')).toBe('abc');
//   });

//   it('02300 - aspirates became voiceless spirants', () => {
//     expect(oldSindarinRules['883570327'].mechanic('abc')).toBe('abc');
//   });

//   it('02400 - [eu] became [iu]', () => {
//     expect(oldSindarinRules['2662025405'].mechanic('abc')).toBe('abc');
//   });

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
