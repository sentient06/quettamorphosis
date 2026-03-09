import { describe, it, expect } from "vitest";
import { sindarinRules } from "../src/sindarin.js";
import { getSandhiRuleId } from "../src/sandhi.js";

describe('Sandhi rules (05800)', () => {
  it('Rule 116: h was deleted before a following consonant', () => {
    expect(sindarinRules[getSandhiRuleId(116)].mechanic('barahnaur').out).toBe('baranaur');
  });

  it('Rule 117: nθ, mɸ, ŋx became nt, mp, ŋk at the end of a morpheme or word', () => {
    expect(sindarinRules[getSandhiRuleId(117)].mechanic('kanθ').out).toBe('kant');
    expect(sindarinRules[getSandhiRuleId(117)].mechanic('limɸ').out).toBe('limp');
    expect(sindarinRules[getSandhiRuleId(117)].mechanic('xamɸ').out).toBe('xamp');
    expect(sindarinRules[getSandhiRuleId(117)].mechanic('raŋx').out).toBe('raŋk');
    expect(sindarinRules[getSandhiRuleId(117)].mechanic('panθhail').out).toBe('panthail');
    expect(sindarinRules[getSandhiRuleId(117)].mechanic('aŋxalagaun').out).toBe('aŋkalagaun');
    expect(sindarinRules[getSandhiRuleId(117)].mechanic('nimɸrass').out).toBe('nimprass');
  });

  it('Rule 118: medial nθ, mɸ, ŋx became nn, mm, ŋŋ', () => {
    expect(sindarinRules[getSandhiRuleId(118)].mechanic('penθaſ').out).toBe('pennaſ');
    expect(sindarinRules[getSandhiRuleId(118)].mechanic('daŋxen').out).toBe('daŋŋen');
    expect(sindarinRules[getSandhiRuleId(118)].mechanic('reŋxj').out).toBe('reŋj');
    expect(sindarinRules[getSandhiRuleId(118)].mechanic('limɸida-').out).toBe('limmida-');
  });

  it('Rule 119: ð was deleted before nasals', () => {
    expect(sindarinRules[getSandhiRuleId(119)].mechanic('eleðndor').out).toBe('elendor');
    expect(sindarinRules[getSandhiRuleId(119)].mechanic('heleðmorn').out).toBe('helemorn');
    expect(sindarinRules[getSandhiRuleId(119)].mechanic('goloðmīr').out).toBe('golomīr');
  });

  it('Rule 120: long voiceless liquids became short and voiced after any consonant or vowel', () => {
    expect(sindarinRules[getSandhiRuleId(120)].mechanic('limmꝉꝉūg').out).toBe('limmlūg');
    expect(sindarinRules[getSandhiRuleId(120)].mechanic('ammꞧꞧūn').out).toBe('ammrūn');
    expect(sindarinRules[getSandhiRuleId(120)].mechanic('anꞧꞧīw').out).toBe('anrīw');
    expect(sindarinRules[getSandhiRuleId(120)].mechanic('enꞧꞧūn').out).toBe('enrūn');
    expect(sindarinRules[getSandhiRuleId(120)].mechanic('iꞧꞧūn').out).toBe('irūn');
  });

  it('Rule 121: n, short or long, assimilated to following stop, fricative, or nasal', () => {
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('kelebrinbaur').out).toBe('kelebrimbaur');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('briθaunmbar').out).toBe('briθaummbar');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('annūnminaſ').out).toBe('annūmminaſ');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('nīnɣlaur').out).toBe('nīŋɣlaur');
    // expect(sindarinRules[getSandhiRuleId(121)].mechanic('θoronŋil').out).toBe('θoroŋŋīl');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('arngīr').out).toBe('arŋgīr');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('arnɣonaθ').out).toBe('arŋɣonaθ');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('mornben').out).toBe('mormben');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('mornmegil').out).toBe('mormmegil');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('θinngoll').out).toBe('θiŋŋgoll');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('lennmbaſ').out).toBe('lemmmbaſ');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('enmbar').out).toBe('emmbar');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('enɣlad').out).toBe('eŋɣlad');
    expect(sindarinRules[getSandhiRuleId(121)].mechanic('aunmenel').out).toBe('aummenel');
  });

  it('Rule 122: ɣ disappeared between consonants', () => {
    expect(sindarinRules[getSandhiRuleId(122)].mechanic('kelebɣrond').out).toBe('kelebrond');
    expect(sindarinRules[getSandhiRuleId(122)].mechanic('maigɣlīn').out).toBe('maiglīn');
    expect(sindarinRules[getSandhiRuleId(122)].mechanic('menegɣroθ').out).toBe('menegroθ');
    expect(sindarinRules[getSandhiRuleId(122)].mechanic('raθɣlauriel').out).toBe('raθlauriel');
    expect(sindarinRules[getSandhiRuleId(122)].mechanic('galaðɣlauriel').out).toBe('galaðlauriel');
    expect(sindarinRules[getSandhiRuleId(122)].mechanic('nauβɣrod').out).toBe('nauβrod');
    expect(sindarinRules[getSandhiRuleId(122)].mechanic('dūmɣwaθ').out).toBe('dūmwaθ');
    expect(sindarinRules[getSandhiRuleId(122)].mechanic('tarɣlaŋk').out).toBe('tarlaŋk');
  });

  it('Rule 123: ð became d before voiced stops', () => {
    expect(sindarinRules[getSandhiRuleId(123)].mechanic('arðgalen').out).toBe('ardgalen');
  });

  it('Rule 124: ð became d before l', () => {
    expect(sindarinRules[getSandhiRuleId(124)].mechanic('galaðlauriel').out).toBe('galadlauriel');
  });

  it('Rule 125: ð became d at the beginning of morpheme boundaries after consonants', () => {
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('karagðūr', { morphemes: ['karag', 'ðūr'] }))
      .toMatchObject({ out: 'karagdūr', morphemes: ['karag', 'dūr'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('annðuin', { morphemes: ['ann', 'ðuin'] }))
      .toMatchObject({ out: 'annduin', morphemes: ['ann', 'duin'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('baranðuin', { morphemes: ['baran', 'ðuin'] }))
      .toMatchObject({ out: 'baranduin', morphemes: ['baran', 'duin'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('glammðriŋg', { morphemes: ['glamm', 'ðriŋg'] }))
      .toMatchObject({ out: 'glammdriŋg', morphemes: ['glamm', 'driŋg'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('gasðil', { morphemes: ['gas', 'ðil'] }))
      .toMatchObject({ out: 'gasdil', morphemes: ['gas', 'dil'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('gūlðūr', { morphemes: ['gūl', 'ðūr'] }))
      .toMatchObject({ out: 'gūldūr', morphemes: ['gūl', 'dūr'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('mallðuin', { morphemes: ['mall', 'ðuin'] }))
      .toMatchObject({ out: 'mallduin', morphemes: ['mall', 'duin'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('nelðorn', { morphemes: ['nel', 'ðorn'] }))
      .toMatchObject({ out: 'neldorn', morphemes: ['nel', 'dorn'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('enðant', { morphemes: ['en', 'ðant'] }))
      .toMatchObject({ out: 'endant', morphemes: ['en', 'dant'] });
    expect(sindarinRules[getSandhiRuleId(125)].mechanic('fanuiðol', { morphemes: ['fanui', 'ðol'] }))
      .toMatchObject({ out: 'fanuiðol', morphemes: ['fanui', 'ðol'] });
  });

  it('Rule 126: w disappeared after a vowel at the end of a morpheme before a consonant', () => {
    expect(sindarinRules[getSandhiRuleId(126)].mechanic('gwaiwhīr', { morphemes: ['gwaiw', 'hīr'] }))
      .toMatchObject({ out: 'gwaihīr', morphemes: ['gwai', 'hīr'] });
    expect(sindarinRules[getSandhiRuleId(126)].mechanic('gwaiwraun', { morphemes: ['gwaiw', 'raun'] }))
      .toMatchObject({ out: 'gwairaun', morphemes: ['gwai', 'raun'] });
  });

  it('Rule 127: m became ɱ after a vowel, semivowel or liquid', () => {
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('daum').out).toBe('dauɱ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('kaim').out).toBe('kaiɱ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('tuim').out).toBe('tuiɱ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('rīm').out).toBe('rīɱ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('dūm').out).toBe('dūɱ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('ɸalm').out).toBe('ɸalɱ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('jlm').out).toBe('jlɱ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('parm').out).toBe('parɱ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('helemorn').out).toBe('heleɱorn');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('ɸormen').out).toBe('ɸorɱen');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('galmorn').out).toBe('galɱorn');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('mallmegil').out).toBe('mallɱegil');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('dūmwaθ').out).toBe('dūɱwaθ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('lemn').out).toBe('leɱn');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('udumn').out).toBe('uduɱn');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('gwelwmen').out).toBe('gwelwɱen');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('imedui').out).toBe('iɱedui');
    // Same:
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('raθmallen').out).toBe('raθmallen');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('annūmminaſ').out).toBe('annūmminaſ');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('mormmegil').out).toBe('mormmegil');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('remmmīr').out).toBe('remmmīr');
    expect(sindarinRules[getSandhiRuleId(127)].mechanic('gilmiθ').out).toBe('gilmiθ');
  });

  it('Rule 128: n became ð before r', () => {
    expect(sindarinRules[getSandhiRuleId(128)].mechanic('onrond', { morphemes: ['onrond'] }))
      .toMatchObject({ out: 'oðrond', morphemes: ['oðrond'] });
    expect(sindarinRules[getSandhiRuleId(128)].mechanic('onrill', { morphemes: ['onrill'] }))
      .toMatchObject({ out: 'oðrill', morphemes: ['oðrill'] });
    expect(sindarinRules[getSandhiRuleId(128)].mechanic('inr', { morphemes: ['inr'] }))
      .toMatchObject({ out: 'iðr', morphemes: ['iðr'] });
    expect(sindarinRules[getSandhiRuleId(128)].mechanic('īnrind', { morphemes: ['īn', 'rind'] }))
      .toMatchObject({ out: 'īðrind', morphemes: ['īð', 'rind'] });
    expect(sindarinRules[getSandhiRuleId(128)].mechanic('karanrass', { morphemes: ['karan', 'rass'] }))
      .toMatchObject({ out: 'karaðrass', morphemes: ['karað', 'rass'] });
    expect(sindarinRules[getSandhiRuleId(128)].mechanic('inreiss', { morphemes: ['in', 'reiss'] }))
      .toMatchObject({ out: 'iðreiss', morphemes: ['ið', 'reiss'] });
    // No idea how to match this one:
    // expect(sindarinRules[getSandhiRuleId(128)].mechanic('aranrūθ', { morphemes: ['aran', 'rūθ'] }))
      // .toMatchObject({ out: 'aranrūθ', morphemes: ['aran', 'rūθ'] });
  });

  it('Rule 129: a long or double consonant became short when preceding another consonant', () => {
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('ellroxxxīr', { morphemes: ['ellroxx', 'xīr'] }))
      .toMatchObject({ out: 'elroxxīr', morphemes: ['elrox', 'xīr'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('hallbarad', { morphemes: ['hall', 'barad'] }))
      .toMatchObject({ out: 'halbarad', morphemes: ['hal', 'barad'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('mallbeθ', { morphemes: ['mall', 'beθ'] }))
      .toMatchObject({ out: 'malbeθ', morphemes: ['mal', 'beθ'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('mallduin', { morphemes: ['mall', 'duin'] }))
      .toMatchObject({ out: 'malduin', morphemes: ['mal', 'duin'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('mellndīr', { morphemes: ['mell', 'ndīr'] }))
      .toMatchObject({ out: 'melndīr', morphemes: ['mel', 'ndīr'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('orxalldaur', { morphemes: ['orxall', 'daur'] }))
      .toMatchObject({ out: 'orxaldaur', morphemes: ['orxal', 'daur'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('ammdir', { morphemes: ['amm', 'dir'] }))
      .toMatchObject({ out: 'amdir', morphemes: ['am', 'dir'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('drammbaur', { morphemes: ['dramm', 'baur'] }))
      .toMatchObject({ out: 'drambaur', morphemes: ['dram', 'baur'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('glammdriŋ', { morphemes: ['glamm', 'driŋ'] }))
      .toMatchObject({ out: 'glamdriŋ', morphemes: ['glam', 'driŋ'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('glammxoθ', { morphemes: ['glamm', 'xoθ'] }))
      .toMatchObject({ out: 'glamxoθ', morphemes: ['glam', 'xoθ'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('remmmīr', { morphemes: ['remm', 'mīr'] }))
      .toMatchObject({ out: 'remmīr', morphemes: ['rem', 'mīr'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('lammθaŋk', { morphemes: ['lamm', 'θaŋk'] }))
      .toMatchObject({ out: 'lamθaŋk', morphemes: ['lam', 'θaŋk'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('anndeiθ', { morphemes: ['ann', 'deiθ'] }))
      .toMatchObject({ out: 'andeiθ', morphemes: ['an', 'deiθ'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('annduin', { morphemes: ['ann', 'duin'] }))
      .toMatchObject({ out: 'anduin', morphemes: ['an', 'duin'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('annnest', { morphemes: ['ann', 'nest'] }))
      .toMatchObject({ out: 'annest', morphemes: ['an', 'nest'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('annɸalaſ', { morphemes: ['ann', 'ɸalaſ'] }))
      .toMatchObject({ out: 'anɸalas', morphemes: ['an', 'ɸalas'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('gonnndor', { morphemes: ['gonn', 'ndor'] }))
      .toMatchObject({ out: 'gonndor', morphemes: ['gon', 'ndor'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('lemmmbas', { morphemes: ['lemm', 'mbas'] }))
      .toMatchObject({ out: 'lemmbas', morphemes: ['lem', 'mbas'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('linnxir', { morphemes: ['linn', 'xir'] }))
      .toMatchObject({ out: 'linxir', morphemes: ['lin', 'xir'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('aŋŋhabar', { morphemes: ['aŋŋ', 'habar'] }))
      .toMatchObject({ out: 'aŋhabar', morphemes: ['aŋ', 'habar'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('aŋŋmband', { morphemes: ['aŋŋ', 'mband'] }))
      .toMatchObject({ out: 'aŋmband', morphemes: ['aŋ', 'mband'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('θiŋŋgoll', { morphemes: ['θiŋŋ', 'goll'] }))
      .toMatchObject({ out: 'θiŋgol', morphemes: ['θiŋ', 'gol'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('laſbelin', { morphemes: ['laſ', 'belin'] }))
      .toMatchObject({ out: 'lasbelin', morphemes: ['las', 'belin'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('laſgalen', { morphemes: ['laſ', 'galen'] }))
      .toMatchObject({ out: 'lasgalen', morphemes: ['las', 'galen'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('goſθīr', { morphemes: ['goſ', 'θīr'] }))
      .toMatchObject({ out: 'gosθīr', morphemes: ['gos', 'θīr'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('ɸalaſꞧimb', { morphemes: ['ɸalaſ', 'ꞧimb'] }))
      .toMatchObject({ out: 'ɸalasꞧimb', morphemes: ['ɸalas', 'ꞧimb'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('noſꝉīr', { morphemes: ['noſ', 'ꝉīr'] }))
      .toMatchObject({ out: 'nosꝉīr', morphemes: ['nos', 'ꝉīr'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('roxxxīr', { morphemes: ['roxx', 'xīr'] }))
      .toMatchObject({ out: 'roxxīr', morphemes: ['rox', 'xīr'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('emmbar', { morphemes: ['em', 'mbar'] }))
      .toMatchObject({ out: 'embar', morphemes: ['e', 'mbar'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('immbeir', { morphemes: ['im', 'mbeir'] }))
      .toMatchObject({ out: 'imbeir', morphemes: ['i', 'mbeir'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('innrūɣedein', { morphemes: ['in', 'nrūɣedein'] }))
      .toMatchObject({ out: 'inrūɣedein', morphemes: ['i', 'nrūɣedein'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('immreθil', { morphemes: ['im', 'mreθil'] }))
      .toMatchObject({ out: 'imreθil', morphemes: ['i', 'mreθil'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('iŋŋleid', { morphemes: ['iŋ', 'ŋleid'] }))
      .toMatchObject({ out: 'iŋleid', morphemes: ['i', 'ŋleid'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('iŋŋgölyð', { morphemes: ['iŋ', 'ŋgölyð'] }))
      .toMatchObject({ out: 'iŋgölyð', morphemes: ['i', 'ŋgölyð'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('enndor', { morphemes: ['en', 'ndor'] }))
      .toMatchObject({ out: 'endor', morphemes: ['e', 'ndor'] });
    expect(sindarinRules[getSandhiRuleId(129)].mechanic('enmbar', { morphemes: ['en', 'mbar'] }))
      .toMatchObject({ out: 'embar', morphemes: ['e', 'mbar'] });
  });

  it('Rule 130: initial x became h', () => {
    expect(sindarinRules[getSandhiRuleId(130)].mechanic('xarad').out).toBe('harad');
    expect(sindarinRules[getSandhiRuleId(130)].mechanic('xaðaud').out).toBe('haðaud');
    expect(sindarinRules[getSandhiRuleId(130)].mechanic('xꞧaſ').out).toBe('hꞧaſ');
  });

  it('Rule 131: h disappeared before r', () => {
    expect(sindarinRules[getSandhiRuleId(131)].mechanic('hꞧaſ').out).toBe('ꞧaſ');
  });

  it('Rule 132: x became h at the beginning of a morpheme after a consonant, except w and liquids', () => {
    expect(sindarinRules[getSandhiRuleId(132)].mechanic('elɸxīr', { morphemes: ['elɸ', 'xīr'] }))
      .toMatchObject({ out: 'elɸhīr', morphemes: ['elɸ', 'hīr'] });
    expect(sindarinRules[getSandhiRuleId(132)].mechanic('roxxīr', { morphemes: ['rox', 'xīr'] }))
      .toMatchObject({ out: 'roxhīr', morphemes: ['rox', 'hīr'] });
    expect(sindarinRules[getSandhiRuleId(132)].mechanic('glamxoθ', { morphemes: ['glam', 'xoθ'] }))
      .toMatchObject({ out: 'glamhoθ', morphemes: ['glam', 'hoθ'] });
    expect(sindarinRules[getSandhiRuleId(132)].mechanic('duinxīr', { morphemes: ['duin', 'xīr'] }))
      .toMatchObject({ out: 'duinhīr', morphemes: ['duin', 'hīr'] });
    expect(sindarinRules[getSandhiRuleId(132)].mechanic('loſxoθ', { morphemes: ['loſ', 'xoθ'] }))
      .toMatchObject({ out: 'loſhoθ', morphemes: ['loſ', 'hoθ'] });
    expect(sindarinRules[getSandhiRuleId(132)].mechanic('galaðxīr', { morphemes: ['galað', 'xīr'] }))
      .toMatchObject({ out: 'galaðhīr', morphemes: ['galað', 'hīr'] });
  });

  it('Rule 133: voiced stops (b, d, g) became voiceless (p, t, k) before h and θ', () => {
    expect(sindarinRules[getSandhiRuleId(133)].mechanic('kelebharn', { morphemes: ['keleb', 'harn'] }))
      .toMatchObject({ out: 'kelepharn', morphemes: ['kelep', 'harn'] });
    expect(sindarinRules[getSandhiRuleId(133)].mechanic('aigθeliond', { morphemes: ['aig', 'θeliond'] }))
      .toMatchObject({ out: 'aikθeliond', morphemes: ['aik', 'θeliond'] });
    expect(sindarinRules[getSandhiRuleId(133)].mechanic('belegθor', { morphemes: ['beleg', 'θor'] }))
      .toMatchObject({ out: 'belekθor', morphemes: ['belek', 'θor'] });
    expect(sindarinRules[getSandhiRuleId(133)].mechanic('maigheneb', { morphemes: ['maig', 'heneb'] }))
      .toMatchObject({ out: 'maikheneb', morphemes: ['maik', 'heneb'] });
    expect(sindarinRules[getSandhiRuleId(133)].mechanic('araudhīr', { morphemes: ['araud', 'hīr'] }))
      .toMatchObject({ out: 'arauthīr', morphemes: ['araut', 'hīr'] });
  });

  it('Rule 134: voiceless stops (p, t, k) became voiceless fricatives (f, θ, x) preceding h', () => {
    expect(sindarinRules[getSandhiRuleId(134)].mechanic('kelepharn', { morphemes: ['kelep', 'harn'] }))
      .toMatchObject({ out: 'keleɸharn', morphemes: ['keleɸ', 'harn'] });
    expect(sindarinRules[getSandhiRuleId(134)].mechanic('maekheneb', { morphemes: ['maek', 'heneb'] }))
      .toMatchObject({ out: 'maexheneb', morphemes: ['maex', 'heneb'] });
    expect(sindarinRules[getSandhiRuleId(134)].mechanic('arauthir', { morphemes: ['araut', 'hir'] }))
      .toMatchObject({ out: 'arauθhir', morphemes: ['arauθ', 'hir'] });
  });

  it('Rule 135: ð became θ before a voiceless sound', () => {
    expect(sindarinRules[getSandhiRuleId(135)].mechanic('galaðhīr', { morphemes: ['galað', 'hīr'] }))
      .toMatchObject({ out: 'galaθhīr', morphemes: ['galaθ', 'hīr'] });
    expect(sindarinRules[getSandhiRuleId(135)].mechanic('galaðθiliaun', { morphemes: ['galað', 'θiliaun'] }))
      .toMatchObject({ out: 'galaθθiliaun', morphemes: ['galaθ', 'θiliaun'] });
  });

  it('Rule 136: h disappeared after voiceless fricatives', () => {
    expect(sindarinRules[getSandhiRuleId(136)].mechanic('keleɸharn', { morphemes: ['keleɸ', 'harn'] }))
      .toMatchObject({ out: 'keleɸarn', morphemes: ['keleɸ', 'arn'] });
    expect(sindarinRules[getSandhiRuleId(136)].mechanic('maixheneb', { morphemes: ['maix', 'heneb'] }))
      .toMatchObject({ out: 'maixeneb', morphemes: ['maix', 'eneb'] });
    expect(sindarinRules[getSandhiRuleId(136)].mechanic('arauθhīr', { morphemes: ['arauθ', 'hīr'] }))
      .toMatchObject({ out: 'arauθīr', morphemes: ['arauθ', 'īr'] });
    expect(sindarinRules[getSandhiRuleId(136)].mechanic('galaθhīr', { morphemes: ['galaθ', 'hīr'] }))
      .toMatchObject({ out: 'galaθīr', morphemes: ['galaθ', 'īr'] });
    expect(sindarinRules[getSandhiRuleId(136)].mechanic('elɸhīr', { morphemes: ['elɸ', 'hīr'] }))
      .toMatchObject({ out: 'elɸīr', morphemes: ['elɸ', 'īr'] });
    expect(sindarinRules[getSandhiRuleId(136)].mechanic('roxhīr', { morphemes: ['rox', 'hīr'] }))
      .toMatchObject({ out: 'roxīr', morphemes: ['rox', 'īr'] });
    expect(sindarinRules[getSandhiRuleId(136)].mechanic('loſhoθ', { morphemes: ['loſ', 'hoθ'] }))
      .toMatchObject({ out: 'loſoθ', morphemes: ['loſ', 'oθ'] });
    expect(sindarinRules[getSandhiRuleId(136)].mechanic('gwaθhīr', { morphemes: ['gwaθ', 'hīr'] }))
      .toMatchObject({ out: 'gwaθīr', morphemes: ['gwaθ', 'īr'] });
  });

  it('Rule 137: p disappeared between m and another consonant', () => {
    expect(sindarinRules[getSandhiRuleId(137)].mechanic('nimpdill', { morphemes: ['nimp', 'dill'] }))
      .toMatchObject({ out: 'nimdill', morphemes: ['nim', 'dill'] });
    expect(sindarinRules[getSandhiRuleId(137)].mechanic('nimpβreθil', { morphemes: ['nimp', 'βreθil'] }))
      .toMatchObject({ out: 'nimβreθil', morphemes: ['nim', 'βreθil'] });
    expect(sindarinRules[getSandhiRuleId(137)].mechanic('nimploθθ', { morphemes: ['nimp', 'loθθ'] }))
      .toMatchObject({ out: 'nimloθθ', morphemes: ['nim', 'loθθ'] });
    expect(sindarinRules[getSandhiRuleId(137)].mechanic('nimpraſ', { morphemes: ['nimp', 'raſ'] }))
      .toMatchObject({ out: 'nimraſ', morphemes: ['nim', 'raſ'] });
  });

  it('Rule 138: ɣ became g after nasals', () => {
    expect(sindarinRules[getSandhiRuleId(138)].mechanic('nīŋɣlaur', { morphemes: ['nīŋ', 'ɣlaur'] }))
      .toMatchObject({ out: 'nīŋglaur', morphemes: ['nīŋ', 'glaur'] });
    expect(sindarinRules[getSandhiRuleId(138)].mechanic('arŋɣonaθ', { morphemes: ['arŋ', 'ɣonaθ'] }))
      .toMatchObject({ out: 'arŋgonaθ', morphemes: ['arŋ', 'gonaθ'] });
    expect(sindarinRules[getSandhiRuleId(138)].mechanic('daŋɣweθ', { morphemes: ['daŋ', 'ɣweθ'] }))
      .toMatchObject({ out: 'daŋgweθ', morphemes: ['daŋ', 'gweθ'] });
    expect(sindarinRules[getSandhiRuleId(138)].mechanic('θūriŋɣweθil', { morphemes: ['θūriŋ', 'ɣweθil'] }))
      .toMatchObject({ out: 'θūriŋgweθil', morphemes: ['θūriŋ', 'gweθil'] });
    expect(sindarinRules[getSandhiRuleId(138)].mechanic('eŋɣlad', { morphemes: ['eŋ', 'ɣlad'] }))
      .toMatchObject({ out: 'eŋglad', morphemes: ['eŋ', 'glad'] });
  });

  it('Rule 139: β became b after consonants except r', () => {
    expect(sindarinRules[getSandhiRuleId(139)].mechanic('halβarad', { morphemes: ['hal', 'βarad'] }))
      .toMatchObject({ out: 'halbarad', morphemes: ['hal', 'barad'] });
    expect(sindarinRules[getSandhiRuleId(139)].mechanic('nimβreθil', { morphemes: ['nim', 'βreθil'] }))
      .toMatchObject({ out: 'nimbreθil', morphemes: ['nim', 'breθil'] });
    expect(sindarinRules[getSandhiRuleId(139)].mechanic('herβenn', { morphemes: ['her', 'βenn'] }))
      .toMatchObject({ out: 'herβenn', morphemes: ['her', 'βenn'] });
    expect(sindarinRules[getSandhiRuleId(139)].mechanic('arβeleg', { morphemes: ['ar', 'βeleg'] }))
      .toMatchObject({ out: 'arβeleg', morphemes: ['ar', 'βeleg'] });
  });

  it('Rule 140: nasals disappeared between a nasal or liquid and a voiced consonants, except semivowels', () => {
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('arŋgīr', { morphemes: ['arŋ', 'gīr'] }))
      .toMatchObject({ out: 'argīr', morphemes: ['ar', 'gīr'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('arŋgonaθ', { morphemes: ['arŋ', 'gonaθ'] }))
      .toMatchObject({ out: 'argonaθ', morphemes: ['ar', 'gonaθ'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('mormben', { morphemes: ['morm', 'ben'] }))
      .toMatchObject({ out: 'morben', morphemes: ['mor', 'ben'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('mormmegil', { morphemes: ['morm', 'megil'] }))
      .toMatchObject({ out: 'mormegil', morphemes: ['mor', 'megil'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('karnnen', { morphemes: ['karn', 'nen'] }))
      .toMatchObject({ out: 'karnen', morphemes: ['kar', 'nen'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('elmbereθ', { morphemes: ['el', 'mbereθ'] }))
      .toMatchObject({ out: 'elbereθ', morphemes: ['el', 'bereθ'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('mornndor', { morphemes: ['morn', 'ndor'] }))
      .toMatchObject({ out: 'mordor', morphemes: ['mor', 'dor'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('briθaummbar', { morphemes: ['briθaum', 'mbar'] }))
      .toMatchObject({ out: 'briθaumbar', morphemes: ['briθau', 'mbar'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('θorondīr', { morphemes: ['θoron', 'dīr'] }))
      .toMatchObject({ out: 'θorondīr', morphemes: ['θoron', 'dīr'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('linndīr', { morphemes: ['lin', 'ndīr'] }))
      .toMatchObject({ out: 'lindīr', morphemes: ['li', 'ndīr'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('herndīr', { morphemes: ['her', 'ndīr'] }))
      .toMatchObject({ out: 'herdīr', morphemes: ['her', 'dīr'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('gilndīss', { morphemes: ['gil', 'ndīss'] }))
      .toMatchObject({ out: 'gildīss', morphemes: ['gil', 'dīss'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('lemmbass', { morphemes: ['lem', 'mbass'] }))
      .toMatchObject({ out: 'lembass', morphemes: ['le', 'mbass'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('aŋmband', { morphemes: ['aŋ', 'mband'] }))
      .toMatchObject({ out: 'aŋband', morphemes: ['aŋ', 'band'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('mōrŋgoθ', { morphemes: ['mōr', 'ŋgoθ'] }))
      .toMatchObject({ out: 'mōrgoθ', morphemes: ['mōr', 'goθ'] });

    // Unchanged:
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('dornhoθ', { morphemes: ['dorn', 'hoθ'] }))
      .toMatchObject({ out: 'dornhoθ', morphemes: ['dorn', 'hoθ'] });
    expect(sindarinRules[getSandhiRuleId(140)].mechanic('ɸornwobel', { morphemes: ['ɸorn', 'wobel'] }))
      .toMatchObject({ out: 'ɸornwobel', morphemes: ['ɸorn', 'wobel'] });
  });

  it('Rule 141: nasals were lost between two stops of the same place of articulation', () => {
    expect(sindarinRules[getSandhiRuleId(141)].mechanic('ɸeredndīr', { morphemes: ['ɸered', 'ndīr'] }))
      .toMatchObject({ out: 'ɸereddīr', morphemes: ['ɸered', 'dīr'] });
    expect(sindarinRules[getSandhiRuleId(141)].mechanic('belegŋgurθ', { morphemes: ['beleg', 'ŋgurθ'] }))
      .toMatchObject({ out: 'beleggurθ', morphemes: ['beleg', 'gurθ'] });
  });

  it('Rule 142: nd and mb became the nasals n and m after nasals following nonliquids', () => {
    expect(sindarinRules[getSandhiRuleId(142)].mechanic('lemnndīr', { morphemes: ['lemn', 'ndīr'] }))
      .toMatchObject({ out: 'lemnnīr', morphemes: ['lemn', 'nīr'] });
  });

  it('Rule 143: st simplifies to s before a consonant', () => {
    expect(sindarinRules[getSandhiRuleId(143)].mechanic('bastgorn', { morphemes: ['bast', 'gorn'] }))
      .toMatchObject({ out: 'basgorn', morphemes: ['bas', 'gorn'] });
    expect(sindarinRules[getSandhiRuleId(143)].mechanic('ostgiliaθ', { morphemes: ['ost', 'giliaθ'] }))
      .toMatchObject({ out: 'osgiliaθ', morphemes: ['os', 'giliaθ'] });
    expect(sindarinRules[getSandhiRuleId(143)].mechanic('ostɸorod', { morphemes: ['ost', 'ɸorod'] }))
      .toMatchObject({ out: 'osɸorod', morphemes: ['os', 'ɸorod'] });
  });

  it('Rule 144: s became θ before liquids l and r', () => {
    expect(sindarinRules[getSandhiRuleId(144)].mechanic('ɸalasꞧimb', { morphemes: ['ɸalas', 'ꞧimb'] }))
      .toMatchObject({ out: 'ɸalaθꞧimb', morphemes: ['ɸalaθ', 'ꞧimb'] });
    expect(sindarinRules[getSandhiRuleId(144)].mechanic('nosꝉir', { morphemes: ['nos', 'ꝉir'] }))
      .toMatchObject({ out: 'noθꝉir', morphemes: ['noθ', 'ꝉir'] });
    expect(sindarinRules[getSandhiRuleId(144)].mechanic('osꞧond', { morphemes: ['os', 'ꞧond'] }))
      .toMatchObject({ out: 'oθꞧond', morphemes: ['oθ', 'ꞧond'] });
    expect(sindarinRules[getSandhiRuleId(144)].mechanic('losꝉand', { morphemes: ['los', 'ꝉand'] }))
      .toMatchObject({ out: 'loθꝉand', morphemes: ['loθ', 'ꝉand'] });
    expect(sindarinRules[getSandhiRuleId(144)].mechanic('ɸalasꞧen', { morphemes: ['ɸalas', 'ꞧen'] }))
      .toMatchObject({ out: 'ɸalaθꞧen', morphemes: ['ɸalaθ', 'ꞧen'] });
    expect(sindarinRules[getSandhiRuleId(144)].mechanic('lasꞧa', { morphemes: ['las', 'ꞧa'] }))
      .toMatchObject({ out: 'laθꞧa', morphemes: ['laθ', 'ꞧa'] });
  });

  it('Rule 145: θ became t after s', () => {
    expect(sindarinRules[getSandhiRuleId(145)].mechanic('gosθīr', { morphemes: ['gos', 'θīr'] }))
      .toMatchObject({ out: 'gostīr', morphemes: ['gos', 'tīr'] });
  });

  it('Rule 146: n became nd before a following liquid, unless when the following consonant is d', () => {
    expect(sindarinRules[getSandhiRuleId(146)].mechanic('anross', { morphemes: ['an', 'ross'] }))
      .toMatchObject({ out: 'andross', morphemes: ['and', 'ross'] });
    expect(sindarinRules[getSandhiRuleId(146)].mechanic('inrūɣedein', { morphemes: ['in', 'rūɣedein'] }))
      .toMatchObject({ out: 'indrūɣedein', morphemes: ['ind', 'rūɣedein'] });
    expect(sindarinRules[getSandhiRuleId(146)].mechanic('ɸinlaſ', { morphemes: ['ɸin', 'laſ'] }))
      .toMatchObject({ out: 'ɸindlaſ', morphemes: ['ɸind', 'laſ'] });
    // Exception: n stays as n when followed by liquid + vowel/diphthong + d
    expect(sindarinRules[getSandhiRuleId(146)].mechanic('ɸinraud', { morphemes: ['ɸin', 'raud'] }))
      .toMatchObject({ out: 'ɸinraud', morphemes: ['ɸin', 'raud'] });
  });

  it('Rule 147: ŋ became ŋg before l, r, w (changes both morphemes)', () => {
    expect(sindarinRules[getSandhiRuleId(147)].mechanic('aŋweð', { morphemes: ['aŋ', 'weð'] }))
      .toMatchObject({ out: 'aŋgweð', morphemes: ['aŋ', 'gweð'] });
    expect(sindarinRules[getSandhiRuleId(147)].mechanic('aŋrist', { morphemes: ['aŋ', 'rist'] }))
      .toMatchObject({ out: 'aŋgrist', morphemes: ['aŋ', 'grist'] });
    expect(sindarinRules[getSandhiRuleId(147)].mechanic('riŋloɣ', { morphemes: ['riŋ', 'loɣ'] }))
      .toMatchObject({ out: 'riŋgloɣ', morphemes: ['riŋ', 'gloɣ'] });
    expect(sindarinRules[getSandhiRuleId(147)].mechanic('iŋleid', { morphemes: ['i', 'ŋleid'] }))
      .toMatchObject({ out: 'iŋgleid', morphemes: ['i', 'ŋgleid'] });
    expect(sindarinRules[getSandhiRuleId(147)].mechanic('iŋwanūr', { morphemes: ['iŋ', 'wanūr'] }))
      .toMatchObject({ out: 'iŋgwanūr', morphemes: ['iŋ', 'gwanūr'] });
  });

  it('Rule 148: nd became ŋg before l (changes both morphemes)', () => {
    expect(sindarinRules[getSandhiRuleId(148)].mechanic('ɸindlaſ', { morphemes: ['ɸind', 'laſ'] }))
      .toMatchObject({ out: 'ɸiŋglaſ', morphemes: ['ɸiŋ', 'glaſ'] });
  });

  it('Rule 149: ṽ disappeared after w', () => {
    expect(sindarinRules[getSandhiRuleId(149)].mechanic('gwelwɱen', { morphemes: ['gwel', 'wɱen'] }))
      .toMatchObject({ out: 'gwelwen', morphemes: ['gwel', 'wen'] });
  });

  it('Rule 150: lṽ sometimes became lw', () => {
    expect(sindarinRules[getSandhiRuleId(150)].mechanic('lalɱen', { morphemes: ['lal', 'ɱen'] }))
      .toMatchObject({ out: 'lalwen', morphemes: ['lal', 'wen'] });
    expect(sindarinRules[getSandhiRuleId(150)].mechanic('lalɱorn', { morphemes: ['lal', 'ɱorn'] }))
      .toMatchObject({ out: 'lalworn', morphemes: ['lal', 'worn'] });
    expect(sindarinRules[getSandhiRuleId(150)].mechanic('gilɱen', { morphemes: ['gil', 'ɱen'] }))
      .toMatchObject({ out: 'gilwen', morphemes: ['gil', 'wen'] });
    // Exception: doesn't change when pattern is non-liquid consonant + a + l + ɱ
    expect(sindarinRules[getSandhiRuleId(150)].mechanic('galɱorn', { morphemes: ['gal', 'ɱorn'] }))
      .toMatchObject({ out: 'galɱorn', morphemes: ['gal', 'ɱorn'] });
  });

  it('Rule 151: w disappeared before o, œ, and ǭ', () => {
    expect(sindarinRules[getSandhiRuleId(151)].mechanic('gwolass', { morphemes: ['gwo', 'lass'] }))
      .toMatchObject({ out: 'golass', morphemes: ['go', 'lass'] });
    expect(sindarinRules[getSandhiRuleId(151)].mechanic('gwǭin', { morphemes: ['gwǭin'] }))
      .toMatchObject({ out: 'gǭin', morphemes: ['gǭin'] });
    expect(sindarinRules[getSandhiRuleId(151)].mechanic('gwœnœdiad', { morphemes: ['gwœ', 'nœdiad'] }))
      .toMatchObject({ out: 'gœnœdiad', morphemes: ['gœ', 'nœdiad'] });
    expect(sindarinRules[getSandhiRuleId(151)].mechanic('lalworn', { morphemes: ['lalworn'] }))
      .toMatchObject({ out: 'lalorn', morphemes: ['lalorn'] });
    expect(sindarinRules[getSandhiRuleId(151)].mechanic('ɸornwobel', { morphemes: ['ɸorn', 'wobel'] }))
      .toMatchObject({ out: 'ɸornobel', morphemes: ['ɸorn', 'obel'] });
    expect(sindarinRules[getSandhiRuleId(151)].mechanic('ɸorwoxell', { morphemes: ['ɸor', 'woxell'] }))
      .toMatchObject({ out: 'ɸoroxell', morphemes: ['ɸor', 'oxell'] });
    expect(sindarinRules[getSandhiRuleId(151)].mechanic('arwonoded', { morphemes: ['ar', 'wonoded'] }))
      .toMatchObject({ out: 'aronoded', morphemes: ['ar', 'onoded'] });
  });

  it('Rule 152: rɣ, lɣ usually became ri, li before a vowel', () => {
    expect(sindarinRules[getSandhiRuleId(152)].mechanic('tarɣaſ', { morphemes: ['tarɣaſ'] }))
      .toMatchObject({ out: 'tariaſ', morphemes: ['tariaſ'] });
    expect(sindarinRules[getSandhiRuleId(152)].mechanic('θalɣond', { morphemes: ['θalɣond'] }))
      .toMatchObject({ out: 'θaliond', morphemes: ['θaliond'] });
    expect(sindarinRules[getSandhiRuleId(152)].mechanic('θelɣjnd', { morphemes: ['θelɣjnd'] }))
      .toMatchObject({ out: 'θelijnd', morphemes: ['θelijnd'] });
    expect(sindarinRules[getSandhiRuleId(152)].mechanic('dīrɣell', { morphemes: ['dīrɣell'] }))
      .toMatchObject({ out: 'dīriell', morphemes: ['dīriell'] });
    // Exception: when 'e' before liquid and back vowel 'o' after ɣ, ɣ just disappears
    expect(sindarinRules[getSandhiRuleId(152)].mechanic('delɣoſ', { morphemes: ['delɣoſ'] }))
      .toMatchObject({ out: 'deloſ', morphemes: ['deloſ'] });
  });

  it('Rule 153: the sequence ji became j', () => {
    expect(sindarinRules[getSandhiRuleId(153)].mechanic('mirijni', { morphemes: ['mirijni'] }))
      .toMatchObject({ out: 'mirjni', morphemes: ['mirjni'] });
    expect(sindarinRules[getSandhiRuleId(153)].mechanic('θelijnd', { morphemes: ['θelijnd'] }))
      .toMatchObject({ out: 'θeljnd', morphemes: ['θeljnd'] });
  });

  it('Rule 154: ɣ disappeared at the end of a polysyllable', () => {
    expect(sindarinRules[getSandhiRuleId(154)].mechanic('ekθelɣ', { morphemes: ['ek', 'θelɣ'] }))
      .toMatchObject({ out: 'ekθel', morphemes: ['ek', 'θel'] });
  });

  it('Rule 155: ɣ became a at the end of monosyllables following a and e', () => {
    expect(sindarinRules[getSandhiRuleId(155)].mechanic('θelɣ', { morphemes: ['θelɣ'] }))
      .toMatchObject({ out: 'θela', morphemes: ['θela'] });
    expect(sindarinRules[getSandhiRuleId(155)].mechanic('tarɣ', { morphemes: ['tarɣ'] }))
      .toMatchObject({ out: 'tara', morphemes: ['tara'] });
  });

  it('Rule 156: ɣ became i at the end of monosyllables following i', () => {
    expect(sindarinRules[getSandhiRuleId(156)].mechanic('θeilɣ', { morphemes: ['θeilɣ'] }))
      .toMatchObject({ out: 'θeili', morphemes: ['θeili'] });
    expect(sindarinRules[getSandhiRuleId(156)].mechanic('ɸilɣ', { morphemes: ['ɸilɣ'] }))
      .toMatchObject({ out: 'ɸili', morphemes: ['ɸili'] });
  });

  it('Rule 157: the sequence lð became ll', () => {
    expect(sindarinRules[getSandhiRuleId(157)].mechanic('kolð', { morphemes: ['kolð'] }))
      .toMatchObject({ out: 'koll', morphemes: ['koll'] });
    expect(sindarinRules[getSandhiRuleId(157)].mechanic('golðr', { morphemes: ['golðr'] }))
      .toMatchObject({ out: 'gollr', morphemes: ['gollr'] });
  });

  it('Rule 158: the sequence nl sometimes became ll', () => {
    expect(sindarinRules[getSandhiRuleId(158)].mechanic('miθꞧenlaſ', { morphemes: ['miθꞧen', 'laſ'] }))
      .toMatchObject({ out: 'miθꞧellaſ', morphemes: ['miθꞧel', 'laſ'] });
    // Exception: stays unchanged when vowel before n is 'i'
    expect(sindarinRules[getSandhiRuleId(158)].mechanic('minlammad', { morphemes: ['min', 'lammad'] }))
      .toMatchObject({ out: 'minlammad', morphemes: ['min', 'lammad'] });
  });

  it('Rule 159: n disappeared after a long vowel before another n', () => {
    expect(sindarinRules[getSandhiRuleId(159)].mechanic('nīnnimp', { morphemes: ['nīn', 'nimp'] }))
      .toMatchObject({ out: 'nīnimp', morphemes: ['nī', 'nimp'] });
  });

  it('Rule 160: lr became ll in suffixes, but not in compounds', () => {
    // Suffixes: longer first morpheme → lr becomes ll
    expect(sindarinRules[getSandhiRuleId(160)].mechanic('eðelrimb', { morphemes: ['eðel', 'rimb'] }))
      .toMatchObject({ out: 'eðellimb', morphemes: ['eðel', 'limb'] });
    expect(sindarinRules[getSandhiRuleId(160)].mechanic('eðelren', { morphemes: ['eðel', 'ren'] }))
      .toMatchObject({ out: 'eðellen', morphemes: ['eðel', 'len'] });
    expect(sindarinRules[getSandhiRuleId(160)].mechanic('kalrond', { morphemes: ['kal', 'rond'] }))
      .toMatchObject({ out: 'kallond', morphemes: ['kal', 'lond'] });
    // Compounds: short first morpheme (2 chars) → stays lr
    expect(sindarinRules[getSandhiRuleId(160)].mechanic('elrond', { morphemes: ['el', 'rond'] }))
      .toMatchObject({ out: 'elrond', morphemes: ['el', 'rond'] });
    expect(sindarinRules[getSandhiRuleId(160)].mechanic('elroſ', { morphemes: ['el', 'roſ'] }))
      .toMatchObject({ out: 'elroſ', morphemes: ['el', 'roſ'] });
  });

  it('Rule 161: rl sometimes became ll', () => {
    // Changes when vowel before r is 'e'
    expect(sindarinRules[getSandhiRuleId(161)].mechanic('glewerlind', { morphemes: ['glewer', 'lind'] }))
      .toMatchObject({ out: 'glewellind', morphemes: ['glewel', 'lind'] });
    expect(sindarinRules[getSandhiRuleId(161)].mechanic('erloθ', { morphemes: ['er', 'loθ'] }))
      .toMatchObject({ out: 'elloθ', morphemes: ['el', 'loθ'] });
    // Exception: doesn't change when vowel before r is 'o'
    expect(sindarinRules[getSandhiRuleId(161)].mechanic('forlond', { morphemes: ['for', 'lond'] }))
      .toMatchObject({ out: 'forlond', morphemes: ['for', 'lond'] });
  });

  it('Rule 162: rr sometimes simplified to r', () => {
    // Changes when vowel before r is diphthong ending (like 'ai') or 'a'
    expect(sindarinRules[getSandhiRuleId(162)].mechanic('airrandīr', { morphemes: ['air', 'randīr'] }))
      .toMatchObject({ out: 'airandīr', morphemes: ['ai', 'randīr'] });
    expect(sindarinRules[getSandhiRuleId(162)].mechanic('aglarrond', { morphemes: ['aglar', 'rond'] }))
      .toMatchObject({ out: 'aglarond', morphemes: ['agla', 'rond'] });
    // Exception: doesn't change when vowel before r is 'e'
    expect(sindarinRules[getSandhiRuleId(162)].mechanic('telerrimb', { morphemes: ['teler', 'rimb'] }))
      .toMatchObject({ out: 'telerrimb', morphemes: ['teler', 'rimb'] });
  });

  it('Rule 163: ç became h', () => {
    expect(sindarinRules[getSandhiRuleId(163)].mechanic('çast'))
      .toMatchObject({ out: 'hast' });
    expect(sindarinRules[getSandhiRuleId(163)].mechanic('çūl'))
      .toMatchObject({ out: 'hūl' });
  });

  it('Rule 164: uu, jj and ii became ū, ӯ and ī', () => {
    expect(sindarinRules[getSandhiRuleId(164)].mechanic('θiin'))
      .toMatchObject({ out: 'θīn' });
    expect(sindarinRules[getSandhiRuleId(164)].mechanic('ljjg'))
      .toMatchObject({ out: 'lӯg' });
    expect(sindarinRules[getSandhiRuleId(164)].mechanic('tuluuɱ'))
      .toMatchObject({ out: 'tulūɱ' });
  });
});

