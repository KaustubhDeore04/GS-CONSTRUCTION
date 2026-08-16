import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("hero-canvas");
if (canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.4, 13);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ---------- Lighting ----------
  scene.add(new THREE.AmbientLight(0x334455, 1.1));

  const key = new THREE.DirectionalLight(0xbfd4e6, 1.4);
  key.position.set(6, 10, 8);
  scene.add(key);

  const amber = new THREE.PointLight(0xe8871e, 18, 24, 2);
  amber.position.set(-3, 2, 4);
  scene.add(amber);

  const rim = new THREE.PointLight(0x4a6c8c, 12, 30, 2);
  rim.position.set(5, -3, -4);
  scene.add(rim);

  const sweep = new THREE.PointLight(0x7ea0be, 10, 26, 2);
  sweep.position.set(0, 4, 6);
  scene.add(sweep);

  // ---------- Materials ----------
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x2a323c,
    metalness: 0.85,
    roughness: 0.32,
  });
  const steelMatLight = new THREE.MeshStandardMaterial({
    color: 0x3a4756,
    metalness: 0.8,
    roughness: 0.35,
  });
  const amberEdgeMat = new THREE.LineBasicMaterial({
    color: 0xe8871e,
    transparent: true,
    opacity: 0.85,
  });
  const blueEdgeMat = new THREE.LineBasicMaterial({
    color: 0x7ea0be,
    transparent: true,
    opacity: 0.35,
  });

  // ---------- Beam builder ----------
  function makeBeam(length, isAccent) {
    const w = 0.16;
    const geo = new THREE.BoxGeometry(length, w, w);
    const mesh = new THREE.Mesh(geo, isAccent ? steelMatLight : steelMat);
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(
      edges,
      isAccent ? amberEdgeMat : blueEdgeMat
    );
    mesh.add(line);
    return mesh;
  }

  // ---------- Build an abstract skeletal tower / crane structure ----------
  const rig = new THREE.Group();
  scene.add(rig);

  const levels = 6;
  const spacing = 1.6;
  const size = 2.1;

  for (let i = 0; i < levels; i++) {
    const y = i * spacing - (levels * spacing) / 2 + 1;
    const isAccentLevel = i === 2 || i === 5;

    const corners = [
      [-size / 2, -size / 2],
      [size / 2, -size / 2],
      [size / 2, size / 2],
      [-size / 2, size / 2],
    ];

    // Vertical columns
    if (i < levels - 1) {
      corners.forEach(([x, z]) => {
        const col = makeBeam(spacing, false);
        col.rotation.z = Math.PI / 2;
        col.position.set(x, y + spacing / 2, z);
        rig.add(col);
      });
    }

    // Horizontal ring beams
    const ringGroup = new THREE.Group();
    const beamA = makeBeam(size, isAccentLevel);
    beamA.position.set(0, y, -size / 2);
    ringGroup.add(beamA);

    const beamB = makeBeam(size, isAccentLevel);
    beamB.position.set(0, y, size / 2);
    ringGroup.add(beamB);

    const beamC = makeBeam(size, isAccentLevel);
    beamC.rotation.y = Math.PI / 2;
    beamC.position.set(-size / 2, y, 0);
    ringGroup.add(beamC);

    const beamD = makeBeam(size, isAccentLevel);
    beamD.rotation.y = Math.PI / 2;
    beamD.position.set(size / 2, y, 0);
    ringGroup.add(beamD);

    // Diagonal cross-brace on accent levels
    if (isAccentLevel) {
      const diagLen = Math.sqrt(size * size + size * size);
      const diag1 = makeBeam(diagLen, true);
      diag1.rotation.y = Math.PI / 4;
      diag1.position.set(0, y, 0);
      ringGroup.add(diag1);
    }

    rig.add(ringGroup);
  }

  rig.scale.setScalar(0.92);
  rig.position.y = -0.6;

  // Animate-in: beams rise from below and fade opacity via scale
  rig.traverse((obj) => {
    if (obj.isMesh || obj.isLineSegments) {
      obj.userData.origScale = obj.scale.clone();
    }
  });

  // ---------- Ambient floating dust motes ----------
  const moteCount = 90;
  const moteGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  moteGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: 0xc9c5bc,
    size: 0.02,
    transparent: true,
    opacity: 0.35,
  });
  const motes = new THREE.Points(moteGeo, moteMat);
  scene.add(motes);

  // ---------- Welding-spark particle burst (near the amber light) ----------
  const sparkCount = 140;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkVel = [];
  const sparkOrigin = new THREE.Vector3(-3, 0.4, 4.2);
  for (let i = 0; i < sparkCount; i++) {
    sparkPos[i * 3] = sparkOrigin.x;
    sparkPos[i * 3 + 1] = sparkOrigin.y;
    sparkPos[i * 3 + 2] = sparkOrigin.z;
    sparkVel.push({
      x: (Math.random() - 0.5) * 0.03,
      y: Math.random() * 0.045 + 0.01,
      z: (Math.random() - 0.5) * 0.03,
      life: Math.random(),
    });
  }
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0xffb454,
    size: 0.035,
    transparent: true,
    opacity: 0.9,
  });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparks);

  function updateSparks() {
    const arr = sparks.geometry.attributes.position.array;
    for (let i = 0; i < sparkCount; i++) {
      const v = sparkVel[i];
      v.life -= 0.012;
      if (v.life <= 0) {
        arr[i * 3] = sparkOrigin.x;
        arr[i * 3 + 1] = sparkOrigin.y;
        arr[i * 3 + 2] = sparkOrigin.z;
        v.x = (Math.random() - 0.5) * 0.03;
        v.y = Math.random() * 0.045 + 0.01;
        v.z = (Math.random() - 0.5) * 0.03;
        v.life = 1;
      } else {
        arr[i * 3] += v.x;
        arr[i * 3 + 1] += v.y;
        arr[i * 3 + 2] += v.z;
        v.y -= 0.0009; // gravity
      }
    }
    sparks.geometry.attributes.position.needsUpdate = true;
  }

  // ---------- Mouse parallax ----------
  let targetRotY = 0;
  let targetRotX = 0;
  window.addEventListener("mousemove", (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = nx * 0.28;
    targetRotX = ny * 0.12;
  });

  // ---------- Resize ----------
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---------- Render loop ----------
  const clock = new THREE.Clock();
  let baseRotation = 0.5;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    baseRotation += 0.0016;
    rig.rotation.y += (baseRotation + targetRotY - rig.rotation.y) * 0.04;
    rig.rotation.x += (targetRotX - rig.rotation.x) * 0.04;
    rig.position.y = -0.6 + Math.sin(t * 0.35) * 0.12;

    motes.rotation.y = t * 0.02;

    amber.intensity = 16 + Math.sin(t * 1.4) * 3;
    sweep.position.x = Math.sin(t * 0.18) * 4;
    sweep.position.z = 6 + Math.cos(t * 0.18) * 2;

    // Gentle camera drift for a living, non-static frame
    camera.position.x = Math.sin(t * 0.08) * 0.6;
    camera.position.y = 1.4 + Math.sin(t * 0.12) * 0.25;
    camera.lookAt(0, 0.2, 0);

    updateSparks();

    renderer.render(scene, camera);
  }
  animate();

  // Fade canvas in once first frame is ready
  requestAnimationFrame(() => {
    canvas.classList.add("loaded");
  });
}
