console.log("browse.js is loaded");

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const genreSelect = document.getElementById("genre");
const resultsContainer = document.getElementById("results");

document.addEventListener("DOMContentLoaded", () => {
  fetchAnime("naruto", "");
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const genre = genreSelect.value;
  fetchAnime(query || "naruto", genre);
});

async function fetchAnime(query, genre) {
  resultsContainer.innerHTML = "<p>Loading...</p>";
  try {
    const url = `https://api.jikan.moe/v4/anime?q=${query}&genre=${genre}&limit=10`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      resultsContainer.innerHTML = "<p>No anime found.</p>";
      return;
    }

    resultsContainer.innerHTML = data.data.map(anime => `
      <div class="anime-card">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
        <div class="anime-info">
          <h3>${anime.title}</h3>
          <p><strong>Score:</strong> ${anime.score || "N/A"}</p>
          <p><strong>Type:</strong> ${anime.type}</p>
        </div>
      </div>
    `).join("");
  } catch (err) {
    resultsContainer.innerHTML = "<p>Error loading anime. Try again later.</p>";
    console.error(err);
  }
}
