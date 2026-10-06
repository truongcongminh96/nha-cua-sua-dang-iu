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
  /** Per-lantern switch; TimeOfDay multiplies each lamp by it. */
  readonly lampOn: boolean[] = [];
  private swings: { object: THREE.Object3D; amount: number }[] = [];
  private tea?: { pot: THREE.Object3D; stream: THREE.Mesh; liquid: THREE.Mesh; time: number };
  private blossoms: THREE.Object3D[] = [];
  private scroll?: { canvas: HTMLCanvasElement; map: THREE.CanvasTexture; image: CanvasImageSource | null };
  private lastElapsed = 0;
  readonly teaCup = new THREE.Vector3();
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
    // Action targets built inside rotated groups get their world-space focus once the scene is assembled.
    this.root.updateMatrixWorld(true);
    for (const entry of this.interactions.entries) if (entry.id.startsWith('lantern-')) new THREE.Box3().setFromObject(entry.object).getCenter(entry.focus);
    this.tea?.liquid.parent?.getWorldPosition(this.teaCup); this.teaCup.y += .1;
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
    // Tiled copings crown the cut-away walls, echoing the eaves of the entrance doors.
    // Only the free ends turn up; the shared corner stays a plain, continuous ridge.
    this.wallCoping([0, 3.83, -3.32], 8.25, 0, [1]);
    this.wallCoping([-4.02, 3.83, .02], 6.7, Math.PI / 2, [-1]);
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
    // Lantern-brocade (灯笼锦) lattice screens replace the ladder-like shoji.
    for (const side of [-1, 1]) this.latticePanel(frame, .42, 1.9, [side * 1.46, 0, .15], 2);
    // A celadon meiping with one plum branch, placed away from the pet's landing.
    const vaseProfile = [[0, 0], [.07, .005], [.1, .06], [.13, .2], [.12, .27], [.06, .32], [.035, .345], [.045, .37], [0, .37]].map(([r, y]) => new THREE.Vector2(r, y));
    const vase = new THREE.Mesh(new THREE.LatheGeometry(vaseProfile, 32), mat('#a9b8a2', 'ceramic'));
    vase.position.set(1.99, 1.405, -3.04); vase.castShadow = vase.receiveShadow = true; this.root.add(vase);
    tube(this.root, [[1.99, 1.74, -3.04], [1.94, 1.98, -3.04], [2.06, 2.2, -3.03], [2.2, 2.3, -3.02]], .011, p.darkWood, 'wood');
    tube(this.root, [[1.95, 1.95, -3.04], [1.84, 2.08, -3.03], [1.8, 2.16, -3.02]], .007, p.darkWood, 'wood');
    // Fourteen blossom slots; one opens for each day the house is visited.
    const plum = group(this.root, [0, 0, 0]);
    const slots = [[1.93, 2.0], [2.03, 2.14], [2.1, 2.24], [2.19, 2.29], [1.84, 2.09], [1.8, 2.16], [2.0, 2.08],
      [1.97, 1.86], [2.07, 2.19], [2.14, 2.27], [1.88, 2.04], [1.95, 1.94], [2.22, 2.31], [1.82, 2.12]];
    for (const [x, y] of slots) {
      const blossom = group(plum, [x, y, -3.01]);
      ball(blossom, [.028, .028, .016], [0, 0, 0], '#f1cfc8', 'paper');
      ball(blossom, [.005, .005, .005], [0, 0, .014], '#c98a3a');
      this.blossoms.push(blossom);
    }
    const plumHit = new THREE.Mesh(new THREE.BoxGeometry(.5, .95, .2), new THREE.MeshBasicMaterial({ visible: false }));
    plumHit.position.set(2.0, 1.85, -3.0); plum.add(plumHit);
    this.interactions.register({ id: 'plum-branch', label: '一枝梅', object: plum, focus: new THREE.Vector3(2.0, 1.9, -3.0), kind: 'action' });
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
    for (let level = 0; level < 2; level++) {
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
    // Curio-shelf rhythm: staggered dividers and a half shelf make compartments of different sizes.
    box(shelf, [.045, .7, .6], [-.42, 1.43, 0], p.darkWood, .004, 'wood');
    box(shelf, [.64, .04, .6], [.475, 2.24, 0], p.darkWood, .004, 'wood');
    // Thread-bound books (线装书) lie in stacks, with white stitching on the spine edge.
    for (const [x, count] of [[-.56, 4], [-.2, 3]] as const) {
      for (let i = 0; i < count; i++) {
        const volume = group(shelf, [x + (i % 2) * .012, 1.86 + i * .04, .02], (i % 2 ? .04 : -.03));
        box(volume, [.27, .036, .37], [0, .018, 0], ['#465265', '#6b5a49', '#5c6b62', '#465265'][i], .004, 'cloth');
        box(volume, [.255, .026, .355], [.006, .018, 0], p.paper, .002, 'paper');
        for (const z of [-.13, -.045, .045, .13]) box(volume, [.03, .038, .006], [-.12, .018, z], '#efe6d2', .001, 'cloth');
      }
    }
    const crestShape = new THREE.Shape();
    crestShape.moveTo(-.9, 0); crestShape.lineTo(-.9, .1); crestShape.quadraticCurveTo(-.92, .24, -.74, .22);
    crestShape.quadraticCurveTo(-.4, .2, -.2, .26); crestShape.quadraticCurveTo(0, .34, .2, .26);
    crestShape.quadraticCurveTo(.4, .2, .74, .22); crestShape.quadraticCurveTo(.92, .24, .9, .1); crestShape.lineTo(.9, 0); crestShape.closePath();
    const crest = new THREE.Mesh(new THREE.ExtrudeGeometry(crestShape, { depth: .045, bevelEnabled: false, curveSegments: 16 }), mat(p.darkWood, 'wood'));
    crest.position.set(0, 2.745, -.36); crest.castShadow = crest.receiveShadow = true; shelf.add(crest);
    // Joinery stays quiet: small brass pins rather than repeated decorative trim.
    for (const x of [-.8, .8]) for (const y of [1.04, 1.81, 2.62]) {
      const pin = cylinder(shelf, .014, .014, .008, [x, y, .354], '#9b8960', 'metal'); pin.rotation.x = Math.PI / 2;
    }
    const jar = cylinder(shelf, .13, .1, .27, [.44, 2.02, .04], '#a9b8a2', 'ceramic');
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
    box(lamp, [.4, .04, .05], [0, 2.3, 0], p.darkWood, .01, 'wood');
    this.lampShade(lamp, [0, 1.9, 0], .37, .72, p.cream, true, false, '落地的纸灯笼');
    // A hanging ink scroll replaces the framed botanical print.
    const art = group(this.root, [-3.87, 2.5, .15], Math.PI / 2);
    box(art, [.91, 1.6, .018], [0, 0, 0], '#d3c7b2', .002, 'cloth');
    box(art, [.73, 1.36, .009], [0, 0, .018], p.paper, .002, 'paper');
    for (const y of [-.82, .82]) { const rod = cylinder(art, .025, .025, 1.01, [0, y, 0], p.darkWood, 'wood'); rod.rotation.z = Math.PI / 2; }
    const drawing = canvasPlane(art, .64, 1.23, (ctx, c) => this.paintScroll(ctx, c, null)); drawing.position.z = .026;
    const scrollMap = (drawing.material as THREE.MeshStandardMaterial).map as THREE.CanvasTexture;
    this.scroll = { canvas: scrollMap.image as HTMLCanvasElement, map: scrollMap, image: null };
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
    // Scholar's objects: tea cup, brush pot, inkstone and a mountain brush rest.
    cylinder(desk, .1, .1, .012, [.24, 1.236, -.08], '#e9dfc9', 'ceramic');
    cylinder(desk, .065, .045, .08, [.24, 1.28, -.08], '#a9b8a2', 'ceramic');
    cylinder(desk, .058, .058, .004, [.24, 1.32, -.08], '#b98a5a');
    const brushes = cylinder(desk, .1, .1, .24, [.62, 1.35, -.32], '#c9a46a', 'wood');
    for (let i = 0; i < 4; i++) {
      const brush = group(brushes, [-.045 + i * .03, .1, (i % 2) * .02], 0); brush.rotation.z = (i - 1.5) * .1;
      cylinder(brush, .008, .008, .34, [0, .1, 0], '#d6bf8c', 'wood');
      ball(brush, [.014, .04, .014], [0, .29, 0], p.ink, 'cloth');
    }
    // The writing set: inkstone, a sheet of xuan paper under two weights, a brush on its mountain rest. Touch it to write.
    const writing = group(desk, [0, 0, 0]);
    box(writing, [.32, .05, .21], [.4, 1.255, .25], '#3e3c39', .02, 'ceramic');
    box(writing, [.13, .012, .09], [.33, 1.282, .25], '#1f1d1b', .01, 'ceramic');
    const sheet = group(writing, [.98, 1.234, .2], .08);
    box(sheet, [.44, .004, .32], [0, 0, 0], '#f7f1e3', .001, 'paper');
    for (const z of [-.13, .13]) box(sheet, [.42, .022, .03], [0, .013, z], '#5b4636', .006, 'wood');
    const strokes = canvasPlane(sheet, .3, .22, (ctx, c) => {
      ctx.strokeStyle = 'rgba(28,26,23,.75)'; ctx.lineCap = 'round';
      for (const [x1, y1, x2, y2, w] of [[.3, .35, .62, .3, 26], [.46, .2, .44, .78, 22], [.3, .55, .2, .72, 18], [.58, .5, .72, .7, 18]]) {
        ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(c.width * x1, c.height * y1); ctx.lineTo(c.width * x2, c.height * y2); ctx.stroke();
      }
    });
    strokes.rotation.x = -Math.PI / 2; strokes.position.y = .004; strokes.userData.ignoreRaycast = true;
    for (const [x, h] of [[-.06, .05], [0, .08], [.06, .05]] as const) ball(writing, [.035, h, .022], [.6 + x, 1.235 + h * .6, .02], '#6d716b', 'ceramic');
    const brush = group(writing, [.6, 1.31, .02], 0); brush.rotation.z = Math.PI / 2;
    cylinder(brush, .008, .008, .3, [0, 0, 0], '#d6bf8c', 'wood');
    ball(brush, [.013, .04, .013], [0, .17, 0], p.ink, 'cloth');
    this.interactions.register({ id: 'brush-writing', label: '写一个字', object: writing, focus: new THREE.Vector3(2.9, 1.5, -2.2), kind: 'action' });
    box(desk, [2.3, .085, .03], [0, 1.05, .5], p.darkWood, .01, 'wood');
    // A small table lantern on a wooden stand instead of a modern desk lamp.
    const lamp = group(desk, [.98, 1.24, -.22]);
    box(lamp, [.3, .04, .3], [0, .02, 0], p.darkWood, .01, 'wood');
    for (const x of [-.12, .12]) cylinder(lamp, .012, .012, .5, [x, .27, 0], p.darkWood, 'wood');
    box(lamp, [.3, .03, .04], [0, .52, 0], p.darkWood, .008, 'wood');
    this.lampShade(lamp, [0, .3, 0], .16, .3, p.paper, false, false, '书桌上的小灯笼');
    // A Ming official's-hat chair: round legs, S-curved splat and a crest rail with upturned ends.
    const chair = group(this.root, [2.16, .2, -1.2], -.18);
    for (const x of [-.27, .27]) {
      cylinder(chair, .028, .028, .62, [x, .31, -.23], p.darkWood, 'wood');
      cylinder(chair, .028, .028, 1.28, [x, .64, .25], p.darkWood, 'wood');
      cylinder(chair, .022, .022, .34, [x, .82, -.23], p.darkWood, 'wood');
      tube(chair, [[x, .96, .25], [x * 1.04, .97, .02], [x * 1.08, .95, -.2], [x, .82, -.24]], .02, p.darkWood, 'wood');
      box(chair, [.03, .03, .48], [x, .14, 0], p.darkWood, .006, 'wood');
    }
    box(chair, [.64, .06, .56], [0, .64, 0], p.wood, .012, 'wood');
    box(chair, [.56, .02, .48], [0, .68, 0], '#b98a6a', .01, 'cloth');
    box(chair, [.6, .07, .025], [0, .57, -.27], p.darkWood, .006, 'wood');
    tube(chair, [[0, .7, .24], [0, .92, .3], [0, 1.15, .27], [0, 1.3, .25]], .05, p.wood, 'wood');
    tube(chair, [[-.38, 1.36, .22], [-.22, 1.31, .26], [.22, 1.31, .26], [.38, 1.36, .22]], .028, p.darkWood, 'wood');
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
    // A woven rug with a fret (回纹) border and auspicious clouds (祥云), replacing the tatami.
    box(rug, [3.45, .055, 2.58], [0, 0, 0], '#5f6b78', .012, 'cloth');
    const weave = canvasPlane(rug, 3.36, 2.49, (ctx, c) => this.paintRug(ctx, c.width, c.height));
    weave.rotation.x = -Math.PI / 2; weave.position.y = .0285; weave.userData.ignoreRaycast = true;
    // A celadon drum stool (绣墩) with studs and an embroidered top; Mochi still lands on it.
    const stool = group(this.root, [1.63, .2, 1.69], -.15);
    const drum = [[0, 0], [.3, 0], [.34, .06], [.38, .17], [.34, .29], [.3, .35], [0, .35]].map(([r, y]) => new THREE.Vector2(r, y));
    const barrel = new THREE.Mesh(new THREE.LatheGeometry(drum, 40), mat('#a9b8a2', 'ceramic'));
    barrel.castShadow = barrel.receiveShadow = true; stool.add(barrel);
    for (const [y, r] of [[.05, .325], [.3, .325]]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(r, .014, 6, 40), mat('#e9dfc9', 'ceramic')); band.rotation.x = Math.PI / 2; band.position.y = y; stool.add(band);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ball(stool, [.014, .014, .014], [Math.cos(a) * (r + .012), y + (y < .1 ? .03 : -.03), Math.sin(a) * (r + .012)], '#6d716b', 'metal'); }
    }
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + .4, window = new THREE.Mesh(new THREE.CircleGeometry(.08, 24), mat('#7f9178', 'ceramic'));
      window.position.set(Math.cos(a) * .382, .17, Math.sin(a) * .382); window.lookAt(Math.cos(a) * 2, .17, Math.sin(a) * 2); window.scale.y = 1.25; stool.add(window);
    }
    cylinder(stool, .3, .3, .035, [0, .368, 0], '#b98a6a', 'cloth');
    const embroidery = canvasPlane(stool, .5, .5, (ctx, c) => {
      ctx.strokeStyle = '#efe2c8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(c.width / 2, c.height / 2, c.width * .38, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#efe2c8'; ctx.font = `${c.width * .4}px "Noto Serif SC", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('福', c.width / 2, c.height * .53);
    });
    embroidery.rotation.x = -Math.PI / 2; embroidery.position.y = .387; embroidery.userData.ignoreRaycast = true;
    // A low footstool (脚踏) with a folded fan replaces the slippers.
    const footstool = group(this.root, [-1.3, .2, 2.36], .6);
    box(footstool, [.72, .05, .36], [0, .17, 0], p.wood, .01, 'wood');
    for (const x of [-.3, .3]) for (const z of [-.13, .13]) box(footstool, [.045, .15, .045], [x, .075, z], p.darkWood, .006, 'wood');
    for (const z of [-.16, .16]) box(footstool, [.62, .05, .02], [0, .125, z], p.darkWood, .006, 'wood');
    const fan = group(footstool, [.08, .2, 0], .3);
    box(fan, [.32, .016, .05], [0, 0, 0], '#d9c08f', .004, 'wood');
    ball(fan, [.016, .016, .016], [-.16, .006, 0], p.terracotta, 'cloth');
    cylinder(fan, .008, .012, .09, [-.2, -.03, 0], p.terracotta, 'cloth').rotation.z = Math.PI / 2.4;
  }

  /** The hanging scroll shows 慢 by default, or the character written at the desk. */
  private paintScroll(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, image: CanvasImageSource | null) {
    ctx.clearRect(0, 0, c.width, c.height);
    if (image) ctx.drawImage(image, c.width * .06, c.height * .14, c.width * .88, c.width * .88);
    else { ctx.fillStyle = '#1c1a17'; ctx.textAlign = 'center'; ctx.font = '700px "Ma Shan Zheng", "Noto Serif SC", serif'; ctx.fillText('慢', c.width / 2, c.height * .55); }
    ctx.fillStyle = '#b23a2b'; ctx.fillRect(c.width * .7, c.height * .75, 80, 80);
    ctx.fillStyle = '#f6f2e9'; ctx.textAlign = 'center'; ctx.font = '60px "Noto Serif SC", serif'; ctx.fillText('家', c.width * .7 + 40, c.height * .75 + 60);
  }
  setScrollArtwork(image: CanvasImageSource | null) {
    if (!this.scroll) return;
    this.scroll.image = image;
    this.paintScroll(this.scroll.canvas.getContext('2d')!, this.scroll.canvas, image);
    this.scroll.map.needsUpdate = true;
  }
  /** Show one plum blossom per visited day, up to every slot on the branch. */
  setBlossoms(days: number) { this.blossoms.forEach((blossom, i) => { blossom.visible = i < Math.min(this.blossoms.length, 3 + days); }); }
  get blossomCount() { return this.blossoms.filter(b => b.visible).length; }
  pourTea() { if (this.tea && this.tea.time < 0) this.tea.time = 0; }
  get pouring() { return !!this.tea && this.tea.time >= 0; }

  private paintRug(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#5f6b78'; ctx.fillRect(0, 0, w, h);
    const band = w * .055;
    ctx.fillStyle = '#e9dfc9'; ctx.fillRect(band, band, w - band * 2, h - band * 2);
    // Fret border: a continuous key pattern in cream on the indigo band.
    ctx.strokeStyle = '#d9cdb2'; ctx.lineWidth = 5; ctx.lineCap = 'square';
    const step = band * .9;
    const fret = (x: number, y: number, s: number) => {
      ctx.beginPath(); ctx.moveTo(x, y + s); ctx.lineTo(x, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s, y + s * .7);
      ctx.lineTo(x + s * .3, y + s * .7); ctx.lineTo(x + s * .3, y + s * .3); ctx.lineTo(x + s * .65, y + s * .3); ctx.stroke();
    };
    for (let x = band * .3; x < w - band; x += step) { fret(x, band * .2, step * .6); fret(x, h - band * .8, step * .6); }
    for (let y = band * 1.2; y < h - band * 1.2; y += step) { fret(band * .2, y, step * .6); fret(w - band * .8, y, step * .6); }
    ctx.strokeStyle = '#8f6a55'; ctx.lineWidth = 3; ctx.strokeRect(band * 1.25, band * 1.25, w - band * 2.5, h - band * 2.5);
    // Auspicious clouds: curled lobes drawn as soft ink-brown outlines with a pale wash.
    const cloud = (cx: number, cy: number, s: number, flip = 1) => {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s * flip, s);
      ctx.fillStyle = 'rgba(178,124,92,.5)'; ctx.strokeStyle = '#86593f'; ctx.lineWidth = 4.5 / s;
      ctx.beginPath();
      ctx.arc(-34, 0, 22, Math.PI * .5, Math.PI * 1.6); ctx.arc(0, -14, 26, Math.PI * 1.1, Math.PI * 1.95);
      ctx.arc(34, 0, 22, Math.PI * 1.4, Math.PI * .5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-34, 0, 9, 0, Math.PI * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(34, 0, 9, Math.PI, Math.PI * 2.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-34, 22); ctx.quadraticCurveTo(0, 34, 40, 20); ctx.stroke();
      ctx.restore();
    };
    cloud(w / 2, h / 2, 3.2); cloud(w / 2 - 70, h / 2 + 95, 1.6, -1); cloud(w / 2 + 80, h / 2 - 90, 1.5);
    for (const [x, y, f] of [[.2, .22, 1], [.8, .22, -1], [.2, .78, 1], [.8, .78, -1]]) cloud(w * x, h * y, 1.35, f);
  }

  /** Lantern-brocade lattice: a framed paper panel with a small square in every cell, tied to its neighbours. */
  private latticePanel(parent: THREE.Object3D, width: number, height: number, pos: number[], columns: number) {
    const panel = group(parent, pos);
    box(panel, [width - .03, height - .03, .012], [0, 0, -.012], p.paper, .002, 'paper');
    for (const x of [-1, 1]) box(panel, [.032, height, .05], [x * (width / 2 - .016), 0, 0], p.wood, .004, 'wood');
    for (const y of [-1, 1]) box(panel, [width, .032, .05], [0, y * (height / 2 - .016), 0], p.wood, .004, 'wood');
    const cell = (width - .064) / columns, rows = Math.floor((height - .064) / cell);
    const inner = cell * .46, arm = (cell - inner) / 2, bar = .013;
    const top = (rows * cell) / 2;
    for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
      const cx = -width / 2 + .032 + cell * (c + .5), cy = top - cell * (r + .5);
      for (const side of [-1, 1]) {
        box(panel, [inner + bar, bar, .03], [cx, cy + side * inner / 2, 0], p.wood, .002, 'wood');
        box(panel, [bar, inner, .03], [cx + side * inner / 2, cy, 0], p.wood, .002, 'wood');
        box(panel, [arm, bar, .03], [cx + side * (inner / 2 + arm / 2), cy, 0], p.wood, .002, 'wood');
        box(panel, [bar, arm, .03], [cx, cy + side * (inner / 2 + arm / 2), 0], p.wood, .002, 'wood');
      }
    }
    return panel;
  }

  /** A tiled wall coping (墙帽): twin tile slopes, a ridge with upturned ends, and eave discs facing the room. */
  private wallCoping(center: number[], length: number, rotationY: number, upturned: number[] = [-1, 1]) {
    const coping = group(this.root, center, rotationY);
    box(coping, [length, .14, .26], [0, .07, 0], '#ece4d4', .01);
    const tilt = .42, tile = '#8b8f95', light = '#a9acb0';
    for (const side of [-1, 1]) {
      const slope = group(coping, [0, .2, side * .16]); slope.rotation.x = side * tilt;
      box(slope, [length + .08, .035, .38], [0, 0, 0], tile, .006, 'ceramic');
      for (let x = -length / 2 + .1, i = 0; x <= length / 2 - .06; x += .22, i++) {
        const row = cylinder(slope, .046, .046, .4, [x, .035, 0], i % 2 ? tile : light, 'ceramic'); row.rotation.x = Math.PI / 2;
        if (side === 1) { const disc = cylinder(slope, .055, .055, .024, [x, .03, .205], '#7d8187', 'ceramic'); disc.rotation.x = Math.PI / 2; }
      }
    }
    const ridge = cylinder(coping, .055, .055, length + .1, [0, .3, 0], '#73777e', 'ceramic'); ridge.rotation.z = Math.PI / 2;
    for (const end of upturned) tube(coping, [[end * length / 2, .3, 0], [end * (length / 2 + .13), .38, 0], [end * (length / 2 + .2), .52, 0]], .045, '#73777e', 'ceramic');
    return coping;
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
    this.interactions.register({ id: 'mochi-treat', label: 'Mochi 的果盘', object: bowl, focus: new THREE.Vector3(2.93, .4, .6), kind: 'action' });
    this.bamboo(this.root, [3.16, .2, 2.21]);
    this.plant(this.root, [2.53, .2, 2.58], .5, p.ink, false);
  }

  private details() {
    const table = group(this.root, [-.32, .2, -1.07], .1);
    box(table, [1.38, .08, .87], [0, .62, 0], p.darkWood, .014, 'wood');
    for (const x of [-.52, .52]) box(table, [.065, .6, .67], [x, .3, 0], p.darkWood, .007, 'wood');
    box(table, [1.14, .045, .52], [0, .16, 0], p.wood, .006, 'wood');
    box(table, [.69, .015, .62], [.23, .67, 0], p.paper, .003, 'cloth');
    // A teapot that pours into a handleless cup: the spout faces the cup, the pot tilts on its own pivot.
    const teaSet = group(table, [0, 0, 0]);
    const potBase = group(teaSet, [.43, .69, -.18], -2.16), pot = group(potBase, [0, 0, 0]);
    ball(pot, [.14, .105, .13], [0, .1, 0], p.cream, 'ceramic');
    cylinder(pot, .065, .065, .016, [0, .195, 0], p.cream, 'ceramic');
    ball(pot, [.022, .022, .022], [0, .219, 0], p.ink, 'ceramic');
    tube(pot, [[.09, .09, 0], [.21, .13, 0], [.24, .16, 0]], .033, p.cream, 'ceramic');
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.06, .014, 8, 20, Math.PI * 1.3), mat(p.cream, 'ceramic'));
    handle.position.set(-.14, .11, 0); handle.rotation.z = Math.PI * .35; handle.castShadow = true; pot.add(handle);
    const cup = group(teaSet, [.24, .67, .1]);
    cylinder(cup, .09, .09, .01, [0, .005, 0], '#e9dfc9', 'ceramic');
    cylinder(cup, .062, .044, .075, [0, .048, 0], '#a9b8a2', 'ceramic');
    const liquid = cylinder(cup, .054, .054, .004, [0, .02, 0], '#b0803e'); liquid.scale.set(.85, 1, .85);
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(.005, .008, .2, 8), new THREE.MeshStandardMaterial({ color: '#c49352', transparent: true, opacity: 0, roughness: .2 }));
    stream.position.set(0, .18, 0); stream.userData.ignoreRaycast = true; cup.add(stream);
    this.tea = { pot, stream, liquid, time: -1 };
    this.interactions.register({ id: 'tea-ritual', label: '泡一壶茶', object: teaSet, focus: new THREE.Vector3(-.2, .9, -1.1), kind: 'action' });
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
    this.lampShade(pendant, [0, -.05, 0], .24, .47, p.cream, true, true, '悬着的纸灯笼');
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

  /** A clump of bamboo in a blue-and-white planter, like the bamboo beside the entrance doors. */
  private bamboo(parent: THREE.Object3D, position: number[]) {
    const clump = group(parent, position);
    const profile = [[0, 0], [.24, 0], [.3, .08], [.34, .28], [.33, .4], [.36, .43], [.3, .43]].map(([r, y]) => new THREE.Vector2(r, y));
    const pot = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), mat('#eef0ec', 'ceramic')); pot.castShadow = pot.receiveShadow = true; clump.add(pot);
    for (const [y, r, h] of [[.36, .345, .035], [.12, .315, .025], [.24, .34, .07]]) cylinder(clump, r, r, h, [0, y, 0], '#4f6a8f', 'ceramic');
    cylinder(clump, .3, .3, .02, [0, .42, 0], '#5e5243');
    const culms = [[-.1, -.06, 2.1, .06], [.08, -.1, 2.35, -.04], [.12, .08, 1.75, -.09], [-.06, .11, 1.55, .1], [.02, 0, 1.95, .02]];
    culms.forEach(([x, z, height, lean], index) => {
      const culm = group(clump, [x, .42, z]); culm.rotation.z = lean; culm.rotation.x = lean * .6;
      for (let y = 0; y < height; y += .28) {
        cylinder(culm, .021, .023, .27, [0, y + .135, 0], index % 2 ? '#a3b07c' : '#93a46e', 'wood');
        cylinder(culm, .027, .027, .022, [0, y + .272, 0], '#7c8c5c', 'wood');
      }
      const crown = group(culm, [0, height * .62, 0]);
      for (let twig = 0; twig < 4; twig++) {
        const a = twig * 1.7 + index, y = twig * height * .11;
        const spray = group(crown, [0, y, 0], a);
        tube(spray, [[0, 0, 0], [.12, .07, 0], [.24, .1, 0]], .006, '#8b9b66', 'wood');
        for (let i = 0; i < 5; i++) {
          const foliage = leaf(spray, [.032, 1, .15], [.12 + i * .03, .07 + (i % 2) * .03, (i - 2) * .025], [p.sage, p.moss, '#9fb38a'][i % 3]);
          foliage.rotation.set(.3 + (i - 2) * .22, Math.PI / 2 + (i - 2) * .35, -.5 - i * .08);
        }
      }
      this.ambient.push({ object: crown, phase: index * 1.3, amount: .025, axis: 'z', base: 0 });
    });
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

  /** A handleless teacup on a saucer. */
  private mug(parent: THREE.Object3D, pos: number[], color: string, scale: number) {
    const cup = group(parent, pos); cup.scale.setScalar(scale);
    cylinder(cup, .12, .12, .014, [0, .007, 0], '#e9dfc9', 'ceramic');
    cylinder(cup, .085, .06, .1, [0, .064, 0], color, 'ceramic');
    cylinder(cup, .074, .074, .006, [0, .1, 0], '#b0803e');
  }

  private lampShade(host: THREE.Object3D, pos: number[], radius: number, height: number, color = p.cream, tassel = true, swing = false, label = '一盏纸灯笼') {
    // Each lantern is one clickable group; a hanging lantern swings from its cord when touched.
    const parent = group(host, [0, 0, 0]), index = this.lamps.length;
    this.lampOn.push(true);
    const shadeMaterial = mat(color, 'paper').clone(); shadeMaterial.side = THREE.DoubleSide;
    shadeMaterial.emissive.set('#ffe2b1'); shadeMaterial.emissiveIntensity = .1;
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const v = i / 24;
      points.push(new THREE.Vector2(radius * (.4 + .6 * Math.sin(v * Math.PI)), (v - .5) * height));
    }
    const shade = new THREE.Mesh(new THREE.LatheGeometry(points, 40), shadeMaterial);
    shade.position.set(pos[0], pos[1], pos[2]); shade.castShadow = shade.receiveShadow = true;
    parent.add(shade); this.bulbs.push(shadeMaterial);
    for (let i = 0; i <= 10; i++) {
      const v = i / 10, r = radius * (.4 + .6 * Math.sin(v * Math.PI));
      const rib = new THREE.Mesh(new THREE.TorusGeometry(r + .002, .004, 4, 40), mat('#bcb09a', 'wood'));
      rib.rotation.x = Math.PI / 2; rib.position.set(pos[0], pos[1] + (v - .5) * height, pos[2]); parent.add(rib);
    }
    // Lacquered caps and a red silk tassel, like the lanterns in the entrance painting.
    for (const side of [-1, 1]) cylinder(parent, radius * .44, radius * .44, .04, [pos[0], pos[1] + side * (height / 2 + .012), pos[2]], '#6e3f2c', 'wood');
    if (tassel) {
      ball(parent, [.022, .022, .022], [pos[0], pos[1] - height / 2 - .055, pos[2]], p.terracotta, 'cloth');
      cylinder(parent, .016, .03, .17, [pos[0], pos[1] - height / 2 - .16, pos[2]], p.terracotta, 'cloth');
    }
    const light = new THREE.PointLight('#ffd392', 0, 4.5, 1.6); light.position.set(pos[0], pos[1] - height * .48, pos[2]); parent.add(light); this.lamps.push(light);
    const swinging = { object: parent, amount: 0 }; if (swing) this.swings.push(swinging);
    this.interactions.register({ id: `lantern-${index}`, label, object: parent, focus: new THREE.Vector3(), kind: 'action', act: () => {
      this.lampOn[index] = !this.lampOn[index]; swinging.amount = swing ? .12 : 0;
    } });
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
    const dt = Math.min(Math.max(elapsed - this.lastElapsed, 0), .05); this.lastElapsed = elapsed;
    for (const swing of this.swings) {
      swing.amount *= Math.exp(-dt * .9);
      swing.object.rotation.z = reducedMotion ? 0 : Math.sin(elapsed * 3.1) * swing.amount;
    }
    if (this.tea && this.tea.time >= 0) {
      const tea = this.tea, t = tea.time += dt;
      const lift = THREE.MathUtils.smoothstep(t, 0, .7) * (1 - THREE.MathUtils.smoothstep(t, 2.6, 3.3));
      tea.pot.position.set(lift * .07, lift * .1, 0); tea.pot.rotation.z = -lift * .62;
      const pouring = t > .7 && t < 2.6;
      (tea.stream.material as THREE.MeshStandardMaterial).opacity = THREE.MathUtils.damp((tea.stream.material as THREE.MeshStandardMaterial).opacity, pouring ? .85 : 0, 10, dt);
      if (t < .1) tea.liquid.position.y = .02;
      tea.liquid.position.y = THREE.MathUtils.lerp(.02, .072, THREE.MathUtils.smoothstep(t, .8, 2.6));
      if (t > 3.4) tea.time = -1;
    }
    for (const part of this.ambient) part.object.rotation[part.axis] = part.base + Math.sin(elapsed * .6 + part.phase) * part.amount * (reducedMotion ? 0 : 1);
  }
}
