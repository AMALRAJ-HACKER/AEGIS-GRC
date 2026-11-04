import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
        <ShieldCheck size={30} />
      </div>
      <h1 className="text-6xl font-bold text-navy">404</h1>
      <p className="mt-2 text-base font-semibold text-navy">Page not found</p>
      <p className="mt-1 max-w-sm text-xs text-slate-600">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="mt-6">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
