import { PageTransition } from "@/components/layout/PageTransition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            SSmoney
          </span>
          <p className="text-sm text-muted-foreground">
            Seu assistente financeiro inteligente
          </p>
        </div>
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
