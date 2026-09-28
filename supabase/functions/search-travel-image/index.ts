import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },

    async (req) => {
      try {
        // ============================================
        // RECIBIR DATOS DESDE REACT
        // ============================================

        const { title, location } = await req.json();

        const query = [title, location].filter(Boolean).join(" ").trim();

        if (!query) {
          return Response.json({
            image: null,
            error: "No se proporcionó una búsqueda.",
          });
        }

        // ============================================
        // OBTENER API KEY DE PEXELS
        // ============================================

        const pexelsApiKey = Deno.env.get("PEXELS_API_KEY");

        if (!pexelsApiKey) {
          return Response.json(
            {
              image: null,
              error: "PEXELS_API_KEY no está configurada.",
            },
            {
              status: 500,
            },
          );
        }

        // ============================================
        // BUSCAR FOTO EN PEXELS
        // ============================================

        const url =
          `https://api.pexels.com/v1/search` +
          `?query=${encodeURIComponent(query)}` +
          `&per_page=1` +
          `&orientation=landscape`;

        const response = await fetch(url, {
          headers: {
            Authorization: pexelsApiKey,
          },
        });

        if (!response.ok) {
          console.error(
            "Error Pexels:",
            response.status,
            await response.text(),
          );

          return Response.json(
            {
              image: null,
              error: `Pexels respondió con ${response.status}`,
            },
            {
              status: 500,
            },
          );
        }

        const data = await response.json();

        const photo = data?.photos?.[0];

        // ============================================
        // SI NO ENCUENTRA FOTO
        // ============================================

        if (!photo) {
          return Response.json({
            image: null,
            query,
          });
        }

        // ============================================
        // RESPUESTA
        // ============================================

        return Response.json({
          image: {
            url: photo.src?.large2x || photo.src?.large || photo.src?.medium,

            alt:
              photo.alt || `${title || "Actividad"} ${location || ""}`.trim(),

            photographer: photo.photographer,

            photographer_url: photo.photographer_url,

            pexels_url: photo.url,

            source: "Pexels",

            query,
          },
        });
      } catch (error) {
        console.error("search-travel-image:", error);

        return Response.json(
          {
            image: null,

            error:
              error instanceof Error ? error.message : "Error desconocido.",
          },
          {
            status: 500,
          },
        );
      }
    },
  ),
};
