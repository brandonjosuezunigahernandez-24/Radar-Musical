// api/spotify.js
let cachedToken = null;
let tokenExpiry = 0;

// 1. Usamos las variables EXACTAS que tienes en Vercel (con VITE_)
const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET;
const lastfmKey = process.env.LASTFM_API_KEY; 

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) return cachedToken;

  // 2. URL Oficial de Spotify
  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
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

    // 3. URL Oficial con el signo $ antes de las variables
    const search = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=artist&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await search.json();
    const found = searchData.artists?.items?.[0];
    if (!found) return res.status(404).json({ error: 'Artista no encontrado' });

    // URL de Last.fm (Correcta)
    const lfmUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(found.name)}&api_key=${lastfmKey}&format=json`;
    
    // 4. URL Oficial para los detalles del artista con $
    const [detailResp, lfmRes] = await Promise.all([
      fetch(`https://api.spotify.com/v1/artists/${found.id}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(lfmUrl)
    ]);

    const artistDetails = await detailResp.json();
    const lfmData = await lfmRes.json();

    const lfmStats = lfmData.artist?.stats || { listeners: "0", playcount: "0" };

    // 5. URL Oficial para los Top Tracks con $ (usamos MX por tu región)
    const tracksResp = await fetch(
      `https://api.spotify.com/v1/artists/${found.id}/top-tracks?market=MX`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    let tracksData = await tracksResp.json();

    if (!tracksData.tracks || tracksData.tracks.length === 0) {
      const lfmTracksUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(found.name)}&api_key=${lastfmKey}&format=json&limit=10`;
      const lfmTracksRes = await fetch(lfmTracksUrl);
      const lfmTracksData = await lfmTracksRes.json();
      tracksData.tracks = (lfmTracksData.toptracks?.track || []).map(t => ({
        id: t.url,
        name: t.name,
        playcount: t.playcount,
      }));
    }

    res.json({ 
      artist: {
        ...artistDetails,
        listenersLastFM: lfmStats.listeners,
        playcountLastFM: lfmStats.playcount,
        followers: artistDetails.followers || { total: 0 }
      }, 
      topTracks: tracksData.tracks || [] 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}