async function fetchReleasedDataFromJikan() {
  const grouped = {};
  const currentYear = 2025;
  const today = new Date();

  async function fetchMonth(type, monthIndex) {
    const start = `${currentYear}-${String(monthIndex).padStart(2, "0")}-01`;
    const endDate = new Date(currentYear, monthIndex, 0); // last day of month
    const end = endDate.toISOString().split("T")[0];

    const url = `https://api.jikan.moe/v4/${type}?start_date=${start}&end_date=${end}&order_by=members&sort=desc&limit=15`;

    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  }

  for (let month = 1; month <= today.getMonth() + 1; month++) {
    const animeList = await fetchMonth("anime", month);
    const mangaList = await fetchMonth("manga", month);

    const monthName = new Date(currentYear, month - 1).toLocaleString("default", { month: "long" });
    if (!grouped[monthName]) grouped[monthName] = [];

    animeList.slice(0, 10).forEach(entry => {
      const dateStr = entry.aired?.from;
      if (!dateStr || new Date(dateStr) > today) return;

      grouped[monthName].push({
        title: entry.title,
        date: dateStr.slice(0, 10),
        popularity: entry.members,
        type: "Anime"
      });
    });

    mangaList.slice(0, 15).forEach(entry => {
      const dateStr = entry.published?.from;
      if (!dateStr || new Date(dateStr) > today) return;

      const type = (entry.type || "").toLowerCase() === "manhwa" ? "Manhwa" : "Manga";

      grouped[monthName].push({
        title: entry.title,
        date: dateStr.slice(0, 10),
        popularity: entry.members,
        type
      });
    });

    // Limit per type
    const byType = { Anime: [], Manga: [], Manhwa: [] };
    for (const entry of grouped[monthName]) {
      if (byType[entry.type].length < (entry.type === "Manhwa" ? 2 : 3)) {
        byType[entry.type].push(entry);
      }
    }
    grouped[monthName] = [...byType.Anime, ...byType.Manga, ...byType.Manhwa];
  }

  return grouped;
}

async function fetchUpcomingDataFromWorker() {
  try {
    const res = await fetch("https://blue-sun-2738.keshavkdas23.workers.dev/");
    if (!res.ok) throw new Error("Failed to fetch upcoming releases");
    return await res.json();
  } catch (err) {
    console.error("Upcoming fetch error:", err);
    return {};
  }
}

function renderCalendar(released, upcoming) {
  const container = document.getElementById("calendar");
  container.innerHTML = "";

  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const today = new Date();

  for (const month of allMonths) {
    const section = document.createElement("div");
    section.className = "month";

    const heading = document.createElement("h3");
    heading.textContent = month;
    section.appendChild(heading);

    const entries = [];

    if (released[month]) {
      entries.push(...released[month]);
    }

    if (upcoming[month] && (new Date(`${month} 1, 2025`) > today)) {
      entries.push(...upcoming[month]);
    }

    for (const item of entries) {
      const entry = document.createElement("div");
      entry.className = "entry";

      // Assign class based on type
      const color =
        item.type === "Anime" ? "orange" :
        item.type === "Manga" ? "limegreen" :
        item.type === "Manhwa" ? "deepskyblue" : "#aaa";

      entry.innerHTML = `
        <strong style="color:${color}">${item.title}</strong> 
        (${item.date}) 
        <span class="status">[${item.type}${item.popularity ? ", " + item.popularity : ""}]</span>
      `;
      section.appendChild(entry);
    }

    if (entries.length > 0) container.appendChild(section);
  }
}

// 🔍 Zoom Button
document.getElementById("zoomBtn").addEventListener("click", () => {
  document.getElementById("calendar").classList.toggle("zoomed");
});

// 🚀 Load on Start
(async function main() {
  const [released, upcoming] = await Promise.all([
    fetchReleasedDataFromJikan(),
    fetchUpcomingDataFromWorker()
  ]);

  renderCalendar(released, upcoming);
})();
