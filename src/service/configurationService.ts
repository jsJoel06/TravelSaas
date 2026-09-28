import { supabase } from "../lib/supabase";

export interface AgencySettings {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  logo_path: string | null;
}
export interface PreferencesSettings {
  currency: string;
  language: string;
  dateFormat: string;
  timezone: string;
}
export interface ItinerarySettings {
  showBudget: boolean;
  showInternalNotes: boolean;
  showContact: boolean;
  showAssumptions: boolean;
}
export interface TemplateSettings {
  defaultDays: number;
  includeNotes: boolean;
  includeActivities: boolean;
}
export interface NiaSettings {
  enabled: boolean;
  detail: string;
  customInstructions: string;
}
export interface AppSettings {
  id?: string;
  user_id: string;
  agency: AgencySettings;
  preferences: PreferencesSettings;
  itinerary_settings: ItinerarySettings;
  template_settings: TemplateSettings;
  nia_settings: NiaSettings;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_SETTINGS = {
  agency: {
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
    logo_path: null,
  } as AgencySettings,
  preferences: {
    currency: "USD",
    language: "Español",
    dateFormat: "DD/MM/YYYY",
    timezone: "America/Santo_Domingo",
  } as PreferencesSettings,
  itinerary_settings: {
    showBudget: true,
    showInternalNotes: false,
    showContact: true,
    showAssumptions: true,
  } as ItinerarySettings,
  template_settings: {
    defaultDays: 5,
    includeNotes: true,
    includeActivities: true,
  } as TemplateSettings,
  nia_settings: {
    enabled: true,
    detail: "Equilibrado",
    customInstructions: "",
  } as NiaSettings,
};

async function currentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Usuario no autenticado.");
  return user;
}

export async function getSettings(): Promise<AppSettings> {
  const user = await currentUser();
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { user_id: user.id, ...DEFAULT_SETTINGS };
  return {
    ...data,
    agency: { ...DEFAULT_SETTINGS.agency, ...(data.agency ?? {}) },
    preferences: {
      ...DEFAULT_SETTINGS.preferences,
      ...(data.preferences ?? {}),
    },
    itinerary_settings: {
      ...DEFAULT_SETTINGS.itinerary_settings,
      ...(data.itinerary_settings ?? {}),
    },
    template_settings: {
      ...DEFAULT_SETTINGS.template_settings,
      ...(data.template_settings ?? {}),
    },
    nia_settings: {
      ...DEFAULT_SETTINGS.nia_settings,
      ...(data.nia_settings ?? {}),
    },
  } as AppSettings;
}

export async function saveSettings(
  input: Omit<AppSettings, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<AppSettings> {
  const user = await currentUser();
  const { data, error } = await supabase
    .from("app_settings")
    .upsert(
      {
        user_id: user.id,
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as AppSettings;
}

export async function getAccountInfo() {
  const user = await currentUser();
  return {
    id: user.id,
    email: user.email ?? "",
    name: String(
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Usuario",
    ),
    role: String(user.user_metadata?.role ?? "Agente"),
    createdAt: user.created_at,
  };
}

export async function changePassword(password: string) {
  if (password.length < 8)
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function closeOtherSessions() {
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) throw error;
}

export async function uploadAgencyLogo(file: File): Promise<string> {
  const user = await currentUser();
  if (!file.type.startsWith("image/"))
    throw new Error("Selecciona una imagen válida.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("El logo no puede superar 5 MB.");
  const ext = (file.name.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("agency-assets")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getAgencyLogoUrl(
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("agency-assets")
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadProfilePhoto(file: File) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Usuario no autenticado.");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Solo puedes subir imágenes JPG, PNG o WEBP.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen no puede superar los 5 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

  const path = `${user.id}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  // Guardamos la ruta, no una URL firmada temporal.
  const { data, error: updateError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      avatar_path: path,
    },
  });

  if (updateError) {
    await supabase.storage.from("avatars").remove([path]);
    throw updateError;
  }

  return {
    path,
    user: data.user,
  };
}

export async function getProfilePhotoUrl(avatarPath?: string | null) {
  if (!avatarPath) return null;

  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(avatarPath, 60 * 60);

  if (error) throw error;

  return data.signedUrl;
}

export async function removeProfilePhoto() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Usuario no autenticado.");

  const avatarPath =
    typeof user.user_metadata?.avatar_path === "string"
      ? user.user_metadata.avatar_path
      : null;

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      avatar_path: null,
    },
  });

  if (updateError) throw updateError;

  if (avatarPath) {
    const { error: removeError } = await supabase.storage
      .from("avatars")
      .remove([avatarPath]);

    if (removeError) {
      console.warn("No se pudo eliminar el avatar anterior:", removeError);
    }
  }
}
