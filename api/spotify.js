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
    console.log('[api/spotify] searchData', searchData);
    const found = searchData.artists?.items?.[0];
    if (!found) return res.status(404).end();

    // get full artist details (includes follower count, genres, etc.)
    const detailResp = await fetch(`https://api.spotify.com/v1/artists/${found.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const artistDetails = await detailResp.json();
    if (!detailResp.ok) {
      console.warn('[api/spotify] artist detail fetch failed', detailResp.status, artistDetails);
    }

    // Spotify requires a market parameter; US is a safe default since MX caused
    // 403 responses from some client‑credentials tokens when called directly.
    const tracks = await fetch(
      `https://api.spotify.com/v1/artists/${found.id}/top-tracks?market=US`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const tracksData = await tracks.json();
    if (!tracks.ok) {
      console.error('[api/spotify] top-tracks error', tracks.status, tracksData);
    }

    if (!tracksData.tracks || tracksData.tracks.length === 0) {
      // fallback a Last.fm en lugar de álbumes
      const lastfmKey = process.env.LASTFM_API_KEY;
      const lfmUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(found.name)}&api_key=${lastfmKey}&format=json&limit=10`;
      const lfmRes = await fetch(lfmUrl);
      const lfmData = await lfmRes.json();
      tracksData.tracks = (lfmData.toptracks?.track || []).map(t => ({
        id: t.url, // o algún hash
        name: t.name,
        playcount: t.playcount,
      }));
    }

    // Asegurar que followers está presente
    const responseArtist = {
      ...artistDetails,
      followers: artistDetails.followers || { total: 0 },
    };

    res.json({ artist: responseArtist, topTracks: tracksData.tracks || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'spotify error' });
  }
}
