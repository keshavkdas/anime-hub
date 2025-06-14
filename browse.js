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

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  currentType = typeSelect.value;
  loadItems();
});

// Search button click
searchBtn.addEventListener("click", () => {
  currentQuery = searchInput.value.trim();
  currentGenre = genreSelect.value;
  currentType = typeSelect.value;
  currentPage = 1;
  hasMore = true;
  resultsContainer.innerHTML = "";
  loadItems();
});

// Load anime or manga
async function loadItems() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  resultsContainer.insertAdjacentHTML("beforeend", "<p id='loading'>Loading...</p>");

  try {
    let url = `https://api.jikan.moe/v4/${currentType}?page=${currentPage}&limit=12`;

    if (currentQuery) {
      url += `&q=${encodeURIComponent(currentQuery)}`;
    }

    // Only apply genres for anime
    if (currentType === "anime" && currentGenre) {
      url += `&genres=${currentGenre}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    document.getElementById("loading")?.remove();

    if (!data.data || data.data.length === 0) {
      if (currentPage === 1) {
        resultsContainer.innerHTML = "<p>No results found.</p>";
      }
      hasMore = false;
      return;
    }

    data.data.forEach(item => {
      const card = document.createElement("div");
      card.className = "anime-card";

      const title = item.title || "Untitled";
      const image = item.images?.jpg?.image_url || "";
      const score = item.score ?? "N/A";
      const type = item.type ?? "Unknown";
      const chapters = item.chapters;
      const episodes = item.episodes;

      const infoHTML = `
        <h3>${title}</h3>
        <p><strong>Score:</strong> ${score}</p>
        <p><strong>Type:</strong> ${type}</p>
        ${currentType === "anime" && episodes ? `<p><strong>Episodes:</strong> ${episodes}</p>` : ""}
        ${currentType === "manga" && chapters ? `<p><strong>Chapters:</strong> ${chapters}</p>` : ""}
      `;

      card.innerHTML = `
        <img src="${image}" alt="${title}" />
        <div class="anime-info">${infoHTML}</div>
      `;

      card.addEventListener("click", () => {
        window.location.href = currentType === "anime"
          ? `anime.html?id=${item.mal_id}`
          : `manga.html?id=${item.mal_id}`;
      });

      resultsContainer.appendChild(card);
    });

    currentPage++;
    hasMore = data.pagination?.has_next_page;
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
