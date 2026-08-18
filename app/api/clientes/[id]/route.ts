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
    return NextResponse.json(
      { error: "Erro ao excluir cliente." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Cliente excluído com sucesso." }
  );
}