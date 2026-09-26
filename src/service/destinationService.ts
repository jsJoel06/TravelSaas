import { supabase } from "../lib/supabase";

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string | null;
  description: string | null;
  image_url: string | null;
  destination_type: string[];
  best_time: string | null;
  recommended_days: number | null;
  budget_level: string | null;
  main_activities: string[];
  featured_places: string[];
  practical_information: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type DestinationInput = {
  name: string;
  country: string;
  region?: string | null;
  description?: string | null;
  image_url?: string | null;
  destination_type?: string[];
  best_time?: string | null;
  recommended_days?: number | null;
  budget_level?: string | null;
  main_activities?: string[];
  featured_places?: string[];
  practical_information?: string[];
  active?: boolean;
};

const TABLE = "destinations";

export async function getDestinations(): Promise<Destination[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error obteniendo destinos:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getDestination(
  id: string
): Promise<Destination | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error obteniendo destino:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function createDestination(
  destination: DestinationInput
): Promise<Destination> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: destination.name,
      country: destination.country,
      region: destination.region ?? null,
      description: destination.description ?? null,
      image_url: destination.image_url ?? null,
      destination_type: destination.destination_type ?? [],
      best_time: destination.best_time ?? null,
      recommended_days: destination.recommended_days ?? null,
      budget_level: destination.budget_level ?? null,
      main_activities: destination.main_activities ?? [],
      featured_places: destination.featured_places ?? [],
      practical_information: destination.practical_information ?? [],
      active: destination.active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando destino:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateDestination(
  id: string,
  destination: DestinationInput
): Promise<Destination> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      name: destination.name,
      country: destination.country,
      region: destination.region ?? null,
      description: destination.description ?? null,
      image_url: destination.image_url ?? null,
      destination_type: destination.destination_type ?? [],
      best_time: destination.best_time ?? null,
      recommended_days: destination.recommended_days ?? null,
      budget_level: destination.budget_level ?? null,
      main_activities: destination.main_activities ?? [],
      featured_places: destination.featured_places ?? [],
      practical_information: destination.practical_information ?? [],
      active: destination.active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando destino:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteDestination(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando destino:", error);
    throw new Error(error.message);
  }
}

export async function toggleDestination(
  id: string,
  active: boolean
): Promise<Destination> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error cambiando estado del destino:", error);
    throw new Error(error.message);
  }

  return data;
}

