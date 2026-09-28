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
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiFilter,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  createAgendaActivity,
  deleteAgendaActivity,
  getAgendaActivities,
  toggleAgendaActivityStatus,
  updateAgendaActivity,
  type AgendaActivity,
  type ActivityType,
} from "../service/agendaService";

import { getClients, type Client } from "../service/clientService";

/* =========================================================
   TIPOS
========================================================= */

type ActivityForm = {
  title: string;
  activity_date: string;
  activity_time: string;
  type: ActivityType;
  client_id: string;
  location: string;
  description: string;
};

type NotificationState = {
  type: "success" | "error";
  message: string;
} | null;

/* =========================================================
   CONSTANTES
========================================================= */

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const inputClass =
  "h-12 w-full rounded-xl border border-[#f0dddd] bg-[#fffafa] px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

/* =========================================================
   COMPONENTE
========================================================= */

export default function Agenda() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(formatDateInput(today));

  const [activities, setActivities] = useState<AgendaActivity[]>([]);

  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [notification, setNotification] = useState<NotificationState>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingActivity, setEditingActivity] = useState<AgendaActivity | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<"TODOS" | ActivityType>("TODOS");

  const [form, setForm] = useState<ActivityForm>(
    createInitialForm(formatDateInput(today)),
  );

  /* =========================================================
     CARGAR SUPABASE
  ========================================================= */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setNotification(null);

      const [agendaData, clientsData] = await Promise.all([
        getAgendaActivities(),
        getClients(),
      ]);

      setActivities(agendaData);
      setClients(clientsData);
    } catch (error) {
      console.error("Error cargando la agenda:", error);

      setNotification({
        type: "error",
        message: getErrorMessage(error) || "No se pudo cargar la agenda.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* =========================================================
     CALENDARIO
  ========================================================= */

  const calendarDays = useMemo(
    () => buildCalendarDays(currentDate),
    [currentDate],
  );

  /* =========================================================
     ACTIVIDADES DEL DÍA
  ========================================================= */

  const selectedActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities
      .filter((activity) => activity.activity_date === selectedDate)
      .filter((activity) => {
        const matchesType =
          typeFilter === "TODOS" || activity.type === typeFilter;

        const matchesSearch =
          !query ||
          activity.title.toLowerCase().includes(query) ||
          (activity.client_name ?? "").toLowerCase().includes(query) ||
          (activity.description ?? "").toLowerCase().includes(query) ||
          (activity.location ?? "").toLowerCase().includes(query);

        return matchesType && matchesSearch;
      })
      .sort((a, b) =>
        (a.activity_time ?? "23:59").localeCompare(b.activity_time ?? "23:59"),
      );
  }, [activities, selectedDate, search, typeFilter]);

  /* =========================================================
     ACTIVIDADES PRÓXIMAS
  ========================================================= */

  const upcomingActivities = useMemo(() => {
    const todayValue = formatDateInput(new Date());

    return activities
      .filter(
        (activity) =>
          activity.activity_date >= todayValue &&
          activity.status === "PENDIENTE",
      )
      .sort(compareActivities)
      .slice(0, 5);
  }, [activities]);

  /* =========================================================
     ACTIVIDADES DEL MES
  ========================================================= */

  const monthActivities = useMemo(() => {
    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    return activities.filter((activity) => {
      const date = parseLocalDate(activity.activity_date);

      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [activities, currentDate]);

  const pendingCount = monthActivities.filter(
    (activity) => activity.status === "PENDIENTE",
  ).length;

  const completedCount = monthActivities.filter(
    (activity) => activity.status === "COMPLETADA",
  ).length;

  const meetingCount = monthActivities.filter(
    (activity) => activity.type === "REUNION",
  ).length;

  /* =========================================================
     MODAL CREAR
  ========================================================= */

  const openCreateModal = (date?: string) => {
    const activityDate = date || selectedDate || formatDateInput(new Date());

    setEditingActivity(null);

    setForm(createInitialForm(activityDate));

    setModalOpen(true);
  };

  /* =========================================================
     MODAL EDITAR
  ========================================================= */

  const openEditModal = (activity: AgendaActivity) => {
    setEditingActivity(activity);

    setForm({
      title: activity.title,

      activity_date: activity.activity_date,

      activity_time: normalizeTime(activity.activity_time),

      type: activity.type,

      client_id: activity.client_id ?? "",

      location: activity.location ?? "",

      description: activity.description ?? "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingActivity(null);
  };

  /* =========================================================
     CREAR / EDITAR EN SUPABASE
  ========================================================= */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setNotification({
        type: "error",
        message: "Escribe un título para la actividad.",
      });

      return;
    }

    if (!form.activity_date) {
      setNotification({
        type: "error",
        message: "Selecciona una fecha.",
      });

      return;
    }

    const selectedClient =
      clients.find((client) => client.id === form.client_id) ?? null;

    try {
      setSaving(true);
      setNotification(null);

      if (editingActivity) {
        const updated = await updateAgendaActivity(editingActivity.id, {
          title: form.title.trim(),

          activity_date: form.activity_date,

          activity_time: form.activity_time || null,

          type: form.type,

          client_id: selectedClient?.id ?? null,

          client_name: selectedClient?.full_name ?? null,

          location: form.location.trim() || null,

          description: form.description.trim() || null,
        });

        setActivities((current) =>
          current.map((activity) =>
            activity.id === updated.id ? updated : activity,
          ),
        );

        setNotification({
          type: "success",
          message: "Actividad actualizada correctamente.",
        });
      } else {
        const created = await createAgendaActivity({
          title: form.title.trim(),

          activity_date: form.activity_date,

          activity_time: form.activity_time || null,

          type: form.type,

          client_id: selectedClient?.id ?? null,

          client_name: selectedClient?.full_name ?? null,

          location: form.location.trim() || null,

          description: form.description.trim() || null,
        });

        setActivities((current) =>
          [...current, created].sort(compareActivities),
        );

        setNotification({
          type: "success",
          message: "Actividad creada correctamente.",
        });
      }

      setSelectedDate(form.activity_date);

      const newDate = parseLocalDate(form.activity_date);

      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));

      setModalOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error("Error guardando actividad:", error);

      setNotification({
        type: "error",
        message: getErrorMessage(error) || "No se pudo guardar la actividad.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     ELIMINAR DE SUPABASE
  ========================================================= */

  const handleDelete = async (activity: AgendaActivity) => {
    const confirmed = window.confirm(`¿Eliminar "${activity.title}"?`);

    if (!confirmed) return;

    try {
      setDeletingId(activity.id);
      setNotification(null);

      await deleteAgendaActivity(activity.id);

      setActivities((current) =>
        current.filter((item) => item.id !== activity.id),
      );

      setNotification({
        type: "success",
        message: "Actividad eliminada correctamente.",
      });
    } catch (error) {
      console.error("Error eliminando actividad:", error);

      setNotification({
        type: "error",
        message: getErrorMessage(error) || "No se pudo eliminar la actividad.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     COMPLETAR / REABRIR
  ========================================================= */

  const handleToggleStatus = async (activity: AgendaActivity) => {
    try {
      setNotification(null);

      const updated = await toggleAgendaActivityStatus(activity);

      setActivities((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );

      setNotification({
        type: "success",
        message:
          updated.status === "COMPLETADA"
            ? "Actividad marcada como completada."
            : "Actividad marcada como pendiente.",
      });
    } catch (error) {
      console.error("Error actualizando estado:", error);

      setNotification({
        type: "error",
        message: getErrorMessage(error) || "No se pudo actualizar el estado.",
      });
    }
  };

  /* =========================================================
     NAVEGACIÓN CALENDARIO
  ========================================================= */

  const previousMonth = () => {
    setCurrentDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const goToday = () => {
    const date = new Date();

    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));

    setSelectedDate(formatDateInput(date));
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#fff8f8] text-slate-800">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">
              Organización
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              Agenda
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Organiza reuniones, llamadas, seguimientos y tareas de tus
              clientes.
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
              onClick={() => openCreateModal()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5"
            >
              <FiPlus size={18} />
              Nueva actividad
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

        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<FiCalendar />}
            title="Este mes"
            value={monthActivities.length}
            subtitle="Actividades"
          />

          <MetricCard
            icon={<FiClock />}
            title="Pendientes"
            value={pendingCount}
            subtitle="Por completar"
          />

          <MetricCard
            icon={<FiUsers />}
            title="Reuniones"
            value={meetingCount}
            subtitle="Con clientes"
          />

          <MetricCard
            icon={<FiCheckCircle />}
            title="Completadas"
            value={completedCount}
            subtitle="Este mes"
          />
        </section>

        {/* LOADING */}

        {loading ? (
          <LoadingAgenda />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* CALENDARIO */}

            <section className="overflow-hidden rounded-[24px] border border-[#f0dddd] bg-white shadow-[0_12px_45px_rgba(148,75,97,0.06)]">
              <div className="flex flex-col gap-4 border-b border-[#f6e7e7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f0dddd] text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    type="button"
                    onClick={nextMonth}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f0dddd] text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                  >
                    <FiChevronRight />
                  </button>

                  <h2 className="ml-2 text-lg font-black text-slate-900">
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={goToday}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                >
                  Hoy
                </button>
              </div>

              {/* SEMANA */}

              <div className="grid grid-cols-7 border-b border-[#f6e7e7] bg-[#fffafa]">
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day}
                    className="px-1 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* DÍAS */}

              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const dateValue = formatDateInput(day.date);

                  const dayActivities = activities
                    .filter((activity) => activity.activity_date === dateValue)
                    .sort(compareActivities);

                  const selected = selectedDate === dateValue;

                  const isToday = dateValue === formatDateInput(new Date());

                  return (
                    <button
                      key={`${dateValue}-${index}`}
                      type="button"
                      onClick={() => setSelectedDate(dateValue)}
                      onDoubleClick={() => openCreateModal(dateValue)}
                      className={`relative min-h-[110px] border-b border-r border-[#f6e7e7] p-2 text-left transition sm:min-h-[135px] sm:p-3 ${
                        !day.currentMonth
                          ? "bg-[#fffafa] text-slate-300"
                          : "bg-white"
                      } ${
                        selected
                          ? "z-10 bg-rose-50/60 ring-2 ring-inset ring-rose-300"
                          : "hover:bg-[#fffafa]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            isToday
                              ? "bg-rose-500 text-white"
                              : day.currentMonth
                                ? "text-slate-700"
                                : "text-slate-300"
                          }`}
                        >
                          {day.date.getDate()}
                        </span>

                        {dayActivities.length > 0 && (
                          <span className="text-[9px] font-bold text-slate-400">
                            {dayActivities.length}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        {dayActivities.slice(0, 3).map((activity) => (
                          <div
                            key={activity.id}
                            className={`truncate rounded-lg px-2 py-1 text-[9px] font-bold sm:text-[10px] ${getActivityColor(
                              activity.type,
                            )}`}
                          >
                            <span className="hidden sm:inline">
                              {formatActivityTime(activity.activity_time)}
                              {activity.activity_time ? " · " : ""}
                            </span>

                            {activity.title}
                          </div>
                        ))}

                        {dayActivities.length > 3 && (
                          <p className="px-1 text-[9px] font-bold text-slate-400">
                            +{dayActivities.length - 3} más
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* PANEL DERECHO */}

            <aside className="space-y-5">
              <SideCard>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
                      Día seleccionado
                    </p>

                    <h3 className="mt-1 capitalize text-lg font-black text-slate-900">
                      {formatDisplayDate(selectedDate)}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreateModal(selectedDate)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white transition hover:bg-rose-600"
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* BUSCADOR */}

                <div className="relative mt-5">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar actividad..."
                    className="h-11 w-full rounded-xl border border-[#f0dddd] bg-[#fffafa] pl-10 pr-3 text-xs outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>

                {/* FILTRO */}

                <div className="relative mt-3">
                  <FiFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(
                        event.target.value as "TODOS" | ActivityType,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-[#f0dddd] bg-white pl-10 pr-4 text-xs font-semibold text-slate-600 outline-none"
                  >
                    <option value="TODOS">Todos los tipos</option>

                    <option value="REUNION">Reuniones</option>

                    <option value="LLAMADA">Llamadas</option>

                    <option value="SEGUIMIENTO">Seguimientos</option>

                    <option value="RESERVA">Reservas</option>

                    <option value="TAREA">Tareas</option>
                  </select>
                </div>

                {/* ACTIVIDADES */}

                <div className="mt-5 space-y-3">
                  {selectedActivities.length === 0 ? (
                    <EmptyDay onCreate={() => openCreateModal(selectedDate)} />
                  ) : (
                    selectedActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        deleting={deletingId === activity.id}
                        onEdit={() => openEditModal(activity)}
                        onDelete={() => void handleDelete(activity)}
                        onToggle={() => void handleToggleStatus(activity)}
                      />
                    ))
                  )}
                </div>
              </SideCard>

              {/* PRÓXIMAS */}

              <SideCard>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <FiClock />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Próximas actividades
                    </h3>

                    <p className="text-[10px] text-slate-400">
                      Lo que viene en tu agenda
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {upcomingActivities.length === 0 ? (
                    <p className="rounded-xl bg-[#fffafa] p-4 text-center text-xs text-slate-400">
                      No tienes actividades próximas.
                    </p>
                  ) : (
                    upcomingActivities.map((activity) => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => {
                          setSelectedDate(activity.activity_date);

                          const date = parseLocalDate(activity.activity_date);

                          setCurrentDate(
                            new Date(date.getFullYear(), date.getMonth(), 1),
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-rose-50"
                      >
                        <ActivityIcon type={activity.type} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-700">
                            {activity.title}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatShortDate(activity.activity_date)}

                            {activity.activity_time &&
                              ` · ${formatActivityTime(
                                activity.activity_time,
                              )}`}
                          </p>
                        </div>

                        <FiChevronRight className="shrink-0 text-slate-300" />
                      </button>
                    ))
                  )}
                </div>
              </SideCard>
            </aside>
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[26px] border border-[#f0dddd] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#f6e7e7] bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
                  Agenda
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {editingActivity ? "Editar actividad" : "Nueva actividad"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fffafa] text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* TÍTULO */}

                <Field label="Título" className="sm:col-span-2" required>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Ej. Confirmar hotel con el cliente"
                    className={inputClass}
                  />
                </Field>

                {/* FECHA */}

                <Field label="Fecha" required>
                  <input
                    type="date"
                    value={form.activity_date}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        activity_date: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                {/* HORA */}

                <Field label="Hora">
                  <input
                    type="time"
                    value={form.activity_time}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        activity_time: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                {/* TIPO */}

                <Field label="Tipo">
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as ActivityType,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="REUNION">Reunión</option>

                    <option value="LLAMADA">Llamada</option>

                    <option value="SEGUIMIENTO">Seguimiento</option>

                    <option value="RESERVA">Reserva</option>

                    <option value="TAREA">Tarea</option>
                  </select>
                </Field>

                {/* CLIENTE REAL */}

                <Field label="Cliente">
                  <div className="relative">
                    <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <select
                      value={form.client_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          client_id: event.target.value,
                        }))
                      }
                      className={`${inputClass} appearance-none pl-11`}
                    >
                      <option value="">Sin cliente</option>

                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {clients.length === 0 && (
                    <p className="mt-2 text-[10px] text-amber-600">
                      Todavía no tienes clientes registrados.
                    </p>
                  )}
                </Field>

                {/* LUGAR */}

                <Field label="Lugar" className="sm:col-span-2">
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      value={form.location}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      placeholder="Oficina, videollamada, aeropuerto..."
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </Field>

                {/* DESCRIPCIÓN */}

                <Field label="Descripción" className="sm:col-span-2">
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Agrega notas o información importante..."
                    className="w-full resize-none rounded-xl border border-[#f0dddd] bg-[#fffafa] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </Field>
              </div>

              {/* BOTONES */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#f6e7e7] pt-5 sm:flex-row sm:justify-end">
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <FiRefreshCw className="animate-spin" />
                  ) : (
                    <FiCheckCircle />
                  )}

                  {saving
                    ? "Guardando..."
                    : editingActivity
                      ? "Guardar cambios"
                      : "Crear actividad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function MetricCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  subtitle: string;
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

function SideCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[#f0dddd] bg-white p-5 shadow-[0_10px_35px_rgba(148,75,97,0.05)]">
      {children}
    </section>
  );
}

function ActivityCard({
  activity,
  deleting,
  onEdit,
  onDelete,
  onToggle,
}: {
  activity: AgendaActivity;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const completed = activity.status === "COMPLETADA";

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        completed
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-[#f0dddd] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <ActivityIcon type={activity.type} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-sm font-black ${
                  completed ? "text-slate-400 line-through" : "text-slate-800"
                }`}
              >
                {activity.title}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                {activity.activity_time && (
                  <span className="inline-flex items-center gap-1">
                    <FiClock />

                    {formatActivityTime(activity.activity_time)}
                  </span>
                )}

                {activity.client_name && (
                  <span className="inline-flex items-center gap-1">
                    <FiUser />

                    {activity.client_name}
                  </span>
                )}
              </div>
            </div>

            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${getActivityColor(
                activity.type,
              )}`}
            >
              {getTypeLabel(activity.type)}
            </span>
          </div>

          {activity.description && (
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
              {activity.description}
            </p>
          )}

          {activity.location && (
            <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
              <FiMapPin />

              {activity.location}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 border-t border-[#f6e7e7] pt-3">
            <button
              type="button"
              onClick={onToggle}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold transition ${
                completed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#fffafa] text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              <FiCheckCircle />

              {completed ? "Completada" : "Completar"}
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffafa] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
              title="Editar"
            >
              <FiEdit3 />
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffafa] text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
              title="Eliminar"
            >
              {deleting ? (
                <FiRefreshCw className="animate-spin" />
              ) : (
                <FiTrash2 />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ActivityIcon({ type }: { type: ActivityType }) {
  let icon: ReactNode;

  switch (type) {
    case "REUNION":
      icon = <FiUsers />;
      break;

    case "LLAMADA":
      icon = <FiPhone />;
      break;

    case "SEGUIMIENTO":
      icon = <FiAlertCircle />;
      break;

    case "RESERVA":
      icon = <FiBriefcase />;
      break;

    default:
      icon = <FiCheckCircle />;
  }

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getActivityColor(
        type,
      )}`}
    >
      {icon}
    </div>
  );
}

function EmptyDay({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 px-4 py-8 text-center">
      <FiCalendar className="mx-auto text-xl text-rose-300" />

      <p className="mt-3 text-xs font-bold text-slate-600">
        No hay actividades
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        Agrega una actividad para este día.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-rose-500"
      >
        <FiPlus />
        Nueva actividad
      </button>
    </div>
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

function LoadingAgenda() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-[#f0dddd] bg-white">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <FiRefreshCw className="animate-spin text-xl" />
        </div>

        <p className="mt-4 text-sm font-bold text-slate-700">
          Cargando agenda...
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Consultando tus actividades en Supabase
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function createInitialForm(date: string): ActivityForm {
  return {
    title: "",
    activity_date: date,
    activity_time: "09:00",
    type: "REUNION",
    client_id: "",
    location: "",
    description: "",
  };
}

function buildCalendarDays(currentDate: Date) {
  const year = currentDate.getFullYear();

  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);

  const startOffset = (firstDay.getDay() + 6) % 7;

  const calendarStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);

    date.setDate(calendarStart.getDate() + index);

    return {
      date,
      currentMonth: date.getMonth() === month,
    };
  });
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatDisplayDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseLocalDate(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
  }).format(parseLocalDate(value));
}

function normalizeTime(value: string | null) {
  if (!value) return "";

  return value.slice(0, 5);
}

function formatActivityTime(value: string | null) {
  if (!value) return "";

  const [hours, minutes] = value.split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat("es-DO", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function compareActivities(a: AgendaActivity, b: AgendaActivity) {
  const dateComparison = a.activity_date.localeCompare(b.activity_date);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return (a.activity_time ?? "23:59").localeCompare(b.activity_time ?? "23:59");
}

function getTypeLabel(type: ActivityType) {
  const labels: Record<ActivityType, string> = {
    REUNION: "Reunión",
    LLAMADA: "Llamada",
    SEGUIMIENTO: "Seguimiento",
    RESERVA: "Reserva",
    TAREA: "Tarea",
  };

  return labels[type];
}

function getActivityColor(type: ActivityType) {
  const colors: Record<ActivityType, string> = {
    REUNION: "bg-violet-50 text-violet-600",

    LLAMADA: "bg-sky-50 text-sky-600",

    SEGUIMIENTO: "bg-amber-50 text-amber-600",

    RESERVA: "bg-rose-50 text-rose-600",

    TAREA: "bg-emerald-50 text-emerald-600",
  };

  return colors[type];
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
