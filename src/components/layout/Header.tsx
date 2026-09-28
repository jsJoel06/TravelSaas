import { useEffect, useId, useRef, useState } from "react";

import {
  FaBars,
  FaRegBell,
  FaChevronDown,
  FaSignOutAlt,
  FaCog,
  FaSearch,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface HeaderProps {
  onMenuClick: () => void;
}

type Panel = "search" | "notifications" | "profile" | null;

const sections = [
  {
    title: "Inicio",
    path: "/dashboard",
    keywords: "panel dashboard",
  },
  {
    title: "Mis clientes",
    path: "/clientes",
    keywords: "contactos viajeros",
  },
  {
    title: "Itinerarios",
    path: "/itinerarios",
    keywords: "viajes propuestas",
  },
  {
    title: "Crear itinerario",
    path: "/itinerarios/ia",
    keywords: "nia asistente nuevo propuesta",
  },
  {
    title: "Agenda",
    path: "/agenda",
    keywords: "calendario citas",
  },
  {
    title: "Reservas",
    path: "/reservas",
    keywords: "reservaciones",
  },
  {
    title: "Recursos",
    path: "/recursos",
    keywords: "materiales documentos",
  },
  {
    title: "Configuración",
    path: "/configuracion",
    keywords: "cuenta ajustes perfil",
  },
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const focusStyle =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd456c]";

const panelStyle =
  "fixed left-4 right-4 top-[88px] max-h-[calc(100dvh-104px)] overflow-y-auto rounded-2xl border border-[#ecdde2] bg-[#fffcfa] shadow-[0_16px_45px_-12px_rgba(95,50,68,0.22)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[340px]";

function pageTitle(path: string) {
  if (path === "/itinerarios/nuevo") {
    return "Crear itinerario";
  }

  const section = [...sections]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => path === item.path || path.startsWith(`${item.path}/`));

  if (section) {
    return section.path === "/itinerarios" && path !== section.path
      ? "Detalle del itinerario"
      : section.title;
  }

  if (path.startsWith("/destinos")) {
    return "Destinos";
  }

  if (path.startsWith("/plantillas")) {
    return "Plantillas";
  }

  return "Travel SaaS";
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  // =========================================================
  // ESTADOS
  // =========================================================

  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  const [logoutError, setLogoutError] = useState("");

  const [welcomeRead, setWelcomeRead] = useState(false);

  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [avatarLoading, setAvatarLoading] = useState(true);

  // =========================================================
  // REFERENCIAS
  // =========================================================

  const searchRef = useRef<HTMLDivElement>(null);

  const notificationRef = useRef<HTMLDivElement>(null);

  const profileRef = useRef<HTMLDivElement>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const id = useId();

  // =========================================================
  // INFORMACIÓN DEL USUARIO
  // =========================================================

  const metadataName = user?.user_metadata?.full_name;

  const nombre =
    (typeof metadataName === "string" && metadataName.trim()) ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const inicial = nombre.charAt(0).toUpperCase();

  const email = user?.email || "";

  const unreadCount = !welcomeRead && !welcomeDismissed ? 1 : 0;

  const results = sections.filter((item) =>
    normalize(`${item.title} ${item.keywords}`).includes(normalize(query)),
  );

  // =========================================================
  // CARGAR FOTO DE PERFIL
  // =========================================================

  useEffect(() => {
    let active = true;

    const cargarAvatar = async () => {
      if (active) {
        setAvatarLoading(true);
      }

      try {
        // Obtener el usuario directamente desde Supabase
        // para tener metadata actualizado.
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!currentUser) {
          if (active) {
            setAvatarUrl(null);
          }

          return;
        }

        const metadata = currentUser.user_metadata ?? {};

        const avatarPath =
          typeof metadata.avatar_path === "string" &&
          metadata.avatar_path.trim()
            ? metadata.avatar_path.trim()
            : null;

        const metadataAvatarUrl =
          typeof metadata.avatar_url === "string" && metadata.avatar_url.trim()
            ? metadata.avatar_url.trim()
            : null;

        // =============================================
        // 1. FOTO GUARDADA EN STORAGE
        // =============================================

        if (avatarPath) {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("avatars")
              .createSignedUrl(avatarPath, 60 * 60);

          if (signedError) {
            throw signedError;
          }

          if (active) {
            setAvatarUrl(signedData.signedUrl);
          }

          return;
        }

        // =============================================
        // 2. FOTO MEDIANTE URL
        // =============================================

        if (metadataAvatarUrl) {
          if (active) {
            setAvatarUrl(metadataAvatarUrl);
          }

          return;
        }

        // =============================================
        // 3. NO HAY FOTO
        // =============================================

        if (active) {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error("Error cargando la foto de perfil:", error);

        if (active) {
          setAvatarUrl(null);
        }
      } finally {
        if (active) {
          setAvatarLoading(false);
        }
      }
    };

    void cargarAvatar();

    // Escuchar cambios del usuario.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "USER_UPDATED" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        void cargarAvatar();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // =========================================================
  // CERRAR PANELES AL CAMBIAR RUTA
  // =========================================================

  useEffect(() => {
    setPanel(null);
    setQuery("");
  }, [pathname]);

  // =========================================================
  // REINICIAR NOTIFICACIONES AL CAMBIAR USUARIO
  // =========================================================

  useEffect(() => {
    setWelcomeRead(false);
    setWelcomeDismissed(false);
    setLogoutError("");
  }, [email]);

  // =========================================================
  // CERRAR PANELES AL HACER CLICK FUERA
  // =========================================================

  useEffect(() => {
    const closeOutside = (event: PointerEvent | FocusEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      const activeRef =
        panel === "search"
          ? searchRef
          : panel === "notifications"
            ? notificationRef
            : profileRef;

      if (!activeRef.current?.contains(event.target)) {
        setPanel(null);
      }
    };

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !panel) {
        return;
      }

      event.preventDefault();

      if (panel === "search") {
        searchInputRef.current?.focus();
      }

      if (panel === "notifications") {
        notificationButtonRef.current?.focus();
      }

      if (panel === "profile") {
        profileButtonRef.current?.focus();
      }

      setPanel(null);
    };

    document.addEventListener("pointerdown", closeOutside);

    document.addEventListener("focusin", closeOutside);

    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);

      document.removeEventListener("focusin", closeOutside);

      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [panel]);

  // =========================================================
  // NAVEGACIÓN
  // =========================================================

  const goTo = (path: string) => {
    setPanel(null);
    setQuery("");
    navigate(path);
  };

  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      setPanel(null);
    } catch {
      setLogoutError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setLoggingOut(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <header className="sticky top-0 z-30 h-20 border-b border-[#eee2e4] bg-[#fffcfa]/95 text-[#382e33] backdrop-blur-xl">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
        {/* =====================================================
            BOTÓN MENÚ MÓVIL
        ===================================================== */}

        <button
          type="button"
          onClick={() => {
            setPanel(null);
            onMenuClick();
          }}
          aria-label="Abrir menú principal"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#efdee4] text-[#946077] hover:bg-[#fae9ee] lg:hidden ${focusStyle}`}
        >
          <FaBars aria-hidden="true" />
        </button>

        {/* =====================================================
            BUSCADOR
        ===================================================== */}

        <div
          ref={searchRef}
          className="relative min-w-0 flex-1 lg:max-w-[540px]"
        >
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();

              if (results.length) {
                goTo(results[0].path);
              }
            }}
          >
            <label htmlFor={`${id}-search`} className="sr-only">
              Buscar una sección de la agencia
            </label>

            <div className="flex h-10 items-center gap-2 rounded-full border border-[#eadfe2] bg-[#f7f1f2] px-3 transition-colors focus-within:border-[#c8839b] focus-within:bg-white sm:px-4">
              <FaSearch
                aria-hidden="true"
                className="shrink-0 text-xs text-[#9e8490]"
              />

              <input
                ref={searchInputRef}
                id={`${id}-search`}
                type="search"
                value={query}
                onFocus={() => setPanel("search")}
                onClick={() => setPanel("search")}
                onChange={(event) => {
                  setQuery(event.target.value);

                  setPanel("search");
                }}
                autoComplete="off"
                placeholder="Buscar secciones…"
                aria-controls={panel === "search" ? `${id}-results` : undefined}
                className="w-full min-w-0 bg-transparent text-xs text-[#604c55] outline-none placeholder:text-[#9a8590] sm:text-[13px]"
              />
            </div>
          </form>

          {panel === "search" && (
            <div
              id={`${id}-results`}
              className={`${panelStyle} sm:left-0 sm:right-auto sm:w-full sm:min-w-[280px]`}
            >
              <div className="border-b border-[#f0e6e9] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#987685]">
                Ir a una sección
              </div>

              {results.length ? (
                <ul className="p-2">
                  {results.map((item) => (
                    <li key={item.path}>
                      <button
                        type="button"
                        onClick={() => goTo(item.path)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm text-[#715661] hover:bg-[#fae9ee] ${focusStyle}`}
                      >
                        {item.title}

                        <FaArrowRight
                          aria-hidden="true"
                          size={10}
                          className="text-[#b8748d]"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p role="status" className="px-5 py-6 text-sm text-[#8b727d]">
                  No encontramos esa sección.
                </p>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            PARTE DERECHA
        ===================================================== */}

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {/* ===================================================
              NOTIFICACIONES
          =================================================== */}

          <div ref={notificationRef} className="relative">
            <button
              ref={notificationButtonRef}
              type="button"
              onClick={() =>
                setPanel(panel === "notifications" ? null : "notifications")
              }
              aria-label={`Notificaciones${unreadCount ? ", 1 sin leer" : ""}`}
              aria-expanded={panel === "notifications"}
              aria-controls={
                panel === "notifications" ? `${id}-notifications` : undefined
              }
              className={`relative flex h-10 w-10 items-center justify-center rounded-full text-[#89727d] hover:bg-[#faedf1] ${
                panel === "notifications" ? "bg-[#faedf1] text-[#b44d70]" : ""
              } ${focusStyle}`}
            >
              <FaRegBell aria-hidden="true" size={18} />

              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#fffcfa] bg-[#bd456c]"
                />
              )}
            </button>

            {panel === "notifications" && (
              <section
                id={`${id}-notifications`}
                aria-label="Notificaciones"
                className={panelStyle}
              >
                <div className="flex items-center justify-between border-b border-[#f0e6e9] px-5 py-4">
                  <h2 className="font-serif text-lg">Notificaciones</h2>

                  <button
                    type="button"
                    aria-label="Cerrar notificaciones"
                    onClick={() => {
                      notificationButtonRef.current?.focus();
                      setPanel(null);
                    }}
                    className={`rounded-lg p-2 text-[#967482] hover:bg-[#faedf1] ${focusStyle}`}
                  >
                    <FaTimes aria-hidden="true" size={11} />
                  </button>
                </div>

                {welcomeDismissed ? (
                  <div className="px-5 py-9 text-center">
                    <FaRegBell
                      aria-hidden="true"
                      className="mx-auto mb-3 text-2xl text-[#c99bac]"
                    />

                    <p className="text-sm text-[#715661]">
                      No tienes notificaciones.
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <button
                      type="button"
                      onClick={() => setWelcomeRead(true)}
                      className={`w-full rounded-xl p-4 text-left ${
                        welcomeRead ? "bg-[#f8f3f1]" : "bg-[#faedf1]"
                      } ${focusStyle}`}
                    >
                      <span className="block text-sm font-semibold text-[#744c5c]">
                        Bienvenido a Travel SaaS
                      </span>

                      <span className="mt-2 block text-xs leading-6 text-[#8b727d]">
                        Tu espacio para organizar clientes y preparar propuestas
                        de viaje.
                      </span>

                      <span className="mt-2 block text-[10px] text-[#a05974]">
                        {welcomeRead ? "Leída" : "Marcar como leída"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWelcomeDismissed(true)}
                      className={`mt-3 rounded-lg px-2 py-2 text-xs text-[#967482] hover:text-[#a43d60] ${focusStyle}`}
                    >
                      Limpiar notificaciones
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="hidden h-8 w-px bg-[#eee2e4] sm:block" />

          {/* ===================================================
              PERFIL
          =================================================== */}

          <div ref={profileRef} className="relative">
            <button
              ref={profileButtonRef}
              type="button"
              onClick={() => setPanel(panel === "profile" ? null : "profile")}
              aria-label={`Abrir opciones de cuenta de ${nombre}`}
              aria-expanded={panel === "profile"}
              aria-controls={panel === "profile" ? `${id}-profile` : undefined}
              className={`flex items-center gap-3 rounded-xl p-1.5 hover:bg-[#faedf1] ${
                panel === "profile" ? "bg-[#faedf1]" : ""
              } ${focusStyle}`}
            >
              {/* ===============================================
                  FOTO DE PERFIL
              =============================================== */}

              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ebcfd9] bg-[#f6dfe7] font-serif text-lg font-semibold text-[#a34868]"
              >
                {avatarLoading ? (
                  <span className="h-4 w-4 animate-pulse rounded-full bg-[#e8cbd5]" />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => {
                      console.error("No se pudo mostrar la imagen del avatar.");

                      setAvatarUrl(null);
                    }}
                  />
                ) : (
                  inicial
                )}
              </span>

              <span className="hidden max-w-[160px] text-left md:block">
                <span className="block truncate text-xs font-semibold">
                  Hola, {nombre}
                </span>

                <span className="mt-1 block text-[10px] text-[#99838d]">
                  Agente de viajes
                </span>
              </span>

              <FaChevronDown
                aria-hidden="true"
                size={9}
                className={`hidden text-[#9b7b89] transition-transform md:block ${
                  panel === "profile" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* =================================================
                PANEL DE PERFIL
            ================================================= */}

            {panel === "profile" && (
              <section
                id={`${id}-profile`}
                aria-label="Opciones de cuenta"
                className={panelStyle}
              >
                {/* =============================================
                    INFORMACIÓN DEL USUARIO
                ============================================= */}

                <div className="border-b border-[#efdee4] bg-[#faedf1] px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ebcfd9] bg-[#f6dfe7] font-serif text-xl font-semibold text-[#a34868]">
                      {avatarLoading ? (
                        <span className="h-5 w-5 animate-pulse rounded-full bg-[#e8cbd5]" />
                      ) : avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`Foto de ${nombre}`}
                          className="h-full w-full object-cover"
                          onError={() => setAvatarUrl(null)}
                        />
                      ) : (
                        inicial
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-serif text-lg text-[#68424f]">
                        {nombre}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#95717f]">
                        {email || "Cuenta de usuario"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-[10px] text-[#a05974]">
                    {pageTitle(pathname)}
                  </p>
                </div>

                {/* =============================================
                    OPCIONES
                ============================================= */}

                <div className="space-y-1 p-2">
                  <button
                    type="button"
                    onClick={() => goTo("/configuracion")}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#785763] hover:bg-[#faedf1] ${focusStyle}`}
                  >
                    <FaCog aria-hidden="true" />
                    Configuración
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    aria-busy={loggingOut}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#a43d60] hover:bg-[#faedf1] disabled:cursor-wait disabled:opacity-60 ${focusStyle}`}
                  >
                    <FaSignOutAlt aria-hidden="true" />

                    {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                  </button>

                  {logoutError && (
                    <p
                      role="alert"
                      className="rounded-lg bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800"
                    >
                      {logoutError}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
