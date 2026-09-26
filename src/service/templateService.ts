import { supabase } from "../lib/supabase";

export interface TemplateItineraryDay {
  day: number;
  title: string;
  activities: string[];
  notes?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  destination: string | null;
  country: string | null;
  travel_type: string | null;
  recommended_days: number | null;
  budget_level: string | null;
  includes: string[];
  activities: string[];
  notes: string[];
  itinerary: TemplateItineraryDay[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type TemplateInput = {
  name: string;
  description?: string | null;
  destination?: string | null;
  country?: string | null;
  travel_type?: string | null;
  recommended_days?: number | null;
  budget_level?: string | null;
  includes?: string[];
  activities?: string[];
  notes?: string[];
  itinerary?: TemplateItineraryDay[];
  active?: boolean;
};

const TABLE = "templates";

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error obteniendo plantillas:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getTemplate(
  id: string
): Promise<Template | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error obteniendo plantilla:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function createTemplate(
  template: TemplateInput
): Promise<Template> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: template.name,
      description: template.description ?? null,
      destination: template.destination ?? null,
      country: template.country ?? null,
      travel_type: template.travel_type ?? null,
      recommended_days: template.recommended_days ?? null,
      budget_level: template.budget_level ?? null,
      includes: template.includes ?? [],
      activities: template.activities ?? [],
      notes: template.notes ?? [],
      itinerary: template.itinerary ?? [],
      active: template.active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando plantilla:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateTemplate(
  id: string,
  template: TemplateInput
): Promise<Template> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      name: template.name,
      description: template.description ?? null,
      destination: template.destination ?? null,
      country: template.country ?? null,
      travel_type: template.travel_type ?? null,
      recommended_days: template.recommended_days ?? null,
      budget_level: template.budget_level ?? null,
      includes: template.includes ?? [],
      activities: template.activities ?? [],
      notes: template.notes ?? [],
      itinerary: template.itinerary ?? [],
      active: template.active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error actualizando plantilla:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando plantilla:", error);
    throw new Error(error.message);
  }
}

export async function toggleTemplate(
  id: string,
  active: boolean
): Promise<Template> {
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
    console.error("Error cambiando estado de la plantilla:", error);
    throw new Error(error.message);
  }

  return data;
}

