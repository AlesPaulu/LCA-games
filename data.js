/* ==========================================================================
   LCA hry – obsah her (texty, rozložení políček, správná řešení)
   Souřadnice odpovídají plátnu 1190 × 842 px (stejně jako předlohy PNG).
   ========================================================================== */

/* ---------- Texty rozhraní ---------- */
const UI = {
  cs: {
    appTitle: 'LCA hry',
    tab1: 'Životní cyklus chleba',
    tab2: 'Funkční jednotka',
    howToPlay: 'Jak hrát',
    check: 'Zkontrolovat',
    hint: 'Napověz',
    solution: 'Řešení',
    reset: 'Znovu',
    trayTip: 'Přetáhněte kartičku na plátno, nebo na ni ťukněte a pak ťukněte na políčko. Kartičku vrátíte přetažením zpět sem.',
    footerInst: 'Ústav udržitelnosti a produktové ekologie, VŠCHT Praha',
    author: 'Autor:',
    close: 'Zavřít',
    start: 'Začít hrát',
    ok: 'Rozumím',
    cancel: 'Zrušit',
    confirmSolve: 'Opravdu zobrazit celé řešení? Vaše rozložení kartiček bude přepsáno.',
    confirmReset: 'Opravdu začít znovu? Všechny kartičky se vrátí do zásobníku.',
    yesSolve: 'Zobrazit řešení',
    yesReset: 'Začít znovu',
    wrongType: 'Sem tato kartička nepatří – barva políčka neodpovídá typu kartičky.',
    placedHint: 'Nápověda: jedna kartička byla doplněna na správné místo.',
    nothingToHint: 'Vše je vyplněno správně – není co napovídat.',
    scoreLine: (ok, total) => `Správně ${ok} z ${total}.`,
    scoreWrong: 'Chybná políčka jsou označena červeně – zkuste je opravit.',
    scoreEmpty: (n) => `Nevyplněno: ${n}.`,
    allDone: 'Vše správně!',
    emptyTray: 'Všechny kartičky jsou na plátně.',
    whatIf: 'Co když…?',
    yourGuess: 'Váš tip:',
    guessRight: 'Správně!',
    guessWrong: 'Tentokrát ne.',
    guessNeutral: 'Na první pohled ano… ale je to tak jednoduché?',
    predict: 'Nejdřív si tipněte:',
    explore: 'Vyzkoušejte sami:',
    gco2: 'g CO₂ eq.',
    breakEven: 'Obě varianty vycházejí stejně při',
  },
  en: {
    appTitle: 'LCA games',
    tab1: 'Life cycle of bread',
    tab2: 'Functional unit',
    howToPlay: 'How to play',
    check: 'Check',
    hint: 'Hint',
    solution: 'Solution',
    reset: 'Restart',
    trayTip: 'Drag a card onto the canvas, or tap it and then tap a field. Drag a card back here to remove it.',
    footerInst: 'Department of Sustainability and Product Ecology, UCT Prague',
    author: 'Author:',
    close: 'Close',
    start: 'Start playing',
    ok: 'Got it',
    cancel: 'Cancel',
    confirmSolve: 'Show the full solution? Your current cards will be replaced.',
    confirmReset: 'Start again? All cards will return to the tray.',
    yesSolve: 'Show solution',
    yesReset: 'Restart',
    wrongType: 'This card does not belong here – the field colour does not match the card type.',
    placedHint: 'Hint: one card has been placed in the right spot.',
    nothingToHint: 'Everything is correct – nothing left to hint.',
    scoreLine: (ok, total) => `${ok} of ${total} correct.`,
    scoreWrong: 'Wrong fields are marked in red – try to fix them.',
    scoreEmpty: (n) => `Empty: ${n}.`,
    allDone: 'All correct!',
    emptyTray: 'All cards are on the canvas.',
    whatIf: 'What if…?',
    yourGuess: 'Your guess:',
    guessRight: 'Correct!',
    guessWrong: 'Not this time.',
    guessNeutral: 'At first sight, yes… but is it that simple?',
    predict: 'First, make a guess:',
    explore: 'Try it yourself:',
    gco2: 'g CO₂ eq.',
    breakEven: 'Both options are equal at',
  },
};

/* ---------- Typy kartiček ---------- */
const TYPES = {
  emp:   { cs: 'Zaměstnanec', en: 'Worker' },
  in:    { cs: 'Vstup', en: 'Input' },
  prod:  { cs: 'Produkt', en: 'Product' },
  emi:   { cs: 'Emise', en: 'Emission' },
  fn:    { cs: 'Funkce', en: 'Function' },
  fu:    { cs: 'Funkční jednotka', en: 'Functional unit' },
  photo: { cs: 'Fotografie', en: 'Photos' },
  tok:   { cs: 'Žetony uhlíkové stopy', en: 'Carbon footprint tokens' },
};

const TYPE_INFO = {
  emp: {
    cs: 'Kdo proces provádí – člověk nebo firma, která danou činnost zajišťuje (např. zemědělec, pekař).',
    en: 'Who carries out the process – the person or company doing the activity (e.g. farmer, baker).',
  },
  in: {
    cs: 'Co proces potřebuje – suroviny, energie, voda nebo produkty jiných procesů.',
    en: 'What the process needs – raw materials, energy, water or products of other processes.',
  },
  prod: {
    cs: 'Co z procesu vychází a je užitečné – výrobek nebo služba, kterou využije další proces nebo zákazník.',
    en: 'The useful output of a process – a product or service used by another process or by the customer.',
  },
  emi: {
    cs: 'Co proces vypouští do prostředí – látky do ovzduší, vody nebo půdy, které mohou škodit.',
    en: 'What the process releases into the environment – substances emitted to air, water or soil that may cause harm.',
  },
};

/* ---------- Kartičky: klíč → typ + popisky ---------- */
const CARDS = {
  /* Hra 1 – zaměstnanci */
  farmer:        ['emp', 'Zemědělec', 'Farmer'],
  miller:        ['emp', 'Mlynář', 'Miller'],
  waterman:      ['emp', 'Vodohospodář', 'Water utility worker'],
  energyman:     ['emp', 'Výrobce energie', 'Energy producer'],
  chemman:       ['emp', 'Výrobce chemikálií', 'Chemical producer'],
  plasticman:    ['emp', 'Výrobce plastů', 'Plastics producer'],
  baker:         ['emp', 'Pekař', 'Baker'],
  retailer:      ['emp', 'Obchodník', 'Retailer'],
  driver:        ['emp', 'Řidič', 'Driver'],
  wasteman:      ['emp', 'Odpadový hospodář', 'Waste manager'],
  /* Hra 1 – vstupy */
  rainwater:     ['in', 'Dešťová voda', 'Rainwater'],
  seeds:         ['in', 'Osivo', 'Seeds'],
  agrochem:      ['in', 'Chemikálie (hnojiva a pesticidy)', 'Chemicals (fertilisers and pesticides)'],
  machinery:     ['in', 'Agrotechnika a pohon', 'Farm machinery and fuel'],
  sunlight:      ['in', 'Sluneční energie', 'Solar energy'],
  soil:          ['in', 'Úrodná půda', 'Fertile soil'],
  water_in:      ['in', 'Pitná voda', 'Drinking water'],
  wheat_in:      ['in', 'Pšenice', 'Wheat'],
  energy_in:     ['in', 'Energie', 'Energy'],
  watchem_in:    ['in', 'Chemikálie na úpravu vody', 'Water treatment chemicals'],
  procwater:     ['in', 'Procesní voda', 'Process water'],
  fuels:         ['in', 'Uhlí, jádro, obnovitelné zdroje', 'Coal, nuclear, renewables'],
  rawmat:        ['in', 'Primární suroviny', 'Raw materials'],
  oil:           ['in', 'Ropa', 'Crude oil'],
  flour_in:      ['in', 'Mouka', 'Flour'],
  sourdough:     ['in', 'Kvásek', 'Sourdough starter'],
  plastic_in:    ['in', 'Plast', 'Plastic'],
  bread_in:      ['in', 'Chléb v obalu', 'Packaged bread'],
  motorfuel:     ['in', 'Pohonné hmoty', 'Fuel'],
  waste_in:      ['in', 'Odpady', 'Waste'],
  /* Hra 1 – produkty */
  wheat:         ['prod', 'Pšenice', 'Wheat'],
  flour:         ['prod', 'Mouka', 'Flour'],
  water:         ['prod', 'Pitná voda', 'Drinking water'],
  energy:        ['prod', 'Energie', 'Energy'],
  chemicals:     ['prod', 'Chemikálie', 'Chemicals'],
  plastic:       ['prod', 'Plast', 'Plastic'],
  bread:         ['prod', 'Chléb v obalu', 'Packaged bread'],
  boughtbread:   ['prod', 'Koupený chléb', 'Purchased bread'],
  transport:     ['prod', 'Přeprava', 'Transport'],
  treatedwaste:  ['prod', 'Zpracovaný odpad', 'Treated waste'],
  /* Hra 1 – emise */
  soilcont:      ['emi', 'Kontaminace půdy', 'Soil contamination'],
  fluegas:       ['emi', 'Spaliny', 'Flue gases'],
  toxic:         ['emi', 'Emise toxických látek', 'Toxic emissions'],
  decomp:        ['emi', 'Emise z rozkladu', 'Decomposition emissions'],

  /* Hra 2 – funkce (žluté) */
  f_singleuse:   ['fn', 'Jednorázová', 'Single-use'],
  f_protection:  ['fn', 'ochrana', 'protection'],
  f_transport:   ['fn', 'a přenos', 'and transport'],
  f_bread:       ['fn', 'chleba', 'of bread'],
  f_seller:      ['fn', 'od prodejce', 'from seller'],
  f_customer:    ['fn', 'k zákazníkovi', 'to customer'],
  f_repeated:    ['fn', 'Opakované', 'Repeated'],
  f_storage:     ['fn', 'uchování', 'storage'],
  f_beverage:    ['fn', 'nápoje', 'of a beverage'],
  f_user:        ['fn', 'uživatelem', 'by the user'],
  f_drying:      ['fn', 'Osušení', 'Drying'],
  f_hands:       ['fn', 'rukou', 'of hands'],
  f_washing:     ['fn', 'po umytí', 'after washing'],
  /* Hra 2 – funkční jednotka (zelené) */
  u_packaging:   ['fu', 'Obal na', 'Packaging for'],
  u_loaf:        ['fu', '1 bochník', '1 loaf'],
  u_bread:       ['fu', 'chleba', 'of bread'],
  u_bottle:      ['fu', 'Lahev na', 'Bottle for'],
  u_storage:     ['fu', 'uchovávání', 'storage'],
  u_transport:   ['fu', 'a přenos', 'and transport'],
  u_halfl:       ['fu', '0,5 l nápoje', 'of 0.5 l of beverage'],
  u_period:      ['fu', 'po dobu', 'over'],
  u_5years:      ['fu', '5 let', '5 years'],
  u_1drying:     ['fu', '1 osušení', '1 drying'],
  u_hands:       ['fu', 'rukou', 'of hands'],
  u_washing:     ['fu', 'po umytí', 'after washing'],
};

/* ---------- Fotografie ---------- */
const PHOTOS = {
  ph_farmer: { cs: 'Pšeničné pole', en: 'Wheat field' },
  ph_miller: { cs: 'Mouka', en: 'Flour' },
  ph_water:  { cs: 'Úprava vody', en: 'Water treatment' },
  ph_energy: { cs: 'Elektrárna', en: 'Power plant' },
  ph_chem:   { cs: 'Chemická výroba', en: 'Chemical production' },
  ph_plastic: { cs: 'Výroba plastů', en: 'Plastics production' },
  ph_baker:  { cs: 'Pečení', en: 'Baking' },
  ph_retail: { cs: 'Chléb v obalu', en: 'Packaged bread' },
  ph_transport: { cs: 'Kamion', en: 'Truck' },
  ph_waste:  { cs: 'Zpracování odpadu', en: 'Waste treatment' },
  ph_bag_pe: { cs: 'Plastový sáček', en: 'Plastic bag' },
  ph_bag_paper: { cs: 'Papírový sáček', en: 'Paper bag' },
  ph_glass:  { cs: 'Skleněná lahev', en: 'Glass bottle' },
  ph_alu:    { cs: 'Hliníková lahev', en: 'Aluminium bottle' },
  ph_towel:  { cs: 'Papírové ručníky', en: 'Paper towels' },
  ph_dryer:  { cs: 'Elektrická sušička', en: 'Electric hand dryer' },
};

/* ---------- Žetony ---------- */
const TOKENS = {
  tok5:   { value: 5,   label: '5 g' },
  tok400: { value: 400, label: '400 g' },
  tok1:   { value: 1,   label: '1 g' },
};

/* ==========================================================================
   HRA 1 – Inventarizace a životní cyklus
   Blok: sloupec vstupů (x) + pravý sloupec (x2). Každé políčko:
   [typ, x, y, správný klíč, předvyplněno?]
   ========================================================================== */
const W = 113, H = 24;
const G1_BLOCKS = [
  { id: 'farm', slots: [
      ['in', 55, 80, 'rainwater'], ['in', 55, 110, 'seeds'], ['in', 55, 140, 'agrochem'],
      ['in', 55, 170, 'machinery'], ['in', 55, 200, 'sunlight'], ['in', 55, 230, 'soil'],
      ['emp', 176, 80, 'farmer', true], ['emi', 176, 110, 'soilcont'], ['prod', 176, 140, 'wheat'] ],
    photo: [176, 172, 113, 83, 'ph_farmer'] },
  { id: 'mill', slots: [
      ['in', 343, 80, 'water_in'], ['in', 343, 110, 'wheat_in'], ['in', 343, 140, 'energy_in'],
      ['prod', 343, 170, 'flour'], ['emp', 464, 80, 'miller'] ],
    photo: [464, 108, 113, 85, 'ph_miller'] },
  { id: 'water', slots: [
      ['in', 631, 80, 'watchem_in'], ['in', 631, 110, 'procwater'], ['in', 631, 140, 'energy_in'],
      ['prod', 631, 170, 'water'], ['emp', 752, 80, 'waterman'] ],
    photo: [752, 108, 113, 85, 'ph_water'] },
  { id: 'energy', slots: [
      ['in', 919, 78, 'procwater', true], ['in', 919, 108, 'fuels'], ['emi', 919, 138, 'fluegas'],
      ['prod', 919, 168, 'energy'], ['emp', 1040, 78, 'energyman'] ],
    photo: [1040, 106, 113, 84, 'ph_energy'] },
  { id: 'chem', slots: [
      ['in', 54, 318, 'energy_in'], ['in', 54, 348, 'rawmat'], ['emi', 54, 378, 'toxic'],
      ['prod', 54, 408, 'chemicals', true], ['emp', 175, 318, 'chemman'] ],
    photo: [175, 348, 113, 84, 'ph_chem'] },
  { id: 'plastic', slots: [
      ['in', 343, 318, 'energy_in'], ['in', 343, 348, 'procwater'], ['in', 343, 378, 'oil', true],
      ['emi', 343, 408, 'toxic'], ['prod', 343, 438, 'plastic'], ['emp', 464, 318, 'plasticman'] ],
    photo: [464, 350, 113, 112, 'ph_plastic'] },
  { id: 'bakery', slots: [
      ['in', 631, 318, 'water_in'], ['in', 631, 348, 'energy_in'], ['in', 631, 378, 'flour_in'],
      ['in', 631, 408, 'sourdough'], ['in', 631, 438, 'plastic_in'],
      ['emp', 752, 318, 'baker'], ['prod', 752, 348, 'bread'] ],
    photo: [752, 378, 113, 84, 'ph_baker'] },
  { id: 'shop', slots: [
      ['in', 919, 318, 'energy_in'], ['in', 919, 348, 'bread_in'], ['emp', 919, 378, 'retailer'],
      ['prod', 919, 408, 'boughtbread', true] ],
    photo: [1040, 318, 113, 115, 'ph_retail'] },
  { id: 'transport', slots: [
      ['prod', 343, 630, 'transport'], ['in', 343, 660, 'motorfuel'], ['emi', 343, 690, 'fluegas'],
      ['emp', 343, 720, 'driver'] ],
    photo: [463, 630, 113, 115, 'ph_transport'] },
  { id: 'waste', slots: [
      ['in', 631, 630, 'waste_in'], ['emi', 631, 660, 'decomp'], ['emi', 631, 690, 'soilcont'],
      ['prod', 631, 720, 'treatedwaste'], ['prod', 631, 750, 'energy'], ['emp', 752, 630, 'wasteman'] ],
    photo: [750, 662, 113, 114, 'ph_waste'] },
];

/* Šipky: [barva, body] – barvy: k = černá, g = šedá, l = světle šedá */
const G1_ARROWS = [
  ['k', [[110, 436], [110, 462], [30, 462], [30, 152], [51, 152]]],
  ['k', [[30, 272], [595, 272], [595, 90], [627, 90]]],
  ['k', [[291, 152], [301, 152], [301, 120], [339, 120]]],
  ['k', [[686, 196], [686, 213], [890, 213], [890, 56], [313, 56], [313, 90], [339, 90]]],
  ['k', [[686, 213], [686, 314]]],
  ['k', [[400, 466], [400, 492], [686, 492], [686, 467]]],
  ['k', [[868, 360], [915, 360]]],
  ['g', [[975, 196], [975, 314]]],
  ['g', [[975, 290], [110, 290], [110, 314]]],
  ['g', [[313, 290], [313, 150], [339, 150]]],
  ['g', [[400, 290], [400, 314]]],
  ['g', [[610, 290], [610, 150], [627, 150]]],
  ['g', [[610, 290], [610, 358], [627, 358]]],
  ['l', [[400, 196], [400, 240], [585, 240], [585, 388], [627, 388]]],
  ['g', [[400, 624], [400, 558]]],
  ['g', [[686, 557], [686, 624]]],
];

const G1_TEXT = {
  cs: {
    title: 'Inventarizace<br>a životní cyklus',
    note1: 'Šipky propojují produkty a vstupy se stejným jménem',
    note2: 'Dva spodní bloky vstupují a vystupují do všech ostatních bloků',
    legend: 'Legenda',
    introTitle: 'Životní cyklus chleba',
    intro: `
      <p class="lead">Koupíte v obchodě bochník chleba. Co všechno bylo potřeba, než se dostal do vašeho košíku? Poskládejte jeho životní cyklus!</p>
      <div class="info-box"><strong>Co je LCA?</strong> Posuzování životního cyklu (LCA – <em>Life Cycle Assessment</em>) je metoda, která hodnotí dopady výrobku na životní prostředí „od kolébky do hrobu“ – od získání surovin přes výrobu a dopravu až po odpad. Prvním krokem je <strong>inventarizace</strong>: sepsat všechny procesy a to, co do nich vstupuje a vystupuje.</div>
      <ol class="steps">
        <li>Každý blok na plátně je jeden <strong>proces</strong> (např. mlýn nebo pekárna). Kartičky ze zásobníku přetáhněte do správných bloků. Do kterého bloku kartička patří, musíte zjistit sami.</li>
        <li><strong>Barva</strong> kartičky říká, o co jde:
          <span class="chip t-emp">Zaměstnanec</span> kdo proces provádí,
          <span class="chip t-in">Vstup</span> co proces potřebuje,
          <span class="chip t-prod">Produkt</span> co z procesu vychází,
          <span class="chip t-emi">Emise</span> co proces vypouští do prostředí.
          Kartička jde vložit jen do políčka stejné barvy; pořadí uvnitř bloku nehraje roli.</li>
        <li><strong>Šipky</strong> jsou hlavní vodítko: spojují produkt jednoho procesu se stejnojmenným vstupem jiného procesu.</li>
        <li>K blokům přiřaďte i <strong>fotografie</strong>.</li>
        <li>Až budete hotovi, klikněte na <strong>Zkontrolovat</strong>. Když si nevíte rady, použijte <strong>Napověz</strong>.</li>
      </ol>`,
    successTitle: 'Výborně – životní cyklus chleba je kompletní!',
    success: `
      <p class="lead">Všimli jste si, kolik procesů stojí za jedním bochníkem?</p>
      <ul class="steps">
        <li>I obyčejný chléb potřebuje <strong>fosilní paliva</strong> – ropu na plastový obal, pohonné hmoty pro dopravu a zemědělské stroje, uhlí pro výrobu energie.</li>
        <li>Potřebuje i <strong>chemikálie</strong> – hnojiva a pesticidy na poli nebo chemikálie na úpravu pitné vody.</li>
        <li>Procesy jsou navzájem propojené: energie, voda a doprava vstupují téměř všude a každý proces vytváří odpady a emise.</li>
      </ul>
      <p>Proto LCA nesleduje jen poslední krok (pekárnu), ale <strong>celý životní cyklus</strong>. Jinak by nám většina dopadů unikla.</p>`,
  },
  en: {
    title: 'Inventory<br>and life cycle',
    note1: 'Arrows connect products and inputs with the same name',
    note2: 'The two bottom blocks enter and leave all other blocks',
    legend: 'Legend',
    introTitle: 'The life cycle of bread',
    intro: `
      <p class="lead">You buy a loaf of bread in a shop. What did it take before it landed in your basket? Put its life cycle together!</p>
      <div class="info-box"><strong>What is LCA?</strong> Life Cycle Assessment (LCA) is a method that evaluates the environmental impacts of a product “from cradle to grave” – from obtaining raw materials, through production and transport, all the way to waste. The first step is the <strong>inventory</strong>: listing all processes and everything that goes in and comes out of them.</div>
      <ol class="steps">
        <li>Each block on the canvas is one <strong>process</strong> (e.g. a mill or a bakery). Drag cards from the tray into the right blocks. Which block a card belongs to is up to you to figure out.</li>
        <li>The card <strong>colour</strong> tells you what it is:
          <span class="chip t-emp">Worker</span> who carries out the process,
          <span class="chip t-in">Input</span> what the process needs,
          <span class="chip t-prod">Product</span> what comes out of it,
          <span class="chip t-emi">Emission</span> what it releases into the environment.
          A card fits only into a field of the same colour; the order within a block does not matter.</li>
        <li><strong>Arrows</strong> are your main clue: they connect the product of one process with the input of the same name in another process.</li>
        <li>Also match the <strong>photos</strong> to the blocks.</li>
        <li>When you are done, click <strong>Check</strong>. If you get stuck, use <strong>Hint</strong>.</li>
      </ol>`,
    successTitle: 'Well done – the life cycle of bread is complete!',
    success: `
      <p class="lead">Did you notice how many processes stand behind a single loaf?</p>
      <ul class="steps">
        <li>Even ordinary bread needs <strong>fossil fuels</strong> – crude oil for the plastic packaging, fuel for transport and farm machinery, coal for energy production.</li>
        <li>It also needs <strong>chemicals</strong> – fertilisers and pesticides in the field, chemicals for treating drinking water.</li>
        <li>The processes are interconnected: energy, water and transport enter almost everywhere, and every process creates waste and emissions.</li>
      </ul>
      <p>That is why LCA does not look only at the last step (the bakery) but at the <strong>whole life cycle</strong> – otherwise most of the impacts would be missed.</p>`,
  },
};

/* ==========================================================================
   HRA 2 – Funkce a funkční jednotka
   ========================================================================== */
const G2_EF = [ // emisní faktory
  { cs: ['1 kg polyethylenu', '3,00 kg CO₂ eq.'], en: ['1 kg polyethylene', '3.00 kg CO₂ eq.'] },
  { cs: ['1 kg papíru', '1,25 kg CO₂ eq.'], en: ['1 kg paper', '1.25 kg CO₂ eq.'] },
  { cs: ['1 kg skla', '1,00 kg CO₂ eq.'], en: ['1 kg glass', '1.00 kg CO₂ eq.'] },
  { cs: ['1 kg hliníku', '12,0 kg CO₂ eq.'], en: ['1 kg aluminium', '12.0 kg CO₂ eq.'] },
  { cs: ['1 kWh elektřiny', '0,50 kg CO₂ eq.'], en: ['1 kWh electricity', '0.50 kg CO₂ eq.'] },
];

// x = levý okraj sloupce porovnání (šířka 253 px)
const G2_COMPARISONS = [
  {
    id: 'c1', x: 257, token: 'tok5',
    title: { cs: 'Plastový vs. papírový<br>obal na pečivo', en: 'Plastic vs. paper<br>bread packaging' },
    fnRows: [['f_singleuse', 'f_protection', 'f_transport'], ['f_bread', 'f_seller', 'f_customer']],
    fuRows: [['u_packaging', 'u_loaf', 'u_bread']],
    products: [
      { photo: 'ph_bag_pe', tokens: 9, ref: { cs: '15 g PE<br>sáčku', en: '15 g of<br>PE bag' },
        calc: { cs: '15 g PE = 0,015 kg × 3,00 kg CO₂ eq./kg = 0,045 kg = 45 g CO₂ eq. → 9 žetonů po 5 g',
                en: '15 g PE = 0.015 kg × 3.00 kg CO₂ eq./kg = 0.045 kg = 45 g CO₂ eq. → 9 tokens of 5 g' } },
      { photo: 'ph_bag_paper', tokens: 5, ref: { cs: '20 g papírového<br>sáčku', en: '20 g of<br>paper bag' },
        calc: { cs: '20 g papíru = 0,020 kg × 1,25 kg CO₂ eq./kg = 0,025 kg = 25 g CO₂ eq. → 5 žetonů po 5 g',
                en: '20 g paper = 0.020 kg × 1.25 kg CO₂ eq./kg = 0.025 kg = 25 g CO₂ eq. → 5 tokens of 5 g' } },
    ],
  },
  {
    id: 'c2', x: 571, token: 'tok400',
    title: { cs: 'Skleněná vs. hliníková<br>lahev na vodu', en: 'Glass vs. aluminium<br>water bottle' },
    fnRows: [['f_repeated', 'f_storage', 'f_transport'], ['f_beverage', 'f_user']],
    fuRows: [['u_bottle', 'u_storage', 'u_transport'], ['u_halfl', 'u_period', 'u_5years']],
    products: [
      { photo: 'ph_glass', tokens: 5, ref: { cs: '4 skleněné lahve<br>(500 g/ks)', en: '4 glass bottles<br>(500 g each)' },
        calc: { cs: '4 × 500 g = 2 kg skla × 1,00 kg CO₂ eq./kg = 2 kg = 2 000 g CO₂ eq. → 5 žetonů po 400 g',
                en: '4 × 500 g = 2 kg glass × 1.00 kg CO₂ eq./kg = 2 kg = 2,000 g CO₂ eq. → 5 tokens of 400 g' } },
      { photo: 'ph_alu', tokens: 6, ref: { cs: '1 hliníková lahev<br>(200 g/ks)', en: '1 aluminium bottle<br>(200 g each)' },
        calc: { cs: '1 × 200 g = 0,2 kg hliníku × 12,0 kg CO₂ eq./kg = 2,4 kg = 2 400 g CO₂ eq. → 6 žetonů po 400 g',
                en: '1 × 200 g = 0.2 kg aluminium × 12.0 kg CO₂ eq./kg = 2.4 kg = 2,400 g CO₂ eq. → 6 tokens of 400 g' } },
    ],
  },
  {
    id: 'c3', x: 885, token: 'tok1',
    title: { cs: 'Elektrické vs. papírové<br>sušení rukou', en: 'Electric vs. paper<br>hand drying' },
    fnRows: [['f_drying', 'f_hands', 'f_washing']],
    fuRows: [['u_1drying', 'u_hands', 'u_washing']],
    products: [
      { photo: 'ph_towel', tokens: 5, ref: { cs: '2 ks papíru<br>(2 g/ks)', en: '2 paper towels<br>(2 g each)' },
        calc: { cs: '2 × 2 g = 0,004 kg papíru × 1,25 kg CO₂ eq./kg = 0,005 kg = 5 g CO₂ eq. → 5 žetonů po 1 g',
                en: '2 × 2 g = 0.004 kg paper × 1.25 kg CO₂ eq./kg = 0.005 kg = 5 g CO₂ eq. → 5 tokens of 1 g' } },
      { photo: 'ph_dryer', tokens: 10, ref: { cs: '0,02 kWh<br>elektřiny', en: '0.02 kWh of<br>electricity' },
        calc: { cs: '0,02 kWh × 0,50 kg CO₂ eq./kWh = 0,010 kg = 10 g CO₂ eq. → 10 žetonů po 1 g',
                en: '0.02 kWh × 0.50 kg CO₂ eq./kWh = 0.010 kg = 10 g CO₂ eq. → 10 tokens of 1 g' } },
    ],
  },
];

const G2_TEXT = {
  cs: {
    title: 'Funkce<br>a funkční<br>jednotka',
    rows: { fn: 'Funkce', fu: 'Funkční jednotka', ref: 'Referenční tok', cf: 'Uhlíková stopa' },
    rowInfo: {
      fn: '<strong>Funkce</strong> popisuje, k čemu produkt slouží – jakou službu nám poskytuje. Porovnávat dává smysl jen produkty se stejnou funkcí.',
      fu: '<strong>Funkční jednotka</strong> je funkce vyjádřená měřitelně: kolik, jak dlouho, jak dobře. Všechny výsledky se na ni přepočítávají, takže porovnání je férové.',
      ref: '<strong>Referenční tok</strong> říká, kolik produktu (materiálu, energie) je potřeba ke splnění jedné funkční jednotky. Např. za 5 let spotřebujeme 4 skleněné lahve, ale jen 1 hliníkovou.',
      cf: '<strong>Uhlíková stopa</strong> vyjadřuje příspěvek ke změně klimatu v kg CO₂ ekvivalentu. Spočítá se jako <em>množství materiálu × emisní faktor</em> (tabulka vlevo dole).',
    },
    introTitle: 'Funkce a funkční jednotka',
    intro: `
      <p class="lead">Je lepší plastový, nebo papírový sáček? Aby bylo porovnání férové, musíme porovnávat produkty, které plní <strong>stejnou funkci ve stejném rozsahu</strong>.</p>
      <ol class="steps">
        <li><span class="chip t-fn">Funkce</span> – co produkt dělá. Poskládejte ze žlutých kartiček větu, která funkci popisuje. Na pořadí slov záleží.</li>
        <li><span class="chip t-fu">Funkční jednotka</span> – funkce vyjádřená měřitelně (kolik, jak dlouho). Poskládejte ji ze zelených kartiček.</li>
        <li><span class="chip t-ref">Referenční tok</span> – kolik produktu je potřeba ke splnění funkční jednotky. Ten už máte připravený.</li>
        <li><span class="chip t-emi">Uhlíková stopa</span> – spočítejte <em>množství materiálu (v kg) × emisní faktor</em> z tabulky vlevo dole. Výsledek vyjádřete počtem žetonů CO₂: přetáhněte je do růžových políček.</li>
        <li>Přiřaďte také fotografie a pak klikněte na <strong>Zkontrolovat</strong>.</li>
        <li>Nakonec vyzkoušejte otázky <strong>„Co když…?“</strong> dole pod porovnáními a uvidíte, jak změna předpokladů může otočit výsledek.</li>
      </ol>
      <div class="info-box"><strong>Příklad výpočtu:</strong> 100 g skla = 0,1 kg × 1,00 kg CO₂ eq./kg = 0,1 kg = 100 g CO₂ eq.</div>`,
    successTitle: 'Skvělé – všechna porovnání jsou správně!',
    success: `
      <p class="lead">Srovnejte výsledky: plastový sáček 45 g vs. papírový 25 g, sklo 2,0 kg vs. hliník 2,4 kg, papír 5 g vs. sušička 10 g CO₂ eq.</p>
      <p>Tyto výsledky ale platí jen pro zvolenou <strong>funkční jednotku</strong> a <strong>předpoklady</strong> (hmotnost sáčku, životnost lahve, počet ručníků…).</p>
      <p>Vyzkoušejte otázky <strong>„Co když…?“</strong> pod jednotlivými porovnáními a uvidíte, jak snadno se může pořadí obrátit.</p>`,
  },
  en: {
    title: 'Function<br>and functional<br>unit',
    rows: { fn: 'Function', fu: 'Functional unit', ref: 'Reference flow', cf: 'Carbon footprint' },
    rowInfo: {
      fn: 'The <strong>function</strong> describes what a product is for – the service it provides. Only products with the same function can be meaningfully compared.',
      fu: 'The <strong>functional unit</strong> is the function expressed in measurable terms: how much, how long, how well. All results are related to it, so the comparison is fair.',
      ref: 'The <strong>reference flow</strong> is the amount of product (material, energy) needed to fulfil one functional unit. E.g. over 5 years we use up 4 glass bottles but only 1 aluminium one.',
      cf: 'The <strong>carbon footprint</strong> expresses the contribution to climate change in kg of CO₂ equivalent. It is calculated as <em>amount of material × emission factor</em> (table at the bottom left).',
    },
    introTitle: 'Function and functional unit',
    intro: `
      <p class="lead">Is a plastic or a paper bag better? For a fair comparison, we must compare products that provide <strong>the same function to the same extent</strong>.</p>
      <ol class="steps">
        <li><span class="chip t-fn">Function</span> – what the product does. Build a sentence describing the function from the yellow cards. Word order matters.</li>
        <li><span class="chip t-fu">Functional unit</span> – the function in measurable terms (how much, how long). Build it from the green cards.</li>
        <li><span class="chip t-ref">Reference flow</span> – how much product is needed to fulfil the functional unit. This one is already given.</li>
        <li><span class="chip t-emi">Carbon footprint</span> – calculate <em>amount of material (in kg) × emission factor</em> from the table at the bottom left. Express the result as a number of CO₂ tokens by dragging them into the pink fields.</li>
        <li>Match the photos too, then click <strong>Check</strong>.</li>
        <li>Finally, try the <strong>“What if…?”</strong> questions below the comparisons to see how changing an assumption can flip the result.</li>
      </ol>
      <div class="info-box"><strong>Example:</strong> 100 g glass = 0.1 kg × 1.00 kg CO₂ eq./kg = 0.1 kg = 100 g CO₂ eq.</div>`,
    successTitle: 'Great – all comparisons are correct!',
    success: `
      <p class="lead">Compare the results: plastic bag 45 g vs. paper bag 25 g, glass 2.0 kg vs. aluminium 2.4 kg, paper 5 g vs. dryer 10 g CO₂ eq.</p>
      <p>But these results only hold for the chosen <strong>functional unit</strong> and <strong>assumptions</strong> (bag weight, bottle lifetime, number of towels…).</p>
      <p>Try the <strong>“What if…?”</strong> questions under each comparison and see how easily the ranking can flip.</p>`,
  },
};

/* ---------- Otázky „Co když…?“ ---------- */
const WHATIF = {
  c1: {
    q: { cs: 'Co když bude plastový sáček 2× menší?', en: 'What if the plastic bag is 2× smaller?' },
    ask: { cs: 'Plastový sáček bude vážit jen 7,5 g místo 15 g. Který obal bude mít menší uhlíkovou stopu?',
           en: 'The plastic bag weighs only 7.5 g instead of 15 g. Which packaging will have the smaller carbon footprint?' },
    options: [{ id: 'pe', cs: 'Plastový sáček', en: 'Plastic bag' }, { id: 'paper', cs: 'Papírový sáček', en: 'Paper bag' }],
    correct: 'pe',
    explain: {
      cs: 'Plastový sáček: 7,5 g × 3,00 = <strong>22,5 g CO₂ eq.</strong>, papírový zůstává na <strong>25 g</strong>. Pořadí se obrátilo! Výsledek porovnání citlivě závisí na předpokladech – tady na hmotnosti sáčku.',
      en: 'Plastic bag: 7.5 g × 3.00 = <strong>22.5 g CO₂ eq.</strong>, the paper bag stays at <strong>25 g</strong>. The ranking flipped! The result is sensitive to assumptions – here, the weight of the bag.',
    },
    slider: { label: { cs: 'Hmotnost plastového sáčku', en: 'Weight of the plastic bag' }, min: 2, max: 20, step: 0.5, value: 7.5, unit: 'g' },
    bars: (v) => [
      { photo: 'bag_pe', label: { cs: 'Plastový sáček', en: 'Plastic bag' }, value: v * 3 },
      { photo: 'bag_paper', label: { cs: 'Papírový sáček', en: 'Paper bag' }, value: 25 },
    ],
    breakEven: { cs: '≈ 8,3 g plastu', en: '≈ 8.3 g of plastic' },
  },
  c2: {
    q: { cs: 'Co když hliníková lahev 2× více vydrží?', en: 'What if the aluminium bottle lasts 2× longer?' },
    ask: { cs: 'Hliníková lahev vydrží 10 let místo 5. Která lahev bude mít menší uhlíkovou stopu na funkční jednotku (5 let)?',
           en: 'The aluminium bottle lasts 10 years instead of 5. Which bottle will have the smaller carbon footprint per functional unit (5 years)?' },
    options: [{ id: 'glass', cs: 'Skleněná lahev', en: 'Glass bottle' }, { id: 'alu', cs: 'Hliníková lahev', en: 'Aluminium bottle' }],
    correct: 'alu',
    explain: {
      cs: 'Na funkční jednotku (5 let) teď připadá jen <strong>půl hliníkové lahve</strong>: 100 g × 12 = <strong>1 200 g CO₂ eq.</strong> oproti <strong>2 000 g</strong> u skla. Delší životnost zmenší referenční tok – a tím i uhlíkovou stopu.',
      en: 'Only <strong>half an aluminium bottle</strong> is now needed per functional unit (5 years): 100 g × 12 = <strong>1,200 g CO₂ eq.</strong> versus <strong>2,000 g</strong> for glass. A longer lifetime reduces the reference flow – and thus the carbon footprint.',
    },
    slider: { label: { cs: 'Životnost hliníkové lahve', en: 'Lifetime of the aluminium bottle' }, min: 2, max: 15, step: 0.5, value: 10, unit: { cs: 'let', en: 'years' } },
    bars: (v) => [
      { photo: 'glass', label: { cs: 'Skleněná lahev', en: 'Glass bottle' }, value: 2000 },
      { photo: 'alu', label: { cs: 'Hliníková lahev', en: 'Aluminium bottle' }, value: (5 / v) * 200 * 12 },
    ],
    breakEven: { cs: 'životnosti 6 let', en: 'a lifetime of 6 years' },
  },
  c3: {
    q: { cs: 'Co když si usušíme ruce o kalhoty?', en: 'What if we dry our hands on our trousers?' },
    ask: { cs: 'Který způsob osušení rukou má nejmenší uhlíkovou stopu?',
           en: 'Which way of drying hands has the smallest carbon footprint?' },
    options: [{ id: 'towel', cs: 'Papírové ručníky', en: 'Paper towels' }, { id: 'dryer', cs: 'Elektrická sušička', en: 'Electric dryer' }, { id: 'pants', cs: 'Kalhoty', en: 'Trousers' }],
    correct: null,
    explain: {
      cs: 'Otření o kalhoty má na první pohled <strong>nulovou uhlíkovou stopu</strong>. Ale plní opravdu <strong>stejnou funkci</strong>? Ruce nejsou úplně suché a kalhoty je potřeba častěji prát – a praní spotřebovává elektřinu, vodu i prací prostředek. Férově porovnávat můžeme jen varianty, které splní funkční jednotku stejně dobře.',
      en: 'Wiping your hands on your trousers has, at first sight, <strong>zero carbon footprint</strong>. But does it really provide <strong>the same function</strong>? Hands are not fully dry and trousers need washing more often – which uses electricity, water and detergent. We can only fairly compare options that fulfil the functional unit equally well.',
    },
    slider: { label: { cs: 'Počet papírových ručníků na osušení', en: 'Number of paper towels per drying' }, min: 1, max: 6, step: 1, value: 2, unit: { cs: 'ks', en: 'pcs' } },
    bars: (v) => [
      { photo: 'towel', label: { cs: 'Papírové ručníky', en: 'Paper towels' }, value: v * 2 * 1.25 },
      { photo: 'dryer', label: { cs: 'Elektrická sušička', en: 'Electric dryer' }, value: 10 },
      { photo: null, label: { cs: 'Kalhoty (+ praní?)', en: 'Trousers (+ washing?)' }, value: 0, unknown: true },
    ],
    breakEven: { cs: '4 ručnících', en: '4 towels' },
  },
};
