import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FaCheckCircle,
  FaLock,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { resetPassword } from "../service/authService";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);

  const [validSession, setValidSession] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // COMPROBAR SESIÓN DE RECUPERACIÓN
  // =========================================================

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (active) {
          setValidSession(Boolean(session));
        }
      } catch {
        if (active) {
          setValidSession(false);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          setValidSession(Boolean(session));
          setCheckingSession(false);
        }
      },
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // =========================================================
  // ACTUALIZAR CONTRASEÑA
  // =========================================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(password);

      setSuccess(
        "Tu contraseña fue actualizada correctamente.",
      );

      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        void supabase.auth.signOut().finally(() => {
          navigate("/login", {
            replace: true,
          });
        });
      }, 1800);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la contraseña.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fb] px-4 py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-200/25 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* LOGO */}

        <div className="mb-7 flex justify-center">
          <div className="flex flex-col items-center">
            <img
              src="/logo.png"
              alt="Travel SaaS"
              className="h-[105px] w-auto max-w-[240px] object-contain"
            />

            <p className="-mt-1 text-[11px] font-medium tracking-wide text-slate-400">
              Gestión inteligente de viajes
            </p>
          </div>
        </div>

        {/* CARD */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500" />

          <div className="p-7 sm:p-8">
            {checkingSession ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                <p className="mt-4 text-sm text-slate-500">
                  Verificando enlace...
                </p>
              </div>
            ) : !validSession ? (
              <div className="py-5 text-center">
                <h1 className="text-xl font-bold text-slate-900">
                  Enlace no válido
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  El enlace de recuperación no es válido o
                  ha expirado.
                </p>

                <Link
                  to="/forgot-password"
                  className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Solicitar otro enlace
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FaLock />
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Nueva contraseña
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Crea una nueva contraseña para acceder a
                    tu cuenta de Travel SaaS.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <FaCheckCircle />

                    {success}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Nueva contraseña
                    </label>

                    <div className="relative">
                      <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        required
                        autoComplete="new-password"
                        disabled={loading}
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Confirmar contraseña
                    </label>

                    <div className="relative">
                      <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            e.target.value,
                          )
                        }
                        placeholder="Repite tu contraseña"
                        minLength={6}
                        required
                        autoComplete="new-password"
                        disabled={loading}
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || Boolean(success)}
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-60"
                  >
                    {loading
                      ? "Actualizando..."
                      : "Cambiar contraseña"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Travel SaaS · Gestión inteligente de viajes
        </p>
      </div>
    </div>
  );
}