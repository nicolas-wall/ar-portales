import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { createPortal } from './portal.js';
import { createLayers } from './layers.js';
import { WORLDS } from './worlds.js';

const container = document.getElementById('ar-container');
const startBtn  = document.getElementById('start-btn');
const stopBtn   = document.getElementById('stop-btn');
const overlay   = document.getElementById('overlay');

let mindarThree = null;
let allVideos   = [];

async function startAR() {
  overlay.style.display = 'none';

  mindarThree = new MindARThree({
    container,
    imageTargetSrc: '/targets/targets.mind',
    maxTrack: WORLDS.length,
    uiLoading: 'yes',
    uiScanning: 'yes',
    uiError: 'yes',
    // One Euro filter — lower values = more smoothing (less jitter, tiny lag)
    filterMinCF: 0.0001,
    filterBeta: 0.001,
    // Keep anchor visible for more frames before declaring it lost
    missTolerance: 10,
    // Require more frames of detection before snapping anchor into place
    warmupTolerance: 5,
  });

  const { renderer, scene, camera } = mindarThree;
  renderer.autoClearStencil = true;

  for (const world of WORLDS) {
    const { width, height } = world.portal;
    const anchor = mindarThree.addAnchor(world.targetIndex);

    // Portal mask + visible frame
    const portal = createPortal(width, height);
    anchor.group.add(portal);

    // Depth layers — each layer creates its own video element internally
    const { group: layerGroup, videos } = createLayers(world);
    anchor.group.add(layerGroup);
    allVideos.push(...videos);

    anchor.onTargetFound = () => {
      videos.forEach(v => v.play().catch(() => {}));
    };
    anchor.onTargetLost = () => {
      videos.forEach(v => v.pause());
    };
  }

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  startBtn.style.display = 'none';
  stopBtn.style.display  = 'block';
}

function stopAR() {
  if (!mindarThree) return;
  allVideos.forEach(v => v.pause());
  allVideos = [];
  mindarThree.stop();
  mindarThree.renderer.setAnimationLoop(null);
  mindarThree = null;
  overlay.style.display  = 'flex';
  startBtn.style.display = 'block';
  stopBtn.style.display  = 'none';
}

startBtn.addEventListener('click', () => startAR().catch(console.error));
stopBtn.addEventListener('click', stopAR);
