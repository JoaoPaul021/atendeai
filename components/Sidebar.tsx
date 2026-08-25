"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") {
    return null;
  }

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="flex border-b border-zinc-800 bg-zinc-900 p-6 md:min-h-screen md:w-64 md:flex-col md:border-b-0 md:border-r">
      <div>
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
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 rounded-md border border-zinc-700 px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white md:mt-auto"
      >
        Sair
      </button>
    </aside>
  );
}