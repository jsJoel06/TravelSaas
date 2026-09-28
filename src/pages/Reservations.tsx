import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiEdit3,
  FiDownload,
  FiFileText,
  FiFilter,
  FiMapPin,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  FaHotel,
  FaPlane,
  FaShieldAlt,
  FaSuitcaseRolling,
} from "react-icons/fa";

import {
  createReservation,
  deleteReservation,
  getReservations,
  updateReservation,
  updateReservationStatus,
  type Reservation,
  type ReservationStatus,
  type ReservationType,
} from "../service/reservationService";

import { getClients, type Client } from "../service/clientService";
import { jsPDF } from "jspdf";

/* =========================================================
   TIPOS
========================================================= */

type ReservationForm = {
  client_id: string;
  type: ReservationType;
  title: string;
  provider: string;
  confirmation_code: string;
  start_date: string;
  end_date: string;
  travelers: string;
  amount: string;
  currency: string;
  status: ReservationStatus;
  notes: string;
};

type NotificationState = {
  type: "success" | "error";
  message: string;
} | null;

type StatusFilter = "TODOS" | ReservationStatus;

type TypeFilter = "TODOS" | ReservationType;

/* =========================================================
   CONSTANTES
========================================================= */

const inputClass =
  "h-12 w-full rounded-xl border border-[#f0dddd] bg-[#fffafa] px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

const currencies = ["USD", "DOP", "EUR", "GBP", "CAD"];

const reservationTypes: {
  value: ReservationType;
  label: string;
}[] = [
  {
    value: "VUELO",
    label: "Vuelo",
  },
  {
    value: "HOTEL",
    label: "Hotel",
  },
  {
    value: "TRANSPORTE",
    label: "Transporte",
  },
  {
    value: "ACTIVIDAD",
    label: "Actividad",
  },
  {
    value: "SEGURO",
    label: "Seguro",
  },
  {
    value: "OTRO",
    label: "Otro",
  },
];

const reservationStatuses: {
  value: ReservationStatus;
  label: string;
}[] = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
  },
  {
    value: "CONFIRMADA",
    label: "Confirmada",
  },
  {
    value: "COMPLETADA",
    label: "Completada",
  },
  {
    value: "CANCELADA",
    label: "Cancelada",
  },
];

/* =========================================================
   COMPONENTE
========================================================= */

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [statusChangingId, setStatusChangingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("TODOS");

  const [notification, setNotification] = useState<NotificationState>(null);

  const [form, setForm] = useState<ReservationForm>(createInitialForm());

  /* =========================================================
     CARGAR DATOS
  ========================================================= */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setNotification(null);

      const [reservationsData, clientsData] = await Promise.all([
        getReservations(),
        getClients(),
      ]);

      setReservations(reservationsData);

      setClients(clientsData);
    } catch (error) {
      console.error("Error cargando reservas:", error);

      setNotification({
        type: "error",
        message:
          getErrorMessage(error) || "No se pudieron cargar las reservas.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* =========================================================
     FILTRADO
  ========================================================= */

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations
      .filter((reservation) => {
        const matchesStatus =
          statusFilter === "TODOS" || reservation.status === statusFilter;

        const matchesType =
          typeFilter === "TODOS" || reservation.type === typeFilter;

        const matchesSearch =
          !query ||
          reservation.title.toLowerCase().includes(query) ||
          (reservation.client_name ?? "").toLowerCase().includes(query) ||
          (reservation.provider ?? "").toLowerCase().includes(query) ||
          (reservation.confirmation_code ?? "").toLowerCase().includes(query);

        return matchesStatus && matchesType && matchesSearch;
      })
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [reservations, search, statusFilter, typeFilter]);

  /* =========================================================
     ESTADÍSTICAS
  ========================================================= */

  const stats = useMemo(() => {
    const total = reservations.length;

    const pending = reservations.filter(
      (reservation) => reservation.status === "PENDIENTE",
    ).length;

    const confirmed = reservations.filter(
      (reservation) => reservation.status === "CONFIRMADA",
    ).length;

    const completed = reservations.filter(
      (reservation) => reservation.status === "COMPLETADA",
    ).length;

    const totalAmount = reservations
      .filter((reservation) => reservation.status !== "CANCELADA")
      .reduce(
        (totalValue, reservation) =>
          totalValue + Number(reservation.amount || 0),
        0,
      );

    return {
      total,
      pending,
      confirmed,
      completed,
      totalAmount,
    };
  }, [reservations]);

  /* =========================================================
     NUEVA RESERVA
  ========================================================= */

  const openCreateModal = () => {
    setEditingReservation(null);

    setForm(createInitialForm());

    setModalOpen(true);
  };

  /* =========================================================
     EDITAR
  ========================================================= */

  const openEditModal = (reservation: Reservation) => {
    setEditingReservation(reservation);

    setForm({
      client_id: reservation.client_id ?? "",

      type: reservation.type,

      title: reservation.title,

      provider: reservation.provider ?? "",

      confirmation_code: reservation.confirmation_code ?? "",

      start_date: reservation.start_date,

      end_date: reservation.end_date ?? "",

      travelers: String(reservation.travelers),

      amount: String(reservation.amount),

      currency: reservation.currency,

      status: reservation.status,

      notes: reservation.notes ?? "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);

    setEditingReservation(null);
  };

  /* =========================================================
     GUARDAR
  ========================================================= */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      showError("Escribe un título para la reserva.");

      return;
    }

    if (!form.start_date) {
      showError("Selecciona la fecha de inicio.");

      return;
    }

    const travelers = Number(form.travelers);

    if (!Number.isInteger(travelers) || travelers < 1) {
      showError("La cantidad de viajeros debe ser mayor a 0.");

      return;
    }

    const amount = Number(form.amount);

    if (Number.isNaN(amount) || amount < 0) {
      showError("El monto de la reserva no es válido.");

      return;
    }

    if (form.end_date && form.end_date < form.start_date) {
      showError("La fecha final no puede ser anterior a la fecha inicial.");

      return;
    }

    const selectedClient =
      clients.find((client) => client.id === form.client_id) ?? null;

    try {
      setSaving(true);
      setNotification(null);

      const payload = {
        client_id: selectedClient?.id ?? null,

        client_name: selectedClient?.full_name ?? null,

        type: form.type,

        title: form.title.trim(),

        provider: form.provider.trim() || null,

        confirmation_code: form.confirmation_code.trim() || null,

        start_date: form.start_date,

        end_date: form.end_date || null,

        travelers,

        amount,

        currency: form.currency,

        status: form.status,

        notes: form.notes.trim() || null,
      };

      if (editingReservation) {
        const updated = await updateReservation(editingReservation.id, payload);

        setReservations((current) =>
          current.map((reservation) =>
            reservation.id === updated.id ? updated : reservation,
          ),
        );

        setNotification({
          type: "success",
          message: "Reserva actualizada correctamente.",
        });
      } else {
        const created = await createReservation(payload);

        setReservations((current) => [...current, created]);

        setNotification({
          type: "success",
          message: "Reserva creada correctamente.",
        });
      }

      setModalOpen(false);

      setEditingReservation(null);
    } catch (error) {
      console.error("Error guardando reserva:", error);

      showError(getErrorMessage(error) || "No se pudo guardar la reserva.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     ELIMINAR
  ========================================================= */

  const handleDelete = async (reservation: Reservation) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${reservation.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(reservation.id);

      setNotification(null);

      await deleteReservation(reservation.id);

      setReservations((current) =>
        current.filter((item) => item.id !== reservation.id),
      );

      setNotification({
        type: "success",
        message: "Reserva eliminada correctamente.",
      });
    } catch (error) {
      console.error("Error eliminando reserva:", error);

      showError(getErrorMessage(error) || "No se pudo eliminar la reserva.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     CAMBIAR ESTADO
  ========================================================= */

  const handleStatusChange = async (
    reservation: Reservation,
    status: ReservationStatus,
  ) => {
    if (reservation.status === status) {
      return;
    }

    try {
      setStatusChangingId(reservation.id);

      const updated = await updateReservationStatus(reservation.id, status);

      setReservations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );

      setNotification({
        type: "success",
        message: "Estado de la reserva actualizado.",
      });
    } catch (error) {
      console.error("Error actualizando estado:", error);

      showError(getErrorMessage(error) || "No se pudo actualizar el estado.");
    } finally {
      setStatusChangingId(null);
    }
  };

  /* =========================================================
     ERROR
  ========================================================= */

  const showError = (message: string) => {
    setNotification({
      type: "error",
      message,
    });
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#fff8f8] text-slate-800">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">
              Gestión de viajes
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              Reservas
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Gestiona vuelos, alojamientos, transportes, actividades y
              servicios de tus clientes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f0dddd] bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Actualizar
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5"
            >
              <FiPlus size={18} />
              Nueva reserva
            </button>
          </div>
        </header>

        {/* NOTIFICACIÓN */}

        {notification && (
          <div
            className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
              notification.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notification.type === "success" ? (
              <FiCheckCircle className="mt-0.5 shrink-0" />
            ) : (
              <FiAlertCircle className="mt-0.5 shrink-0" />
            )}

            <span className="flex-1">{notification.message}</span>

            <button type="button" onClick={() => setNotification(null)}>
              <FiX />
            </button>
          </div>
        )}

        {/* ESTADÍSTICAS */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Reservas"
            value={stats.total}
            subtitle="Total registradas"
            icon={<FaSuitcaseRolling />}
          />

          <StatCard
            title="Confirmadas"
            value={stats.confirmed}
            subtitle="Reservas confirmadas"
            icon={<FiCheckCircle />}
          />

          <StatCard
            title="Pendientes"
            value={stats.pending}
            subtitle="Requieren seguimiento"
            icon={<FiClock />}
          />

          <StatCard
            title="Completadas"
            value={stats.completed}
            subtitle="Servicios finalizados"
            icon={<FiCalendar />}
          />
        </section>

        {/* CONTENIDO */}

        <section className="overflow-hidden rounded-[24px] border border-[#f0dddd] bg-white shadow-[0_12px_45px_rgba(148,75,97,0.06)]">
          {/* TOOLBAR */}

          <div className="flex flex-col gap-3 border-b border-[#f5e5e5] p-4 lg:flex-row lg:items-center">
            {/* BUSCAR */}

            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por reserva, cliente, proveedor o código..."
                className="h-11 w-full rounded-xl border border-[#f0dddd] bg-[#fffafa] pl-11 pr-4 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
            </div>

            {/* TIPO */}

            <div className="relative">
              <FiFilter className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as TypeFilter)
                }
                className="h-11 min-w-[170px] appearance-none rounded-xl border border-[#f0dddd] bg-white pl-10 pr-10 text-xs font-bold text-slate-600 outline-none"
              >
                <option value="TODOS">Todos los tipos</option>

                {reservationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* ESTADO */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-11 min-w-[170px] appearance-none rounded-xl border border-[#f0dddd] bg-white px-4 pr-10 text-xs font-bold text-slate-600 outline-none"
              >
                <option value="TODOS">Todos los estados</option>

                {reservationStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* RESULTADOS */}

          <div className="flex items-center justify-between border-b border-[#f5e5e5] bg-[#fffafa] px-5 py-3">
            <p className="text-xs font-semibold text-slate-500">
              {filteredReservations.length}{" "}
              {filteredReservations.length === 1 ? "reserva" : "reservas"}
            </p>

            {(search || typeFilter !== "TODOS" || statusFilter !== "TODOS") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("TODOS");
                  setStatusFilter("TODOS");
                }}
                className="text-xs font-bold text-rose-500"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredReservations.length === 0 ? (
            <EmptyState
              hasFilters={
                Boolean(search) ||
                typeFilter !== "TODOS" ||
                statusFilter !== "TODOS"
              }
              onCreate={openCreateModal}
            />
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-[#f5e5e5] bg-[#fffafa] text-left">
                      <TableHead>Reserva</TableHead>

                      <TableHead>Cliente</TableHead>

                      <TableHead>Fecha</TableHead>

                      <TableHead>Viajeros</TableHead>

                      <TableHead>Importe</TableHead>

                      <TableHead>Estado</TableHead>

                      <TableHead>Acciones</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReservations.map((reservation) => (
                      <ReservationRow
                        key={reservation.id}
                        reservation={reservation}
                        deleting={deletingId === reservation.id}
                        changingStatus={statusChangingId === reservation.id}
                        onEdit={() => openEditModal(reservation)}
                        onDownload={() => downloadReservationPdf(reservation)}
                        onDelete={() => void handleDelete(reservation)}
                        onStatusChange={(status) =>
                          void handleStatusChange(reservation, status)
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="grid gap-3 p-4 lg:hidden">
                {filteredReservations.map((reservation) => (
                  <ReservationMobileCard
                    key={reservation.id}
                    reservation={reservation}
                    deleting={deletingId === reservation.id}
                    changingStatus={statusChangingId === reservation.id}
                    onEdit={() => openEditModal(reservation)}
                    onDownload={() => downloadReservationPdf(reservation)}
                    onDelete={() => void handleDelete(reservation)}
                    onStatusChange={(status) =>
                      void handleStatusChange(reservation, status)
                    }
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#f0dddd] bg-white shadow-[0_30px_100px_rgba(75,35,48,0.25)]">
            {/* =====================================================
          HEADER
      ===================================================== */}

            <div className="flex items-center justify-between border-b border-[#f4e3e3] bg-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-lg text-white shadow-lg shadow-rose-500/20">
                  <ReservationTypeIcon type={form.type} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                    Gestión de reservas
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {editingReservation ? "Editar reserva" : "Nueva reserva"}
                  </h2>

                  <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                    {editingReservation
                      ? "Actualiza los datos y mantén la reserva organizada."
                      : "Registra los servicios contratados para tu cliente."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f0dddd] bg-[#fffafa] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* =====================================================
          BODY
      ===================================================== */}

            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(95vh-90px)] overflow-y-auto"
            >
              <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
                {/* =================================================
              FORMULARIO
          ================================================= */}

                <div className="space-y-8 p-5 sm:p-7">
                  {/* =================================================
                1. CLIENTE
            ================================================= */}

                  <FormSection
                    number="01"
                    title="Cliente"
                    description="Selecciona para quién estás gestionando esta reserva."
                  >
                    <div className="relative">
                      <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />

                      <select
                        value={form.client_id}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            client_id: event.target.value,
                          }))
                        }
                        className={`${inputClass} h-14 appearance-none pl-11 pr-12 font-semibold`}
                      >
                        <option value="">Selecciona un cliente</option>

                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.full_name}
                            {client.email ? ` — ${client.email}` : ""}
                          </option>
                        ))}
                      </select>

                      <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {clients.length === 0 && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                        <FiAlertCircle className="mt-0.5 shrink-0" />

                        <span>
                          No tienes clientes registrados. Puedes guardar la
                          reserva sin cliente o registrar uno primero.
                        </span>
                      </div>
                    )}
                  </FormSection>

                  {/* =================================================
                2. TIPO DE RESERVA
            ================================================= */}

                  <FormSection
                    number="02"
                    title="Tipo de reserva"
                    description="¿Qué servicio estás reservando?"
                  >
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {reservationTypes.map((type) => {
                        const selected = form.type === type.value;

                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                type: type.value,
                              }))
                            }
                            className={`group relative flex min-h-[92px] flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                              selected
                                ? "border-rose-400 bg-rose-50 shadow-[0_6px_20px_rgba(244,63,94,0.10)] ring-2 ring-rose-100"
                                : "border-[#f0dddd] bg-white hover:border-rose-200 hover:bg-[#fffafa]"
                            }`}
                          >
                            {selected && (
                              <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
                                <FiCheckCircle />
                              </div>
                            )}

                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl text-base transition ${
                                selected
                                  ? "bg-white text-rose-500 shadow-sm"
                                  : "bg-[#fff7f7] text-slate-400 group-hover:text-rose-400"
                              }`}
                            >
                              <ReservationTypeIcon type={type.value} />
                            </div>

                            <span
                              className={`mt-2 text-xs font-black ${
                                selected ? "text-rose-600" : "text-slate-600"
                              }`}
                            >
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </FormSection>

                  {/* =================================================
                3. INFORMACIÓN
            ================================================= */}

                  <FormSection
                    number="03"
                    title="Detalles"
                    description="Información principal y datos de confirmación."
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Nombre de la reserva"
                        required
                        className="sm:col-span-2"
                      >
                        <input
                          value={form.title}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          placeholder={getTitlePlaceholder(form.type)}
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Proveedor">
                        <input
                          value={form.provider}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              provider: event.target.value,
                            }))
                          }
                          placeholder={getProviderPlaceholder(form.type)}
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Código de confirmación">
                        <div className="relative">
                          <FiFileText className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                          <input
                            value={form.confirmation_code}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                confirmation_code: event.target.value,
                              }))
                            }
                            placeholder="Ej. BK-928310"
                            className={`${inputClass} pl-11`}
                          />
                        </div>
                      </Field>
                    </div>
                  </FormSection>

                  {/* =================================================
                4. FECHAS
            ================================================= */}

                  <FormSection
                    number="04"
                    title="Fechas y viajeros"
                    description="Define cuándo se utilizará el servicio."
                  >
                    <div className="grid gap-5 sm:grid-cols-3">
                      <Field label={getStartDateLabel(form.type)} required>
                        <input
                          type="date"
                          value={form.start_date}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              start_date: event.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label={getEndDateLabel(form.type)}>
                        <input
                          type="date"
                          min={form.start_date || undefined}
                          value={form.end_date}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              end_date: event.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Viajeros" required>
                        <div className="relative">
                          <FiUsers className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={form.travelers}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                travelers: event.target.value,
                              }))
                            }
                            className={`${inputClass} pl-11`}
                          />
                        </div>
                      </Field>
                    </div>
                  </FormSection>

                  {/* =================================================
                5. PRECIO
            ================================================= */}

                  <FormSection
                    number="05"
                    title="Precio y estado"
                    description="Registra el importe y la situación actual."
                  >
                    <div className="grid gap-5 sm:grid-cols-[1fr_150px_1fr]">
                      <Field label="Importe" required>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.amount}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              amount: event.target.value,
                            }))
                          }
                          placeholder="0.00"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Moneda">
                        <select
                          value={form.currency}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              currency: event.target.value,
                            }))
                          }
                          className={inputClass}
                        >
                          {currencies.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Estado">
                        <select
                          value={form.status}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              status: event.target.value as ReservationStatus,
                            }))
                          }
                          className={inputClass}
                        >
                          {reservationStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </FormSection>

                  {/* =================================================
                6. NOTAS
            ================================================= */}

                  <FormSection
                    number="06"
                    title="Notas internas"
                    description="Información adicional para gestionar la reserva."
                  >
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Condiciones, instrucciones, políticas de cancelación, solicitudes del cliente..."
                      className="w-full resize-none rounded-2xl border border-[#f0dddd] bg-[#fffafa] px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                    />
                  </FormSection>
                </div>

                {/* =================================================
              RESUMEN LATERAL
          ================================================= */}

                <aside className="border-t border-[#f0dddd] bg-[#fffafa] p-5 lg:border-l lg:border-t-0 lg:p-6">
                  <div className="lg:sticky lg:top-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Vista previa
                    </p>

                    <div className="mt-4 overflow-hidden rounded-[22px] border border-[#f0dddd] bg-white shadow-sm">
                      <div className="h-1.5 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-400" />

                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getTypeStyle(
                              form.type,
                            )}`}
                          >
                            <ReservationTypeIcon type={form.type} />
                          </div>

                          <div className="min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-wider text-rose-500">
                              {getTypeLabel(form.type)}
                            </span>

                            <h3 className="mt-1 break-words text-sm font-black leading-5 text-slate-900">
                              {form.title || "Nombre de la reserva"}
                            </h3>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {form.provider || "Proveedor por definir"}
                            </p>
                          </div>
                        </div>

                        <div className="my-5 border-t border-dashed border-[#eadada]" />

                        <PreviewItem
                          icon={<FiUser />}
                          label="Cliente"
                          value={
                            clients.find(
                              (client) => client.id === form.client_id,
                            )?.full_name || "Sin cliente"
                          }
                        />

                        <PreviewItem
                          icon={<FiCalendar />}
                          label="Fecha"
                          value={
                            form.start_date
                              ? form.end_date
                                ? `${formatDate(form.start_date)} — ${formatDate(
                                    form.end_date,
                                  )}`
                                : formatDate(form.start_date)
                              : "Sin definir"
                          }
                        />

                        <PreviewItem
                          icon={<FiUsers />}
                          label="Viajeros"
                          value={`${form.travelers || "1"} ${
                            Number(form.travelers) === 1
                              ? "viajero"
                              : "viajeros"
                          }`}
                        />

                        <PreviewItem
                          icon={<FiFileText />}
                          label="Confirmación"
                          value={form.confirmation_code || "Pendiente"}
                        />

                        <div className="mt-5 rounded-2xl bg-[#fff7f7] p-4">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Importe
                          </p>

                          <p className="mt-1 text-xl font-black text-slate-900">
                            {form.amount
                              ? formatMoney(Number(form.amount), form.currency)
                              : `${form.currency} 0.00`}
                          </p>
                        </div>

                        <div className="mt-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black ${getStatusStyle(
                              form.status,
                            )}`}
                          >
                            {getStatusLabel(form.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                      <div className="flex gap-3">
                        <FiCheckCircle className="mt-0.5 shrink-0 text-rose-500" />

                        <p className="text-[11px] leading-5 text-slate-500">
                          La reserva se guardará en Supabase y quedará asociada
                          al cliente seleccionado.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* =====================================================
            FOOTER
        ===================================================== */}

              <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-[#f0dddd] bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="hidden text-[11px] text-slate-400 sm:block">
                  Los campos marcados con * son obligatorios.
                </p>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-xl border border-[#f0dddd] bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-[#fffafa] disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-w-[165px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle />

                        {editingReservation
                          ? "Guardar cambios"
                          : "Crear reserva"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   FILA DESKTOP
========================================================= */

function ReservationRow({
  reservation,
  deleting,
  changingStatus,
  onEdit,
  onDownload,
  onDelete,
  onStatusChange,
}: {
  reservation: Reservation;
  deleting: boolean;
  changingStatus: boolean;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onStatusChange: (status: ReservationStatus) => void;
}) {
  return (
    <tr className="border-b border-[#f7eaea] transition last:border-0 hover:bg-[#fffafa]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getTypeStyle(
              reservation.type,
            )}`}
          >
            <ReservationTypeIcon type={reservation.type} />
          </div>

          <div className="min-w-0">
            <p className="max-w-[260px] truncate text-sm font-black text-slate-800">
              {reservation.title}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
              <span>{getTypeLabel(reservation.type)}</span>

              {reservation.provider && (
                <>
                  <span>•</span>

                  <span className="max-w-[130px] truncate">
                    {reservation.provider}
                  </span>
                </>
              )}

              {reservation.confirmation_code && (
                <>
                  <span>•</span>

                  <span className="font-bold text-slate-500">
                    #{reservation.confirmation_code}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        {reservation.client_name ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-xs font-black text-rose-500">
              {getInitials(reservation.client_name)}
            </div>

            <span className="max-w-[150px] truncate text-xs font-bold text-slate-600">
              {reservation.client_name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Sin cliente</span>
        )}
      </td>

      <td className="px-5 py-4">
        <p className="text-xs font-bold text-slate-700">
          {formatDate(reservation.start_date)}
        </p>

        {reservation.end_date && (
          <p className="mt-1 text-[10px] text-slate-400">
            hasta {formatDate(reservation.end_date)}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <FiUsers />

          {reservation.travelers}
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-black text-slate-800">
          {formatMoney(reservation.amount, reservation.currency)}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          {reservation.currency}
        </p>
      </td>

      <td className="px-5 py-4">
        <div className="relative inline-block">
          <select
            value={reservation.status}
            disabled={changingStatus}
            onChange={(event) =>
              onStatusChange(event.target.value as ReservationStatus)
            }
            className={`appearance-none rounded-full border-0 py-1.5 pl-3 pr-8 text-[10px] font-black outline-none ${getStatusStyle(
              reservation.status,
            )}`}
          >
            {reservationStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {changingStatus ? (
            <FiRefreshCw className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-xs" />
          ) : (
            <FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" />
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDownload}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            title="Descargar reserva en PDF"
          >
            <FiDownload />
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            title="Editar reserva"
          >
            <FiEdit3 />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
            title="Eliminar reserva"
          >
            {deleting ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 />}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function ReservationMobileCard({
  reservation,
  deleting,
  changingStatus,
  onEdit,
  onDownload,
  onDelete,
  onStatusChange,
}: {
  reservation: Reservation;
  deleting: boolean;
  changingStatus: boolean;
  onEdit: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onStatusChange: (status: ReservationStatus) => void;
}) {
  return (
    <article className="rounded-2xl border border-[#f0dddd] bg-white p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getTypeStyle(
            reservation.type,
          )}`}
        >
          <ReservationTypeIcon type={reservation.type} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-800">
            {reservation.title}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {getTypeLabel(reservation.type)}

            {reservation.provider ? ` · ${reservation.provider}` : ""}
          </p>
        </div>

        <FiMoreVertical className="text-slate-300" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#fffafa] p-3">
        <MiniInfo
          icon={<FiUser />}
          label="Cliente"
          value={reservation.client_name || "Sin cliente"}
        />

        <MiniInfo
          icon={<FiCalendar />}
          label="Fecha"
          value={formatDate(reservation.start_date)}
        />

        <MiniInfo
          icon={<FiUsers />}
          label="Viajeros"
          value={String(reservation.travelers)}
        />

        <MiniInfo
          icon={<FiFileText />}
          label="Importe"
          value={formatMoney(reservation.amount, reservation.currency)}
        />
      </div>

      {reservation.confirmation_code && (
        <p className="mt-3 text-[10px] text-slate-400">
          Confirmación:{" "}
          <span className="font-black text-slate-600">
            {reservation.confirmation_code}
          </span>
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#f5e5e5] pt-3">
        <select
          value={reservation.status}
          disabled={changingStatus}
          onChange={(event) =>
            onStatusChange(event.target.value as ReservationStatus)
          }
          className={`rounded-full border-0 px-3 py-1.5 text-[10px] font-black outline-none ${getStatusStyle(
            reservation.status,
          )}`}
        >
          {reservationStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={onDownload}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fffafa] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            title="Descargar PDF"
          >
            <FiDownload />
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fffafa] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
          >
            <FiEdit3 />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fffafa] text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          >
            {deleting ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 />}
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   COMPONENTES PEQUEÑOS
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-[20px] border border-[#f0dddd] bg-white p-5 shadow-[0_8px_30px_rgba(148,75,97,0.05)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400">{title}</p>

          <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>

          <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          {icon}
        </div>
      </div>
    </article>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
      {children}
    </th>
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

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {icon}

        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <FiRefreshCw className="animate-spin text-xl" />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-700">
          Cargando reservas...
        </p>

        <p className="mt-1 text-xs text-slate-400">Consultando Supabase</p>
      </div>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onCreate,
}: {
  hasFilters: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-rose-50 text-2xl text-rose-400">
          <FaSuitcaseRolling />
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-900">
          {hasFilters ? "No encontramos reservas" : "Aún no tienes reservas"}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {hasFilters
            ? "Prueba cambiando los filtros o el término de búsqueda."
            : "Registra vuelos, hoteles, transportes y otros servicios de tus clientes."}
        </p>

        {!hasFilters && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20"
          >
            <FiPlus />
            Crear primera reserva
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ICONOS
========================================================= */

function ReservationTypeIcon({ type }: { type: ReservationType }) {
  switch (type) {
    case "VUELO":
      return <FaPlane />;

    case "HOTEL":
      return <FaHotel />;

    case "TRANSPORTE":
      return <FiMapPin />;

    case "ACTIVIDAD":
      return <FiCalendar />;

    case "SEGURO":
      return <FaShieldAlt />;

    default:
      return <FaSuitcaseRolling />;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function createInitialForm(): ReservationForm {
  return {
    client_id: "",
    type: "VUELO",
    title: "",
    provider: "",
    confirmation_code: "",
    start_date: "",
    end_date: "",
    travelers: "1",
    amount: "",
    currency: "USD",
    status: "PENDIENTE",
    notes: "",
  };
}

function getTypeLabel(type: ReservationType) {
  const labels: Record<ReservationType, string> = {
    VUELO: "Vuelo",
    HOTEL: "Hotel",
    TRANSPORTE: "Transporte",
    ACTIVIDAD: "Actividad",
    SEGURO: "Seguro",
    OTRO: "Otro",
  };

  return labels[type];
}

function getTypeStyle(type: ReservationType) {
  const styles: Record<ReservationType, string> = {
    VUELO: "bg-sky-50 text-sky-600",

    HOTEL: "bg-violet-50 text-violet-600",

    TRANSPORTE: "bg-amber-50 text-amber-600",

    ACTIVIDAD: "bg-emerald-50 text-emerald-600",

    SEGURO: "bg-indigo-50 text-indigo-600",

    OTRO: "bg-rose-50 text-rose-600",
  };

  return styles[type];
}

function getStatusStyle(status: ReservationStatus) {
  const styles: Record<ReservationStatus, string> = {
    PENDIENTE: "bg-amber-50 text-amber-700",

    CONFIRMADA: "bg-emerald-50 text-emerald-700",

    CANCELADA: "bg-red-50 text-red-600",

    COMPLETADA: "bg-sky-50 text-sky-700",
  };

  return styles[status];
}

function formatDate(value: string) {
  if (!value) {
    return "Sin fecha";
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function downloadReservationPdf(reservation: Reservation) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Encabezado Triply
  pdf.setFillColor(244, 63, 94);
  pdf.rect(0, 0, pageWidth, 34, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.text("Triply", margin, 16);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Confirmacion de reserva", margin, 24);

  pdf.setTextColor(15, 23, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  pdf.text(reservation.title || "Reserva", margin, 49);

  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Tipo: ${getTypeLabel(reservation.type)}`, margin, 57);
  pdf.text(
    `Estado: ${getStatusLabel(reservation.status)}`,
    pageWidth - margin,
    57,
    { align: "right" },
  );

  const rows: Array<[string, string]> = [
    ["Cliente", reservation.client_name || "Sin cliente"],
    ["Proveedor", reservation.provider || "No especificado"],
    ["Codigo de confirmacion", reservation.confirmation_code || "Pendiente"],
    ["Fecha de inicio", formatDate(reservation.start_date)],
    [
      "Fecha final",
      reservation.end_date
        ? formatDate(reservation.end_date)
        : "No especificada",
    ],
    ["Viajeros", String(reservation.travelers)],
    ["Importe", formatMoney(reservation.amount, reservation.currency)],
    ["Moneda", reservation.currency],
  ];

  let y = 69;
  rows.forEach(([label, value], index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(255, 248, 248);
      pdf.roundedRect(margin, y - 5, contentWidth, 13, 2, 2, "F");
    }
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(9);
    pdf.text(label, margin + 4, y + 1);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(30, 41, 59);
    pdf.text(String(value), pageWidth - margin - 4, y + 1, {
      align: "right",
      maxWidth: 95,
    });
    y += 14;
  });

  if (reservation.notes) {
    y += 5;
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(11);
    pdf.text("Notas", margin, y);
    y += 7;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(9);
    const noteLines = pdf.splitTextToSize(reservation.notes, contentWidth);
    pdf.text(noteLines, margin, y);
  }

  pdf.setDrawColor(240, 221, 221);
  pdf.line(margin, 274, pageWidth - margin, 274);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text("Documento generado desde Triply", margin, 282);
  pdf.text(new Date().toLocaleDateString("es-DO"), pageWidth - margin, 282, {
    align: "right",
  });

  const safeTitle = (reservation.title || "reserva")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  pdf.save(`reserva-${safeTitle || reservation.id}.pdf`);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (
      error as {
        message?: unknown;
      }
    ).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "";
}

/* =========================================================
   COMPONENTES DEL FORMULARIO DE RESERVA
========================================================= */

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
    <section>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-rose-50 px-2 text-[10px] font-black text-rose-500">
          {number}
        </span>

        <div>
          <h3 className="text-sm font-black text-slate-900">{title}</h3>
          <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function PreviewItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff7f7] text-rose-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-xs font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function getTitlePlaceholder(type: ReservationType) {
  const placeholders: Record<ReservationType, string> = {
    VUELO: "Ej. Vuelo Santo Domingo → Madrid",
    HOTEL: "Ej. Hotel Riu Palace Bávaro",
    TRANSPORTE: "Ej. Traslado aeropuerto → hotel",
    ACTIVIDAD: "Ej. Excursión Isla Saona",
    SEGURO: "Ej. Seguro de viaje internacional",
    OTRO: "Ej. Servicio adicional del viaje",
  };

  return placeholders[type];
}

function getProviderPlaceholder(type: ReservationType) {
  const placeholders: Record<ReservationType, string> = {
    VUELO: "Ej. Iberia, Arajet, JetBlue",
    HOTEL: "Ej. Marriott, Riu, Barceló",
    TRANSPORTE: "Ej. Empresa de transporte",
    ACTIVIDAD: "Ej. Operador turístico",
    SEGURO: "Ej. Aseguradora",
    OTRO: "Nombre del proveedor",
  };

  return placeholders[type];
}

function getStartDateLabel(type: ReservationType) {
  switch (type) {
    case "HOTEL":
      return "Check-in";
    case "VUELO":
      return "Fecha de salida";
    case "ACTIVIDAD":
      return "Fecha de actividad";
    default:
      return "Fecha de inicio";
  }
}

function getEndDateLabel(type: ReservationType) {
  switch (type) {
    case "HOTEL":
      return "Check-out";
    case "VUELO":
      return "Fecha de regreso";
    default:
      return "Fecha final";
  }
}

function getStatusLabel(status: ReservationStatus) {
  const labels: Record<ReservationStatus, string> = {
    PENDIENTE: "Pendiente",
    CONFIRMADA: "Confirmada",
    COMPLETADA: "Completada",
    CANCELADA: "Cancelada",
  };

  return labels[status];
}
