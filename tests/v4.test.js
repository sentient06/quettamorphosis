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
    expect(findFirstOf(['a', 'e', 'i', 'o', 'u'], 'banana')).toEqual({ found: true, matched: 'a', charIndex: 1, nextChar: 'n', prevChar: 'b' });
    expect(findFirstOf(['an'], 'banana')).toEqual({ found: true, matched: 'an', charIndex: 1, nextChar: 'a', prevChar: 'b' });
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
    expect(sindarinRules['2002760597'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2002760597'].mechanic('wagme')).toBe('gwagme');
    expect(sindarinRules['2002760597'].mechanic('waiwe')).toBe('gwaiwe');
    expect(sindarinRules['2002760597'].mechanic('wanwa')).toBe('gwanwa');
  });

  it('00200 - initial nasals vanished before stops', () => {
    expect(sindarinRules['3057844573'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3057844573'].mechanic('mbarda')).toBe('barda');
    expect(sindarinRules['3057844573'].mechanic('ndaila')).toBe('daila');
    expect(sindarinRules['3057844573'].mechanic('ŋgol')).toBe('gol');
  });

  it('00300 - final nasals vanished after vowels', () => {
    expect(sindarinRules['876455981'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['876455981'].mechanic('kaim')).toBe('kai');
    expect(sindarinRules['876455981'].mechanic('ailin')).toBe('aili');
  });

  it('00400 - initial [s] vanished before spirants', () => {
    expect(sindarinRules['3841187313'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3841187313'].mechanic('sāba')).toBe('sāba');
    expect(sindarinRules['3841187313'].mechanic('sɸaŋga')).toBe('ɸaŋga');
    expect(sindarinRules['3841187313'].mechanic('sθaŋxa')).toBe('θaŋxa');
    expect(sindarinRules['3841187313'].mechanic('sxella')).toBe('xella');
  });

  it('00500 - initial voiceless [j̊] became [x]', () => {
    expect(sindarinRules['3841187313'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2178021811'].mechanic('hyalma')).toBe('chalma');
    expect(sindarinRules['2178021811'].mechanic('hyūle')).toBe('chūle');
  });

  it('00600 - voiced stops became spirants after liquids', () => {
    expect(sindarinRules['1590520649'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['1590520649'].mechanic('kherbessē')).toBe('khervessē');
    expect(sindarinRules['1590520649'].mechanic('gardā')).toBe('garðā');
    expect(sindarinRules['1590520649'].mechanic('targā')).toBe('tarɣā');
    expect(sindarinRules['1590520649'].mechanic('golbā')).toBe('golvā');
    expect(sindarinRules['1590520649'].mechanic('kuldā')).toBe('kulðā');
    expect(sindarinRules['1590520649'].mechanic('phelgā')).toBe('phelɣā');
  });

  it('00700 - [zb], [zg] became [ðβ], [ðɣ]', () => {
    expect(sindarinRules['1951748921'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['1951748921'].mechanic('nazgā')).toBe('naðɣā');
    expect(sindarinRules['1951748921'].mechanic('mazgō')).toBe('maðɣō');
    expect(sindarinRules['1951748921'].mechanic('buzbō')).toBe('buðβō');
  });

  it('00800 - short [i], [u] became [e], [o] preceding final [a]', () => {
    expect(sindarinRules['1593810649'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['1593810649'].mechanic('ugrā')).toBe('ogrā');
    expect(sindarinRules['1593810649'].mechanic('ninda')).toBe('nenda');
  });

  it('00900 - voiced stops became spirants after vowels', () => {
    expect(sindarinRules['1726791627'].mechanic('xyz')).toBe('xyz');
    expect(sindarinRules['1726791627'].mechanic('nebā')).toBe('nevā');
    expect(sindarinRules['1726791627'].mechanic('edelō')).toBe('eðelō');
    expect(sindarinRules['1726791627'].mechanic('magla')).toBe('maɣla');
  });

  it('01000 - [ɸ], [β] became [f], [v]', () => {
    expect(sindarinRules['890563133'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['890563133'].mechanic('alɸa')).toBe('alfa');
    expect(sindarinRules['890563133'].mechanic('eɸɸel')).toBe('effel');
    expect(sindarinRules['890563133'].mechanic('buðβo')).toBe('buðvo');
  });

  it('01100 - medial [j] became [i]', () => {
    expect(sindarinRules['1679623085'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['1679623085'].mechanic('balanja')).toBe('balania');
    expect(sindarinRules['1679623085'].mechanic('ɸanja')).toBe('ɸania');
  });

  it('01200 - short [e], [o] became [i], [u] in syllable before final [i]', () => {
    expect(sindarinRules['2646655607'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2646655607'].mechanic('leperī')).toBe('lepirī');
    expect(sindarinRules['2646655607'].mechanic('oronī')).toBe('orunī');
    expect(sindarinRules['2646655607'].mechanic('ossī')).toBe('ussī');
    expect(sindarinRules['2646655607'].mechanic('teŋmi')).toBe('tiŋmi');
    expect(sindarinRules['2646655607'].mechanic('eleni')).toBe('elini');
    expect(sindarinRules['2646655607'].mechanic('goloði')).toBe('goluði');
  });

  describe('01300 - short [a], [o], [u] became [e], [œ], [y] before [i]', () => {
    it('[ăCi] > [eCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('bania')).toBe('benia');
      expect(sindarinRules['3958031275'].mechanic('braθil')).toBe('breθil');
    });
    it('[ăCCi] > [eCCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('balθil')).toBe('belθil');
      expect(sindarinRules['3958031275'].mechanic('alfi')).toBe('elfi');
      expect(sindarinRules['3958031275'].mechanic('sarnīe')).toBe('sernīe');
    });
    it('[ăCăCi] > [eCeCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('balania')).toBe('belenia');
      expect(sindarinRules['3958031275'].mechanic('atatia')).toBe('etetia');
    });
    it('[ăCŭCi] > [eCyCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('andundi')).toBe('endyndi'); // VCCVCCV
    });
    it('[ŏCi] > [œCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('ronio')).toBe('rœnio');
      expect(sindarinRules['3958031275'].mechanic('olia')).toBe('œlia');
    });
    it('[ŏCŭCi] > [œCyCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('goluði')).toBe('gœlyði');
      expect(sindarinRules['3958031275'].mechanic('θoluhi')).toBe('θœlyhi');
      expect(sindarinRules['3958031275'].mechanic('oruti')).toBe('œryti');
    });
    it('[ŏCŏCi] > [œCœCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('doroni')).toBe('dœrœni');
      expect(sindarinRules['3958031275'].mechanic('olohi')).toBe('œlœhi');
    });
    it('[ŭCi] > [yCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('duri')).toBe('dyri');
      expect(sindarinRules['3958031275'].mechanic('puti')).toBe('pyti');
    });
    it('[ŭCCi] > [yCCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('dumbi')).toBe('dymbi');
      expect(sindarinRules['3958031275'].mechanic('tainakulli')).toBe('tainakylli');
      expect(sindarinRules['3958031275'].mechanic('ukli')).toBe('ykli');
    });
    it('others', () => {
      expect(sindarinRules['3958031275'].mechanic('calatariɣell')).toBe('calateriɣell');
    });
  });

  it('01400 - [ē], [ō] became [ī], [ū]', () => {
    expect(sindarinRules['3889365613'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3889365613'].mechanic('dēra')).toBe('dīra');
    expect(sindarinRules['3889365613'].mechanic('eðēwe')).toBe('eðīwe');
    expect(sindarinRules['3889365613'].mechanic('mēlambar')).toBe('mīlambar');
    expect(sindarinRules['3889365613'].mechanic('belekōre')).toBe('belekūre');
    expect(sindarinRules['3889365613'].mechanic('gōle')).toBe('gūle');
    expect(sindarinRules['3889365613'].mechanic('gōrikova')).toBe('gūrikova');
    expect(sindarinRules['3889365613'].mechanic('l̥ōko')).toBe('l̥ūko');
    expect(sindarinRules['3889365613'].mechanic('oθθōia')).toBe('oθθūia');
  });

  it('01500 - [ɣ] vocalized before [l], [r], [m], [n]', () => {
    expect(sindarinRules['539122737'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['539122737'].mechanic('maɣza')).toBe('maɣza'); // non-existent word
    expect(sindarinRules['539122737'].mechanic('maɣla')).toBe('maila');
    expect(sindarinRules['539122737'].mechanic('maɣra')).toBe('maira');
    expect(sindarinRules['539122737'].mechanic('gwaɣme')).toBe('gwaime');
    expect(sindarinRules['539122737'].mechanic('oɣma')).toBe('oima');
    expect(sindarinRules['539122737'].mechanic('loɣna')).toBe('loina');
  });

  it('01600 - [x], [ɸ] vocalized between a vowel and [θ]', () => {
    expect(sindarinRules['4002924749'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['4002924749'].mechanic('leɸθa-')).toBe('leuθa-'); // [eɸθ] > [euθ]
    expect(sindarinRules['4002924749'].mechanic('andatexθa')).toBe('andateiθa'); // [exθ] > [eiθ]
    expect(sindarinRules['4002924749'].mechanic('paxθa')).toBe('paiθa'); // [axθ] > [aiθ]
    expect(sindarinRules['4002924749'].mechanic('rixθant')).toBe('rīθant'); // [ixθ] > [īθ]
    expect(sindarinRules['4002924749'].mechanic('gruxθa-')).toBe('gruiθa-'); // [uxθ] > [uiθ]
  });

  it('01700 - non-initial [xʲ] vocalized to [ix]', () => {
    expect(sindarinRules['2422841513'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2422841513'].mechanic('lexʲa')).toBe('leixa');
    expect(sindarinRules['2422841513'].mechanic('leꜧa')).toBe('leixa');
    expect(sindarinRules['2422841513'].mechanic('lixʲi')).toBe('līxi');
    expect(sindarinRules['2422841513'].mechanic('liꜧi')).toBe('līxi');
  });

  it('01800 - [iu] and [ju] became [ȳ]', () => {
    expect(sindarinRules['659168127'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['659168127'].mechanic('diule')).toBe('dȳle'); // [iu] > [ȳ]
    expect(sindarinRules['659168127'].mechanic('kiurǭna')).toBe('kȳrǭna'); // [iu] > [ȳ]
    expect(sindarinRules['659168127'].mechanic('julma')).toBe('ȳlma'); // [ju] > [ȳ]
    expect(sindarinRules['659168127'].mechanic('jūneke')).toBe('ȳneke'); // [ju] > [ȳ]
    expect(sindarinRules['659168127'].mechanic('jūiabc')).toBe('ȳiabc'); // [jui] > [jui] (no real examples)
  });

  it('01900 - short [u] often became [o]', () => {
    expect(sindarinRules['2740073851'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2740073851'].mechanic('guruk')).toBe('guruk'); // [uC{uw}] > [uC{uw}]
    expect(sindarinRules['2740073851'].mechanic('tumbo')).toBe('tumbo'); // [um] > [um]
    expect(sindarinRules['2740073851'].mechanic('felakgundu')).toBe('felakgundo'); // [un] > [un]
    // This is a loanword, it actually yields felakgundu.
    // But as a rule, we just ignore that.
    expect(sindarinRules['2740073851'].mechanic('truŋxo')).toBe('truŋxo'); // [uŋ] > [uŋ]
    expect(sindarinRules['2740073851'].mechanic('uroθa')).toBe('oroθa'); // [ŭ] > [o]
  });

  it('02000 - [nm], [ŋm] became [nw], [ŋw]', () => {
    expect(sindarinRules['3258926163'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3258926163'].mechanic('anma')).toBe('anwa'); // [nm] > [nw]
    expect(sindarinRules['3258926163'].mechanic('teŋma')).toBe('teŋwa'); // [ŋm] > [ŋw]
    expect(sindarinRules['3258926163'].mechanic('tiŋmi')).toBe('tiŋwi'); // [ŋm] > [ŋw]
  });

  it('02100 - [ŋ] vanished with compensatory lengthening', () => {
    expect(sindarinRules['3707785609'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3707785609'].mechanic('teŋwa')).toBe('tēwa'); // [Vŋw] > [V̄w]
    expect(sindarinRules['3707785609'].mechanic('tiŋwi')).toBe('tīwi'); // [Vŋn] > [V̄n]
  });

  it('02200 - [ǭ] became [au]', () => {
    expect(sindarinRules['558704171'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['558704171'].mechanic('aɣǭle')).toBe('aɣaule');
    expect(sindarinRules['558704171'].mechanic('arǭta')).toBe('arauta');
    expect(sindarinRules['558704171'].mechanic('ǭ')).toBe('au');
    expect(sindarinRules['558704171'].mechanic('ekǭ')).toBe('ekau');
    expect(sindarinRules['558704171'].mechanic('lindǭna')).toBe('lindauna');
    expect(sindarinRules['558704171'].mechanic('θǭniel')).toBe('θauniel');
    expect(sindarinRules['558704171'].mechanic('ǭbbǭ')).toBe('aubbau'); // non-existent word
  });

  it('02300 - [ę̄] became [ai]', () => {
    expect(sindarinRules['2387695245'].mechanic('abc')).toBe('abc');
    // All words below are corrupted Old Noldorin examples as there are no Sindarin examples available.
    expect(sindarinRules['2387695245'].mechanic('kę̄m')).toBe('kaim');
    expect(sindarinRules['2387695245'].mechanic('ndę̄r')).toBe('ndair');
    expect(sindarinRules['2387695245'].mechanic('pę̄ne')).toBe('paine');
    expect(sindarinRules['2387695245'].mechanic('pę̄nnę̄')).toBe('painnai'); // non-existent word
  });

  it('02400 - short final vowels vanished', () => {
    expect(sindarinRules['813787869'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['813787869'].mechanic('aða')).toBe('að');
    expect(sindarinRules['813787869'].mechanic('akaura')).toBe('akaur');
    expect(sindarinRules['813787869'].mechanic('alwa')).toBe('alw');
    expect(sindarinRules['813787869'].mechanic('ambarθa')).toBe('ambarθ');
    expect(sindarinRules['813787869'].mechanic('fanoia')).toBe('fanoi');
    expect(sindarinRules['813787869'].mechanic('groθθa')).toBe('groθθ');
    expect(sindarinRules['813787869'].mechanic('eiθele')).toBe('eiθel');
    expect(sindarinRules['813787869'].mechanic('gūle')).toBe('gūl');
    expect(sindarinRules['813787869'].mechanic('mīre')).toBe('mīr');
    expect(sindarinRules['813787869'].mechanic('otoko')).toBe('otok');
    expect(sindarinRules['813787869'].mechanic('penθrondo')).toBe('penθrond');
    expect(sindarinRules['813787869'].mechanic('θolo')).toBe('θol');
    expect(sindarinRules['813787869'].mechanic('-weɣo')).toBe('-weɣ');
    expect(sindarinRules['813787869'].mechanic('ekau')).toBe('ekau');
    expect(sindarinRules['813787869'].mechanic('tīwi')).toBe('tīwi');
  });

  it('02500 - final [i] intruded into preceding syllable', () => {
    expect(sindarinRules['2399289739'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2399289739'].mechanic('deŋxini')).toBe('deŋxin'); // [-iCi] > [-iC]
    expect(sindarinRules['2399289739'].mechanic('iri')).toBe('ir'); // [-iCi] > [-iC]
    expect(sindarinRules['2399289739'].mechanic('beleni')).toBe('belein'); // [-ĕCi] > [-eiC]
    expect(sindarinRules['2399289739'].mechanic('θœlyhi')).toBe('θœlyh'); // [-yCi] > [-yC]
    expect(sindarinRules['2399289739'].mechanic('œrœni')).toBe('œrœin'); // [-œCi] > [-œiC]
    expect(sindarinRules['2399289739'].mechanic('θǭni')).toBe('θoin'); // [-ǭCi] > [-oiC]
    expect(sindarinRules['2399289739'].mechanic('xerūni')).toBe('xeruin'); // [-ūCi] > [-uiC]
  });

  it('02600 - final [w] sometimes intruded into preceding syllables', () => {
    expect(sindarinRules['4211011237'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['4211011237'].mechanic('anw')).toBe('aun'); // [-ăCw] > [-auC]
    expect(sindarinRules['4211011237'].mechanic('gwanw')).toBe('gwaun'); // [-ăCw] > [-auC]
    expect(sindarinRules['4211011237'].mechanic('texʷ')).toBe('teux'); // [-ĕCw] > [-euC]
  });

  it('02700 - initial [x-] became [h-]', () => {
    expect(sindarinRules['4287595571'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['4287595571'].mechanic('xaðaud')).toBe('haðaud'); // [x-] > [h-]
    expect(sindarinRules['4287595571'].mechanic('xaun')).toBe('haun');
    expect(sindarinRules['4287595571'].mechanic('χaðaud')).toBe('haðaud'); // Alternative spelling
    expect(sindarinRules['4287595571'].mechanic('khaðaud')).toBe('haðaud'); // Alternative spelling
    expect(sindarinRules['4287595571'].mechanic('χaun')).toBe('haun'); // Alternative spelling
    expect(sindarinRules['4287595571'].mechanic('khaun')).toBe('haun'); // Alternative spelling
    expect(sindarinRules['4287595571'].mechanic('xrass')).toBe('r̥ass'); // [xr-] > [r̥-] This is Noldorin
    expect(sindarinRules['4287595571'].mechanic('xlass')).toBe('l̥ass'); // [xl-] > [l̥-] This word doesn't exist.
  });

  it('02800 - voiceless stops voiced after vowels', () => {
    expect(sindarinRules['2240258959'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2240258959'].mechanic('akauwen')).toBe('agauwen');
    expect(sindarinRules['2240258959'].mechanic('bakaur')).toBe('bagaur');
    expect(sindarinRules['2240258959'].mechanic('eklambar')).toBe('eglambar');
    expect(sindarinRules['2240258959'].mechanic('serek')).toBe('sereg');
    expect(sindarinRules['2240258959'].mechanic('kelep')).toBe('keleb');
    expect(sindarinRules['2240258959'].mechanic('map')).toBe('mab');
    expect(sindarinRules['2240258959'].mechanic('nipen')).toBe('niben');
    expect(sindarinRules['2240258959'].mechanic('θarapad')).toBe('θarabad');
    expect(sindarinRules['2240258959'].mechanic('calatariɣell')).toBe('caladariɣell');
    expect(sindarinRules['2240258959'].mechanic('etlandor')).toBe('edlandor');
    expect(sindarinRules['2240258959'].mechanic('matw')).toBe('madw');
    expect(sindarinRules['2240258959'].mechanic('otoh')).toBe('odoh');
    expect(sindarinRules['2240258959'].mechanic('œryt')).toBe('œryd');
  });

  it('02900 - short vowels generally lengthened in monosyllables', () => {
    expect(sindarinRules['1053424933'].mechanic('abc')).toBe('abc');
    // Lengthening occurs in monosyllables:
    expect(sindarinRules['1053424933'].mechanic('penθrondo')).toBe('penθrondo');
    // Lengthening did not occur before unvoiced consonants: th, ch ([θ], [x]):
    expect(sindarinRules['1053424933'].mechanic('gwaθ')).toBe('gwaθ');
    expect(sindarinRules['1053424933'].mechanic('gwath')).toBe('gwath');
    expect(sindarinRules['1053424933'].mechanic('bach')).toBe('bach');
    expect(sindarinRules['1053424933'].mechanic('bax')).toBe('bax');
    // Long ss also did not lengthen, see rule 06300.
    expect(sindarinRules['1053424933'].mechanic('loss')).toBe('loss');
    // Exceptions:
    expect(sindarinRules['1053424933'].mechanic('hith')).toBe('hīth');
    expect(sindarinRules['1053424933'].mechanic('nith')).toBe('nīth');
    expect(sindarinRules['1053424933'].mechanic('iath')).toBe('iāth');
    // Sindarin monosyllables ending in [m] and [ŋ] do not show vowel lengthening
    expect(sindarinRules['1053424933'].mechanic('lam')).toBe('lam');
    expect(sindarinRules['1053424933'].mechanic('dom')).toBe('dom');
    // Cases where lengthening did not occur before voiced spirants and stops:
    expect(sindarinRules['1053424933'].mechanic('cef')).toBe('cef');
    expect(sindarinRules['1053424933'].mechanic('glad')).toBe('glad');
    expect(sindarinRules['1053424933'].mechanic('lad')).toBe('lad');
    expect(sindarinRules['1053424933'].mechanic('nad')).toBe('nad');
    expect(sindarinRules['1053424933'].mechanic('pad')).toBe('pad');
    expect(sindarinRules['1053424933'].mechanic('plad')).toBe('plad');
    expect(sindarinRules['1053424933'].mechanic('sad')).toBe('sad');
    expect(sindarinRules['1053424933'].mechanic('tad')).toBe('tad');
    expect(sindarinRules['1053424933'].mechanic('peg')).toBe('peg');
    // Cases where lengthening did not occur before [l]:
    expect(sindarinRules['1053424933'].mechanic('ial')).toBe('ial');
    expect(sindarinRules['1053424933'].mechanic('el')).toBe('el');
    expect(sindarinRules['1053424933'].mechanic('del')).toBe('del');
    expect(sindarinRules['1053424933'].mechanic('gil')).toBe('gil');
    expect(sindarinRules['1053424933'].mechanic('tol')).toBe('tol');
    expect(sindarinRules['1053424933'].mechanic('dol')).toBe('dol');
    // Cases where lengthening did not occur before [r]:
    expect(sindarinRules['1053424933'].mechanic('bar')).toBe('bar');
    expect(sindarinRules['1053424933'].mechanic('far')).toBe('far');
    expect(sindarinRules['1053424933'].mechanic('er')).toBe('er');
    expect(sindarinRules['1053424933'].mechanic('cor')).toBe('cor');
    expect(sindarinRules['1053424933'].mechanic('for')).toBe('for');
    expect(sindarinRules['1053424933'].mechanic('gor')).toBe('gor');
    // Cases where lengthening did not occur before [n]:
    expect(sindarinRules['1053424933'].mechanic('glan')).toBe('glan');
    expect(sindarinRules['1053424933'].mechanic('fen')).toBe('fen');
    expect(sindarinRules['1053424933'].mechanic('hen')).toBe('hen');
    expect(sindarinRules['1053424933'].mechanic('men')).toBe('men');
    expect(sindarinRules['1053424933'].mechanic('nen')).toBe('nen');
    expect(sindarinRules['1053424933'].mechanic('min')).toBe('min');
    expect(sindarinRules['1053424933'].mechanic('tin')).toBe('tin');
    expect(sindarinRules['1053424933'].mechanic('ion')).toBe('ion');
    // Vowel lengthening does not occur in monosyllables ending a vowel:
    expect(sindarinRules['1053424933'].mechanic('ke')).toBe('ke');
    expect(sindarinRules['1053424933'].mechanic('khe')).toBe('khe');
    expect(sindarinRules['1053424933'].mechanic('khe')).toBe('khe');
    expect(sindarinRules['1053424933'].mechanic('ga')).toBe('ga');
    expect(sindarinRules['1053424933'].mechanic('oio')).toBe('oio');
    expect(sindarinRules['1053424933'].mechanic('si')).toBe('si');
    // Exceptions:
    expect(sindarinRules['1053424933'].mechanic('hwa')).toBe('hwā');
    expect(sindarinRules['1053424933'].mechanic('ia')).toBe('iā');
    expect(sindarinRules['1053424933'].mechanic('te')).toBe('tē');
    expect(sindarinRules['1053424933'].mechanic('thle')).toBe('thlē');
    expect(sindarinRules['1053424933'].mechanic('di')).toBe('dī');
    expect(sindarinRules['1053424933'].mechanic('lhi')).toBe('lhī');
    expect(sindarinRules['1053424933'].mechanic('gli')).toBe('glī');
    expect(sindarinRules['1053424933'].mechanic('gwi')).toBe('gwī');
    expect(sindarinRules['1053424933'].mechanic('rhi')).toBe('rhī');
    expect(sindarinRules['1053424933'].mechanic('ri')).toBe('rī');
    expect(sindarinRules['1053424933'].mechanic('ti')).toBe('tī');
    expect(sindarinRules['1053424933'].mechanic('lo')).toBe('lō');
    expect(sindarinRules['1053424933'].mechanic('no')).toBe('nō');
    // Lengthening did (mostly) occur before voiced consonants: b, d, dh, f [v], g, l, n, r:
    expect(sindarinRules['1053424933'].mechanic('ban')).toBe('bān');
    expect(sindarinRules['1053424933'].mechanic('hen')).toBe('hen');
    expect(sindarinRules['1053424933'].mechanic('mav')).toBe('māv');
    expect(sindarinRules['1053424933'].mechanic('gweɣ')).toBe('gwēɣ');
    expect(sindarinRules['1053424933'].mechanic('fin')).toBe('fīn');
    expect(sindarinRules['1053424933'].mechanic('el')).toBe('el');
    expect(sindarinRules['1053424933'].mechanic('gwan')).toBe('gwān');
    expect(sindarinRules['1053424933'].mechanic('mor')).toBe('mōr');
    expect(sindarinRules['1053424933'].mechanic('θol')).toBe('θōl');
  });

  it('03000 - final [ɣ] became [a] after a consonant', () => {
    expect(sindarinRules['916418731'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['916418731'].mechanic('felɣ')).toBe('fela');
    expect(sindarinRules['916418731'].mechanic('maðɣ')).toBe('maða');
    expect(sindarinRules['916418731'].mechanic('filɣi')).toBe('filī');
  });

  it('03100 - [ɣ] became [i] between sonants and vowels', () => {
    expect(sindarinRules['2139740021'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2139740021'].mechanic('θalɣond')).toBe('θaliond');
    expect(sindarinRules['2139740021'].mechanic('ulɣund')).toBe('ulund');
    expect(sindarinRules['2139740021'].mechanic('θelɣyndi')).toBe('θelyndi');
    expect(sindarinRules['2139740021'].mechanic('dirɣel')).toBe('diriel');
    expect(sindarinRules['2139740021'].mechanic('tarɣass')).toBe('tariass');
    expect(sindarinRules['2139740021'].mechanic('maðɣass')).toBe('madhiass');
    // Doesn't change:
    expect(sindarinRules['2139740021'].mechanic('galadariɣel')).toBe('galadariɣel');
    // These words don't exist:
    expect(sindarinRules['2139740021'].mechanic('abɣab')).toBe('abiab');
    expect(sindarinRules['2139740021'].mechanic('adɣab')).toBe('adiab');
    expect(sindarinRules['2139740021'].mechanic('agɣab')).toBe('agiab');
    expect(sindarinRules['2139740021'].mechanic('avɣab')).toBe('aviab');
    expect(sindarinRules['2139740021'].mechanic('afɣab')).toBe('afiab');
    expect(sindarinRules['2139740021'].mechanic('aðɣab')).toBe('aðiab');
    expect(sindarinRules['2139740021'].mechanic('awɣab')).toBe('awiab');
    expect(sindarinRules['2139740021'].mechanic('alɣab')).toBe('aliab');
    expect(sindarinRules['2139740021'].mechanic('arɣab')).toBe('ariab');
    expect(sindarinRules['2139740021'].mechanic('ajɣab')).toBe('ajiab');
  });

  it('03200 - [ɣ] otherwise vanished', () => {
    expect(sindarinRules['4164672875'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['4164672875'].mechanic('galadariɣel')).toBe('galadariel');
    expect(sindarinRules['4164672875'].mechanic('jaɣa')).toBe('jā');
    expect(sindarinRules['4164672875'].mechanic('lōɣ')).toBe('lō');
    expect(sindarinRules['4164672875'].mechanic('nǭvaɣrod')).toBe('nǭvarod');
  });

  it('03300 - final [-wi] became [-y]', () => {
    expect(sindarinRules['677308549'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['677308549'].mechanic('herwi')).toBe('hery');
    expect(sindarinRules['677308549'].mechanic('melui')).toBe('mely');
  });

  it('03400 - [h] vanished after vowels', () => {
    expect(sindarinRules['875184187'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['875184187'].mechanic('ahamar')).toBe('āmar');
    expect(sindarinRules['875184187'].mechanic('ahaum')).toBe('aum');
    expect(sindarinRules['875184187'].mechanic('goroθūh')).toBe('goroθū');
    expect(sindarinRules['875184187'].mechanic('l̥ahu')).toBe('l̥au');
    expect(sindarinRules['875184187'].mechanic('odoh')).toBe('odo');
    expect(sindarinRules['875184187'].mechanic('tindūmihelð')).toBe('tindūmielð');
    expect(sindarinRules['875184187'].mechanic('θūhon')).toBe('θūon');
    expect(sindarinRules['875184187'].mechanic('θœlyh')).toBe('θœly');
  });

  it('03500 - final [i], [u] generally vanished', () => {
    expect(sindarinRules['1815401039'].mechanic('abc')).toBe('abc');
    // Final short i after consonant vanishes: [-Sĭ] > [-Sø]
    expect(sindarinRules['1815401039'].mechanic('bereθi')).toBe('bereθ');
    expect(sindarinRules['1815401039'].mechanic('kirθi')).toBe('kirθ');
    expect(sindarinRules['1815401039'].mechanic('yrxi')).toBe('yrx');
    // Final short u after consonant vanishes: [-Sŭ] > [-Sø]
    expect(sindarinRules['1815401039'].mechanic('felaggundu')).toBe('felaggund');
    expect(sindarinRules['1815401039'].mechanic('kundu')).toBe('kund');
    // Exception: uCu pattern is preserved: [-uCu] > [-uCu]
    expect(sindarinRules['1815401039'].mechanic('guru')).toBe('guru');
    // Long i after consonant becomes short: [-Sī] > [-Sĭ]
    expect(sindarinRules['1815401039'].mechanic('filī')).toBe('fili');
    // Words not ending in i or u are unchanged
    expect(sindarinRules['1815401039'].mechanic('tindūmielð')).toBe('tindūmielð');
  });

  it('03600 - short vowels vanished before morpheme boundaries', () => {
    expect(sindarinRules['2749565259'].mechanic('abc')).toBe('abc');

    // [Că+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('aiganaur')).toBe('aignaur');
    expect(sindarinRules['2749565259'].mechanic('caladariell')).toBe('caladriell');
    expect(sindarinRules['2749565259'].mechanic('finiŋgorn')).toBe('finŋgorn');

    // [Cĕ+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('elembereth')).toBe('elmbereth');
    expect(sindarinRules['2749565259'].mechanic('moreŋgoθθ')).toBe('morŋgoθθ');

    // Wrong guess:
    expect(sindarinRules['2749565259'].mechanic('geleðendil')).toBe('gelðendil');
    // Correct guess with a marker:
    expect(sindarinRules['2749565259'].mechanic('geleðen-dil')).toBe('geleðndil');
    // Correct guess with a bespoke marker:
    expect(sindarinRules['2749565259'].mechanic('geleðen·dil', { boundaryChar: '·' })).toBe('geleðndil');
    // No guessing yields identical string:
    expect(sindarinRules['2749565259'].mechanic('geleðendil', { guess: false })).toBe('geleðendil');


    // [Cĭ+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('gilidīr')).toBe('gildīr');
    expect(sindarinRules['2749565259'].mechanic('hīθilūm')).toBe('hīθlūm');
    expect(sindarinRules['2749565259'].mechanic('nimfiraid')).toBe('nimfraid');

    // [Cŏ+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('gondolind')).toBe('gondlind');
    expect(sindarinRules['2749565259'].mechanic('gondondor')).toBe('gondndor');

    // [Cŭ+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('turugaun')).toBe('turgaun');
    expect(sindarinRules['2749565259'].mechanic('turugond')).toBe('turgond');
  });

  it('03700 - [ai], [oi] became [ae], [oe]', () => {
    expect(sindarinRules['941153689'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['941153689'].mechanic('aθai')).toBe('aθae');
    expect(sindarinRules['941153689'].mechanic('gaiar')).toBe('gaear');
    expect(sindarinRules['941153689'].mechanic('haið')).toBe('haeð');
    expect(sindarinRules['941153689'].mechanic('mairond')).toBe('maerond');
    expect(sindarinRules['941153689'].mechanic('fanoi')).toBe('fanoe');
    expect(sindarinRules['941153689'].mechanic('goi')).toBe('goe');
    expect(sindarinRules['941153689'].mechanic('l̥oim')).toBe('l̥oem');
    expect(sindarinRules['941153689'].mechanic('θoin')).toBe('θoen');
  });

  it('03800 - later [ei] became [ai] in final syllables', () => {
    expect(sindarinRules['1660291111'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['1660291111'].mechanic('bein')).toBe('bain');
    expect(sindarinRules['1660291111'].mechanic('beleiθ')).toBe('belaiθ');
    expect(sindarinRules['1660291111'].mechanic('eveir')).toBe('evair');
    expect(sindarinRules['1660291111'].mechanic('lemein')).toBe('lemain');
    expect(sindarinRules['1660291111'].mechanic('rein')).toBe('rain');
    expect(sindarinRules['1660291111'].mechanic('seid')).toBe('said');
    expect(sindarinRules['1660291111'].mechanic('teleir')).toBe('telair');
  });

  it('03900 - diphthongs [yi], [yu] became [ui]', () => {
    // This rule has no attested direct examples, it is mostly concerned with explaining plural formation.
    expect(sindarinRules['3257758901'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3257758901'].mechanic('yux')).toBe('uix');
    expect(sindarinRules['3257758901'].mechanic('yix')).toBe('uix'); // Non-existent word
  });

  it('04000 - [œi] became [ui] or [y]', () => {
    expect(sindarinRules['1787434575'].mechanic('abc')).toBe('abc');
    // There is only one example of this rule. It also is mostly concerned with explaining plural formation.
    expect(sindarinRules['1787434575'].mechanic('œrœin')).toBe('œryn');
    expect(sindarinRules['1787434575'].mechanic('œrœin', { useUi: true })).toBe('œruin');
  });

  it('04100 - [nr] became [ðr]', () => {
    // Depends on 03600
    expect(sindarinRules['1105959911'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['1105959911'].mechanic('karanrass')).toBe('karaðrass');
    expect(sindarinRules['1105959911'].mechanic('finrod', { cluster: true })).toBe('finrod');
  });

  it('04200 - dissimilation of dental spirants', () => {
    expect(sindarinRules['2090293737'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2090293737'].mechanic('θaeθ')).toBe('θaes');
    expect(sindarinRules['2090293737'].mechanic('úthaeth')).toBe('úthaes');
    expect(sindarinRules['2090293737'].mechanic('údhaeth')).toBe('údhaes'); // Non-existent word
  });

  it('04300 - [ls], [rs] became [lθ], [ss]', () => {
    expect(sindarinRules['298324969'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['298324969'].mechanic('falso')).toBe('faltho');
    expect(sindarinRules['298324969'].mechanic('olsa-')).toBe('oltha-');
    expect(sindarinRules['298324969'].mechanic('tars')).toBe('tass');
    expect(sindarinRules['298324969'].mechanic('perso')).toBe('pesso');
  });

  it('04400 - final [mf], [nθ], [ŋx], [lθ] became [mp], [nt], [ŋk], [lt]', () => {
    expect(sindarinRules['1531741019'].mechanic('abc')).toBe('abc');
    // [-mf] > [-mp]:
    expect(sindarinRules['1531741019'].mechanic('gamf')).toBe('gamp');
    expect(sindarinRules['1531741019'].mechanic('nimf')).toBe('nimp');
    // [-nθ] > [-nt]:
    expect(sindarinRules['1531741019'].mechanic('estenθ')).toBe('estent');
    expect(sindarinRules['1531741019'].mechanic('estenth')).toBe('estent');
    expect(sindarinRules['1531741019'].mechanic('ranθ')).toBe('rant');
    expect(sindarinRules['1531741019'].mechanic('θenθ')).toBe('θent');
    // [-ŋx] > [-ŋk]:
    expect(sindarinRules['1531741019'].mechanic('fliŋx')).toBe('fliŋk');
    expect(sindarinRules['1531741019'].mechanic('flingch')).toBe('flingk');
    expect(sindarinRules['1531741019'].mechanic('laŋx')).toBe('laŋk');
    // [-lθ] > [-lt]:
    expect(sindarinRules['1531741019'].mechanic('malth')).toBe('malt'); // Only entry in Sindarin, deleted
    expect(sindarinRules['1531741019'].mechanic('malθ')).toBe('malt'); // Only entry in Sindarin, deleted
    expect(sindarinRules['1531741019'].mechanic('m̥alθ')).toBe('m̥alt'); // This is Noldorin
    expect(sindarinRules['1531741019'].mechanic('talθ')).toBe('talt'); // This is Noldorin
  });

  it('04500 - nasals vanished before spirantal clusters', () => {
    expect(sindarinRules['1856165973'].mechanic('abc')).toBe('abc');
    // [mf{lr}] > [øf{lr}]:
    expect(sindarinRules['1856165973'].mechanic('kamfru')).toBe('kafru');
    expect(sindarinRules['1856165973'].mechanic('nimfraed')).toBe('nifraed');
    // [nθ{lr}] > [øθ{lr}]:
    expect(sindarinRules['1856165973'].mechanic('kanθr')).toBe('kaθr');
    expect(sindarinRules['1856165973'].mechanic('penθrond')).toBe('peθrond');
    // [ns{lr}] > [øs{lr}]:
    expect(sindarinRules['1856165973'].mechanic('lansro')).toBe('lasro'); // ᴹ✶la(n)sro-ndo > N. lhathron
    // [ŋx{lr}] > [øx{lr}]:
    expect(sindarinRules['1856165973'].mechanic('taŋxl')).toBe('taxl');
    // [nf] > [ff]:
    expect(sindarinRules['1856165973'].mechanic('tanfa')).toBe('taffa'); // Non-existent word
  });

  it('04600 - nasals vanished before morpheme boundaries', () => {
    expect(sindarinRules['3282356701'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3282356701'].mechanic('aranθorn')).toBe('araθorn');
    expect(sindarinRules['3282356701'].mechanic('aranphor')).toBe('araphor');
    expect(sindarinRules['3282356701'].mechanic('aranphant')).toBe('araphant');
    expect(sindarinRules['3282356701'].mechanic('infant')).toBe('ifant');
    expect(sindarinRules['3282356701'].mechanic('enpet')).toBe('epet');
    expect(sindarinRules['3282356701'].mechanic('in-chîn')).toBe('i-chîn');
    expect(sindarinRules['3282356701'].mechanic('i-ngelaidh')).toBe('i-ngelaidh');

    // Wrong guess:
    expect(sindarinRules['3282356701'].mechanic('inn-gelaidh')).toBe('in-gelaidh'); // Lacking examples, I've forced an error here.
    // Correct guess with a marker:
    expect(sindarinRules['3282356701'].mechanic('in-ngelaidh')).toBe('i-ngelaidh');
    // Correct guess with a bespoke marker:
    expect(sindarinRules['3282356701'].mechanic('in·ngelaidh', { boundaryChar: '·' })).toBe('i·ngelaidh');
    // No guessing yields identical string:
    expect(sindarinRules['3282356701'].mechanic('inngelaidh', { guess: false })).toBe('inngelaidh');
  });

  it('04700 - [ð] vanished before nasals at morpheme boundaries', () => {
    expect(sindarinRules['3841960279'].mechanic('abc')).toBe('abc');
    // Need to test this word: ✶khadmā > chaðw > haðw
    // It could be an exception that requires morphene boundaries again.
    expect(sindarinRules['3841960279'].mechanic('Eleðndor')).toBe('Elendor'); // Becomes Elennor
    expect(sindarinRules['3841960279'].mechanic('heleðmorn')).toBe('helemorn');
    expect(sindarinRules['3841960279'].mechanic('geleðndil')).toBe('gelendil');
    expect(sindarinRules['3841960279'].mechanic('geleðŋdil')).toBe('geleŋdil'); // Non-existent word
    // Shouldn't affect end of words:
    expect(sindarinRules['3841960279'].mechanic('goloð')).toBe('goloð');
  });

  it('04800 - voiced spirants restopped after nasals', () => {
    // There are no examples of this one so far.
    expect(sindarinRules['3123278727'].mechanic('abc')).toBe('abc');
    // None of these exist:
    // -{mnŋ}{vðɣ}-] > [-{mnŋ}{bdg}-
    expect(sindarinRules['3123278727'].mechanic('tamvat')).toBe('tambat');
    expect(sindarinRules['3123278727'].mechanic('tanðat')).toBe('tandat');
    expect(sindarinRules['3123278727'].mechanic('tamðat')).toBe('tamdat'); // This is an unlikely pair, but feasible in compounds.
    expect(sindarinRules['3123278727'].mechanic('tandhat')).toBe('tandat');
    expect(sindarinRules['3123278727'].mechanic('taŋɣat')).toBe('taŋgat');
    // No description, no examples, awaiting feedback on Lambegolmor.
  });

  it('04900 - medial [mf], [nθ], [ŋx], [lθ] became [mm], [nn], [ŋg], [ll]', () => {
    expect(sindarinRules['2996915415'].mechanic('abc')).toBe('abc');
    // [-mf-] > [-mm-]:
    expect(sindarinRules['2996915415'].mechanic('gamfass')).toBe('gammass'); // This is Noldorin
    // [-nθ-] > [-nn-]:
    expect(sindarinRules['2996915415'].mechanic('manthen')).toBe('mannen');
    expect(sindarinRules['2996915415'].mechanic('danθa-')).toBe('danna-');
    // [-ŋx-] > [-ŋg-]:
    expect(sindarinRules['2996915415'].mechanic('daŋxen')).toBe('daŋgen');
    // [-lθ-] > [-ll-]:
    expect(sindarinRules['2996915415'].mechanic('malθorn')).toBe('mallorn');
  });

  it('05000 - voiceless nasals were voiced', () => {
    expect(sindarinRules['725943271'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['725943271'].mechanic('n̥aeð')).toBe('naeð');
    expect(sindarinRules['725943271'].mechanic('m̥alð')).toBe('malð'); // Noldorin
  });

  it('05100 - long vowels shortened before clusters', () => {
    expect(sindarinRules['2083930569'].mechanic('xyz')).toBe('xyz');
    // Exceptions:
    expect(sindarinRules['2083930569'].mechanic('círdan')).toBe('círdan');
    expect(sindarinRules['2083930569'].mechanic('dírhael')).toBe('dírhael');
    expect(sindarinRules['2083930569'].mechanic('íðra')).toBe('íðra');
    expect(sindarinRules['2083930569'].mechanic('mírdain')).toBe('mírdain');
    expect(sindarinRules['2083930569'].mechanic('nírnaeth')).toBe('nírnaeth');
    // Regular cases:
    expect(sindarinRules['2083930569'].mechanic('hīθlūm')).toBe('hiθlūm');
    expect(sindarinRules['2083930569'].mechanic('roxīrrim')).toBe('roxirrim');
    expect(sindarinRules['2083930569'].mechanic('gūrgov')).toBe('gurgov');
    expect(sindarinRules['2083930569'].mechanic('ȳlm')).toBe('ylm');
  });

  it('05200 - [ī], [ū] often shortened in polysyllables', () => {
    expect(sindarinRules['302560565'].mechanic('abc')).toBe('abc');
    // Final syllable shortening:
    expect(sindarinRules['302560565'].mechanic('ithīl')).toBe('ithil');
    expect(sindarinRules['302560565'].mechanic('pelīn')).toBe('pelin');
    expect(sindarinRules['302560565'].mechanic('gwanūr')).toBe('gwanur');
    // Regular examples:
    expect(sindarinRules['302560565'].mechanic('alfirīn')).toBe('alfirin');
    expect(sindarinRules['302560565'].mechanic('firīn')).toBe('firin');
    expect(sindarinRules['302560565'].mechanic('onūr')).toBe('onur');
    // Stressed syllables without shortening:
    // expect(sindarinRules['302560565'].mechanic('inīðen')).toBe('iniðen');
    // expect(sindarinRules['302560565'].mechanic('rīθant')).toBe('riθant');
    // expect(sindarinRules['302560565'].mechanic('nīniel')).toBe('niniel');
    // expect(sindarinRules['302560565'].mechanic('mūda-')).toBe('muda-'); // Noldorin

    // No shortening:
    expect(sindarinRules['302560565'].mechanic('dínen')).toBe('dínen');
    expect(sindarinRules['302560565'].mechanic('rhúnen')).toBe('rhúnen');
    expect(sindarinRules['302560565'].mechanic('túrin')).toBe('túrin');
    // Exceptions:
    // (These are unclear how they came to be.)
    expect(sindarinRules['302560565'].mechanic('curunír')).toBe('curunír');
    expect(sindarinRules['302560565'].mechanic('elurín')).toBe('elurín');
    expect(sindarinRules['302560565'].mechanic('glanhír')).toBe('glanhír');
    expect(sindarinRules['302560565'].mechanic('nauglamír')).toBe('nauglamír');
    expect(sindarinRules['302560565'].mechanic('aranrúth')).toBe('aranrúth');
  });

  it('05300 - [awa] sometimes became [au]', () => {
    expect(sindarinRules['671129175'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['671129175'].mechanic('glawar')).toBe('glaur');
    expect(sindarinRules['671129175'].mechanic('awadhel')).toBe('audhel');
    expect(sindarinRules['671129175'].mechanic('cawathon')).toBe('cauthon'); // Marked with a ? by JRRT
    
    // Presumed stress on the "aw" (all words above have stress on "aw"):
    // expect(sindarinRules['671129175'].mechanic('awarth')).toBe('awarth');
    // expect(sindarinRules['671129175'].mechanic('gawad')).toBe('gawad');
  });

  it('05400 - [au], [ae] became [o], [e] in polysyllables', () => {
    expect(sindarinRules['567222053'].mechanic('abc')).toBe('abc');
    // Regular examples:
    expect(sindarinRules['567222053'].mechanic('aegnaur')).toBe('aegnor');
    expect(sindarinRules['567222053'].mechanic('arθaur')).toBe('arθor');
    expect(sindarinRules['567222053'].mechanic('elau')).toBe('elo');
    expect(sindarinRules['567222053'].mechanic('findraud')).toBe('findrod');
    expect(sindarinRules['567222053'].mechanic('magalaur')).toBe('magalor');
    expect(sindarinRules['567222053'].mechanic('r̥auvan')).toBe('r̥ovan');
    expect(sindarinRules['567222053'].mechanic('θauniel')).toBe('θoniel');

    // Exceptions:
    expect(sindarinRules['567222053'].mechanic('Bauglir')).toBe('Bauglir');
    expect(sindarinRules['567222053'].mechanic('Naugrim')).toBe('Naugrim');
    expect(sindarinRules['567222053'].mechanic('Rhudaur')).toBe('Rhudaur');

    // Long o:
    expect(sindarinRules['567222053'].mechanic('Glauredhel')).toBe('Glóredhel');
    expect(sindarinRules['567222053'].mechanic('Rathlauriel')).toBe('Rathlóriel');

    // Ae to e:
    expect(sindarinRules['567222053'].mechanic('nifraed')).toBe('nifred');
    expect(sindarinRules['567222053'].mechanic('naegro')).toBe('negro');
    expect(sindarinRules['567222053'].mechanic('athaelas')).toBe('athelas');
  });

  it('05500 - [lð] became [ll]', () => {
    expect(sindarinRules['226282629'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['226282629'].mechanic('elð')).toBe('ell');
    expect(sindarinRules['226282629'].mechanic('eldh')).toBe('ell');
    expect(sindarinRules['226282629'].mechanic('kolð')).toBe('koll');
    expect(sindarinRules['226282629'].mechanic('melðond')).toBe('mellond');
    expect(sindarinRules['226282629'].mechanic('meldhond')).toBe('mellond');
    expect(sindarinRules['226282629'].mechanic('tindūmielð')).toBe('tindūmiell');
  });

  it('05600 - [nl] became [ll]', () => {
    expect(sindarinRules['2759811879'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2759811879'].mechanic('mithrenlass')).toBe('mithrellass');
    expect(sindarinRules['2759811879'].mechanic('Finenlach')).toBe('Finellach');
    expect(sindarinRules['2759811879'].mechanic('caranluin')).toBe('caralluin');
    expect(sindarinRules['2759811879'].mechanic('minlamad')).toBe('minlamad');
    expect(sindarinRules['2759811879'].mechanic('Gonlin')).toBe('Gonlin');
    expect(sindarinRules['2759811879'].mechanic('Mindonluin')).toBe('Mindolluin');
  });

  it('05700 - [mb|nd] became [mm|nn]', () => {
    expect(sindarinRules['868023175'].mechanic('abc')).toBe('abc');
    // mb > mm:
    expect(sindarinRules['868023175'].mechanic('ambar')).toBe('ammar');
    expect(sindarinRules['868023175'].mechanic('ambarθ')).toBe('ammarθ');
    expect(sindarinRules['868023175'].mechanic('dymb')).toBe('dymm');
    expect(sindarinRules['868023175'].mechanic('galaðremben')).toBe('galaðremmen');
    expect(sindarinRules['868023175'].mechanic('l̥imb')).toBe('l̥imm');
    // Medial nd > nn:
    expect(sindarinRules['868023175'].mechanic('edlandor')).toBe('edlannor');
    expect(sindarinRules['868023175'].mechanic('gelendil')).toBe('gelennil');
    expect(sindarinRules['868023175'].mechanic('pelendor')).toBe('pelennor');
    expect(sindarinRules['868023175'].mechanic('roxand')).toBe('roxann');
    // Odd cases:
    // Need to ask about this one:
    // expect(sindarinRules['868023175'].mechanic('andond')).toBe('andonn');
    // These seem to be general examples of nn in late Sindarin (all monosyllables):
    // expect(sindarinRules['868023175'].mechanic('grond')).toBe('gronn');
    // expect(sindarinRules['868023175'].mechanic('θind')).toBe('θinn');
    // Exceptions:
    expect(sindarinRules['868023175'].mechanic('thond')).toBe('thond');
    expect(sindarinRules['868023175'].mechanic('Andros')).toBe('Andros');
    expect(sindarinRules['868023175'].mechanic('nand')).toBe('nand');
    expect(sindarinRules['868023175'].mechanic('band')).toBe('band');
    expect(sindarinRules['868023175'].mechanic('gond')).toBe('gond');
    expect(sindarinRules['868023175'].mechanic('gwend')).toBe('gwend');
    expect(sindarinRules['868023175'].mechanic('lond')).toBe('lond');
    expect(sindarinRules['868023175'].mechanic('rond')).toBe('rond');
    // Ask about the case of elmbereth!
  });

  it('05800 - middle consonants frequently vanished in clusters', () => {
    // This rule is a placeholder and all tests experimental.
    expect(sindarinRules['3868328117'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3868328117'].mechanic('elmbereth')).toBe('elbereth');
    expect(sindarinRules['3868328117'].mechanic('findrod')).toBe('finrod');
    expect(sindarinRules['3868328117'].mechanic('gondndor')).toBe('gondor');
    // expect(sindarinRules['3868328117'].mechanic('lennmbas')).toBe('lenbas');
    expect(sindarinRules['3868328117'].mechanic('milmbar')).toBe('milbar');
    expect(sindarinRules['3868328117'].mechanic('morŋgoθ')).toBe('morgoθ');
    // expect(sindarinRules['3868328117'].mechanic('tenngyll')).toBe('tengyll');
  });

  it('05900 - medial [s] became [θ] before [l], [r]', () => {
    expect(sindarinRules['3736793827'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3736793827'].mechanic('kasrae')).toBe('kathrae');
    expect(sindarinRules['3736793827'].mechanic('oslond')).toBe('othlond');
    expect(sindarinRules['3736793827'].mechanic('casrae')).toBe('cathrae'); // cas-raya
    // Doesn't match initial and final clusters:
    expect(sindarinRules['3736793827'].mechanic('asl')).toBe('asl');
    expect(sindarinRules['3736793827'].mechanic('sra')).toBe('sra');
  });

  it('06000 - [wo] became [o]', () => {
    expect(sindarinRules['586391091'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['586391091'].mechanic('gwo-')).toBe('go-');
    expect(sindarinRules['586391091'].mechanic('gwolass')).toBe('golass');
    expect(sindarinRules['586391091'].mechanic('gwovannen')).toBe('govannen');
  });

  it('06100 - [n] assimilated to following labial', () => {
    expect(sindarinRules['1126284559'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['1126284559'].mechanic('lenbas')).toBe('lembas');
    expect(sindarinRules['1126284559'].mechanic('danmen-')).toBe('dammen-');
  });

  it('06200 - [œ] became [e]', () => {
    expect(sindarinRules['1838610927'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['1838610927'].mechanic('œgyl')).toBe('egyl');
    expect(sindarinRules['1838610927'].mechanic('œnnin')).toBe('ennin');
    expect(sindarinRules['1838610927'].mechanic('gœlyð')).toBe('gelyð');
    expect(sindarinRules['1838610927'].mechanic('gœria-')).toBe('geria-');
    expect(sindarinRules['1838610927'].mechanic('θœly')).toBe('θely');
  });

  it('06300 - final [ll], [nn], [ss] shortened in polysyllables', () => {
    expect(sindarinRules['1742178057'].mechanic('abc')).toBe('abc');
    // -SSll > -SSl:
    expect(sindarinRules['1742178057'].mechanic('galadriell')).toBe('galadriel');
    expect(sindarinRules['1742178057'].mechanic('tengyll', { yAsVowel: true })).toBe('tengyl'); // Monosyllable!?
    expect(sindarinRules['1742178057'].mechanic('terxill')).toBe('terxil');
    expect(sindarinRules['1742178057'].mechanic('tinnūmiell')).toBe('tinnūmiel');
    // -SSnn > -SSn:
    expect(sindarinRules['1742178057'].mechanic('annonn')).toBe('annon');
    expect(sindarinRules['1742178057'].mechanic('glewellinn')).toBe('glewellin');
    expect(sindarinRules['1742178057'].mechanic('mellonn')).toBe('mellon');
    // -SSss > -SSs:
    expect(sindarinRules['1742178057'].mechanic('avrass')).toBe('avras');
    expect(sindarinRules['1742178057'].mechanic('falass')).toBe('falas');
    expect(sindarinRules['1742178057'].mechanic('karaðrass')).toBe('karadhras');
    expect(sindarinRules['1742178057'].mechanic('karaðraſ')).toBe('karaðras');
    // Monosyllables are not affected:
    expect(sindarinRules['1742178057'].mechanic('lass')).toBe('lass');
    expect(sindarinRules['1742178057'].mechanic('noss')).toBe('noss');
    expect(sindarinRules['1742178057'].mechanic('ball')).toBe('ball'); // Non-existent word
    expect(sindarinRules['1742178057'].mechanic('bann')).toBe('bann'); // Non-existent word
    // Medial clusters are not affected:
    expect(sindarinRules['1742178057'].mechanic('uimallen')).toBe('uimallen');
    expect(sindarinRules['1742178057'].mechanic('lissuin')).toBe('lissuin');
    expect(sindarinRules['1742178057'].mechanic('ninniach')).toBe('ninniach');
  });

  it('06400 - final and initial [ŋg] became [ŋ]', () => {
    expect(sindarinRules['311523279'].mechanic('abc')).toBe('abc');
    // Initial:
    expect(sindarinRules['311523279'].mechanic('ŋguruthos')).toBe('ŋuruthos');
    // Final:
    expect(sindarinRules['311523279'].mechanic('aŋg')).toBe('aŋ');
    expect(sindarinRules['311523279'].mechanic('laŋg')).toBe('laŋ');
    expect(sindarinRules['311523279'].mechanic('riŋg')).toBe('riŋ');
    // Ignore medial:
    expect(sindarinRules['311523279'].mechanic('baŋgab')).toBe('baŋgab'); // Non-existent word
    expect(sindarinRules['311523279'].mechanic('baŋgabaŋg')).toBe('baŋgabaŋ'); // Non-existent word
  });

  it('06500 - [Vm|{lr}m|m{mbp}] > [Vv|{lr}v|m{mbp}]', () => {
    expect(sindarinRules['1951379117'].mechanic('abc')).toBe('abc');
    // [Vm] > [Vv]:
    expect(sindarinRules['1951379117'].mechanic('araum')).toBe('arauv');
    expect(sindarinRules['1951379117'].mechanic('dūm')).toBe('dūv');
    expect(sindarinRules['1951379117'].mechanic('helemorn')).toBe('helevorn');
    expect(sindarinRules['1951379117'].mechanic('hiθlūm')).toBe('hiθlūv');
    expect(sindarinRules['1951379117'].mechanic('laman')).toBe('lavan');
    expect(sindarinRules['1951379117'].mechanic('tinnūmiel')).toBe('tinnūviel');
    // [lm] > [lv]:
    expect(sindarinRules['1951379117'].mechanic('nindalm')).toBe('nindalv');
    expect(sindarinRules['1951379117'].mechanic('talm')).toBe('talv');
    expect(sindarinRules['1951379117'].mechanic('ylm')).toBe('ylv');
    // [rm] > [rv]:
    expect(sindarinRules['1951379117'].mechanic('barm')).toBe('barv'); // Non-existent word
    // [ðm] > [ðv]:
    expect(sindarinRules['1951379117'].mechanic('haðm')).toBe('haðv');
    expect(sindarinRules['1951379117'].mechanic('haðma-')).toBe('haðva-');
    // [mm] > [mm]:
    expect(sindarinRules['1951379117'].mechanic('domm')).toBe('domm');
    expect(sindarinRules['1951379117'].mechanic('galaðremmen')).toBe('galaðremmen');
    expect(sindarinRules['1951379117'].mechanic('nimm')).toBe('nimm');
    expect(sindarinRules['1951379117'].mechanic('tumm')).toBe('tumm');
    // [mb] > [mb]:
    expect(sindarinRules['1951379117'].mechanic('ambō')).toBe('ambō'); // Not on Eldamo's examples
    // [mp] > [mp]:
    expect(sindarinRules['1951379117'].mechanic('gamp')).toBe('gamp');
    expect(sindarinRules['1951379117'].mechanic('nimp')).toBe('nimp');
  });

  it('06600 - [ðv] became [ðw]', () => {
    expect(sindarinRules['2192660503'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['2192660503'].mechanic('buðv')).toBe('buðw');
    expect(sindarinRules['2192660503'].mechanic('haðv')).toBe('haðw');
    expect(sindarinRules['2192660503'].mechanic('haðva-')).toBe('haðwa-');
  });

  it('06700 - [mm] shortened', () => {
    expect(sindarinRules['3689144303'].mechanic('abc')).toBe('abc');
    expect(sindarinRules['3689144303'].mechanic('ammar')).toBe('amar');
    expect(sindarinRules['3689144303'].mechanic('ammarθ')).toBe('amarθ');
    expect(sindarinRules['3689144303'].mechanic('eglammar')).toBe('eglamar');
    expect(sindarinRules['3689144303'].mechanic('galaðremmen')).toBe('galaðremen');
    expect(sindarinRules['3689144303'].mechanic('kamm')).toBe('kam');
    expect(sindarinRules['3689144303'].mechanic('l̥imm')).toBe('l̥im');
    expect(sindarinRules['3689144303'].mechanic('remmen')).toBe('remen');
    expect(sindarinRules['3689144303'].mechanic('tumm')).toBe('tum');
  });
});