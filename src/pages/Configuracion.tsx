import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  FiUpload,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import {
  DEFAULT_SETTINGS,
  changePassword,
  closeOtherSessions,
  getAccountInfo,
  getAgencyLogoUrl,
  getSettings,
  saveSettings,
  uploadAgencyLogo,
  type AgencySettings,
  type PreferencesSettings,
  type ItinerarySettings,
  type TemplateSettings,
  type NiaSettings,
} from "../service/configurationService";
import { supabase } from "../lib/supabase";

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
type Account = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

const sections: { title: string; items: SettingItem[] }[] = [
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

export default function Configuracion() {
  const logoInput = useRef<HTMLInputElement | null>(null);
  const avatarInput = useRef<HTMLInputElement | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("agencia");
  const [agency, setAgency] = useState<AgencySettings>(DEFAULT_SETTINGS.agency);
  const [preferences, setPreferences] = useState<PreferencesSettings>(
    DEFAULT_SETTINGS.preferences,
  );
  const [itinerarySettings, setItinerarySettings] = useState<ItinerarySettings>(
    DEFAULT_SETTINGS.itinerary_settings,
  );
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(
    DEFAULT_SETTINGS.template_settings,
  );
  const [niaSettings, setNiaSettings] = useState<NiaSettings>(
    DEFAULT_SETTINGS.nia_settings,
  );
  const [account, setAccount] = useState<Account | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityBusy, setSecurityBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [settings, user] = await Promise.all([
        getSettings(),
        getAccountInfo(),
      ]);
      setAgency(settings.agency);
      setPreferences(settings.preferences);
      setItinerarySettings(settings.itinerary_settings);
      setTemplateSettings(settings.template_settings);
      setNiaSettings(settings.nia_settings);
      setAccount(user);
      if (settings.agency.logo_path)
        setLogoUrl(await getAgencyLogoUrl(settings.agency.logo_path));
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      const result = await saveSettings({
        agency,
        preferences,
        itinerary_settings: itinerarySettings,
        template_settings: templateSettings,
        nia_settings: niaSettings,
      });
      setAgency(result.agency);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(message(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogo(file: File | undefined) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo puedes subir imágenes JPG, PNG o WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("El logo no puede superar los 5 MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoUrl(previewUrl);

    try {
      setSaving(true);
      setError("");

      const path = await uploadAgencyLogo(file);
      const nextAgency = { ...agency, logo_path: path };

      await saveSettings({
        agency: nextAgency,
        preferences,
        itinerary_settings: itinerarySettings,
        template_settings: templateSettings,
        nia_settings: niaSettings,
      });

      setAgency(nextAgency);
      const signedUrl = await getAgencyLogoUrl(path);
      setLogoUrl(signedUrl);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setLogoUrl(
        agency.logo_path
          ? await getAgencyLogoUrl(agency.logo_path).catch(() => null)
          : null,
      );
      setError(message(e));
    } finally {
      URL.revokeObjectURL(previewUrl);
      if (logoInput.current) logoInput.current.value = "";
      setSaving(false);
    }
  }

  const loadAvatar = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setAvatarUrl(null);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const avatarPath =
        typeof metadata.avatar_path === "string" && metadata.avatar_path.trim()
          ? metadata.avatar_path.trim()
          : null;

      const externalAvatarUrl =
        typeof metadata.avatar_url === "string" && metadata.avatar_url.trim()
          ? metadata.avatar_url.trim()
          : null;

      if (avatarPath) {
        const { data, error } = await supabase.storage
          .from("avatars")
          .createSignedUrl(avatarPath, 60 * 60);

        if (error) throw error;
        setAvatarUrl(data.signedUrl);
        return;
      }

      if (externalAvatarUrl) {
        setAvatarUrl(externalAvatarUrl);
        return;
      }

      setAvatarUrl(null);
    } catch (e) {
      console.error("Error cargando avatar:", e);
      setAvatarUrl(null);
    }
  }, []);

  useEffect(() => {
    void loadAvatar();
  }, [loadAvatar]);

  async function handleAvatar(file: File | undefined) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("La foto de perfil debe ser JPG, PNG o WEBP.");
      if (avatarInput.current) avatarInput.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La foto de perfil no puede superar los 5 MB.");
      if (avatarInput.current) avatarInput.current.value = "";
      return;
    }

    let previewUrl: string | null = null;

    try {
      setAvatarUploading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Usuario no autenticado.");

      const oldAvatarPath =
        typeof user.user_metadata?.avatar_path === "string"
          ? user.user_metadata.avatar_path
          : null;

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;

      previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_path: path },
      });

      if (updateError) {
        await supabase.storage.from("avatars").remove([path]);
        throw updateError;
      }

      if (oldAvatarPath && oldAvatarPath !== path) {
        const { error: removeOldError } = await supabase.storage
          .from("avatars")
          .remove([oldAvatarPath]);

        if (removeOldError) {
          console.warn(
            "No se pudo eliminar el avatar anterior:",
            removeOldError,
          );
        }
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60);

      if (signedError) throw signedError;

      setAvatarUrl(signedData.signedUrl);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Error actualizando foto de perfil:", e);
      setError(message(e));
      await loadAvatar();
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (avatarInput.current) avatarInput.current.value = "";
      setAvatarUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    try {
      setAvatarRemoving(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Usuario no autenticado.");

      const avatarPath =
        typeof user.user_metadata?.avatar_path === "string"
          ? user.user_metadata.avatar_path
          : null;

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_path: null,
          avatar_url: null,
        },
      });

      if (updateError) throw updateError;

      if (avatarPath) {
        const { error: removeError } = await supabase.storage
          .from("avatars")
          .remove([avatarPath]);

        if (removeError) {
          console.warn(
            "No se pudo eliminar el archivo del avatar:",
            removeError,
          );
        }
      }

      setAvatarUrl(null);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Error eliminando foto de perfil:", e);
      setError(message(e));
    } finally {
      setAvatarRemoving(false);
    }
  }

  async function handlePassword() {
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      setSecurityBusy(true);
      setError("");
      await changePassword(password);
      setPassword("");
      setConfirmPassword("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(message(e));
    } finally {
      setSecurityBusy(false);
    }
  }

  async function handleCloseSessions() {
    try {
      setSecurityBusy(true);
      setError("");
      await closeOtherSessions();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(message(e));
    } finally {
      setSecurityBusy(false);
    }
  }

  const toggle = (value: boolean, onChange: (v: boolean) => void) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? "bg-rose-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? "left-6" : "left-1"}`}
      />
    </button>
  );

  const header = (
    eyebrow: string,
    title: string,
    description: string,
    icon: ReactNode,
  ) => (
    <div className="mb-7 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        {icon}
      </div>
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-rose-600">
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

  function content() {
    if (activeSection === "agencia")
      return (
        <>
          {header(
            "Información general",
            "Perfil de la agencia",
            "Estos datos pueden utilizarse en propuestas e itinerarios.",
            <FiBriefcase size={22} />,
          )}
          <div className="space-y-6">
            <Card
              title="Identidad de la agencia"
              description="Información visible de tu negocio."
            >
              <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Logo
                  </p>
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-[#fffafa]">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ed5f87] to-[#f4a4b9] font-bold text-white">
                          T
                        </div>
                        <span className="text-xs text-slate-500">Sin logo</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={logoInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => void handleLogo(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => logoInput.current?.click()}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-rose-600"
                  >
                    <FiUpload /> {saving ? "Subiendo..." : "Cambiar logo"}
                  </button>
                </div>
                <div className="space-y-5">
                  <Input
                    label="Nombre de la agencia"
                    value={agency.name}
                    placeholder="Nombre de tu agencia"
                    onChange={(v) => setAgency({ ...agency, name: v })}
                  />
                  <Textarea
                    label="Descripción"
                    value={agency.description}
                    onChange={(v) => setAgency({ ...agency, description: v })}
                  />
                </div>
              </div>
            </Card>
            <Card
              title="Información de contacto"
              description="Datos para tus clientes."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Teléfono"
                  value={agency.phone}
                  onChange={(v) => setAgency({ ...agency, phone: v })}
                />
                <Input
                  label="WhatsApp"
                  value={agency.whatsapp}
                  onChange={(v) => setAgency({ ...agency, whatsapp: v })}
                />
                <Input
                  label="Correo electrónico"
                  value={agency.email}
                  onChange={(v) => setAgency({ ...agency, email: v })}
                />
                <Input
                  label="Sitio web"
                  value={agency.website}
                  onChange={(v) => setAgency({ ...agency, website: v })}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Dirección"
                    value={agency.address}
                    onChange={(v) => setAgency({ ...agency, address: v })}
                  />
                </div>
              </div>
            </Card>
          </div>
        </>
      );
    if (activeSection === "preferencias")
      return (
        <>
          {header(
            "Preferencias",
            "Preferencias generales",
            "Configura cómo quieres trabajar dentro de Travel SaaS.",
            <FiSliders size={22} />,
          )}
          <Card title="Formato y región" description="Se guarda por usuario.">
            <SelectRow
              label="Idioma"
              value={preferences.language}
              options={["Español", "English"]}
              onChange={(v) => setPreferences({ ...preferences, language: v })}
            />
            <SelectRow
              label="Moneda"
              value={preferences.currency}
              options={["USD", "DOP", "EUR"]}
              onChange={(v) => setPreferences({ ...preferences, currency: v })}
            />
            <SelectRow
              label="Formato de fecha"
              value={preferences.dateFormat}
              options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
              onChange={(v) =>
                setPreferences({ ...preferences, dateFormat: v })
              }
            />
            <SelectRow
              label="Zona horaria"
              value={preferences.timezone}
              options={["America/Santo_Domingo", "America/New_York", "UTC"]}
              onChange={(v) => setPreferences({ ...preferences, timezone: v })}
            />
          </Card>
        </>
      );
    if (activeSection === "itinerarios")
      return (
        <>
          {header(
            "Operación",
            "Configuración de itinerarios",
            "Define qué información aparecerá en tus propuestas.",
            <FiFileText size={22} />,
          )}
          <Card
            title="Contenido de los itinerarios"
            description="Valores predeterminados."
          >
            <ToggleRow
              label="Mostrar presupuesto"
              toggle={toggle(itinerarySettings.showBudget, (v) =>
                setItinerarySettings({ ...itinerarySettings, showBudget: v }),
              )}
            />
            <ToggleRow
              label="Mostrar información de contacto"
              toggle={toggle(itinerarySettings.showContact, (v) =>
                setItinerarySettings({ ...itinerarySettings, showContact: v }),
              )}
            />
            <ToggleRow
              label="Mostrar supuestos"
              toggle={toggle(itinerarySettings.showAssumptions, (v) =>
                setItinerarySettings({
                  ...itinerarySettings,
                  showAssumptions: v,
                }),
              )}
            />
            <ToggleRow
              label="Notas internas"
              toggle={toggle(itinerarySettings.showInternalNotes, (v) =>
                setItinerarySettings({
                  ...itinerarySettings,
                  showInternalNotes: v,
                }),
              )}
            />
          </Card>
        </>
      );
    if (activeSection === "plantillas")
      return (
        <>
          {header(
            "Operación",
            "Configuración de plantillas",
            "Define valores predeterminados para nuevas plantillas.",
            <FiSettings size={22} />,
          )}
          <Card
            title="Valores predeterminados"
            description="Puedes cambiarlos cuando quieras."
          >
            <Input
              label="Duración predeterminada (días)"
              type="number"
              value={String(templateSettings.defaultDays)}
              onChange={(v) =>
                setTemplateSettings({
                  ...templateSettings,
                  defaultDays: Math.max(1, Number(v) || 1),
                })
              }
            />
            <div className="mt-6">
              <ToggleRow
                label="Incluir notas"
                toggle={toggle(templateSettings.includeNotes, (v) =>
                  setTemplateSettings({ ...templateSettings, includeNotes: v }),
                )}
              />
              <ToggleRow
                label="Incluir actividades"
                toggle={toggle(templateSettings.includeActivities, (v) =>
                  setTemplateSettings({
                    ...templateSettings,
                    includeActivities: v,
                  }),
                )}
              />
            </div>
          </Card>
        </>
      );
    if (activeSection === "nia")
      return (
        <>
          {header(
            "Inteligencia",
            "NIA — Copiloto inteligente",
            "Personaliza el comportamiento del asistente.",
            <FiZap size={22} />,
          )}
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-5 rounded-2xl bg-gradient-to-br from-[#ed5f87] to-[#f08ca7] p-6 text-white">
              <div>
                <p className="font-bold">NIA está disponible</p>
                <p className="mt-1 text-sm text-rose-50">
                  Activa o desactiva el copiloto para tu cuenta.
                </p>
              </div>
              {toggle(niaSettings.enabled, (v) =>
                setNiaSettings({ ...niaSettings, enabled: v }),
              )}
            </div>
            <Card
              title="Comportamiento de NIA"
              description="Estas preferencias quedan guardadas en Supabase."
            >
              <SelectRow
                label="Nivel de detalle"
                value={niaSettings.detail}
                options={["Breve", "Equilibrado", "Detallado"]}
                onChange={(v) => setNiaSettings({ ...niaSettings, detail: v })}
              />
              <div className="mt-5">
                <Textarea
                  label="Instrucciones personalizadas"
                  value={niaSettings.customInstructions}
                  onChange={(v) =>
                    setNiaSettings({ ...niaSettings, customInstructions: v })
                  }
                />
              </div>
            </Card>
          </div>
        </>
      );
    if (activeSection === "cuenta")
      return (
        <>
          {header(
            "Cuenta",
            "Información de la cuenta",
            "Administra tu foto de perfil y los datos de tu cuenta.",
            <FiUser size={22} />,
          )}

          <div className="space-y-6">
            <Card
              title="Foto de perfil"
              description="Esta imagen aparecerá en la parte superior de Travel SaaS."
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-rose-100 to-rose-200 shadow-md ring-1 ring-rose-100">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Foto de perfil"
                        className="h-full w-full object-cover"
                        onError={() => setAvatarUrl(null)}
                      />
                    ) : (
                      <span className="text-3xl font-bold text-rose-600">
                        {account?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>

                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80">
                      <FiRefreshCw className="animate-spin text-2xl text-rose-500" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {account?.name || "Usuario"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {account?.email || ""}
                  </p>
                  <p className="mt-3 max-w-xl text-xs leading-5 text-slate-500">
                    Usa una imagen JPG, PNG o WEBP. El tamaño máximo permitido
                    es de 5 MB.
                  </p>

                  <input
                    ref={avatarInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) =>
                      void handleAvatar(event.target.files?.[0])
                    }
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={avatarUploading || avatarRemoving}
                      onClick={() => avatarInput.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {avatarUploading ? (
                        <>
                          <FiRefreshCw className="animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <FiUpload />
                          {avatarUrl ? "Cambiar foto" : "Subir foto"}
                        </>
                      )}
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        disabled={avatarUploading || avatarRemoving}
                        onClick={() => void handleRemoveAvatar()}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#f0dddd] bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {avatarRemoving ? (
                          <>
                            <FiRefreshCw className="animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          "Eliminar foto"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="Usuario actual"
              description="Información obtenida de Supabase Auth."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Info label="Nombre" value={account?.name ?? "-"} />
                <Info label="Correo" value={account?.email ?? "-"} />
                <Info label="Rol" value={account?.role ?? "Agente"} />
                <Info label="Estado" value="Activo" />
              </div>
            </Card>
          </div>
        </>
      );
    return (
      <>
        {header(
          "Seguridad",
          "Seguridad de la cuenta",
          "Actualiza tu contraseña y controla tus sesiones.",
          <FiShield size={22} />,
        )}
        <div className="space-y-6">
          <Card
            title="Cambiar contraseña"
            description="Supabase Auth actualizará la contraseña de tu cuenta."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nueva contraseña"
                type="password"
                value={password}
                onChange={setPassword}
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </div>
            <button
              type="button"
              disabled={securityBusy || !password}
              onClick={() => void handlePassword()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <FiLock /> Actualizar contraseña
            </button>
          </Card>
          <Card
            title="Sesiones"
            description="Cierra las demás sesiones y conserva este dispositivo."
          >
            <div className="flex flex-col gap-4 rounded-xl border border-[#f0dddd] bg-[#fffafa] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Sesión actual
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Este dispositivo · Sesión activa
                </p>
              </div>
              <button
                type="button"
                disabled={securityBusy}
                onClick={() => void handleCloseSessions()}
                className="rounded-xl border border-[#f0dddd] bg-white px-4 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50"
              >
                Cerrar otras sesiones
              </button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f8] text-slate-800">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-7">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Travel SaaS</span>
            <FiChevronRight size={13} />
            <span className="text-slate-600">Configuración</span>
          </div>
          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Configuración
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Administra la información y preferencias de tu agencia.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <FiCheck />
                  Cambios guardados
                </div>
              )}
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-50"
              >
                {saving ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  <FiSave size={16} />
                )}{" "}
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle />
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <FiRefreshCw className="animate-spin text-2xl text-rose-500" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-[#f0dddd] bg-white p-3 shadow-sm lg:sticky lg:top-6">
              <div className="mb-3 px-3 py-2">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">
                  Ajustes
                </p>
              </div>
              <nav className="space-y-5">
                {sections.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[.12em] text-slate-400">
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
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${active ? "bg-rose-50 text-rose-700" : "text-slate-600 hover:bg-[#fffafa]"}`}
                          >
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"}`}
                            >
                              {item.icon}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold">
                                {item.label}
                              </span>
                              <span
                                className={`mt-0.5 block truncate text-[11px] ${active ? "text-rose-500" : "text-slate-400"}`}
                              >
                                {item.description}
                              </span>
                            </span>
                            {active && <FiChevronRight size={15} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="mt-5 rounded-xl border border-[#f0dddd] bg-[#fffafa] p-4">
                <FiBell className="mb-3 text-rose-600" />
                <p className="text-sm font-semibold text-slate-800">
                  Configuración segura
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Los cambios se guardan en tu cuenta de Supabase.
                </p>
              </div>
            </aside>
            <main className="min-w-0">{content()}</main>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#f0dddd] bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
      />
    </label>
  );
}
function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-xl border border-[#f0dddd] bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
      />
    </label>
  );
}
function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 py-5 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#f0dddd] bg-white px-4 py-2.5 text-sm outline-none sm:w-60"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#f0dddd] bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}
function ToggleRow({ label, toggle }: { label: string; toggle: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#f6e7e7] py-5 first:pt-0 last:border-0 last:pb-0">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {toggle}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#f0dddd] bg-[#fffafa] p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
function message(e: unknown) {
  return e instanceof Error ? e.message : "Ocurrió un error inesperado.";
}
