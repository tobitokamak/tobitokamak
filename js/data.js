/* ------------------------------------------------------------------
   Content for the whole site. Edit this file, not the HTML.
   - years marked "~" are guesses from upload dates: please confirm
   - `blocks` is optional; when missing, a page is built from `images`
------------------------------------------------------------------- */

window.SITE = {
  name: 'tobokamak',
  city: 'Barcelona, ES',
  tz: 'Europe/Madrid',
  email: 'tobitokamak@gmail.com',
  links: [
    { label: 'ArtStation', href: 'https://www.artstation.com/tobitokamak' },
    { label: 'LinkedIn', href: '#' },   // TODO
    { label: 'Instagram', href: '#' },  // TODO
    { label: 'Vimeo', href: '#' }       // TODO
  ]
};

window.CATS = {
  env:  'Environments',
  play: 'Interactive',
  vr:   'VR drawn',
  img:  'Illustration',
  ai:   'AI gen'
};

window.TOOLS = [
  { name: 'Blender',        file: 'l1.png' },
  { name: 'Adobe',          file: 'l2.svg' },
  { name: 'Unity',          file: 'l3.svg' },
  { name: 'Unreal Engine',  file: 'l4.png' },
  { name: 'Gravity Sketch', file: 'l5.png' },
  { name: 'Visual Studio',  file: 'l6.png' },
  { name: '3ds Max',        file: 'l7.png' },
  { name: 'Substance',      file: 'l8.png' },
  { name: 'ZBrush',         file: 'l9.png' },
  { name: 'Midjourney',     file: 'l10.webp' }
];

window.ABOUT = {
  bio: [
    "I've been working on interactive applications for gamedev, art/film and immersive platforms since 2018, with a background going back to 2010 in the Visual Arts, Media and Film Production.",
    "I build worlds you can stand inside: VR environments, real-time scenes and small strange games, sketched in VR first and polished in Unity and Unreal."
  ],
  edu: [
    ['2018', 'CFGS Game Development, Animation and Virtual Reality', 'Citilab-OBICEX, Barcelona'],
    ['2016', 'Tangible Computing for Interactive Artwork', 'Centre Phi, Montréal'],
    ['2015', 'Screenwriting for Film', 'FUC, Buenos Aires'],
    ['2013', 'Film Directing Conservatory', 'Escuela Nacional de Cine, Bogotá'],
    ['2010', 'Graphic Design and Media Production', 'Jorge Tadeo University, Bogotá']
  ]
};

/* image numbers refer to /assets/works/<slug>/<n>.jpg */
window.WORKS = [
  {
    slug: 'arkand', title: 'Arkand', year: '2019~', cat: 'env', accent: '#82AB9D',
    role: 'Concept, 3D, interaction', engine: 'Unity',
    tools: ['3ds Max', 'Mudbox', 'Photoshop', 'Substance Painter', 'Unity'],
    blurb: 'A place for dancing with the goddess.',
    cover: 2, images: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    blocks: [
      { type: 'text', label: 'Myth', body: [
        'Myth goes that Acuna, goddess of the suns, had lost an earring while dancing in the desert. A golden artifact able to transmute salt in amrita, divine elixir.',
        'Around the earring, immovable by mortal hand, Arkand was erected, in contemplation and celebration of the astral dance in its centennial orbits. When the spheres met, up in the sky, hermits would go deep into the desert during long weeks of fasting, carrying only a salt offering inside a jar.'
      ]},
      { type: 'img', n: 1, caption: 'The first visage appears among the endless ocean of sand' },
      { type: 'steps', label: 'Process', steps: [
        ['Sketch in VR', 'First forms were blocked out inside the headset using Oculus Medium digital clay.'],
        ['Model + texture', 'Full model in 3DS Max, painted in Substance Painter.'],
        ['Light + air', 'A very carefully tweaked Unity rendering for haze and soft colors.']
      ]},
      { type: 'pair', ns: [2, 3], caption: 'Shadows gracefully resting on the dunes' },
      { type: 'pair', ns: [4, 5], caption: 'A speck of green' },
      { type: 'img', n: 7, caption: 'The wide arches rising towards the goddess' },
      { type: 'text', label: 'Mito (es)', body: [
        'La mitología cuenta que Acuna, diosa de los soles, había perdido un arete mientras bailaba en el desierto. Un artilugio dorado que podía transmutar la sal en amrita, elixir divino.',
        'Alrededor del arete, inamovible por manos mortales, se erigió Arkand, en contemplación y celebración de la danza astral en sus órbitas centenarias.'
      ]},
      { type: 'pair', ns: [8, 9], caption: 'A hexagon dissolving into sand' }
    ]
  },
  {
    slug: 'factory-reset', title: 'Factory Reset', year: '2022', cat: 'env', accent: '#C37FC4',
    role: 'Concept, modelling, lighting', engine: 'Unreal Engine 5',
    tools: ['Unreal Engine', 'Gravity Sketch', 'Substance Painter', 'Photoshop', 'Quixel Megascans'],
    blurb: 'Entry for the UE5 Lumen Challenge: an industrial plant at purple dusk.',
    cover: 1, images: [1, 2, 3, 4, 5],
    blocks: [
      { type: 'text', label: 'Brief', body: [
        'Entry for the UE5 Lumen Challenge. Original concepting done in VR using Gravity Sketch. Modelled in VR, textured in Substance Painter. Additional assets from Quixel Megascans.'
      ]},
      { type: 'vimeo', id: '685884151', h: 'e794ede2b0', caption: 'Walkthrough. Placeholder: add what you want viewers to notice.' },
      { type: 'steps', label: 'Process', steps: [
        ['Concept in VR', 'Gravity Sketch quick 3D sketching'],
        ['Kit + texture', 'Quixel Megascans'],
        ['Lumen lighting', 'Using the (at the time) new release of Lumen']
      ]},
      { type: 'img', n: 1 }, { type: 'pair', ns: [2, 3] }, { type: 'pair', ns: [4, 5] }
    ]
  },
  {
    slug: 'koh-samui', title: 'Koh Samui Beach Villa', year: '2022', cat: 'env', accent: '#D8CDBA',
    role: 'Archviz, VR walkthrough', engine: 'Unreal Engine 5', tools: ['3ds Max', 'Unreal Engine', 'Substance Painter', 'Gravity Sketch', 'MasterpieceVR', 'Blender'],
    blurb: 'Client architectural environment on an island in the Gulf of Thailand.',
    cover: 3, images: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    blocks: [
      { type: 'img', n: 3 },
      { type: 'pair', ns: [4, 5] },
      { type: 'img', n: 6 },
      { type: 'img', n: 7 },
      { type: 'pair', ns: [8, 9] },
      { type: 'img', n: 10 },
      { type: 'img', n: 11 }
    ]
  },
  {
    slug: 'discovery-at-moonlight', title: 'Moonlight', year: '2020', cat: 'env', accent: '#7FABC7',
    role: 'Environment art', engine: 'Unreal Engine', tools: ['Unreal Engine', 'Photoshop', 'Substance Painter', 'Quixel Megascans'],
    blurb: 'Focused on mood, foliage and lighting: a headless statue in a misty forest.',
    cover: 1, images: [1, 2, 3, 4],
    blocks: [
      { type: 'img', n: 1 },
      { type: 'pair', ns: [2, 3] },
      { type: 'img', n: 4 }
    ]
  },
  {
    slug: 'infinite-bodhi-island', title: 'Infinite Bodhi Island', year: '2018', cat: 'env', accent: '#E08E5B',
    role: 'VR environment design', engine: 'Unreal Engine', tools: ['ZBrush', '3ds Max', 'Substance Painter', 'Unreal Engine'],
    blurb: 'VR environment design for school: floating rocks, temples and carved bodhisattvas.',
    cover: 2, images: [1, 2, 3, 4],
    blocks: [
      { type: 'img', n: 1 },
      { type: 'pair', ns: [2, 3] },
      { type: 'img', n: 4 }
    ]
  },
  {
    slug: 'particle-palace', title: 'particle palace', year: '2020', cat: 'env', accent: '#E8A94C',
    role: 'Concept, dev', engine: 'Unity', tools: ['Unity', '3ds Max', 'Photoshop', 'Lightroom'],
    blurb: 'If you climb the tree and touch the moon, the clouds become autumn.',
    cover: 2, images: [1, 2, 3, 4, 5, 6],
    blocks: [
      { type: 'text', label: 'Notes', body: ['a class exercise taken too far, playing with particles in Unity.'] },
      { type: 'img', n: 1 },
      { type: 'pair', ns: [2, 3] },
      { type: 'img', n: 4 },
      { type: 'img', n: 5 },
      { type: 'img', n: 6 }
    ]
  },
  {
    slug: 'planet-kosmos', title: 'planet kosmos', year: '2019', cat: 'play', accent: '#D7A3A5',
    role: 'Concept, dev, 3D', engine: 'Unity', tools: ['Unity', 'Blender'],
    blurb: 'A neuralink videogame as a ticket for a hedonist virtual playspace.',
    cover: 1, images: [1, 2, 3, 4, 5, 6, 7],
    blocks: [
      { type: 'text', label: 'Idea', body: ['A neuralink videogame as a ticket for a hedonist virtual playspace. Tags: vaporwave, bacchus, hedonism, virtual reality.'] },
      { type: 'vimeo', id: '377697391', caption: 'Gameplay capture.' },
      { type: 'pair', ns: [1, 2] }, { type: 'img', n: 4 }, { type: 'pair', ns: [3, 6] }, { type: 'pair', ns: [5, 7] }
    ]
  },
  {
    slug: 'time-and-arrow', title: 'time and arrow', year: '2020', cat: 'play', accent: '#D94C7F',
    role: 'Concept, dev', engine: 'Unity', tools: ['Unity', 'Illustrator', 'Blender'],
    blurb: 'A calm, surreal interactive piece made in Unity.',
    cover: 1, images: [1, 2],
    blocks: [
      { type: 'text', label: 'Idea', body: ['A calm, surreal interactive piece made in Unity.'] },
      { type: 'vimeo', id: '393273274', caption: 'Capture.' }, { type: 'img', n: 1 }
    ]
  },
  {
    slug: 'hama', title: 'hama', year: '2020', cat: 'play', accent: '#F3574A',
    role: 'Design, Development, Coding, Modelling', engine: 'Unity', tools: ['Unity', '3ds Max', 'Illustrator'],
    blurb: 'A little hama bead drawing app for mobile. Made with love in Unity.',
    cover: 2, images: [2],
    blocks: [
      { type: 'text', label: 'App', body: ['I tried to make the sounds something I would like to chew.'] },
      { type: 'vimeo', id: '393271297', caption: 'Gameplay' }
    ]
  },
  {
    slug: 'spells', title: 'spells', year: '2020', cat: 'vr', accent: '#9A8CE0',
    role: 'VR sculpting', engine: 'Unity', tools: ['Gravity Sketch', 'Substance Painter', 'Unity'],
    blurb: 'VR sculptures: gestures turned into creatures.',
    cover: 4, images: [1, 2, 3, 4],
    blocks: [
      { type: 'text', label: 'Notes', body: ['some old vr doodles plus substance painter.'] },
      { type: 'img', n: 1 },
      { type: 'pair', ns: [2, 3] },
      { type: 'img', n: 4 }
    ]
  },
  {
    slug: 'router-a-72-kiloparsecs', title: 'Router a 72 Kiloparsecs', year: '2020', cat: 'img', accent: '#FCD374',
    role: 'Drawing, writing', engine: '', tools: ['Photoshop'],
    blurb: 'A road trip through the universe to a router floating in the purple sector.',
    cover: 3, images: [1, 2, 3, 4, 5, 6, 7],
    blocks: [
      { type: 'text', label: 'Story (es)', body: [
        'Un(os) amigo(s) se va(n) de road trip por el universo, con el objetivo final de enchufarse al router que flota en algún lugar del sector púrpura en el kilopársec 72.',
        'Las siguientes fotografías/ilustraciones/alucinaciones hacen parte del registro de Amigo en su recorrido por el universo. Cuando se aburra de leer, hágase ceros y unos y desplácese hacia allá --->'
      ]},
      /* wideOnly: one image at a time, side by side only on very wide screens */
      { type: 'pair', ns: [1, 2], wideOnly: true }, { type: 'pair', ns: [3, 4], wideOnly: true }, { type: 'pair', ns: [5, 6], wideOnly: true }, { type: 'img', n: 7 }
    ]
  },
  {
    slug: 'spare-parts', title: 'spare parts', year: '2019', cat: 'vr', accent: '#B5FFD9',
    role: 'VR drawing, animation', engine: '', tools: ['AnimVR', 'Photoshop'],
    blurb: 'My friend\'s robot body was destroyed when we crashed in this sad planet. Drawn in VR.',
    cover: 2, images: [1, 2, 3, 4, 5, 6],
    blocks: [
      { type: 'text', label: 'Notes', body: ['Peak moment back when Quill and AnimVR where state of the art. Obviously inspired by Journey.'] },
      { type: 'img', n: 1 },
      { type: 'pair', ns: [2, 3] },
      { type: 'img', n: 4 },
      { type: 'img', n: 5 },
      { type: 'img', n: 6 }
    ]
  },
  {
    slug: 'unlocked-wavelength', title: 'unlocked wavelength', year: '2017', cat: 'img', accent: '#E04B8A',
    role: 'Drawing', engine: '', tools: ['Photoshop'],
    blurb: 'part of a series of illustrations showcased and sold at Galería Pasajera.',
    cover: 1, images: [1],
    blocks: [
      { type: 'img', n: 1 }
    ]
  },
  {
    slug: 'no-straight-vertex', title: 'no straight vertex', year: '2018', cat: 'vr', accent: '#DADADA',
    role: 'VR sculpting', engine: '', tools: ['Gravity Sketch', '3ds Max', 'Photoshop'],
    blurb: 'Spheres are cool.',
    cover: 1, images: [1, 2, 3],
    blocks: [
      { type: 'img', n: 1 },
      { type: 'pair', ns: [2, 3] }
    ]
  },
  {
    slug: 'pools', title: 'POOLS', year: '2023~', cat: 'ai', accent: '#E0955A',
    role: 'Image series', engine: '', tools: ['Midjourney'],
    blurb: 'Still water and the male body.',
    cover: 1, images: [1, 2, 3, 4, 5, 6],
    blocks: [
      { type: 'text', label: 'Notes', body: ['Endless nights playing around with Midjourney, dreaming of arches reflected in surreal bath waters.'] },
      { type: 'img', n: 1 }, { type: 'pair', ns: [2, 3] }, { type: 'img', n: 4 }, { type: 'pair', ns: [5, 6] },
      { type: 'text', label: '', body: ['thank you Midjourney you fucking kicked ass <3'] }
    ]
  },
  {
    slug: 'umbrales', title: 'umbrales', year: '2017', cat: 'img', accent: '#ACACA5',
    role: '3D render', engine: '', tools: ['3ds Max', 'Photoshop'],
    blurb: 'thresholds',
    cover: 2, images: [1, 2],
    blocks: [
      { type: 'pair', ns: [1, 2], ratios: [1.001, 0.681] },
      { type: 'text', label: 'NOTE', body: ['There was another one but got lost in time...'] }
    ]
  },
  {
    slug: 'under-all-that-water', title: 'under all that water', year: '2018', cat: 'env', accent: '#A5AFA6',
    role: '3D render', engine: '', tools: ['Mudbox', 'Photoshop', '3ds Max'],
    blurb: 'To think of all that is past, that lies somewhere, for others to find...',
    cover: 1, images: [1],
    blocks: [
      { type: 'text', label: 'Notes', body: ['My very first digital sculpt, turned into a simple environment to play around with lighting and scene moods.'] },
      { type: 'img', n: 1 }
    ]
  },
  /* published from the editor drafts lab/drafts/dodgeall*.json (images converted to numbered jpgs) */
  {
    slug: 'dodgeall', title: 'Dodgeall, Pirates!', year: '2023', cat: 'env', accent: '#CEA664',
    role: 'Environment Designer', engine: 'Unity VR', tools: ['Gravity Sketch', 'Blender'],
    blurb: "An arena for glenneroo's VR game.",
    cover: 1, images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    blocks: [
      { type: 'img', n: 1 }, { type: 'pair', ns: [2, 3] }, { type: 'img', n: 4 }, { type: 'img', n: 5 }, { type: 'img', n: 6 },
      { type: 'pair', ns: [7, 8] }, { type: 'img', n: 9 }, { type: 'img', n: 10 },
      { type: 'credit', parts: ['Thank you berserkitty for the ', { text: 'water texture', href: 'https://www.deviantart.com/berserkitty/art/Seamless-Cartoon-styled-Water-Texture-743787929' }, '.'] }
    ]
  },
  {
    slug: 'dodgeall-sci-fi', title: 'Dodgeall, Sci-fi', year: '2023', cat: 'env', accent: '#66CCA3',
    role: 'Environment Designer', engine: 'Unity VR', tools: ['Gravity Sketch', 'Blender'],
    blurb: "A sci-fi themed arena for glenneroo's VR game.",
    cover: 1, images: [1, 2, 3, 4],
    blocks: [
      { type: 'img', n: 1 }, { type: 'img', n: 2 }, { type: 'img', n: 3 }, { type: 'img', n: 4 },
      { type: 'vimeo', id: '1239563217' }
    ]
  },
  /* published from lab/drafts/havens-playground.json */
  {
    slug: 'havens-playground', title: 'Havens Playground', year: '2021', cat: 'env', accent: '#CCA766',
    role: 'Environment Design', engine: 'Unity', tools: ['Blender', 'Gravity Sketch'],
    blurb: 'A 2 km × 2 km metaverse island, cancelled before release.',
    cover: 1, images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    blocks: [
      { type: 'text', label: 'Notes', body: ['I spent way too long hand modelling this whole place.', 'Yes, some trees have checkerboards.'] },
      { type: 'group', ns: [1, 2] },
      { type: 'group', ns: [3, 4, 5, 6, 7, 8], caption: 'The stairs up to the bridge' },
      { type: 'group', ns: [9, 10, 11, 12], caption: 'The bowling' },
      { type: 'group', ns: [13, 14, 15, 16], caption: 'The pools' },
      { type: 'group', ns: [17, 18, 19], caption: 'The gallery' },
      { type: 'group', ns: [20, 21] },
      { type: 'img', n: 22 }, { type: 'img', n: 23 },
      { type: 'group', ns: [24, 25] }
    ]
  }
];

/* ------------------------------------------------------------------
   DATES drive the order of the whole site (newest first) and the year
   shown on every row and page. Format: YYYY-MM-DD, or YYYY-MM, or YYYY.
   - exact day = ArtStation upload date (used when the work was made
     about then); 2022 batch uploads were dated by their description
   - "2020-12" for Discovery at Moonlight is a placeholder: the site
     only knows it is from 2020. Change it to move it inside 2020.
   Edit a date and the order updates by itself.
------------------------------------------------------------------- */
window.DATES = {
  'pools':                    '2023-05-11',
  'dodgeall':                 '2023-08',            /* only the year is known; months keep both Dodgealls above POOLS (May) */
  'dodgeall-sci-fi':          '2023-07',
  'factory-reset':            '2022-03-08T08:23',
  'koh-samui':                '2022-03-08T04:41',
  'havens-playground':        '2021',
  'particle-palace':          '2020-03-08',
  'time-and-arrow':           '2020-02-23T10:06',
  'hama':                     '2020-02-23T09:45',
  'spells':                   '2020-02-22T08:38',
  'unlocked-wavelength':      '2017-02-22T08:20',   /* year set by you; month/day only keep the order inside 2017 */
  'router-a-72-kiloparsecs':  '2017-02-22T04:42',
  'umbrales':                 '2017-01-17',
  'discovery-at-moonlight':   '2020-12',
  'planet-kosmos':            '2019-12-05',
  'arkand':                   '2019-11-07',
  'spare-parts':              '2019-10-31T14:09',
  'under-all-that-water':     '2018-12',            /* year set by you; months only keep the order inside 2018 */
  'infinite-bodhi-island':    '2018-11',
  'no-straight-vertex':       '2018-08-27'
};

window.WORKS.forEach(function (w) { w.date = window.DATES[w.slug]; w.year = w.date.slice(0, 4); });
window.WORKS.sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; });
