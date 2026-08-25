"use client";

import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setCarregando(true);

    const { error } =
      await supabaseBrowser.auth.signInWithPassword({
        email,
        password: senha,
      });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      setCarregando(false);
      return;
    }

    setMensagem("Login realizado com sucesso.");
    setCarregando(false);

    router.replace("/");
    router.refresh();
  }

  async function handleCadastro() {
    setErro("");
    setMensagem("");

    if (!email || !senha) {
      setErro("Informe e-mail e senha.");
      return;
    }

    if (senha.length < 6) {
      setErro(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    setCarregando(true);

    const { error } =
      await supabaseBrowser.auth.signUp({
        email,
        password: senha,
      });

    if (error) {
      setErro("Não foi possível criar a conta.");
      setCarregando(false);
      return;
    }

    setMensagem(
      "Conta criada. Verifique seu e-mail caso a confirmação esteja habilitada."
    );

    setCarregando(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-3xl font-bold text-white">
          AtendeAI
        </h1>

        <p className="mt-2 text-zinc-400">
          Entre na sua conta para continuar.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4"
        >
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(event) =>
              setSenha(event.target.value)
            }
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
          />

          {erro && (
            <p className="text-sm text-red-400">
              {erro}
            </p>
          )}

          {mensagem && (
            <p className="text-sm text-green-400">
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-md bg-white px-4 py-3 font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {carregando
              ? "Carregando..."
              : "Entrar"}
          </button>

          <button
            type="button"
            onClick={handleCadastro}
            disabled={carregando}
            className="w-full rounded-md border border-zinc-700 px-4 py-3 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            Criar conta
          </button>
        </form>
      </div>
    </main>
  );
}