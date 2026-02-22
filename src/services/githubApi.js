// Función para obtener los datos del perfil de GitHub
export const getGitHubProfile = async () => {
  try {
    // Hacemos la petición GET a la API pública usando tu usuario
    const response = await fetch('https://api.github.com/users/brandonjosuezunigahernandez-24');
    
    // Validamos que la respuesta sea correcta (Status 200)
    if (!response.ok) {
      throw new Error('Error al conectar con la API de GitHub');
    }
    
    // Convertimos la respuesta a formato JSON (Requisito clave de tu rúbrica)
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Hubo un problema con la petición Fetch:", error);
    return null;
  }
};