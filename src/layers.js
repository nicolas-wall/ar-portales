import * as THREE from 'three';
import { createChromaMaterial } from './chromaMaterial.js';

/**
 * Creates a video element (hidden) and returns it along with
 * the 3D plane mesh that uses the video as a chroma-keyed texture.
 */
function createVideoLayer(layerConfig, renderOrder) {
  const {
    src,
    z = 0,
    scale = 1,
    keyColor = '#00ff00',
    similarity = 0.35,
    smoothness = 0.12,
    aspect = 16 / 9,
  } = layerConfig;

  const video = document.createElement('video');
  video.src = src;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = 'auto';

  const height = scale;
  const width = scale * aspect;
  const geo = new THREE.PlaneGeometry(width, height);
  const mat = createChromaMaterial(video, { keyColor, similarity, smoothness });
  mat.renderOrder = renderOrder;

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = z;
  mesh.renderOrder = renderOrder;

  return { mesh, video };
}

/**
 * Builds all depth layers for a world config.
 * Returns { group, videos } where videos is an array of HTMLVideoElement
 * that should be .play()/.pause()'d on target found/lost.
 */
export function createLayers(worldConfig) {
  const group = new THREE.Group();
  const videos = [];

  const layers = worldConfig.layers || [];
  layers.forEach((layerConfig, i) => {
    const { mesh, video } = createVideoLayer(layerConfig, 2 + i);
    group.add(mesh);
    videos.push(video);
  });

  return { group, videos };
}
