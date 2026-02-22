// This is a Vercel Serverless Function. It runs on the server
// and can safely use your secret Spotify credentials.

let cachedToken = null;
let tokenExpiry = 0;

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) {
    return cachedToken;
  }

  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'missing q parameter' });

  try {
    const token = await getToken();

    const search = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=artist&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await search.json();
    const artist = searchData.artists?.items?.[0];
    if (!artist) return res.status(404).end();

    // Spotify requires a market parameter; US is a safe default since MX caused
    // 403 responses from some client‑credentials tokens when called directly.
    const tracks = await fetch(
      `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const tracksData = await tracks.json();
    if (!tracks.ok) {
      console.error('[api/spotify] top-tracks error', tracks.status, tracksData);
    }

    res.json({ artist, topTracks: tracksData.tracks || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'spotify error' });
  }
}
