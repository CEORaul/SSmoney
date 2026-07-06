"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  MessageCircle,
  BarChart3,
  Receipt,
  Settings,
} from "lucide-react";

import { Logo } from "@/components/shared/Logo";
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
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/chat", label: "Assistente IA", icon: MessageCircle },
  { href: "/analysis", label: "Análise mensal", icon: BarChart3 },
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
      <div className="flex h-16 items-center px-6">
        <Logo height={22} />
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
