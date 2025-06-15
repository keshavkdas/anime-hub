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

// When type (anime/manga/manhwa) is changed
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

// Load genres dynamically from Jikan
async function loadGenres() {
  const select = genreSelect;
  select.innerHTML = `<option value="">All Genres</option>`;

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
        select.appendChild(opt);
      });
  } catch (err) {
    console.error("Failed to load genres:", err);
  }
}

async function loadItems() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  resultsContainer.insertAdjacentHTML("beforeend", "<p id='loading'>Loading...</p>");

  try {
    // Fetch from manga endpoint for both "manga" and "manhwa"
    const apiType = currentType === "manhwa" ? "manga" : currentType;
    let url = `https://api.jikan.moe/v4/${apiType}?page=${currentPage}&limit=25`;

    if (currentQuery) {
      url += `&q=${encodeURIComponent(currentQuery)}`;
    }

    if (currentGenre) {
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

    // Filter manhwa manually
    const items = currentType === "manhwa"
      ? data.data.filter(item => item.type === "Manhwa")
      : data.data;

    if (items.length === 0 && currentPage === 1) {
      resultsContainer.innerHTML = "<p>No results found.</p>";
      hasMore = false;
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "anime-card";

      const title = item.title || "Untitled";
      const image = item.images?.jpg?.image_url || "";
      const score = item.score ?? "N/A";
      const type = item.type ?? "Unknown";
      const chapters = item.chapters;
      const episodes = item.episodes;
      const status = item.status;

      const infoHTML = `
        <h3>${title}</h3>
        <p><strong>Score:</strong> ${score}</p>
        <p><strong>Type:</strong> ${type}</p>
        ${currentType === "anime" && type !== "Movie" && episodes ? `<p><strong>Episodes:</strong> ${episodes}</p>` : ""}
        ${["manga", "manhwa"].includes(currentType) ? (
          chapters
            ? `<p><strong>Chapters:</strong> ${chapters}</p>`
            : status === "Publishing"
              ? `<p><strong>Chapters:</strong> Ongoing</p>`
              : `<p><strong>Chapters:</strong> Unknown</p>`
        ) : ""}
      `;

      card.innerHTML = `
        <div class="card-img-wrapper" style="cursor: pointer;">
          <img src="${image}" alt="${title}" />
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
