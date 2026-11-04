import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentOrg } from '@/hooks/useOrg';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/States';

type Control = {
  controlId: string;
  controlCode: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'implemented' | 'needs_review' | 'non_compliant';
  category: string;
};

export function ControlsPage() {
  const { frameworkId } = useParams();
  const { data: orgCtx } = useCurrentOrg();
  const navigate = useNavigate();
  const orgId = orgCtx?.orgId ?? '';

  const [controls, setControls] = useState<Control[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with dummy data
    const dummyControls: Control[] = [
      { controlId: 'C001', controlCode: 'C-001', title: 'Access Control Policy', status: 'implemented', category: 'Security' },
      { controlId: 'C002', controlCode: 'C-002', title: 'Data Encryption', status: 'not_started', category: 'Security' },
      { controlId: 'C003', controlCode: 'C-003', title: 'Incident Response', status: 'in_progress', category: 'Security' },
    ];
    setControls(dummyControls);
    setIsLoading(false);
  }, [orgId, frameworkId]);

  if (isLoading) return <Spinner />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">Controls</h1>
        <Button size="sm" onClick={() => navigate(`/frameworks/${frameworkId}/controls/add`)}>
          Add Control
        </Button>
      </div>

      <div className="mt-4">
        {controls.map((c: Control) => (
          <div key={c.controlId} className="px-3 py-2 border-b border-slate-200 last:border-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-navy">{c.controlCode}</span>
              <span className="truncate text-xs font-semibold text-navy">{c.title}</span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-300">{c.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}