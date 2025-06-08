// Load random anime image from Nekos
function loadRandom() {
  fetch('https://nekos.best/api/v2/neko')
    .then(res => res.json())
    .then(data => {
      document.getElementById('random-anime-img').src = data.results[0].url;
    });
}
loadRandom();

// Scroll fade-in animation
window.addEventListener('scroll', () => {
  document.querySelectorAll('.fade-in').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add('visible');
    }
  });
});

// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function(e) {
    e.preventDefault();
    const target = this.dataset.target;

    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// Read more toggle
document.querySelectorAll('.toggle').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const p = this.closest('.short');
    p.classList.toggle('expanded');
    this.textContent = p.classList.contains('expanded') ? "Read less" : "Read more";
  });
});
