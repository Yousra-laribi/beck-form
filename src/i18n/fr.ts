import type { PackBase } from './types';

/**
 * The French pack — the source of truth for which keys exist.
 *
 * Extracted from `init/maquette-fiche-beck.html` by script, not by hand: 94 keys
 * transcribed twice by eye is a guaranteed source of the exact drift this batch
 * exists to prevent. The generator refuses to emit if any string still carries
 * HTML, is empty, or contains a bare crisis number.
 *
 * Two keys from the mockup are **not** here: `s5MotA` and `s5MotB`, the
 * first-person author's note marked BROUILLON, held out entirely under Q6. That
 * is why the count is 92 and not the mockup's 94.
 *
 * `facts` is extracted but **must not be displayed** — F1-F3 make efficacy
 * claims with no source (health rule 1). See `content/sources.md`.
 */
export const fr = {
  ui: {
    appName: "Fiche de pensée",
    appSub: "Restructuration cognitive",
    journal: "Journal",
    heroTitre: "Rattraper la phrase qu'on ne s'entend pas dire",
    heroLede: "Quand une émotion monte d'un coup, une phrase l'a précédée. Elle passe si vite qu'on n'en ressent que l'effet.",
    s1Titre: "Essayez",
    s1Intro: "Une même scène, deux phrases possibles. Touchez l'une puis l'autre.",
    s1Situation: "Vous écrivez à un ami. Trois heures plus tard, toujours pas de réponse.",
    s1LectureA: "« Il m'ignore. »",
    s1LectureB: "« Il doit être pris. »",
    s1Caption: "Même fait, même personne, même journée. Ce qui change tient en une phrase.",
    rEmotion: "Émotion",
    rReaction: "Réaction",
    rSuite: "Et ensuite",
    s2Titre: "Le modèle",
    s2Intro: "Ce n'est pas la situation qui déclenche l'émotion, c'est l'interprétation qu'on en fait. Cette idée, formulée par le psychiatre **Aaron Beck** dans les années 1960, est le socle des thérapies cognitivo-comportementales.",
    s2Alt: "Schéma : la situation mène à une pensée automatique, qui mène à une émotion, puis à un comportement, qui alimente à nouveau la situation.",
    s2Caption: "La boucle s'entretient seule : éviter soulage sur le moment, et confirme la crainte.",
    s2Apres: "La pensée automatique est le seul maillon sur lequel on peut agir directement. On ne choisit pas ce qui nous arrive, ni ce qu'on ressent. On peut examiner ce qu'on se dit.",
    nSituation: "Situation",
    nPensee: "Pensée automatique",
    nAgit: "LÀ OÙ LA FICHE AGIT",
    nEmotion: "Émotion et sensations",
    nComportement: "Comportement",
    s3Titre: "Une fiche, en sept temps",
    s3Intro: "Chaque fiche suit le même ordre. Parcourez un exemple complet.",
    s3Caption: "L'ordre n'est pas décoratif : chercher une autre lecture avant d'avoir listé les faits ne produit que de la pensée positive, qui ne tient pas.",
    colonne: "COLONNE",
    s4Titre: "Ce que dit la recherche",
    s4Repli: "Pourquoi écrire plutôt que ruminer ?",
    s4ReplA: "Tant qu'elle reste en tête, la pensée est vécue comme une évidence : elle se confond avec le réel. Écrite, elle devient une phrase — un objet daté, qu'on peut relire et contester.",
    s4ReplB: "Ce léger décalage entre soi et sa pensée est considéré comme l'un des mécanismes actifs de l'exercice. C'est aussi pour ça que remplir une fiche de tête ne produit pas le même effet.",
    s5Titre: "Pourquoi cette app",
    s5Intro: "Il existe déjà beaucoup d'applications de bien-être. Celle-ci est née de quelques partis pris, assumés plutôt que subis.",
    s5Sign: "L'auteur",
    s6Titre: "Ce que cette app n'est pas",
    limites: "Limites",
    s6A: "Ni un diagnostic, ni un traitement, ni un professionnel. Elle ne convient pas au travail sur un traumatisme, ni aux périodes où l'on va vraiment mal : ces situations demandent quelqu'un en face.",
    s6B: "Si remplir une fiche vous laisse systématiquement plus mal qu'avant, ce n'est pas le bon outil au bon moment.",
    s6C: "**En cas de détresse : {crise}**",
    safety: "Cette app n'est pas un soin. En cas de détresse : {crise}",
    vosFiches: "Vos fiches",
    journalHint: "Une fiche par situation qui a fait monter une émotion forte. Sept étapes, cinq minutes.",
    vide: "Aucune fiche pour l'instant.\nLa prochaine fois qu'une émotion monte fort, ouvrez-en une.",
    comprendre: "Comprendre la méthode →",
    commencer: "Commencer",
    retourJournal: "Retour au journal",
    nouvelleFiche: "Nouvelle fiche",
    precedent: "Précédent",
    suivant: "Suivant",
    revenirDebut: "Revenir au début",
    continuer: "Continuer",
    retour: "Retour",
    annuler: "Annuler",
    fermer: "Fermer",
    voirBilan: "Voir le bilan",
    enregistrer: "Enregistrer la fiche",
    fermerSansEnreg: "Fermer sans enregistrer",
    intensite: "Intensité",
    jycrois: "J'y crois",
    jycroisMaintenant: "J'y crois maintenant",
    intensiteMaintenant: "Intensité maintenant",
    bilan: "Bilan",
    ceQuiABouge: "Ce qui a bougé",
    ficheDu: "Fiche du",
    relireAFroid: "Relire à froid",
    etAujourdhui: "Et aujourd'hui ?",
    jycroyais: "J'y croyais",
    apresLaFiche: "Après la fiche",
    aujourdhui: "Aujourd'hui",
    relectures: "Relectures",
    finFiche: "Fin de la fiche",
    reevaluer: "Réévaluer aujourd'hui",
    reevalQ: "À quel point cette phrase vous paraît-elle vraie maintenant ?",
    sansIntitule: "Sans intitulé",
    aucuneIdentifiee: "Aucune identifiée",
    lSituation: "Situation",
    lEmotion: "Émotion",
    lPensee: "Pensée automatique",
    lDistorsions: "Distorsions",
    lPour: "Arguments pour",
    lContre: "Arguments contre",
    lAlternative: "Pensée alternative",
    aideTitre: "Questions liées à vos distorsions",
    aideVide: "Aucune distorsion cochée à l'étape 4 : revenez en arrière si vous voulez des questions ciblées.",
    shEyebrow: "Distorsion cognitive",
    shQuoi: "Ce que c'est",
    shCout: "Ce que ça coûte",
    shComment: "Comment la restructurer",
    shCocher: "C'est bien ça, cocher",
    shRetirer: "Retirer de ma fiche",
    comprendreLabel: "Comprendre :"
  },
  emotions: {
    anxiete: "Anxiété",
    tristesse: "Tristesse",
    colere: "Colère",
    honte: "Honte",
    culpabilite: "Culpabilité",
    peur: "Peur",
    decouragement: "Découragement"
  },
  lectures: {
    a: {
      emotion: "Anxiété, honte",
      niveau: 75,
      compo: "Je relis mes messages en cherchant ce qui a pu le vexer. Je n'ose pas relancer.",
      suite: "Le silence dure, donc l'interprétation se confirme. Je m'éloigne un peu."
    },
    b: {
      emotion: "Léger agacement",
      niveau: 20,
      compo: "Je passe à autre chose. Je relancerai demain si besoin.",
      suite: "Il répond le lendemain matin. L'épisode ne laisse rien."
    }
  },
  facts: [
    {
      t: "La TCC est l'une des psychothérapies les plus étudiées.",
      d: "Son efficacité sur la dépression et les troubles anxieux repose sur des centaines d'essais contrôlés."
    },
    {
      t: "En autonomie, ça marche moins bien qu'accompagné.",
      d: "Le bénéfice est réel, mais nettement plus grand quand un professionnel suit, même de loin."
    },
    {
      t: "C'est un entraînement, pas une révélation.",
      d: "L'effet vient de la répétition. Les premières fiches sont laborieuses, et c'est normal."
    }
  ],
  choix: [
    {
      ic: "carnet",
      t: "Un carnet, pas un coach.",
      d: "L'app pose les questions, vous écrivez les réponses. Une pensée reformulée par quelqu'un d'autre — ou par une machine — ne déloge rien : le travail est justement de la formuler soi-même."
    },
    {
      ic: "bellOff",
      t: "Aucune notification, aucune série à tenir.",
      d: "Une fiche se remplit quand une émotion monte, pas parce qu'un badge le réclame. Les mécaniques d'engagement transformeraient l'introspection en corvée quotidienne."
    },
    {
      ic: "history",
      t: "Rien n'est jamais réécrit.",
      d: "Une fiche ancienne reste telle qu'elle a été remplie. On peut réévaluer aujourd'hui ce qu'on croyait hier, jamais le corriger — sinon le trajet parcouru disparaît."
    },
    {
      ic: "lock",
      t: "Vos fiches ne quittent pas votre téléphone.",
      d: "Ce qui s'écrit ici est ce qu'on a de plus intime. Pas de compte, pas de serveur, pas de statistiques d'usage."
    },
    {
      ic: "eye",
      t: "Ce qu'elle ne sait pas faire est écrit aussi.",
      d: "Une app d'auto-thérapie qui promet de soigner ment. Ses limites sont sur la même page que ses promesses."
    }
  ],
  tour: [
    {
      n: "Situation",
      def: "Les faits observables, sans interprétation. Ce qu'une caméra aurait filmé.",
      ex: "Réunion de 14 h. Mon manager coupe ma présentation au bout de deux minutes."
    },
    {
      n: "Émotion",
      def: "Ce que vous ressentez, et son intensité de 0 à 100. Nommer une émotion, c'est déjà en délimiter les contours.",
      ex: "Honte, anxiété — {num}70 / 100{/num}"
    },
    {
      n: "Pensée automatique",
      def: "La phrase exacte qui a traversé l'esprit, et le degré auquel vous y croyez sur le moment.",
      ex: "{cit}« Il me trouve incompétent. »{/cit}\nJ'y crois à {num}85 %{/num}"
    },
    {
      n: "Distorsion",
      def: "Le mécanisme qui déforme la pensée. Huit sont répertoriés dans l'app, avec les questions qui les défont.",
      ex: "Lecture de pensée · Catastrophisme"
    },
    {
      n: "Arguments pour",
      def: "Les preuves qui soutiennent la pensée. On commence par là, honnêtement, sinon l'exercice n'est qu'une auto-persuasion.",
      ex: "Il m'a interrompu. Il a regardé son téléphone deux fois."
    },
    {
      n: "Arguments contre",
      def: "Les faits qui la contredisent. L'étape la plus difficile, et celle qui fait le travail.",
      ex: "Il interrompt tout le monde. Il m'a confié le dossier client le mois dernier."
    },
    {
      n: "Pensée alternative",
      def: "Une version plus juste — ni positive, ni rassurante. Puis on réévalue à froid.",
      ex: "{cit}« Il gère mal le temps en réunion. Ça ne dit rien de mon travail. »{/cit}",
      fin: true
    }
  ],
  steps: [
    {
      ey: "Colonne 1 · Faits",
      q: "Que s'est-il passé ?",
      h: "Uniquement les faits observables : où, quand, avec qui. Pas encore d'interprétation.",
      ph: "Réunion de 14 h. Mon manager a coupé ma présentation au bout de deux minutes."
    },
    {
      ey: "Colonne 2 · Émotion",
      q: "Qu'avez-vous ressenti ?",
      h: "Choisissez ce qui domine, puis situez l'intensité au moment le plus fort."
    },
    {
      ey: "Colonne 3 · Pensée automatique",
      q: "Quelle phrase vous a traversé l'esprit ?",
      h: "Sa formulation exacte, au présent, telle qu'elle est arrivée.",
      ph: "Il me trouve incompétent, je vais finir par être écarté."
    },
    {
      ey: "Colonne 4 · Distorsion",
      q: "À quoi ressemble cette pensée ?",
      h: "Nommer le mécanisme aide à décoller de la pensée. Touchez « ? » pour comprendre chacun."
    },
    {
      ey: "Colonne 5 · Arguments pour",
      q: "Qu'est-ce qui appuie cette pensée ?",
      h: "Des preuves, pas des impressions. Ce qu'un observateur extérieur aurait pu constater.",
      ph: "Il m'a interrompu. Il a regardé son téléphone deux fois."
    },
    {
      ey: "Colonne 6 · Arguments contre",
      q: "Et qu'est-ce qui la contredit ?",
      h: "Le plus difficile, et le plus utile. Les questions ci-dessous viennent des distorsions que vous avez cochées.",
      ph: "Il interrompt tout le monde. Il m'a confié le dossier client le mois dernier."
    },
    {
      ey: "Colonne 7 · Pensée alternative",
      q: "Quelle version tient mieux debout ?",
      h: "Ni positive ni rassurante : plus juste. Puis réévaluez à froid.",
      ph: "Il gère mal le temps en réunion. Ça ne dit rien de la valeur de mon travail."
    }
  ]
} satisfies PackBase;
