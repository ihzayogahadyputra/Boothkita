// ========== STATE ==========
const state = {
  stream: null,
  facingMode: 'user',
  mirror: true,
  grid: false,
  countdown: 3,
  mode: 'single', // single | multi2 | multi3
  ratio: '3/4',
  frame: null,
  bg: null,
  filter: 'normal',
  stickers: [],
  capturedPhotos: [],
  multiTotal: 0,
  isCapturing: false,
  panelOpen: false,
  focusMode: false,
  currentTab: 'frame',
};

// ========== FRAMES DATA ==========
const FRAMES = [
  { id: 'none', label: 'None', draw: null },
  { id: 'classic', label: 'Classic', color: '#fff', accent: '#111', draw: drawFrameClassic },
  { id: 'retro', label: 'Retro', color: '#ffd93d', accent: '#ff6b6b', draw: drawFrameRetro },
  { id: 'minimal', label: 'Minimal', color: '#e8e8e8', accent: '#333', draw: drawFrameMinimal },
  { id: 'party', label: 'Party', color: '#ff6b6b', accent: '#ffd93d', draw: drawFrameParty },
  { id: 'polaroid', label: 'Polaroid', color: '#f9f6f0', accent: '#aaa', draw: drawFramePolaroid },
  { id: 'floral', label: 'Floral', color: '#ffb3c1', accent: '#ff4d6d', draw: drawFrameFloral },
  { id: 'neon', label: 'Neon', color: '#00f5d4', accent: '#7b2ff7', draw: drawFrameNeon },
  { id: 'wedding', label: 'Wedding', color: '#f5f0e8', accent: '#c9a96e', draw: drawFrameWedding },
  { id: 'corp', label: 'Corporate', color: '#1a1a2e', accent: '#4d96ff', draw: drawFrameCorp },
];

const BGS = [
  { id: 'none', label: 'None', css: 'transparent' },
  { id: 'pastel1', label: 'Rose', css: 'linear-gradient(135deg,#fce4ec,#f8bbd0)' },
  { id: 'pastel2', label: 'Sky', css: 'linear-gradient(135deg,#e3f2fd,#bbdefb)' },
  { id: 'pastel3', label: 'Mint', css: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' },
  { id: 'pastel4', label: 'Lemon', css: 'linear-gradient(135deg,#fffde7,#fff9c4)' },
  { id: 'grad1', label: 'Sunset', css: 'linear-gradient(135deg,#ff9a9e,#fecfef,#fecfef)' },
  { id: 'grad2', label: 'Ocean', css: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { id: 'grad3', label: 'Forest', css: 'linear-gradient(135deg,#d4fc79,#96e6a1)' },
  { id: 'grad4', label: 'Fire', css: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'dark1', label: 'Night', css: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
  { id: 'dark2', label: 'Galaxy', css: 'radial-gradient(ellipse at top,#1a1a2e,#16213e,#0f3460)' },
  { id: 'dots', label: 'Dots', css: 'radial-gradient(circle,#ddd 1px,transparent 1px)', size: '20px 20px', color: '#f5f5f5' },
];

const PROPS = [
  { id: 'glasses', emoji: '🕶️', label: 'Sunglasses' },
  { id: 'mustache', emoji: '👨', label: 'Kumis' },
  { id: 'crown', emoji: '👑', label: 'Mahkota' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'confetti', emoji: '🎊', label: 'Confetti' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'alien', emoji: '👽', label: 'Alien' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'party', emoji: '🎉', label: 'Party' },
  { id: 'sparkle', emoji: '✨', label: 'Sparkle' },
  { id: 'cake', emoji: '🎂', label: 'Cake' },
  { id: 'mic', emoji: '🎤', label: 'Mic' },
  { id: 'balloon', emoji: '🎈', label: 'Balon' },
  { id: 'kiss', emoji: '💋', label: 'Kiss' },
];

// ========== DOM ==========
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frameOverlay = document.getElementById('frameOverlay');
const bgOverlay = document.getElementById('bgOverlay');
const stickersLayer = document.getElementById('stickersLayer');
const countNum = document.getElementById('countNum');
const modeTag = document.getElementById('modeTag');
const mirrorTag = document.getElementById('mirrorTag');
const photoStrip = document.getElementById('photoStrip');
const shutterBtn = document.getElementById('shutterBtn');
const previewModal = document.getElementById('previewModal');
const previewImg = document.getElementById('previewImg');
const previewCollage = document.getElementById('previewCollage');
const toast = document.getElementById('toast');
const noCamMsg = document.getElementById('noCamMsg');
const cameraWrap = document.getElementById('cameraWrap');
const bottomPanel = document.getElementById('bottomPanel');
const panelTabs = document.getElementById('panelTabs');

// ========== INIT ==========
async function startCamera() {
  try {
    if (state.stream) { state.stream.getTracks().forEach(t => t.stop()); }
    const constraints = {
      video: {
        facingMode: state.facingMode,
        width: { ideal: 1280 },
        height: { ideal: 960 }
      }
    };
    state.stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = state.stream;
    video.style.display = 'block';
    noCamMsg.style.display = 'none';
    applyMirror();
  } catch(e) {
    console.warn('Camera error:', e);
    video.style.display = 'none';
    noCamMsg.style.display = 'flex';
  }
}

function applyMirror() {
  video.style.transform = state.mirror ? 'scaleX(-1)' : 'scaleX(1)';
  mirrorTag.textContent = state.mirror ? '🔄 MIRROR' : '◻ NORMAL';
  mirrorTag.style.color = state.mirror ? 'var(--accent2)' : 'var(--text-dim)';
}

// ========== FRAME DRAWING ==========
function drawFrameClassic(c, ctx, w, h) {
  const t = Math.min(w, h) * 0.04;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = t;
  ctx.strokeRect(t/2, t/2, w-t, h-t);
}
function drawFrameRetro(c, ctx, w, h) {
  const t = Math.min(w, h) * 0.06;
  ctx.fillStyle = '#ffd93d';
  ctx.fillRect(0,0,w,t);
  ctx.fillRect(0,h-t,w,t);
  ctx.fillRect(0,0,t,h);
  ctx.fillRect(w-t,0,t,h);
  ctx.fillStyle = '#ff6b6b';
  const t2 = t*0.3;
  ctx.fillRect(t+t2,t+t2,w-2*t-2*t2,t2);
  ctx.fillRect(t+t2,h-t-2*t2,w-2*t-2*t2,t2);
}
function drawFrameMinimal(c, ctx, w, h) {
  const t = Math.min(w, h) * 0.025;
  const corner = Math.min(w, h) * 0.08;
  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = t;
  // corners only
  ctx.beginPath();
  ctx.moveTo(corner, t/2); ctx.lineTo(t/2, t/2); ctx.lineTo(t/2, corner);
  ctx.moveTo(w-corner, t/2); ctx.lineTo(w-t/2, t/2); ctx.lineTo(w-t/2, corner);
  ctx.moveTo(t/2, h-corner); ctx.lineTo(t/2, h-t/2); ctx.lineTo(corner, h-t/2);
  ctx.moveTo(w-t/2, h-corner); ctx.lineTo(w-t/2, h-t/2); ctx.lineTo(w-corner, h-t/2);
  ctx.stroke();
}
function drawFrameParty(c, ctx, w, h) {
  const t = Math.min(w,h)*0.05;
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff'];
  const segW = w / colors.length;
  colors.forEach((col,i) => {
    ctx.fillStyle = col;
    ctx.fillRect(i*segW, 0, segW+1, t);
    ctx.fillRect(i*segW, h-t, segW+1, t);
  });
  ctx.fillStyle = colors[0]; ctx.fillRect(0,0,t,h);
  ctx.fillStyle = colors[2]; ctx.fillRect(w-t,0,t,h);
  // confetti dots
  for(let i=0;i<30;i++) {
    ctx.fillStyle = colors[i%colors.length];
    ctx.beginPath();
    ctx.arc(Math.random()*w, Math.random()*h, 3, 0, Math.PI*2);
    ctx.fill();
  }
}
function drawFramePolaroid(c, ctx, w, h) {
  const p = Math.min(w,h)*0.05;
  const bottom = Math.min(w,h)*0.15;
  ctx.fillStyle = '#f9f6f0';
  ctx.fillRect(0,0,w,p); // top
  ctx.fillRect(0,0,p,h); // left
  ctx.fillRect(w-p,0,p,h); // right
  ctx.fillRect(0,h-bottom,w,bottom); // bottom big
  ctx.fillStyle = '#aaa';
  ctx.font = `${Math.round(bottom*0.25)}px 'Space Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('SNAPLY●', w/2, h - bottom*0.35);
}
function drawFrameFloral(c, ctx, w, h) {
  const t = Math.min(w,h)*0.06;
  ctx.fillStyle = '#ffb3c1';
  ctx.fillRect(0,0,w,t);
  ctx.fillRect(0,h-t,w,t);
  ctx.fillRect(0,0,t,h);
  ctx.fillRect(w-t,0,t,h);
  const flowers = ['🌸','🌺','🌼','💐'];
  ctx.font = `${Math.round(t*1.2)}px serif`;
  ctx.textAlign = 'center';
  const count = 6;
  for(let i=0;i<count;i++) {
    const x = (w/(count-1))*i;
    ctx.fillText(flowers[i%flowers.length], x, t*0.9);
    ctx.fillText(flowers[(i+2)%flowers.length], x, h-t*0.1);
  }
}
function drawFrameNeon(c, ctx, w, h) {
  const t = Math.min(w,h)*0.04;
  ctx.shadowColor = '#00f5d4';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = '#00f5d4';
  ctx.lineWidth = t;
  ctx.strokeRect(t/2, t/2, w-t, h-t);
  ctx.shadowColor = '#7b2ff7';
  ctx.strokeStyle = '#7b2ff7';
  ctx.lineWidth = t*0.5;
  ctx.strokeRect(t*1.5, t*1.5, w-t*3, h-t*3);
  ctx.shadowBlur = 0;
}
function drawFrameWedding(c, ctx, w, h) {
  const t = Math.min(w,h)*0.06;
  const grad = ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0, '#c9a96e');
  grad.addColorStop(0.5, '#f5e6c8');
  grad.addColorStop(1, '#c9a96e');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,t);
  ctx.fillRect(0,h-t,w,t);
  ctx.fillRect(0,0,t,h);
  ctx.fillRect(w-t,0,t,h);
  ctx.font = `${Math.round(t*0.6)}px serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c9a96e';
  ctx.fillText('❤ ❤ ❤', w/2, h-t*0.35);
}
function drawFrameCorp(c, ctx, w, h) {
  const t = Math.min(w,h)*0.04;
  const bott = Math.min(w,h)*0.1;
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0,0,w,t);
  ctx.fillRect(0,h-bott,w,bott);
  ctx.fillStyle = '#4d96ff';
  ctx.fillRect(0,t,t,h-t-bott);
  ctx.fillRect(w-t,t,t,h-t-bott);
  ctx.font = `bold ${Math.round(bott*0.35)}px 'Space Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4d96ff';
  ctx.fillText('COMPANY EVENT', w/2, h-bott*0.3);
}

function renderFrameThumbnail(frame) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 84;
  const cx = c.getContext('2d');
  cx.fillStyle = '#222';
  cx.fillRect(0,0,64,84);
  if(frame.draw) frame.draw(c, cx, 64, 84);
  return c;
}

function renderBgItem(bg) {
  const d = document.createElement('div');
  d.className = 'bg-item';
  d.dataset.id = bg.id;
  if(bg.id === 'dots') {
    d.style.backgroundColor = bg.color || '#f5f5f5';
    d.style.backgroundImage = bg.css;
    d.style.backgroundSize = bg.size;
  } else {
    d.style.background = bg.css;
  }
  d.innerHTML = `<div class="bg-check">✓</div>`;
  return d;
}

// ========== BUILD PANELS ==========
function buildFrameList() {
  const list = document.getElementById('frameList');
  list.innerHTML = '';
  FRAMES.forEach(f => {
    const item = document.createElement('div');
    item.className = 'frame-item' + (f.id === (state.frame || 'none') ? ' selected' : '');
    item.dataset.id = f.id;
    if(f.id === 'none') {
      item.innerHTML = `<div style="color:var(--text-dim);font-size:20px">⊘</div><div style="font-size:9px;margin-top:4px;color:var(--text-dim)">None</div>`;
    } else {
      const thumb = renderFrameThumbnail(f);
      item.appendChild(thumb);
    }
    item.addEventListener('click', () => selectFrame(f.id));
    list.appendChild(item);
  });
}

function buildBgList() {
  const list = document.getElementById('bgList');
  list.innerHTML = '';
  BGS.forEach(bg => {
    const item = renderBgItem(bg);
    if(bg.id === (state.bg || 'none')) item.classList.add('selected');
    item.addEventListener('click', () => selectBg(bg.id));
    list.appendChild(item);
  });
}

function buildPropsList() {
  const list = document.getElementById('propsList');
  list.innerHTML = '';
  PROPS.forEach(p => {
    const item = document.createElement('div');
    item.style.cssText = 'flex-shrink:0;width:56px;text-align:center;cursor:pointer;transition:transform .2s;';
    item.innerHTML = `<div style="font-size:36px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${p.emoji}</div><div style="font-size:9px;color:var(--text-dim);margin-top:3px">${p.label}</div>`;
    item.addEventListener('click', () => addSticker(p.emoji));
    item.addEventListener('mouseenter', () => item.style.transform = 'scale(1.15)');
    item.addEventListener('mouseleave', () => item.style.transform = 'scale(1)');
    list.appendChild(item);
  });
}

function selectFrame(id) {
  state.frame = id === 'none' ? null : id;
  document.querySelectorAll('.frame-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  applyFrameOverlay();
}

function selectBg(id) {
  state.bg = id === 'none' ? null : id;
  document.querySelectorAll('.bg-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  applyBgOverlay();
}

function applyFrameOverlay() {
  if(!state.frame) { frameOverlay.innerHTML = ''; return; }
  const frame = FRAMES.find(f => f.id === state.frame);
  if(!frame || !frame.draw) { frameOverlay.innerHTML = ''; return; }
  const c = document.createElement('canvas');
  const rect = cameraWrap.getBoundingClientRect();
  c.width = rect.width * devicePixelRatio;
  c.height = rect.height * devicePixelRatio;
  c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  const cx = c.getContext('2d');
  cx.scale(devicePixelRatio, devicePixelRatio);
  frame.draw(c, cx, rect.width, rect.height);
  frameOverlay.innerHTML = '';
  frameOverlay.appendChild(c);
}

function applyBgOverlay() {
  if(!state.bg) { bgOverlay.style.background = 'transparent'; return; }
  const bg = BGS.find(b => b.id === state.bg);
  if(!bg) return;
  if(bg.id === 'dots') {
    bgOverlay.style.backgroundColor = bg.color || '#f5f5f5';
    bgOverlay.style.backgroundImage = bg.css;
    bgOverlay.style.backgroundSize = bg.size;
  } else {
    bgOverlay.style.backgroundImage = '';
    bgOverlay.style.backgroundSize = '';
    bgOverlay.style.background = bg.css;
  }
}

// ========== STICKERS ==========
function addSticker(emoji) {
  const el = document.createElement('div');
  el.className = 'sticker';
  el.textContent = emoji;
  const x = 20 + Math.random() * 50;
  const y = 20 + Math.random() * 50;
  el.style.left = x + '%';
  el.style.top = y + '%';
  let isDragging = false, startX, startY, origX, origY;

  const onStart = (e) => {
    isDragging = true;
    const ev = e.touches ? e.touches[0] : e;
    startX = ev.clientX; startY = ev.clientY;
    const rect = stickersLayer.getBoundingClientRect();
    origX = (parseFloat(el.style.left) / 100) * rect.width;
    origY = (parseFloat(el.style.top) / 100) * rect.height;
    e.preventDefault();
  };
  const onMove = (e) => {
    if(!isDragging) return;
    const ev = e.touches ? e.touches[0] : e;
    const rect = stickersLayer.getBoundingClientRect();
    const nx = origX + (ev.clientX - startX);
    const ny = origY + (ev.clientY - startY);
    el.style.left = Math.max(0, Math.min(rect.width-30, nx)) / rect.width * 100 + '%';
    el.style.top = Math.max(0, Math.min(rect.height-30, ny)) / rect.height * 100 + '%';
    e.preventDefault();
  };
  const onEnd = () => { isDragging = false; };
  el.addEventListener('mousedown', onStart);
  el.addEventListener('touchstart', onStart, {passive:false});
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, {passive:false});
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
  el.addEventListener('dblclick', () => el.remove());

  stickersLayer.appendChild(el);
  showToast('Tap 2x untuk hapus sticker');
}

// ========== CAPTURE ==========
async function capture() {
  if(state.isCapturing) return;
  if(state.mode === 'single') {
    await runCountdown();
    takePhoto();
    showPreview();
  } else {
    const total = state.mode === 'multi2' ? 2 : 3;
    state.capturedPhotos = [];
    state.multiTotal = total;
    photoStrip.style.display = 'flex';
    updateStrip();
    for(let i=0;i<total;i++) {
      await runCountdown();
      const dataUrl = takePhoto(false);
      state.capturedPhotos.push(dataUrl);
      updateStrip();
      if(i < total-1) await sleep(600);
    }
    photoStrip.style.display = 'none';
    showCollagePreview();
  }
}

function updateStrip() {
  photoStrip.innerHTML = '';
  const total = state.multiTotal;
  for(let i=0;i<total;i++) {
    const div = document.createElement('div');
    div.className = 'strip-thumb' + (i === state.capturedPhotos.length ? ' active' : '');
    if(state.capturedPhotos[i]) {
      div.innerHTML = `<img src="${state.capturedPhotos[i]}">`;
    } else {
      div.className += ' empty';
      div.textContent = i+1;
    }
    photoStrip.appendChild(div);
  }
}

async function runCountdown() {
  state.isCapturing = true;
  shutterBtn.classList.add('recording');
  const secs = state.countdown;
  if(secs === 0) { await sleep(100); state.isCapturing = false; shutterBtn.classList.remove('recording'); return; }
  for(let i=secs;i>=1;i--) {
    countNum.textContent = i;
    countNum.className = 'count-num show';
    await sleep(600);
    countNum.className = 'count-num hide';
    await sleep(350);
  }
  state.isCapturing = false;
  shutterBtn.classList.remove('recording');
}

function takePhoto(showPrev=true) {
  const wrap = cameraWrap;
  const vw = video.videoWidth || 640;
  const vh = video.videoHeight || 480;
  canvas.width = vw;
  canvas.height = vh;
  // BG
  if(state.bg) {
    const bg = BGS.find(b => b.id === state.bg);
    if(bg && bg.id !== 'none') {
      if(bg.id === 'dots') {
        ctx.fillStyle = bg.color;
        ctx.fillRect(0,0,vw,vh);
      } else {
        const grad = parseGradient(ctx, bg.css, vw, vh);
        if(grad) { ctx.fillStyle = grad; ctx.fillRect(0,0,vw,vh); }
        else { ctx.fillStyle = bg.css; ctx.fillRect(0,0,vw,vh); }
      }
    }
  }
  // VIDEO
  if(state.mirror) {
    ctx.save(); ctx.translate(vw,0); ctx.scale(-1,1);
    ctx.drawImage(video,0,0,vw,vh);
    ctx.restore();
  } else {
    ctx.drawImage(video,0,0,vw,vh);
  }
  // STICKERS
  const stickers = stickersLayer.querySelectorAll('.sticker');
  const layerRect = stickersLayer.getBoundingClientRect();
  stickers.forEach(st => {
    const sx = (parseFloat(st.style.left)/100) * vw;
    const sy = (parseFloat(st.style.top)/100) * vh;
    ctx.font = `${Math.round(vw * 0.07)}px serif`;
    ctx.fillText(st.textContent, sx, sy + vw*0.07);
  });
  // FRAME
  if(state.frame) {
    const frame = FRAMES.find(f => f.id === state.frame);
    if(frame && frame.draw) {
      const fc = document.createElement('canvas');
      fc.width = vw; fc.height = vh;
      const fcx = fc.getContext('2d');
      frame.draw(fc, fcx, vw, vh);
      ctx.drawImage(fc, 0, 0);
    }
  }
  // Flash
  flashEffect();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  return dataUrl;
}

function parseGradient(ctx, css, w, h) {
  try {
    if(css.startsWith('linear-gradient')) {
      const m = css.match(/linear-gradient\((\d+)deg,(.*)\)/);
      const angle = m ? parseInt(m[1]) : 135;
      const rad = (angle - 90) * Math.PI / 180;
      const x1 = w/2 + Math.cos(rad) * w/2;
      const y1 = h/2 + Math.sin(rad) * h/2;
      const x2 = w - x1; const y2 = h - y1;
      const g = ctx.createLinearGradient(0,0,w,h);
      const stops = css.match(/#[a-f0-9]{6}|rgba?\([^)]+\)/gi);
      if(stops) stops.forEach((c,i) => g.addColorStop(i/(stops.length-1), c));
      return g;
    }
    if(css.startsWith('radial-gradient')) {
      const g = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w);
      const stops = css.match(/#[a-f0-9]{6}|rgba?\([^)]+\)/gi);
      if(stops) stops.forEach((c,i) => g.addColorStop(i/(stops.length-1), c));
      return g;
    }
  } catch(e) {}
  return null;
}

function flashEffect() {
  const f = document.getElementById('flashEl');
  f.style.opacity = '1';
  setTimeout(() => { f.style.opacity = '0'; }, 80);
}

function showPreview() {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  previewImg.src = dataUrl;
  previewImg.style.display = 'block';
  previewCollage.style.display = 'none';
  previewModal.classList.add('show');
}

function showCollagePreview() {
  previewImg.style.display = 'none';
  previewCollage.style.display = 'flex';
  previewCollage.innerHTML = '';
  previewCollage.style.cssText = `width:100%;display:flex;flex-direction:column;gap:3px;border-radius:20px;overflow:hidden;border:1px solid var(--border);max-height:55dvh;`;
  state.capturedPhotos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'width:100%;flex:1;object-fit:cover;display:block;min-height:0;';
    previewCollage.appendChild(img);
  });
  previewModal.classList.add('show');
}

// ========== DOWNLOAD ==========
function downloadPhoto() {
  if(state.mode === 'single') {
    const link = document.createElement('a');
    link.href = previewImg.src;
    link.download = `snaply_${Date.now()}.jpg`;
    link.click();
    showToast('✓ Foto tersimpan!');
  } else {
    // Compose collage
    const photos = state.capturedPhotos;
    const w = 600, h = w * (4/3) * photos.length;
    const cc = document.createElement('canvas');
    cc.width = w; cc.height = h;
    const ccx = cc.getContext('2d');
    const promises = photos.map((src,i) => new Promise(res => {
      const img = new Image(); img.onload = () => {
        ccx.drawImage(img, 0, i * w*(4/3), w, w*(4/3));
        res();
      }; img.src = src;
    }));
    Promise.all(promises).then(() => {
      const link = document.createElement('a');
      link.href = cc.toDataURL('image/jpeg', 0.92);
      link.download = `snaply_strip_${Date.now()}.jpg`;
      link.click();
      showToast('✓ Strip tersimpan!');
    });
  }
}

// ========== PANEL ==========
function openPanel(tab) {
  if(state.panelOpen && state.currentTab === tab) {
    closePanel(); return;
  }
  state.panelOpen = true;
  state.currentTab = tab;
  panelTabs.style.display = 'flex';
  document.querySelectorAll('.panel-content').forEach(el => {
    el.style.display = 'none';
    el.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  const content = document.getElementById('tab-'+tab);
  if(content) { content.style.display = 'block'; content.classList.add('active'); }
  document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
  const map = { frame:'frameMenuBtn', bg:'bgMenuBtn', props:'propsMenuBtn', mode:'modeMenuBtn' };
  if(map[tab]) document.getElementById(map[tab]).classList.add('active');
}

function closePanel() {
  state.panelOpen = false;
  panelTabs.style.display = 'none';
  document.querySelectorAll('.panel-content').forEach(el => { el.style.display='none'; el.classList.remove('active'); });
  document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
}

// ========== TOAST ==========
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ========== EVENT LISTENERS ==========
shutterBtn.addEventListener('click', () => {
  if(!state.isCapturing) capture();
});

document.getElementById('mirrorBtn').addEventListener('click', () => {
  state.mirror = !state.mirror;
  applyMirror();
  document.getElementById('mirrorBtn').classList.toggle('active', state.mirror);
  showToast(state.mirror ? '↔ Mirror ON' : '◻ Mirror OFF');
});

document.getElementById('gridBtn').addEventListener('click', () => {
  state.grid = !state.grid;
  document.getElementById('gridLines').classList.toggle('show', state.grid);
  document.getElementById('gridBtn').classList.toggle('active', state.grid);
});

document.getElementById('switchCamBtn').addEventListener('click', () => {
  state.facingMode = state.facingMode === 'user' ? 'environment' : 'user';
  startCamera();
  showToast(state.facingMode === 'user' ? '📷 Kamera Depan' : '📷 Kamera Belakang');
});

document.getElementById('focusModeBtn').addEventListener('click', () => {
  state.focusMode = !state.focusMode;
  document.getElementById('quickControls').style.display = state.focusMode ? 'none' : 'flex';
  document.getElementById('bottomPanel').style.display = state.focusMode ? 'none' : 'block';
  document.getElementById('focusModeBtn').classList.toggle('active', state.focusMode);
  document.getElementById('mainControls').querySelectorAll('.side-btn').forEach(b => b.style.display = state.focusMode ? 'none' : '');
  showToast(state.focusMode ? '⊙ Focus Mode ON' : 'Focus Mode OFF');
});

document.getElementById('frameMenuBtn').addEventListener('click', () => openPanel('frame'));
document.getElementById('bgMenuBtn').addEventListener('click', () => openPanel('bg'));
document.getElementById('propsMenuBtn').addEventListener('click', () => openPanel('props'));
document.getElementById('modeMenuBtn').addEventListener('click', () => openPanel('mode'));

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => openPanel(btn.dataset.tab));
});

// Mode opts
document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.mode = btn.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const labels = { single:'SINGLE', multi2:'2x STRIP', multi3:'3x STRIP' };
    modeTag.textContent = labels[state.mode] || 'SINGLE';
    showToast('Mode: ' + labels[state.mode]);
  });
});

// Timer opts
document.querySelectorAll('[data-sec]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.countdown = parseInt(btn.dataset.sec);
    document.querySelectorAll('[data-sec]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showToast('Timer: ' + (state.countdown === 0 ? 'OFF' : state.countdown + 's'));
  });
});

// Ratio opts
document.querySelectorAll('[data-ratio]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.ratio = btn.dataset.ratio;
    document.querySelectorAll('[data-ratio]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('cameraWrap').style.aspectRatio = state.ratio;
    showToast('Rasio: ' + state.ratio.replace('/',':'));
    applyFrameOverlay();
  });
});

// Settings btn
document.getElementById('settingsBtn').addEventListener('click', () => {
  const name = prompt('Nama Event (kosongkan untuk default):', document.getElementById('eventLabel').textContent);
  if(name !== null) document.getElementById('eventLabel').textContent = name || 'Photobooth Studio';
});

// Preview modal
document.getElementById('retakeBtn').addEventListener('click', () => {
  previewModal.classList.remove('show');
  state.capturedPhotos = [];
});

document.getElementById('downloadBtn').addEventListener('click', downloadPhoto);

// Close panel on camera tap (outside panel)
cameraWrap.addEventListener('click', (e) => {
  if(state.panelOpen) closePanel();
});

// Resize → re-render frame overlay
window.addEventListener('resize', () => {
  if(state.frame) setTimeout(applyFrameOverlay, 100);
});

// ========== INIT ==========
buildFrameList();
buildBgList();
buildPropsList();
startCamera();

// Default mirror btn active
document.getElementById('mirrorBtn').classList.add('active');
