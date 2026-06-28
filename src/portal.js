import * as THREE from 'three';

/**
 * Creates the portal mesh: writes ref=1 to the stencil buffer inside the opening
 * but does NOT write color or depth. Anything behind it with stencilFunc=Equal/ref=1
 * will only show through this "hole".
 */
export function createPortal(width = 1, height = 1) {
  const group = new THREE.Group();

  // --- Stencil mask (the hole) ---
  const maskGeo = new THREE.PlaneGeometry(width, height);
  const maskMat = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false,
    stencilWrite: true,
    stencilFunc: THREE.AlwaysStencilFunc,
    stencilRef: 1,
    stencilFail: THREE.ReplaceStencilOp,
    stencilZFail: THREE.ReplaceStencilOp,
    stencilZPass: THREE.ReplaceStencilOp,
  });
  const mask = new THREE.Mesh(maskGeo, maskMat);
  mask.renderOrder = 0;
  group.add(mask);

  // --- Visible frame around the portal ---
  const frameOuter = width * 1.15;
  const frameInner = width;
  const frameShape = new THREE.Shape();
  frameShape.moveTo(-frameOuter / 2, -frameOuter / 2);
  frameShape.lineTo( frameOuter / 2, -frameOuter / 2);
  frameShape.lineTo( frameOuter / 2,  frameOuter / 2);
  frameShape.lineTo(-frameOuter / 2,  frameOuter / 2);
  frameShape.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-frameInner / 2, -frameInner / 2 * (height / width));
  hole.lineTo( frameInner / 2, -frameInner / 2 * (height / width));
  hole.lineTo( frameInner / 2,  frameInner / 2 * (height / width));
  hole.lineTo(-frameInner / 2,  frameInner / 2 * (height / width));
  hole.closePath();
  frameShape.holes.push(hole);

  const frameGeo = new THREE.ShapeGeometry(frameShape);
  const frameMat = new THREE.MeshBasicMaterial({
    color: 0x111111,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.renderOrder = 1;
  group.add(frame);

  return group;
}
