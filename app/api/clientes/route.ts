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
    .from("clientes")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar clientes." },
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

  const nome =
    typeof body.nome === "string"
      ? body.nome.trim()
      : "";

  const email =
    typeof body.email === "string"
      ? body.email.trim()
      : "";

  if (!nome || !email) {
    return NextResponse.json(
      {
        error: "Nome e email são obrigatórios.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nome,
      email,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Já existe um cliente com este e-mail.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao cadastrar cliente." },
      { status: 500 }
    );
  }

  return NextResponse.json(data, {
    status: 201,
  });
}