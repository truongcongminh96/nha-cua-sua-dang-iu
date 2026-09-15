import type { WorldAffordance, NavigationLink, Position } from './types';
export interface RouteStep { target: WorldAffordance; motion: NavigationLink['motion'] }
export function distance(a: Position, b: Position) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
export class Navigation {
  readonly nodes: Map<string, WorldAffordance>;
  private edges: NavigationLink[];
  constructor(affordances: WorldAffordance[], links: NavigationLink[]) {
    this.nodes = new Map(affordances.map(a => [a.id, a]));
    this.edges = links.flatMap(edge => edge.bidirectional ? [edge, { ...edge, from: edge.to, to: edge.from }] : [edge]);
    for (const edge of this.edges) if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) throw new Error(`Unknown navigation anchor: ${edge.from} → ${edge.to}`);
  }
  route(from: string, to: string): RouteStep[] {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return [];
    const cost = new Map<string, number>([[from, 0]]), previous = new Map<string, NavigationLink>(), pending = new Set(this.nodes.keys());
    while (pending.size) {
      const current = [...pending].sort((a, b) => (cost.get(a) ?? Infinity) - (cost.get(b) ?? Infinity))[0];
      if (!Number.isFinite(cost.get(current) ?? Infinity) || current === to) break;
      pending.delete(current);
      for (const edge of this.edges.filter(e => e.from === current)) {
        const nextCost = cost.get(current)! + distance(this.nodes.get(edge.from)!.position, this.nodes.get(edge.to)!.position) * (edge.motion === 'climb' ? 1.2 : 1);
        if (nextCost < (cost.get(edge.to) ?? Infinity)) { cost.set(edge.to, nextCost); previous.set(edge.to, edge); }
      }
    }
    const result: RouteStep[] = []; let node = to;
    while (node !== from) { const edge = previous.get(node); if (!edge) return []; result.unshift({ target: this.nodes.get(node)!, motion: edge.motion }); node = edge.from; }
    return result;
  }
  nearest(position: Position) { return [...this.nodes.values()].sort((a, b) => distance(a.position, position) - distance(b.position, position))[0]; }
}
