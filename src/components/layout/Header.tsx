import { useEffect, useRef, useState } from "react";
import {
  FaBars,
  FaBell,
  FaChevronDown,
  FaSignOutAlt,
  FaCog,
  FaPlaneDeparture,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Bienvenido a Travel SaaS",
      message:
        "Ya puedes comenzar a gestionar tus clientes y propuestas.",
      time: "Ahora",
      unread: true,
    },
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const nombre =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const email = user?.email || "";

  const inicial =
    nombre
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  /* =========================================================
     PAGE TITLE
  ========================================================= */

  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/dashboard") {
      return {
        eyebrow: "Panel de control",
        title: "Gestiona tus viajes",
      };
    }

    if (path.startsWith("/itinerarios/ia")) {
      return {
        eyebrow: "Inteligencia artificial",
        title: "Copiloto inteligente NIA",
      };
    }

    if (path.startsWith("/itinerarios/nuevo")) {
      return {
        eyebrow: "Planificación",
        title: "Nuevo itinerario",
      };
    }

    if (path.startsWith("/itinerarios/")) {
      return {
        eyebrow: "Planificación",
        title: "Detalle del itinerario",
      };
    }

    if (path === "/itinerarios") {
      return {
        eyebrow: "Planificación",
        title: "Mis itinerarios",
      };
    }

    if (path.startsWith("/clientes")) {
      return {
        eyebrow: "Gestión",
        title: "Clientes",
      };
    }

    if (path.startsWith("/destinos")) {
      return {
        eyebrow: "Catálogo",
        title: "Destinos",
      };
    }

    if (path.startsWith("/plantillas")) {
      return {
        eyebrow: "Organización",
        title: "Plantillas",
      };
    }

    if (path.startsWith("/configuracion")) {
      return {
        eyebrow: "Sistema",
        title: "Configuración",
      };
    }

    return {
      eyebrow: "Travel SaaS",
      title: "Gestiona tus viajes",
    };
  };

  const pageInfo = getPageInfo();

  /* =========================================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     ACTIONS
  ========================================================= */

  const toggleNotifications = () => {
    setNotificationsOpen((current) => !current);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((current) => !current);
    setNotificationsOpen(false);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    setNotificationsOpen(false);
  };

  const goToSettings = () => {
    setProfileOpen(false);
    navigate("/configuracion");
  };

  const handleLogout = async () => {
    setProfileOpen(false);

    try {
      /*
       * Si tu AuthContext ya tiene una función logout,
       * puedes conectarla aquí.
       *
       * Por ahora no se fuerza un cierre de sesión para
       * no romper el contexto actual.
       */
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-20 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_10px_rgba(15,23,42,0.04)]">

      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            LEFT
        ====================================================== */}

        <div className="flex items-center gap-4 min-w-0">

          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 flex items-center justify-center transition-all"
            aria-label="Abrir menú"
          >
            <FaBars />
          </button>

          {/* Page context */}
          <div className="min-w-0">

            <div className="flex items-center gap-2 mb-0.5">

              <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-cyan-500" />

              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 truncate">
                {pageInfo.eyebrow}
              </p>

            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
              {pageInfo.title}
            </h2>

          </div>

        </div>

        {/* =====================================================
            RIGHT
        ====================================================== */}

        <div className="flex items-center gap-2 sm:gap-3 ml-4">

          {/* =================================================
              NIA QUICK ACCESS
          ================================================== */}

          <button
            type="button"
            onClick={() => navigate("/itinerarios/ia")}
            className="hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 text-blue-700 hover:from-blue-100 hover:to-cyan-100 transition-all group"
            title="Abrir NIA"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-sm">
              <FaPlaneDeparture className="text-xs" />
            </span>

            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-500">
                NIA
              </p>
              <p className="text-xs font-bold text-slate-700">
                Crear propuesta
              </p>
            </div>
          </button>

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          <div
            ref={notificationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={toggleNotifications}
              className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all border ${
                notificationsOpen
                  ? "bg-blue-50 border-blue-100 text-blue-600"
                  : "bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              }`}
              aria-label="Notificaciones"
              aria-expanded={notificationsOpen}
            >
              <FaBell className="text-[15px] sm:text-base" />

              {unreadCount > 0 && (
                <>
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 border-2 border-white" />

                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* Notification dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden">

                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

                  <div>
                    <h3 className="font-black text-slate-900">
                      Notificaciones
                    </h3>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {unreadCount > 0
                        ? `${unreadCount} pendiente${
                            unreadCount > 1 ? "s" : ""
                          }`
                        : "Todo al día"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Marcar leídas
                    </button>
                  )}

                </div>

                {/* Notifications */}
                <div className="max-h-[320px] overflow-y-auto">

                  {notifications.length === 0 ? (
                    <div className="py-12 px-6 text-center">

                      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                        <FaBell className="text-slate-300" />
                      </div>

                      <p className="font-bold text-slate-700 text-sm">
                        No tienes notificaciones
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Aquí aparecerán novedades de tu espacio.
                      </p>

                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() =>
                          markNotificationAsRead(
                            notification.id
                          )
                        }
                        className={`w-full text-left px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition ${
                          notification.unread
                            ? "bg-blue-50/40"
                            : "bg-white"
                        }`}
                      >

                        <div className="flex gap-3">

                          <div className="relative shrink-0">

                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center">
                              <FaBell className="text-xs" />
                            </div>

                            {notification.unread && (
                              <span className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <p className="text-sm font-bold text-slate-800">
                                {notification.title}
                              </p>

                              {notification.unread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                              )}

                            </div>

                            <p className="text-xs text-slate-500 mt-1 leading-5">
                              {notification.message}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-2">
                              {notification.time}
                            </p>

                          </div>

                        </div>

                      </button>
                    ))
                  )}

                </div>

                {notifications.length > 0 && (
                  <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={clearNotifications}
                      className="text-xs font-semibold text-slate-400 hover:text-red-500 transition"
                    >
                      Limpiar notificaciones
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-9 w-px bg-slate-200" />

          {/* =================================================
              PROFILE
          ================================================== */}

          <div
            ref={profileRef}
            className="relative"
          >

            <button
              type="button"
              onClick={toggleProfile}
              className={`flex items-center gap-2 sm:gap-3 rounded-xl px-1.5 sm:px-2 py-1.5 transition-all ${
                profileOpen
                  ? "bg-slate-50"
                  : "hover:bg-slate-50"
              }`}
              aria-expanded={profileOpen}
            >

              {/* Avatar */}
              <div className="relative">

                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-sm">
                  {inicial}
                </div>

                <span className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />

              </div>

              {/* User data */}
              <div className="hidden md:block text-left max-w-[150px]">

                <p className="text-sm font-bold text-slate-800 truncate">
                  {nombre}
                </p>

                <p className="text-[11px] text-slate-400 truncate">
                  Agente de viajes
                </p>

              </div>

              <FaChevronDown
                className={`hidden md:block text-[10px] text-slate-400 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />

            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[290px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden">

                {/* Profile summary */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#12356b] to-[#087e9d] px-5 py-5">

                  <div className="absolute -right-8 -top-12 w-28 h-28 rounded-full bg-cyan-400/20 blur-2xl" />

                  <div className="relative flex items-center gap-3">

                    <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-black text-lg">
                      {inicial}
                    </div>

                    <div className="min-w-0">

                      <p className="text-sm font-black text-white truncate">
                        {nombre}
                      </p>

                      <p className="text-xs text-cyan-100/70 truncate mt-0.5">
                        {email || "Cuenta de usuario"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* Menu */}
                <div className="p-2">

                  <button
                    type="button"
                    onClick={goToSettings}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-slate-50 transition group"
                  >

                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition">
                      <FaCog className="text-sm" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Configuración
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Preferencias de tu cuenta
                      </p>
                    </div>

                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-red-50 transition group"
                  >

                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 group-hover:bg-red-100 flex items-center justify-center transition">
                      <FaSignOutAlt className="text-sm" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-red-600">
                        Cerrar sesión
                      </p>

                      <p className="text-[11px] text-slate-400">
                        Salir de tu cuenta
                      </p>
                    </div>

                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
