import { supabase } from "../lib/supabase";

export interface Client {
  id: string;
  agent_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  full_name: string;
  email?: string;
  phone?: string;
  country?: string;
  notes?: string;
}

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
};

export const createClient = async (
  client: CreateClientData
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado.");
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      agent_id: user.id,
      full_name: client.full_name,
      email: client.email || null,
      phone: client.phone || null,
      country: client.country || null,
      notes: client.notes || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateClient = async (
  id: string,
  client: CreateClientData
) => {
  const { data, error } = await supabase
    .from("clients")
    .update({
      full_name: client.full_name,
      email: client.email || null,
      phone: client.phone || null,
      country: client.country || null,
      notes: client.notes || null,
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

export const deleteClient = async (
  id: string
) => {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};