const WORKER_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";

async function fetchReleaseData() {
  try {
    const res = await fetch(WORKER_URL);
    const json = await res.json();
    console.log("✅ Fetched data:", json);
    return json;
  } catch (error) {
    console.error("❌ Failed to fetch calendar data:", error);
    return {};
  }
}

function createEntryHTML(entry) {
  const colorMap = {
    Anime: "#60a5fa",
    Manga: "#facc15",
    Manhwa: "#34d399"
  };
  const color = colorMap[entry.type] || "#fff";
  const dateStr = new Date(entry.date).toLocaleDateString('default', { day: 'numeric', month: 'short' });
  return `<p class="entry"><span style="color:${color}; font-weight:bold">${entry.type}</span>: ${entry.title} <span style="color:#bbb">(${dateStr})</span></p>`;
}

async function buildCalendar() {
  const calendar = document.getElementById("calendar");
  const zoomBtn = document.getElementById("zoomBtn");

  const data = await fetchReleaseData();

  Object.entries(data).forEach(([month, categories]) => {
    const div = document.createElement("div");
    div.classList.add("month");

    div.innerHTML = `<h3>${month}</h3>`;

    const released = categories.Released || [];
    const upcoming = categories.Upcoming || [];

    if (released.length > 0) {
      div.innerHTML += `<p style="margin: 0.3rem 0; color: #4ade80; font-weight: bold;">Released</p>`;
      released.forEach(entry => {
        div.innerHTML += createEntryHTML(entry);
      });
    }

    if (upcoming.length > 0) {
      div.innerHTML += `<p style="margin: 0.3rem 0; color: #f97316; font-weight: bold;">Upcoming</p>`;
      upcoming.forEach(entry => {
        div.innerHTML += createEntryHTML(entry);
      });
    }

    calendar.appendChild(div);
  });

  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();
