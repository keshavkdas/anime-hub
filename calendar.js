const MANGADEX_PROXY_URL = "https://auth-manga-dex.keshavkdas23.workers.dev/";

async function fetchAnimeReleases() {
  const res = await fetch("https://kitsu.io/api/edge/anime?sort=startDate&page[limit]=20");
  const data = await res.json();
  return data.data.map(item => ({
    title: item.attributes.titles.en_jp || item.attributes.titles.en || "Untitled Anime",
    type: "Anime",
    date: item.attributes.startDate
  }));
}

async function fetchMangaReleases() {
  try {
    const res = await fetch(MANGADEX_PROXY_URL);
    const data = await res.json();

    // ✅ Data is already formatted by the Cloudflare Worker
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch manga:", error);
    return [];
  }
}

async function buildCalendar() {
  const calendar = document.getElementById("calendar");
  const zoomBtn = document.getElementById("zoomBtn");

  let releases = [];
  try {
    const [anime, manga] = await Promise.all([
      fetchAnimeReleases(),
      fetchMangaReleases()
    ]);
    releases = [...anime, ...manga];
  } catch (e) {
    console.error("❌ Error fetching data:", e);
    releases = [];
  }

  // Group by Month-Year
  const grouped = {};
  releases.forEach(item => {
    if (!item.date) return;
    const date = new Date(item.date);
    const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(item);
  });

  Object.entries(grouped).forEach(([month, items]) => {
    const div = document.createElement("div");
    div.classList.add("month");
    div.innerHTML = `<h3>${month}</h3>`;
    items.forEach(entry => {
      const d = new Date(entry.date).toLocaleDateString('default', { day: 'numeric', month: 'short' });
      const color = entry.type === "Anime" ? "#60a5fa" : "#facc15";
      div.innerHTML += `<p class="entry"><span style="color:${color}">${entry.type}</span>: ${entry.title} <span style="color:#bbb">(${d})</span></p>`;
    });
    calendar.appendChild(div);
  });

  // Zoom toggle
  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();
