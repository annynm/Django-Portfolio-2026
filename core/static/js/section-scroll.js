// ========== SECTION SCROLL ==========
(function() {
  const sections = document.querySelectorAll(".view-section");
  if (!sections.length) return;

  let currentIndex = 0;
  let isAnimating = false;

  sections.forEach((section, idx) => {
    section.style.visibility = "visible";
    section.style.opacity = "1";
    section.style.zIndex = idx === currentIndex ? "10" : "1";
    if (idx === currentIndex) section.classList.add("active");
  });

  function transitionTo(newIndex) {
    if (isAnimating) return;
    if (newIndex < 0 || newIndex >= sections.length) return;
    if (newIndex === currentIndex) return;

    isAnimating = true;
    const oldSection = sections[currentIndex];
    const newSection = sections[newIndex];
    const goingDown = newIndex > currentIndex;

    newSection.style.zIndex = "5";
    oldSection.style.zIndex = "10";
    oldSection.classList.add(goingDown ? "exit-up" : "exit-down");

    function onAnimEnd() {
      oldSection.classList.remove("exit-up", "exit-down", "active");
      oldSection.style.zIndex = "1";
      newSection.classList.add("active");
      newSection.style.zIndex = "10";
      currentIndex = newIndex;
      isAnimating = false;
      history.pushState(null, "", `#${newSection.id}`);
      oldSection.removeEventListener("animationend", onAnimEnd);

      // Notify carousels in the newly active section to recalculate layout
      const event = new CustomEvent("sectionActivated", {
        detail: { section: newSection },
      });
      document.dispatchEvent(event);
    }
    oldSection.addEventListener("animationend", onAnimEnd);
  }

  // ========== WHEEL ==========
  // Returns true if the event originates inside an active overflow carousel
  function isCarouselWheelHorizontal(e) {
    const wrapper = e.target.closest(".carousel-wrapper");
    if (!wrapper) return false;
    // Only intercept dominant horizontal wheel events
    return Math.abs(e.deltaX) > Math.abs(e.deltaY);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      // Always prevent default to stop browser back/forward gestures
      e.preventDefault();

      // Let the carousel handle dominant horizontal scroll
      if (isCarouselWheelHorizontal(e)) return;

      // Ignore events where horizontal movement dominates vertical
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      if (isAnimating) return;

      if (e.deltaY > 0) transitionTo(currentIndex + 1);
      else if (e.deltaY < 0) transitionTo(currentIndex - 1);
    },
    { passive: false },
  );

  // ========== TOUCH ==========
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchend",
    (e) => {
      if (isAnimating) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - touchStartX;
      const diffY = endY - touchStartY;

      // Ignore if horizontal swipe is dominant
      if (Math.abs(diffX) > Math.abs(diffY)) return;

      // Require a minimum vertical distance to trigger
      if (Math.abs(diffY) < 50) return;

      // Check if touch is inside a carousel in overflow mode
      const target = e.target.closest(".carousel-wrapper");
      if (target && target.dataset.overflowMode === "true") return;

      if (diffY < 0) transitionTo(currentIndex + 1);
      else transitionTo(currentIndex - 1);
    },
    { passive: true },
  );

  // ========== ANCHOR LINKS ==========
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const idx = Array.from(sections).indexOf(target);
      if (idx >= 0) transitionTo(idx);
    });
  });

  // ========== INITIAL HASH ==========
  if (window.location.hash) {
    const targetSection = document.getElementById(
      window.location.hash.slice(1),
    );
    if (targetSection) {
      const idx = Array.from(sections).indexOf(targetSection);
      if (idx > 0) {
        sections[currentIndex].classList.remove("active");
        sections[currentIndex].style.zIndex = "1";
        targetSection.classList.add("active");
        targetSection.style.zIndex = "10";
        currentIndex = idx;
      }
    }
  }
})();
