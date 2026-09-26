import "@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = "gemini-3.5-flash-lite";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const requirementsSchema = {
  type: "OBJECT",
  properties: {
    destination: {
      type: "STRING",
      nullable: true,
    },
    country: {
      type: "STRING",
      nullable: true,
    },
    travelers: {
      type: "INTEGER",
      nullable: true,
    },
    start_date: {
      type: "STRING",
      nullable: true,
    },
    end_date: {
      type: "STRING",
      nullable: true,
    },
    duration_days: {
      type: "INTEGER",
      nullable: true,
    },
    budget: {
      type: "NUMBER",
      nullable: true,
    },
    currency: {
      type: "STRING",
      nullable: true,
    },
    trip_type: {
      type: "STRING",
      nullable: true,
    },
    interests: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },
    special_requirements: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },
  },
  required: [
    "destination",
    "country",
    "travelers",
    "start_date",
    "end_date",
    "duration_days",
    "budget",
    "currency",
    "trip_type",
    "interests",
    "special_requirements",
  ],
};

export default {
  fetch: async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    try {
      if (!GEMINI_API_KEY) {
        throw new Error(
          "No está configurada GEMINI_API_KEY."
        );
      }

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
          }
        );
      }

      const body = await req.json();

      const description = body?.description;

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
          }
        );
      }

      const prompt = `
Eres un asistente especializado en viajes.

Tu tarea es analizar la conversación o descripción proporcionada por un agente de viajes y extraer los requisitos del viaje.

NO debes crear un itinerario.

NO debes inventar información.

Solamente debes identificar la información que realmente aparece o que puede determinarse claramente.

Extrae:

- destino
- país
- número de viajeros
- fecha de inicio
- fecha de finalización
- duración
- presupuesto
- moneda
- tipo de viaje
- intereses
- necesidades especiales

REGLAS:

1. Si un dato no aparece, utiliza null.
2. No inventes fechas.
3. No inventes presupuesto.
4. No inventes número de viajeros.
5. Si solamente se menciona una duración, por ejemplo "5 días", utiliza duration_days = 5.
6. Si se menciona una pareja, travelers normalmente será 2.
7. Si se mencionan niños además de adultos, el número de travelers debe incluirlos.
8. Mantén los intereses como elementos separados.
9. Mantén las necesidades especiales como elementos separados.
10. Responde en español.

DESCRIPCIÓN DEL AGENTE:

${description}
`;

      const response = await fetch(
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
              responseSchema: requirementsSchema,
              temperature: 0.1,
            },
          }),
        }
      );

      const geminiData = await response.json();

      if (!response.ok) {
        console.error(
          "Error Gemini:",
          JSON.stringify(geminiData)
        );

        throw new Error(
          geminiData?.error?.message ||
            "Gemini devolvió un error."
        );
      }

      const output =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!output) {
        throw new Error(
          "Gemini no devolvió los requisitos."
        );
      }

      const requirements = JSON.parse(output);

      return new Response(
        JSON.stringify({
          success: true,
          requirements,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Error extrayendo requisitos:",
        error
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Error procesando la solicitud.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};