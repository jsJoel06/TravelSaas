import { useEffect, useRef, useState } from "react";
import {
  FaChartPie,
  FaMapMarkedAlt,
  FaUsers,
  FaCalendarAlt,
  FaPlusCircle,
  FaRegCalendarCheck,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaPlaneDeparture,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: "Inicio", path: "/dashboard", icon: FaChartPie },
  { name: "Mis clientes", path: "/clientes", icon: FaUsers },
  { name: "Itinerarios", path: "/itinerarios", icon: FaMapMarkedAlt },
  { name: "Crear itinerario", path: "/itinerarios/ia", icon: FaPlusCircle },
  { name: "Agenda", path: "/agenda", icon: FaCalendarAlt },
  { name: "Reservas", path: "/reservas", icon: FaRegCalendarCheck },
  { name: "Recursos", path: "/recursos", icon: FaFileAlt },
  { name: "Configuración", path: "/configuracion", icon: FaCog },
];

const focusStyle =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd456c]";

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const sidebarRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const niaActive =
    pathname === "/itinerarios/ia" || pathname.startsWith("/itinerarios/ia/");

  // El menú móvil admite Escape, mantiene el foco dentro y lo devuelve al cerrar.
  useEffect(() => {
    if (!mobileOpen) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    if (desktop.matches) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (desktop.matches) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const handleResize = () => {
      if (desktop.matches) {
        document.body.style.overflow = previousOverflow;
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleResize);
      if (
        previousFocus?.isConnected &&
        previousFocus.getClientRects().length > 0
      )
        previousFocus.focus();
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      onClose();
    } catch {
      setLogoutError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#382e33]/30 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        ref={sidebarRef}
        aria-label="Menú principal"
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-64 max-w-[90vw] flex-col border-r border-[#eee2e4] bg-[#fffcfa] text-[#382e33] shadow-[4px_0_24px_rgba(100,60,75,0.025)] transition-[transform,visibility] duration-300 motion-reduce:transition-none lg:visible lg:translate-x-0 ${mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"}`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between gap-2 border-b border-[#f0e6e8] px-5">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={`flex min-w-0 items-center gap-3 rounded-lg ${focusStyle}`}
            aria-label="Travel SaaS, ir al inicio"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fae9ee] text-xl text-[#bd456c]">
              <FaPlaneDeparture aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">
                Travel SaaS
              </span>
              <span className="mt-0.5 block text-[10px] text-[#8c7781]">
                Tu viaje, en tus manos
              </span>
            </span>
          </NavLink>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8b6373] hover:bg-[#fae9ee] lg:hidden ${focusStyle}`}
          >
            <FaTimes aria-hidden="true" size={13} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-6">
          <nav aria-label="Herramientas de viajes">
            <p className="mb-3 px-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9c7c89]">
              Mi agencia
            </p>
            <div className="space-y-1.5">
              {menuItems.map(({ name, path, icon: Icon }) => {
                const active =
                  (pathname === path || pathname.startsWith(`${path}/`)) &&
                  !(path === "/itinerarios" && niaActive);
                return (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={onClose}
                    aria-current={active ? "page" : false}
                    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] transition-colors ${focusStyle} ${active ? "bg-[#f9e3ea] font-semibold text-[#a43d60]" : "font-medium text-[#796770] hover:bg-[#fcf0f3] hover:text-[#a43d60]"}`}
                  >
                    <Icon
                      aria-hidden="true"
                      className={`shrink-0 text-[15px] ${active ? "text-[#b84c70]" : "text-[#9a818c] group-hover:text-[#b84c70]"}`}
                    />
                    <span className="flex-1">{name}</span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-[#c3577a]"
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
          <p className="px-5 pb-1 pt-7 text-center font-serif text-sm italic leading-6 text-[#a0808c]">
            Crea, personaliza
            <br />y acompaña cada viaje.
          </p>
        </div>

        <div className="shrink-0 border-t border-[#f0e6e8] p-3">
          {logoutError && (
            <p
              role="alert"
              className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800"
            >
              {logoutError}
            </p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium text-[#896e79] transition-colors hover:bg-[#fae9ee] hover:text-[#a43d60] disabled:cursor-wait disabled:opacity-60 ${focusStyle}`}
          >
            <FaSignOutAlt aria-hidden="true" className="shrink-0 text-[15px]" />
            <span className="flex-1 text-left">
              {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </span>
            <FaChevronRight
              aria-hidden="true"
              size={9}
              className="text-[#b998a6]"
            />
          </button>
        </div>
      </aside>
    </>
  );
}
