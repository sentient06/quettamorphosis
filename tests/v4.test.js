import { describe, it, expect } from "vitest";
import { SyllableAnalyser, breakIntoVowelsAndConsonants, findFirstOf, sindarinRules, syllabify } from "../src/v4.js";

describe('String extended functions', () => {
  it('isVowel should identify vowels', () => {
    expect('a'.isVowel()).toBe(true);
    expect('á'.isVowel()).toBe(true);
    expect('A'.isVowel()).toBe(true);
    expect('Á'.isVowel()).toBe(true);
    expect('y'.isVowel()).toBe(true);
    expect('Y'.isVowel()).toBe(true);
  });

  it('isConsonant should identify consonants', () => {
    expect('b'.isConsonant()).toBe(true);
    expect('B'.isConsonant()).toBe(true);
    expect('p'.isConsonant()).toBe(true);
    expect('P'.isConsonant()).toBe(true);
  });

  it('isMark should identify combining marks', () => {
    expect('a'.isMark()).toBe(false);
    expect('́'.isMark()).toBe(true); // U+0301 COMBINING ACUTE ACCENT
    expect('̩'.isMark()).toBe(true); // U+0329 COMBINING VERTICAL LINE BELOW
    expect('á'.isMark()).toBe(true); // 'a' + U+0301
  });

  it('isSubscript should identify subscript characters', () => {
    expect('a'.isSubscript()).toBe(false);
    expect('ₐ'.isSubscript()).toBe(true);
    expect('₀'.isSubscript()).toBe(true); // U+2080 SUBSCRIPT ZERO
    expect('₁'.isSubscript()).toBe(true); // U+2081 SUBSCRIPT ONE
    expect('₂'.isSubscript()).toBe(true); // U+2082 SUBSCRIPT TWO
    expect('ⱼ'.isSubscript()).toBe(true); // U+2C7C LATIN SUBSCRIPT SMALL LETTER J
  });

  it('isSuperscript should identify superscript characters', () => {
    expect('a'.isSuperscript()).toBe(false);
    expect('ᵃ'.isSuperscript()).toBe(true);
    expect('⁰'.isSuperscript()).toBe(true); // U+2070 SUPERSCRIPT ZERO
    expect('¹'.isSuperscript()).toBe(true); // U+2071 SUPERSCRIPT ONE
    expect('²'.isSuperscript()).toBe(true); // U+2072 SUPERSCRIPT TWO
  });

  it('toNormalScript should convert subscript and superscript characters to normal characters', () => {
    expect('a'.toNormalScript()).toBe('a');
    expect('ₐ'.toNormalScript()).toBe('a');
    expect('₀'.toNormalScript()).toBe('0'); // U+2080 SUBSCRIPT ZERO
    expect('₁'.toNormalScript()).toBe('1'); // U+2081 SUBSCRIPT ONE
    expect('²'.toNormalScript()).toBe('2'); // U+2082 SUBSCRIPT TWO
    expect('ⱼ'.toNormalScript()).toBe('j'); // U+2C7C LATIN SUBSCRIPT SMALL LETTER J
    expect('ᵃ'.toNormalScript()).toBe('a');
    expect('⁰'.toNormalScript()).toBe('0'); // U+2070 SUPERSCRIPT ZERO
    expect('¹'.toNormalScript()).toBe('1'); // U+2071 SUPERSCRIPT ONE
    expect('²'.toNormalScript()).toBe('2'); // U+2072 SUPERSCRIPT TWO
    expect('ₑlᵉᵖₕₐnᵗ'.toNormalScript()).toBe('elephant'); // U+2073 SUPERSCRIPT THREE
  });

  it('getMark should return the mark of a character', () => {
    expect('a'.getMark()).toBe('');
    expect('́'.getMark()).toBe('´'); // U+0301 COMBINING ACUTE ACCENT → ACUTE ACCENT
    expect('̩'.getMark()).toBe('̩'); // U+0329 COMBINING VERTICAL LINE BELOW (no spacing equivalent)
    expect('á'.getMark()).toBe('´'); // 'a' + U+0301 → ACUTE ACCENT
  });

  it('addMark should return a character with a mark added', () => {
    expect('a'.addMark('´')).toBe('á'); // U+0301 COMBINING ACUTE ACCENT
    expect('a'.addMark('^')).toBe('â'); // U+0329 COMBINING VERTICAL LINE BELOW
  });

  it('nth should return the nth character of a string', () => {
    expect('abc'.nth(0)).toBe('a');
    expect('abc'.nth(1)).toBe('b');
    expect('abc'.nth(2)).toBe('c');
    expect('abc'.nth(3)).toBe('');
    expect('abc'.nth(-1)).toBe('c');
    expect('abc'.nth(-2)).toBe('b');
    expect('abc'.nth(-3)).toBe('a');
    expect('abc'.nth(-4)).toBe('');
  });

  it('removeMarks should remove all marks from a string', () => {
    expect('a'.removeMarks()).toBe('a');
    expect('áêïôùç'.removeMarks()).toBe('aeiouc');
  });

  it('replaceWithMark should replace a character with a mark', () => {
    expect('á'.replaceWithMark('a', 'e')).toBe('é'); // U+0301 COMBINING ACUTE ACCENT
    expect('â'.replaceWithMark('a', 'u')).toBe('û'); // U+0329 COMBINING VERTICAL LINE BELOW
  });

  it('findAllChars should return an array of all indexes of a character in a string', () => {
    expect('ananas'.findAllChars('a')).toEqual([0, 2, 4]);
    expect('anânas'.findAllChars('a')).toEqual([0, 2, 4]);
    expect('aáâàãä'.findAllChars('a')).toEqual([0, 1, 2, 3, 4, 5]);
    expect('abc'.findAllChars('d')).toEqual([]);
  });

  it('replaceAt should replace a character at a given index', () => {
    expect('abc'.replaceAt(0, 'd')).toBe('dbc');
    expect('abc'.replaceAt(1, 'd')).toBe('adc');
    expect('abc'.replaceAt(2, 'd')).toBe('abd');
  });
});

describe('Utils', () => {
  it('breakIntoVowelsAndConsonants should break a string into vowels and consonants', () => {
    expect(breakIntoVowelsAndConsonants('abc')).toBe('VCC');
    expect(breakIntoVowelsAndConsonants('aiwe')).toBe('VVCV');
    expect(breakIntoVowelsAndConsonants('banana')).toBe('CVCVCV');
    expect(breakIntoVowelsAndConsonants('áŋt')).toBe('VCC');
    expect(breakIntoVowelsAndConsonants('úçâ')).toBe('VCV');
    expect(breakIntoVowelsAndConsonants('pyp')).toBe('CVC');
  });

  it('findFirstOf should return the first occurrence of a character in a string', () => {
    expect(findFirstOf(['a', 'e', 'i', 'o', 'u'], 'banana')).toEqual({ found: true, matched: 'a', charIndex: 1, nextChar: 'n' });
    expect(findFirstOf(['an'], 'banana')).toEqual({ found: true, matched: 'an', charIndex: 1, nextChar: 'a' });
  });
});

describe('SyllableAnalyser', () => {
  const analyser = new SyllableAnalyser();

  describe('syllabify', () => {
    // Syllable rules:
    // If a word has only one vowel, it has only one syllable.
    // e.g.: a, brand
    it('should treat words with one vowel as monosyllables', () => {
      expect(analyser.syllabify('a')).toEqual(['a']);
      expect(analyser.syllabify('brand')).toEqual(['brand']);
    });

    // The simplest syllable is a single vowel.
    // e.g.: a, i, o, a-nor, ú-an
    it('should handle single vowel syllables', () => {
      expect(analyser.syllabify('a')).toEqual(['a']);
      expect(analyser.syllabify('i')).toEqual(['i']);
      expect(analyser.syllabify('o')).toEqual(['o']);
      expect(analyser.syllabify('anor')).toEqual(['a', 'nor']);
      expect(analyser.syllabify('úan')).toEqual(['ú', 'an']);
    });

    // A vowel can be preceded by one or two consonants.
    // e.g.: dû, dú-ath, gwî, bre-thil
    it('should handle vowels preceded by consonants', () => {
      expect(analyser.syllabify('dû')).toEqual(['dû']);
      expect(analyser.syllabify('dúath')).toEqual(['dú', 'ath']);
      expect(analyser.syllabify('gwî')).toEqual(['gwî']);
      expect(analyser.syllabify('brethil')).toEqual(['bre', 'thil']);
    });

    // A vowel can be followed by up to two consonants.
    // e.g.: ad, ag-lar, ast, lant-hir
    it('should handle vowels followed by consonants', () => {
      expect(analyser.syllabify('ad')).toEqual(['ad']);
      expect(analyser.syllabify('aglar')).toEqual(['ag', 'lar']);
      expect(analyser.syllabify('ast')).toEqual(['ast']);
      // lanthir is a compound (lant + hir), so nth is n+th, not the digraph
      expect(analyser.syllabify('lanthir', true)).toEqual(['lant', 'hir']);
    });

    // A syllable can consist of a diphthong with associated consonants.
    // e.g.: ae-wen, mae-thor, dui-nath, goe-ol, gwai-hir, duin-hir
    it('should handle diphthongs with consonants', () => {
      expect(analyser.syllabify('aewen')).toEqual(['ae', 'wen']);
      expect(analyser.syllabify('maethor')).toEqual(['mae', 'thor']);
      expect(analyser.syllabify('duinath')).toEqual(['dui', 'nath']);
      expect(analyser.syllabify('goeol')).toEqual(['goe', 'ol']);
      expect(analyser.syllabify('gwaihir')).toEqual(['gwai', 'hir']);
      expect(analyser.syllabify('duinhir')).toEqual(['duin', 'hir']);
    });

    // The elements of a diphthong are never split between two syllables.
    // e.g.: duin (not du-in), laeg (not la-eg)
    it('should never split diphthongs', () => {
      expect(analyser.syllabify('duin')).toEqual(['duin']);
      expect(analyser.syllabify('laeg')).toEqual(['laeg']);
    });

    // If more than one consonant begins a syllable, the second consonant must be l, r, or w (the latter only in the cluster "gw").
    // e.g.: cram, pres-tan-neth, gwaew, gon-dren, an-gren, an-glen-na, an-gwedh
    it('should handle valid initial clusters', () => {
      expect(analyser.syllabify('cram')).toEqual(['cram']);
      expect(analyser.syllabify('prestanneth')).toEqual(['pres', 'tan', 'neth']);
      expect(analyser.syllabify('gwaew')).toEqual(['gwaew']);
      expect(analyser.syllabify('gondren')).toEqual(['gon', 'dren']);
      // These are compounds where ng is n+g, not the velar nasal digraph
      expect(analyser.syllabify('angren', true)).toEqual(['an', 'gren']);
      expect(analyser.syllabify('anglenna', true)).toEqual(['an', 'glen', 'na']);
      expect(analyser.syllabify('angwedh', true)).toEqual(['an', 'gwedh']);
    });

    // When no consonant follows a vowel, and the vowels don't form a diphthong, they split between syllables.
    // e.g.: ae-ar, rí-an, goe-ol, fi-ri-on
    it('should split non-diphthong vowel sequences', () => {
      expect(analyser.syllabify('aear')).toEqual(['ae', 'ar']);
      expect(analyser.syllabify('rían')).toEqual(['rí', 'an']);
      expect(analyser.syllabify('goeol')).toEqual(['goe', 'ol']);
      expect(analyser.syllabify('firion')).toEqual(['fi', 'ri', 'on']);
    });

    // When a single consonant follows a vowel, the syllable break almost always comes before the following consonant, except when that's final.
    // e.g.: ta-lan, o-rod, se-re-gon
    it('should place break before single medial consonant', () => {
      expect(analyser.syllabify('talan')).toEqual(['ta', 'lan']);
      expect(analyser.syllabify('orod')).toEqual(['o', 'rod']);
      expect(analyser.syllabify('seregon')).toEqual(['se', 're', 'gon']);
    });

    // When only two consonants follow each other in the middle of a word, the division occurs between them.
    // e.g.: idh-ren, oth-lonn, nes-tad-ren, baug-ron
    it('should split between two medial consonants', () => {
      expect(analyser.syllabify('idhren')).toEqual(['idh', 'ren']);
      expect(analyser.syllabify('othlonn')).toEqual(['oth', 'lonn']);
      expect(analyser.syllabify('nestadren')).toEqual(['nes', 'tad', 'ren']);
      expect(analyser.syllabify('baugron')).toEqual(['baug', 'ron']);
    });

    // When 3 consonants follow each other, the split occurs after the first one if the two others are an allowed pattern for words or syllables.
    // e.g.: nin-glor, an-drath, lhin-gril, dan-gweth, or-christ
    it('should split 3-consonant clusters correctly', () => {
      // These are compounds where ng is n+g, not the velar nasal digraph
      expect(analyser.syllabify('ninglor', true)).toEqual(['nin', 'glor']);
      expect(analyser.syllabify('andrath')).toEqual(['an', 'drath']);
      expect(analyser.syllabify('lhingril', true)).toEqual(['lhin', 'gril']);
      expect(analyser.syllabify('dangweth', true)).toEqual(['dan', 'gweth']);
      expect(analyser.syllabify('orchrist')).toEqual(['or', 'christ']);
    });
  });

  describe('analyse', () => {
    // Light and heavy, open and closed syllables:
    // A light syllable consists of a short vowel, by itself, or preceded by one or more consonants. All other syllables are heavy.
    // e.g. light syllables: a, na
    // e.g. heavy syllables: dû - long vowel
    // e.g. heavy syllables: nae, goe, glaw - diphthongs
    // e.g. heavy syllables: ed, dan, ost, nand - end in consonants
    // e.g. heavy syllables: glân, dîr, laer - combination of the above

    // An open syllable is followed by a single consonant or none. All other syllables are closed.
    // All closed syllables are heavy.
    // Open syllables can be light or heavy.

    it('should identify light syllables', () => {
      const resultA = analyser.analyse('a');
      expect(resultA[0].weight).toBe('light');

      const resultNa = analyser.analyse('na');
      expect(resultNa[0].weight).toBe('light');
    });

    it('should identify heavy syllables with long vowels', () => {
      const result = analyser.analyse('dû');
      expect(result[0].weight).toBe('heavy');
    });

    it('should identify heavy syllables with diphthongs', () => {
      expect(analyser.analyse('nae')[0].weight).toBe('heavy');
      expect(analyser.analyse('goe')[0].weight).toBe('heavy');
      expect(analyser.analyse('glaw')[0].weight).toBe('heavy');
    });

    it('should identify heavy syllables ending in consonants (closed)', () => {
      expect(analyser.analyse('ed')[0].weight).toBe('heavy');
      expect(analyser.analyse('dan')[0].weight).toBe('heavy');
      expect(analyser.analyse('ost')[0].weight).toBe('heavy');
      expect(analyser.analyse('nand')[0].weight).toBe('heavy');
    });

    it('should identify open vs closed syllables', () => {
      // Open: followed by single consonant or none
      expect(analyser.analyse('a')[0].structure).toBe('open');
      expect(analyser.analyse('na')[0].structure).toBe('open');
      expect(analyser.analyse('dû')[0].structure).toBe('open');

      // Closed: ends in consonant
      expect(analyser.analyse('ed')[0].structure).toBe('closed');
      expect(analyser.analyse('dan')[0].structure).toBe('closed');
    });

    // Stress:
    // Monosyllables tend to be unstressed depending on their role.
    // Words with two syllables are stressed on the first syllable.
    // Longer words have the stress placed on the penultimate or antepenultimate syllable.
    // Stress falls on the penultimate syllable when it is heavy.
    // Stress falls on the antepenultimate syllable when the penultimate is light.

    it('should mark monosyllables as unstressed', () => {
      expect(analyser.analyse('a')[0].stressed).toBe(false);
      expect(analyser.analyse('brand')[0].stressed).toBe(false);
    });

    it('should stress first syllable in disyllabic words', () => {
      const result = analyser.analyse('talan');
      expect(result[0].stressed).toBe(true);
      expect(result[1].stressed).toBe(false);
    });

    it('should stress penultimate when it is heavy', () => {
      // 'seregon' = se-re-gon, 're' is light, so stress antepenultimate 'se'
      const result1 = analyser.analyse('seregon');
      expect(result1[0].stressed).toBe(true); // 'se' stressed
      expect(result1[1].stressed).toBe(false);
      expect(result1[2].stressed).toBe(false);

      // 'prestanneth' = pres-tan-neth, 'tan' is heavy (closed), so stress penultimate
      const result2 = analyser.analyse('prestanneth');
      expect(result2[0].stressed).toBe(false);
      expect(result2[1].stressed).toBe(true); // 'tan' stressed
      expect(result2[2].stressed).toBe(false);
    });

    it('should stress antepenultimate when penultimate is light', () => {
      // 'firion' = fi-ri-on, 'ri' is light (open, short vowel), so stress 'fi'
      const result = analyser.analyse('firion');
      expect(result[0].stressed).toBe(true);
      expect(result[1].stressed).toBe(false);
      expect(result[2].stressed).toBe(false);
    });
  });
});

describe('syllabify', () => {
  // Simple words
  it('should syllabify simple two-syllable words', () => {
    expect(syllabify('mellon')).toEqual(['mel', 'lon']);
    expect(syllabify('amon')).toEqual(['a', 'mon']);
    expect(syllabify('adar')).toEqual(['a', 'dar']);
  });

  it('should syllabify simple three-syllable words', () => {
    expect(syllabify('Celeborn')).toEqual(['Ce', 'le', 'born']);
    expect(syllabify('Elrond')).toEqual(['El', 'rond']);
  });

  // Words with digraphs
  it('should handle words with th digraph', () => {
    expect(syllabify('athelas')).toEqual(['a', 'the', 'las']);
    expect(syllabify('Ithil')).toEqual(['I', 'thil']);
  });

  it('should handle words with dh digraph', () => {
    expect(syllabify('galadh')).toEqual(['ga', 'ladh']);
    expect(syllabify('Caradhras')).toEqual(['Ca', 'radh', 'ras']);
  });

  it('should handle words with ng digraph', () => {
    // Note: ng is treated as the digraph [ŋ], so it stays together
    // Fingon etymologically is n+g, but this function treats all ng as [ŋ]
    expect(syllabify('Fingon')).toEqual(['Fi', 'ngon']);
    expect(syllabify('angband')).toEqual(['ang', 'band']);
  });

  // Words with diphthongs
  it('should handle words with ae diphthong', () => {
    expect(syllabify('Barad')).toEqual(['Ba', 'rad']);
    expect(syllabify('aear')).toEqual(['ae', 'ar']);
  });

  it('should handle words with ai diphthong', () => {
    expect(syllabify('Edain')).toEqual(['E', 'dain']);
    expect(syllabify('Maitimo')).toEqual(['Mai', 'ti', 'mo']);
  });

  it('should handle words with au diphthong', () => {
    expect(syllabify('naur')).toEqual(['naur']);
    expect(syllabify('Sauron')).toEqual(['Sau', 'ron']);
  });

  it('should handle words with ui diphthong', () => {
    // Cuivienen: 'ie' is not a diphthong, so it's i.e (hiatus)
    expect(syllabify('Cuivienen')).toEqual(['Cui', 'vi', 'e', 'nen']);
    expect(syllabify('Draugluin')).toEqual(['Draug', 'luin']);
  });

  // Words ending in vowels
  it('should handle words ending in vowels', () => {
    expect(syllabify('Elda')).toEqual(['El', 'da']);
    expect(syllabify('nana')).toEqual(['na', 'na']);
    expect(syllabify('Tinuviel')).toEqual(['Ti', 'nu', 'vi', 'el']);
  });

  // Words ending in consonants
  it('should handle words ending in consonants', () => {
    expect(syllabify('Gondor')).toEqual(['Gon', 'dor']);
    expect(syllabify('Beleriand')).toEqual(['Be', 'le', 'ri', 'and']);
  });

  // Words ending in digraphs
  it('should handle words ending in digraphs', () => {
    expect(syllabify('galadh')).toEqual(['ga', 'ladh']);
    expect(syllabify('rath')).toEqual(['rath']);
  });

  // Words ending in diphthongs
  it('should handle words ending in diphthongs', () => {
    expect(syllabify('Fëanor')).toEqual(['Fë', 'a', 'nor']);
    expect(syllabify('Annui')).toEqual(['An', 'nui']);
  });

  // Complex words
  it('should handle complex words with multiple digraphs', () => {
    expect(syllabify('Mithrandir')).toEqual(['Mith', 'ran', 'dir']);
    expect(syllabify('Galadriel')).toEqual(['Ga', 'lad', 'ri', 'el']);
  });

  // Single syllable words
  it('should return single syllable words unchanged', () => {
    expect(syllabify('gond')).toEqual(['gond']);
    expect(syllabify('glor')).toEqual(['glor']);
    expect(syllabify('the')).toEqual(['the']);
  });

  // Case preservation
  it('should preserve original case', () => {
    expect(syllabify('MELLON')).toEqual(['MEL', 'LON']);
    expect(syllabify('Galadriel')).toEqual(['Ga', 'lad', 'ri', 'el']);
  });
});

describe('Sindarin rules', () => {
  it('00100 - initial [w] became [gw]', () => {
    expect(sindarinRules['00100'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['00100'].mechanic('wagme')).toBe('gwagme');
    expect(sindarinRules['00100'].mechanic('waiwe')).toBe('gwaiwe');
    expect(sindarinRules['00100'].mechanic('wanwa')).toBe('gwanwa');
  });

  it('00200 - initial nasals vanished before stops', () => {
    expect(sindarinRules['00200'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['00200'].mechanic('mbarda')).toBe('barda');
    expect(sindarinRules['00200'].mechanic('ndaila')).toBe('daila');
    expect(sindarinRules['00200'].mechanic('ŋgol')).toBe('gol');
  });

  it('00300 - final nasals vanished after vowels', () => {
    expect(sindarinRules['00300'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['00300'].mechanic('kaim')).toBe('kai');
    expect(sindarinRules['00300'].mechanic('ailin')).toBe('aili');
  });

  it('00400 - initial [s] vanished before spirants', () => {
    expect(sindarinRules['00400'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['00400'].mechanic('sāba')).toBe('sāba');
    expect(sindarinRules['00400'].mechanic('sɸaŋga')).toBe('ɸaŋga');
    expect(sindarinRules['00400'].mechanic('sθaŋxa')).toBe('θaŋxa');
    expect(sindarinRules['00400'].mechanic('sxella')).toBe('xella');
  });

  it('00500 - initial voiceless [j̊] became [x]', () => {
    expect(sindarinRules['00400'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['00500'].mechanic('hyalma')).toBe('chalma');
    expect(sindarinRules['00500'].mechanic('hyūle')).toBe('chūle');
  });

  it('00600 - voiced stops became spirants after liquids', () => {
    expect(sindarinRules['00600'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['00600'].mechanic('kherbessē')).toBe('khervessē');
    expect(sindarinRules['00600'].mechanic('gardā')).toBe('garðā');
    expect(sindarinRules['00600'].mechanic('targā')).toBe('tarɣā');
    expect(sindarinRules['00600'].mechanic('golbā')).toBe('golvā');
    expect(sindarinRules['00600'].mechanic('kuldā')).toBe('kulðā');
    expect(sindarinRules['00600'].mechanic('phelgā')).toBe('phelɣā');
  });

  it('00700 - [zb], [zg] became [ðβ], [ðɣ]', () => {
    expect(sindarinRules['00700'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['00700'].mechanic('nazgā')).toBe('naðɣā');
    expect(sindarinRules['00700'].mechanic('mazgō')).toBe('maðɣō');
    expect(sindarinRules['00700'].mechanic('buzbō')).toBe('buðβō');
  });

  it('00800 - short [i], [u] became [e], [o] preceding final [a]', () => {
    expect(sindarinRules['00800'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['00800'].mechanic('ugrā')).toBe('ogrā');
    expect(sindarinRules['00800'].mechanic('ninda')).toBe('nenda');
  });

  it('00900 - voiced stops became spirants after vowels', () => {
    expect(sindarinRules['00900'].mechanic('xyz')).toBe('xyz');
    expect(sindarinRules['00900'].mechanic('nebā')).toBe('nevā');
    expect(sindarinRules['00900'].mechanic('edelō')).toBe('eðelō');
    expect(sindarinRules['00900'].mechanic('magla')).toBe('maɣla');
  });

  it('01000 - [ɸ], [β] became [f], [v]', () => {
    expect(sindarinRules['01000'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01000'].mechanic('alɸa')).toBe('alfa');
    expect(sindarinRules['01000'].mechanic('eɸɸel')).toBe('effel');
    expect(sindarinRules['01000'].mechanic('buðβo')).toBe('buðvo');
  });

  it('01100 - medial [j] became [i]', () => {
    expect(sindarinRules['01100'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01100'].mechanic('balanja')).toBe('balania');
    expect(sindarinRules['01100'].mechanic('ɸanja')).toBe('ɸania');
  });

  it('01200 - short [e], [o] became [i], [u] in syllable before final [i]', () => {
    expect(sindarinRules['01200'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01200'].mechanic('leperī')).toBe('lepirī');
    expect(sindarinRules['01200'].mechanic('oronī')).toBe('orunī');
    expect(sindarinRules['01200'].mechanic('ossī')).toBe('ussī');
    expect(sindarinRules['01200'].mechanic('teŋmi')).toBe('tiŋmi');
    expect(sindarinRules['01200'].mechanic('eleni')).toBe('elini');
    expect(sindarinRules['01200'].mechanic('goloði')).toBe('goluði');
  });

  describe('01300 - short [a], [o], [u] became [e], [œ], [y] before [i]', () => {
    it('[ăCi] > [eCi]', () => {
      expect(sindarinRules['01300'].mechanic('bania')).toBe('benia');
      expect(sindarinRules['01300'].mechanic('braθil')).toBe('breθil');
    });
    it('[ăCCi] > [eCCi]', () => {
      expect(sindarinRules['01300'].mechanic('balθil')).toBe('belθil');
      expect(sindarinRules['01300'].mechanic('alfi')).toBe('elfi');
      expect(sindarinRules['01300'].mechanic('sarnīe')).toBe('sernīe');
    });
    it('[ăCăCi] > [eCeCi]', () => {
      expect(sindarinRules['01300'].mechanic('balania')).toBe('belenia');
      expect(sindarinRules['01300'].mechanic('atatia')).toBe('etetia');
    });
    it('[ăCŭCi] > [eCyCi]', () => {
      expect(sindarinRules['01300'].mechanic('andundi')).toBe('endyndi'); // VCCVCCV
    });
    it('[ŏCi] > [œCi]', () => {
      expect(sindarinRules['01300'].mechanic('ronio')).toBe('rœnio');
      expect(sindarinRules['01300'].mechanic('olia')).toBe('œlia');
    });
    it('[ŏCŭCi] > [œCyCi]', () => {
      expect(sindarinRules['01300'].mechanic('goluði')).toBe('gœlyði');
      expect(sindarinRules['01300'].mechanic('θoluhi')).toBe('θœlyhi');
      expect(sindarinRules['01300'].mechanic('oruti')).toBe('œryti');
    });
    it('[ŏCŏCi] > [œCœCi]', () => {
      expect(sindarinRules['01300'].mechanic('doroni')).toBe('dœrœni');
      expect(sindarinRules['01300'].mechanic('olohi')).toBe('œlœhi');
    });
    it('[ŭCi] > [yCi]', () => {
      expect(sindarinRules['01300'].mechanic('duri')).toBe('dyri');
      expect(sindarinRules['01300'].mechanic('puti')).toBe('pyti');
    });
    it('[ŭCCi] > [yCCi]', () => {
      expect(sindarinRules['01300'].mechanic('dumbi')).toBe('dymbi');
      expect(sindarinRules['01300'].mechanic('tainakulli')).toBe('tainakylli');
      expect(sindarinRules['01300'].mechanic('ukli')).toBe('ykli');
    });
  });

  it('01400 - [ē], [ō] became [ī], [ū]', () => {
    expect(sindarinRules['01400'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01400'].mechanic('dēra')).toBe('dīra');
    expect(sindarinRules['01400'].mechanic('eðēwe')).toBe('eðīwe');
    expect(sindarinRules['01400'].mechanic('mēlambar')).toBe('mīlambar');
    expect(sindarinRules['01400'].mechanic('belekōre')).toBe('belekūre');
    expect(sindarinRules['01400'].mechanic('gōle')).toBe('gūle');
    expect(sindarinRules['01400'].mechanic('gōrikova')).toBe('gūrikova');
    expect(sindarinRules['01400'].mechanic('l̥ōko')).toBe('l̥ūko');
    expect(sindarinRules['01400'].mechanic('oθθōia')).toBe('oθθūia');
  });

  it('01500 - [ɣ] vocalized before [l], [r], [m], [n]', () => {
    expect(sindarinRules['01500'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01500'].mechanic('maɣza')).toBe('maɣza'); // non-existent word
    expect(sindarinRules['01500'].mechanic('maɣla')).toBe('maila');
    expect(sindarinRules['01500'].mechanic('maɣra')).toBe('maira');
    expect(sindarinRules['01500'].mechanic('gwaɣme')).toBe('gwaime');
    expect(sindarinRules['01500'].mechanic('oɣma')).toBe('oima');
    expect(sindarinRules['01500'].mechanic('loɣna')).toBe('loina');
  });

  it('01600 - [x], [ɸ] vocalized between a vowel and [θ]', () => {
    expect(sindarinRules['01600'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01600'].mechanic('leɸθa-')).toBe('leuθa-'); // [eɸθ] > [euθ]
    expect(sindarinRules['01600'].mechanic('andatexθa')).toBe('andateiθa'); // [exθ] > [eiθ]
    expect(sindarinRules['01600'].mechanic('paxθa')).toBe('paiθa'); // [axθ] > [aiθ]
    expect(sindarinRules['01600'].mechanic('rixθant')).toBe('rīθant'); // [ixθ] > [īθ]
    expect(sindarinRules['01600'].mechanic('gruxθa-')).toBe('gruiθa-'); // [uxθ] > [uiθ]
  });

  it('01700 - non-initial [xʲ] vocalized to [ix]', () => {
    expect(sindarinRules['01700'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01700'].mechanic('lexʲa')).toBe('leixa');
    expect(sindarinRules['01700'].mechanic('leꜧa')).toBe('leixa');
    expect(sindarinRules['01700'].mechanic('lixʲi')).toBe('līxi');
    expect(sindarinRules['01700'].mechanic('liꜧi')).toBe('līxi');
  });

  it('01800 - [iu] and [ju] became [ȳ]', () => {
    expect(sindarinRules['01800'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01800'].mechanic('diule')).toBe('dȳle'); // [iu] > [ȳ]
    expect(sindarinRules['01800'].mechanic('kiurǭna')).toBe('kȳrǭna'); // [iu] > [ȳ]
    expect(sindarinRules['01800'].mechanic('julma')).toBe('ȳlma'); // [ju] > [ȳ]
    expect(sindarinRules['01800'].mechanic('jūneke')).toBe('ȳneke'); // [ju] > [ȳ]
    expect(sindarinRules['01800'].mechanic('jūiabc')).toBe('ȳiabc'); // [jui] > [jui] (no real examples)
  });

  it('01900 - short [u] often became [o]', () => {
    expect(sindarinRules['01900'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['01900'].mechanic('guruk')).toBe('guruk'); // [uC{uw}] > [uC{uw}]
    expect(sindarinRules['01900'].mechanic('tumbo')).toBe('tumbo'); // [um] > [um]
    expect(sindarinRules['01900'].mechanic('felakgundu')).toBe('felakgundo'); // [un] > [un]
    // This is a loanword, it actually yields felakgundu.
    // But as a rule, we just ignore that.
    expect(sindarinRules['01900'].mechanic('truŋxo')).toBe('truŋxo'); // [uŋ] > [uŋ]
    expect(sindarinRules['01900'].mechanic('uroθa')).toBe('oroθa'); // [ŭ] > [o]
  });

  it('02000 - [nm], [ŋm] became [nw], [ŋw]', () => {
    expect(sindarinRules['02000'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['02000'].mechanic('anma')).toBe('anwa'); // [nm] > [nw]
    expect(sindarinRules['02000'].mechanic('teŋma')).toBe('teŋwa'); // [ŋm] > [ŋw]
    expect(sindarinRules['02000'].mechanic('tiŋmi')).toBe('tiŋwi'); // [ŋm] > [ŋw]
  });

  it('02100 - [ŋ] vanished with compensatory lengthening', () => {
    expect(sindarinRules['02100'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['02100'].mechanic('teŋwa')).toBe('tēwa'); // [Vŋw] > [V̄w]
    expect(sindarinRules['02100'].mechanic('tiŋwi')).toBe('tīwi'); // [Vŋn] > [V̄n]
  });

  it('02200 - [ǭ] became [au]', () => {
    expect(sindarinRules['02200'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['02200'].mechanic('aɣǭle')).toBe('aɣaule');
    expect(sindarinRules['02200'].mechanic('arǭta')).toBe('arauta');
    expect(sindarinRules['02200'].mechanic('ǭ')).toBe('au');
    expect(sindarinRules['02200'].mechanic('ekǭ')).toBe('ekau');
    expect(sindarinRules['02200'].mechanic('lindǭna')).toBe('lindauna');
    expect(sindarinRules['02200'].mechanic('θǭniel')).toBe('θauniel');
    expect(sindarinRules['02200'].mechanic('ǭbbǭ')).toBe('aubbau'); // non-existent word
  });

  it('02300 - [ę̄] became [ai]', () => {
    expect(sindarinRules['02300'].mechanic('abc')).toBe('abc');
    // All words below are corrupted Old Noldorin examples as there are no Sindarin examples available.
    expect(sindarinRules['02300'].mechanic('kę̄m')).toBe('kaim');
    expect(sindarinRules['02300'].mechanic('ndę̄r')).toBe('ndair');
    expect(sindarinRules['02300'].mechanic('pę̄ne')).toBe('paine');
    expect(sindarinRules['02300'].mechanic('pę̄nnę̄')).toBe('painnai'); // non-existent word
  });

  it('02400 - short final vowels vanished', () => {
    expect(sindarinRules['02400'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['02400'].mechanic('aða')).toBe('að');
    expect(sindarinRules['02400'].mechanic('akaura')).toBe('akaur');
    expect(sindarinRules['02400'].mechanic('alwa')).toBe('alw');
    expect(sindarinRules['02400'].mechanic('ambarθa')).toBe('ambarθ');
    expect(sindarinRules['02400'].mechanic('fanoia')).toBe('fanoi');
    expect(sindarinRules['02400'].mechanic('groθθa')).toBe('groθθ');
    expect(sindarinRules['02400'].mechanic('eiθele')).toBe('eiθel');
    expect(sindarinRules['02400'].mechanic('gūle')).toBe('gūl');
    expect(sindarinRules['02400'].mechanic('mīre')).toBe('mīr');
    expect(sindarinRules['02400'].mechanic('otoko')).toBe('otok');
    expect(sindarinRules['02400'].mechanic('penθrondo')).toBe('penθrond');
    expect(sindarinRules['02400'].mechanic('θolo')).toBe('θol');
    expect(sindarinRules['02400'].mechanic('-weɣo')).toBe('-weɣ');
    expect(sindarinRules['02400'].mechanic('ekau')).toBe('ekau');
    expect(sindarinRules['02400'].mechanic('tīwi')).toBe('tīwi');
  });

  it('02500 - final [i] intruded into preceding syllable', () => {
    expect(sindarinRules['02500'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['02500'].mechanic('deŋxini')).toBe('deŋxin'); // [-iCi] > [-iC]
    expect(sindarinRules['02500'].mechanic('iri')).toBe('ir'); // [-iCi] > [-iC]
    expect(sindarinRules['02500'].mechanic('beleni')).toBe('belein'); // [-ĕCi] > [-eiC]
    expect(sindarinRules['02500'].mechanic('θœlyhi')).toBe('θœlyh'); // [-yCi] > [-yC]
    expect(sindarinRules['02500'].mechanic('œrœni')).toBe('œrœin'); // [-œCi] > [-œiC]
    expect(sindarinRules['02500'].mechanic('θǭni')).toBe('θoin'); // [-ǭCi] > [-oiC]
    expect(sindarinRules['02500'].mechanic('xerūni')).toBe('xeruin'); // [-ūCi] > [-uiC]
  });

  it('02600 - final [w] sometimes intruded into preceding syllables', () => {
    expect(sindarinRules['02600'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['02600'].mechanic('anw')).toBe('aun'); // [-ăCw] > [-auC]
    expect(sindarinRules['02600'].mechanic('gwanw')).toBe('gwaun'); // [-ăCw] > [-auC]
    expect(sindarinRules['02600'].mechanic('texʷ')).toBe('teux'); // [-ĕCw] > [-euC]
  });

  it('02700 - initial [x-] became [h-]', () => {
    expect(sindarinRules['02700'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['02700'].mechanic('xaðaud')).toBe('haðaud'); // [x-] > [h-]
    expect(sindarinRules['02700'].mechanic('xaun')).toBe('haun');
    expect(sindarinRules['02700'].mechanic('χaðaud')).toBe('haðaud'); // Alternative spelling
    expect(sindarinRules['02700'].mechanic('khaðaud')).toBe('haðaud'); // Alternative spelling
    expect(sindarinRules['02700'].mechanic('χaun')).toBe('haun'); // Alternative spelling
    expect(sindarinRules['02700'].mechanic('khaun')).toBe('haun'); // Alternative spelling
    expect(sindarinRules['02700'].mechanic('xrass')).toBe('r̥ass'); // [xr-] > [r̥-] This is Noldorin
    expect(sindarinRules['02700'].mechanic('xlass')).toBe('l̥ass'); // [xl-] > [l̥-] This word doesn't exist.
  });

  it('02800 - voiceless stops voiced after vowels', () => {
    expect(sindarinRules['02800'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['02800'].mechanic('akauwen')).toBe('agauwen');
    expect(sindarinRules['02800'].mechanic('bakaur')).toBe('bagaur');
    expect(sindarinRules['02800'].mechanic('eklambar')).toBe('eglambar');
    expect(sindarinRules['02800'].mechanic('serek')).toBe('sereg');
    expect(sindarinRules['02800'].mechanic('kelep')).toBe('keleb');
    expect(sindarinRules['02800'].mechanic('map')).toBe('mab');
    expect(sindarinRules['02800'].mechanic('nipen')).toBe('niben');
    expect(sindarinRules['02800'].mechanic('θarapad')).toBe('θarabad');
    expect(sindarinRules['02800'].mechanic('calatariɣell')).toBe('caladariɣell');
    expect(sindarinRules['02800'].mechanic('etlandor')).toBe('edlandor');
    expect(sindarinRules['02800'].mechanic('matw')).toBe('madw');
    expect(sindarinRules['02800'].mechanic('otoh')).toBe('odoh');
    expect(sindarinRules['02800'].mechanic('œryt')).toBe('œryd');
  });

  it('02900 - short vowels generally lengthened in monosyllables', () => {
    expect(sindarinRules['02900'].mechanic('abc')).toBe('abc');
    // Lengthening occurs in monosyllables:
    expect(sindarinRules['02900'].mechanic('penθrondo')).toBe('penθrondo');
    // Lengthening did not occur before unvoiced consonants: th, ch ([θ], [x]):
    expect(sindarinRules['02900'].mechanic('gwaθ')).toBe('gwaθ');
    expect(sindarinRules['02900'].mechanic('gwath')).toBe('gwath');
    expect(sindarinRules['02900'].mechanic('bach')).toBe('bach');
    expect(sindarinRules['02900'].mechanic('bax')).toBe('bax');
    // Long ss also did not lengthen, see rule 06300.
    expect(sindarinRules['02900'].mechanic('loss')).toBe('loss');
    // Exceptions:
    expect(sindarinRules['02900'].mechanic('hith')).toBe('hīth');
    expect(sindarinRules['02900'].mechanic('nith')).toBe('nīth');
    expect(sindarinRules['02900'].mechanic('iath')).toBe('iāth');
    // Sindarin monosyllables ending in [m] and [ŋ] do not show vowel lengthening
    expect(sindarinRules['02900'].mechanic('lam')).toBe('lam');
    expect(sindarinRules['02900'].mechanic('dom')).toBe('dom');
    // Cases where lengthening did not occur before voiced spirants and stops:
    expect(sindarinRules['02900'].mechanic('cef')).toBe('cef');
    expect(sindarinRules['02900'].mechanic('glad')).toBe('glad');
    expect(sindarinRules['02900'].mechanic('lad')).toBe('lad');
    expect(sindarinRules['02900'].mechanic('nad')).toBe('nad');
    expect(sindarinRules['02900'].mechanic('pad')).toBe('pad');
    expect(sindarinRules['02900'].mechanic('plad')).toBe('plad');
    expect(sindarinRules['02900'].mechanic('sad')).toBe('sad');
    expect(sindarinRules['02900'].mechanic('tad')).toBe('tad');
    expect(sindarinRules['02900'].mechanic('peg')).toBe('peg');
    // Cases where lengthening did not occur before [l]:
    expect(sindarinRules['02900'].mechanic('ial')).toBe('ial');
    expect(sindarinRules['02900'].mechanic('el')).toBe('el');
    expect(sindarinRules['02900'].mechanic('del')).toBe('del');
    expect(sindarinRules['02900'].mechanic('gil')).toBe('gil');
    expect(sindarinRules['02900'].mechanic('tol')).toBe('tol');
    expect(sindarinRules['02900'].mechanic('dol')).toBe('dol');
    // Cases where lengthening did not occur before [r]:
    expect(sindarinRules['02900'].mechanic('bar')).toBe('bar');
    expect(sindarinRules['02900'].mechanic('far')).toBe('far');
    expect(sindarinRules['02900'].mechanic('er')).toBe('er');
    expect(sindarinRules['02900'].mechanic('cor')).toBe('cor');
    expect(sindarinRules['02900'].mechanic('for')).toBe('for');
    expect(sindarinRules['02900'].mechanic('gor')).toBe('gor');
    // Cases where lengthening did not occur before [n]:
    expect(sindarinRules['02900'].mechanic('glan')).toBe('glan');
    expect(sindarinRules['02900'].mechanic('fen')).toBe('fen');
    expect(sindarinRules['02900'].mechanic('hen')).toBe('hen');
    expect(sindarinRules['02900'].mechanic('men')).toBe('men');
    expect(sindarinRules['02900'].mechanic('nen')).toBe('nen');
    expect(sindarinRules['02900'].mechanic('min')).toBe('min');
    expect(sindarinRules['02900'].mechanic('tin')).toBe('tin');
    expect(sindarinRules['02900'].mechanic('ion')).toBe('ion');
    // Vowel lengthening does not occur in monosyllables ending a vowel:
    expect(sindarinRules['02900'].mechanic('ke')).toBe('ke');
    expect(sindarinRules['02900'].mechanic('khe')).toBe('khe');
    expect(sindarinRules['02900'].mechanic('khe')).toBe('khe');
    expect(sindarinRules['02900'].mechanic('ga')).toBe('ga');
    expect(sindarinRules['02900'].mechanic('oio')).toBe('oio');
    expect(sindarinRules['02900'].mechanic('si')).toBe('si');
    // Exceptions:
    expect(sindarinRules['02900'].mechanic('hwa')).toBe('hwā');
    expect(sindarinRules['02900'].mechanic('ia')).toBe('iā');
    expect(sindarinRules['02900'].mechanic('te')).toBe('tē');
    expect(sindarinRules['02900'].mechanic('thle')).toBe('thlē');
    expect(sindarinRules['02900'].mechanic('di')).toBe('dī');
    expect(sindarinRules['02900'].mechanic('lhi')).toBe('lhī');
    expect(sindarinRules['02900'].mechanic('gli')).toBe('glī');
    expect(sindarinRules['02900'].mechanic('gwi')).toBe('gwī');
    expect(sindarinRules['02900'].mechanic('rhi')).toBe('rhī');
    expect(sindarinRules['02900'].mechanic('ri')).toBe('rī');
    expect(sindarinRules['02900'].mechanic('ti')).toBe('tī');
    expect(sindarinRules['02900'].mechanic('lo')).toBe('lō');
    expect(sindarinRules['02900'].mechanic('no')).toBe('nō');
    // Lengthening did (mostly) occur before voiced consonants: b, d, dh, f [v], g, l, n, r:
    expect(sindarinRules['02900'].mechanic('ban')).toBe('bān');
    expect(sindarinRules['02900'].mechanic('hen')).toBe('hen');
    expect(sindarinRules['02900'].mechanic('mav')).toBe('māv');
    expect(sindarinRules['02900'].mechanic('gweɣ')).toBe('gwēɣ');
    expect(sindarinRules['02900'].mechanic('fin')).toBe('fīn');
    expect(sindarinRules['02900'].mechanic('el')).toBe('el');
    expect(sindarinRules['02900'].mechanic('gwan')).toBe('gwān');
    expect(sindarinRules['02900'].mechanic('mor')).toBe('mōr');
    expect(sindarinRules['02900'].mechanic('θol')).toBe('θōl');
  });

  it('03000 - final [ɣ] became [a] after a consonant', () => {
    expect(sindarinRules['03000'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['03000'].mechanic('felɣ')).toBe('fela');
    expect(sindarinRules['03000'].mechanic('maðɣ')).toBe('maða');
    expect(sindarinRules['03000'].mechanic('filɣi')).toBe('filī');
  });

  it('03100 - [ɣ] became [i] between sonants and vowels', () => {
    expect(sindarinRules['03100'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['03100'].mechanic('θalɣond')).toBe('θaliond');
    expect(sindarinRules['03100'].mechanic('ulɣund')).toBe('ulund');
    expect(sindarinRules['03100'].mechanic('θelɣyndi')).toBe('θelyndi');
    expect(sindarinRules['03100'].mechanic('dirɣel')).toBe('diriel');
    expect(sindarinRules['03100'].mechanic('tarɣass')).toBe('tariass');
    expect(sindarinRules['03100'].mechanic('maðɣass')).toBe('madhiass');
    // Doesn't change:
    expect(sindarinRules['03100'].mechanic('galadariɣel')).toBe('galadariɣel');
    // These words don't exist:
    expect(sindarinRules['03100'].mechanic('abɣab')).toBe('abiab');
    expect(sindarinRules['03100'].mechanic('adɣab')).toBe('adiab');
    expect(sindarinRules['03100'].mechanic('agɣab')).toBe('agiab');
    expect(sindarinRules['03100'].mechanic('avɣab')).toBe('aviab');
    expect(sindarinRules['03100'].mechanic('afɣab')).toBe('afiab');
    expect(sindarinRules['03100'].mechanic('aðɣab')).toBe('aðiab');
    expect(sindarinRules['03100'].mechanic('awɣab')).toBe('awiab');
    expect(sindarinRules['03100'].mechanic('alɣab')).toBe('aliab');
    expect(sindarinRules['03100'].mechanic('arɣab')).toBe('ariab');
    expect(sindarinRules['03100'].mechanic('ajɣab')).toBe('ajiab');
  });

  it('03200 - [ɣ] otherwise vanished', () => {
    expect(sindarinRules['03200'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['03200'].mechanic('galadariɣel')).toBe('galadariel');
    expect(sindarinRules['03200'].mechanic('jaɣa')).toBe('jā');
    expect(sindarinRules['03200'].mechanic('lōɣ')).toBe('lō');
    expect(sindarinRules['03200'].mechanic('nǭvaɣrod')).toBe('nǭvarod');
  });

  it('03300 - final [-wi] became [-y]', () => {
    expect(sindarinRules['03300'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['03300'].mechanic('herwi')).toBe('hery');
    expect(sindarinRules['03300'].mechanic('melui')).toBe('mely');
  });

  it('03400 - [h] vanished after vowels', () => {
    expect(sindarinRules['03400'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['03400'].mechanic('ahamar')).toBe('āmar');
    expect(sindarinRules['03400'].mechanic('ahaum')).toBe('aum');
    expect(sindarinRules['03400'].mechanic('goroθūh')).toBe('goroθū');
    expect(sindarinRules['03400'].mechanic('l̥ahu')).toBe('l̥au');
    expect(sindarinRules['03400'].mechanic('odoh')).toBe('odo');
    expect(sindarinRules['03400'].mechanic('tindūmihelð')).toBe('tindūmielð');
    expect(sindarinRules['03400'].mechanic('θūhon')).toBe('θūon');
    expect(sindarinRules['03400'].mechanic('θœlyh')).toBe('θœly');
  });

  it('03500 - final [i], [u] generally vanished', () => {
    expect(sindarinRules['03500'].mechanic('abc')).toBe('abc');
    // Final short i after consonant vanishes: [-Sĭ] > [-Sø]
    expect(sindarinRules['03500'].mechanic('bereθi')).toBe('bereθ');
    expect(sindarinRules['03500'].mechanic('kirθi')).toBe('kirθ');
    expect(sindarinRules['03500'].mechanic('yrxi')).toBe('yrx');
    // Final short u after consonant vanishes: [-Sŭ] > [-Sø]
    expect(sindarinRules['03500'].mechanic('felaggundu')).toBe('felaggund');
    expect(sindarinRules['03500'].mechanic('kundu')).toBe('kund');
    // Exception: uCu pattern is preserved: [-uCu] > [-uCu]
    expect(sindarinRules['03500'].mechanic('guru')).toBe('guru');
    // Long i after consonant becomes short: [-Sī] > [-Sĭ]
    expect(sindarinRules['03500'].mechanic('filī')).toBe('fili');
    // Words not ending in i or u are unchanged
    expect(sindarinRules['03500'].mechanic('tindūmielð')).toBe('tindūmielð');
  });

  it('03600 - short vowels vanished before morpheme boundaries', () => {
    expect(sindarinRules['03600'].mechanic('abc')).toBe('abc');

    // [Că+C] > [Cø+C]:
    expect(sindarinRules['03600'].mechanic('aiganaur')).toBe('aignaur');
    expect(sindarinRules['03600'].mechanic('caladariell')).toBe('caladriell');
    expect(sindarinRules['03600'].mechanic('finiŋgorn')).toBe('finŋgorn');

    // [Cĕ+C] > [Cø+C]:
    expect(sindarinRules['03600'].mechanic('elembereth')).toBe('elmbereth');
    expect(sindarinRules['03600'].mechanic('moreŋgoθθ')).toBe('morŋgoθθ');

    // Wrong guess:
    expect(sindarinRules['03600'].mechanic('geleðendil')).toBe('gelðendil');
    // Correct guess with a marker:
    expect(sindarinRules['03600'].mechanic('geleðen-dil')).toBe('geleðndil');
    // Correct guess with a bespoke marker:
    expect(sindarinRules['03600'].mechanic('geleðen·dil', { boundaryChar: '·' })).toBe('geleðndil');
    // No guessing yields identical string:
    expect(sindarinRules['03600'].mechanic('geleðendil', { guess: false })).toBe('geleðendil');


    // [Cĭ+C] > [Cø+C]:
    expect(sindarinRules['03600'].mechanic('gilidīr')).toBe('gildīr');
    expect(sindarinRules['03600'].mechanic('hīθilūm')).toBe('hīθlūm');
    expect(sindarinRules['03600'].mechanic('nimfiraid')).toBe('nimfraid');

    // [Cŏ+C] > [Cø+C]:
    expect(sindarinRules['03600'].mechanic('gondolind')).toBe('gondlind');
    expect(sindarinRules['03600'].mechanic('gondondor')).toBe('gondndor');

    // [Cŭ+C] > [Cø+C]:
    expect(sindarinRules['03600'].mechanic('turugaun')).toBe('turgaun');
    expect(sindarinRules['03600'].mechanic('turugond')).toBe('turgond');
  });

  it('03700 - [ai], [oi] became [ae], [oe]', () => {
    expect(sindarinRules['03700'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['03700'].mechanic('aθai')).toBe('aθae');
    expect(sindarinRules['03700'].mechanic('gaiar')).toBe('gaear');
    expect(sindarinRules['03700'].mechanic('haið')).toBe('haeð');
    expect(sindarinRules['03700'].mechanic('mairond')).toBe('maerond');
    expect(sindarinRules['03700'].mechanic('fanoi')).toBe('fanoe');
    expect(sindarinRules['03700'].mechanic('goi')).toBe('goe');
    expect(sindarinRules['03700'].mechanic('l̥oim')).toBe('l̥oem');
    expect(sindarinRules['03700'].mechanic('θoin')).toBe('θoen');
  });

  it('03800 - later [ei] became [ai] in final syllables', () => {
    expect(sindarinRules['03800'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['03800'].mechanic('bein')).toBe('bain');
    expect(sindarinRules['03800'].mechanic('beleiθ')).toBe('belaiθ');
    expect(sindarinRules['03800'].mechanic('eveir')).toBe('evair');
    expect(sindarinRules['03800'].mechanic('lemein')).toBe('lemain');
    expect(sindarinRules['03800'].mechanic('rein')).toBe('rain');
    expect(sindarinRules['03800'].mechanic('seid')).toBe('said');
    expect(sindarinRules['03800'].mechanic('teleir')).toBe('telair');
  });

  it('03900 - diphthongs [yi], [yu] became [ui]', () => {
    // This rule has no attested direct examples, it is mostly concerned with explaining plural formation.
    expect(sindarinRules['03900'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['03900'].mechanic('yux')).toBe('uix');
    expect(sindarinRules['03900'].mechanic('yix')).toBe('uix'); // Non-existent word
  });

  it('04000 - [œi] became [ui] or [y]', () => {
    expect(sindarinRules['04000'].mechanic('abc')).toBe('abc');
    // There is only one example of this rule. It also is mostly concerned with explaining plural formation.
    expect(sindarinRules['04000'].mechanic('œrœin')).toBe('œryn');
    expect(sindarinRules['04000'].mechanic('œrœin', { useUi: true })).toBe('œruin');
  });

  it('04100 - [nr] became [ðr]', () => {
    // Depends on 03600
    expect(sindarinRules['04100'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['04100'].mechanic('karanrass')).toBe('karaðrass');
    expect(sindarinRules['04100'].mechanic('finrod', { cluster: true })).toBe('finrod');
  });

  it('04200 - dissimilation of dental spirants', () => {
    expect(sindarinRules['04200'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['04200'].mechanic('θaeθ')).toBe('θaes');
    expect(sindarinRules['04200'].mechanic('úthaeth')).toBe('úthaes');
    expect(sindarinRules['04200'].mechanic('údhaeth')).toBe('údhaes'); // Non-existent word
  });

  it('04300 - [ls], [rs] became [lθ], [ss]', () => {
    expect(sindarinRules['04300'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['04300'].mechanic('falso')).toBe('faltho');
    expect(sindarinRules['04300'].mechanic('olsa-')).toBe('oltha-');
    expect(sindarinRules['04300'].mechanic('tars')).toBe('tass');
    expect(sindarinRules['04300'].mechanic('perso')).toBe('pesso');
  });

  it('04400 - final [mf], [nθ], [ŋx], [lθ] became [mp], [nt], [ŋk], [lt]', () => {
    expect(sindarinRules['04400'].mechanic('abc')).toBe('abc');
    // [-mf] > [-mp]:
    expect(sindarinRules['04400'].mechanic('gamf')).toBe('gamp');
    expect(sindarinRules['04400'].mechanic('nimf')).toBe('nimp');
    // [-nθ] > [-nt]:
    expect(sindarinRules['04400'].mechanic('estenθ')).toBe('estent');
    expect(sindarinRules['04400'].mechanic('estenth')).toBe('estent');
    expect(sindarinRules['04400'].mechanic('ranθ')).toBe('rant');
    expect(sindarinRules['04400'].mechanic('θenθ')).toBe('θent');
    // [-ŋx] > [-ŋk]:
    expect(sindarinRules['04400'].mechanic('fliŋx')).toBe('fliŋk');
    expect(sindarinRules['04400'].mechanic('flingch')).toBe('flingk');
    expect(sindarinRules['04400'].mechanic('laŋx')).toBe('laŋk');
    // [-lθ] > [-lt]:
    expect(sindarinRules['04400'].mechanic('malth')).toBe('malt'); // Only entry in Sindarin, deleted
    expect(sindarinRules['04400'].mechanic('malθ')).toBe('malt'); // Only entry in Sindarin, deleted
    expect(sindarinRules['04400'].mechanic('m̥alθ')).toBe('m̥alt'); // This is Noldorin
    expect(sindarinRules['04400'].mechanic('talθ')).toBe('talt'); // This is Noldorin
  });

  it('04500 - nasals vanished before spirantal clusters', () => {
    expect(sindarinRules['04500'].mechanic('abc')).toBe('abc');
    // [mf{lr}] > [øf{lr}]:
    expect(sindarinRules['04500'].mechanic('kamfru')).toBe('kafru');
    expect(sindarinRules['04500'].mechanic('nimfraed')).toBe('nifraed');
    // [nθ{lr}] > [øθ{lr}]:
    expect(sindarinRules['04500'].mechanic('kanθr')).toBe('kaθr');
    expect(sindarinRules['04500'].mechanic('penθrond')).toBe('peθrond');
    // [ns{lr}] > [øs{lr}]:
    expect(sindarinRules['04500'].mechanic('lansro')).toBe('lasro'); // ᴹ✶la(n)sro-ndo > N. lhathron
    // [ŋx{lr}] > [øx{lr}]:
    expect(sindarinRules['04500'].mechanic('taŋxl')).toBe('taxl');
    // [nf] > [ff]:
    expect(sindarinRules['04500'].mechanic('tanfa')).toBe('taffa'); // Non-existent word
  });

  it('04600 - nasals vanished before morpheme boundaries', () => {
    expect(sindarinRules['04600'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['04600'].mechanic('aranθorn')).toBe('araθorn');
    expect(sindarinRules['04600'].mechanic('aranphor')).toBe('araphor');
    expect(sindarinRules['04600'].mechanic('aranphant')).toBe('araphant');
    expect(sindarinRules['04600'].mechanic('infant')).toBe('ifant');
    expect(sindarinRules['04600'].mechanic('enpet')).toBe('epet');
    expect(sindarinRules['04600'].mechanic('in-chîn')).toBe('i-chîn');
    expect(sindarinRules['04600'].mechanic('i-ngelaidh')).toBe('i-ngelaidh');

    // Wrong guess:
    expect(sindarinRules['04600'].mechanic('inn-gelaidh')).toBe('in-gelaidh'); // Lacking examples, I've forced an error here.
    // Correct guess with a marker:
    expect(sindarinRules['04600'].mechanic('in-ngelaidh')).toBe('i-ngelaidh');
    // Correct guess with a bespoke marker:
    expect(sindarinRules['04600'].mechanic('in·ngelaidh', { boundaryChar: '·' })).toBe('i·ngelaidh');
    // No guessing yields identical string:
    expect(sindarinRules['04600'].mechanic('inngelaidh', { guess: false })).toBe('inngelaidh');
  });

  it('04700 - [ð] vanished before nasals at morpheme boundaries', () => {
    expect(sindarinRules['04700'].mechanic('abc')).toBe('abc');
    // Need to test this word: ✶khadmā > chaðw > haðw
    // It could be an exception that requires morphene boundaries again.
    expect(sindarinRules['04700'].mechanic('Eleðndor')).toBe('Elendor'); // Becomes Elennor
    expect(sindarinRules['04700'].mechanic('heleðmorn')).toBe('helemorn');
    expect(sindarinRules['04700'].mechanic('geleðndil')).toBe('gelendil');
    expect(sindarinRules['04700'].mechanic('geleðŋdil')).toBe('geleŋdil'); // Non-existent word
  });

  it('04800 - voiced spirants restopped after nasals', () => {
    // There are no examples of this one so far.
    expect(sindarinRules['04800'].mechanic('abc')).toBe('abc');
    // None of these exist:
    // -{mnŋ}{vðɣ}-] > [-{mnŋ}{bdg}-
    expect(sindarinRules['04800'].mechanic('tamvat')).toBe('tambat');
    expect(sindarinRules['04800'].mechanic('tanðat')).toBe('tandat');
    expect(sindarinRules['04800'].mechanic('tamðat')).toBe('tamdat'); // This is an unlikely pair, but feasible in compounds.
    expect(sindarinRules['04800'].mechanic('tandhat')).toBe('tandat');
    expect(sindarinRules['04800'].mechanic('taŋɣat')).toBe('taŋgat');
    // No description, no examples, awaiting feedback on Lambegolmor.
  });

  it('04900 - medial [mf], [nθ], [ŋx], [lθ] became [mm], [nn], [ŋg], [ll]', () => {
    expect(sindarinRules['04900'].mechanic('abc')).toBe('abc');
    // [-mf-] > [-mm-]:
    expect(sindarinRules['04900'].mechanic('gamfass')).toBe('gammass'); // This is Noldorin
    // [-nθ-] > [-nn-]:
    expect(sindarinRules['04900'].mechanic('manthen')).toBe('mannen');
    expect(sindarinRules['04900'].mechanic('danθa-')).toBe('danna-');
    // [-ŋx-] > [-ŋg-]:
    expect(sindarinRules['04900'].mechanic('daŋxen')).toBe('daŋgen');
    // [-lθ-] > [-ll-]:
    expect(sindarinRules['04900'].mechanic('malθorn')).toBe('mallorn');
  });

  it('05000 - voiceless nasals were voiced', () => {
    expect(sindarinRules['05000'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['05000'].mechanic('n̥aeð')).toBe('naeð');
    expect(sindarinRules['05000'].mechanic('m̥alð')).toBe('malð'); // Noldorin
  });

  it('05100 - long vowels shortened before clusters', () => {
    expect(sindarinRules['05100'].mechanic('xyz')).toBe('xyz');
    // Exceptions:
    expect(sindarinRules['05100'].mechanic('círdan')).toBe('círdan');
    expect(sindarinRules['05100'].mechanic('dírhael')).toBe('dírhael');
    expect(sindarinRules['05100'].mechanic('íðra')).toBe('íðra');
    expect(sindarinRules['05100'].mechanic('mírdain')).toBe('mírdain');
    expect(sindarinRules['05100'].mechanic('nírnaeth')).toBe('nírnaeth');
    // Regular cases:
    expect(sindarinRules['05100'].mechanic('hīθlūm')).toBe('hiθlūm');
    expect(sindarinRules['05100'].mechanic('roxīrrim')).toBe('roxirrim');
    expect(sindarinRules['05100'].mechanic('gūrgov')).toBe('gurgov');
    expect(sindarinRules['05100'].mechanic('ȳlm')).toBe('ylm');
  });

  it('05200 - [ī], [ū] often shortened in polysyllables', () => {
    expect(sindarinRules['05200'].mechanic('abc')).toBe('abc');
    // Final syllable shortening:
    expect(sindarinRules['05200'].mechanic('ithīl')).toBe('ithil');
    expect(sindarinRules['05200'].mechanic('pelīn')).toBe('pelin');
    expect(sindarinRules['05200'].mechanic('gwanūr')).toBe('gwanur');
    // Regular examples:
    expect(sindarinRules['05200'].mechanic('alfirīn')).toBe('alfirin');
    expect(sindarinRules['05200'].mechanic('firīn')).toBe('firin');
    expect(sindarinRules['05200'].mechanic('onūr')).toBe('onur');
    // Stressed syllables without shortening:
    // expect(sindarinRules['05200'].mechanic('inīðen')).toBe('iniðen');
    // expect(sindarinRules['05200'].mechanic('rīθant')).toBe('riθant');
    // expect(sindarinRules['05200'].mechanic('nīniel')).toBe('niniel');
    // expect(sindarinRules['05200'].mechanic('mūda-')).toBe('muda-'); // Noldorin

    // No shortening:
    expect(sindarinRules['05200'].mechanic('dínen')).toBe('dínen');
    expect(sindarinRules['05200'].mechanic('rhúnen')).toBe('rhúnen');
    expect(sindarinRules['05200'].mechanic('túrin')).toBe('túrin');
    // Exceptions:
    // (These are unclear how they came to be.)
    expect(sindarinRules['05200'].mechanic('curunír')).toBe('curunír');
    expect(sindarinRules['05200'].mechanic('elurín')).toBe('elurín');
    expect(sindarinRules['05200'].mechanic('glanhír')).toBe('glanhír');
    expect(sindarinRules['05200'].mechanic('nauglamír')).toBe('nauglamír');
    expect(sindarinRules['05200'].mechanic('aranrúth')).toBe('aranrúth');
  });
});
