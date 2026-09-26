import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiInfo,
  FiMapPin,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import {
  createTemplate,
  type TemplateInput,
  type TemplateItineraryDay,
} from "../../service/templateService";

const travelTypes = [
  "Playa",
  "Familiar",
  "Romántico",
  "Aventura",
  "Cultural",
  "Lujo",
  "Gastronomía",
  "Corporativo",
];

const budgetLevels = ["Económico", "Medio", "Alto", "Premium"];

type FormState = {
  name: string;
  description: string;
  destination: string;
  country: string;
  travel_type: string;
  recommended_days: string;
  budget_level: string;
  includes: string[];
  activities: string[];
  notes: string[];
  itinerary: TemplateItineraryDay[];
  active: boolean;
};

const initialForm: FormState = {
  name: "",
  description: "",
  destination: "",
  country: "República Dominicana",
  travel_type: "",
  recommended_days: "5",
  budget_level: "Medio",
  includes: [""],
  activities: [""],
  notes: [""],
  itinerary: [
    {
      day: 1,
      title: "Llegada y bienvenida",
      activities: [""],
      notes: "",
    },
  ],
  active: true,
};

function NuevaPlantilla() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateArrayItem = (
    field: "includes" | "activities" | "notes",
    index: number,
    value: string,
  ) => {
    setForm((current) => {
      const updated = [...current[field]];
      updated[index] = value;

      return {
        ...current,
        [field]: updated,
      };
    });
  };

  const addArrayItem = (field: "includes" | "activities" | "notes") => {
    setForm((current) => ({
      ...current,
      [field]: [...current[field], ""],
    }));
  };

  const removeArrayItem = (
    field: "includes" | "activities" | "notes",
    index: number,
  ) => {
    setForm((current) => {
      if (current[field].length === 1) {
        return {
          ...current,
          [field]: [""],
        };
      }

      return {
        ...current,
        [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const updateDay = (
    dayIndex: number,
    field: "title" | "notes",
    value: string,
  ) => {
    setForm((current) => {
      const itinerary = [...current.itinerary];

      itinerary[dayIndex] = {
        ...itinerary[dayIndex],
        [field]: value,
      };

      return {
        ...current,
        itinerary,
      };
    });
  };

  const updateDayActivity = (
    dayIndex: number,
    activityIndex: number,
    value: string,
  ) => {
    setForm((current) => {
      const itinerary = [...current.itinerary];
      const day = itinerary[dayIndex];

      const activities = [...day.activities];
      activities[activityIndex] = value;

      itinerary[dayIndex] = {
        ...day,
        activities,
      };

      return {
        ...current,
        itinerary,
      };
    });
  };

  const addDayActivity = (dayIndex: number) => {
    setForm((current) => {
      const itinerary = [...current.itinerary];

      itinerary[dayIndex] = {
        ...itinerary[dayIndex],
        activities: [...itinerary[dayIndex].activities, ""],
      };

      return {
        ...current,
        itinerary,
      };
    });
  };

  const removeDayActivity = (dayIndex: number, activityIndex: number) => {
    setForm((current) => {
      const itinerary = [...current.itinerary];
      const activities = itinerary[dayIndex].activities;

      itinerary[dayIndex] = {
        ...itinerary[dayIndex],
        activities:
          activities.length === 1
            ? [""]
            : activities.filter((_, index) => index !== activityIndex),
      };

      return {
        ...current,
        itinerary,
      };
    });
  };

  const addDay = () => {
    setForm((current) => ({
      ...current,
      itinerary: [
        ...current.itinerary,
        {
          day: current.itinerary.length + 1,
          title: "",
          activities: [""],
          notes: "",
        },
      ],
    }));
  };

  const removeDay = (dayIndex: number) => {
    setForm((current) => {
      if (current.itinerary.length === 1) {
        return current;
      }

      const itinerary = current.itinerary
        .filter((_, index) => index !== dayIndex)
        .map((day, index) => ({
          ...day,
          day: index + 1,
        }));

      return {
        ...current,
        itinerary,
      };
    });
  };

  const handleDaysChange = (value: string) => {
    updateField("recommended_days", value);

    const days = Number(value);

    if (!days || days < 1 || days > 30) {
      return;
    }

    setForm((current) => {
      let itinerary = [...current.itinerary];

      if (days > itinerary.length) {
        for (let day = itinerary.length + 1; day <= days; day++) {
          itinerary.push({
            day,
            title: "",
            activities: [""],
            notes: "",
          });
        }
      }

      if (days < itinerary.length) {
        itinerary = itinerary.slice(0, days);
      }

      return {
        ...current,
        itinerary,
      };
    });
  };

  const cleanArray = (items: string[]) =>
    items.map((item) => item.trim()).filter(Boolean);

  const cleanItinerary = (
    itinerary: TemplateItineraryDay[],
  ): TemplateItineraryDay[] => {
    return itinerary.map((day) => ({
      day: day.day,
      title: day.title.trim(),
      activities: cleanArray(day.activities),
      notes: day.notes?.trim() || "",
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("El nombre de la plantilla es obligatorio.");
      return;
    }

    if (!form.destination.trim()) {
      setError("El destino es obligatorio.");
      return;
    }

    if (!form.travel_type) {
      setError("Selecciona el tipo de viaje.");
      return;
    }

    const days = Number(form.recommended_days);

    if (!days || days < 1 || days > 30) {
      setError("La duración debe estar entre 1 y 30 días.");
      return;
    }

    try {
      setSaving(true);

      const payload: TemplateInput = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        destination: form.destination.trim(),
        country: form.country.trim() || null,
        travel_type: form.travel_type,
        recommended_days: days,
        budget_level: form.budget_level || null,
        includes: cleanArray(form.includes),
        activities: cleanArray(form.activities),
        notes: cleanArray(form.notes),
        itinerary: cleanItinerary(form.itinerary),
        active: form.active,
      };

      await createTemplate(payload);

      navigate("/plantillas");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "No se pudo crear la plantilla.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/plantillas")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <FiArrowLeft size={16} />
              Volver a plantillas
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                <FiFileText size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Nueva plantilla
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Crea una estructura reutilizable para tus propuestas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <FiInfo className="mt-0.5 shrink-0" size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Información general */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={<FiFileText size={18} />}
                title="Información general"
                description="Define los datos principales de la plantilla."
              />

              <div className="grid gap-5 p-6 md:grid-cols-2">
                <Field
                  label="Nombre de la plantilla"
                  required
                  className="md:col-span-2"
                >
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Ej. Escapada romántica a Samaná"
                    className={inputClass}
                  />
                </Field>

                <Field label="Destino" required>
                  <div className="relative">
                    <FiMapPin
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={form.destination}
                      onChange={(event) =>
                        updateField("destination", event.target.value)
                      }
                      placeholder="Ej. Samaná"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </Field>

                <Field label="País">
                  <input
                    type="text"
                    value={form.country}
                    onChange={(event) =>
                      updateField("country", event.target.value)
                    }
                    placeholder="Ej. República Dominicana"
                    className={inputClass}
                  />
                </Field>

                <Field label="Tipo de viaje" required>
                  <Select
                    value={form.travel_type}
                    onChange={(value) => updateField("travel_type", value)}
                    placeholder="Selecciona un tipo"
                    options={travelTypes}
                  />
                </Field>

                <Field label="Nivel de presupuesto">
                  <Select
                    value={form.budget_level}
                    onChange={(value) => updateField("budget_level", value)}
                    options={budgetLevels}
                  />
                </Field>

                <Field label="Duración recomendada" required>
                  <div className="relative">
                    <FiCalendar
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={form.recommended_days}
                      onChange={(event) => handleDaysChange(event.target.value)}
                      className={`${inputClass} pl-10 pr-16`}
                    />

                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      días
                    </span>
                  </div>
                </Field>

                <Field label="Descripción" className="md:col-span-2">
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Describe brevemente qué tipo de experiencia ofrece esta plantilla..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>
            </section>

            {/* Inclusiones y actividades */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={<FiCheck size={18} />}
                title="Contenido de la propuesta"
                description="Define lo que normalmente incluirá este tipo de viaje."
              />

              <div className="grid gap-8 p-6 lg:grid-cols-2">
                <DynamicList
                  title="¿Qué incluye?"
                  description="Servicios o elementos que normalmente forman parte de la propuesta."
                  items={form.includes}
                  placeholder="Ej. Traslado aeropuerto - hotel"
                  addLabel="Agregar inclusión"
                  onChange={(index, value) =>
                    updateArrayItem("includes", index, value)
                  }
                  onAdd={() => addArrayItem("includes")}
                  onRemove={(index) => removeArrayItem("includes", index)}
                />

                <DynamicList
                  title="Actividades"
                  description="Experiencias que suelen recomendarse para este viaje."
                  items={form.activities}
                  placeholder="Ej. Excursión a Playa Rincón"
                  addLabel="Agregar actividad"
                  onChange={(index, value) =>
                    updateArrayItem("activities", index, value)
                  }
                  onAdd={() => addArrayItem("activities")}
                  onRemove={(index) => removeArrayItem("activities", index)}
                />
              </div>
            </section>

            {/* Itinerario */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={<FiCalendar size={18} />}
                title="Estructura del itinerario"
                description="Define una estructura base que luego podrás adaptar a cada cliente."
              />

              <div className="space-y-4 p-6">
                {form.itinerary.map((day, dayIndex) => (
                  <div
                    key={day.day}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                  >
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                          {day.day}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Día {day.day}
                          </p>

                          <p className="text-xs text-slate-400">
                            Estructura base del día
                          </p>
                        </div>
                      </div>

                      {form.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDay(dayIndex)}
                          className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 sm:self-auto"
                        >
                          <FiTrash2 size={14} />
                          Eliminar día
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Field label="Título del día">
                        <input
                          type="text"
                          value={day.title}
                          onChange={(event) =>
                            updateDay(dayIndex, "title", event.target.value)
                          }
                          placeholder="Ej. Llegada, playa y cena"
                          className={inputClass}
                        />
                      </Field>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">
                            Actividades del día
                          </label>

                          <button
                            type="button"
                            onClick={() => addDayActivity(dayIndex)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            <FiPlus size={14} />
                            Agregar
                          </button>
                        </div>

                        <div className="space-y-2">
                          {day.activities.map((activity, activityIndex) => (
                            <div key={activityIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={activity}
                                onChange={(event) =>
                                  updateDayActivity(
                                    dayIndex,
                                    activityIndex,
                                    event.target.value,
                                  )
                                }
                                placeholder="Ej. Visita a Playa Rincón"
                                className={inputClass}
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeDayActivity(dayIndex, activityIndex)
                                }
                                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                aria-label="Eliminar actividad"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Field label="Nota del día">
                        <textarea
                          rows={2}
                          value={day.notes || ""}
                          onChange={(event) =>
                            updateDay(dayIndex, "notes", event.target.value)
                          }
                          placeholder="Ej. Confirmar horario de la excursión..."
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDay}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  <FiPlus size={17} />
                  Agregar día
                </button>
              </div>
            </section>

            {/* Notas */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                icon={<FiInfo size={18} />}
                title="Notas para el agente"
                description="Información interna útil al momento de adaptar la plantilla."
              />

              <div className="p-6">
                <DynamicList
                  title="Consideraciones"
                  description="Consejos, advertencias o información que el agente debería revisar."
                  items={form.notes}
                  placeholder="Ej. Confirmar transporte antes de cotizar"
                  addLabel="Agregar consideración"
                  onChange={(index, value) =>
                    updateArrayItem("notes", index, value)
                  }
                  onAdd={() => addArrayItem("notes")}
                  onRemove={(index) => removeArrayItem("notes", index)}
                />
              </div>
            </section>

            {/* Estado / NIA */}
            <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <FiFileText size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Disponible para NIA
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Las plantillas activas podrán utilizarse posteriormente
                      como referencia para construir propuestas personalizadas
                      con NIA.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateField("active", !form.active)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    form.active ? "bg-blue-600" : "bg-slate-300"
                  }`}
                  aria-label="Cambiar estado"
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      form.active ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/plantillas")}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={17} />
                {saving ? "Guardando..." : "Guardar plantilla"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <FiChevronDown
        size={17}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function DynamicList({
  title,
  description,
  items,
  placeholder,
  addLabel,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  items: string[];
  placeholder: string;
  addLabel: string;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              aria-label="Eliminar elemento"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
      >
        <FiPlus size={14} />
        {addLabel}
      </button>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10";

export default NuevaPlantilla;
