import { useState, type ReactNode } from "react";

import {
  FiBell,
  FiBriefcase,
  FiCheck,
  FiChevronRight,
  FiFileText,
  FiLock,
  FiSave,
  FiSettings,
  FiShield,
  FiSliders,
  FiUser,
  FiZap,
} from "react-icons/fi";

type SectionId =
  | "agencia"
  | "preferencias"
  | "itinerarios"
  | "plantillas"
  | "nia"
  | "cuenta"
  | "seguridad";

type SettingItem = {
  id: SectionId;
  label: string;
  description: string;
  icon: ReactNode;
};

const sections: {
  title: string;
  items: SettingItem[];
}[] = [
  {
    title: "General",
    items: [
      {
        id: "agencia",
        label: "Agencia",
        description: "Información de tu agencia",
        icon: <FiBriefcase />,
      },
      {
        id: "preferencias",
        label: "Preferencias",
        description: "Idioma, moneda y formato",
        icon: <FiSliders />,
      },
    ],
  },
  {
    title: "Operación",
    items: [
      {
        id: "itinerarios",
        label: "Itinerarios",
        description: "Configuración de propuestas",
        icon: <FiFileText />,
      },
      {
        id: "plantillas",
        label: "Plantillas",
        description: "Preferencias de plantillas",
        icon: <FiSettings />,
      },
    ],
  },
  {
    title: "Inteligencia",
    items: [
      {
        id: "nia",
        label: "NIA",
        description: "Copiloto inteligente",
        icon: <FiZap />,
      },
    ],
  },
  {
    title: "Seguridad",
    items: [
      {
        id: "cuenta",
        label: "Cuenta",
        description: "Información de tu cuenta",
        icon: <FiUser />,
      },
      {
        id: "seguridad",
        label: "Seguridad",
        description: "Contraseña y sesiones",
        icon: <FiShield />,
      },
    ],
  },
];

function Configuracion() {
  const [activeSection, setActiveSection] = useState<SectionId>("agencia");

  const [saved, setSaved] = useState(false);

  const [agency, setAgency] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
  });

  const [preferences, setPreferences] = useState({
    currency: "USD",
    language: "Español",
    dateFormat: "DD/MM/YYYY",
    timezone: "America/Santo_Domingo",
  });

  const [itinerarySettings, setItinerarySettings] = useState({
    showBudget: true,
    showInternalNotes: false,
    showContact: true,
    showAssumptions: true,
  });

  const [templateSettings, setTemplateSettings] = useState({
    defaultDays: 5,
    includeNotes: true,
    includeActivities: true,
  });

  const [niaSettings, setNiaSettings] = useState({
    enabled: true,
    detail: "Equilibrado",
    customInstructions: "",
  });

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const renderToggle = (value: boolean, onChange: (value: boolean) => void) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`
        relative h-6 w-11 shrink-0 rounded-full
        transition-colors duration-200
        ${value ? "bg-blue-600" : "bg-slate-300"}
      `}
      aria-pressed={value}
    >
      <span
        className={`
          absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm
          transition-all duration-200
          ${value ? "left-6" : "left-1"}
        `}
      />
    </button>
  );

  const renderHeader = (
    eyebrow: string,
    title: string,
    description: string,
    icon: ReactNode,
  ) => (
    <div className="mb-7 flex items-start gap-4">
      <div
        className="
        flex h-12 w-12 shrink-0 items-center justify-center
        rounded-2xl
        bg-blue-50
        text-blue-600
      "
      >
        {icon}
      </div>

      <div>
        <p
          className="
          mb-1 text-[10px] font-bold uppercase
          tracking-[0.16em] text-blue-600
        "
        >
          {eyebrow}
        </p>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );

  const renderAgency = () => (
    <>
      {renderHeader(
        "Información general",
        "Perfil de la agencia",
        "Administra la información que identifica a tu agencia dentro de Travel SaaS.",
        <FiBriefcase size={22} />,
      )}

      <div className="space-y-6">
        {/* Identidad */}
        <div
          className="
          rounded-2xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
        "
        >
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900">
              Identidad de la agencia
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Esta información puede utilizarse posteriormente en itinerarios y
              propuestas para clientes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[180px_1fr]">
            {/* Logo */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Logo</p>

              <div
                className="
                flex h-36 w-36 items-center justify-center
                rounded-2xl
                border border-dashed border-slate-300
                bg-slate-50
              "
              >
                <div className="text-center">
                  <div
                    className="
                    mx-auto mb-2
                    flex h-12 w-12 items-center justify-center
                    rounded-xl
                    bg-gradient-to-br from-blue-600 to-cyan-400
                    text-xl font-bold text-white
                  "
                  >
                    T
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    Logo de agencia
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="
                  mt-3 text-xs font-semibold
                  text-blue-600
                  transition hover:text-blue-700
                "
              >
                Cambiar logo
              </button>
            </div>

            {/* Datos */}
            <div className="space-y-5">
              <Input
                label="Nombre de la agencia"
                value={agency.name}
                placeholder="Nombre de tu agencia"
                onChange={(value) =>
                  setAgency({
                    ...agency,
                    name: value,
                  })
                }
              />

              <div>
                <label
                  className="
                  mb-2 block text-sm font-medium text-slate-700
                "
                >
                  Descripción
                </label>

                <textarea
                  rows={4}
                  value={agency.description}
                  onChange={(e) =>
                    setAgency({
                      ...agency,
                      description: e.target.value,
                    })
                  }
                  className="
                    w-full resize-none rounded-xl
                    border border-slate-200
                    bg-white
                    px-4 py-3
                    text-sm text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                  placeholder="Describe brevemente tu agencia..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div
          className="
          rounded-2xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
        "
        >
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900">
              Información de contacto
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Datos que podrán utilizarse para contactar con la agencia.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Teléfono"
              value={agency.phone}
              placeholder="+1 809 000 0000"
              onChange={(value) =>
                setAgency({
                  ...agency,
                  phone: value,
                })
              }
            />

            <Input
              label="WhatsApp"
              value={agency.whatsapp}
              placeholder="+1 809 000 0000"
              onChange={(value) =>
                setAgency({
                  ...agency,
                  whatsapp: value,
                })
              }
            />

            <Input
              label="Correo electrónico"
              value={agency.email}
              placeholder="contacto@tuagencia.com"
              onChange={(value) =>
                setAgency({
                  ...agency,
                  email: value,
                })
              }
            />

            <Input
              label="Sitio web"
              value={agency.website}
              placeholder="www.tuagencia.com"
              onChange={(value) =>
                setAgency({
                  ...agency,
                  website: value,
                })
              }
            />

            <div className="md:col-span-2">
              <Input
                label="Dirección"
                value={agency.address}
                placeholder="Dirección de la agencia"
                onChange={(value) =>
                  setAgency({
                    ...agency,
                    address: value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderPreferences = () => (
    <>
      {renderHeader(
        "Preferencias",
        "Preferencias generales",
        "Configura cómo quieres trabajar dentro de Travel SaaS.",
        <FiSliders size={22} />,
      )}

      <div
        className="
        rounded-2xl
        border border-slate-200
        bg-white
        p-6
        shadow-sm
      "
      >
        <div className="divide-y divide-slate-100">
          <SelectRow
            label="Idioma"
            description="Idioma principal de la plataforma."
            value={preferences.language}
            options={["Español", "English"]}
            onChange={(value) =>
              setPreferences({
                ...preferences,
                language: value,
              })
            }
          />

          <SelectRow
            label="Moneda"
            description="Moneda utilizada para presupuestos y propuestas."
            value={preferences.currency}
            options={["USD", "DOP", "EUR"]}
            onChange={(value) =>
              setPreferences({
                ...preferences,
                currency: value,
              })
            }
          />

          <SelectRow
            label="Formato de fecha"
            description="Formato utilizado para mostrar fechas."
            value={preferences.dateFormat}
            options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
            onChange={(value) =>
              setPreferences({
                ...preferences,
                dateFormat: value,
              })
            }
          />

          <SelectRow
            label="Zona horaria"
            description="Zona horaria utilizada para fechas y horarios."
            value={preferences.timezone}
            options={["America/Santo_Domingo", "America/New_York", "UTC"]}
            onChange={(value) =>
              setPreferences({
                ...preferences,
                timezone: value,
              })
            }
          />
        </div>
      </div>
    </>
  );

  const renderItineraries = () => (
    <>
      {renderHeader(
        "Operación",
        "Configuración de itinerarios",
        "Define qué información debe aparecer en tus itinerarios y propuestas.",
        <FiFileText size={22} />,
      )}

      <SettingsCard
        title="Contenido de los itinerarios"
        description="Controla la información que se muestra al preparar una propuesta."
      >
        <ToggleRow
          label="Mostrar presupuesto"
          description="Incluye el presupuesto estimado en el itinerario."
          toggle={renderToggle(itinerarySettings.showBudget, (value) =>
            setItinerarySettings({
              ...itinerarySettings,
              showBudget: value,
            }),
          )}
        />

        <ToggleRow
          label="Mostrar información de contacto"
          description="Incluye los datos de contacto de la agencia."
          toggle={renderToggle(itinerarySettings.showContact, (value) =>
            setItinerarySettings({
              ...itinerarySettings,
              showContact: value,
            }),
          )}
        />

        <ToggleRow
          label="Mostrar supuestos"
          description="Permite indicar al cliente qué aspectos deben verificarse antes de cotizar."
          toggle={renderToggle(itinerarySettings.showAssumptions, (value) =>
            setItinerarySettings({
              ...itinerarySettings,
              showAssumptions: value,
            }),
          )}
        />

        <ToggleRow
          label="Notas internas"
          description="Mantiene las notas internas separadas de la información del cliente."
          toggle={renderToggle(itinerarySettings.showInternalNotes, (value) =>
            setItinerarySettings({
              ...itinerarySettings,
              showInternalNotes: value,
            }),
          )}
        />
      </SettingsCard>
    </>
  );

  const renderTemplates = () => (
    <>
      {renderHeader(
        "Operación",
        "Configuración de plantillas",
        "Define los valores predeterminados utilizados al crear nuevas plantillas.",
        <FiSettings size={22} />,
      )}

      <SettingsCard
        title="Valores predeterminados"
        description="Estos valores pueden modificarse posteriormente en cada plantilla."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="
              mb-2 block text-sm font-medium text-slate-700
            "
            >
              Duración predeterminada
            </label>

            <div className="relative">
              <input
                type="number"
                min={1}
                max={30}
                value={templateSettings.defaultDays}
                onChange={(e) =>
                  setTemplateSettings({
                    ...templateSettings,
                    defaultDays: Number(e.target.value),
                  })
                }
                className="
                  w-full rounded-xl
                  border border-slate-200
                  px-4 py-3 pr-16
                  text-sm
                  outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              />

              <span
                className="
                absolute right-4 top-1/2
                -translate-y-1/2
                text-sm text-slate-400
              "
              >
                días
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 divide-y divide-slate-100">
          <ToggleRow
            label="Incluir notas"
            description="Agregar automáticamente una sección de notas."
            toggle={renderToggle(templateSettings.includeNotes, (value) =>
              setTemplateSettings({
                ...templateSettings,
                includeNotes: value,
              }),
            )}
          />

          <ToggleRow
            label="Incluir actividades"
            description="Agregar actividades al crear la estructura inicial."
            toggle={renderToggle(templateSettings.includeActivities, (value) =>
              setTemplateSettings({
                ...templateSettings,
                includeActivities: value,
              }),
            )}
          />
        </div>
      </SettingsCard>
    </>
  );

  const renderNia = () => (
    <>
      {renderHeader(
        "Inteligencia",
        "NIA — Copiloto inteligente",
        "Configura cómo quieres que NIA ayude a tus agentes durante la planificación de viajes.",
        <FiZap size={22} />,
      )}

      <div className="space-y-6">
        {/* Banner NIA */}
        <div
          className="
          overflow-hidden rounded-2xl
          bg-gradient-to-br
          from-blue-600
          via-blue-600
          to-cyan-500
          p-6
          text-white
          shadow-lg shadow-blue-500/10
        "
        >
          <div
            className="
            flex flex-col justify-between gap-6
            md:flex-row md:items-center
          "
          >
            <div className="flex items-start gap-4">
              <div
                className="
                flex h-12 w-12 shrink-0
                items-center justify-center
                rounded-2xl
                bg-white/15
              "
              >
                <FiZap size={22} />
              </div>

              <div>
                <p className="text-lg font-bold">NIA está disponible</p>

                <p
                  className="
                  mt-1 max-w-xl
                  text-sm leading-6 text-blue-50
                "
                >
                  NIA funciona como copiloto de los agentes. Sus recomendaciones
                  son orientativas y deben revisarse antes de presentar una
                  propuesta al cliente.
                </p>
              </div>
            </div>

            {renderToggle(niaSettings.enabled, (value) =>
              setNiaSettings({
                ...niaSettings,
                enabled: value,
              }),
            )}
          </div>
        </div>

        <SettingsCard
          title="Comportamiento de NIA"
          description="Personaliza el nivel de detalle que esperas recibir."
        >
          <SelectRow
            label="Nivel de detalle"
            description="Cantidad de información que NIA debe proporcionar."
            value={niaSettings.detail}
            options={["Breve", "Equilibrado", "Detallado"]}
            onChange={(value) =>
              setNiaSettings({
                ...niaSettings,
                detail: value,
              })
            }
          />

          <div className="border-t border-slate-100 pt-6">
            <label
              className="
              mb-2 block text-sm font-medium text-slate-700
            "
            >
              Instrucciones personalizadas
            </label>

            <textarea
              rows={5}
              value={niaSettings.customInstructions}
              onChange={(e) =>
                setNiaSettings({
                  ...niaSettings,
                  customInstructions: e.target.value,
                })
              }
              placeholder="Ejemplo: Prioriza recomendaciones para familias y evita itinerarios demasiado intensos..."
              className="
                w-full resize-none rounded-xl
                border border-slate-200
                px-4 py-3
                text-sm
                outline-none
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

            <p className="mt-2 text-xs text-slate-400">
              Estas instrucciones servirán como contexto adicional para NIA.
            </p>
          </div>
        </SettingsCard>
      </div>
    </>
  );

  const renderAccount = () => (
    <>
      {renderHeader(
        "Cuenta",
        "Información de la cuenta",
        "Consulta la información del usuario que está utilizando Travel SaaS.",
        <FiUser size={22} />,
      )}

      <SettingsCard
        title="Usuario actual"
        description="Información básica de tu cuenta."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InfoBox label="Nombre" value="Usuario actual" />
          <InfoBox label="Correo" value="Cuenta actual" />
          <InfoBox label="Rol" value="Administrador" />
          <InfoBox label="Estado" value="Activo" />
        </div>
      </SettingsCard>
    </>
  );

  const renderSecurity = () => (
    <>
      {renderHeader(
        "Seguridad",
        "Seguridad de la cuenta",
        "Administra las opciones relacionadas con el acceso y la seguridad.",
        <FiShield size={22} />,
      )}

      <div className="space-y-6">
        <SettingsCard
          title="Contraseña"
          description="Mantén protegida tu cuenta utilizando una contraseña segura."
        >
          <button
            type="button"
            className="
              inline-flex items-center gap-2
              rounded-xl
              bg-slate-900
              px-4 py-3
              text-sm font-semibold text-white
              transition
              hover:bg-slate-800
            "
          >
            <FiLock />
            Cambiar contraseña
          </button>
        </SettingsCard>

        <SettingsCard
          title="Sesiones"
          description="Administra las sesiones activas de tu cuenta."
        >
          <div
            className="
            flex items-center justify-between
            gap-4
            rounded-xl
            border border-slate-200
            bg-slate-50
            p-4
          "
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Sesión actual
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Este dispositivo · Sesión activa
              </p>
            </div>

            <span
              className="
              inline-flex items-center gap-1.5
              rounded-full
              bg-emerald-50
              px-3 py-1
              text-xs font-semibold
              text-emerald-700
            "
            >
              <span
                className="
                h-1.5 w-1.5 rounded-full
                bg-emerald-500
              "
              />
              Activa
            </span>
          </div>
        </SettingsCard>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "agencia":
        return renderAgency();

      case "preferencias":
        return renderPreferences();

      case "itinerarios":
        return renderItineraries();

      case "plantillas":
        return renderTemplates();

      case "nia":
        return renderNia();

      case "cuenta":
        return renderAccount();

      case "seguridad":
        return renderSecurity();

      default:
        return renderAgency();
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div
        className="
        mx-auto max-w-[1500px]
        px-4 py-6
        sm:px-6
        lg:px-8
      "
      >
        {/* Header */}
        <div className="mb-7">
          <div
            className="
            flex items-center gap-2
            text-xs font-medium text-slate-400
          "
          >
            <span>Travel SaaS</span>
            <FiChevronRight size={13} />
            <span className="text-slate-600">Configuración</span>
          </div>

          <div
            className="
            mt-3 flex flex-col justify-between gap-4
            md:flex-row md:items-end
          "
          >
            <div>
              <h1
                className="
                text-3xl font-bold
                tracking-tight text-slate-900
              "
              >
                Configuración
              </h1>

              <p className="mt-1.5 text-sm text-slate-500">
                Administra la información y preferencias de tu agencia.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {saved && (
                <div
                  className="
                  flex items-center gap-2
                  text-sm font-medium text-emerald-600
                "
                >
                  <FiCheck />
                  Cambios guardados
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="
                  inline-flex items-center gap-2
                  rounded-xl
                  bg-blue-600
                  px-5 py-3
                  text-sm font-semibold text-white
                  shadow-sm
                  transition
                  hover:bg-blue-700
                  hover:shadow-md
                "
              >
                <FiSave size={16} />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div
          className="
          grid gap-6
          lg:grid-cols-[270px_minmax(0,1fr)]
        "
        >
          {/* Sidebar configuración */}
          <aside
            className="
            h-fit
            rounded-2xl
            border border-slate-200
            bg-white
            p-3
            shadow-sm
            lg:sticky lg:top-6
          "
          >
            <div className="mb-3 px-3 py-2">
              <p
                className="
                text-xs font-bold
                uppercase
                tracking-[0.14em]
                text-slate-400
              "
              >
                Ajustes
              </p>
            </div>

            <nav className="space-y-5">
              {sections.map((group) => (
                <div key={group.title}>
                  <p
                    className="
                    mb-2 px-3
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                  >
                    {group.title}
                  </p>

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = activeSection === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveSection(item.id)}
                          className={`
                            group flex w-full items-center gap-3
                            rounded-xl px-3 py-3
                            text-left
                            transition-all duration-200
                            ${
                              active
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }
                          `}
                        >
                          <span
                            className={`
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-lg
                              transition
                              ${
                                active
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600"
                              }
                            `}
                          >
                            {item.icon}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">
                              {item.label}
                            </span>

                            <span
                              className={`
                                mt-0.5 block truncate text-[11px]
                                ${active ? "text-blue-500" : "text-slate-400"}
                              `}
                            >
                              {item.description}
                            </span>
                          </span>

                          {active && (
                            <FiChevronRight
                              size={15}
                              className="shrink-0 text-blue-500"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Aviso */}
            <div
              className="
              mt-5 rounded-xl
              border border-slate-200
              bg-slate-50
              p-4
            "
            >
              <div
                className="
                mb-3 flex h-9 w-9
                items-center justify-center
                rounded-lg
                bg-blue-50
                text-blue-600
              "
              >
                <FiBell size={17} />
              </div>

              <p className="text-sm font-semibold text-slate-800">
                Configuración segura
              </p>

              <p
                className="
                mt-1
                text-xs leading-5
                text-slate-500
              "
              >
                Revisa los cambios antes de aplicarlos a toda la operación.
              </p>
            </div>
          </aside>

          {/* Contenido */}
          <main className="min-w-0">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        className="
        mb-2 block
        text-sm font-medium
        text-slate-700
      "
      >
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-xl
          border border-slate-200
          bg-white
          px-4 py-3
          text-sm text-slate-900
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10
        "
      />
    </div>
  );
}

function SelectRow({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="
      flex flex-col gap-4
      py-5
      first:pt-0
      last:pb-0
      sm:flex-row
      sm:items-center
      sm:justify-between
    "
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>

        <p
          className="
          mt-1 max-w-xl
          text-xs leading-5
          text-slate-400
        "
        >
          {description}
        </p>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-xl
          border border-slate-200
          bg-white
          px-4 py-2.5
          text-sm text-slate-700
          outline-none
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10
          sm:w-60
        "
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div
      className="
      rounded-2xl
      border border-slate-200
      bg-white
      p-6
      shadow-sm
    "
    >
      <div className="mb-5">
        <h3 className="font-semibold text-slate-900">{title}</h3>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div>{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  toggle,
}: {
  label: string;
  description: string;
  toggle: ReactNode;
}) {
  return (
    <div
      className="
      flex items-center justify-between
      gap-5
      border-b border-slate-100
      py-5
      last:border-b-0
      last:pb-0
      first:pt-0
    "
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>

        <p
          className="
          mt-1 max-w-xl
          text-xs leading-5
          text-slate-400
        "
        >
          {description}
        </p>
      </div>

      {toggle}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
      rounded-xl
      border border-slate-200
      bg-slate-50
      p-4
    "
    >
      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p
        className="
        mt-1.5
        text-sm font-semibold
        text-slate-800
      "
      >
        {value}
      </p>
    </div>
  );
}

export default Configuracion;
