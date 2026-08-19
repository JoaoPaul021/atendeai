"use client";

import { FormEvent, useEffect, useState } from "react";

type Cliente = {
  id: number;
  nome: string;
  email: string;
};

type Atendimento = {
  id: number;
  cliente_id: number;
  assunto: string;
  descricao: string;
  status: string;
  created_at: string;
  cliente: Cliente;
};

export default function AtendimentosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [assunto, setAssunto] = useState("");
  const [descricao, setDescricao] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ignore = false;

    async function carregarDados() {
      try {
        const [clientesResponse, atendimentosResponse] =
          await Promise.all([
            fetch("/api/clientes"),
            fetch("/api/atendimentos"),
          ]);

        if (
          !clientesResponse.ok ||
          !atendimentosResponse.ok
        ) {
          throw new Error("Erro ao carregar dados.");
        }

        const clientesData: Cliente[] =
          await clientesResponse.json();

        const atendimentosData: Atendimento[] =
          await atendimentosResponse.json();

        if (!ignore) {
          setClientes(clientesData);
          setAtendimentos(atendimentosData);
        }
      } catch {
        if (!ignore) {
          setErro("Não foi possível carregar os dados.");
        }
      } finally {
        if (!ignore) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !clienteId ||
      !assunto.trim() ||
      !descricao.trim()
    ) {
      setErro(
        "Cliente, assunto e descrição são obrigatórios."
      );
      return;
    }

    setErro("");

    try {
      const response = await fetch("/api/atendimentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente_id: Number(clienteId),
          assunto,
          descricao,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar atendimento.");
      }

      const atendimentoCriado = await response.json();

      const clienteSelecionado = clientes.find(
        (cliente) => cliente.id === Number(clienteId)
      );

      if (clienteSelecionado) {
        const novoAtendimento: Atendimento = {
          ...atendimentoCriado,
          cliente: clienteSelecionado,
        };

        setAtendimentos((atendimentosAtuais) => [
          novoAtendimento,
          ...atendimentosAtuais,
        ]);
      }

      setClienteId("");
      setAssunto("");
      setDescricao("");
    } catch {
      setErro("Não foi possível cadastrar o atendimento.");
    }
  }

  return (
    <main className="p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Atendimentos
        </h1>

        <p className="mt-2 text-zinc-400">
          Acompanhe e registre os atendimentos dos clientes.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={clienteId}
              onChange={(event) =>
                setClienteId(event.target.value)
              }
              className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none"
            >
              <option value="">
                Selecione um cliente
              </option>

              {clientes.map((cliente) => (
                <option
                  key={cliente.id}
                  value={cliente.id}
                >
                  {cliente.nome}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Assunto"
              value={assunto}
              onChange={(event) =>
                setAssunto(event.target.value)
              }
              className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none"
            />
          </div>

          <textarea
            placeholder="Descrição do atendimento"
            value={descricao}
            onChange={(event) =>
              setDescricao(event.target.value)
            }
            rows={4}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none"
          />

          <button
            type="submit"
            className="rounded-md bg-white px-4 py-2 font-medium text-black hover:bg-zinc-200"
          >
            Registrar atendimento
          </button>
        </form>

        {erro && (
          <p className="mt-4 text-sm text-red-400">
            {erro}
          </p>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold">
            Atendimentos registrados
          </h2>

          {carregando ? (
            <p className="mt-4 text-zinc-400">
              Carregando atendimentos...
            </p>
          ) : atendimentos.length === 0 ? (
            <p className="mt-4 text-zinc-400">
              Nenhum atendimento registrado.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {atendimentos.map((atendimento) => (
                <div
                  key={atendimento.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-medium">
                        {atendimento.assunto}
                      </p>

                      <p className="mt-1 text-sm text-zinc-400">
                        Cliente: {atendimento.cliente.nome}
                      </p>
                    </div>

                    <span className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300">
                      {atendimento.status}
                    </span>
                  </div>

                  <p className="mt-4 text-zinc-300">
                    {atendimento.descricao}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}