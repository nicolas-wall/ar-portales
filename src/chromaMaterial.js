import * as THREE from 'three';

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Chroma key in YCbCr color space — more accurate than RGB distance
const fragmentShader = /* glsl */`
  uniform sampler2D map;
  uniform vec3 keyColor;
  uniform float similarity;
  uniform float smoothness;

  varying vec2 vUv;

  vec2 RGBtoUV(vec3 rgb) {
    return vec2(
      rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5   + 0.5,
      rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081 + 0.5
    );
  }

  void main() {
    vec4 color = texture2D(map, vUv);
    vec2 colorUV = RGBtoUV(color.rgb);
    vec2 keyUV   = RGBtoUV(keyColor);
    float dist = distance(colorUV, keyUV);
    float alpha = smoothstep(similarity, similarity + smoothness, dist);
    gl_FragColor = vec4(color.rgb, color.a * alpha);
  }
`;

export function createChromaMaterial(videoElement, options = {}) {
  const {
    keyColor = '#00ff00',
    similarity = 0.35,
    smoothness = 0.12,
  } = options;

  const color = new THREE.Color(keyColor);
  const texture = new THREE.VideoTexture(videoElement);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return new THREE.ShaderMaterial({
    uniforms: {
      map:        { value: texture },
      keyColor:   { value: new THREE.Vector3(color.r, color.g, color.b) },
      similarity: { value: similarity },
      smoothness: { value: smoothness },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    stencilWrite: true,
    stencilFunc: THREE.EqualStencilFunc,
    stencilRef: 1,
    stencilFail: THREE.KeepStencilOp,
    stencilZFail: THREE.KeepStencilOp,
    stencilZPass: THREE.KeepStencilOp,
  });
}
