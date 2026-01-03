/*
 Copyright (c) 2026 Ashraf Morningstar
 These are personal recreations of existing projects, developed by Ashraf Morningstar
 for learning and skill development.
 Original project concepts remain the intellectual property of their respective creators.
 Repository: https://github.com/AshrafMorningstar
*/

// Mobile Menu Toggle (guarded)
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");
  });
}

// Portfolio Filtering
const filterButtons = document.querySelectorAll(".filter-btn");
const workItems = document.querySelectorAll(".work-item");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.dataset.filter;

    workItems.forEach((item) => {
      if (filter === "all" || item.classList.contains(filter)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });
});

// Testimonial Carousel (initialize only if slides exist)
const slides = document.querySelectorAll(".testimonial-slide");
const dotsContainer = document.querySelector(".carousel-dots");
let currentSlide = 0;

if (slides.length && dotsContainer) {
  // Create dots and wire click handlers
  slides.forEach((slide, index) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".dot");

  function goToSlide(slideIndex) {
    slides[currentSlide].classList.remove("active");
    if (dots[currentSlide]) dots[currentSlide].classList.remove("active");
    currentSlide = slideIndex;
    slides[currentSlide].classList.add("active");
    if (dots[currentSlide]) dots[currentSlide].classList.add("active");
  }

  function nextSlide() {
    let nextSlideIndex = currentSlide + 1;
    if (nextSlideIndex >= slides.length) nextSlideIndex = 0;
    goToSlide(nextSlideIndex);
  }

  function prevSlide() {
    let prevSlideIndex = currentSlide - 1;
    if (prevSlideIndex < 0) prevSlideIndex = slides.length - 1;
    goToSlide(prevSlideIndex);
  }

  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  if (nextBtn) nextBtn.addEventListener("click", nextSlide);
  if (prevBtn) prevBtn.addEventListener("click", prevSlide);

  // Auto-rotate
  setInterval(nextSlide, 5000);
}
