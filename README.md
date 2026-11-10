# Pirate le profil d'Edward

## Contexte

**Papote** est un petit réseau social entre voisins, mis en ligne un peu vite. Un compte appartient à **Edward Lalande**, l'un des organisateurs de l'atelier. Votre mission : trouver un moyen de remplacer sa photo de profil par une image de votre choix, sans jamais connaître son mot de passe, puis réparer chaque faille utilisée.

## Objectifs

- Comprendre concrètement comment un compte peut être piraté sans connaître son mot de passe.
- Découvrir à quel point l'IA peut accélérer la recherche de failles.
- Corriger soi-même une faille, pour en comprendre vraiment la cause.
- Repartir avec des réflexes de prudence pour la vie numérique de la famille.

## Le rôle de l'IA

> **L'IA est autorisée du début à la fin, à une seule condition : elle ne doit jamais générer le code que vous utilisez directement. Vous devez comprendre ce que vous faites.**

Ce n'est pas une question de triche, mais de méthode. Utilisée comme un **mentor socratique**, l'IA vous aide à :
- repérer où chercher et ce qu'un comportement suspect pourrait signifier ;
- comprendre pourquoi telle requête, telle page ou tel fichier se comporte de façon dangereuse ;
- relire ce que vous avez écrit et vous dire si le raisonnement tient.

Elle ne doit pas vous  écrire le code à votre place, même si vous le lui demandez autrement.

## Déroulé

**Premier temps : la chasse aux failles (environ 1h15)**
Chaque équipe reçoit le projet Papote et le lance sur son ordinateur avec Docker. Avec l'aide de l'IA, elle explore le site à la recherche de tout ce qui pourrait permettre de modifier la photo de profil d'un autre compte que le sien, en particulier celui d'Edward Lalande. Chaque faille trouvée est notée : où elle se trouve, comment on l'exploite, ce qu'un vrai pirate en ferait.

**Deuxième temps : les correctifs (environ 1h)**
Pour chaque faille relevée, l'équipe propose et écrit elle-même une correction. L'IA peut expliquer le principe d'une bonne protection et relire le travail, mais ce sont les parents qui l'écrivent.

**Contrôle croisé (environ 15 min)**
Une équipe tente de rejouer les attaques sur le projet d'une autre équipe. Si une faille est encore exploitable, elle n'est pas encore corrigée.

## Fiche de synthèse (à remplir par équipe)

1. Les failles trouvées, décrites en langage courant.
2. Comment chacune permettait d'atteindre l'objectif (photo de profil d'Edward).
3. Ce qu'un vrai pirate aurait pu faire avec, au-delà de l'atelier.
4. Comment elles ont été corrigées.
5. Ce que l'équipe a retenu de l'usage de l'IA.

## Cadre et éthique

- Le site tourne en local sur l'ordinateur de chaque équipe, dans Docker. Il ne contient aucune donnée réelle.
- Le compte d'« Edward Lalande » est un compte fictif créé pour l'atelier, qui porte le nom de l'un de ses organisateurs pour rendre l'objectif concret.
- Les techniques vues ici ne doivent **jamais** être testées sur un site ou un compte réel sans autorisation : c'est illégal.
- Un court rappel du cadre légal ouvre la séance.

## Débrief (15 à 20 minutes)

Discussion collective autour de quelques questions :
- Combien de temps a-t-il fallu pour trouver une première faille exploitable avec l'IA ?
- Qu'est-ce que ça change de savoir qu'un inconnu peut utiliser les mêmes outils contre un vrai compte ?
- Comment utiliser l'IA avec ses enfants : comme un raccourci, ou comme un tuteur qui fait réfléchir ?
- Quels réflexes retenir pour la famille (mots de passe, liens, sites douteux, photos partagées) ?

**Message clé à faire passer :** l'IA accélère autant l'attaquant que le défenseur, mais comprendre reste le meilleur rempart.
