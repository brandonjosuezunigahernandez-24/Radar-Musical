import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
// spotify is now proxied through a serverless endpoint on Vercel
// import { getSpotifyToken, searchArtist } from './services/spotifyApi'
import { getRealArtistLocation } from './services/geoService'
import MapWidget from './components/MapWidget'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [artista, setArtista] = useState(null)
  const [favoritos, setFavoritos] = useState([])

  // Este Hook revisa si el usuario ya está logueado al cargar la página
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escucha los cambios (si inicia sesión o cierra sesión)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Función para llamar a la ventana de GitHub
  async function iniciarSesion() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    })
  }

  // Función para cerrar sesión
  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  // Función para traer los favoritos de la DB
  const traerFavoritos = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('favoritos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setFavoritos(data);
  };

  // Traer favoritos al cargar y cada vez que cambie la sesión o se guarde uno nuevo
  useEffect(() => {
    traerFavoritos();
  }, [session]);

  const manejarBusqueda = async (e) => {
    e.preventDefault();

    // llamamos a nuestro servidor Vercel en lugar de Spotify directo
    const resp = await fetch(`/api/spotify?q=${encodeURIComponent(busqueda)}`);
    if (!resp.ok) {
      console.error('error proxy spotify', resp.status);
      return;
    }
    const data = await resp.json();
    if (!data.artist) return;

    const locationData = await getRealArtistLocation(data.artist.name);
    setArtista({
      ...data.artist,
      topTracks: data.topTracks.slice(0, 10),
      coords: locationData.coords,
      city: locationData.city,
    });
  }

  const guardarFavorito = async () => {
    if (!artista || !session) return;
    const { error } = await supabase
      .from('favoritos')
      .insert([
        { 
          nombre: artista.name, 
          imagen: artista.images[0]?.url, 
          usuario_id: session.user.id 
        }
      ]);

    if (error) {
      alert("Error al guardar");
    } else {
      alert(`${artista.name} guardado en favoritos!`);
      traerFavoritos(); // recarga la lista automáticamente
    }
  }

  const eliminarFavorito = async (id) => {
    // Confirmación rápida para no borrar por error
    if (!confirm("¿Seguro que quieres eliminar este artista de tus favoritos?")) return;

    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('id', id); // Borramos el registro que coincida con ese ID

    if (error) {
      alert("Error al eliminar");
      console.error(error);
    } else {
      // IMPORTANTE: Volvemos a traer la lista para que desaparezca de la pantalla
      traerFavoritos();
    }
  }

  // === INTERFAZ CUANDO EL USUARIO NO HA INICIADO SESIÓN ===
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <h1>Bienvenido a Radar Musical</h1>
        <p style={{ color: '#B3B3B3', marginBottom: '30px' }}>Inicia sesión para descubrir y guardar a tus artistas.</p>
        <button 
          onClick={iniciarSesion}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#24292e', color: 'white', border: 'none', borderRadius: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}
        >
          Iniciar sesión con GitHub
        </button>
      </div>
    )
  }

  // === INTERFAZ CUANDO EL USUARIO SÍ ESTÁ LOGUEADO ===
  // Extraemos los datos del JSON que nos devuelve Supabase/GitHub
  const user = session.user.user_metadata

  return (
    <div className="app-container">
      {/* HEADER: Logo, Buscador y Perfil */}
      <header className="main-header">
        <div className="logo">Radar Musical</div>
        <div className="search-bar">
          <input 
            placeholder="Buscar artistas, canciones o conciertos..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && manejarBusqueda(e)}
          />
          <button onClick={manejarBusqueda}>🔍</button> 
        </div>
        <div className="user-profile" style={{position:'relative', display:'inline-block'}}>
          <img src={user.avatar_url} alt="User" style={{width:'40px',height:'40px',borderRadius:'50%'}} />
          {/* simple close icon */}
          <button
            onClick={cerrarSesion}
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              width: '18px',
              height: '18px',
              fontSize: '12px',
              lineHeight: '18px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      </header>

      <main className="content-grid">
        {artista && (
          <>
            {/* COLUMNA IZQUIERDA: Artista y Canciones */}
            <section className="artist-details">
              <div className="artist-banner" style={{ backgroundImage: `url(${artista.images[0]?.url})` }}>
                <div className="banner-overlay">
                  <h1>{artista.name}</h1>
                  <p>{artista.followers?.total?.toLocaleString() || 0} oyentes mensuales</p>
                </div>
              </div>

              <div className="tracks-container">
                <h3>CANCIONES PRINCIPALES</h3>
                {artista.topTracks?.map((track, index) => (
                  <div key={track.id} className="track-row">
                    <span className="track-index">{index + 1}</span>
                    <button className="play-btn">▶</button>
                    <div className="track-info">
                      <span className="track-name">{track.name}</span>
                      <span className="track-plays">{(Math.random() * 10).toFixed(1)}M reproducciones</span>
                    </div>
                  </div>
                ))}
                <button className="save-favorite-btn" onClick={guardarFavorito}>
                  ♡ Guardar en Favoritos
                </button>
              </div>
            </section>

            {/* COLUMNA DERECHA: Mapa con Información Real */}
            <section className="map-section">
              <div className="map-info-header">
                 <p>📍 LUGAR DE ORIGEN (RADAR)</p>
                 {/* Mostramos la ciudad real detectada */}
                 <h4>{artista.city || "Ubicación no detectada"}</h4>
                 {/* Mostramos las coordenadas reales con 4 decimales */}
                 <span>
                   {artista.coords ? `Lat: ${artista.coords[0]?.toFixed(4)} • Lon: ${artista.coords[1]?.toFixed(4)}` : "Cargando coordenadas..."}
                 </span>
              </div>
              <MapWidget lat={artista.coords[0]} lng={artista.coords[1]} />
            </section>
          </>
        )}

        {/* LISTA DE FAVORITOS */}
        {favoritos && (
          <section className="favoritos-section">
            <h3>Favoritos</h3>
            {favoritos.map((favorito) => (
              <div key={favorito.id} className="favorito-item">
                <img src={favorito.imagen} alt={favorito.nombre} />
                <span>{favorito.nombre}</span>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default App;