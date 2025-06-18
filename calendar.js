// For anime releases – Kitsu
async function fetchAnimeReleases() {
  const res = await fetch("https://kitsu.io/api/edge/anime?sort=startDate&page[limit]=20");
  const data = await res.json();
  return data.data.map(item => ({
    title: item.attributes.titles.en_jp || item.attributes.titles.en || "Untitled Anime",
    type: "Anime",
    date: item.attributes.startDate
  }));
}

// For manga releases – uses your Cloudflare Worker (secret is hidden!)
// For manga releases – via Cloudflare Worker (auth-manga-dex)
async function fetchMangaReleases() {
  try {
    const res = await fetch("https://auth-manga-dex.keshavkdas23.workers.dev/");
    const data = await res.json();
    return data.data.map(item => ({
      title: item.attributes.title.en || "Untitled Manga",
      type: "Manga",
      date: item.attributes.year ? `${item.attributes.year}-01-01` : "2025-01-01"
    }));
  } catch (error) {
    console.error("❌ Cloudflare Worker fetch failed:", error);
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

  // Zoom button
  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();
