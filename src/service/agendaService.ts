import { supabase } from "../lib/supabase";

export type ActivityType =
  | "REUNION"
  | "LLAMADA"
  | "SEGUIMIENTO"
  | "RESERVA"
  | "TAREA";

export type ActivityStatus = "PENDIENTE" | "COMPLETADA";

export type AgendaActivity = {
  id: string;
  user_id: string;

  title: string;

  activity_date: string;
  activity_time: string | null;

  type: ActivityType;
  status: ActivityStatus;

  client_id: string | null;
  client_name: string | null;

  location: string | null;
  description: string | null;

  created_at: string;
  updated_at: string;
};

export type CreateAgendaActivity = {
  title: string;

  activity_date: string;
  activity_time?: string | null;

  type: ActivityType;

  client_id?: string | null;
  client_name?: string | null;

  location?: string | null;
  description?: string | null;
};

export type UpdateAgendaActivity = Partial<CreateAgendaActivity> & {
  status?: ActivityStatus;
};

/* =========================================================
   OBTENER USUARIO
========================================================= */

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("No hay una sesión activa.");
  }

  return user;
}

/* =========================================================
   OBTENER ACTIVIDADES
========================================================= */

export async function getAgendaActivities() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("agenda_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("activity_date", {
      ascending: true,
    })
    .order("activity_time", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as AgendaActivity[];
}

/* =========================================================
   CREAR ACTIVIDAD
========================================================= */

export async function createAgendaActivity(activity: CreateAgendaActivity) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("agenda_activities")
    .insert({
      user_id: user.id,

      title: activity.title.trim(),

      activity_date: activity.activity_date,

      activity_time: activity.activity_time || null,

      type: activity.type,

      status: "PENDIENTE",

      client_id: activity.client_id || null,

      client_name: activity.client_name?.trim() || null,

      location: activity.location?.trim() || null,

      description: activity.description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as AgendaActivity;
}

/* =========================================================
   ACTUALIZAR ACTIVIDAD
========================================================= */

export async function updateAgendaActivity(
  id: string,
  activity: UpdateAgendaActivity,
) {
  const user = await getCurrentUser();

  const payload = {
    ...activity,

    title: activity.title !== undefined ? activity.title.trim() : undefined,

    client_name:
      activity.client_name !== undefined
        ? activity.client_name?.trim() || null
        : undefined,

    location:
      activity.location !== undefined
        ? activity.location?.trim() || null
        : undefined,

    description:
      activity.description !== undefined
        ? activity.description?.trim() || null
        : undefined,

    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("agenda_activities")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as AgendaActivity;
}

/* =========================================================
   COMPLETAR / REABRIR
========================================================= */

export async function toggleAgendaActivityStatus(activity: AgendaActivity) {
  const newStatus: ActivityStatus =
    activity.status === "COMPLETADA" ? "PENDIENTE" : "COMPLETADA";

  return updateAgendaActivity(activity.id, {
    status: newStatus,
  });
}

/* =========================================================
   ELIMINAR
========================================================= */

export async function deleteAgendaActivity(id: string) {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("agenda_activities")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}
