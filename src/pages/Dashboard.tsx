import type { ReactNode } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaChevronRight,
  FaGlobeAmericas,
  FaMapMarkerAlt,
  FaPlaneDeparture,
  FaPlus,
  FaRegCompass,
  FaRegFileAlt,
  FaRobot,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#bd456c] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a5365a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bd456c]";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#ecdde0] bg-white/80 px-5 py-3 text-sm font-semibold text-[#684d57] transition-colors hover:bg-[#fbeef1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bd456c]";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const nombre =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="min-h-screen min-w-0 bg-[#fcf8f6] text-[#382e33]">
      <main className="mx-auto max-w-[1500px] space-y-7 px-4 py-6 sm:px-7 lg:px-9 lg:py-9">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9b536a]">
              Tu espacio de viajes
            </p>
            <h1 className="break-words font-serif text-3xl tracking-tight sm:text-4xl">
              Hola, {nombre}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#7a6a71]">
              Cada gran viaje empieza con una buena idea. Hagámosla realidad.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/itinerarios/ia")}
            className={`${primaryButton} shrink-0`}
          >
            <FaPlus aria-hidden="true" size={11} /> Crear itinerario
          </button>
        </header>

        <section
          aria-labelledby="nia-title"
          className="relative overflow-hidden rounded-[24px] border border-[#efdbdf] bg-[#f9e9ec]"
        >
          <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border-[50px] border-white/25" />
          <div className="relative grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center lg:p-10">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white bg-white/65 px-3 py-1.5 text-xs font-semibold text-[#98506a]">
                <FaRobot aria-hidden="true" /> NIA · Tu asistente de viajes
              </div>
              <h2
                id="nia-title"
                className="max-w-xl font-serif text-3xl leading-tight tracking-tight sm:text-[42px]"
              >
                Tú conoces a tus clientes.
                <br />
                <span className="italic text-[#aa4164]">
                  NIA te ayuda a inspirarlos.
                </span>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#765e68]">
                Cuéntale qué viaje tienen en mente y prepara una propuesta a su
                medida. Organiza las ideas, revisa los detalles y dale tu toque
                personal.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/itinerarios/ia")}
                  className={primaryButton}
                >
                  <FaRobot aria-hidden="true" /> Preparar con NIA{" "}
                  <FaArrowRight aria-hidden="true" size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/itinerarios")}
                  className={secondaryButton}
                >
                  Mis itinerarios
                </button>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#856b76]">
                Una propuesta pensada contigo, para cada viajero.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-md rounded-2xl border border-white bg-[#fffcfa] p-5 shadow-[0_14px_45px_-22px_rgba(119,63,83,0.4)] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#f1e5e8] pb-4">
                <span className="font-serif text-lg">
                  De una idea a un viaje
                </span>
                <span className="rounded-full bg-[#f9edf0] px-2.5 py-1 text-[10px] font-semibold text-[#96536a]">
                  Así funciona
                </span>
              </div>
              <div className="space-y-5">
                <ProcessStep
                  number="01"
                  title="Cuéntale sobre tu cliente"
                  text="Destino, fechas, presupuesto y lo que le gusta."
                />
                <ProcessStep
                  number="02"
                  title="Dale forma con NIA"
                  text="Prepara una base para su próxima experiencia."
                />
                <ProcessStep
                  number="03"
                  title="Hazla tuya"
                  text="Revisa y ajusta la propuesta antes de presentarla."
                  last
                />
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f6f1ec] px-3 py-3 text-xs text-[#7b695e]">
                <FaCheck
                  aria-hidden="true"
                  className="shrink-0 text-[#8a9c7f]"
                />{" "}
                Tú decides los detalles de cada propuesta.
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="Herramientas de la agencia"
          className="grid gap-4 md:grid-cols-3"
        >
          <FeatureCard
            icon={<FaPlaneDeparture />}
            title="Tus itinerarios"
            text="Cada viaje, organizado a tu manera."
            action="Ver propuestas"
            onClick={() => navigate("/itinerarios")}
          />
          <FeatureCard
            icon={<FaUsers />}
            title="Tus clientes"
            text="Conoce a las personas detrás de cada viaje."
            action="Gestionar clientes"
            onClick={() => navigate("/clientes")}
          />
          <FeatureCard
            icon={<FaGlobeAmericas />}
            title="Nuevos destinos"
            text="Encuentra inspiración para su próxima aventura."
            action="Explorar destinos"
            onClick={() => navigate("/destinos")}
          />
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section
            aria-labelledby="workspace-title"
            className="overflow-hidden rounded-2xl border border-[#eee2e4] bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3ebec] px-5 py-5 sm:px-6">
              <div>
                <h2 id="workspace-title" className="font-serif text-xl">
                  Tu próximo itinerario
                </h2>
                <p className="mt-1 text-xs text-[#82737b]">
                  Un espacio para convertir ideas en experiencias.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/itinerarios")}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-[#a43d60] hover:bg-[#fcf1f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#bd456c]"
              >
                Ver itinerarios <FaArrowRight aria-hidden="true" size={10} />
              </button>
            </div>
            <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
              <div
                aria-hidden="true"
                className="relative flex min-h-[230px] items-center justify-center overflow-hidden rounded-xl bg-[#f7efea] p-7"
              >
                <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full border-[28px] border-[#eee0d9]" />
                <div className="relative w-full max-w-[205px] -rotate-3 rounded-lg border border-[#eee0d9] bg-[#fffcf9] p-5 shadow-md">
                  <FaPlaneDeparture className="mb-5 text-xl text-[#b44d6e]" />
                  <p className="font-serif text-2xl leading-tight">
                    Un viaje
                    <br />
                    <span className="italic text-[#ae5571]">inolvidable.</span>
                  </p>
                  <div className="my-4 h-px bg-[#eadce0]" />
                  <div className="flex items-center gap-2 text-[10px] text-[#87777f]">
                    <FaMapMarkerAlt /> El destino lo eliges tú
                  </div>
                  <div className="mt-3 h-1.5 w-4/5 rounded bg-[#f0e5e7]" />
                  <div className="mt-2 h-1.5 w-3/5 rounded bg-[#f0e5e7]" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a45b74]">
                  Diseña experiencias
                </span>
                <h3 className="mt-3 font-serif text-2xl leading-snug">
                  Menos tiempo preparando.
                  <br />
                  Más tiempo acompañando.
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#82737b]">
                  Empieza por lo que necesita tu cliente. Con NIA puedes
                  preparar una propuesta y continuar trabajando en ella desde
                  tus itinerarios.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/itinerarios/ia")}
                  className={`${primaryButton} mt-5`}
                >
                  <FaPlus aria-hidden="true" size={10} /> Empezar una propuesta
                </button>
              </div>
            </div>
          </section>

          <aside aria-label="Accesos y consejos" className="space-y-5">
            <section className="rounded-2xl border border-[#eee2e4] bg-white p-5">
              <h2 className="mb-3 font-serif text-lg">¿Qué hacemos hoy?</h2>
              <QuickAction
                icon={<FaRobot />}
                title="Trabajar con NIA"
                text="Prepara una propuesta"
                onClick={() => navigate("/itinerarios/ia")}
              />
              <QuickAction
                icon={<FaUsers />}
                title="Atender a un cliente"
                text="Consulta su información"
                onClick={() => navigate("/clientes")}
              />
              <QuickAction
                icon={<FaRegFileAlt />}
                title="Revisar itinerarios"
                text="Retoma tus propuestas"
                onClick={() => navigate("/itinerarios")}
              />
              <QuickAction
                icon={<FaRegCompass />}
                title="Buscar inspiración"
                text="Explora otros destinos"
                onClick={() => navigate("/destinos")}
              />
            </section>
            <section className="rounded-2xl border border-[#eddee1] bg-[#faeef1] p-5">
              <div className="mb-3 flex items-center gap-2 text-[#a44f6d]">
                <FaRegCompass aria-hidden="true" />
                <span className="text-xs font-semibold">
                  Un detalle que hace la diferencia
                </span>
              </div>
              <p className="font-serif text-xl leading-snug">
                El mejor viaje empieza escuchando.
              </p>
              <p className="mt-2 text-xs leading-6 text-[#806772]">
                Antes de crear la propuesta, pregunta por su presupuesto, sus
                fechas y esa experiencia que no se quiere perder.
              </p>
            </section>
          </aside>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eee2e4] pt-5 text-xs text-[#88767e]">
          <span className="inline-flex items-center gap-2">
            <FaPlaneDeparture aria-hidden="true" className="text-[#b75877]" />{" "}
            Tu agencia, más cerca de cada viajero.
          </span>
          <span className="font-serif text-sm italic">
            Crea, personaliza y acompaña.
          </span>
        </footer>
      </main>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  text,
  last = false,
}: {
  number: string;
  title: string;
  text: string;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      {!last && (
        <span
          aria-hidden="true"
          className="absolute left-4 top-9 h-7 w-px bg-[#ead6dc]"
        />
      )}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f8e8ed] text-[10px] font-semibold text-[#a34666]">
        {number}
      </span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#83717a]">{text}</p>
      </div>
    </div>
  );
}

type ActionProps = {
  icon: ReactNode;
  title: string;
  text: string;
  onClick: () => void;
};

function FeatureCard({
  icon,
  title,
  text,
  action,
  onClick,
}: ActionProps & { action: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-[#eee2e4] bg-white p-5 text-left transition-colors hover:border-[#d6a4b5] hover:bg-[#fffafb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd456c]"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#faf0f2] text-[#ad4d6e]"
        >
          {icon}
        </span>
        <div>
          <h2 className="font-serif text-xl">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[#83717a]">{text}</p>
        </div>
      </div>
      <span className="mt-4 flex items-center justify-between border-t border-[#f4ebed] pt-3 text-xs font-semibold text-[#9c4564]">
        {action}
        <FaArrowRight aria-hidden="true" size={10} />
      </span>
    </button>
  );
}

function QuickAction({ icon, title, text, onClick }: ActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-[#fcf1f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#bd456c]"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fcf1f4] text-sm text-[#a4526e]"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold">{title}</span>
        <span className="mt-1 block text-[11px] text-[#88767f]">{text}</span>
      </span>
      <FaChevronRight
        aria-hidden="true"
        size={9}
        className="shrink-0 text-[#b991a0]"
      />
    </button>
  );
}
