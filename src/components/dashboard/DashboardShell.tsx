"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  PlusCircle,
  Bot,
  Activity,
  ShieldAlert,
  FileText,
  History,
  Blocks,
  HeartPulse,
  Settings,
  Menu,
  X,
  ArrowUpRight,
  Cpu,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sparkApi } from "@/lib/api";
import { ApprovalItem, AuthenticatedOperator } from "@/lib/types";
import { getFirebaseAuth, firebaseSignOut } from "@/lib/firebase";

const NAV_ITEMS = [
  {
    label: "Command Center",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "New Workflow",
    href: "/dashboard/new",
    icon: PlusCircle,
  },
  {
    label: "Agent Workspace",
    href: "/dashboard/agents",
    icon: Bot,
  },
  {
    label: "Live Monitor",
    href: "/dashboard/monitor",
    icon: Activity,
  },
  {
    label: "Approval Center",
    href: "/dashboard/approvals",
    icon: ShieldAlert,
    badgeKey: "approvals",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    label: "Workflow History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    label: "Integrations",
    href: "/dashboard/integrations",
    icon: Blocks,
  },
  {
    label: "System Health",
    href: "/dashboard/health",
    icon: HeartPulse,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<number>(() => {
    const cached = sparkApi.peekCache<ApprovalItem[]>(
      "/api/approvals?status=pending"
    );
    return cached ? cached.length : 0;
  });
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AuthenticatedOperator | null>(
    null
  );

  // Load current user and warm all dashboard route chunks + API caches once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("spark_user");
      if (raw) {
        try {
          setCurrentUser(JSON.parse(raw) as AuthenticatedOperator);
        } catch {
          setCurrentUser(null);
        }
      }
    }

    // Warm all API endpoints in memory so tab switches are 0ms
    sparkApi.prefetchAllDashboardData();

    // Prefetch all Next.js dashboard route bundles
    NAV_ITEMS.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  // Background check for pending approvals without blocking navigation
  useEffect(() => {
    let mounted = true;
    const checkApprovals = () => {
      sparkApi
        .getApprovals("pending")
        .then((list) => {
          if (mounted) {
            setPendingApprovals(list.length);
            setBackendOnline(true);
          }
        })
        .catch(() => {
          if (mounted) setBackendOnline(false);
        });
    };
    checkApprovals();
    const timer = setInterval(checkApprovals, 8000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const fbAuth = getFirebaseAuth();
      if (fbAuth) {
        await firebaseSignOut(fbAuth);
      }
    } catch {
      // ignore signOut error
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("spark_user");
      window.localStorage.removeItem("spark_api_token");
    }
    setCurrentUser(null);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-space-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="relative hidden lg:flex w-64 shrink-0 flex-col border-r border-[#D4AF37]/30 bg-gradient-to-b from-[#061E14]/95 via-[#04150E]/95 to-[#082619]/95 backdrop-blur-xl overflow-hidden">
        {/* Ambient Gold & Emerald Shimmer at Sidebar Bottom (Reference Image Style) */}
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-72 rounded-full bg-gradient-to-tr from-[#EAB308]/25 via-[#10B981]/20 to-transparent blur-2xl" />

        <div className="flex h-16 items-center justify-between px-5 border-b border-[#D4AF37]/25">
          <Link href="/" prefetch className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FACC15] via-[#CA8A04] to-[#059669] border border-[#FEF08A]/60 shadow-[0_0_20px_rgba(234,179,8,0.45)]">
              <Sparkles className="h-4 w-4 text-[#03110B]" />
            </div>
            <div>
              <span className="font-display text-base font-bold tracking-wider text-[#FEF9C3]">
                SPARK <span className="text-[#34D399]">AI</span>
              </span>
              <span className="block text-[10px] font-mono text-[#D4AF37]">
                EMERALD COMMAND
              </span>
            </div>
          </Link>
        </div>

        <div className="p-3">
          <Button className="w-full justify-center" size="sm" asChild>
            <Link href="/dashboard/new" prefetch>
              <PlusCircle className="h-4 w-4 text-[#FEF08A]" />
              New Workflow
            </Link>
          </Button>
        </div>

        <nav className="relative z-10 flex-1 space-y-1.5 px-3 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onMouseEnter={() => sparkApi.prefetchAllDashboardData()}
                className={cn(
                  "relative flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "text-white bg-gradient-to-r from-[#0B4F35] via-[#0F6946] to-[#083B27] border border-[#FACC15]/65 shadow-[0_0_22px_-3px_rgba(16,185,129,0.55),inset_0_1px_0_0_rgba(254,240,138,0.4)]"
                    : "text-slate-300 hover:bg-[#0D3826]/60 hover:text-[#FEF08A]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-[#FACC15]" : "text-[#D4AF37]/85"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badgeKey === "approvals" && pendingApprovals > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/25 border border-amber-400/50 px-1.5 text-[10px] font-bold text-amber-300">
                    {pendingApprovals}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {/* Individual User Profile Card */}
          {currentUser ? (
            <div className="rounded-xl bg-space-950/90 border border-violet-500/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      className="h-8 w-8 rounded-full border border-cyan-400/50 object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-bold text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">
                      {currentUser.name}
                    </p>
                    <p className="truncate text-[10px] text-cyan-300 font-mono">
                      {currentUser.role || "Mission Commander"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/login" prefetch>
                <User className="h-3.5 w-3.5 text-cyan-400" />
                Sign In to Account
              </Link>
            </Button>
          )}

          <div className="rounded-xl bg-space-950/90 border border-slate-800 p-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-violet-400" />
                Runtime Engine
              </span>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  backendOnline ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
            </div>
            <p className="text-xs font-semibold text-white">
              Autonomous Multi-Agent Core
            </p>
          </div>

          <Link
            href="/"
            prefetch
            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>Public Showcase Page</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-space-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-72 flex-col bg-space-900 border-r border-slate-800 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-display text-base font-bold text-white">
                SPARK <span className="text-cyan-400">AI</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 space-y-1 flex-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium",
                      isActive
                        ? "bg-violet-600/25 text-white border border-violet-400/35"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-space-950/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-300 hover:bg-white/5"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <Badge variant="cyan" className="hidden sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                ORCHESTRATOR ACTIVE
              </Badge>
              <span className="text-xs font-mono text-slate-400 hidden md:inline">
                governance: active • telemetry: live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingApprovals > 0 && (
              <Link href="/dashboard/approvals" prefetch>
                <Badge
                  variant="warning"
                  className="cursor-pointer hover:brightness-110"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {pendingApprovals} Approval Waiting
                </Badge>
              </Link>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/monitor" prefetch>
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                Live Graph
              </Link>
            </Button>

            {currentUser ? (
              <div className="flex items-center gap-2 rounded-xl bg-space-900/90 border border-slate-800 px-3 py-1.5">
                <span className="text-xs font-medium text-white hidden sm:inline">
                  {currentUser.name || "Authorized Operator"}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Button variant="glass" size="sm" asChild>
                <Link href="/login" prefetch>
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
