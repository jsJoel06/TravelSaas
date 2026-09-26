import { supabase } from "../lib/supabase";

export interface TripRequirements {
  destination: string | null;
  country: string | null;
  travelers: number | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  budget: number | null;
  currency: string | null;
  trip_type: string | null;
  interests: string[];
  special_requirements: string[];
}

export async function extractTripRequirements(
  description: string
): Promise<TripRequirements> {
  const { data, error } =
    await supabase.functions.invoke(
      "extract-trip-requirements",
      {
        body: {
          description,
        },
      }
    );

  if (error) {
    throw new Error(
      error.message ||
        "No se pudieron analizar los requisitos."
    );
  }

  if (!data?.success) {
    throw new Error(
      data?.error ||
        "No se pudieron extraer los requisitos."
    );
  }

  return data.requirements;
}