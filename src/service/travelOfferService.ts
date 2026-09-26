import { supabase } from "../lib/supabase";

/* =========================================================
   TIPOS
========================================================= */

export type TravelOfferCategory =
  | "FLIGHT"
  | "HOTEL"
  | "ACTIVITY"
  | "TRANSFER"
  | "PACKAGE"
  | "OTHER";

export interface TravelOfferProvider {
  id?: string;
  name: string;
}

export interface TravelOffer {
  id: string;

  name: string;

  category: string;

  destination: string;

  country: string | null;

  description: string | null;

  price: number | null;

  currency: string;

  duration: string | null;

  rating: number | null;

  available: boolean;

  image_url: string | null;

  external_id: string | null;

  provider_id: string | null;

  score: number;

  providers?: TravelOfferProvider | null;

  /* =====================================================
     INFORMACIÓN DE VUELO
  ===================================================== */

  origin?: string | null;

  departure_date?: string | null;

  return_date?: string | null;

  departure_time?: string | null;

  arrival_time?: string | null;

  airline?: string | null;

  flight_number?: string | null;

  stops?: number | null;

  baggage?: string | null;

  cabin_class?: string | null;

  /* =====================================================
     INFORMACIÓN DE HOTEL
  ===================================================== */

  stars?: number | null;

  location?: string | null;

  room_type?: string | null;

  meal_plan?: string | null;

  check_in?: string | null;

  check_out?: string | null;

  cancellation_policy?: string | null;

  /* =====================================================
     INFORMACIÓN GENERAL
  ===================================================== */

  price_per_person?: number | null;

  total_price?: number | null;

  taxes_included?: boolean | null;

  needs_verification?: boolean;

  source?: string | null;
}

/* =========================================================
   BÚSQUEDA
========================================================= */

export interface SearchTravelOffersData {
  destination: string;

  budget?: number;

  category?: string;

  interests?: string[];

  /* =====================================================
     DATOS DEL VIAJE
  ===================================================== */

  origin?: string;

  departureDate?: string;

  returnDate?: string;

  adults?: number;

  children?: number;

  rooms?: number;

  currency?: string;

  /* =====================================================
     FILTROS
  ===================================================== */

  maxPrice?: number;

  minPrice?: number;

  sortBy?: "price_asc" | "price_desc" | "rating_desc" | "relevance";

  onlyAvailable?: boolean;
}

/* =========================================================
   RESPUESTA DEL SERVICIO
========================================================= */

export interface SearchTravelOffersResponse {
  success: boolean;

  offers: TravelOffer[];

  total?: number;

  currency?: string;

  search_id?: string;

  message?: string;

  error?: string;
}

/* =========================================================
   BUSCAR OFERTAS
========================================================= */

export async function searchTravelOffers(
  data: SearchTravelOffersData
): Promise<TravelOffer[]> {
  const { data: response, error } =
    await supabase.functions.invoke<SearchTravelOffersResponse>(
      "search-travel-offers",
      {
        body: {
          ...data,

          /*
           * Por defecto queremos mostrar primero
           * las opciones más económicas.
           */
          sortBy: data.sortBy || "price_asc",

          /*
           * No queremos mostrar ofertas que
           * explícitamente estén marcadas como no disponibles.
           */
          onlyAvailable:
            data.onlyAvailable !== undefined
              ? data.onlyAvailable
              : true,
        },
      }
    );

  if (error) {
    console.error(
      "Error buscando ofertas de viaje:",
      error
    );

    throw new Error(
      error.message ||
        "No se pudieron buscar las ofertas de viaje."
    );
  }

  if (!response?.success) {
    throw new Error(
      response?.error ||
        "No se encontraron ofertas para esta búsqueda."
    );
  }

  const offers = Array.isArray(response.offers)
    ? response.offers
    : [];

  /*
   * Seguridad adicional:
   *
   * Aunque el backend debería devolverlas ordenadas,
   * también ordenamos aquí para garantizar que NIA
   * reciba primero las opciones más económicas.
   */

  const sortedOffers = [...offers].sort(
    (a, b) => {
      const priceA =
        a.total_price ??
        a.price_per_person ??
        a.price ??
        Number.POSITIVE_INFINITY;

      const priceB =
        b.total_price ??
        b.price_per_person ??
        b.price ??
        Number.POSITIVE_INFINITY;

      return priceA - priceB;
    }
  );

  return sortedOffers;
}

/* =========================================================
   BUSCAR VUELOS
========================================================= */

export async function searchFlights(
  data: Omit<SearchTravelOffersData, "category">
): Promise<TravelOffer[]> {
  const offers = await searchTravelOffers({
    ...data,
    category: "FLIGHT",
    sortBy: "price_asc",
  });

  return offers
    .filter(
      (offer) =>
        offer.category.toUpperCase() === "FLIGHT" ||
        offer.category.toUpperCase() === "VUELO"
    )
    .sort(compareOffersByPrice);
}

/* =========================================================
   BUSCAR HOTELES
========================================================= */

export async function searchHotels(
  data: Omit<SearchTravelOffersData, "category">
): Promise<TravelOffer[]> {
  const offers = await searchTravelOffers({
    ...data,
    category: "HOTEL",
    sortBy: "price_asc",
  });

  return offers
    .filter(
      (offer) =>
        offer.category.toUpperCase() === "HOTEL" ||
        offer.category.toUpperCase() === "HOTEL"
    )
    .sort(compareOffersByPrice);
}

/* =========================================================
   BUSCAR ACTIVIDADES
========================================================= */

export async function searchActivities(
  data: Omit<SearchTravelOffersData, "category">
): Promise<TravelOffer[]> {
  const offers = await searchTravelOffers({
    ...data,
    category: "ACTIVITY",
    sortBy: "price_asc",
  });

  return offers
    .filter(
      (offer) =>
        offer.category.toUpperCase() === "ACTIVITY" ||
        offer.category.toUpperCase() === "ACTIVIDAD"
    )
    .sort(compareOffersByPrice);
}

/* =========================================================
   ORDENAR POR PRECIO
========================================================= */

export function sortOffersByPrice(
  offers: TravelOffer[],
  direction: "asc" | "desc" = "asc"
): TravelOffer[] {
  return [...offers].sort((a, b) => {
    const priceA =
      a.total_price ??
      a.price_per_person ??
      a.price ??
      Number.POSITIVE_INFINITY;

    const priceB =
      b.total_price ??
      b.price_per_person ??
      b.price ??
      Number.POSITIVE_INFINITY;

    return direction === "asc"
      ? priceA - priceB
      : priceB - priceA;
  });
}

/* =========================================================
   COMPARAR DOS OFERTAS
========================================================= */

function compareOffersByPrice(
  a: TravelOffer,
  b: TravelOffer
): number {
  const priceA =
    a.total_price ??
    a.price_per_person ??
    a.price ??
    Number.POSITIVE_INFINITY;

  const priceB =
    b.total_price ??
    b.price_per_person ??
    b.price ??
    Number.POSITIVE_INFINITY;

  return priceA - priceB;
}

/* =========================================================
   OBTENER LAS MÁS ECONÓMICAS
========================================================= */

export function getCheapestOffers(
  offers: TravelOffer[],
  limit = 5
): TravelOffer[] {
  return sortOffersByPrice(offers, "asc").slice(
    0,
    limit
  );
}

/* =========================================================
   OBTENER LAS MÁS DESTACADAS
========================================================= */

export function getTopRatedOffers(
  offers: TravelOffer[],
  limit = 5
): TravelOffer[] {
  return [...offers]
    .filter(
      (offer) =>
        offer.rating !== null &&
        offer.rating !== undefined
    )
    .sort(
      (a, b) =>
        (b.rating ?? 0) -
        (a.rating ?? 0)
    )
    .slice(0, limit);
}

/* =========================================================
   SEPARAR OFERTAS
========================================================= */

export function separateTravelOffers(
  offers: TravelOffer[]
) {
  return {
    flights: offers
      .filter(
        (offer) =>
          offer.category.toUpperCase() === "FLIGHT" ||
          offer.category.toUpperCase() === "VUELO"
      )
      .sort(compareOffersByPrice),

    hotels: offers
      .filter(
        (offer) =>
          offer.category.toUpperCase() === "HOTEL"
      )
      .sort(compareOffersByPrice),

    activities: offers
      .filter(
        (offer) =>
          offer.category.toUpperCase() === "ACTIVITY" ||
          offer.category.toUpperCase() === "ACTIVIDAD"
      )
      .sort(compareOffersByPrice),

    transfers: offers
      .filter(
        (offer) =>
          offer.category.toUpperCase() === "TRANSFER" ||
          offer.category.toUpperCase() === "TRASLADO"
      )
      .sort(compareOffersByPrice),

    packages: offers
      .filter(
        (offer) =>
          offer.category.toUpperCase() === "PACKAGE" ||
          offer.category.toUpperCase() === "PAQUETE"
      )
      .sort(compareOffersByPrice),

    other: offers
      .filter((offer) => {
        const category =
          offer.category.toUpperCase();

        return ![
          "FLIGHT",
          "VUELO",
          "HOTEL",
          "ACTIVITY",
          "ACTIVIDAD",
          "TRANSFER",
          "TRASLADO",
          "PACKAGE",
          "PAQUETE",
        ].includes(category);
      })
      .sort(compareOffersByPrice),
  };
}

/* =========================================================
   CONVERTIR OFERTA A FORMATO SIMPLE PARA NIA
========================================================= */

export function prepareOffersForAI(
  offers: TravelOffer[]
) {
  return sortOffersByPrice(offers, "asc").map(
    (offer) => ({
      id: offer.id,

      name: offer.name,

      category: offer.category,

      destination: offer.destination,

      country: offer.country,

      description: offer.description,

      price:
        offer.total_price ??
        offer.price_per_person ??
        offer.price,

      price_per_person:
        offer.price_per_person,

      total_price:
        offer.total_price,

      currency: offer.currency,

      duration: offer.duration,

      rating: offer.rating,

      available: offer.available,

      provider:
        offer.providers?.name ??
        null,

      source: offer.source,

      /* Vuelo */
      origin: offer.origin,

      departure_date:
        offer.departure_date,

      return_date:
        offer.return_date,

      departure_time:
        offer.departure_time,

      arrival_time:
        offer.arrival_time,

      airline: offer.airline,

      flight_number:
        offer.flight_number,

      stops: offer.stops,

      baggage: offer.baggage,

      cabin_class:
        offer.cabin_class,

      /* Hotel */
      stars: offer.stars,

      location: offer.location,

      room_type:
        offer.room_type,

      meal_plan:
        offer.meal_plan,

      check_in:
        offer.check_in,

      check_out:
        offer.check_out,

      cancellation_policy:
        offer.cancellation_policy,

      taxes_included:
        offer.taxes_included,

      needs_verification:
        offer.needs_verification ?? true,
    })
  );
}
