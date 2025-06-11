console.log("browse.js loaded");

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const genreSelect = document.getElementById("genre");
const resultsContainer = document.getElementById("results");

document.addEventListener("DOMContentLoaded", () => {
  fetchAnime("top");
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const genre = genreSelect.value;
  fetchAnime(query || "", genre);
});

async function fetchAnime(query = "", genre = "") {
  resultsContainer.innerHTML = "<p>Loading...</p>";
  try {
    let url = "";

    // If query is "top", show top anime on page 1
    if (query === "top") {
      url = "https://api.jikan.moe/v4/top/anime?limit=20";
    } else {
      url = `https://api.jikan.moe/v4/anime?q=${query}&limit=20`;
      if (genre) url += `&genres=${genre}`;
    }
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      resultsContainer.innerHTML = "<p>No anime found.</p>";
      return;
    }

     resultsContainer.innerHTML = "";

    // Group anime by genre
    const genreMap = new Map();

    data.data.forEach(anime => {
      const genres = anime.genres.map(g => g.name);
      genres.forEach(name => {
        if (!genreMap.has(name)) genreMap.set(name, []);
        genreMap.get(name).push(anime);
      });
    });

    genreMap.forEach((animeList, genreName) => {
      const genreSection = document.createElement("div");
      genreSection.classList.add("genre-section");

      const heading = document.createElement("h2");
      heading.textContent = `🎭 ${genreName}`;
      genreSection.appendChild(heading);

      const list = document.createElement("div");
      list.classList.add("anime-genre-list");

      animeList.forEach(anime => {
        const card = document.createElement("div");
        card.classList.add("anime-card");
        card.innerHTML = `
          <a href="anime.html?id=${anime.mal_id}">
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
            <div class="anime-info">
              <h3>${anime.title}</h3>
              <p><strong>Score:</strong> ${anime.score || "N/A"}</p>
              <p><strong>Type:</strong> ${anime.type}</p>
              <p><strong>Episodes:</strong> ${anime.episodes || "?"}</p>
            </div>
          </a>
        `;
        list.appendChild(card);
      });

      genreSection.appendChild(list);
      resultsContainer.appendChild(genreSection);
    });

  } catch (err) {
    resultsContainer.innerHTML = "<p>Error loading anime. Try again later.</p>";
    console.error(err);
  }
}
