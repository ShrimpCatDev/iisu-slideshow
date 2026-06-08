const SLIDE_DURATION = 10000; // 10 seconds visible
const container = document.getElementById('slideshow');

async function fetchImageList() {
  // Try images/images.json first
  try {
    const resp = await fetch('images/images.json', {cache: 'no-store'});
    if (resp.ok) return resp.json();
  } catch (e) {
    // ignore
  }

  // Fallback: fetch directory listing and parse anchors (works with python -m http.server)
  try {
    const resp = await fetch('images/');
    if (!resp.ok) throw new Error('no listing');
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const anchors = Array.from(doc.querySelectorAll('a'));
    const exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const files = anchors
      .map(a => a.getAttribute('href'))
      .filter(h => h && exts.some(ext => h.toLowerCase().endsWith(ext)))
      .map(h => 'images/' + h.replace(/^\/+/, ''));
    if (files.length) return files;
  } catch (e) {
    // ignore
  }

  // Last resort: hardcoded list (keeps previous behavior)
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
