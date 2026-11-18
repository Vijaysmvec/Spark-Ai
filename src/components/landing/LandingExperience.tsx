"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GitBranch,
  Globe,
  BarChart3,
  Cpu,
  FileText,
  Zap,
  Lock,
  Play,
  CheckCircle2,
  Terminal,
  Layers,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LenisProvider } from "./LenisProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const SEVEN_FEATURES = [
  {
    id: "autonomous-planning",
    tag: "01 / DAG ARCHITECTURE",
    title: "Autonomous planning",
    description:
      "Transform high-level natural language objectives into deterministic Directed Acyclic Graphs with explicit dependencies, token budgets, and SLA checkpoints.",
    metric: "4-Stage Parallel DAGs",
    icon: GitBranch,
    accent: "from-violet-500/25 to-indigo-500/10",
    border: "border-violet-500/35",
  },
  {
    id: "multi-agent-collaboration",
    tag: "02 / SWARM COORDINATION",
    title: "Multi-agent collaboration",
    description:
      "Six specialized autonomous AI agents share a typed orchestration state bus—passing verified citations, risk models, and execution context without hallucination drift.",
    metric: "6 Specialized Agents",
    icon: Layers,
    accent: "from-cyan-500/25 to-blue-500/10",
    border: "border-cyan-500/35",
  },
  {
    id: "parallel-execution",
    tag: "03 / CONCURRENT FORKING",
    title: "Parallel execution",
    description:
      "Fork deep web research and quantitative sandbox simulations simultaneously, cutting complex enterprise workflow cycle times by up to 62%.",
    metric: "2.4x Faster Throughput",
    icon: Zap,
    accent: "from-indigo-500/25 to-cyan-500/10",
    border: "border-indigo-500/35",
  },
  {
    id: "human-approval",
    tag: "04 / GOVERNANCE GATES",
    title: "Human approval",
    description:
      "Pause high-impact mutations at cryptographic governance checkpoints. Inspect the agent rationale and action scope before authorizing execution.",
    metric: "100% Auditable Control",
    icon: ShieldCheck,
    accent: "from-amber-500/25 to-orange-500/10",
    border: "border-amber-500/35",
  },
  {
    id: "browser-automation",
    tag: "05 / HEADLESS RUNTIME",
    title: "Browser automation",
    description:
      "Deploy isolated Playwright browser sessions to navigate portals, extract live pricing tables, verify forms, and capture structured DOM telemetry.",
    metric: "Sandboxed Chromium Grid",
    icon: Globe,
    accent: "from-blue-500/25 to-cyan-500/10",
    border: "border-blue-500/35",
  },
  {
    id: "secure-integrations",
    tag: "06 / ZERO-TRUST CONNECTORS",
    title: "Secure integrations",
    description:
      "Connect Google Workspace, Slack, GitHub, PostgreSQL, and signed webhooks with strict server-side secret isolation and granular OAuth scopes.",
    metric: "8 Enterprise Connectors",
    icon: Lock,
    accent: "from-emerald-500/25 to-teal-500/10",
    border: "border-emerald-500/35",
  },
  {
    id: "professional-reports",
    tag: "07 / EXECUTIVE ARTIFACTS",
    title: "Professional reports",
    description:
      "Synthesize every workflow into board-ready Markdown intelligence reports complete with KPI scorecards, confidence ratings, and strategic recommendations.",
    metric: "Instant Executive Briefs",
    icon: FileText,
    accent: "from-pink-500/25 to-violet-500/10",
    border: "border-pink-500/35",
  },
];

const SHOWCASE_STAGES = [
  {
    id: "supervisor",
    name: "Supervisor Agent",
    role: "Intent & Governance",
    status: "Verified Tier-2 Policy",
    output:
      "Parsed executive command, assigned mission code MSN-904A, and locked read-only boundaries for upstream reconnaissance.",
    latency: "520ms",
    tokens: "440 tok",
    icon: ShieldCheck,
    color: "#F97316",
  },
  {
    id: "planner",
    name: "Planner Agent",
    role: "DAG Compilation",
    status: "Forked 2 Parallel Branches",
    output:
      "Decomposed objective into parallel Research (Headless Browser) and Analysis (Python Sandbox) branches converging at Execution Gate.",
    latency: "680ms",
    tokens: "610 tok",
    icon: GitBranch,
    color: "#F59E0B",
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Parallel Branch A",
    status: "24 Primary Sources Indexed",
    output:
      "Extracted live enterprise SaaS pricing tiers, regional expansion benchmarks, and competitor SLA commitments.",
    latency: "940ms",
    tokens: "920 tok",
    icon: Globe,
    color: "#14B8A6",
  },
  {
    id: "analysis",
    name: "Analysis Agent",
    role: "Parallel Branch B",
    status: "97% Confidence Score",
    output:
      "Simulated Q4 cohort velocity and identified ₹15.4 Cr net expansion ARR with +34.2% pipeline acceleration.",
    latency: "980ms",
    tokens: "890 tok",
    icon: BarChart3,
    color: "#10B981",
  },
  {
    id: "execution",
    name: "Execution Agent",
    role: "Human-Approved Action",
    status: "3 Integrations Synced",
    output:
      "Updated Google Sheets master forecast model and dispatched executive alert card to Slack #revops-command.",
    latency: "1,120ms",
    tokens: "640 tok",
    icon: Cpu,
    color: "#38BDF8",
  },
  {
    id: "reporting",
    name: "Reporting Agent",
    role: "Intelligence Synthesis",
    status: "Artifact Published",
    output:
      "Compiled audit-signed Markdown briefing with KPI scorecards, citations, and 3 board-ready action items.",
    latency: "710ms",
    tokens: "510 tok",
    icon: FileText,
    color: "#FB7185",
  },
];

const SAMPLE_PROMPTS = [
  "Analyze Q4 enterprise pipeline velocity, benchmark competitor pricing, update Google Sheets forecast, and brief Slack.",
  "Audit production Kubernetes & GPU clusters for FinOps waste, simulate SLA headroom, and prepare rightsizing manifest.",
  "Run a zero-trust security sweep across all microservices and OAuth scopes, compute CVSS risk scores, and publish report.",
];

export function LandingExperience() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [composerPrompt, setComposerPrompt] = useState(SAMPLE_PROMPTS[0]);
  const [activeStageIdx, setActiveStageIdx] = useState(2);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      // 1. Coordinated Hero Timeline Sequence
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .fromTo(
          ".gsap-hero-word",
          { y: 48, opacity: 0, rotateX: -20 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.75,
            stagger: 0.08,
          }
        )
        .fromTo(
          ".gsap-hero-sub",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65 },
          "-=0.4"
        )
        .fromTo(
          ".gsap-hero-cta",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.1 },
          "-=0.35"
        )
        .fromTo(
          ".gsap-composer-mask",
          {
            y: 44,
            opacity: 0,
            clipPath: "inset(18% 6% 18% 6% round 24px)",
          },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            duration: 1.0,
            ease: "power4.out",
          },
          "-=0.3"
        );

      // 2. Subtle Parallax on Hero Ambient Orbs
      gsap.to(".gsap-parallax-orb", {
        yPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: ".gsap-hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // 3. Staggered Scroll-Triggered Feature Cards
      gsap.fromTo(
        ".gsap-feature-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-features-grid",
            start: "top 82%",
          },
        }
      );

      // 4. Animated SVG Path in Interactive Showcase
      gsap.fromTo(
        ".gsap-svg-connector",
        { strokeDashoffset: 600 },
        {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: ".gsap-showcase-section",
            start: "top 75%",
          },
        }
      );

      // 5. Closing Section Reveal
      gsap.fromTo(
        ".gsap-closing-panel",
        { y: 45, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-closing-panel",
            start: "top 85%",
          },
        }
      );
    },
    { scope: containerRef }
  );

  const handleLaunchFromHero = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeURIComponent(composerPrompt.trim());
    router.push(`/dashboard/new?prompt=${encoded}`);
  };

  const activeStage = SHOWCASE_STAGES[activeStageIdx] || SHOWCASE_STAGES[0];

  return (
    <LenisProvider>
      <div
        ref={containerRef}
        className="relative min-h-screen bg-space-950 text-slate-100 selection:bg-violet-500/40"
      >
        {/* Ambient Deep-Space Background & Animated SVG Orbitals */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="gsap-parallax-orb absolute -top-32 left-1/2 -translate-x-1/2 h-[560px] w-[960px] rounded-full bg-gradient-to-b from-violet-600/20 via-cyan-500/10 to-transparent blur-[130px]" />
          <div className="gsap-parallax-orb absolute top-[45%] -left-40 h-[420px] w-[420px] rounded-full bg-violet-700/15 blur-[120px]" />
          <div className="gsap-parallax-orb absolute top-[60%] -right-40 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="absolute inset-0 spark-grid-bg opacity-65" />
        </div>

        {/* Sticky Glass Navigation Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-space-950/75 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-glow-violet">
                <Sparkles className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-12" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-space-950" />
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-wider text-white">
                  SPARK <span className="text-cyan-400">AI</span>
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Command OS v2.0
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
              <a
                href="#capabilities"
                className="hover:text-cyan-300 transition-colors"
              >
                Capabilities
              </a>
              <a
                href="#showcase"
                className="hover:text-cyan-300 transition-colors"
              >
                Live Architecture
              </a>
              <Link
                href="/dashboard/agents"
                className="hover:text-cyan-300 transition-colors"
              >
                Agent Fleet
              </Link>
              <Link
                href="/dashboard/monitor"
                className="hover:text-cyan-300 transition-colors"
              >
                Live Monitor
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">
                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">
                  Command Center
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* 1. HERO SECTION */}
        <section className="gsap-hero-section relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.08] mb-6">
              {"Your AI Workforce. One Command Away.".split(" ").map((word, idx) => (
                <span
                  key={idx}
                  className={
                    idx >= 3
                      ? "gsap-hero-word inline-block mr-3 text-gradient-spark"
                      : "gsap-hero-word inline-block mr-3 text-white"
                  }
                >
                  {word}
                </span>
              ))}
            </h1>

            <p className="gsap-hero-sub mx-auto max-w-2xl text-base sm:text-xl text-slate-300 leading-relaxed mb-10">
              Turn complex business workflows into intelligent execution. Let
              specialized AI agents plan, collaborate and deliver results.
            </p>

            <div className=" flex flex-wrap items-center justify-center gap-4 mb-16">
              <div className="gsap-hero-cta">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="gsap-hero-cta">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard/agents">
                    <Layers className="h-5 w-5 text-cyan-400" />
                    Explore Agents
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Interactive Task Composer Preview with GSAP Mask Reveal */}
          <div className="gsap-composer-mask mx-auto max-w-4xl rounded-3xl spark-glass border border-violet-500/35 p-6 sm:p-8 shadow-glow-violet">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">
                  spark://mission-composer/autonomous-mesh
                </span>
              </div>
              <Badge variant="cyan">
                <Activity className="h-3.5 w-3.5" />
                6 SPECIALIZED AGENTS READY
              </Badge>
            </div>

            <form onSubmit={handleLaunchFromHero} className="space-y-4">
              <label
                htmlFor="hero-mission-input"
                className="block text-xs font-mono uppercase tracking-wider text-cyan-300"
              >
                Enter Executive Mission Directive
              </label>
              <textarea
                id="hero-mission-input"
                value={composerPrompt}
                onChange={(e) => setComposerPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-700/80 bg-space-950/90 p-4 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="Describe the cross-functional workflow you want SPARK AI to plan and execute..."
              />

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Presets:</span>
                  {["Q4 Revenue Audit", "Cloud FinOps", "Zero-Trust Security"].map(
                    (label, i) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setComposerPrompt(SAMPLE_PROMPTS[i])}
                        className="rounded-lg border border-slate-700/80 bg-space-900/90 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-400/50 hover:text-white transition-colors"
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>

                <Button type="submit" size="default">
                  <Play className="h-4 w-4 fill-current" />
                  Dispatch to Agent Mesh
                </Button>
              </div>
            </form>

            {/* Mini Live Topology Strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-5 border-t border-slate-800/80">
              {SHOWCASE_STAGES.map((stage) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-space-900/70 px-3 py-2"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: stage.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-white">
                        {stage.name.replace(" Agent", "")}
                      </p>
                      <p className="truncate text-[10px] text-slate-400">
                        {stage.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. SEVEN FEATURE SECTIONS (ScrollTrigger Staggered Reveals) */}
        <section
          id="capabilities"
          className="relative z-10 mx-auto max-w-7xl px-6 py-24 border-t border-white/5"
        >
          <div className="max-w-3xl mb-16">
            <Badge variant="default" className="mb-4">
              AUTONOMOUS ENTERPRISE ARCHITECTURE
            </Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Engineered for deterministic multi-agent execution.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Every mission flows through a stateful multi-agent architecture
              backed by parallel branch execution and cryptographic human
              governance gates.
            </p>
          </div>

          <div className="gsap-features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEVEN_FEATURES.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className={`gsap-feature-card rounded-2xl spark-glass border ${feat.border} p-6 flex flex-col justify-between ${
                    index === 6 ? "md:col-span-2 lg:col-span-3" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <span className="font-mono text-[11px] tracking-widest text-cyan-300">
                        {feat.tag}
                      </span>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feat.accent} border border-white/10`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-bold text-white mb-2.5 capitalize">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      {feat.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs">
                    <span className="font-mono text-violet-300 font-semibold">
                      {feat.metric}
                    </span>
                    <Link
                      href="/dashboard/new"
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition-colors"
                    >
                      Configure <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 3. INTERACTIVE WORKFLOW SHOWCASE */}
        <section
          id="showcase"
          className="gsap-showcase-section relative z-10 mx-auto max-w-7xl px-6 py-24 border-t border-white/5"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <Badge variant="cyan" className="mb-4">
                INTERACTIVE MULTI-AGENT NARRATIVE
              </Badge>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                Watch how specialized agents collaborate from command to report.
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                Select any node in the execution topology below to inspect its
                real-time LangGraph state payload, tool invocations, and SLA
                telemetry.
              </p>
            </div>
            <Button variant="cyan" asChild>
              <Link href="/dashboard/monitor">
                Open Live React Flow Canvas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Interactive Visual Topology */}
            <div className="lg:col-span-7 rounded-3xl spark-glass border border-slate-800 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-slate-400">
                  TOPOLOGY: SUPERVISOR → PLANNER → [RESEARCH || ANALYSIS] → EXECUTION → REPORTING
                </span>
                <Badge variant="success">checkpoint_persisted</Badge>
              </div>

              {/* Animated SVG Pipeline Connector */}
              <svg
                className="w-full h-16 my-2 hidden sm:block"
                viewBox="0 0 700 60"
                fill="none"
              >
                <path
                  className="gsap-svg-connector"
                  d="M 30 30 L 160 30 L 290 12 L 430 30 L 670 30"
                  stroke="url(#sparkGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="600"
                />
                <path
                  className="gsap-svg-connector"
                  d="M 160 30 L 290 48 L 430 30"
                  stroke="url(#sparkGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="600"
                />
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {SHOWCASE_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isSelected = idx === activeStageIdx;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setActiveStageIdx(idx)}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-cyan-400 bg-space-800/95 shadow-glow-cyan"
                          : "border-slate-800 bg-space-900/75 hover:border-violet-400/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${stage.color}25`,
                            color: stage.color,
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          0{idx + 1}
                        </span>
                      </div>
                      <p className="font-display text-sm font-bold text-white">
                        {stage.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {stage.role}
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="truncate">{stage.status}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Selected Agent Narrative Inspector */}
            <div className="lg:col-span-5 rounded-3xl spark-glass border border-violet-500/35 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <Badge variant="default">STAGE 0{activeStageIdx + 1} INSPECTOR</Badge>
                  <span className="font-mono text-xs text-cyan-300">
                    {activeStage.latency} • {activeStage.tokens}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-1">
                  {activeStage.name}
                </h3>
                <p className="text-sm text-violet-300 mb-5">{activeStage.role}</p>

                <div className="rounded-2xl bg-space-950/90 border border-slate-800 p-4 mb-5">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 mb-2">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>LangGraph State Checkpoint Output</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {activeStage.output}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Execution Architecture</span>
                  <span className="font-mono text-white">Autonomous Parallel DAG</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Governance Layer</span>
                  <span className="font-mono text-emerald-300">
                    Verified State Checkpoints
                  </span>
                </div>
                <Button className="w-full mt-2" asChild>
                  <Link href="/dashboard/monitor">
                    Inspect Live Workflow in Monitor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CLOSING CTA SECTION */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-12">
          <div className="gsap-closing-panel relative overflow-hidden rounded-3xl spark-glass border border-violet-500/40 p-10 sm:p-16 text-center shadow-glow-violet">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-gradient-to-r from-violet-600/30 to-cyan-500/30 blur-3xl" />
            <Badge variant="cyan" className="mb-6">
              READY FOR AUTONOMOUS EXECUTION
            </Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto mb-6 leading-tight">
              Stop coordinating every step. Start commanding outcomes.
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto text-base sm:text-lg mb-9">
              Launch your first multi-agent workflow in seconds with live React
              Flow observability, human approval gates, and executive reporting.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard/new">
                  Start Building Workflow
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">Open Command Center</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-space-950/90 py-10">
          <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="font-display font-semibold text-white">
                SPARK AI
              </span>
              <span>— Autonomous Multi-Agent Command Center</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="hover:text-white">
                Command Center
              </Link>
              <Link href="/dashboard/monitor" className="hover:text-white">
                Live Monitor
              </Link>
              <Link href="/dashboard/approvals" className="hover:text-white">
                Approval Center
              </Link>
              <Link href="/dashboard/health" className="hover:text-white">
                System Health
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </LenisProvider>
  );
}
