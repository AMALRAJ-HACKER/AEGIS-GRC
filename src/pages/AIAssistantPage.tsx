import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, User, Sparkles, ArrowUp, Copy, CheckSquare } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { askAI, createTask } from '@/services/api';
import { logActivity } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

const SUGGESTIONS = [
  'Explain this control',
  'What evidence do I need?',
  'Identify gaps in my current posture',
  'Draft a policy for access control',
];

export function AIAssistantPage() {
  const { orgId, userId } = useCurrentOrg().data ?? { orgId: '', userId: '' };
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; sources?: string[]; is_demo?: boolean }>>([
    { role: 'assistant', content: "Hi! I'm the AEGIS GRC AI assistant. Ask me about controls, risks, evidence, or gaps. I cite sources and recommend reviewing outputs with a qualified compliance professional.", sources: ['AEGIS GRC'] },
  ]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('general');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await askAI(orgId, q, context);
      setMessages((m) => [...m, { role: 'assistant', content: res.answer, sources: res.sources, is_demo: res.is_demo }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', content: `Error: ${e?.message}`, sources: [], is_demo: true }]);
    }
    setLoading(false);
  };

  const exportTask = async (content: string, idx: number) => {
    const task = await createTask(orgId, userId, { title: 'AI Suggestion: Follow-up action', description: content.slice(0, 1000) });
    await logActivity(orgId, 'task_created', 'task', task.id, { source: 'ai' });
    queryClient.invalidateQueries({ queryKey: ['tasks', orgId] });
    navigate(`/tasks/${task.id}`);
  };

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-navy"><Sparkles size={18} stroke="currentColor" className="text-blue" /> AI Assistant</h1>
          <p className="text-xs text-slate-600">Context: {context} · AI outputs require review by a qualified compliance professional.</p>
        </div>
        <select value={context} onChange={(e) => setContext(e.target.value)} className="rounded-lg border border-line bg-white dark:bg-black px-3 py-1.5 text-xs text-ink dark:text-white focus-ring">
          <option value="general">General</option>
          <option value="frameworks">Frameworks & Controls</option>
          <option value="risks">Risk Register</option>
          <option value="evidence">Evidence</option>
        </select>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 thin-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-white"><Bot size={16} stroke="currentColor" /></span>
              )}
              <div className={`max-w-[85%] space-y-2 ${m.role === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-sm bg-navy text-white dark:bg-blue-dark' : 'rounded-bl-sm bg-canvas dark:bg-black text-slate-600 dark:text-slate-300'}`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
                {m.role === 'assistant' && (
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                    {m.is_demo && <span className="rounded-full bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 font-semibold text-amber2 dark:text-amber-400">DEMO</span>}
                    {m.sources?.map((s) => <span key={s} className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5">{s}</span>)}
                    <button onClick={() => copy(m.content, i)} className="inline-flex items-center gap-1 hover:text-navy dark:hover:text-blue-400">{copied === i ? <><CheckSquare size={10} stroke="currentColor" /> Copied</> : <><Copy size={10} stroke="currentColor" /> Copy</>}</button>
                    <button onClick={() => exportTask(m.content, i)} className="inline-flex items-center gap-1 hover:text-navy dark:hover:text-blue-400"><CheckSquare size={10} stroke="currentColor" /> Export as Task</button>
                  </div>
                )}
              </div>
              {m.role === 'user' && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-light text-blue"><User size={16} stroke="currentColor" /></span>}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-white"><Bot size={16} stroke="currentColor" /></span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-canvas px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-200ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-100ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => setInput(s)} className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-blue hover:text-blue focus-ring">{s}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask about controls, risks, evidence, gaps…"
              className="flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus-ring"
            />
            <Button onClick={send} loading={loading} disabled={!input.trim()} className="px-4"><ArrowUp size={16} /></Button>
          </div>
          <p className="mt-1.5 text-center text-[9px] text-slate-600">AEGIS GRC AI uses your workspace data to answer. Not legal advice.</p>
        </div>
      </Card>
    </div>
  );
}
