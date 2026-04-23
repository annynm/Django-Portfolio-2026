// ========== CAROUSEL ==========
(function () {

  function initCarousel(wrapper) {
    const scrollContainer = wrapper.querySelector(".cards-scroll");
    if (!scrollContainer) return;

    const leftBtn = wrapper.querySelector(".carousel-btn-left");
    const rightBtn = wrapper.querySelector(".carousel-btn-right");

    let originalCards = [];
    let originalCount = 0;
    let isInfiniteMode = false;
    let currentIndex = 0;
    let cardWidth = 0;
    let isAnimating = false;

    // Hold-button state
    let holdInterval = null;
    let holdActive = false;

    // Drag + inertia state
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let animationFrame = null;

    // ========== HELPERS ==========

    function getCardTotalWidth() {
      const card = scrollContainer.querySelector(".card:not(.clone)") ||
                   scrollContainer.querySelector(".card");
      if (!card) return 284; // 260 + 24 gap fallback
      const style = getComputedStyle(scrollContainer);
      const gap = parseFloat(style.gap) || 24;
      return card.offsetWidth + gap;
    }

    function isOverflowing() {
      const total = originalCount * getCardTotalWidth();
      return total > wrapper.clientWidth;
    }

    // ========== TRANSFORM ==========

    function setTransform(px, animate) {
      scrollContainer.style.transition = animate ? "transform 0.35s ease" : "none";
      scrollContainer.style.transform = `translateX(${px}px)`;
      currentTranslate = px;
      prevTranslate = px;
    }

    function offsetForIndex(idx) {
      return -(idx * cardWidth);
    }

    function goToIndex(idx, animate) {
      currentIndex = idx;
      setTransform(offsetForIndex(idx), animate);
    }

    // ========== INFINITE CLONE SETUP ==========

    function restoreOriginalCards() {
      scrollContainer.querySelectorAll(".card.clone").forEach((c) => c.remove());
    }

    function setupInfiniteClones() {
      restoreOriginalCards();

      // Prepend one set of clones, append one set
      const before = originalCards.map((c) => {
        const cl = c.cloneNode(true);
        cl.classList.add("clone");
        return cl;
      });
      const after = originalCards.map((c) => {
        const cl = c.cloneNode(true);
        cl.classList.add("clone");
        return cl;
      });

      before.reverse().forEach((cl) => scrollContainer.prepend(cl));
      after.forEach((cl) => scrollContainer.appendChild(cl));

      // Real cards are now at index originalCount
      currentIndex = originalCount;
      cardWidth = getCardTotalWidth();
      setTransform(offsetForIndex(currentIndex), false);
    }

    // After an animated move, silently jump back into the real range
    function loopCheck() {
      if (!isInfiniteMode) return;
      const total = scrollContainer.querySelectorAll(".card").length;
      const max = originalCount * 2 - 1; // last real card index

      if (currentIndex >= originalCount * 2) {
        currentIndex = originalCount;
        setTransform(offsetForIndex(currentIndex), false);
      } else if (currentIndex < originalCount) {
        currentIndex = originalCount * 2 - 1;
        setTransform(offsetForIndex(currentIndex), false);
      }
    }

    // ========== NAVIGATION ==========

    function moveBy(delta) {
      if (!isInfiniteMode) return;
      currentIndex += delta;
      const px = offsetForIndex(currentIndex);
      scrollContainer.style.transition = "transform 0.35s ease";
      scrollContainer.style.transform = `translateX(${px}px)`;
      currentTranslate = px;
      prevTranslate = px;

      isAnimating = true;
      setTimeout(() => {
        loopCheck();
        isAnimating = false;
      }, 360);
    }

    // ========== BUTTONS ==========

    function bindButton(btn, delta) {
      if (!btn) return;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!isInfiniteMode || isAnimating) return;
        moveBy(delta);
      });

      // Hold to scroll continuously
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        holdActive = true;
        startHold(delta);
      });
      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        holdActive = true;
        startHold(delta);
      }, { passive: false });

      const stopHold = () => {
        holdActive = false;
        if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
      };
      btn.addEventListener("mouseup", stopHold);
      btn.addEventListener("mouseleave", stopHold);
      btn.addEventListener("touchend", stopHold);
      btn.addEventListener("touchcancel", stopHold);
    }

    function startHold(delta) {
      if (holdInterval) clearInterval(holdInterval);
      // Small delay before repeating so a tap still feels like a single click
      let count = 0;
      holdInterval = setInterval(() => {
        if (!holdActive || !isInfiniteMode) return;
        // Skip guard on isAnimating for hold; we want continuous movement
        count++;
        currentIndex += delta;
        const px = offsetForIndex(currentIndex);
        scrollContainer.style.transition = "transform 0.18s ease";
        scrollContainer.style.transform = `translateX(${px}px)`;
        currentTranslate = px;
        prevTranslate = px;
        // Loop check without waiting for animation
        setTimeout(loopCheck, 190);
      }, 200);
    }

    // ========== DRAG + INERTIA ==========

    function getEventX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onDragStart(e) {
      if (!isInfiniteMode) return;
      if (e.button !== undefined && e.button !== 0) return; // left mouse only

      isDragging = true;
      startX = getEventX(e);
      lastX = startX;
      lastTime = performance.now();
      velocity = 0;

      cancelAnimationFrame(animationFrame);
      scrollContainer.style.transition = "none";
      // Capture prevTranslate from current real position
      prevTranslate = currentTranslate;
    }

    function onDragMove(e) {
      if (!isDragging) return;

      const x = getEventX(e);
      const dx = x - startX;
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) velocity = (x - lastX) / dt;
      lastX = x;
      lastTime = now;

      currentTranslate = prevTranslate + dx;
      scrollContainer.style.transform = `translateX(${currentTranslate}px)`;
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;

      // Apply inertia then snap
      let v = velocity * 16; // scale to pixels/frame at 60fps

      function step() {
        v *= 0.92;
        currentTranslate += v;
        scrollContainer.style.transform = `translateX(${currentTranslate}px)`;

        if (Math.abs(v) < 1) {
          // Snap to nearest card
          const nearestIndex = Math.round(-currentTranslate / cardWidth);
          currentIndex = nearestIndex;
          setTransform(offsetForIndex(currentIndex), true);
          setTimeout(loopCheck, 360);
          return;
        }
        animationFrame = requestAnimationFrame(step);
      }

      step();
    }

    function bindDrag() {
      scrollContainer.addEventListener("mousedown", onDragStart);
      window.addEventListener("mousemove", onDragMove);
      window.addEventListener("mouseup", onDragEnd);

      scrollContainer.addEventListener("touchstart", onDragStart, { passive: true });
      scrollContainer.addEventListener("touchmove", onDragMove, { passive: true });
      scrollContainer.addEventListener("touchend", onDragEnd);
    }

    // ========== WHEEL (horizontal only, inside carousel) ==========

    wrapper.addEventListener(
      "wheel",
      (e) => {
        if (!isInfiniteMode) return;
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

        e.preventDefault();
        e.stopPropagation();

        if (isDragging) return;

        // Treat horizontal wheel like a drag with inertia seed
        currentTranslate -= e.deltaX;
        scrollContainer.style.transition = "none";
        scrollContainer.style.transform = `translateX(${currentTranslate}px)`;

        cancelAnimationFrame(animationFrame);
        // Debounce snap
        clearTimeout(wrapper._snapTimer);
        wrapper._snapTimer = setTimeout(() => {
          const nearestIndex = Math.round(-currentTranslate / cardWidth);
          currentIndex = nearestIndex;
          setTransform(offsetForIndex(currentIndex), true);
          setTimeout(loopCheck, 360);
        }, 80);
      },
      { passive: false }
    );

    // ========== MODE SWITCH ==========

    function enableInfiniteMode() {
      isInfiniteMode = true;
      wrapper.dataset.overflowMode = "true";
      scrollContainer.classList.remove("centered-mode");
      if (leftBtn) leftBtn.style.display = "flex";
      if (rightBtn) rightBtn.style.display = "flex";
      setupInfiniteClones();
    }

    function enableMinimalMode() {
      isInfiniteMode = false;
      wrapper.dataset.overflowMode = "false";
      scrollContainer.classList.add("centered-mode");
      if (leftBtn) leftBtn.style.display = "none";
      if (rightBtn) rightBtn.style.display = "none";
      restoreOriginalCards();
      scrollContainer.style.transition = "none";
      scrollContainer.style.transform = "none";
      currentTranslate = 0;
      prevTranslate = 0;
      currentIndex = 0;
    }

    function updateMode() {
      cardWidth = getCardTotalWidth();
      if (originalCount > 1 && isOverflowing()) {
        if (!isInfiniteMode) enableInfiniteMode();
        else {
          // Already infinite – just recalc cardWidth and reposition
          cardWidth = getCardTotalWidth();
          setTransform(offsetForIndex(currentIndex), false);
        }
      } else {
        if (isInfiniteMode) enableMinimalMode();
        else enableMinimalMode();
      }
    }

    // ========== INIT ==========

    function init() {
      originalCards = Array.from(scrollContainer.querySelectorAll(".card"));
      originalCount = originalCards.length;
      if (originalCount === 0) return;

      bindButton(leftBtn, 1);   // left arrow → move list left → index++
      bindButton(rightBtn, -1); // right arrow → move list right → index--
      bindDrag();
      updateMode();

      window.addEventListener("resize", () => {
        clearTimeout(wrapper._resizeTimer);
        wrapper._resizeTimer = setTimeout(updateMode, 100);
      });

      // Re-check layout when this section becomes active (cards may have had 0 width)
      document.addEventListener("sectionActivated", (e) => {
        if (wrapper.closest(".view-section") === e.detail.section) {
          setTimeout(updateMode, 50);
        }
      });
    }

    // Cards may not have rendered dimensions yet if section is hidden;
    // run init after paint so offsetWidth is reliable for the visible section.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(init));
    }
  }

  // ========== BOOT: initialise every carousel on the page ==========
  function bootAll() {
    document.querySelectorAll(".carousel-wrapper").forEach(initCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAll);
  } else {
    bootAll();
  }
})();
