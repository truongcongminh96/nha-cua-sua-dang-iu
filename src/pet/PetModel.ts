import * as THREE from 'three';
import { ball, group } from '../world/primitives';
import { mat } from '../world/materials';
export class PetModel {
  readonly root = new THREE.Group();
  readonly body: THREE.Group;
  readonly head: THREE.Group;
  readonly legs: THREE.Group[] = [];
  readonly tail: THREE.Group[] = [];
  readonly eyes: THREE.Mesh[] = [];
  readonly wings: THREE.Mesh[] = [];
  readonly fruit: THREE.Mesh;
  readonly ears: THREE.Group[] = [];
  constructor() {
    this.body = group(this.root, [0, .19, 0]);
    ball(this.body, [.175, .15, .275], [0, 0, 0], '#a8a99c', 'fur');
    ball(this.body, [.128, .095, .22], [0, -.052, .018], '#e5dcc3', 'fur');
    ball(this.body, [.034, .147, .244], [0, .022, -.023], '#5c625b', 'fur');
    this.head = group(this.body, [0, .066, .206]);
    ball(this.head, [.17, .144, .15], [0, 0, 0], '#b9b9a8', 'fur');
    ball(this.head, [.033, .139, .141], [0, .017, .014], '#505b54', 'fur');
    for (const side of [-1, 1]) {
      const ear = group(this.head, [side * .143, .112, -.019]);
      ball(ear, [.087, .115, .034], [0, 0, 0], '#979e91', 'fur');
      ball(ear, [.064, .088, .014], [0, .005, .029], '#d0aea0', 'fur');
      ear.rotation.z = side * -.28; this.ears.push(ear);
      ball(this.head, [.086, .081, .047], [side * .1, -.025, .11], '#f0e5cb', 'fur');
      ball(this.head, [.071, .079, .039], [side * .103, .018, .118], '#59615a', 'fur');
      const eye = ball(this.head, [.049, .054, .037], [side * .111, .025, .145], '#252f2c', 'ceramic'); this.eyes.push(eye);
      ball(eye, [.24, .24, .15], [-.2, .29, .86], '#fff2d9', 'ceramic');
      ball(this.head, [.04, .028, .026], [side * .035, -.056, .167], '#e9ddc5', 'fur');
      const wing = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), mat('#b3b19e', 'fur'));
      wing.position.set(side * .18, -.035, -.015); wing.scale.set(.04, .018, .22); this.body.add(wing); this.wings.push(wing);
      for (const z of [-.16, .15]) {
        const leg = group(this.body, [side * .11, -.05, z]);
        ball(leg, [.057, .084, .057], [side * .036, -.018, .01], '#aaa99a', 'fur');
        ball(leg, [.045, .027, .076], [side * .055, -.098, .035], '#ccb8a4', 'fur');
        for (let i = 0; i < 3; i++) ball(leg, [.008, .009, .034], [side * .037 + (i - 1) * .016, -.114, .082], '#d4bcaa');
        this.legs.push(leg);
      }
    }
    ball(this.head, [.03, .018, .022], [0, -.05, .193], '#bd9588', 'ceramic');
    this.fruit = ball(this.body, [.043, .045, .043], [0, -.02, .32], '#dda976'); this.fruit.visible = false;
    let parent: THREE.Object3D = this.body;
    for (let i = 0; i < 9; i++) {
      const segment = group(parent, i === 0 ? [0, -.005, -.22] : [0, 0, -.075]);
      ball(segment, [.047 - i * .002, .047 - i * .002, .064], [0, 0, -.027], i > 5 ? '#777e72' : '#a7a99b', 'fur');
      this.tail.push(segment); parent = segment;
    }
    this.root.scale.setScalar(1.16);
  }
}
