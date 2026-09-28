import { supabase } from "../lib/supabase";

// =========================================================
// TIPOS
// =========================================================

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

// =========================================================
// REGISTRAR USUARIO
// =========================================================

export const registerUser = async ({
  fullName,
  email,
  password,
}: RegisterData) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: cleanName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

// =========================================================
// INICIAR SESIÓN
// =========================================================

export const loginUser = async (email: string, password: string) => {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

// =========================================================
// CERRAR SESIÓN
// =========================================================

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

// =========================================================
// OBTENER USUARIO ACTUAL
// =========================================================

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
};

// =========================================================
// OLVIDÉ MI CONTRASEÑA
// =========================================================

export const forgotPassword = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("Ingresa tu correo electrónico.");
  }

  const redirectTo = `${window.location.origin}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo,
  });

  if (error) {
    throw error;
  }
};

// =========================================================
// ESTABLECER NUEVA CONTRASEÑA
// =========================================================

export const resetPassword = async (newPassword: string) => {
  if (!newPassword) {
    throw new Error("Ingresa una nueva contraseña.");
  }

  if (newPassword.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }

  return data;
};

// =========================================================
// OBTENER SESIÓN ACTUAL
// =========================================================

export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
};
