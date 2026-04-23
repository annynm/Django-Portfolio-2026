(function() {
  const ANIMATION_DURATION = 500; // match CSS animation (0.5s)

  const sections = document.querySelectorAll(".view-section");
  if (!sections.length) return;

  let currentIndex = 0;
  let isAnimating = false;

  // Initialize section styles & active class
  sections.forEach((section, idx) => {
    section.style.visibility = "visible";
    section.style.opacity = "1";
    section.style.zIndex = idx === currentIndex ? "10" : "1";
    if (idx === currentIndex) {
      section.classList.add("active");
    }
  });

  function transitionTo(newIndex) {
    if (isAnimating) return;
    if (newIndex < 0 || newIndex >= sections.length) return;
    if (newIndex === currentIndex) return;

    isAnimating = true;
    const oldSection = sections[currentIndex];
    const newSection = sections[newIndex];
    const goingDown = newIndex > currentIndex;

    // Prepare z-index for crossfade
    newSection.style.zIndex = "5";
    oldSection.style.zIndex = "10";

    // Add exit animation class on old section
    oldSection.classList.add(goingDown ? "exit-up" : "exit-down");

    // When the CSS animation ends:
    function onAnimEnd() {
      // Clean up classes and reset z-index
      oldSection.classList.remove("exit-up", "exit-down", "active");
      oldSection.style.zIndex = "1";
      newSection.classList.add("active");
      newSection.style.zIndex = "10";

      currentIndex = newIndex;
      isAnimating = false;

      // Update URL hash to current section
      history.pushState(null, "", `#${newSection.id}`);

      oldSection.removeEventListener("animationend", onAnimEnd);
    }
    oldSection.addEventListener("animationend", onAnimEnd);
  }

  // === GSAP OBSERVER with horizontal scroll filtering ===
  Observer.create({
    type: "wheel,touch,pointer",
    onDown: (e) => {
      // Only trigger if vertical movement is dominant (ignore horizontal scroll)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      transitionTo(currentIndex + 1);
    },
    onUp: (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      transitionTo(currentIndex - 1);
    },
    tolerance: 10,
    preventDefault: true,
  });

  // Anchor-link navigation (click)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || !targetId) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const idx = Array.from(sections).indexOf(target);
      if (idx >= 0) {
        transitionTo(idx);
      }
    });
  });

  // On load: if a hash is present, go directly to that section
  if (window.location.hash) {
    const targetId = window.location.hash.slice(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      const idx = Array.from(sections).indexOf(targetSection);
      if (idx >= 0 && idx !== currentIndex) {
        // Remove active from current and set target active
        sections[currentIndex].classList.remove("active");
        sections[currentIndex].style.zIndex = "1";
        targetSection.classList.add("active");
        targetSection.style.zIndex = "10";
        currentIndex = idx;
      }
    }
  }
})();
