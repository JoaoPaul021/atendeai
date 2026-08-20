"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";

type Cliente = {
  id: number;
};

type Atendimento = {
  id: number;
  status: string;
};

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
          throw new Error("Erro ao carregar dashboard.");
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
          <div className="mt-8 grid gap-4 md:grid-cols-3">
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
          </div>
        )}
      </div>
    </main>
  );
}