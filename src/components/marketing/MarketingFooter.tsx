import Link from "next/link"
import { GitFork } from "lucide-react"

const FOOTER_LINKS = {
  Produto: [
    { label: "Recursos", href: "#recursos" },
    { label: "IA", href: "#ia" },
    { label: "Como funciona", href: "#como-funciona" },
  ],
  Conta: [
    { label: "Entrar", href: "/login" },
    { label: "Criar conta", href: "/signup" },
  ],
  Legal: [
    { label: "Termos", href: "#" },
    { label: "Privacidade", href: "#" },
  ],
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                S
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                SSmoney
              </span>
            </Link>
            <p className="mt-3 max-w-[16rem] text-sm text-muted-foreground">
              Sua vida financeira organizada, com uma IA que entende seus dados.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-sm font-semibold text-foreground">{heading}</p>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-border/70 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SSmoney. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:contato@ssmoney.app"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Contato
            </a>
            <a
              href="https://github.com/CEORaul/SSmoney"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <GitFork className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
