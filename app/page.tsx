"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";

type Cliente = {
  id: number;
  nome: string;
};

type Atendimento = {
  id: number;
  assunto: string;
  status: string;
  created_at: string;
  cliente: Cliente;
};

function formatarStatus(status: string) {
  switch (status) {
    case "pendente":
      return "Pendente";

    case "em_andamento":
      return "Em andamento";

    case "concluido":
      return "Concluído";

    default:
      return status;
  }
}

export default function Home() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [atendimentos, setAtendimentos] =
    useState<Atendimento[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ignore = false;

    async function carregarDashboard() {
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
          throw new Error(
            "Erro ao carregar dashboard."
          );
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
          setErro(
            "Não foi possível carregar o dashboard."
          );
        }
      } finally {
        if (!ignore) {
          setCarregando(false);
        }
      }
    }

    carregarDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const totalPendentes = atendimentos.filter(
    (atendimento) =>
      atendimento.status === "pendente"
  ).length;

  const totalEmAndamento = atendimentos.filter(
    (atendimento) =>
      atendimento.status === "em_andamento"
  ).length;

  const totalConcluidos = atendimentos.filter(
    (atendimento) =>
      atendimento.status === "concluido"
  ).length;

  const atendimentosRecentes =
    atendimentos.slice(0, 5);

  return (
    <main className="p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-zinc-400">
          Visão geral dos atendimentos.
        </p>

        {erro && (
          <p className="mt-4 text-sm text-red-400">
            {erro}
          </p>
        )}

        {carregando ? (
          <p className="mt-8 text-zinc-400">
            Carregando dashboard...
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Clientes"
                value={clientes.length}
              />

              <StatCard
                title="Atendimentos"
                value={atendimentos.length}
              />

              <StatCard
                title="Pendentes"
                value={totalPendentes}
              />

              <StatCard
                title="Em andamento"
                value={totalEmAndamento}
              />

              <StatCard
                title="Concluídos"
                value={totalConcluidos}
              />
            </div>

            <section className="mt-10">
              <h2 className="text-xl font-semibold">
                Atendimentos recentes
              </h2>

              {atendimentosRecentes.length === 0 ? (
                <p className="mt-4 text-zinc-400">
                  Nenhum atendimento registrado.
                </p>
              ) : (
                <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800">
                  {atendimentosRecentes.map(
                    (atendimento) => (
                      <div
                        key={atendimento.id}
                        className="flex flex-col gap-2 border-b border-zinc-800 bg-zinc-900 p-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {atendimento.assunto}
                          </p>

                          <p className="mt-1 text-sm text-zinc-400">
                            Cliente:{" "}
                            {atendimento.cliente.nome}
                          </p>
                        </div>

                        <span className="text-sm text-zinc-400">
                          {formatarStatus(
                            atendimento.status
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}