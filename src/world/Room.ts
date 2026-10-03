import * as THREE from 'three';
import { box, ball, leaf, cylinder, tube, group, canvasPlane } from './primitives';
import { mat, palette as p } from './materials';
import { books } from '../data/quotes';
import { getLocale, t } from '../data/i18n';
import { InteractableRegistry } from '../systems/Interactable';

export interface AmbientPart { object: THREE.Object3D; phase: number; amount: number; axis: 'x' | 'z'; base: number }

export class Room {
  readonly root = new THREE.Group();
  readonly ambient: AmbientPart[] = [];
  readonly bulbs: THREE.MeshStandardMaterial[] = [];
  readonly windows: THREE.MeshStandardMaterial[] = [];
  readonly lamps: THREE.PointLight[] = [];
  readonly quoteSurface: THREE.Mesh;
  readonly quoteGroup: THREE.Group;
  private quoteCanvas: HTMLCanvasElement;
  private quoteTexture: THREE.CanvasTexture;
  private localizedTextures: (() => void)[] = [];

  private localizedPlane(parent: THREE.Object3D, width: number, height: number, draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void) {
    const mesh = canvasPlane(parent, width, height, draw);
    const map = (mesh.material as THREE.MeshStandardMaterial).map as THREE.CanvasTexture;
    const canvas = map.image as HTMLCanvasElement;
    this.localizedTextures.push(() => {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw(ctx, canvas);
      map.needsUpdate = true;
    });
    return mesh;
  }
  refreshLanguage() { this.localizedTextures.forEach(repaint => repaint()); }

  constructor(scene: THREE.Scene, readonly interactions: InteractableRegistry) {
    scene.add(this.root);
    this.architecture(); this.window(); this.bookshelf(); this.readingCorner(); this.desk();
    this.rug(); this.petCorner(); this.details(); this.healingBooks();
    this.quoteGroup = group(this.root, [0, 0, 0]);
    this.quoteCanvas = document.createElement('canvas'); this.quoteCanvas.width = 1536; this.quoteCanvas.height = 1024;
    this.quoteTexture = new THREE.CanvasTexture(this.quoteCanvas); this.quoteTexture.colorSpace = THREE.SRGBColorSpace;
    this.quoteSurface = new THREE.Mesh(new THREE.PlaneGeometry(1.24, .84), new THREE.MeshStandardMaterial({ map: this.quoteTexture, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
    this.quoteSurface.rotation.x = -Math.PI / 2;
    this.quoteGroup.add(this.quoteSurface); this.quoteGroup.visible = false;
  }

  private architecture() {
    // A thin, dark plinth frames a pale oak floor like a mounted architectural model.
    box(this.root, [8.3, .24, 6.9], [0, -.11, 0], p.darkWood, .015, 'wood');
    box(this.root, [8.13, .15, 6.73], [0, .065, 0], p.wood, .012, 'wood');
    const colors = [p.lightWood, '#dcd0b9', '#d2c3a9', '#e1d5bf'];
    for (let row = 0; row < 11; row++) {
      const z = -3.05 + row * .61;
      const cuts = row % 2 ? [-4, -2.6, .6, 4] : [-4, -.9, 2.2, 4];
      for (let j = 0; j < cuts.length - 1; j++) {
        box(this.root, [cuts[j + 1] - cuts[j] - .012, .055, .595], [(cuts[j] + cuts[j + 1]) / 2, .167, z], colors[(row + j) % colors.length], .003, 'wood');
      }
    }
    box(this.root, [8.16, 1.3, .18], [0, .85, -3.32], p.wall, .006);
    box(this.root, [3.04, 2.25, .18], [-2.56, 2.625, -3.32], p.wall, .006);
    box(this.root, [1.65, 2.25, .18], [3.255, 2.625, -3.32], p.wall, .006);
    box(this.root, [3.5, .35, .18], [.7, 3.575, -3.32], p.wall, .006);
    box(this.root, [.18, 3.58, 6.7], [-4.02, 1.96, 0], p.wall, .006);
    // Exposed posts and a fine picture rail replace the cottage wainscoting.
    for (const x of [-3.88, -1.12, 2.53, 3.99]) box(this.root, [.075, 3.56, .1], [x, 1.98, -3.17], p.darkWood, .005, 'wood');
    for (const z of [-3.2, 1.8, 3.25]) box(this.root, [.1, 3.56, .075], [-3.87, 1.98, z], p.darkWood, .005, 'wood');
    box(this.root, [8.23, .11, .25], [0, 3.77, -3.28], p.darkWood, .008, 'wood');
    box(this.root, [.25, .11, 6.8], [-3.99, 3.77, .02], p.darkWood, .008, 'wood');
    box(this.root, [8, .12, .065], [0, .3, -3.19], p.darkWood, .005, 'wood');
    box(this.root, [.065, .12, 6.5], [-3.89, .3, 0], p.darkWood, .005, 'wood');
    // A light oak lower wall with slender vertical battens.
    box(this.root, [.035, .68, 6.45], [-3.91, .69, 0], p.lightWood, .003, 'wood');
    for (let z = -3.08; z < 3.24; z += .23) box(this.root, [.04, .68, .014], [-3.88, .69, z], p.wood, .002, 'wood');
    box(this.root, [.075, .045, 6.5], [-3.86, 1.05, 0], p.darkWood, .003, 'wood');
  }

  private window() {
    const frame = group(this.root, [.7, 2.42, -3.32]);
    const sky = new THREE.MeshStandardMaterial({ color: '#dfded1', emissive: '#dfded1', emissiveIntensity: .16, roughness: 1 });
    const outside = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.18), sky);
    outside.position.z = -.26; frame.add(outside); this.windows.push(sky);
    // Paper-like mountain silhouettes beyond a circular moon window.
    for (let i = 0; i < 5; i++) {
      ball(frame, [.66, .38 + i % 2 * .16, .025], [-1.35 + i * .64, -.75 + Math.sin(i * 1.9) * .13, -.2], i % 2 ? '#a5aaa0' : '#727e72');
    }
    ball(frame, [.16, .16, .012], [.42, .47, -.19], p.paper);
    const surround = new THREE.Shape();
    surround.moveTo(-1.75, -1.12); surround.lineTo(1.75, -1.12); surround.lineTo(1.75, 1.12); surround.lineTo(-1.75, 1.12); surround.closePath();
    const opening = new THREE.Path(); opening.absarc(0, 0, 1.02, 0, Math.PI * 2, true); surround.holes.push(opening);
    const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(surround, { depth: .18, bevelEnabled: false, curveSegments: 64 }), mat(p.wall));
    wall.position.z = -.09; wall.castShadow = wall.receiveShadow = true; frame.add(wall);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.035, .044, 10, 96), mat(p.darkWood, 'wood'));
    rim.position.z = .105; rim.castShadow = true; frame.add(rim);
    const innerRim = new THREE.Mesh(new THREE.TorusGeometry(.992, .013, 6, 96), mat(p.lightWood, 'wood'));
    innerRim.position.z = .13; frame.add(innerRim);
    for (const x of [-.46, 0, .46]) {
      const h = 2 * Math.sqrt(.985 ** 2 - x ** 2);
      box(frame, [.025, h, .035], [x, 0, .105], p.darkWood, .003, 'wood');
    }
    box(frame, [1.94, .025, .035], [0, -.12, .105], p.darkWood, .003, 'wood');
    const glass = new THREE.Mesh(new THREE.CircleGeometry(.985, 64), new THREE.MeshPhysicalMaterial({ color: p.paper, transparent: true, opacity: .055, roughness: .22, side: THREE.DoubleSide }));
    glass.position.z = .14; glass.userData.ignoreRaycast = true; frame.add(glass);
    // The sill remains a continuous safe landing for Mochi.
    box(frame, [3.92, .12, .6], [0, -1.1, .14], p.darkWood, .012, 'wood');
    box(frame, [3.85, .025, .57], [0, -1.0525, .14], p.lightWood, .005, 'wood');
    for (const side of [-1, 1]) {
      const screen = group(frame, [side * 1.46, 0, .15]);
      box(screen, [.39, 1.87, .035], [0, 0, 0], p.paper, .003, 'paper');
      for (const x of [-.2, .2]) box(screen, [.025, 1.92, .055], [x, 0, .02], p.wood, .003, 'wood');
      for (let i = 0; i < 7; i++) box(screen, [.4, .018, .025], [0, -.92 + i * .307, .045], p.wood, .002, 'wood');
    }
    // One ikebana arrangement, placed away from the pet's landing.
    cylinder(this.root, .11, .18, .31, [1.99, 1.56, -3.04], p.ink, 'ceramic');
    tube(this.root, [[1.99, 1.7, -3.04], [1.92, 1.99, -3.04], [2.09, 2.18, -3.03]], .012, p.darkWood, 'wood');
    for (let i = 0; i < 3; i++) ball(this.root, [.055, .035, .03], [2.04 + i * .043, 2.08 + i * .045, -3.03], p.paper, 'paper');
  }

  private bookshelf() {
    const shelf = group(this.root, [-2.72, .2, -2.88]);
    for (const x of [-.8, .8]) box(shelf, [.065, 2.65, .66], [x, 1.325, 0], p.darkWood, .008, 'wood');
    box(shelf, [1.62, 2.58, .025], [0, 1.35, -.32], p.paper, .004, 'wood');
    for (const y of [.14, 1.04, 1.81, 2.62]) {
      const readingLedge = y === 1.04;
      box(shelf, [1.78, .12, readingLedge ? 1.15 : .75], [0, y, readingLedge ? .2 : 0], p.lightWood, .025, 'wood');
    }
    for (const x of [-.7, .7]) {
      const bracket = box(shelf, [.06, .3, .06], [x, .84, .44], p.wood, .008, 'wood'); bracket.rotation.x = -.65;
    }
    box(shelf, [1.86, .065, .8], [0, 2.72, 0], p.darkWood, .008, 'wood'); // top crown molding
    box(shelf, [1.76, .14, .72], [0, .07, 0], p.wood, .02, 'wood'); // plinth base

    const colors = [p.ink, p.paper, '#b8ae9b', p.wood, p.cream, '#77746b'];
    for (let level = 0; level < 3; level++) {
      for (let i = 0; i < 5; i++) {
        if (level === 1 && i > 0) continue; // Keep the interactive book and Mochi's landing clear.
        const h = .39 + ((i * 7 + level * 3) % 5) * .047;
        const width = .10 + (i % 3) * .021, depth = .35 + (i % 2) * .045;
        const book = group(shelf, [-.59 + i * .17, [.20, 1.10, 1.87][level], .04 + (i % 3) * .012]);
        book.rotation.z = i === 4 ? -.12 : (i % 3 - 1) * .025;
        const color = colors[(i + level) % colors.length];
        box(book, [width - .018, h - .026, depth - .035], [0, h / 2, -.006], p.paper, .003, 'paper');
        for (const side of [-1, 1]) box(book, [.009, h, depth], [side * (width / 2 - .004), h / 2, 0], color, .003, 'cloth');
        box(book, [width, h, .022], [0, h / 2, depth / 2], color, .008, 'cloth');
        for (const y of [.065, h - .06]) box(book, [width * .62, .008, .003], [0, y, depth / 2 + .012], '#e8dcc1', .001, 'paper');
        box(book, [width * .47, h * .21, .003], [0, h * .61, depth / 2 + .012], '#e8dcc1', .001, 'paper');
      }
    }
    box(shelf, [.045, .68, .6], [.13, 2.21, 0], p.darkWood, .004, 'wood');
    // Joinery stays quiet: small brass pins rather than repeated decorative trim.
    for (const x of [-.8, .8]) for (const y of [1.04, 1.81, 2.62]) {
      const pin = cylinder(shelf, .014, .014, .008, [x, y, .354], '#9b8960', 'metal'); pin.rotation.x = Math.PI / 2;
    }
    const jar = cylinder(shelf, .14, .12, .27, [.44, 2.02, .04], p.terracotta, 'ceramic');
    jar.rotation.z = .03;
    this.plant(shelf, [-.45, 2.72, 0], .55, p.cream, true);
    this.photo(shelf, [.38, 2.76, -.08], .42, 'landscape');
    box(shelf, [.53, .47, .5], [.45, .45, .04], p.cream, .015, 'cloth');
    box(shelf, [.12, .045, .013], [.45, .52, .3], p.darkWood, .01, 'wood');
  }

  private readingCorner() {
    const sofa = group(this.root, [-2.8, .22, -.1], Math.PI / 2);
    // Open timber daybed: visible rails, linen seat and a woven back.
    for (const x of [-.94, .94]) for (const z of [-.42, .42]) box(sofa, [.09, .54, .09], [x, .27, z], p.darkWood, .008, 'wood');
    box(sofa, [2.14, .12, 1.1], [0, .5, 0], p.darkWood, .012, 'wood');
    box(sofa, [1.94, .25, .98], [0, .71, 0], p.cream, .07, 'cloth');
    box(sofa, [1.86, .015, .91], [0, .84, .02], p.paper, .03, 'cloth');
    for (const x of [-1.02, 1.02]) {
      box(sofa, [.06, .6, 1.05], [x, .92, 0], p.wood, .008, 'wood');
      box(sofa, [.13, .065, 1.14], [x, 1.23, 0], p.darkWood, .008, 'wood');
    }
    for (const x of [-.98, .98]) box(sofa, [.075, .79, .075], [x, 1.0, -.49], p.darkWood, .005, 'wood');
    box(sofa, [2.07, .075, .08], [0, 1.39, -.49], p.darkWood, .007, 'wood');
    for (let i = 0; i < 13; i++) box(sofa, [.035, .43, .035], [-.9 + i * .15, 1.12, -.49], p.wood, .004, 'wood');
    const pillow = box(sofa, [.59, .49, .2], [-.56, 1.05, -.24], '#cec4b0', .085, 'cloth'); pillow.rotation.set(-.2, .04, -.1);
    const bolster = cylinder(sofa, .14, .14, .59, [.59, 1.03, -.17], p.ink, 'cloth'); bolster.rotation.z = Math.PI / 2;
    box(sofa, [.43, .025, .96], [.35, .87, .06], '#bdb19b', .015, 'cloth');
    box(sofa, [.43, .43, .025], [.35, .65, .54], '#bdb19b', .01, 'cloth');
    for (let i = 0; i < 7; i++) tube(sofa, [[.16 + i * .062, .44, .55], [.16 + i * .062, .36, .55]], .005, p.paper, 'cloth');
    const table = group(this.root, [-2.3, .2, 1.7]);
    box(table, [.92, .66, .92], [0, .35, 0], '#a29d90', .035, 'plaster');
    box(table, [1.12, .085, 1.12], [0, .72, 0], p.paper, .025, 'plaster');
    // A recessed base makes the stone side table feel lighter.
    box(table, [.68, .065, .68], [0, .025, 0], p.ink, .005, 'wood');
    this.mug(table, [.35, .77, .31], p.cream, .75);
    const lamp = group(this.root, [-3.1, .2, -1.63]);
    cylinder(lamp, .25, .27, .06, [0, .03, 0], p.ink, 'metal');
    for (const x of [-.12, .12]) cylinder(lamp, .018, .018, 1.72, [x, .9, 0], p.darkWood, 'wood');
    this.lampShade(lamp, [0, 1.9, 0], .37, .72);
    // A hanging ink scroll replaces the framed botanical print.
    const art = group(this.root, [-3.87, 2.5, .15], Math.PI / 2);
    box(art, [.91, 1.6, .018], [0, 0, 0], '#d3c7b2', .002, 'cloth');
    box(art, [.73, 1.36, .009], [0, 0, .018], p.paper, .002, 'paper');
    for (const y of [-.82, .82]) { const rod = cylinder(art, .025, .025, 1.01, [0, y, 0], p.darkWood, 'wood'); rod.rotation.z = Math.PI / 2; }
    const drawing = canvasPlane(art, .64, 1.23, (ctx, c) => {
      ctx.fillStyle = '#1c1a17'; ctx.textAlign = 'center'; ctx.font = '700px "Ma Shan Zheng", "Noto Serif SC", serif'; ctx.fillText('慢', c.width / 2, c.height * .55);
      ctx.fillStyle = '#b23a2b'; ctx.fillRect(c.width * .7, c.height * .75, 80, 80);
      ctx.fillStyle = '#f6f2e9'; ctx.font = '60px "Noto Serif SC", serif'; ctx.fillText('家', c.width * .7 + 40, c.height * .75 + 60);
    }); drawing.position.z = .026;
  }

  private desk() {
    const desk = group(this.root, [2.1, .2, -2.39]);
    box(desk, [2.56, .095, 1.05], [0, 1.18, 0], p.lightWood, .014, 'wood');
    box(desk, [2.59, .035, 1.08], [0, 1.12, 0], p.darkWood, .005, 'wood');
    for (const x of [-1.02, 1.02]) {
      for (const z of [-.32, .32]) {
        const leg = box(desk, [.065, 1.1, .08], [x, .55, z], p.darkWood, .005, 'wood'); leg.rotation.x = z * .2;
      }
      box(desk, [.1, .06, .89], [x, .08, 0], p.darkWood, .007, 'wood');
      box(desk, [.07, .045, .69], [x, .54, 0], p.wood, .004, 'wood');
    }
    box(desk, [2.14, .045, .065], [0, .52, -.27], p.darkWood, .004, 'wood');
    box(desk, [.97, .012, .7], [-.28, 1.234, .06], p.ink, .003, 'cloth');
    this.mug(desk, [.24, 1.27, -.08], p.paper, .9);
    const pens = cylinder(desk, .11, .09, .22, [.78, 1.35, -.29], p.ink, 'ceramic');
    for (let i = 0; i < 4; i++) { const pen = cylinder(pens, .009, .009, .35, [-.05 + i * .03, .14, 0], [p.sage, '#cbab72', p.blue, p.terracotta][i]); pen.rotation.z = (i - 1.5) * .11; }
    const lamp = group(desk, [1.0, 1.24, -.19]);
    cylinder(lamp, .18, .2, .06, [0, .03, 0], p.ink, 'metal');
    tube(lamp, [[0, .04, 0], [0, .4, 0], [-.16, .55, 0]], .018, p.ink, 'metal');
    this.lampShade(lamp, [-.18, .56, 0], .22, .33, p.paper);
    const chair = group(this.root, [2.16, .2, -1.2], -.18);
    for (const x of [-.28, .28]) for (const z of [-.25, .25]) box(chair, [.055, .62, .065], [x, .31, z], p.wood, .015, 'wood');
    box(chair, [.77, .13, .7], [0, .65, 0], p.lightWood, .018, 'wood');
    box(chair, [.66, .12, .58], [0, .74, 0], p.cream, .1, 'cloth');
    for (const x of [-.3, .3]) box(chair, [.06, .85, .065], [x, .99, .3], p.wood, .015, 'wood');
    box(chair, [.77, .15, .07], [0, 1.32, .3], p.darkWood, .025, 'wood');
    const board = group(this.root, [3.17, 2.78, -3.2]);
    box(board, [1.01, .89, .045], [0, 0, 0], p.darkWood, .005, 'wood');
    box(board, [.91, .79, .015], [0, 0, .048], p.cream, .015, 'cloth');
    this.photo(board, [-.18, -.1, .08], .34, 'flower');
    const note = group(board, [.2, .09, .082], 0); note.rotation.z = -.13;
    box(note, [.32, .34, .006], [0, 0, 0], p.paper, .005, 'paper');
    const noteText = this.localizedPlane(note, .29, .3, (ctx, c) => {
      ctx.fillStyle = '#776b47'; ctx.font = getLocale() === 'vi' ? '64px "Fraunces", Georgia, serif' : '78px "Noto Serif SC", serif'; ctx.textAlign = 'center';
      ctx.fillText(t('慢慢来'), c.width / 2, c.height * .5, c.width * .9);
      ctx.font = getLocale() === 'vi' ? '36px "Fraunces", Georgia, serif' : '42px serif';
      ctx.fillText(t('take your time'), c.width / 2, c.height * .73, c.width * .9);
    }); noteText.position.z = .008;
    ball(note, [.023, .023, .025], [0, .15, .015], p.terracotta);
    this.interactions.register({ id: 'hidden-note', label: '一张留给你的便签', object: note, focus: new THREE.Vector3(3.35, 2.86, -3.04), kind: 'memory', quoteIds: ['answers', 'enough'] });
  }

  private rug() {
    const rug = group(this.root, [.05, .22, .65], 0);
    // Two woven panels with charcoal tape, kept level with both floor books.
    box(rug, [3.45, .055, 2.58], [0, 0, 0], p.ink, .012, 'cloth');
    for (const x of [-.846, .846]) box(rug, [1.65, .009, 2.46], [x, .031, 0], '#d9cfb8', .004, 'cloth');
    for (let i = 0; i < 39; i++) box(rug, [3.32, .003, .01], [0, .038, -1.18 + i * .062], '#c8bda3', .001, 'cloth');
    const cushion = group(this.root, [1.63, .35, 1.69], -.15);
    cylinder(cushion, .51, .53, .27, [0, 0, 0], p.ink, 'cloth');
    cylinder(cushion, .49, .49, .13, [0, .135, 0], '#b6ab96', 'cloth');
    cylinder(cushion, .025, .025, .012, [0, .206, 0], p.ink, 'cloth');
    const slippers = group(this.root, [-1.4, .24, 2.31], .6);
    for (let i = 0; i < 2; i++) {
      const slipper = group(slippers, [i * .3, 0, i * .12], i * .15);
      box(slipper, [.24, .035, .48], [0, 0, 0], p.darkWood, .06, 'wood');
      ball(slipper, [.12, .07, .15], [0, .055, -.08], p.paper, 'cloth');
    }
  }

  private petCorner() {
    const stand = group(this.root, [3.35, .2, -.35]);
    box(stand, [.9, .1, .82], [0, .05, 0], p.darkWood, .02, 'wood');
    for (const x of [-.29, .29]) {
      cylinder(stand, .033, .033, 1.98, [x, 1.02, -.2], p.darkWood, 'wood');
      for (let i = 0; i < 7; i++) cylinder(stand, .036, .036, .055, [x, .35 + i * .14, -.2], p.cream, 'cloth');
    }
    box(stand, [.97, .1, .65], [-.1, 1.31, 0], p.lightWood, .018, 'wood');
    box(stand, [.76, .09, .64], [.12, 1.94, 0], p.lightWood, .018, 'wood');
    const pouch = group(stand, [.06, .73, .04]);
    box(pouch, [.64, .55, .57], [0, -.015, 0], p.cream, .1, 'cloth');
    ball(pouch, [.255, .235, .065], [0, .14, .26], p.ink, 'cloth');
    tube(pouch, [[-.3, .14, .2], [-.25, .43, 0], [-.24, .55, -.08]], .024, '#a58f6d', 'cloth');
    tube(pouch, [[.3, .14, .2], [.25, .43, 0], [.24, .55, -.08]], .024, '#a58f6d', 'cloth');
    const label = canvasPlane(stand, .5, .18, (ctx, c) => { ctx.fillStyle = '#6d6953'; ctx.font = '100px serif'; ctx.textAlign = 'center'; ctx.fillText('Mochi ♡', c.width / 2, c.height * .68); });
    label.position.set(.12, 1.947, .327);
    const bowl = group(this.root, [2.93, .22, .6]);
    cylinder(bowl, .21, .17, .13, [0, .08, 0], p.cream, 'ceramic');
    cylinder(bowl, .17, .17, .02, [0, .15, 0], '#bba57c');
    for (let i = 0; i < 4; i++) box(bowl, [.09, .07, .08], [Math.sin(i * 2) * .09, .18, Math.cos(i * 2) * .08], i % 2 ? '#d3ad73' : p.terracotta, .02);
    this.bonsai(this.root, [3.16, .2, 2.21]);
    this.plant(this.root, [2.53, .2, 2.58], .5, p.ink, false);
  }

  private details() {
    const table = group(this.root, [-.32, .2, -1.07], .1);
    box(table, [1.38, .08, .87], [0, .62, 0], p.darkWood, .014, 'wood');
    for (const x of [-.52, .52]) box(table, [.065, .6, .67], [x, .3, 0], p.darkWood, .007, 'wood');
    box(table, [1.14, .045, .52], [0, .16, 0], p.wood, .006, 'wood');
    box(table, [.69, .015, .62], [.23, .67, 0], p.paper, .003, 'cloth');
    ball(table, [.14, .105, .13], [.43, .79, -.18], p.cream, 'ceramic');
    cylinder(table, .065, .065, .016, [.43, .885, -.18], p.cream, 'ceramic');
    ball(table, [.022, .022, .022], [.43, .909, -.18], p.ink, 'ceramic');
    tube(table, [[.52, .78, -.18], [.64, .82, -.18], [.67, .85, -.18]], .033, p.cream, 'ceramic');
    this.mug(table, [.24, .67, .1], p.cream, 1);
    box(table, [.48, .055, .34], [-.15, .68, -.1], p.paper, .018, 'paper');
    const camera = group(table, [-.16, .77, -.06], -.3);
    box(camera, [.3, .2, .16], [0, 0, 0], p.ink, .027);
    box(camera, [.3, .05, .17], [0, .068, 0], '#aaa599', .01, 'metal');
    const lens = cylinder(camera, .064, .075, .08, [0, -.015, .1], '#484f48', 'metal'); lens.rotation.x = Math.PI / 2;
    ball(camera, [.044, .044, .013], [0, -.015, .145], '#363b38', 'ceramic');
    tube(camera, [[-.15, .03, 0], [-.28, -.07, .13], [-.21, -.13, .25], [.1, -.13, .24], [.15, .04, 0]], .009, '#a28d66', 'cloth');
    this.interactions.register({ id: 'camera-memory', label: '把这一刻收进口袋', object: camera, focus: new THREE.Vector3(-.48, .97, -1.12), kind: 'memory', quoteIds: ['home'] });
    const postcard = group(this.root, [-1.47, 2.83, -3.19], -.06);
    this.photo(postcard, [0, 0, 0], .52, 'landscape');
    this.interactions.register({ id: 'hidden-postcard', label: '远方寄来的明信片', object: postcard, focus: new THREE.Vector3(-1.47, 2.86, -3.02), kind: 'memory', quoteIds: ['tomorrow', 'company'] });
    const music = group(this.root, [-2.21, 2.97, -2.87]);
    box(music, [.34, .2, .28], [0, 0, 0], p.wood, .035, 'wood');
    box(music, [.35, .05, .29], [0, .13, 0], p.lightWood, .025, 'wood');
    cylinder(music, .055, .055, .025, [0, .165, 0], '#9b8960', 'metal');
    this.interactions.register({ id: 'hidden-music', label: '一首很轻的小曲', object: music, focus: new THREE.Vector3(-2.21, 3.16, -2.87), kind: 'memory', quoteIds: ['company', 'rest'] });
    const basket = group(this.root, [-3.04, .21, 2.46]);
    cylinder(basket, .35, .28, .42, [0, .23, 0], '#bd9c6f', 'cloth');
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.295 + i * .01, .012, 5, 28), mat(p.wood, 'wood')); ring.rotation.x = Math.PI / 2; ring.position.y = .06 + i * .071; basket.add(ring);
    }
    ball(basket, [.28, .13, .26], [0, .45, 0], p.cream, 'cloth');
    tube(basket, [[-.25, .4, 0], [-.3, .63, 0], [0, .73, 0], [.3, .63, 0], [.25, .4, 0]], .026, p.wood, 'wood');
    const pendant = group(this.root, [-1.38, 3.23, -2.86]);
    cylinder(pendant, .009, .009, .43, [0, .34, 0], p.ink, 'metal');
    this.lampShade(pendant, [0, -.05, 0], .24, .47);
  }

  private healingBooks() {
    for (const data of books) {
      const book = group(this.root, data.position, data.rotation);
      box(book, [.68, .045, .85], [0, 0, 0], data.color, .018, 'cloth');
      box(book, [.625, .07, .79], [.009, .055, 0], p.paper, .009, 'paper');
      for (let i = 0; i < 4; i++) box(book, [.62, .0015, .76], [.013, .03 + i * .018, .01], '#c9bea2', .001, 'paper');
      const hinge = group(book, [-.33, .102, 0]);
      box(hinge, [.68, .034, .85], [.33, 0, 0], data.color, .014, 'cloth');
      const cover = this.localizedPlane(hinge, .59, .73, (ctx, c) => {
        ctx.strokeStyle = '#f1e6c9'; ctx.lineWidth = 3; ctx.strokeRect(35, 40, c.width - 70, c.height - 80);
        ctx.lineWidth = 1; ctx.strokeRect(45, 50, c.width - 90, c.height - 100);
        ctx.fillStyle = '#fff1d0'; ctx.textAlign = 'center';
        ctx.font = getLocale() === 'vi' ? '62px "Fraunces", Georgia, serif' : '76px "Noto Serif SC", serif';
        ctx.fillText(t(data.title), c.width / 2, c.height * .4, c.width * .85);
        ctx.font = getLocale() === 'vi' ? '26px "Fraunces", Georgia, serif' : '28px serif';
        ctx.fillText(t('a little room for yourself'), c.width / 2, c.height * .52, c.width * .85);
        ctx.beginPath(); ctx.arc(c.width / 2, c.height * .71, 42, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '28px "Fraunces", Georgia, serif'; ctx.fillText('SỮA BEA', c.width / 2, c.height * .89);
      });
      cover.rotation.x = -Math.PI / 2; cover.position.set(.33, .019, 0);
      box(book, [.07, .005, .34], [.14, .083, .4], p.terracotta, .002, 'cloth');
      const pageHinge = group(book, [-.302, .117, 0]);
      const leafGeometry = new THREE.PlaneGeometry(.615, .77, 12, 1); leafGeometry.rotateX(-Math.PI / 2); leafGeometry.translate(.3075, 0, 0);
      const paper = mat(p.paper, 'paper').clone(); paper.side = THREE.DoubleSide;
      const turningPage = new THREE.Mesh(leafGeometry, paper); turningPage.castShadow = true; pageHinge.add(turningPage); pageHinge.visible = false;
      this.interactions.register({ id: data.id, label: data.title, object: book, focus: new THREE.Vector3(...data.position), kind: 'book', quoteIds: data.quotes,
        open: value => { hinge.rotation.z = value * 2.88; },
        turn: value => {
          pageHinge.visible = value > 0 && value < 1; pageHinge.rotation.z = value * Math.PI;
          const vertices = leafGeometry.attributes.position;
          for (let i = 0; i < vertices.count; i++) vertices.setY(i, Math.sin(vertices.getX(i) / .615 * Math.PI) * .11 * Math.sin(value * Math.PI));
          vertices.needsUpdate = true; leafGeometry.computeVertexNormals();
        },
      });
    }
  }

  private bonsai(parent: THREE.Object3D, position: number[]) {
    const tree = group(parent, position);
    box(tree, [.85, .09, .7], [0, .07, 0], p.darkWood, .012, 'wood');
    box(tree, [.69, .27, .53], [0, .235, 0], '#b9b2a2', .035, 'ceramic');
    box(tree, [.59, .02, .43], [0, .377, 0], '#514c40', .02);
    tube(tree, [[0, .38, 0], [-.1, .69, 0], [.12, 1.08, -.05], [.06, 1.6, 0]], .06, p.darkWood, 'wood');
    for (const [x, y, z] of [[-.34, .98, .05], [.36, 1.26, -.04], [.04, 1.6, 0]]) {
      tube(tree, [[.05, .75, 0], [x * .55, y - .18, z], [x, y, z]], .025, p.darkWood, 'wood');
      const canopy = group(tree, [x, y, z]);
      for (let i = 0; i < 7; i++) {
        const a = i * 2.4;
        ball(canopy, [.19, .085, .16], [Math.sin(a) * .18, i % 2 * .05, Math.cos(a) * .13], i % 2 ? p.moss : p.sage, 'leaf');
      }
      this.ambient.push({ object: canopy, phase: y, amount: .015, axis: 'z', base: 0 });
    }
  }

  private plant(parent: THREE.Object3D, pos: number[], scale: number, color: string, trailing: boolean) {
    const pot = group(parent, pos); pot.scale.setScalar(scale);
    cylinder(pot, .25, .18, .38, [0, .2, 0], color, 'ceramic');
    cylinder(pot, .255, .255, .06, [0, .37, 0], color, 'ceramic');
    cylinder(pot, .216, .216, .015, [0, .405, 0], '#73634b');
    for (let i = 0; i < (trailing ? 9 : 7); i++) {
      const a = i * 2.4, height = .55 + (i % 3) * .18;
      const leafGroup = group(pot, [0, .39, 0]);
      tube(leafGroup, [[0, 0, 0], [Math.sin(a) * .13, height * .5, Math.cos(a) * .13], [Math.sin(a) * .33, trailing ? -.05 - i * .04 : height, Math.cos(a) * .33]], .012, p.sage);
      for (let j = 0; j < (trailing ? 3 : 2); j++) {
        const foliage = leaf(leafGroup, [.12 + (i % 3) * .012, 1, .2], [Math.sin(a) * (.14 + j * .08), trailing ? -.03 - j * .11 : height * (.6 + j * .35), Math.cos(a) * (.14 + j * .08)], [p.sage, '#89907a', p.moss][i % 3]);
        foliage.rotation.set(.2 - j * .25, a + (j % 2 ? .48 : -.32), Math.sin(a) * .25);
      }
      this.ambient.push({ object: leafGroup, phase: i + pos[0], amount: .025, axis: 'z', base: 0 });
    }
    return pot;
  }

  private mug(parent: THREE.Object3D, pos: number[], color: string, scale: number) {
    const mug = group(parent, pos); mug.scale.setScalar(scale);
    cylinder(mug, .11, .092, .2, [0, .11, 0], color, 'ceramic');
    cylinder(mug, .09, .09, .007, [0, .213, 0], '#f0e4c9', 'ceramic');
    cylinder(mug, .079, .079, .008, [0, .217, 0], '#8f6746');
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.071, .021, 8, 20), mat(color, 'ceramic')); handle.position.set(.115, .12, 0); mug.add(handle);
    cylinder(mug, .17, .17, .018, [0, .006, 0], '#c4b78c', 'cloth');
  }

  private lampShade(parent: THREE.Object3D, pos: number[], radius: number, height: number, color = p.cream) {
    const shadeMaterial = mat(color, 'paper').clone(); shadeMaterial.side = THREE.DoubleSide;
    shadeMaterial.emissive.set('#ffe2b1'); shadeMaterial.emissiveIntensity = .1;
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const v = i / 24;
      points.push(new THREE.Vector2(radius * (.33 + .67 * Math.sin(v * Math.PI)), (v - .5) * height));
    }
    const shade = new THREE.Mesh(new THREE.LatheGeometry(points, 40), shadeMaterial);
    shade.position.set(pos[0], pos[1], pos[2]); shade.castShadow = shade.receiveShadow = true;
    parent.add(shade); this.bulbs.push(shadeMaterial);
    for (let i = 0; i <= 10; i++) {
      const v = i / 10, r = radius * (.33 + .67 * Math.sin(v * Math.PI));
      const rib = new THREE.Mesh(new THREE.TorusGeometry(r + .002, .004, 4, 40), mat('#bcb09a', 'wood'));
      rib.rotation.x = Math.PI / 2; rib.position.set(pos[0], pos[1] + (v - .5) * height, pos[2]); parent.add(rib);
    }
    const light = new THREE.PointLight('#ffd392', 0, 4.5, 1.6); light.position.set(pos[0], pos[1] - height * .48, pos[2]); parent.add(light); this.lamps.push(light);
  }

  private photo(parent: THREE.Object3D, pos: number[], size: number, kind: 'landscape' | 'flower') {
    const frame = group(parent, pos); frame.rotation.z = -.07;
    box(frame, [size, size * 1.16, .022], [0, size * .5, 0], p.paper, .006, 'paper');
    box(frame, [size * .81, size * .79, .005], [0, size * .57, .015], kind === 'landscape' ? '#bdcabb' : '#d5c4a5', .003, 'paper');
    if (kind === 'landscape') {
      ball(frame, [size * .13, size * .13, .005], [size * .17, size * .76, .02], '#e9d8aa');
      ball(frame, [size * .4, size * .21, .007], [0, size * .36, .02], p.sage);
      ball(frame, [size * .27, size * .18, .008], [-size * .13, size * .28, .03], p.moss);
    } else {
      tube(frame, [[0, size * .23, .03], [0, size * .66, .03]], .005, p.sage);
      for (let i = 0; i < 5; i++) ball(frame, [.026, .042, .008], [Math.sin(i * 1.26) * .04, size * .65 + Math.cos(i * 1.26) * .04, .03], '#f0ddad');
    }
    box(frame, [size * .38, size * .1, .006], [0, size * 1.11, .015], '#d2c5a1', .002, 'paper'); return frame;
  }

  showQuote(position: THREE.Vector3, zh: string, en: string, book: boolean, rotation = 0) {
    const ctx = this.quoteCanvas.getContext('2d')!, w = this.quoteCanvas.width, h = this.quoteCanvas.height;
    ctx.fillStyle = p.paper; ctx.fillRect(0, 0, w, h);
    const gradient = ctx.createLinearGradient(0, 0, w, 0); gradient.addColorStop(0, 'rgba(145,115,63,.12)'); gradient.addColorStop(.1, 'rgba(145,115,63,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);

    // Subtle decorative paper frame
    ctx.strokeStyle = 'rgba(165,140,90,0.18)'; ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Poetic watermark character in top-right corner, opacity 0.04 as specified in DESIGN.md & SKILL.md
    ctx.fillStyle = 'rgba(102, 113, 87, 0.04)';
    ctx.font = '200px "Noto Serif SC", serif';
    ctx.textAlign = 'right';
    ctx.fillText('慢', w - 80, 220);

    ctx.fillStyle = p.ink; ctx.textAlign = 'center'; ctx.font = '42px "IBM Plex Mono", sans-serif'; ctx.fillText(t('A LITTLE NOTE FOR YOU'), w / 2, h * .19, w * .9);
    ctx.fillStyle = p.ink; ctx.font = getLocale() === 'vi' ? '500 110px "Fraunces", Georgia, serif' : '500 124px "Noto Serif SC", serif';
    zh.split('\n').forEach((line, i) => ctx.fillText(line, w / 2, h * .40 + i * 140, w * .9));
    ctx.fillStyle = p.ink; ctx.font = getLocale() === 'vi' ? '500 56px "Noto Serif SC", serif' : 'italic 500 56px "Fraunces", Georgia, serif'; ctx.fillText(en, w / 2, h * .74, w * .91);

    // Signature with subtle terracotta seal '家'
    ctx.fillStyle = p.ink; ctx.font = '40px "Fraunces", Georgia, serif'; ctx.fillText('— Sữa Bea —', w / 2, h * .88);
    const sealX = w / 2 + 130, sealY = h * .88 - 32;
    ctx.fillStyle = p.terracotta;
    ctx.fillRect(sealX, sealY, 32, 32);
    ctx.fillStyle = '#fff8eb';
    ctx.font = '20px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('家', sealX + 16, sealY + 23);

    this.quoteTexture.needsUpdate = true;
    this.quoteGroup.position.copy(position); this.quoteGroup.rotation.set(0, rotation, 0);
    this.quoteGroup.position.y += book ? .112 : .23;
    this.quoteSurface.scale.set(book ? .5 : .9, book ? .86 : .9, 1);
    if (!book) { this.quoteGroup.position.z += .3; this.quoteGroup.rotation.x = .8; }
    this.quoteGroup.visible = true;
  }

  update(elapsed: number, reducedMotion: boolean) {
    for (const part of this.ambient) part.object.rotation[part.axis] = part.base + Math.sin(elapsed * .6 + part.phase) * part.amount * (reducedMotion ? 0 : 1);
  }
}
