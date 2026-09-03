import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();

  const userId = authData?.claims?.sub;

  if (authError || !userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const assunto =
    typeof body.assunto === "string"
      ? body.assunto.trim()
      : "";

  const descricao =
    typeof body.descricao === "string"
      ? body.descricao.trim()
      : "";

  if (!assunto || !descricao) {
    return NextResponse.json(
      {
        error:
          "Assunto e descrição são obrigatórios.",
      },
      { status: 400 }
    );
  }

  try {
    const interaction =
      await ai.interactions.create({
        model: "gemini-3.5-flash-lite",

        system_instruction:
          "Você analisa atendimentos de suporte ao cliente. Responda de forma objetiva e profissional.",

        input: `
Analise o seguinte atendimento.

Assunto:
${assunto}

Descrição:
${descricao}

Determine:
- um resumo curto;
- uma categoria;
- a prioridade.
`,

        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: {
            type: "object",

            properties: {
              resumo: {
                type: "string",
              },

              categoria: {
                type: "string",
              },

              prioridade: {
                type: "string",
                enum: [
                  "baixa",
                  "media",
                  "alta",
                ],
              },
            },

            required: [
              "resumo",
              "categoria",
              "prioridade",
            ],
          },
        },
      });

    if (!interaction.output_text) {
      throw new Error(
        "A IA não retornou uma resposta."
      );
    }

    const analise = JSON.parse(
      interaction.output_text
    );

    return NextResponse.json(analise);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Não foi possível analisar o atendimento.",
      },
      { status: 500 }
    );
  }
}