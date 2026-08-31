import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

const statusPermitidos = [
  "pendente",
  "em_andamento",
  "concluido",
];

export async function PATCH(
  request: Request,
  context: Context
) {
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

  const { id } = await context.params;
  const atendimentoId = Number(id);

  if (Number.isNaN(atendimentoId)) {
    return NextResponse.json(
      { error: "ID inválido." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const status = body.status;

  if (!statusPermitidos.includes(status)) {
    return NextResponse.json(
      { error: "Status inválido." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("atendimentos")
    .update({
      status,
    })
    .eq("id", atendimentoId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar atendimento." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Atendimento não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  context: Context
) {
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

  const { id } = await context.params;
  const atendimentoId = Number(id);

  if (Number.isNaN(atendimentoId)) {
    return NextResponse.json(
      { error: "ID inválido." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("atendimentos")
    .delete()
    .eq("id", atendimentoId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao excluir atendimento." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Atendimento não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Atendimento excluído com sucesso.",
  });
}