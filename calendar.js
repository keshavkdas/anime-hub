const WORKER_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";

// Mapping type to color
const typeColors = {
  Anime: "#60a5fa",   // Blue
  Manga: "#facc15",   // Yellow
  Manhwa: "#34d399"   // Green
};

async function fetchReleaseData() {
  try {
    const res = await fetch(WORKER_URL);
    const json = await res.json();
    return json;
  } catch (e) {
    console.error("❌ Failed to fetch release data:", e);
    return {};
  }
}

function createEntry(entry) {
  const color = typeColors[entry.type] || "#ccc";
  const date = entry.date ? new Date(entry.date).toLocaleDateString('default', {
    day: 'numeric',
    month: 'short'
  }) : "";

  return `<p class="entry">
    <span style="color:${color}">${entry.type}</span>: ${entry.title}
    <span style="color:#bbb">(${date})</span>
  </p>`;
}

function createMonthCard(month, released = [], upcoming = []) {
  const div = document.createElement("div");
  div.classList.add("month");

  let html = `<h3>${month}</h3>`;

  if (released.length) {
    html += `<h4 style="color:#22c55e;">✅ Released</h4>`;
    released.forEach(item => html += createEntry(item));
  }

  if (upcoming.length) {
    html += `<h4 style="color:#f43f5e;">🕒 Upcoming</h4>`;
    upcoming.forEach(item => html += createEntry(item));
  }

  div.innerHTML = html;
  return div;
}

async function buildCalendar() {
  const calendar = document.getElementById("calendar");
  const zoomBtn = document.getElementById("zoomBtn");

  const data = await fetchReleaseData();
  calendar.innerHTML = "";

  // Sort months in order: Jan 2025 to Dec 2025 (or up to June 2026 if needed)
  const sortedMonths = Object.keys(data).sort((a, b) => {
    const toDate = (m) => new Date(`${m} 1`);
    return toDate(a) - toDate(b);
  });

  for (const month of sortedMonths) {
    const entry = data[month];
    const released = entry.Released || [];
    const upcoming = entry.Upcoming || [];
    const card = createMonthCard(month, released, upcoming);
    calendar.appendChild(card);
  }

  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();
