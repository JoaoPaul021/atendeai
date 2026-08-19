import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("atendimentos")
    .select(`
      id,
      assunto,
      descricao,
      status,
      created_at,
      cliente_id,
      cliente:clientes (
        id,
        nome,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar atendimentos." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const clienteId = Number(body.cliente_id);
  const assunto =
    typeof body.assunto === "string"
      ? body.assunto.trim()
      : "";

  const descricao =
    typeof body.descricao === "string"
      ? body.descricao.trim()
      : "";

  if (
    Number.isNaN(clienteId) ||
    !assunto ||
    !descricao
  ) {
    return NextResponse.json(
      {
        error:
          "Cliente, assunto e descrição são obrigatórios.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("atendimentos")
    .insert({
      cliente_id: clienteId,
      assunto,
      descricao,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao cadastrar atendimento." },
      { status: 500 }
    );
  }

  return NextResponse.json(data, {
    status: 201,
  });
}