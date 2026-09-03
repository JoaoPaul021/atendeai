"use client";

import { FormEvent, useEffect, useState } from "react";

type Cliente = {
  id: number;
  nome: string;
  email: string;
};

type StatusAtendimento =
  | "pendente"
  | "em_andamento"
  | "concluido";

type Atendimento = {
  id: number;
  cliente_id: number;
  assunto: string;
  descricao: string;
  status: StatusAtendimento;
  created_at: string;
  cliente: Cliente;

  resumo_ia: string | null;
  categoria_ia: string | null;
  prioridade_ia:
    | "baixa"
    | "media"
    | "alta"
    | null;
};

type AnaliseIA = {
  resumo: string;
  categoria: string;
  prioridade: "baixa" | "media" | "alta";
};

export default function AtendimentosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [atendimentos, setAtendimentos] =
    useState<Atendimento[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [assunto, setAssunto] = useState("");
  const [descricao, setDescricao] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [analises, setAnalises] = useState<
    Record<number, AnaliseIA>
  >({});

  const [analisandoId, setAnalisandoId] =
    useState<number | null>(null);

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

          const analisesSalvas =
            atendimentosData.reduce<
              Record<number, AnaliseIA>
            >((resultado, atendimento) => {
              if (
                atendimento.resumo_ia &&
                atendimento.categoria_ia &&
                atendimento.prioridade_ia
              ) {
                resultado[atendimento.id] = {
                  resumo:
                    atendimento.resumo_ia,

                  categoria:
                    atendimento.categoria_ia,

                  prioridade:
                    atendimento.prioridade_ia,
                };
              }

              return resultado;
            }, {});

          setAnalises(analisesSalvas);
        }
      } catch {
        if (!ignore) {
          setErro(
            "Não foi possível carregar os dados."
          );
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
      const response = await fetch(
        "/api/atendimentos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cliente_id: Number(clienteId),
            assunto,
            descricao,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erro ao cadastrar atendimento."
        );
      }

      const clienteSelecionado = clientes.find(
        (cliente) =>
          cliente.id === Number(clienteId)
      );

      if (clienteSelecionado) {
        const novoAtendimento: Atendimento = {
          ...data,
          cliente: clienteSelecionado,
        };

        setAtendimentos(
          (atendimentosAtuais) => [
            novoAtendimento,
            ...atendimentosAtuais,
          ]
        );
      }

      setClienteId("");
      setAssunto("");
      setDescricao("");
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          "Não foi possível cadastrar o atendimento."
        );
      }
    }
  }

  async function handleStatusChange(
    id: number,
    novoStatus: StatusAtendimento
  ) {
    setErro("");

    try {
      const response = await fetch(
        `/api/atendimentos/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: novoStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erro ao atualizar atendimento."
        );
      }

      setAtendimentos(
        (atendimentosAtuais) =>
          atendimentosAtuais.map(
            (atendimento) =>
              atendimento.id === id
                ? {
                    ...atendimento,
                    status: data.status,
                  }
                : atendimento
          )
      );
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          "Não foi possível atualizar o status."
        );
      }
    }
  }

  async function handleDeleteAtendimento(
    id: number
  ) {
    const confirmou = window.confirm(
      "Deseja realmente excluir este atendimento?"
    );

    if (!confirmou) {
      return;
    }

    setErro("");

    try {
      const response = await fetch(
        `/api/atendimentos/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erro ao excluir atendimento."
        );
      }

      setAtendimentos(
        (atendimentosAtuais) =>
          atendimentosAtuais.filter(
            (atendimento) =>
              atendimento.id !== id
          )
      );
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          "Não foi possível excluir o atendimento."
        );
      }
    }
  }

  async function handleAnalisarIA(
    atendimento: Atendimento
  ) {
    setErro("");
    setAnalisandoId(atendimento.id);

    try {
      const response = await fetch(
        "/api/ia/analisar",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            atendimento_id: atendimento.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erro ao analisar atendimento."
        );
      }

      setAnalises((analisesAtuais) => ({
        ...analisesAtuais,

        [atendimento.id]: {
          resumo: data.resumo,
          categoria: data.categoria,
          prioridade: data.prioridade,
        },
      }));

      setAtendimentos(
        (atendimentosAtuais) =>
          atendimentosAtuais.map(
            (item) =>
              item.id === atendimento.id
                ? {
                    ...item,

                    resumo_ia:
                      data.resumo,

                    categoria_ia:
                      data.categoria,

                    prioridade_ia:
                      data.prioridade,
                  }
                : item
          )
      );
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          "Não foi possível analisar o atendimento."
        );
      }
    } finally {
      setAnalisandoId(null);
    }
  }

  return (
    <main className="p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Atendimentos
        </h1>

        <p className="mt-2 text-zinc-400">
          Acompanhe e registre os atendimentos
          dos clientes.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={clienteId}
              onChange={(event) =>
                setClienteId(
                  event.target.value
                )
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
                setAssunto(
                  event.target.value
                )
              }
              className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none"
            />
          </div>

          <textarea
            placeholder="Descrição do atendimento"
            value={descricao}
            onChange={(event) =>
              setDescricao(
                event.target.value
              )
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
              {atendimentos.map(
                (atendimento) => (
                  <div
                    key={atendimento.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-medium">
                          {
                            atendimento.assunto
                          }
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                          Cliente:{" "}
                          {
                            atendimento
                              .cliente.nome
                          }
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={
                            atendimento.status
                          }
                          onChange={(
                            event
                          ) =>
                            handleStatusChange(
                              atendimento.id,
                              event.target
                                .value as StatusAtendimento
                            )
                          }
                          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
                        >
                          <option value="pendente">
                            Pendente
                          </option>

                          <option value="em_andamento">
                            Em andamento
                          </option>

                          <option value="concluido">
                            Concluído
                          </option>
                        </select>

                        <button
                          onClick={() =>
                            handleAnalisarIA(
                              atendimento
                            )
                          }
                          disabled={
                            analisandoId ===
                            atendimento.id
                          }
                          className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {analisandoId ===
                          atendimento.id
                            ? "Analisando..."
                            : "Analisar com IA"}
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteAtendimento(
                              atendimento.id
                            )
                          }
                          className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 text-zinc-300">
                      {
                        atendimento.descricao
                      }
                    </p>

                    {analises[
                      atendimento.id
                    ] && (
                      <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950 p-4">
                        <p className="text-sm font-semibold text-white">
                          Análise da IA
                        </p>

                        <p className="mt-3 text-sm text-zinc-300">
                          <strong>
                            Resumo:
                          </strong>{" "}
                          {
                            analises[
                              atendimento.id
                            ].resumo
                          }
                        </p>

                        <p className="mt-2 text-sm text-zinc-300">
                          <strong>
                            Categoria:
                          </strong>{" "}
                          {
                            analises[
                              atendimento.id
                            ].categoria
                          }
                        </p>

                        <p className="mt-2 text-sm text-zinc-300">
                          <strong>
                            Prioridade:
                          </strong>{" "}
                          {
                            analises[
                              atendimento.id
                            ].prioridade
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}