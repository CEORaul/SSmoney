export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="text-xl font-semibold tracking-tight">
            SSmoney
          </span>
          <p className="text-sm text-muted-foreground">
            Seu assistente financeiro inteligente
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
