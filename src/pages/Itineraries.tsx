
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiStar,
} from "react-icons/fi";

import {
  getItineraries,
  type Itinerary,
} from "../service/itineraryService";

// =========================================================
// HELPERS
// =========================================================

function formatDate(date: string | null) {
  if (!date) {
    return "Sin fecha";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Borrador";
    case "upcoming":
      return "Próximo";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "draft":
      return "border-slate-200 bg-slate-50 text-slate-600";

    case "upcoming":
      return "border-blue-100 bg-blue-50 text-blue-700";

    case "completed":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-red-100 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "draft":
      return <FiFileText size={12} />;

    case "upcoming":
      return <FiClock size={12} />;

    case "completed":
      return <FiCheckCircle size={12} />;

    case "cancelled":
      return <FiXCircle size={12} />;

    default:
      return <FiFileText size={12} />;
  }
}

function getStatusCount(
  itineraries: Itinerary[],
  status: string
) {
  return itineraries.filter(
    (item) => item.status === status
  ).length;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// =========================================================
// PAGE
// =========================================================

export default function Itineraries() {
  const navigate = useNavigate();

  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =======================================================
  // LOAD
  // =======================================================

  const loadItineraries = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getItineraries();

      setItineraries(data);
    } catch (err) {
      console.error(err);

      setError(
        "No pudimos cargar tus itinerarios. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItineraries();
  }, []);

  // =======================================================
  // FILTER
  // =======================================================

  const filteredItineraries = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return itineraries.filter((itinerary) => {
      const matchesSearch =
        !searchValue ||
        itinerary.title
          .toLowerCase()
          .includes(searchValue) ||
        itinerary.destination
          .toLowerCase()
          .includes(searchValue) ||
        itinerary.client?.full_name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        itinerary.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [itineraries, search, statusFilter]);

  // =======================================================
  // STATS
  // =======================================================

  const stats = {
    total: itineraries.length,
    draft: getStatusCount(itineraries, "draft"),
    upcoming: getStatusCount(itineraries, "upcoming"),
    completed: getStatusCount(
      itineraries,
      "completed"
    ),
  };

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "all";

  // =======================================================
  // CLEAR FILTERS
  // =======================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="min-h-screen bg-[#f5f8fc]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-[#0f172a] shadow-xl">

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                  Gestión de viajes
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Mis itinerarios
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Organiza y consulta las propuestas de viaje
                preparadas para tus clientes desde un solo
                lugar.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    navigate("/itinerarios/ia")
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:scale-[1.02] hover:from-blue-400 hover:to-cyan-300"
                >
                  <FiStar size={16} />

                  Crear con NIA

                  <FiArrowRight size={14} />
                </button>

                <button
                  onClick={() =>
                    navigate("/itinerarios/nuevo")
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  <FiPlus size={16} />

                  Nuevo itinerario
                </button>

              </div>
            </div>

            {/* HERO METRICS */}
            <div className="grid grid-cols-2 gap-3 sm:min-w-[310px]">

              <HeroMetric
                label="Total"
                value={stats.total}
              />

              <HeroMetric
                label="Próximos"
                value={stats.upcoming}
              />

              <HeroMetric
                label="Borradores"
                value={stats.draft}
              />

              <HeroMetric
                label="Completados"
                value={stats.completed}
              />

            </div>
          </div>
        </section>

        {/* STAT CARDS */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            label="Todos"
            value={stats.total}
            description="Itinerarios registrados"
            icon={<FiMapPin size={18} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            label="Borradores"
            value={stats.draft}
            description="Pendientes de preparar"
            icon={<FiFileText size={18} />}
            iconClass="bg-slate-100 text-slate-600"
          />

          <StatCard
            label="Próximos"
            value={stats.upcoming}
            description="Viajes programados"
            icon={<FiClock size={18} />}
            iconClass="bg-cyan-50 text-cyan-600"
          />

          <StatCard
            label="Completados"
            value={stats.completed}
            description="Viajes finalizados"
            icon={<FiCheckCircle size={18} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

        </section>

        {/* FILTER BAR */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="p-4 sm:p-5">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              {/* SEARCH */}
              <div className="relative flex-1">

                <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Buscar por título, destino o cliente..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* FILTER */}
              <div className="flex items-center gap-2">

                <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:flex">
                  <FiSliders size={16} />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="h-12 min-w-[190px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="all">
                    Todos los estados
                  </option>

                  <option value="draft">
                    Borradores ({stats.draft})
                  </option>

                  <option value="upcoming">
                    Próximos ({stats.upcoming})
                  </option>

                  <option value="completed">
                    Completados ({stats.completed})
                  </option>

                  <option value="cancelled">
                    Cancelados
                  </option>
                </select>

              </div>
            </div>

            {/* FILTER STATUS */}
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-blue-500" />

                <p className="text-xs font-medium text-slate-500">
                  {loading
                    ? "Cargando..."
                    : hasFilters
                    ? `${filteredItineraries.length} resultado${
                        filteredItineraries.length !== 1
                          ? "s"
                          : ""
                      }`
                    : `${itineraries.length} itinerario${
                        itineraries.length !== 1
                          ? "s"
                          : ""
                      } registrados`}
                </p>

              </div>

              <div className="flex items-center gap-3">

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
                  >
                    Limpiar filtros
                  </button>
                )}

                <button
                  onClick={() =>
                    loadItineraries(true)
                  }
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiRefreshCw
                    size={13}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Actualizar
                </button>

              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <FiXCircle size={18} />
              </div>

              <div>
                <p className="text-sm font-bold text-red-800">
                  No pudimos cargar los itinerarios
                </p>

                <p className="mt-0.5 text-xs text-red-600">
                  {error}
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                loadItineraries(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-red-600 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50"
            >
              <FiRefreshCw size={13} />

              Reintentar
            </button>

          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <LoadingState />
        ) : filteredItineraries.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={clearFilters}
            onCreate={() =>
              navigate("/itinerarios/nuevo")
            }
            onCreateWithAI={() =>
              navigate("/itinerarios/ia")
            }
          />
        ) : (
          <>
            {/* LIST HEADER */}
            <div className="mb-3 flex items-center justify-between px-1">

              <div>
                <p className="text-sm font-extrabold text-slate-800">
                  Tus propuestas
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Selecciona un itinerario para consultar
                  sus detalles.
                </p>
              </div>

              <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 sm:inline-flex">
                {filteredItineraries.length} resultados
              </span>

            </div>

            {/* LIST */}
            <div className="space-y-3">
              {filteredItineraries.map(
                (itinerary) => (
                  <ItineraryCard
                    key={itinerary.id}
                    itinerary={itinerary}
                    onOpen={() =>
                      navigate(
                        `/itinerarios/${itinerary.id}`
                      )
                    }
                  />
                )
              )}
            </div>
          </>
        )}

        {/* FOOTER */}
        {!loading && itineraries.length > 0 && (
          <div className="mt-7 flex flex-col gap-2 border-t border-slate-200 px-1 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Mostrando{" "}
              <span className="font-bold text-slate-600">
                {filteredItineraries.length}
              </span>{" "}
              de{" "}
              <span className="font-bold text-slate-600">
                {itineraries.length}
              </span>{" "}
              itinerarios
            </p>

            <p>
              Travel SaaS · Gestión inteligente de viajes
            </p>

          </div>
        )}

      </div>
    </main>
  );
}

// =========================================================
// HERO METRIC
// =========================================================

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${iconClass}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

// =========================================================
// ITINERARY CARD
// =========================================================

function ItineraryCard({
  itinerary,
  onOpen,
}: {
  itinerary: Itinerary;
  onOpen: () => void;
}) {
  const clientName =
    itinerary.client?.full_name ||
    "Sin cliente asignado";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">

      <div className="p-5 sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

          {/* LEFT */}
          <div className="min-w-0 flex-1">

            {/* TITLE */}
            <div className="flex flex-wrap items-center gap-2.5">

              <h2 className="min-w-0 truncate text-base font-black text-slate-900 sm:text-lg">
                {itinerary.title}
              </h2>

              <span
                className={`
                  inline-flex shrink-0 items-center gap-1.5
                  rounded-full border px-2.5 py-1
                  text-[10px] font-bold
                  ${getStatusClass(itinerary.status)}
                `}
              >
                {getStatusIcon(itinerary.status)}
                {getStatusLabel(itinerary.status)}
              </span>

            </div>

            {/* DESTINATION */}
            <div className="mt-4 flex items-center gap-2.5">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FiMapPin size={14} />
              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Destino
                </p>

                <p className="truncate text-sm font-bold text-slate-700">
                  {itinerary.destination}
                </p>

              </div>
            </div>

            {/* INFORMATION */}
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">

              <InfoItem
                icon={<FiCalendar size={14} />}
                label="Fechas"
                value={
                  <>
                    {formatDate(itinerary.start_date)}

                    {itinerary.end_date && (
                      <>
                        <span className="mx-1 text-slate-300">
                          →
                        </span>

                        {formatDate(
                          itinerary.end_date
                        )}
                      </>
                    )}
                  </>
                }
              />

              <InfoItem
                icon={<FiUsers size={14} />}
                label="Viajeros"
                value={`${itinerary.travelers} ${
                  itinerary.travelers === 1
                    ? "viajero"
                    : "viajeros"
                }`}
              />

              <InfoItem
                icon={<FiFileText size={14} />}
                label="Estado"
                value={getStatusLabel(
                  itinerary.status
                )}
              />

            </div>

            {/* CLIENT */}
            <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">

              {itinerary.client ? (
                <>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-[10px] font-black text-white shadow-sm">
                    {getInitials(clientName)}
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Cliente
                    </p>

                    <p className="truncate text-xs font-bold text-slate-700">
                      {clientName}
                    </p>

                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FiUsers size={15} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Cliente
                    </p>

                    <p className="text-xs font-semibold text-slate-500">
                      Sin cliente asignado
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* ACTION */}
          <div className="flex shrink-0 lg:pl-5">

            <button
              onClick={onOpen}
              className="group/button inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
            >
              Ver itinerario

              <FiChevronRight
                size={16}
                className="transition-transform group-hover/button:translate-x-1"
              />
            </button>

          </div>

        </div>
      </div>

      {/* BOTTOM ACCENT */}
      <div
        className={`
          h-1 w-full
          ${
            itinerary.status === "upcoming"
              ? "bg-gradient-to-r from-blue-500 to-cyan-400"
              : itinerary.status === "completed"
              ? "bg-emerald-500"
              : itinerary.status === "cancelled"
              ? "bg-red-400"
              : "bg-slate-200"
          }
        `}
      />

    </article>
  );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <div className="truncate text-xs font-bold text-slate-600">
          {value}
        </div>

      </div>
    </div>
  );
}

// =========================================================
// LOADING
// =========================================================

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="p-10 sm:p-14">

        <div className="mx-auto flex max-w-sm flex-col items-center text-center">

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">

            <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-400/10" />

            <FiRefreshCw
              size={24}
              className="relative animate-spin"
            />
          </div>

          <h3 className="mt-5 text-base font-black text-slate-800">
            Cargando tus itinerarios
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Estamos preparando tu espacio de trabajo...
          </p>

          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">

            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />

          </div>

        </div>
      </div>
    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
  onCreateWithAI,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
  onCreateWithAI: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="relative px-6 py-14 text-center sm:px-10 sm:py-20">

        <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-96 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-lg flex-col items-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 ring-1 ring-blue-100 shadow-sm">

            {hasFilters ? (
              <FiSearch size={29} />
            ) : (
              <FiMapPin size={29} />
            )}

          </div>

          <div className="mt-6">

            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              {hasFilters
                ? "Sin resultados"
                : "Comienza aquí"}
            </span>

          </div>

          <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {hasFilters
              ? "No encontramos itinerarios"
              : "Todavía no tienes itinerarios"}
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            {hasFilters
              ? "Prueba con otro término de búsqueda o cambia los filtros para encontrar lo que necesitas."
              : "Crea una propuesta manualmente o deja que NIA te ayude a transformar las necesidades de tu cliente en una propuesta de viaje."}
          </p>

          {hasFilters ? (
            <button
              onClick={onClear}
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          ) : (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={onCreateWithAI}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-600"
              >
                <FiStar size={16} />

                Crear con NIA

                <FiArrowRight size={14} />
              </button>

              <button
                onClick={onCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FiPlus size={16} />

                Crear manualmente
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

