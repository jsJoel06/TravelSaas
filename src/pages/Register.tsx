import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaLock, FaUser } from "react-icons/fa";

import { registerUser } from "../service/authService";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (!data.session) {
        setSuccess(
          "Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta.",
        );
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "No se pudo crear la cuenta.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fb] px-4 py-8">
      {/* =====================================================
          FONDO
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-200/25 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/20 blur-3xl" />
      </div>

      {/* =====================================================
          CONTENEDOR
      ===================================================== */}

      <div className="relative z-10 w-full max-w-[420px]">
        {/* =====================================================
            LOGO TRAVEL SAAS
        ===================================================== */}

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

        {/* =====================================================
            CARD
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          {/* Línea superior */}

          <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500" />

          <div className="p-7 sm:p-8">
            {/* =================================================
                ENCABEZADO
            ================================================= */}

            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Crear cuenta
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Crea tu cuenta y comienza a gestionar tus viajes.
              </p>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            )}

            {/* =================================================
                FORMULARIO
            ================================================= */}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* =================================================
                  NOMBRE
              ================================================= */}

              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nombre completo
                </label>

                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Pérez"
                    autoComplete="name"
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* =================================================
                  EMAIL
              ================================================= */}

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

              {/* =================================================
                  CONTRASEÑA
              ================================================= */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>

                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Utiliza al menos 6 caracteres.
                </p>
              </div>

              {/* =================================================
                  BOTÓN CREAR CUENTA
              ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                SEPARADOR
            ================================================= */}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            {/* =================================================
                LOGIN
            ================================================= */}

            <Link
              to="/login"
              className="flex h-11 w-full items-center justify-center rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <p className="mt-6 text-center text-xs text-slate-400">
          Travel SaaS · Gestión inteligente de viajes
        </p>
      </div>
    </div>
  );
}
