import { supabase } from "../lib/supabase";

export interface Itinerary {
  id: string;
  agent_id: string;
  client_id: string | null;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  trip_type: string | null;
  budget: number | null;
  interests: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string;
    email: string | null;
  } | null;
}

export interface CreateItineraryData {
  client_id?: string | null;
  title: string;
  destination: string;
  start_date?: string | null;
  end_date?: string | null;
  travelers?: number;
  trip_type?: string | null;
  budget?: number | null;
  interests?: string | null;
  notes?: string | null;
  status?: string;
}

export interface ItineraryDay {
  id: string;
  itinerary_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  description: string | null;
  created_at: string;
}

export interface ItineraryActivity {
  id: string;
  day_id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  type: string | null;
  estimated_cost: number | null;
  sort_order: number;
  created_at: string;
}

export const getItineraries = async (): Promise<Itinerary[]> => {
  const { data, error } = await supabase
    .from("itineraries")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error cargando itinerarios:", error);
    throw error;
  }

  return data || [];
};

export const getItinerary = async (id: string): Promise<Itinerary> => {
  const { data, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createItinerary = async (itinerary: CreateItineraryData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado.");
  }

  const { data, error } = await supabase
    .from("itineraries")
    .insert({
      agent_id: user.id,
      client_id: itinerary.client_id || null,
      title: itinerary.title,
      destination: itinerary.destination,
      start_date: itinerary.start_date || null,
      end_date: itinerary.end_date || null,
      travelers: itinerary.travelers || 1,
      trip_type: itinerary.trip_type || null,
      budget: itinerary.budget || null,
      interests: itinerary.interests || null,
      notes: itinerary.notes || null,
      status: itinerary.status || "draft",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateItinerary = async (
  id: string,
  itinerary: CreateItineraryData,
) => {
  const { data, error } = await supabase
    .from("itineraries")
    .update({
      client_id: itinerary.client_id || null,
      title: itinerary.title,
      destination: itinerary.destination,
      start_date: itinerary.start_date || null,
      end_date: itinerary.end_date || null,
      travelers: itinerary.travelers || 1,
      trip_type: itinerary.trip_type || null,
      budget: itinerary.budget || null,
      interests: itinerary.interests || null,
      notes: itinerary.notes || null,
      status: itinerary.status || "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteItinerary = async (id: string) => {
  const { error } = await supabase.from("itineraries").delete().eq("id", id);

  if (error) {
    throw error;
  }
};

/* =========================
   DAYS
========================= */

export const getItineraryDays = async (
  itineraryId: string,
): Promise<ItineraryDay[]> => {
  const { data, error } = await supabase
    .from("itinerary_days")
    .select("*")
    .eq("itinerary_id", itineraryId)
    .order("day_number", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
};

export const createItineraryDay = async (
  itineraryId: string,
  day: {
    day_number: number;
    date?: string | null;
    title?: string | null;
    description?: string | null;
  },
) => {
  const { data, error } = await supabase
    .from("itinerary_days")
    .insert({
      itinerary_id: itineraryId,
      day_number: day.day_number,
      date: day.date || null,
      title: day.title || null,
      description: day.description || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateItineraryDay = async (
  id: string,
  day: {
    day_number?: number;
    date?: string | null;
    title?: string | null;
    description?: string | null;
  },
) => {
  const { data, error } = await supabase
    .from("itinerary_days")
    .update(day)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteItineraryDay = async (id: string) => {
  const { error } = await supabase.from("itinerary_days").delete().eq("id", id);

  if (error) {
    throw error;
  }
};

/* =========================
   ACTIVITIES
========================= */

export const getItineraryActivities = async (
  dayId: string,
): Promise<ItineraryActivity[]> => {
  const { data, error } = await supabase
    .from("itinerary_activities")
    .select("*")
    .eq("day_id", dayId)
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
};

export const createItineraryActivity = async (
  dayId: string,
  activity: {
    title: string;
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    location?: string | null;
    type?: string | null;
    estimated_cost?: number | null;
    sort_order?: number;
  },
) => {
  const { data, error } = await supabase
    .from("itinerary_activities")
    .insert({
      day_id: dayId,
      title: activity.title,
      description: activity.description || null,
      start_time: activity.start_time || null,
      end_time: activity.end_time || null,
      location: activity.location || null,
      type: activity.type || null,
      estimated_cost: activity.estimated_cost ?? null,
      sort_order: activity.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateItineraryActivity = async (
  id: string,
  activity: {
    title?: string;
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    location?: string | null;
    type?: string | null;
    estimated_cost?: number | null;
    sort_order?: number;
  },
) => {
  const { data, error } = await supabase
    .from("itinerary_activities")
    .update(activity)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteItineraryActivity = async (id: string) => {
  const { error } = await supabase
    .from("itinerary_activities")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};
