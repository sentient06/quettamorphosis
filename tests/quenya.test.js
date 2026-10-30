import { describe, it, expect } from "vitest";
import { quenyaRules } from "../src/quenya.js";
import { digraphsToSingle, singleToDigraphs } from "../src/utils.js";

// Helper to convert test input to single-char form (simulating pre-processing)
const toSingle = (str) => digraphsToSingle(str);

describe('Quenya rules', () => {
  it('00100 - [nm|ŋm] > [nw|ŋgw]', () => {
    expect(quenyaRules['1197128543'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['1197128543'].mechanic('anmā').out).toBe('anwā');
    expect(quenyaRules['1197128543'].mechanic('lenmē').out).toBe('lenwē');
    expect(quenyaRules['1197128543'].mechanic('teŋmā').out).toBe('teŋgwā');
    expect(quenyaRules['1197128543'].mechanic('waŋme').out).toBe('waŋgwe');
    
    const compound = quenyaRules['1197128543'].mechanic('nanmen', { morphemes: ['nan', 'men'] });
    expect(compound.out).toEqual('nanwen');
    expect(compound.morphemes).toEqual(['nan', 'wen']);

    const compound2 = quenyaRules['1197128543'].mechanic('waŋme', { morphemes: ['waŋ', 'me'] });
    expect(compound2.out).toEqual('waŋgwe');
    expect(compound2.morphemes).toEqual(['waŋ', 'gwe']);
  });

  it('00200 - [{iu}ŋn] > [V̄øn]', () => {
    expect(quenyaRules['2035963219'].mechanic('abc').out).toBe('abc');
    
    expect(quenyaRules['2035963219'].mechanic('teŋmā', { includeE: true, includeM: true }).out).toBe('tēmā');
    expect(quenyaRules['2035963219'].mechanic('riŋna').out).toBe('rīna');
    // Middle Quenya:
    expect(quenyaRules['2035963219'].mechanic('luŋne').out).toBe('lūne'); // Middle Quenya
    expect(quenyaRules['2035963219'].mechanic('θuŋnā').out).toBe('θūnā'); // Middle Quenya
    // Other examples:
    expect(quenyaRules['2035963219'].mechanic('raŋne', { includeA: true }).out).toBe('rāne'); // Middle Quenya
    expect(quenyaRules['2035963219'].mechanic('toŋnā', { includeO: true }).out).toBe('tōnā'); // Non-existent word
  });

  it('00300 - [-{nŋlr}ŋ-] > [-{nŋlr}g-]', () => {
    expect(quenyaRules['447633467'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['447633467'].mechanic('morŋoθ').out).toBe('morgoθ');
    // All non-existent words:
    expect(quenyaRules['447633467'].mechanic('banŋba').out).toBe('bangba');
    expect(quenyaRules['447633467'].mechanic('baŋŋba').out).toBe('baŋgba');
    expect(quenyaRules['447633467'].mechanic('balŋba').out).toBe('balgba');
    expect(quenyaRules['447633467'].mechanic('barŋba').out).toBe('bargba');
  });

  it('00400 - [ei|ou] > [ī|ū]', () => {
    expect(quenyaRules['2315722009'].mechanic('abc').out).toBe('abc');

    // ei > ī
    // ou > ū
    // but
    // ei > ē after y
    // ou > ō after w
    
    expect(quenyaRules['2315722009'].mechanic('keneite').out).toBe('kenīte');
    expect(quenyaRules['2315722009'].mechanic('laſeinen').out).toBe('laſīnen');
    expect(quenyaRules['2315722009'].mechanic('meinā').out).toBe('mīnā');
    expect(quenyaRules['2315722009'].mechanic('lou').out).toBe('lū');
    expect(quenyaRules['2315722009'].mechanic('loun').out).toBe('lūn');
    
    // No examples of the ones below. All words are non-existent.
    expect(quenyaRules['2315722009'].mechanic('bjeiba').out).toBe('bjēba');
    expect(quenyaRules['2315722009'].mechanic('bwouba').out).toBe('bwōba');
    // Regular change when j and w are not immediately before the diphthong:
    expect(quenyaRules['2315722009'].mechanic('bjbeiba').out).toBe('bjbība');
    expect(quenyaRules['2315722009'].mechanic('bwbouba').out).toBe('bwbūba');
  });

  it('00500 - [ji|wu] > [i|u]', () => {
    expect(quenyaRules['1167483479'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['1167483479'].mechanic('orōrjie').out).toBe('orōrie');
    expect(quenyaRules['1167483479'].mechanic('awuva').out).toBe('auva');
  });

  it('00600 - [V̄jV] > [VijV]', () => {
    expect(quenyaRules['3458631869'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['3458631869'].mechanic('ājan').out).toBe('aijan');
    expect(quenyaRules['3458631869'].mechanic('lājā').out).toBe('laijā');
    expect(quenyaRules['3458631869'].mechanic('mājar').out).toBe('maijar');
    expect(quenyaRules['3458631869'].mechanic('mōja').out).toBe('moija');
  });

  it('00700 - [{rl}{ɸθxð}|lβ] > [{rl}{ptkd}|lb]', () => {
    expect(quenyaRules['3516399115'].mechanic('abc').out).toBe('abc');
    // lx > lk:
    expect(quenyaRules['3516399115'].mechanic('tulxast').out).toBe('tulkast');
    // lð > ld:
    expect(quenyaRules['3516399115'].mechanic('ɣalðā').out).toBe('ɣaldā');
    // lð > ld:
    expect(quenyaRules['3516399115'].mechanic('-lðe').out).toBe('-lde');
    // lβ > lb:
    expect(quenyaRules['3516399115'].mechanic('olβā').out).toBe('olbā');
    // rx > rk:
    expect(quenyaRules['3516399115'].mechanic('tarxildī').out).toBe('tarkildī');
    // rɸ > rp:
    expect(quenyaRules['3516399115'].mechanic('arɸō').out).toBe('arpō');
    // rθ > rt:
    expect(quenyaRules['3516399115'].mechanic('cerθa').out).toBe('certa');

    // Non-existent words:
    // lɸ > lp:
    expect(quenyaRules['3516399115'].mechanic('alɸa').out).toBe('alpa');
    // lθ > lt:
    expect(quenyaRules['3516399115'].mechanic('alθa').out).toBe('alta');
    // rð > rd:
    expect(quenyaRules['3516399115'].mechanic('arða').out).toBe('arda');
    // rβ remains:
    expect(quenyaRules['3516399115'].mechanic('arβa').out).toBe('arβa');
    // Several in one word:
    expect(quenyaRules['3516399115'].mechanic('arðalθa').out).toBe('ardalta');

    // Keeping [θ] after liquids:
    // ᴹ√NOROTH > ᴹQ. norsa:
    expect(quenyaRules['3516399115'].mechanic('norθa', { keepTheta: true }).out).toBe('norθa');
    expect(quenyaRules['3516399115'].mechanic('cerθa', { keepTheta: true }).out).toBe('cerθa');
    expect(quenyaRules['3516399115'].mechanic('alθa', { keepTheta: true }).out).toBe('alθa');
    expect(quenyaRules['3516399115'].mechanic('tulxast', { keepTheta: true }).out).toBe('tulkast');
    expect(quenyaRules['3516399115'].mechanic('arðalθa', { keepTheta: true }).out).toBe('ardalθa');

    // Keeping [lβ]:
    // Q. olva (S/45):
    expect(quenyaRules['3516399115'].mechanic('olβā', { keepLBeta: true }).out).toBe('olβā');
    expect(quenyaRules['3516399115'].mechanic('ɣalðā', { keepLBeta: true }).out).toBe('ɣaldā');
    expect(quenyaRules['3516399115'].mechanic('cerθa', { keepLBeta: true }).out).toBe('certa');
  });

  it('00800 - [mɸ|nθ|ŋx|nð] > [mp|nt|ŋk|nd]', () => {
    expect(quenyaRules['545708645'].mechanic('abc').out).toBe('abc');

    // [mɸ] > [mp]:
    expect(quenyaRules['545708645'].mechanic('bamɸaba').out).toBe('bampaba'); // Non-existent word
    // [nθ] > [nt]:
    expect(quenyaRules['545708645'].mechanic('banθaba').out).toBe('bantaba'); // Non-existent word
    // [ŋx] > [ŋk]:
    expect(quenyaRules['545708645'].mechanic('baŋxaba').out).toBe('baŋkaba'); // Non-existent word

    // [nð] > [nd]:
    // The only example:
    expect(quenyaRules['545708645'].mechanic('inðil').out).toBe('indil');
  });

  it('00900 - [wo-] > [o-]', () => {
    expect(quenyaRules['1082322649'].mechanic('abc').out).toBe('abc');
    
    // Only real example that matters:
    expect(quenyaRules['1082322649'].mechanic('wo-').out).toBe('o-');

    // All of these are non-existent words:
    expect(quenyaRules['1082322649'].mechanic('wolme').out).toBe('olme');
    expect(quenyaRules['1082322649'].mechanic('wome').out).toBe('ome');
    expect(quenyaRules['1082322649'].mechanic('bawome').out).toBe('bawome');
    expect(quenyaRules['1082322649'].mechanic('bawome', { replaceAll: true }).out).toBe('baome');
  });

  it('01000 - [w-|VwV|aiw] > [β-|VβV|aiw]', () => {
    expect(quenyaRules['3625908403'].mechanic('abc').out).toBe('abc');
    
    // VwV > VβV:
    expect(quenyaRules['3625908403'].mechanic('atjāwiē').out).toBe('atjāβiē');
    expect(quenyaRules['3625908403'].mechanic('kēwā').out).toBe('kēβā');
    expect(quenyaRules['3625908403'].mechanic('miruwōre').out).toBe('miruβōre');
    expect(quenyaRules['3625908403'].mechanic('tāwa').out).toBe('tāβa');
    expect(quenyaRules['3625908403'].mechanic('tāwa').out).toBe('tāβa');
    // w- > β-:
    expect(quenyaRules['3625908403'].mechanic('wā').out).toBe('βā');
    expect(quenyaRules['3625908403'].mechanic('waile').out).toBe('βaile');
    expect(quenyaRules['3625908403'].mechanic('waŋgwē').out).toBe('βaŋgwē');
    expect(quenyaRules['3625908403'].mechanic('wanjar').out).toBe('βanjar');
    expect(quenyaRules['3625908403'].mechanic('weɣō').out).toBe('βeɣō');
    expect(quenyaRules['3625908403'].mechanic('wīne').out).toBe('βīne');
    // aiw > aiw:
    expect(quenyaRules['3625908403'].mechanic('waiwai').out).toBe('βaiwai');
    expect(quenyaRules['3625908403'].mechanic('raiwe').out).toBe('raiwe');
  });

  it('01100 - [ɣ] > [ø]', () => {
    expect(quenyaRules['1833409085'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['1833409085'].mechanic('ɣaikā', { gBecameSpirantal: true }).out).toBe('aikā');
    expect(quenyaRules['1833409085'].mechanic('ɣaira', { gBecameSpirantal: true }).out).toBe('aira');
    expect(quenyaRules['1833409085'].mechanic('ɣalalme', { gBecameSpirantal: true }).out).toBe('alalme');
    expect(quenyaRules['1833409085'].mechanic('ɣaldā', { gBecameSpirantal: true }).out).toBe('aldā');
    expect(quenyaRules['1833409085'].mechanic('ɣaldarembinā', { gBecameSpirantal: true }).out).toBe('aldarembinā');
    expect(quenyaRules['1833409085'].mechanic('ɣaltarīɣelle', { gBecameSpirantal: true }).out).toBe('altarīelle');
    expect(quenyaRules['1833409085'].mechanic('aɣwalda', { gBecameSpirantal: true }).out).toBe('awalda');
    expect(quenyaRules['1833409085'].mechanic('kaltārīɣelle', { gBecameSpirantal: true }).out).toBe('kaltārīelle');
    expect(quenyaRules['1833409085'].mechanic('λoɣa', { gBecameSpirantal: true }).out).toBe('λoa');
    expect(quenyaRules['1833409085'].mechanic('ŋaltārīɣel', { gBecameSpirantal: true }).out).toBe('ŋaltārīel');
    expect(quenyaRules['1833409085'].mechanic('rīɣā', { gBecameSpirantal: true }).out).toBe('rīā');
    expect(quenyaRules['1833409085'].mechanic('uɣi', { gBecameSpirantal: true }).out).toBe('ui');
    expect(quenyaRules['1833409085'].mechanic('-weɣ', { gBecameSpirantal: true }).out).toBe('-we');
    expect(quenyaRules['1833409085'].mechanic('βeɣo', { gBecameSpirantal: true }).out).toBe('βeo');
  });

  it('01200 - [ae|ao|ā{ĕŏ}] > [ē|ō|ā]', () => {
    expect(quenyaRules['1132141441'].mechanic('abc').out).toBe('abc');

    expect(quenyaRules['1132141441'].mechanic('taorme').out).toBe('tōrme');

    // Non-existent words:
    expect(quenyaRules['1132141441'].mechanic('baeba').out).toBe('bēba');
    expect(quenyaRules['1132141441'].mechanic('baoba').out).toBe('bōba');
    expect(quenyaRules['1132141441'].mechanic('bāeba').out).toBe('bāba');
    expect(quenyaRules['1132141441'].mechanic('bāoba').out).toBe('bāba');
  });

  it('01300 - [ɸu] > [hu]', () => {
    expect(quenyaRules['1102872571'].mechanic('abc').out).toBe('abc');
    // Only one example:
    expect(quenyaRules['1102872571'].mechanic('ɸuinē').out).toBe('huinē');
  });

  it('01400 - [Vβu] > [Vu]', () => {
    expect(quenyaRules['1771463731'].mechanic('abc').out).toBe('abc');
    // Only one example:
    expect(quenyaRules['1771463731'].mechanic('naβuβa').out).toBe('nauβa');
  });

  it('01500 - [{pk}t|tk] > [{ɸx}t|θk]', () => {
    expect(quenyaRules['2265073101'].mechanic('abc').out).toBe('abc');
    // kt > xt:
    expect(quenyaRules['2265073101'].mechanic('aktō').out).toBe('axtō');
    expect(quenyaRules['2265073101'].mechanic('makta-').out).toBe('maxta-');
    expect(quenyaRules['2265073101'].mechanic('ꞃaktē').out).toBe('ꞃaxtē');
    expect(quenyaRules['2265073101'].mechanic('θaktie').out).toBe('θaxtie');
    expect(quenyaRules['2265073101'].mechanic('βektē').out).toBe('βextē');
    // pt > ɸt:
    expect(quenyaRules['2265073101'].mechanic('apta-').out).toBe('aɸta-');
    expect(quenyaRules['2265073101'].mechanic('leptā').out).toBe('leɸtā');
    // tk > θk:
    expect(quenyaRules['2265073101'].mechanic('otko').out).toBe('oθko');
    expect(quenyaRules['2265073101'].mechanic('rutkā').out).toBe('ruθkā');
    // Ignoring tk > θk:
    expect(quenyaRules['2265073101'].mechanic('otko', { ignoreTk: true }).out).toBe('otko');
    expect(quenyaRules['2265073101'].mechanic('rutkā', { ignoreTk: true }).out).toBe('rutkā');
    expect(quenyaRules['2265073101'].mechanic('aktō', { ignoreTk: true }).out).toBe('axtō');
    // 1930s pt > ps:
    expect(quenyaRules['2265073101'].mechanic('lepte', { ptBecamePs: true }).out).toBe('lepse');
    expect(quenyaRules['2265073101'].mechanic('tjelepta', { ptBecamePs: true }).out).toBe('tjelepsa');
    expect(quenyaRules['2265073101'].mechanic('aktō', { ptBecamePs: true }).out).toBe('axtō');

    // Non-existent words:
    expect(quenyaRules['2265073101'].mechanic('baktka').out).toBe('baxθka');
    expect(quenyaRules['2265073101'].mechanic('baptka').out).toBe('baɸθka');
  });

  it('01600 - [pw] > [pp]', () => {
    expect(quenyaRules['182545135'].mechanic('abc').out).toBe('abc');
    // Only one example:
    expect(quenyaRules['182545135'].mechanic('napwa').out).toBe('nappa');
  });

  it('01700 - [{m̥n̥l̥r̥}-] > [{mnlr}-]', () => {
    expect(quenyaRules['3012528347'].mechanic('abc').out).toBe('abc');
    // Only examples:
    expect(quenyaRules['3012528347'].mechanic('λūβo').out).toBe('lūβo');
    expect(quenyaRules['3012528347'].mechanic('ꞃaxta-').out).toBe('naxta-');
    expect(quenyaRules['3012528347'].mechanic('ꞃaktē').out).toBe('naktē');
    // Middle Quenya example:
    expect(quenyaRules['3012528347'].mechanic('ᵯaldā').out).toBe('maldā');
    // Non-existent words:
    expect(quenyaRules['3012528347'].mechanic('ꞧaba').out).toBe('raba');
    // Only initially:
    expect(quenyaRules['3012528347'].mechanic('oλōn').out).toBe('oλōn');
    expect(quenyaRules['3012528347'].mechanic('aꞃa').out).toBe('aꞃa');
    // Keeping voiceless liquids:
    expect(quenyaRules['3012528347'].mechanic('λūβo', { keepVoicelessLiquids: true }).out).toBe('λūβo');
    expect(quenyaRules['3012528347'].mechanic('ꞧaba', { keepVoicelessLiquids: true }).out).toBe('ꞧaba');
    expect(quenyaRules['3012528347'].mechanic('ꞃaxta-', { keepVoicelessLiquids: true }).out).toBe('naxta-');
    // Morphemes:
    expect(quenyaRules['3012528347'].mechanic('λūβo', { morphemes: ['λū', 'βo'] }).morphemes).toEqual(['lū', 'βo']);
    expect(quenyaRules['3012528347'].mechanic('ꞃaxta-', { morphemes: ['ꞃax', 'ta-'] }).morphemes).toEqual(['nax', 'ta-']);
  });

  it('01800 - [x|xt|lx|rx] > [h|xt|l̥l̥|r̥r̥]', () => {
    expect(quenyaRules['2071843593'].mechanic('abc').out).toBe('abc');
    // x > h:
    expect(quenyaRules['2071843593'].mechanic('xāðo').out).toBe('hāðo');
    expect(quenyaRules['2071843593'].mechanic('xamnā').out).toBe('hamnā');
    expect(quenyaRules['2071843593'].mechanic('xaura').out).toBe('haura');
    expect(quenyaRules['2071843593'].mechanic('xildor').out).toBe('hildor');
    expect(quenyaRules['2071843593'].mechanic('xīθilōmē').out).toBe('hīθilōmē');
    expect(quenyaRules['2071843593'].mechanic('maxalma').out).toBe('mahalma');
    expect(quenyaRules['2071843593'].mechanic('māxanaskað').out).toBe('māhanaskað');

    // xt > xt:
    expect(quenyaRules['2071843593'].mechanic('xaxtā').out).toBe('haxtā');

    // Non-existent words:
    // [xt] > [xt]:
    expect(quenyaRules['2071843593'].mechanic('xtaba').out).toBe('xtaba');
    expect(quenyaRules['2071843593'].mechanic('baxtaba').out).toBe('baxtaba');
    expect(quenyaRules['2071843593'].mechanic('baxta').out).toBe('baxta');
    // [lx] > [l̥l̥]:
    expect(quenyaRules['2071843593'].mechanic('lxaba').out).toBe('λλaba');
    expect(quenyaRules['2071843593'].mechanic('balxaba').out).toBe('baλλaba');
    expect(quenyaRules['2071843593'].mechanic('balxa').out).toBe('baλλa');
    // [rx] > [r̥r̥]:
    expect(quenyaRules['2071843593'].mechanic('rxaba').out).toBe('ꞧꞧaba');
    expect(quenyaRules['2071843593'].mechanic('barxaba').out).toBe('baꞧꞧaba');
    expect(quenyaRules['2071843593'].mechanic('barxa').out).toBe('baꞧꞧa');
  });

  it('01900 - [{rl}Vð|rVz|zVr|-zVð] > [{rl}Vl|rVs|sVr|-sVð]', () => {
    expect(quenyaRules['455699965'].mechanic('abc').out).toBe('abc');
    // lVð > lVl:
    expect(quenyaRules['455699965'].mechanic('laða-').out).toBe('lala-');
    // rVð > rVl:
    // Eldamo has [rad-], but [d] after a vowel had already become [ð] (AQ. 02900):
    expect(quenyaRules['455699965'].mechanic('rað-').out).toBe('ral-');
    // zVr > sVr:
    // Eldamo labels this one [zVr], because the final [ð] was already pronounced [r]:
    expect(quenyaRules['455699965'].mechanic('kazāð').out).toBe('kasāð');
    // Eldamo has [kasar], but the shortening of [ā] is a separate change:
    expect(quenyaRules['455699965'].mechanic('kazār').out).toBe('kasār');
    // rVz > rVs, from the explanation: raze (rase) "sticks out" (PE19/73-74):
    expect(quenyaRules['455699965'].mechanic('raze').out).toBe('rase');

    // Vanyarin: only [ð] dissimilated:
    expect(quenyaRules['455699965'].mechanic('laða-', { vanyarin: true }).out).toBe('lala-');
    expect(quenyaRules['455699965'].mechanic('rað-', { vanyarin: true }).out).toBe('ral-');
    expect(quenyaRules['455699965'].mechanic('kazāð', { vanyarin: true }).out).toBe('kazāð');
    expect(quenyaRules['455699965'].mechanic('kazār', { vanyarin: true }).out).toBe('kazār');
    expect(quenyaRules['455699965'].mechanic('raze', { vanyarin: true }).out).toBe('raze');

    // Non-existent words:
    // [ð] only after [r], not before it:
    expect(quenyaRules['455699965'].mechanic('baðar').out).toBe('baðar');
    expect(quenyaRules['455699965'].mechanic('aðar').out).toBe('aðar');
    // Only medial [ð] and [z]:
    expect(quenyaRules['455699965'].mechanic('barað').out).toBe('barað');
    expect(quenyaRules['455699965'].mechanic('baraz').out).toBe('baraz');
    // Only with a single vowel in between:
    expect(quenyaRules['455699965'].mechanic('raiða').out).toBe('raiða');
    expect(quenyaRules['455699965'].mechanic('rabaða').out).toBe('rabaða');
    // [z] before a medial [ð] is not affected:
    expect(quenyaRules['455699965'].mechanic('kazaða').out).toBe('kazaða');

    // Morphemes:
    const compound = quenyaRules['455699965'].mechanic('kazār', { morphemes: ['ka', 'zār'] });
    expect(compound.morphemes).toEqual(['ka', 'sār']);
  });
});