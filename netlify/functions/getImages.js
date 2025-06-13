const fetch = require('node-fetch');

exports.handler = async (event) => {
  const query = event.queryStringParameters.q;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing query" }),
    };
  }

  const UNSPLASH_KEY = process.env.UNSPLASH_KEY;

  if (!UNSPLASH_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Unsplash API key" }),
    };
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&client_id=${UNSPLASH_KEY}`
    );
    const data = await res.json();

    if (!data.results) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to fetch images" }),
      };
    }

    const imageUrls = data.results.map(photo => photo.urls.regular);

    return {
      statusCode: 200,
      body: JSON.stringify({ images: imageUrls }),
    };
  } catch (err) {
    console.error("Error fetching from Unsplash:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch from Unsplash" }),
    };
  }
};
