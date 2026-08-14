import StatCard from "@/components/StatCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="mt-2 text-zinc-400">
          Visão geral dos atendimentos.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard title="Clientes" value={0} />
          <StatCard title="Atendimentos" value={0} />
          <StatCard title="Pendentes" value={0} />
        </div>
      </div>
    </main>
  );
}