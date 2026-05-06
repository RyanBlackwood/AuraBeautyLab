import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs";

const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const startCameraBtn = document.getElementById("startCameraBtn");
const stopCameraBtn = document.getElementById("stopCameraBtn");
const emptyState = document.getElementById("emptyState");
const statusText = document.getElementById("statusText");
const handCount = document.getElementById("handCount");
const fpsText = document.getElementById("fpsText");
const lookName = document.getElementById("lookName");

let handLandmarker = null;
let running = false;
let lastVideoTime = -1;
let stream = null;
let lastFrameTime = performance.now();
let mirror = true;

const design = {
  color: "#111116",
  colorName: "Midnight Black",
  shape: "almond",
  length: 55,
  width: 100,
  finish: "gloss",
};

const FINGERS = [
  { name: "thumb", tip: 4, dip: 3, pip: 2, mcp: 1 },
  { name: "index", tip: 8, dip: 7, pip: 6, mcp: 5 },
  { name: "middle", tip: 12, dip: 11, pip: 10, mcp: 9 },
  { name: "ring", tip: 16, dip: 15, pip: 14, mcp: 13 },
  { name: "pinky", tip: 20, dip: 19, pip: 18, mcp: 17 },
];

async function initLandmarker() {
  if (handLandmarker) return;
  statusText.textContent = "Loading ML";
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });

  statusText.textContent = "Ready";
}

async function startCamera() {
  await initLandmarker();

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    video.srcObject = stream;
    await video.play();

    running = true;
    emptyState.style.display = "none";
    statusText.textContent = "Tracking";
    requestAnimationFrame(loop);
  } catch (error) {
    console.error(error);
    statusText.textContent = "Camera blocked";
    emptyState.innerHTML = `
      <h3>Camera access blocked</h3>
      <p>Run this on HTTPS, localhost, or GitHub Pages and allow camera access. iPhone Safari will not allow camera from a plain local file.</p>
    `;
  }
}

function stopCamera() {
  running = false;
  statusText.textContent = "Stopped";
  handCount.textContent = "0";
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  emptyState.style.display = "grid";
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function point(landmark) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: landmark.x * rect.width,
    y: landmark.y * rect.height,
    z: landmark.z || 0,
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleBetween(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16),
  };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawLandmarkDebug(landmarks) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.65)";
  landmarks.forEach(lm => {
    const p = point(lm);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function nailPath(centerX, centerY, width, length, shape) {
  const w = width / 2;
  const l = length / 2;

  ctx.beginPath();

  if (shape === "square") {
    roundRectPath(centerX - w, centerY - l, width, length, Math.min(10, w * 0.35));
  } else if (shape === "coffin") {
    ctx.moveTo(centerX - w * 0.72, centerY - l);
    ctx.lineTo(centerX + w * 0.72, centerY - l);
    ctx.lineTo(centerX + w, centerY + l * 0.74);
    ctx.quadraticCurveTo(centerX, centerY + l * 1.05, centerX - w, centerY + l * 0.74);
    ctx.closePath();
  } else if (shape === "stiletto") {
    ctx.moveTo(centerX, centerY - l * 1.18);
    ctx.quadraticCurveTo(centerX + w, centerY + l * 0.15, centerX + w * 0.72, centerY + l);
    ctx.quadraticCurveTo(centerX, centerY + l * 1.08, centerX - w * 0.72, centerY + l);
    ctx.quadraticCurveTo(centerX - w, centerY + l * 0.15, centerX, centerY - l * 1.18);
    ctx.closePath();
  } else {
    ctx.moveTo(centerX, centerY - l);
    ctx.bezierCurveTo(centerX + w, centerY - l * 0.9, centerX + w, centerY + l * 0.72, centerX, centerY + l);
    ctx.bezierCurveTo(centerX - w, centerY + l * 0.72, centerX - w, centerY - l * 0.9, centerX, centerY - l);
    ctx.closePath();
  }
}

function roundRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawNail(landmarks, finger) {
  const tip = point(landmarks[finger.tip]);
  const dip = point(landmarks[finger.dip]);
  const pip = point(landmarks[finger.pip]);
  const mcp = point(landmarks[finger.mcp]);

  const fingerAngle = angleBetween(pip, tip) + Math.PI / 2;
  const segment = distance(dip, tip);
  const baseWidth = clamp(distance(pip, mcp) * 0.42, 14, 38);
  const width = baseWidth * (design.width / 100);
  const length = clamp(segment * (0.85 + design.length / 100), 24, 82);

  // Place nail slightly back from fingertip toward DIP.
  const centerX = tip.x + (dip.x - tip.x) * 0.34;
  const centerY = tip.y + (dip.y - tip.y) * 0.34;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(fingerAngle);

  // Shadow/anchoring
  nailPath(0, 0, width + 4, length + 4, design.shape);
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.fill();

  // Base material
  nailPath(0, 0, width, length, design.shape);
  const grad = ctx.createLinearGradient(-width / 2, -length / 2, width / 2, length / 2);

  if (design.finish === "chrome") {
    grad.addColorStop(0, "rgba(255,255,255,.92)");
    grad.addColorStop(0.28, rgba(design.color, .96));
    grad.addColorStop(0.55, "rgba(255,255,255,.72)");
    grad.addColorStop(1, rgba(design.color, .96));
  } else if (design.finish === "jelly") {
    grad.addColorStop(0, rgba(design.color, .58));
    grad.addColorStop(1, rgba(design.color, .82));
  } else {
    grad.addColorStop(0, rgba(design.color, .96));
    grad.addColorStop(1, rgba(design.color, .82));
  }

  ctx.fillStyle = grad;
  ctx.fill();

  // Edge
  ctx.strokeStyle = "rgba(255,255,255,.48)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // French tip
  if (design.finish === "french") {
    ctx.save();
    nailPath(0, 0, width, length, design.shape);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.beginPath();
    ctx.ellipse(0, -length * 0.36, width * 0.48, length * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Gloss highlight
  ctx.save();
  nailPath(0, 0, width, length, design.shape);
  ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,.38)";
  roundRectPath(-width * 0.22, -length * 0.34, width * 0.12, length * 0.55, 6);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.beginPath();
  ctx.ellipse(width * 0.2, -length * 0.26, width * 0.13, length * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawFrame(results) {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const hands = results.landmarks || [];
  handCount.textContent = hands.length;

  for (const landmarks of hands) {
    for (const finger of FINGERS) {
      drawNail(landmarks, finger);
    }
    drawLandmarkDebug(landmarks);
  }
}

async function loop() {
  if (!running) return;

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const results = handLandmarker.detectForVideo(video, performance.now());
    drawFrame(results);

    const now = performance.now();
    const fps = Math.round(1000 / Math.max(1, now - lastFrameTime));
    fpsText.textContent = String(fps);
    lastFrameTime = now;
  }

  requestAnimationFrame(loop);
}

function setActive(group, target) {
  group.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
  target.classList.add("active");
}

function updateLookName() {
  const shapeName = design.shape.charAt(0).toUpperCase() + design.shape.slice(1);
  lookName.textContent = `${design.colorName} ${shapeName}`;
}

document.getElementById("colorGrid").addEventListener("click", event => {
  const btn = event.target.closest("button");
  if (!btn) return;
  design.color = btn.dataset.color;
  design.colorName = btn.dataset.name;
  setActive(document.getElementById("colorGrid"), btn);
  updateLookName();
});

document.getElementById("shapeGrid").addEventListener("click", event => {
  const btn = event.target.closest("button");
  if (!btn) return;
  design.shape = btn.dataset.shape;
  setActive(document.getElementById("shapeGrid"), btn);
  updateLookName();
});

document.getElementById("finishGrid").addEventListener("click", event => {
  const btn = event.target.closest("button");
  if (!btn) return;
  design.finish = btn.dataset.finish;
  setActive(document.getElementById("finishGrid"), btn);
});

document.getElementById("lengthSlider").addEventListener("input", event => {
  design.length = Number(event.target.value);
  document.getElementById("lengthValue").textContent = `${design.length}%`;
});

document.getElementById("widthSlider").addEventListener("input", event => {
  design.width = Number(event.target.value);
  document.getElementById("widthValue").textContent = `${design.width}%`;
});

document.getElementById("mirrorBtn").addEventListener("click", event => {
  mirror = !mirror;
  video.classList.toggle("mirror", mirror);
  canvas.classList.toggle("mirror", mirror);
  event.currentTarget.classList.toggle("active", mirror);
});

document.getElementById("saveLookBtn").addEventListener("click", () => {
  const saved = JSON.parse(localStorage.getItem("aura-v3-saved") || "[]");
  saved.unshift({ ...design, created: new Date().toISOString() });
  localStorage.setItem("aura-v3-saved", JSON.stringify(saved.slice(0, 12)));
  renderSaved();
});

function renderSaved() {
  const saved = JSON.parse(localStorage.getItem("aura-v3-saved") || "[]");
  const box = document.getElementById("savedLooks");

  if (!saved.length) {
    box.innerHTML = `<div class="saved-item"><strong>No saved looks yet</strong><span>Save your first AR design.</span></div>`;
    return;
  }

  box.innerHTML = saved.map((item, index) => `
    <button class="saved-item" data-index="${index}">
      <strong>${item.colorName} ${item.shape}</strong>
      <span>${item.finish} · length ${item.length}% · width ${item.width}%</span>
    </button>
  `).join("");

  box.querySelectorAll(".saved-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = saved[Number(btn.dataset.index)];
      Object.assign(design, item);
      document.getElementById("lengthSlider").value = design.length;
      document.getElementById("widthSlider").value = design.width;
      document.getElementById("lengthValue").textContent = `${design.length}%`;
      document.getElementById("widthValue").textContent = `${design.width}%`;
      updateLookName();
    });
  });
}

document.getElementById("bookBtn").addEventListener("click", () => {
  document.getElementById("bookingSummary").textContent =
    `${design.colorName}, ${design.shape}, ${design.finish} finish, ${design.length}% length.`;
  document.getElementById("bookingModal").classList.add("open");
});

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("bookingModal").classList.remove("open");
});

startCameraBtn.addEventListener("click", startCamera);
stopCameraBtn.addEventListener("click", stopCamera);
window.addEventListener("resize", resizeCanvas);

video.classList.add("mirror");
canvas.classList.add("mirror");
renderSaved();
resizeCanvas();
