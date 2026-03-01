import { describe, it, expect } from "vitest";
import { sindarinRules } from "../src/sindarin.js";

describe('Sindarin rules', () => {
  it('00100 - initial [w] became [gw]', () => {
    expect(sindarinRules['2002760597'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2002760597'].mechanic('wagme').out).toBe('gwagme');
    expect(sindarinRules['2002760597'].mechanic('waiwe').out).toBe('gwaiwe');
    expect(sindarinRules['2002760597'].mechanic('wanwa').out).toBe('gwanwa');
  });

  it('00200 - initial nasals vanished before stops', () => {
    expect(sindarinRules['3057844573'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3057844573'].mechanic('mbarda').out).toBe('barda');
    expect(sindarinRules['3057844573'].mechanic('ndaila').out).toBe('daila');
    expect(sindarinRules['3057844573'].mechanic('ŋgol').out).toBe('gol');
  });

  it('00300 - final nasals vanished after vowels', () => {
    expect(sindarinRules['876455981'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['876455981'].mechanic('kaim').out).toBe('kai');
    expect(sindarinRules['876455981'].mechanic('ailin').out).toBe('aili');
  });

  it('00400 - initial [s] vanished before spirants', () => {
    expect(sindarinRules['3841187313'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3841187313'].mechanic('sāba').out).toBe('sāba');
    expect(sindarinRules['3841187313'].mechanic('sɸaŋga').out).toBe('ɸaŋga');
    expect(sindarinRules['3841187313'].mechanic('sθaŋxa').out).toBe('θaŋxa');
    expect(sindarinRules['3841187313'].mechanic('sxella').out).toBe('xella');
  });

  it('00500 - initial voiceless [j̊] became [x]', () => {
    expect(sindarinRules['3841187313'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2178021811'].mechanic('hyalma').out).toBe('chalma');
    expect(sindarinRules['2178021811'].mechanic('hyūle').out).toBe('chūle');
  });

  it('00600 - voiced stops became spirants after liquids', () => {
    expect(sindarinRules['1590520649'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1590520649'].mechanic('kherbessē').out).toBe('khervessē');
    expect(sindarinRules['1590520649'].mechanic('gardā').out).toBe('garðā');
    expect(sindarinRules['1590520649'].mechanic('targā').out).toBe('tarɣā');
    expect(sindarinRules['1590520649'].mechanic('golbā').out).toBe('golvā');
    expect(sindarinRules['1590520649'].mechanic('kuldā').out).toBe('kulðā');
    expect(sindarinRules['1590520649'].mechanic('phelgā').out).toBe('phelɣā');
  });

  it('00700 - [zb], [zg] became [ðβ], [ðɣ]', () => {
    expect(sindarinRules['1951748921'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1951748921'].mechanic('nazgā').out).toBe('naðɣā');
    expect(sindarinRules['1951748921'].mechanic('mazgō').out).toBe('maðɣō');
    expect(sindarinRules['1951748921'].mechanic('buzbō').out).toBe('buðβō');
  });

  it('00800 - short [i], [u] became [e], [o] preceding final [a]', () => {
    expect(sindarinRules['1593810649'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1593810649'].mechanic('ugrā').out).toBe('ogrā');
    expect(sindarinRules['1593810649'].mechanic('ninda').out).toBe('nenda');
    expect(sindarinRules['1593810649'].mechanic('silimarina').out).toBe('silimarena');
    // Don't apply to long vowels:
    expect(sindarinRules['1593810649'].mechanic('nūra').out).toBe('nūra');
    // Don't apply to diphtongs:
    expect(sindarinRules['1593810649'].mechanic('nuira').out).toBe('nuira');
  });

  it('00900 - voiced stops became spirants after vowels', () => {
    expect(sindarinRules['1726791627'].mechanic('xyz').out).toBe('xyz');
    expect(sindarinRules['1726791627'].mechanic('nebā').out).toBe('nevā');
    expect(sindarinRules['1726791627'].mechanic('edelō').out).toBe('eðelō');
    expect(sindarinRules['1726791627'].mechanic('magla').out).toBe('maɣla');
  });

  it('01000 - [ɸ], [β] became [f], [v]', () => {
    expect(sindarinRules['890563133'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['890563133'].mechanic('alɸa').out).toBe('alfa');
    expect(sindarinRules['890563133'].mechanic('eɸɸel').out).toBe('effel');
    expect(sindarinRules['890563133'].mechanic('buðβo').out).toBe('buðvo');
  });

  it('01100 - medial [j] became [i]', () => {
    expect(sindarinRules['1679623085'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1679623085'].mechanic('balanja').out).toBe('balania');
    expect(sindarinRules['1679623085'].mechanic('ɸanja').out).toBe('ɸania');
  });

  it('01200 - short [e], [o] became [i], [u] in syllable before final [i]', () => {
    expect(sindarinRules['2646655607'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2646655607'].mechanic('leperī').out).toBe('lepirī');
    expect(sindarinRules['2646655607'].mechanic('oronī').out).toBe('orunī');
    expect(sindarinRules['2646655607'].mechanic('ossī').out).toBe('ussī');
    expect(sindarinRules['2646655607'].mechanic('teŋmi').out).toBe('tiŋmi');
    expect(sindarinRules['2646655607'].mechanic('eleni').out).toBe('elini');
    expect(sindarinRules['2646655607'].mechanic('goloði').out).toBe('goluði');
  });

  describe('01300 - short [a], [o], [u] became [e], [œ], [y] before [i]', () => {
    it('[ăCi] > [eCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('bania').out).toBe('benia');
      expect(sindarinRules['3958031275'].mechanic('braθil').out).toBe('breθil');
    });
    it('[ăCCi] > [eCCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('balθil').out).toBe('belθil');
      expect(sindarinRules['3958031275'].mechanic('alfi').out).toBe('elfi');
      expect(sindarinRules['3958031275'].mechanic('sarnīe').out).toBe('sernīe');
    });
    it('[ăCăCi] > [eCeCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('balania').out).toBe('belenia');
      expect(sindarinRules['3958031275'].mechanic('atatia').out).toBe('etetia');
    });
    it('[ăCŭCi] > [eCyCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('andundi').out).toBe('endyndi'); // VCCVCCV
    });
    it('[ŏCi] > [œCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('ronio').out).toBe('rœnio');
      expect(sindarinRules['3958031275'].mechanic('olia').out).toBe('œlia');
    });
    it('[ŏCŭCi] > [œCyCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('goluði').out).toBe('gœlyði');
      expect(sindarinRules['3958031275'].mechanic('θoluhi').out).toBe('θœlyhi');
      expect(sindarinRules['3958031275'].mechanic('oruti').out).toBe('œryti');
    });
    it('[ŏCŏCi] > [œCœCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('doroni').out).toBe('dœrœni');
      expect(sindarinRules['3958031275'].mechanic('olohi').out).toBe('œlœhi');
    });
    it('[ŭCi] > [yCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('duri').out).toBe('dyri');
      expect(sindarinRules['3958031275'].mechanic('puti').out).toBe('pyti');
    });
    it('[ŭCCi] > [yCCi]', () => {
      expect(sindarinRules['3958031275'].mechanic('dumbi').out).toBe('dymbi');
      expect(sindarinRules['3958031275'].mechanic('tainakulli').out).toBe('tainakylli');
      expect(sindarinRules['3958031275'].mechanic('ukli').out).toBe('ykli');
    });
    it('others', () => {
      expect(sindarinRules['3958031275'].mechanic('calatariɣell').out).toBe('calateriɣell');
    });
  });

  it('01400 - [ē], [ō] became [ī], [ū]', () => {
    expect(sindarinRules['3889365613'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3889365613'].mechanic('dēra').out).toBe('dīra');
    expect(sindarinRules['3889365613'].mechanic('eðēwe').out).toBe('eðīwe');
    expect(sindarinRules['3889365613'].mechanic('mēlambar').out).toBe('mīlambar');
    expect(sindarinRules['3889365613'].mechanic('belekōre').out).toBe('belekūre');
    expect(sindarinRules['3889365613'].mechanic('gōle').out).toBe('gūle');
    expect(sindarinRules['3889365613'].mechanic('gōrikova').out).toBe('gūrikova');
    expect(sindarinRules['3889365613'].mechanic('l̥ōko').out).toBe('l̥ūko');
    expect(sindarinRules['3889365613'].mechanic('oθθōia').out).toBe('oθθūia');
  });

  it('01500 - [ɣ] vocalized before [l], [r], [m], [n]', () => {
    expect(sindarinRules['539122737'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['539122737'].mechanic('maɣza').out).toBe('maɣza'); // non-existent word
    expect(sindarinRules['539122737'].mechanic('maɣla').out).toBe('maila');
    expect(sindarinRules['539122737'].mechanic('maɣra').out).toBe('maira');
    expect(sindarinRules['539122737'].mechanic('gwaɣme').out).toBe('gwaime');
    expect(sindarinRules['539122737'].mechanic('oɣma').out).toBe('oima');
    expect(sindarinRules['539122737'].mechanic('loɣna').out).toBe('loina');
  });

  it('01600 - [x], [ɸ] vocalized between a vowel and [θ]', () => {
    expect(sindarinRules['4002924749'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['4002924749'].mechanic('leɸθa-').out).toBe('leuθa-'); // [eɸθ] > [euθ]
    expect(sindarinRules['4002924749'].mechanic('andatexθa').out).toBe('andateiθa'); // [exθ] > [eiθ]
    expect(sindarinRules['4002924749'].mechanic('paxθa').out).toBe('paiθa'); // [axθ] > [aiθ]
    expect(sindarinRules['4002924749'].mechanic('rixθant').out).toBe('rīθant'); // [ixθ] > [īθ]
    expect(sindarinRules['4002924749'].mechanic('gruxθa-').out).toBe('gruiθa-'); // [uxθ] > [uiθ]
  });

  it('01700 - non-initial [xʲ] vocalized to [ix]', () => {
    expect(sindarinRules['2422841513'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2422841513'].mechanic('lexʲa').out).toBe('leixa');
    expect(sindarinRules['2422841513'].mechanic('leꜧa').out).toBe('leixa');
    expect(sindarinRules['2422841513'].mechanic('lixʲi').out).toBe('līxi');
    expect(sindarinRules['2422841513'].mechanic('liꜧi').out).toBe('līxi');
  });

  it('01800 - [iu] and [ju] became [ȳ]', () => {
    expect(sindarinRules['659168127'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['659168127'].mechanic('diule').out).toBe('dȳle'); // [iu] > [ȳ]
    expect(sindarinRules['659168127'].mechanic('kiurǭna').out).toBe('kȳrǭna'); // [iu] > [ȳ]
    expect(sindarinRules['659168127'].mechanic('julma').out).toBe('ȳlma'); // [ju] > [ȳ]
    expect(sindarinRules['659168127'].mechanic('jūneke').out).toBe('ȳneke'); // [ju] > [ȳ]
    expect(sindarinRules['659168127'].mechanic('jūiabc').out).toBe('ȳiabc'); // [jui] > [jui] (no real examples)
  });

  it('01900 - short [u] often became [o]', () => {
    expect(sindarinRules['2740073851'].mechanic('abc').out).toBe('abc');

    // Registered exception:
    expect(sindarinRules['2740073851'].mechanic('guruk').out).toBe('gorok');

    // Preserving the [u] --

    // Multiple syllables with [u]:
    expect(sindarinRules['2740073851'].mechanic('guduk').out).toBe('guduk'); // Non-existent word
    // [uC{uwv}] > [uC{uwv}]:
    expect(sindarinRules['2740073851'].mechanic('gurwk').out).toBe('gurwk'); // Non-existent word
    expect(sindarinRules['2740073851'].mechanic('curw').out).toBe('curw');
    expect(sindarinRules['2740073851'].mechanic('buðvo').out).toBe('buðvo'); // buzbō > buðu
    // Nasals:
    // [um] > [um]:
    expect(sindarinRules['2740073851'].mechanic('tumbo').out).toBe('tumbo');
    // [un] > [un]:
    expect(sindarinRules['2740073851'].mechanic('felakgundu').out).toBe('felakgundu'); // This is a loanword
    // [uŋ] > [uŋ]:
    expect(sindarinRules['2740073851'].mechanic('truŋxo').out).toBe('truŋxo');
    // Don't change [u] when it's part of a diphthong:
    expect(sindarinRules['2740073851'].mechanic('luine').out).toBe('luine');
    // Don't change [u] when it's long:
    expect(sindarinRules['2740073851'].mechanic('lūne').out).toBe('lūne'); // Non-existent word

    // Change otherwise --

    // [ŭ] > [o]:
    expect(sindarinRules['2740073851'].mechanic('uroθa').out).toBe('oroθa');
  });

  it('02000 - [nm], [ŋm] became [nw], [ŋw]', () => {
    expect(sindarinRules['3258926163'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3258926163'].mechanic('anma').out).toBe('anwa'); // [nm] > [nw]
    expect(sindarinRules['3258926163'].mechanic('teŋma').out).toBe('teŋwa'); // [ŋm] > [ŋw]
    expect(sindarinRules['3258926163'].mechanic('tiŋmi').out).toBe('tiŋwi'); // [ŋm] > [ŋw]
  });

  it('02100 - [ŋ] vanished with compensatory lengthening', () => {
    expect(sindarinRules['3707785609'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3707785609'].mechanic('teŋwa').out).toBe('tēwa'); // [Vŋw] > [V̄w]
    expect(sindarinRules['3707785609'].mechanic('tiŋwi').out).toBe('tīwi'); // [Vŋn] > [V̄n]
  });

  it('02200 - [ǭ] became [au]', () => {
    expect(sindarinRules['558704171'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['558704171'].mechanic('aɣǭle').out).toBe('aɣaule');
    expect(sindarinRules['558704171'].mechanic('arǭta').out).toBe('arauta');
    expect(sindarinRules['558704171'].mechanic('ǭ').out).toBe('au');
    expect(sindarinRules['558704171'].mechanic('ekǭ').out).toBe('ekau');
    expect(sindarinRules['558704171'].mechanic('lindǭna').out).toBe('lindauna');
    expect(sindarinRules['558704171'].mechanic('θǭniel').out).toBe('θauniel');
    expect(sindarinRules['558704171'].mechanic('ǭbbǭ').out).toBe('aubbau'); // non-existent word
  });

  it('02300 - [ę̄] became [ai]', () => {
    expect(sindarinRules['2387695245'].mechanic('abc').out).toBe('abc');
    // All words below are corrupted Old Noldorin examples as there are no Sindarin examples available.
    expect(sindarinRules['2387695245'].mechanic('kę̄m').out).toBe('kaim');
    expect(sindarinRules['2387695245'].mechanic('ndę̄r').out).toBe('ndair');
    expect(sindarinRules['2387695245'].mechanic('pę̄ne').out).toBe('paine');
    expect(sindarinRules['2387695245'].mechanic('pę̄nnę̄').out).toBe('painnai'); // non-existent word
  });

  it('02400 - short final vowels vanished', () => {
    expect(sindarinRules['813787869'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['813787869'].mechanic('aða').out).toBe('að');
    expect(sindarinRules['813787869'].mechanic('akaura').out).toBe('akaur');
    expect(sindarinRules['813787869'].mechanic('alwa').out).toBe('alw');
    expect(sindarinRules['813787869'].mechanic('ambarθa').out).toBe('ambarθ');
    expect(sindarinRules['813787869'].mechanic('fanoia').out).toBe('fanoi');
    expect(sindarinRules['813787869'].mechanic('groθθa').out).toBe('groθθ');
    expect(sindarinRules['813787869'].mechanic('eiθele').out).toBe('eiθel');
    expect(sindarinRules['813787869'].mechanic('gūle').out).toBe('gūl');
    expect(sindarinRules['813787869'].mechanic('mīre').out).toBe('mīr');
    expect(sindarinRules['813787869'].mechanic('otoko').out).toBe('otok');
    expect(sindarinRules['813787869'].mechanic('penθrondo').out).toBe('penθrond');
    expect(sindarinRules['813787869'].mechanic('θolo').out).toBe('θol');
    expect(sindarinRules['813787869'].mechanic('-weɣo').out).toBe('-weɣ');
    expect(sindarinRules['813787869'].mechanic('ekau').out).toBe('ekau');
    expect(sindarinRules['813787869'].mechanic('tīwi').out).toBe('tīwi');
  });

  it('02500 - final [i] intruded into preceding syllable', () => {
    expect(sindarinRules['2399289739'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2399289739'].mechanic('deŋxini').out).toBe('deŋxin'); // [-iCi] > [-iC]
    expect(sindarinRules['2399289739'].mechanic('iri').out).toBe('ir'); // [-iCi] > [-iC]
    expect(sindarinRules['2399289739'].mechanic('beleni').out).toBe('belein'); // [-ĕCi] > [-eiC]
    expect(sindarinRules['2399289739'].mechanic('θœlyhi').out).toBe('θœlyh'); // [-yCi] > [-yC]
    expect(sindarinRules['2399289739'].mechanic('œrœni').out).toBe('œrœin'); // [-œCi] > [-œiC]
    expect(sindarinRules['2399289739'].mechanic('θǭni').out).toBe('θoin'); // [-ǭCi] > [-oiC]
    expect(sindarinRules['2399289739'].mechanic('xerūni').out).toBe('xeruin'); // [-ūCi] > [-uiC]
  });

  it('02600 - final [w] sometimes intruded into preceding syllables', () => {
    expect(sindarinRules['4211011237'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['4211011237'].mechanic('anw').out).toBe('aun'); // [-ăCw] > [-auC]
    expect(sindarinRules['4211011237'].mechanic('gwanw').out).toBe('gwaun'); // [-ăCw] > [-auC]
    expect(sindarinRules['4211011237'].mechanic('texʷ').out).toBe('teux'); // [-ĕCw] > [-euC]
  });

  it('02700 - initial [x-] became [h-]', () => {
    expect(sindarinRules['4287595571'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['4287595571'].mechanic('xaðaud').out).toBe('haðaud'); // [x-] > [h-]
    expect(sindarinRules['4287595571'].mechanic('xaun').out).toBe('haun');
    expect(sindarinRules['4287595571'].mechanic('χaðaud').out).toBe('haðaud'); // Alternative spelling
    expect(sindarinRules['4287595571'].mechanic('khaðaud').out).toBe('haðaud'); // Alternative spelling
    expect(sindarinRules['4287595571'].mechanic('χaun').out).toBe('haun'); // Alternative spelling
    expect(sindarinRules['4287595571'].mechanic('khaun').out).toBe('haun'); // Alternative spelling
    expect(sindarinRules['4287595571'].mechanic('xrass').out).toBe('r̥ass'); // [xr-] > [r̥-] This is Noldorin
    expect(sindarinRules['4287595571'].mechanic('xlass').out).toBe('l̥ass'); // [xl-] > [l̥-] This word doesn't exist.
  });

  it('02800 - voiceless stops voiced after vowels', () => {
    expect(sindarinRules['2240258959'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2240258959'].mechanic('akauwen').out).toBe('agauwen');
    expect(sindarinRules['2240258959'].mechanic('bakaur').out).toBe('bagaur');
    expect(sindarinRules['2240258959'].mechanic('eklambar').out).toBe('eglambar');
    expect(sindarinRules['2240258959'].mechanic('serek').out).toBe('sereg');
    expect(sindarinRules['2240258959'].mechanic('kelep').out).toBe('keleb');
    expect(sindarinRules['2240258959'].mechanic('map').out).toBe('mab');
    expect(sindarinRules['2240258959'].mechanic('nipen').out).toBe('niben');
    expect(sindarinRules['2240258959'].mechanic('θarapad').out).toBe('θarabad');
    expect(sindarinRules['2240258959'].mechanic('calatariɣell').out).toBe('caladariɣell');
    expect(sindarinRules['2240258959'].mechanic('etlandor').out).toBe('edlandor');
    expect(sindarinRules['2240258959'].mechanic('matw').out).toBe('madw');
    expect(sindarinRules['2240258959'].mechanic('otoh').out).toBe('odoh');
    expect(sindarinRules['2240258959'].mechanic('œryt').out).toBe('œryd');
    // Initial stops should not change:
    expect(sindarinRules['2240258959'].mechanic('timbi').out).toBe('timbi');
    // Multiple stops should all change:
    expect(sindarinRules['2240258959'].mechanic('aplat').out).toBe('ablad');
  });

  it('02900 - short vowels generally lengthened in monosyllables', () => {
    expect(sindarinRules['1053424933'].mechanic('abc').out).toBe('abc');
    // Lengthening occurs in monosyllables:
    expect(sindarinRules['1053424933'].mechanic('penθrondo').out).toBe('penθrondo');
    // Lengthening did not occur before unvoiced consonants: th, ch ([θ], [x]):
    expect(sindarinRules['1053424933'].mechanic('gwaθ').out).toBe('gwaθ');
    expect(sindarinRules['1053424933'].mechanic('bax').out).toBe('bax');
    // Long ss also did not lengthen, see rule 06300.
    expect(sindarinRules['1053424933'].mechanic('loſ').out).toBe('loſ');
    // Exceptions:
    expect(sindarinRules['1053424933'].mechanic('hiθ').out).toBe('hīθ');
    expect(sindarinRules['1053424933'].mechanic('niθ').out).toBe('nīθ');
    expect(sindarinRules['1053424933'].mechanic('iaθ').out).toBe('iāθ');
    // Sindarin monosyllables ending in [m] and [ŋ] do not show vowel lengthening
    expect(sindarinRules['1053424933'].mechanic('lam').out).toBe('lam');
    expect(sindarinRules['1053424933'].mechanic('dom').out).toBe('dom');
    // Cases where lengthening did not occur before voiced spirants and stops:
    expect(sindarinRules['1053424933'].mechanic('cef').out).toBe('cef');
    expect(sindarinRules['1053424933'].mechanic('glad').out).toBe('glad');
    expect(sindarinRules['1053424933'].mechanic('lad').out).toBe('lad');
    expect(sindarinRules['1053424933'].mechanic('nad').out).toBe('nad');
    expect(sindarinRules['1053424933'].mechanic('pad').out).toBe('pad');
    expect(sindarinRules['1053424933'].mechanic('plad').out).toBe('plad');
    expect(sindarinRules['1053424933'].mechanic('sad').out).toBe('sad');
    expect(sindarinRules['1053424933'].mechanic('tad').out).toBe('tad');
    expect(sindarinRules['1053424933'].mechanic('peg').out).toBe('peg');
    // Cases where lengthening did not occur before [l]:
    expect(sindarinRules['1053424933'].mechanic('ial').out).toBe('ial');
    expect(sindarinRules['1053424933'].mechanic('el').out).toBe('el');
    expect(sindarinRules['1053424933'].mechanic('del').out).toBe('del');
    expect(sindarinRules['1053424933'].mechanic('gil').out).toBe('gil');
    expect(sindarinRules['1053424933'].mechanic('tol').out).toBe('tol');
    expect(sindarinRules['1053424933'].mechanic('dol').out).toBe('dol');
    // Cases where lengthening did not occur before [r]:
    expect(sindarinRules['1053424933'].mechanic('bar').out).toBe('bar');
    expect(sindarinRules['1053424933'].mechanic('far').out).toBe('far');
    expect(sindarinRules['1053424933'].mechanic('er').out).toBe('er');
    expect(sindarinRules['1053424933'].mechanic('cor').out).toBe('cor');
    expect(sindarinRules['1053424933'].mechanic('for').out).toBe('for');
    expect(sindarinRules['1053424933'].mechanic('gor').out).toBe('gor');
    // Cases where lengthening did not occur before [n]:
    expect(sindarinRules['1053424933'].mechanic('glan').out).toBe('glan');
    expect(sindarinRules['1053424933'].mechanic('fen').out).toBe('fen');
    expect(sindarinRules['1053424933'].mechanic('hen').out).toBe('hen');
    expect(sindarinRules['1053424933'].mechanic('men').out).toBe('men');
    expect(sindarinRules['1053424933'].mechanic('nen').out).toBe('nen');
    expect(sindarinRules['1053424933'].mechanic('min').out).toBe('min');
    expect(sindarinRules['1053424933'].mechanic('tin').out).toBe('tin');
    expect(sindarinRules['1053424933'].mechanic('ion').out).toBe('ion');
    // Vowel lengthening does not occur in monosyllables ending a vowel:
    expect(sindarinRules['1053424933'].mechanic('ke').out).toBe('ke');
    expect(sindarinRules['1053424933'].mechanic('khe').out).toBe('khe');
    expect(sindarinRules['1053424933'].mechanic('khe').out).toBe('khe');
    expect(sindarinRules['1053424933'].mechanic('ga').out).toBe('ga');
    expect(sindarinRules['1053424933'].mechanic('oio').out).toBe('oio');
    expect(sindarinRules['1053424933'].mechanic('si').out).toBe('si');
    // Lengthening did not occur in diphtongs:
    // ['ae', 'ai', 'au', 'aw', 'ei', 'oe', 'ui']
    expect(sindarinRules['1053424933'].mechanic('bae').out).toBe('bae');
    expect(sindarinRules['1053424933'].mechanic('bai').out).toBe('bai');
    expect(sindarinRules['1053424933'].mechanic('bau').out).toBe('bau');
    expect(sindarinRules['1053424933'].mechanic('baw').out).toBe('baw');
    expect(sindarinRules['1053424933'].mechanic('bei').out).toBe('bei');
    expect(sindarinRules['1053424933'].mechanic('boe').out).toBe('boe');
    expect(sindarinRules['1053424933'].mechanic('bui').out).toBe('bui');
    expect(sindarinRules['1053424933'].mechanic('baeb').out).toBe('baeb');
    expect(sindarinRules['1053424933'].mechanic('baib').out).toBe('baib');
    expect(sindarinRules['1053424933'].mechanic('baub').out).toBe('baub');
    expect(sindarinRules['1053424933'].mechanic('bawb').out).toBe('bawb');
    expect(sindarinRules['1053424933'].mechanic('beib').out).toBe('beib');
    expect(sindarinRules['1053424933'].mechanic('boeb').out).toBe('boeb');
    expect(sindarinRules['1053424933'].mechanic('buib').out).toBe('buib');
    // Exceptions:
    expect(sindarinRules['1053424933'].mechanic('hwa').out).toBe('hwā');
    expect(sindarinRules['1053424933'].mechanic('ia').out).toBe('iā');
    expect(sindarinRules['1053424933'].mechanic('te').out).toBe('tē');
    expect(sindarinRules['1053424933'].mechanic('θle').out).toBe('θlē');
    expect(sindarinRules['1053424933'].mechanic('di').out).toBe('dī');
    expect(sindarinRules['1053424933'].mechanic('ꝉi').out).toBe('ꝉī');
    expect(sindarinRules['1053424933'].mechanic('gli').out).toBe('glī');
    expect(sindarinRules['1053424933'].mechanic('gwi').out).toBe('gwī');
    expect(sindarinRules['1053424933'].mechanic('ꞧi').out).toBe('ꞧī');
    expect(sindarinRules['1053424933'].mechanic('ri').out).toBe('rī');
    expect(sindarinRules['1053424933'].mechanic('ti').out).toBe('tī');
    expect(sindarinRules['1053424933'].mechanic('lo').out).toBe('lō');
    expect(sindarinRules['1053424933'].mechanic('no').out).toBe('nō');
    // Lengthening did (mostly) occur before voiced consonants: b, d, dh, f [v], g, l, n, r:
    expect(sindarinRules['1053424933'].mechanic('ban').out).toBe('bān');
    expect(sindarinRules['1053424933'].mechanic('hen').out).toBe('hen');
    expect(sindarinRules['1053424933'].mechanic('mav').out).toBe('māv');
    expect(sindarinRules['1053424933'].mechanic('gweɣ').out).toBe('gwēɣ');
    expect(sindarinRules['1053424933'].mechanic('fin').out).toBe('fīn');
    expect(sindarinRules['1053424933'].mechanic('el').out).toBe('el');
    expect(sindarinRules['1053424933'].mechanic('gwan').out).toBe('gwān');
    expect(sindarinRules['1053424933'].mechanic('mor').out).toBe('mōr');
    expect(sindarinRules['1053424933'].mechanic('θol').out).toBe('θōl');
    // Don't mess up the macrons:
    expect(sindarinRules['1053424933'].mechanic('hīr').out).toBe('hīr');
  });

  it('03000 - final [ɣ] became [a] after a consonant', () => {
    expect(sindarinRules['916418731'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['916418731'].mechanic('felɣ').out).toBe('fela');
    expect(sindarinRules['916418731'].mechanic('maðɣ').out).toBe('maða');
    expect(sindarinRules['916418731'].mechanic('filɣi').out).toBe('filī');
  });

  it('03100 - [ɣ] became [i] between sonants and vowels', () => {
    expect(sindarinRules['2139740021'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2139740021'].mechanic('θalɣond').out).toBe('θaliond');
    expect(sindarinRules['2139740021'].mechanic('ulɣund').out).toBe('ulund');
    expect(sindarinRules['2139740021'].mechanic('θelɣyndi').out).toBe('θelyndi');
    expect(sindarinRules['2139740021'].mechanic('dirɣel').out).toBe('diriel');
    expect(sindarinRules['2139740021'].mechanic('tarɣass').out).toBe('tariass');
    expect(sindarinRules['2139740021'].mechanic('maðɣass').out).toBe('maðiass');
    // Doesn't change:
    expect(sindarinRules['2139740021'].mechanic('galadariɣel').out).toBe('galadariɣel');
    // These words don't exist:
    expect(sindarinRules['2139740021'].mechanic('abɣab').out).toBe('abiab');
    expect(sindarinRules['2139740021'].mechanic('adɣab').out).toBe('adiab');
    expect(sindarinRules['2139740021'].mechanic('agɣab').out).toBe('agiab');
    expect(sindarinRules['2139740021'].mechanic('avɣab').out).toBe('aviab');
    expect(sindarinRules['2139740021'].mechanic('afɣab').out).toBe('afiab');
    expect(sindarinRules['2139740021'].mechanic('aðɣab').out).toBe('aðiab');
    expect(sindarinRules['2139740021'].mechanic('awɣab').out).toBe('awiab');
    expect(sindarinRules['2139740021'].mechanic('alɣab').out).toBe('aliab');
    expect(sindarinRules['2139740021'].mechanic('arɣab').out).toBe('ariab');
    expect(sindarinRules['2139740021'].mechanic('ajɣab').out).toBe('ajiab');
  });

  it('03200 - [ɣ] otherwise vanished', () => {
    expect(sindarinRules['4164672875'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['4164672875'].mechanic('galadariɣel').out).toBe('galadariel');
    expect(sindarinRules['4164672875'].mechanic('jaɣa').out).toBe('jā');
    expect(sindarinRules['4164672875'].mechanic('lōɣ').out).toBe('lō');
    expect(sindarinRules['4164672875'].mechanic('nǭvaɣrod').out).toBe('nǭvarod');
  });

  it('03300 - final [-wi] became [-y]', () => {
    expect(sindarinRules['677308549'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['677308549'].mechanic('herwi').out).toBe('hery');
    expect(sindarinRules['677308549'].mechanic('melui').out).toBe('mely');
  });

  it('03400 - [h] vanished after vowels', () => {
    expect(sindarinRules['875184187'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['875184187'].mechanic('ahamar').out).toBe('āmar');
    expect(sindarinRules['875184187'].mechanic('ahaum').out).toBe('aum');
    expect(sindarinRules['875184187'].mechanic('goroθūh').out).toBe('goroθū');
    expect(sindarinRules['875184187'].mechanic('l̥ahu').out).toBe('l̥au');
    expect(sindarinRules['875184187'].mechanic('odoh').out).toBe('odo');
    expect(sindarinRules['875184187'].mechanic('tindūmihelð').out).toBe('tindūmielð');
    expect(sindarinRules['875184187'].mechanic('θūhon').out).toBe('θūon');
    expect(sindarinRules['875184187'].mechanic('θœlyh').out).toBe('θœly');
    // Initial h should be ignored:
    expect(sindarinRules['875184187'].mechanic('habab').out).toBe('habab'); // Non-existent word
  });

  it('03500 - final [i], [u] generally vanished', () => {
    expect(sindarinRules['1815401039'].mechanic('abc').out).toBe('abc');
    // Final short i after consonant vanishes: [-Sĭ] > [-Sø]
    expect(sindarinRules['1815401039'].mechanic('bereθi').out).toBe('bereθ');
    expect(sindarinRules['1815401039'].mechanic('kirθi').out).toBe('kirθ');
    expect(sindarinRules['1815401039'].mechanic('yrxi').out).toBe('yrx');
    // Final short u after consonant vanishes: [-Sŭ] > [-Sø]
    expect(sindarinRules['1815401039'].mechanic('felaggundu').out).toBe('felaggund');
    expect(sindarinRules['1815401039'].mechanic('kundu').out).toBe('kund');
    // Exception: uCu pattern is preserved: [-uCu] > [-uCu]
    expect(sindarinRules['1815401039'].mechanic('guru').out).toBe('guru');
    // Long i after consonant becomes short: [-Sī] > [-Sĭ]
    expect(sindarinRules['1815401039'].mechanic('filī').out).toBe('fili');
    // Words not ending in i or u are unchanged
    expect(sindarinRules['1815401039'].mechanic('tindūmielð').out).toBe('tindūmielð');
  });

  it('03600 - short vowels vanished before morpheme boundaries', () => {
    expect(sindarinRules['2749565259'].mechanic('abc').out).toBe('abc');

    // [Că+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('aiganaur', { guess: true }).out).toBe('aignaur');
    expect(sindarinRules['2749565259'].mechanic('caladariell', { guess: true }).out).toBe('caladriell');
    expect(sindarinRules['2749565259'].mechanic('finiŋgorn', { guess: true }).out).toBe('finŋgorn');

    // [Cĕ+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('elembereth', { guess: true }).out).toBe('elmbereth');
    expect(sindarinRules['2749565259'].mechanic('moreŋgoθθ', { guess: true }).out).toBe('morŋgoθθ');

    // Wrong guess:
    expect(sindarinRules['2749565259'].mechanic('geleðendil', { guess: true }).out).toBe('gelðendil');
    // Correct guess with a marker:
    expect(sindarinRules['2749565259'].mechanic('geleðen-dil', { guess: true }).out).toBe('geleðndil');
    // Correct guess with a bespoke marker:
    expect(sindarinRules['2749565259'].mechanic('geleðen·dil', { guess: true, boundaryChar: '·' }).out).toBe('geleðndil');
    // No guessing yields identical string:
    expect(sindarinRules['2749565259'].mechanic('geleðendil', { guess: false }).out).toBe('geleðendil');


    // [Cĭ+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('gilidīr', { guess: true }).out).toBe('gildīr');
    expect(sindarinRules['2749565259'].mechanic('hīθilūm', { guess: true }).out).toBe('hīθlūm');
    expect(sindarinRules['2749565259'].mechanic('nimfiraid', { guess: true }).out).toBe('nimfraid');

    // [Cŏ+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('gondolind', { guess: true }).out).toBe('gondlind');
    expect(sindarinRules['2749565259'].mechanic('gondondor', { guess: true }).out).toBe('gondndor');

    // [Cŭ+C] > [Cø+C]:
    expect(sindarinRules['2749565259'].mechanic('turugaun', { guess: true }).out).toBe('turgaun');
    expect(sindarinRules['2749565259'].mechanic('turugond', { guess: true }).out).toBe('turgond');
  });

  it('03700 - [ai], [oi] became [ae], [oe]', () => {
    expect(sindarinRules['941153689'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['941153689'].mechanic('aθai').out).toBe('aθae');
    expect(sindarinRules['941153689'].mechanic('gaiar').out).toBe('gaear');
    expect(sindarinRules['941153689'].mechanic('haið').out).toBe('haeð');
    expect(sindarinRules['941153689'].mechanic('mairond').out).toBe('maerond');
    expect(sindarinRules['941153689'].mechanic('fanoi').out).toBe('fanoe');
    expect(sindarinRules['941153689'].mechanic('goi').out).toBe('goe');
    expect(sindarinRules['941153689'].mechanic('l̥oim').out).toBe('l̥oem');
    expect(sindarinRules['941153689'].mechanic('θoin').out).toBe('θoen');
  });

  it('03800 - later [ei] became [ai] in final syllables', () => {
    expect(sindarinRules['1660291111'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1660291111'].mechanic('bein').out).toBe('bain');
    expect(sindarinRules['1660291111'].mechanic('beleiθ').out).toBe('belaiθ');
    expect(sindarinRules['1660291111'].mechanic('eveir').out).toBe('evair');
    expect(sindarinRules['1660291111'].mechanic('lemein').out).toBe('lemain');
    expect(sindarinRules['1660291111'].mechanic('rein').out).toBe('rain');
    expect(sindarinRules['1660291111'].mechanic('seid').out).toBe('said');
    expect(sindarinRules['1660291111'].mechanic('teleir').out).toBe('telair');
  });

  it('03900 - diphthongs [yi], [yu] became [ui]', () => {
    // This rule has no attested direct examples, it is mostly concerned with explaining plural formation.
    expect(sindarinRules['3257758901'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3257758901'].mechanic('yux').out).toBe('uix');
    expect(sindarinRules['3257758901'].mechanic('yix').out).toBe('uix'); // Non-existent word
  });

  it('04000 - [œi] became [ui] or [y]', () => {
    expect(sindarinRules['1787434575'].mechanic('abc').out).toBe('abc');
    // There is only one example of this rule. It also is mostly concerned with explaining plural formation.
    expect(sindarinRules['1787434575'].mechanic('œrœin').out).toBe('œryn');
    expect(sindarinRules['1787434575'].mechanic('œrœin', { useUi: true }).out).toBe('œruin');
  });

  it('04100 - [nr] became [ðr]', () => {
    // Depends on 03600
    expect(sindarinRules['1105959911'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1105959911'].mechanic('karanrass').out).toBe('karaðrass');
    expect(sindarinRules['1105959911'].mechanic('finrod', { cluster: true }).out).toBe('finrod');
  });

  it('04200 - dissimilation of dental spirants', () => {
    expect(sindarinRules['2090293737'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2090293737'].mechanic('θaeθ').out).toBe('θaes');
    expect(sindarinRules['2090293737'].mechanic('úθaeθ').out).toBe('úθaes');
    expect(sindarinRules['2090293737'].mechanic('úðaeθ').out).toBe('úðaes'); // Non-existent word
    // It shouldn't trigger for double dental spirants (θθ):
    expect(sindarinRules['2090293737'].mechanic('leθθ').out).toBe('leθθ');
    expect(sindarinRules['2090293737'].mechanic('eðelloθθ').out).toBe('eðellos');
    // It also shouldn't trigger when there's only one θ:
    expect(sindarinRules['2090293737'].mechanic('belaiθ').out).toBe('belaiθ');
  });

  it('04300 - [ls], [rs] became [lθ], [ss]', () => {
    expect(sindarinRules['298324969'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['298324969'].mechanic('falso').out).toBe('falθo');
    expect(sindarinRules['298324969'].mechanic('olsa-').out).toBe('olθa-');
    expect(sindarinRules['298324969'].mechanic('tars').out).toBe('tass');
    expect(sindarinRules['298324969'].mechanic('perso').out).toBe('pesso');
  });

  it('04400 - final [mf], [nθ], [ŋx], [lθ] became [mp], [nt], [ŋk], [lt]', () => {
    expect(sindarinRules['1531741019'].mechanic('abc').out).toBe('abc');
    // [-mf] > [-mp]:
    expect(sindarinRules['1531741019'].mechanic('gamf').out).toBe('gamp');
    expect(sindarinRules['1531741019'].mechanic('nimf').out).toBe('nimp');
    // [-nθ] > [-nt]:
    expect(sindarinRules['1531741019'].mechanic('estenθ').out).toBe('estent');
    expect(sindarinRules['1531741019'].mechanic('ranθ').out).toBe('rant');
    expect(sindarinRules['1531741019'].mechanic('θenθ').out).toBe('θent');
    // [-ŋx] > [-ŋk]:
    expect(sindarinRules['1531741019'].mechanic('fliŋx').out).toBe('fliŋk');
    expect(sindarinRules['1531741019'].mechanic('laŋx').out).toBe('laŋk');
    // [-lθ] > [-lt]:
    expect(sindarinRules['1531741019'].mechanic('malθ').out).toBe('malt'); // Only entry in Sindarin, deleted
    expect(sindarinRules['1531741019'].mechanic('m̥alθ').out).toBe('m̥alt'); // This is Noldorin
    expect(sindarinRules['1531741019'].mechanic('talθ').out).toBe('talt'); // This is Noldorin
  });

  it('04500 - nasals vanished before spirantal clusters', () => {
    expect(sindarinRules['1856165973'].mechanic('abc').out).toBe('abc');
    // [mf{lr}] > [øf{lr}]:
    expect(sindarinRules['1856165973'].mechanic('kamfru').out).toBe('kafru');
    expect(sindarinRules['1856165973'].mechanic('nimfraed').out).toBe('nifraed');
    // [nθ{lr}] > [øθ{lr}]:
    expect(sindarinRules['1856165973'].mechanic('kanθr').out).toBe('kaθr');
    expect(sindarinRules['1856165973'].mechanic('penθrond').out).toBe('peθrond');
    // [ns{lr}] > [øs{lr}]:
    expect(sindarinRules['1856165973'].mechanic('lansro').out).toBe('lasro'); // ᴹ✶la(n)sro-ndo > N. lhathron
    // [ŋx{lr}] > [øx{lr}]:
    expect(sindarinRules['1856165973'].mechanic('taŋxl').out).toBe('taxl');
    // [nf] > [ff]:
    expect(sindarinRules['1856165973'].mechanic('tanfa').out).toBe('taffa'); // Non-existent word
    // Loop issue fix:
    expect(sindarinRules['1856165973'].mechanic('clen').out).toBe('clen'); // From calenā
    // -nx is not a three-consonant cluster and not medial:
    expect(sindarinRules['1856165973'].mechanic('sunx').out).toBe('sunx');
    expect(sindarinRules['1856165973'].mechanic('ambaur').out).toBe('ambaur');
  });

  it('04600 - nasals vanished before morpheme boundaries', () => {
    expect(sindarinRules['3282356701'].mechanic('abc', { guess: true }).out).toBe('abc');
    expect(sindarinRules['3282356701'].mechanic('aranθorn', { guess: true }).out).toBe('araθorn');
    expect(sindarinRules['3282356701'].mechanic('aranphor', { guess: true }).out).toBe('araphor');
    expect(sindarinRules['3282356701'].mechanic('aranphant', { guess: true }).out).toBe('araphant');
    expect(sindarinRules['3282356701'].mechanic('infant', { guess: true }).out).toBe('ifant');
    expect(sindarinRules['3282356701'].mechanic('enpet', { guess: true }).out).toBe('epet');
    expect(sindarinRules['3282356701'].mechanic('in-chîn', { guess: true }).out).toBe('i-chîn');
    expect(sindarinRules['3282356701'].mechanic('i-ngelaidh', { guess: true }).out).toBe('i-ngelaidh');

    // Wrong guess:
    expect(sindarinRules['3282356701'].mechanic('inn-gelaidh', { guess: true }).out).toBe('in-gelaidh'); // Lacking examples, I've forced an error here.
    // Correct guess with a marker:
    expect(sindarinRules['3282356701'].mechanic('in-ngelaidh', { guess: true }).out).toBe('i-ngelaidh');
    // Correct guess with a bespoke marker:
    expect(sindarinRules['3282356701'].mechanic('in·ngelaidh', { guess: true, boundaryChar: '·' }).out).toBe('i·ngelaidh');
    // No guessing yields identical string:
    expect(sindarinRules['3282356701'].mechanic('inngelaidh', { guess: false }).out).toBe('inngelaidh');
  });

  it('04700 - [ð] vanished before nasals at morpheme boundaries', () => {
    expect(sindarinRules['3841960279'].mechanic('abc').out).toBe('abc');
    // Need to test this word: ✶khadmā > chaðw > haðw
    // It could be an exception that requires morphene boundaries again.
    expect(sindarinRules['3841960279'].mechanic('eleðndor', { guess: true }).out).toBe('elendor'); // Becomes Elennor
    expect(sindarinRules['3841960279'].mechanic('heleðmorn', { guess: true }).out).toBe('helemorn');
    expect(sindarinRules['3841960279'].mechanic('geleðndil', { guess: true }).out).toBe('gelendil');
    expect(sindarinRules['3841960279'].mechanic('geleðŋdil', { guess: true }).out).toBe('geleŋdil'); // Non-existent word
    // Shouldn't affect end of words:
    expect(sindarinRules['3841960279'].mechanic('goloð', { guess: true }).out).toBe('goloð');
  });

  it('04800 - voiced spirants restopped after nasals', () => {
    // There are no examples of this one so far.
    expect(sindarinRules['3123278727'].mechanic('abc').out).toBe('abc');
    // None of these exist:
    // -{mnŋ}{vðɣ}-] > [-{mnŋ}{bdg}-
    expect(sindarinRules['3123278727'].mechanic('tamvat').out).toBe('tambat');
    expect(sindarinRules['3123278727'].mechanic('tanðat').out).toBe('tandat');
    expect(sindarinRules['3123278727'].mechanic('tamðat').out).toBe('tamdat'); // This is an unlikely pair, but feasible in compounds.
    expect(sindarinRules['3123278727'].mechanic('taŋɣat').out).toBe('taŋgat');
    // No description, no examples, awaiting feedback on Lambegolmor.
  });

  it('04900 - medial [mf], [nθ], [ŋx], [lθ] became [mm], [nn], [ŋg], [ll]', () => {
    expect(sindarinRules['2996915415'].mechanic('abc').out).toBe('abc');
    // [-mf-] > [-mm-]:
    expect(sindarinRules['2996915415'].mechanic('gamfass').out).toBe('gammass'); // This is Noldorin
    // [-nθ-] > [-nn-]:
    expect(sindarinRules['2996915415'].mechanic('manθen').out).toBe('mannen');
    expect(sindarinRules['2996915415'].mechanic('danθa-').out).toBe('danna-');
    // [-ŋx-] > [-ŋg-]:
    expect(sindarinRules['2996915415'].mechanic('daŋxen').out).toBe('daŋgen');
    // [-lθ-] > [-ll-]:
    expect(sindarinRules['2996915415'].mechanic('malθorn').out).toBe('mallorn');
  });

  it('05000 - voiceless nasals were voiced', () => {
    expect(sindarinRules['725943271'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['725943271'].mechanic('n̥aeð').out).toBe('naeð');
    expect(sindarinRules['725943271'].mechanic('m̥alð').out).toBe('malð'); // Noldorin
  });

  it('05100 - long vowels shortened before clusters', () => {
    expect(sindarinRules['2083930569'].mechanic('xyz').out).toBe('xyz');
    // Exceptions:
    expect(sindarinRules['2083930569'].mechanic('círdan').out).toBe('círdan');
    expect(sindarinRules['2083930569'].mechanic('dírhael').out).toBe('dírhael');
    expect(sindarinRules['2083930569'].mechanic('íðra').out).toBe('íðra');
    expect(sindarinRules['2083930569'].mechanic('mírdain').out).toBe('mírdain');
    expect(sindarinRules['2083930569'].mechanic('nírnaeθ').out).toBe('nírnaeθ');
    // Regular cases:
    expect(sindarinRules['2083930569'].mechanic('hīθlūm').out).toBe('hiθlūm');
    expect(sindarinRules['2083930569'].mechanic('roxīrrim').out).toBe('roxirrim');
    expect(sindarinRules['2083930569'].mechanic('gūrgov').out).toBe('gurgov');
    expect(sindarinRules['2083930569'].mechanic('ȳlm').out).toBe('ylm');
  });

  it('05200 - [ī], [ū] often shortened in polysyllables', () => {
    expect(sindarinRules['302560565'].mechanic('abc').out).toBe('abc');
    // Final syllable shortening:
    expect(sindarinRules['302560565'].mechanic('ithīl').out).toBe('ithil');
    expect(sindarinRules['302560565'].mechanic('pelīn').out).toBe('pelin');
    expect(sindarinRules['302560565'].mechanic('gwanūr').out).toBe('gwanur');
    // Regular examples:
    expect(sindarinRules['302560565'].mechanic('alfirīn').out).toBe('alfirin');
    expect(sindarinRules['302560565'].mechanic('firīn').out).toBe('firin');
    expect(sindarinRules['302560565'].mechanic('onūr').out).toBe('onur');
    // Stressed syllables without shortening:
    // expect(sindarinRules['302560565'].mechanic('inīðen').out).toBe('iniðen');
    // expect(sindarinRules['302560565'].mechanic('rīθant').out).toBe('riθant');
    // expect(sindarinRules['302560565'].mechanic('nīniel').out).toBe('niniel');
    // expect(sindarinRules['302560565'].mechanic('mūda-').out).toBe('muda-'); // Noldorin

    // No shortening:
    expect(sindarinRules['302560565'].mechanic('dínen').out).toBe('dínen');
    expect(sindarinRules['302560565'].mechanic('rhúnen').out).toBe('rhúnen');
    expect(sindarinRules['302560565'].mechanic('túrin').out).toBe('túrin');
    // Exceptions:
    // (These are unclear how they came to be.)
    expect(sindarinRules['302560565'].mechanic('curunír').out).toBe('curunír');
    expect(sindarinRules['302560565'].mechanic('elurín').out).toBe('elurín');
    expect(sindarinRules['302560565'].mechanic('glanhír').out).toBe('glanhír');
    expect(sindarinRules['302560565'].mechanic('nauglamír').out).toBe('nauglamír');
    expect(sindarinRules['302560565'].mechanic('aranrúth').out).toBe('aranrúth');
  });

  it('05300 - [awa] sometimes became [au]', () => {
    expect(sindarinRules['671129175'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['671129175'].mechanic('glawar').out).toBe('glaur');
    expect(sindarinRules['671129175'].mechanic('awadhel').out).toBe('audhel');
    expect(sindarinRules['671129175'].mechanic('cawathon').out).toBe('cauthon'); // Marked with a ? by JRRT

    // Presumed stress on the "aw" (all words above have stress on "aw"):
    // expect(sindarinRules['671129175'].mechanic('awarth').out).toBe('awarth');
    // expect(sindarinRules['671129175'].mechanic('gawad').out).toBe('gawad');
  });

  it('05400 - [au], [ae] became [o], [e] in polysyllables', () => {
    expect(sindarinRules['567222053'].mechanic('abc').out).toBe('abc');
    // Regular examples:
    expect(sindarinRules['567222053'].mechanic('aegnaur').out).toBe('aegnor');
    expect(sindarinRules['567222053'].mechanic('arθaur').out).toBe('arθor');
    expect(sindarinRules['567222053'].mechanic('elau').out).toBe('elo');
    expect(sindarinRules['567222053'].mechanic('findraud').out).toBe('findrod');
    expect(sindarinRules['567222053'].mechanic('magalaur').out).toBe('magalor');
    expect(sindarinRules['567222053'].mechanic('r̥auvan').out).toBe('r̥ovan');
    expect(sindarinRules['567222053'].mechanic('θauniel').out).toBe('θoniel');

    // Exceptions:
    expect(sindarinRules['567222053'].mechanic('Bauglir').out).toBe('Bauglir');
    expect(sindarinRules['567222053'].mechanic('Naugrim').out).toBe('Naugrim');
    expect(sindarinRules['567222053'].mechanic('Rhudaur').out).toBe('Rhudaur');

    // Long o:
    expect(sindarinRules['567222053'].mechanic('Glauredhel').out).toBe('Glóredhel');
    expect(sindarinRules['567222053'].mechanic('Rathlauriel').out).toBe('Rathlóriel');

    // Ae to e:
    expect(sindarinRules['567222053'].mechanic('nifraed').out).toBe('nifred');
    expect(sindarinRules['567222053'].mechanic('naegro').out).toBe('negro');
    expect(sindarinRules['567222053'].mechanic('athaelas').out).toBe('athelas');

    // Monosyllables are not affected:
    expect(sindarinRules['567222053'].mechanic('laug').out).toBe('laug');
  });

  it('05500 - [lð] became [ll]', () => {
    expect(sindarinRules['226282629'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['226282629'].mechanic('elð').out).toBe('ell');
    expect(sindarinRules['226282629'].mechanic('kolð').out).toBe('koll');
    expect(sindarinRules['226282629'].mechanic('melðond').out).toBe('mellond');
    expect(sindarinRules['226282629'].mechanic('tindūmielð').out).toBe('tindūmiell');
  });

  it('05600 - [nl] became [ll]', () => {
    expect(sindarinRules['2759811879'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2759811879'].mechanic('mithrenlass').out).toBe('mithrellass');
    expect(sindarinRules['2759811879'].mechanic('Finenlach').out).toBe('Finellach');
    expect(sindarinRules['2759811879'].mechanic('caranluin').out).toBe('caralluin');
    expect(sindarinRules['2759811879'].mechanic('minlamad').out).toBe('minlamad');
    expect(sindarinRules['2759811879'].mechanic('Gonlin').out).toBe('Gonlin');
    expect(sindarinRules['2759811879'].mechanic('Mindonluin').out).toBe('Mindolluin');
  });

  it('05700 - [mb|nd] became [mm|nn]', () => {
    expect(sindarinRules['868023175'].mechanic('abc').out).toBe('abc');
    // mb > mm:
    expect(sindarinRules['868023175'].mechanic('ambar').out).toBe('ammar');
    expect(sindarinRules['868023175'].mechanic('ambarθ').out).toBe('ammarθ');
    expect(sindarinRules['868023175'].mechanic('dymb').out).toBe('dymm');
    expect(sindarinRules['868023175'].mechanic('galaðremben').out).toBe('galaðremmen');
    expect(sindarinRules['868023175'].mechanic('l̥imb').out).toBe('l̥imm');
    // Medial nd > nn:
    expect(sindarinRules['868023175'].mechanic('edlandor').out).toBe('edlannor');
    expect(sindarinRules['868023175'].mechanic('gelendil').out).toBe('gelennil');
    expect(sindarinRules['868023175'].mechanic('pelendor').out).toBe('pelennor');
    expect(sindarinRules['868023175'].mechanic('roxand').out).toBe('roxann');
    // Odd cases:
    // Need to ask about this one:
    // expect(sindarinRules['868023175'].mechanic('andond').out).toBe('andonn');
    // These seem to be general examples of nn in late Sindarin (all monosyllables):
    // expect(sindarinRules['868023175'].mechanic('grond').out).toBe('gronn');
    // expect(sindarinRules['868023175'].mechanic('θind').out).toBe('θinn');
    // Exceptions:
    expect(sindarinRules['868023175'].mechanic('thond').out).toBe('thond');
    expect(sindarinRules['868023175'].mechanic('Andros').out).toBe('Andros');
    expect(sindarinRules['868023175'].mechanic('nand').out).toBe('nand');
    expect(sindarinRules['868023175'].mechanic('band').out).toBe('band');
    expect(sindarinRules['868023175'].mechanic('gond').out).toBe('gond');
    expect(sindarinRules['868023175'].mechanic('gwend').out).toBe('gwend');
    expect(sindarinRules['868023175'].mechanic('lond').out).toBe('lond');
    expect(sindarinRules['868023175'].mechanic('rond').out).toBe('rond');
    // Ask about the case of elmbereth!
  });

  it('05800 - middle consonants frequently vanished in clusters', () => {
    // This rule is a placeholder and all tests experimental.
    expect(sindarinRules['3868328117'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3868328117'].mechanic('elmbereth').out).toBe('elbereth');
    expect(sindarinRules['3868328117'].mechanic('findrod').out).toBe('finrod');
    expect(sindarinRules['3868328117'].mechanic('gondndor').out).toBe('gondor');
    // expect(sindarinRules['3868328117'].mechanic('lennmbas').out).toBe('lenbas');
    expect(sindarinRules['3868328117'].mechanic('milmbar').out).toBe('milbar');
    expect(sindarinRules['3868328117'].mechanic('morŋgoθ').out).toBe('morgoθ');
    // expect(sindarinRules['3868328117'].mechanic('tenngyll').out).toBe('tengyll');
  });

  it('05900 - medial [s] became [θ] before [l], [r]', () => {
    expect(sindarinRules['3736793827'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3736793827'].mechanic('kasrae').out).toBe('kaθrae');
    expect(sindarinRules['3736793827'].mechanic('oslond').out).toBe('oθlond');
    expect(sindarinRules['3736793827'].mechanic('casrae').out).toBe('caθrae'); // cas-raya
    // Doesn't match initial and final clusters:
    expect(sindarinRules['3736793827'].mechanic('asl').out).toBe('asl');
    expect(sindarinRules['3736793827'].mechanic('sra').out).toBe('sra');
  });

  it('06000 - [wo] became [o]', () => {
    expect(sindarinRules['586391091'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['586391091'].mechanic('gwo-').out).toBe('go-');
    expect(sindarinRules['586391091'].mechanic('gwolass').out).toBe('golass');
    expect(sindarinRules['586391091'].mechanic('gwovannen').out).toBe('govannen');
  });

  it('06100 - [n] assimilated to following labial', () => {
    expect(sindarinRules['1126284559'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1126284559'].mechanic('lenbas').out).toBe('lembas');
    expect(sindarinRules['1126284559'].mechanic('danmen-').out).toBe('dammen-');
  });

  it('06200 - [œ] became [e]', () => {
    expect(sindarinRules['1838610927'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1838610927'].mechanic('œgyl').out).toBe('egyl');
    expect(sindarinRules['1838610927'].mechanic('œnnin').out).toBe('ennin');
    expect(sindarinRules['1838610927'].mechanic('gœlyð').out).toBe('gelyð');
    expect(sindarinRules['1838610927'].mechanic('gœria-').out).toBe('geria-');
    expect(sindarinRules['1838610927'].mechanic('θœly').out).toBe('θely');
  });

  it('06300 - final [ll], [nn], [ss] shortened in polysyllables', () => {
    expect(sindarinRules['1742178057'].mechanic('abc').out).toBe('abc');
    // -SSll > -SSl:
    expect(sindarinRules['1742178057'].mechanic('galadriell').out).toBe('galadriel');
    expect(sindarinRules['1742178057'].mechanic('tengyll', { yAsVowel: true }).out).toBe('tengyl'); // Monosyllable!?
    expect(sindarinRules['1742178057'].mechanic('terxill').out).toBe('terxil');
    expect(sindarinRules['1742178057'].mechanic('tinnūmiell').out).toBe('tinnūmiel');
    // -SSnn > -SSn:
    expect(sindarinRules['1742178057'].mechanic('annonn').out).toBe('annon');
    expect(sindarinRules['1742178057'].mechanic('glewellinn').out).toBe('glewellin');
    expect(sindarinRules['1742178057'].mechanic('mellonn').out).toBe('mellon');
    // -SSss > -SSs:
    expect(sindarinRules['1742178057'].mechanic('avrass').out).toBe('avras');
    expect(sindarinRules['1742178057'].mechanic('falass').out).toBe('falas');
    expect(sindarinRules['1742178057'].mechanic('karaðrass').out).toBe('karaðras');
    expect(sindarinRules['1742178057'].mechanic('karaðraſ').out).toBe('karaðras');
    // Monosyllables are not affected:
    expect(sindarinRules['1742178057'].mechanic('lass').out).toBe('lass');
    expect(sindarinRules['1742178057'].mechanic('noss').out).toBe('noss');
    expect(sindarinRules['1742178057'].mechanic('ball').out).toBe('ball'); // Non-existent word
    expect(sindarinRules['1742178057'].mechanic('bann').out).toBe('bann'); // Non-existent word
    // Medial clusters are not affected:
    expect(sindarinRules['1742178057'].mechanic('uimallen').out).toBe('uimallen');
    expect(sindarinRules['1742178057'].mechanic('lissuin').out).toBe('lissuin');
    expect(sindarinRules['1742178057'].mechanic('ninniach').out).toBe('ninniach');
  });

  it('06400 - final and initial [ŋg] became [ŋ]', () => {
    expect(sindarinRules['311523279'].mechanic('abc').out).toBe('abc');
    // Initial:
    expect(sindarinRules['311523279'].mechanic('ŋguruthos').out).toBe('ŋuruthos');
    // Final:
    expect(sindarinRules['311523279'].mechanic('aŋg').out).toBe('aŋ');
    expect(sindarinRules['311523279'].mechanic('laŋg').out).toBe('laŋ');
    expect(sindarinRules['311523279'].mechanic('riŋg').out).toBe('riŋ');
    // Ignore medial:
    expect(sindarinRules['311523279'].mechanic('baŋgab').out).toBe('baŋgab'); // Non-existent word
    expect(sindarinRules['311523279'].mechanic('baŋgabaŋg').out).toBe('baŋgabaŋ'); // Non-existent word
  });

  it('06500 - [Vm|{lr}m|m{mbp}] > [Vv|{lr}v|m{mbp}]', () => {
    expect(sindarinRules['1951379117'].mechanic('abc').out).toBe('abc');
    // [Vm] > [Vv]:
    expect(sindarinRules['1951379117'].mechanic('araum').out).toBe('arauv');
    expect(sindarinRules['1951379117'].mechanic('dūm').out).toBe('dūv');
    expect(sindarinRules['1951379117'].mechanic('helemorn').out).toBe('helevorn');
    expect(sindarinRules['1951379117'].mechanic('hiθlūm').out).toBe('hiθlūv');
    expect(sindarinRules['1951379117'].mechanic('laman').out).toBe('lavan');
    expect(sindarinRules['1951379117'].mechanic('tinnūmiel').out).toBe('tinnūviel');
    // [lm] > [lv]:
    expect(sindarinRules['1951379117'].mechanic('nindalm').out).toBe('nindalv');
    expect(sindarinRules['1951379117'].mechanic('talm').out).toBe('talv');
    expect(sindarinRules['1951379117'].mechanic('ylm').out).toBe('ylv');
    // [rm] > [rv]:
    expect(sindarinRules['1951379117'].mechanic('barm').out).toBe('barv'); // Non-existent word
    // [ðm] > [ðv]:
    expect(sindarinRules['1951379117'].mechanic('haðm').out).toBe('haðv');
    expect(sindarinRules['1951379117'].mechanic('haðma-').out).toBe('haðva-');
    // [mm] > [mm]:
    expect(sindarinRules['1951379117'].mechanic('domm').out).toBe('domm');
    expect(sindarinRules['1951379117'].mechanic('galaðremmen').out).toBe('galaðremmen');
    expect(sindarinRules['1951379117'].mechanic('nimm').out).toBe('nimm');
    expect(sindarinRules['1951379117'].mechanic('tumm').out).toBe('tumm');
    // [mb] > [mb]:
    expect(sindarinRules['1951379117'].mechanic('ambō').out).toBe('ambō'); // Not on Eldamo's examples
    // [mp] > [mp]:
    expect(sindarinRules['1951379117'].mechanic('gamp').out).toBe('gamp');
    expect(sindarinRules['1951379117'].mechanic('nimp').out).toBe('nimp');
  });

  it('06600 - [ðv] became [ðw]', () => {
    expect(sindarinRules['2192660503'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2192660503'].mechanic('buðv').out).toBe('buðw');
    expect(sindarinRules['2192660503'].mechanic('haðv').out).toBe('haðw');
    expect(sindarinRules['2192660503'].mechanic('haðva-').out).toBe('haðwa-');
  });

  it('06700 - [mm] shortened', () => {
    expect(sindarinRules['3689144303'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3689144303'].mechanic('ammar').out).toBe('amar');
    expect(sindarinRules['3689144303'].mechanic('ammarθ').out).toBe('amarθ');
    expect(sindarinRules['3689144303'].mechanic('eglammar').out).toBe('eglamar');
    expect(sindarinRules['3689144303'].mechanic('galaðremmen').out).toBe('galaðremen');
    expect(sindarinRules['3689144303'].mechanic('kamm').out).toBe('kam');
    expect(sindarinRules['3689144303'].mechanic('l̥imm').out).toBe('l̥im');
    expect(sindarinRules['3689144303'].mechanic('remmen').out).toBe('remen');
    expect(sindarinRules['3689144303'].mechanic('tumm').out).toBe('tum');
    // Retain [mm] if the first syllable is stressed: (?)
    expect(sindarinRules['3689144303'].mechanic('ammor').out).toBe('ammor');
  });

  it('06800 - final [v] became [w] after [ae], [oe], and sometimes [i]', () => {
    expect(sindarinRules['3909760699'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['3909760699'].mechanic('gwaev').out).toBe('gwaew');
    expect(sindarinRules['3909760699'].mechanic('raev').out).toBe('raew');
    expect(sindarinRules['3909760699'].mechanic('l̥oev').out).toBe('l̥oew');
    expect(sindarinRules['3909760699'].mechanic('oev').out).toBe('oew');
  });

  it('06900 - final [w], [v] vanished after [u]', () => {
    expect(sindarinRules['70600889'].mechanic('abc').out).toBe('abc');
    // [-ov] > [-ou]:
    expect(sindarinRules['70600889'].mechanic('orov').out).toBe('orou');
    // [-uv] > [-u]:
    expect(sindarinRules['70600889'].mechanic('arauv').out).toBe('arau');
    expect(sindarinRules['70600889'].mechanic('drūv').out).toBe('drū');
    expect(sindarinRules['70600889'].mechanic('hiθlūv').out).toBe('hiθlū');
    // [-uw] > [-u]:
    expect(sindarinRules['70600889'].mechanic('r̥auw').out).toBe('r̥au');
  });

  it('07000 - [ou] became [au]', () => {
    expect(sindarinRules['2476983755'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['2476983755'].mechanic('l̥ou').out).toBe('l̥aw');
    expect(sindarinRules['2476983755'].mechanic('lou').out).toBe('law');
    expect(sindarinRules['2476983755'].mechanic('orou', { useFinalU: true }).out).toBe('orau');
  });

  it('07100 - long voiceless spirants shortened', () => {
    expect(sindarinRules['1206014597'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1206014597'].mechanic('axx').out).toBe('ax');
    expect(sindarinRules['1206014597'].mechanic('exxad-').out).toBe('exad-');
    expect(sindarinRules['1206014597'].mechanic('exxant').out).toBe('exant');
    expect(sindarinRules['1206014597'].mechanic('roxx').out).toBe('rox');
    expect(sindarinRules['1206014597'].mechanic('roχχ').out).toBe('roχ');
    expect(sindarinRules['1206014597'].mechanic('groθθ').out).toBe('groθ');
    expect(sindarinRules['1206014597'].mechanic('lebeθθron').out).toBe('lebeθron');
    expect(sindarinRules['1206014597'].mechanic('morgoθθ').out).toBe('morgoθ');
    // Using roman clusters:
    expect(sindarinRules['1206014597'].mechanic('morgotth').out).toBe('morgoθ');
    expect(sindarinRules['1206014597'].mechanic('appharxa').out).toBe('afarxa');
    expect(sindarinRules['1206014597'].mechanic('apɸarxa').out).toBe('afarxa');
    expect(sindarinRules['1206014597'].mechanic('rokkō').out).toBe('roxō');
  });

  it('07200 - final [l], [r] became syllabic', () => {
    expect(sindarinRules['1942165347'].mechanic('aeu').out).toBe('aeu');
    expect(sindarinRules['1942165347'].mechanic('naθl').out).toBe('naθol');
    expect(sindarinRules['1942165347'].mechanic('ogl').out).toBe('ogol');
    expect(sindarinRules['1942165347'].mechanic('oθl').out).toBe('oθol');
    expect(sindarinRules['1942165347'].mechanic('tagl').out).toBe('tagol');
    expect(sindarinRules['1942165347'].mechanic('taxl').out).toBe('taxol');
    expect(sindarinRules['1942165347'].mechanic('ygl').out).toBe('ygil');
    expect(sindarinRules['1942165347'].mechanic('dagr').out).toBe('dagor');
    expect(sindarinRules['1942165347'].mechanic('sadr').out).toBe('sador');
    // Don't apply to double consonants:
    expect(sindarinRules['1942165347'].mechanic('mell').out).toBe('mell');
  });

  it('07300 - final [vn] became [von]', () => {
    expect(sindarinRules['2569469231'].mechanic('abc').out).toBe('abc');
    // Noldorin:
    expect(sindarinRules['2569469231'].mechanic('dravn').out).toBe('dravon');
    // Only Sindarin (counter) example:
    expect(sindarinRules['2569469231'].mechanic('tavn').out).toBe('tavn');
  });

  it('07400 - final [w] usually became [u]', () => {
    expect(sindarinRules['798091205'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['798091205'].mechanic('alw').out).toBe('alu');
    expect(sindarinRules['798091205'].mechanic('buðw').out).toBe('buðu');
    expect(sindarinRules['798091205'].mechanic('gwanw').out).toBe('gwanu');
    expect(sindarinRules['798091205'].mechanic('kurw').out).toBe('kuru');
    expect(sindarinRules['798091205'].mechanic('faw').out).toBe('fau');
  });

  it('07500 - final [rr] became [r]', () => {
    expect(sindarinRules['1254294665'].mechanic('abc').out).toBe('abc');
    // Only example, and it's Noldorin:
    expect(sindarinRules['1254294665'].mechanic('gaerr').out).toBe('gaer');
  });

  it('07600 - [sk], [sp] usually became [sg], [sb]', () => {
    expect(sindarinRules['1759587217'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['1759587217'].mechanic('eskal').out).toBe('esgal');
    expect(sindarinRules['1759587217'].mechanic('espin').out).toBe('esbin');
    // Multiple replacements:
    expect(sindarinRules['1759587217'].mechanic('aspaskab').out).toBe('asbasgab'); // Non-existent word
  });

  it('07700 - medial [x] became [h] in Gondorian pronunciation', () => {
    expect(sindarinRules['4188321265'].mechanic('abc').out).toBe('abc');
    // Note: 'rochan' is a digraph form ('ch') - use 'roxan' for single-char form
    expect(sindarinRules['4188321265'].mechanic('roxan').out).toBe('rohan');
    expect(sindarinRules['4188321265'].mechanic('roχan').out).toBe('rohan');
    // Don't apply to initials and finals:
    expect(sindarinRules['4188321265'].mechanic('xan').out).toBe('xan'); // Non-existent word
    expect(sindarinRules['4188321265'].mechanic('rox').out).toBe('rox'); // Non-existent word
    expect(sindarinRules['4188321265'].mechanic('χan').out).toBe('χan'); // Non-existent word
  });

  it('07800 - voiced spirants unvoiced before voiceless spirants', () => {
    expect(sindarinRules['132402625'].mechanic('abc').out).toBe('abc');
    expect(sindarinRules['132402625'].mechanic('iovhog').out).toBe('iofog'); // iovhug / jovhug (Noldorin)
    expect(sindarinRules['132402625'].mechanic('galaðhir').out).toBe('galaθir');
  });
});