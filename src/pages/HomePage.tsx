import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Database,
  Users,
  Globe,
  Mail,
  Phone,
  Lock,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Quote,
  TrendingUp,
  Building2,
  Scale,
  Landmark,
  HeartPulse,
  Cpu,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, type Tone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ComplianceRing } from '@/components/ui/Charts';
import { Counter, Reveal } from '@/components/ui/Motion';

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Industries', href: '#industries' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Frameworks', href: '#frameworks' },
  { label: 'FAQ', href: '#faq' },
];

const SECTORS = [
  { label: 'Financial Services', icon: Landmark },
  { label: 'Healthcare', icon: HeartPulse },
  { label: 'Enterprise SaaS', icon: Cpu },
  { label: 'Legal & Professional', icon: Briefcase },
  { label: 'Public Sector', icon: Building2 },
  { label: 'Manufacturing', icon: Scale },
];

const STATS = [
  {
    to: 295,
    suffix: '',
    label: 'Regulatory instruments mapped',
    hint: 'GDPR · NIS2 · DORA · ISO 27001 · SOC 2 · HIPAA',
  },
  {
    to: 18236,
    suffix: '',
    label: 'Verbatim source citations',
    hint: 'Every obligation traceable to the clause',
  },
  {
    to: 34,
    suffix: '+',
    label: 'Jurisdictions covered',
    hint: 'One unified control architecture',
  },
  {
    to: 87,
    suffix: '%',
    label: 'Average audit readiness',
    hint: 'Across active customer programmes',
  },
];

const PROBLEM_CARDS = [
  {
    icon: <ShieldAlert size={20} stroke="currentColor" />,
    title: 'Generated, not grounded',
    body:
      'Most compliance AI generates answers from a model’s memory. A hallucinated control or invented citation reads fine — until an auditor checks it against the law.',
  },
  {
    icon: <FileText size={20} stroke="currentColor" />,
    title: 'Manual everything',
    body:
      'Filling forms, hunting evidence across internal systems, hand-mapping what connects to what. Busywork that consumes compliance teams and drifts out of date within weeks.',
  },
  {
    icon: <Lock size={20} stroke="currentColor" />,
    title: 'Access you can’t take back',
    body:
      'Every tool wants deep, standing read-access into your stack — and now its agents roaming it too. The exact third-party exposure security teams are told to shut down.',
  },
  {
    icon: <Globe size={20} stroke="currentColor" />,
    title: 'Framework sprawl',
    body:
      'Each new regulation means new mappings, new evidence and new assessments. Teams spend months per framework while the regulatory landscape keeps expanding.',
  },
];

const CAPABILITY_CARDS = [
  {
    icon: <ShieldCheck size={20} stroke="currentColor" />,
    title: 'Deterministic, not generative',
    subtitle: 'Built by AI, grounded in law',
    items: ['Verbatim source citations', 'Reproducible & explainable', '18,236 source citations'],
  },
  {
    icon: <MessageCircle size={20} stroke="currentColor" />,
    title: 'Works in your chat',
    subtitle: 'Any MCP-capable assistant',
    items: ['Guided onboarding in chat', 'Any MCP-capable assistant', 'Or any headless agent'],
  },
  {
    icon: <Database size={20} stroke="currentColor" />,
    title: 'Your systems stay yours',
    subtitle: 'Automation without exposure',
    items: ['Designed for no standing access', 'Findings, not raw data', 'Runs under your controls'],
  },
  {
    icon: <Users size={20} stroke="currentColor" />,
    title: 'Managed expertise',
    subtitle: 'Your extended team',
    items: ['Compliance analysts', 'Regulatory monitoring', 'Audit preparation support'],
  },
];

const STEPS = [
  {
    step: '01',
    day: 'Day 1',
    title: 'Map the organization — SoA generated automatically',
    body:
      'Define your business reality: systems, processes, data flows and structure. AEGIS auto-generates your Statement of Applicability across every relevant framework — the document most teams spend weeks building manually.',
    chips: ['Systems', 'Processes', 'Data', 'Teams', 'Vendors', 'Assets'],
  },
  {
    step: '02',
    day: 'Day 2–3',
    title: 'See exactly what applies',
    body:
      'AEGIS maps applicable regulations to your specific context using three-tier risk scoring: inherent risk, control effectiveness and residual exposure. No guessing which controls matter for which entity.',
    chips: [
      { label: 'GDPR', applies: 'Applies' },
      { label: 'SOC 2', applies: 'Applies' },
      { label: 'HIPAA', applies: 'N/A' },
      { label: 'NIS2', applies: 'Applies' },
    ],
  },
  {
    step: '03',
    day: 'Week 1',
    title: 'Understand your exposure',
    body:
      'A prioritized view of gaps and risks across all frameworks simultaneously. Remediation ranked by business impact, not just compliance severity — so leadership knows where to act first.',
    chips: [
      { label: '73%', applies: 'Compliance Score' },
      { label: 'Critical', applies: '2' },
      { label: 'High', applies: '5' },
      { label: 'Medium', applies: '12' },
    ],
  },
  {
    step: '04',
    day: 'Ongoing',
    title: 'Take action — and stay current',
    body:
      'Continuous monitoring with automated evidence collection, remediation tracking and regulatory change alerts. Your posture updates as the business changes, not once a year.',
    chips: ['Update access policies', 'Implement MFA', 'Review vendor contracts'],
  },
];

const FRAMEWORKS = [
  { name: 'GDPR', desc: 'EU Data Protection', meta: '99 articles · 173 recitals' },
  { name: 'NIS2', desc: 'EU Cybersecurity', meta: '46 articles · 11 annexes' },
  { name: 'DORA', desc: 'Digital Operations', meta: '64 articles · 2 annexes' },
  { name: 'ISO 27001', desc: 'Info Security', meta: '93 controls · 4 themes' },
  { name: 'SOC 2', desc: 'Trust Services', meta: '5 trust criteria · 61 points' },
  { name: 'HIPAA', desc: 'Healthcare', meta: '54 standards · 75 specifications' },
  { name: 'PCI DSS', desc: 'Payment Card', meta: '12 requirements · 264 sub-controls' },
  { name: '+ Custom', desc: 'Your standards, mapped', meta: 'Cross-framework control mapping' },
];

const FAQS: Array<[string, string]> = [
  [
    'How does AEGIS GRC differ from traditional compliance tools?',
    'Traditional tools are built for auditors, not for the people running security programmes. AEGIS pairs a deterministic, source-cited compliance engine with your own agents running inside your perimeter — every obligation traces to a verbatim citation from the source regulation.',
  ],
  [
    'What regulatory frameworks does AEGIS support?',
    'GDPR, NIS2, DORA, ISO 27001, SOC 2, HIPAA, PCI DSS and custom standards — 295 regulatory instruments across 34+ jurisdictions, unified through a single control architecture.',
  ],
  [
    'How long does it take to get started?',
    'AEGIS compresses months of compliance work into days. Day 1 maps your organisation and auto-generates your Statement of Applicability; within a week you have a prioritised gap and risk view, then continuous monitoring keeps you current.',
  ],
  [
    'Does AEGIS include managed compliance services?',
    'Yes. Software alone doesn’t solve compliance. AEGIS pairs the platform with regulatory experts — compliance analysts who know your landscape, scoped to regulatory monitoring, assessment support and audit preparation.',
  ],
  [
    'How does cross-framework compliance work?',
    'Cross-framework control mapping lets you implement once and satisfy many. Map controls across GDPR, NIS2, DORA, ISO 27001, SOC 2 and HIPAA without redundant assessments or vendor migration.',
  ],
  [
    'Is AEGIS suitable for multi-entity organizations?',
    'Yes. AEGIS supports multi-tenant workspaces, consolidated dashboards and parent-funded billing, so you can manage every entity or client from one platform.',
  ],
];

const COMPARISON_ROWS = [
  {
    label: 'The engine',
    other: 'Generates answers from a model’s memory',
    aegis: 'Deterministic: every claim traces to verbatim source law',
  },
  {
    label: 'Whose agent',
    other: 'Their agents run across your systems',
    aegis: 'Designed so your own agents run under your own controls',
  },
  {
    label: 'Access',
    other: 'Standing, credentialed read-access to your stack',
    aegis: 'Designed so we hold no credentials to your systems',
  },
  {
    label: 'The labor',
    other: 'You still fill forms and chase evidence',
    aegis: 'Your agent discovers assets, evidence and posture',
  },
  {
    label: 'In front of an auditor',
    other: 'A fluent answer you have to trust',
    aegis: 'A source-cited record you can open and read',
  },
  {
    label: 'Lock-in',
    other: 'One vendor’s agent, one black box',
    aegis: 'Any MCP client, Claude Code or your own',
  },
];

const OVERVIEW_ROWS: Array<{ f: string; d: string; s: string; tone: Tone }> = [
  { f: 'GDPR', d: 'Data Protection', s: '87%', tone: 'warning' },
  { f: 'NIS2', d: 'Supply Chain Security', s: 'Compliant', tone: 'success' },
  { f: 'DORA', d: 'ICT Risk Management', s: '92%', tone: 'info' },
  { f: 'ISO 27001', d: 'Access Control', s: 'Compliant', tone: 'success' },
];

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrolled;
}

function SectionHeading({
  eyebrow,
  title,
  body,
  center = true,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 text-lg leading-relaxed text-slate-600">{body}</p>}
    </Reveal>
  );
}

function Navbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const scrolled = useScrolled();

  return (
    <header
      className={`sticky top-0 z-40 border-b px-4 py-3 transition-all duration-300 sm:px-6 lg:px-8 ${
        scrolled
          ? 'border-line bg-white/85 shadow-sm backdrop-blur-xl'
          : 'border-transparent bg-white/55 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <Link to="/" className="flex flex-shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white shadow-sm">
            <ShieldCheck size={20} strokeWidth={2} stroke="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight text-navy">AEGIS GRC</span>
        </Link>

        <nav className="ml-8 hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {NAV_LINKS.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="relative py-1 transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-navy after:transition-all after:duration-300 hover:text-navy hover:after:w-full"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-semibold text-navy transition-colors hover:text-blue-600"
          >
            Login <ArrowRight size={14} stroke="currentColor" />
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/signup"
            className="hidden items-center rounded-lg border border-navy bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/5 sm:inline-flex"
          >
            Talk to an Expert
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-navy-dark"
          >
            Get Started <ArrowRight size={14} stroke="currentColor" />
          </Link>
          <button
            onClick={onOpenMenu}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} stroke="currentColor" />
          </button>
        </div>
      </div>
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:ml-auto">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-blue-100 via-white to-purple-100 blur-2xl" />

      <Card className="relative overflow-hidden rounded-2xl border border-line/80 bg-white/95 shadow-[0_30px_80px_-20px_rgba(15,45,82,0.35)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-line bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Compliance Overview</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Frameworks</p>
              <p className="text-xl font-bold text-navy">
                <Counter to={6} duration={1200} />
              </p>
            </div>
            <div className="relative flex h-24 w-24 items-center justify-center">
              <ComplianceRing score={87} size={96} strokeWidth={8} />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Readiness</p>
              <p className="text-xl font-bold text-navy">
                <Counter to={94} suffix="%" />
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {OVERVIEW_ROWS.map((row) => (
              <div
                key={row.f}
                className="flex items-center justify-between gap-3 rounded-lg border border-line/70 bg-white px-3 py-2 transition-colors hover:border-slate-300"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-navy/5 text-[10px] font-bold text-navy">
                    {row.f.slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-navy">{row.f}</p>
                    <p className="text-[10px] text-slate-500">{row.d}</p>
                  </div>
                </div>
                <Badge label={row.s} tone={row.tone} />
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Cross-framework coverage</span>
              <span className="font-semibold text-navy">327 controls mapped</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" />
            </div>
          </div>
        </div>
      </Card>

      <div className="animate-float absolute -top-12 left-2 hidden items-center gap-2 rounded-xl border border-line bg-white/95 px-3 py-2 shadow-lg backdrop-blur lg:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <ShieldCheck size={16} />
        </span>
        <div>
          <p className="text-[11px] font-bold text-navy">Source-cited</p>
          <p className="text-[10px] text-slate-500">18,236 citations</p>
        </div>
      </div>

      <div className="animate-float-slow absolute -bottom-12 right-2 hidden items-center gap-2 rounded-xl border border-line bg-white/95 px-3 py-2 shadow-lg backdrop-blur lg:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <TrendingUp size={16} />
        </span>
        <div>
          <p className="text-[11px] font-bold text-navy">Audit-ready</p>
          <p className="text-[10px] text-slate-500">Days, not quarters</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-pattern opacity-70" />
        <div className="animate-glow absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="animate-float-slow absolute right-0 top-10 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="animate-glow absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Deterministic GRC · built for the boardroom
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-6xl">
                Board-ready compliance.
                <span className="text-gradient animate-gradient mt-2 block">Backed by source law.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Every obligation traces to a verbatim citation from the source regulation — not a model’s
                memory. AEGIS gives leadership a defensible view of regulatory exposure while your own agents
                do the manual work inside your perimeter.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  onClick={() => navigate('/signup')}
                  className="group px-6 py-3 text-sm shadow-lg shadow-navy/10"
                >
                  Book a Regulatory Mapping
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 text-sm"
                >
                  See the Platform
                </Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> No credit card required
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600" /> SOC 2 Type II platform
                </span>
                <span className="inline-flex items-center gap-2">
                  <Scale size={16} className="text-purple-600" /> 34+ jurisdictions
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160} y={36}>
            <DashboardPreview />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section id="industries" className="scroll-mt-24 border-y border-line bg-white/70">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Built for regulated enterprises
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {SECTORS.map((sector) => {
              const Icon = sector.icon;
              return (
                <span
                  key={sector.label}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-navy"
                >
                  <Icon size={14} className="text-slate-500" /> {sector.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="relative border-b border-line bg-white py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="group rounded-xl border border-transparent p-4 transition-colors hover:border-line hover:bg-slate-50/70">
                <p className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm font-semibold text-navy">{s.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.hint}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why compliance breaks"
          title="Four reasons today’s compliance stack fails the board"
          body="AI that generates answers you can’t defend, manual work that never ends, standing third-party access, and framework sprawl. Automating it with someone else’s agents just adds a fifth."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PROBLEM_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 80} className="h-full">
              <div className="card hover-lift h-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                    {card.icon}
                  </div>
                  <span className="text-xs font-bold tracking-widest text-slate-500">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section id="platform" className="scroll-mt-24 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The platform"
          title="Your agents do the work. Our engine keeps it honest."
          body="A deterministic compliance engine you can put in front of an auditor — opened to your own agents and designed so the manual work happens inside your perimeter."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CAPABILITY_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 80} className="h-full">
              <div className="card hover-glow h-full p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-light text-blue">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-navy">{card.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.subtitle}
                </p>
                <ul className="mt-4 space-y-2 divide-y divide-slate-100 text-sm text-slate-600">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 py-1.5">
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From complexity to clarity in four steps"
          body="AEGIS compresses months of compliance work into days, then keeps it current as the business and regulations change."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <Reveal key={step.step} delay={i * 90} className="h-full">
              <div className="card hover-lift group relative h-full overflow-hidden p-6 lg:p-7">
                <div className="pointer-events-none absolute -right-6 -top-8 text-[7rem] font-bold leading-none text-navy/[0.04]">
                  {step.step}
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-white shadow-sm">
                      {step.step}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {step.day}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-navy">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {step.chips.map((chip, j) => {
                      if (typeof chip === 'string') {
                        return (
                          <span
                            key={j}
                            className="inline-flex items-center rounded-full border border-line bg-white px-2.5 py-0.5 text-[10px] font-semibold text-navy"
                          >
                            {chip}
                          </span>
                        );
                      }
                      return (
                        <span
                          key={j}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                            chip.applies === 'Applies' || chip.applies === 'Compliance Score'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : chip.label === 'Critical'
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : chip.label === 'High'
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                        >
                          {chip.label}
                          <span className="opacity-70">{chip.applies}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FrameworksSection() {
  return (
    <section id="frameworks" className="scroll-mt-24 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Framework coverage"
          title="295 instruments. 34 jurisdictions. One architecture."
          body="From GDPR to DORA, SOC 2 to HIPAA — every framework mapped through a unified control architecture, so you implement once and satisfy many."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {FRAMEWORKS.map((framework, i) => (
            <Reveal key={framework.name} delay={i * 50} className="h-full">
              <div className="card hover-lift group h-full cursor-pointer p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-lg font-bold text-navy transition-colors group-hover:text-blue-600">
                    {framework.name}
                  </span>
                  <ExternalLink
                    size={14}
                    stroke="currentColor"
                    className="text-slate-500 transition-colors group-hover:text-navy"
                  />
                </div>
                <p className="mt-1 text-xs font-medium text-slate-600">{framework.desc}</p>
                <p className="mt-2 text-[10px] text-slate-500">{framework.meta}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExecutiveQuote() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 p-8 text-center shadow-sm lg:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-purple-100/60 blur-3xl" />

            <Quote size={36} className="relative mx-auto text-blue-500/60" />
            <blockquote className="relative mx-auto mt-6 max-w-3xl text-2xl font-semibold leading-snug text-navy lg:text-3xl">
              “AEGIS turned a six-week audit scramble into a source-cited answer we could hand to the board in
              minutes.”
            </blockquote>

            <div className="relative mt-8 flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                CR
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-navy">Chief Risk Officer</p>
                <p className="text-xs text-slate-500">
                  Global financial services group · 12,000+ employees
                </p>
              </div>
            </div>

            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Audit-ready evidence</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span>Board-level reporting</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span>No standing access</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The difference"
          title="Everyone says “agentic.” The difference is whose boundary the agent runs in."
          body="Agentic GRC is table stakes now. What separates AEGIS is where the agent runs and whether its output survives an auditor."
        />

        <Reveal delay={100} className="mt-14">
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-slate-50/80">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500" />
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Other “agentic” GRC
                  </th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-blue-600">
                    AEGIS
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? '' : 'bg-slate-50/60'}>
                    <td className="border-b border-line px-6 py-4 text-sm font-semibold text-navy">
                      {row.label}
                    </td>
                    <td className="border-b border-line px-6 py-4 text-sm text-slate-600">{row.other}</td>
                    <td className="border-b border-line px-6 py-4 text-sm font-semibold text-navy">
                      {row.aegis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Questions"
          title="Frequently asked questions"
          body="What compliance and risk leaders ask before bringing AEGIS into the boardroom."
        />

        <div className="mx-auto mt-12 max-w-2xl space-y-2">
          {FAQS.map(([question, answer], i) => {
            const isOpen = open === i;
            return (
              <Reveal key={question} delay={i * 40}>
                <div
                  className={`card overflow-hidden transition-colors ${
                    isOpen ? 'border-blue-200' : 'hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-navy">{question}</span>
                    <ChevronDown
                      size={16}
                      stroke="currentColor"
                      className={`shrink-0 text-slate-500 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="animate-fade-up border-t border-line px-5 py-4 text-sm leading-relaxed text-slate-600">
                      {answer}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTABand() {
  const navigate = useNavigate();

  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-blue-light via-white to-navy-light p-8 lg:p-12">
            <div className="animate-glow pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />
            <div className="animate-float-slow pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-purple-200/40 blur-3xl" />

            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Executive briefing
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy">
                  What does your regulatory exposure actually look like?
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  Book a regulatory mapping session and see how AEGIS maps your specific landscape — across
                  every jurisdiction, framework and business unit.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                <Button className="px-5 py-2.5" onClick={() => navigate('/signup')}>
                  Book a Mapping Session
                  <ArrowRight size={16} />
                </Button>
                <a
                  href="#platform"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/30 bg-white px-4 py-2.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
                >
                  Watch the 3-Min Overview <ArrowRight size={14} stroke="currentColor" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const FOOTER_LINKS: Record<string, Array<{ label: string; href: string }>> = {
    Product: [
      { label: 'Platform Overview', href: '#platform' },
      { label: 'Capabilities', href: '#platform' },
      { label: 'Frameworks', href: '#frameworks' },
      { label: 'Security', href: '#faq' },
    ],
    Solutions: [
      { label: 'Law Firms', href: '/law-firms' },
      { label: 'Accounting Firms', href: '/accounting-firms' },
      { label: 'Cyber Insurance', href: '/cyber-insurance' },
      { label: 'Auditors & Consultants', href: '/auditors' },
      { label: 'Managed Service Providers', href: '/msp' },
      { label: 'Professional Services', href: '/professional-services' },
    ],
    Resources: [
      { label: 'Blog', href: '/blog' },
      { label: 'Guides', href: '/guides' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Webinars', href: '/webinars' },
    ],
    Company: [
      { label: 'About', href: '/company#team' },
      { label: 'Partner Program', href: '/partners' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Legal', href: '/legal' },
    ],
  };

  return (
    <footer className="border-t border-line bg-white py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
                <ShieldCheck size={18} strokeWidth={2} stroke="currentColor" />
              </div>
              <span className="text-lg font-bold tracking-tight text-navy">AEGIS GRC</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              The compliance intelligence platform for regulated enterprises. Deterministic, source-cited,
              board-ready.
            </p>
            <div className="mt-6 flex gap-4 text-sm">
              {['Privacy Policy', 'Terms of Service', 'Trust Center'].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-slate-600 underline underline-offset-2 transition-colors hover:text-navy"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="lg:col-span-1">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {heading}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-sm text-slate-600 transition-colors hover:text-navy"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-slate-600 transition-colors hover:text-navy"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-line pt-8 md:flex-row">
          <p className="text-[11px] text-slate-500">
            © 2026 AEGIS GRC. All rights reserved. · Content ops by Thicket Engine
          </p>
          <div className="flex gap-3 text-sm">
            <a href="#" className="flex items-center gap-1 text-slate-600 transition-colors hover:text-navy">
              <Mail size={16} stroke="currentColor" /> hello@agrc.ai
            </a>
            <a href="#" className="flex items-center gap-1 text-slate-600 transition-colors hover:text-navy">
              <Phone size={16} stroke="currentColor" /> +1 (555) 0100
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-navy">
      <Navbar onOpenMenu={() => setMenuOpen(true)} />

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <aside className="animate-fade-up absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-pop">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <X size={18} stroke="currentColor" />
            </button>
            <nav className="mt-16 space-y-4 px-6 text-sm font-medium text-slate-600">
              {NAV_LINKS.map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="block transition-colors hover:text-navy"
                >
                  {n.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block font-semibold text-navy"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white"
              >
                Get Started <ArrowRight size={14} stroke="currentColor" />
              </Link>
            </nav>
          </aside>
        </div>
      )}

      <main>
        <Hero />
        <TrustStrip />
        <StatsBar />
        <ProblemSection />
        <CapabilitiesSection />
        <HowItWorksSection />
        <FrameworksSection />
        <ExecutiveQuote />
        <ComparisonSection />
        <FAQSection />
        <CTABand />
        <Footer />
      </main>
    </div>
  );
}
