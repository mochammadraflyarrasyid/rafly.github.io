import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, earth, rocket;
const loader = new THREE.TextureLoader();

// Setup dasar
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;

// Cahaya
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Bumi (bola)
const earthGeo = new THREE.SphereGeometry(1, 64, 64);
const earthMat = new THREE.MeshStandardMaterial({
  map: loader.load('https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg')
});
earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

// Background awal (langit biru)
scene.background = new THREE.Color(0x87ceeb);

// Load roket (sementara kotak aja)
const rocketGeo = new THREE.ConeGeometry(0.1, 0.4, 16);
const rocketMat = new THREE.MeshStandardMaterial({ color: 0xff5555 });
rocket = new THREE.Mesh(rocketGeo, rocketMat);
rocket.position.set(0, -1.2, 0);
scene.add(rocket);

// Animasi dasar
function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.002;
  renderer.render(scene, camera);
}
animate();

// Event Launch
document.getElementById('launchBtn').addEventListener('click', () => {
  const overlay = document.getElementById('overlay');
  gsap.to(overlay, { opacity: 0, duration: 2 });

  gsap.to(rocket.position, { y: 5, duration: 4, ease: "power2.in" });
  gsap.to(camera.position, { y: 3, z: 7, duration: 4, ease: "power2.out" });

  // Transisi ke luar angkasa
  setTimeout(() => {
    scene.background = new THREE.Color(0x000011);
    earth.material.map = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
  }, 4000);

  // Teks welcome
  setTimeout(() => {
    const msg = document.createElement('div');
    msg.innerHTML = `
      <h1 style='margin-top:40vh;font-size:3rem;'>🌌 Welcome to My World 🌌<br>
      <span style='font-size:1.5rem;'>Mochammad Rafly Arrasyid</span><br><br>
      <a href='https://www.instagram.com/raflyarrsyd' target='_blank' style='color:#f9d423;margin-right:10px;'>Instagram</a>
      <a href='https://wa.me/62895360109865' target='_blank' style='color:#25d366;'>WhatsApp</a><br><br>
      <button onclick="window.location.href='#portfolio'" style='padding:10px 30px;border:none;border-radius:20px;background:#fff;color:#000;font-weight:bold;cursor:pointer;'>Explore My World</button></h1>`;
    msg.style.position = "absolute";
    msg.style.width = "100%";
    msg.style.top = "0";
    msg.style.left = "0";
    msg.style.textAlign = "center";
    msg.style.transition = "opacity 2s ease";
    document.body.appendChild(msg);
  }, 6000);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
