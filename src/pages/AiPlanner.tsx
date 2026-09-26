import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiMessageSquare,
  FiUsers,
  FiZap,
  FiDollarSign,
  FiCheckCircle,
  FiEdit3,
  FiSearch,
  FiCompass,
  FiInfo,
  FiAlertTriangle,
  FiChevronRight,
  FiStar,
  FiCoffee,
  FiHome,
  FiTruck,
  FiActivity,
  FiRefreshCw,
  FiArrowRight,
  FiTarget,
  FiGlobe,
  FiHeart,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import {
  generateItineraryWithAI,
  type GeneratedItinerary,
} from "../service/aiService";
import { extractTripRequirements } from "../service/tripRequirementsService";

export default function AiPlanner() {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [proposal, setProposal] = useState<GeneratedItinerary | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const ejemplos = [
    "El cliente quiere viajar a Samaná durante una semana con su pareja. No conocen mucho el destino. Les interesa la playa, la naturaleza y probar comida local. Quieren descansar y hacer algunas excursiones, pero no desean un viaje demasiado cargado. Todavía no tienen un presupuesto definido.",

    "Una familia de 4 personas quiere viajar a Punta Cana por 5 días. Quieren descansar, disfrutar de la playa y hacer una excursión, pero sin tener demasiadas actividades. El presupuesto aproximado es de US$2,500.",

    "Una pareja quiere hacer un viaje romántico a París durante 6 días. Les interesan la gastronomía, museos, lugares emblemáticos y experiencias románticas. Tienen un presupuesto aproximado de US$3,000.",
  ];

  const usarEjemplo = (texto: string) => {
    setDescription(texto);
    setProposal(null);
    setError("");
    setLoadingStep("");
  };

  const generarPropuesta = async () => {
    if (!description.trim()) {
      setError("Escribe primero la información del viaje.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProposal(null);

      // =====================================================
      // PASO 1 — ENTENDER AL CLIENTE
      // =====================================================
      setLoadingStep("Analizando las necesidades del cliente...");

      const requirements = await extractTripRequirements(
        description.trim(),
      );

      console.log("Requisitos detectados:", requirements);

      if (!requirements.destination) {
        throw new Error(
          "No pude identificar el destino del viaje. Especifica el destino e inténtalo nuevamente.",
        );
      }

      // =====================================================
      // PASO 2 — PREPARAR EL ANÁLISIS
      // =====================================================
      setLoadingStep("Investigando el destino y sus posibilidades...");
      await delay(450);

      setLoadingStep("Relacionando el destino con el perfil del cliente...");
      await delay(450);

      // =====================================================
      // PASO 3 — PLANIFICAR
      // =====================================================
      setLoadingStep("Seleccionando experiencias que pueden encajar...");
      await delay(450);

      setLoadingStep("Diseñando un itinerario equilibrado...");
      await delay(450);

      setLoadingStep("Estimando el presupuesto del viaje...");
      await delay(450);

      // =====================================================
      // PASO 4 — GENERAR PROPUESTA
      // =====================================================
      setLoadingStep("Preparando la propuesta para el agente...");

      /*
       * NIA funciona como copiloto consultivo.
       * No se realizan búsquedas de vuelos/hoteles/ofertas
       * en tiempo real desde esta pantalla.
       *
       * Se envía un arreglo vacío para mantener compatibilidad
       * con el servicio actual si este todavía recibe ofertas.
       */
      const result = await generateItineraryWithAI(
        description.trim(),
        [],
      );

      setProposal(result);
    } catch (error) {
      console.error("Error generando propuesta:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo generar la propuesta.",
      );
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const nuevaPropuesta = () => {
    setProposal(null);
    setError("");
    setLoadingStep("");
    setCopied(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const copiarMensaje = async () => {
    if (!proposal?.client_message) return;

    try {
      await navigator.clipboard.writeText(proposal.client_message);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("No se pudo copiar:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#f5f8fc]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <header className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/itinerarios")}
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition group-hover:border-slate-300 group-hover:bg-slate-50">
              <FiArrowLeft size={15} />
            </span>

            Volver a itinerarios
          </button>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#12366b] to-[#0891b2] px-6 py-7 shadow-xl shadow-slate-200 sm:px-8 sm:py-9">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 ring-1 ring-white/15 backdrop-blur">
                  <FiZap size={25} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                      NIA
                    </span>

                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                      Copiloto inteligente
                    </span>
                  </div>

                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Convierte una necesidad en una propuesta.
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                    Cuéntale a NIA qué busca el cliente y te ayudará a
                    analizar su perfil, entender el destino y construir
                    una propuesta de viaje que puedas revisar y adaptar.
                  </p>
                </div>
              </div>

              <div className="hidden shrink-0 lg:block">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                    <FiTarget size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      Flujo de NIA
                    </p>
                    <p className="text-sm font-semibold text-white">
                      Cliente → Análisis → Propuesta
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            FORMULARIO
        ===================================================== */}
        {!proposal && (
          <>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

              {/* =================================================
                  FORMULARIO PRINCIPAL
              ================================================= */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiMessageSquare size={19} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Cuéntale qué necesita el cliente
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Puedes escribirlo con tus propias palabras.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <label className="mb-2.5 block text-sm font-semibold text-slate-800">
                    Información del viaje
                  </label>

                  <div className="relative">
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setError("");
                      }}
                      placeholder="Ejemplo: Una pareja quiere viajar a Samaná durante 5 días. Buscan playa, naturaleza y gastronomía. Quieren descansar, pero también hacer una o dos excursiones. No conocen el destino y todavía no tienen un presupuesto definido..."
                      rows={12}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-400 shadow-sm">
                      {description.length} caracteres
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
                    <FiInfo className="mt-0.5 shrink-0" />
                    <p>
                      No necesitas conocer perfectamente el destino.
                      NIA puede ayudarte a estructurar el análisis y las
                      recomendaciones.
                    </p>
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                          <FiAlertTriangle size={15} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-red-900">
                            No se pudo preparar la propuesta
                          </p>

                          <p className="mt-1 text-sm leading-6 text-red-700/80">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BUTTON */}
                  <button
                    type="button"
                    onClick={generarPropuesta}
                    disabled={!description.trim() || loading}
                    className="group mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                      <FiZap size={17} />
                    </span>

                    {loading
                      ? "NIA está preparando la propuesta..."
                      : "Preparar propuesta con NIA"}

                    {!loading && (
                      <FiArrowRight
                        size={17}
                        className="transition group-hover:translate-x-1"
                      />
                    )}
                  </button>

                  {/* PROGRESS */}
                  {loading && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
                      <div className="h-1 w-full overflow-hidden bg-blue-100">
                        <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      </div>

                      <div className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <FiSearch
                            className="animate-pulse"
                            size={17}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-blue-950">
                            {loadingStep || "Procesando solicitud..."}
                          </p>

                          <p className="mt-0.5 text-xs leading-5 text-blue-900/60">
                            NIA está analizando la información del viaje.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================
                  SIDEBAR
              ================================================= */}
              <div className="space-y-5">

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        NIA puede ayudarte a
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        Preparar el viaje
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiZap size={18} />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <InfoItem
                      icon={<FiUsers />}
                      title="Entender al cliente"
                      text="Perfil, intereses, estilo y presupuesto."
                    />

                    <InfoItem
                      icon={<FiGlobe />}
                      title="Conocer el destino"
                      text="Contexto, zonas, lugares y experiencias."
                    />

                    <InfoItem
                      icon={<FiStar />}
                      title="Recomendar experiencias"
                      text="Ideas alineadas con lo que busca el viajero."
                    />

                    <InfoItem
                      icon={<FiCalendar />}
                      title="Organizar el viaje"
                      text="Una distribución lógica y equilibrada."
                    />

                    <InfoItem
                      icon={<FiDollarSign />}
                      title="Estimar el presupuesto"
                      text="Desglose orientativo de los principales gastos."
                    />

                    <InfoItem
                      icon={<FiRefreshCw />}
                      title="Crear alternativas"
                      text="Distintas formas de plantear el mismo viaje."
                    />
                  </div>
                </div>

                {/* NIA NOTE */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 ring-1 ring-blue-100">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-200/30 blur-2xl" />

                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <FiCompass size={18} />
                    </div>

                    <h3 className="mt-4 font-bold text-slate-900">
                      Tú sigues teniendo el control
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      NIA prepara una guía de planificación. Tú decides
                      qué recomendaciones presentar, qué modificar y qué
                      verificar antes de cotizar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                EJEMPLOS
            ===================================================== */}
            <div className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
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

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {ejemplos.map((ejemplo, index) => {
                  const titles = [
                    "Escapada a Samaná",
                    "Familia en Punta Cana",
                    "Viaje romántico a París",
                  ];

                  const icons = [
                    <FiCompass key="compass" />,
                    <FiUsers key="users" />,
                    <FiHeart key="heart" />,
                  ];

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => usarEjemplo(ejemplo)}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                          {icons[index]}
                        </div>

                        <FiArrowRight
                          size={16}
                          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                        />
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-900">
                        {titles[index]}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {ejemplo}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =====================================================
                DISCLAIMER
            ===================================================== */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <FiInfo className="mt-0.5 shrink-0 text-slate-400" />

              <p className="text-xs leading-5 text-slate-500">
                Las recomendaciones y estimaciones de NIA son orientativas.
                Debes verificar precios, disponibilidad, horarios,
                condiciones y cualquier otro dato relevante antes de
                confirmar servicios con el cliente.
              </p>
            </div>
          </>
        )}

        {/* =====================================================
            PROPUESTA
        ===================================================== */}
        {proposal && (
          <Proposal
            proposal={proposal}
            onEdit={nuevaPropuesta}
            onCopyMessage={copiarMensaje}
            copied={copied}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PROPUESTA
========================================================= */

function Proposal({
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
  const destinationGuide = proposal.destination_guide;
  const clientAnalysis = proposal.client_analysis;
  const budget = proposal.budget;

  return (
    <section>

      {/* =====================================================
          SUCCESS HEADER
      ===================================================== */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiCheckCircle size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Propuesta preparada
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              NIA terminó el análisis. Revísalo antes de presentarlo
              al cliente.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <FiEdit3 />
          Ajustar solicitud
        </button>
      </div>

      {/* =====================================================
          MAIN PROPOSAL
      ===================================================== */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* HERO */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#12366b] to-[#0891b2] px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-cyan-200">
              <FiZap size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Propuesta preparada por NIA
              </span>
            </div>

            <h2 className="mt-3 max-w-4xl text-2xl font-bold tracking-tight sm:text-3xl">
              {proposal.title}
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200 sm:text-base">
              {proposal.summary}
            </p>
          </div>
        </div>

        {/* =================================================
            CLIENT ANALYSIS
        ================================================= */}
        {clientAnalysis && (
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <SectionTitle
              icon={<FiUsers />}
              eyebrow="Análisis"
              title="Entendiendo al cliente"
              description="Lo que NIA interpretó de las necesidades del viajero."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <AnalysisCard
                title="Perfil del viajero"
                text={
                  clientAnalysis.traveler_profile ||
                  "No se pudo determinar."
                }
              />

              <AnalysisCard
                title="Estilo de viaje"
                text={
                  clientAnalysis.trip_style ||
                  "No se pudo determinar."
                }
              />

              <AnalysisCard
                title="Nivel de presupuesto"
                text={
                  clientAnalysis.budget_level ||
                  "No especificado."
                }
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Intereses principales
                </p>

                {clientAnalysis.main_interests?.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {clientAnalysis.main_interests.map(
                      (interest, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"
                        >
                          {interest}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No especificados.
                  </p>
                )}
              </div>
            </div>

            {clientAnalysis.planning_notes?.length > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <FiInfo className="mt-0.5 shrink-0 text-amber-600" />

                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Notas de planificación
                    </p>

                    <ul className="mt-2 space-y-1.5">
                      {clientAnalysis.planning_notes.map(
                        (note, index) => (
                          <li
                            key={index}
                            className="text-sm leading-6 text-amber-900/75"
                          >
                            • {note}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            DESTINATION
        ================================================= */}
        {destinationGuide && (
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <SectionTitle
              icon={<FiGlobe />}
              eyebrow="Destino"
              title="Conoce el destino"
              description="Contexto útil para que el agente pueda asesorar mejor al viajero."
            />

            <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 sm:p-6">
              <p className="text-sm leading-7 text-slate-700">
                {destinationGuide.overview}
              </p>
            </div>

            {destinationGuide.best_for?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-slate-800">
                  Puede funcionar especialmente para
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {destinationGuide.best_for.map(
                    (item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                      >
                        <FiCheckCircle size={13} />
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            {destinationGuide.important_places?.length > 0 && (
              <div className="mt-7">
                <p className="text-sm font-bold text-slate-800">
                  Lugares relevantes
                </p>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {destinationGuide.important_places.map(
                    (place, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiMapPin />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-slate-900">
                                {place.name}
                              </h4>

                              {place.type && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                  {place.type}
                                </span>
                              )}
                            </div>

                            <p className="mt-1.5 text-sm leading-6 text-slate-600">
                              {place.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {destinationGuide.practical_information?.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <FiInfo className="mt-0.5 shrink-0 text-slate-500" />

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Información práctica
                    </p>

                    <ul className="mt-2 space-y-1.5">
                      {destinationGuide.practical_information.map(
                        (info, index) => (
                          <li
                            key={index}
                            className="text-sm leading-6 text-slate-600"
                          >
                            • {info}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            RECOMMENDATIONS
        ================================================= */}
        {proposal.recommendations?.length > 0 && (
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <SectionTitle
              icon={<FiStar />}
              eyebrow="Asesoría"
              title="Qué puedes recomendar"
              description="Experiencias que NIA considera coherentes con el perfil del cliente."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {proposal.recommendations.map(
                (recommendation, index) => (
                  <div
                    key={index}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FiStar size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <h4 className="font-bold text-slate-900">
                            {recommendation.name}
                          </h4>

                          {recommendation.estimated_cost !== null &&
                            recommendation.estimated_cost !==
                              undefined && (
                              <div className="shrink-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  Estimado
                                </p>

                                <p className="text-sm font-bold text-slate-800">
                                  {formatCost(
                                    recommendation.estimated_cost,
                                  )}
                                </p>
                              </div>
                            )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {recommendation.description}
                        </p>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ¿Por qué encaja?
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {recommendation.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* =================================================
            ITINERARY
        ================================================= */}
        <div className="border-b border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              icon={<FiCalendar />}
              eyebrow="Planificación"
              title="Itinerario recomendado"
              description="Una distribución equilibrada entre experiencias y tiempo libre."
            />

            <div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
              <FiActivity />
              {proposal.days.length}{" "}
              {proposal.days.length === 1
                ? "día"
                : "días"}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {proposal.days.map((day) => (
              <div
                key={day.day_number}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                {/* DAY HEADER */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                        {day.day_number}
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          Día {day.day_number}
                        </p>

                        <h4 className="mt-1 text-lg font-bold text-slate-900">
                          {day.title}
                        </h4>
                      </div>
                    </div>

                    {day.date && (
                      <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200 sm:self-auto">
                        <FiCalendar />
                        {formatDate(day.date)}
                      </div>
                    )}
                  </div>

                  <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
                    {day.description}
                  </p>
                </div>

                {/* ACTIVITIES */}
                <div className="divide-y divide-slate-100 bg-white">
                  {day.activities.length === 0 ? (
                    <div className="flex items-center gap-3 p-5 text-sm text-slate-400">
                      <FiCoffee />
                      Día libre o sin actividades específicas.
                    </div>
                  ) : (
                    day.activities.map(
                      (activity, activityIndex) => (
                        <div
                          key={`${day.day_number}-${activityIndex}`}
                          className="p-5 sm:p-6"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                              <FiMapPin />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h5 className="font-bold text-slate-900">
                                    {activity.title}
                                  </h5>

                                  {activity.type && (
                                    <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                                      {activity.type}
                                    </span>
                                  )}
                                </div>

                                {activity.estimated_cost !==
                                  null &&
                                  activity.estimated_cost !==
                                    undefined && (
                                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm font-bold text-slate-700">
                                      <FiDollarSign size={14} />
                                      {formatCost(
                                        activity.estimated_cost,
                                      )}
                                    </div>
                                  )}
                              </div>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {activity.description}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-3">
                                {activity.start_time && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                                    <FiClock />
                                    {formatTime(
                                      activity.start_time,
                                    )}

                                    {activity.end_time &&
                                      ` - ${formatTime(
                                        activity.end_time,
                                      )}`}
                                  </span>
                                )}

                                {activity.location && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                                    <FiMapPin />
                                    {activity.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            BUDGET
        ================================================= */}
        {budget && (
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <SectionTitle
              icon={<FiDollarSign />}
              eyebrow="Estimación"
              title="Presupuesto del viaje"
              description="Un cálculo orientativo para ayudarte a revisar la propuesta."
            />

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <BudgetRow
                  icon={<FiHome />}
                  label="Alojamiento"
                  value={budget.accommodation}
                />

                <BudgetRow
                  icon={<FiTruck />}
                  label="Transporte"
                  value={budget.transportation}
                />

                <BudgetRow
                  icon={<FiActivity />}
                  label="Actividades"
                  value={budget.activities}
                />

                <BudgetRow
                  icon={<FiCoffee />}
                  label="Alimentación"
                  value={budget.food}
                />

                <BudgetRow
                  icon={<FiPackage />}
                  label="Otros"
                  value={budget.other}
                  last
                />

                <div className="border-t border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-900">
                      Total estimado
                    </span>

                    <span className="text-xl font-bold text-blue-600">
                      {formatBudget(
                        budget.total,
                        budget.currency,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Presupuesto del cliente
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {budget.client_budget !== null &&
                    budget.client_budget !== undefined
                      ? formatBudget(
                          budget.client_budget,
                          budget.currency,
                        )
                      : "No especificado"}
                  </p>
                </div>

                {budget.client_budget !== null &&
                  budget.client_budget !== undefined &&
                  budget.remaining_budget !== null &&
                  budget.remaining_budget !== undefined && (
                    <div
                      className={`rounded-2xl border p-5 ${
                        budget.remaining_budget >= 0
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        Diferencia estimada
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        {formatBudget(
                          Math.abs(budget.remaining_budget),
                          budget.currency,
                        )}
                      </p>

                      <p className="mt-1 text-xs leading-5 opacity-70">
                        {budget.remaining_budget >= 0
                          ? "Disponible dentro del presupuesto indicado."
                          : "La propuesta supera el presupuesto indicado."}
                      </p>
                    </div>
                  )}

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs leading-5 text-blue-900/70">
                    Los importes son estimaciones orientativas. Verifica
                    precios y condiciones antes de preparar una
                    cotización definitiva.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            ALTERNATIVES
        ================================================= */}
        {proposal.alternatives?.length > 0 && (
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <SectionTitle
              icon={<FiRefreshCw />}
              eyebrow="Opciones"
              title="Alternativas para el cliente"
              description="Otras formas de plantear el viaje según sus prioridades."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {proposal.alternatives.map(
                (alternative, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      <FiRefreshCw size={17} />
                    </div>

                    <h4 className="mt-4 font-bold text-slate-900">
                      {alternative.name}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {alternative.description}
                    </p>

                    {alternative.estimated_total !== null &&
                      alternative.estimated_total !==
                        undefined && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Total estimado
                          </p>

                          <p className="mt-1 text-lg font-bold text-blue-600">
                            {formatBudget(
                              alternative.estimated_total,
                              budget?.currency,
                            )}
                          </p>
                        </div>
                      )}

                    {alternative.differences?.length > 0 && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Diferencias
                        </p>

                        <ul className="mt-2 space-y-1.5">
                          {alternative.differences.map(
                            (
                              difference,
                              differenceIndex,
                            ) => (
                              <li
                                key={differenceIndex}
                                className="flex items-start gap-2 text-xs leading-5 text-slate-600"
                              >
                                <FiChevronRight className="mt-0.5 shrink-0 text-blue-500" />
                                {difference}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* =================================================
            CONSIDERATIONS
        ================================================= */}
        {proposal.considerations?.length > 0 && (
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                  <FiAlertTriangle />
                </div>

                <div>
                  <h3 className="font-bold text-amber-900">
                    Antes de presentarlo
                  </h3>

                  <p className="mt-1 text-sm text-amber-900/60">
                    Aspectos que el agente debería revisar.
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {proposal.considerations.map(
                  (consideration, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm leading-6 text-amber-900/80"
                    >
                      <FiCheckCircle className="mt-1 shrink-0 text-amber-600" />
                      {consideration}
                    </li>
                  ),
                )}
              </ul>

              <div className="mt-5 rounded-2xl bg-white/70 p-4">
                <p className="text-xs leading-5 text-amber-900/70">
                  Esta propuesta es una herramienta de planificación.
                  No representa una reserva, disponibilidad ni
                  confirmación de servicios.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CLIENT MESSAGE
        ================================================= */}
        {proposal.client_message && (
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <FiMessageSquare />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        Comunicación
                      </p>

                      <h3 className="mt-1 font-bold text-slate-900">
                        Mensaje para el cliente
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={onCopyMessage}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
                    >
                      {copied ? (
                        <>
                          <FiCheck />
                          Copiado
                        </>
                      ) : (
                        <>
                          <FiCopy />
                          Copiar mensaje
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-5">
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                      {proposal.client_message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            AGENT EXPLANATION
        ================================================= */}
        {proposal.agent_explanation && (
          <div className="p-6 sm:p-8">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <FiMessageSquare />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Para el agente
                  </p>

                  <h3 className="mt-1 font-bold text-slate-900">
                    Cómo interpretar esta propuesta
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {proposal.agent_explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          ACTIONS
      ===================================================== */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <FiEdit3 />
          Ajustar solicitud
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-700"
        >
          <FiZap />
          Crear otra propuesta
        </button>
      </div>

      {/* FOOT NOTE */}
      <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <FiZap />
        NIA prepara. Tú revisas, adaptas y decides qué presentar.
      </div>
    </section>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            {eyebrow}
          </p>
        )}

        <h3 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ANALYSIS CARD
========================================================= */

function AnalysisCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   BUDGET ROW
========================================================= */

function BudgetRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null | undefined;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 sm:p-5 ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
          {icon}
        </div>

        <span className="text-sm text-slate-600">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold text-slate-800">
        {value !== null && value !== undefined
          ? formatCost(value)
          : "No especificado"}
      </span>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  if (!hours || !minutes) {
    return time;
  }

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("es-DO", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCost(cost: number) {
  return cost.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatBudget(
  amount: number | null | undefined,
  currency?: string,
) {
  if (amount === null || amount === undefined) {
    return "No especificado";
  }

  const normalizedCurrency = currency || "USD";

  return `${normalizedCurrency} ${amount.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  )}`;
}

