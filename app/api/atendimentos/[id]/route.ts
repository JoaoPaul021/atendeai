import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  const { data, error } = await supabaseAdmin
    .from("atendimentos")
    .update({ status })
    .eq("id", atendimentoId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar atendimento." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  context: Context
) {
  const { id } = await context.params;

  const atendimentoId = Number(id);

  if (Number.isNaN(atendimentoId)) {
    return NextResponse.json(
      { error: "ID inválido." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("atendimentos")
    .delete()
    .eq("id", atendimentoId);

  if (error) {
    return NextResponse.json(
      { error: "Erro ao excluir atendimento." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Atendimento excluído com sucesso.",
  });
}