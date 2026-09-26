import { supabase } from "../lib/supabase";
import type { TravelOffer } from "./travelOfferService";

/* =========================================================
   ACTIVIDAD
========================================================= */

export interface GeneratedActivity {
  title: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  type: string;
  estimated_cost: number | null;
  offer_id?: string | null;

  /**
   * De dónde proviene la actividad:
   * - achuen_travel_inventory
   * - external_provider
   * - general_recommendation
   */
  source?: string;

  /**
   * Indica si el agente debe verificar la información
   * antes de presentarla como definitiva al cliente.
   */
  needs_verification?: boolean;
}

/* =========================================================
   DÍA
========================================================= */

export interface GeneratedDay {
  day_number: number;
  date: string | null;
  title: string;
  description: string;
  activities: GeneratedActivity[];
}

/* =========================================================
   GUÍA DEL DESTINO
   Información para que el operador conozca el destino
========================================================= */

export interface DestinationGuide {
  overview: string;

  best_for: string[];

  important_places: {
    name: string;
    description: string;
    type: string;
  }[];

  practical_information: string[];
}

/* =========================================================
   ANÁLISIS DEL CLIENTE
========================================================= */

export interface ClientTripAnalysis {
  traveler_profile: string;

  main_interests: string[];

  trip_style: string;

  budget_level: string;

  planning_notes: string[];
}

/* =========================================================
   RECOMENDACIONES
========================================================= */

export interface TravelRecommendation {
  name: string;

  description: string;

  reason: string;

  estimated_cost: number | null;

  offer_id?: string | null;

  /**
   * Origen de la recomendación.
   */
  source?: string;

  /**
   * Si necesita confirmación antes de venderla.
   */
  needs_verification?: boolean;
}

/* =========================================================
   PRESUPUESTO
========================================================= */

export interface BudgetBreakdown {
  currency: string;

  accommodation: number;

  transportation: number;

  activities: number;

  food: number;

  other: number;

  total: number;

  client_budget: number | null;

  remaining_budget: number | null;
}

/* =========================================================
   NOTAS DEL PRESUPUESTO
========================================================= */

export type BudgetNote = string;

/* =========================================================
   ALTERNATIVAS
========================================================= */

export interface TravelAlternative {
  name: string;

  description: string;

  estimated_total: number | null;

  differences: string[];
}

/* =========================================================
   ITINERARIO COMPLETO
========================================================= */

export interface GeneratedItinerary {
  title: string;

  summary: string;

  /**
   * Explicación para que el agente pueda presentar
   * la propuesta al cliente.
   */
  agent_explanation: string;

  /**
   * Información que todavía necesita el agente
   * para poder cotizar correctamente.
   */
  missing_information: string[];

  /**
   * Información general del destino.
   */
  destination_guide: DestinationGuide;

  /**
   * Interpretación del perfil y preferencias
   * del cliente.
   */
  client_analysis: ClientTripAnalysis;

  /**
   * Experiencias recomendadas.
   */
  recommendations: TravelRecommendation[];

  /**
   * Presupuesto estimado.
   */
  budget: BudgetBreakdown;

  /**
   * Explicaciones sobre cómo se calculó
   * o qué elementos faltan en el presupuesto.
   */
  budget_notes: BudgetNote[];

  /**
   * Opciones alternativas de viaje.
   */
  alternatives: TravelAlternative[];

  /**
   * Cosas que el agente debe revisar antes
   * de presentar la propuesta como definitiva.
   */
  considerations: string[];

  /**
   * Supuestos realizados por NIA debido
   * a información que no proporcionó el cliente.
   */
  trip_assumptions: string[];

  /**
   * Consejos para que el agente presente
   * mejor la propuesta.
   */
  sales_tips: string[];

  /**
   * Mensaje listo para adaptar y enviar
   * al cliente.
   */
  client_message: string;

  /**
   * Itinerario día por día.
   */
  days: GeneratedDay[];
}

/* =========================================================
   GENERAR PROPUESTA CON NIA
========================================================= */

export const generateItineraryWithAI = async (
  description: string,
  offers: TravelOffer[] = [],
): Promise<GeneratedItinerary> => {
  const { data, error } =
    await supabase.functions.invoke(
      "generate-itinerary",
      {
        body: {
          description,
          offers,
        },
      },
    );

  if (error) {
    console.error(
      "Error llamando a la IA:",
      error,
    );

    throw new Error(
      error.message ||
        "No se pudo generar la propuesta.",
    );
  }

  if (
    !data?.success ||
    !data?.itinerary
  ) {
    throw new Error(
      data?.error ||
        "La IA no devolvió una propuesta válida.",
    );
  }

  return data.itinerary as GeneratedItinerary;
};
