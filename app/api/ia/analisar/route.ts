import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  const supabase =
    await createSupabaseServerClient();

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

  const atendimentoId = Number(
    body.atendimento_id
  );

  if (Number.isNaN(atendimentoId)) {
    return NextResponse.json(
      { error: "ID do atendimento inválido." },
      { status: 400 }
    );
  }

  /*
   * Busca o atendimento no banco.
   *
   * Além do ID precisar existir, ele precisa
   * pertencer ao usuário autenticado.
   */
  const {
    data: atendimento,
    error: atendimentoError,
  } = await supabase
    .from("atendimentos")
    .select("id, assunto, descricao")
    .eq("id", atendimentoId)
    .eq("user_id", userId)
    .maybeSingle();

  if (atendimentoError) {
    return NextResponse.json(
      {
        error:
          "Erro ao buscar o atendimento.",
      },
      { status: 500 }
    );
  }

  if (!atendimento) {
    return NextResponse.json(
      {
        error:
          "Atendimento não encontrado.",
      },
      { status: 404 }
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
${atendimento.assunto}

Descrição:
${atendimento.descricao}

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

    const prioridadesPermitidas = [
      "baixa",
      "media",
      "alta",
    ];

    if (
      typeof analise.resumo !== "string" ||
      typeof analise.categoria !== "string" ||
      !prioridadesPermitidas.includes(
        analise.prioridade
      )
    ) {
      throw new Error(
        "Resposta inválida da IA."
      );
    }

    /*
     * Salva a análise no PostgreSQL.
     */
    const {
      data: atendimentoAtualizado,
      error: updateError,
    } = await supabase
      .from("atendimentos")
      .update({
        resumo_ia: analise.resumo,
        categoria_ia: analise.categoria,
        prioridade_ia: analise.prioridade,
      })
      .eq("id", atendimentoId)
      .eq("user_id", userId)
      .select(
        `
        resumo_ia,
        categoria_ia,
        prioridade_ia
        `
      )
      .single();

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          error:
            "A análise foi gerada, mas não pôde ser salva.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      resumo:
        atendimentoAtualizado.resumo_ia,

      categoria:
        atendimentoAtualizado.categoria_ia,

      prioridade:
        atendimentoAtualizado.prioridade_ia,
    });
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