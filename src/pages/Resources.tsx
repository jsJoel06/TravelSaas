import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  FiAlertCircle,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiDownload,
  FiEdit3,
  FiExternalLink,
  FiFile,
  FiFileText,
  FiFilter,
  FiGlobe,
  FiGrid,
  FiImage,
  FiLink,
  FiList,
  FiMoreHorizontal,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiStar,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { FaRegFilePdf, FaRegFileWord, FaRegFileExcel } from "react-icons/fa";

import {
  createResource,
  deleteResource,
  downloadResourceFile,
  getResources,
  openResourceFile,
  openResourceUrl,
  replaceResourceFile,
  toggleResourceFavorite,
  updateResource,
  type Resource,
  type ResourceCategory,
} from "../service/resourceService";

/* =========================================================
   TIPOS
========================================================= */

type ResourceForm = {
  title: string;
  category: ResourceCategory;
  description: string;
  url: string;
  tags: string;
  favorite: boolean;
};

type CategoryFilter = "TODOS" | ResourceCategory;

type ViewMode = "GRID" | "LIST";

type NotificationState = {
  type: "success" | "error";
  message: string;
} | null;

/* =========================================================
   CONSTANTES
========================================================= */

const categories: {
  value: ResourceCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "DOCUMENTO",
    label: "Documento",
    description: "PDF y documentos",
  },
  {
    value: "GUIA",
    label: "Guía",
    description: "Información de destinos",
  },
  {
    value: "PLANTILLA",
    label: "Plantilla",
    description: "Material reutilizable",
  },
  {
    value: "PROVEEDOR",
    label: "Proveedor",
    description: "Hoteles y operadores",
  },
  {
    value: "REQUISITO",
    label: "Requisito",
    description: "Visas y documentación",
  },
  {
    value: "SEGURO",
    label: "Seguro",
    description: "Información de seguros",
  },
  {
    value: "ENLACE",
    label: "Enlace",
    description: "Sitios y herramientas",
  },
  {
    value: "OTRO",
    label: "Otro",
    description: "Otros recursos",
  },
];

const inputClass =
  "h-12 w-full rounded-xl border border-[#f0dddd] bg-[#fffafa] px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100";

/* =========================================================
   COMPONENTE
========================================================= */

export default function Resources() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [dragging, setDragging] = useState(false);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("TODOS");

  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("GRID");

  const [notification, setNotification] = useState<NotificationState>(null);

  const [form, setForm] = useState<ResourceForm>(createInitialForm());

  /* =========================================================
     CARGAR
  ========================================================= */

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setNotification(null);

      const data = await getResources();

      setResources(data);
    } catch (error) {
      console.error("Error cargando recursos:", error);

      showError(
        getErrorMessage(error) || "No se pudieron cargar los recursos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  /* =========================================================
     FILTRAR
  ========================================================= */

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesCategory =
        categoryFilter === "TODOS" || resource.category === categoryFilter;

      const matchesFavorite = !onlyFavorites || resource.favorite;

      const matchesSearch =
        !query ||
        resource.title.toLowerCase().includes(query) ||
        (resource.description ?? "").toLowerCase().includes(query) ||
        (resource.url ?? "").toLowerCase().includes(query) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesFavorite && matchesSearch;
    });
  }, [resources, search, categoryFilter, onlyFavorites]);

  /* =========================================================
     ESTADÍSTICAS
  ========================================================= */

  const stats = useMemo(() => {
    return {
      total: resources.length,

      favorites: resources.filter((resource) => resource.favorite).length,

      files: resources.filter((resource) => resource.file_path).length,

      links: resources.filter((resource) => resource.url).length,
    };
  }, [resources]);

  /* =========================================================
     NUEVO
  ========================================================= */

  const openCreateModal = () => {
    setEditingResource(null);

    setSelectedFile(null);

    setForm(createInitialForm());

    setModalOpen(true);
  };

  /* =========================================================
     EDITAR
  ========================================================= */

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);

    setSelectedFile(null);

    setForm({
      title: resource.title,
      category: resource.category,
      description: resource.description ?? "",
      url: resource.url ?? "",
      tags: resource.tags.join(", "),
      favorite: resource.favorite,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingResource(null);

    setSelectedFile(null);

    setDragging(false);
  };

  /* =========================================================
     ARCHIVO
  ========================================================= */

  const handleFile = (file: File | null) => {
    if (!file) {
      return;
    }

    const maxSize = 15 * 1024 * 1024;

    if (file.size > maxSize) {
      showError("El archivo no puede superar los 15 MB.");

      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    handleFile(file);

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    setDragging(false);

    const file = event.dataTransfer.files?.[0] ?? null;

    handleFile(file);
  };

  /* =========================================================
     GUARDAR
  ========================================================= */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      showError("Escribe un nombre para el recurso.");

      return;
    }

    if (form.category === "ENLACE" && !form.url.trim()) {
      showError("Agrega el enlace del recurso.");

      return;
    }

    try {
      setSaving(true);

      setNotification(null);

      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),

        category: form.category,

        description: form.description.trim() || null,

        url: form.url.trim() || null,

        tags,

        favorite: form.favorite,
      };

      if (editingResource) {
        let updated = await updateResource(editingResource.id, payload);

        if (selectedFile) {
          updated = await replaceResourceFile(updated, selectedFile);
        }

        setResources((current) =>
          current.map((resource) =>
            resource.id === updated.id ? updated : resource,
          ),
        );

        setNotification({
          type: "success",
          message: "Recurso actualizado correctamente.",
        });
      } else {
        const created = await createResource(payload, selectedFile);

        setResources((current) => [created, ...current]);

        setNotification({
          type: "success",
          message: "Recurso creado correctamente.",
        });
      }

      setModalOpen(false);

      setEditingResource(null);

      setSelectedFile(null);
    } catch (error) {
      console.error("Error guardando recurso:", error);

      showError(getErrorMessage(error) || "No se pudo guardar el recurso.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     FAVORITO
  ========================================================= */

  const handleFavorite = async (resource: Resource) => {
    try {
      setProcessingId(resource.id);

      const updated = await toggleResourceFavorite(resource);

      setResources((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error("Error cambiando favorito:", error);

      showError(getErrorMessage(error) || "No se pudo actualizar el recurso.");
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================================================
     ABRIR
  ========================================================= */

  const handleOpen = async (resource: Resource) => {
    try {
      setProcessingId(resource.id);

      if (resource.file_path) {
        await openResourceFile(resource);

        return;
      }

      if (resource.url) {
        openResourceUrl(resource);

        return;
      }

      showError("Este recurso no tiene archivo ni enlace.");
    } catch (error) {
      console.error("Error abriendo recurso:", error);

      showError(getErrorMessage(error) || "No se pudo abrir el recurso.");
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================================================
     DESCARGAR
  ========================================================= */

  const handleDownload = async (resource: Resource) => {
    try {
      setProcessingId(resource.id);

      await downloadResourceFile(resource);
    } catch (error) {
      console.error("Error descargando archivo:", error);

      showError(getErrorMessage(error) || "No se pudo descargar el archivo.");
    } finally {
      setProcessingId(null);
    }
  };

  /* =========================================================
     ELIMINAR
  ========================================================= */

  const handleDelete = async (resource: Resource) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${resource.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(resource.id);

      setNotification(null);

      await deleteResource(resource);

      setResources((current) =>
        current.filter((item) => item.id !== resource.id),
      );

      setNotification({
        type: "success",
        message: "Recurso eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error eliminando recurso:", error);

      showError(getErrorMessage(error) || "No se pudo eliminar el recurso.");
    } finally {
      setDeletingId(null);
    }
  };

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
              Biblioteca de trabajo
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              Recursos
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Organiza documentos, proveedores, guías, requisitos, plantillas y
              enlaces útiles para tus viajes.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadResources()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#f0dddd] bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Actualizar
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5"
            >
              <FiPlus size={18} />
              Nuevo recurso
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
            title="Recursos"
            value={stats.total}
            description="Total guardados"
            icon={<FiBookOpen />}
          />

          <StatCard
            title="Favoritos"
            value={stats.favorites}
            description="Acceso rápido"
            icon={<FiStar />}
          />

          <StatCard
            title="Archivos"
            value={stats.files}
            description="Documentos almacenados"
            icon={<FiFileText />}
          />

          <StatCard
            title="Enlaces"
            value={stats.links}
            description="Herramientas externas"
            icon={<FiLink />}
          />
        </section>

        {/* CATEGORÍAS */}

        <section className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <CategoryButton
              active={categoryFilter === "TODOS"}
              label="Todos"
              count={resources.length}
              icon={<FiGrid />}
              onClick={() => setCategoryFilter("TODOS")}
            />

            {categories.map((category) => (
              <CategoryButton
                key={category.value}
                active={categoryFilter === category.value}
                label={category.label}
                count={
                  resources.filter(
                    (resource) => resource.category === category.value,
                  ).length
                }
                icon={<CategoryIcon category={category.value} />}
                onClick={() => setCategoryFilter(category.value)}
              />
            ))}
          </div>
        </section>

        {/* CONTENIDO */}

        <section className="overflow-hidden rounded-[24px] border border-[#f0dddd] bg-white shadow-[0_12px_45px_rgba(148,75,97,0.06)]">
          {/* TOOLBAR */}

          <div className="flex flex-col gap-3 border-b border-[#f5e5e5] p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar recursos, etiquetas, documentos..."
                className="h-11 w-full rounded-xl border border-[#f0dddd] bg-[#fffafa] pl-11 pr-4 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
            </div>

            <button
              type="button"
              onClick={() => setOnlyFavorites((current) => !current)}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-black transition ${
                onlyFavorites
                  ? "border-rose-300 bg-rose-50 text-rose-600"
                  : "border-[#f0dddd] bg-white text-slate-500 hover:bg-[#fffafa]"
              }`}
            >
              <FiStar className={onlyFavorites ? "fill-current" : ""} />
              Favoritos
            </button>

            <div className="relative">
              <FiFilter className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as CategoryFilter)
                }
                className="h-11 min-w-[170px] appearance-none rounded-xl border border-[#f0dddd] bg-white pl-10 pr-10 text-xs font-bold text-slate-600 outline-none"
              >
                <option value="TODOS">Todas las categorías</option>

                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex h-11 rounded-xl border border-[#f0dddd] bg-[#fffafa] p-1">
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`flex h-8 w-9 items-center justify-center rounded-lg transition ${
                  viewMode === "GRID"
                    ? "bg-white text-rose-500 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                <FiGrid />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("LIST")}
                className={`flex h-8 w-9 items-center justify-center rounded-lg transition ${
                  viewMode === "LIST"
                    ? "bg-white text-rose-500 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                <FiList />
              </button>
            </div>
          </div>

          {/* RESULT COUNT */}

          <div className="flex items-center justify-between border-b border-[#f5e5e5] bg-[#fffafa] px-5 py-3">
            <p className="text-xs font-semibold text-slate-500">
              {filteredResources.length}{" "}
              {filteredResources.length === 1 ? "recurso" : "recursos"}
            </p>

            {(search || categoryFilter !== "TODOS" || onlyFavorites) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");

                  setCategoryFilter("TODOS");

                  setOnlyFavorites(false);
                }}
                className="text-xs font-black text-rose-500"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* RESULTADOS */}

          {loading ? (
            <LoadingState />
          ) : filteredResources.length === 0 ? (
            <EmptyState
              hasFilters={
                Boolean(search) || categoryFilter !== "TODOS" || onlyFavorites
              }
              onCreate={openCreateModal}
            />
          ) : viewMode === "GRID" ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  processing={processingId === resource.id}
                  deleting={deletingId === resource.id}
                  onFavorite={() => void handleFavorite(resource)}
                  onOpen={() => void handleOpen(resource)}
                  onDownload={() => void handleDownload(resource)}
                  onEdit={() => openEditModal(resource)}
                  onDelete={() => void handleDelete(resource)}
                />
              ))}
            </div>
          ) : (
            <div>
              {filteredResources.map((resource) => (
                <ResourceListItem
                  key={resource.id}
                  resource={resource}
                  processing={processingId === resource.id}
                  deleting={deletingId === resource.id}
                  onFavorite={() => void handleFavorite(resource)}
                  onOpen={() => void handleOpen(resource)}
                  onDownload={() => void handleDownload(resource)}
                  onEdit={() => openEditModal(resource)}
                  onDelete={() => void handleDelete(resource)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#f0dddd] bg-white shadow-[0_30px_100px_rgba(75,35,48,0.25)]">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-[#f4e3e3] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-xl text-white shadow-lg shadow-rose-500/20">
                  <CategoryIcon category={form.category} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                    Biblioteca
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                    {editingResource ? "Editar recurso" : "Nuevo recurso"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Guarda información útil para reutilizarla en tus viajes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f0dddd] bg-[#fffafa] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(95vh-90px)] overflow-y-auto"
            >
              <div className="space-y-8 p-5 sm:p-7">
                {/* CATEGORÍA */}

                <FormSection
                  number="01"
                  title="Tipo de recurso"
                  description="Selecciona cómo quieres clasificarlo."
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {categories.map((category) => {
                      const active = form.category === category.value;

                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              category: category.value,
                            }))
                          }
                          className={`relative flex min-h-[100px] flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                            active
                              ? "border-rose-400 bg-rose-50 ring-2 ring-rose-100"
                              : "border-[#f0dddd] bg-white hover:border-rose-200 hover:bg-[#fffafa]"
                          }`}
                        >
                          {active && (
                            <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
                              <FiCheckCircle />
                            </div>
                          )}

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                              active
                                ? "bg-white text-rose-500 shadow-sm"
                                : "bg-[#fff7f7] text-slate-400"
                            }`}
                          >
                            <CategoryIcon category={category.value} />
                          </div>

                          <p className="mt-2 text-xs font-black text-slate-700">
                            {category.label}
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-400">
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </FormSection>

                {/* INFORMACIÓN */}

                <FormSection
                  number="02"
                  title="Información"
                  description="Identifica el recurso para encontrarlo fácilmente."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Nombre" required className="sm:col-span-2">
                      <input
                        value={form.title}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Ej. Requisitos para viajar a España"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Enlace" className="sm:col-span-2">
                      <div className="relative">
                        <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                          type="text"
                          value={form.url}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              url: event.target.value,
                            }))
                          }
                          placeholder="https://..."
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </Field>

                    <Field label="Etiquetas" className="sm:col-span-2">
                      <input
                        value={form.tags}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            tags: event.target.value,
                          }))
                        }
                        placeholder="España, visa, Europa"
                        className={inputClass}
                      />

                      <p className="mt-2 text-[10px] text-slate-400">
                        Separa las etiquetas usando comas.
                      </p>
                    </Field>

                    <Field label="Descripción" className="sm:col-span-2">
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Agrega información útil sobre este recurso..."
                        className="w-full resize-none rounded-2xl border border-[#f0dddd] bg-[#fffafa] px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                      />
                    </Field>
                  </div>
                </FormSection>

                {/* ARCHIVO */}

                <FormSection
                  number="03"
                  title="Archivo"
                  description="Adjunta un documento si este recurso lo necesita."
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={handleFileInput}
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-rose-500 shadow-sm">
                        <FileTypeIcon fileName={selectedFile.name} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-800">
                          {selectedFile.name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 transition hover:text-red-500"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          fileInputRef.current?.click();
                        }
                      }}
                      onDragEnter={(event) => {
                        event.preventDefault();

                        setDragging(true);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();

                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      className={`cursor-pointer rounded-[22px] border-2 border-dashed p-8 text-center transition ${
                        dragging
                          ? "border-rose-400 bg-rose-50"
                          : "border-[#efdcdc] bg-[#fffafa] hover:border-rose-300 hover:bg-rose-50/40"
                      }`}
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-rose-500 shadow-sm">
                        <FiUploadCloud />
                      </div>

                      <p className="mt-4 text-sm font-black text-slate-800">
                        Arrastra un archivo aquí
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        o haz clic para seleccionarlo
                      </p>

                      <p className="mt-4 text-[10px] font-semibold text-slate-400">
                        PDF, imágenes, Word, Excel, PowerPoint o TXT · Máximo 15
                        MB
                      </p>
                    </div>
                  )}

                  {editingResource?.file_name && !selectedFile && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#f0dddd] bg-white p-3">
                      <FiFileText className="shrink-0 text-rose-500" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-700">
                          Archivo actual
                        </p>

                        <p className="truncate text-[10px] text-slate-400">
                          {editingResource.file_name}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] font-black text-rose-500"
                      >
                        Reemplazar
                      </button>
                    </div>
                  )}
                </FormSection>

                {/* FAVORITO */}

                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      favorite: !current.favorite,
                    }))
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    form.favorite
                      ? "border-amber-200 bg-amber-50"
                      : "border-[#f0dddd] bg-[#fffafa]"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      form.favorite
                        ? "bg-white text-amber-500"
                        : "bg-white text-slate-400"
                    }`}
                  >
                    <FiStar className={form.favorite ? "fill-current" : ""} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800">
                      Marcar como favorito
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Aparecerá entre tus recursos de acceso rápido.
                    </p>
                  </div>

                  <div
                    className={`relative h-6 w-11 rounded-full transition ${
                      form.favorite ? "bg-rose-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        form.favorite ? "left-6" : "left-1"
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* FOOTER */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-[#f0dddd] bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
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
                  className="inline-flex min-w-[165px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />

                      {editingResource ? "Guardar cambios" : "Crear recurso"}
                    </>
                  )}
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
   RESOURCE CARD
========================================================= */

function ResourceCard({
  resource,
  processing,
  deleting,
  onFavorite,
  onOpen,
  onDownload,
  onEdit,
  onDelete,
}: {
  resource: Resource;
  processing: boolean;
  deleting: boolean;
  onFavorite: () => void;
  onOpen: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group flex min-h-[280px] flex-col rounded-[20px] border border-[#f0dddd] bg-white p-5 transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-[0_16px_40px_rgba(148,75,97,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${getCategoryStyle(
            resource.category,
          )}`}
        >
          {resource.file_name ? (
            <FileTypeIcon fileName={resource.file_name} />
          ) : (
            <CategoryIcon category={resource.category} />
          )}
        </div>

        <button
          type="button"
          onClick={onFavorite}
          disabled={processing}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            resource.favorite
              ? "bg-amber-50 text-amber-500"
              : "text-slate-300 hover:bg-amber-50 hover:text-amber-500"
          }`}
          title="Favorito"
        >
          <FiStar className={resource.favorite ? "fill-current" : ""} />
        </button>
      </div>

      <div className="mt-5">
        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-rose-500">
          {getCategoryLabel(resource.category)}
        </span>

        <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-900">
          {resource.title}
        </h3>

        <p className="mt-2 line-clamp-3 min-h-[54px] text-xs leading-5 text-slate-400">
          {resource.description || "Sin descripción."}
        </p>
      </div>

      {resource.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-[#fff5f5] px-2 py-1 text-[9px] font-bold text-rose-500"
            >
              {tag}
            </span>
          ))}

          {resource.tags.length > 3 && (
            <span className="rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-400">
              +{resource.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-5">
        {resource.file_name && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#fffafa] px-3 py-2">
            <FiFile className="shrink-0 text-rose-400" />

            <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-500">
              {resource.file_name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-[#f5e5e5] pt-3">
          {(resource.file_path || resource.url) && (
            <button
              type="button"
              onClick={onOpen}
              disabled={processing}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 text-[10px] font-black text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
            >
              {processing ? (
                <FiRefreshCw className="animate-spin" />
              ) : (
                <FiExternalLink />
              )}
              Abrir
            </button>
          )}

          {resource.file_path && (
            <button
              type="button"
              onClick={onDownload}
              disabled={processing}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fffafa] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
              title="Descargar"
            >
              <FiDownload />
            </button>
          )}

          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fffafa] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            title="Editar"
          >
            <FiEdit3 />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fffafa] text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            title="Eliminar"
          >
            {deleting ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 />}
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   LIST ITEM
========================================================= */

function ResourceListItem({
  resource,
  processing,
  deleting,
  onFavorite,
  onOpen,
  onDownload,
  onEdit,
  onDelete,
}: {
  resource: Resource;
  processing: boolean;
  deleting: boolean;
  onFavorite: () => void;
  onOpen: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex flex-col gap-4 border-b border-[#f5e5e5] p-5 transition last:border-0 hover:bg-[#fffafa] md:flex-row md:items-center">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg ${getCategoryStyle(
          resource.category,
        )}`}
      >
        {resource.file_name ? (
          <FileTypeIcon fileName={resource.file_name} />
        ) : (
          <CategoryIcon category={resource.category} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-black text-slate-800">
            {resource.title}
          </h3>

          <span className="rounded-lg bg-rose-50 px-2 py-1 text-[9px] font-black text-rose-500">
            {getCategoryLabel(resource.category)}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-xs text-slate-400">
          {resource.description ||
            resource.file_name ||
            resource.url ||
            "Sin descripción"}
        </p>

        {resource.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {resource.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[9px] font-bold text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onFavorite}
          disabled={processing}
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            resource.favorite
              ? "bg-amber-50 text-amber-500"
              : "text-slate-300 hover:bg-amber-50"
          }`}
        >
          <FiStar className={resource.favorite ? "fill-current" : ""} />
        </button>

        {(resource.file_path || resource.url) && (
          <button
            type="button"
            onClick={onOpen}
            disabled={processing}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"
            title="Abrir"
          >
            <FiExternalLink />
          </button>
        )}

        {resource.file_path && (
          <button
            type="button"
            onClick={onDownload}
            disabled={processing}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"
            title="Descargar"
          >
            <FiDownload />
          </button>
        )}

        <button
          type="button"
          onClick={onEdit}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"
        >
          <FiEdit3 />
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500"
        >
          {deleting ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 />}
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   COMPONENTES
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-[20px] border border-[#f0dddd] bg-white p-5 shadow-[0_8px_30px_rgba(148,75,97,0.05)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400">{title}</p>

          <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>

          <p className="mt-1 text-[11px] text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          {icon}
        </div>
      </div>
    </article>
  );
}

function CategoryButton({
  active,
  label,
  count,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[130px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? "border-rose-300 bg-rose-50 shadow-sm"
          : "border-[#f0dddd] bg-white hover:border-rose-200"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          active ? "bg-white text-rose-500" : "bg-[#fffafa] text-slate-400"
        }`}
      >
        {icon}
      </div>

      <div>
        <p
          className={`text-xs font-black ${
            active ? "text-rose-600" : "text-slate-700"
          }`}
        >
          {label}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          {count} {count === 1 ? "recurso" : "recursos"}
        </p>
      </div>
    </button>
  );
}

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

/* =========================================================
   ESTADOS
========================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <FiRefreshCw className="animate-spin text-xl" />
        </div>

        <p className="mt-4 text-sm font-black text-slate-700">
          Cargando recursos...
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
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-rose-50 text-2xl text-rose-400">
          <FiBookOpen />
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-900">
          {hasFilters ? "No encontramos recursos" : "Tu biblioteca está vacía"}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {hasFilters
            ? "Prueba cambiando la búsqueda o los filtros."
            : "Guarda documentos, enlaces, guías, proveedores y material que uses en tus viajes."}
        </p>

        {!hasFilters && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20"
          >
            <FiPlus />
            Crear primer recurso
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ICONOS
========================================================= */

function CategoryIcon({ category }: { category: ResourceCategory }) {
  switch (category) {
    case "DOCUMENTO":
      return <FiFileText />;

    case "GUIA":
      return <FiBookOpen />;

    case "PLANTILLA":
      return <FiGrid />;

    case "PROVEEDOR":
      return <FiGlobe />;

    case "REQUISITO":
      return <FiFile />;

    case "SEGURO":
      return <FiShield />;

    case "ENLACE":
      return <FiLink />;

    default:
      return <FiMoreHorizontal />;
  }
}

function FileTypeIcon({ fileName }: { fileName: string }) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "pdf") {
    return <FaRegFilePdf />;
  }

  if (extension === "doc" || extension === "docx") {
    return <FaRegFileWord />;
  }

  if (extension === "xls" || extension === "xlsx") {
    return <FaRegFileExcel />;
  }

  if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return <FiImage />;
  }

  return <FiFileText />;
}

/* =========================================================
   HELPERS
========================================================= */

function createInitialForm(): ResourceForm {
  return {
    title: "",
    category: "DOCUMENTO",
    description: "",
    url: "",
    tags: "",
    favorite: false,
  };
}

function getCategoryLabel(category: ResourceCategory) {
  const labels: Record<ResourceCategory, string> = {
    DOCUMENTO: "Documento",
    GUIA: "Guía",
    PLANTILLA: "Plantilla",
    PROVEEDOR: "Proveedor",
    REQUISITO: "Requisito",
    SEGURO: "Seguro",
    ENLACE: "Enlace",
    OTRO: "Otro",
  };

  return labels[category];
}

function getCategoryStyle(category: ResourceCategory) {
  const styles: Record<ResourceCategory, string> = {
    DOCUMENTO: "bg-rose-50 text-rose-600",

    GUIA: "bg-sky-50 text-sky-600",

    PLANTILLA: "bg-violet-50 text-violet-600",

    PROVEEDOR: "bg-amber-50 text-amber-600",

    REQUISITO: "bg-emerald-50 text-emerald-600",

    SEGURO: "bg-indigo-50 text-indigo-600",

    ENLACE: "bg-cyan-50 text-cyan-600",

    OTRO: "bg-slate-100 text-slate-600",
  };

  return styles[category];
}

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getErrorMessage(error: unknown): string {
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

  return "Ocurrió un error inesperado.";
}
