console.log("browse.js loaded");

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const genreSelect = document.getElementById("genre");
const resultsContainer = document.getElementById("results");
const typeSelect = document.getElementById("typeSelect");

let currentPage = 1;
let isLoading = false;
let hasMore = true;
let currentQuery = "";
let currentGenre = "";
let currentType = "anime";

// Handle type change (anime, manga, manhwa)
typeSelect.addEventListener("change", () => {
  currentType = typeSelect.value;
  searchInput.placeholder = `Search ${currentType}`;
  currentQuery = "";
  currentGenre = "";
  currentPage = 1;
  hasMore = true;
  resultsContainer.innerHTML = "";
  loadGenres();
  loadItems();
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  currentType = typeSelect.value;
  searchInput.placeholder = `Search ${currentType}`;
  loadGenres();
  loadItems();
});

// Handle search
searchBtn.addEventListener("click", () => {
  currentQuery = searchInput.value.trim();
  currentGenre = genreSelect.value;
  currentPage = 1;
  hasMore = true;
  resultsContainer.innerHTML = "";
  loadItems();
});

// Load genres from Jikan
async function loadGenres() {
  genreSelect.innerHTML = `<option value="">All Genres</option>`;
  const apiType = currentType === "manhwa" ? "manga" : currentType;

  try {
    const res = await fetch(`https://api.jikan.moe/v4/genres/${apiType}`);
    const json = await res.json();

    if (!json.data) throw new Error("Invalid API response");

    json.data
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(genre => {
        const opt = document.createElement("option");
        opt.value = genre.mal_id;
        opt.textContent = genre.name;
        genreSelect.appendChild(opt);
      });
  } catch (err) {
    console.error("Failed to load genres:", err);
  }
}

// Load anime/manga/manhwa items
async function loadItems() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  resultsContainer.insertAdjacentHTML("beforeend", "<p id='loading'>Loading...</p>");

  try {
    let url;

    if (currentType === "manhwa") {
      // Use top manga endpoint for better filtering
      url = `https://api.jikan.moe/v4/top/manga?type=manga&page=${currentPage}&limit=25`;
    } else {
      url = `https://api.jikan.moe/v4/${currentType}?page=${currentPage}&limit=12`;
      if (currentQuery) url += `&q=${encodeURIComponent(currentQuery)}`;
      if (currentGenre) url += `&genres=${currentGenre}`;
    }

    console.log("Fetching URL:", url);
    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("loading")?.remove();

    let items = Array.isArray(data.data) ? data.data : [];

    // Filter types for manhwa
    if (currentType === "manhwa") {
      const allowedTypes = ["manhwa", "manhua", "light novel"];
      items = items.filter(item => allowedTypes.includes(item.type?.toLowerCase()));

      // Search filter
      if (currentQuery) {
        items = items.filter(item =>
          item.title.toLowerCase().includes(currentQuery.toLowerCase())
        );
      }

      // Genre filter
      if (currentGenre) {
        items = items.filter(item =>
          item.genres?.some(g => g.mal_id.toString() === currentGenre)
        );
      }

      // Limit final displayed list
      items = items.slice(0, 12);
    }

    if (!items.length && currentPage === 1) {
      resultsContainer.innerHTML = "<p>No results found.</p>";
      hasMore = false;
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "anime-card";

      const title = item.title || "Untitled";
      const imageUrl = item.images?.jpg?.image_url || "";
      const score = item.score ?? "N/A";
      const typeVal = item.type ?? "Unknown";
      const chapters = item.chapters;

      const infoHTML = `
        <h3>${title}</h3>
        <p><strong>Score:</strong> ${score}</p>
        <p><strong>Type:</strong> ${typeVal}</p>
        ${["manga", "manhwa"].includes(currentType) && chapters ? `<p><strong>Chapters:</strong> ${chapters}</p>` : ""}
      `;

      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${imageUrl}" alt="${title}" />
        </div>
        <div class="anime-info">${infoHTML}</div>
      `;

      card.querySelector(".card-img-wrapper").addEventListener("click", () => {
        window.location.href = currentType === "anime"
          ? `anime.html?id=${item.mal_id}`
          : `manga-details.html?id=${item.mal_id}`;
      });

      resultsContainer.appendChild(card);
    });

    currentPage++;
    hasMore = data.pagination?.has_next_page ?? false;
  } catch (err) {
    console.error("Error fetching data:", err);
    document.getElementById("loading")?.remove();
    if (currentPage === 1) {
      resultsContainer.innerHTML = "<p>Error loading content. Try again later.</p>";
    }
  } finally {
    isLoading = false;
  }
}

// Infinite scroll
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadItems();
  }
});
