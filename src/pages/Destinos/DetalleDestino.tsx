import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiActivity,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiGlobe,
  FiInfo,
  FiMapPin,
  FiMessageCircle,
  FiPlus,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import {
  getDestination,
  type Destination,
} from "../../service/destinationService";

export default function DetalleDestino() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDestination = async () => {
      if (!id) {
        setError("No se encontró el destino.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getDestination(id);

        if (!data) {
          setError("El destino no existe o fue eliminado.");
          return;
        }

        setDestination(data);
      } catch (err) {
        console.error(err);
        setError("No pudimos cargar la información del destino.");
      } finally {
        setLoading(false);
      }
    };

    loadDestination();
  }, [id]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate("/destinos")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600"
          >
            <FiArrowLeft size={16} />
            Volver a destinos
          </button>

          <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FiInfo size={24} />
            </div>

            <h2 className="mt-5 text-lg font-extrabold text-slate-800">
              No pudimos cargar el destino
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error || "El destino no está disponible."}
            </p>

            <button
              onClick={() => navigate("/destinos")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              Volver a destinos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/destinos")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
        >
          <FiArrowLeft size={16} />
          Volver a destinos
        </button>

        <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
          <div className="relative h-[330px] sm:h-[390px]">
            {destination.image_url ? (
              <img
                src={destination.image_url}
                alt={destination.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-cyan-500">
                <FiGlobe size={100} className="text-white/20" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

            <div className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-7 sm:right-7">
              <span
                className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md ${
                  destination.active
                    ? "bg-emerald-500/90 text-white"
                    : "bg-slate-900/80 text-slate-200"
                }`}
              >
                {destination.active ? "Destino activo" : "Destino inactivo"}
              </span>

              <button
                onClick={() =>
                  navigate(`/destinos/${destination.id}/editar`)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-lg backdrop-blur transition hover:bg-white"
              >
                <FiEdit3 size={14} />
                Editar
              </button>
            </div>

            <div className="absolute bottom-6 left-5 right-5 sm:bottom-8 sm:left-7 sm:right-7">
              <div className="mb-3 flex flex-wrap gap-2">
                {destination.destination_type?.map((type) => (
                  <span
                    key={type}
                    className="rounded-lg bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {destination.name}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white/80">
                <FiMapPin size={15} />
                {destination.region
                  ? `${destination.region}, ${destination.country}`
                  : destination.country}
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-3 -mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:grid-cols-4 lg:mx-8">
          <InfoMetric
            icon={<FiCalendar />}
            label="Duración"
            value={
              destination.recommended_days
                ? `${destination.recommended_days} días`
                : "Por definir"
            }
          />

          <InfoMetric
            icon={<FiClock />}
            label="Mejor época"
            value={destination.best_time || "Por definir"}
          />

          <InfoMetric
            icon={<FiActivity />}
            label="Presupuesto"
            value={destination.budget_level || "Por definir"}
          />

          <InfoMetric
            icon={<FiUsers />}
            label="Actividades"
            value={`${destination.main_activities?.length || 0}`}
          />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_350px]">
          <main className="space-y-6">
            <ContentSection
              icon={<FiInfo />}
              title="Sobre el destino"
            >
              <p className="text-sm leading-7 text-slate-600">
                {destination.description ||
                  "No hay una descripción registrada para este destino."}
              </p>
            </ContentSection>

            <ContentSection
              icon={<FiActivity />}
              title="Actividades principales"
              count={destination.main_activities?.length}
            >
              {destination.main_activities?.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {destination.main_activities.map((activity) => (
                    <ListItem key={activity} text={activity} />
                  ))}
                </div>
              ) : (
                <EmptySection text="No se han registrado actividades." />
              )}
            </ContentSection>

            <ContentSection
              icon={<FiStar />}
              title="Lugares destacados"
              count={destination.featured_places?.length}
            >
              {destination.featured_places?.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {destination.featured_places.map((place) => (
                    <ListItem key={place} text={place} />
                  ))}
                </div>
              ) : (
                <EmptySection text="No se han registrado lugares destacados." />
              )}
            </ContentSection>

            <ContentSection
              icon={<FiCheckCircle />}
              title="Información práctica"
              count={destination.practical_information?.length}
            >
              {destination.practical_information?.length ? (
                <div className="space-y-3">
                  {destination.practical_information.map((info) => (
                    <div
                      key={info}
                      className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3.5"
                    >
                      <FiInfo
                        size={15}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <p className="text-xs font-medium leading-5 text-amber-800">
                        {info}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection text="No se ha registrado información práctica." />
              )}
            </ContentSection>
          </main>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/15">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <span className="text-lg font-black">N</span>
              </div>

              <h2 className="mt-5 text-lg font-extrabold">
                Asesorar con NIA
              </h2>

              <p className="mt-2 text-xs leading-5 text-blue-50/80">
                Utiliza este destino como contexto para analizar las
                necesidades de un cliente y construir una orientación de
                viaje.
              </p>

              <button
                onClick={() => navigate("/itinerarios/ia")}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50"
              >
                <FiMessageCircle size={15} />
                Crear propuesta con NIA
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800">
                Resumen
              </h3>

              <div className="mt-4 space-y-4">
                <SummaryRow
                  label="País"
                  value={destination.country}
                />

                <SummaryRow
                  label="Región"
                  value={destination.region || "No especificada"}
                />

                <SummaryRow
                  label="Duración"
                  value={
                    destination.recommended_days
                      ? `${destination.recommended_days} días`
                      : "No definida"
                  }
                />

                <SummaryRow
                  label="Presupuesto"
                  value={destination.budget_level || "No definido"}
                />

                <SummaryRow
                  label="Estado"
                  value={destination.active ? "Activo" : "Inactivo"}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <FiGlobe size={16} />
                </div>

                <div>
                  <h3 className="text-xs font-extrabold text-slate-800">
                    Uso de la información
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                    Esta información funciona como referencia para la
                    asesoría. Las condiciones reales de servicios, precios,
                    disponibilidad y reservas deben verificarse antes de
                    cotizar.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
          <button
            onClick={() => navigate("/destinos")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <FiArrowLeft size={14} />
            Volver a destinos
          </button>

          <button
            onClick={() => navigate("/itinerarios/nuevo")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <FiPlus size={15} />
            Crear itinerario
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-100 p-4 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xs font-extrabold text-slate-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContentSection({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>

          <h2 className="text-sm font-extrabold text-slate-800">
            {title}
          </h2>
        </div>

        {typeof count === "number" && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
            {count}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-500 shadow-sm">
        <FiCheckCircle size={14} />
      </div>

      <span className="text-xs font-semibold text-slate-600">
        {text}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-slate-400">{label}</span>

      <span className="max-w-[190px] text-right text-xs font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-slate-50 p-4 text-xs font-medium text-slate-400">
      {text}
    </p>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 h-5 w-36 animate-pulse rounded bg-slate-200" />

        <div className="overflow-hidden rounded-3xl bg-white">
          <div className="h-[330px] animate-pulse bg-slate-200 sm:h-[390px]" />
        </div>

        <div className="relative z-10 mx-3 -mt-6 h-24 animate-pulse rounded-2xl bg-white shadow-xl" />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-2xl bg-white" />
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
          </div>

          <div className="space-y-6">
            <div className="h-56 animate-pulse rounded-2xl bg-white" />
            <div className="h-52 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
