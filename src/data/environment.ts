import type { WorldAffordance, NavigationLink, PetDefinition } from '../pet/types';

// Furniture declares affordances and safe contact points. The pet never needs furniture-specific code.
export const affordances: WorldAffordance[] = [
  { id: 'rug', position: [0, .28, .45], capabilities: ['walkable', 'inspectable'], label: '地毯' },
  { id: 'floor-east', position: [2.32, .22, .62], capabilities: ['walkable'], label: '木地板' },
  { id: 'floor-west', position: [-1.48, .22, -.24], capabilities: ['walkable'], label: '阅读角' },
  { id: 'floor-north', position: [-1.18, .22, -2.16], capabilities: ['walkable'], label: '书架旁' },
  { id: 'plant', position: [2.48, .22, 1.81], capabilities: ['inspectable', 'walkable'], label: '植物角' },
  { id: 'fruit', position: [2.75, .22, .67], capabilities: ['eatable', 'walkable'], label: '水果碗' },
  { id: 'pouch', position: [3.42, .91, -.1], capabilities: ['sleepable', 'climbable'], label: '软软的布袋' },
  { id: 'pet-shelf', position: [3.23, 1.56, -.28], capabilities: ['climbable', 'walkable', 'jumpable'], label: '小木架' },
  { id: 'perch', position: [3.46, 2.2, -.35], capabilities: ['watchable', 'landable', 'jumpable'], label: '最高的小平台' },
  { id: 'cushion', position: [1.63, .57, 1.69], capabilities: ['landable', 'sleepable', 'inspectable'], label: '柔软的靠垫' },
  { id: 'sofa', position: [-2.51, 1.06, -.35], capabilities: ['sleepable', 'landable', 'inspectable'], label: '沙发' },
  { id: 'shelf-low', position: [-2.12, 1.32, -2.55], capabilities: ['climbable', 'inspectable', 'walkable'], label: '书架' },
  { id: 'shelf-high', position: [-2.26, 2.91, -2.88], capabilities: ['climbable', 'jumpable', 'inspectable'], label: '书架顶' },
  { id: 'window', position: [.69, 1.38, -3.04], capabilities: ['watchable', 'walkable', 'landable'], label: '窗边' },
  { id: 'desk', position: [1.22, 1.43, -2.24], capabilities: ['inspectable', 'walkable', 'jumpable'], label: '小书桌' },
];
export const navigationLinks: NavigationLink[] = [
  { from: 'rug', to: 'floor-east', motion: 'walk', bidirectional: true },
  { from: 'rug', to: 'floor-west', motion: 'walk', bidirectional: true },
  { from: 'floor-west', to: 'floor-north', motion: 'walk', bidirectional: true },
  { from: 'floor-east', to: 'plant', motion: 'walk', bidirectional: true },
  { from: 'floor-east', to: 'fruit', motion: 'walk', bidirectional: true },
  { from: 'fruit', to: 'pouch', motion: 'climb', bidirectional: true },
  { from: 'pouch', to: 'pet-shelf', motion: 'climb', bidirectional: true },
  { from: 'pet-shelf', to: 'perch', motion: 'climb', bidirectional: true },
  { from: 'perch', to: 'cushion', motion: 'glide' },
  { from: 'cushion', to: 'floor-east', motion: 'jump', bidirectional: true },
  { from: 'floor-west', to: 'sofa', motion: 'jump', bidirectional: true },
  { from: 'floor-north', to: 'shelf-low', motion: 'climb', bidirectional: true },
  { from: 'shelf-low', to: 'shelf-high', motion: 'climb', bidirectional: true },
  { from: 'shelf-high', to: 'window', motion: 'glide' },
  { from: 'window', to: 'desk', motion: 'walk', bidirectional: true },
  { from: 'desk', to: 'pet-shelf', motion: 'jump', bidirectional: true },
  { from: 'shelf-high', to: 'sofa', motion: 'glide' },
];
export const pets: PetDefinition[] = [{ id: 'mochi', name: 'Mochi', start: 'perch', speed: .48, seed: 7289 }];
