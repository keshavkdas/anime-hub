console.log("browse.js loaded");

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const genreSelect = document.getElementById("genre");
const resultsContainer = document.getElementById("results");

document.addEventListener("DOMContentLoaded", () => {
  fetchTrendingAnime();
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const genre = genreSelect.value;

  if (!query && !genre) {
    fetchTrendingAnime();
  } else {
    fetchFilteredAnime(query, genre);
  }
});

async function fetchTrendingAnime() {
  resultsContainer.innerHTML = "<p>Loading trending anime...</p>";
  try {
    const res = await fetch("https://api.jikan.moe/v4/top/anime?limit=12");
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      resultsContainer.innerHTML = "<p>No trending anime found.</p>";
      return;
    }

    renderAnimeCards(data.data);
  } catch (err) {
    resultsContainer.innerHTML = "<p>Error loading anime. Try again later.</p>";
    console.error(err);
  }
}

async function fetchFilteredAnime(query, genre) {
  resultsContainer.innerHTML = "<p>Loading filtered results...</p>";
  try {
    let url = `https://api.jikan.moe/v4/anime?q=${query}&limit=12`;
    if (genre) url += `&genres=${genre}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      resultsContainer.innerHTML = "<p>No anime found for your search.</p>";
      return;
    }

    renderAnimeCards(data.data);
  } catch (err) {
    resultsContainer.innerHTML = "<p>Error loading anime. Try again later.</p>";
    console.error(err);
  }
}

function renderAnimeCards(animeList) {
  resultsContainer.innerHTML = animeList.map(anime => {
    const genres = anime.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join(" ");
    return `
      <div class="anime-card">
        <a href="anime.html?id=${anime.mal_id}">
          <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
        </a>
        <div class="anime-info">
          <h3>${anime.title}</h3>
          <p><strong>Score:</strong> ${anime.score || "N/A"}</p>
          <p><strong>Type:</strong> ${anime.type}</p>
          <p><strong>Episodes:</strong> ${anime.episodes || "?"}</p>
          <div class="genres">${genres}</div>
        </div>
      </div>
    `;
  }).join("");
}
