import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiGlobe,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import {
  deleteDestination,
  getDestinations,
  toggleDestination,
  type Destination,
} from "../../service/destinationService";

const typeOptions = [
  "Todos",
  "Playa",
  "Naturaleza",
  "Aventura",
  "Ciudad",
  "Cultura",
  "Ecoturismo",
  "Romántico",
  "Familiar",
];

export default function Destinos() {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDestinations = useCallback(async (refresh = false) => {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getDestinations();
      setDestinations(data);
    } catch (err) {
      console.error(err);
      setError("No pudimos cargar los destinos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return destinations.filter((destination) => {
      if (!showInactive && !destination.active) {
        return false;
      }

      const matchesSearch =
        !query ||
        destination.name.toLowerCase().includes(query) ||
        destination.country.toLowerCase().includes(query) ||
        destination.region?.toLowerCase().includes(query);

      const matchesType =
        selectedType === "Todos" ||
        destination.destination_type?.some(
          (type) => type.toLowerCase() === selectedType.toLowerCase(),
        );

      return matchesSearch && matchesType;
    });
  }, [destinations, search, selectedType, showInactive]);

  const stats = useMemo(() => {
    const active = destinations.filter((item) => item.active).length;
    const inactive = destinations.filter((item) => !item.active).length;

    const countries = new Set(
      destinations.map((item) => item.country.trim()).filter(Boolean),
    ).size;

    return {
      total: destinations.length,
      active,
      inactive,
      countries,
    };
  }, [destinations]);

  const handleDelete = async (destination: Destination) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${destination.name}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(destination.id);

      await deleteDestination(destination.id);

      setDestinations((current) =>
        current.filter((item) => item.id !== destination.id),
      );
    } catch (err) {
      console.error(err);
      window.alert("No se pudo eliminar el destino.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (destination: Destination) => {
    try {
      const updated = await toggleDestination(
        destination.id,
        !destination.active,
      );

      setDestinations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      console.error(err);
      window.alert("No se pudo cambiar el estado del destino.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
              <FiGlobe size={14} />
              Biblioteca de destinos
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Destinos
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Administra los destinos que Travel SaaS utiliza para orientar a
              tus clientes y construir propuestas de viaje.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadDestinations(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Actualizar
            </button>

            <button
              type="button"
              onClick={() => navigate("/destinos/nuevo")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-cyan-600"
            >
              <FiPlus size={17} />
              Nuevo destino
            </button>
          </div>
        </header>

        {/* ESTADÍSTICAS */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<FiGlobe />}
            label="Destinos"
            value={stats.total}
            description="En la biblioteca"
          />

          <StatCard
            icon={<FiActivity />}
            label="Activos"
            value={stats.active}
            description="Disponibles para NIA"
            accent="green"
          />

          <StatCard
            icon={<FiMapPin />}
            label="Países"
            value={stats.countries}
            description="Con destinos registrados"
            accent="blue"
          />

          <StatCard
            icon={<FiClock />}
            label="Inactivos"
            value={stats.inactive}
            description="No visibles actualmente"
            accent="amber"
          />
        </section>

        {/* FILTROS */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <FiSearch
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar destino, país o región..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {typeOptions.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    selectedType === type
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {type}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowInactive((value) => !value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  showInactive
                    ? "bg-slate-800 text-white"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {showInactive ? "Ocultar inactivos" : "Ver inactivos"}
              </button>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-red-700">
                No se pudieron cargar los destinos
              </p>

              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadDestinations()}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* CONTENIDO */}
        {loading ? (
          <LoadingState />
        ) : filteredDestinations.length === 0 ? (
          <EmptyState
            hasSearch={Boolean(search || selectedType !== "Todos")}
            onCreate={() => navigate("/destinos/nuevo")}
            onClear={() => {
              setSearch("");
              setSelectedType("Todos");
            }}
          />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">
                  Destinos disponibles
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {filteredDestinations.length} resultado
                  {filteredDestinations.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  deleting={deletingId === destination.id}
                  onEdit={() => navigate(`/destinos/${destination.id}/editar`)}
                  onDelete={() => handleDelete(destination)}
                  onToggle={() => handleToggle(destination)}
                  onView={() => navigate(`/destinos/${destination.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  accent = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
  accent?: "blue" | "green" | "amber";
}) {
  const iconClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClasses[accent]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-2 text-[11px] font-medium text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   DESTINATION CARD
========================================================= */

function DestinationCard({
  destination,
  deleting,
  onEdit,
  onDelete,
  onToggle,
  onView,
}: {
  destination: Destination;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onView: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      {/* IMAGEN */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500">
        {destination.image_url ? (
          <img
            src={destination.image_url}
            alt={destination.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FiGlobe className="text-6xl text-white/25" />
          </div>
        )}

        {/* BADGES */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur ${
              destination.active
                ? "bg-emerald-500/90 text-white"
                : "bg-slate-900/70 text-slate-200"
            }`}
          >
            {destination.active ? "Activo" : "Inactivo"}
          </span>

          {destination.budget_level && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-slate-700 shadow-sm backdrop-blur">
              {destination.budget_level}
            </span>
          )}
        </div>

        {/* INFO SOBRE IMAGEN */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 pb-4 pt-12">
          <h3 className="text-lg font-extrabold text-white">
            {destination.name}
          </h3>

          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/80">
            <FiMapPin size={12} />

            {destination.region
              ? `${destination.region}, ${destination.country}`
              : destination.country}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-5">
        <p className="min-h-[48px] text-sm leading-6 text-slate-500">
          {destination.description ||
            "Sin descripción disponible para este destino."}
        </p>

        {/* TIPOS */}
        {destination.destination_type?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {destination.destination_type.slice(0, 4).map((type) => (
              <span
                key={type}
                className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* DATOS */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
              <FiCalendar size={14} />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Duración
              </p>

              <p className="text-xs font-bold text-slate-700">
                {destination.recommended_days
                  ? `${destination.recommended_days} días`
                  : "Por definir"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
              <FiUsers size={14} />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Ideal para
              </p>

              <p className="max-w-[100px] truncate text-xs font-bold text-slate-700">
                {destination.destination_type?.[0] || "Viajeros"}
              </p>
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onView}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Ver destino
            <FiChevronRight size={14} />
          </button>

          <button
            type="button"
            onClick={onEdit}
            title="Editar"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <FiEdit3 size={15} />
          </button>

          <button
            type="button"
            onClick={onToggle}
            title={destination.active ? "Desactivar" : "Activar"}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              destination.active
                ? "border-amber-100 text-amber-500 hover:bg-amber-50"
                : "border-emerald-100 text-emerald-500 hover:bg-emerald-50"
            }`}
          >
            <FiActivity size={15} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            title="Eliminar"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <FiRefreshCw size={15} className="animate-spin" />
            ) : (
              <FiTrash2 size={15} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="h-48 animate-pulse bg-slate-200" />

          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />

            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />

            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />

            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasSearch,
  onCreate,
  onClear,
}: {
  hasSearch: boolean;
  onCreate: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        {hasSearch ? <FiSearch size={27} /> : <FiGlobe size={27} />}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-800">
        {hasSearch ? "No encontramos destinos" : "Todavía no tienes destinos"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasSearch
          ? "Prueba con otro término de búsqueda o cambia los filtros."
          : "Agrega destinos para construir la biblioteca que utilizarán tu equipo y NIA."}
      </p>

      <div className="mt-6 flex justify-center gap-3">
        {hasSearch && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <FiPlus size={15} />
          Crear destino
        </button>
      </div>
    </div>
  );
}
