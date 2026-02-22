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
  } catch (error) { return null; }
};

export const searchArtist = async (token, query) => {
  try {
    // URL OFICIAL DE SPOTIFY
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    
    if (!data.artists?.items.length) return null;
    const artist = data.artists.items[0];

    // URL OFICIAL DE TOP TRACKS
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
  } catch (error) { return null; }
};