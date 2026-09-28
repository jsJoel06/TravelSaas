import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiFileText,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiStar,
} from "react-icons/fi";
import { getItineraries, type Itinerary } from "../service/itineraryService";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd456c]";
const primary = `inline-flex items-center justify-center gap-2 rounded-xl bg-[#bd456c] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a5365a] ${focus}`;
const secondary = `inline-flex items-center justify-center gap-2 rounded-xl border border-[#ead9df] bg-white px-4 py-3 text-sm font-medium text-[#94516a] transition-colors hover:bg-[#fcf0f3] ${focus}`;
const statuses = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Borradores" },
  { value: "upcoming", label: "Próximos" },
  { value: "completed", label: "Completados" },
  { value: "cancelled", label: "Cancelados" },
];
const normalize = (value: string | null | undefined) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  return Number.isNaN(date.getTime())
    ? "Sin fecha válida"
    : date.toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}
function statusInfo(status: string) {
  switch (status) {
    case "draft":
      return {
        label: "Borrador",
        style: "border-[#e8dfd9] bg-[#f6f1ed] text-[#806f63]",
        Icon: FiFileText,
      };
    case "upcoming":
      return {
        label: "Próximo",
        style: "border-[#eed4de] bg-[#fcecf2] text-[#a14165]",
        Icon: FiClock,
      };
    case "completed":
      return {
        label: "Completado",
        style: "border-[#dce8d9] bg-[#eff5ed] text-[#56744d]",
        Icon: FiCheckCircle,
      };
    case "cancelled":
      return {
        label: "Cancelado",
        style: "border-red-100 bg-red-50 text-red-700",
        Icon: FiXCircle,
      };
    default:
      return {
        label: status || "Sin estado",
        style: "border-[#e8dfd9] bg-[#f6f1ed] text-[#806f63]",
        Icon: FiFileText,
      };
  }
}

export default function Itineraries() {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const requestId = useRef(0);

  const loadItineraries = useCallback(async (refresh = false) => {
    const current = ++requestId.current;
    setError("");
    setLoading(!refresh);
    setRefreshing(refresh);
    try {
      const data = await getItineraries();
      if (current !== requestId.current) return;
      setItineraries(data);
      setLoaded(true);
    } catch {
      if (current === requestId.current)
        setError("No pudimos cargar tus itinerarios. Intenta nuevamente.");
    } finally {
      if (current === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadItineraries();
    return () => {
      requestId.current += 1;
    };
  }, [loadItineraries]);

  const filtered = useMemo(
    () =>
      itineraries.filter((item) => {
        const term = normalize(search);
        return (
          (!term ||
            [item.title, item.destination, item.client?.full_name].some(
              (value) => normalize(value).includes(term),
            )) &&
          (statusFilter === "all" || item.status === statusFilter)
        );
      }),
    [itineraries, search, statusFilter],
  );
  const count = (status: string) =>
    status === "all"
      ? itineraries.length
      : itineraries.filter((item) => item.status === status).length;
  const hasFilters = Boolean(search.trim()) || statusFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };
  const busy = loading || refreshing;

  return (
    <main className="min-h-screen min-w-0 bg-[#fcf8f6] text-[#382e33]">
      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
        <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a27084]">
              Tu agencia · Viajes a medida
            </p>
            <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
              Mis itinerarios
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#88737d]">
              Crea, organiza y personaliza cada experiencia de viaje.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/itinerarios/ia")}
              className={secondary}
            >
              <FiStar aria-hidden="true" size={15} />
              Crear con NIA
            </button>
            <button
              type="button"
              onClick={() => navigate("/itinerarios/nuevo")}
              className={primary}
            >
              <FiPlus aria-hidden="true" size={16} />
              Crear itinerario
            </button>
          </div>
        </header>

        <section
          aria-label="Resumen de itinerarios"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {[
            { label: "Todos los itinerarios", status: "all", Icon: FiMapPin },
            { label: "Borradores", status: "draft", Icon: FiFileText },
            { label: "Próximos viajes", status: "upcoming", Icon: FiCalendar },
            { label: "Completados", status: "completed", Icon: FiCheckCircle },
          ].map(({ label, status, Icon }) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`rounded-2xl border p-4 text-left transition-colors sm:p-5 ${focus} ${statusFilter === status ? "border-[#ddb3c2] bg-[#fbedf1]" : "border-[#eee2e4] bg-white hover:bg-[#fffafb]"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs leading-5 text-[#8a6d79]">
                  {label}
                </span>
                <Icon
                  aria-hidden="true"
                  className="shrink-0 text-[#b26984]"
                  size={17}
                />
              </div>
              <span className="mt-3 block font-serif text-3xl">
                {loaded ? count(status) : "—"}
              </span>
            </button>
          ))}
        </section>

        <section
          aria-label="Buscar y filtrar itinerarios"
          className="rounded-2xl border border-[#eee2e4] bg-white px-4 pt-4 sm:px-5 sm:pt-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor="itinerary-search" className="sr-only">
                Buscar por título, destino o cliente
              </label>
              <FiSearch
                aria-hidden="true"
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ac8a98]"
              />
              <input
                id="itinerary-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, destino o cliente…"
                className="h-11 w-full rounded-xl border border-[#eee2e4] bg-[#fcf8f9] pl-11 pr-4 text-sm text-[#68525d] outline-none placeholder:text-[#a68f99] focus:border-[#bd7891] focus:ring-2 focus:ring-[#f5dce5]"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadItineraries(loaded)}
              disabled={busy}
              className={`${secondary} disabled:cursor-wait disabled:opacity-50`}
            >
              <FiRefreshCw
                aria-hidden="true"
                size={14}
                className={
                  busy ? "animate-spin motion-reduce:animate-none" : ""
                }
              />
              {refreshing ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
          <div
            className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-[#f4eaed] pt-2"
            aria-label="Filtrar por estado"
          >
            {statuses.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => setStatusFilter(status.value)}
                aria-pressed={statusFilter === status.value}
                className={`inline-flex items-center gap-2 border-b-2 px-1 py-3 text-xs transition-colors ${focus} ${statusFilter === status.value ? "border-[#bd456c] font-semibold text-[#a43d60]" : "border-transparent text-[#8c7480] hover:text-[#a43d60]"}`}
              >
                {status.label}
                <span className="rounded-full bg-[#f8f0f3] px-1.5 py-0.5 text-[10px]">
                  {loaded ? count(status.value) : "—"}
                </span>
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-4"
          >
            <div>
              <p className="text-sm text-red-800">{error}</p>
              {loaded && (
                <p className="mt-1 text-xs text-red-700">
                  Se muestran los últimos datos cargados.
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void loadItineraries(loaded)}
              className={`${secondary} disabled:opacity-50`}
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-[#eee2e4] bg-white px-6 py-20 text-center"
          >
            <FiRefreshCw
              aria-hidden="true"
              className="mx-auto mb-4 animate-spin text-2xl text-[#bd7891] motion-reduce:animate-none"
            />
            <p className="text-sm text-[#88737d]">Cargando tus itinerarios…</p>
          </div>
        ) : loaded ? (
          <section aria-label="Lista de itinerarios" aria-busy={refreshing}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" className="text-xs text-[#8a7580]">
                {filtered.length}{" "}
                {filtered.length === 1 ? "itinerario" : "itinerarios"}
                {hasFilters ? " encontrados" : " en tu espacio"}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`rounded px-2 py-1 text-xs font-medium text-[#a43d60] hover:bg-[#fae9ee] ${focus}`}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            {filtered.length ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((item) => (
                  <ItineraryCard
                    key={item.id}
                    itinerary={item}
                    onOpen={() => navigate(`/itinerarios/${item.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#eee2e4] bg-white px-6 py-16 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#faedf1] text-[#b36a85]">
                  {hasFilters ? (
                    <FiSearch aria-hidden="true" size={25} />
                  ) : (
                    <FiMapPin aria-hidden="true" size={25} />
                  )}
                </span>
                <h2 className="mt-5 font-serif text-2xl">
                  {hasFilters
                    ? "No encontramos itinerarios"
                    : "Tu próximo gran viaje empieza aquí"}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#88737d]">
                  {hasFilters
                    ? "Prueba otro título, destino o cliente, o cambia el estado seleccionado."
                    : "Crea tu primer itinerario y prepara una experiencia a la medida de tu cliente."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={secondary}
                    >
                      Limpiar filtros
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate("/itinerarios/nuevo")}
                        className={primary}
                      >
                        <FiPlus aria-hidden="true" />
                        Crear manualmente
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/itinerarios/ia")}
                        className={secondary}
                      >
                        <FiStar aria-hidden="true" />
                        Crear con NIA
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        ) : null}
        {loaded && itineraries.length > 0 && (
          <footer className="flex flex-wrap justify-between gap-2 border-t border-[#eee2e4] pt-5 text-xs text-[#9a818d]">
            <span>
              Mostrando {filtered.length} de {itineraries.length} itinerarios
            </span>
            <span className="font-serif italic">
              Cada viaje, una nueva historia.
            </span>
          </footer>
        )}
      </div>
    </main>
  );
}

function ItineraryCard({
  itinerary,
  onOpen,
}: {
  itinerary: Itinerary;
  onOpen: () => void;
}) {
  const { label, style, Icon } = statusInfo(itinerary.status);
  const client = itinerary.client?.full_name || "Sin cliente asignado";
  const initials = client
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#eee2e4] bg-white transition-colors hover:border-[#d9afbf]">
      <div className="flex items-center justify-between gap-3 border-b border-[#f1e6ea] bg-[#fcf4f6] px-5 py-4">
        <span className="flex min-w-0 items-center gap-2 text-xs text-[#986b7e]">
          <FiMapPin aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {itinerary.destination || "Destino por definir"}
          </span>
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] ${style}`}
        >
          <Icon aria-hidden="true" size={11} />
          {label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="break-words font-serif text-xl leading-snug">
          {itinerary.title || "Itinerario sin título"}
        </h2>
        <div className="mt-5 space-y-3 text-xs leading-5 text-[#88717d]">
          <p className="flex items-start gap-2">
            <FiCalendar
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[#b9869b]"
              size={14}
            />
            <span>
              {formatDate(itinerary.start_date)}
              {itinerary.end_date ? ` — ${formatDate(itinerary.end_date)}` : ""}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <FiUsers
              aria-hidden="true"
              className="shrink-0 text-[#b9869b]"
              size={14}
            />
            {itinerary.travelers}{" "}
            {itinerary.travelers === 1 ? "viajero" : "viajeros"}
          </p>
        </div>
        <div className="mb-5 mt-5 flex min-w-0 items-center gap-3 border-t border-[#f3e9ed] pt-4">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8e8ee] text-[10px] font-semibold text-[#a85c78]"
          >
            {itinerary.client ? initials : <FiUsers size={14} />}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] text-[#ab929d]">Cliente</p>
            <p
              className="truncate text-xs font-medium text-[#755865]"
              title={client}
            >
              {client}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Ver itinerario: ${itinerary.title || "Sin título"}`}
          className={`${secondary} mt-auto w-full justify-between`}
        >
          Ver itinerario
          <FiArrowRight aria-hidden="true" size={14} />
        </button>
      </div>
    </article>
  );
}
