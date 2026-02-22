export const getArtistLocation = async (artistName) => {
  try {
    console.log(`🔎 Buscando origen real de: ${artistName}...`);

    // PASO 1: Buscar al artista para ver si su página tiene coordenadas
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&titles=${encodeURIComponent(artistName)}&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId !== "-1" && pages[pageId].coordinates) {
      return [pages[pageId].coordinates[0].lat, pages[pageId].coordinates[0].lon];
    }

    // PASO 2: Si no tiene (como Joji), buscamos "Hometown of [Artist]"
    // Esto nos dará casi siempre la ciudad real (Ej. Osaka para Joji)
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=hometown%20of%20${encodeURIComponent(artistName)}&gsrlimit=1&prop=coordinates&format=json&origin=*`;
    const sRes = await fetch(searchUrl);
    const sData = await sRes.json();

    if (sData.query && sData.query.pages) {
      const sPages = sData.query.pages;
      const sPageId = Object.keys(sPages)[0];
      if (sPages[sPageId].coordinates) {
        const coords = sPages[sPageId].coordinates[0];
        console.log(`✅ Ubicación real detectada: ${sPages[sPageId].title}`);
        return [coords.lat, coords.lon];
      }
    }

    console.warn("No se hallaron coordenadas, moviendo a punto neutral.");
    return [20.6133, -100.4053]; // UTEQ

  } catch (error) {
    console.error("Error en Wiki API:", error);
    return [20.6133, -100.4053];
  }
};