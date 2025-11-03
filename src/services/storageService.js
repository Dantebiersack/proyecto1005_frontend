import { supabase } from "../lib/supabaseClient";

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "nearbiz-uploads";

/**
 * Sube una imagen a Supabase y regresa la URL pública
 */
export async function uploadImage(file, folder = "negocios") {
  if (!file) throw new Error("No hay archivo");

  // nombre único
  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error subiendo a supabase:", error);
    throw error;
  }

  // sacar URL pública
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return {
    path: fileName,
    publicUrl: publicUrlData.publicUrl,
  };
}
