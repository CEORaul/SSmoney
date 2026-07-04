"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Target,
  MessageCircle,
  CalendarCheck,
  Sparkles,
  Wallet,
  Receipt,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const ICON_VARIANTS = {
  rest: { x: 0 },
  hover: { x: 2 },
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/bills", label: "Contas a Pagar", icon: Receipt },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/chat", label: "Assistente IA", icon: MessageCircle },
  { href: "/month-end", label: "Fechamento do Mês", icon: CalendarCheck },
  { href: "/retrospective", label: "Retrospectiva SS", icon: Sparkles },
  { href: "/net-worth", label: "Patrimônio", icon: Wallet },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  isActive: boolean;
}) {
  return (
    <MotionLink
      href={href}
      initial="rest"
      whileHover="hover"
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "text-sidebar-accent-foreground"
          : "text-sidebar-foreground/60 hover:text-sidebar-accent-foreground"
      )}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-lg bg-sidebar-accent"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <motion.span
        variants={ICON_VARIANTS}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative flex"
      >
        <Icon
          className={cn(
            "size-4 transition-colors",
            isActive && "text-primary"
          )}
        />
      </motion.span>
      <span className="relative">{label}</span>
    </MotionLink>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          S
        </span>
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          SSmoney
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            isActive={pathname.startsWith(href)}
          />
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <NavLink
          href="/settings/profile"
          label="Configurações"
          icon={Settings}
          isActive={pathname.startsWith("/settings")}
        />
      </div>
    </aside>
  );
}
