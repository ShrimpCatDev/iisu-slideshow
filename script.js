const SLIDE_DURATION = 10000; // 10 seconds visible
const container = document.getElementById('slideshow');

async function fetchImageList() {
  // Strict mode: only load images from images/images.json
  try {
    const resp = await fetch('images/images.json', {cache: 'no-store'});
    if (resp.ok) {
      const json = await resp.json();
      if (Array.isArray(json) && json.length) {
        // Normalize entries to include the images/ prefix when needed
        return json.map(p => p.startsWith('images/') ? p : 'images/' + p.replace(/^\/+/, ''));
      }
    }
  } catch (e) {
    // ignore and fall through to fallback
  }

  // Fallback hardcoded list if images/images.json is missing or invalid
  return [
    'images/442e4e9dadb747774033c7c9042fc662.jpg',
    'images/a45a96e85e4aaf7d9fb9747bcfa4ed26.jpg',
    'images/eec540bf4a4aeb455a4125e4bc0ddb95.jpg'
  ];
}

function createSlide(src) {
  const img = new Image();
  img.src = src; // preload

  const el = document.createElement('div');
  el.className = 'slide';
  el.style.backgroundImage = `url(${src})`;
  container.appendChild(el);
  return el;
}

async function init() {
  const imageFiles = await fetchImageList();
  if (!imageFiles || !imageFiles.length) return;

  const slides = imageFiles.map(createSlide);

  let current = 0;
  slides[current].classList.add('current');

  setInterval(() => {
    const next = (current + 1) % slides.length;
    // Add next first so it can fade in above the current, then remove the old
    slides[next].classList.add('current');
    // remove previous on next animation frame to ensure overlap
    requestAnimationFrame(() => {
      slides[current].classList.remove('current');
      current = next;
    });
  }, SLIDE_DURATION);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // re-trigger by re-adding class
      slides.forEach(s => s.classList.remove('current'));
      requestAnimationFrame(() => slides[current].classList.add('current'));
    }
  });
}

init();
