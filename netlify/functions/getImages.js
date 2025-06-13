const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const query = event.queryStringParameters.q;

  const UNSPLASH_KEY = process.env.UNSPLASH_KEY;

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_KEY}&per_page=6`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    const images = json.results.map((img) => img.urls.small);
    return {
      statusCode: 200,
      body: JSON.stringify(images),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch images' }),
    };
  }
};
