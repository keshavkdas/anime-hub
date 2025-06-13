const fetch = require('node-fetch');

exports.handler = async (event) => {
  const query = event.queryStringParameters.q;
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing query' }) };
  }

  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_KEY}&per_page=6`);
    const data = await res.json();
    const imageUrls = data.results.map(img => img.urls.regular);

    return {
      statusCode: 200,
      body: JSON.stringify(imageUrls),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch images" }),
    };
  }
};
