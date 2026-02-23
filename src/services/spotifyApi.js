// const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
// const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

// export const getSpotifyToken = async () => {
//   try {
//     const response = await fetch('https://accounts.spotify.com/api/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
//       },
//       body: 'grant_type=client_credentials'
//     });
//     const data = await response.json();
//     return data.access_token;
//   } catch (error) {
//     console.error("Error en Token:", error);
//     return null;
//   }
// };

// // helper used internally to perform an authenticated fetch and optionally retry once if the token is invalid
// const fetchWithRetry = async (url, token) => {
//   if (!token) {
//     console.error('[Spotify] no token supplied to fetchWithRetry');
//     return { res: null, token };
//   }

//   let res = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   // spotify returns 401/403 when the token is expired/invalid
//   if (res.status === 401 || res.status === 403) {
//     console.warn(`[Spotify] token expired/unauthorized (${res.status}), fetching a new one`);
//     const newToken = await getSpotifyToken();
//     if (newToken && newToken !== token) {
//       res = await fetch(url, {
//         headers: { Authorization: `Bearer ${newToken}` },
//       });
//       return { res, token: newToken };
//     }
//   }

//   return { res, token };
// };

// export const searchArtist = async (token, query) => {
//   if (!token) {
//     console.error('[searchArtist] no Spotify token, aborting');
//     return null;
//   }

//   try {
//     // 1. Buscamos al artista
//     const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`;
//     let { res: searchRes, token: returnedToken } = await fetchWithRetry(searchUrl, token);
//     if (!searchRes) return null;

//     if (!searchRes.ok) {
//       console.error('[Spotify] artist search failed', searchRes.status, await searchRes.text());
//       return null;
//     }

//     const data = await searchRes.json();
//     if (!data.artists?.items || data.artists.items.length === 0) return null;
//     const artist = data.artists.items[0];

//     // 2. Traemos los Top Tracks
//     const tracksUrl = `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=MX`;
//     let { res: tracksRes, token: finalToken } = await fetchWithRetry(tracksUrl, returnedToken);
//     if (!tracksRes) return null;
//     if (!tracksRes.ok) {
//       console.error('[Spotify] top-tracks request failed', tracksRes.status, await tracksRes.text());
//       return null;
//     }

//     const tracksData = await tracksRes.json();

//     const topTracks = (tracksData.tracks || []).slice(0, 10).map(track => ({
//       id: track.id,
//       name: track.name,
//       duration_ms: track.duration_ms,
//       popularity: track.popularity,
//     }));

//     return { ...artist, topTracks, _spotifyToken: finalToken };
//   } catch (error) {
//     console.error("Error en Spotify:", error);
//     return null;
//   }
// };