(function() {
  const carousels = document.querySelectorAll(".cards-scroll");
  if (carousels.length === 0) return;
  for (let carousel of carousels) {
    carousel.style.scrollBehavior = "smooth";
  }
})();
