import { useState } from 'react';
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
  ArrowRight,
  ChevronDown,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ComplianceRing } from '@/components/ui/Charts';

const NAV_LINKS = [
  { label: 'Platform', href: '/platform' },
  { label: 'Capabilities', href: '/capabilities' },
  { label: 'Industries', href: '/industries' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Resources', href: '/resources' },
  { label: 'Company', href: '/company' },
];

const STATS = [
  { value: '295', label: 'Regulatory instruments mapped' },
  { value: '18,236', label: 'Verbatim source citations' },
  { value: '34+', label: 'Jurisdictions covered' },
];

const PROBLEM_CARDS = [
  {
    icon: <ShieldAlert size={20} stroke="currentColor" />,
    title: 'Generated, not grounded',
    body:
      'Most compliance AI generates answers from a model\u2019s memory. A hallucinated control or an invented citation reads fine, until an auditor checks it against the law. Then it\u2019s a finding, not a shortcut.',
  },
  {
    icon: <FileText size={20} stroke="currentColor" />,
    title: 'Manual everything',
    body:
      'Filling forms, hunting evidence across internal systems, hand-mapping what connects to what. The busywork that eats compliance teams and drifts out of date within weeks.',
  },
  {
    icon: <Lock size={20} stroke="currentColor" />,
    title: 'Access you can\u2019t take back',
    body:
      'To automate, every tool wants deep, standing read-access into your stack, and now wants its agents roaming it too. That\u2019s the exact third-party exposure security teams are being told to shut down.',
  },
  {
    icon: <Globe size={20} stroke="currentColor" />,
    title: 'Framework sprawl',
    body:
      'Each new regulation means new mappings, new evidence, new assessments. Teams spend months per framework while the regulatory landscape keeps expanding.',
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
    title: 'Map your organization, SoA generated automatically',
    body:
      'Define your business reality: systems, processes, data flows, organizational structure. AEGIS auto-generates your Statement of Applicability across every relevant framework, the document most teams spend weeks building manually.',
    chips: ['Systems', 'Processes', 'Data', 'Teams', 'Vendors', 'Assets'],
  },
  {
    step: '02',
    day: 'Day 2-3',
    title: 'See what applies',
    body:
      'AEGIS maps applicable regulations to your specific context using three-tier risk scoring: inherent risk, control effectiveness, and residual exposure. No guessing which controls matter for which entity.',
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
      'A prioritized view of gaps and risks across all frameworks simultaneously. Remediation priorities ranked by business impact, not just compliance severity.',
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
    title: 'Take action',
    body:
      'Continuous monitoring with automated evidence collection, remediation tracking, and regulatory change alerts. Your compliance posture updates as your business changes, not once a year.',
    chips: ['Update access policies', 'Implement MFA', 'Review vendor contracts'],
  },
];

const FRAMEWORKS = [
  { name: 'GDPR', desc: 'EU Data Protection', meta: '99 articles \u00b7 173 recitals' },
  { name: 'NIS2', desc: 'EU Cybersecurity', meta: '46 articles \u00b7 11 annexes' },
  { name: 'DORA', desc: 'Digital Operations', meta: '64 articles \u00b7 2 annexes' },
  { name: 'ISO 27001', desc: 'Info Security', meta: '93 controls \u00b7 4 themes' },
  { name: 'SOC 2', desc: 'Trust Services', meta: '5 trust criteria \u00b7 61 points' },
  { name: 'HIPAA', desc: 'Healthcare', meta: '54 standards \u00b7 75 specifications' },
  { name: 'PCI DSS', desc: 'Payment Card', meta: '12 requirements \u00b7 264 sub-controls' },
  { name: '+ Custom', desc: 'Your standards, mapped', meta: 'Cross-framework control mapping' },
];

// [question, answer]
const FAQS: Array<[string, string]> = [
  [
    'How does AEGIS GRC differ from traditional compliance tools?',
    'Traditional tools are built for auditors, not for the people running security programmes. AEGIS pairs a deterministic, source-cited compliance engine with your own agents running inside your perimeter \u2014 every obligation traces to a verbatim citation from the source regulation.',
  ],
  [
    'What regulatory frameworks does AEGIS support?',
    'GDPR, NIS2, DORA, ISO 27001, SOC 2, HIPAA, PCI DSS and custom standards \u2014 295 regulatory instruments across 34+ jurisdictions, unified through a single control architecture.',
  ],
  [
    'How long does it take to get started?',
    'AEGIS compresses months of compliance work into days. Day 1 maps your organisation and auto-generates your Statement of Applicability; within a week you have a prioritised gap and risk view, then continuous monitoring keeps you current.',
  ],
  [
    'Does AEGIS include managed compliance services?',
    'Yes. Software alone doesn\u2019t solve compliance. AEGIS pairs the platform with regulatory experts \u2014 compliance analysts who know your landscape, scoped to regulatory monitoring, assessment support and audit preparation.',
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
    other: 'Generates answers from a model\u2019s memory',
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
    other: 'One vendor\u2019s agent, one black box',
    aegis: 'Any MCP client, Claude Code or your own',
  },
];

function Navbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/80 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white">
            <ShieldCheck size={20} strokeWidth={2} stroke="currentColor" />
          </div>
          <span className="font-bold text-navy tracking-tight text-lg">AEGIS GRC</span>
        </Link>

        <nav className="hidden ml-10 flex items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          {NAV_LINKS.map((n) => (
            <Link key={n.label} to={n.href} className="hover:text-navy transition-colors">
              {n.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="flex items-center gap-1 text-sm font-semibold text-navy hover:underline"
          >
            Login <ArrowRight size={14} stroke="currentColor" />
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:flex lg:flex">
          <Link
            to="/platform"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-navy bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-navy/5 transition-colors"
          >
            Talk to an Expert
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-dark transition-colors shadow-sm"
          >
            Get Started <ArrowRight size={14} stroke="currentColor" />
          </Link>
          <button
            onClick={onOpenMenu}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} stroke="currentColor" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-navy/20 bg-navy/5 px-3 py-1 text-[11px] font-semibold tracking-tighter uppercase text-navy">
              Deterministic GRC &middot; built by AI
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-navy leading-tight">
              Compliance AI you can put <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-navy via-blue-600 to-purple-600">
                in front of an auditor.
              </span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Every obligation and control traces to a verbatim citation from the source regulation, grounded in law,
              not generated from a model\u2019s memory. Bring your own agents to do the manual work, and our engine keeps
              every claim defensible.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/signup')} className="px-6 py-3">
                Talk to a Compliance Expert
              </Button>
              <Button variant="ghost" onClick={() => navigate('/platform')} className="px-6 py-3">
                See the Platform <ArrowRight size={16} stroke="currentColor" />
              </Button>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                No credit card required
              </span>
              <span>·</span>
              <span>SOC 2 Type II compliant platform</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <Card className="w-full max-w-sm border border-line shadow-soft">
              <div className="flex justify-between items-start px-5 pt-4 pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Compliance Overview
                </div>
              </div>
              <div className="px-5 pb-4 space-y-4 border-b border-line">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Frameworks tracked</p>
                    <p className="text-sm font-semibold text-navy">6</p>
                  </div>
                  <div className="w-20 h-20 flex shrink-0 items-center justify-center">
                    <ComplianceRing score={87} size={64} strokeWidth={6} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Risk Score</p>
                    <p className="text-sm font-semibold text-navy">94%</p>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  {[
                    { f: 'GDPR', d: 'Data Protection', s: '87%', tone: 'amber' },
                    { f: 'NIS2', d: 'Supply Chain Security', s: 'Compliant', tone: 'emerald' },
                    { f: 'DORA', d: 'ICT Risk Management', s: '92%', tone: 'blue' },
                    { f: 'ISO 27001', d: 'Access Control', s: 'Compliant', tone: 'emerald' },
                    { f: 'SOC 2', d: 'Availability', s: 'Review', tone: 'amber' },
                    { f: 'HIPAA', d: 'PHI Safeguards', s: 'Add Framework', tone: 'slate' },
                  ].map((row) => (
                    <div key={row.f} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-600">{row.f}</span>
                        <span className="text-[10px] text-slate-400">{row.d}</span>
                      </div>
                      <Badge label={row.s} tone={row.tone as any} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 pt-4 space-y-2 border-t border-line">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500">Cross-framework coverage</span>
                  <span className="font-semibold text-navy">327 controls mapped</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-navy w-[82%] rounded-full" />
                </div>
                <div className="flex items-center justify-between gap-3 text-xs mt-1">
                  <span className="text-emerald-600 font-medium">3 Compliant</span>
                  <span className="text-amber-600 font-medium">2 In Progress</span>
                  <span className="text-slate-400">1 Review</span>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-slate-600 hover:text-navy">
                  View Details &rarr;
                </Button>
              </div>
            </Card>
            <p className="text-[11px] text-slate-400 text-right w-full max-w-sm">
              Live preview of the AEGIS GRC dashboard &mdash; sign up to connect your own data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="border-y border-line bg-white py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between gap-8 text-sm">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-2xl font-bold text-navy">{s.value}</span>
              <span className="text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-navy tracking-tight">Why compliance keeps breaking</h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Two things break compliance today: AI that generates answers you can\u2019t defend, and manual work that
            never ends. Automating that work with someone else\u2019s agents just adds a third problem.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROBLEM_CARDS.map((c, i) => (
            <div key={i} className="card p-6 hover:shadow-pop transition-shadow">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                {c.icon}
              </div>
              <h3 className="text-lg font-bold text-navy">{c.title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-navy tracking-tight">Your agents do the work. Our engine keeps it honest.</h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            A deterministic compliance engine you can put in front of an auditor, opened to your own agents and designed
            so the manual work happens inside your perimeter.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CAPABILITY_CARDS.map((c, i) => (
            <div key={i} className="card p-6 hover:shadow-pop transition-shadow">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-light text-blue">
                {c.icon}
              </div>
              <h3 className="text-lg font-bold text-navy">{c.title}</h3>
              <p className="mt-1 text-xs font-semibold text-navy/70 uppercase tracking-wider">{c.subtitle}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 divide-y divide-slate-100">
                {c.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-navy tracking-tight">From complexity to clarity in four steps</h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            AEGIS compresses months of compliance work into days, then keeps it current as your business and regulations change.
          </p>
        </div>
        <div className="relative grid md:grid-cols-2 gap-12 lg:gap-16">
          {STEPS.map((step, i) => {
            const isEven = i % 2 === 0;
            const first = i === 0;
            const last = i === STEPS.length - 1;
            return (
              <div
                key={i}
                className={`flex gap-6 ${isEven ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {step.step}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy uppercase tracking-wider">{step.day}</span>
                    <span className="h-px w-4 bg-navy" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.body}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {step.chips.map((chip, j) => {
                      if (typeof chip === 'string') {
                        return (
                          <span key={j} className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-semibold text-navy">
                            {chip}
                          </span>
                        );
                      }
                      return (
                        <span key={j} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          chip.applies === 'Applies' || chip.applies === 'Compliance Score'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : chip.label === 'Critical'
                            ? 'border-crimson-200 bg-crimson-50 text-crimson-700'
                            : chip.label === 'High'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                        >
                          {chip.label} <span className="text-slate-400">{chip.applies}</span>
                        </span>
                      );
                    })}
                  </div>
                  {!last && <div className="w-px h-6 bg-navy mx-2 self-stretch" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FrameworksSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-navy tracking-tight">Framework Support</h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            295 instruments. 34 jurisdictions. One architecture. From GDPR to DORA, SOC 2 to HIPAA, every framework mapped
            through a unified control architecture.
          </p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {FRAMEWORKS.map((f, i) => (
            <div key={f.name} className="card p-5 hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg font-bold text-navy group-hover:text-blue-600 transition-colors">{f.name}</span>
                <ExternalLink size={14} stroke="currentColor" className="text-slate-400 group-hover:text-navy" />
              </div>
              <p className="mt-1 text-xs text-slate-500">{f.desc}</p>
              <p className="mt-2 text-[10px] text-slate-400">{f.meta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="py-16 lg:py-24 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-navy tracking-tight">Everyone says \u201cagentic.\u201d The difference is whose boundary the agent runs in.</h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Agentic GRC is table stakes now. What separates AEGIS is where the agent runs and whether its output survives an auditor.
          </p>
        </div>
        <div className="overflow-x-auto border border-line rounded-xl bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-line bg-slate-50">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400"></th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">Other \u201cagentic\u201d GRC</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">AEGIS</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-slate-25'}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 border-b border-line">{row.label}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 border-b border-line">{row.other}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-navy border-b border-line">{row.aegis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-navy tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-slate-600">Learn more about the AEGIS GRC compliance intelligence platform.</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-2">
          {FAQS.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="card border border-line overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left focus:outline-none transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-navy">{q}</span>
                  <ChevronDown size={16} stroke="currentColor" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 border-t border-line text-sm text-slate-600 leading-relaxed">{a}</div>
                )}
              </div>
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="rounded-2xl border-navy bg-navy p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">What does your regulatory exposure actually look like?</h2>
              <p className="mt-4 text-lg text-navy/20 leading-relaxed">
                Book a regulatory mapping session and see how AEGIS maps your specific regulatory landscape, across every
                jurisdiction, framework, and business unit.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button variant="ghost" className="border-navy/30 text-white hover:bg-white/10" onClick={() => navigate('/signup')}>
                Book a Regulatory Mapping Session
              </Button>
              <Link
                to="/platform"
                className="inline-flex items-center gap-2 rounded-lg border border-navy/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Watch the 3-Min Overview <ArrowRight size={14} stroke="currentColor" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  const FOOTER_LINKS: Record<string, Array<{ label: string; href: string }>> = {
    Product: [
      { label: 'Platform Overview', href: '/platform' },
      { label: 'Features', href: '/capabilities' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Security', href: '/security' },
    ],
    Solutions: [
      { label: 'Law Firms', href: '/law-firms' },
      { label: 'Accounting Firms', href: '/accounting-firms' },
      { label: 'Cyber Insurance', href: '/cyber-insurance' },
      { label: 'Auditors & Consultants', href: '/auditors' },
      { label: 'Managed Service Providers', href: '/msp' },
      { label: 'Professional Services', href: '/professional-services' },
      { label: 'Enterprise', href: '/enterprise' },
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
                <ShieldCheck size={18} strokeWidth={2} stroke="currentColor" />
              </div>
              <span className="font-bold text-navy text-lg tracking-tight">AEGIS GRC</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              The compliance intelligence platform for regulated enterprises.
            </p>
            <div className="mt-6 flex gap-4 text-sm">
              <a href="#" className="text-navy/60 hover:text-navy underline underline-offset-2">Privacy Policy</a>
              <a href="#" className="text-navy/60 hover:text-navy underline underline-offset-2">Terms of Service</a>
              <a href="#" className="text-navy/60 hover:text-navy underline underline-offset-2">Trust Center</a>
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="lg:col-span-1">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{heading}</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="text-sm text-slate-600 hover:text-navy transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-slate-400">
            \u00a9 2026 AEGIS GRC. All rights reserved. &middot; Content ops by Thicket Engine
          </p>
          <div className="flex gap-3 text-sm">
            <a href="#" className="flex items-center gap-1 text-navy/60 hover:text-navy">
              <Mail size={16} stroke="currentColor" /> hello@agrc.ai
            </a>
            <a href="#" className="flex items-center gap-1 text-navy/60 hover:text-navy">
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
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-pop flex flex-col">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <XIcon size={18} stroke="currentColor" />
            </button>
            <nav className="mt-16 px-6 space-y-4 text-sm font-medium text-slate-600">
              {NAV_LINKS.map((n) => (
                <Link
                  key={n.label}
                  to={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="block hover:text-navy"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
      <main>
        <Hero />
        <StatsBar />
        <ProblemSection />
        <CapabilitiesSection />
        <HowItWorksSection />
        <FrameworksSection />
        <ComparisonSection />
        <FAQSection />
        <CTABand />
        <Footer />
      </main>
    </div>
  );
}

function XIcon({ size, stroke }: { size: number; stroke: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
