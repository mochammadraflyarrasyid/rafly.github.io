// main.js - procedural scene (no external textures or models)
// Three.js + GSAP timeline, stylized Earth / space / moon, simple AstroCat + rocket built from primitives

let scene, camera, renderer, clock;
let earth, moon, rocket, cat, stars;
let tl; // GSAP timeline
const canvas = document.getElementById('scene');

init();
animate();

function init(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 1000);
  camera.position.set(0, 3, 10);

  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x111122, 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 0.7);
  key.position.set(5,10,7);
  scene.add(key);

  // starfield (particles)
  createStars();

  // stylized earth and moon
  createEarth();
  createMoon();

  // rocket + cat (made with primitives)
  createRocket();
  createAstroCat();

  clock = new THREE.Clock();

  window.addEventListener('resize', onResize);

  // UI event
  document.getElementById('launchBtn').addEventListener('click', startSequence);
  document.getElementById('resetBtn').addEventListener('click', resetScene);
  document.getElementById('exploreBtn').addEventListener('click', showPortfolioLink);

  // small orbit controls for debugging (disabled on production)
  // const controls = new THREE.OrbitControls(camera, renderer.domElement);
  // controls.enabled = false;
}

// ---------- Create starfield ----------
function createStars(){
  const cnt = 1200;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(cnt * 3);
  const colors = new Float32Array(cnt * 3);
  for(let i=0;i<cnt;i++){
    const i3 = i*3;
    const r = 60;
    const phi = Math.acos(2*Math.random()-1);
    const theta = 2*Math.PI*Math.random();
    // distribute in sphere shell
    const rr = r * (0.6 + 0.4*Math.random());
    positions[i3] = Math.cos(theta)*Math.sin(phi)*rr;
    positions[i3+1] = Math.sin(theta)*Math.sin(phi)*rr;
    positions[i3+2] = Math.cos(phi)*rr;

    const c = 0.8 + Math.random()*0.4;
    colors[i3] = c; colors[i3+1] = c; colors[i3+2] = c;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions,3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors,3));
  const mat = new THREE.PointsMaterial({size:0.06, vertexColors:true, transparent:true, opacity:0.9});
  stars = new THREE.Points(geom, mat);
  scene.add(stars);
}

// ---------- Stylized Earth ----------
function createEarth(){
  const g = new THREE.SphereGeometry(2.2, 48, 48);
  // custom stylized material - blue with green patches done via second sphere child (simple abstraction)
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1764c6,
    roughness: 0.6,
    metalness: 0.05
  });
  earth = new THREE.Mesh(g, mat);
  earth.position.set(-6, -1.8, -8);
  earth.rotation.y = 0.7;
  scene.add(earth);

  // little "land patches" - simple low-poly blobs
  for(let i=0;i<10;i++){
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.28+Math.random()*0.2, 12,12), new THREE.MeshStandardMaterial({color:0x2da34a}));
    const a = Math.random()*Math.PI*2;
    const b = Math.random()*Math.PI;
    s.position.set(0,0,2.3);
    s.position.applyAxisAngle(new THREE.Vector3(0,1,0), a);
    s.position.applyAxisAngle(new THREE.Vector3(1,0,0), b-0.5);
    s.scale.setScalar(0.8 + Math.random()*0.6);
    earth.add(s);
  }

  // cloud layer (slightly bigger transparent sphere)
  const cloud = new THREE.Mesh(new THREE.SphereGeometry(2.24, 32,32), new THREE.MeshStandardMaterial({color:0xffffff, transparent:true, opacity:0.08}));
  earth.add(cloud);
}

// ---------- Stylized Moon ----------
function createMoon(){
  const g = new THREE.SphereGeometry(1.1, 32,32);
  const mat = new THREE.MeshStandardMaterial({color:0xbfc1c7, roughness:1});
  moon = new THREE.Mesh(g, mat);
  moon.position.set(12, 4, -30); // far away
  scene.add(moon);
  // add some craters
  for(let i=0;i<6;i++){
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.12+Math.random()*0.2, 8,8), new THREE.MeshStandardMaterial({color:0x9ea0a6}));
    c.position.set((Math.random()-0.5)*1.6, (Math.random()-0.5)*1.6, 1.05);
    c.position.applyAxisAngle(new THREE.Vector3(0,1,0), Math.random()*Math.PI*2);
    moon.add(c);
  }
}

// ---------- Rocket (primitive) ----------
function createRocket(){
  rocket = new THREE.Group();
  // body
  const bodyMat = new THREE.MeshStandardMaterial({color:0xffe39f, roughness:0.4});
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.6,2.6,20), bodyMat);
  body.rotation.z = Math.PI/2;
  body.position.set(0,0,0);
  rocket.add(body);

  // nose cone
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.46,0.8,20), new THREE.MeshStandardMaterial({color:0xff6b6b}));
  cone.position.set(1.6,0,0);
  cone.rotation.z = Math.PI/2;
  rocket.add(cone);

  // fins
  const finGeo = new THREE.BoxGeometry(0.02,0.6,0.8);
  const finMat = new THREE.MeshStandardMaterial({color:0xff6b6b});
  const f1 = new THREE.Mesh(finGeo,finMat); f1.position.set(-0.3,0.5,0.85); f1.rotation.z = 0.2; rocket.add(f1);
  const f2 = f1.clone(); f2.position.set(-0.3,-0.5,0.85); f2.rotation.z = -0.2; rocket.add(f2);

  rocket.position.set(-1.5, -1.6, -2.2);
  scene.add(rocket);

  // small flame (invisible until launch)
  const flameGeo = new THREE.ConeGeometry(0.26,0.8,12);
  const flameMat = new THREE.MeshStandardMaterial({color:0xff9f43, emissive:0xff6b1a, transparent:true, opacity:0.0});
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.set(-2.1,0,0);
  flame.rotation.z = Math.PI/2;
  rocket.add(flame);
  rocket.flame = flame;
}

// ---------- AstroCat (simple cute model from spheres) ----------
function createAstroCat(){
  cat = new THREE.Group();

  // body
  const bodyMat = new THREE.MeshStandardMaterial({color:0xffd1dc, roughness:0.6});
  const headMat = new THREE.MeshStandardMaterial({color:0xfff0f5, roughness:0.3});
  const suitMat = new THREE.MeshStandardMaterial({color:0x6dd3ff, roughness:0.4});
  const eyeMat = new THREE.MeshStandardMaterial({color:0x111111});

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24,24), suitMat); body.position.set(0,-0.12,0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24,24), headMat); head.position.set(0,0.38,0);
  // ears
  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.08,0.12,8), headMat); earL.position.set(-0.12,0.6,0); earL.rotation.z = 0.5;
  const earR = earL.clone(); earR.position.set(0.12,0.6,0); earR.rotation.z = -0.5;

  // helmet (transparent)
  const helmetMat = new THREE.MeshPhysicalMaterial({color:0x9fd3ff, metalness:0.1, roughness:0.1, transmission:0.7, transparent:true, opacity:0.8});
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32,32), helmetMat);
  helmet.position.copy(head.position);

  // eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8,8), eyeMat); eyeL.position.set(-0.09,0.42,0.23);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8,8), eyeMat); eyeR.position.set(0.09,0.42,0.23);
  // nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03,8,8), new THREE.MeshStandardMaterial({color:0xff6b6b})); nose.position.set(0,0.33,0.26);

  cat.add(body, head, earL, earR, helmet, eyeL, eyeR, nose);
  // initial position near rocket entrance
  cat.position.set(-0.6, -1.4, -2.1);
  cat.scale.setScalar(1.0);
  scene.add(cat);
}

// ---------- Sequence (Earth -> Launch -> Space -> Moon) ----------
function startSequence(){
  if(tl) tl.kill();
  // basic timeline
  tl = gsap.timeline();

  // 1) Small nods before launch (cat wiggle)
  tl.to(cat.rotation, {z: 0.15, duration: 0.25, yoyo:true, repeat:1, ease:"sine.inOut"});
  tl.to(cat.position, {y: "-=0.08", duration:0.18, yoyo:true, repeat:1, ease:"sine.inOut"});

  // 2) Cat moves into rocket (simulated)
  tl.to(cat.position, {x: -1.5, y: -1.2, z: -2.2, duration: 1.4, ease:"power2.inOut"}, "+=0.1");

  // 3) Rocket flame fade in + small shake then launch
  tl.to(rocket.flame.material, {opacity:1, duration:0.3}, "-=0.6");
  tl.to(rocket.position, {y: "+=0.1", duration:0.08, repeat:6, yoyo:true, ease:"rough"}, "-=0.3");

  // 4) launch: rocket accelerates, camera follows, earth rotates faster
  tl.to(rocket.position, {z: "-=12", y: "+=6", duration:3.2, ease:"power3.in"}, "+=0.05");
  tl.to(camera.position, {z: 30, y: 8, duration:3.2, ease:"power3.inOut"}, "<");
  tl.to(earth.rotation, {y: "+=6", duration:3.2, ease:"power2.inOut"}, "<");

  // 5) transition to deep space: boost star brightness + move stars slower
  tl.to(stars.material, {opacity:0.95, duration:0.8}, "-=0.8");
  // small "camera drift" in space
  tl.to(camera.position, {x:40, z: -10, y: 6, duration:3.0, ease:"power1.inOut"});

  // 6) rocket approaches moon
  tl.to(rocket.position, {x: 12, y: 4, z: -30, duration:3.2, ease:"power2.inOut"});
  tl.to(camera.position, {x:12, y: 6, z: -26, duration:3.2}, "<");

  // 7) slow down and show overlay content
  tl.to(rocket.position, {z: "-=2", duration:1}, "+=0.2");
  tl.call(()=> showSpaceOverlay(), null, "+=0.2");
}

function showSpaceOverlay(){
  document.getElementById('spaceOverlay').classList.remove('hidden');
}

// Reset scene to starting positions
function resetScene(){
  // kill timeline and reset transforms
  if(tl) tl.kill();
  document.getElementById('spaceOverlay').classList.add('hidden');

  // reset positions nicely with GSAP
  gsap.to(rocket.position, {x:-1.5, y:-1.6, z:-2.2, duration:1.0, ease:"power2.inOut"});
  gsap.to(cat.position, {x:-0.6, y:-1.4, z:-2.1, duration:1.0, ease:"power2.inOut"});
  gsap.to(camera.position, {x:0, y:3, z:10, duration:1.0, ease:"power2.inOut"});
  gsap.to(stars.material, {opacity:0.9, duration:1.0});
  gsap.to(earth.rotation, {y:0.7, duration:1.0});
}

// small function called by Explore button - for now, scroll to portfolio or open portfolio page
function showPortfolioLink(){
  // you can change this to navigate to portfolio.html
  window.location.href = "portfolio.html";
}

// ---------- render loop ----------
function animate(){
  requestAnimationFrame(animate);
  const t = clock ? clock.getElapsedTime() : 0;
  // gentle rotations / bobbing
  if(earth) earth.rotation.y += 0.003;
  if(moon) moon.rotation.y += 0.0012;
  if(rocket) rocket.rotation.y += Math.sin(Date.now()*0.0008)*0.0005;
  if(cat) cat.rotation.y = Math.sin(Date.now()*0.001)*0.02;

  // move stars slowly for parallax
  if(stars){
    stars.rotation.y += 0.0001;
  }
  renderer.render(scene, camera);
}

// adjust sizes
function onResize(){
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
