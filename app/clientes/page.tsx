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
  const [clienteEditandoId, setClienteEditandoId] =
  useState<number | null>(null);

  const [nomeEditando, setNomeEditando] = useState("");
  const [emailEditando, setEmailEditando] = useState("");

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Erro ao cadastrar cliente."
      );
    }

    const novoCliente: Cliente = data;

    setClientes((clientesAtuais) => [
      novoCliente,
      ...clientesAtuais,
    ]);

    setNome("");
    setEmail("");
  } catch (error) {
    if (error instanceof Error) {
      setErro(error.message);
    } else {
      setErro(
        "Não foi possível cadastrar o cliente."
      );
    }
  }
  }

  async function handleDelete(id: number) {
    const confirmou = window.confirm(
      "Deseja realmente excluir este cliente?"
    );

    if (!confirmou) {
      return;
    }

    setErro("");

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao excluir cliente."
        );
      }

      setClientes((clientesAtuais) =>
        clientesAtuais.filter(
          (cliente) => cliente.id !== id
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Não foi possível excluir o cliente.");
      }
    }
  }

  function handleIniciarEdicao(cliente: Cliente) {
    setClienteEditandoId(cliente.id);
    setNomeEditando(cliente.nome);
    setEmailEditando(cliente.email);
  }

  function handleCancelarEdicao() {
    setClienteEditandoId(null);
    setNomeEditando("");
    setEmailEditando("");
  }

  async function handleSalvarEdicao(id: number) {
    if (!nomeEditando.trim() || !emailEditando.trim()) {
      setErro("Nome e email são obrigatórios.");
      return;
    }

    setErro("");

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nomeEditando,
          email: emailEditando,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao atualizar cliente."
        );
      }

      const clienteAtualizado: Cliente = data;

      setClientes((clientesAtuais) =>
        clientesAtuais.map((cliente) =>
          cliente.id === id
            ? clienteAtualizado
            : cliente
        )
      );

      handleCancelarEdicao();
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          "Não foi possível atualizar o cliente."
        );
      }
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
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                  {clienteEditandoId === cliente.id ? (
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <input
                        type="text"
                        value={nomeEditando}
                        onChange={(event) =>
                          setNomeEditando(event.target.value)
                        }
                        className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none"
                      />

                      <input
                        type="email"
                        value={emailEditando}
                        onChange={(event) =>
                          setEmailEditando(event.target.value)
                        }
                        className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSalvarEdicao(cliente.id)}
                          className="rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                        >
                          Salvar
                        </button>

                        <button
                          onClick={handleCancelarEdicao}
                          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {cliente.nome}
                        </p>

                        <p className="text-sm text-zinc-400">
                          {cliente.email}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleIniciarEdicao(cliente)}
                          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}