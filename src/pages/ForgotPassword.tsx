import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaPaperPlane } from "react-icons/fa";

import { forgotPassword } from "../service/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await forgotPassword(email);

      setSuccess(
        "Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo electrónico.",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo enviar el correo de recuperación.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fb] px-4 py-8">
      {/* FONDO */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-200/25 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/20 blur-3xl" />
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

            <p className="-mt-1 text-center text-[11px] font-medium tracking-wide text-slate-400">
              Gestión inteligente de viajes
            </p>
          </div>
        </div>

        {/* CARD */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500" />

          <div className="p-7 sm:p-8">
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FaEnvelope />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Recuperar contraseña
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ingresa el correo asociado a tu cuenta y te enviaremos un enlace
                para crear una nueva contraseña.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <p className="text-sm leading-6 text-emerald-700">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar enlace
                    <FaPaperPlane className="text-xs" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                <FaArrowLeft className="text-xs" />
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Travel SaaS · Gestión inteligente de viajes
        </p>
      </div>
    </div>
  );
}
