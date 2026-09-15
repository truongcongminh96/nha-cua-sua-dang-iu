import type { TimeMode } from './TimeOfDay';
interface WorldTool { name: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean }; execute: (input: unknown) => unknown | Promise<unknown> }
interface ModelContext { registerTool(tool: WorldTool, options: { signal: AbortSignal }): void | Promise<void> }
interface WorldActions {
  state: () => object;
  configure: (time?: TimeMode, rain?: boolean) => void;
  inspect: (id: string) => boolean;
  objectIds: string[];
}
export function registerWorldTools(actions: WorldActions) {
  const context = (document as Document & { modelContext?: ModelContext }).modelContext;
  const lifecycle = new AbortController();
  if (!context?.registerTool) return () => lifecycle.abort();
  const object = (value: unknown): Record<string, unknown> => { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object.'); return value as Record<string, unknown>; };
  const settle = () => new Promise<void>(resolve => setTimeout(resolve, 3000));
  const tools: WorldTool[] = [
    { name: 'read_house_state', description: 'Read the current time, weather, pet behavior, readable objects, and local discovery count.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: () => actions.state() },
    { name: 'set_house_atmosphere', description: 'Change the visible room time and/or rain using the same controls as the visitor.', inputSchema: { type: 'object', properties: { time: { type: 'string', enum: ['day', 'golden', 'night'] }, rain: { type: 'boolean' } }, additionalProperties: false }, annotations: { readOnlyHint: false }, async execute(input) {
      const value = object(input);
      if (Object.keys(value).some(key => !['time', 'rain'].includes(key)) || (value.time !== undefined && !['day', 'golden', 'night'].includes(value.time as string)) || (value.rain !== undefined && typeof value.rain !== 'boolean')) throw new Error('Invalid time or rain setting.');
      actions.configure(value.time as TimeMode | undefined, value.rain as boolean | undefined); await settle(); return actions.state();
    } },
    { name: 'open_house_object', description: 'Open a book or memory object in the 3D room. This also records that local discovery, just like clicking it.', inputSchema: { type: 'object', properties: { id: { type: 'string', enum: actions.objectIds } }, required: ['id'], additionalProperties: false }, annotations: { readOnlyHint: false }, async execute(input) {
      const value = object(input);
      if (Object.keys(value).some(key => key !== 'id') || typeof value.id !== 'string' || !actions.objectIds.includes(value.id)) throw new Error('Unknown room object.');
      if (!actions.inspect(value.id)) throw new Error('The object is unavailable.');
      await settle(); return actions.state();
    } },
  ];
  for (const tool of tools) {
    try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(error => console.info('Optional world tool unavailable:', error)); }
    catch (error) { console.info('Optional world tool unavailable:', error); }
  }
  return () => lifecycle.abort();
}
