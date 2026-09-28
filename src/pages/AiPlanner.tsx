import { useState, type ReactNode } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiActivity,
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiCoffee,
  FiCompass,
  FiCopy,
  FiDollarSign,
  FiDownload,
  FiEdit3,
  FiGlobe,
  FiHeart,
  FiHome,
  FiInfo,
  FiMapPin,
  FiMessageSquare,
  FiPackage,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTarget,
  FiType,
  FiTruck,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import {
  generateItineraryWithAI,
  type GeneratedItinerary,
} from "../service/aiService";

import { extractTripRequirements } from "../service/tripRequirementsService";

const examples = [
  {
    title: "Escapada a Samaná",

    icon: <FiCompass />,

    text: "El cliente quiere viajar a Samaná durante una semana con su pareja. No conocen mucho el destino. Les interesa la playa, la naturaleza y probar comida local. Quieren descansar y hacer algunas excursiones, pero no desean un viaje demasiado cargado. Todavía no tienen un presupuesto definido.",
  },

  {
    title: "Familia en Punta Cana",

    icon: <FiUsers />,

    text: "Una familia de 4 personas quiere viajar a Punta Cana por 5 días. Quieren descansar, disfrutar de la playa y hacer una excursión, pero sin tener demasiadas actividades. El presupuesto aproximado es de US$2,500.",
  },

  {
    title: "Viaje romántico a París",

    icon: <FiHeart />,

    text: "Una pareja quiere hacer un viaje romántico a París durante 6 días. Les interesan la gastronomía, museos, lugares emblemáticos y experiencias románticas. Tienen un presupuesto aproximado de US$3,000.",
  },
];

export default function AiPlanner() {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const [loadingStep, setLoadingStep] = useState("");

  const [proposal, setProposal] = useState<GeneratedItinerary | null>(null);

  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [customTitle, setCustomTitle] = useState("");

  const [agencyName, setAgencyName] = useState("");

  const [accentStyle, setAccentStyle] = useState<"rose" | "soft" | "classic">(
    "rose",
  );

  const useExample = (text: string) => {
    setDescription(text);

    setProposal(null);

    setError("");

    setLoadingStep("");

    setStep(1);
  };

  const generateProposal = async () => {
    if (!description.trim()) {
      setError("Escribe primero la información del viaje.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      setProposal(null);

      setLoadingStep("Analizando las necesidades del cliente...");

      const requirements = await extractTripRequirements(description.trim());

      if (!requirements.destination) {
        throw new Error(
          "No pude identificar el destino del viaje. Especifica el destino e inténtalo nuevamente.",
        );
      }

      setLoadingStep("Investigando el destino y sus posibilidades...");

      await delay(350);

      setLoadingStep("Relacionando el destino con el perfil del cliente...");

      await delay(350);

      setLoadingStep("Seleccionando experiencias...");

      await delay(350);

      setLoadingStep("Diseñando un itinerario equilibrado...");

      await delay(350);

      setLoadingStep("Estimando el presupuesto...");

      await delay(350);

      setLoadingStep("Preparando la propuesta...");

      const result = await generateItineraryWithAI(description.trim(), []);

      setProposal(result);

      setCustomTitle(result.title || "");

      setStep(2);
    } catch (err) {
      console.error("Error generando propuesta:", err);

      setError(
        err instanceof Error ? err.message : "No se pudo generar la propuesta.",
      );
    } finally {
      setLoading(false);

      setLoadingStep("");
    }
  };

  const newProposal = () => {
    setProposal(null);

    setError("");

    setLoadingStep("");

    setCopied(false);

    setStep(1);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyMessage = async () => {
    if (!proposal?.client_message) return;

    try {
      await navigator.clipboard.writeText(proposal.client_message);

      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("No se pudo copiar:", err);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#fff8f8] text-slate-800">
      <style>{`

        @media print {

          body * {

            visibility: hidden !important;

          }

          #triply-printable-itinerary,

          #triply-printable-itinerary * {

            visibility: visible !important;

          }

          #triply-printable-itinerary {

            position: absolute !important;

            left: 0 !important;

            top: 0 !important;

            width: 100% !important;

            margin: 0 !important;

            box-shadow: none !important;

          }

          @page {

            size: A4;

            margin: 12mm;

          }

        }

      `}</style>

      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-7">
        <button
          type="button"
          onClick={() => navigate("/itinerarios")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-rose-600"
        >
          <FiArrowLeft />
          Volver a itinerarios
        </button>

        <header className="mb-5 rounded-[22px] border border-[#f4dddd] bg-white px-5 py-5 shadow-[0_8px_30px_rgba(140,70,90,.05)] sm:px-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-950 sm:text-3xl">
                Crear itinerario
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Diseña experiencias únicas con la ayuda de NIA.
              </p>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-4 gap-2 xl:max-w-[680px]">
              <Step
                number="1"
                label="Destino"
                active={step === 1}
                done={step > 1}
              />

              <Step
                number="2"
                label="Itinerario"
                active={step === 2}
                done={step > 2}
              />

              <Step
                number="3"
                label="Personaliza"
                active={step === 3}
                done={step > 3}
              />

              <Step number="4" label="Revisa y descarga" active={step === 4} />
            </div>
          </div>
        </header>

        {step === 1 && (
          <PlannerForm
            description={description}
            setDescription={(value) => {
              setDescription(value);

              setError("");
            }}
            loading={loading}
            loadingStep={loadingStep}
            error={error}
            onGenerate={generateProposal}
            onExample={useExample}
          />
        )}

        {proposal && step === 2 && (
          <>
            <ProposalWorkspace
              proposal={proposal}
              onEdit={newProposal}
              onCopyMessage={copyMessage}
              copied={copied}
            />

            <WizardFooter
              backLabel="Volver al destino"
              nextLabel="Siguiente: Personaliza"
              onBack={() => setStep(1)}
              onNext={() => {
                setStep(3);

                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}

        {proposal && step === 3 && (
          <CustomizeStep
            proposal={proposal}
            customTitle={customTitle}
            setCustomTitle={setCustomTitle}
            agencyName={agencyName}
            setAgencyName={setAgencyName}
            accentStyle={accentStyle}
            setAccentStyle={setAccentStyle}
            onBack={() => setStep(2)}
            onNext={() => {
              setStep(4);

              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {proposal && step === 4 && (
          <ReviewStep
            proposal={proposal}
            customTitle={customTitle}
            agencyName={agencyName}
            accentStyle={accentStyle}
            onBack={() => setStep(3)}
            onEdit={() => setStep(2)}
            onCopyMessage={copyMessage}
            copied={copied}
          />
        )}
      </div>
    </main>
  );
}

function PlannerForm({
  description,

  setDescription,

  loading,

  loadingStep,

  error,

  onGenerate,

  onExample,
}: {
  description: string;

  setDescription: (value: string) => void;

  loading: boolean;

  loadingStep: string;

  error: string;

  onGenerate: () => void;

  onExample: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-[22px] border border-[#f2dddd] bg-white shadow-[0_12px_40px_rgba(140,70,90,.06)]">
          <div className="border-b border-[#f6e7e7] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <PinkIcon>
                <FiMessageSquare />
              </PinkIcon>

              <div>
                <h2 className="font-bold text-slate-900">
                  Cuéntale a NIA qué necesita el cliente
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Escríbelo con tus propias palabras. NIA organizará la idea.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Información del viaje
            </label>

            <div className="relative">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={13}
                placeholder="Ejemplo: Una pareja quiere viajar a Samaná durante 5 días. Buscan playa, naturaleza y gastronomía. Quieren descansar, pero también hacer una o dos excursiones..."
                className="w-full resize-none rounded-2xl border border-[#ecdede] bg-[#fffafa] px-5 py-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />

              <span className="absolute bottom-3 right-3 rounded-lg border border-[#f0dfdf] bg-white px-2 py-1 text-[10px] font-semibold text-slate-400">
                {description.length} caracteres
              </span>
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
              <FiInfo className="mt-0.5 shrink-0" />

              <p>
                No necesitas conocer perfectamente el destino. NIA te ayuda a
                estructurar el análisis, las recomendaciones y el itinerario.
              </p>
            </div>

            {error && (
              <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <FiAlertTriangle className="mt-0.5 shrink-0 text-red-500" />

                <div>
                  <p className="text-sm font-bold text-red-800">
                    No se pudo preparar la propuesta
                  </p>

                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onGenerate}
              disabled={!description.trim() || loading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#ed5f87] to-[#e9547d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  NIA está preparando la propuesta...
                </>
              ) : (
                <>
                  <FiZap />
                  Preparar propuesta con NIA
                  <FiArrowRight />
                </>
              )}
            </button>

            {loading && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/70">
                <div className="h-1 overflow-hidden bg-rose-100">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-rose-500" />
                </div>

                <div className="flex items-center gap-3 p-4">
                  <PinkIcon>
                    <FiSearch className="animate-pulse" />
                  </PinkIcon>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {loadingStep || "Procesando solicitud..."}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Analizando la información del viaje.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <SideCard title="Herramientas de NIA">
            <div className="grid grid-cols-2 gap-3">
              <Tool icon={<FiUsers />} label="Perfil" />

              <Tool icon={<FiGlobe />} label="Destino" />

              <Tool icon={<FiStar />} label="Experiencias" />

              <Tool icon={<FiCalendar />} label="Plan diario" />

              <Tool icon={<FiDollarSign />} label="Presupuesto" />

              <Tool icon={<FiRefreshCw />} label="Alternativas" />
            </div>
          </SideCard>

          <div className="rounded-[20px] border border-rose-100 bg-gradient-to-br from-[#fff1f4] to-white p-5">
            <PinkIcon>
              <FiTarget />
            </PinkIcon>

            <h3 className="mt-4 font-bold text-slate-900">
              Tú sigues teniendo el control
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              NIA prepara una propuesta editable. Tú decides qué presentar,
              modificar y verificar antes de cotizar.
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-rose-500">
              Empieza rápido
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Prueba con un ejemplo
            </h2>
          </div>

          <span className="hidden text-xs text-slate-400 sm:block">
            Selecciona uno para cargarlo
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {examples.map((example) => (
            <button
              key={example.title}
              type="button"
              onClick={() => onExample(example.text)}
              className="group rounded-2xl border border-[#f0dddd] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <PinkIcon>{example.icon}</PinkIcon>

                <FiArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-500" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">{example.title}</h3>

              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                {example.text}
              </p>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5 flex items-start gap-2 rounded-2xl border border-[#f0dfdf] bg-white p-4 text-xs leading-5 text-slate-500">
        <FiInfo className="mt-0.5 shrink-0" />
        Las recomendaciones y estimaciones de NIA son orientativas. Verifica
        precios, disponibilidad, horarios y condiciones antes de confirmar.
      </div>
    </>
  );
}

function ProposalWorkspace({
  proposal,

  onEdit,

  onCopyMessage,

  copied,
}: {
  proposal: GeneratedItinerary;

  onEdit: () => void;

  onCopyMessage: () => void;

  copied: boolean;
}) {
  const [selectedDay, setSelectedDay] = useState(0);

  const day = proposal.days[selectedDay] ?? proposal.days[0];

  const budget = proposal.budget;

  const clientAnalysis = proposal.client_analysis;

  const destinationGuide = proposal.destination_guide;

  const interests = clientAnalysis?.main_interests ?? [];

  const activityIcon = (type?: string) => {
    const value = (type || "").toLowerCase();

    if (
      value.includes("comida") ||
      value.includes("restaurante") ||
      value.includes("gastronom")
    )
      return <FiCoffee />;

    if (
      value.includes("transporte") ||
      value.includes("traslado") ||
      value.includes("transfer")
    )
      return <FiTruck />;

    if (
      value.includes("hotel") ||
      value.includes("alojamiento") ||
      value.includes("hospedaje")
    )
      return <FiHome />;

    if (
      value.includes("excurs") ||
      value.includes("actividad") ||
      value.includes("tour")
    )
      return <FiCompass />;

    return <FiMapPin />;
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-[#f2dfe3] bg-white shadow-[0_18px_60px_rgba(120,70,85,.08)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fff4f6] via-white to-[#fff9f6]" />

        <div className="relative grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:p-8">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-black text-rose-600">
                <FiCompass /> Itinerario preparado por NIA
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                <FiCalendar /> {proposal.days.length}{" "}
                {proposal.days.length === 1 ? "día" : "días"}
              </span>

              {clientAnalysis?.trip_style && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                  <FiHeart /> {clientAnalysis.trip_style}
                </span>
              )}
            </div>

            <h2 className="max-w-4xl font-serif text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {proposal.title}
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-500 sm:text-base">
              {proposal.summary}
            </p>

            {interests.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {interests.slice(0, 6).map((interest, index) => (
                  <span
                    key={`${interest}-${index}`}
                    className="rounded-full border border-rose-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {budget && (
            <div className="flex min-w-[220px] flex-col justify-center rounded-[22px] border border-rose-100 bg-white/90 p-5 shadow-sm backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
                Presupuesto estimado
              </p>

              <p className="mt-2 text-3xl font-black text-rose-600">
                {formatBudget(budget.total, budget.currency)}
              </p>

              {budget.client_budget != null && (
                <div className="mt-4 border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-400">Presupuesto cliente</span>
                    <span className="font-bold text-slate-700">
                      {formatBudget(budget.client_budget, budget.currency)}
                    </span>
                  </div>

                  {budget.remaining_budget != null && (
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-slate-400">Margen restante</span>
                      <span
                        className={`font-black ${budget.remaining_budget >= 0 ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {formatBudget(budget.remaining_budget, budget.currency)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[22px] border border-[#f0dfe2] bg-white p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {proposal.days.map((item, index) => {
            const active = selectedDay === index;

            return (
              <button
                key={`${item.day_number}-${index}`}
                type="button"
                onClick={() => setSelectedDay(index)}
                className={`group min-w-[135px] flex-1 rounded-2xl border px-4 py-3 text-left transition ${active ? "border-rose-300 bg-gradient-to-br from-rose-500 to-[#e9547d] text-white shadow-lg shadow-rose-100" : "border-transparent bg-slate-50 text-slate-600 hover:border-rose-100 hover:bg-rose-50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${active ? "text-white/70" : "text-slate-400"}`}
                  >
                    Día {item.day_number}
                  </span>
                  {active && <FiCheckCircle />}
                </div>

                <p className="mt-1 truncate text-xs font-black">{item.title}</p>

                {item.date && (
                  <p
                    className={`mt-1 text-[10px] ${active ? "text-white/70" : "text-slate-400"}`}
                  >
                    {formatDate(item.date)}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="overflow-hidden rounded-[26px] border border-[#f0dfe2] bg-white shadow-[0_12px_40px_rgba(120,70,85,.06)]">
          <div className="border-b border-[#f5e7e9] bg-gradient-to-r from-[#fff9fa] to-white px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-rose-500">
                  <FiCalendar />
                  <span>Día {day?.day_number ?? 1}</span>
                  {day?.date && (
                    <>
                      <span className="text-rose-200">•</span>
                      <span>{formatDate(day.date)}</span>
                    </>
                  )}
                </div>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {day?.title || proposal.title}
                </h2>

                {day?.description && (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {day.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onEdit}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-black text-rose-600 transition hover:bg-rose-50"
              >
                <FiEdit3 /> Ajustar viaje
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {day?.activities?.length ? (
              <div className="relative">
                <div className="absolute bottom-6 left-[23px] top-6 w-px bg-gradient-to-b from-rose-200 via-rose-100 to-transparent" />

                <div className="space-y-3">
                  {day.activities.map((activity, index) => (
                    <div
                      key={`${day.day_number}-${index}`}
                      className="group relative grid grid-cols-[48px_minmax(0,1fr)] gap-4"
                    >
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-white text-lg text-rose-500 shadow-sm transition group-hover:border-rose-200 group-hover:bg-rose-50">
                        {activityIcon(activity.type)}
                      </div>

                      <div className="rounded-[20px] border border-transparent p-4 transition group-hover:border-[#f3e3e5] group-hover:bg-[#fffafa]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {activity.start_time && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                                  <FiActivity />
                                  {formatTime(activity.start_time)}
                                  {activity.end_time
                                    ? ` – ${formatTime(activity.end_time)}`
                                    : ""}
                                </span>
                              )}

                              {activity.type && (
                                <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-500">
                                  {activity.type}
                                </span>
                              )}
                            </div>

                            <h3 className="mt-2 text-base font-black text-slate-900">
                              {activity.title}
                            </h3>

                            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
                              {activity.description}
                            </p>

                            {activity.location && (
                              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                <FiMapPin className="text-rose-400" />
                                {activity.location}
                              </p>
                            )}
                          </div>

                          {activity.estimated_cost != null && (
                            <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-right">
                              <p className="text-[9px] font-black uppercase tracking-wide text-emerald-600/60">
                                Estimado
                              </p>
                              <p className="text-sm font-black text-emerald-700">
                                {formatBudget(
                                  activity.estimated_cost,
                                  budget?.currency,
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        {activity.needs_verification && (
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700">
                            <FiAlertTriangle /> Verificar antes de confirmar
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-rose-200 bg-rose-50/40 px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-400 shadow-sm">
                  <FiCoffee />
                </div>
                <h3 className="mt-3 font-black text-slate-700">
                  Día para disfrutar sin prisas
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  NIA no ha programado actividades específicas para este día.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#f5e7e9] bg-[#fffafa] px-5 py-4 sm:px-7">
            <button
              type="button"
              disabled={selectedDay === 0}
              onClick={() =>
                setSelectedDay((current) => Math.max(0, current - 1))
              }
              className="inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiArrowLeft /> Día anterior
            </button>

            <span className="text-[11px] font-bold text-slate-400">
              {selectedDay + 1} de {proposal.days.length}
            </span>

            <button
              type="button"
              disabled={selectedDay >= proposal.days.length - 1}
              onClick={() =>
                setSelectedDay((current) =>
                  Math.min(proposal.days.length - 1, current + 1),
                )
              }
              className="inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Día siguiente <FiArrowRight />
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          {budget && (
            <section className="rounded-[22px] border border-[#f0dfe2] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">
                    Viaje
                  </p>
                  <h3 className="mt-1 font-black text-slate-900">
                    Presupuesto
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <FiDollarSign />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <BudgetVisualLine
                  icon={<FiHome />}
                  label="Alojamiento"
                  value={budget.accommodation}
                  currency={budget.currency}
                />

                <BudgetVisualLine
                  icon={<FiTruck />}
                  label="Transporte"
                  value={budget.transportation}
                  currency={budget.currency}
                />

                <BudgetVisualLine
                  icon={<FiCompass />}
                  label="Actividades"
                  value={budget.activities}
                  currency={budget.currency}
                />

                <BudgetVisualLine
                  icon={<FiCoffee />}
                  label="Comida"
                  value={budget.food}
                  currency={budget.currency}
                />

                {budget.other > 0 && (
                  <BudgetVisualLine
                    icon={<FiPackage />}
                    label="Otros"
                    value={budget.other}
                    currency={budget.currency}
                  />
                )}
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-br from-rose-50 to-[#fff5f5] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                  Total estimado
                </p>
                <p className="mt-1 text-2xl font-black text-rose-600">
                  {formatBudget(budget.total, budget.currency)}
                </p>
              </div>
            </section>
          )}

          {destinationGuide && (
            <section className="rounded-[22px] border border-[#f0dfe2] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4f5] text-rose-500">
                  <FiGlobe />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Guía rápida
                  </p>
                  <h3 className="font-black text-slate-900">Destino</h3>
                </div>
              </div>

              <p className="mt-4 line-clamp-5 text-xs leading-5 text-slate-500">
                {destinationGuide.overview}
              </p>

              {destinationGuide.best_for?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {destinationGuide.best_for.slice(0, 5).map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {proposal.considerations?.length > 0 && (
            <section className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex items-center gap-2 text-amber-700">
                <FiAlertTriangle />
                <h3 className="text-sm font-black">Antes de cotizar</h3>
              </div>
              <div className="mt-3 space-y-2">
                {proposal.considerations.slice(0, 3).map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-start gap-2 text-xs leading-5 text-amber-900/70"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-[22px] border border-[#f0dfe2] bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={onCopyMessage}
              disabled={!proposal.client_message}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ed5f87] to-[#e9547d] px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? <FiCheck /> : <FiMessageSquare />}
              {copied ? "Mensaje copiado" : "Mensaje para el cliente"}
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <FiEdit3 /> Modificar solicitud
            </button>
          </section>
        </aside>
      </div>

      {proposal.recommendations?.length > 0 && (
        <section className="rounded-[26px] border border-[#f0dfe2] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-rose-500">
                <FiStar /> Para completar el viaje
              </div>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                Experiencias que encajan
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Seleccionadas según el perfil del viajero
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {proposal.recommendations.slice(0, 6).map((item, index) => (
              <article
                key={`${item.name}-${index}`}
                className="group flex min-h-[170px] flex-col rounded-[20px] border border-[#f0e3e5] bg-[#fffdfd] p-5 transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <FiStar />
                  </span>
                  {item.estimated_cost != null && (
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                      {formatBudget(item.estimated_cost, budget?.currency)}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-black text-slate-900">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
                {item.needs_verification && (
                  <span className="mt-auto pt-3 text-[10px] font-bold text-amber-600">
                    Verificar disponibilidad
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BudgetVisualLine({
  icon,

  label,

  value,

  currency,
}: {
  icon: ReactNode;

  label: string;

  value: number | null | undefined;

  currency?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff5f6] text-xs text-rose-500">
          {icon}
        </span>

        <span className="truncate text-xs font-semibold text-slate-500">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-xs font-black text-slate-700">
        {formatBudget(value, currency)}
      </span>
    </div>
  );
}

function CustomizeStep({
  proposal,

  customTitle,

  setCustomTitle,

  agencyName,

  setAgencyName,

  accentStyle,

  setAccentStyle,

  onBack,

  onNext,
}: {
  proposal: GeneratedItinerary;

  customTitle: string;

  setCustomTitle: (value: string) => void;

  agencyName: string;

  setAgencyName: (value: string) => void;

  accentStyle: "rose" | "soft" | "classic";

  setAccentStyle: (value: "rose" | "soft" | "classic") => void;

  onBack: () => void;

  onNext: () => void;
}) {
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-[22px] border border-[#efdcdc] bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={<FiEdit3 />}
            title="Personaliza la propuesta"
            subtitle="Ajusta cómo se presentará el itinerario antes de entregarlo al cliente."
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Título del viaje
              </span>

              <div className="relative">
                <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  placeholder={proposal.title}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#fffafa] pl-11 pr-4 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Nombre de tu agencia
              </span>

              <input
                value={agencyName}
                onChange={(event) => setAgencyName(event.target.value)}
                placeholder="Ej. Sofiel Travel"
                className="h-12 w-full rounded-xl border border-slate-200 bg-[#fffafa] px-4 text-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
            </label>
          </div>

          <div className="mt-7">
            <p className="text-sm font-bold text-slate-700">Estilo del PDF</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <StyleChoice
                active={accentStyle === "rose"}
                title="Rosa Triply"
                subtitle="Moderno y elegante"
                onClick={() => setAccentStyle("rose")}
              />

              <StyleChoice
                active={accentStyle === "soft"}
                title="Suave"
                subtitle="Claro y minimalista"
                onClick={() => setAccentStyle("soft")}
              />

              <StyleChoice
                active={accentStyle === "classic"}
                title="Clásico"
                subtitle="Profesional y neutro"
                onClick={() => setAccentStyle("classic")}
              />
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-rose-100 bg-rose-50/50 p-5">
            <h3 className="font-bold text-slate-900">
              Qué incluirá el documento
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Included text="Portada del itinerario" />

              <Included text="Resumen del viaje" />

              <Included text="Plan día por día" />

              <Included text="Actividades y ubicaciones" />

              <Included text="Presupuesto estimado" />

              <Included text="Recomendaciones para el cliente" />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <SideCard title="Vista previa">
            <DocumentPreview
              proposal={proposal}
              title={customTitle || proposal.title}
              agencyName={agencyName}
              accentStyle={accentStyle}
            />
          </SideCard>

          <div className="rounded-[20px] border border-[#efdcdc] bg-white p-4 text-xs leading-5 text-slate-500">
            <div className="flex gap-2">
              <FiInfo className="mt-0.5 shrink-0 text-rose-500" />
              Puedes volver al itinerario y hacer cambios antes de generar el
              documento final.
            </div>
          </div>
        </aside>
      </div>

      <WizardFooter
        backLabel="Volver al itinerario"
        nextLabel="Siguiente: Revisa y descarga"
        onBack={onBack}
        onNext={onNext}
      />
    </>
  );
}

function ReviewStep({
  proposal,

  customTitle,

  agencyName,

  accentStyle,

  onBack,

  onEdit,

  onCopyMessage,

  copied,
}: {
  proposal: GeneratedItinerary;

  customTitle: string;

  agencyName: string;

  accentStyle: "rose" | "soft" | "classic";

  onBack: () => void;

  onEdit: () => void;

  onCopyMessage: () => void;

  copied: boolean;
}) {
  const finalTitle = customTitle.trim() || proposal.title;

  const printPdf = () => {
    window.print();
  };

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[22px] border border-[#efdcdc] bg-white p-5 shadow-sm sm:p-7">
          <SectionHeading
            icon={<FiCheckCircle />}
            title="Revisa y descarga"
            subtitle="Comprueba la propuesta antes de compartirla con el cliente."
          />

          <div className="mt-6 rounded-[22px] border border-[#f0dddd] bg-[#fffafa] p-4 sm:p-6">
            <PrintableItinerary
              proposal={proposal}
              title={finalTitle}
              agencyName={agencyName}
              accentStyle={accentStyle}
            />
          </div>
        </section>

        <aside className="space-y-4">
          <SideCard title="Documento listo">
            <div className="space-y-3">
              <ReviewLine label="Título" value={finalTitle} />

              <ReviewLine
                label="Días"
                value={`${proposal.days.length} ${
                  proposal.days.length === 1 ? "día" : "días"
                }`}
              />

              <ReviewLine
                label="Agencia"
                value={agencyName.trim() || "Sin nombre de agencia"}
              />

              <ReviewLine
                label="Presupuesto"
                value={
                  proposal.budget
                    ? formatBudget(
                        proposal.budget.total,

                        proposal.budget.currency,
                      )
                    : "No especificado"
                }
              />
            </div>
          </SideCard>

          <button
            type="button"
            onClick={printPdf}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ed5f87] to-[#e9547d] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5"
          >
            <FiDownload />
            Descargar / Guardar PDF
          </button>

          <button
            type="button"
            onClick={printPdf}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            <FiPrinter />
            Imprimir propuesta
          </button>

          {proposal.client_message && (
            <button
              type="button"
              onClick={onCopyMessage}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              {copied ? <FiCheck /> : <FiCopy />}

              {copied ? "Mensaje copiado" : "Copiar mensaje al cliente"}
            </button>
          )}

          <button
            type="button"
            onClick={onEdit}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <FiEdit3 />
            Volver a editar
          </button>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            Verifica precios, disponibilidad, horarios y condiciones antes de
            entregar la propuesta final.
          </div>
        </aside>
      </div>

      <WizardFooter
        backLabel="Volver a personalizar"
        nextLabel="Descargar PDF"
        onBack={onBack}
        onNext={printPdf}
      />
    </>
  );
}

function PrintableItinerary({
  proposal,

  title,

  agencyName,

  accentStyle,
}: {
  proposal: GeneratedItinerary;

  title: string;

  agencyName: string;

  accentStyle: "rose" | "soft" | "classic";
}) {
  return (
    <article
      id="triply-printable-itinerary"
      className={`mx-auto max-w-[850px] overflow-hidden rounded-2xl bg-white shadow-sm print:max-w-none print:rounded-none print:shadow-none ${
        accentStyle === "classic"
          ? "ring-1 ring-slate-200"
          : "ring-1 ring-rose-100"
      }`}
    >
      <div
        className={`p-7 sm:p-10 ${
          accentStyle === "classic"
            ? "bg-slate-900 text-white"
            : accentStyle === "soft"
              ? "bg-[#fff3f5] text-slate-900"
              : "bg-gradient-to-br from-[#ef6b8e] to-[#df4e78] text-white"
        }`}
      >
        <p className="text-xs font-bold uppercase tracking-[.2em] opacity-75">
          {agencyName.trim() || "Propuesta de viaje"}
        </p>

        <h1 className="mt-4 text-3xl font-black sm:text-4xl">{title}</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-85">
          {proposal.summary}
        </p>
      </div>

      <div className="space-y-8 p-6 sm:p-9">
        {proposal.days.map((day, dayIndex) => (
          <section
            key={`${day.day_number}-${dayIndex}`}
            className="break-inside-avoid"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-black text-rose-600">
                {day.day_number}
              </div>

              <div>
                <p className="text-xs font-bold text-rose-500">
                  Día {day.day_number}
                  {day.date ? ` · ${formatDate(day.date)}` : ""}
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {day.title}
                </h2>

                {day.description && (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {day.description}
                  </p>
                )}
              </div>
            </div>

            {day.activities?.length > 0 && (
              <div className="ml-5 mt-5 border-l border-rose-100 pl-8">
                {day.activities.map((activity, activityIndex) => (
                  <div
                    key={`${day.day_number}-${activityIndex}`}
                    className="relative mb-5 break-inside-avoid"
                  >
                    <span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full border-4 border-white bg-rose-400 ring-1 ring-rose-100" />

                    <div className="flex flex-wrap items-center gap-2">
                      {activity.start_time && (
                        <span className="text-xs font-black text-slate-500">
                          {formatTime(activity.start_time)}
                        </span>
                      )}

                      <h3 className="text-sm font-bold text-slate-900">
                        {activity.title}
                      </h3>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {activity.description}
                    </p>

                    {activity.location && (
                      <p className="mt-1 text-[11px] font-semibold text-slate-400">
                        {activity.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {proposal.budget && (
          <section className="break-inside-avoid border-t border-slate-100 pt-6">
            <h2 className="text-lg font-black text-slate-900">
              Presupuesto estimado
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ReviewLine
                label="Alojamiento"
                value={formatCost(proposal.budget.accommodation)}
              />

              <ReviewLine
                label="Transporte"
                value={formatCost(proposal.budget.transportation)}
              />

              <ReviewLine
                label="Actividades"
                value={formatCost(proposal.budget.activities)}
              />

              <ReviewLine
                label="Alimentación"
                value={formatCost(proposal.budget.food)}
              />
            </div>

            <div className="mt-4 rounded-xl bg-rose-50 p-4 text-right">
              <span className="text-xs font-bold text-slate-500">
                Total estimado
              </span>

              <p className="text-xl font-black text-rose-600">
                {formatBudget(proposal.budget.total, proposal.budget.currency)}
              </p>
            </div>
          </section>
        )}

        {proposal.recommendations?.length > 0 && (
          <section className="break-inside-avoid border-t border-slate-100 pt-6">
            <h2 className="text-lg font-black text-slate-900">
              Recomendaciones
            </h2>

            <div className="mt-4 space-y-3">
              {proposal.recommendations.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-sm font-bold text-slate-800">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function DocumentPreview({
  proposal,

  title,

  agencyName,

  accentStyle,
}: {
  proposal: GeneratedItinerary;

  title: string;

  agencyName: string;

  accentStyle: "rose" | "soft" | "classic";
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#f0dfdf] bg-white">
      <div
        className={`p-5 ${
          accentStyle === "classic"
            ? "bg-slate-900 text-white"
            : accentStyle === "soft"
              ? "bg-[#fff0f3] text-slate-900"
              : "bg-gradient-to-br from-[#ef6b8e] to-[#df4e78] text-white"
        }`}
      >
        <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">
          {agencyName.trim() || "Tu agencia"}
        </p>

        <h3 className="mt-2 line-clamp-2 text-lg font-black">{title}</h3>
      </div>

      <div className="p-4">
        <p className="line-clamp-3 text-xs leading-5 text-slate-500">
          {proposal.summary}
        </p>

        <div className="mt-4 space-y-2">
          {proposal.days.slice(0, 3).map((day) => (
            <div
              key={day.day_number}
              className="flex items-center gap-2 text-[11px]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 font-bold text-rose-500">
                {day.day_number}
              </span>

              <span className="truncate font-semibold text-slate-600">
                {day.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WizardFooter({
  backLabel,

  nextLabel,

  onBack,

  onNext,
}: {
  backLabel: string;

  nextLabel: string;

  onBack: () => void;

  onNext: () => void;
}) {
  return (
    <div className="mt-5 flex flex-col-reverse gap-3 rounded-[20px] border border-[#efdcdc] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
      >
        <FiArrowLeft />

        {backLabel}
      </button>

      <button
        type="button"
        onClick={onNext}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ed5f87] to-[#e9547d] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5"
      >
        {nextLabel}

        <FiArrowRight />
      </button>
    </div>
  );
}

function StyleChoice({
  active,

  title,

  subtitle,

  onClick,
}: {
  active: boolean;

  title: string;

  subtitle: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-rose-300 bg-rose-50 ring-2 ring-rose-100"
          : "border-slate-200 bg-white hover:border-rose-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800">{title}</span>

        {active && <FiCheckCircle className="text-rose-500" />}
      </div>

      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </button>
  );
}

function Included({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
        <FiCheck />
      </span>

      {text}
    </div>
  );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-xs font-semibold text-slate-400">{label}</span>

      <span className="max-w-[65%] text-right text-xs font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function Step({
  number,

  label,

  active = false,

  done = false,
}: {
  number: string;

  label: string;

  active?: boolean;

  done?: boolean;
}) {
  return (
    <div className="relative text-center">
      <div className="mb-1 flex items-center">
        <div className="h-px flex-1 bg-rose-100" />

        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-black ${
            active
              ? "border-rose-300 bg-rose-200 text-rose-700"
              : done
                ? "border-rose-400 bg-rose-50 text-rose-600"
                : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          {done ? <FiCheck /> : number}
        </span>

        <div className="h-px flex-1 bg-rose-100" />
      </div>

      <p
        className={`hidden text-[10px] sm:block ${
          active ? "font-black text-slate-800" : "font-medium text-slate-500"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

function PinkIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
      {children}
    </span>
  );
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#efdcdc] bg-white p-4 shadow-[0_8px_30px_rgba(140,70,90,.05)]">
      <h3 className="mb-4 text-sm font-black text-slate-900">{title}</h3>

      {children}
    </section>
  );
}

function Tool({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 rounded-xl p-2 text-center transition hover:bg-rose-50">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff4f5] text-rose-500">
        {icon}
      </span>

      <span className="text-[10px] font-semibold text-slate-600">{label}</span>
    </div>
  );
}

function SectionHeading({
  icon,

  title,

  subtitle,
}: {
  icon: ReactNode;

  title: string;

  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <PinkIcon>{icon}</PinkIcon>

      <div>
        <h3 className="font-black text-slate-900">{title}</h3>

        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}




function formatCost(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toLocaleString("en-US", {
    style: "currency",

    currency: "USD",

    maximumFractionDigits: 0,
  });
}

function formatBudget(
  value: number | null | undefined,

  currency?: string | null,
) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  try {
    return Number(value).toLocaleString("en-US", {
      style: "currency",

      currency: currency || "USD",

      maximumFractionDigits: 0,
    });
  } catch {
    return `${currency || "USD"} ${Number(value).toLocaleString("en-US")}`;
  }
}

function formatDate(value: string) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",

    month: "short",
  }).format(date);
}

function formatTime(value: string) {
  if (!value) return "";

  const parts = value.split(":");

  if (parts.length < 2) return value;

  return `${parts[0]}:${parts[1]}`;
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}
