# 📡 Radar Musical - Explorador de Origen Artístico

**Radar Musical** es una aplicación web orientada a servicios (SOA) diseñada para conectar a los usuarios con el contexto geográfico y personal de sus artistas favoritos. Este proyecto fue desarrollado como parte de la evaluación de la Unidad II en la **Universidad Tecnológica de Querétaro (UTEQ)**.

La aplicación permite a los usuarios buscar artistas, visualizar su "Top 10" de pistas más populares, geolocalizar su lugar de origen en un mapa interactivo y gestionar una lista personalizada de favoritos.

## 🚀 Características y Tecnologías

### 🛠️ Integración de APIs (Arquitectura SOA)
Para cumplir con los requisitos de la rúbrica, se integraron 4 tipos de servicios externos:

1.  **Streaming (Contenido):** [Spotify Web API](https://developer.spotify.com/) para recuperar catálogos musicales y metadatos de artistas.
2.  **Geolocalización (Servicio Compuesto):** * [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API) para identificar el área de origen real del artista.
    * [Open-Meteo Geocoding](https://open-meteo.com/) para transformar ciudades en coordenadas (Lat/Lon).
    * [Leaflet](https://leafletjs.com/) para el renderizado de mapas interactivos.
3.  **Base de Datos (Persistencia):** [Supabase](https://supabase.com/) (PostgreSQL) para gestionar el CRUD de artistas favoritos.
4.  **Autenticación:** GitHub OAuth (vía Supabase Auth) para un acceso seguro y personalizado.

### 💻 Stack Tecnológico
* **Frontend:** React.js con Vite.
* **Estilos:** CSS3 (Diseño responsivo basado en Mockups de Figma).
* **Gestión de Estado:** React Hooks (`useState`, `useEffect`).

## 📦 Instalación y Configuración

Si deseas ejecutar este proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/radar-musical.git](https://github.com/tu-usuario/radar-musical.git)
    cd radar-musical
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales:
    ```env
    VITE_SPOTIFY_CLIENT_ID=tu_client_id
    VITE_SPOTIFY_CLIENT_SECRET=tu_client_secret
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_anon_key
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

## 📸 Demo de la Interfaz
La interfaz fue diseñada siguiendo principios de usabilidad, con un banner dinámico para el artista, una sección de mapas que se desplaza automáticamente al origen detectado y un carrusel de favoritos con persistencia real en base de datos.
<img width="1910" height="1435" alt="image" src="https://github.com/user-attachments/assets/0d63bdd9-743f-4e6b-90e4-bec21909a0dd" />

---
**Autor:** Brandon Josué Zúñiga Hernández  
**Institución:** Universidad Tecnológica de Querétaro (UTEQ)  
**Carrera:** Ingeniería en Tecnologías de la Información e Innovación Digital
