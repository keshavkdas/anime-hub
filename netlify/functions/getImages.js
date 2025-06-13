const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const query = event.queryStringParameters.q;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing query" }),
    };
  }

  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=5`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Unsplash API error:", errorText);
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "Failed to fetch from Unsplash" }),
      };
    }

    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Unexpected API response structure" }),
      };
    }

    const imageUrls = data.results.map((img) => img.urls.regular);

    return {
      statusCode: 200,
      body: JSON.stringify({ images: imageUrls }),
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch images" }),
    };
  }
};
