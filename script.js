(function () {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDate = document.getElementById('lightbox-date');
  const closeBtn = document.getElementById('lightbox-close');
  const works = document.querySelectorAll('.work');

  /* ---------- GLOBAL PRESSING CURSOR ---------- */
  // Show the pinch cursor (🤌) anywhere on the page while the primary
  // mouse/pointer button is held down, regardless of whether the press
  // started over an image.
  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.pointerType === 'touch') return; // touch already feels different
    document.body.classList.add('is-pressing');
  });
  function clearPressing() {
    document.body.classList.remove('is-pressing');
  }
  document.addEventListener('pointerup', clearPressing);
  document.addEventListener('pointercancel', clearPressing);
  // If pointer leaves the window mid-press
  window.addEventListener('blur', clearPressing);

  /* ---------- DYNAMIC GALLERY OFFSET ---------- */
  // Make sure the gallery starts below the statement, regardless of how
  // tall the bio renders at the current viewport width.
  const gallery = document.getElementById('gallery');
  const statement = document.querySelector('.statement');

  function updateGalleryOffset() {
    if (!gallery || !statement) return;
    if (window.matchMedia('(max-width: 720px)').matches) {
      gallery.style.marginTop = ''; // mobile uses its own layout
      return;
    }
    const rect = statement.getBoundingClientRect();
    // statement.top is 24px from viewport top in fixed/absolute layout, so
    // its height + that offset + a buffer is how far down the gallery starts
    const bottomY = rect.top + rect.height + window.scrollY;
    gallery.style.marginTop = (bottomY + 24) + 'px'; // 24px breathing room — keep close to header
  }
  // Run after fonts settle
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateGalleryOffset);
  } else {
    window.addEventListener('load', updateGalleryOffset);
  }
  window.addEventListener('resize', updateGalleryOffset);
  updateGalleryOffset();

  /* ---------- LAZY-LOAD FADE-IN ---------- */
  // Mark each gallery image with .loaded once it's done loading so CSS fades it in.
  document.querySelectorAll('.work img').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      // Already cached — show immediately
      img.classList.add('loaded');
    } else {
      img.addEventListener('load',  () => img.classList.add('loaded'),  { once: true });
      // If the image fails to load, still reveal the placeholder bg
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    }
  });

  const STORAGE_KEY = 'rm-portfolio-positions';
  const DRAG_THRESHOLD = 5;

  let lastFocused = null; // element to return focus to on close

  /* ---------- LIGHTBOX ---------- */
  function openLightbox(work) {
    const img = work.querySelector('img');
    if (!img) return;
    lastFocused = work;

    lightboxImg.src = img.src;
    // Image alt in lightbox: descriptive (matches gallery alt)
    lightboxImg.alt = img.alt || '';
    lightboxTitle.textContent = work.dataset.title || '';
    lightboxDate.textContent = work.dataset.date || '';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog so screen readers announce it
    closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) lightboxImg.src = '';
    }, 300);

    // Return focus to the work that opened it
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightboxImg) return;
    if (e.target === closeBtn) return; // close button has its own handler
    closeLightbox();
  });
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  // Keyboard: Esc closes; trap Tab inside the dialog while open
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }
    if (e.key === 'Tab') {
      // Only one focusable element in the dialog (close button) —
      // keep focus pinned to it
      e.preventDefault();
      closeBtn.focus();
    }
  });

  /* ---------- DRAG TO REPOSITION (mouse pointers only) ---------- */

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    saved = {};
  }

  function savePosition(id, dx, dy) {
    saved[id] = { dx, dy };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) { /* ignore */ }
  }

  works.forEach((work, i) => {
    const id = work.dataset.title
      ? work.dataset.title.replace(/\s+/g, '-')
      : 'work-' + i;
    work.dataset.id = id;

    if (saved[id]) {
      work.style.transform = `translate(${saved[id].dx}px, ${saved[id].dy}px)`;
    }

    let startX = 0, startY = 0;
    let baseDx = 0, baseDy = 0;
    let currentDx = 0, currentDy = 0;
    let isDown = false;
    let isDragging = false;
    let pointerId = null;
    let dragEnabled = false; // only true for mouse pointers

    work.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      // Only enable drag for mouse — touch pointers use the keyboard/click path
      // to avoid conflicting with scroll on mobile, and pen is treated as click.
      dragEnabled = (e.pointerType === 'mouse');
      isDown = true;
      isDragging = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      baseDx = saved[id] ? saved[id].dx : 0;
      baseDy = saved[id] ? saved[id].dy : 0;
      currentDx = baseDx;
      currentDy = baseDy;
    });

    work.addEventListener('pointermove', (e) => {
      if (!isDown || e.pointerId !== pointerId || !dragEnabled) return;
      const moveX = e.clientX - startX;
      const moveY = e.clientY - startY;

      if (!isDragging && Math.hypot(moveX, moveY) > DRAG_THRESHOLD) {
        isDragging = true;
        work.classList.add('dragging');
        document.body.classList.add('is-dragging');
        try { work.setPointerCapture(pointerId); } catch (err) {}
      }

      if (isDragging) {
        currentDx = baseDx + moveX;
        currentDy = baseDy + moveY;
        work.style.transform = `translate(${currentDx}px, ${currentDy}px)`;
        e.preventDefault();
      }
    });

    function endDrag(e) {
      if (!isDown) return;
      const wasDragging = isDragging;
      isDown = false;
      isDragging = false;
      work.classList.remove('dragging');
      document.body.classList.remove('is-dragging');
      try { work.releasePointerCapture(pointerId); } catch (err) {}
      pointerId = null;

      if (wasDragging) {
        savePosition(id, currentDx, currentDy);
        // Suppress the click that the browser will fire after the drag ends
        work.dataset.suppressClick = '1';
        setTimeout(() => { delete work.dataset.suppressClick; }, 50);
      }
    }

    work.addEventListener('pointerup', endDrag);
    work.addEventListener('pointercancel', endDrag);

    // Click handler — fires for keyboard activation (Enter/Space) AND mouse clicks.
    // We only suppress it if a drag JUST happened.
    work.addEventListener('click', (e) => {
      if (work.dataset.suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      openLightbox(work);
    });
  });
})();
