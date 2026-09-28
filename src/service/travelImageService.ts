import { supabase } from "../lib/supabase";

export interface TravelImage {
  url: string;
  alt?: string;
  photographer?: string;
  photographer_url?: string;
  pexels_url?: string;
  source?: string;
  query?: string;
}

export const searchTravelImage = async (
  title: string,
  location?: string | null,
): Promise<TravelImage | null> => {
  try {
    console.log("🔎 Buscando imagen:", {
      title,
      location,
    });

    const { data, error } = await supabase.functions.invoke(
      "search-travel-image",
      {
        body: {
          title,
          location: location || "",
        },
      },
    );

    console.log("🖼️ RESPUESTA PEXELS:", {
      title,
      location,
      data,
      error,
    });

    if (error) {
      console.error("❌ Error buscando imagen:", error);
      return null;
    }

    if (!data?.image) {
      console.warn("⚠️ Pexels no devolvió imagen:", {
        title,
        location,
        data,
      });

      return null;
    }

    console.log("✅ Imagen encontrada:", data.image.url);

    return data.image;
  } catch (error) {
    console.error("❌ Error en searchTravelImage:", error);
    return null;
  }
};
