import {
  FaArrowRight,
  FaCalendarAlt,
  FaChevronRight,
  FaGlobeAmericas,
  FaMapMarkerAlt,
  FaPlaneDeparture,
  FaPlus,
  FaRobot,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const nombre =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f8fc]">
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <section className="animate-[fadeUp_.55s_ease-out_both] mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                </span>

                <span className="text-xs font-bold text-slate-600">
                  Panel de trabajo
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Hola,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {nombre}
                </span>
                <span className="ml-1 inline-block animate-[wave_1.8s_ease-in-out_infinite]">
                  👋
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                Gestiona clientes, destinos y propuestas de viaje desde un solo
                lugar.
              </p>
            </div>

            <button
              onClick={() => navigate("/itinerarios/ia")}
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <FaRobot size={14} />
              </span>
              Crear con NIA
              <FaArrowRight
                size={11}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </section>

        {/* =========================================================
            NIA HERO
        ========================================================= */}
        <section className="animate-[fadeUp_.65s_.08s_ease-out_both] relative mb-7 overflow-hidden rounded-[28px] bg-[#0f172a] shadow-xl shadow-slate-900/10">
          {/* Luces flotantes */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 animate-[float_7s_ease-in-out_infinite] rounded-full bg-blue-500/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 right-[25%] h-72 w-72 animate-[float_9s_1s_ease-in-out_infinite] rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="pointer-events-none absolute left-[40%] top-1/2 h-40 w-40 -translate-y-1/2 animate-pulse rounded-full bg-blue-400/5 blur-2xl" />

          {/* Grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          {/* Brillo que atraviesa el hero */}
          <div className="pointer-events-none absolute -left-[20%] top-0 h-full w-[25%] rotate-[12deg] animate-[shine_7s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.035] to-transparent blur-xl" />

          <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-2 text-xs font-bold text-cyan-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-400/15">
                  <FaRobot size={11} />
                </span>
                NIA · Copiloto inteligente
                <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                Disponible
              </div>

              <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
                Convierte las necesidades del cliente en una{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  propuesta de viaje.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
                Describe lo que busca el viajero y NIA te ayuda a analizar sus
                necesidades, explorar el destino y preparar una propuesta para
                que puedas revisarla antes de presentarla.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/itinerarios/ia")}
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-xl active:scale-95"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <FaRobot size={13} />
                  </span>
                  Preparar propuesta
                  <FaArrowRight
                    size={11}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <button
                  onClick={() => navigate("/itinerarios")}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                >
                  Ver propuestas
                  <FaChevronRight
                    size={9}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>

            {/* NIA VISUAL */}
            <div className="hidden shrink-0 lg:block">
              <div className="relative flex h-52 w-52 items-center justify-center">
                <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-[42px] border border-white/10 bg-white/[0.025]" />

                <div className="absolute inset-5 animate-[spin_14s_linear_infinite_reverse] rounded-[34px] border border-cyan-400/10" />

                <div className="absolute inset-10 rounded-[27px] border border-blue-400/10" />

                {/* partículas */}
                <div className="absolute right-3 top-5 h-3 w-3 animate-pulse rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />

                <div className="absolute bottom-8 left-5 h-2 w-2 animate-[float_3s_ease-in-out_infinite] rounded-full bg-blue-400" />

                <div className="absolute left-8 top-9 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />

                <div className="relative flex h-28 w-28 animate-[niaFloat_4s_ease-in-out_infinite] items-center justify-center rounded-[30px] bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl shadow-blue-500/30">
                  <div className="absolute inset-0 animate-ping rounded-[30px] bg-cyan-400/10" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#0f172a]">
                    <FaRobot
                      size={39}
                      className="animate-[robotPulse_3s_ease-in-out_infinite] text-cyan-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Línea inferior */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        </section>

        {/* =========================================================
            STATS
        ========================================================= */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="animate-[fadeUp_.55s_.15s_ease-out_both]">
            <StatCard
              title="Itinerarios"
              value="0"
              description="Propuestas creadas"
              icon={<FaPlaneDeparture size={18} />}
              iconClass="bg-blue-50 text-blue-600"
              accent="from-blue-500 to-blue-600"
            />
          </div>

          <div className="animate-[fadeUp_.55s_.22s_ease-out_both]">
            <StatCard
              title="Clientes"
              value="0"
              description="Clientes registrados"
              icon={<FaUsers size={18} />}
              iconClass="bg-cyan-50 text-cyan-600"
              accent="from-cyan-400 to-cyan-500"
            />
          </div>

          <div className="animate-[fadeUp_.55s_.29s_ease-out_both]">
            <StatCard
              title="Destinos"
              value="0"
              description="Destinos disponibles"
              icon={<FaGlobeAmericas size={18} />}
              iconClass="bg-sky-50 text-sky-600"
              accent="from-sky-400 to-blue-500"
            />
          </div>
        </section>

        {/* =========================================================
            MAIN CONTENT
        ========================================================= */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* ITINERARIOS */}
          <div className="animate-[fadeUp_.6s_.32s_ease-out_both] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Itinerarios recientes
                  </h2>

                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                    0
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Tus propuestas de viaje
                </p>
              </div>

              <button
                onClick={() => navigate("/itinerarios")}
                className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-blue-600"
              >
                Ver todos
                <FaArrowRight
                  size={9}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
            </div>

            <div className="px-5 py-14 sm:px-6">
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-blue-100 blur-xl" />

                  <div className="relative flex h-16 w-16 animate-[float_4s_ease-in-out_infinite] items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-500">
                    <FaPlaneDeparture size={22} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800">
                  Aún no tienes itinerarios
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Crea tu primera propuesta y comienza a organizar experiencias
                  personalizadas para tus clientes.
                </p>

                <button
                  onClick={() => navigate("/itinerarios/ia")}
                  className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"
                >
                  <FaRobot
                    size={13}
                    className="transition-transform duration-300 group-hover:rotate-6"
                  />
                  Crear propuesta
                  <FaArrowRight
                    size={9}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ACCIONES RÁPIDAS */}
          <div className="animate-[fadeUp_.6s_.4s_ease-out_both] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div className="border-b border-slate-100 px-5 py-5">
              <h2 className="text-base font-bold text-slate-900">
                Acciones rápidas
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Accede rápidamente a las funciones principales
              </p>
            </div>

            <div className="space-y-1 p-3">
              <QuickAction
                title="Crear con NIA"
                description="Preparar una nueva propuesta"
                icon={<FaRobot size={15} />}
                iconClass="bg-blue-50 text-blue-600"
                hoverClass="hover:bg-blue-50/60"
                onClick={() => navigate("/itinerarios/ia")}
              />

              <QuickAction
                title="Nuevo cliente"
                description="Registrar información del cliente"
                icon={<FaUsers size={15} />}
                iconClass="bg-cyan-50 text-cyan-600"
                hoverClass="hover:bg-cyan-50/60"
                onClick={() => navigate("/clientes")}
              />

              <QuickAction
                title="Mis itinerarios"
                description="Consultar propuestas creadas"
                icon={<FaPlaneDeparture size={15} />}
                iconClass="bg-sky-50 text-sky-600"
                hoverClass="hover:bg-sky-50/60"
                onClick={() => navigate("/itinerarios")}
              />

              <QuickAction
                title="Explorar destinos"
                description="Consultar destinos disponibles"
                icon={<FaMapMarkerAlt size={15} />}
                iconClass="bg-blue-50 text-blue-600"
                hoverClass="hover:bg-blue-50/60"
                onClick={() => navigate("/destinos")}
              />
            </div>

            <div className="mx-4 mb-4 mt-2 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <FaPlus size={11} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Flujo de trabajo
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Cliente → NIA → Propuesta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRÓXIMOS VIAJES
        ========================================================= */}
        <section className="animate-[fadeUp_.6s_.48s_ease-out_both] mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                <FaCalendarAlt size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Próximos viajes
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Aquí aparecerán los viajes próximos de tus clientes.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/itinerarios")}
              className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-blue-600"
            >
              Ver itinerarios
              <FaChevronRight
                size={9}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </section>

        {/* =========================================================
            FOOTER
        ========================================================= */}
        <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Travel SaaS · Gestión inteligente de viajes</p>

          <p className="inline-flex items-center gap-1.5">
            <FaRobot size={9} className="text-cyan-500" />
            NIA te ayuda a preparar. Tú decides qué presentar al cliente.
          </p>
        </div>
      </main>

      {/* Animaciones */}
      <style>
        {`
          @keyframes fadeUp {
            0% {
              opacity: 0;
              transform: translateY(18px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            50% {
              transform: translateY(-12px) translateX(5px);
            }
          }

          @keyframes niaFloat {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-8px) rotate(1deg);
            }
          }

          @keyframes robotPulse {
            0%, 100% {
              transform: scale(1);
              filter: drop-shadow(0 0 0 rgba(103, 232, 249, 0));
            }
            50% {
              transform: scale(1.08);
              filter: drop-shadow(0 0 8px rgba(103, 232, 249, .35));
            }
          }

          @keyframes shine {
            0% {
              transform: translateX(-100%) rotate(12deg);
            }
            35%, 100% {
              transform: translateX(600%) rotate(12deg);
            }
          }

          @keyframes wave {
            0%, 100% {
              transform: rotate(0deg);
            }
            15% {
              transform: rotate(14deg);
            }
            30% {
              transform: rotate(-8deg);
            }
            45% {
              transform: rotate(12deg);
            }
            60% {
              transform: rotate(0deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* ===============================================================
   STAT CARD
================================================================ */

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${accent} opacity-0 transition duration-300 group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 transition-transform duration-300 group-hover:translate-x-1">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   QUICK ACTION
================================================================ */

function QuickAction({
  title,
  description,
  icon,
  iconClass,
  hoverClass,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  hoverClass: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 ${hoverClass} hover:translate-x-1`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800 transition-colors duration-200 group-hover:text-blue-600">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-400">{description}</p>
      </div>

      <FaChevronRight
        size={9}
        className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-500"
      />
    </button>
  );
}
