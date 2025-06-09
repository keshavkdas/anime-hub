# Anime-hub

AnimeHub is a responsive and dynamic anime website that showcases trending and currently airing anime with a visually appealing carousel and infinite scroll anime listing. It fetches live data from the [Jikan API](https://jikan.moe/) (MyAnimeList unofficial API) to display the latest anime information, including images, synopsis, episode count, and trailers.

## Features

- **Top Anime Carousel**: Displays the latest airing anime with a large banner, title, synopsis preview (up to 3 lines), episode count, and a watch trailer button.
- **Trending Anime Section**: Infinite scroll loading of top anime with image, title, watch trailer, and add to favorites functionality.
- **Responsive Design**: Works well on desktop and mobile with smooth animations.
- **Favorites**: Add anime to favorites stored locally in browser `localStorage`.
- **Trailer Link**: Opens YouTube search for anime trailers.
- **Auto-updating Carousel**: Pulls the latest seasonal anime dynamically from API.

## Technologies Used

- Vanilla JavaScript (ES6+)
- Jikan REST API (https://api.jikan.moe)
- Splide.js Carousel Library (for trending slider)
- HTML5 & CSS3

## Setup and Usage

1. Clone or download this repository.
2. Open `index.html` (or your main HTML file) in a browser.
3. The app fetches anime data live, so make sure you have an internet connection.
4. Scroll down in the trending section to load more anime dynamically.
5. Use the carousel arrows to navigate the top airing anime.
6. Click "Watch Trailer" to open YouTube results for that anime's trailer.
7. Click the heart button to add anime to your favorites (stored locally).

## Folder Structure

/ (root)
|-- index.html
|-- styles.css
|-- script.js
|-- README.md

## API Reference

- [Jikan API v4 Documentation](https://docs.api.jikan.moe/)

## Notes

- The images in the carousel are dynamically fetched and positioned with a subtle fade effect.
- Synopsis in the carousel is truncated to maximum 3 lines for better UI.
- The infinite scroll fetches more trending anime pages as the user scrolls.
- Favorites persist across sessions via localStorage.

## Contribution

Feel free to fork the project and submit pull requests to improve features or fix bugs!

## License

This project is open-source and free to use.

---

Made with ❤️ for anime fans.
