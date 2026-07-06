"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
      }
    );

    setLoading(false);
    if (resetError) {
      setError("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Verifique seu e-mail
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Se existir uma conta para <strong>{email}</strong>, você receberá um
          link para redefinir a senha.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-brand-600 hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-slate-900">
        Recuperar senha
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Informe seu e-mail para receber o link de redefinição.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner className="h-4 w-4" /> : null}
          {loading ? "Enviando…" : "Enviar link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Lembrou a senha?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
