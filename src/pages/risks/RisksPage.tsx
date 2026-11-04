import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/States';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchRisks } from '@/services/api';

type Risk = {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'closed';
  owner?: { full_name: string };
  inherent_score: number;
  residual_score?: number;
};

export function RisksPage() {
  const { data: orgCtx } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';

  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRisks(orgId).then((data) => {
      setRisks(data as Risk[]);
      setIsLoading(false);
    });
  }, [orgId]);

  if (isLoading) return <Spinner />;

  const criticalCount = risks.filter((r: Risk) => r.severity === 'critical').length;
  const highCount = risks.filter((r: Risk) => r.severity === 'high').length;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-navy">Risk Register</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500">Critical</h3>
          <p className="text-3xl font-bold text-crimson">{criticalCount}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-500">High</h3>
          <p className="text-3xl font-bold text-amber">{highCount}</p>
        </div>
      </div>

      <div className="mt-4">
        <EmptyState
          icon={<svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" />
          </svg>}
          title="No risks found"
          message="Create your first risk to start the register."
        />
      </div>
    </div>
  );
}