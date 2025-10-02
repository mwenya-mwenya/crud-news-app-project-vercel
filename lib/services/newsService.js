import fetch from 'node-fetch';
import { config } from '../config/env.js'; // Load environment variables (e.g., API key)

export async function fetchHeadlines() {
  if (!config.newsApiKey) {
    throw new Error('Missing GNews API key in config');
  }

  const API_URL = 'https://gnews.io/api/v4/top-headlines';

  // Construct query parameters for the API request
  const params = new URLSearchParams({
    category: 'general',       // News category
    lang: 'en',                // Language filter
    country: 'us',             // Country filter
    max: '10',                 // Max number of articles (note: pageSize is unused here)
    apikey: config.newsApiKey  // API key from environment config
  });

  const fullUrl = `${API_URL}?${params.toString()}`; // Final URL with query string

  try {
    // Make the API request with a timeout of 10 seconds
    const resp = await fetch(fullUrl, {
      timeout: 10_000,
    });

    // Handle non-200 responses with a custom error
    if (!resp.ok) {
      const msg = await resp.text(); // Read error message from response
      throw Object.assign(
        new Error(`News API error: ${resp.status}`),
        { status: 502, details: msg }
      );
    }

    const data = await resp.json(); // Parse JSON response

    // Map raw articles to a simplified format
    const items = (data.articles || []).map(a => ({
      title: a.title,                          // Headline title
      url: a.url,                              // Link to full article
      source: a.source?.name || 'Unknown',     // News source name (fallback: 'Unknown')
      summary: a.description || '',            // Article summary (fallback: empty string)
      imageUrl: a.urlToImage || null,          // Thumbnail image URL (nullable)
      publishedAt: a.publishedAt,              // Publication timestamp
    }));
  
    return items; // Return formatted articles
  } catch (err) {
    console.error('Failed to fetch headlines:', err);
    throw Object.assign(
      new Error('Failed to fetch news'),
      { status: err.status || 500, details: err.details || err.message }
    );
  }

}