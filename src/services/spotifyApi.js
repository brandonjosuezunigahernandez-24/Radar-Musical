const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export const getSpotifyToken = async () => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      },
      body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error en Token:", error);
    return null;
  }
};

export const searchArtist = async (token, query) => {
  try {
    // 1. Buscamos al artista (URL REAL)
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const searchData = await searchRes.json();
    
    if (!searchData.artists?.items.length) return null;
    const artist = searchData.artists.items[0];

    // 2. Traemos sus éxitos (URL REAL)
    const tracksRes = await fetch(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=MX`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tracksData = await tracksRes.json();

    const topTracks = (tracksData.tracks || []).slice(0, 10).map(t => ({
      id: t.id,
      name: t.name,
      duration_ms: t.duration_ms
    }));

    return { ...artist, topTracks };
  } catch (error) {
    console.error("Error en Search:", error);
    return null;
  }
};