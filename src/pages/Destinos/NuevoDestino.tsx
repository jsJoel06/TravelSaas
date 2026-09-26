import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiGlobe,
  FiImage,
  FiInfo,
  FiMapPin,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import {
  createDestination,
  type DestinationInput,
} from "../../service/destinationService";

const destinationTypes = [
  "Playa",
  "Naturaleza",
  "Aventura",
  "Ciudad",
  "Cultura",
  "Ecoturismo",
  "Romántico",
  "Familiar",
  "Lujo",
  "Gastronomía",
];

const budgetOptions = ["Económico", "Medio", "Alto", "Premium"];

export default function NuevoDestino() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<DestinationInput>({
    name: "",
    country: "República Dominicana",
    region: "",
    description: "",
    image_url: "",
    destination_type: [],
    best_time: "",
    recommended_days: 5,
    budget_level: "Medio",
    main_activities: [],
    featured_places: [],
    practical_information: [],
    active: true,
  });

  const [activityInput, setActivityInput] = useState("");
  const [placeInput, setPlaceInput] = useState("");
  const [infoInput, setInfoInput] = useState("");

  const updateField = <K extends keyof DestinationInput>(
    field: K,
    value: DestinationInput[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleType = (type: string) => {
    setForm((current) => {
      const currentTypes = current.destination_type ?? [];

      if (currentTypes.includes(type)) {
        return {
          ...current,
          destination_type: currentTypes.filter((item) => item !== type),
        };
      }

      return {
        ...current,
        destination_type: [...currentTypes, type],
      };
    });
  };

  const addItem = (
    value: string,
    field: "main_activities" | "featured_places" | "practical_information",
    clear: () => void,
  ) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    setForm((current) => {
      const currentItems = current[field] ?? [];

      if (
        currentItems.some(
          (item) => item.toLowerCase() === cleanValue.toLowerCase(),
        )
      ) {
        return current;
      }

      return {
        ...current,
        [field]: [...currentItems, cleanValue],
      };
    });

    clear();
  };

  const removeItem = (
    field: "main_activities" | "featured_places" | "practical_information",
    index: number,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: (current[field] ?? []).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("El nombre del destino es obligatorio.");
      return;
    }

    if (!form.country.trim()) {
      setError("El país es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      await createDestination({
        ...form,
        name: form.name.trim(),
        country: form.country.trim(),
        region: form.region?.trim() || null,
        description: form.description?.trim() || null,
        image_url: form.image_url?.trim() || null,
        best_time: form.best_time?.trim() || null,
      });

      navigate("/destinos");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "No se pudo crear el destino.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/destinos")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
        >
          <FiArrowLeft size={16} />
          Volver a destinos
        </button>

        <div className="mb-7 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
            <FiGlobe size={14} />
            Biblioteca de destinos
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Nuevo destino
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Registra la información que utilizará Achuen Travel para orientar a
            sus clientes y que NIA pueda utilizar como contexto.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
            <FiInfo className="mt-0.5 shrink-0 text-red-500" size={17} />

            <div>
              <p className="text-sm font-bold text-red-700">
                No se pudo guardar el destino
              </p>
              <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  icon={<FiMapPin />}
                  title="Información general"
                  description="Datos principales del destino."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Nombre del destino"
                    required
                    placeholder="Ej. Samaná"
                    value={form.name}
                    onChange={(value) => updateField("name", value)}
                  />

                  <InputField
                    label="País"
                    required
                    placeholder="Ej. República Dominicana"
                    value={form.country}
                    onChange={(value) => updateField("country", value)}
                  />

                  <InputField
                    label="Región / ciudad"
                    placeholder="Ej. Samaná"
                    value={form.region ?? ""}
                    onChange={(value) => updateField("region", value)}
                  />

                  <InputField
                    label="Mejor época para viajar"
                    placeholder="Ej. Diciembre a abril"
                    value={form.best_time ?? ""}
                    onChange={(value) => updateField("best_time", value)}
                  />

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Descripción
                    </label>

                    <textarea
                      value={form.description ?? ""}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      placeholder="Describe brevemente qué caracteriza a este destino..."
                      rows={5}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Esta descripción servirá como contexto para NIA.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  icon={<FiGlobe />}
                  title="Características del destino"
                  description="Selecciona los tipos que mejor representan el destino."
                />

                <div className="flex flex-wrap gap-2">
                  {destinationTypes.map((type) => {
                    const selected =
                      form.destination_type?.includes(type) ?? false;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15"
                            : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {selected && (
                          <FiCheck size={13} className="mr-1.5 inline-block" />
                        )}
                        {type}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Duración recomendada
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={form.recommended_days ?? ""}
                        onChange={(event) =>
                          updateField(
                            "recommended_days",
                            event.target.value
                              ? Number(event.target.value)
                              : null,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-16 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        días
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Nivel de presupuesto
                    </label>

                    <select
                      value={form.budget_level ?? ""}
                      onChange={(event) =>
                        updateField("budget_level", event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    >
                      {budgetOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <ListSection
                title="Actividades principales"
                description="Experiencias que normalmente puede realizar el viajero."
                placeholder="Ej. Excursión a Playa Rincón"
                value={activityInput}
                setValue={setActivityInput}
                items={form.main_activities ?? []}
                onAdd={() =>
                  addItem(activityInput, "main_activities", () =>
                    setActivityInput(""),
                  )
                }
                onRemove={(index) => removeItem("main_activities", index)}
              />

              <ListSection
                title="Lugares destacados"
                description="Sitios que el agente debería conocer al asesorar sobre este destino."
                placeholder="Ej. Los Haitises"
                value={placeInput}
                setValue={setPlaceInput}
                items={form.featured_places ?? []}
                onAdd={() =>
                  addItem(placeInput, "featured_places", () =>
                    setPlaceInput(""),
                  )
                }
                onRemove={(index) => removeItem("featured_places", index)}
              />

              <ListSection
                title="Información práctica"
                description="Consideraciones importantes para el agente y el viajero."
                placeholder="Ej. Algunas excursiones dependen del clima"
                value={infoInput}
                setValue={setInfoInput}
                items={form.practical_information ?? []}
                onAdd={() =>
                  addItem(infoInput, "practical_information", () =>
                    setInfoInput(""),
                  )
                }
                onRemove={(index) => removeItem("practical_information", index)}
              />
            </div>

            <div className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                  <SectionHeader
                    icon={<FiImage />}
                    title="Imagen"
                    description="Imagen principal del destino."
                  />
                </div>

                <div className="p-5">
                  <div className="relative mb-4 h-44 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500">
                    {form.image_url ? (
                      <img
                        src={form.image_url}
                        alt="Vista previa"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-white">
                        <FiImage size={36} className="mb-2 text-white/50" />
                        <span className="text-xs font-semibold text-white/60">
                          Vista previa
                        </span>
                      </div>
                    )}
                  </div>

                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    URL de imagen
                  </label>

                  <input
                    type="url"
                    value={form.image_url ?? ""}
                    onChange={(event) =>
                      updateField("image_url", event.target.value)
                    }
                    placeholder="https://..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <p className="mt-2 text-[10px] leading-4 text-slate-400">
                    Por ahora usamos una URL. Después podemos conectar Supabase
                    Storage para subir imágenes directamente.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">
                      Estado del destino
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Los destinos activos pueden utilizarse como contexto para
                      NIA.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateField("active", !(form.active ?? true))
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      form.active ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        form.active ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div
                  className={`mt-4 rounded-xl p-3 ${
                    form.active ? "bg-emerald-50" : "bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-xs font-bold ${
                      form.active ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {form.active ? "Destino activo" : "Destino inactivo"}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <span className="text-sm font-black">N</span>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-blue-900">
                      Contexto para NIA
                    </p>

                    <p className="mt-1.5 text-[11px] leading-5 text-blue-700/70">
                      La información registrada aquí podrá utilizarse para
                      orientar al agente sobre el destino. NIA no debe
                      interpretar estos datos como disponibilidad o reserva
                      confirmada.
                    </p>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      Guardar destino
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/destinos")}
                  disabled={saving}
                  className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
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
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-extrabold text-slate-800">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  required,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

function ListSection({
  title,
  description,
  placeholder,
  value,
  setValue,
  items,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <SectionHeader
        icon={<FiPlus />}
        title={title}
        description={description}
      />

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={onAdd}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700"
          title="Agregar"
        >
          <FiPlus size={18} />
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <FiCheck size={13} />
              </div>

              <span className="min-w-0 flex-1 text-xs font-semibold text-slate-600">
                {item}
              </span>

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-slate-400 transition hover:text-red-500"
                title="Eliminar"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
