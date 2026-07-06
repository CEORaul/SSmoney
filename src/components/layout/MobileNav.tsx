"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  MessageCircle,
  BarChart3,
  Receipt,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/bills", label: "Contas a Pagar", icon: Receipt },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/chat", label: "Assistente IA", icon: MessageCircle },
  { href: "/analysis", label: "Análise mensal", icon: BarChart3 },
  { href: "/settings/profile", label: "Configurações", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="h-16 justify-center border-b px-6">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              S
            </span>
            SSmoney
          </SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className={cn("size-4", isActive && "text-primary")} />
                {label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
