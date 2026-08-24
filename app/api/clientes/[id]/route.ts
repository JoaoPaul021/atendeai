import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: Request,
  context: Context
) {
  const { id } = await context.params;

  const clienteId = Number(id);

  if (Number.isNaN(clienteId)) {
    return NextResponse.json(
      { error: "ID inválido." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("clientes")
    .delete()
    .eq("id", clienteId);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Este cliente possui atendimentos vinculados e não pode ser excluído.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao excluir cliente." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Cliente excluído com sucesso.",
  });
}

export async function PATCH(
  request: Request,
  context: Context
) {
  const { id } = await context.params;

  const clienteId = Number(id);

  if (Number.isNaN(clienteId)) {
    return NextResponse.json(
      { error: "ID inválido." },
      { status: 400 }
    );
  }

  const body = await request.json();

  const nome =
    typeof body.nome === "string" ? body.nome.trim() : "";

  const email =
    typeof body.email === "string" ? body.email.trim() : "";

  if (!nome || !email) {
    return NextResponse.json(
      { error: "Nome e email são obrigatórios." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("clientes")
    .update({
      nome,
      email,
    })
    .eq("id", clienteId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "Já existe um cliente com este e-mail.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar cliente." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}