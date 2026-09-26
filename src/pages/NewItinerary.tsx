import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiSave,
  FiUsers,
} from "react-icons/fi";

import { createItinerary } from "../service/itineraryService";

import { getClients, type Client } from "../service/clientService";

export default function NewItinerary() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoadingClients(true);

        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error(err);
        setError("No pudimos cargar tus clientes.");
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "travelers" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/itinerarios")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition mb-5"
        >
          <FiArrowLeft size={17} />
          Volver a itinerarios
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Nuevo itinerario
          </h1>

          <p className="mt-1 text-slate-500">
            Crea la información inicial del viaje de tu cliente.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Client */}
            <section className="p-6 sm:p-8 border-b border-slate-100">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">Cliente</h2>

                <p className="text-sm text-slate-500 mt-1">
                  Selecciona el cliente para este viaje.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cliente
                </label>

                <select
                  name="client_id"
                  value={form.client_id}
                  onChange={handleChange}
                  disabled={loadingClients}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 disabled:bg-slate-50"
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

                {!loadingClients && clients.length === 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    No tienes clientes registrados.
                  </p>
                )}
              </div>
            </section>

            {/* Basic information */}
            <section className="p-6 sm:p-8 border-b border-slate-100">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Información del viaje
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Define los datos principales del itinerario.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Título del itinerario
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ej. Viaje familiar a Punta Cana"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Destino
                  </label>

                  <div className="relative">
                    <FiMapPin
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      name="destination"
                      value={form.destination}
                      onChange={handleChange}
                      placeholder="Ej. París, Francia"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo de viaje
                  </label>

                  <select
                    name="trip_type"
                    value={form.trip_type}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
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
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fecha de inicio
                  </label>

                  <div className="relative">
                    <FiCalendar
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fecha de finalización
                  </label>

                  <div className="relative">
                    <FiCalendar
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      min={form.start_date || undefined}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Viajeros
                  </label>

                  <div className="relative">
                    <FiUsers
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      name="travelers"
                      min="1"
                      value={form.travelers}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Presupuesto
                  </label>

                  <div className="relative">
                    <FiDollarSign
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      name="budget"
                      min="0"
                      step="0.01"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="Ej. 2500"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section className="p-6 sm:p-8">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Preferencias
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Esta información será útil posteriormente para generar
                  itinerarios con IA.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Intereses
                  </label>

                  <textarea
                    name="interests"
                    value={form.interests}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Ej. playas, gastronomía, museos, actividades para niños, compras..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notas adicionales
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Información adicional sobre el viaje o las necesidades del cliente..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-5 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/itinerarios")}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiSave size={17} />

                {saving ? "Guardando..." : "Crear itinerario"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
