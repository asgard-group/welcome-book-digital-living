# Page "Merci beaucoup" — Avis & retour

## Objectif
Transformer le bouton "Merci beaucoup" de la page d'accueil en une page dédiée de remerciement et de collecte d'avis, dans la continuité visuelle de l'application Jöro Living.

## Direction visuelle
- **Atmosphère** : chaleureuse, personnelle, premium — comme un mot laissé à l'hôte.
- **Fond** : réutilisation de l'image hero de la page Bienvenue avec le même overlay sombre, pour conserver la cohérence.
- **Carte centrale** : surface blanche/transparente arrondie (même style que les boutons du menu) contenant le message de remerciement et les actions.

## Structure de la page
1. **Flèche retour** en haut à gauche, identique aux autres pages internes.
2. **Titre** : "MERCI BEAUCOUP" en uppercase, police serif, blanc, 44px.
3. **Sous-titre** : "Votre retour compte beaucoup pour nous" — 17px, blanc/95%.
4. **Carte principale** (fond blanc/75%, backdrop-blur, rounded-3xl, p-6) :
   - Message de remerciement.
   - Section "Laissez un avis" avec 5 étoiles interactives (cliquables).
   - Champ texte "Votre message" pour un commentaire libre.
   - Bouton principal "Envoyer mon avis" (style plein sombre).
   - Lien secondaire "Me contacter" pour un retour privé.
5. **Logo Jöro Living** en bas de l'écran, 160px, blanc/invert.

## Composants techniques
- Nouveau fichier : `src/pages/Thanks.tsx` (ou `Review.tsx`).
- Mise à jour de `src/App.tsx` : ajout de la route `/thanks`.
- Mise à jour de `src/pages/Welcome.tsx` : le bouton "Merci beaucoup" pointe vers `/thanks`.
- État local React pour la note et le message (pas de backend nécessaire pour un premier jet).
- Validation simple : note requise, message optionnel, toast de confirmation via Sonner.

## Couleurs & typographie
- Reprise des tokens existants : fond `#1c2626`, texte blanc, accents sombres.
- Icône : `Heart` ou `Star` selon préférence, 30px dans un container h-14 w-14.
- Pas de nouvelle police — on garde `font-serif` pour les titres et la police body existante.

## Interactions
- Hover/press sur les étoiles : remplissage progressif.
- Clic sur "Envoyer" : affichage d'un toast "Merci pour votre avis !" et réinitialisation du formulaire.
- Responsive : hauteur s'adapte entre le titre et le logo, comme sur la page d'accueil.
