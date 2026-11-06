import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, LogOut, ShieldCheck, User, Mail, Phone, Lock, KeyRound, Check, X } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, uploadAvatar } from '@/services/api';
import { logActivity } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { roleLabel } from '@/lib/format';
import { supabase } from '@/lib/supabase';

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

  // In-app password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  const pwdMinLength = newPassword.length >= 8;
  const pwdUpper = /[A-Z]/.test(newPassword);
  const pwdLower = /[a-z]/.test(newPassword);
  const pwdNumber = /[0-9]/.test(newPassword);
  const pwdMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPwdValid = pwdMinLength && pwdUpper && pwdLower && pwdNumber && pwdMatch;

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!isPwdValid) {
      setPwdError('Please satisfy all password complexity requirements.');
      return;
    }

    setPwdSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwdError(error.message);
      } else {
        setPwdSuccess('Your password has been updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
        await logActivity(orgId, 'password_updated', 'profile', userId);
        setTimeout(() => {
          setShowPasswordChange(false);
          setPwdSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      setPwdError(err?.message || 'Failed to update password.');
    } finally {
      setPwdSaving(false);
    }
  };

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
            <CardHeader title="Security & Authentication" subtitle="Manage your account password, active session, and credentials" />
            <CardBody className="space-y-4">
              {/* Password Change Toggle */}
              {!showPasswordChange ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-canvas/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/5 text-navy">
                      <KeyRound size={18} stroke="currentColor" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Password</p>
                      <p className="text-[11px] text-slate-500">Update your account login password</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowPasswordChange(true);
                      setPwdError(null);
                      setPwdSuccess(null);
                    }}
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={changePassword} className="space-y-4 p-4 rounded-xl border border-navy/20 bg-canvas/40">
                  <div className="flex items-center justify-between pb-2 border-b border-line">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-navy" />
                      <span className="text-xs font-bold text-navy">Change Account Password</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPwdError(null);
                        setPwdSuccess(null);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-navy"
                    >
                      Cancel
                    </button>
                  </div>

                  {pwdError && (
                    <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-crimson">
                      {pwdError}
                    </p>
                  )}

                  {pwdSuccess && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-800">
                      <Check size={14} className="text-emerald-700 font-bold" />
                      <span>{pwdSuccess}</span>
                    </div>
                  )}

                  <PasswordInput
                    label="New Password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />

                  {/* Password Checklist */}
                  <div className="rounded-xl border border-line bg-white p-3 space-y-1.5 text-[11px]">
                    <span className="block font-semibold text-slate-700 mb-1">Password Requirements:</span>
                    <div className="flex items-center gap-2">
                      {pwdMinLength ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                      <span className={pwdMinLength ? 'text-emerald-800 font-medium' : 'text-slate-500'}>Minimum 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pwdUpper ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                      <span className={pwdUpper ? 'text-emerald-800 font-medium' : 'text-slate-500'}>At least one uppercase letter (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pwdLower ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                      <span className={pwdLower ? 'text-emerald-800 font-medium' : 'text-slate-500'}>At least one lowercase letter (a-z)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pwdNumber ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                      <span className={pwdNumber ? 'text-emerald-800 font-medium' : 'text-slate-500'}>At least one number (0-9)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pwdMatch ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                      <span className={pwdMatch ? 'text-emerald-800 font-medium' : 'text-slate-500'}>Passwords match</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="submit"
                      size="sm"
                      loading={pwdSaving}
                      disabled={!isPwdValid || pwdSaving}
                      className="flex-1"
                    >
                      Save New Password
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPasswordChange(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="pt-2">
                <Button
                  variant="danger"
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2"
                >
                  <LogOut size={16} stroke="currentColor" />
                  Sign Out
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
