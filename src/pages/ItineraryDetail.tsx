import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiEdit3,
  FiFileText,
  FiGlobe,
  FiMapPin,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";

import {
  getItinerary,
  updateItinerary,
  getItineraryDays,
  getItineraryActivities,
  createItineraryDay,
  updateItineraryDay,
  deleteItineraryDay,
  createItineraryActivity,
  updateItineraryActivity,
  deleteItineraryActivity,
  type Itinerary,
  type ItineraryDay,
  type ItineraryActivity,
} from "../service/itineraryService";

const tripTypes = [
  "Vacaciones",
  "Luna de miel",
  "Familiar",
  "Aventura",
  "Negocios",
  "Romántico",
  "Playa",
  "Cultural",
  "Otro",
];

const activityTypes = [
  "Transporte",
  "Hotel",
  "Comida",
  "Tour",
  "Actividad",
  "Visita",
  "Tiempo libre",
  "Otro",
];

interface DayForm {
  day_number: number;
  date: string;
  title: string;
  description: string;
}

interface ActivityForm {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  estimated_cost: string;
}

const emptyActivityForm: ActivityForm = {
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  location: "",
  type: "",
  estimated_cost: "",
};

export default function ItineraryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [activities, setActivities] = useState<
    Record<string, ItineraryActivity[]>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingDay, setAddingDay] = useState(false);
  const [error, setError] = useState("");

  const [editingInfo, setEditingInfo] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);

  const [dayForms, setDayForms] = useState<Record<string, DayForm>>({});
  const [activityEditForms, setActivityEditForms] = useState<
    Record<string, ActivityForm>
  >({});
  const [activityForms, setActivityForms] = useState<
    Record<string, ActivityForm>
  >({});

  const [form, setForm] = useState({
    title: "",
    destination: "",
    start_date: "",
    end_date: "",
    travelers: 1,
    trip_type: "",
    budget: "",
    interests: "",
    notes: "",
  });

  const [newDayTitle, setNewDayTitle] = useState("");
  const [newDayDescription, setNewDayDescription] = useState("");

  const cargarItinerario = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const itineraryData = await getItinerary(id);

      if (!itineraryData) {
        setItinerary(null);
        return;
      }

      setItinerary(itineraryData);

      setForm({
        title: itineraryData.title || "",
        destination: itineraryData.destination || "",
        start_date: itineraryData.start_date || "",
        end_date: itineraryData.end_date || "",
        travelers: itineraryData.travelers || 1,
        trip_type: itineraryData.trip_type || "",
        budget:
          itineraryData.budget !== null && itineraryData.budget !== undefined
            ? String(itineraryData.budget)
            : "",
        interests: itineraryData.interests || "",
        notes: itineraryData.notes || "",
      });

      const daysData = await getItineraryDays(id);

      setDays([...daysData].sort((a, b) => a.day_number - b.day_number));

      const activitiesMap: Record<string, ItineraryActivity[]> = {};

      await Promise.all(
        daysData.map(async (day) => {
          activitiesMap[day.id] = await getItineraryActivities(day.id);
        }),
      );

      setActivities(activitiesMap);
    } catch (err) {
      console.error("Error cargando itinerario:", err);
      setError("No pudimos cargar el itinerario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarItinerario();
  }, [id]);

  const totalActivities = useMemo(
    () =>
      Object.values(activities).reduce(
        (total, dayActivities) => total + dayActivities.length,
        0,
      ),
    [activities],
  );

  const totalEstimatedCost = useMemo(
    () =>
      Object.values(activities)
        .flat()
        .reduce(
          (total, activity) => total + Number(activity.estimated_cost || 0),
          0,
        ),
    [activities],
  );

  const actualizarCampo = (
    campo: keyof typeof form,
    valor: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const guardarInformacion = async () => {
    if (!id || !itinerary) return;

    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!form.destination.trim()) {
      setError("El destino es obligatorio.");
      return;
    }

    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setError("La fecha final no puede ser anterior a la fecha inicial.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updated = await updateItinerary(id, {
        client_id: itinerary.client_id,
        title: form.title.trim(),
        destination: form.destination.trim(),
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        travelers: Number(form.travelers) || 1,
        trip_type: form.trip_type || null,
        budget: form.budget === "" ? null : Number(form.budget),
        interests: form.interests.trim() || null,
        notes: form.notes.trim() || null,
        status: itinerary.status,
      });

      setItinerary(updated);
      setEditingInfo(false);
    } catch (err) {
      console.error("Error actualizando itinerario:", err);
      setError("No pudimos guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const comenzarEditarDia = (day: ItineraryDay) => {
    setEditingDay(day.id);

    setDayForms((prev) => ({
      ...prev,
      [day.id]: {
        day_number: day.day_number,
        date: day.date || "",
        title: day.title || "",
        description: day.description || "",
      },
    }));

    setError("");
  };

  const cancelarEditarDia = () => {
    setEditingDay(null);
  };

  const actualizarDiaCampo = (
    dayId: string,
    campo: keyof DayForm,
    valor: string | number,
  ) => {
    setDayForms((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [campo]: valor,
      },
    }));
  };

  const guardarDia = async (dayId: string) => {
    const dayForm = dayForms[dayId];

    if (!dayForm) return;

    if (!dayForm.title.trim()) {
      setError("El título del día es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updated = await updateItineraryDay(dayId, {
        day_number: Number(dayForm.day_number),
        date: dayForm.date || null,
        title: dayForm.title.trim(),
        description: dayForm.description.trim() || null,
      });

      setDays((prev) =>
        [...prev]
          .map((day) => (day.id === dayId ? updated : day))
          .sort((a, b) => a.day_number - b.day_number),
      );

      setEditingDay(null);
    } catch (err) {
      console.error("Error actualizando día:", err);
      setError("No pudimos guardar el día.");
    } finally {
      setSaving(false);
    }
  };

  const agregarDia = async () => {
    if (!id) return;

    try {
      setAddingDay(true);
      setError("");

      const nextDayNumber =
        days.length > 0
          ? Math.max(...days.map((day) => day.day_number)) + 1
          : 1;

      let dayDate: string | null = null;

      if (itinerary?.start_date) {
        const date = new Date(`${itinerary.start_date}T00:00:00`);

        date.setDate(date.getDate() + nextDayNumber - 1);

        dayDate = date.toISOString().split("T")[0];
      }

      const newDay = await createItineraryDay(id, {
        day_number: nextDayNumber,
        date: dayDate,
        title: newDayTitle.trim() || `Día ${nextDayNumber}`,
        description: newDayDescription.trim() || null,
      });

      setDays((prev) =>
        [...prev, newDay].sort((a, b) => a.day_number - b.day_number),
      );

      setActivities((prev) => ({
        ...prev,
        [newDay.id]: [],
      }));

      setNewDayTitle("");
      setNewDayDescription("");
    } catch (err) {
      console.error("Error creando día:", err);
      setError("No pudimos crear el día.");
    } finally {
      setAddingDay(false);
    }
  };

  const eliminarDia = async (dayId: string) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar este día y todas sus actividades?",
    );

    if (!confirmar) return;

    try {
      setError("");

      await deleteItineraryDay(dayId);

      setDays((prev) => prev.filter((day) => day.id !== dayId));

      setActivities((prev) => {
        const copy = { ...prev };
        delete copy[dayId];
        return copy;
      });
    } catch (err) {
      console.error("Error eliminando día:", err);
      setError("No pudimos eliminar el día.");
    }
  };

  const comenzarEditarActividad = (activity: ItineraryActivity) => {
    setEditingActivity(activity.id);

    setActivityEditForms((prev) => ({
      ...prev,
      [activity.id]: {
        title: activity.title || "",
        description: activity.description || "",
        start_time: activity.start_time ? activity.start_time.slice(0, 5) : "",
        end_time: activity.end_time ? activity.end_time.slice(0, 5) : "",
        location: activity.location || "",
        type: activity.type || "",
        estimated_cost:
          activity.estimated_cost !== null &&
          activity.estimated_cost !== undefined
            ? String(activity.estimated_cost)
            : "",
      },
    }));

    setError("");
  };

  const cancelarEditarActividad = () => {
    setEditingActivity(null);
  };

  const actualizarActividadEditCampo = (
    activityId: string,
    campo: keyof ActivityForm,
    valor: string,
  ) => {
    setActivityEditForms((prev) => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        [campo]: valor,
      },
    }));
  };

  const guardarActividad = async (activityId: string) => {
    const activityForm = activityEditForms[activityId];

    if (!activityForm) return;

    if (!activityForm.title.trim()) {
      setError("El nombre de la actividad es obligatorio.");
      return;
    }

    if (
      activityForm.start_time &&
      activityForm.end_time &&
      activityForm.end_time < activityForm.start_time
    ) {
      setError("La hora final no puede ser anterior a la hora inicial.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updated = await updateItineraryActivity(activityId, {
        title: activityForm.title.trim(),
        description: activityForm.description.trim() || null,
        start_time: activityForm.start_time || null,
        end_time: activityForm.end_time || null,
        location: activityForm.location.trim() || null,
        type: activityForm.type || null,
        estimated_cost:
          activityForm.estimated_cost === ""
            ? null
            : Number(activityForm.estimated_cost),
      });

      setActivities((prev) => {
        const copy = { ...prev };

        for (const dayId of Object.keys(copy)) {
          copy[dayId] = copy[dayId].map((activity) =>
            activity.id === activityId ? updated : activity,
          );
        }

        return copy;
      });

      setEditingActivity(null);
    } catch (err) {
      console.error("Error actualizando actividad:", err);
      setError("No pudimos guardar la actividad.");
    } finally {
      setSaving(false);
    }
  };

  const actualizarActividadCampo = (
    dayId: string,
    campo: keyof ActivityForm,
    valor: string,
  ) => {
    setActivityForms((prev) => ({
      ...prev,
      [dayId]: {
        ...(prev[dayId] || emptyActivityForm),
        [campo]: valor,
      },
    }));
  };

  const agregarActividad = async (dayId: string) => {
    const formData = activityForms[dayId] || emptyActivityForm;

    if (!formData.title.trim()) {
      setError("El nombre de la actividad es obligatorio.");
      return;
    }

    if (
      formData.start_time &&
      formData.end_time &&
      formData.end_time < formData.start_time
    ) {
      setError("La hora final no puede ser anterior a la hora inicial.");
      return;
    }

    try {
      setError("");

      const currentActivities = activities[dayId] || [];

      const newActivity = await createItineraryActivity(dayId, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        location: formData.location.trim() || null,
        type: formData.type || null,
        estimated_cost:
          formData.estimated_cost === ""
            ? null
            : Number(formData.estimated_cost),
        sort_order: currentActivities.length,
      });

      setActivities((prev) => ({
        ...prev,
        [dayId]: [...(prev[dayId] || []), newActivity],
      }));

      setActivityForms((prev) => ({
        ...prev,
        [dayId]: {
          ...emptyActivityForm,
        },
      }));
    } catch (err) {
      console.error("Error creando actividad:", err);

      setError("No pudimos crear la actividad.");
    }
  };

  const eliminarActividad = async (dayId: string, activityId: string) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar esta actividad?",
    );

    if (!confirmar) return;

    try {
      setError("");

      await deleteItineraryActivity(activityId);

      setActivities((prev) => ({
        ...prev,
        [dayId]: (prev[dayId] || []).filter(
          (activity) => activity.id !== activityId,
        ),
      }));
    } catch (err) {
      console.error("Error eliminando actividad:", err);

      setError("No pudimos eliminar la actividad.");
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-[#fffafa] p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/itinerarios")}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2563eb] font-medium mb-6 transition"
          >
            <FiArrowLeft />
            Volver a itinerarios
          </button>

          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
              <FiFileText size={28} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Itinerario no encontrado
            </h1>

            <p className="text-slate-500 mt-2">
              {error ||
                "El itinerario que buscas no existe o ya no está disponible."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffafa]">
      {/* TOP HEADER */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-32 -top-40 w-96 h-96 rounded-full bg-rose-300 blur-3xl" />
          <div className="absolute left-1/3 -bottom-40 w-96 h-96 rounded-full bg-[#ef5b83] blur-3xl" />
        </div>

        <div className="relative max-w-[1500px] mx-auto px-4 lg:px-6 py-6">
          <button
            onClick={() => navigate("/itinerarios")}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#e94f79] text-sm font-medium transition mb-7"
          >
            <FiArrowLeft />
            Volver a itinerarios
          </button>

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                  Propuesta de viaje
                </span>

                <StatusBadge status={itinerary.status} dark />
              </div>

              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight truncate max-w-4xl">
                {itinerary.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-5 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <FiMapPin className="text-rose-500" />
                  {itinerary.destination}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FiUsers className="text-rose-500" />
                  {itinerary.travelers}{" "}
                  {itinerary.travelers === 1 ? "viajero" : "viajeros"}
                </span>

                {itinerary.trip_type && (
                  <span className="inline-flex items-center gap-2">
                    <FiGlobe className="text-rose-500" />
                    {itinerary.trip_type}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setEditingInfo(!editingInfo)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#ef5b83] text-white font-semibold shadow-lg shadow-rose-200/60 hover:bg-slate-100 transition shrink-0"
            >
              {editingInfo ? (
                <>
                  <FiX />
                  Cerrar edición
                </>
              ) : (
                <>
                  <FiEdit3 />
                  Editar información
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1500px] mx-auto px-4 lg:px-6 py-8">
        {/* ERROR */}
        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-auto p-1 hover:bg-red-100 rounded-lg"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <OverviewCard
            icon={<FiCalendar />}
            label="Duración"
            value={calculateDuration(itinerary.start_date, itinerary.end_date)}
            helper="días de viaje"
          />

          <OverviewCard
            icon={<FiUsers />}
            label="Viajeros"
            value={String(itinerary.travelers)}
            helper={itinerary.travelers === 1 ? "persona" : "personas"}
          />

          <OverviewCard
            icon={<FiFileText />}
            label="Actividades"
            value={String(totalActivities)}
            helper={`${days.length} ${
              days.length === 1 ? "día" : "días"
            } planificados`}
          />

          <OverviewCard
            icon={<FiDollarSign />}
            label="Estimado"
            value={
              totalEstimatedCost > 0
                ? `$${totalEstimatedCost.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}`
                : itinerary.budget !== null
                  ? `$${Number(itinerary.budget).toLocaleString()}`
                  : "—"
            }
            helper="costos de actividades"
          />
        </div>

        {/* INFORMATION */}
        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-10">
          <div className="px-6 lg:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-rose-50 text-[#e94f79] flex items-center justify-center">
                  <FiFileText />
                </span>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Información del viaje
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Datos principales de la propuesta
                  </p>
                </div>
              </div>
            </div>

            {!editingInfo && (
              <button
                onClick={() => setEditingInfo(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#e94f79] hover:bg-rose-50 transition"
              >
                <FiEdit3 />
                Editar
              </button>
            )}
          </div>

          {editingInfo ? (
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Field label="Título" className="lg:col-span-4 md:col-span-2">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => actualizarCampo("title", e.target.value)}
                    className={inputClass}
                    placeholder="Ej. Escapada de 5 días a Samaná"
                  />
                </Field>

                <Field label="Destino">
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e94f79]" />
                    <input
                      type="text"
                      value={form.destination}
                      onChange={(e) =>
                        actualizarCampo("destination", e.target.value)
                      }
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </Field>

                <Field label="Tipo de viaje">
                  <select
                    value={form.trip_type}
                    onChange={(e) =>
                      actualizarCampo("trip_type", e.target.value)
                    }
                    className={selectClass}
                  >
                    <option value="">Seleccionar</option>

                    {tripTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Fecha de inicio">
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      actualizarCampo("start_date", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Fecha final">
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      actualizarCampo("end_date", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Viajeros">
                  <input
                    type="number"
                    min="1"
                    value={form.travelers}
                    onChange={(e) =>
                      actualizarCampo("travelers", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Presupuesto">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.budget}
                      onChange={(e) =>
                        actualizarCampo("budget", e.target.value)
                      }
                      className={`${inputClass} pl-9`}
                      placeholder="2500"
                    />
                  </div>
                </Field>

                <Field
                  label="Intereses"
                  className="md:col-span-2 lg:col-span-2"
                >
                  <textarea
                    rows={3}
                    value={form.interests}
                    onChange={(e) =>
                      actualizarCampo("interests", e.target.value)
                    }
                    className={`${inputClass} resize-none`}
                    placeholder="Playas, gastronomía, cultura, aventura..."
                  />
                </Field>

                <Field label="Notas" className="md:col-span-2 lg:col-span-2">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => actualizarCampo("notes", e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Información adicional para el agente..."
                  />
                </Field>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-7 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setEditingInfo(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={guardarInformacion}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ef5b83] to-[#f47a98] text-white font-bold shadow-lg shadow-rose-300/30 hover:from-[#df466f] hover:to-[#ed6789] disabled:opacity-50 transition"
                >
                  <FiSave />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoItem
                  label="Destino"
                  value={itinerary.destination}
                  icon={<FiMapPin />}
                />

                <InfoItem
                  label="Fechas"
                  value={
                    itinerary.start_date
                      ? `${formatDate(itinerary.start_date)}${
                          itinerary.end_date
                            ? ` → ${formatDate(itinerary.end_date)}`
                            : ""
                        }`
                      : "Sin fechas"
                  }
                  icon={<FiCalendar />}
                />

                <InfoItem
                  label="Viajeros"
                  value={String(itinerary.travelers)}
                  icon={<FiUsers />}
                />

                <InfoItem
                  label="Presupuesto"
                  value={
                    itinerary.budget !== null && itinerary.budget !== undefined
                      ? `$${Number(itinerary.budget).toLocaleString()}`
                      : "Sin definir"
                  }
                  icon={<FiDollarSign />}
                />
              </div>

              {(itinerary.trip_type ||
                itinerary.interests ||
                itinerary.notes) && (
                <div className="mt-8 pt-7 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {itinerary.trip_type && (
                    <DetailText
                      label="Tipo de viaje"
                      value={itinerary.trip_type}
                    />
                  )}

                  {itinerary.interests && (
                    <DetailText label="Intereses" value={itinerary.interests} />
                  )}

                  {itinerary.notes && (
                    <DetailText label="Notas" value={itinerary.notes} full />
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* PLAN HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[#e94f79] text-sm font-bold mb-2">
              <FiZap />
              PLANIFICACIÓN
            </div>

            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Plan del viaje
            </h2>

            <p className="text-slate-500 mt-2">
              Construye una experiencia completa, día por día.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
            <span>{days.length} días</span>
            <FiChevronRight />
            <span>{totalActivities} actividades</span>
          </div>
        </div>

        {/* ADD DAY */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#fff7f8] to-[#fff1f4] rounded-3xl p-6 lg:p-7 mb-8 shadow-xl shadow-slate-900/10">
          <div className="absolute right-0 top-0 w-72 h-72 bg-rose-300/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="lg:w-64 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                    <FiPlus size={21} />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">Nuevo día</h3>
                    <p className="text-xs text-slate-400">Amplía el plan</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newDayTitle}
                  onChange={(e) => setNewDayTitle(e.target.value)}
                  placeholder="Título del día · Ej. Llegada y check-in"
                  className="w-full rounded-xl border border-white/10 bg-white/10 text-white placeholder:text-slate-400 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 transition"
                />

                <input
                  type="text"
                  value={newDayDescription}
                  onChange={(e) => setNewDayDescription(e.target.value)}
                  placeholder="Descripción breve"
                  className="w-full rounded-xl border border-white/10 bg-white/10 text-white placeholder:text-slate-400 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 transition"
                />
              </div>

              <button
                onClick={agregarDia}
                disabled={addingDay}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 disabled:opacity-50 transition shrink-0"
              >
                <FiPlus />
                {addingDay ? "Agregando..." : "Agregar día"}
              </button>
            </div>
          </div>
        </section>

        {/* DAYS */}
        {days.length === 0 ? (
          <EmptyDays />
        ) : (
          <div className="relative">
            <div className="absolute left-[22px] top-8 bottom-8 w-px bg-gradient-to-b from-rose-300 via-slate-200 to-transparent hidden md:block" />

            <div className="space-y-7">
              {days.map((day) => {
                const isEditingDay = editingDay === day.id;

                const dayForm = dayForms[day.id];

                const dayActivities = activities[day.id] || [];

                return (
                  <section key={day.id} className="relative md:pl-14">
                    {/* TIMELINE NUMBER */}
                    <div className="absolute left-0 top-5 hidden md:flex w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ef5b83] to-[#f47a98] text-white items-center justify-center font-black shadow-lg shadow-rose-300/30 z-10">
                      {day.day_number}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* DAY HEADER */}
                      <div className="p-6 lg:p-7 bg-gradient-to-r from-white to-slate-50/80 border-b border-slate-100">
                        {isEditingDay && dayForm ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Número del día">
                              <input
                                type="number"
                                min="1"
                                value={dayForm.day_number}
                                onChange={(e) =>
                                  actualizarDiaCampo(
                                    day.id,
                                    "day_number",
                                    Number(e.target.value),
                                  )
                                }
                                className={inputClass}
                              />
                            </Field>

                            <Field label="Fecha">
                              <input
                                type="date"
                                value={dayForm.date}
                                onChange={(e) =>
                                  actualizarDiaCampo(
                                    day.id,
                                    "date",
                                    e.target.value,
                                  )
                                }
                                className={inputClass}
                              />
                            </Field>

                            <Field label="Título">
                              <input
                                type="text"
                                value={dayForm.title}
                                onChange={(e) =>
                                  actualizarDiaCampo(
                                    day.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className={inputClass}
                              />
                            </Field>

                            <Field label="Descripción">
                              <input
                                type="text"
                                value={dayForm.description}
                                onChange={(e) =>
                                  actualizarDiaCampo(
                                    day.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className={inputClass}
                              />
                            </Field>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                              <button
                                onClick={cancelarEditarDia}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50"
                              >
                                <FiX />
                                Cancelar
                              </button>

                              <button
                                onClick={() => guardarDia(day.id)}
                                disabled={saving}
                                className={primaryButton}
                              >
                                <FiSave />
                                {saving ? "Guardando..." : "Guardar día"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                            <div className="flex items-start gap-4">
                              <div className="md:hidden w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ef5b83] to-[#f47a98] text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-rose-300/30">
                                {day.day_number}
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-[#e94f79]">
                                    Día {day.day_number}
                                  </span>

                                  {day.date && (
                                    <>
                                      <span className="text-slate-300">•</span>

                                      <span className="text-xs font-medium text-slate-400">
                                        {formatDate(day.date)}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <h3 className="text-xl lg:text-2xl font-black text-slate-900 mt-1">
                                  {day.title || `Día ${day.day_number}`}
                                </h3>

                                {day.description && (
                                  <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                                    {day.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                                {dayActivities.length}{" "}
                                {dayActivities.length === 1
                                  ? "actividad"
                                  : "actividades"}
                              </span>

                              <button
                                onClick={() => comenzarEditarDia(day)}
                                className="p-2.5 rounded-xl text-slate-500 hover:text-[#e94f79] hover:bg-rose-50 transition"
                                title="Editar día"
                              >
                                <FiEdit3 />
                              </button>

                              <button
                                onClick={() => eliminarDia(day.id)}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Eliminar día"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACTIVITIES */}
                      <div className="p-5 lg:p-7">
                        {dayActivities.length > 0 ? (
                          <div className="space-y-3 mb-6">
                            {dayActivities.map((activity, index) => {
                              const isEditingActivity =
                                editingActivity === activity.id;

                              const editForm = activityEditForms[activity.id];

                              return (
                                <ActivityCard
                                  key={activity.id}
                                  activity={activity}
                                  index={index}
                                  isEditing={isEditingActivity}
                                  editForm={editForm}
                                  saving={saving}
                                  onEdit={() =>
                                    comenzarEditarActividad(activity)
                                  }
                                  onDelete={() =>
                                    eliminarActividad(day.id, activity.id)
                                  }
                                  onCancel={cancelarEditarActividad}
                                  onSave={() => guardarActividad(activity.id)}
                                  onChange={(field, value) =>
                                    actualizarActividadEditCampo(
                                      activity.id,
                                      field,
                                      value,
                                    )
                                  }
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center mb-6 bg-slate-50/60">
                            <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mb-3">
                              <FiCalendar />
                            </div>

                            <p className="text-sm font-semibold text-slate-700">
                              Este día todavía está vacío
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              Agrega actividades para construir la experiencia.
                            </p>
                          </div>
                        )}

                        {/* ADD ACTIVITY */}
                        <AddActivityForm
                          form={activityForms[day.id] || emptyActivityForm}
                          onChange={(field, value) =>
                            actualizarActividadCampo(day.id, field, value)
                          }
                          onAdd={() => agregarActividad(day.id)}
                        />
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER NOTE */}
        <div className="mt-10 rounded-2xl border border-rose-100 bg-rose-50/70 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white text-[#e94f79] border border-rose-100 flex items-center justify-center shrink-0">
            <FiZap />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">Consejo de NIA</h3>

            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Mantén cada día equilibrado entre actividades, traslados y tiempo
              libre. Así la propuesta será más cómoda y fácil de presentar al
              cliente.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#fffafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-10 text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-rose-100 animate-pulse" />

          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ef5b83] to-[#f47a98] text-white flex items-center justify-center">
            <FiFileText size={25} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900">Cargando propuesta</h2>

        <p className="text-sm text-slate-500 mt-2">
          Estamos preparando toda la información del viaje...
        </p>

        <div className="mt-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-[#ef5b83] to-[#f59ab0] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function EmptyDays() {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-[#e94f79] flex items-center justify-center mb-5">
        <FiCalendar size={28} />
      </div>

      <h3 className="text-xl font-bold text-slate-900">
        Empieza a construir el viaje
      </h3>

      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
        Agrega el primer día usando el panel superior y después incorpora las
        actividades del viajero.
      </p>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e94f79] flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="text-2xl font-black text-slate-900 mt-1 truncate">
        {value}
      </p>

      <p className="text-xs text-slate-400 mt-1">{helper}</p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </p>

      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-slate-50 text-[#e94f79] flex items-center justify-center shrink-0">
          {icon}
        </span>

        <span className="font-semibold text-slate-800 text-sm leading-9 truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

function DetailText({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm text-slate-600 leading-6 whitespace-pre-line">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
        {label}
      </label>

      {children}
    </div>
  );
}

function ActivityCard({
  activity,
  index,
  isEditing,
  editForm,
  saving,
  onEdit,
  onDelete,
  onCancel,
  onSave,
  onChange,
}: {
  activity: ItineraryActivity;
  index: number;
  isEditing: boolean;
  editForm?: ActivityForm;
  saving: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (field: keyof ActivityForm, value: string) => void;
}) {
  if (isEditing && editForm) {
    return (
      <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#ef5b83] text-white flex items-center justify-center">
            <FiEdit3 size={15} />
          </div>

          <div>
            <h4 className="font-bold text-slate-900">Editar actividad</h4>
            <p className="text-xs text-slate-400">
              Actualiza los detalles de esta experiencia.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Actividad">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => onChange("title", e.target.value)}
              className={inputClass}
              placeholder="Nombre de la actividad"
            />
          </Field>

          <Field label="Tipo">
            <select
              value={editForm.type}
              onChange={(e) => onChange("type", e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar tipo</option>

              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Hora de inicio">
            <input
              type="time"
              value={editForm.start_time}
              onChange={(e) => onChange("start_time", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Hora de finalización">
            <input
              type="time"
              value={editForm.end_time}
              onChange={(e) => onChange("end_time", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Ubicación">
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => onChange("location", e.target.value)}
              className={inputClass}
              placeholder="Ej. Playa Rincón"
            />
          </Field>

          <Field label="Costo estimado">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                $
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.estimated_cost}
                onChange={(e) => onChange("estimated_cost", e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="0.00"
              />
            </div>
          </Field>

          <Field label="Descripción" className="md:col-span-2">
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) => onChange("description", e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Describe brevemente la experiencia..."
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-rose-100">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50"
          >
            <FiX />
            Cancelar
          </button>

          <button onClick={onSave} disabled={saving} className={primaryButton}>
            <FiSave />
            {saving ? "Guardando..." : "Guardar actividad"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group border border-slate-200 rounded-2xl p-4 lg:p-5 hover:border-rose-200 hover:shadow-sm transition">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-rose-50 text-slate-500 group-hover:text-[#e94f79] flex items-center justify-center shrink-0 font-bold text-sm transition">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-900">{activity.title}</h4>

            {activity.type && <ActivityTypeBadge type={activity.type} />}
          </div>

          {activity.description && (
            <p className="text-sm text-slate-500 mt-2 leading-6">
              {activity.description}
            </p>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs font-medium text-slate-400">
            {(activity.start_time || activity.end_time) && (
              <span className="inline-flex items-center gap-1.5">
                <FiClock className="text-[#e94f79]" />
                {formatTime(activity.start_time)}

                {activity.end_time ? ` – ${formatTime(activity.end_time)}` : ""}
              </span>
            )}

            {activity.location && (
              <span className="inline-flex items-center gap-1.5">
                <FiMapPin className="text-[#e94f79]" />
                {activity.location}
              </span>
            )}

            {activity.estimated_cost !== null &&
              activity.estimated_cost !== undefined && (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                  <FiDollarSign />
                  {Number(activity.estimated_cost).toLocaleString("en-US")}
                </span>
              )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-2.5 rounded-xl text-slate-400 hover:text-[#e94f79] hover:bg-rose-50 transition"
            title="Editar actividad"
          >
            <FiEdit3 />
          </button>

          <button
            onClick={onDelete}
            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Eliminar actividad"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddActivityForm({
  form,
  onChange,
  onAdd,
}: {
  form: ActivityForm;
  onChange: (field: keyof ActivityForm, value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-[#e94f79] flex items-center justify-center">
          <FiPlus />
        </div>

        <div>
          <h4 className="font-bold text-slate-900">Nueva actividad</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Añade una experiencia al día.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <input
          type="text"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Actividad *"
          className={inputClass}
        />

        <select
          value={form.type}
          onChange={(e) => onChange("type", e.target.value)}
          className={selectClass}
        >
          <option value="">Tipo de actividad</option>

          {activityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={form.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="Ubicación"
          className={inputClass}
        />

        <input
          type="time"
          value={form.start_time}
          onChange={(e) => onChange("start_time", e.target.value)}
          className={inputClass}
        />

        <input
          type="time"
          value={form.end_time}
          onChange={(e) => onChange("end_time", e.target.value)}
          className={inputClass}
        />

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
            $
          </span>

          <input
            type="number"
            min="0"
            step="0.01"
            value={form.estimated_cost}
            onChange={(e) => onChange("estimated_cost", e.target.value)}
            placeholder="Costo estimado"
            className={`${inputClass} pl-9`}
          />
        </div>

        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Descripción de la actividad..."
          className={`${inputClass} resize-none md:col-span-2 lg:col-span-3`}
        />
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ef5b83] to-[#f47a98] text-white font-bold shadow-md shadow-rose-300/30 hover:from-[#df466f] hover:to-[#ed6789] transition"
        >
          <FiPlus />
          Agregar actividad
        </button>
      </div>
    </div>
  );
}

function ActivityTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Transporte: "bg-sky-50 text-sky-700 border-sky-100",
    Hotel: "bg-violet-50 text-violet-700 border-violet-100",
    Comida: "bg-orange-50 text-orange-700 border-orange-100",
    Tour: "bg-rose-50 text-blue-700 border-rose-100",
    Actividad: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Visita: "bg-cyan-50 text-cyan-700 border-cyan-100",
    "Tiempo libre": "bg-slate-100 text-slate-600 border-slate-200",
    Otro: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${
        styles[type] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {type}
    </span>
  );
}

function StatusBadge({
  status,
  dark = false,
}: {
  status?: string | null;
  dark?: boolean;
}) {
  const normalized = (status || "borrador").toLowerCase();

  const isCompleted = normalized.includes("complet");

  const isActive =
    normalized.includes("activo") || normalized.includes("confirm");

  if (dark) {
    return (
      <span className="px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-300/20 text-amber-300 text-xs font-bold">
        {isCompleted ? "Completado" : isActive ? "Activo" : "Borrador"}
      </span>
    );
  }

  return (
    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold">
      {isCompleted ? "Completado" : isActive ? "Activo" : "Borrador"}
    </span>
  );
}

function calculateDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return "—";

  const startDate = new Date(`${start}T00:00:00`);

  const endDate = new Date(`${end}T00:00:00`);

  const diff =
    Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

  return diff > 0 ? String(diff) : "—";
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "";

  return value.slice(0, 5);
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-400/10";

const primaryButton =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ef5b83] to-[#f47a98] text-white font-bold shadow-md shadow-rose-300/30 hover:from-[#df466f] hover:to-[#ed6789] disabled:opacity-50 transition";
