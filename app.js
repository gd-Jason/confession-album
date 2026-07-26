const frames = [...document.querySelectorAll('.memory-frame')];
const stack = document.querySelector('#frameStack');
const album = document.querySelector('#album');
const cover = document.querySelector('#cover');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const sectionLabel = document.querySelector('#sectionLabel');
const pageCount = document.querySelector('#pageCount');
const progressDots = [...document.querySelectorAll('#progress i')];
const motionToggle = document.querySelector('#motionToggle');
const answerText = document.querySelector('#answerText');

let currentFrame = 0;
let isTurning = false;
let autoTurn = false;
let autoTimer;

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function updateAlbum() {
  const frame = frames[currentFrame];
  sectionLabel.textContent = frame.dataset.title;
  pageCount.textContent = `${String(currentFrame + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
  previous.disabled = currentFrame === 0;
  next.disabled = currentFrame === frames.length - 1;
  progressDots.forEach((dot, index) => dot.classList.toggle('active', index === currentFrame));
}

function clearFrameClasses() {
  frames.forEach(frame => frame.classList.remove('is-active', 'turn-out-next', 'turn-in-next', 'turn-out-prev', 'turn-in-prev'));
}

function finishTurn(incoming) {
  clearFrameClasses();
  incoming.classList.add('is-active');
  isTurning = false;
  updateAlbum();
}

function turn(direction) {
  if (isTurning) return;
  const destination = currentFrame + (direction === 'next' ? 1 : -1);
  if (destination < 0 || destination >= frames.length) return;

  const outgoing = frames[currentFrame];
  const incoming = frames[destination];
  currentFrame = destination;
  isTurning = true;

  if (reducedMotion()) {
    finishTurn(incoming);
    return;
  }

  outgoing.classList.remove('is-active');
  outgoing.classList.add(direction === 'next' ? 'turn-out-next' : 'turn-out-prev');
  incoming.classList.add(direction === 'next' ? 'turn-in-next' : 'turn-in-prev');
  window.setTimeout(() => finishTurn(incoming), 780);
}

function openAlbum() {
  cover.classList.add('is-hidden');
  album.classList.remove('is-hidden');
  updateAlbum();
  window.setTimeout(() => stack.focus(), 50);
}

function closeAlbum() {
  stopAutoTurn();
  album.classList.add('is-hidden');
  cover.classList.remove('is-hidden');
  document.querySelector('#openAlbum').focus();
}

function stopAutoTurn() {
  autoTurn = false;
  window.clearInterval(autoTimer);
  motionToggle.setAttribute('aria-pressed', 'false');
  motionToggle.textContent = '自动翻页：关';
}

function startAutoTurn() {
  if (reducedMotion()) return;
  autoTurn = true;
  motionToggle.setAttribute('aria-pressed', 'true');
  motionToggle.textContent = '自动翻页：开';
  window.clearInterval(autoTimer);
  autoTimer = window.setInterval(() => {
    if (currentFrame === frames.length - 1) {
      stopAutoTurn();
      return;
    }
    turn('next');
  }, 3600);
}

function celebrate() {
  const confetti = document.querySelector('#confetti');
  confetti.replaceChildren();
  if (reducedMotion()) return;
  const symbols = ['♡', '✦', '✿', '•', '♡'];
  const colors = ['#f4cd8c', '#ef9ba5', '#f7e6bc', '#d97b8c', '#d4e6c4'];
  for (let index = 0; index < 32; index += 1) {
    const piece = document.createElement('i');
    piece.textContent = symbols[index % symbols.length];
    piece.style.setProperty('--x', `${Math.random() * 560 - 280}px`);
    piece.style.setProperty('--y', `${-(120 + Math.random() * 390)}px`);
    piece.style.setProperty('--spin', `${Math.random() * 540 - 270}deg`);
    piece.style.setProperty('--delay', `${Math.random() * .35}s`);
    piece.style.setProperty('--duration', `${1.4 + Math.random() * .75}s`);
    piece.style.setProperty('--confetti-color', colors[index % colors.length]);
    piece.style.fontSize = `${.72 + Math.random() * 1.1}rem`;
    confetti.append(piece);
  }
  window.setTimeout(() => confetti.replaceChildren(), 2700);
}

document.querySelector('#openAlbum').addEventListener('click', openAlbum);
document.querySelector('#closeAlbum').addEventListener('click', closeAlbum);
previous.addEventListener('click', () => turn('previous'));
next.addEventListener('click', () => turn('next'));

stack.addEventListener('click', event => {
  if (event.target.closest('button')) return;
  const bounds = stack.getBoundingClientRect();
  turn(event.clientX - bounds.left > bounds.width / 2 ? 'next' : 'previous');
});

document.addEventListener('keydown', event => {
  if (album.classList.contains('is-hidden')) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); turn('next'); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); turn('previous'); }
  if (event.key === 'Escape') closeAlbum();
});

motionToggle.addEventListener('click', () => {
  if (autoTurn) stopAutoTurn();
  else startAutoTurn();
});

document.querySelector('#accept').addEventListener('click', () => {
  answerText.textContent = '谢谢你的回应。接下来的每一帧，都想和你慢慢留下。';
  celebrate();
});

updateAlbum();
