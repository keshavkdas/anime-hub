// netlify/functions/getImages.js

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const { q } = event.queryStringParameters || {};

    if (!q) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing query" }),
      };
    }

    const UNSPLASH_KEY = process.env.UNSPLASH_KEY;

    const unsplashURL = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=6&client_id=${UNSPLASH_KEY}`;

    const response = await fetch(unsplashURL);
    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch from Unsplash" }),
      };
    }

    const data = await response.json();
    const images = data.results.map(item => item.urls.regular);

    return {
      statusCode: 200,
      body: JSON.stringify({ images }),
    };
  } catch (err) {
    console.error("Image fetch error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
