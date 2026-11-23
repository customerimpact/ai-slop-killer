// AI Slop Killer: Dutch rule catalog (Nederlands, Flemish and Netherlands usage).
// Same shape as rules.mjs. Language-neutral rules (punctuation, emoji, structure) live in
// rules.mjs with lang: 'any' and run for Dutch too; these replace the English phrase rules.

// Word boundaries that understand é, ë, ï (JS \b is ASCII-only).
const B = '(?<![\\p{L}\\p{N}])';
const E = '(?![\\p{L}\\p{N}])';
const rx = (body, flags = 'giu') => new RegExp(body, flags);
const words = (list) => rx(`${B}(?:${list.join('|')})${E}`);
const SENT = '(?:^|[.!?]\\s+|\\n)'; // start of a sentence or line

const SOCIAL = { linkedin: 1.5, x: 1.5 };

export const RULES_NL = [
  // ── Negation pivots ───────────────────────────────────────────────────────
  {
    id: 'nl-negation-pivot',
    category: 'negation',
    severity: 'high',
    pattern: rx(`${B}(?:het|dit|dat|ze|hij)\\s+(?:is|zijn|was)\\s+(?:niet|geen)\\s+[^.!?\\n]{1,60}?(?:[,;:]|\\s[—–-])\\s*(?:het|dit|dat|ze|hij|maar)${E}`),
    message: '"Het is niet X, het is Y" zet een tegenstelling op die niemand opwierp.',
    fix: 'Schrap de ontkende helft en zeg Y meteen.',
  },
  {
    id: 'nl-gaat-niet-om',
    category: 'negation',
    severity: 'high',
    pattern: rx(`${B}(?:(?:het|dit|alles)\\s+(?:gaat|draait)|(?:gaat|draait)\\s+het)\\s+niet\\s+(?:alleen\\s+|enkel\\s+|zozeer\\s+|meer\\s+)?om${E}[^.!?\\n]{1,60}?(?:[,;:]\\s*(?:maar\\s+)?|\\s+maar\\s+)(?:(?:het|dit|alles)\\s+(?:gaat|draait)\\s+)?om${E}`),
    message: '"Het gaat niet om X, maar om Y": dezelfde omkering in een andere vorm.',
    fix: 'Zeg waar het wel om gaat, zonder de stroman.',
  },
  {
    id: 'nl-negation-split',
    category: 'negation',
    severity: 'high',
    // The sentence start sits in a lookbehind so the match begins at the negation, not over an opener before it.
    pattern: rx(`(?<=(?:^|[.!?]\\s+)[^.!?\\n]{0,90})${B}(?:is geen|is niet|zijn geen|zijn niet|was geen|(?:gaat|draait) (?:het )?niet (?:alleen |enkel |meer )?om|heeft niets te maken met)${E}[^.!?\\n]{0,60}[.!?]\\s+(?:Het is|Het gaat om|Het draait om|Dit is|Dat is|Ze is|Hij is|Het zijn|Je hebt)${E}`, 'gmu'),
    message: 'Een gesplitste omkering: de ene zin ontkent X, de volgende onthult Y ("Dit is geen theorie. Het is…").',
    fix: 'Houd alleen de tweede zin, of noem een overtuiging die de lezer echt heeft.',
  },
  {
    id: 'nl-geen-maar',
    category: 'negation',
    severity: 'medium',
    cap: 3,
    pattern: rx(`${B}(?:is|zijn|heb|hebt|heeft|wordt|word)\\s+(?:geen|niet)\\s+[^.!?\\n,]{1,40},\\s*maar\\s+`),
    message: '"Je hebt geen X, maar Y": omkering midden in de zin. Eén keer is gewoon Nederlands; vaak is het een sjabloon.',
    fix: 'Zeg Y en laat X weg, tenzij de lezer X echt gelooft.',
  },
  {
    id: 'nl-x-not-y',
    category: 'negation',
    severity: 'low',
    cap: 3,
    pattern: rx(`,\\s+(?:niet|geen)\\s+(?:een\\s+|de\\s+|het\\s+)?[\\p{L}-]+\\s*[.!?]`),
    message: '"X, niet Y." als slotklap van een zin.',
    fix: 'Eindig op X; de ontkenning voegt zelden iets toe.',
  },
  {
    id: 'nl-not-just',
    category: 'negation',
    severity: 'medium',
    pattern: rx(`${B}(?:is|zijn|was|wordt)\\s+(?:dus\\s+)?niet\\s+(?:zomaar|gewoon|alleen maar|slechts|louter)\\s+(?:een\\s+|de\\s+|het\\s+)?[\\p{L}-]+`),
    message: '"Niet zomaar een X" blaast iets op door het af te zetten tegen het gewone.',
    fix: 'Zeg wat het specifiek doet.',
  },
  {
    id: 'nl-not-only-but-also',
    category: 'negation',
    severity: 'low',
    cap: 2,
    pattern: rx(`${B}niet alleen${E}[^.!?\\n]{1,80}?${B}maar ook${E}`),
    message: '"Niet alleen X, maar ook Y" in een sjabloonritme.',
    fix: 'Noem beide gewoon, of kies de sterkste.',
  },

  // ── Formulas ──────────────────────────────────────────────────────────────
  {
    id: 'nl-stop-start',
    category: 'formula',
    severity: 'high',
    pattern: rx(`${B}Stop(?:\\s+met)?\\s+[^.!?\\n]{1,40}[.!?]\\s+(?:Begin|Start)(?:\\s+met)?${E}`),
    message: '"Stop met X. Begin met Y." is een slogan, geen advies.',
    fix: 'Zeg wat er verandert en waarom, in één gewone zin.',
  },
  {
    id: 'nl-you-dont-need',
    category: 'formula',
    severity: 'high',
    pattern: rx(`${B}je hebt geen\\s+[^.!?\\n]{1,40}\\s+nodig\\s*[.!?,;:]\\s*(?:je hebt|wat je nodig hebt|je moet)${E}`),
    message: '"Je hebt geen X nodig. Je hebt Y nodig." is een bekende formule.',
    fix: 'Noem Y en waarom het werkt.',
  },
  {
    id: 'nl-most-people',
    category: 'formula',
    severity: 'medium',
    pattern: rx(`${B}(?:wat|waar) de meeste\\s+[\\p{L}]+\\s+(?:niet\\s+)?(?:weten|missen|vergeten|niet zien|over het hoofd zien|fout doen)${E}|${B}de meeste\\s+[\\p{L}]+\\s+[^.!?\\n]{0,80}[.!?]\\s+(?:Maar\\s+)?(?:de weinigen|slechts weinigen|een handvol|de slimste|de beste)${E}`),
    message: '"Wat de meeste mensen missen" zet de lezer tegenover een vage massa.',
    fix: 'Zeg het inzicht zelf, met een voorbeeld.',
  },
  {
    id: 'nl-colon-reveal',
    category: 'formula',
    severity: 'medium',
    pattern: rx(`${SENT}\\s*(?:\\*\\*)?(?:Het verdict|Het punt is|Het geheim|De waarheid|Het resultaat|De conclusie|Het goede nieuws|Het slechte nieuws|De clou|Het addertje|Simpel gezegd|Vuistregel|De les|Het antwoord|De realiteit|Het verschil|De kern)(?:\\*\\*)?\\s*:`),
    message: 'Een label met dubbelepunt ("Het verdict:") als aanloop naar een onthulling.',
    fix: 'Schrap het label en begin met de inhoud.',
  },
  {
    id: 'nl-question-reveal',
    category: 'formula',
    severity: 'medium',
    pattern: rx(`${SENT}\\s*(?:Het|De|Een|Mijn|Onze)\\s+(?:resultaat|geheim|antwoord|reden|verschil|probleem|addertje|gevolg|oplossing|clou|uitkomst|truc|kicker)\\s*\\?`),
    message: 'Een korte retorische vraag ("Het resultaat?") om een antwoord aan te kondigen.',
    fix: 'Geef het antwoord meteen.',
  },
  {
    id: 'nl-question-answered',
    category: 'formula',
    severity: 'low',
    cap: 3,
    pattern: rx(`\\?\\s+(?:Dan|Dat|Simpel|Omdat|Nee|Ja)[.,!:\\s]`),
    message: 'Vraag gesteld en meteen zelf beantwoord ("Word je niet genoemd? Dan…"). Eén keer kan, als patroon valt het op.',
    fix: 'Schrijf de meeste als gewone voorwaardelijke zin ("Als je…, dan…").',
  },
  {
    id: 'nl-dive-in',
    category: 'formula',
    severity: 'medium',
    pattern: rx(`${B}(?:laten we (?:er\\s*)?(?:in duiken|erin duiken|eens kijken|beginnen|starten)|we duiken (?:er\\s*)?(?:dieper\\s+)?in|duik(?:en)? (?:er\\s+)?(?:dieper\\s+)?in|zonder verder oponthoud|zonder omwegen)${E}`),
    message: 'Aankondiging in plaats van inhoud ("Laten we erin duiken").',
    fix: 'Schrap de zin en begin met het eerste echte punt.',
  },
  {
    id: 'nl-fomo',
    category: 'formula',
    severity: 'medium',
    pattern: rx(`${B}(?:de boot (?:missen|mist)|mis de boot niet|voor het te laat is|(?:je )?(?:loopt|blijft) achter|blijft achter|het venster (?:sluit|staat open|is open)|nu of nooit|wie nu niet [^.!?\\n]{0,40}(?:verliest|blijft achter|mist))${E}`),
    message: 'Angst om iets te missen als drukmiddel.',
    fix: 'Geef de echte reden om nu te handelen, of laat het weg.',
  },
  {
    id: 'nl-whether',
    category: 'formula',
    severity: 'medium',
    pattern: rx(`${SENT}\\s*Of je nu\\s+[^.!?\\n]{1,60}?\\s+(?:bent|hebt|wilt|zoekt)\\s+of${E}`),
    message: '"Of je nu X bent of Y" spreekt iedereen aan en dus niemand.',
    fix: 'Kies de lezer voor wie dit is.',
  },
  {
    id: 'nl-wont-replace',
    category: 'formula',
    severity: 'medium',
    pattern: rx(`${B}AI (?:zal|gaat) (?:je|jou|u|jouw baan|je job)\\s+niet\\s+vervangen${E}`),
    message: '"AI zal je niet vervangen, maar…" is een uitgekauwde formule.',
    fix: 'Zeg wat er concreet verandert in het werk.',
  },

  // ── Openers and closers ───────────────────────────────────────────────────
  {
    id: 'nl-slop-opener',
    category: 'opener',
    severity: 'high',
    pattern: rx(`${B}(?:in (?:de|het|deze|onze) (?:huidige|snel veranderende|steeds veranderende|snel evoluerende|digitale|moderne|hedendaagse|razendsnelle)\\s+(?:[\\p{L}-]+\\s+){0,2}(?:wereld|landschap|tijdperk|tijd|markt|samenleving|economie)|in (?:een|deze) (?:wereld|tijd) (?:waarin|waar)|in het tijdperk van|in een tijdperk waarin)${E}`),
    message: 'Een opening die elk artikel had kunnen beginnen ("In het huidige digitale landschap").',
    fix: 'Open met het specifieke: een cijfer, een moment, de vraag van de lezer.',
  },
  {
    id: 'nl-slop-closer',
    category: 'closer',
    severity: 'medium',
    pattern: rx(`${SENT}\\s*(?:Kortom|Samengevat|Al met al|Concluderend|Tot slot|Om af te sluiten)\\s*[,:]|${B}(?:de toekomst is (?:nu|aan jou|aan wie)|de keuze is aan jou|de tijd is nu|het is tijd om (?:actie te ondernemen|in actie te komen))${E}`),
    message: 'Een slotformule die samenvat of oproept in plaats van af te ronden.',
    fix: 'Eindig op je laatste echte punt of één concrete volgende stap.',
  },

  // ── Fluff ─────────────────────────────────────────────────────────────────
  {
    id: 'nl-promo-fluff',
    category: 'fluff',
    severity: 'medium',
    pattern: words([
      'game[- ]?changer', 'baanbrekend\\w*', 'revolutionair\\w*', 'naar een hoger niveau', 'naar het volgende niveau',
      'ontgrendel\\w*', 'haal het maximale uit', '(?:je|jouw|uw) (?:volle|volledige) potentieel', 'het volle potentieel',
      'ongekende', 'next[- ]level', 'een wereld van verschil', 'tilt (?:je|jouw|uw) [\\p{L}]+ naar', 'ultieme gids',
      'zet de toon', 'het beste van twee werelden', 'een nieuw tijdperk',
    ]),
    message: 'Reclametaal die niets concreets belooft.',
    fix: 'Vervang het door wat er echt verandert, met een cijfer als je dat hebt.',
  },
  {
    id: 'nl-platitude',
    category: 'fluff',
    severity: 'medium',
    pattern: words([
      'de sleutel tot succes', 'succes is geen toeval', 'het draait allemaal om', 'aan het eind(?:e)? van de dag',
      'op het einde van de dag', 'uiteindelijk draait het om', 'kwaliteit boven kwantiteit', 'het geheim zit in',
      'de magie zit in', 'de echte kracht zit in', 'waar het echt om draait', 'de echte waarde zit in',
    ]),
    message: 'Een gemeenplaats die op elk onderwerp past.',
    fix: 'Zeg wat het in dit geval concreet betekent.',
  },
  {
    id: 'nl-stock-cliche',
    category: 'fluff',
    severity: 'low',
    pattern: words([
      'van een kilometer ver', 'als een paal boven water', 'het topje van de ijsberg', 'een tweesnijdend zwaard',
      'geen rocket science', 'laaghangend fruit', 'in een notendop', 'het wiel (?:niet )?opnieuw (?:uit te vinden|uitvinden)', 'out of the box',
      'de kers op de taart', 'twee vliegen in één klap',
    ]),
    message: 'Een cliché.',
    fix: 'Zeg het letterlijk.',
  },

  // ── Filler ────────────────────────────────────────────────────────────────
  {
    id: 'nl-filler-transition',
    category: 'filler',
    severity: 'low',
    pattern: rx(`${SENT}\\s*(?:Bovendien|Daarnaast|Echter|Tevens|Voorts|Ten slotte|Verder nog)${E}`),
    message: 'Een schrijftaal-overgang die de zin trager maakt.',
    fix: 'Schrap hem; de volgorde van de zinnen doet het werk.',
  },
  {
    id: 'nl-filler-phrase',
    category: 'filler',
    severity: 'low',
    pattern: words([
      'het is (?:belangrijk|essentieel|cruciaal|goed) om (?:te )?(?:weten|onthouden|beseffen|benadrukken|op te merken)',
      'het is vermeldenswaard', 'het mag duidelijk zijn', 'zoals eerder (?:vermeld|gezegd|besproken)', 'het spreekt voor zich',
      'vandaag de dag', 'op het gebied van', 'met betrekking tot', 'in het kader van', 'een (?:breed )?scala aan',
    ]),
    message: 'Vulwoorden die niets toevoegen.',
    fix: 'Schrap ze of zeg het korter.',
  },
  {
    id: 'nl-inflated',
    category: 'filler',
    severity: 'medium',
    pattern: words([
      'speelt een (?:cruciale|essentiële|sleutel|belangrijke|centrale|doorslaggevende|grote) rol',
      'een (?:cruciale|essentiële|centrale|doorslaggevende) rol (?:speelt|spelen|speelde)', 'een sleutelrol','van (?:cruciaal|essentieel|groot) belang',
      'een cruciale factor', 'de hoeksteen van', 'het fundament van', 'niet te onderschatten', 'fundamenteel(?:e)?', 'exponentieel(?:e)?',
      'een van de (?:belangrijkste|grootste) [\\p{L}]+ van (?:onze|deze) tijd',
    ]),
    message: 'Opgeblazen belang zonder bewijs.',
    fix: 'Laat zien waarom het telt, met een gevolg of een cijfer.',
  },
  {
    id: 'nl-copula',
    category: 'filler',
    severity: 'low',
    pattern: words(['fungeert als', 'fungeren als', 'dient als', 'dienen als', 'vormt de basis voor']),
    message: 'Omweg voor "is".',
    fix: 'Schrijf "is" of zeg wat het doet.',
  },

  // ── Attribution ───────────────────────────────────────────────────────────
  {
    id: 'nl-vague-attribution',
    category: 'attribution',
    severity: 'medium',
    pattern: words([
      'onderzoek (?:toont|wijst) (?:aan|uit)', 'studies (?:tonen|wijzen) (?:aan|uit)', 'experts (?:zeggen|zijn het erover eens)',
      'volgens experts', 'steeds meer (?:mensen|bedrijven|merken) (?:ontdekken|kiezen)', 'het is algemeen bekend', 'men zegt',
    ]),
    message: 'Een bron zonder naam.',
    fix: 'Noem de bron, of schrap de claim.',
  },

  // ── Vocabulary ────────────────────────────────────────────────────────────
  {
    id: 'nl-ai-vocab',
    category: 'vocabulary',
    severity: 'low',
    cap: 6,
    pattern: words([
      'cruciaal', 'cruciale', 'essentieel', 'essentiële', 'naadloos', 'naadloze', 'robuust', 'robuuste', 'holistisch\\w*',
      'synergie\\w*', 'transformatie\\w*', 'transformeren', 'revolutioneren', 'onmiskenbaar', 'veelzijdig\\w*', 'toonaangevend\\w*',
      'state[- ]of[- ]the[- ]art', 'navigeren door', 'ontrafel\\w*', 'in het hart van', 'digitale landschap', 'het landschap van',
      'empower\\w*', 'leveragen', 'harnessen', 'krachtig(?:e)?', 'dynamisch(?:e)?', 'innovatief', 'innovatieve',
    ]),
    message: 'Woord dat veel vaker in AI-teksten opduikt dan in gewone Nederlandse tekst.',
    fix: 'Gebruik het gewone woord of het concrete ding dat je bedoelt.',
  },
  {
    id: 'nl-anglicism',
    category: 'vocabulary',
    severity: 'low',
    cap: 4,
    pattern: words([
      'verdubbel(?:en|t)? (?:je |jij |we )?op', 'dubbel down', 'deep[- ]dive', 'het maakt sense', 'dat maakt (?:geen )?zin',
      'in de lead', 'impact maken', 'een statement maken', 'op (?:een )?dagelijkse basis', 'pakt het uit',
    ]),
    message: 'Letterlijk vertaald Engels of onnodig anglicisme.',
    fix: 'Gebruik de Nederlandse uitdrukking ("inzetten op", "elke dag", "dat klopt").',
  },

  // ── Chatbot artifacts and channel ─────────────────────────────────────────
  {
    id: 'nl-chatbot-artifact',
    category: 'chatbot',
    severity: 'high',
    pattern: rx(`${B}(?:ik hoop dat dit helpt|goede vraag|wil je dat ik|laat (?:het )?me weten als je (?:nog )?(?:vragen|meer) (?:hebt|wilt)|aarzel niet om contact op te nemen|als (?:een )?ai(?:-taalmodel)?|hier is een (?:herschreven|verbeterde|aangepaste|gepolijste) versie|natuurlijk!|absoluut!|zeker!)`),
    message: 'Achtergebleven chatbot-antwoordtekst.',
    fix: 'Verwijder het.',
  },
  {
    id: 'nl-engagement-bait',
    category: 'channel',
    severity: 'medium',
    channels: SOCIAL,
    pattern: rx(`(?:laat (?:het )?(?:me )?(?:weten )?in de (?:comments|reacties)|deel je (?:gedachten|mening|ervaring)|wat denk jij\\?|wat vind jij\\?|${B}eens\\?|${B}herkenbaar\\?|👇)`),
    message: 'Afsluiter om reacties te lokken.',
    fix: 'Stel één specifieke vraag die alleen jij zou stellen, of eindig op je punt.',
  },
];

// Function words used to tell Dutch from English. Words both languages share ("in", "is") are left out.
export const NL_STOP = new Set(`de het een en van ik je jij niet dat die op te zijn met voor maar ook als bij wat wordt worden naar
heb hebt heeft geen nog wel dan om zo er hun ze we wij ons onze jouw uw deze dit hoe waar want omdat kan kun moet zal zou
al aan uit over door tot nu meer veel mijn haar hem hij zij was waren alleen echt gewoon eigenlijk`.split(/\s+/));
export const EN_STOP = new Set(`the and of to that it you for with are this not but be on have has was were they we our your
their from by at an or what which who will would can could should do does did just about more than then there these those
my me him her she he them its it's don't i'm`.split(/\s+/));
