
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaEnvelope,
  FaLock,
  FaPlaneDeparture,
} from "react-icons/fa";
import { loginUser } from "../service/authService";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginUser(email.trim(), password);
      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Correo o contraseña incorrectos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-4 py-8">

      {/* Fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-200/25 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex justify-center mb-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FaPlaneDeparture className="text-white text-base" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-none">
                Travel SaaS
              </h2>

              <p className="text-[11px] text-slate-400 mt-1">
                Gestión inteligente de viajes
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden">

          {/* Línea superior */}
          <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500" />

          <div className="p-7 sm:p-8">

            {/* Encabezado */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-900">
                Iniciar sesión
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Accede a tu espacio de trabajo.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Correo */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Contraseña
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "La recuperación de contraseña estará disponible próximamente."
                      )
                    }
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Registro */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">
                  ¿Nuevo en la plataforma?
                </span>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full h-11 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold flex items-center justify-center transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              Crear una cuenta
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Travel SaaS · Gestión inteligente de viajes
        </p>
      </div>
    </div>
  );
}

