import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentOrg } from '@/hooks/useOrg';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/States';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyPage } from '@/pages/auth/VerifyPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FrameworksPage } from '@/pages/frameworks/FrameworksPage';
import { AddFrameworkPage } from '@/pages/frameworks/AddFrameworkPage';
import { ControlsPage } from '@/pages/frameworks/ControlsPage';
import { ControlDetailPage } from '@/pages/frameworks/ControlDetailPage';
import { RisksPage } from '@/pages/risks/RisksPage';
import { RiskFormPage } from '@/pages/risks/RiskFormPage';
import { RiskDetailPage } from '@/pages/risks/RiskDetailPage';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { TaskFormPage } from '@/pages/tasks/TaskFormPage';
import { TaskDetailPage } from '@/pages/tasks/TaskDetailPage';
import { EvidencePage } from '@/pages/evidence/EvidencePage';
import { EvidenceUploadPage } from '@/pages/evidence/EvidenceUploadPage';
import { EvidenceDetailPage } from '@/pages/evidence/EvidenceDetailPage';
import { AssetsPage } from '@/pages/assets/AssetsPage';
import { VendorsPage } from '@/pages/vendors/VendorsPage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AuditLogPage } from '@/pages/AuditLogPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import HomePage from '@/pages/HomePage';

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-navy">
      <div className="mb-4 flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-navy/10 border border-navy/20">
        <ShieldCheck size={44} stroke="currentColor" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">AEGIS GRC</h1>
      <p className="mt-1 text-sm text-slate-600">Governance, Risk & Compliance — Simplified</p>
      <div className="mt-8 h-6 w-6 animate-spin rounded-full border-2 border-navy/30 border-t-navy" />
    </div>
  );
}

/** Route guard: session required; signed-in users without an org go to onboarding. */
function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const { data: orgCtx, isLoading: orgLoading } = useCurrentOrg();
  const location = useLocation();

  if (loading || (session && orgLoading)) return <Splash />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (orgCtx && !orgCtx.orgId && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  if (orgCtx && orgCtx.orgId && location.pathname === '/onboarding') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <Splash />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicOnly><HomePage /></PublicOnly>} />
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><SignupPage /></PublicOnly>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />
      <Route element={<Protected><AppShell /></Protected>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/frameworks" element={<FrameworksPage />} />
        <Route path="/frameworks/add" element={<AddFrameworkPage />} />
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="/frameworks/:frameworkId" element={<ControlsPage />} />
        <Route path="/frameworks/:frameworkId/controls/:controlId" element={<ControlDetailPage />} />
        <Route path="/risks" element={<RisksPage />} />
        <Route path="/risks/new" element={<RiskFormPage />} />
        <Route path="/risks/:riskId" element={<RiskDetailPage />} />
        <Route path="/risks/:riskId/edit" element={<RiskFormPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/evidence/upload" element={<EvidenceUploadPage />} />
        <Route path="/evidence/:evidenceId" element={<EvidenceDetailPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/ai" element={<AIAssistantPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
