import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui/States';
import { ComplianceRing } from '@/components/ui/Charts';
import { fetchFrameworkCatalog } from '@/services/api';

type Framework = {
  id: string;
  name: string;
  description?: string;
  score?: number;
  activated?: boolean;
};

export function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFrameworkCatalog().then((data) => {
      setFrameworks(data as Framework[]);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Frameworks</h1>
        <Button size="sm" onClick={() => alert('Add Framework dialog open')}>
          Add Framework
        </Button>
      </div>

      {frameworks.length === 0 ? (
        <EmptyState
          icon={<svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" />
          </svg>}
          title="No frameworks activated"
          message="Create your first framework to start tracking compliance."
        />
      ) : (
        <div className="divide-y divide-slate-200">
          {frameworks.map((f: Framework) => (
            <div key={f.id} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-navy">{f.name}</h3>
                  <p className="text-slate-500 text-sm">{f.description || 'No description'}</p>
                </div>
                <ComplianceRing score={f.score ?? 0} size={30} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}