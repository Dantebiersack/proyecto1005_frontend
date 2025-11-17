import api from "./api"; 


export async function getPersonal(includeInactive = false, idNegocio = null) {
  try {
    const response = await api.get(`/Personal`, {
      params: { 
        includeInactive: includeInactive,
        idNegocio: idNegocio 
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error en getPersonal:", error.response || error);
    throw error;
  }
}


export async function createPersonal(personalData) {
  try {
    const response = await api.post(`/Personal`, personalData);
    return response.data;
  } catch (error) {
    console.error("Error en createPersonal:", error.response || error);
    throw error;
  }
}


export async function updatePersonal(idPersonal, personalData) {
  try {
    const response = await api.put(`/Personal/${idPersonal}`, personalData);
    return response.data;
  } catch (error) {
    console.error("Error en updatePersonal:", error.response || error);
    throw error;
  }
}


export async function deletePersonal(idPersonal) {
  try {
    const response = await api.delete(`/Personal/${idPersonal}`);
    return response.data;
  } catch (error) {
    console.error("Error en deletePersonal:", error.response || error);
    throw error;
  }
}


export async function restorePersonal(idPersonal) {
  try {
    const response = await api.patch(`/Personal/${idPersonal}/restore`);
    return response.data;
  } catch (error) {
    console.error("Error en restorePersonal:", error.response || error);
    throw error;
  }
}