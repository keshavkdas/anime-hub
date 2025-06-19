async function fetchReleasedDataFromJikan() {
  const today = new Date().toISOString().split("T")[0];

  const urls = {
    anime: `https://api.jikan.moe/v4/anime?start_date=2025-01-01&end_date=${today}&order_by=members&sort=desc&limit=100`,
    manga: `https://api.jikan.moe/v4/manga?start_date=2025-01-01&end_date=${today}&order_by=members&sort=desc&limit=100`
  };

  const [animeRes, mangaRes] = await Promise.all([
    fetch(urls.anime),
    fetch(urls.manga)
  ]);

  const animeList = (await animeRes.json()).data || [];
  const mangaList = (await mangaRes.json()).data || [];

  const grouped = {};

  function addToMonth(entry, type) {
    const dateStr = entry.aired?.from || entry.published?.from;
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (date.getFullYear() !== 2025 || date > new Date()) return;

    const month = date.toLocaleString("default", { month: "long" });
    if (!grouped[month]) grouped[month] = { Anime: [], Manga: [], Manhwa: [] };

    const isManhwa = (entry.type || "").toLowerCase() === "manhwa";

    const category = isManhwa ? "Manhwa" : type;
    grouped[month][category].push({
      title: entry.title,
      date: dateStr.slice(0, 10),
      popularity: entry.members
    });
  }

  animeList.forEach(anime => addToMonth(anime, "Anime"));
  mangaList.forEach(manga => {
    if ((manga.type || "").toLowerCase() === "manhwa") {
      addToMonth(manga, "Manhwa");
    } else {
      addToMonth(manga, "Manga");
    }
  });

  // Sort and trim per month
  for (const month in grouped) {
    grouped[month].Anime = grouped[month].Anime.sort((a, b) => b.popularity - a.popularity).slice(0, 2);
    grouped[month].Manga = grouped[month].Manga.sort((a, b) => b.popularity - a.popularity).slice(0, 2);
    grouped[month].Manhwa = grouped[month].Manhwa.sort((a, b) => b.popularity - a.popularity).slice(0, 1);
  }

  return grouped;
}

async function fetchUpcomingDataFromWorker() {
  const res = await fetch("https://blue-sun-2738.keshavkdas23.workers.dev/");
  if (!res.ok) {
    console.error("Failed to fetch upcoming releases");
    return {};
  }

  return await res.json();
}

function mergeReleasedAndUpcoming(released, upcoming) {
  const merged = { ...released };

  for (const month in upcoming) {
    if (!merged[month]) {
      merged[month] = { Anime: [], Manga: [], Manhwa: [] };
    }

    upcoming[month].forEach(item => {
      if (!merged[month][item.type]) merged[month][item.type] = [];
      merged[month][item.type].push(item);
    });

    // Optional: sort after merge
    merged[month].Anime = merged[month].Anime.sort((a, b) => b.popularity - a.popularity).slice(0, 5);
    merged[month].Manga = merged[month].Manga.sort((a, b) => b.popularity - a.popularity).slice(0, 5);
    merged[month].Manhwa = merged[month].Manhwa.sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  }

  return merged;
}

function renderCalendar(data) {
  const container = document.getElementById("calendar");
  container.innerHTML = "";

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (const month of months) {
    const monthData = data[month];
    if (!monthData) continue;

    const section = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = month;
    section.appendChild(summary);

    for (const type of ["Anime", "Manga", "Manhwa"]) {
      const list = monthData[type];
      if (!list?.length) continue;

      const heading = document.createElement("h4");
      heading.textContent = type;
      section.appendChild(heading);

      const ul = document.createElement("ul");
      for (const item of list) {
        const li = document.createElement("li");
        li.textContent = `${item.title} (${item.date}) — Popularity: ${item.popularity}`;
        ul.appendChild(li);
      }

      section.appendChild(ul);
    }

    container.appendChild(section);
  }
}

(async function main() {
  const [released, upcoming] = await Promise.all([
    fetchReleasedDataFromJikan(),
    fetchUpcomingDataFromWorker()
  ]);

  const merged = mergeReleasedAndUpcoming(released, upcoming);
  renderCalendar(merged);
})();
