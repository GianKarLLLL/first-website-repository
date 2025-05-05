document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.fade-text').forEach(el => {
    observer.observe(el);
  });
});

const images = document.querySelectorAll('.carousel-image');
let current = 0;

// Make the first image visible immediately
images[current].classList.add('active');
images[current].style.transform = 'translate(-50%, -50%)';

function nextImage() {
  const currentImg = images[current];
  const next = (current + 1) % images.length;
  const nextImg = images[next];

  // Slide current image to the left
  currentImg.style.transition = 'transform 1.5s ease';
  currentImg.style.transform = 'translate(-150vw, -50%)';
  currentImg.classList.remove('active');

  // Prepare next image: offscreen to right
  nextImg.style.transition = 'none';
  nextImg.style.transform = 'translate(150vw, -50%)';
  nextImg.classList.add('active');

  // Animate into center
  setTimeout(() => {
    nextImg.style.transition = 'transform 1.5s ease';
    nextImg.style.transform = 'translate(-50%, -50%)';
  }, 50);

  // Reset previous image after animation
  setTimeout(() => {
    currentImg.style.transition = 'none';
    currentImg.style.transform = 'translate(150vw, -50%)';
  }, 1600);

  current = next;
}

setTimeout(() => {
  setInterval(nextImage, 5000);
}, 1000);

function openModal(polaroidEl) {
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const album = document.querySelector('.album');

  const imgSrc = polaroidEl.querySelector('img').src;
  modalImg.src = imgSrc;
  modal.style.display = 'flex';

  // Add the class to trigger fade-in
  modal.classList.add('show');

  const rect = polaroidEl.getBoundingClientRect();
  const modalRect = modal.getBoundingClientRect();

  modalImg.style.transition = 'none';
  modalImg.style.transformOrigin = 'top left';

  modalImg.style.visibility = 'hidden';
  modalImg.style.display = 'block';

  modalImg.onload = () => {
    const scaleX = rect.width / modalImg.offsetWidth;
    const scaleY = rect.height / modalImg.offsetHeight;

    const translateX = rect.left - (modalRect.width - modalImg.offsetWidth) / 2;
    const translateY = rect.top - (modalRect.height - modalImg.offsetHeight) / 2;

    const rotation = getRotation(polaroidEl);

    modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
    modalImg.style.visibility = 'visible';

    void modalImg.offsetWidth; // force reflow

    modalImg.style.transition = 'transform 0.5s ease';
    modalImg.style.transform = 'translate(0, 0) scale(1, 1) rotate(0deg)';
  };

  album.classList.add('blurred');

  modal.onclick = function (e) {
    if (e.target === modal) {
      const scaleX = rect.width / modalImg.offsetWidth;
      const scaleY = rect.height / modalImg.offsetHeight;
      const translateX = rect.left - (modalRect.width - modalImg.offsetWidth) / 2;
      const translateY = rect.top - (modalRect.height - modalImg.offsetHeight) / 2;
      const rotation = getRotation(polaroidEl);

      modalImg.style.transition = 'transform 0.4s ease';
      modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;

      // Add a fade-out effect before hiding the modal
      modal.style.opacity = '0';  // Fade out modal

      setTimeout(() => {
        modal.style.display = 'none';
        album.classList.remove('blurred');
        modal.style.opacity = '1';  // Reset opacity for next time
        modal.classList.remove('show'); // Remove the show class for next fade-in
      }, 600); // Match the fade duration
    }
  };
}

function getRotation(el) {
  const st = window.getComputedStyle(el, null);
  const tr = st.getPropertyValue("transform");
  if (tr === "none") return 0;
  const values = tr.split('(')[1].split(')')[0].split(',');
  const a = values[0], b = values[1];
  const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
  return angle;
}

const album = document.querySelector('.album');
const SCROLL_MULTIPLIER = 3;

album.addEventListener('wheel', function(e) {
  const delta = e.deltaY;
  const atBottom = Math.ceil(album.scrollTop + album.clientHeight) >= album.scrollHeight;

  const scrollingDown = delta > 0;

  // Only intercept scroll if:
  // 1. User is scrolling down
  // 2. Album is already scrolled to the bottom
  if (scrollingDown && atBottom) {
    e.preventDefault();
    window.scrollBy({
      top: delta * SCROLL_MULTIPLIER,
      behavior: 'smooth'
    });
  }

  // If scrolling up, let album handle it normally
}, { passive: false });

function togglePlay(button) {
  const card = button.closest('.player-card');
  const audio = button.nextElementSibling;

  // Skip the background audio in the query
  const allAudios = document.querySelectorAll('.player-card audio');
  const allCards = document.querySelectorAll('.player-card');

  if (audio.paused) {
    allAudios.forEach(a => {
      a.pause();
      a.currentTime = 0;
      a.previousElementSibling.textContent = '▶';
    });
    allCards.forEach(c => c.classList.remove('playing'));

    audio.play();
    button.textContent = '| |';
    card.classList.add('playing');
  } else {
    audio.pause();
    audio.currentTime = 0;
    button.textContent = '▶';
    card.classList.remove('playing');
  }
}

const video = document.getElementById('bgVideo');
const prompt = document.getElementById('prompt');
const pausedText = document.getElementById('pausedText');
const audio = document.getElementById('bgAudio');

function playVideo() {
  prompt.style.display = 'none';
  video.style.display = 'block';
  video.play();
  audio.play(); // Start audio with video
}

function denyVideo() {
  alert("Okay baby.");
  prompt.style.display = 'block';
}

// Sync pause/play
video.addEventListener('pause', () => {
  audio.pause();
});

video.addEventListener('play', () => {
  audio.play();
});

video.addEventListener('ended', () => {
  audio.pause();
  audio.currentTime = 0; // Reset audio to start
});

video.addEventListener('click', () => {
  if (video.paused) {
    video.play();
    pausedText.style.display = 'none';
  } else {
    video.pause();
    pausedText.style.display = 'block';
  }
});


const boxBody = document.querySelector('.box-body');
let hasBeenClicked = false;

boxBody.addEventListener('click', function () {
  if (hasBeenClicked) return;

  this.classList.add('clicked');
  hasBeenClicked = true;

  fireConfettiSlow(); // use the slower confetti function
});

function fireConfettiSlow() {
  const duration = 3 * 1000; // 3 seconds
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 15,     // Slower launch
    spread: 360,
    ticks: 320,            // Confetti stays longer
    gravity: 0.4,          // Slower fall
    zIndex: 1000
  };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 100 * (timeLeft / duration);

    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: {
        x: randomInRange(0.1, 0.9),
        y: Math.random() * 0.3
      }
    }));
  }, 300);
}

document.querySelector('.box-body .img').addEventListener('click', function () {
  const finalGift = document.getElementById('final-gift');
  const blurOverlay = document.getElementById('blur-overlay');

  blurOverlay.classList.remove('hidden');
  finalGift.classList.remove('hidden');

  setTimeout(() => {
    blurOverlay.classList.add('show');
    finalGift.classList.add('show');
  }, 50);

  // Exit after 3 seconds
  setTimeout(() => {
    finalGift.classList.remove('show');
    blurOverlay.classList.remove('show');

    setTimeout(() => {
      finalGift.classList.add('hidden');
      blurOverlay.classList.add('hidden');
    }, 600); // Wait for transition to complete
  }, 3500);
});