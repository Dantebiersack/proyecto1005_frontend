import api from './api'; 

/**
 * Obtiene todas las categorías activas.
 */
export const getActiveCategories = async () => {
  try {
    const response = await api.get('/Categorias');
   
    return response.data.filter(cat => cat.Estado === true); 

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw new Error('No se pudieron cargar las categorías');
  }
};