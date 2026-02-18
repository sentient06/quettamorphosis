import { describe, it, expect } from "vitest";
import { SyllableAnalyser, breakIntoVowelsAndConsonants, findFirstOf, syllabify } from "../src/utils.js";

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

