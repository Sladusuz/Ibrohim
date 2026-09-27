"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Wrench,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Boshqaruv paneli", icon: LayoutDashboard, exact: true },
  { href: "/admin/messages", label: "Murojaatlar", icon: MessageSquare },
  { href: "/admin/projects", label: "Portfolio", icon: FolderKanban },
  { href: "/admin/services", label: "Xizmatlar", icon: Wrench },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
];

export function AdminSidebar({
  adminName,
  unreadCount,
}: {
  adminName: string;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <Logo showTagline={false} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-ink-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <span className="flex items-center gap-3">
                <link.icon className="h-[18px] w-[18px]" />
                {link.label}
              </span>
              {link.href === "/admin/messages" && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          Saytni ko&apos;rish
        </Link>
        <div className="mt-2 flex items-center justify-between rounded-xl px-4 py-2.5">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink-900">{adminName}</div>
            <div className="text-xs text-slate-400">Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
            aria-label="Chiqish"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
