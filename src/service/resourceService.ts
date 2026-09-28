import { supabase } from "../lib/supabase";

/* =========================================================
   TIPOS
========================================================= */

export type ResourceCategory =
  | "DOCUMENTO"
  | "GUIA"
  | "PLANTILLA"
  | "PROVEEDOR"
  | "REQUISITO"
  | "SEGURO"
  | "ENLACE"
  | "OTRO";

export interface Resource {
  id: string;
  agent_id: string;

  title: string;
  category: ResourceCategory;

  description: string | null;

  url: string | null;

  file_name: string | null;
  file_path: string | null;

  tags: string[];

  favorite: boolean;

  created_at: string;
  updated_at: string;
}

export interface CreateResourceData {
  title: string;
  category: ResourceCategory;

  description?: string | null;

  url?: string | null;

  tags?: string[];

  favorite?: boolean;
}

export type UpdateResourceData = Partial<CreateResourceData>;

/* =========================================================
   CONSTANTES
========================================================= */

const RESOURCE_BUCKET = "resources";

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
   OBTENER TODOS LOS RECURSOS
========================================================= */

export async function getResources(): Promise<Resource[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("agent_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Resource[];
}

/* =========================================================
   OBTENER RECURSO POR ID
========================================================= */

export async function getResourceById(id: string): Promise<Resource> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .eq("agent_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as Resource;
}

/* =========================================================
   CREAR RECURSO
========================================================= */

export async function createResource(
  resource: CreateResourceData,
  file?: File | null,
): Promise<Resource> {
  const user = await getCurrentUser();

  if (!resource.title.trim()) {
    throw new Error("El título del recurso es obligatorio.");
  }

  let uploadedFilePath: string | null = null;
  let uploadedFileName: string | null = null;

  try {
    /* =====================================================
       SUBIR ARCHIVO SI EXISTE
    ===================================================== */

    if (file) {
      const uploadedFile = await uploadResourceFile(file, user.id);

      uploadedFilePath = uploadedFile.path;
      uploadedFileName = uploadedFile.fileName;
    }

    /* =====================================================
       GUARDAR EN BASE DE DATOS
    ===================================================== */

    const { data, error } = await supabase
      .from("resources")
      .insert({
        agent_id: user.id,

        title: resource.title.trim(),

        category: resource.category,

        description: resource.description?.trim() || null,

        url: normalizeUrl(resource.url),

        file_name: uploadedFileName,

        file_path: uploadedFilePath,

        tags: cleanTags(resource.tags),

        favorite: resource.favorite ?? false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Resource;
  } catch (error) {
    /*
     * Si el archivo se subió pero falló el INSERT,
     * eliminamos el archivo para no dejar basura
     * en Storage.
     */
    if (uploadedFilePath) {
      await supabase.storage.from(RESOURCE_BUCKET).remove([uploadedFilePath]);
    }

    throw error;
  }
}

/* =========================================================
   ACTUALIZAR RECURSO
========================================================= */

export async function updateResource(
  id: string,
  resource: UpdateResourceData,
): Promise<Resource> {
  const user = await getCurrentUser();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (resource.title !== undefined) {
    const title = resource.title.trim();

    if (!title) {
      throw new Error("El título del recurso es obligatorio.");
    }

    payload.title = title;
  }

  if (resource.category !== undefined) {
    payload.category = resource.category;
  }

  if (resource.description !== undefined) {
    payload.description = resource.description?.trim() || null;
  }

  if (resource.url !== undefined) {
    payload.url = normalizeUrl(resource.url);
  }

  if (resource.tags !== undefined) {
    payload.tags = cleanTags(resource.tags);
  }

  if (resource.favorite !== undefined) {
    payload.favorite = resource.favorite;
  }

  const { data, error } = await supabase
    .from("resources")
    .update(payload)
    .eq("id", id)
    .eq("agent_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Resource;
}

/* =========================================================
   REEMPLAZAR ARCHIVO
========================================================= */

export async function replaceResourceFile(
  resource: Resource,
  file: File,
): Promise<Resource> {
  const user = await getCurrentUser();

  let newFilePath: string | null = null;

  try {
    const uploadedFile = await uploadResourceFile(file, user.id);

    newFilePath = uploadedFile.path;

    const { data, error } = await supabase
      .from("resources")
      .update({
        file_name: uploadedFile.fileName,
        file_path: uploadedFile.path,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resource.id)
      .eq("agent_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    /*
     * Solo eliminamos el archivo anterior DESPUÉS
     * de que la BD se actualizó correctamente.
     */
    if (resource.file_path && resource.file_path !== uploadedFile.path) {
      const { error: removeError } = await supabase.storage
        .from(RESOURCE_BUCKET)
        .remove([resource.file_path]);

      if (removeError) {
        console.warn("No se pudo eliminar el archivo anterior:", removeError);
      }
    }

    return data as Resource;
  } catch (error) {
    /*
     * Si se subió el archivo nuevo pero falló
     * la actualización de la BD, lo quitamos.
     */
    if (newFilePath) {
      await supabase.storage.from(RESOURCE_BUCKET).remove([newFilePath]);
    }

    throw error;
  }
}

/* =========================================================
   ELIMINAR ARCHIVO DE UN RECURSO
========================================================= */

export async function removeResourceFile(
  resource: Resource,
): Promise<Resource> {
  const user = await getCurrentUser();

  if (!resource.file_path) {
    return resource;
  }

  /*
   * Primero actualizamos BD.
   * Después intentamos borrar Storage.
   */

  const { data, error } = await supabase
    .from("resources")
    .update({
      file_name: null,
      file_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resource.id)
    .eq("agent_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const { error: storageError } = await supabase.storage
    .from(RESOURCE_BUCKET)
    .remove([resource.file_path]);

  if (storageError) {
    console.warn("No se pudo eliminar el archivo de Storage:", storageError);
  }

  return data as Resource;
}

/* =========================================================
   FAVORITO
========================================================= */

export async function toggleResourceFavorite(
  resource: Resource,
): Promise<Resource> {
  return updateResource(resource.id, {
    favorite: !resource.favorite,
  });
}

/* =========================================================
   ELIMINAR RECURSO
========================================================= */

export async function deleteResource(resource: Resource): Promise<void> {
  const user = await getCurrentUser();

  /*
   * Primero eliminamos la fila.
   * Así evitamos perder el registro si falla la BD.
   */

  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", resource.id)
    .eq("agent_id", user.id);

  if (error) {
    throw error;
  }

  /*
   * Luego eliminamos el archivo asociado.
   */

  if (resource.file_path) {
    const { error: storageError } = await supabase.storage
      .from(RESOURCE_BUCKET)
      .remove([resource.file_path]);

    if (storageError) {
      console.warn(
        "El recurso fue eliminado, pero no se pudo eliminar el archivo:",
        storageError,
      );
    }
  }
}

/* =========================================================
   SUBIR ARCHIVO
========================================================= */

async function uploadResourceFile(
  file: File,
  userId: string,
): Promise<{
  path: string;
  fileName: string;
}> {
  validateFile(file);

  const extension = getFileExtension(file.name);

  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const storageFileName = extension ? `${randomPart}.${extension}` : randomPart;

  /*
   * Cada usuario tiene su propia carpeta:
   *
   * resources/
   *   user-id/
   *      uuid.pdf
   */

  const path = `${userId}/${storageFileName}`;

  const { error } = await supabase.storage
    .from(RESOURCE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw error;
  }

  return {
    path,
    fileName: file.name,
  };
}

/* =========================================================
   URL TEMPORAL DEL ARCHIVO
========================================================= */

export async function getResourceFileUrl(filePath: string): Promise<string> {
  if (!filePath) {
    throw new Error("Este recurso no tiene un archivo asociado.");
  }

  /*
   * Signed URL.
   *
   * Esto permite mantener el bucket PRIVADO.
   * La URL dura 60 minutos.
   */

  const { data, error } = await supabase.storage
    .from(RESOURCE_BUCKET)
    .createSignedUrl(filePath, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

/* =========================================================
   ABRIR ARCHIVO
========================================================= */

export async function openResourceFile(resource: Resource): Promise<void> {
  if (!resource.file_path) {
    throw new Error("Este recurso no tiene un archivo asociado.");
  }

  const url = await getResourceFileUrl(resource.file_path);

  window.open(url, "_blank", "noopener,noreferrer");
}

/* =========================================================
   DESCARGAR ARCHIVO
========================================================= */

export async function downloadResourceFile(resource: Resource): Promise<void> {
  if (!resource.file_path) {
    throw new Error("Este recurso no tiene un archivo asociado.");
  }

  const { data, error } = await supabase.storage
    .from(RESOURCE_BUCKET)
    .download(resource.file_path);

  if (error) {
    throw error;
  }

  const url = URL.createObjectURL(data);

  const anchor = document.createElement("a");

  anchor.href = url;

  anchor.download = resource.file_name || "recurso";

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}

/* =========================================================
   ABRIR ENLACE EXTERNO
========================================================= */

export function openResourceUrl(resource: Resource): void {
  if (!resource.url) {
    throw new Error("Este recurso no tiene un enlace asociado.");
  }

  window.open(resource.url, "_blank", "noopener,noreferrer");
}

/* =========================================================
   VALIDAR ARCHIVO
========================================================= */

function validateFile(file: File): void {
  /*
   * 15 MB máximo.
   */

  const maxSize = 15 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("El archivo no puede superar los 15 MB.");
  }

  const allowedTypes = [
    "application/pdf",

    "image/jpeg",
    "image/png",
    "image/webp",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    "application/vnd.ms-powerpoint",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    "text/plain",
  ];

  /*
   * Algunos navegadores pueden devolver
   * file.type vacío para ciertos archivos.
   */

  if (file.type && !allowedTypes.includes(file.type)) {
    throw new Error(
      "Tipo de archivo no permitido. Usa PDF, imagen, Word, Excel, PowerPoint o TXT.",
    );
  }
}

/* =========================================================
   EXTENSIÓN
========================================================= */

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return (
    parts
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") ?? ""
  );
}

/* =========================================================
   LIMPIAR TAGS
========================================================= */

function cleanTags(tags?: string[]): string[] {
  if (!tags) {
    return [];
  }

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

/* =========================================================
   NORMALIZAR URL
========================================================= */

function normalizeUrl(value?: string | null): string | null {
  const url = value?.trim();

  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}
