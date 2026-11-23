// AI Slop Killer rule catalog.
// Each rule: id, category, severity (high | medium | low), message, fix,
// and either `pattern` (a global regex) or `check(text, ctx)` returning matches.
// Optional: `channels` (weight multipliers per channel, 0 turns a rule off),
// `voiceKey` (a habit the writer's own voice can permit), `cap` (max matches scored).

const A = "['’]"; // straight or curly apostrophe

const words = (list) => new RegExp(`\\b(?:${list.join('|')})\\b`, 'gi');

export const SEVERITY_WEIGHT = { high: 3, medium: 2, low: 1 };

export const CHANNELS = [
  'general', 'linkedin', 'x', 'blog', 'newsletter', 'email', 'cold-email',
  'cover-letter', 'academic', 'sales',
];

const SOCIAL = ['linkedin', 'x'];

export const RULES = [
  // ── Negation pivots: defining a thing by a claim nobody made ──────────────
  {
    id: 'negation-pivot',
    category: 'negation',
    severity: 'high',
    pattern: new RegExp(`\\b(?:it${A}?s|it is|this is|that${A}?s|they${A}?re)\\s+not\\s+[^.!?\\n]{1,60}?(?:[,;:]|\\s[—–-])\\s*(?:it${A}?s|it is|this is|that${A}?s|they${A}?re|but)\\b`, 'gi'),
    message: '"It\'s not X, it\'s Y" sets up a contrast nobody asked for.',
    fix: 'Delete the negated half and state Y directly.',
  },
  {
    id: 'negation-pivot-split',
    category: 'negation',
    severity: 'high',
    pattern: new RegExp(`(?:^|[.!?]\\s+)[^.!?\\n]{0,40}\\b(?:isn${A}t|is not|aren${A}t|are not|wasn${A}t|not about|doesn${A}t)\\b[^.!?\\n]{0,60}[.!?]\\s+(?:It${A}?s|It is|That${A}?s|This is|They${A}?re|You need|It)\\b`, 'g'),
    message: 'A split negation pivot: one sentence denies X, the next reveals Y.',
    fix: 'Keep only the second sentence, or name a belief the reader really holds.',
  },
  {
    id: 'not-just',
    category: 'negation',
    severity: 'high',
    pattern: new RegExp(`\\b(?:isn${A}t|aren${A}t|is not|are not|not)\\s+(?:just|simply|merely)\\s+(?:another|a|an|about)\\b`, 'gi'),
    message: '"Not just another X" promises a difference the copy then has to prove.',
    fix: 'Say the one thing that is different, plainly.',
  },
  {
    id: 'not-because-but-because',
    category: 'negation',
    severity: 'high',
    pattern: /\bnot because\b[^.!?]{0,80}\bbut because\b/gi,
    message: '"Not because X, but because Y" is a manufactured contrast.',
    fix: 'Give the real reason on its own.',
  },
  {
    id: 'not-x-not-y',
    category: 'negation',
    severity: 'high',
    pattern: /\bNot\s[^.!?\n]{1,40}\.\s+Not\s[^.!?\n]{1,40}\./g,
    message: '"Not X. Not Y. But Z." is a fake-depth build-up.',
    fix: 'Start at Z.',
  },
  {
    id: 'not-only-but-also',
    category: 'negation',
    severity: 'high',
    pattern: /\bnot only\b[^.!?]{0,100}\bbut(?: also)?\b/gi,
    message: '"Not only... but also" is the construction most linked to lower engagement.',
    fix: 'Use "and", or make two sentences.',
  },
  {
    id: 'er-not-er',
    category: 'negation',
    severity: 'medium',
    pattern: /\b(\w{3,}er),?\s+not\s+(\w{3,}er)\b/gi,
    message: '"Smarter, not harder" style slogan.',
    fix: 'Say what actually changes.',
  },

  // ── Formulas ──────────────────────────────────────────────────────────────
  {
    id: 'stop-start',
    category: 'formula',
    severity: 'medium',
    pattern: /\bStop\s[^.!?\n]{1,40}[.!?]\s+Start\s/g,
    message: '"Stop X. Start Y." formula.',
    fix: 'Describe the change and what it gets the reader.',
  },
  {
    id: 'you-dont-need',
    category: 'formula',
    severity: 'high',
    pattern: new RegExp(`\\byou don${A}t need\\b[^.!?]{0,50}[.!?,]\\s+you need\\b`, 'gi'),
    message: '"You don\'t need X. You need Y." formula.',
    fix: 'Say what they need and why.',
  },
  {
    id: 'fomo-threat',
    category: 'formula',
    severity: 'medium',
    pattern: new RegExp(`\\bif you${A}?re not\\b[^.!?]{0,40}\\byou${A}?re (?:already )?(?:behind|losing|falling|missing)`, 'gi'),
    message: 'FOMO threat formula.',
    fix: 'Name the real cost with a specific example.',
  },
  {
    id: 'most-people-few',
    category: 'formula',
    severity: 'medium',
    pattern: /\bmost people\b[^.!?]{0,80}[.!?]\s+(?:the (?:few|top|best)|winners|successful people|top performers)\b/gi,
    message: '"Most people X. The few who win Y." binary split.',
    fix: 'Drop the split and make the point with one real example.',
  },
  {
    id: 'whether-youre',
    category: 'formula',
    severity: 'medium',
    pattern: new RegExp(`\\bwhether you${A}?re\\b[^.!?]{0,70}\\bor\\b`, 'gi'),
    message: '"Whether you\'re X or Y" writes to everyone, so it lands with no one.',
    fix: 'Pick the one reader this is for and write to them.',
  },
  {
    id: 'question-reveal',
    category: 'formula',
    severity: 'medium',
    pattern: /(?:^|\n|[.!?]\s+)(?:The (?:truth|answer|result|secret|kicker|catch|best part|twist|reality)|The reason|What happened next|Why|My answer|The lesson)\?/g,
    message: 'Question-reveal ("The truth?") used as a drumroll.',
    fix: 'Just say it.',
  },
  {
    id: 'colon-reveal',
    category: 'formula',
    severity: 'medium',
    pattern: new RegExp(`\\b(?:here${A}?s (?:what|why|how|the thing|the truth|the deal|the kicker|the catch|the secret)|the (?:truth|secret|reality|kicker) is|let me explain|here${A}?s my take)\\b`, 'gi'),
    message: '"Here\'s what I learned:" style pre-framing.',
    fix: 'Cut the announcement and start with the point.',
  },
  {
    id: 'question-answered',
    category: 'formula',
    severity: 'medium',
    pattern: /\b(?:What does (?:this|that|it) mean|Why does (?:this|it) matter|So what)\?\s+(?:It|That|This)\b/g,
    message: 'A question asked only to be answered at once.',
    fix: 'Delete the question.',
  },
  {
    id: 'dive-in',
    category: 'formula',
    severity: 'medium',
    pattern: new RegExp(`\\b(?:let${A}?s dive (?:in|into|deep)|deep dive|buckle up|without further ado|let${A}?s unpack|let${A}?s break (?:it|this|that) down|let${A}?s get (?:started|into it))\\b`, 'gi'),
    message: 'Tour-guide transition ("let\'s dive in").',
    fix: 'Start the content.',
  },

  // ── Openers and closers ───────────────────────────────────────────────────
  {
    id: 'slop-opener',
    category: 'opener',
    severity: 'high',
    pattern: new RegExp(`\\b(?:in today${A}?s (?:[\\w-]+\\s+){0,3}(?:world|landscape|age|era|environment|market|economy)|in the ever-(?:evolving|changing) (?:world|landscape)|as technology continues to|in a world where|imagine a world|in an era (?:of|where)|have you ever wondered)\\b`, 'gi'),
    message: 'Stock opener that says nothing.',
    fix: 'Open with the first real fact, scene or claim.',
  },
  {
    id: 'slop-closer',
    category: 'closer',
    severity: 'high',
    pattern: /\b(?:in conclusion|in summary|in essence|to sum up|to summarize|the future (?:is|remains|looks) bright|only time will tell|one thing is (?:certain|clear)|at the end of the day)\b/gi,
    message: 'Stock closer or summary tag.',
    fix: 'End on the last real point, or one concrete next step.',
  },

  // ── Promotional fluff and platitudes ──────────────────────────────────────
  {
    id: 'promo-fluff',
    category: 'fluff',
    severity: 'medium',
    pattern: new RegExp(`\\b(?:unlock [^.!?\n]{0,30}potential|more [^.!?\n]{0,20} than ever|that${A}?s where [^.!?\n]{1,30} comes in|take (?:your|it|their) [^.!?\\n]{0,25}to the next level|next level|game[- ]changer|revolutioni[sz]e the way|harness the power|embark on (?:a|your) journey|supercharge|master the art of|unlock the secrets?|proven,? step-by-step|more important than ever|(?:the )?(?:transformative|ultimate|perfect) solution|you${A}?ve been waiting for|look no further|work smarter|elevate your|world-class|best-in-class|state-of-the-art|cutting-edge|next-generation)\\b`, 'gi'),
    message: 'Promotional fluff standing where a specific belongs.',
    fix: 'Replace it with what the product does or a real result.',
  },
  {
    id: 'platitude',
    category: 'fluff',
    severity: 'medium',
    pattern: new RegExp(`\\b(?:your network is your net worth|consistency (?:beats|over|is key|is everything)|done is better than perfect|setback is (?:a|the) setup|success (?:isn${A}t|is not) (?:a|the) destination|(?:it${A}?s )?a journey,? not a destination|every (?:lesson|challenge|setback|failure) is (?:a|an) (?:new )?(?:opportunity|setup|lesson)|fail(?:ing)? forward|the magic happens|outside (?:of )?your comfort zone|growth mindset|never give up|refuse to give up)\\b`, 'gi'),
    message: 'Greeting-card platitude.',
    fix: 'Swap it for the specific thing that happened to you.',
  },
  {
    id: 'emphasis-triad',
    category: 'fluff',
    severity: 'medium',
    pattern: /\b(\w{3,}) \w+, \1 \w+,? (?:and )?\1 \w+/gi,
    message: 'Repeated-word triad ("real X, real Y, real Z") used for emphasis.',
    fix: 'Keep the one item that is concrete.',
  },

  {
    id: 'the-answer-isnt',
    category: 'negation',
    severity: 'high',
    pattern: new RegExp(`\\b(The (?:answer|problem|secret|key|point|goal|question|fix|issue)) (?:isn${A}t|is not) [^.!?\\n]{1,50}[.!?]\\s+\\1 is\\b`, 'g'),
    message: '"The answer isn\'t X. The answer is Y." pivot.',
    fix: 'Say what the answer is.',
  },
  {
    id: 'repeat-subject-pivot',
    category: 'negation',
    severity: 'high',
    pattern: new RegExp(`\\b(We|I|You|They) (?:are|am|${A}re|${A}m) not ([a-z]+ing)\\b[^.!?\\n]{0,40}[.!?]\\s+\\1 (?:are|am|${A}re|${A}m) \\2\\b`, 'g'),
    message: '"We\'re not doing X. We\'re doing Y." pivot.',
    fix: 'Say what you are doing.',
  },
  {
    id: 'wont-replace-you',
    category: 'formula',
    severity: 'medium',
    pattern: new RegExp(`\\b(?:won${A}t|will not) replace you\\b`, 'gi'),
    message: '"X won\'t replace you. Someone using X will." stock hook.',
    fix: 'Make your actual point about the tool, with an example.',
  },
  {
    id: 'stock-cliche',
    category: 'fluff',
    severity: 'medium',
    pattern: new RegExp(`\\b(?:i hope (?:this|my) (?:email|message|note) finds you well|i came across your (?:profile|company|website)|truly impressed|proven track record|esteemed (?:organization|organisation|company|firm)|(?:a )?valuable (?:addition|asset) to your|keen interest|i am writing to express|hit the ground running|results-driven|team player|passionate about helping|quick (?:15|20|30)-minute call|thousands of (?:professionals|businesses|entrepreneurs|people) (?:who|just like you)|seasoned (?:marketing |sales )?professional)\\b`, 'gi'),
    message: 'Stock phrase that every template uses.',
    fix: 'Replace it with one fact about you or about them.',
  },

  // ── Filler ────────────────────────────────────────────────────────────────
  {
    id: 'filler-transition',
    category: 'filler',
    severity: 'medium',
    pattern: /(?:^|[.!?]\s+|\n)(?:Furthermore|Moreover|Additionally|Indeed|Subsequently|Consequently|Thus|Hence|Notably|Importantly|In addition|That being said|With that in mind),/g,
    channels: { academic: 0.5 },
    message: 'Formal filler transition.',
    fix: 'Use "and", "but", "so", or nothing.',
  },
  {
    id: 'filler-phrase',
    category: 'filler',
    severity: 'medium',
    pattern: new RegExp(`\\b(?:it${A}?s (?:important|worth|crucial|essential) to (?:note|remember|mention|understand)|it${A}?s worth (?:noting|mentioning)|it should be noted|in order to|when it comes to|at its core|the reality is|due to the fact that|it goes without saying|needless to say|i should note|it is important to note)\\b`, 'gi'),
    channels: { academic: 0.5 },
    message: 'Filler phrase that points at the point instead of making it.',
    fix: 'Delete it, or say "to" / "because".',
  },
  {
    id: 'inflated-importance',
    category: 'filler',
    severity: 'medium',
    pattern: new RegExp(`\\b(?:one of the most (?:pressing|important|significant) [\\w-]+ of our time|(?:plays? an?|the) (?:vital|crucial|key|pivotal|significant|critical|essential) role|stands? as an? (?:testament|reminder)|(?:is|are|serves as) an? testament|underscor(?:es|ing) the importance|a pivotal moment|a rich (?:tapestry|history|heritage)|in the realm of|navigat(?:e|ing) the (?:complexities|landscape|world)|ever-evolving|a broader (?:movement|shift|trend))\\b`, 'gi'),
    message: 'Inflated importance: grand words with no evidence behind them.',
    fix: 'Say what it does, with a fact.',
  },
  {
    id: 'copula-avoidance',
    category: 'filler',
    severity: 'medium',
    pattern: /\b(?:serves|serve|serving|stands|functions) as (?:a|an|the)\b/gi,
    message: '"Serves as" / "stands as" instead of "is".',
    fix: 'Use "is".',
  },
  {
    id: 'participle-tail',
    category: 'filler',
    severity: 'medium',
    pattern: /,\s+(?:highlighting|underscoring|emphasizing|emphasising|showcasing|reflecting|ensuring|fostering|cementing|solidifying|signaling|signalling|paving the way|contributing to|demonstrating)\b/gi,
    message: 'A ", highlighting X" tail that tacks on significance.',
    fix: 'Cut the tail, or make it its own sentence with a fact.',
  },
  {
    id: 'vague-attribution',
    category: 'attribution',
    severity: 'medium',
    pattern: /\b(?:studies|research|experts|data|science|surveys?|statistics) (?:show|shows|suggest|suggests|say|says|indicate|indicates|agree|prove|proves)\b|\b(?:many|some) experts (?:believe|say|agree)\b|\bit is widely (?:believed|accepted|known)\b/gi,
    message: 'Vague attribution with no named source.',
    fix: 'Name the study, the person or the number, or cut the claim.',
  },

  // ── AI-marketing vocabulary (low each; density does the work) ─────────────
  {
    id: 'ai-vocab',
    category: 'vocabulary',
    severity: 'low',
    cap: 6,
    pattern: words([
      'delve', 'delves', 'delving', 'leverage', 'leverages', 'leveraging', 'harness', 'harnessing',
      'unleash', 'unleashes', 'foster', 'fosters', 'fostering', 'underscore', 'underscores',
      'showcase', 'showcases', 'showcasing', 'illuminate', 'elucidate', 'streamline', 'streamlines',
      'empower', 'empowers', 'empowering', 'reimagine', 'reimagined', 'spearhead', 'embark',
      'synergy', 'synergies', 'paradigm', 'ecosystem', 'tapestry',
      '(?:digital|business|marketing|competitive|tech|evolving|media|regulatory) landscape', 'realm', 'testament',
      'pivotal', 'paramount', 'multifaceted', 'seamless', 'seamlessly', 'holistic', 'myriad',
      'plethora', 'bustling', 'vibrant', 'meticulous', 'meticulously', 'intricate', 'transformative',
      'groundbreaking', 'unparalleled', 'unprecedented', 'elevate', 'elevated', 'robust',
      'game-changing', 'revolutionary', 'invaluable', 'commendable', 'noteworthy',
    ]),
    message: 'Word that shows up far more in AI drafts than in human writing.',
    fix: 'Use the plain word, or the specific thing you mean.',
  },

  // ── Chatbot artifacts: always wrong in published copy ─────────────────────
  {
    id: 'chatbot-artifact',
    category: 'chatbot',
    severity: 'high',
    pattern: new RegExp(`\\b(?:i hope this helps|great question|would you like me to|let me know if you(?:${A}d| would)? (?:like|want|need)|feel free to (?:reach out|ask|contact)|as an ai|as of my (?:last|knowledge) (?:update|cutoff)|i${A}?d be happy to|here${A}?s a (?:revised|rewritten|polished|refined|draft) version|certainly!|absolutely!|sure!)`, 'gi'),
    message: 'Leftover chatbot reply text.',
    fix: 'Delete it.',
  },

  // ── Punctuation and formatting ────────────────────────────────────────────
  {
    id: 'em-dash',
    category: 'punctuation',
    severity: 'medium',
    voiceKey: 'emDash',
    cap: 5,
    pattern: /—|\s–\s/g,
    message: 'Em dash or spaced en dash, one of the loudest tells when it recurs.',
    fix: 'Use a period, comma, colon or parentheses. Do not just swap in a hyphen.',
  },
  {
    id: 'invisible-character',
    category: 'punctuation',
    severity: 'high',
    pattern: /[​-‍⁠﻿]/g,
    message: 'Invisible zero-width character, often left by AI tools.',
    fix: 'Strip it (run the fix with --strip).',
  },
  {
    id: 'emoji-bullet',
    category: 'format',
    severity: 'medium',
    voiceKey: 'emoji',
    pattern: /^[ \t]*(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}])️?[ \t]/gmu,
    message: 'Emoji used as bullet points.',
    fix: 'Use plain bullets or sentences.',
  },
  {
    id: 'emoji-hype',
    category: 'format',
    severity: 'low',
    voiceKey: 'emoji',
    cap: 3,
    pattern: /[🚀✨💡🔥🎯📈💪🙌⚡️🌟]/gu,
    channels: { x: 0.5 },
    message: 'Hype emoji (🚀 ✨ 🔥) added for energy.',
    fix: 'Cut it, or keep one that a person would really use.',
  },
  {
    id: 'hashtag-block',
    category: 'format',
    severity: 'medium',
    pattern: /(?:^|\n)[ \t]*(?:#[\p{L}\d_]+[ \t]*){3,}[ \t]*(?=\n|$)/gu,
    channels: { x: 1 },
    message: 'A block of three or more hashtags at the end.',
    fix: 'Keep two at most, or none.',
  },
  {
    id: 'engagement-bait',
    category: 'channel',
    severity: 'medium',
    pattern: new RegExp(`(?:let${A}?s discuss|drop (?:a|your) [^.!?\\n]{0,25}(?:below|in the comments)|(?:tell|let) me (?:know )?in the comments|comment below|share your thoughts|what do you think\\?|agree\\?|thoughts\\?|👇)`, 'gi'),
    channels: { linkedin: 1.5, x: 1.5 },
    message: 'Engagement-bait closer.',
    fix: 'Ask one specific question only you would ask, or end on your point.',
  },

  // ── Structure checks (computed, not regex) ────────────────────────────────
  {
    id: 'uniform-rhythm',
    category: 'structure',
    severity: 'medium',
    check: (text, ctx) => {
      // Prose only: parallel list items and table rows are meant to look alike.
      const prose = ctx.sentences.filter((s) => !s.list && !s.text.includes('|'));
      const lens = prose.map((s) => s.words);
      for (let i = 0; i + 3 < lens.length; i++) {
        const run = lens.slice(i, i + 4);
        if (Math.min(...run) >= 8 && Math.max(...run) - Math.min(...run) <= 4) {
          return [{ index: prose[i].index, match: prose[i].text.slice(0, 60) + '…' }];
        }
      }
      return [];
    },
    message: 'Four sentences in a row of nearly the same length: machine rhythm.',
    fix: 'Mix a short sentence in, and let one run long.',
  },
  {
    id: 'staccato',
    category: 'structure',
    severity: 'medium',
    check: (text, ctx) => {
      const out = [];
      const s = ctx.sentences;
      for (let i = 0; i + 2 < s.length; i++) {
        if (s[i].words <= 3 && s[i + 1].words <= 3 && s[i + 2].words <= 3 && !s[i].list) {
          out.push({ index: s[i].index, match: `${s[i].text} ${s[i + 1].text} ${s[i + 2].text}` });
          i += 2;
        }
      }
      return out;
    },
    message: 'Three fragments in a row ("Short. Punchy. Exhausting.").',
    fix: 'Join them into one real sentence.',
  },
  {
    id: 'broetry',
    category: 'structure',
    severity: 'medium',
    channels: { blog: 1.5, newsletter: 1.5, academic: 1.5, 'cover-letter': 1.5 },
    check: (text, ctx) => {
      const paras = ctx.paragraphs.filter((p) => !/^\s*#/.test(p.text) && p.words > 0);
      if (paras.length < 6) return [];
      const single = paras.filter((p) => p.sentences <= 1 && p.words <= 20).length;
      return single / paras.length >= 0.7 ? [{ index: 0, match: `${single} of ${paras.length} paragraphs are one short line` }] : [];
    },
    message: 'Nearly every paragraph is one short line ("broetry").',
    fix: 'Group related lines into real paragraphs; keep one-liners for the moments that earn them.',
  },
  {
    id: 'listicle-three',
    category: 'structure',
    severity: 'low',
    check: (text) => {
      const out = [];
      const re = /:[ \t]*\n(?:[ \t]*\n)?((?:[ \t]*(?:\d+[.)]|[-*•])[ \t][^\n]+(?:\n|$)){3})(?![ \t]*(?:\d+[.)]|[-*•])[ \t])/g;
      for (const m of text.matchAll(re)) out.push({ index: m.index, match: m[1].split('\n')[0].trim() + ' …' });
      return out;
    },
    message: 'A colon followed by exactly three list items: check the three are real, not padded.',
    fix: 'Keep the real count. Two strong items beat three with one filler.',
  },
  {
    id: 'no-contractions',
    category: 'structure',
    severity: 'low',
    voiceKey: 'noContractions',
    channels: { academic: 0, 'cover-letter': 0.5 },
    check: (text, ctx) => {
      if (ctx.words < 80) return [];
      const formal = (text.match(/\b(?:do not|does not|is not|are not|cannot|will not|it is|you are|we are|that is|I am)\b/gi) || []).length;
      const contr = (text.match(new RegExp(`\\b\\w+${A}(?:t|s|re|ve|ll|d|m)\\b`, 'gi')) || []).length;
      return formal >= 3 && contr === 0 ? [{ index: 0, match: `${formal} uncontracted forms, no contractions` }] : [];
    },
    message: 'No contractions anywhere: reads stiff and generated.',
    fix: 'Write "don\'t", "it\'s", "you\'re" the way you talk.',
  },
  {
    id: 'title-case-heading',
    category: 'format',
    severity: 'low',
    cap: 2,
    check: (text) => {
      const out = [];
      const re = /^#{1,6}[ \t]+(.+)$/gm;
      for (const m of text.matchAll(re)) {
        const big = m[1].split(/\s+/).filter((w) => w.replace(/[^\p{L}]/gu, '').length > 3);
        if (big.length >= 3 && big.every((w) => /^\p{Lu}/u.test(w))) out.push({ index: m.index, match: m[0] });
      }
      return out;
    },
    message: 'Title Case Headings, a common chatbot formatting default.',
    fix: 'Use sentence case.',
  },
  {
    id: 'bold-overuse',
    category: 'format',
    severity: 'low',
    check: (text, ctx) => {
      const n = (text.match(/\*\*[^*\n]+\*\*/g) || []).length;
      return n > Math.max(4, ctx.words / 60) ? [{ index: 0, match: `${n} bolded phrases` }] : [];
    },
    message: 'Bold sprinkled through the text.',
    fix: 'Bold one thing per section at most.',
  },
];
