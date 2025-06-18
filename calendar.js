const API_URL = "https://blue-sun-2738.keshavkdas23.workers.dev/";

async function fetchReleaseData() {
  try {
    const res = await fetch(API_URL);
    const text = await res.text();

    // Remove Markdown fences if present
    const cleanText = text.replace(/```json|```/g, '').trim();

    const data = JSON.parse(cleanText);
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
    calendar.innerHTML = `<p style="color:#f87171">⚠️ No data returned from API</p>`;
    return;
  }

  calendar.innerHTML = "";

  Object.entries(data).forEach(([month, items]) => {
    const div = document.createElement("div");
    div.classList.add("month");
    div.innerHTML = `<h3>${month}</h3>`;
    items.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('default', { day: 'numeric', month: 'short' });
      const color = entry.type === "Anime" ? "#60a5fa" : entry.type === "Manga" ? "#facc15" : "#34d399";
      div.innerHTML += `
        <p class="entry">
          <span style="color:${color}">${entry.type}</span>: ${entry.title}
          <span class="status">(${entry.status} · ${date})</span>
        </p>`;
    });
    calendar.appendChild(div);
  });

  zoomBtn?.addEventListener("click", () => {
    calendar.classList.toggle("zoomed");
  });
}

buildCalendar();

