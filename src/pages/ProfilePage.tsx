import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, LogOut } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, uploadAvatar } from '@/services/api';
import { logActivity } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';

export function ProfilePage() {
  const { signOut } = useAuth();
  const { profile, userId, orgId } = useCurrentOrg().data ?? { profile: null, userId: '', orgId: '' };
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
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-bold text-navy">My Profile</h1>
        <p className="text-xs text-slate-600">Manage your name, role, and contact details</p>
      </div>

      <Card>
        <CardHeader title="Profile Picture" />
        <CardBody className="flex items-center gap-4">
          <Avatar name={profile?.full_name} url={profile?.avatar_url} size={72} />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-navy hover:bg-gray-50 focus-ring">
            <Camera size={14} stroke="currentColor" />
            {uploading ? 'Uploading…' : 'Change Avatar'}
            <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
          </label>
        </CardBody>
      </Card>

      <form onSubmit={save}>
        <Card>
          <CardHeader title="Basic Information" />
          <CardBody className="space-y-4">
            <Input label="Full Name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
            <Input label="Work Email" value={profile?.email ?? ''} disabled readOnly />
            <Input label="Job Title" value={form.job_title} onChange={(e) => set('job_title', e.target.value)} placeholder="e.g. GRC Analyst" />
            <Input label="Department" value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Information Security" />
            <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 000 000 0000" />
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </CardBody>
        </Card>
      </form>

      <Card>
        <CardHeader title="Session" />
        <CardBody>
          <Button variant="danger" onClick={() => signOut()}>
            <LogOut size={14} stroke="currentColor" /> Sign Out
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
