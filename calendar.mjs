import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.MANGADEX_ACCESS_TOKEN;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const calendar = Array.from({ length: 12 }, () => []);

function addToMonth(dateString, title, type) {
  const date = new Date(dateString);
  if (isNaN(date)) return;
  const monthIndex = date.getMonth();
  calendar[monthIndex].push({ title, type, date: date.toDateString() });
}

async function fetchKitsuAnime() {
  console.log("Fetching Anime from Kitsu...");
  try {
    const response = await fetch("https://kitsu.io/api/edge/anime?page[limit]=20&sort=-startDate");
    const json = await response.json();

    const animeList = json.data || [];
    animeList.forEach(item => {
      const attributes = item.attributes;
      const startDate = attributes?.startDate;
      const title = attributes?.canonicalTitle || attributes?.titles?.en || "Unknown Anime";

      if (startDate && title) {
        addToMonth(startDate, title, "Anime");
      }
    });
  } catch (err) {
    console.error("❌ Kitsu fetch error:", err);
  }
}

async function fetchMangaDex() {
  console.log("Fetching Manga/Manhwa from MangaDex...");
  try {
    const response = await fetch(
      'https://api.mangadex.org/manga?limit=20&order[createdAt]=desc&includes[]=tags',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'anime-hub/1.0 (https://github.com/keshavkdas)' // Change to your actual site if public
        }
      }
    );

    const json = await response.json();
    const data = json.data || [];

    data.forEach(manga => {
      const titleObj = manga.attributes?.title;
      const createdAt = manga.attributes?.createdAt;
      const tags = manga.attributes?.tags.map(t => t.attributes?.name?.en?.toLowerCase()) || [];

      const title = titleObj?.en || Object.values(titleObj)[0] || "Untitled";

      let type = "Manga";
      if (tags.includes("manhwa")) type = "Manhwa";
      else if (tags.includes("manhua")) type = "Manhua";

      if (createdAt && title) {
        addToMonth(createdAt, title, type);
      }
    });
  } catch (err) {
    console.error("❌ MangaDex fetch error:", err);
  }
}

function renderCalendar() {
  console.log("📅 Release Calendar");
  monthNames.forEach((month, index) => {
    const entries = calendar[index];
    if (entries.length > 0) {
      console.log(`\n🔸 ${month}`);
      entries.sort((a, b) => new Date(a.date) - new Date(b.date));
      entries.forEach(e => {
        console.log(`  [${e.type}] ${e.date} – ${e.title}`);
      });
    }
  });
}

async function main() {
  await fetchKitsuAnime();
  await fetchMangaDex();
  renderCalendar();
}

main();
