import {
  FaChartPie,
  FaMapMarkedAlt,
  FaUsers,
  FaGlobeAmericas,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaPlaneDeparture,
  FaChevronRight,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: FaChartPie,
  },
  {
    name: "Mis itinerarios",
    path: "/itinerarios",
    icon: FaMapMarkedAlt,
  },
  {
    name: "Clientes",
    path: "/clientes",
    icon: FaUsers,
  },
  {
    name: "Destinos",
    path: "/destinos",
    icon: FaGlobeAmericas,
  },
  {
    name: "Plantillas",
    path: "/plantillas",
    icon: FaFileAlt,
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Overlay para móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-64 flex-col
          border-r border-slate-200
          bg-white
          shadow-[4px_0_20px_rgba(15,23,42,0.04)]
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl
                bg-gradient-to-br from-blue-600 to-cyan-400
                shadow-md shadow-blue-500/20
              "
            >
              <FaPlaneDeparture className="text-white" />
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-900">
                Travel SaaS
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Gestión de viajes
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Principal
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3
                    rounded-xl
                    px-3 py-2.5
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 h-6 w-1 rounded-r-full bg-blue-600" />
                      )}

                      <span
                        className={`
                          flex h-9 w-9 shrink-0 items-center justify-center
                          rounded-lg
                          ${
                            isActive
                              ? "bg-white text-blue-600 shadow-sm"
                              : "bg-slate-50 text-slate-400 group-hover:text-blue-500"
                          }
                        `}
                      >
                        <Icon className="text-sm" />
                      </span>

                      <span className="flex-1">
                        {item.name}
                      </span>

                      <FaChevronRight
                        className={`
                          text-[8px]
                          ${
                            isActive
                              ? "text-blue-400"
                              : "text-slate-300 opacity-0 group-hover:opacity-100"
                          }
                        `}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* NIA */}
          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Inteligencia
            </p>

            <NavLink
              to="/itinerarios/ia"
              onClick={onClose}
              className={({ isActive }) =>
                `
                block rounded-2xl border p-4
                transition-all duration-200
                ${
                  isActive
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/50"
                }
                `
              }
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-xl
                    bg-gradient-to-br from-blue-600 to-cyan-400
                  "
                >
                  <span className="text-xs font-black text-white">
                    N
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      NIA
                    </span>

                    <span className="rounded-full bg-cyan-50 px-1.5 py-0.5 text-[8px] font-bold text-cyan-600">
                      IA
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                    Copiloto inteligente para tus propuestas de viaje.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-[9px] font-medium text-slate-400">
                  Preparar propuesta
                </span>

                <FaChevronRight className="text-[8px] text-blue-500" />
              </div>
            </NavLink>
          </div>

          {/* Cuenta */}
          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cuenta
            </p>

            <NavLink
              to="/configuracion"
              onClick={onClose}
              className={({ isActive }) =>
                `
                group flex items-center gap-3
                rounded-xl
                px-3 py-2.5
                text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
                `
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`
                      flex h-9 w-9 items-center justify-center
                      rounded-lg
                      ${
                        isActive
                          ? "bg-white text-blue-600 shadow-sm"
                          : "bg-slate-50 text-slate-400 group-hover:text-blue-500"
                      }
                    `}
                  >
                    <FaCog className="text-sm" />
                  </span>

                  <span className="flex-1">
                    Configuración
                  </span>

                  <FaChevronRight
                    className={`
                      text-[8px]
                      ${
                        isActive
                          ? "text-blue-400"
                          : "text-slate-300 opacity-0 group-hover:opacity-100"
                      }
                    `}
                  />
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* Cerrar sesión */}
        <div className="shrink-0 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="
              group flex w-full items-center gap-3
              rounded-xl
              px-3 py-2.5
              text-sm font-medium
              text-slate-500
              transition-all duration-200
              hover:bg-red-50
              hover:text-red-600
            "
          >
            <span
              className="
                flex h-9 w-9 items-center justify-center
                rounded-lg
                bg-slate-50
                text-slate-400
                group-hover:bg-red-50
                group-hover:text-red-500
              "
            >
              <FaSignOutAlt className="text-sm" />
            </span>

            <span className="flex-1 text-left">
              Cerrar sesión
            </span>

            <FaChevronRight className="text-[8px] text-slate-300 group-hover:text-red-400" />
          </button>
        </div>
      </aside>
    </>
  );
}

