import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiFileText,
  FiInfo,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";
import {
  deleteTemplate,
  getTemplate,
  toggleTemplate,
  type Template,
} from "../../service/templateService";

function DetallePlantilla() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTemplate = useCallback(async () => {
    if (!id) {
      setError("No se encontró el identificador de la plantilla.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getTemplate(id);

      if (!data) {
        setError("La plantilla no existe o fue eliminada.");
        return;
      }

      setTemplate(data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la plantilla."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleToggle = async () => {
    if (!template) return;

    try {
      const updated = await toggleTemplate(
        template.id,
        !template.active
      );

      setTemplate(updated);
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado."
      );
    }
  };

  const handleDelete = async () => {
    if (!template) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${template.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteTemplate(template.id);
      navigate("/plantillas");
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la plantilla."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-6 h-5 w-36 rounded bg-slate-200" />
          <div className="h-52 rounded-3xl bg-slate-200" />
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="h-80 rounded-2xl bg-slate-200 lg:col-span-2" />
            <div className="h-80 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FiInfo size={24} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            No se pudo cargar la plantilla
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "La plantilla no está disponible."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/plantillas")}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Volver
            </button>

            <button
              type="button"
              onClick={loadTemplate}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FiRefreshCw size={15} />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/plantillas")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <FiArrowLeft size={16} />
          Volver a plantillas
        </button>

        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#0369a1] shadow-xl">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        template.active
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {template.active ? (
                        <FiCheckCircle size={13} />
                      ) : (
                        <FiXCircle size={13} />
                      )}

                      {template.active
                        ? "Plantilla activa"
                        : "Plantilla inactiva"}
                    </span>

                    {template.travel_type && (
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                        {template.travel_type}
                      </span>
                    )}

                    {template.budget_level && (
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
                        {template.budget_level}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {template.name}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
                    {template.destination && (
                      <span className="inline-flex items-center gap-2">
                        <FiMapPin size={16} />
                        {template.destination}
                        {template.country
                          ? `, ${template.country}`
                          : ""}
                      </span>
                    )}

                    {template.recommended_days && (
                      <span className="inline-flex items-center gap-2">
                        <FiCalendar size={16} />
                        {template.recommended_days} días
                      </span>
                    )}
                  </div>

                  {template.description && (
                    <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                      {template.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/plantillas/${template.id}/editar`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    <FiEdit3 size={16} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={handleToggle}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    {template.active ? (
                      <>
                        <FiXCircle size={16} />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={16} />
                        Activar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <div className="my-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric
            icon={<FiCalendar size={18} />}
            label="Duración"
            value={
              template.recommended_days
                ? `${template.recommended_days} días`
                : "No definida"
            }
          />

          <Metric
            icon={<FiCheckCircle size={18} />}
            label="Incluye"
            value={`${template.includes?.length ?? 0}`}
          />

          <Metric
            icon={<FiClock size={18} />}
            label="Actividades"
            value={`${template.activities?.length ?? 0}`}
          />

          <Metric
            icon={<FiFileText size={18} />}
            label="Días configurados"
            value={`${template.itinerary?.length ?? 0}`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Includes */}
            <ContentSection
              title="¿Qué incluye?"
              description="Elementos que forman parte de la estructura base."
            >
              {template.includes?.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {template.includes.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <FiCheckCircle size={14} />
                      </span>

                      <span className="text-sm leading-6 text-slate-600">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyContent text="No se han definido inclusiones." />
              )}
            </ContentSection>

            {/* Activities */}
            <ContentSection
              title="Actividades"
              description="Experiencias sugeridas para este tipo de viaje."
            >
              {template.activities?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {template.activities.map((activity, index) => (
                    <span
                      key={`${activity}-${index}`}
                      className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyContent text="No se han definido actividades." />
              )}
            </ContentSection>

            {/* Itinerary */}
            <ContentSection
              title="Estructura del itinerario"
              description="Base reutilizable que puede adaptarse a cada cliente."
            >
              {template.itinerary?.length > 0 ? (
                <div className="space-y-4">
                  {template.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="overflow-hidden rounded-2xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                          {day.day}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Día {day.day}
                          </p>

                          <p className="text-sm text-slate-600">
                            {day.title || "Sin título"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4">
                        {day.activities?.length > 0 ? (
                          <div className="space-y-2.5">
                            {day.activities.map(
                              (activity, index) => (
                                <div
                                  key={`${activity}-${index}`}
                                  className="flex items-start gap-3"
                                >
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                                  <span className="text-sm leading-6 text-slate-600">
                                    {activity}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">
                            No hay actividades definidas.
                          </p>
                        )}

                        {day.notes && (
                          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                            <FiInfo
                              size={14}
                              className="mt-0.5 shrink-0"
                            />
                            <span>{day.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyContent text="No se ha configurado el itinerario." />
              )}
            </ContentSection>

            {/* Notes */}
            <ContentSection
              title="Notas para el agente"
              description="Consideraciones internas al utilizar esta plantilla."
            >
              {template.notes?.length > 0 ? (
                <div className="space-y-3">
                  {template.notes.map((note, index) => (
                    <div
                      key={`${note}-${index}`}
                      className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5"
                    >
                      <FiInfo
                        size={16}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <span className="text-sm leading-6 text-amber-800">
                        {note}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyContent text="No se han agregado notas." />
              )}
            </ContentSection>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* NIA */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-500/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <span className="text-lg font-bold">N</span>
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Usar con NIA
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-50">
                Utiliza esta plantilla como estructura de referencia
                para crear una propuesta personalizada para un cliente.
              </p>

              <button
                type="button"
                onClick={() => navigate("/itinerarios/ia")}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Crear propuesta con NIA
                <FiChevronRight size={16} />
              </button>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900">
                Resumen
              </h3>

              <div className="mt-4 space-y-4">
                <SummaryRow
                  icon={<FiMapPin size={16} />}
                  label="Destino"
                  value={
                    template.destination ||
                    "No definido"
                  }
                />

                <SummaryRow
                  icon={<FiCalendar size={16} />}
                  label="Duración"
                  value={
                    template.recommended_days
                      ? `${template.recommended_days} días`
                      : "No definida"
                  }
                />

                <SummaryRow
                  icon={<FiFileText size={16} />}
                  label="Tipo"
                  value={
                    template.travel_type ||
                    "No definido"
                  }
                />

                <SummaryRow
                  icon={<FiCheckCircle size={16} />}
                  label="Estado"
                  value={
                    template.active
                      ? "Activa"
                      : "Inactiva"
                  }
                />
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-900">
                Acciones
              </h3>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/plantillas/${template.id}/editar`
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <FiEdit3 size={16} />
                  Editar plantilla
                </button>

                <button
                  type="button"
                  onClick={handleToggle}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {template.active ? (
                    <>
                      <FiXCircle size={16} />
                      Desactivar plantilla
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={16} />
                      Activar plantilla
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <FiTrash2 size={16} />
                  Eliminar plantilla
                </button>
              </div>
            </div>

            {/* Create itinerary */}
            <button
              type="button"
              onClick={() => navigate("/itinerarios/nuevo")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <FiPlus size={17} />
              Crear itinerario manual
            </button>
          </aside>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/plantillas")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <FiArrowLeft size={16} />
            Volver a la biblioteca
          </button>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <span className="text-lg font-bold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ContentSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-blue-500">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyContent({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

export default DetallePlantilla;

