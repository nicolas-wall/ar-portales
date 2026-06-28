/**
 * One entry per hidden image (targetIndex matches the order images were compiled into targets.mind).
 * To add a new world: add the image to the .mind file + add an entry here.
 *
 * Layer z: negative = deeper into the portal. Typical range: -2 (back) to -0.1 (front).
 * Layer scale: visual size in world units relative to the portal opening (1.0 = portal width).
 */
export const WORLDS = [
  {
    targetIndex: 0,
    portal: { width: 1, height: 1 },
    layers: [
      { src: '/video/w0_back.mp4',  z: -1.8, scale: 2.2, keyColor: '#00ff00', aspect: 16/9 },
      { src: '/video/w0_mid.mp4',   z: -1.0, scale: 1.5, keyColor: '#00ff00', aspect: 16/9 },
      { src: '/video/w0_front.mp4', z: -0.3, scale: 1.0, keyColor: '#00ff00', aspect: 16/9 },
    ],
  },
  // Add more worlds here:
  // {
  //   targetIndex: 1,
  //   portal: { width: 1, height: 1.4 },
  //   layers: [
  //     { src: '/video/w1_back.mp4',  z: -2,   scale: 2.5 },
  //     { src: '/video/w1_front.mp4', z: -0.4, scale: 1.1 },
  //   ],
  // },
];
