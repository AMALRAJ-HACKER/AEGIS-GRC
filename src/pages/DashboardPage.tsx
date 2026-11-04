import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/States';
import { ComplianceRing, StackedBar } from '@/components/ui/Charts';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchFrameworkStats, fetchRisks, fetchTasks, fetchActivity, fetchEvidence } from '@/services/api';

function Greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function DashboardPage() {
  const { data: orgCtx, isLoading: orgLoading } = useCurrentOrg();

  if (orgLoading) return <Spinner />;

  const orgId = orgCtx?.orgId ?? '';
  const role = orgCtx?.role ?? 'staff';
  const profile = orgCtx?.profile ?? null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-navy">{Greeting()}, {profile?.full_name?.split(' ')[0] ?? 'there'}</h1>
          <p className="text-slate-500 dark:text-slate-400">AEGIS GRC Dashboard</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader title="Active Frameworks" subtitle="Out of organizations total" />
          <CardBody>
            <p className="text-3xl font-bold text-navy">0</p>
            <p className="text-slate-500">of frameworks</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Open Risks" subtitle="Requiring attention" />
          <CardBody>
            <p className="text-3xl font-bold text-crimson">0</p>
            <p className="text-slate-500">open risks</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="My Tasks" subtitle="Assigned to you" />
          <CardBody>
            <p className="text-3xl font-bold text-navy">0</p>
            <p className="text-slate-500">tasks assigned</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Evidence Expiring" subtitle="Next 30 days" />
          <CardBody>
            <p className="text-3xl font-bold text-navy">0</p>
            <p className="text-slate-500">expiring soon</p>
          </CardBody>
        </Card>
      </div>

      {/* Risk & Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Summary */}
        <Card>
          <CardHeader title="Risk Summary" subtitle="Open risks by severity" />
          <CardBody className="p-4">
            <StackedBar
              segments={[
                { label: 'Critical', value: 0, color: 'crimson' },
                { label: 'High', value: 0, color: 'amber' },
                { label: 'Medium', value: 0, color: 'blue' },
                { label: 'Low', value: 0, color: 'emerald' },
              ]}
            />
          </CardBody>
        </Card>

        {/* Compliance Health */}
        <Card>
          <CardHeader title="Compliance Health" subtitle="Per-framework implementation score" />
          <CardBody className="p-4">
            <p className="text-slate-500 dark:text-slate-300 text-center py-8">
              Activate ISO 27001, SOC 2, NIST CSF and more to start tracking compliance.
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader title="Recent Activity" />
        <CardBody className="space-y-3">
          <p className="text-slate-400 dark:text-slate-300 py-6 text-center">No activity yet.</p>
        </CardBody>
      </Card>
    </div>
  );
}