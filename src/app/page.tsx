import Link from "next/link";

import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await getSession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 items-center justify-between px-6 md:px-10">
        <span className="text-sm font-bold tracking-tight text-foreground">
          SSmoney
        </span>
        <nav className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Abrir Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Criar conta</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <span className="text-sm font-medium text-muted-foreground">
          SSmoney
        </span>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Seu assistente financeiro inteligente
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Organize sua vida financeira e tome melhores decisões com o apoio de
          inteligência artificial.
        </p>
        <div className="mt-8 flex gap-3">
          {user ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Continuar para o aplicativo</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/signup">Criar conta</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Entrar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
