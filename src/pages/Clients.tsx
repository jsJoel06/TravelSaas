import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  FaArrowRight,
  FaEdit,
  FaEnvelope,
  FaGlobeAmericas,
  FaPhone,
  FaPlus,
  FaSearch,
  FaStickyNote,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserPlus,
  FaUsers,
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
  const [countryFilter, setCountryFilter] = useState("Todos");

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
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudieron cargar los clientes."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const value = search.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        !value ||
        client.full_name?.toLowerCase().includes(value) ||
        client.email?.toLowerCase().includes(value) ||
        client.phone?.toLowerCase().includes(value) ||
        client.country?.toLowerCase().includes(value);

      const matchesCountry =
        countryFilter === "Todos" ||
        client.country?.trim() === countryFilter;

      return Boolean(matchesSearch && matchesCountry);
    });
  }, [clients, search, countryFilter]);

  const countriesCount = useMemo(
    () =>
      new Set(
        clients
          .map((client) => client.country?.trim())
          .filter((value): value is string => Boolean(value)),
      ).size,
    [clients],
  );

  const clientsWithEmail = useMemo(
    () => clients.filter((client) => client.email?.trim()).length,
    [clients],
  );

  const clientsWithPhone = useMemo(
    () => clients.filter((client) => client.phone?.trim()).length,
    [clients],
  );

  const countryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          clients
            .map((client) => client.country?.trim())
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [clients],
  );

  const recentClients = useMemo(() => clients.slice(0, 5), [clients]);

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
    setFullName(client.full_name || "");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      notes: notes.trim(),
    };

    try {
      setSaving(true);
      setError("");

      if (editingClient) {
        await updateClient(editingClient.id, payload);
      } else {
        await createClient(payload);
      }

      await loadClients();
      setModalOpen(false);
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo guardar el cliente."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este cliente?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      await deleteClient(id);
      setClients((current) =>
        current.filter((client) => client.id !== id),
      );
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, "No se pudo eliminar el cliente."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffafb] text-slate-800">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-rose-500">
              Gestión de viajeros
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Mis clientes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Gestiona tus clientes y mantén sus datos organizados para crear
              viajes y propuestas más personalizadas.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5"
          >
            <FaPlus className="text-xs" />
            Nuevo cliente
          </button>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            icon={<FaUsers />}
            label="Total de clientes"
            value={clients.length}
            detail="Registrados"
          />
          <MetricCard
            icon={<FaEnvelope />}
            label="Con email"
            value={clientsWithEmail}
            detail={percentage(clientsWithEmail, clients.length)}
          />
          <MetricCard
            icon={<FaPhone />}
            label="Con teléfono"
            value={clientsWithPhone}
            detail={percentage(clientsWithPhone, clients.length)}
          />
          <MetricCard
            icon={<FaGlobeAmericas />}
            label="Países"
            value={countriesCount}
            detail="Procedencias"
          />
        </section>

        {error && !modalOpen && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-[0_12px_45px_rgba(148,75,97,0.08)]">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nombre, email, teléfono o país..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Limpiar búsqueda"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>

                <select
                  value={countryFilter}
                  onChange={(event) => setCountryFilter(event.target.value)}
                  className="min-w-[190px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                >
                  <option value="Todos">Todos los países</option>
                  {countryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <ClientsSkeleton />
            ) : filteredClients.length === 0 ? (
              <EmptyState
                searching={Boolean(search) || countryFilter !== "Todos"}
                onCreate={openCreateModal}
              />
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[850px]">
                    <thead>
                      <tr className="bg-[#fff7f9] text-left">
                        <TableHeader>Cliente</TableHeader>
                        <TableHeader>Contacto</TableHeader>
                        <TableHeader>País</TableHeader>
                        <TableHeader>Notas</TableHeader>
                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          className="border-t border-slate-100 transition hover:bg-rose-50/30"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={client.full_name} />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {client.full_name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                  Cliente registrado
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <ContactLine
                                icon={<FaEnvelope />}
                                text={client.email || "Sin correo"}
                              />
                              <ContactLine
                                icon={<FaPhone />}
                                text={client.phone || "Sin teléfono"}
                              />
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                              <FaGlobeAmericas className="text-rose-400" />
                              {client.country || "Sin especificar"}
                            </span>
                          </td>

                          <td className="max-w-[220px] px-5 py-4">
                            <p className="truncate text-xs text-slate-500">
                              {client.notes || "Sin notas"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                title="Editar cliente"
                                onClick={() => openEditModal(client)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                              >
                                <FaEdit className="text-xs" />
                              </button>

                              <button
                                type="button"
                                title="Eliminar cliente"
                                onClick={() => void handleDelete(client.id)}
                                disabled={deletingId === client.id}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === client.id ? (
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
                                ) : (
                                  <FaTrash className="text-xs" />
                                )}
                              </button>

                              <button
                                type="button"
                                title="Ver cliente"
                                onClick={() => openEditModal(client)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm transition hover:scale-105"
                              >
                                <FaArrowRight className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredClients.map((client) => (
                    <article key={client.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={client.full_name} />
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {client.full_name}
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                              {client.country || "País sin especificar"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <button
                            type="button"
                            aria-label="Editar cliente"
                            onClick={() => openEditModal(client)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            type="button"
                            aria-label="Eliminar cliente"
                            onClick={() => void handleDelete(client.id)}
                            disabled={deletingId === client.id}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 disabled:opacity-50"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3">
                        <ContactLine
                          icon={<FaEnvelope />}
                          text={client.email || "Sin correo"}
                        />
                        <ContactLine
                          icon={<FaPhone />}
                          text={client.phone || "Sin teléfono"}
                        />
                      </div>
                    </article>
                  ))}
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Mostrando{" "}
                    <strong className="text-slate-600">
                      {filteredClients.length}
                    </strong>{" "}
                    de{" "}
                    <strong className="text-slate-600">{clients.length}</strong>{" "}
                    clientes
                  </span>
                  <span>Directorio actualizado</span>
                </div>
              </>
            )}
          </section>

          <aside className="space-y-5">
            <SideCard title="Búsqueda rápida" icon={<FaSearch />}>
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar clientes..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                />
              </div>

              <p className="mt-4 text-xs font-bold text-slate-700">
                Filtros por país
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <FilterChip
                  active={countryFilter === "Todos"}
                  onClick={() => setCountryFilter("Todos")}
                >
                  Todos
                </FilterChip>

                {countryOptions.slice(0, 5).map((item) => (
                  <FilterChip
                    key={item}
                    active={countryFilter === item}
                    onClick={() => setCountryFilter(item)}
                  >
                    {item}
                  </FilterChip>
                ))}
              </div>
            </SideCard>

            <SideCard title="Acciones rápidas" icon={<FaPlus />}>
              <button
                type="button"
                onClick={openCreateModal}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/15"
              >
                <FaPlus className="text-xs" />
                Nuevo cliente
              </button>

              <p className="mt-3 rounded-xl border border-dashed border-rose-200 bg-rose-50/50 px-3 py-3 text-center text-xs leading-5 text-rose-600">
                Agrega viajeros y conserva su información lista para tus
                próximos itinerarios.
              </p>
            </SideCard>

            <SideCard title="Clientes recientes" icon={<FaUsers />}>
              {recentClients.length === 0 ? (
                <p className="text-sm text-slate-400">Aún no hay clientes.</p>
              ) : (
                <div className="space-y-2">
                  {recentClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => openEditModal(client)}
                      className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-rose-50"
                    >
                      <Avatar name={client.full_name} small />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {client.full_name}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {client.country || client.email || "Cliente"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SideCard>
          </aside>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar modal"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-rose-100 bg-gradient-to-r from-[#fff3f6] to-[#fff9fa] px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  {editingClient ? <FaEdit /> : <FaUserPlus />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
                    {editingClient ? "Actualizar cliente" : "Nuevo cliente"}
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    {editingClient
                      ? "Editar información"
                      : "Agregar cliente"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                aria-label="Cerrar"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:text-slate-700 disabled:opacity-50"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(92vh-90px)] overflow-y-auto p-6 sm:p-7"
            >
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Nombre completo"
                  required
                  className="sm:col-span-2"
                >
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Ej. Camila Mendoza"
                      autoFocus
                      required
                      className={inputClass}
                    />
                  </div>
                </FormField>

                <FormField label="Correo electrónico">
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="cliente@email.com"
                      className={inputClass}
                    />
                  </div>
                </FormField>

                <FormField label="Teléfono">
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+1 809 000 0000"
                      className={inputClass}
                    />
                  </div>
                </FormField>

                <FormField label="País" className="sm:col-span-2">
                  <div className="relative">
                    <FaGlobeAmericas className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                    <input
                      type="text"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      placeholder="Ej. República Dominicana"
                      className={inputClass}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Notas y preferencias"
                  className="sm:col-span-2"
                >
                  <div className="relative">
                    <FaStickyNote className="absolute left-4 top-4 text-sm text-slate-400" />
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Preferencias, destinos favoritos, observaciones..."
                      rows={5}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </FormField>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-xs" />
                      {editingClient ? "Guardar cambios" : "Crear cliente"}
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function percentage(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function getInitials(name: string) {
  const cleanName = name?.trim();

  if (!cleanName) return "CL";

  const parts = cleanName.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-rose-100 bg-white p-4 shadow-[0_8px_30px_rgba(148,75,97,0.06)] sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 text-lg text-rose-500">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-400">
            {label}
          </p>
          <div className="mt-0.5 flex items-end gap-2">
            <strong className="text-2xl font-black leading-none text-slate-900">
              {value}
            </strong>
            <span className="text-[10px] font-bold text-rose-400">
              {detail}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <div
      className={`${
        small ? "h-9 w-9 text-[11px]" : "h-11 w-11 text-xs"
      } flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-50 font-black text-rose-500 ring-1 ring-rose-100`}
    >
      {getInitials(name)}
    </div>
  );
}

function ContactLine({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex max-w-[260px] items-center gap-2 text-xs text-slate-500">
      <span className="shrink-0 text-[10px] text-slate-400">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function TableHeader({ children }: { children: ReactNode }) {
  return (
    <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  );
}

function SideCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-rose-100 bg-white p-4 shadow-[0_10px_35px_rgba(148,75,97,0.06)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-sm text-rose-500">
          {icon}
        </div>
        <h2 className="text-sm font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
        active
          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
          : "bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
      }`}
    >
      {children}
    </button>
  );
}

function FormField({
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

function ClientsSkeleton() {
  return (
    <div className="animate-pulse p-5">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-16 rounded-2xl bg-gradient-to-r from-slate-100 to-rose-50"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  searching,
  onCreate,
}: {
  searching: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-2xl text-rose-500">
        <FaUsers />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-900">
        {searching ? "No encontramos clientes" : "Aún no tienes clientes"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {searching
          ? "Prueba con otro término de búsqueda o cambia el filtro de país."
          : "Agrega tu primer cliente para comenzar a organizar sus datos y preferencias."}
      </p>

      {!searching && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-sm font-bold text-white"
        >
          <FaPlus className="text-xs" />
          Nuevo cliente
        </button>
      )}
    </div>
  );
}
