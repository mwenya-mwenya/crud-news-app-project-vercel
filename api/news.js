import { authRequired } from '../lib/middleware/auth.js';
import { fetchHeadlines } from '../lib/services/newsService.js';

export default async function handler(req, res) {
    
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ Enforce authentication
    await authRequired(req);


    // ✅ Extract and validate query parameters
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const pageSize = Math.min(30, Math.max(1, parseInt(req.query.pageSize) || 10));

    // ✅ Fetch news articles
    const items = await fetchHeadlines({ q, pageSize });

    // ✅ Respond with articles
    res.status(200).json({ items });
  } catch (e) {
     const status = e.status || 500;
    res.status(status).json({ error: e.message || 'Internal server error' });
  }
}