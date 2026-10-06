import { getLocale, onLocaleChange, setLocale, t, type Locale } from './data/i18n';
import './ui/styles.css';
import * as THREE from 'three';
import { Room } from './world/Room';
import { CameraRig } from './systems/Camera';
import { TimeOfDay, initialTimeMode, type TimeMode } from './systems/TimeOfDay';
import { InteractableRegistry, type InteractableDefinition } from './systems/Interactable';
import { quotes } from './data/quotes';
import { UI } from './ui/UI';
import { discoverySeals } from './ui/copy';
import { applyTheme } from './ui/theme';
import { Weather } from './systems/Weather';
import { RoomAudio } from './systems/Audio';
import { Discovery, discoveries } from './systems/Discovery';
import { Ambience } from './world/Ambience';
import { Pet, stateLabels } from './pet/Pet';
import { Navigation } from './pet/Navigation';
import { affordances, navigationLinks, pets } from './data/environment';
import { Journal } from './ui/Journal';
import { batchStaticMeshes } from './world/optimize';
import { registerWorldTools } from './systems/WorldTools';
import { LanternHalos, PainterlyRenderer, WindowLight } from './world/Painterly';

const ui = new UI(document.querySelector('#app')!);
const canvas = document.querySelector<HTMLCanvasElement>('#world-canvas')!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const interactions = new InteractableRegistry();
const room = new Room(scene, interactions);
const camera = new CameraRig(canvas);
const time = new TimeOfDay(scene, room, initialTimeMode()); ui.setTime(time.mode);
if (matchMedia('(pointer: coarse)').matches) { renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4)); time.sunlight.shadow.mapSize.set(1024, 1024); }
const coarsePointer = matchMedia('(pointer: coarse)').matches;
// Xuan Paper watercolor look (phase 1). `?look=classic` or the About drawer switches back for comparison.
const painter = new PainterlyRenderer(renderer, coarsePointer);
const halos = new LanternHalos(room.lamps); scene.add(halos.group);
const windowLight = new WindowLight(scene);
let nightInk = time.mode === 'night' ? 1 : 0;
function readLook() {
  const param = new URLSearchParams(location.search).get('look');
  if (param === 'classic' || param === 'paper') return param === 'paper';
  try { return localStorage.getItem('sua-house-look') !== 'classic'; } catch { return true; }
}
function setLook(paper: boolean, persist = false) {
  painter.enabled = paper; halos.group.visible = paper; windowLight.setEnabled(paper);
  if (persist) try { localStorage.setItem('sua-house-look', paper ? 'paper' : 'classic'); } catch { /* Preference is optional. */ }
}
setLook(readLook());
const readingLight = new THREE.SpotLight('#fff0ce', 0, 8, .58, .9, 1.5);
scene.add(readingLight, readingLight.target);
const audio = new RoomAudio(); audio.setTime(time.mode);
const weather = new Weather(scene);
let store: Storage | undefined;
try { store = localStorage; } catch { /* Browsers may disable device storage. Keep the room usable. */ }
let journal: Journal | undefined;
const discovery = new Discovery(store, (count, definition) => {
  ui.setDiscoveries(count, discoveries.length);
  if (definition) ui.toast(definition.label, discoverySeals[definition.id]);
  journal?.refresh();
});
const ambience = new Ambience(scene, id => { if (!camera.focused) discovery.record(id); });
const navigation = new Navigation(affordances, navigationLinks);
const residents = pets.map(definition => {
  const pet = new Pet(definition, navigation, (anchor, state) => {
    ui.setPetState(state);
    if (!camera.focused && state === 'glide') discovery.record('pet-glide');
    if (!camera.focused && anchor === 'window' && state === 'idle') discovery.record('pet-window');
    if (state === 'jump' || state === 'sleep') audio.cloth();
  }, () => audio.step());
  scene.add(pet.model.root);
  interactions.register({ id: definition.id, label: `${definition.name} · 小小的室友`, object: pet.model.root, focus: pet.model.root.position, kind: 'pet' });
  return pet;
});
for (const part of room.ambient) batchStaticMeshes(part.object, []);
batchStaticMeshes(room.root, [room.quoteGroup, ...room.ambient.map(a => a.object), ...interactions.entries.map(i => i.object)]);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: '#5e6450', opacity: .14 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -.36; ground.receiveShadow = true; ground.userData.ignoreRaycast = true; scene.add(ground);
let active: InteractableDefinition | undefined, page = 0, openAmount = 0;
let closing: InteractableDefinition | undefined, closeAmount = 0;
let quoteDelay = 0, petReadoutTimer = 0;
let turning: { entry: InteractableDefinition; progress: number } | undefined;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize() { renderer.setSize(innerWidth, innerHeight); camera.resize(innerWidth, innerHeight); painter.setSize(innerWidth, innerHeight); }
window.addEventListener('resize', resize); resize();
let pageTurn = false;
function showPage() {
  if (!active?.quoteIds) return;
  const quote = quotes.find(q => q.id === active!.quoteIds![page % active!.quoteIds!.length])!;
  ui.showPage({
    eyebrow: t('A LITTLE NOTE FOR YOU'), lines: quote[getLocale()].split('\n'),
    secondary: quote[getLocale() === 'vi' ? 'zh' : 'vi'].replace('\n', ' '),
    page: page % active.quoteIds.length + 1, total: active.quoteIds.length,
  }, pageTurn);
  pageTurn = false;
  document.querySelector('#world-canvas')!.setAttribute('aria-label', `${t(active.label)}. ${quote[getLocale()].replace('\n', ' ')}`);
}
function activate(entry: InteractableDefinition) {
  ui.dismissInstructions();
  if (entry.kind === 'pet') {
    const pet = residents.find(pet => pet.definition.id === entry.id)!;
    ui.toast(`${pet.definition.name} ${t(stateLabels[pet.state])}. ${t('陪它一会儿吧。')}`);
    pet.interestedIn(pet.model.root.position.toArray()); return;
  }
  closing?.open?.(0); closing = undefined;
  turning?.entry.turn?.(1); turning = undefined;
  active?.open?.(0); active = entry; page = 0; openAmount = 0;
  camera.focus(entry.focus, entry.kind === 'book'); ui.focus(entry.label, (entry.quoteIds?.length ?? 0) > 1);
  journal?.close(); quoteDelay = .8; room.quoteGroup.visible = false;
  readingLight.position.copy(entry.focus).add(new THREE.Vector3(.2, 3, 1)); readingLight.target.position.copy(entry.focus);
  if (entry.kind === 'book') audio.page();
  if (entry.id === 'hidden-music') {
    if (audio.on) audio.musicBox();
    else void audio.toggle().then(() => { updateSoundButton(); audio.musicBox(); }).catch(() => ui.toast('浏览器暂时无法播放声音。'));
  }
  if (entry.id === 'camera-memory') audio.shutter();
  discovery.record(entry.id);
  residents.forEach(pet => pet.interestedIn(entry.focus.toArray()));
}
function leaveFocus() {
  if (!active) return;
  closing = active; closeAmount = openAmount; active = undefined; camera.back(); ui.focus(); room.quoteGroup.visible = false; quoteDelay = 0;
  turning?.entry.turn?.(1); turning = undefined;
  canvas.setAttribute('aria-label', t('可探索的三维小屋')); canvas.focus({ preventScroll: true });
}
document.querySelector('#leave-focus')!.addEventListener('click', leaveFocus);
document.querySelector('#next-page')!.addEventListener('click', () => { if (!active || turning) return; page++; audio.page(); room.quoteGroup.visible = false; quoteDelay = .76; pageTurn = true; turning = { entry: active, progress: 0 }; });
document.querySelector('#reset')!.addEventListener('click', () => { leaveFocus(); camera.reset(); ui.showInstructions(); });
function changeTime(mode: TimeMode) { time.set(mode); ui.setTime(mode); audio.setTime(mode); }
// An explicit time choice carries back to the entrance and cinema as the site theme.
function rememberTheme(mode: TimeMode) { applyTheme(mode === 'night' ? 'dark' : 'light'); }
document.querySelectorAll<HTMLButtonElement>('button[data-time]').forEach(b => b.addEventListener('click', () => { changeTime(b.dataset.time as TimeMode); rememberTheme(b.dataset.time as TimeMode); }));
function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') { if (journal?.isOpen) journal.close(); else leaveFocus(); } }
window.addEventListener('keydown', onKeyDown);
const soundButton = document.querySelector<HTMLButtonElement>('#sound')!;
function updateSoundButton() { ui.setSound(audio.on); }
soundButton.addEventListener('click', async () => {
  try {
    const enabled = await audio.toggle(); updateSoundButton();
    ui.toast(enabled ? '声音已打开' : '声音已关闭');
  } catch { ui.toast('浏览器暂时无法播放声音，可以稍后再试。'); }
});
function changeWeather() {
  const raining = weather.toggle() === 'rain'; audio.setWeather(raining);
  ui.setWeather(raining);
  ui.toast(raining ? '正在下雨' : '雨停了');
}
document.querySelector('#weather')!.addEventListener('click', changeWeather);
journal = new Journal(discovery, interactions, id => { const entry = interactions.get(id); if (entry) activate(entry); }, () => { audio.music = !audio.music; if (audio.music && !audio.on) ui.toast('轻音乐已准备好，打开「音」即可聆听。'); return audio.music; }, () => audio.music,
  { get: () => painter.enabled, toggle: () => { setLook(!painter.enabled, true); return painter.enabled; } });

function refreshLanguage() {
  ui.refreshLanguage(); ui.setTime(time.mode); updateSoundButton();
  const raining = weather.mode === 'rain';
  ui.setWeather(raining);
  ui.setPetState(residents[0].state);
  room.refreshLanguage(); journal?.refresh();
  if (active) { ui.focus(active.label, (active.quoteIds?.length ?? 0) > 1); if (quoteDelay <= 0) showPage(); }
  else canvas.setAttribute('aria-label', t('可探索的三维小屋'));
}
const stopLocaleListener = onLocaleChange(refreshLanguage);
document.querySelectorAll<HTMLButtonElement>('button[data-locale]').forEach(button => button.addEventListener('click', () => setLocale(button.dataset.locale as Locale)));
refreshLanguage();
// Canvas labels should use the loaded font as well as the selected language.
void document.fonts.ready.then(() => { room.refreshLanguage(); if (active && quoteDelay <= 0) showPage(); });

const pointer = new THREE.Vector2(), ray = new THREE.Raycaster(), down = new THREE.Vector2();
let dragging = false;
const fingers = new Set<number>();
canvas.addEventListener('pointerdown', e => { fingers.add(e.pointerId); down.set(e.clientX, e.clientY); dragging = fingers.size > 1; });
canvas.addEventListener('pointermove', e => {
  if (down.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 5 && e.buttons) { dragging = true; ui.dismissInstructions(); }
  pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(pointer, camera.camera);
  const hit = !active && !dragging && !journal?.isOpen ? interactions.hit(ray, scene) : undefined;
  if (hit) ringAround(hit); else ui.hideHover();
  canvas.style.cursor = hit ? 'pointer' : dragging ? 'grabbing' : 'grab';
});
canvas.addEventListener('pointerup', e => {
  fingers.delete(e.pointerId);
  if (dragging || active || journal?.isOpen || fingers.size) return;
  pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(pointer, camera.camera);
  const hit = interactions.hit(ray, scene); if (hit) activate(hit);
  ui.hideHover();
});
canvas.addEventListener('wheel', () => ui.dismissInstructions(), { passive: true });
canvas.addEventListener('pointercancel', e => { fingers.delete(e.pointerId); dragging = true; });
canvas.addEventListener('pointerleave', () => ui.hideHover());
// The ink ring circles the hovered object's bounds, projected to the screen.
const ringBox = new THREE.Box3(), ringSphere = new THREE.Sphere(), ringPoint = new THREE.Vector3();
function ringAround(entry: InteractableDefinition) {
  ringBox.setFromObject(entry.object).getBoundingSphere(ringSphere);
  ringPoint.copy(ringSphere.center).project(camera.camera);
  const view = camera.camera, pixelsPerUnit = innerHeight / ((view.top - view.bottom) / view.zoom);
  const size = Math.min(Math.max(ringSphere.radius * 2 * pixelsPerUnit * 1.15, 56), 320);
  ui.showRing(entry.id, entry.label, (ringPoint.x + 1) / 2 * innerWidth, (1 - ringPoint.y) / 2 * innerHeight, size);
}
const clock = new THREE.Clock(); let elapsed = 0;
const visibility = () => { void audio.visibility(document.hidden); clock.getDelta(); };
document.addEventListener('visibilitychange', visibility);
renderer.setAnimationLoop(() => {
  if (document.hidden) return;
  const dt = Math.min(clock.getDelta(), .05); elapsed += dt;
  camera.update(dt); time.update(dt, elapsed, weather.mode === 'rain'); room.update(elapsed, reducedMotion);
  weather.update(dt, reducedMotion); ambience.update(dt, elapsed, time.mode, weather.mode === 'rain', reducedMotion); audio.update(dt, elapsed);
  residents.forEach(pet => pet.update(dt, elapsed, { time: time.mode, rain: weather.mode === 'rain' }));
  if (active) { openAmount = THREE.MathUtils.damp(openAmount, 1, 3, dt); active.open?.(openAmount); }
  readingLight.intensity = THREE.MathUtils.damp(readingLight.intensity, active ? 1.4 : 0, 2, dt);
  if (turning) { turning.progress = Math.min(1, turning.progress + dt / .75); turning.entry.turn?.(turning.progress); if (turning.progress >= 1) turning = undefined; }
  if (closing) { closeAmount = THREE.MathUtils.damp(closeAmount, 0, 5, dt); closing.open?.(closeAmount); if (closeAmount < .005) closing = undefined; }
  if (quoteDelay > 0) { quoteDelay -= dt; if (quoteDelay <= 0) { showPage(); document.querySelector<HTMLButtonElement>('#leave-focus')?.focus({ preventScroll: true }); } }
  petReadoutTimer += dt;
  if (petReadoutTimer > 30) { petReadoutTimer = 0; ui.setDiscoveries(discovery.count, discoveries.length); journal?.refresh(); }
  halos.update(); windowLight.update(time.mode, dt, weather.mode === 'rain');
  nightInk = THREE.MathUtils.damp(nightInk, time.mode === 'night' ? 1 : 0, 1.4, dt);
  painter.render(scene, camera.camera, nightInk);
});
ui.ready();
// First visit: a three-step guide replaces the hint line; afterwards the hint stays as before.
const guided = (() => { try { return localStorage.getItem('sua-house-guide') === 'done'; } catch { return true; } })();
if (!guided) setTimeout(() => ui.startGuide(() => { try { localStorage.setItem('sua-house-guide', 'done'); } catch { /* Shows again next visit. */ } canvas.focus({ preventScroll: true }); }), 900);
const disposeWorldTools = registerWorldTools({
  state: () => ({ time: time.mode, weather: weather.mode, discoveries: discovery.count, objects: interactions.entries.map(i => ({ id: i.id, label: t(i.label), kind: i.kind })), pets: residents.map(p => ({ id: p.definition.id, state: p.state, location: p.current })), reading: active?.id ?? null }),
  configure: (mode, rain) => { if (mode) changeTime(mode); if (rain !== undefined && rain !== (weather.mode === 'rain')) changeWeather(); },
  inspect: id => { const entry = interactions.get(id); if (!entry) return false; activate(entry); return true; },
  objectIds: interactions.entries.map(i => i.id),
});
if (import.meta.hot) import.meta.hot.dispose(() => {
  stopLocaleListener(); disposeWorldTools();
  renderer.setAnimationLoop(null); camera.dispose(); audio.dispose(); painter.dispose(); renderer.dispose();
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility);
  scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(m => m.dispose()); } });
});
