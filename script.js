const root = document.documentElement;
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const year = document.querySelector('#year');
const lengthSlider = document.querySelector('#lengthSlider');
const lookName = document.querySelector('#lookName');
const lookDetails = document.querySelector('#lookDetails');
const priceEstimate = document.querySelector('#priceEstimate');
const cameraButton = document.querySelector('#cameraButton');
const cameraStatus = document.querySelector('#cameraStatus');
const form = document.querySelector('#leadForm');
const formMessage = document.querySelector('#formMessage');

const state = {
  shape: 'Almond',
  finish: 'Chrome',
  colorName: 'Rose',
  color: '#f7b5d6',
  length: 'Medium'
};

const lengthLabels = ['Short', 'Medium', 'Long', 'XL'];

year.textContent = new Date().getFullYear();

navToggle.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

document.querySelectorAll('[data-control="shape"] .choice').forEach(button => {
  button.addEventListener('click', () => {
    activate(button);
    state.shape = button.textContent.trim();
    updateLook();
  });
});

document.querySelectorAll('[data-control="finish"] .choice').forEach(button => {
  button.addEventListener('click', () => {
    activate(button);
    state.finish = button.textContent.trim();
    updateLook();
  });
});

document.querySelectorAll('[data-control="color"] .swatch').forEach(button => {
  button.addEventListener('click', () => {
    activate(button);
    state.color = button.style.getPropertyValue('--swatch');
    state.colorName = button.getAttribute('aria-label');
    root.style.setProperty('--rose', state.color);
    updateLook();
  });
});

lengthSlider.addEventListener('input', () => {
  state.length = lengthLabels[Number(lengthSlider.value) - 1];
  updateLook();
});

function activate(button) {
  button.parentElement.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
}

function updateLook() {
  const price = 65 + Number(lengthSlider.value) * 10 + (state.finish === 'Chrome' || state.finish === 'Glitter' ? 10 : 0);
  lookName.textContent = `${state.colorName} ${state.finish} ${state.shape} Set`;
  lookDetails.textContent = `${state.length} length, ${state.finish.toLowerCase()} finish, ${state.colorName.toLowerCase()} aura, shimmer accent nail.`;
  priceEstimate.textContent = `Estimated $${price}+`;
}

cameraButton.addEventListener('click', async () => {
  cameraStatus.textContent = 'Requesting camera access...';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    cameraStatus.textContent = 'Camera access works. AR SDK can be connected here.';
  } catch (error) {
    cameraStatus.textContent = 'Camera blocked or unavailable. This is ready for HTTPS/private deployment testing.';
  }
});

document.querySelector('#saveLook').addEventListener('click', () => {
  const saved = JSON.parse(localStorage.getItem('auraSavedLooks') || '[]');
  saved.push({ ...state, savedAt: new Date().toISOString() });
  localStorage.setItem('auraSavedLooks', JSON.stringify(saved));
  alert('Look saved locally for this private build.');
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const leads = JSON.parse(localStorage.getItem('auraLeads') || '[]');
  leads.push({ ...data, createdAt: new Date().toISOString() });
  localStorage.setItem('auraLeads', JSON.stringify(leads));
  form.reset();
  formMessage.textContent = 'Saved locally. Connect this form to Supabase, Firebase, or your booking system before launch.';
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const canvas = document.querySelector('#auraCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  particles = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 18)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.4 + .6,
    vx: (Math.random() - .5) * .25,
    vy: (Math.random() - .5) * .25,
    a: Math.random() * .45 + .1
  }));
}

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < -10) p.x = window.innerWidth + 10;
    if (p.x > window.innerWidth + 10) p.x = -10;
    if (p.y < -10) p.y = window.innerHeight + 10;
    if (p.y > window.innerHeight + 10) p.y = -10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(247,181,214,${p.a})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
draw();
