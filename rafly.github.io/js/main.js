import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.156.1/build/three.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Tambahkan lampu dan bola (Bumi)
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

const geometry = new THREE.SphereGeometry(2, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0x2266ff, roughness: 0.5, metalness: 0.3 });
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.003;
  renderer.render(scene, camera);
}
animate();

// Tombol Launch
document.getElementById("launch").addEventListener("click", () => {
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = `
    <h1>🌌 Welcome to My World</h1>
    <h3>Hi, I’m <span style="color:#7fffd4">Rafly Arrasyid</span></h3>
    <div>
      <a href="https://www.instagram.com/raflyarrsyd" target="_blank" style="color:#ff99ff; text-decoration:none;">Instagram</a> |
      <a href="https://wa.me/62895360109865" target="_blank" style="color:#00ff99; text-decoration:none;">WhatsApp</a>
    </div>
    <button id="explore">Explore My World 🌍</button>
  `;
});
