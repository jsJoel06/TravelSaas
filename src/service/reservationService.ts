import { supabase } from "../lib/supabase";

export type ReservationType =
  | "VUELO"
  | "HOTEL"
  | "TRANSPORTE"
  | "ACTIVIDAD"
  | "SEGURO"
  | "OTRO";

export type ReservationStatus =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "CANCELADA"
  | "COMPLETADA";

export interface Reservation {
  id: string;
  agent_id: string;

  client_id: string | null;
  client_name: string | null;

  type: ReservationType;

  title: string;

  provider: string | null;
  confirmation_code: string | null;

  start_date: string;
  end_date: string | null;

  travelers: number;

  amount: number;
  currency: string;

  status: ReservationStatus;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateReservationData {
  client_id?: string | null;
  client_name?: string | null;

  type: ReservationType;

  title: string;

  provider?: string | null;
  confirmation_code?: string | null;

  start_date: string;
  end_date?: string | null;

  travelers: number;

  amount: number;
  currency: string;

  status?: ReservationStatus;

  notes?: string | null;
}

export type UpdateReservationData = Partial<CreateReservationData>;

/* =========================================================
   USUARIO ACTUAL
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
    throw new Error("Usuario no autenticado.");
  }

  return user;
}

/* =========================================================
   OBTENER RESERVAS
========================================================= */

export async function getReservations(): Promise<Reservation[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("agent_id", user.id)
    .order("start_date", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Reservation[];
}

/* =========================================================
   OBTENER RESERVA POR ID
========================================================= */

export async function getReservationById(id: string): Promise<Reservation> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .eq("agent_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as Reservation;
}

/* =========================================================
   CREAR
========================================================= */

export async function createReservation(
  reservation: CreateReservationData,
): Promise<Reservation> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      agent_id: user.id,

      client_id: reservation.client_id || null,

      client_name: reservation.client_name?.trim() || null,

      type: reservation.type,

      title: reservation.title.trim(),

      provider: reservation.provider?.trim() || null,

      confirmation_code: reservation.confirmation_code?.trim() || null,

      start_date: reservation.start_date,

      end_date: reservation.end_date || null,

      travelers: reservation.travelers,

      amount: reservation.amount,

      currency: reservation.currency,

      status: reservation.status || "PENDIENTE",

      notes: reservation.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Reservation;
}

/* =========================================================
   ACTUALIZAR
========================================================= */

export async function updateReservation(
  id: string,
  reservation: UpdateReservationData,
): Promise<Reservation> {
  const user = await getCurrentUser();

  const payload = {
    ...reservation,

    title:
      reservation.title !== undefined ? reservation.title.trim() : undefined,

    client_name:
      reservation.client_name !== undefined
        ? reservation.client_name?.trim() || null
        : undefined,

    provider:
      reservation.provider !== undefined
        ? reservation.provider?.trim() || null
        : undefined,

    confirmation_code:
      reservation.confirmation_code !== undefined
        ? reservation.confirmation_code?.trim() || null
        : undefined,

    notes:
      reservation.notes !== undefined
        ? reservation.notes?.trim() || null
        : undefined,

    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("reservations")
    .update(payload)
    .eq("id", id)
    .eq("agent_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Reservation;
}

/* =========================================================
   CAMBIAR ESTADO
========================================================= */

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<Reservation> {
  return updateReservation(id, {
    status,
  });
}

/* =========================================================
   ELIMINAR
========================================================= */

export async function deleteReservation(id: string): Promise<void> {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id)
    .eq("agent_id", user.id);

  if (error) {
    throw error;
  }
}
