// Vercel Serverless Function to proxy GitHub API requests
// This keeps the GitHub token secure on the server side

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  const { endpoint, method = 'GET', body } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint' });
  }

  // Only allow requests to the specific repo
  const allowedRepo = 'owenhudsondesign/evelynhudsonsite';
  if (!endpoint.startsWith(`/repos/${allowedRepo}`)) {
    return res.status(403).json({ error: 'Forbidden endpoint' });
  }

  try {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      method,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'EvelynHudsonSite-Upload'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('GitHub API error:', error);
    return res.status(500).json({ error: 'Failed to contact GitHub API' });
  }
}
