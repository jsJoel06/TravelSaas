import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArchive,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiFileText,
  FiMapPin,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";
import {
  getTemplates,
  deleteTemplate,
  toggleTemplate,
  type Template,
} from "../../service/templateService";

const travelTypes = [
  "Todos",
  "Playa",
  "Familiar",
  "Romántico",
  "Aventura",
  "Cultural",
  "Lujo",
  "Gastronomía",
  "Corporativo",
];

const budgetLabels: Record<string, string> = {
  Económico: "Económico",
  Medio: "Medio",
  Alto: "Alto",
  Premium: "Premium",
};

function Plantillas() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadTemplates = useCallback(async (refresh = false) => {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las plantillas.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        !normalizedSearch ||
        template.name.toLowerCase().includes(normalizedSearch) ||
        template.destination?.toLowerCase().includes(normalizedSearch) ||
        template.country?.toLowerCase().includes(normalizedSearch) ||
        template.description?.toLowerCase().includes(normalizedSearch);

      const matchesType =
        typeFilter === "Todos" ||
        template.travel_type?.toLowerCase() === typeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "Activas" && template.active) ||
        (statusFilter === "Inactivas" && !template.active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [templates, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const active = templates.filter((item) => item.active).length;
    const inactive = templates.filter((item) => !item.active).length;

    const destinations = new Set(
      templates.map((item) => item.destination?.trim()).filter(Boolean),
    ).size;

    return {
      total: templates.length,
      active,
      inactive,
      destinations,
    };
  }, [templates]);

  const handleDelete = async (template: Template) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la plantilla "${template.name}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(template.id);

      await deleteTemplate(template.id);

      setTemplates((current) =>
        current.filter((item) => item.id !== template.id),
      );

      setMenuOpen(null);
    } catch (err) {
      console.error(err);

      window.alert(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la plantilla.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (template: Template) => {
    try {
      setTogglingId(template.id);

      const updated = await toggleTemplate(template.id, !template.active);

      setTemplates((current) =>
        current.map((item) => (item.id === template.id ? updated : item)),
      );

      setMenuOpen(null);
    } catch (err) {
      console.error(err);

      window.alert(
        err instanceof Error ? err.message : "No se pudo cambiar el estado.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("Todos");
    setStatusFilter("Todos");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
              <FiFileText size={14} />
              Biblioteca de plantillas
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Plantillas
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              Guarda estructuras de viaje reutilizables para crear propuestas de
              forma más rápida con Travel SaaS.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadTemplates(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Actualizar
            </button>

            <button
              type="button"
              onClick={() => navigate("/plantillas/nueva")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl"
            >
              <FiPlus size={17} />
              Nueva plantilla
            </button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<FiArchive size={18} />}
            label="Total"
            value={stats.total}
            description="Plantillas guardadas"
          />

          <StatCard
            icon={<FiCheckCircle size={18} />}
            label="Activas"
            value={stats.active}
            description="Disponibles para usar"
            accent="green"
          />

          <StatCard
            icon={<FiMapPin size={18} />}
            label="Destinos"
            value={stats.destinations}
            description="Destinos cubiertos"
            accent="blue"
          />

          <StatCard
            icon={<FiXCircle size={18} />}
            label="Inactivas"
            value={stats.inactive}
            description="No disponibles"
            accent="amber"
          />
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <FiSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, destino o descripción..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              {travelTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "Todos" ? "Todos los tipos" : type}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activas">Activas</option>
              <option value="Inactivas">Inactivas</option>
            </select>

            {(search || typeFilter !== "Todos" || statusFilter !== "Todos") && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Limpiar
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-red-700">
                No se pudieron cargar las plantillas
              </p>

              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadTemplates()}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && filteredTemplates.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">
                Plantillas disponibles
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {filteredTemplates.length} resultado
                {filteredTemplates.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="h-40 animate-pulse bg-slate-200" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                  </div>

                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search.trim()) ||
              typeFilter !== "Todos" ||
              statusFilter !== "Todos"
            }
            onCreate={() => navigate("/plantillas/nueva")}
            onClear={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                menuOpen={menuOpen === template.id}
                deleting={deletingId === template.id}
                toggling={togglingId === template.id}
                onMenu={() =>
                  setMenuOpen((current) =>
                    current === template.id ? null : template.id,
                  )
                }
                onCloseMenu={() => setMenuOpen(null)}
                onView={() => {
                  setMenuOpen(null);
                  navigate(`/plantillas/${template.id}`);
                }}
                onEdit={() => {
                  setMenuOpen(null);
                  navigate(`/plantillas/${template.id}/editar`);
                }}
                onToggle={() => handleToggle(template)}
                onDelete={() => handleDelete(template)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const accentClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClasses[accent]}`}
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

function TemplateCard({
  template,
  menuOpen,
  deleting,
  toggling,
  onMenu,
  onCloseMenu,
  onView,
  onEdit,
  onToggle,
  onDelete,
}: {
  template: Template;
  menuOpen: boolean;
  deleting: boolean;
  toggling: boolean;
  onMenu: () => void;
  onCloseMenu: () => void;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group relative overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="border-b border-slate-100 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
              <FiFileText size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate font-bold text-slate-900">
                {template.name}
              </h3>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <FiMapPin size={12} />

                <span className="truncate">
                  {template.destination || "Destino no definido"}
                  {template.country ? `, ${template.country}` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={onMenu}
              aria-label="Opciones de plantilla"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <FiMoreVertical size={18} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={onCloseMenu}
                  className="fixed inset-0 z-10 cursor-default"
                />

                <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={onEdit}
                    disabled={deleting || toggling}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiEdit3 size={15} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={onToggle}
                    disabled={deleting || toggling}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {toggling ? (
                      <FiRefreshCw size={15} className="animate-spin" />
                    ) : template.active ? (
                      <FiXCircle size={15} />
                    ) : (
                      <FiCheckCircle size={15} />
                    )}

                    {toggling
                      ? "Actualizando..."
                      : template.active
                        ? "Desactivar"
                        : "Activar"}
                  </button>

                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting || toggling}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting ? (
                      <FiRefreshCw size={15} className="animate-spin" />
                    ) : (
                      <FiTrash2 size={15} />
                    )}

                    {deleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
              template.active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {template.active ? "Activa" : "Inactiva"}
          </span>

          {template.travel_type && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">
              {template.travel_type}
            </span>
          )}

          {template.budget_level && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">
              {budgetLabels[template.budget_level] || template.budget_level}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <p className="min-h-[48px] text-sm leading-6 text-slate-500">
          {template.description ||
            "Plantilla reutilizable para crear propuestas de viaje."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <InfoItem
            icon={<FiCalendar size={15} />}
            label="Duración"
            value={
              template.recommended_days
                ? `${template.recommended_days} días`
                : "No definida"
            }
          />

          <InfoItem
            icon={<FiClock size={15} />}
            label="Actividades"
            value={`${template.activities?.length ?? 0}`}
          />
        </div>

        {template.activities?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {template.activities.slice(0, 3).map((activity, index) => (
              <span
                key={`${activity}-${index}`}
                className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600"
              >
                {activity}
              </span>
            ))}

            {template.activities.length > 3 && (
              <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-500">
                +{template.activities.length - 3}
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onView}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          Ver plantilla
          <FiChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </div>

      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onCreate,
  onClear,
}: {
  hasFilters: boolean;
  onCreate: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FiFileText size={27} />
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-900">
        {hasFilters
          ? "No encontramos plantillas"
          : "Todavía no tienes plantillas"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Prueba cambiando los filtros o realiza una búsqueda diferente."
          : "Crea tu primera plantilla para reutilizar estructuras de viaje con tus clientes."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
        >
          <FiPlus size={17} />
          Crear plantilla
        </button>
      </div>
    </div>
  );
}

export default Plantillas;
