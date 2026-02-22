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
    // 1. Buscamos al artista
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`;
    const res = await fetch(searchUrl, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    const data = await res.json();
    
    if (!data.artists?.items || data.artists.items.length === 0) return null;
    const artist = data.artists.items[0];

    // 2. Traemos los Top Tracks
    const tracksUrl = `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=MX`;
    const tracksRes = await fetch(tracksUrl, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    const tracksData = await tracksRes.json();

    const topTracks = (tracksData.tracks || []).slice(0, 10).map(track => ({
      id: track.id,
      name: track.name,
      duration_ms: track.duration_ms,
      popularity: track.popularity
    }));

    return { ...artist, topTracks };
  } catch (error) {
    console.error("Error en Spotify:", error);
    return null;
  }
};