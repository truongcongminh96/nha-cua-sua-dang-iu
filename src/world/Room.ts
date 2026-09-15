import * as THREE from 'three';
import { box, ball, cylinder, tube, group, canvasPlane } from './primitives';
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
    this.localizedTextures.push(() => { const ctx = canvas.getContext('2d')!; ctx.clearRect(0, 0, canvas.width, canvas.height); draw(ctx, canvas); map.needsUpdate = true; });
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
    box(this.root, [8.3, .34, 6.9], [0, -.16, 0], '#a78056', .13, 'wood');
    box(this.root, [8.1, .17, 6.7], [0, .06, 0], p.lightWood, .07, 'wood');
    // Individually staggered floor boards make the room feel built, rather than extruded.
    const colors = ['#cfad82', '#d6b48b', '#dab990', '#d0ad80', '#d8b78b'];
    for (let row = 0; row < 14; row++) {
      const z = -3.11 + row * .475;
      const cuts = row % 2 ? [-4, -2.7, -.6, 1.5, 4] : [-4, -1.95, .1, 2.15, 4];
      for (let j = 0; j < cuts.length - 1; j++) {
        const width = cuts[j + 1] - cuts[j] - .014;
        box(this.root, [width, .06, .46], [(cuts[j] + cuts[j + 1]) / 2, .165, z], colors[(row + j) % colors.length], .007, 'wood');
      }
    }
    for (let i = 0; i < 52; i++) box(this.root, [.035, .19, .017], [-4 + i * .157, -.14, 3.453], '#92704d', .004, 'wood');
    // Back wall is built around a real opening, so light and the view have depth.
    box(this.root, [8.16, 1.3, .18], [0, .85, -3.32], p.wall);
    box(this.root, [3.04, 2.25, .18], [-2.56, 2.625, -3.32], p.wall);
    box(this.root, [1.65, 2.25, .18], [3.255, 2.625, -3.32], p.wall);
    box(this.root, [3.5, .35, .18], [.7, 3.575, -3.32], p.wall);
    box(this.root, [.18, 3.58, 6.7], [-4.02, 1.96, 0], '#dce0cd');
    box(this.root, [8.2, .12, .27], [0, 3.78, -3.32], p.lightWood, .035, 'wood');
    box(this.root, [.25, .12, 6.82], [-4.02, 3.78, .02], p.lightWood, .035, 'wood');
    box(this.root, [8, .19, .1], [0, .35, -3.19], '#b49973', .02, 'wood');
    box(this.root, [.1, .19, 6.5], [-3.89, .35, 0], '#b49973', .02, 'wood');
    for (let z = -2.9; z < 3.4; z += .4) box(this.root, [.012, .72, .018], [-3.922, .76, z], '#b7c2aa', .003);
    box(this.root, [.07, .055, 6.55], [-3.9, 1.16, 0], '#adbba1', .01);
  }

  private window() {
    const frame = group(this.root, [.7, 2.42, -3.32]);
    const sky = new THREE.MeshStandardMaterial({ color: '#c4dcd0', emissive: '#c4dcd0', emissiveIntensity: .24, roughness: 1 });
    const outside = new THREE.Mesh(new THREE.PlaneGeometry(3.45, 2.08), sky); outside.position.z = -.22; frame.add(outside); this.windows.push(sky);
    // Layered painted-looking foliage outside the glass.
    for (let i = 0; i < 11; i++) {
      ball(frame, [.42 + Math.sin(i) * .1, .5, .06], [-1.65 + i * .33, -.72 + Math.sin(i * 1.7) * .18, -.14], i % 2 ? '#9bb99d' : '#b2c9a6', 'leaf');
    }
    ball(frame, [.18, .18, .015], [.98, .6, -.13], '#fff1be');
    for (const x of [-1.78, 1.78]) box(frame, [.15, 2.16, .22], [x, 0, 0], p.lightWood, .025, 'wood');
    for (const y of [-1.08, 1.08]) box(frame, [3.7, .15, .23], [0, y, 0], p.lightWood, .025, 'wood');
    box(frame, [.1, 2.06, .13], [0, 0, .065], '#f1e5c9', .015, 'wood');
    box(frame, [3.5, .09, .12], [0, .05, .07], '#f1e5c9', .015, 'wood');
    box(frame, [3.96, .14, .6], [0, -1.12, .13], '#e4ca9e', .025, 'wood');
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.44, 2.01), new THREE.MeshPhysicalMaterial({ color: '#e5eee4', transparent: true, opacity: .09, roughness: .14, metalness: .1, side: THREE.DoubleSide }));
    glass.position.z = .075; glass.userData.ignoreRaycast = true; frame.add(glass);
    const rail = cylinder(frame, .025, .025, 4.2, [0, 1.26, .24], p.darkWood, 'wood'); rail.rotation.z = Math.PI / 2;
    for (const side of [-1, 1]) {
      const curtain = group(frame, [side * 1.65, .95, .2]);
      const geo = new THREE.PlaneGeometry(.83, 2.24, 18, 20);
      const position = geo.attributes.position;
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), y = position.getY(i);
        position.setZ(i, Math.cos(x * 37) * .052);
        position.setX(i, x + side * Math.sin((y + 1.12) / 2.24 * Math.PI) * .16);
      }
      geo.computeVertexNormals();
      const fabric = mat('#eee5c9', 'cloth').clone(); fabric.side = THREE.DoubleSide;
      const cloth = new THREE.Mesh(geo, fabric); cloth.position.y = -1.03; cloth.castShadow = true; curtain.add(cloth);
      this.ambient.push({ object: curtain, phase: side * 2, amount: .018, axis: 'z', base: 0 });
      for (let j = 0; j < 6; j++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.048, .01, 6, 12), mat(p.darkWood));
        ring.position.set(side * 1.65 - .36 + j * .14, 1.22, .24); frame.add(ring);
      }
    }
    this.plant(this.root, [1.86, 1.39, -3.08], .43, '#b78966', false);
    const vase = cylinder(this.root, .1, .14, .24, [-.22, 1.49, -3.04], '#d9d5b9', 'ceramic'); vase.rotation.z = -.06;
    for (let i = 0; i < 4; i++) {
      tube(this.root, [[-.22, 1.58, -3.04], [-.17 + i * .04, 1.87 + i * .04, -3.01]], .009, '#899363');
      ball(this.root, [.04, .08, .035], [-.17 + i * .04, 1.87 + i * .04, -3.01], '#c4a66a');
    }
  }

  private bookshelf() {
    const shelf = group(this.root, [-2.72, .2, -2.88]);
    for (const x of [-.8, .8]) box(shelf, [.12, 2.65, .7], [x, 1.325, 0], p.wood, .025, 'wood');
    box(shelf, [1.62, 2.58, .06], [0, 1.35, -.32], '#bb956d', .015, 'wood');
    for (const y of [.14, 1.04, 1.81, 2.62]) box(shelf, [1.78, .12, .75], [0, y, 0], p.lightWood, .025, 'wood');
    const colors = ['#83957f', '#d5bb91', '#9fa8a3', '#b77f61', '#d5ccab', '#8a9384'];
    for (let level = 0; level < 3; level++) {
      for (let i = 0; i < 5; i++) {
        if (level === 1 && i > 0) continue; // Leave breathing room around the readable book.
        const h = .4 + ((i * 7 + level * 3) % 5) * .045;
        const b = box(shelf, [.12 + i % 2 * .025, h, .38], [-.59 + i * .17, [.23, 1.13, 1.9][level] + h / 2, .02], colors[(i + level) % 6], .013, 'paper');
        b.rotation.z = i === 4 ? -.13 : .015 * (i % 3);
        box(b, [.075, .013, .005], [0, h / 2 - .07, .194], '#eae0bc', .002);
        box(b, [.075, .008, .005], [0, -h / 2 + .07, .194], '#eae0bc', .002);
      }
    }
    const jar = cylinder(shelf, .14, .12, .27, [.44, 2.02, .04], '#e4d7b4', 'ceramic');
    jar.rotation.z = .03;
    this.plant(shelf, [-.45, 2.72, 0], .55, '#d5cdb3', true);
    this.photo(shelf, [.38, 2.76, -.08], .42, 'landscape');
    box(shelf, [.53, .47, .5], [.45, .45, .04], '#aeaa8a', .045, 'cloth');
    box(shelf, [.12, .045, .013], [.45, .52, .3], '#655d48', .01);
  }

  private readingCorner() {
    const sofa = group(this.root, [-2.8, .22, -.1], Math.PI / 2);
    for (const x of [-.87, .87]) for (const z of [-.4, .4]) cylinder(sofa, .065, .047, .25, [x, .1, z], p.darkWood, 'wood');
    box(sofa, [2.12, .4, 1.05], [0, .43, 0], '#879879', .16, 'cloth');
    box(sofa, [2.08, .92, .25], [0, .95, -.43], '#96a789', .12, 'cloth');
    for (const x of [-1.04, 1.04]) box(sofa, [.25, .52, 1.16], [x, .69, 0], '#91a382', .12, 'cloth');
    for (const x of [-.49, .49]) box(sofa, [.95, .22, .92], [x, .72, .06], '#a6b39a', .13, 'cloth');
    const cushion = box(sofa, [.53, .52, .18], [-.58, 1.07, -.18], '#e8d7b5', .16, 'cloth'); cushion.rotation.set(-.2, .08, -.18);
    const cushion2 = box(sofa, [.43, .44, .2], [.57, 1.04, -.14], '#c3936a', .14, 'cloth'); cushion2.rotation.set(-.22, -.13, .2);
    const throwGeo = new THREE.PlaneGeometry(.6, 1.38, 12, 20);
    const v = throwGeo.attributes.position;
    for (let i = 0; i < v.count; i++) {
      const y = v.getY(i), x = v.getX(i);
      v.setXYZ(i, x, y > -.1 ? .86 + Math.sin(x * 26) * .015 : .86 + (y + .1) * .9, y > -.1 ? -.08 + (.69 - y) : .7 + Math.sin((y + .1) * 3) * .04);
    }
    throwGeo.computeVertexNormals(); const throwMat = mat('#d7c59f', 'cloth').clone(); throwMat.side = THREE.DoubleSide;
    const blanket = new THREE.Mesh(throwGeo, throwMat); blanket.position.x = .38; blanket.receiveShadow = true; sofa.add(blanket);
    for (let i = 0; i < 9; i++) tube(sofa, [[.12 + i * .065, .32, .64], [.13 + i * .065, .25, .65]], .007, '#b8a783', 'cloth');
    const table = group(this.root, [-2.3, .2, 1.7]);
    cylinder(table, .56, .56, .12, [0, .68, 0], p.lightWood, 'wood');
    for (const angle of [0, 2.1, 4.2]) {
      const leg = cylinder(table, .047, .035, .66, [Math.sin(angle) * .28, .33, Math.cos(angle) * .28], p.wood, 'wood'); leg.rotation.z = Math.sin(angle) * .12;
    }
    this.mug(table, [.32, .77, .28], '#e7e0c9', .85);
    const lamp = group(this.root, [-3.1, .2, -1.63]);
    cylinder(lamp, .24, .26, .07, [0, .04, 0], '#8b7b54', 'metal');
    cylinder(lamp, .025, .025, 1.8, [0, .93, 0], '#9e875b', 'metal');
    this.lampShade(lamp, [0, 1.85, 0], .42, .5);
    // A framed botanical print faces into the room from the left wall.
    const art = group(this.root, [-3.88, 2.58, .1], Math.PI / 2);
    box(art, [.92, 1.13, .06], [0, 0, 0], p.wood, .025, 'wood');
    box(art, [.81, 1.02, .01], [0, 0, .04], '#eee5cf', .005, 'paper');
    tube(art, [[0, -.35, .06], [.03, -.1, .06], [-.04, .26, .06]], .012, '#7d8863');
    for (let i = 0; i < 6; i++) {
      const leaf = ball(art, [.11, .055, .009], [(i % 2 ? 1 : -1) * .08, -.23 + i * .085, .065], i % 2 ? '#a2ae80' : '#788a68', 'leaf'); leaf.rotation.z = i % 2 ? .55 : -.55;
    }
    cylinder(art, .065, .065, .009, [-.22, .32, .056], '#d8b377').rotation.x = Math.PI / 2;
  }

  private desk() {
    const desk = group(this.root, [2.1, .2, -2.39]);
    box(desk, [2.56, .14, 1.05], [0, 1.16, 0], p.lightWood, .075, 'wood');
    for (const x of [-1.02, 1.02]) for (const z of [-.35, .35]) {
      const leg = box(desk, [.11, 1.12, .12], [x, .56, z], p.wood, .02, 'wood'); leg.rotation.z = x * -.028;
    }
    box(desk, [.83, .27, .8], [.67, .95, 0], '#c4a071', .035, 'wood');
    ball(desk, [.045, .03, .025], [.67, .94, .415], '#8f784f', 'metal');
    this.mug(desk, [.24, 1.27, -.08], '#8faaa2', .9);
    const pens = cylinder(desk, .11, .09, .22, [.78, 1.35, -.29], '#c79268', 'ceramic');
    for (let i = 0; i < 4; i++) { const pen = cylinder(pens, .009, .009, .35, [-.05 + i * .03, .14, 0], ['#636b55', '#cbab72', '#7e9697', '#b68868'][i]); pen.rotation.z = (i - 1.5) * .11; }
    const lamp = group(desk, [1.0, 1.24, -.19]);
    cylinder(lamp, .18, .2, .06, [0, .03, 0], '#5d7057', 'metal');
    tube(lamp, [[0, .04, 0], [0, .4, 0], [-.16, .55, 0]], .024, '#7a8864', 'metal');
    this.lampShade(lamp, [-.18, .56, 0], .22, .23, '#879572');
    const chair = group(this.root, [2.16, .2, -1.2], -.18);
    for (const x of [-.28, .28]) for (const z of [-.25, .25]) box(chair, [.055, .62, .065], [x, .31, z], p.wood, .015, 'wood');
    box(chair, [.77, .13, .7], [0, .65, 0], p.lightWood, .1, 'wood');
    box(chair, [.66, .12, .58], [0, .74, 0], '#c1bea4', .1, 'cloth');
    for (const x of [-.3, .3]) box(chair, [.06, .85, .065], [x, .99, .3], p.wood, .015, 'wood');
    box(chair, [.77, .28, .1], [0, 1.32, .3], p.lightWood, .08, 'wood');
    const board = group(this.root, [3.17, 2.78, -3.2]);
    box(board, [1.01, .89, .07], [0, 0, 0], '#b49262', .035, 'wood');
    box(board, [.91, .79, .015], [0, 0, .048], '#c4ae87', .015, 'cloth');
    this.photo(board, [-.18, -.1, .08], .34, 'flower');
    const note = group(board, [.2, .09, .082], 0); note.rotation.z = -.13;
    box(note, [.32, .34, .006], [0, 0, 0], '#e8dca1', .005, 'paper');
    const noteText = this.localizedPlane(note, .29, .3, (ctx, c) => {
      ctx.fillStyle = '#776b47'; ctx.font = '78px serif'; ctx.textAlign = 'center';
      ctx.fillText(t('慢慢来'), c.width / 2, c.height * .5, c.width * .9); ctx.font = '42px serif'; ctx.fillText(t('take your time'), c.width / 2, c.height * .73, c.width * .9);
    }); noteText.position.z = .008;
    ball(note, [.023, .023, .025], [0, .15, .015], '#a17458');
    this.interactions.register({ id: 'hidden-note', label: '一张留给你的便签', object: note, focus: new THREE.Vector3(3.35, 2.86, -3.04), kind: 'memory', quoteIds: ['answers', 'enough'] });
  }

  private rug() {
    const rug = group(this.root, [.05, .22, .65], -.08);
    box(rug, [3.45, .055, 2.58], [0, 0, 0], '#d9d1b8', .2, 'cloth');
    box(rug, [3.24, .008, 2.38], [0, .032, 0], '#ede3c8', .18, 'cloth');
    for (const side of [-1, 1]) {
      for (let j = 0; j < 3; j++) box(rug, [3.01, .006, .017], [0, .039, side * (1.02 - j * .07)], '#a6aa8b', .007, 'cloth');
      for (let i = 0; i < 30; i++) tube(rug, [[-1.56 + i * .108, .005, side * 1.27], [-1.54 + i * .108, -.002, side * (1.39 + (i % 3) * .014)]], .009, '#d9ceb0', 'cloth');
    }
    const cushion = group(this.root, [1.63, .35, 1.69], -.3);
    box(cushion, [1.12, .3, .97], [0, 0, 0], '#8c9e9d', .19, 'cloth');
    box(cushion, [1.04, .19, .89], [0, .1, 0], '#a1b0aa', .17, 'cloth');
    cylinder(cushion, .035, .035, .015, [0, .205, 0], '#7e938b', 'cloth');
    const slippers = group(this.root, [-1.4, .24, 2.31], .6);
    for (let i = 0; i < 2; i++) {
      const slipper = group(slippers, [i * .3, 0, i * .12], i * .15);
      box(slipper, [.24, .045, .48], [0, 0, 0], '#baaa86', .08, 'cloth');
      ball(slipper, [.13, .09, .17], [0, .055, -.08], '#e2d6b9', 'cloth');
    }
  }

  private petCorner() {
    const stand = group(this.root, [3.35, .2, -.35]);
    cylinder(stand, .43, .46, .12, [0, .06, 0], p.lightWood, 'wood');
    cylinder(stand, .07, .08, 1.92, [0, 1, 0], '#ad956c', 'cloth');
    box(stand, [.97, .1, .65], [-.1, 1.31, 0], p.lightWood, .1, 'wood');
    box(stand, [.76, .09, .64], [.12, 1.94, 0], p.lightWood, .1, 'wood');
    const pouch = group(stand, [.06, .73, .04]);
    ball(pouch, [.35, .38, .3], [0, 0, 0], '#b8a586', 'cloth');
    ball(pouch, [.255, .235, .065], [0, .14, .26], '#746853', 'cloth');
    tube(pouch, [[-.3, .14, .2], [-.25, .43, 0], [-.24, .55, -.08]], .024, '#a58f6d', 'cloth');
    tube(pouch, [[.3, .14, .2], [.25, .43, 0], [.24, .55, -.08]], .024, '#a58f6d', 'cloth');
    const label = canvasPlane(stand, .5, .18, (ctx, c) => { ctx.fillStyle = '#6d6953'; ctx.font = '100px serif'; ctx.textAlign = 'center'; ctx.fillText('Mochi ♡', c.width / 2, c.height * .68); });
    label.position.set(.12, 1.947, .327);
    const bowl = group(this.root, [2.93, .22, .6]);
    cylinder(bowl, .21, .17, .13, [0, .08, 0], '#dec69b', 'ceramic');
    cylinder(bowl, .17, .17, .02, [0, .15, 0], '#bba57c');
    for (let i = 0; i < 4; i++) box(bowl, [.09, .07, .08], [Math.sin(i * 2) * .09, .18, Math.cos(i * 2) * .08], i % 2 ? '#d3ad73' : '#c58964', .02);
    this.plant(this.root, [3.16, .2, 2.21], 1.55, '#b78360', false);
    this.plant(this.root, [2.53, .2, 2.58], .64, '#dcd6bf', false);
  }

  private details() {
    const table = group(this.root, [-.32, .2, -1.07], .1);
    cylinder(table, .66, .67, .1, [0, .6, 0], p.lightWood, 'wood');
    for (const a of [.2, 2.3, 4.4]) {
      const leg = cylinder(table, .047, .033, .57, [Math.sin(a) * .39, .29, Math.cos(a) * .39], p.wood, 'wood'); leg.rotation.z = .08 * Math.sin(a);
    }
    this.mug(table, [.24, .67, .1], '#d7c49e', 1);
    box(table, [.48, .055, .34], [-.15, .68, -.1], '#96a299', .018, 'paper');
    const camera = group(table, [-.16, .77, -.06], -.3);
    box(camera, [.3, .2, .16], [0, 0, 0], '#656b61', .027);
    box(camera, [.3, .05, .17], [0, .068, 0], '#c2bca5', .01, 'metal');
    const lens = cylinder(camera, .064, .075, .08, [0, -.015, .1], '#484f48', 'metal'); lens.rotation.x = Math.PI / 2;
    ball(camera, [.044, .044, .013], [0, -.015, .145], '#70857b', 'ceramic');
    tube(camera, [[-.15, .03, 0], [-.28, -.07, .13], [-.21, -.13, .25], [.1, -.13, .24], [.15, .04, 0]], .009, '#a28d66', 'cloth');
    this.interactions.register({ id: 'camera-memory', label: '把这一刻收进口袋', object: camera, focus: new THREE.Vector3(-.48, .97, -1.12), kind: 'memory', quoteIds: ['home'] });
    const postcard = group(this.root, [-1.47, 2.83, -3.19], -.06);
    this.photo(postcard, [0, 0, 0], .52, 'landscape');
    this.interactions.register({ id: 'hidden-postcard', label: '远方寄来的明信片', object: postcard, focus: new THREE.Vector3(-1.47, 2.86, -3.02), kind: 'memory', quoteIds: ['tomorrow', 'company'] });
    const music = group(this.root, [-2.21, 2.97, -2.87]);
    box(music, [.34, .2, .28], [0, 0, 0], '#b5885d', .035, 'wood');
    box(music, [.35, .05, .29], [0, .13, 0], '#d2b17d', .025, 'wood');
    cylinder(music, .055, .055, .025, [0, .165, 0], '#9b8960', 'metal');
    this.interactions.register({ id: 'hidden-music', label: '一首很轻的小曲', object: music, focus: new THREE.Vector3(-2.21, 3.16, -2.87), kind: 'memory', quoteIds: ['company', 'rest'] });
    const basket = group(this.root, [-3.04, .21, 2.46]);
    cylinder(basket, .35, .28, .42, [0, .23, 0], '#bd9c6f', 'cloth');
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.295 + i * .01, .012, 5, 28), mat('#a68b61', 'wood')); ring.rotation.x = Math.PI / 2; ring.position.y = .06 + i * .071; basket.add(ring);
    }
    ball(basket, [.28, .13, .26], [0, .45, 0], '#ded6b9', 'cloth');
    tube(basket, [[-.25, .4, 0], [-.3, .63, 0], [0, .73, 0], [.3, .63, 0], [.25, .4, 0]], .026, '#b29567', 'wood');
    // Small pin lights follow a loose arc, never an attention-grabbing effect.
    tube(this.root, [[-3.6, 3.49, -3.16], [-1.8, 3.25, -3.16], [.15, 3.5, -3.16]], .007, '#8f9174');
    for (let i = 0; i < 11; i++) {
      const bulb = ball(this.root, [.032, .047, .032], [-3.6 + i * .375, 3.46 - Math.sin(i / 10 * Math.PI) * .23, -3.14], '#f9de9c', 'ceramic');
      const material = (bulb.material as THREE.MeshStandardMaterial).clone(); material.emissive.set('#ffd692'); material.emissiveIntensity = .3; bulb.material = material; this.bulbs.push(material);
    }
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
        ctx.fillStyle = '#fff1d0'; ctx.textAlign = 'center'; ctx.font = '76px serif'; ctx.fillText(t(data.title), c.width / 2, c.height * .4, c.width * .85);
        ctx.font = '28px serif'; ctx.fillText(t('a little room for yourself'), c.width / 2, c.height * .52, c.width * .85);
        ctx.beginPath(); ctx.arc(c.width / 2, c.height * .71, 42, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '28px serif'; ctx.fillText('SỮA BEA', c.width / 2, c.height * .89);
      });
      cover.rotation.x = -Math.PI / 2; cover.position.set(.33, .019, 0);
      box(book, [.07, .005, .34], [.14, .083, .4], '#be835b', .002, 'cloth');
      const pageHinge = group(book, [-.302, .117, 0]);
      const leafGeometry = new THREE.PlaneGeometry(.615, .77, 12, 1); leafGeometry.rotateX(-Math.PI / 2); leafGeometry.translate(.3075, 0, 0);
      const paper = mat('#f5ebd3', 'paper').clone(); paper.side = THREE.DoubleSide;
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

  private plant(parent: THREE.Object3D, pos: number[], scale: number, color: string, trailing: boolean) {
    const pot = group(parent, pos); pot.scale.setScalar(scale);
    cylinder(pot, .25, .18, .38, [0, .2, 0], color, 'ceramic');
    cylinder(pot, .255, .255, .06, [0, .37, 0], color, 'ceramic');
    cylinder(pot, .216, .216, .015, [0, .405, 0], '#73634b');
    for (let i = 0; i < (trailing ? 9 : 7); i++) {
      const a = i * 2.4, height = .55 + (i % 3) * .18;
      const leafGroup = group(pot, [0, .39, 0]);
      tube(leafGroup, [[0, 0, 0], [Math.sin(a) * .13, height * .5, Math.cos(a) * .13], [Math.sin(a) * .33, trailing ? -.05 - i * .04 : height, Math.cos(a) * .33]], .012, '#6c8054');
      for (let j = 0; j < 3; j++) {
        const leaf = ball(leafGroup, [.14, .045, .23], [Math.sin(a) * (.14 + j * .08), trailing ? -.03 - j * .11 : height * (.45 + j * .25), Math.cos(a) * (.14 + j * .08)], ['#73895d', '#8f9f6d', '#5c7954'][i % 3], 'leaf');
        leaf.rotation.set(.1 + j * .2, a, Math.sin(a) * .4);
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

  private lampShade(parent: THREE.Object3D, pos: number[], radius: number, height: number, color = '#e9d9ae') {
    const shade = cylinder(parent, radius * .61, radius, height, pos, color, 'cloth');
    const material = (shade.material as THREE.MeshStandardMaterial).clone(); material.emissive.set('#ffc57a'); material.emissiveIntensity = .1; shade.material = material; this.bulbs.push(material);
    const light = new THREE.PointLight('#ffd392', 0, 4.5, 1.6); light.position.set(pos[0], pos[1] - height * .48, pos[2]); parent.add(light); this.lamps.push(light);
  }

  private photo(parent: THREE.Object3D, pos: number[], size: number, kind: 'landscape' | 'flower') {
    const frame = group(parent, pos); frame.rotation.z = -.07;
    box(frame, [size, size * 1.16, .022], [0, size * .5, 0], '#f4ecd7', .006, 'paper');
    box(frame, [size * .81, size * .79, .005], [0, size * .57, .015], kind === 'landscape' ? '#bdcabb' : '#d5c4a5', .003, 'paper');
    if (kind === 'landscape') {
      ball(frame, [size * .13, size * .13, .005], [size * .17, size * .76, .02], '#e9d8aa');
      ball(frame, [size * .4, size * .21, .007], [0, size * .36, .02], '#8c9c7e');
      ball(frame, [size * .27, size * .18, .008], [-size * .13, size * .28, .03], '#6f886e');
    } else {
      tube(frame, [[0, size * .23, .03], [0, size * .66, .03]], .005, '#76845d');
      for (let i = 0; i < 5; i++) ball(frame, [.026, .042, .008], [Math.sin(i * 1.26) * .04, size * .65 + Math.cos(i * 1.26) * .04, .03], '#f0ddad');
    }
    box(frame, [size * .38, size * .1, .006], [0, size * 1.11, .015], '#d2c5a1', .002, 'paper'); return frame;
  }

  showQuote(position: THREE.Vector3, zh: string, en: string, book: boolean, rotation = 0) {
    const ctx = this.quoteCanvas.getContext('2d')!, w = this.quoteCanvas.width, h = this.quoteCanvas.height;
    ctx.fillStyle = '#f6edd8'; ctx.fillRect(0, 0, w, h);
    const gradient = ctx.createLinearGradient(0, 0, w, 0); gradient.addColorStop(0, 'rgba(145,115,63,.12)'); gradient.addColorStop(.1, 'rgba(145,115,63,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#9e947a'; ctx.textAlign = 'center'; ctx.font = '32px "DM Sans", sans-serif'; ctx.fillText(t('A LITTLE NOTE FOR YOU'), w / 2, h * .19, w * .9);
    ctx.fillStyle = '#555d4a'; ctx.font = getLocale() === 'vi' ? '88px Georgia, serif' : '96px "Noto Serif SC", serif';
    zh.split('\n').forEach((line, i) => ctx.fillText(line, w / 2, h * .41 + i * 106, w * .9));
    ctx.fillStyle = '#8b8775'; ctx.font = getLocale() === 'vi' ? '39px "Noto Serif SC", serif' : 'italic 39px Georgia'; ctx.fillText(en, w / 2, h * .74, w * .91);
    ctx.fillStyle = '#ada58d'; ctx.font = '31px Georgia'; ctx.fillText('— Sữa Bea —', w / 2, h * .88);
    this.quoteTexture.needsUpdate = true;
    this.quoteGroup.position.copy(position); this.quoteGroup.rotation.set(0, rotation, 0);
    this.quoteGroup.position.y += book ? .112 : .23;
    this.quoteSurface.scale.set(book ? .5 : .9, book ? .86 : .9, 1);
    if (!book) { this.quoteGroup.position.z += .3; this.quoteGroup.rotation.x = .8; }
    this.quoteGroup.visible = true;
  }

  update(elapsed: number, reducedMotion: boolean) {
    for (const part of this.ambient) part.object.rotation[part.axis] = part.base + Math.sin(elapsed * .6 + part.phase) * part.amount * (reducedMotion ? .15 : 1);
  }
}
