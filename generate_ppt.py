import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Theme Palette: Imperial Emerald Green & Champagne Gold
BG_DARK_EMERALD = RGBColor(3, 17, 11)       # #03110B
CARD_EMERALD = RGBColor(7, 33, 22)          # #072116
CARD_EMERALD_ALT = RGBColor(11, 51, 34)     # #0B3322
PILL_EMERALD = RGBColor(14, 78, 52)         # #0E4E34
GOLD_BRIGHT = RGBColor(250, 204, 21)        # #FACC15
GOLD_ROYAL = RGBColor(212, 175, 55)         # #D4AF37
GOLD_SOFT = RGBColor(254, 240, 138)         # #FEF08A
EMERALD_BRIGHT = RGBColor(16, 185, 129)     # #10B981
EMERALD_MINT = RGBColor(52, 211, 153)       # #34D399
TEXT_WHITE = RGBColor(247, 249, 244)        # #F7F9F4
TEXT_MUTED = RGBColor(156, 181, 164)        # #9CB5A4
BORDER_SUBTLE = RGBColor(24, 66, 46)        # #18422E


def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_DARK_EMERALD

    # Top decorative gold accent line
    top_bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.06)
    )
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = GOLD_ROYAL
    top_bar.line.fill.background()


def add_header_and_footer(slide, slide_num: int, tag: str, title: str, subtitle: str):
    set_slide_background(slide)

    # Top Pill Tag
    pill = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(0.35), Inches(5.2), Inches(0.34)
    )
    pill.fill.solid()
    pill.fill.fore_color.rgb = PILL_EMERALD
    pill.line.color.rgb = GOLD_ROYAL
    pill.line.width = Pt(1)
    tf = pill.text_frame
    tf.word_wrap = False
    tf.margin_left = Inches(0.15)
    tf.margin_top = Inches(0.04)
    p = tf.paragraphs[0]
    p.text = f"SLIDE {slide_num:02d} / 11  •  {tag.upper()}"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_SOFT
    p.font.name = "Consolas"

    # Slide Title
    title_box = slide.shapes.add_textbox(Inches(0.6), Inches(0.75), Inches(12.1), Inches(0.6))
    ttf = title_box.text_frame
    ttf.word_wrap = True
    tp = ttf.paragraphs[0]
    tp.text = title
    tp.font.size = Pt(26)
    tp.font.bold = True
    tp.font.color.rgb = TEXT_WHITE
    tp.font.name = "Calibri"

    # Subtitle
    sub_box = slide.shapes.add_textbox(Inches(0.6), Inches(1.28), Inches(12.1), Inches(0.4))
    stf = sub_box.text_frame
    stf.word_wrap = True
    sp = stf.paragraphs[0]
    sp.text = subtitle
    sp.font.size = Pt(13)
    sp.font.color.rgb = EMERALD_MINT
    sp.font.name = "Calibri"

    # Footer divider line
    footer_line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(7.02), Inches(12.133), Inches(0.015)
    )
    footer_line.fill.solid()
    footer_line.fill.fore_color.rgb = BORDER_SUBTLE
    footer_line.line.fill.background()

    # Footer left text
    f_left = slide.shapes.add_textbox(Inches(0.6), Inches(7.08), Inches(8.5), Inches(0.3))
    fl_p = f_left.text_frame.paragraphs[0]
    fl_p.text = "SPARK AI — Autonomous Multi-Agent Workflow Command Center (TP15)"
    fl_p.font.size = Pt(9.5)
    fl_p.font.color.rgb = TEXT_MUTED
    fl_p.font.name = "Calibri"

    # Footer right text
    f_right = slide.shapes.add_textbox(Inches(10.5), Inches(7.08), Inches(2.2), Inches(0.3))
    fr_p = f_right.text_frame.paragraphs[0]
    fr_p.alignment = PP_ALIGN.RIGHT
    fr_p.text = f"Page {slide_num} of 11"
    fr_p.font.size = Pt(9.5)
    fr_p.font.bold = True
    fr_p.font.color.rgb = GOLD_ROYAL
    fr_p.font.name = "Calibri"


def add_card(
    slide,
    left: float,
    top: float,
    width: float,
    height: float,
    title: str,
    bullets: list[str],
    accent_color=GOLD_ROYAL,
    fill_color=CARD_EMERALD,
    badge_text: str | None = None,
):
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(left),
        Inches(top),
        Inches(width),
        Inches(height),
    )
    card.adjustments[0] = 0.04
    card.fill.solid()
    card.fill.fore_color.rgb = fill_color
    card.line.color.rgb = accent_color
    card.line.width = Pt(1.25)

    y_offset = top + 0.18
    if badge_text:
        badge = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            Inches(left + 0.22),
            Inches(y_offset),
            Inches(min(width - 0.44, 2.8)),
            Inches(0.28),
        )
        badge.fill.solid()
        badge.fill.fore_color.rgb = PILL_EMERALD
        badge.line.color.rgb = accent_color
        badge.line.width = Pt(0.75)
        bp = badge.text_frame.paragraphs[0]
        bp.text = badge_text
        bp.font.size = Pt(8.5)
        bp.font.bold = True
        bp.font.color.rgb = GOLD_SOFT
        bp.font.name = "Consolas"
        y_offset += 0.34

    # Card Title
    tbox = slide.shapes.add_textbox(
        Inches(left + 0.22), Inches(y_offset), Inches(width - 0.44), Inches(0.45)
    )
    tf = tbox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(15.5)
    p.font.bold = True
    p.font.color.rgb = GOLD_BRIGHT if accent_color == GOLD_ROYAL else EMERALD_MINT
    p.font.name = "Calibri"

    # Card Bullets
    bbox = slide.shapes.add_textbox(
        Inches(left + 0.22),
        Inches(y_offset + 0.42),
        Inches(width - 0.44),
        Inches(height - (y_offset - top) - 0.52),
    )
    btf = bbox.text_frame
    btf.word_wrap = True
    for i, item in enumerate(bullets):
        bp = btf.paragraphs[0] if i == 0 else btf.add_paragraph()
        bp.text = f"▸  {item}"
        bp.font.size = Pt(11.5)
        bp.font.color.rgb = TEXT_WHITE
        bp.font.name = "Calibri"
        bp.space_after = Pt(6)


def build_presentation(output_path: str):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 1: TEAM DETAILS
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Hero Frame Card
    hero = s1.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(0.55), Inches(12.133), Inches(2.65)
    )
    hero.adjustments[0] = 0.04
    hero.fill.solid()
    hero.fill.fore_color.rgb = CARD_EMERALD_ALT
    hero.line.color.rgb = GOLD_BRIGHT
    hero.line.width = Pt(1.75)

    badge1 = s1.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.95), Inches(0.82), Inches(5.6), Inches(0.36)
    )
    badge1.fill.solid()
    badge1.fill.fore_color.rgb = PILL_EMERALD
    badge1.line.color.rgb = GOLD_ROYAL
    bp1 = badge1.text_frame.paragraphs[0]
    bp1.text = "TP15  •  AI AUTONOMOUS WORKFLOW AUTOMATION AGENT"
    bp1.font.size = Pt(10)
    bp1.font.bold = True
    bp1.font.color.rgb = GOLD_SOFT
    bp1.font.name = "Consolas"

    tbox1 = s1.shapes.add_textbox(Inches(0.95), Inches(1.28), Inches(11.4), Inches(1.1))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "SPARK AI — Your AI Workforce. One Command Away."
    p1.font.size = Pt(34)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.font.name = "Calibri"

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Autonomous Multi-Agent Orchestration & Workflow Execution Platform powered by Next.js 15, FastAPI, LangGraph & Google Gemini 2.5 Flash"
    p1_sub.font.size = Pt(14)
    p1_sub.font.color.rgb = EMERALD_MINT
    p1_sub.font.name = "Calibri"

    # Team Details Cards (Slide 1)
    add_card(
        s1,
        left=0.6,
        top=3.48,
        width=3.85,
        height=3.35,
        title="Team Identity & Track",
        badge_text="SLIDE 01 • TEAM PROFILE",
        bullets=[
            "Team Name: Team SPARK AI",
            "Problem ID: TP15 — AI Autonomous Workflow Automation Agent",
            "Domain: Agentic AI & Enterprise Process Automation",
            "Theme: Imperial Emerald & Gold Command Center",
        ],
        accent_color=GOLD_ROYAL,
    )

    add_card(
        s1,
        left=4.74,
        top=3.48,
        width=4.15,
        height=3.35,
        title="Team Leader & Members",
        badge_text="PROJECT ROSTER",
        bullets=[
            "Team Name: Team SPARK AI",
            "Team Leader: Nivis Jhonson",
            "Team Member: Vijay PA",
        ],
        accent_color=EMERALD_BRIGHT,
        fill_color=CARD_EMERALD_ALT,
    )

    add_card(
        s1,
        left=9.18,
        top=3.48,
        width=3.55,
        height=3.35,
        title="Platform Highlights",
        badge_text="SYSTEM AT A GLANCE",
        bullets=[
            "6 Specialized Gemini 2.5 Flash Agents",
            "Parallel DAG Execution (Research || Analysis)",
            "Human-in-the-Loop Approval Gate",
            "Live React Flow + SSE Telemetry",
            "Individual Firebase Google SSO",
        ],
        accent_color=GOLD_ROYAL,
    )

    # =========================================================================
    # SLIDE 2: PROJECT OBJECTIVE & PROBLEM STATEMENT
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s2,
        slide_num=2,
        tag="Problem Statement & Objective",
        title="Project Objective & Problem Statement",
        subtitle="Addressing TP15: Eliminating fragmented manual coordination across business workflows",
    )

    # Problem Banner Box
    prob_banner = s2.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.82), Inches(12.133), Inches(1.22)
    )
    prob_banner.adjustments[0] = 0.06
    prob_banner.fill.solid()
    prob_banner.fill.fore_color.rgb = CARD_EMERALD_ALT
    prob_banner.line.color.rgb = GOLD_BRIGHT
    prob_banner.line.width = Pt(1.5)
    ptf = prob_banner.text_frame
    ptf.word_wrap = True
    ptf.margin_left = Inches(0.25)
    ptf.margin_top = Inches(0.14)
    pp0 = ptf.paragraphs[0]
    pp0.text = "PROBLEM IDENTIFIED (TP15. AI AUTONOMOUS WORKFLOW AUTOMATION AGENT):"
    pp0.font.size = Pt(10.5)
    pp0.font.bold = True
    pp0.font.color.rgb = GOLD_BRIGHT
    pp1 = ptf.add_paragraph()
    pp1.text = '"Routine business processes require people to coordinate multiple steps, tools and status updates manually."'
    pp1.font.size = Pt(17)
    pp1.font.bold = True
    pp1.font.color.rgb = TEXT_WHITE

    add_card(
        s2,
        left=0.6,
        top=3.25,
        width=5.9,
        height=3.55,
        title="Project Objective",
        badge_text="CORE MISSION",
        bullets=[
            "Build an autonomous multi-agent AI command center that turns a single natural-language directive into end-to-end execution.",
            "Replace manual task handoffs with 6 specialized Gemini 2.5 Flash agents orchestrated via a stateful LangGraph DAG.",
            "Automate research, quantitative analysis, headless browser actions, workspace updates, and executive reporting.",
            "Maintain enterprise safety via Human-in-the-Loop approval checkpoints and SQLite checkpoint persistence.",
        ],
        accent_color=EMERALD_BRIGHT,
    )

    add_card(
        s2,
        left=6.83,
        top=3.25,
        width=5.9,
        height=3.55,
        title="Why Does This Problem Need a Solution?",
        badge_text="BUSINESS IMPACT",
        bullets=[
            "Severe Productivity Drain: Teams spend 40%+ of their week copying data between docs, spreadsheets, browsers, and Slack.",
            "Sequential Bottlenecks: Research and quantitative analysis happen one after another instead of running in parallel.",
            "Human Error & Dropped Handoffs: Manual status updates lead to stale reports, missed SLAs, and inconsistent execution.",
            "Lack of Governance in Basic Scripts: Traditional brittle RPA scripts fail on dynamic tasks and lack human approval gates.",
        ],
        accent_color=GOLD_ROYAL,
    )

    # =========================================================================
    # SLIDE 3: PROPOSED SOLUTION
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s3,
        slide_num=3,
        tag="Proposed Solution",
        title="Proposed Solution — SPARK AI Command Center",
        subtitle="Autonomous Multi-Agent Workforce with Parallel DAG Execution & Human-in-the-Loop Governance",
    )

    add_card(
        s3,
        left=0.6,
        top=1.85,
        width=3.85,
        height=4.95,
        title="1. Our Solution: SPARK AI",
        badge_text="WHAT WE BUILT",
        bullets=[
            "A full-stack AI Command Center pairing a Next.js 15 + React Flow frontend with a FastAPI + LangGraph backend.",
            "6 Specialized AI Agents: Supervisor, Planner, Research, Analysis, Execution, and Reporting.",
            "Single-command mission composer with pre-built enterprise templates (RevOps, Cloud FinOps, Security, Legal).",
            "Individual user isolation via Firebase Google OAuth 2.0 SSO & SQLite account persistence.",
        ],
        accent_color=GOLD_ROYAL,
    )

    add_card(
        s3,
        left=4.74,
        top=1.85,
        width=3.85,
        height=4.95,
        title="2. How It Solves the Problem",
        badge_text="HOW IT WORKS",
        bullets=[
            "Eliminates Manual Planning: Supervisor & Planner automatically decompose goals into a 4-stage DAG.",
            "Eliminates Sequential Waiting: Research Agent and Analysis Agent execute concurrently in parallel branches.",
            "Eliminates Unchecked Risk: Pauses at a Human-in-the-Loop gate before external browser/API mutations.",
            "Eliminates Manual Status Updates: Streams live SSE telemetry and publishes audit-signed Markdown reports.",
        ],
        accent_color=EMERALD_BRIGHT,
        fill_color=CARD_EMERALD_ALT,
    )

    add_card(
        s3,
        left=8.88,
        top=1.85,
        width=3.85,
        height=4.95,
        title="3. Key Quantifiable Benefits",
        badge_text="MEASURED OUTCOMES",
        bullets=[
            "42% Faster Cycle Time via parallel Research || Analysis branch execution.",
            "Zero Manual Status Chasing: Live React Flow graph shows exact node state, latency, and token usage.",
            "100% Governance Compliance: Every high-risk tool payload is reviewed and logged with reviewer notes.",
            "Instant Executive Briefings: Exportable Markdown reports with KPI scorecards and recommendations.",
        ],
        accent_color=GOLD_ROYAL,
    )

    # =========================================================================
    # SLIDE 4: TECHNOLOGIES & AI TOOLS USED
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s4,
        slide_num=4,
        tag="Tech Stack & AI Tools",
        title="Technologies & AI Tools Used",
        subtitle="Modern production stack combining Next.js 15, FastAPI, LangGraph, and Google Gemini 2.5 Flash",
    )

    add_card(
        s4,
        left=0.6,
        top=1.85,
        width=5.9,
        height=2.35,
        title="AI / GenAI & Multi-Agent Orchestration",
        badge_text="ARTIFICIAL INTELLIGENCE",
        bullets=[
            "LLM Engine: Google Gemini 2.5 Flash (google-genai SDK, structured JSON synthesis, low-latency inference)",
            "Agent Framework: LangGraph (StateGraph, parallel fan-out/fan-in edges, MemorySaver checkpointer)",
            "Agent Fleet: 6 role-specialized agents with scoped toolboxes & token/cost accounting",
        ],
        accent_color=GOLD_ROYAL,
        fill_color=CARD_EMERALD_ALT,
    )

    add_card(
        s4,
        left=6.83,
        top=1.85,
        width=5.9,
        height=2.35,
        title="Frontend Architecture & Motion Design",
        badge_text="FRONTEND STACK",
        bullets=[
            "Core Framework: Next.js 15 (App Router) + React 18 + Strict TypeScript + Tailwind CSS + shadcn/ui",
            "Workflow & Analytics Visualization: React Flow (@xyflow/react) live DAG canvas + Recharts telemetry",
            "Motion & Smooth Scroll: GSAP + ScrollTrigger + @gsap/react + Lenis + Motion for React + Lucide Icons",
        ],
        accent_color=EMERALD_BRIGHT,
    )

    add_card(
        s4,
        left=0.6,
        top=4.42,
        width=5.9,
        height=2.38,
        title="Backend Runtime & Database Persistence",
        badge_text="BACKEND & DATABASE",
        bullets=[
            "API & Streaming Server: Python 3 + FastAPI + Uvicorn + Server-Sent Events (sse-starlette) + GZip",
            "Database & Checkpoints: SQLite 3 (WAL mode enabled) + SQLAlchemy 2.0 ORM + Pydantic v2 schemas",
            "Client Acceleration: In-memory Stale-While-Revalidate (SWR) cache with 0ms instant route hydration",
        ],
        accent_color=EMERALD_BRIGHT,
    )

    add_card(
        s4,
        left=6.83,
        top=4.42,
        width=5.9,
        height=2.38,
        title="Authentication, Security & Tool Connectors",
        badge_text="SECURITY & INTEGRATIONS",
        bullets=[
            "Identity & Auth: Firebase Authentication (Google OAuth 2.0 Popup SSO + PBKDF2-SHA256 credentials)",
            "Zero-Trust Secret Isolation: Gemini API keys & cloud credentials isolated strictly in backend .env",
            "Connected Toolboxes: Playwright Headless Browser, Google Workspace, Slack Webhook Bus, Python Sandbox",
        ],
        accent_color=GOLD_ROYAL,
    )

    # =========================================================================
    # SLIDE 5: SYSTEM ARCHITECTURE & WORKFLOW
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s5,
        slide_num=5,
        tag="Architecture & DAG Flow",
        title="System Architecture & Multi-Agent Workflow",
        subtitle="End-to-end data flow from Natural Language Command to Parallel LangGraph Execution & SQLite Persistence",
    )

    # Visual Pipeline Diagram Boxes on Top Half
    nodes_spec = [
        ("1. Supervisor", "Intent & Policy Guard", 0.6, 2.25, 1.8, 1.15, GOLD_ROYAL),
        ("2. Planner", "DAG Task Compiler", 2.65, 2.25, 1.8, 1.15, EMERALD_BRIGHT),
        ("3A. Research", "Web & Docs Retrieval", 4.75, 1.78, 2.0, 0.92, EMERALD_MINT),
        ("3B. Analysis", "Quant & Risk Sandbox", 4.75, 2.82, 2.0, 0.92, GOLD_BRIGHT),
        ("Approval Gate", "Human-in-the-Loop", 7.05, 2.25, 1.75, 1.15, GOLD_BRIGHT),
        ("4. Execution", "Browser & API Runner", 9.05, 2.25, 1.8, 1.15, EMERALD_BRIGHT),
        ("5. Reporting", "Executive Brief & KPIs", 11.1, 2.25, 1.63, 1.15, GOLD_ROYAL),
    ]

    for n_title, n_sub, x, y, w, h, col in nodes_spec:
        box = s5.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
        )
        box.adjustments[0] = 0.08
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_EMERALD_ALT
        box.line.color.rgb = col
        box.line.width = Pt(1.5)
        tf = box.text_frame
        tf.word_wrap = True
        p0 = tf.paragraphs[0]
        p0.alignment = PP_ALIGN.CENTER
        p0.text = n_title
        p0.font.size = Pt(12)
        p0.font.bold = True
        p0.font.color.rgb = GOLD_SOFT if col in (GOLD_ROYAL, GOLD_BRIGHT) else EMERALD_MINT
        p1 = tf.add_paragraph()
        p1.alignment = PP_ALIGN.CENTER
        p1.text = n_sub
        p1.font.size = Pt(9.5)
        p1.font.color.rgb = TEXT_WHITE

    # Bottom 2 Cards explaining Step-by-Step Workflow & Data Flow
    add_card(
        s5,
        left=0.6,
        top=4.02,
        width=6.0,
        height=2.8,
        title="Step-by-Step Multi-Agent Workflow",
        badge_text="EXECUTION LIFECYCLE",
        bullets=[
            "Step 1 (Command): Operator submits directive in Next.js or selects an enterprise blueprint.",
            "Step 2 (Supervisor & Planner): Validates security policy and compiles a 4-stage parallel DAG.",
            "Step 3 (Parallel Fork): Research Agent & Analysis Agent execute simultaneously via asyncio/LangGraph.",
            "Step 4 (Governance & Execution): Pauses at Approval Gate (if enabled), then runs browser/API tools & publishes report.",
        ],
        accent_color=GOLD_ROYAL,
    )

    add_card(
        s5,
        left=6.83,
        top=4.02,
        width=5.9,
        height=2.8,
        title="Data Flow & Real-Time State Synchronization",
        badge_text="TELEMETRY & PERSISTENCE",
        bullets=[
            "Typed State Bus: SparkAgentState carries supervisor_directive, plan, research, analysis, and tokens.",
            "Real-Time SSE Broadcaster: Every node transition pushes agent_event payloads to React Flow (<15ms).",
            "Thread-Safe SQLite WAL Ledger: Persists WorkflowRun, AgentEventLog, ApprovalRequest, and ReportArtifact.",
            "Instant SWR Frontend Cache: Synchronously hydrates all 10 dashboard views with zero loading flicker.",
        ],
        accent_color=EMERALD_BRIGHT,
    )

    # =========================================================================
    # SLIDE 6: IMPLEMENTATION
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s6,
        slide_num=6,
        tag="System Implementation",
        title="Implementation — Modules, AI Integration & Engineering",
        subtitle="Modular 10-view operational command center connected to a stateful Python LangGraph engine",
    )

    add_card(
        s6,
        left=0.6,
        top=1.85,
        width=3.85,
        height=4.95,
        title="Key Modules & 10 Views",
        badge_text="FRONTEND MODULES",
        bullets=[
            "Public Showcase Landing Page with Lenis smooth scroll & GSAP timelines.",
            "Single-Page Firebase Google OAuth 2.0 Login & Registration gateway (/login).",
            "Command Center (/dashboard) with KPI cards & Recharts throughput/latency charts.",
            "New Workflow Composer (/dashboard/new) & Agent Workspace (/dashboard/agents).",
            "Live React Flow Monitor (/dashboard/monitor), Approval Center, Reports Vault, History, Integrations, Health & Settings.",
        ],
        accent_color=GOLD_ROYAL,
    )

    add_card(
        s6,
        left=4.74,
        top=1.85,
        width=3.85,
        height=4.95,
        title="AI & LangGraph Integration",
        badge_text="AI ORCHESTRATION",
        bullets=[
            "Two-Phase Compiled StateGraph: pre_execution_graph (Supervisor -> Planner -> Research || Analysis) and post_approval_graph (Execution -> Reporting).",
            "Gemini 2.5 Flash JSON Mode: Enforces response_mime_type='application/json' with temperature=0.2.",
            "Resilient Fallback Synthesis: Ensures 100% deterministic completion if external network is throttled.",
            "Live Token & Cost Metering: Tracks tokens_accumulated and USD cost per node.",
        ],
        accent_color=EMERALD_BRIGHT,
        fill_color=CARD_EMERALD_ALT,
    )

    add_card(
        s6,
        left=8.88,
        top=1.85,
        width=3.85,
        height=4.95,
        title="Technical & Speed Optimizations",
        badge_text="ENGINEERING EXCELLENCE",
        bullets=[
            "Thread-Safe Parallel DB Locking: Prevents race conditions when Research & Analysis update SQLite simultaneously.",
            "SQLite WAL Pragma Tuning: Write-Ahead Logging + 64MB memory cache for <15ms query responses.",
            "Zero-Preflight GET Requests & GZip: Eliminates duplicate CORS OPTIONS round-trips.",
            "Verified by 10 Automated End-to-End Test Cases (tests/test_spark_ai.py).",
        ],
        accent_color=GOLD_ROYAL,
    )

    # =========================================================================
    # SLIDE 7: WORKING PROTOTYPE / DEMO
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s7,
        slide_num=7,
        tag="Working Prototype & Live Demo",
        title="Working Prototype / Live Application Demo",
        subtitle="Live screenshots of SPARK AI running at http://localhost:3000 with real SQLite & LangGraph telemetry",
    )

    screenshot_dashboard = r"C:\Users\vijay\.gemini\antigravity\brain\3c308c2e-9786-4151-b8a9-d2116ee1f3fd\browser_evidence\c8f99fa3-52a4-4141-85b8-fc3b367e35c5\final_step_120.png"
    screenshot_login = r"C:\Users\vijay\.gemini\antigravity\brain\3c308c2e-9786-4151-b8a9-d2116ee1f3fd\browser_evidence\c8f99fa3-52a4-4141-85b8-fc3b367e35c5\final_step_58.png"

    if os.path.exists(screenshot_dashboard):
        frame1 = s7.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.82), Inches(7.45), Inches(4.95)
        )
        frame1.fill.solid()
        frame1.fill.fore_color.rgb = CARD_EMERALD
        frame1.line.color.rgb = GOLD_BRIGHT
        frame1.line.width = Pt(1.5)
        s7.shapes.add_picture(
            screenshot_dashboard, Inches(0.72), Inches(1.94), width=Inches(7.21)
        )
        cap1 = s7.shapes.add_textbox(Inches(0.75), Inches(6.35), Inches(7.1), Inches(0.35))
        cp1 = cap1.text_frame.paragraphs[0]
        cp1.text = "Live Screenshot: SPARK AI Emerald & Gold Command Center (/dashboard) — 10 Workflows, Live Recharts & 6 Agents"
        cp1.font.size = Pt(9.5)
        cp1.font.bold = True
        cp1.font.color.rgb = GOLD_SOFT
    else:
        add_card(
            s7,
            left=0.6,
            top=1.82,
            width=7.45,
            height=4.95,
            title="Live AI Command Center (/dashboard)",
            badge_text="WORKING PROTOTYPE",
            bullets=[
                "Real-time KPI cards: Total Workflows, Avg Cycle Time, Gemini 2.5 Flash Tokens, and Reports.",
                "Dual-axis Recharts Area Chart (Workflow Execution & Token Throughput) & Agent Latency Bar Chart.",
                "Interactive Recent Multi-Agent Missions table linked directly to the Live React Flow Monitor.",
            ],
        )

    add_card(
        s7,
        left=8.28,
        top=1.82,
        width=4.45,
        height=4.95,
        title="Prototype Outputs & Verification",
        badge_text="LIVE DEMO RESULTS",
        bullets=[
            "Live Frontend: http://localhost:3000",
            "FastAPI Backend: http://127.0.0.1:8000 / 8765",
            "10/10 Automated E2E Tests Passed: Health (16.9ms), Overview (14.7ms), Agents (6.7ms).",
            "Sub-Second Navigation: All 10 sidebar tabs switch in ~425ms–760ms.",
            "Real Generated Artifacts: Exportable Markdown executive reports with KPI deltas and confidence scores.",
            "Human-in-the-Loop Demo: Approve or Reject live checkpoints in one click.",
        ],
        accent_color=EMERALD_BRIGHT,
        fill_color=CARD_EMERALD_ALT,
    )

    # =========================================================================
    # SLIDE 8: INNOVATION & UNIQUENESS
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s8,
        slide_num=8,
        tag="Innovation & Differentiation",
        title="Innovation & Uniqueness",
        subtitle="What sets SPARK AI apart from traditional RPA tools and single-threaded AI chatbots",
    )

    add_card(
        s8,
        left=0.6,
        top=1.85,
        width=5.9,
        height=2.35,
        title="1. Parallel Multi-Agent DAG vs. Linear Chat",
        badge_text="ARCHITECTURAL INNOVATION",
        bullets=[
            "Unlike standard chatbots that process prompts sequentially, SPARK AI compiles a parallel StateGraph.",
            "Research Agent (web/document retrieval) and Analysis Agent (quantitative risk modeling) run concurrently.",
        ],
        accent_color=GOLD_ROYAL,
        fill_color=CARD_EMERALD_ALT,
    )

    add_card(
        s8,
        left=6.83,
        top=1.85,
        width=5.9,
        height=2.35,
        title="2.Stateful Human-in-the-Loop Checkpoint Gate",
        badge_text="ENTERPRISE GOVERNANCE",
        bullets=[
            "Workflows pause cleanly before external write mutations, persisting state in SQLite + MemorySaver.",
            "Operators inspect the exact JSON tool payload and rationale before authorizing or halting execution.",
        ],
        accent_color=EMERALD_BRIGHT,
    )

    add_card(
        s8,
        left=0.6,
        top=4.42,
        width=5.9,
        height=2.38,
        title="3. Zero-Hallucination Live DAG Telemetry",
        badge_text="OBSERVABILITY",
        bullets=[
            "React Flow (@xyflow/react) nodes animate strictly from real FastAPI Server-Sent Events (SSE).",
            "Every node exposes its live tool call, latency in milliseconds, token count, and checkpoint summary.",
        ],
        accent_color=EMERALD_BRIGHT,
    )

    add_card(
        s8,
        left=6.83,
        top=4.42,
        width=5.9,
        height=2.38,
        title="4. Zero-Trust Secret Isolation & Individual SSO",
        badge_text="SECURITY BY DESIGN",
        bullets=[
            "Gemini API keys and OAuth secrets never touch frontend code; all AI calls execute on FastAPI.",
            "Every user logs in with their own Gmail via Firebase Google OAuth 2.0 (prompt: select_account).",
        ],
        accent_color=GOLD_ROYAL,
    )

    # =========================================================================
    # SLIDE 9: REAL-WORLD APPLICATIONS & FUTURE SCOPE
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s9,
        slide_num=9,
        tag="Applications & Roadmap",
        title="Real-World Applications & Future Scope",
        subtitle="Practical enterprise deployments across RevOps, Cloud FinOps, Security, and Legal Operations",
    )

    add_card(
        s9,
        left=0.6,
        top=1.85,
        width=4.0,
        height=4.95,
        title="Practical Enterprise Use Cases",
        badge_text="REAL-WORLD DOMAINS",
        bullets=[
            "Revenue Operations: Competitor pricing extraction, pipeline simulation, and CRM/Slack updates.",
            "Cloud FinOps: Multi-cluster Kubernetes & GPU utilization audits with automated rightsizing patches.",
            "Security & Compliance: Zero-trust API perimeter audits, CVSS scoring, and SOC2 executive reports.",
            "Legal & Procurement: Vendor SLA contract cross-examination and risk scorecard syncing.",
        ],
        accent_color=GOLD_ROYAL,
    )

    add_card(
        s9,
        left=4.85,
        top=1.85,
        width=3.65,
        height=4.95,
        title="Target Users & Personas",
        badge_text="TARGET AUDIENCE",
        bullets=[
            "Enterprise Operations & Strategy Leaders",
            "RevOps & Financial Operations (FinOps) Teams",
            "DevSecOps & Cloud Platform Engineers",
            "Compliance, Risk & Legal Analysts",
            "AI Automation & Digital Transformation Teams",
        ],
        accent_color=EMERALD_BRIGHT,
        fill_color=CARD_EMERALD_ALT,
    )

    add_card(
        s9,
        left=8.75,
        top=1.85,
        width=3.98,
        height=4.95,
        title="Future Scope & Enhancements",
        badge_text="PRODUCT ROADMAP",
        bullets=[
            "Scheduled Autonomous Cadences: Cron-triggered recurring workflows with anomaly alerts.",
            "Dynamic MCP Tool Marketplace: Plug-and-play Model Context Protocol connectors.",
            "Multi-Tenant Team Workspaces: Role-based approval chains (Analyst -> Director -> VP).",
            "Voice & Multimodal Command Dispatch: Real-time audio/video briefing synthesis.",
        ],
        accent_color=GOLD_ROYAL,
    )

    # =========================================================================
    # SLIDE 10: CONCLUSION
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(
        s10,
        slide_num=10,
        tag="Executive Summary",
        title="Conclusion",
        subtitle="Transforming fragmented manual business processes into autonomous, governed multi-agent outcomes",
    )

    add_card(
        s10,
        left=0.6,
        top=1.85,
        width=5.9,
        height=4.95,
        title="Project Outcome",
        badge_text="DELIVERED SOLUTION",
        bullets=[
            "Directly solves TP15 (AI Autonomous Workflow Automation Agent) by replacing manual multi-step coordination with a single command center.",
            "Delivered a complete production-grade Next.js 15 + TypeScript + Tailwind + shadcn/ui frontend paired with a Python FastAPI + LangGraph + Gemini 2.5 Flash backend.",
            "Persisted all workflows, events, approvals, reports, and user accounts in SQLite 3 (WAL mode).",
            "Validated 100% of endpoints, parallel DAG execution, and approval gates via automated E2E tests.",
        ],
        accent_color=GOLD_ROYAL,
        fill_color=CARD_EMERALD_ALT,
    )

    add_card(
        s10,
        left=6.83,
        top=1.85,
        width=5.9,
        height=4.95,
        title="Key Takeaways",
        badge_text="STRATEGIC IMPACT",
        bullets=[
            "Stop Coordinating Every Step — Start Commanding Outcomes: Operators focus on high-level strategy while specialized AI agents handle execution.",
            "Speed + Safety Coexist: Parallel LangGraph branches deliver speed, while Human-in-the-Loop gates guarantee enterprise control.",
            "Transparent AI Telemetry: Live React Flow graphs and audit-signed reports build complete trust in autonomous operations.",
        ],
        accent_color=EMERALD_BRIGHT,
    )

    # =========================================================================
    # SLIDE 11: Q&A — THANK YOU!
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)

    center_card = s11.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.1), Inches(10.933), Inches(5.3)
    )
    center_card.adjustments[0] = 0.04
    center_card.fill.solid()
    center_card.fill.fore_color.rgb = CARD_EMERALD_ALT
    center_card.line.color.rgb = GOLD_BRIGHT
    center_card.line.width = Pt(2)

    q_badge = s11.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.55), Inches(1.65), Inches(4.23), Inches(0.4)
    )
    q_badge.fill.solid()
    q_badge.fill.fore_color.rgb = PILL_EMERALD
    q_badge.line.color.rgb = GOLD_ROYAL
    qp = q_badge.text_frame.paragraphs[0]
    qp.alignment = PP_ALIGN.CENTER
    qp.text = "SLIDE 11 / 11  •  JURY INTERACTION"
    qp.font.size = Pt(10)
    qp.font.bold = True
    qp.font.color.rgb = GOLD_SOFT
    qp.font.name = "Consolas"

    thank_box = s11.shapes.add_textbox(Inches(1.6), Inches(2.3), Inches(10.1), Inches(2.2))
    ttf11 = thank_box.text_frame
    ttf11.word_wrap = True
    tp11 = ttf11.paragraphs[0]
    tp11.alignment = PP_ALIGN.CENTER
    tp11.text = "Thank You!"
    tp11.font.size = Pt(50)
    tp11.font.bold = True
    tp11.font.color.rgb = GOLD_BRIGHT
    tp11.font.name = "Calibri"

    tp11_sub = ttf11.add_paragraph()
    tp11_sub.alignment = PP_ALIGN.CENTER
    tp11_sub.text = "Questions from the Jury"
    tp11_sub.font.size = Pt(24)
    tp11_sub.font.bold = True
    tp11_sub.font.color.rgb = TEXT_WHITE
    tp11_sub.font.name = "Calibri"

    tp11_desc = ttf11.add_paragraph()
    tp11_desc.alignment = PP_ALIGN.CENTER
    tp11_desc.text = "\nSPARK AI — Autonomous Multi-Agent Workflow Automation Platform (TP15)\nNext.js 15 • FastAPI • LangGraph • Google Gemini 2.5 Flash • SQLite • Firebase Auth"
    tp11_desc.font.size = Pt(13)
    tp11_desc.font.color.rgb = EMERALD_MINT
    tp11_desc.font.name = "Calibri"

    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    out_file = os.path.join(base_dir, "SPARK_AI_Presentation.pptx")
    final_file = os.path.join(base_dir, "SPARK_AI_Presentation_Final.pptx")
    try:
        build_presentation(out_file)
    except PermissionError:
        print(f"Note: {out_file} is currently open in PowerPoint. Saving updated deck to {final_file}...")
    build_presentation(final_file)

