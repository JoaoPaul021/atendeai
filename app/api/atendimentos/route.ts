import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
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

  const { data, error } = await supabase
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
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar atendimentos." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

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

  const { data: cliente, error: clienteError } =
    await supabase
      .from("clientes")
      .select("id")
      .eq("id", clienteId)
      .eq("user_id", userId)
      .maybeSingle();

  if (clienteError) {
    return NextResponse.json(
      { error: "Erro ao verificar cliente." },
      { status: 500 }
    );
  }

  if (!cliente) {
    return NextResponse.json(
      { error: "Cliente não encontrado." },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("atendimentos")
    .insert({
      cliente_id: clienteId,
      assunto,
      descricao,
      user_id: userId,
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