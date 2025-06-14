async function fetchCharacterDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const container = document.getElementById('characterDetails');

  try {
    const res = await fetch(`https://api.jikan.moe/v4/characters/${id}/full`);
    const { data } = await res.json();

    container.innerHTML = `
      <div class="character-profile">
        <img src="${data.images.jpg.image_url}" alt="${data.name}" />
        <div class="character-info">
          <h1>${data.name}</h1>
          <p><strong>Kanji:</strong> ${data.name_kanji || 'N/A'}</p>
          <p><strong>Nicknames:</strong> ${data.nicknames.join(', ') || 'None'}</p>
          <p><strong>About:</strong> ${data.about ? data.about.replace(/\n/g, '<br>') : 'No description available.'}</p>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p>Failed to load character details. Try again later.</p>`;
    console.error(err);
  }
}

fetchCharacterDetails();
