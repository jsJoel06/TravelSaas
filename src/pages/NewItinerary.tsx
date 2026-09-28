import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiDollarSign,
  FiFileText,
  FiHeart,
  FiMapPin,
  FiSave,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { createItinerary } from "../service/itineraryService";
import { getClients, type Client } from "../service/clientService";

type ItineraryForm = {
  client_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  trip_type: string;
  budget: string;
  interests: string;
  notes: string;
};

const initialForm: ItineraryForm = {
  client_id: "",
  title: "",
  destination: "",
  start_date: "",
  end_date: "",
  travelers: 1,
  trip_type: "",
  budget: "",
  interests: "",
  notes: "",
};

export default function NewItinerary() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ItineraryForm>(initialForm);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoadingClients(true);
        setError("");
        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error(err);
        setError("No pudimos cargar tus clientes.");
      } finally {
        setLoadingClients(false);
      }
    };

    void loadClients();
  }, []);

  const selectedClient = useMemo(
    () =>
      clients.find((client) => String(client.id) === String(form.client_id)) ??
      null,
    [clients, form.client_id],
  );

  const tripDays = useMemo(() => {
    if (!form.start_date || !form.end_date) return null;

    const start = new Date(`${form.start_date}T00:00:00`);
    const end = new Date(`${form.end_date}T00:00:00`);
    const difference = end.getTime() - start.getTime();

    if (difference < 0) return null;

    return Math.floor(difference / 86400000) + 1;
  }, [form.start_date, form.end_date]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "travelers" ? Number(value) : value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Escribe un título para el itinerario.");
      return;
    }

    if (!form.destination.trim()) {
      setError("Escribe el destino del viaje.");
      return;
    }

    if (form.travelers < 1) {
      setError("La cantidad de viajeros debe ser al menos 1.");
      return;
    }

    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setError("La fecha final no puede ser anterior a la fecha inicial.");
      return;
    }

    try {
      setSaving(true);

      await createItinerary({
        client_id: form.client_id || null,
        title: form.title.trim(),
        destination: form.destination.trim(),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        travelers: form.travelers,
        trip_type: form.trip_type || null,
        budget: form.budget ? Number(form.budget) : null,
        interests: form.interests.trim() || null,
        notes: form.notes.trim() || null,
        status: "draft",
      });

      navigate("/itinerarios");
    } catch (err) {
      console.error(err);
      setError("No pudimos crear el itinerario. Inténtalo nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffafb] px-4 py-5 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <button
          type="button"
          onClick={() => navigate("/itinerarios")}
          className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-rose-600"
        >
          <FiArrowLeft size={17} />
          Volver a itinerarios
        </button>

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-rose-500">
              Planificación de viaje
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Crear itinerario
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Completa la información inicial del viaje. Después podrás
              organizar los días, actividades y detalles del itinerario.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-sm lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <FiFileText />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estado inicial
              </p>
              <p className="text-sm font-bold text-slate-800">Borrador</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
        >
          <div className="space-y-5">
            <FormSection
              number="01"
              title="Cliente"
              description="Selecciona el viajero para quien estás preparando esta propuesta."
            >
              <Field label="Cliente">
                <div className="relative">
                  <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    name="client_id"
                    value={form.client_id}
                    onChange={handleChange}
                    disabled={loadingClients}
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">
                      {loadingClients
                        ? "Cargando clientes..."
                        : "Seleccionar cliente"}
                    </option>

                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.full_name}
                      </option>
                    ))}
                  </select>
                  <FiChevronRight className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" />
                </div>
              </Field>

              {!loadingClients && clients.length === 0 && (
                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  No tienes clientes registrados. Puedes crear el itinerario sin
                  cliente y asignarlo más adelante.
                </p>
              )}
            </FormSection>

            <FormSection
              number="02"
              title="Información del viaje"
              description="Define los datos principales que identificarán el itinerario."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label="Título del itinerario"
                  className="md:col-span-2"
                  required
                >
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ej. Escapada romántica a París"
                    className={plainInputClass}
                  />
                </Field>

                <Field label="Destino" required>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="destination"
                      value={form.destination}
                      onChange={handleChange}
                      placeholder="Ej. París, Francia"
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Tipo de viaje">
                  <select
                    name="trip_type"
                    value={form.trip_type}
                    onChange={handleChange}
                    className={`${plainInputClass} bg-white`}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="luna_de_miel">Luna de miel</option>
                    <option value="familia">Viaje familiar</option>
                    <option value="pareja">Pareja</option>
                    <option value="aventura">Aventura</option>
                    <option value="negocios">Negocios</option>
                    <option value="corporativo">Corporativo</option>
                    <option value="crucero">Crucero</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>

                <Field label="Fecha de inicio">
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Fecha de finalización">
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      min={form.start_date || undefined}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Viajeros">
                  <div className="relative">
                    <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      name="travelers"
                      min={1}
                      value={form.travelers}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </Field>

                <Field label="Presupuesto">
                  <div className="relative">
                    <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      name="budget"
                      min={0}
                      step="0.01"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="Ej. 2500"
                      className={inputClass}
                    />
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection
              number="03"
              title="Preferencias"
              description="Añade información que te ayude a personalizar la experiencia del viajero."
            >
              <div className="space-y-5">
                <Field label="Intereses">
                  <div className="relative">
                    <FiHeart className="absolute left-4 top-4 text-slate-400" />
                    <textarea
                      name="interests"
                      value={form.interests}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Ej. playas, gastronomía, museos, compras, actividades para niños..."
                      className={`${textareaClass} pl-11`}
                    />
                  </div>
                </Field>

                <Field label="Notas adicionales">
                  <div className="relative">
                    <FiFileText className="absolute left-4 top-4 text-slate-400" />
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Información adicional, necesidades especiales, observaciones..."
                      className={`${textareaClass} pl-11`}
                    />
                  </div>
                </Field>
              </div>
            </FormSection>

            <div className="flex flex-col-reverse gap-3 rounded-[22px] border border-rose-100 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/itinerarios")}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FiSave size={17} />
                    Crear itinerario
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <section className="overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-[0_12px_40px_rgba(148,75,97,0.08)]">
              <div className="bg-gradient-to-br from-[#fff0f4] via-[#fff7f9] to-white p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
                  Vista previa
                </p>
                <h2 className="mt-2 line-clamp-2 text-xl font-black text-slate-950">
                  {form.title.trim() || "Tu próximo viaje"}
                </h2>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <FiMapPin className="shrink-0 text-rose-500" />
                  <span className="truncate">
                    {form.destination.trim() || "Destino por definir"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <PreviewRow
                  icon={<FiUser />}
                  label="Cliente"
                  value={selectedClient?.full_name || "Sin asignar"}
                />
                <PreviewRow
                  icon={<FiCalendar />}
                  label="Fechas"
                  value={
                    form.start_date || form.end_date
                      ? `${formatDate(form.start_date)} — ${formatDate(form.end_date)}`
                      : "Por definir"
                  }
                />
                <PreviewRow
                  icon={<FiUsers />}
                  label="Viajeros"
                  value={`${form.travelers} ${
                    form.travelers === 1 ? "persona" : "personas"
                  }`}
                />
                <PreviewRow
                  icon={<FiDollarSign />}
                  label="Presupuesto"
                  value={
                    form.budget
                      ? `$${Number(form.budget).toLocaleString()}`
                      : "Por definir"
                  }
                />

                {tripDays !== null && (
                  <div className="rounded-2xl bg-rose-50 px-4 py-3">
                    <p className="text-xs font-bold text-rose-500">
                      Duración estimada
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                      {tripDays} {tripDays === 1 ? "día" : "días"}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[22px] border border-rose-100 bg-white p-5 shadow-[0_10px_35px_rgba(148,75,97,0.06)]">
              <h3 className="text-sm font-black text-slate-900">
                Antes de continuar
              </h3>

              <div className="mt-4 space-y-3">
                <ChecklistItem
                  done={Boolean(form.title.trim())}
                  text="Título del itinerario"
                />
                <ChecklistItem
                  done={Boolean(form.destination.trim())}
                  text="Destino del viaje"
                />
                <ChecklistItem
                  done={Boolean(form.client_id)}
                  text="Cliente seleccionado"
                  optional
                />
                <ChecklistItem
                  done={Boolean(form.start_date && form.end_date)}
                  text="Fechas del viaje"
                  optional
                />
              </div>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

const plainInputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

const textareaClass =
  "w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-rose-100 bg-white p-5 shadow-[0_12px_45px_rgba(148,75,97,0.06)] sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-xs font-black text-rose-500">
          {number}
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  required = false,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-sm text-rose-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function ChecklistItem({
  done,
  text,
  optional = false,
}: {
  done: boolean;
  text: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
          done
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {done ? <FiCheck /> : "•"}
      </div>
      <p className="text-xs font-semibold text-slate-600">
        {text}
        {optional && (
          <span className="ml-1 font-medium text-slate-400">(opcional)</span>
        )}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Por definir";

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
