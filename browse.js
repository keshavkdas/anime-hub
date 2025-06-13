console.log("browse.js loaded");

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const genreSelect = document.getElementById("genre");
const resultsContainer = document.getElementById("results");

let currentPage = 1;
let isLoading = false;
let hasMore = true;
let currentQuery = "";
let currentGenre = "";

// Initial load of trending anime
document.addEventListener("DOMContentLoaded", () => {
  loadAnime();
});

// Search button click
searchBtn.addEventListener("click", () => {
  currentQuery = searchInput.value.trim();
  currentGenre = genreSelect.value;
  currentPage = 1;
  hasMore = true;
  resultsContainer.innerHTML = "";
  loadAnime();
});

// Load anime (trending or filtered)
async function loadAnime() {
  if (isLoading || !hasMore) return;
  isLoading = true;
  resultsContainer.insertAdjacentHTML("beforeend", "<p id='loading'>Loading...</p>");

  try {
    let url = `https://api.jikan.moe/v4/anime?page=${currentPage}&limit=12`;

    if (currentQuery) {
      url += `&q=${encodeURIComponent(currentQuery)}`;
    }

    if (currentGenre) {
      url += `&genres=${currentGenre}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    document.getElementById("loading").remove();

    if (!data.data || data.data.length === 0) {
      if (currentPage === 1) {
        resultsContainer.innerHTML = "<p>No anime found.</p>";
      }
      hasMore = false;
      return;
    }

    data.data.forEach(anime => {
      const card = document.createElement("div");
      card.className = "anime-card";
      card.innerHTML = `
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
        <div class="anime-info">
          <h3>${anime.title}</h3>
          <p><strong>Score:</strong> ${anime.score || "N/A"}</p>
          <p><strong>Type:</strong> ${anime.type}</p>
          ${anime.type !== "Movie" ? `<p><strong>Episodes:</strong> ${anime.episodes}</p>` : ""}
        </div>
      `;
      card.addEventListener("click", () => {
        window.location.href = `anime.html?id=${anime.mal_id}`;
      });
      resultsContainer.appendChild(card);
    });

    currentPage++;
    hasMore = data.pagination.has_next_page;
  } catch (err) {
    console.error("Error fetching anime:", err);
    document.getElementById("loading")?.remove();
    if (currentPage === 1) {
      resultsContainer.innerHTML = "<p>Error loading anime. Try again later.</p>";
    }
  } finally {
    isLoading = false;
  }
}

// Infinite scroll
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadAnime();
  }
});
