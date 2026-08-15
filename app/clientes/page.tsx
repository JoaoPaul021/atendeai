"use client";

import { FormEvent, useState } from "react";

type Cliente = {
  id: number;
  nome: string;
  email: string;
};

export default function ClientesPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim() || !email.trim()) {
      return;
    }

    const novoCliente: Cliente = {
      id: Date.now(),
      nome: nome.trim(),
      email: email.trim(),
    };

    setClientes((clientesAtuais) => [
      ...clientesAtuais,
      novoCliente,
    ]);

    setNome("");
    setEmail("");
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

          {clientes.length === 0 ? (
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
                  <p className="font-medium">
                    {cliente.nome}
                  </p>

                  <p className="text-sm text-zinc-400">
                    {cliente.email}
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