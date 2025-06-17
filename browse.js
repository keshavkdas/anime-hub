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
    if (currentType === "manhwa") {
      const pageSize = 25;
      const [searchRes, topRes] = await Promise.all([
        fetch(`https://api.jikan.moe/v4/manga?page=${currentPage}&limit=${pageSize}${currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ''}`),
        fetch(`https://api.jikan.moe/v4/top/manga?subtype=manhwa&page=${currentPage}&limit=${pageSize}`)
      ]);
      const [searchData, topData] = await Promise.all([searchRes.json(), topRes.json()]);

      let combined = [];
      if (Array.isArray(searchData.data)) combined = combined.concat(searchData.data);
      if (Array.isArray(topData.data)) combined = combined.concat(topData.data);

      const allowed = ["manhwa", "manhua", "light novel", "web novel"];
      let items = combined.filter(item => allowed.includes(item.type?.toLowerCase()));

      if (currentGenre) {
        items = items.filter(item =>
          item.genres?.some(g => g.mal_id.toString() === currentGenre)
        );
      }

      const seen = new Set();
      items = items.filter(item => {
        if (seen.has(item.mal_id)) return false;
        seen.add(item.mal_id);
        return true;
      });

      items = items.slice(0, 12);

      document.getElementById("loading")?.remove();

      if (items.length === 0 && currentPage === 1) {
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
        const typeVal = item.type;
        const chapters = item.chapters;

        card.innerHTML = `
          <div class="card-img-wrapper">
            <img src="${imageUrl}" alt="${title}" />
          </div>
          <div class="anime-info">
            <h3>${title}</h3>
            <p><strong>Score:</strong> ${score}</p>
            <p><strong>Type:</strong> ${typeVal}</p>
            ${chapters ? `<p><strong>Chapters:</strong> ${chapters}</p>` : ""}
          </div>
        `;

        card.querySelector(".card-img-wrapper").addEventListener("click", () =>
          window.location.href = `manga-details.html?id=${item.mal_id}`
        );

        resultsContainer.appendChild(card);
      });

      currentPage++;
      hasMore = searchData.pagination?.has_next_page || topData.pagination?.has_next_page || false;

    } else {
      // Anime or Manga logic
      const url = `https://api.jikan.moe/v4/${currentType}?page=${currentPage}&limit=12${currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ''}${currentGenre ? `&genres=${currentGenre}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      const items = Array.isArray(data.data) ? data.data : [];
      document.getElementById("loading")?.remove();

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
        const typeVal = item.type ?? "";
        const episodes = item.episodes;
        const chapters = item.chapters;

        let infoHTML = `
          <h3>${title}</h3>
          <p><strong>Score:</strong> ${score}</p>
          <p><strong>Type:</strong> ${typeVal}</p>
        `;
        if (currentType === "anime" && typeVal !== "Movie" && episodes) {
          infoHTML += `<p><strong>Episodes:</strong> ${episodes}</p>`;
        }
        if (currentType === "manga" && chapters) {
          infoHTML += `<p><strong>Chapters:</strong> ${chapters}</p>`;
        }

        card.innerHTML = `
          <div class="card-img-wrapper"><img src="${imageUrl}" alt="${title}" /></div>
          <div class="anime-info">${infoHTML}</div>
        `;

        card.querySelector(".card-img-wrapper").addEventListener("click", () => {
          const url = currentType === "anime"
            ? `anime.html?id=${item.mal_id}`
            : `manga-details.html?id=${item.mal_id}`;
          window.location.href = url;
        });

        resultsContainer.appendChild(card);
      });

      currentPage++;
      hasMore = data.pagination?.has_next_page ?? false;
    }

  } catch (err) {
    console.error("Error fetching data:", err);
    document.getElementById("loading")?.remove();
    if (currentPage === 1) resultsContainer.innerHTML = "<p>Error loading content. Try again later.</p>";
  } finally {
    isLoading = false;
    console.log("loadItems done:", { currentType, currentPage, hasMore });
  }
}

// Infinite scroll
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadItems();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Set type to 'anime' and genre to '' on load
  document.getElementById("typeSelect").value = "anime";
  document.getElementById("genre").value = "";

  // Fetch anime on initial load
  fetchAnime("anime", "", "");
});

function fetchAnime(type, genre, query) {
  const baseUrl = "https://api.jikan.moe/v4";
  let url = `${baseUrl}/${type}?limit=24`;

  if (genre) {
    url += `&genres=${genre}`;
  }

  if (query) {
    url += `&q=${query}`;
  }

  document.getElementById("results").innerHTML = `<p style="text-align:center;">Loading...</p>`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const resultsContainer = document.getElementById("results");
      resultsContainer.innerHTML = "";

      if (data.data.length === 0) {
        resultsContainer.innerHTML = "<p>No results found.</p>";
        return;
      }

      data.data.forEach((item) => {
        const card = `
          <div class="anime-card" onclick="location.href='anime-details.html?id=${item.mal_id}'">
            <img src="${item.images.webp.large_image_url}" alt="${item.title}">
            <div class="anime-info">
              <h3>${item.title}</h3>
              <p><strong>Score:</strong> ${item.score || "N/A"}</p>
              <p><strong>Type:</strong> ${item.type}</p>
              <p><strong>Episodes:</strong> ${item.episodes || "-"}</p>
            </div>
          </div>
        `;
        resultsContainer.insertAdjacentHTML("beforeend", card);
      });
    })
    .catch((err) => {
      document.getElementById("results").innerHTML = "<p>Error loading data.</p>";
      console.error(err);
    });
}
const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

