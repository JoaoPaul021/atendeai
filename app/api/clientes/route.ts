import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar clientes." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const nome = body.nome?.trim();
  const email = body.email?.trim();

  if (!nome || !email) {
    return NextResponse.json(
      { error: "Nome e email são obrigatórios." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("clientes")
    .insert({
      nome,
      email,
    })
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
      { error: "Erro ao cadastrar cliente." },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}