
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  FaPlus,
  FaSearch,
  FaUsers,
  FaEdit,
  FaTrash,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaGlobeAmericas,
  FaUserPlus,
  FaArrowRight,
  FaUser,
  FaStickyNote,
} from "react-icons/fa";

import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
  type Client,
} from "../service/clientService";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClients();
      setClients(data);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message || "No se pudieron cargar los clientes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return clients;
    }

    return clients.filter((client) => {
      return (
        client.full_name?.toLowerCase().includes(value) ||
        client.email?.toLowerCase().includes(value) ||
        client.phone?.toLowerCase().includes(value) ||
        client.country?.toLowerCase().includes(value)
      );
    });
  }, [clients, search]);

  const countriesCount = useMemo(() => {
    return new Set(
      clients
        .map((client) => client.country?.trim())
        .filter(Boolean)
    ).size;
  }, [clients]);

  const clientsWithEmail = useMemo(() => {
    return clients.filter((client) => client.email?.trim()).length;
  }, [clients]);

  const clientsWithPhone = useMemo(() => {
    return clients.filter((client) => client.phone?.trim()).length;
  }, [clients]);

  const openCreateModal = () => {
    setEditingClient(null);

    setFullName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setNotes("");

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);

    setFullName(client.full_name);
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setCountry(client.country || "");
    setNotes(client.notes || "");

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        notes: notes.trim(),
      };

      if (editingClient) {
        await updateClient(editingClient.id, payload);
      } else {
        await createClient(payload);
      }

      await loadClients();

      setModalOpen(false);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message || "No se pudo guardar el cliente."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este cliente?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await deleteClient(id);

      setClients((current) =>
        current.filter((client) => client.id !== id)
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message || "No se pudo eliminar el cliente."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) => {
    const cleanName = name?.trim();

    if (!cleanName) return "CL";

    const parts = cleanName.split(/\s+/);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0f172a] via-[#12356b] to-[#087e9d] shadow-xl mb-7">

          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-cyan-100 text-xs font-bold uppercase tracking-[0.16em] mb-5">
                  <FaUsers className="text-cyan-300" />
                  Gestión de clientes
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                  Tus clientes,
                  <span className="block text-cyan-300">
                    en un solo lugar.
                  </span>
                </h1>

                <p className="mt-4 text-sm sm:text-base text-slate-200/85 max-w-xl leading-7">
                  Organiza la información de tus viajeros, conoce
                  sus preferencias y ten todo preparado para crear
                  propuestas de viaje más personalizadas.
                </p>

              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="group inline-flex items-center justify-center gap-3 bg-white text-[#0f172a] px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center">
                  <FaPlus className="text-xs" />
                </span>

                Nuevo cliente

                <FaArrowRight className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ====================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

          <StatCard
            icon={<FaUsers />}
            label="Total clientes"
            value={clients.length}
            description="Registrados"
            accent="blue"
          />

          <StatCard
            icon={<FaEnvelope />}
            label="Con correo"
            value={clientsWithEmail}
            description="Contacto disponible"
            accent="cyan"
          />

          <StatCard
            icon={<FaPhone />}
            label="Con teléfono"
            value={clientsWithPhone}
            description="Contacto disponible"
            accent="sky"
          />

          <StatCard
            icon={<FaGlobeAmericas />}
            label="Países"
            value={countriesCount}
            description="Procedencias registradas"
            accent="slate"
          />

        </section>

        {/* =====================================================
            SEARCH
        ====================================================== */}
        <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="relative flex-1 max-w-xl">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, correo, teléfono o país..."
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}

            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />

              {filteredClients.length}{" "}
              {filteredClients.length === 1
                ? "cliente encontrado"
                : "clientes encontrados"}
            </div>

          </div>
        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && !modalOpen && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-4 text-sm text-red-700">

            <div className="w-8 h-8 shrink-0 rounded-lg bg-red-100 flex items-center justify-center font-bold">
              !
            </div>

            <div>
              <p className="font-bold">
                Ocurrió un problema
              </p>

              <p className="mt-0.5 text-red-600">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* =====================================================
            DIRECTORY
        ====================================================== */}
        <section className="bg-white border border-slate-200/80 rounded-[24px] shadow-sm overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Directorio de clientes
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Información de contacto y datos de tus viajeros.
              </p>
            </div>

            {search && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold">
                <FaSearch />
                Filtrando: "{search}"
              </div>
            )}

          </div>

          {loading ? (
            <ClientsSkeleton />
          ) : filteredClients.length === 0 ? (
            <EmptyState
              searching={Boolean(search)}
              onCreate={openCreateModal}
            />
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div className="hidden md:block overflow-x-auto">

                <table className="w-full">

                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">

                      <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Cliente
                      </th>

                      <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Contacto
                      </th>

                      <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Ubicación
                      </th>

                      <th className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Acciones
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        className="group border-b border-slate-100 last:border-0 hover:bg-blue-50/30 transition-colors"
                      >

                        {/* CLIENT */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3.5">

                            <div className="relative shrink-0">

                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
                                {getInitials(client.full_name)}
                              </div>

                              <span className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />

                            </div>

                            <div className="min-w-0">

                              <p className="font-bold text-slate-900 truncate">
                                {client.full_name}
                              </p>

                              <p className="text-xs text-slate-400 mt-0.5">
                                Cliente registrado
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}
                        <td className="px-6 py-5">

                          <div className="space-y-1.5">

                            {client.email ? (
                              <div className="flex items-center gap-2 text-sm text-slate-600">

                                <FaEnvelope className="text-[11px] text-blue-500 shrink-0" />

                                <span className="truncate max-w-[240px]">
                                  {client.email}
                                </span>

                              </div>
                            ) : (
                              <div className="text-sm text-slate-400">
                                Sin correo
                              </div>
                            )}

                            {client.phone && (
                              <div className="flex items-center gap-2 text-xs text-slate-400">

                                <FaPhone className="text-[10px]" />

                                {client.phone}

                              </div>
                            )}

                          </div>

                        </td>

                        {/* COUNTRY */}
                        <td className="px-6 py-5">

                          {client.country ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-sm">

                              <FaGlobeAmericas className="text-xs text-cyan-600" />

                              {client.country}

                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Sin especificar
                            </span>
                          )}

                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() => openEditModal(client)}
                              className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-all"
                              title="Editar cliente"
                            >
                              <FaEdit className="text-sm" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(client.id)}
                              disabled={deletingId === client.id}
                              className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-all disabled:opacity-50"
                              title="Eliminar cliente"
                            >
                              {deletingId === client.id ? (
                                <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-red-500 animate-spin" />
                              ) : (
                                <FaTrash className="text-sm" />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE
              ================================================== */}
              <div className="md:hidden divide-y divide-slate-100">

                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-5 hover:bg-slate-50 transition"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm">
                          {getInitials(client.full_name)}
                        </div>

                        <div className="min-w-0">

                          <h3 className="font-bold text-slate-900 truncate">
                            {client.full_name}
                          </h3>

                          {client.country && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">

                              <FaGlobeAmericas className="text-cyan-500" />

                              {client.country}

                            </p>
                          )}

                        </div>

                      </div>

                      <div className="flex gap-1 shrink-0">

                        <button
                          type="button"
                          onClick={() => openEditModal(client)}
                          className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"
                        >
                          <FaEdit className="text-xs" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(client.id)}
                          disabled={deletingId === client.id}
                          className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-50"
                        >
                          {deletingId === client.id ? (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-red-200 border-t-red-500 animate-spin" />
                          ) : (
                            <FaTrash className="text-xs" />
                          )}
                        </button>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2">

                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <FaEnvelope className="text-xs text-blue-500" />
                          <span className="truncate">
                            {client.email}
                          </span>
                        </div>
                      )}

                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <FaPhone className="text-xs text-cyan-500" />
                          {client.phone}
                        </div>
                      )}

                    </div>

                    {client.notes && (
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">

                        <div className="flex items-start gap-2">

                          <FaStickyNote className="text-xs text-slate-400 mt-1" />

                          <p className="text-xs text-slate-500 line-clamp-2">
                            {client.notes}
                          </p>

                        </div>

                      </div>
                    )}

                  </div>
                ))}

              </div>
            </>
          )}

          {!loading && filteredClients.length > 0 && (
            <div className="px-5 sm:px-6 py-4 bg-slate-50/60 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Mostrando{" "}
                <span className="font-bold text-slate-600">
                  {filteredClients.length}
                </span>{" "}
                de{" "}
                <span className="font-bold text-slate-600">
                  {clients.length}
                </span>{" "}
                clientes.
              </p>
            </div>
          )}

        </section>
      </div>

      {/* =========================================================
          MODAL
      ========================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white w-full max-w-2xl rounded-[28px] shadow-2xl max-h-[92vh] overflow-hidden">

            {/* =================================================
                MODAL HEADER
            ================================================== */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#12356b] to-[#087e9d] px-6 sm:px-8 py-6">

              <div className="absolute -right-12 -top-16 w-44 h-44 rounded-full bg-cyan-400/20 blur-2xl" />

              <div className="absolute -left-20 -bottom-24 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative flex items-start justify-between gap-5">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                    {editingClient ? (
                      <FaEdit />
                    ) : (
                      <FaUserPlus />
                    )}
                  </div>

                  <div>

                    <p className="text-cyan-300 text-[10px] font-bold uppercase tracking-[0.16em]">
                      {editingClient
                        ? "Actualizar información"
                        : "Nuevo registro"}
                    </p>

                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {editingClient
                        ? "Editar cliente"
                        : "Agregar cliente"}
                    </h2>

                    <p className="text-sm text-slate-200/70 mt-1">
                      {editingClient
                        ? "Mantén sus datos actualizados."
                        : "Crea un nuevo perfil de viajero."}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="w-10 h-10 shrink-0 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition disabled:opacity-50"
                >
                  <FaTimes />
                </button>

              </div>

            </div>

            {/* =================================================
                FORM
            ================================================== */}
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 overflow-y-auto max-h-[calc(92vh-132px)]"
            >

              {/* ERROR */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">

                  <div className="w-7 h-7 shrink-0 rounded-lg bg-red-100 flex items-center justify-center font-bold">
                    !
                  </div>

                  <div>
                    <p className="font-bold">
                      No se pudo completar la operación
                    </p>

                    <p className="mt-0.5 text-red-600">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {/* =================================================
                  SECTION 01
              ================================================== */}
              <div className="mb-8">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">
                    01
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Información básica
                    </h3>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Identifica al viajero.
                    </p>
                  </div>

                </div>

                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nombre completo
                    <span className="text-blue-600 ml-1">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      required
                      autoFocus
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  SECTION 02
              ================================================== */}
              <div className="mb-8">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-[10px] font-black">
                    02
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Datos de contacto
                    </h3>

                    <p className="text-xs text-slate-400 mt-0.5">
                      ¿Cómo puedes comunicarte con él?
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* EMAIL */}
                  <div>

                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Correo electrónico
                    </label>

                    <div className="relative">

                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="cliente@email.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                    </div>

                  </div>

                  {/* PHONE */}
                  <div>

                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Teléfono
                    </label>

                    <div className="relative">

                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 809 000 0000"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  SECTION 03
              ================================================== */}
              <div className="mb-8">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-[10px] font-black">
                    03
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Perfil del viajero
                    </h3>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Información útil para futuras propuestas.
                    </p>
                  </div>

                </div>

                {/* COUNTRY */}
                <div className="mb-5">

                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    País
                  </label>

                  <div className="relative">

                    <FaGlobeAmericas className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Ej. República Dominicana"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                </div>

                {/* NOTES */}
                <div>

                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Notas y preferencias
                  </label>

                  <div className="relative">

                    <FaStickyNote className="absolute left-4 top-4 text-slate-400 text-sm" />

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Preferencias, observaciones, destinos favoritos, restricciones, tipo de viaje, etc."
                      rows={5}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    Esta información puede ayudarte a preparar
                    recomendaciones más personalizadas.
                  </p>

                </div>

              </div>

              {/* =================================================
                  INFO CARD
              ================================================== */}
              <div className="mb-7 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 p-4">

                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-cyan-200/30 blur-xl" />

                <div className="relative flex items-start gap-3">

                  <div className="w-9 h-9 shrink-0 rounded-xl bg-white text-blue-600 shadow-sm flex items-center justify-center">
                    <FaUsers className="text-sm" />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-800">
                      Información útil para NIA
                    </p>

                    <p className="text-xs text-slate-500 mt-1 leading-5">
                      Las preferencias y notas del cliente pueden
                      servir como contexto para preparar futuras
                      propuestas de viaje.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================== */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-slate-100">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                >

                  {saving ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-xs" />

                      {editingClient
                        ? "Guardar cambios"
                        : "Crear cliente"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  accent: "blue" | "cyan" | "sky" | "slate";
}) {
  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      dot: "bg-blue-500",
    },
    cyan: {
      icon: "bg-cyan-50 text-cyan-600",
      dot: "bg-cyan-500",
    },
    sky: {
      icon: "bg-sky-50 text-sky-600",
      dot: "bg-sky-500",
    },
    slate: {
      icon: "bg-slate-100 text-slate-600",
      dot: "bg-slate-500",
    },
  };

  const style = styles[accent];

  return (
    <div className="group bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      <div className="flex items-start justify-between gap-3">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.icon}`}
        >
          {icon}
        </div>

        <span
          className={`w-2 h-2 rounded-full ${style.dot} opacity-70`}
        />

      </div>

      <div className="mt-4">

        <p className="text-xs font-semibold text-slate-400">
          {label}
        </p>

        <div className="flex items-end gap-2 mt-1">

          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {value}
          </span>

        </div>

        <p className="text-[11px] text-slate-400 mt-1">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =============================================================
   LOADING SKELETON
============================================================= */

function ClientsSkeleton() {
  return (
    <div className="divide-y divide-slate-100">

      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="px-6 py-5 animate-pulse"
        >

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-2xl bg-slate-200" />

            <div className="flex-1">

              <div className="h-4 bg-slate-200 rounded-lg w-40 mb-2" />

              <div className="h-3 bg-slate-100 rounded-lg w-24" />

            </div>

            <div className="hidden sm:block w-32 h-4 bg-slate-100 rounded-lg" />

            <div className="hidden sm:block w-24 h-4 bg-slate-100 rounded-lg" />

            <div className="w-20 h-9 bg-slate-100 rounded-xl" />

          </div>

        </div>
      ))}

    </div>
  );
}

/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyState({
  searching,
  onCreate,
}: {
  searching: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="px-6 py-20 text-center">

      <div className="relative w-20 h-20 mx-auto mb-6">

        <div className="absolute inset-0 rounded-[24px] bg-blue-100 animate-pulse" />

        <div className="relative w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center">
          <FaUsers className="text-2xl text-blue-500" />
        </div>

      </div>

      <h3 className="text-lg font-black text-slate-900">
        {searching
          ? "No encontramos clientes"
          : "Todavía no tienes clientes"}
      </h3>

      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-6">
        {searching
          ? "Prueba con otro nombre, correo, teléfono o país."
          : "Agrega tu primer cliente y comienza a construir una base de viajeros para tus próximas propuestas."}
      </p>

      {!searching && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
        >
          <FaPlus className="text-xs" />
          Agregar primer cliente
        </button>
      )}

    </div>
  );
}

