const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";

async function fetchReleaseData() {
  try {
    const res = await fetch(API_URL);
    const text = await res.text();

    // Remove Markdown-style ```json code block if present
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch or parse calendar data:", error);
    return null;
  }
}

async function buildCalendar() {
  const calendar = document.getElementById("calendar");
  const zoomBtn = document.getElementById("zoomBtn");

  const data = await fetchReleaseData();
  if (!data) {
    console.warn("⚠️ No data returned from API");
    calendar.innerHTML = `<p style="color: #f87171">Failed to load release calendar.</p>`;
    return;
  }

  Object.entries(data).forEach(([month, items]) => {
    const div = document.createElement("div");
    div.classList.add("month");
    div.innerHTML = `<h3>${month}</h3>`;

    items.forEach(entry => {
      const color = entry.type === "Anime"
        ? "#60a5fa"
        : entry.type === "Manga"
        ? "#facc15"
        : "#a78bfa"; // Manhwa = purple
      const date = new Date(entry.date).toLocaleDateString("default", { day: 'numeric', month: 'short' });
      div.innerHTML += `<p class="entry"><span style="color:${color}">${entry.type}</span>: ${entry.title} <span style="color:#bbb">(${date})</span> <span style="color:#22c55e">${entry.status}</span></p>`;
    });

    calendar.appendChild(div);
  });

  // Zoom toggle
  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();
