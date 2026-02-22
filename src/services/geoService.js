export const getRealArtistLocation = async (artistName) => {
  try {
    console.log(`🚀 Buscando origen real de ${artistName} en MusicBrainz...`);

    // PASO 1: Obtener la ciudad de origen desde MusicBrainz
    const mbUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(artistName)}&fmt=json`;
    const mbRes = await fetch(mbUrl);
    const mbData = await mbRes.json();

    if (!mbData.artists || mbData.artists.length === 0) throw new Error("Artista no hallado");

    const artist = mbData.artists[0];
    const ciudad = artist["begin-area"]?.name || artist.area?.name;

    if (!ciudad) {
      console.warn("No se encontró ciudad de origen, usando Querétaro.");
      return [20.6133, -100.4053];
    }

    console.log(`📍 Ciudad detectada: ${ciudad}. Obteniendo coordenadas...`);

    // PASO 2: Geocodificar la ciudad con Open-Meteo (CORS Friendly)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (geoData.results && geoData.results.length > 0) {
      const { latitude, longitude, country } = geoData.results[0];
      const pais = country ? `, ${country}` : "";
      console.log(`✅ Coordenadas reales: [${latitude}, ${longitude}]`);
      return {
        coords: [latitude, longitude],
        city: ciudad + pais // Guardamos el nombre real para la interfaz
      };
    }

    return { coords: [20.6133, -100.4053], city: "Querétaro, MX" };

  } catch (error) {
    console.error("Error en el Radar de Ubicación:", error);
    return [20.6133, -100.4053];
  }
};