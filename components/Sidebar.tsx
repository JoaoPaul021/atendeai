import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="border-b border-zinc-800 bg-zinc-900 p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <h2 className="text-2xl font-bold text-white">
        AtendeAI
      </h2>

      <nav className="mt-8 flex gap-2 md:flex-col">
        <Link
          href="/"
          className="rounded-md px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Dashboard
        </Link>

        <Link
          href="/clientes"
          className="rounded-md px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Clientes
        </Link>

        <Link
          href="/atendimentos"
          className="rounded-md px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Atendimentos
        </Link>
      </nav>
    </aside>
  );
}