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
let currentType = "all";

const blockedGenres = ["Hentai", "Erotica", "Ecchi","Harem"];

typeSelect.addEventListener("change", () => {
  currentType = typeSelect.value;
  searchInput.placeholder = `Search ${currentType}`;
  currentQuery = "";
  currentGenre = "";
  currentPage = 1;
  hasMore = true;
  resultsContainer.innerHTML = "";
  loadGenres();
  if (currentType === "all") {
    loadMixedContent();
  } else {
    loadItems();
  }
});

searchBtn.addEventListener("click", () => {
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  hasMore = true;
  resultsContainer.innerHTML = "";
  loadItems();
});

genreSelect.addEventListener("change", () => {
  currentGenre = genreSelect.value;
  currentQuery = searchInput.value.trim();
  currentPage = 1;
  hasMore = true;
  resultsContainer.innerHTML = "";
  loadItems();
});

function isAdult(item) {
  const allGenres = [...(item.genres || []), ...(item.themes || []), ...(item.demographics || [])]
    .map(g => g.name?.toLowerCase());
  return allGenres.some(g =>
    blockedGenres.includes(g) ||
    g.includes("love") ||
    g.includes("sex")
  );
}

async function loadGenres() {
  genreSelect.innerHTML = `<option value="">All Genres</option>`;
  const apiType = currentType === "manhwa" ? "manga" : (currentType === "all" ? "anime" : currentType);
  try {
    const res = await fetch(`https://api.jikan.moe/v4/genres/${apiType}`);
    const json = await res.json();
    if (!json.data) throw new Error("Invalid API response");

    const filteredGenres = json.data.filter(g => {
      const name = g.name?.toLowerCase();
      return !/hentai|ecchi|erotica|love|harem|sex/.test(name);
    });

    filteredGenres
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

async function loadMixedContent() {
  isLoading = true;
  resultsContainer.insertAdjacentHTML("beforeend", "<p id='loading'>Loading...</p>");

  try {
    const [animeRes, mangaRes, manhwaRes] = await Promise.all([
      fetch(`https://api.jikan.moe/v4/anime?page=${currentPage}&limit=10`),
      fetch(`https://api.jikan.moe/v4/manga?page=${currentPage}&limit=10`),
      fetch(`https://api.jikan.moe/v4/top/manga?filter=bypopularity&type=manhwa&page=${currentPage}&limit=10`)
    ]);

    const [animeData, mangaData, manhwaData] = await Promise.all([
      animeRes.json(),
      mangaRes.json(),
      manhwaRes.json()
    ]);

    let allItems = [];
    if (Array.isArray(animeData.data)) {
      allItems.push(...animeData.data.map(item => ({ ...item, _type: "anime" })));
    }
    if (Array.isArray(mangaData.data)) {
      allItems.push(...mangaData.data.map(item => ({ ...item, _type: "manga" })));
    }
    if (Array.isArray(manhwaData.data)) {
      const allowedTypes = ["manhwa", "manhua", "light novel", "web novel"];
      const filtered = manhwaData.data.filter(item => allowedTypes.includes(item.type?.toLowerCase()));
      allItems.push(...filtered.map(item => ({ ...item, _type: "manhwa" })));
    }

    allItems = allItems.filter(item => !isAdult(item));
    allItems.sort(() => 0.5 - Math.random());

    document.getElementById("loading")?.remove();

    renderItems(allItems);
    currentPage++;
    hasMore = true;

  } catch (err) {
    console.error("Failed to load mixed content:", err);
    document.getElementById("loading")?.remove();
    resultsContainer.innerHTML = "<p>Error loading content.</p>";
    hasMore = false;
  } finally {
    isLoading = false;
  }
}

async function loadItems() {
  if (isLoading || !hasMore || currentType === "all") return;
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

      const allowedTypes = ["manhwa", "manhua", "light novel", "web novel"];
      let items = combined.filter(item =>
        allowedTypes.includes(item.type?.toLowerCase()) && !isAdult(item)
      );

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

      items.sort(() => 0.5 - Math.random());
      items = items.slice(0, 12);
      document.getElementById("loading")?.remove();

      if (items.length === 0 && currentPage === 1) {
        resultsContainer.innerHTML = "<p>No results found.</p>";
        hasMore = false;
        return;
      }

      renderItems(items);
      currentPage++;
      hasMore = searchData.pagination?.has_next_page || topData.pagination?.has_next_page || false;

    } else {
      const url = `https://api.jikan.moe/v4/${currentType}?page=${currentPage}&limit=12${currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ''}${currentGenre ? `&genres=${currentGenre}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      let items = Array.isArray(data.data) ? data.data : [];
      items = items.filter(item => !isAdult(item));

      items.sort(() => 0.5 - Math.random());

      document.getElementById("loading")?.remove();

      if (!items.length && currentPage === 1) {
        resultsContainer.innerHTML = "<p>No results found.</p>";
        hasMore = false;
        return;
      }

      renderItems(items);
      currentPage++;
      hasMore = data.pagination?.has_next_page ?? false;
    }

  } catch (err) {
    console.error("Error fetching data:", err);
    document.getElementById("loading")?.remove();
    if (currentPage === 1) resultsContainer.innerHTML = "<p>Error loading content. Try again later.</p>";
  } finally {
    isLoading = false;
  }
}

function renderItems(items) {
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "anime-card";

    const title = item.title || "Untitled";
    const imageUrl = item.images?.jpg?.large_image_url || "";
    const score = item.score ?? "N/A";
    const typeVal = item._type || currentType || item.type || "";
    const episodes = item.episodes;
    const chapters = item.chapters;

    let infoHTML = `
      <h3>${title}</h3>
      <p><strong>Score:</strong> ${score}</p>
    `;
    if (typeVal === "anime" && episodes && item.type !== "Movie") {
      infoHTML += `<p><strong>Episodes:</strong> ${episodes}</p>`;
    }
    if ((typeVal === "manga" || typeVal === "manhwa") && chapters) {
      infoHTML += `<p><strong>Chapters:</strong> ${chapters}</p>`;
    }

    const tagLabel = `<div class="tag-label ${typeVal.toLowerCase()}">${typeVal}</div>`;

    card.innerHTML = `
      <div class="card-img-wrapper">${tagLabel}<img src="${imageUrl}" alt="${title}" /></div>
      <div class="anime-info">${infoHTML}</div>
    `;

    card.querySelector(".card-img-wrapper").addEventListener("click", () => {
      const url = typeVal === "anime"
        ? `anime.html?id=${item.mal_id}`
        : `manga-details.html?id=${item.mal_id}&type=${typeVal}`;
      window.location.href = url;
    });

    resultsContainer.appendChild(card);
  });
}

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    if (currentType === "all") {
      loadMixedContent();
    } else {
      loadItems();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  currentType = typeSelect.value;
  searchInput.placeholder = `Search ${currentType}`;
  currentQuery = "";
  currentGenre = "";
  currentPage = 1;
  hasMore = true;
  resultsContainer.innerHTML = "";

  loadGenres();
  if (currentType === "all") {
    loadMixedContent();
  } else {
    loadItems();
  }

  const backToTopBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
