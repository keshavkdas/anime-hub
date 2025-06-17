// Carousel logic
const carouselInner = document.querySelector('.carousel-inner');
const items = document.querySelectorAll('.carousel-item');
const prevBtn = document.querySelector('.carousel-control.prev');
const nextBtn = document.querySelector('.carousel-control.next');
let currentIndex = 0;

function updateCarousel() {
  carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
}

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  updateCarousel();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % items.length;
  updateCarousel();
});

// Auto-rotate carousel every 5 seconds
setInterval(() => {
  currentIndex = (currentIndex + 1) % items.length;
  updateCarousel();
}, 5000);

// Tab navigation
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.target;

    // Activate tab link
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Show tab content
    tabContents.forEach(tab => {
      if (tab.id === target) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  });
});

// Dark mode toggle
const darkToggleBtn = document.getElementById('dark-mode-toggle');
const body = document.body;

// Load saved preference from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  body.classList.add('dark-mode');
  darkToggleBtn.textContent = '☀️';
}

darkToggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  if (body.classList.contains('dark-mode')) {
    darkToggleBtn.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    darkToggleBtn.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
});
