import Link from "next/link";

import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getSession();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="text-sm font-medium text-muted-foreground">
        SSmoney
      </span>
      <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Seu assistente financeiro inteligente
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Organize sua vida financeira e tome melhores decisões com o apoio de
        inteligência artificial.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild size="lg">
          <Link href="/signup">Criar conta</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      </div>
    </div>
  );
}
