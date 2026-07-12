# Sacha Music Charts — Site web

Site vitrine (mixage & mastering) reconstruit en **HTML / CSS / JavaScript vanilla**, sans dépendance ni build. Il fonctionne sur n'importe quel hébergement statique (Netlify, Vercel, GitHub Pages, OVH, o2switch…).

## Structure

Site **multi-pages** : chaque rubrique est une vraie page avec sa propre URL (meilleur pour le SEO).

| Fichier / dossier | URL | Rôle |
|---|---|---|
| `index.html` | `/` | Accueil (hero + dernière vidéo) |
| `videos/index.html` | `/videos/` | Grille des vidéos |
| `ressources/index.html` | `/ressources/` | Guides gratuits + témoignages |
| `formations/index.html` | `/formations/` | Formations + témoignages |
| `mastering/index.html` | `/mastering/` | Prestation, exemples A/B, avis, formulaire |
| `revtime/index.html` | `/revtime/` | Page du calculateur (intègre `revtime.html`) |
| `revtime.html` | — | Mini-app « Reverb Time Calculator » (chargée en iframe) |
| `styles.css` | — | Styles globaux, nav/footer, responsive |
| `app.js` | — | Une seule logique partagée ; ne construit que la section présente sur la page |
| `assets/` | — | Images, `og-image.png`, fichiers audio A/B |
| `sitemap.xml` / `robots.txt` | — | Indexation (à la racine) |

**Nav & footer** sont en HTML statique (vrais liens `<a>`, bons pour le SEO), identiques sur chaque page.
Si tu modifies la nav ou le footer, fais-le dans **toutes** les pages. Le lien actif est surligné
automatiquement par `app.js` selon l'URL. Tous les chemins internes sont **absolus** (`/styles.css`,
`/assets/…`) pour fonctionner depuis n'importe quelle sous-page.

Le dossier `Files/` contient l'export d'origine (source) et n'est **pas** nécessaire à la mise en ligne.

## Mise en ligne

Uploader **tout le contenu du dossier** à la racine du site (en conservant l'arborescence) :
`index.html`, `styles.css`, `app.js`, `revtime.html`, `sitemap.xml`, `robots.txt`, et les dossiers
`assets/`, `videos/`, `ressources/`, `formations/`, `mastering/`, `revtime/`. C'est tout.

> La plupart des hébergeurs statiques (Netlify, Vercel, OVH, o2switch…) servent automatiquement
> `/videos/` → `/videos/index.html`. Rien à configurer.

Pour tester en local :

```bash
cd "Site Internet"
npx serve .   # gère les /sous-dossiers/ et les requêtes Range (audio)
# puis ouvrir l'URL affichée
```

## À compléter par Sacha

1. **Exemples audio (onglet Mastering).** Les 4 lecteurs Avant/Après attendent 8 fichiers dans `assets/` (absents de l'export) :
   `mastering-avant.wav` / `mastering-apres.wav`, puis `-2`, `-3`, `-4`.
   L'extrait joué est fixé de **1:55 à 2:25** (modifiable via `AB_START` / `AB_END` dans `app.js`).
   Styles/fichiers configurables dans le tableau `AUDIO_DEFS` en haut de `app.js`.
2. **Formulaire mastering** → envoyé via [FormSubmit](https://formsubmit.co) à `lgdaudio.contact@gmail.com`.
   Le tout premier envoi déclenche un email de confirmation FormSubmit à valider une fois.
3. **Vidéo d'accueil automatique** → pour afficher toujours la dernière vidéo de la chaîne,
   renseigne `YT_API_KEY` en haut de `app.js` (voir la section ci-dessous). Sans clé,
   la vidéo de secours `HOME_VIDEO_FALLBACK` reste affichée.

## Vidéo d'accueil automatique (clé API YouTube)

La page d'accueil peut afficher automatiquement **la dernière vidéo publiée** sur la chaîne.
Cela nécessite une clé API YouTube (gratuite) à créer une seule fois :

1. Va sur <https://console.cloud.google.com/> et connecte-toi.
2. Crée un projet (bouton en haut, « Nouveau projet »), puis sélectionne-le.
3. Menu **API et services → Bibliothèque**, cherche **YouTube Data API v3**, clique **Activer**.
4. Menu **API et services → Identifiants → Créer des identifiants → Clé API**. Copie la clé.
5. (Recommandé) Clique sur la clé pour la restreindre :
   - *Restrictions relatives aux applications* → **Sites web (référents HTTP)** → ajoute ton domaine
     (ex. `https://sachamusiccharts.com/*`). Pour tester en local, ajoute aussi `http://localhost:4321/*`.
   - *Restrictions relatives aux API* → limite à **YouTube Data API v3**.
6. Colle la clé dans `app.js` : `const YT_API_KEY = 'TA_CLE_ICI';`

C'est tout. Avec la clé renseignée :
- la **page d'accueil** affiche la dernière vidéo publiée ;
- l'**onglet Vidéos** se remplit automatiquement avec les dernières vidéos de la chaîne.

Les deux se mettent à jour tout seuls à chaque nouvelle publication.

**Vidéos courtes exclues.** Filtrage par durée : toute vidéo de `SHORT_MAX_SECONDS`
secondes ou moins (240 = 4 min par défaut) est ignorée, aussi bien pour l'accueil que pour
la grille. Ajuste ce seuil dans `app.js` si besoin.

**Réglages** (en haut de `app.js`) : `YT_HANDLE` (`SachaMusicCharts`), `GRID_MAX` (nb max de
vidéos dans la grille, 12), `HOME_VIDEO_FALLBACK` (vidéo affichée si l'API échoue).
Coût : ~3 unités de quota par visite (quota quotidien gratuit : 10 000).

## Modifier le contenu

Tout est centralisé en haut de `app.js` :
- `VIDEO_IDS` — liste de secours des vidéos (utilisée seulement si l'API YouTube est indisponible ; sinon la grille se remplit automatiquement).
- `RESOURCES` — cartes de ressources gratuites.
- `FORMATIONS` — formations.
- `TEMOIGNAGES` / `AVIS` — images de témoignages et d'avis.

Palette : fond `#000`, accent `#eeb927`, texte `#f5f3ee`. Polices : Space Grotesk, IBM Plex Sans/Mono.

## Référencement (SEO)

Déjà en place dans le code :
- `<title>` et `<meta name="description">` optimisés, `<link rel="canonical">`, balises **Open Graph** + **Twitter Card** (avec `assets/og-image.png` 1200×630 pour l'aperçu de partage).
- **Un seul `<h1>`**, structure `<h2>`/`<h3>` logique, `alt` descriptifs sur les images.
- **Données structurées Schema.org** (JSON-LD) : Organization, WebSite, Person, Service (mastering), Course (Banger System).
- `sitemap.xml` et `robots.txt` à la racine.

> ⚠️ Toutes les URLs SEO pointent vers **https://lgdaudio.xyz/**. Si le domaine change,
> mets-le à jour dans `index.html` (canonical, OG, JSON-LD), `sitemap.xml` et `robots.txt`.

### À faire par toi : Google Search Console

1. Va sur <https://search.google.com/search-console> et ajoute la propriété **lgdaudio.xyz**
   (propriété « Domaine » via DNS = recommandé, ou « Préfixe d'URL » `https://lgdaudio.xyz/`).
2. Vérifie la propriété :
   - **Méthode DNS** : ajoute l'enregistrement TXT fourni chez ton registrar (là où tu gères le domaine).
   - **ou Méthode balise HTML** : copie le `<meta name="google-site-verification" …>` fourni et
     décommente/colle-le dans `<head>` de `index.html` (un emplacement prévu y est déjà en commentaire).
3. Une fois vérifié : menu **Sitemaps** → soumets `https://lgdaudio.xyz/sitemap.xml`.
4. Suis l'onglet **Indexation des pages** pour voir ce qui est indexé et les éventuelles erreurs.

Le site est **multi-pages** : 6 URLs distinctes sont indexables (listées dans `sitemap.xml`),
chacune avec son `<title>`, sa description, son `<h1>` et ses données structurées ciblés.
Le suivi Search Console reste indispensable pour l'indexation et le trafic réel.
