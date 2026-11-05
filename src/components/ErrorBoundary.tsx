import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors so a single broken page never leaves the whole
 * app as a blank screen. Shows the error message and a recovery action.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[AEGIS] Render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
          <div className="w-full max-w-md rounded-card border border-line bg-white p-6 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-crimson">
              <ShieldAlert size={26} stroke="currentColor" />
            </div>
            <h1 className="text-lg font-bold text-navy">Something went wrong</h1>
            <p className="mt-1 text-xs text-slate-500">
              The page hit an unexpected error. Your data is safe.
            </p>
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-[11px] text-crimson thin-scroll">
              {this.state.error.message}
            </pre>
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => this.setState({ error: null })}
                className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-50"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.assign('/dashboard')}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
