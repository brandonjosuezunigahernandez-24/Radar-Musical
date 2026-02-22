export const getRealArtistLocation = async (artistName) => {
  try {
    const mbUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(artistName)}&fmt=json`;
    const mbRes = await fetch(mbUrl);
    const mbData = await mbRes.json();

    let ciudad = mbData.artists?.[0]?.["begin-area"]?.name || mbData.artists?.[0]?.area?.name;

    if (!ciudad) {
       // RETORNO DE SEGURIDAD (Siempre el mismo formato)
       return { coords: [20.6133, -100.4053], city: "Ubicación no disponible" };
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (geoData.results?.length > 0) {
      return {
        coords: [geoData.results[0].latitude, geoData.results[0].longitude],
        city: ciudad
      };
    }
    return { coords: [20.6133, -100.4053], city: ciudad };
  } catch (error) {
    return { coords: [20.6133, -100.4053], city: "Error de conexión" };
  }
};