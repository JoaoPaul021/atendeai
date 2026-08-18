"use client";

import { FormEvent, useEffect, useState } from "react";

type Cliente = {
  id: number;
  nome: string;
  email: string;
  created_at: string;
};

export default function ClientesPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ignore = false;

    async function carregarClientes() {
      try {
        const response = await fetch("/api/clientes");

        if (!response.ok) {
          throw new Error("Erro ao carregar clientes.");
        }

        const data: Cliente[] = await response.json();

        if (!ignore) {
          setClientes(data);
        }
      } catch {
        if (!ignore) {
          setErro("Não foi possível carregar os clientes.");
        }
      } finally {
        if (!ignore) {
          setCarregando(false);
        }
      }
    }

    carregarClientes();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!nome.trim() || !email.trim()) {
    return;
  }

  setErro("");

  try {
    const response = await fetch("/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        email,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao cadastrar cliente.");
    }

    const novoCliente: Cliente = await response.json();

    setClientes((clientesAtuais) => [
      novoCliente,
      ...clientesAtuais,
    ]);

    setNome("");
    setEmail("");
  } catch {
      setErro("Não foi possível cadastrar o cliente.");
    }
  }

  async function handleDelete(id: number) {
    setErro("");

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir cliente.");
      }

      setClientes((clientesAtuais) =>
        clientesAtuais.filter((cliente) => cliente.id !== id)
      );
    } catch {
      setErro("Não foi possível excluir o cliente.");
    }
  }


  return (
    <main className="p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Clientes
        </h1>

        <p className="mt-2 text-zinc-400">
          Gerencie os clientes cadastrados.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6 md:grid-cols-3"
        >
          <input
            type="text"
            placeholder="Nome do cliente"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none focus:border-zinc-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none focus:border-zinc-500"
          />

          <button
            type="submit"
            className="rounded-md bg-white px-4 py-2 font-medium text-black hover:bg-zinc-200"
          >
            Cadastrar cliente
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">
            Clientes cadastrados
          </h2>

          {erro && (
            <p className="mt-4 text-sm text-red-400">
              {erro}
            </p>
          )}

          {carregando ? (
            <p className="mt-4 text-zinc-400">
              Carregando clientes...
            </p>
          ) : clientes.length === 0 ? (
            <p className="mt-4 text-zinc-400">
              Nenhum cliente cadastrado.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                <div>
                  <p className="font-medium">
                    {cliente.nome}
                  </p>

                  <p className="text-sm text-zinc-400">
                    {cliente.email}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(cliente.id)}
                  className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
                >
                  Excluir
                </button>
            </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}