import { fr } from './fr';

/**
 * The English pack.
 *
 * Typed as `typeof fr`, not as `PackBase`. That is the whole compile-time
 * enforcement: a key added to `fr` and forgotten here fails the build rather
 * than showing someone a raw key. The types cannot see an *empty* value, which
 * is what `tests/node/i18n.parity.test.ts` is for.
 */
export const en: typeof fr = {
  ui: {
    appName: "Thought Record",
    appSub: "Cognitive restructuring",
    journal: "Journal",
    heroTitre: "Catching the sentence you never hear yourself say",
    heroLede: "When an emotion spikes, a sentence came first. It goes by so fast that all you feel is its effect.",
    s1Titre: "Try it",
    s1Intro: "One scene, two possible sentences. Tap one, then the other.",
    s1Situation: "You text a friend. Three hours later, still no reply.",
    s1LectureA: "“He's ignoring me.”",
    s1LectureB: "“He must be busy.”",
    s1Caption: "Same fact, same person, same day. What changes between the two is one sentence.",
    rEmotion: "Emotion",
    rReaction: "Reaction",
    rSuite: "What follows",
    s2Titre: "The model",
    s2Intro: "It isn't the situation that triggers the emotion, it's the interpretation you place on it. This idea, set out by psychiatrist **Aaron Beck** in the 1960s, is the foundation of cognitive behavioural therapy.",
    s2Alt: "Diagram: the situation leads to an automatic thought, which leads to an emotion, then to a behaviour, which feeds back into the situation.",
    s2Caption: "The loop sustains itself: avoiding brings relief in the moment, and confirms the fear.",
    s2Apres: "The automatic thought is the only link you can act on directly. You don't choose what happens to you, or what you feel. You can examine what you tell yourself.",
    nSituation: "Situation",
    nPensee: "Automatic thought",
    nAgit: "WHERE THE RECORD ACTS",
    nEmotion: "Emotion and sensations",
    nComportement: "Behaviour",
    s3Titre: "One record, seven steps",
    s3Intro: "Every record follows the same order. Walk through a complete example.",
    s3Caption: "The order isn't decorative: looking for another reading before listing the facts only produces positive thinking, which doesn't hold.",
    colonne: "COLUMN",
    s4Titre: "What the research says",
    s4Repli: "Why write rather than ruminate?",
    s4ReplA: "As long as it stays in your head, a thought is experienced as self-evident: it merges with reality. Written down, it becomes a sentence — a dated object you can reread and dispute.",
    s4ReplB: "This slight gap between you and your thought is considered one of the active ingredients of the exercise. It is also why filling in a record in your head doesn't produce the same effect.",
    s5Titre: "Why this app exists",
    s5Intro: "There are already plenty of wellbeing apps. This one came out of a few deliberate choices.",
    s5Sign: "The author",
    s6Titre: "What this app is not",
    limites: "Limits",
    s6A: "Neither a diagnosis, nor a treatment, nor a professional. It is not suited to trauma work, nor to periods when you are genuinely unwell: those situations call for someone in the room.",
    s6B: "If filling in a record consistently leaves you worse off than before, it isn't the right tool at the right time.",
    s6C: "**In a crisis: {crise}**",
    safety: "This app is not care. In a crisis: {crise}",
    vosFiches: "Your records",
    journalHint: "One record per situation that set off a strong emotion. Seven steps, five minutes.",
    vide: "No records yet.\nNext time an emotion spikes, open one.",
    comprendre: "How it works →",
    commencer: "Get started",
    retourJournal: "Back to journal",
    nouvelleFiche: "New record",
    precedent: "Previous",
    suivant: "Next",
    revenirDebut: "Back to the start",
    continuer: "Continue",
    retour: "Back",
    annuler: "Cancel",
    fermer: "Close",
    voirBilan: "See the summary",
    enregistrer: "Save record",
    fermerSansEnreg: "Close without saving",
    intensite: "Intensity",
    jycrois: "I believe it",
    jycroisMaintenant: "I believe it now",
    intensiteMaintenant: "Intensity now",
    bilan: "Summary",
    ceQuiABouge: "What shifted",
    ficheDu: "Record of",
    relireAFroid: "Reread in the cold light of day",
    etAujourdhui: "And today?",
    jycroyais: "I believed it",
    apresLaFiche: "After the record",
    aujourdhui: "Today",
    relectures: "Re-ratings",
    finFiche: "End of record",
    reevaluer: "Re-rate today",
    reevalQ: "How true does this sentence feel to you now?",
    sansIntitule: "Untitled",
    aucuneIdentifiee: "None identified",
    lSituation: "Situation",
    lEmotion: "Emotion",
    lPensee: "Automatic thought",
    lDistorsions: "Distortions",
    lPour: "Evidence for",
    lContre: "Evidence against",
    lAlternative: "Alternative thought",
    aideTitre: "Questions from your distortions",
    aideVide: "No distortion ticked at step 4: go back if you want targeted questions.",
    shEyebrow: "Cognitive distortion",
    shQuoi: "What it is",
    shCout: "What it costs",
    shComment: "How to undo it",
    shCocher: "That's it — tick it",
    shRetirer: "Remove from my record",
    comprendreLabel: "Understand:"
  },
  emotions: {
    anxiete: "Anxiety",
    tristesse: "Sadness",
    colere: "Anger",
    honte: "Shame",
    culpabilite: "Guilt",
    peur: "Fear",
    decouragement: "Discouragement"
  },
  lectures: {
    a: {
      emotion: "Anxiety, shame",
      niveau: 75,
      compo: "I reread my messages looking for what might have upset him. I don't dare follow up.",
      suite: "The silence drags on, so the interpretation gets confirmed. I pull back a little."
    },
    b: {
      emotion: "Mild irritation",
      niveau: 20,
      compo: "I move on. I'll follow up tomorrow if need be.",
      suite: "He replies the next morning. The episode leaves nothing behind."
    }
  },
  facts: [
    {
      t: "CBT is one of the most studied psychotherapies.",
      d: "Its effectiveness for depression and anxiety disorders rests on hundreds of controlled trials."
    },
    {
      t: "On your own, it works less well than with support.",
      d: "The benefit is real, but markedly larger when a professional follows along, even at a distance."
    },
    {
      t: "It's training, not revelation.",
      d: "The effect comes from repetition. The first records are laborious, and that's normal."
    }
  ],
  choix: [
    {
      ic: "carnet",
      t: "A notebook, not a coach.",
      d: "The app asks the questions, you write the answers. A thought reworded by someone else — or by a machine — dislodges nothing: the work is putting it into your own words."
    },
    {
      ic: "bellOff",
      t: "No notifications, no streaks.",
      d: "You fill in a record when an emotion spikes, not because a badge demands it. Engagement mechanics would turn introspection into a daily chore."
    },
    {
      ic: "history",
      t: "Nothing is ever rewritten.",
      d: "An old record stays exactly as you filled it in. You can re-rate today what you believed yesterday, never correct it — otherwise the distance travelled disappears."
    },
    {
      ic: "lock",
      t: "Your records never leave your phone.",
      d: "What gets written here is as private as it gets. No account, no server, no usage analytics."
    },
    {
      ic: "eye",
      t: "What it can't do is written down too.",
      d: "A self-therapy app that promises to cure is lying. Its limits sit on the same page as its promises."
    }
  ],
  tour: [
    {
      n: "Situation",
      def: "The observable facts, without interpretation. What a camera would have filmed.",
      ex: "2 p.m. meeting. My manager cuts off my presentation after two minutes."
    },
    {
      n: "Emotion",
      def: "What you feel, and its intensity from 0 to 100. Naming an emotion already draws its outline.",
      ex: "Shame, anxiety — {num}70 / 100{/num}"
    },
    {
      n: "Automatic thought",
      def: "The exact sentence that crossed your mind, and how far you believe it in the moment.",
      ex: "{cit}“He thinks I'm incompetent.”{/cit}\nI believe it {num}85 %{/num}"
    },
    {
      n: "Distortion",
      def: "The mechanism that bends the thought. Eight are catalogued in the app, with the questions that undo them.",
      ex: "Mind reading · Catastrophizing"
    },
    {
      n: "Evidence for",
      def: "The proof that supports the thought. You start here, honestly, otherwise the exercise is just self-persuasion.",
      ex: "He interrupted me. He looked at his phone twice."
    },
    {
      n: "Evidence against",
      def: "The facts that contradict it. The hardest step, and the one that does the work.",
      ex: "He interrupts everyone. He handed me the client account last month."
    },
    {
      n: "Alternative thought",
      def: "A fairer version — neither positive nor reassuring. Then you re-rate in the cold light of day.",
      ex: "{cit}“He manages meeting time badly. That says nothing about my work.”{/cit}",
      fin: true
    }
  ],
  steps: [
    {
      ey: "Column 1 · Facts",
      q: "What happened?",
      h: "Observable facts only: where, when, with whom. No interpretation yet.",
      ph: "2 p.m. meeting. My manager cut off my presentation after two minutes."
    },
    {
      ey: "Column 2 · Emotion",
      q: "What did you feel?",
      h: "Pick what dominates, then place the intensity at its peak."
    },
    {
      ey: "Column 3 · Automatic thought",
      q: "What sentence crossed your mind?",
      h: "Its exact wording, in the present tense, as it arrived.",
      ph: "He thinks I'm incompetent, I'll end up being sidelined."
    },
    {
      ey: "Column 4 · Distortion",
      q: "What does this thought look like?",
      h: "Naming the mechanism helps you step back from it. Tap “?” to understand each one."
    },
    {
      ey: "Column 5 · Evidence for",
      q: "What supports this thought?",
      h: "Proof, not impressions. What an outside observer could have noted.",
      ph: "He interrupted me. He looked at his phone twice."
    },
    {
      ey: "Column 6 · Evidence against",
      q: "And what contradicts it?",
      h: "The hardest, and the most useful. The questions below come from the distortions you ticked.",
      ph: "He interrupts everyone. He handed me the client account last month."
    },
    {
      ey: "Column 7 · Alternative thought",
      q: "Which version holds up better?",
      h: "Neither positive nor reassuring: fairer. Then re-rate in the cold light of day.",
      ph: "He manages meeting time badly. That says nothing about the value of my work."
    }
  ]
};
