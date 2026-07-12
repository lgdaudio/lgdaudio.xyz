/* =========================================================
   Sacha Music Charts — logique du site (vanilla JS)
   ========================================================= */
(() => {
  'use strict';

  const CHANNEL_URL = 'https://www.youtube.com/@SachaMusicCharts';

  /* ---------- Données ---------- */
  const VIDEO_IDS = [
    { id: 'rFewR_vsw3w', tag: 'Nouveau' },
    { id: 'aFwUbrocsGE' },
    { id: 'mCQFsozdbjs' },
    { id: '2hoaN9hBuhQ' },
    { id: 'X4VD2ceskfE' },
    { id: 'SYe8NXL3I4w' },
    { id: 'dYzGuAYiSoM' },
    { id: 'sCPminNDiws' },
    { id: 'XIKQS0yehII' },
    { id: 'LCS8w32csw4' },
    { id: 'kpwBf0D-mwQ' },
    { id: '74UQphpNfYU' },
    { id: 'oMyfO1js09M' },
  ];
  // ---- Vidéo d'accueil automatique (dernière vidéo de la chaîne) ----
  // Colle ta clé API YouTube ci-dessous pour activer la mise à jour automatique.
  // Sans clé, la vidéo de secours (HOME_VIDEO_FALLBACK) reste affichée.
  const YT_API_KEY = 'AIzaSyAG4OEhJXum-yel-xadrvz-zQ76YKoXj8o';
  const YT_HANDLE = 'SachaMusicCharts';
  const HOME_VIDEO_FALLBACK = 'rFewR_vsw3w';
  const SHORT_MAX_SECONDS = 240;  // durée (en s) en-dessous de laquelle une vidéo est exclue (accueil + grille) — 240 = 4 min
  const GRID_MAX = 12;           // nombre max de vidéos affichées dans l'onglet "Vidéos"

  const RESOURCES = [
    { title: 'Mixage Vocal', img: '/assets/guide-vocal.png', desc: 'La cheat sheet pour des voix propres et présentes.', tag: 'Guide', cta: 'Récupérer', url: 'https://www.bonzai.pro/sacha_musiccharts/lp/10957/vocal-cheat-sheet-offerte' },
    { title: 'Mixage Drum Bus', img: '/assets/guide-drumbus.png', desc: 'Punch et cohésion sur ton bus batterie.', tag: 'Guide', cta: 'Récupérer', url: 'https://www.bonzai.pro/sacha_musiccharts/lp/10277/drum-bus-cheat-sheet-100-gratuite' },
    { title: 'Mastering', img: '/assets/guide-mastering.png', desc: 'Les réglages clés pour un master qui sonne fort et clair.', tag: 'Guide', cta: 'Récupérer', url: 'https://www.bonzai.pro/sacha_musiccharts/lp/10278/mastering-cheat-sheet' },
    { title: "Les termes essentiels de l'EQ", img: '/assets/guide-eq.png', desc: "Comprends enfin le vocabulaire de l'égalisation.", tag: 'Lexique', cta: 'Découvrir', url: 'https://www.bonzai.pro/sacha_musiccharts/lp/11011/les-termes-essentiels-pour-comprendre-leq' },
    { title: 'Réglages rapides Compression', img: '/assets/guide-compression.png', desc: 'Un guide de réglages prêts à l’emploi.', tag: 'Guide', cta: 'Récupérer', url: 'https://www.bonzai.pro/sacha_musiccharts/lp/11275/guide-de-reglages-rapide-compression' },
    { title: 'Identifie ton blocage de mix', img: '', desc: "Un quizz d'1 minute pour cibler ce qui te freine.", tag: 'Quizz', cta: 'Faire le quizz', url: 'https://sacha-music-charts-quiz.lovable.app/' },
  ];

  const FORMATIONS = [
    { name: 'Banger System', img: '/assets/banger-system.png', tagline: 'Le système complet pour produire des tracks qui claquent, du premier son au mix final.', url: 'https://www.bonzai.pro/sacha_musiccharts/shop/58l0_6456/banger-system?p=pri_4nXv_10827' },
  ];

  const TEMOIGNAGES = [
    '/assets/temoignage-1.jpg','/assets/temoignage-2.png','/assets/temoignage-3.jpg','/assets/temoignage-4.jpg','/assets/temoignage-5.png',
    '/assets/temoignage-6.png','/assets/temoignage-7.png','/assets/temoignage-8.png','/assets/temoignage-9.png','/assets/temoignage-10.jpg',
  ];

  const AVIS = ['/assets/avis-1.png','/assets/avis-2.png','/assets/avis-3.png','/assets/avis-4.png','/assets/avis-5.png','/assets/avis-6.png','/assets/avis-7.png','/assets/avis-8.png','/assets/avis-9.png'];

  // Blocs d'écoute Avant/Après. Fichiers audio .m4a (AAC) dans assets/.
  // start/end (en s) = fenêtre écoutable dans le fichier. Si absents → AB_START/AB_END par défaut.
  // Les fichiers sont déjà découpés sur l'extrait : lecture de 0 à 29 s (= 1:56 → 2:25 de la chanson).
  const AUDIO_DEFS = [
    { style: 'Pop/Électronique', before: '/assets/mastering-avant.m4a',   after: '/assets/mastering-apres.m4a',   start: 0, end: 29 },
    { style: 'Trap',             before: '/assets/mastering-avant-2.m4a', after: '/assets/mastering-apres-2.m4a', start: 0, end: 20 },
    { style: 'Afro House',       before: '/assets/mastering-avant-3.m4a', after: '/assets/mastering-apres-3.m4a', start: 0, end: 30 },
    { style: 'Orchestral',       before: '/assets/mastering-avant-4.m4a', after: '/assets/mastering-apres-4.m4a', start: 0, end: 16 },
    { style: 'Rock/Électronique', before: '/assets/mastering-avant-5.m4a', after: '/assets/mastering-apres-5.m4a', start: 0, end: 30 },
  ];

  /* ---------- Utils ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'style') n.setAttribute('style', v);
      else if (k === 'html') n.innerHTML = v;
      else if (k in n) n[k] = v; else n.setAttribute(k, v);
    }
    kids.flat().forEach(c => c != null && n.append(c.nodeType ? c : document.createTextNode(c)));
    return n;
  };

  // Vignette YouTube en HD (maxresdefault 1280×720) avec repli sur hqdefault
  // si la HD est absente (404) ou remplacée par un placeholder basse résolution (≤120px).
  const ytThumbImg = (videoId, alt, style) => {
    const img = el('img', { src: 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg', alt: alt || '', style });
    let fellBack = false;
    const fallback = () => { if (fellBack) return; fellBack = true; img.src = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg'; };
    img.addEventListener('error', fallback);
    img.addEventListener('load', () => { if (img.naturalWidth <= 120) fallback(); });
    return img;
  };

  /* ---------- Navigation (multi-pages) : surligne le lien courant ---------- */
  function setActiveNav() {
    const path = location.pathname.replace(/index\.html$/, '') || '/';
    $$('.smc-nav-link').forEach(a => {
      const href = (a.getAttribute('href') || '').replace(/index\.html$/, '') || '/';
      a.classList.toggle('is-current', href === path);
    });
  }

  /* ---------- Accueil : lecteur "dernière vidéo" ---------- */
  function renderHomePlayer(videoId) {
    const host = $('#home-player');
    if (!host) return;
    host.innerHTML = '';
    // Miniature HD (1280×720) avec repli automatique sur hqdefault.
    const thumbImg = ytThumbImg(videoId, 'Dernière vidéo', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;');
    const btn = el('button', {
      style: 'position:absolute;inset:0;width:100%;height:100%;border:0;padding:0;cursor:pointer;background:#0a0a0a;',
    },
      thumbImg,
      el('span', { style: 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.35));' }),
      el('span', { style: 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:82px;height:82px;border-radius:50%;background:rgba(238,185,39,0.95);display:flex;align-items:center;justify-content:center;color:#000;font-size:30px;padding-left:6px;box-shadow:0 12px 40px rgba(238,185,39,0.4);' }, '▶')
    );
    btn.addEventListener('click', () => {
      host.innerHTML = '';
      host.append(el('iframe', {
        src: 'https://www.youtube.com/embed/' + videoId + '?rel=0&modestbranding=1&autoplay=1',
        title: 'Dernière vidéo',
        allow: 'accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture',
        allowfullscreen: 'true',
        style: 'position:absolute;inset:0;width:100%;height:100%;border:0;',
      }));
    });
    host.append(btn);
  }

  // Convertit une durée ISO 8601 (PT#H#M#S) en secondes.
  function isoDurationToSeconds(iso) {
    const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '');
    return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
  }

  // Récupère les dernières vidéos publiées via l'API YouTube Data v3, Shorts exclus.
  // Chaîne d'appels : channels(forHandle) → playlist "uploads" → durées → filtre.
  // Renvoie [{ id, title }] (plus récente d'abord) ou null si indisponible.
  function fetchChannelVideos() {
    if (!YT_API_KEY) return Promise.resolve(null);
    const base = 'https://www.googleapis.com/youtube/v3/';
    return fetch(base + 'channels?part=contentDetails&forHandle=' + encodeURIComponent(YT_HANDLE) + '&key=' + YT_API_KEY)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const uploads = d && d.items && d.items[0] && d.items[0].contentDetails.relatedPlaylists.uploads;
        if (!uploads) return null;
        return fetch(base + 'playlistItems?part=snippet&maxResults=30&playlistId=' + uploads + '&key=' + YT_API_KEY)
          .then(r => r.ok ? r.json() : null)
          .then(p => {
            if (!p || !p.items || !p.items.length) return null;
            const items = p.items.map(it => ({ id: it.snippet.resourceId.videoId, title: (it.snippet.title || '').trim() }));
            return fetch(base + 'videos?part=contentDetails&id=' + items.map(v => v.id).join(',') + '&key=' + YT_API_KEY)
              .then(r => r.ok ? r.json() : null)
              .then(vd => {
                const dur = {};
                if (vd && vd.items) vd.items.forEach(v => { dur[v.id] = isoDurationToSeconds(v.contentDetails.duration); });
                // Exclut les Shorts (durée ≤ SHORT_MAX_SECONDS) et les vidéos sans durée connue.
                return items.filter(v => (dur[v.id] || 0) > SHORT_MAX_SECONDS);
              });
          });
      })
      .catch(() => null);
  }

  /* ---------- Vidéos ---------- */
  // list = [{ id, tag, title? }]. Si un titre est fourni il est affiché directement ;
  // sinon (useOembed=true) il est récupéré via l'oembed YouTube.
  function renderVideos(list, useOembed) {
    const grid = $('#videos-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const cards = {};
    list.forEach(v => {
      const tagSpan = el('span', { style: "font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a8781;" }, v.tag || 'Vidéo');
      const titleP = el('p', { style: "font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:16px;line-height:1.3;margin:0;display:none;" });
      if (v.title) { titleP.textContent = v.title; titleP.style.display = 'block'; }
      const thumb = ytThumbImg(v.id, v.title || 'Vidéo mixage & mastering — Sacha Music Charts', 'width:100%;height:100%;object-fit:cover;display:block;');
      const card = el('a', {
        class: 'card-lift',
        href: 'https://www.youtube.com/watch?v=' + v.id,
        target: '_blank', rel: 'noopener',
        style: 'display:block;text-decoration:none;color:inherit;border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;background:#0a0a0a;',
      },
        el('div', { style: 'position:relative;aspect-ratio:16/9;background:#111;overflow:hidden;' },
          thumb,
          el('span', { style: 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.25);' },
            el('span', { style: 'width:56px;height:56px;border-radius:50%;background:rgba(238,185,39,0.92);display:flex;align-items:center;justify-content:center;color:#000;font-size:20px;padding-left:4px;' }, '▶'))
        ),
        el('div', { style: 'padding:14px 20px;display:flex;align-items:center;gap:10px;' },
          el('span', { style: 'width:6px;height:6px;border-radius:50%;background:#eeb927;flex:none;' }),
          tagSpan, titleP)
      );
      cards[v.id] = { titleP, thumb };
      grid.append(card);
    });

    // Carte "chaîne"
    grid.append(el('a', {
      class: 'card-channel',
      href: CHANNEL_URL, target: '_blank', rel: 'noopener',
      style: 'display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:14px;text-decoration:none;color:inherit;border:1px dashed rgba(238,185,39,0.35);border-radius:8px;padding:32px;min-height:240px;background:radial-gradient(120% 120% at 100% 0%,rgba(238,185,39,0.08),transparent);',
    },
      el('span', { style: "font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#eeb927;" }, 'La chaîne'),
      el('p', { style: "font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:24px;line-height:1.15;" }, 'Voir toutes mes vidéos sur YouTube'),
      el('span', { style: "margin-top:auto;font-family:'IBM Plex Mono',monospace;font-size:13px;color:#eeb927;" }, '@SachaMusicCharts ↗')
    ));

    // Récupère les titres manquants via oembed YouTube (amélioration progressive, sans clé).
    if (useOembed) {
      list.forEach(v => {
        if (v.title) return;
        fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://youtu.be/' + v.id))
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (d && d.title && cards[v.id]) { cards[v.id].titleP.textContent = d.title; cards[v.id].titleP.style.display = 'block'; cards[v.id].thumb.alt = d.title; }
          })
          .catch(() => {});
      });
    }
  }

  // Charge une seule fois les vidéos de la chaîne et alimente accueil + grille.
  function initYouTube() {
    // N'agit que sur les pages qui contiennent le lecteur d'accueil ou la grille.
    if (!$('#home-player') && !$('#videos-grid')) return;

    // Affichage immédiat depuis la liste manuelle (sert aussi de fallback sans API).
    renderHomePlayer(HOME_VIDEO_FALLBACK);
    renderVideos(VIDEO_IDS.map(v => ({ id: v.id, tag: v.tag })), true);

    // Puis remplace par les vraies dernières vidéos (Shorts exclus) si l'API répond.
    fetchChannelVideos().then(videos => {
      if (!videos || !videos.length) return;
      const host = $('#home-player');
      if (host && !host.querySelector('iframe')) renderHomePlayer(videos[0].id);
      const list = videos.slice(0, GRID_MAX).map((v, i) => ({ id: v.id, title: v.title, tag: i === 0 ? 'Nouveau' : 'Vidéo' }));
      renderVideos(list, false);
    });
  }

  /* ---------- Ressources ---------- */
  function buildResources() {
    const grid = $('#resources-grid');
    if (!grid) return;
    RESOURCES.forEach(r => {
      const parts = [];
      if (r.img) {
        parts.push(el('div', { style: 'position:relative;margin:-26px -26px 22px;aspect-ratio:16/9;background:#050505;overflow:hidden;' },
          el('img', { src: r.img, alt: r.title, style: 'width:100%;height:100%;object-fit:cover;display:block;' }),
          el('span', { style: 'position:absolute;bottom:0;left:0;width:100%;height:2px;background:linear-gradient(90deg,#eeb927,transparent);opacity:0.6;z-index:2;' })
        ));
      }
      parts.push(
        el('div', { style: 'display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;' },
          el('span', { style: "font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:5px 10px;border:1px solid rgba(238,185,39,0.3);border-radius:3px;color:#eeb927;" }, r.tag),
          el('span', { style: 'font-size:18px;color:#eeb927;' }, '↓')),
        el('h3', { style: "font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:21px;line-height:1.25;margin-bottom:10px;" }, r.title),
        el('p', { style: 'color:#8a8781;font-weight:300;font-size:14px;line-height:1.5;flex:1;' }, r.desc),
        el('span', { style: "margin-top:22px;font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#f5f3ee;" }, r.cta + ' →')
      );
      grid.append(el('a', {
        class: 'res-card',
        href: r.url, target: '_blank', rel: 'noopener',
        style: 'position:relative;display:flex;flex-direction:column;text-decoration:none;color:inherit;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:26px 26px 20px;background:#0a0a0a;overflow:hidden;',
      }, parts));
    });
  }

  /* ---------- Formations ---------- */
  function buildFormations() {
    const grid = $('#formations-grid');
    if (!grid) return;
    FORMATIONS.forEach(f => {
      grid.append(el('div', {
        class: 'formation-card',
        style: 'display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;background:#0a0a0a;',
      },
        el('div', { style: 'position:relative;aspect-ratio:16/10;background:#050505;overflow:hidden;' },
          el('img', { src: f.img, alt: f.name, style: 'width:100%;height:100%;object-fit:cover;display:block;' })),
        el('div', { style: 'padding:28px 30px 30px;display:flex;flex-direction:column;flex:1;' },
          el('span', { style: "font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#eeb927;" }, 'Formation'),
          el('h3', { style: "font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:30px;line-height:1.05;margin:10px 0 12px;" }, f.name),
          el('p', { style: 'color:#9a968c;font-weight:300;font-size:15px;line-height:1.55;flex:1;' }, f.tagline),
          el('a', {
            class: 'btn-primary',
            href: f.url, target: '_blank', rel: 'noopener',
            style: "margin-top:26px;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 24px;background:#eeb927;color:#000;text-decoration:none;border-radius:2px;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;",
          }, 'Découvrir la formation →'))
      ));
    });
  }

  /* ---------- Témoignages (marquee) ---------- */
  function buildTestimonials() {
    const loop = TEMOIGNAGES.concat(TEMOIGNAGES);
    $$('.testimonials').forEach(host => {
      const track = el('div', { class: 'smc-marquee-track', style: 'display:flex;gap:20px;width:max-content;' });
      loop.forEach(src => {
        track.append(el('div', { class: 'testi-card', style: 'flex:0 0 auto;height:340px;max-width:460px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;background:#0f0f0f;box-shadow:0 10px 30px rgba(0,0,0,0.45);' },
          el('img', { class: 'testi-img', src, alt: 'Témoignage client', style: 'height:100%;width:auto;max-width:460px;object-fit:contain;display:block;' })));
      });
      host.append(track);
    });
  }

  /* ---------- Avis clients (mastering) ---------- */
  function buildAvis() {
    const grid = $('#avis-grid');
    if (!grid) return;
    AVIS.forEach(src => {
      grid.append(el('div', { style: 'break-inside:avoid;margin-bottom:16px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;background:#0f0f0f;box-shadow:0 8px 24px rgba(0,0,0,0.4);' },
        el('img', { src, alt: 'Avis client mastering', loading: 'lazy', style: 'width:100%;height:auto;display:block;' })));
    });
  }

  /* ---------- Lecteurs A/B (extrait 1:55 → 2:25) ---------- */
  const AB_START = 115, AB_END = 145;
  function buildAudioBlocks() {
    const host = $('#audio-blocks');
    if (!host) return;
    const players = [];  // fonctions pause() de chaque bloc → un seul lecteur actif à la fois
    AUDIO_DEFS.forEach((d, i) => {
      const start = d.start != null ? d.start : AB_START;
      const end = d.end != null ? d.end : AB_END;
      const state = { mix: 0, playing: false, pos: start, raf: 0 };  // défaut : AVANT (mix 0)
      const audioBefore = el('audio', { src: d.before, preload: 'metadata' });
      const audioAfter  = el('audio', { src: d.after,  preload: 'metadata' });

      const fill = el('div', { style: 'position:absolute;top:0;left:0;height:100%;width:0%;background:#eeb927;' });
      const bar  = el('div', { style: 'flex:1;min-width:0;position:relative;height:4px;border-radius:2px;background:#1f1d19;cursor:pointer;overflow:hidden;' }, fill);
      const playBtn = el('button', {
        class: 'ab-play', 'aria-label': 'Lecture',
        style: 'flex:none;width:40px;height:40px;border-radius:50%;background:transparent;color:#eeb927;border:1px solid rgba(238,185,39,0.55);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;padding-left:2px;',
      }, '▶');

      const beforeLabel = el('span', { style: labelStyle(false) }, 'Avant');
      const afterLabel  = el('span', { style: labelStyle(true) }, 'Après');
      const knob = el('span', { style: knobStyle(true) });
      const toggle = el('button', {
        role: 'switch', 'aria-label': 'Avant / Après',
        style: trackStyle(true),
      }, knob);

      const applyMix = () => {
        const m = state.mix / 100;
        audioBefore.volume = Math.cos(m * Math.PI / 2);
        audioAfter.volume  = Math.sin(m * Math.PI / 2);
      };
      const renderMix = () => {
        const after = state.mix >= 50;
        toggle.setAttribute('style', trackStyle(after));
        knob.setAttribute('style', knobStyle(after));
        beforeLabel.setAttribute('style', labelStyle(!after ? true : false, 'before'));
        afterLabel.setAttribute('style', labelStyle(after, 'after'));
      };
      const renderProgress = () => {
        const ratio = Math.min(1, Math.max(0, (state.pos - start) / (end - start)));
        fill.style.width = (ratio * 100).toFixed(1) + '%';
      };
      const step = () => {
        const after = state.mix >= 50;
        const active = after ? audioAfter : audioBefore;
        const idle = after ? audioBefore : audioAfter;
        if (active.currentTime >= end) {
          audioBefore.currentTime = start; audioAfter.currentTime = start;
        } else if (Math.abs(idle.currentTime - active.currentTime) > 0.015) {
          // Recale en continu la piste muette sur la piste audible (inaudible)
          // → au moment du switch Avant/Après, les deux sont alignées à l'échantillon près.
          idle.currentTime = active.currentTime;
        }
        state.pos = active.currentTime;
        renderProgress();
        if (state.playing) state.raf = requestAnimationFrame(step);
      };

      const pause = () => {
        if (!state.playing) return;
        audioBefore.pause(); audioAfter.pause();
        cancelAnimationFrame(state.raf);
        state.playing = false; playBtn.textContent = '▶'; playBtn.style.paddingLeft = '2px';
      };
      players.push(pause);

      playBtn.addEventListener('click', () => {
        if (state.playing) {
          pause();
        } else {
          players.forEach(p => { if (p !== pause) p(); });  // met en pause les autres lecteurs
          if (audioBefore.currentTime < start || audioBefore.currentTime >= end) {
            audioBefore.currentTime = start; audioAfter.currentTime = start;
          } else {
            audioAfter.currentTime = audioBefore.currentTime;
          }
          applyMix();
          Promise.all([audioBefore.play(), audioAfter.play()]).then(() => {
            state.playing = true; playBtn.textContent = '❚❚'; playBtn.style.paddingLeft = '0';
            state.raf = requestAnimationFrame(step);
          }).catch(() => {});
        }
      });

      toggle.addEventListener('click', () => { state.mix = state.mix >= 50 ? 0 : 100; renderMix(); applyMix(); });

      bar.addEventListener('click', (e) => {
        const rect = bar.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const t = start + ratio * (end - start);
        audioBefore.currentTime = t; audioAfter.currentTime = t;
        state.pos = t; renderProgress();
      });

      const block = el('div', { style: 'border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:18px 20px;background:#0d0d0d;' });
      if (d.style) block.append(el('span', { style: "display:inline-block;margin-bottom:14px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#eeb927;padding:4px 10px;border:1px solid rgba(238,185,39,0.3);border-radius:3px;" }, d.style));
      block.append(
        el('div', { style: 'display:flex;align-items:center;gap:16px;' }, playBtn, bar),
        el('div', { style: 'display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px;' }, beforeLabel, toggle, afterLabel),
        audioBefore, audioAfter
      );
      renderMix(); renderProgress();
      host.append(block);
    });
  }
  function trackStyle(after) {
    return 'flex:none;width:46px;height:26px;border-radius:13px;border:none;cursor:pointer;padding:0;position:relative;background:' + (after ? '#eeb927' : '#2a2822') + ';transition:background .2s;';
  }
  function knobStyle(after) {
    return 'position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:' + (after ? '#000' : '#f5f3ee') + ';transform:translateX(' + (after ? '20px' : '0') + ');transition:transform .2s,background .2s;';
  }
  function labelStyle(active, which) {
    // "Avant" est mis en avant quand mix < 50 ; "Après" quand mix >= 50
    const color = active ? '#eeb927' : '#8a8781';
    return "font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:" + color + ";transition:color .2s;";
  }

  /* ---------- Liens & actions globales ---------- */
  function wireGlobal() {
    $$('[data-channel]').forEach(a => { if (!a.getAttribute('href')) a.href = CHANNEL_URL; });

    // Menu mobile (hamburger)
    const navLinks = $('#nav-links');
    const navToggle = $('#nav-toggle');
    const closeMenu = () => {
      if (navLinks) navLinks.classList.remove('open');
      if (navToggle) { navToggle.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
    };
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.addEventListener('click', (e) => {
      // Bouton "Faire ma demande de mastering" → défile vers le formulaire (page Mastering)
      const scrollBtn = e.target.closest('[data-scroll-form]');
      if (scrollBtn) {
        const f = $('#mastering-form');
        if (f) window.scrollTo({ top: f.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
        return;
      }
      // Clic en dehors de la nav : referme le menu mobile
      if (!e.target.closest('nav')) closeMenu();
    });

    const yearEl = $('#footer-year');
    if (yearEl) yearEl.textContent = '© ' + new Date().getFullYear() + ' — LGD Audio';
  }

  /* ---------- Init (chaque fonction ne fait rien si sa section est absente) ---------- */
  setActiveNav();
  initYouTube();
  buildResources();
  buildFormations();
  buildTestimonials();
  buildAvis();
  buildAudioBlocks();
  wireGlobal();
})();
