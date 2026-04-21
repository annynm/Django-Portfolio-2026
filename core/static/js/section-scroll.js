(function() {
  const sections = document.querySelectorAll(".view-section");
  if (sections.length === 0) return;

  let currentIndex = 0;
  let isAnimating = false;
  let scrollCooldownActive = false;
  let cooldownTimer = null;

  sections.forEach((section, idx) => {
    section.style.visibility = "visible";
    section.style.opacity = "1";
    if (idx === currentIndex) {
      section.classList.add("active");
      section.style.zIndex = "10";
    } else {
      section.style.zIndex = "1";
    }
  });

  function transitionTo(newIndex) {
    if (isAnimating || scrollCooldownActive) return;
    if (newIndex < 0 || newIndex >= sections.length) return;
    if (newIndex === currentIndex) return;

    isAnimating = true;

    const oldSection = sections[currentIndex];
    const newSection = sections[newIndex];
    const direction = newIndex > currentIndex ? "down" : "up";

    newSection.style.zIndex = "5";
    oldSection.style.zIndex = "10";

    if (direction === "down") {
      oldSection.classList.add("exit-up");
    } else {
      oldSection.classList.add("exit-down");
    }

    const onAnimationEnd = () => {
      oldSection.classList.remove("exit-up", "exit-down");
      oldSection.classList.remove("active");
      oldSection.style.zIndex = "1";
      newSection.classList.add("active");
      newSection.style.zIndex = "10";
      currentIndex = newIndex;
      isAnimating = false;
      history.pushState(null, null, `#${sections[currentIndex].id}`);
      oldSection.removeEventListener("animationend", onAnimationEnd);

      function resetCooldown() {
        if (cooldownTimer) clearTimeout(cooldownTimer);
        cooldownTimer = setTimeout(() => {
          scrollCooldownActive = false;
          cooldownTimer = null;
        }, 100);
      }
      scrollCooldownActive = true;
      resetCooldown();
    };
    oldSection.addEventListener("animationend", onAnimationEnd);
  }

  window.addEventListener(
    "wheel",
    (e) => {
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }

      if (scrollCooldownActive) {
        if (cooldownTimer) clearTimeout(cooldownTimer);
        cooldownTimer = setTimeout(() => {
          scrollCooldownActive = false;
          cooldownTimer = null;
        }, 300);
        e.preventDefault();
        return;
      }

      if (isAnimating) {
        e.preventDefault();
        return;
      }

      if (deltaY > 0) {
        transitionTo(currentIndex + 1);
      } else if (deltaY < 0) {
        transitionTo(currentIndex - 1);
      }
      e.preventDefault();
    },
    { passive: false },
  );

  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  window.addEventListener("touchend", (e) => {
    if (isAnimating || scrollCooldownActive) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = Math.abs(touchStartX - endX);
    const diffY = Math.abs(touchStartY - endY);

    if (diffX > diffY && diffX > 50) {
      return;
    }

    const diff = touchStartY - endY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) transitionTo(currentIndex + 1);
      else transitionTo(currentIndex - 1);
      e.preventDefault();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const targetIndex = Array.from(sections).indexOf(targetElement);
        if (targetIndex !== -1) transitionTo(targetIndex);
      }
    });
  });

  if (window.location.hash) {
    const targetId = window.location.hash.slice(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      const targetIndex = Array.from(sections).indexOf(targetSection);
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        sections[currentIndex].classList.remove("active");
        sections[currentIndex].style.zIndex = "1";
        targetSection.classList.add("active");
        targetSection.style.zIndex = "10";
        currentIndex = targetIndex;
      }
    }
  }
})();
