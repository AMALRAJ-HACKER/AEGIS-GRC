import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, LogOut, ShieldCheck, User, Mail, Phone } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, uploadAvatar } from '@/services/api';
import { logActivity } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { roleLabel } from '@/lib/format';

export function ProfilePage() {
  const { signOut } = useAuth();
  const { profile, userId, orgId, role, org } = useCurrentOrg().data ?? { profile: null, userId: '', orgId: '', role: 'staff', org: null };
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    job_title: profile?.job_title ?? '',
    department: profile?.department ?? '',
    phone: profile?.phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(userId, form);
    await logActivity(orgId, 'profile_updated', 'profile', userId);
    queryClient.invalidateQueries({ queryKey: ['currentOrg'] });
    setSaving(false);
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    await uploadAvatar(userId, f);
    queryClient.invalidateQueries({ queryKey: ['currentOrg'] });
    setUploading(false);
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <Avatar name={profile?.full_name} url={profile?.avatar_url} size={48} />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-navy">{profile?.full_name ?? 'User'}</h1>
              <Badge label={roleLabel(role)} tone="info" />
            </div>
          </div>
          <p className="text-sm text-slate-600">
            {org?.name ?? 'No organization'} · {orgId ? 'Organization Member' : 'Independent'}
          </p>
        </div>

        <div className="flex items-center gap-3 hidden sm:flex">
          <div className="flex flex-col items-end gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 border border-navy/10 text-navy">
              <ShieldCheck size={20} stroke="currentColor" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Verified</span>
          </div>
        </div>
      </div>

      {/* Profile Picture & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader title="Profile Picture" subtitle="Upload a new profile image" />
            <CardBody className="flex flex-col items-center gap-4 py-6">
              <div className="relative group">
                <Avatar name={profile?.full_name} url={profile?.avatar_url} size={112} />
                <div className="absolute -bottom-2 -right-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-input')?.click()}
                    disabled={uploading}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white shadow-sm hover:bg-navy/90 transition-colors disabled:opacity-50"
                    aria-label="Change avatar"
                  >
                    <Camera size={16} stroke="currentColor" />
                  </button>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatar}
                  />
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-navy text-[10px] animate-pulse">
                      ⬤
                    </span>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-gray-50 focus-ring cursor-pointer disabled:opacity-50">
                {uploading ? 'Uploading…' : 'Change Avatar'}
              </label>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={save}>
            <Card>
              <CardHeader title="Basic Information" subtitle="Update your personal and professional details" />
              <CardBody className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                    required
                  />
                  <Input
                    label="Job Title"
                    value={form.job_title}
                    onChange={(e) => set('job_title', e.target.value)}
                    placeholder="e.g. GRC Analyst"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Department"
                    value={form.department}
                    onChange={(e) => set('department', e.target.value)}
                    placeholder="e.g. Information Security"
                  />
                  <Input
                    label="Phone"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+91 000 000 0000"
                  />
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <Button type="submit" loading={saving} className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </CardBody>
            </Card>
          </form>

          <Card>
            <CardHeader title="Account Details" subtitle="Account information is managed by your organization admin" />
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-line bg-gray-50">
                <User className="h-5 w-5 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-navy">{profile?.email ?? '—'}</span>
                  <span className="text-[10px] text-slate-500">Work Email</span>
                </div>
                <span className="ml-auto text-[10px] font-semibold text-slate-400 uppercase">Read-Only</span>
              </div>

              <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-line bg-gray-50">
                <Mail className="h-5 w-5 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-navy">{orgId ? 'Active' : 'None'}</span>
                  <span className="text-[10px] text-slate-500">Organization</span>
                </div>
                <span className="ml-auto text-[10px] font-semibold text-slate-400 uppercase">{orgId ? orgId.slice(0, 8) : '—'}</span>
              </div>

              <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-line bg-gray-50">
                <Phone className="h-5 w-5 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-navy">{form.phone || 'Not set'}</span>
                  <span className="text-[10px] text-slate-500">Mobile Number</span>
                </div>
                <Button variant="ghost" size="sm" disabled className="ml-auto text-[10px] text-slate-400 opacity-50">Edit</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Security & Session" subtitle="Manage your active session and sign out" />
            <CardBody className="space-y-4">
              <Button
                variant="danger"
                onClick={() => signOut()}
                className="flex w-full items-center gap-2"
              >
                <LogOut size={16} stroke="currentColor" />
                Sign Out
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
