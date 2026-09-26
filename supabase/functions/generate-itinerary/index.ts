import "@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = "gemini-3.5-flash-lite";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* =========================================================
   SCHEMA DE RESPUESTA DE NIA
========================================================= */

const itinerarySchema = {
  type: "OBJECT",
  properties: {
    /* =====================================================
       INFORMACIÓN GENERAL
    ===================================================== */

    title: {
      type: "STRING",
    },

    summary: {
      type: "STRING",
    },

    agent_explanation: {
      type: "STRING",
    },

    /* =====================================================
       INFORMACIÓN FALTANTE
    ===================================================== */

    missing_information: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },

    /* =====================================================
       GUÍA DEL DESTINO
    ===================================================== */

    destination_guide: {
      type: "OBJECT",
      properties: {
        overview: {
          type: "STRING",
        },

        best_for: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },

        important_places: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: {
                type: "STRING",
              },

              description: {
                type: "STRING",
              },

              type: {
                type: "STRING",
              },
            },

            required: [
              "name",
              "description",
              "type",
            ],
          },
        },

        practical_information: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },
      },

      required: [
        "overview",
        "best_for",
        "important_places",
        "practical_information",
      ],
    },

    /* =====================================================
       ANÁLISIS DEL CLIENTE
    ===================================================== */

    client_analysis: {
      type: "OBJECT",
      properties: {
        traveler_profile: {
          type: "STRING",
        },

        main_interests: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },

        trip_style: {
          type: "STRING",
        },

        budget_level: {
          type: "STRING",
        },

        planning_notes: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },
      },

      required: [
        "traveler_profile",
        "main_interests",
        "trip_style",
        "budget_level",
        "planning_notes",
      ],
    },

    /* =====================================================
       RECOMENDACIONES
    ===================================================== */

    recommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: {
            type: "STRING",
          },

          description: {
            type: "STRING",
          },

          reason: {
            type: "STRING",
          },

          estimated_cost: {
            type: ["NUMBER", "NULL"],
          },

          offer_id: {
            type: ["STRING", "NULL"],
          },

          source: {
            type: "STRING",
          },

          needs_verification: {
            type: "BOOLEAN",
          },
        },

        required: [
          "name",
          "description",
          "reason",
          "estimated_cost",
          "offer_id",
          "source",
          "needs_verification",
        ],
      },
    },

    /* =====================================================
       PRESUPUESTO
    ===================================================== */

    budget: {
      type: "OBJECT",
      properties: {
        currency: {
          type: "STRING",
        },

        accommodation: {
          type: "NUMBER",
        },

        transportation: {
          type: "NUMBER",
        },

        activities: {
          type: "NUMBER",
        },

        food: {
          type: "NUMBER",
        },

        other: {
          type: "NUMBER",
        },

        total: {
          type: "NUMBER",
        },

        client_budget: {
          type: ["NUMBER", "NULL"],
        },

        remaining_budget: {
          type: ["NUMBER", "NULL"],
        },
      },

      required: [
        "currency",
        "accommodation",
        "transportation",
        "activities",
        "food",
        "other",
        "total",
        "client_budget",
        "remaining_budget",
      ],
    },

    /* =====================================================
       NOTAS DEL PRESUPUESTO
    ===================================================== */

    budget_notes: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },

    /* =====================================================
       ALTERNATIVAS
    ===================================================== */

    alternatives: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: {
            type: "STRING",
          },

          description: {
            type: "STRING",
          },

          estimated_total: {
            type: ["NUMBER", "NULL"],
          },

          differences: {
            type: "ARRAY",
            items: {
              type: "STRING",
            },
          },
        },

        required: [
          "name",
          "description",
          "estimated_total",
          "differences",
        ],
      },
    },

    /* =====================================================
       CONSIDERACIONES
    ===================================================== */

    considerations: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },

    /* =====================================================
       SUPUESTOS
    ===================================================== */

    trip_assumptions: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },

    /* =====================================================
       CONSEJOS DE VENTA
    ===================================================== */

    sales_tips: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },

    /* =====================================================
       MENSAJE PARA EL CLIENTE
    ===================================================== */

    client_message: {
      type: "STRING",
    },

    /* =====================================================
       ITINERARIO
    ===================================================== */

    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day_number: {
            type: "INTEGER",
          },

          date: {
            type: ["STRING", "NULL"],
          },

          title: {
            type: "STRING",
          },

          description: {
            type: "STRING",
          },

          activities: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: {
                  type: "STRING",
                },

                description: {
                  type: "STRING",
                },

                start_time: {
                  type: ["STRING", "NULL"],
                },

                end_time: {
                  type: ["STRING", "NULL"],
                },

                location: {
                  type: ["STRING", "NULL"],
                },

                type: {
                  type: "STRING",
                },

                estimated_cost: {
                  type: ["NUMBER", "NULL"],
                },

                offer_id: {
                  type: ["STRING", "NULL"],
                },

                source: {
                  type: "STRING",
                },

                needs_verification: {
                  type: "BOOLEAN",
                },
              },

              required: [
                "title",
                "description",
                "start_time",
                "end_time",
                "location",
                "type",
                "estimated_cost",
                "offer_id",
                "source",
                "needs_verification",
              ],
            },
          },
        },

        required: [
          "day_number",
          "date",
          "title",
          "description",
          "activities",
        ],
      },
    },
  },

  required: [
    "title",
    "summary",
    "agent_explanation",
    "missing_information",
    "destination_guide",
    "client_analysis",
    "recommendations",
    "budget",
    "budget_notes",
    "alternatives",
    "considerations",
    "trip_assumptions",
    "sales_tips",
    "client_message",
    "days",
  ],
};

/* =========================================================
   FUNCIÓN PRINCIPAL
========================================================= */

export default {
  fetch: async (req: Request) => {
    /* =====================================================
       CORS
    ===================================================== */

    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    try {
      /* =====================================================
         API KEY
      ===================================================== */

      if (!GEMINI_API_KEY) {
        throw new Error(
          "No está configurada la variable GEMINI_API_KEY en Supabase.",
        );
      }

      /* =====================================================
         MÉTODO
      ===================================================== */

      if (req.method !== "POST") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Método no permitido.",
          }),
          {
            status: 405,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      /* =====================================================
         BODY
      ===================================================== */

      const body = await req.json();

      const description = body?.description;

      const offers = Array.isArray(body?.offers)
        ? body.offers
        : [];

      if (
        !description ||
        typeof description !== "string" ||
        !description.trim()
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Debes proporcionar la descripción del viaje.",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      /* =====================================================
         OFERTAS DISPONIBLES
      ===================================================== */

      const offersText =
        offers.length > 0
          ? JSON.stringify(offers, null, 2)
          : "No existen ofertas disponibles para esta solicitud.";

      /* =====================================================
         PROMPT DE NIA
      ===================================================== */

      const prompt = `
Eres NIA, el copiloto inteligente de Achuen Travel.

Tu función es ayudar a un AGENTE DE VIAJES a entender al cliente,
conocer el destino, analizar opciones disponibles y preparar una
propuesta profesional que el agente pueda revisar antes de
presentársela al cliente.

NO eres simplemente un generador de itinerarios.

Tu trabajo consiste en:

1. Entender la solicitud del cliente.
2. Detectar información importante.
3. Identificar qué información falta.
4. Explicar el destino al operador.
5. Analizar el perfil del viajero.
6. Utilizar las ofertas disponibles.
7. Separar recomendaciones generales de ofertas reales.
8. Preparar un itinerario coherente.
9. Calcular un presupuesto basado únicamente en información disponible.
10. Crear alternativas cuando tenga sentido.
11. Advertir al operador qué debe verificar.
12. Darle consejos para presentar la propuesta.
13. Preparar un mensaje natural para el cliente.

=========================================================
REGLA FUNDAMENTAL
=========================================================

NUNCA inventes:

- reservas
- disponibilidad confirmada
- precios de vuelos
- precios de hoteles
- proveedores
- promociones
- horarios específicos no proporcionados
- políticas de hoteles
- políticas de aerolíneas
- información personal del cliente
- fechas exactas que el cliente no haya proporcionado

Una recomendación general NO es una oferta de Achuen Travel.

Una oferta solamente debe considerarse oferta disponible cuando
aparezca dentro de los datos proporcionados por el sistema.

=========================================================
1. ANÁLISIS DEL CLIENTE
=========================================================

Analiza cuidadosamente la solicitud.

Identifica cuando estén disponibles:

- destino
- país
- ciudades
- duración
- fechas
- cantidad de viajeros
- adultos
- niños
- pareja/familia/amigos/viaje individual
- presupuesto
- intereses
- preferencias
- estilo de viaje
- ritmo
- necesidades especiales
- expectativas

No inventes información.

Si algo no está indicado, no lo presentes como un hecho.

=========================================================
2. INFORMACIÓN FALTANTE
=========================================================

El campo missing_information es MUY IMPORTANTE.

Indica al operador qué debe preguntarle al cliente antes de
cotizar correctamente.

Por ejemplo:

- fechas exactas
- ciudad de salida
- cantidad de viajeros
- edades de niños
- presupuesto
- categoría de hotel
- cantidad de habitaciones
- preferencia de vuelos
- equipaje
- tipo de alimentación
- preferencias de actividades

No incluyas preguntas que ya hayan sido respondidas.

Si la información ya está disponible, no la marques como faltante.

=========================================================
3. GUÍA DEL DESTINO
=========================================================

destination_guide está destinada al OPERADOR.

El operador puede no conocer el destino.

Explícale:

- qué caracteriza al destino
- qué tipo de viajeros lo disfrutan
- zonas importantes
- lugares interesantes
- experiencias disponibles
- gastronomía
- naturaleza
- cultura
- playas
- entretenimiento
- información práctica

Distingue entre información general y datos que necesitan
confirmación.

No inventes precios, horarios, disponibilidad o reservas.

=========================================================
4. ANÁLISIS DEL VIAJERO
=========================================================

Explica:

- quién parece ser el viajero
- qué busca
- qué tipo de viaje encaja
- qué actividades podrían interesarle
- qué debería evitarse
- cómo debería organizarse el viaje

El análisis debe basarse únicamente en la información disponible.

=========================================================
5. OFERTAS DEL SISTEMA
=========================================================

Estas son las ofertas que el sistema encontró:

${offersText}

Utiliza estas ofertas cuando sean relevantes.

IMPORTANTE:

Si una oferta tiene:

offer_id

ese identificador debe conservarse cuando se utilice.

Si una oferta tiene precio, utiliza ese precio y no inventes otro.

Si una oferta pertenece al inventario de Achuen Travel,
source debe indicar:

"achuen_travel_inventory"

Si proviene de un proveedor externo:

source debe indicar:

"external_provider"

Si es una recomendación general creada por conocimiento del destino:

source debe indicar:

"general_recommendation"

Nunca conviertas una recomendación general en una oferta.

=========================================================
6. VUELOS
=========================================================

Si existen ofertas de vuelos:

- identifica las opciones
- utiliza sus precios
- prioriza opciones económicas cuando tenga sentido
- no inventes horarios
- no inventes escalas
- no inventes equipaje
- no afirmes disponibilidad confirmada

Cuando posteriormente existan APIs reales de vuelos,
esas opciones podrán ser utilizadas como datos reales del sistema.

=========================================================
7. HOTELES
=========================================================

Si existen ofertas de hoteles:

- utiliza los precios disponibles
- considera la categoría cuando esté disponible
- considera la ubicación cuando esté disponible
- considera la duración
- considera las preferencias del cliente

No inventes:

- desayuno
- comidas
- habitaciones
- disponibilidad
- políticas
- cancelaciones

si esos datos no están disponibles.

=========================================================
8. RECOMENDACIONES
=========================================================

Recomienda experiencias relacionadas con el cliente.

Ejemplos:

- playas
- naturaleza
- excursiones
- gastronomía
- cultura
- museos
- aventura
- actividades familiares
- actividades románticas
- descanso
- compras
- entretenimiento

Cada recomendación debe explicar POR QUÉ tiene sentido para ese cliente.

Si no existe precio confiable:

estimated_cost = null

Si es una recomendación general:

offer_id = null

source = "general_recommendation"

needs_verification = true

=========================================================
9. ITINERARIO
=========================================================

Construye un itinerario profesional.

Debe:

- respetar la duración
- respetar el ritmo del cliente
- evitar sobrecargar los días
- considerar llegada y salida
- agrupar actividades razonablemente
- dejar tiempo libre
- evitar actividades incompatibles
- mantener coherencia geográfica cuando sea posible

No inventes fechas.

Si no existe fecha de inicio:

date = null

No inventes horas.

Si no existe horario:

start_time = null
end_time = null

=========================================================
10. PRESUPUESTO
=========================================================

El presupuesto debe calcularse utilizando primero los precios
proporcionados por las ofertas.

Categorías:

- accommodation
- transportation
- activities
- food
- other

La fórmula debe ser:

total =
accommodation +
transportation +
activities +
food +
other

Si el cliente indicó presupuesto:

client_budget = presupuesto del cliente

remaining_budget =
client_budget - total

Si no indicó presupuesto:

client_budget = null
remaining_budget = null

NO inventes el presupuesto del cliente.

No inventes precios para completar un presupuesto.

Si una categoría no tiene costos conocidos:

utiliza 0.

Los precios disponibles deben tratarse como datos de referencia,
no como reservas confirmadas.

=========================================================
11. NOTAS DEL PRESUPUESTO
=========================================================

budget_notes debe explicar cualquier limitación.

Por ejemplo:

- "El precio del vuelo debe confirmarse."
- "No se encontró una tarifa de hotel disponible."
- "La alimentación no está incluida en las ofertas disponibles."
- "El costo de traslado no fue proporcionado."

No exageres las advertencias.

=========================================================
12. ALTERNATIVAS
=========================================================

Crea alternativas cuando tenga sentido.

Ejemplos:

- opción económica
- opción equilibrada
- opción confort

Explica claramente qué cambia.

No inventes precios.

Si no puedes calcular el total:

estimated_total = null

=========================================================
13. CONSIDERACIONES
=========================================================

Indica al agente qué debe verificar antes de vender.

Ejemplos:

- disponibilidad
- precio final
- horarios
- equipaje
- políticas
- transporte
- duración de excursiones
- requisitos de entrada
- documentación
- condiciones del proveedor

=========================================================
14. SUPUESTOS DEL VIAJE
=========================================================

trip_assumptions debe indicar cualquier cosa que NIA haya tenido
que asumir para poder construir la propuesta.

Ejemplos:

- "Se asumió que los viajeros son adultos porque no se indicaron niños."
- "Se asumió un ritmo de viaje equilibrado."
- "No se indicó categoría de hotel."

No conviertas un supuesto en un dato confirmado.

=========================================================
15. CONSEJOS DE VENTA
=========================================================

sales_tips debe ayudar al agente a presentar la propuesta.

Ejemplos:

- qué destacar
- qué explicar primero
- qué alternativa ofrecer
- qué objeciones podría tener el cliente
- qué diferencia existe entre las opciones

No manipules al cliente.

Los consejos deben ser profesionales y transparentes.

=========================================================
16. MENSAJE PARA EL CLIENTE
=========================================================

client_message debe ser un mensaje natural que el agente pueda
copiar y adaptar.

Debe:

- sonar humano
- ser profesional
- explicar la propuesta
- destacar los beneficios
- mencionar que precios y disponibilidad deben confirmarse cuando corresponda

No debe sonar como una respuesta técnica de IA.

No debe afirmar que una reserva está hecha.

=========================================================
17. VERIFICACIÓN
=========================================================

Cada recomendación y actividad debe indicar:

needs_verification

true cuando:

- el precio necesita confirmación
- la disponibilidad necesita confirmación
- el horario necesita confirmación
- la información proviene de una recomendación general
- falta información operacional

Puede ser false solamente cuando los datos proporcionados por el
sistema son suficientemente concretos para esa información.

Aun así, nunca afirmes que existe una reserva si no existe.

=========================================================
18. COHERENCIA
=========================================================

Mantén coherencia entre:

- cliente
- duración
- actividades
- ofertas
- presupuesto
- recomendaciones
- alternativas

No coloques una actividad cuyo costo contradiga el presupuesto
calculado.

Si una oferta tiene precio conocido, utiliza ese precio.

=========================================================
19. IDIOMA
=========================================================

Todo debe responderse en español.

=========================================================
SOLICITUD DEL CLIENTE
=========================================================

${description}

=========================================================
OFERTAS DISPONIBLES
=========================================================

${offersText}

=========================================================
OBJETIVO FINAL
=========================================================

Prepara una propuesta profesional para que un agente de Achuen Travel
pueda:

1. entender al cliente
2. entender el destino
3. conocer qué opciones tiene
4. identificar qué falta preguntar
5. comparar alternativas
6. preparar un itinerario
7. revisar un presupuesto
8. saber qué debe verificar
9. explicar la propuesta
10. convertirla posteriormente en una cotización

Recuerda:

NO inventes reservas.
NO inventes disponibilidad.
NO inventes precios.
NO presentes recomendaciones generales como ofertas de Achuen Travel.
=========================================================
`;

      /* =====================================================
         GEMINI
      ===================================================== */

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],

            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: itinerarySchema,
              temperature: 0.4,
            },
          }),
        },
      );

      /* =====================================================
         RESPUESTA GEMINI
      ===================================================== */

      const geminiData = await geminiResponse.json();

      if (!geminiResponse.ok) {
        console.error(
          "Error de Gemini:",
          JSON.stringify(geminiData),
        );

        const message =
          geminiData?.error?.message ||
          "Gemini devolvió un error.";

        throw new Error(
          `Gemini ${geminiResponse.status}: ${message}`,
        );
      }

      /* =====================================================
         TEXTO GENERADO
      ===================================================== */

      const output =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!output) {
        console.error(
          "Respuesta inesperada de Gemini:",
          JSON.stringify(geminiData),
        );

        throw new Error(
          "Gemini no devolvió ninguna propuesta.",
        );
      }

      /* =====================================================
         CONVERTIR JSON
      ===================================================== */

      let itinerary;

      try {
        itinerary = JSON.parse(output);
      } catch (parseError) {
        console.error(
          "Error convirtiendo respuesta de Gemini:",
          parseError,
        );

        console.error(
          "Respuesta recibida:",
          output,
        );

        throw new Error(
          "Gemini devolvió una respuesta que no pudo convertirse en JSON.",
        );
      }

      /* =====================================================
         NORMALIZACIÓN DE SEGURIDAD
      ===================================================== */

      itinerary = {
        title: itinerary?.title || "Propuesta de viaje",

        summary:
          itinerary?.summary ||
          "Propuesta generada por NIA.",

        agent_explanation:
          itinerary?.agent_explanation || "",

        missing_information:
          Array.isArray(
            itinerary?.missing_information,
          )
            ? itinerary.missing_information
            : [],

        destination_guide:
          itinerary?.destination_guide || {
            overview: "",
            best_for: [],
            important_places: [],
            practical_information: [],
          },

        client_analysis:
          itinerary?.client_analysis || {
            traveler_profile: "",
            main_interests: [],
            trip_style: "",
            budget_level: "",
            planning_notes: [],
          },

        recommendations:
          Array.isArray(
            itinerary?.recommendations,
          )
            ? itinerary.recommendations
            : [],

        budget:
          itinerary?.budget || {
            currency: "USD",
            accommodation: 0,
            transportation: 0,
            activities: 0,
            food: 0,
            other: 0,
            total: 0,
            client_budget: null,
            remaining_budget: null,
          },

        budget_notes:
          Array.isArray(itinerary?.budget_notes)
            ? itinerary.budget_notes
            : [],

        alternatives:
          Array.isArray(itinerary?.alternatives)
            ? itinerary.alternatives
            : [],

        considerations:
          Array.isArray(itinerary?.considerations)
            ? itinerary.considerations
            : [],

        trip_assumptions:
          Array.isArray(
            itinerary?.trip_assumptions,
          )
            ? itinerary.trip_assumptions
            : [],

        sales_tips:
          Array.isArray(itinerary?.sales_tips)
            ? itinerary.sales_tips
            : [],

        client_message:
          itinerary?.client_message || "",

        days:
          Array.isArray(itinerary?.days)
            ? itinerary.days
            : [],
      };

      /* =====================================================
         NORMALIZAR RECOMENDACIONES
      ===================================================== */

      itinerary.recommendations =
        itinerary.recommendations.map(
          (recommendation: any) => ({
            name: recommendation?.name || "",
            description:
              recommendation?.description || "",
            reason:
              recommendation?.reason || "",
            estimated_cost:
              typeof recommendation?.estimated_cost ===
              "number"
                ? recommendation.estimated_cost
                : null,
            offer_id:
              recommendation?.offer_id || null,
            source:
              recommendation?.source ||
              "general_recommendation",
            needs_verification:
              recommendation?.needs_verification !==
              false,
          }),
        );

      /* =====================================================
         NORMALIZAR DÍAS
      ===================================================== */

      itinerary.days = itinerary.days.map(
        (day: any) => ({
          day_number:
            typeof day?.day_number === "number"
              ? day.day_number
              : 0,

          date:
            day?.date || null,

          title:
            day?.title || "",

          description:
            day?.description || "",

          activities:
            Array.isArray(day?.activities)
              ? day.activities.map(
                  (activity: any) => ({
                    title:
                      activity?.title || "",

                    description:
                      activity?.description || "",

                    start_time:
                      activity?.start_time || null,

                    end_time:
                      activity?.end_time || null,

                    location:
                      activity?.location || null,

                    type:
                      activity?.type || "general",

                    estimated_cost:
                      typeof activity?.estimated_cost ===
                      "number"
                        ? activity.estimated_cost
                        : null,

                    offer_id:
                      activity?.offer_id || null,

                    source:
                      activity?.source ||
                      (
                        activity?.offer_id
                          ? "achuen_travel_inventory"
                          : "general_recommendation"
                      ),

                    needs_verification:
                      activity?.needs_verification !==
                      false,
                  }),
                )
              : [],
        }),
      );

      /* =====================================================
         VALIDACIÓN BÁSICA DEL PRESUPUESTO
      ===================================================== */

      const budget =
        itinerary.budget;

      const calculatedTotal =
        Number(budget.accommodation || 0) +
        Number(budget.transportation || 0) +
        Number(budget.activities || 0) +
        Number(budget.food || 0) +
        Number(budget.other || 0);

      itinerary.budget.total =
        Math.round(calculatedTotal * 100) / 100;

      if (
        typeof itinerary.budget.client_budget ===
        "number"
      ) {
        itinerary.budget.remaining_budget =
          Math.round(
            (
              itinerary.budget.client_budget -
              itinerary.budget.total
            ) * 100
          ) / 100;
      } else {
        itinerary.budget.client_budget = null;
        itinerary.budget.remaining_budget = null;
      }

      /* =====================================================
         RESPUESTA
      ===================================================== */

      return new Response(
        JSON.stringify({
          success: true,
          itinerary,
        }),
        {
          status: 200,

          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error(
        "Error generando itinerario:",
        error,
      );

      return new Response(
        JSON.stringify({
          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Error generando el itinerario.",
        }),
        {
          status: 500,

          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
  },
};
