Lance B1.

Deux points d'arrêt dans ce lot :

1. Avant de committer les tokens, propose-moi les valeurs sombres des quatre
   littéraux récupérés (placeholder, focusRing, ombreCadre, ombreSheet) et la
   nouvelle valeur de --encre-3 corrigée pour l'accessibilité. Donne les ratios
   de contraste mesurés sur --papier et --carte, dans les deux thèmes. Attends
   ma validation.

2. Écris scripts/lint-tokens.mjs et le test de contraste AVANT les composants.
   Un test écrit après le code qu'il surveille passe au vert pour de mauvaises
   raisons.

Rappels : §4.3 dit que tout écart de plus de 1px dans le mappage des échelles
me remonte. Et ajoute une route de développement type galerie, affichant les
primitives, les 22 icônes, les deux thèmes et les deux langues sur un écran —
sinon rien n'est vérifié à l'œil avant B6.

En fin de lot : npm run check vert, statut de B1 mis à jour dans PLAN.md,
et tu t'arrêtes.
