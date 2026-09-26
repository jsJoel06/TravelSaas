import "@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY"
)!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SortBy =
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "relevance";

export default {
  fetch: async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    try {
      /* =====================================================
         MÉTODO
      ===================================================== */

      if (req.method !== "POST") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Método no permitido.",
          }),
          {
            status: 405,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      /* =====================================================
         BODY
      ===================================================== */

      const body = await req.json();

      const destination =
        typeof body?.destination === "string"
          ? body.destination.trim()
          : "";

      const category =
        typeof body?.category === "string"
          ? body.category.trim()
          : null;

      const budget =
        body?.budget !== undefined &&
        body?.budget !== null &&
        body?.budget !== ""
          ? Number(body.budget)
          : null;

      const minPrice =
        body?.minPrice !== undefined &&
        body?.minPrice !== null &&
        body?.minPrice !== ""
          ? Number(body.minPrice)
          : null;

      const maxPrice =
        body?.maxPrice !== undefined &&
        body?.maxPrice !== null &&
        body?.maxPrice !== ""
          ? Number(body.maxPrice)
          : null;

      const interests = Array.isArray(body?.interests)
        ? body.interests
            .filter(
              (interest: unknown) =>
                typeof interest === "string"
            )
            .map((interest: string) =>
              interest.trim()
            )
            .filter(Boolean)
        : [];

      const sortBy: SortBy =
        body?.sortBy === "price_desc" ||
        body?.sortBy === "rating_desc" ||
        body?.sortBy === "relevance"
          ? body.sortBy
          : "price_asc";

      const onlyAvailable =
        body?.onlyAvailable !== undefined
          ? Boolean(body.onlyAvailable)
          : true;

      /* =====================================================
         VALIDACIÓN
      ===================================================== */

      if (!destination) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Debes proporcionar un destino.",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      /* =====================================================
         CONSULTA A SUPABASE
      ===================================================== */

      const url = new URL(
        `${SUPABASE_URL}/rest/v1/travel_services`
      );

      url.searchParams.set(
        "select",
        [
          "id",
          "name",
          "category",
          "destination",
          "country",
          "description",
          "price",
          "currency",
          "duration",
          "rating",
          "available",
          "image_url",
          "external_id",
          "provider_id",
          "providers(name)",
        ].join(",")
      );

      /*
       * Buscamos el destino sin importar mayúsculas/minúsculas.
       */
      url.searchParams.set(
        "destination",
        `ilike.*${escapePostgrestValue(
          destination
        )}*`
      );

      /*
       * Por defecto solamente mostramos servicios
       * disponibles.
       */
      if (onlyAvailable) {
        url.searchParams.set(
          "available",
          "eq.true"
        );
      }

      /*
       * Categoría.
       *
       * La normalizamos para aceptar tanto:
       * FLIGHT como VUELO
       * HOTEL como HOTELES
       * ACTIVITY como ACTIVIDAD
       */
      if (category) {
        const normalizedCategory =
          normalizeCategory(category);

        if (normalizedCategory) {
          url.searchParams.set(
            "category",
            `in.(${normalizedCategory.join(",")})`
          );
        }
      }

      /*
       * Filtro mínimo de precio.
       */
      if (
        minPrice !== null &&
        Number.isFinite(minPrice)
      ) {
        url.searchParams.set(
          "price",
          `gte.${minPrice}`
        );
      }

      /*
       * Filtro máximo de precio.
       */
      if (
        maxPrice !== null &&
        Number.isFinite(maxPrice)
      ) {
        url.searchParams.set(
          "price",
          `lte.${maxPrice}`
        );
      }

      /*
       * Dejamos que Supabase haga una primera
       * ordenación sencilla.
       *
       * El orden definitivo lo hacemos después
       * en TypeScript.
       */
      url.searchParams.set(
        "order",
        "price.asc.nullslast"
      );

      const response = await fetch(
        url.toString(),
        {
          headers: {
            apikey:
              SUPABASE_SERVICE_ROLE_KEY,

            Authorization:
              `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );

      /* =====================================================
         ERROR DE SUPABASE
      ===================================================== */

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "Error buscando servicios:",
          errorText
        );

        throw new Error(
          "No se pudieron obtener las ofertas."
        );
      }

      const services =
        await response.json();

      if (!Array.isArray(services)) {
        throw new Error(
          "La respuesta de ofertas no es válida."
        );
      }

      /* =====================================================
         RANKING
      ===================================================== */

      const rankedServices =
        services.map((service: any) => {
          let score = 0;

          const price =
            service.price !== null &&
            service.price !== undefined
              ? Number(service.price)
              : null;

          const rating =
            service.rating !== null &&
            service.rating !== undefined
              ? Number(service.rating)
              : null;

          const name =
            String(
              service.name || ""
            );

          const description =
            String(
              service.description || ""
            );

          const serviceCategory =
            String(
              service.category || ""
            );

          const searchableText =
            `
              ${name}
              ${description}
              ${serviceCategory}
              ${service.destination || ""}
            `.toLowerCase();

          /* =================================================
             VALORACIÓN
          ================================================= */

          if (
            rating !== null &&
            Number.isFinite(rating)
          ) {
            score += rating * 20;
          }

          /* =================================================
             PRESUPUESTO
          ================================================= */

          if (
            budget !== null &&
            Number.isFinite(budget) &&
            price !== null
          ) {
            if (price <= budget) {
              score += 25;
            } else {
              score -= 15;
            }
          }

          /* =================================================
             INTERESES
          ================================================= */

          if (interests.length > 0) {
            for (const interest of interests) {
              const normalizedInterest =
                String(interest)
                  .toLowerCase()
                  .trim();

              if (
                normalizedInterest &&
                searchableText.includes(
                  normalizedInterest
                )
              ) {
                score += 10;
              }
            }
          }

          /* =================================================
             DISPONIBILIDAD
          ================================================= */

          if (service.available === true) {
            score += 5;
          }

          return {
            ...service,

            score:
              Math.round(
                score * 100
              ) / 100,

            /*
             * Le damos a NIA un indicador claro
             * para que sepa si necesita verificación.
             */
            needs_verification:
              true,

            /*
             * Fuente actual.
             *
             * Más adelante podremos diferenciar:
             * ACHUEN_TRAVEL
             * AMADEUS
             * SABRE
             * HOTELBEDS
             * etc.
             */
            source:
              service.external_id
                ? "external_provider"
                : "achuen_travel_inventory",
          };
        });

      /* =====================================================
         ORDENAMIENTO
      ===================================================== */

      const sortedServices =
        sortServices(
          rankedServices,
          sortBy
        );

      /* =====================================================
         SEPARAR POR CATEGORÍA
      ===================================================== */

      const grouped =
        separateServices(
          sortedServices
        );

      /* =====================================================
         RESPUESTA
      ===================================================== */

      return new Response(
        JSON.stringify({
          success: true,

          destination,

          category,

          sortBy,

          total:
            sortedServices.length,

          offers:
            sortedServices,

          /*
           * También enviamos los grupos para que
           * NIA pueda trabajar más fácilmente.
           */
          flights:
            grouped.flights,

          hotels:
            grouped.hotels,

          activities:
            grouped.activities,

          transfers:
            grouped.transfers,

          packages:
            grouped.packages,

          other:
            grouped.other,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Error buscando ofertas:",
        error
      );

      return new Response(
        JSON.stringify({
          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Error buscando ofertas.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }
  },
};

/* =========================================================
   NORMALIZAR CATEGORÍAS
========================================================= */

function normalizeCategory(
  category: string
): string[] | null {
  const normalized =
    category
      .toUpperCase()
      .trim();

  switch (normalized) {
    case "FLIGHT":
    case "FLIGHTS":
    case "VUELO":
    case "VUELOS":
      return [
        "FLIGHT",
        "VUELO",
        "VUELOS",
      ];

    case "HOTEL":
    case "HOTELES":
      return [
        "HOTEL",
        "HOTELES",
      ];

    case "ACTIVITY":
    case "ACTIVITIES":
    case "ACTIVIDAD":
    case "ACTIVIDADES":
      return [
        "ACTIVITY",
        "ACTIVIDAD",
        "ACTIVIDADES",
      ];

    case "TRANSFER":
    case "TRANSFERS":
    case "TRASLADO":
    case "TRASLADOS":
      return [
        "TRANSFER",
        "TRASLADO",
        "TRASLADOS",
      ];

    case "PACKAGE":
    case "PACKAGES":
    case "PAQUETE":
    case "PAQUETES":
      return [
        "PACKAGE",
        "PAQUETE",
        "PAQUETES",
      ];

    default:
      return [category];
  }
}

/* =========================================================
   ORDENAR SERVICIOS
========================================================= */

function sortServices(
  services: any[],
  sortBy: SortBy
): any[] {
  return [...services].sort(
    (a, b) => {
      const priceA =
        getPrice(a);

      const priceB =
        getPrice(b);

      /*
       * MÁS BARATO → MÁS CARO
       */
      if (sortBy === "price_asc") {
        if (
          priceA === null &&
          priceB === null
        ) {
          return 0;
        }

        if (priceA === null) {
          return 1;
        }

        if (priceB === null) {
          return -1;
        }

        return priceA - priceB;
      }

      /*
       * MÁS CARO → MÁS BARATO
       */
      if (sortBy === "price_desc") {
        if (
          priceA === null &&
          priceB === null
        ) {
          return 0;
        }

        if (priceA === null) {
          return 1;
        }

        if (priceB === null) {
          return -1;
        }

        return priceB - priceA;
      }

      /*
       * MEJOR VALORACIÓN
       */
      if (sortBy === "rating_desc") {
        const ratingA =
          Number(a.rating) || 0;

        const ratingB =
          Number(b.rating) || 0;

        return ratingB - ratingA;
      }

      /*
       * RELEVANCIA
       */
      return (
        Number(b.score || 0) -
        Number(a.score || 0)
      );
    }
  );
}

/* =========================================================
   PRECIO
========================================================= */

function getPrice(
  service: any
): number | null {
  if (
    service.price === null ||
    service.price === undefined
  ) {
    return null;
  }

  const price =
    Number(service.price);

  return Number.isFinite(price)
    ? price
    : null;
}

/* =========================================================
   SEPARAR SERVICIOS
========================================================= */

function separateServices(
  services: any[]
) {
  return {
    flights:
      services.filter(
        (service) =>
          isCategory(
            service.category,
            [
              "FLIGHT",
              "FLIGHTS",
              "VUELO",
              "VUELOS",
            ]
          )
      ),

    hotels:
      services.filter(
        (service) =>
          isCategory(
            service.category,
            [
              "HOTEL",
              "HOTELES",
            ]
          )
      ),

    activities:
      services.filter(
        (service) =>
          isCategory(
            service.category,
            [
              "ACTIVITY",
              "ACTIVITIES",
              "ACTIVIDAD",
              "ACTIVIDADES",
            ]
          )
      ),

    transfers:
      services.filter(
        (service) =>
          isCategory(
            service.category,
            [
              "TRANSFER",
              "TRANSFERS",
              "TRASLADO",
              "TRASLADOS",
            ]
          )
      ),

    packages:
      services.filter(
        (service) =>
          isCategory(
            service.category,
            [
              "PACKAGE",
              "PACKAGES",
              "PAQUETE",
              "PAQUETES",
            ]
          )
      ),

    other:
      services.filter(
        (service) => {
          const category =
            String(
              service.category || ""
            ).toUpperCase();

          return ![
            "FLIGHT",
            "FLIGHTS",
            "VUELO",
            "VUELOS",
            "HOTEL",
            "HOTELES",
            "ACTIVITY",
            "ACTIVITIES",
            "ACTIVIDAD",
            "ACTIVIDADES",
            "TRANSFER",
            "TRANSFERS",
            "TRASLADO",
            "TRASLADOS",
            "PACKAGE",
            "PACKAGES",
            "PAQUETE",
            "PAQUETES",
          ].includes(category);
        }
      ),
  };
}

/* =========================================================
   COMPROBAR CATEGORÍA
========================================================= */

function isCategory(
  value: unknown,
  categories: string[]
): boolean {
  const normalized =
    String(value || "")
      .toUpperCase()
      .trim();

  return categories.includes(
    normalized
  );
}

/* =========================================================
   SEGURIDAD POSTGREST
========================================================= */

function escapePostgrestValue(
  value: string
): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "")
    .replace(/,/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");
}

