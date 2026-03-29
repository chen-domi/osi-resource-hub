import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, AlertCircle, Search, X, ShieldCheck, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth, ProfileSetupData } from '../context/AuthContext';
import { BC_CLUBS } from '../data/clubs';

type Role = 'eboard' | 'osi_admin';
type Step = 'landing' | 'signin' | 'signup';

const EBOARD_PIN = '5678';
const OSI_PIN    = '2026';

// ── Shared shell ──────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#6B0000' }}>
      {children}
    </div>
  );
}

// ── Google button ─────────────────────────────────────────────────────────────

function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:bg-gray-50 active:scale-95 bg-white border border-gray-200 text-gray-700 disabled:opacity-60">
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.5 2.7 13.5l7.9 6.1C12.5 13.3 17.8 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7.1-10.2 7.1-17.1z"/>
        <path fill="#FBBC05" d="M10.6 28.4A14.8 14.8 0 0 1 9.5 24c0-1.5.3-3 .7-4.4l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.9-6.3z"/>
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2 1.4-4.6 2.2-7.6 2.2-6.2 0-11.5-3.8-13.4-9.4l-7.9 6.3C6.6 42.5 14.6 48 24 48z"/>
      </svg>
      {loading ? 'Redirecting…' : 'Continue with Google'}
    </button>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-white/15" />
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>or</span>
      <div className="flex-1 h-px bg-white/15" />
    </div>
  );
}

// ── Org checkbox list ─────────────────────────────────────────────────────────

function OrgCheckboxList({ selected, onChange }: {
  selected: string[];
  onChange: (orgs: string[]) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? BC_CLUBS.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : BC_CLUBS;

  function toggle(club: string) {
    onChange(selected.includes(club)
      ? selected.filter((o) => o !== club)
      : [...selected, club]
    );
  }

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((org) => (
            <span key={org} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#fff1f2', color: '#8B0000' }}>
              {org}
              <button type="button" onClick={() => toggle(org)} className="hover:opacity-70 ml-0.5">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-1">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        <input
          type="text"
          placeholder="Search organizations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-gray-800 bg-white border-2 border-gray-200 focus:outline-none focus:border-red-800 placeholder-gray-400"
        />
      </div>

      {/* Checkbox list */}
      <ul className="border-2 border-gray-200 rounded-xl overflow-y-auto max-h-44">
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-sm text-gray-400 text-center">No clubs found</li>
        ) : (
          filtered.map((club) => {
            const checked = selected.includes(club);
            return (
              <li key={club}>
                <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-gray-50 select-none"
                  style={{ backgroundColor: checked ? '#fff1f2' : undefined }}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(club)}
                    className="w-3.5 h-3.5 flex-shrink-0 rounded" style={{ accentColor: '#6B0000' }} />
                  <span className="text-sm" style={{ color: checked ? '#8B0000' : '#374151', fontWeight: checked ? 600 : 400 }}>
                    {club}
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

// ── Logo / header ─────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-2xl font-black shadow-lg"
        style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>BC</div>
      <h1 className="text-3xl font-bold text-white">The Commons</h1>
      <p className="mt-2 text-sm" style={{ color: 'rgba(207,184,124,0.6)' }}>
        Boston College Student Organizations
      </p>
    </div>
  );
}

// ── Step 1: Landing ───────────────────────────────────────────────────────────

function LandingStep({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  const { devLogin } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <Shell>
      <div className="w-full max-w-xs">
        <Logo />
        <div className="space-y-3">
          <GoogleButton onClick={handleGoogle} loading={googleLoading} />
          <Divider />
          <button onClick={onSignIn}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>
            <Mail size={15} /> Sign In with Email
          </button>
          <button onClick={onSignUp}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 border-2"
            style={{ borderColor: 'rgba(207,184,124,0.5)', color: '#CFB87C', backgroundColor: 'transparent' }}>
            Create Account
          </button>
        </div>
        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Only @bc.edu accounts may access this system
        </p>
        {process.env.NODE_ENV === 'development' && (
          <button onClick={devLogin}
            className="block mx-auto mt-4 text-xs underline underline-offset-2 transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            dev: skip login
          </button>
        )}
      </div>
    </Shell>
  );
}

// ── Step 2: Sign In ───────────────────────────────────────────────────────────

function SignInStep({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lower = email.toLowerCase();
    if (!lower.endsWith('@bc.edu')) { setError('Must be a @bc.edu email address.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: lower, password });
    if (err) { setError(err.message); setLoading(false); }
    // On success, AuthContext onAuthStateChange handles the rest
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent';

  return (
    <Shell>
      <div className="w-full max-w-xs">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl font-black shadow-lg"
            style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>BC</div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(207,184,124,0.55)' }}>Sign in to your account</p>
        </div>

        <div className="rounded-2xl p-6 border border-white/15 shadow-2xl space-y-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <GoogleButton onClick={handleGoogle} loading={googleLoading} />
          <Divider />
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" placeholder="username@bc.edu" value={email} autoFocus
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required className={inputClass}
              style={{ '--tw-ring-color': '#CFB87C' } as React.CSSProperties} />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required className={inputClass}
              style={{ '--tw-ring-color': '#CFB87C' } as React.CSSProperties} />
            {error && (
              <p className="flex items-center gap-1.5 text-xs" style={{ color: '#CFB87C' }}>
                <AlertCircle size={12} />{error}
              </p>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>
              {loading ? 'Signing in…' : <> Sign In <ChevronRight size={16} /> </>}
            </button>
          </form>
        </div>

        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 text-xs mt-4 mx-auto transition-colors hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </div>
    </Shell>
  );
}

// ── Step 3: Sign Up (email + full profile) ────────────────────────────────────

function SignUpStep({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('eboard');
  const [orgs, setOrgs] = useState<string[]>([]);
  const [orgError, setOrgError] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lower = email.toLowerCase();
    if (!lower.endsWith('@bc.edu')) { setEmailError('Must be a @bc.edu email address.'); return; }
    if (role === 'eboard' && orgs.length === 0) { setOrgError('Please select at least one organization.'); return; }
    const expectedPin = role === 'osi_admin' ? OSI_PIN : EBOARD_PIN;
    if (pin !== expectedPin) { setPinError('Incorrect access code. Please try again.'); return; }
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: lower, password });
    if (error) { setEmailError(error.message); setLoading(false); return; }

    if (data.user) {
      // Insert profile immediately (works when email confirmation is disabled)
      const prefix = lower.split('@')[0];
      const name = prefix.split(/[.\-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const organizations = role === 'osi_admin' ? [] : orgs.map((org) => ({ org, role: 'eboard' as const }));
      const currentOrg = role === 'osi_admin' ? 'OSI' : orgs[0];

      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        email: lower,
        organizations,
        current_org: currentOrg,
        is_osi_admin: role === 'osi_admin',
      });
    }

    // onAuthStateChange in AuthContext handles login on success
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <Shell>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-7 shadow-2xl">
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-1 text-sm text-gray-500">You'll only need to do this once.</p>
          </div>

          {/* Google sign-up option */}
          <div className="mb-5">
            <button type="button" onClick={handleGoogle} disabled={googleLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:bg-gray-50 active:scale-95 bg-white border-2 border-gray-200 text-gray-700 disabled:opacity-60">
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.5 2.7 13.5l7.9 6.1C12.5 13.3 17.8 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7.1-10.2 7.1-17.1z"/>
                <path fill="#FBBC05" d="M10.6 28.4A14.8 14.8 0 0 1 9.5 24c0-1.5.3-3 .7-4.4l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.9-6.3z"/>
                <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2 1.4-4.6 2.2-7.6 2.2-6.2 0-11.5-3.8-13.4-9.4l-7.9 6.3C6.6 42.5 14.6 48 24 48z"/>
              </svg>
              {googleLoading ? 'Redirecting…' : 'Sign up with Google'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Google users will set up their role after sign-in
            </p>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">BC Email</label>
              <input type="email" placeholder="username@bc.edu" value={email} autoFocus
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                required
                className="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-200 focus:outline-none focus:border-red-800 placeholder-gray-400 text-gray-800" />
              {emailError && (
                <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                  <AlertCircle size={12} />{emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                className="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-200 focus:outline-none focus:border-red-800 placeholder-gray-400 text-gray-800" />
              {passwordError && (
                <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                  <AlertCircle size={12} />{passwordError}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {([['eboard', 'E-Board'], ['osi_admin', 'OSI Admin']] as [Role, string][]).map(([key, label]) => (
                  <label key={key}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none"
                    style={{ borderColor: role === key ? '#6B0000' : '#e5e7eb', backgroundColor: role === key ? '#fff1f2' : 'white' }}>
                    <input type="radio" name="role" value={key} checked={role === key}
                      onChange={() => { setRole(key); setPin(''); setPinError(''); setOrgs([]); setOrgError(''); }}
                      className="w-3.5 h-3.5 flex-shrink-0" style={{ accentColor: '#6B0000' }} />
                    <span className="text-sm font-semibold text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Organizations (eboard only) */}
            {role === 'eboard' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Organizations <span className="font-normal text-gray-400">(select all you're E-Board for)</span>
                </label>
                <OrgCheckboxList selected={orgs} onChange={(v) => { setOrgs(v); setOrgError(''); }} />
                {orgError && (
                  <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                    <AlertCircle size={12} />{orgError}
                  </p>
                )}
              </div>
            )}

            {/* Access code */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                <ShieldCheck size={13} /> Access Code
              </label>
              <input type="password" maxLength={4} placeholder="• • • •" value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                className="w-full px-4 py-3 rounded-xl text-lg border-2 border-gray-200 focus:outline-none focus:border-red-800 tracking-[0.6em] text-center font-bold placeholder-gray-300 text-gray-800" />
              {pinError && (
                <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                  <AlertCircle size={12} />{pinError}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: '#6B0000' }}>
              {loading ? 'Creating account…' : <> Create Account <ChevronRight size={16} /> </>}
            </button>
          </form>
        </div>

        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 text-xs mt-4 mx-auto transition-colors hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={13} /> Back
        </button>
      </div>
    </Shell>
  );
}

// ── Profile setup (Google OAuth new users) ────────────────────────────────────

function ProfileSetupStep() {
  const { completeProfileSetup, logout } = useAuth();
  const [role, setRole] = useState<Role>('eboard');
  const [orgs, setOrgs] = useState<string[]>([]);
  const [orgError, setOrgError] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === 'eboard' && orgs.length === 0) { setOrgError('Please select at least one organization.'); return; }
    const expectedPin = role === 'osi_admin' ? OSI_PIN : EBOARD_PIN;
    if (pin !== expectedPin) { setPinError('Incorrect access code. Please try again.'); return; }

    setLoading(true);
    try {
      const data: ProfileSetupData = role === 'osi_admin'
        ? { organizations: [], currentOrg: 'OSI', isOSIAdmin: true }
        : { organizations: orgs.map((org) => ({ org, role: 'eboard' as const })), currentOrg: orgs[0], isOSIAdmin: false };
      await completeProfileSetup(data);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl font-black shadow-lg"
            style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>BC</div>
          <h1 className="text-2xl font-bold text-white">One more step</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(207,184,124,0.6)' }}>Tell us about your role</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {([['eboard', 'E-Board'], ['osi_admin', 'OSI Admin']] as [Role, string][]).map(([key, label]) => (
                  <label key={key}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none"
                    style={{ borderColor: role === key ? '#6B0000' : '#e5e7eb', backgroundColor: role === key ? '#fff1f2' : 'white' }}>
                    <input type="radio" name="role" value={key} checked={role === key}
                      onChange={() => { setRole(key); setPin(''); setPinError(''); setOrgs([]); setOrgError(''); }}
                      className="w-3.5 h-3.5 flex-shrink-0" style={{ accentColor: '#6B0000' }} />
                    <span className="text-sm font-semibold text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Organizations (eboard only) */}
            {role === 'eboard' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Organizations <span className="font-normal text-gray-400">(select all you're E-Board for)</span>
                </label>
                <OrgCheckboxList selected={orgs} onChange={(v) => { setOrgs(v); setOrgError(''); }} />
                {orgError && (
                  <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                    <AlertCircle size={12} />{orgError}
                  </p>
                )}
              </div>
            )}

            {/* Access code */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                <ShieldCheck size={13} /> Access Code
              </label>
              <input type="password" maxLength={4} placeholder="• • • •" value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                className="w-full px-4 py-3 rounded-xl text-lg border-2 border-gray-200 focus:outline-none focus:border-red-800 tracking-[0.6em] text-center font-bold placeholder-gray-300 text-gray-800" />
              {pinError && (
                <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                  <AlertCircle size={12} />{pinError}
                </p>
              )}
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle size={12} />{error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: '#6B0000' }}>
              {loading ? 'Saving…' : <> Finish Setup <ChevronRight size={16} /> </>}
            </button>
          </form>
        </div>

        <button type="button" onClick={() => logout()}
          className="flex items-center gap-1.5 text-xs mt-4 mx-auto transition-colors hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={13} /> Sign out
        </button>
      </div>
    </Shell>
  );
}

// ── Coordinator ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { needsProfileSetup } = useAuth();
  const [step, setStep] = useState<Step>('landing');

  if (needsProfileSetup) return <ProfileSetupStep />;

  switch (step) {
    case 'landing': return <LandingStep onSignIn={() => setStep('signin')} onSignUp={() => setStep('signup')} />;
    case 'signin':  return <SignInStep onBack={() => setStep('landing')} />;
    case 'signup':  return <SignUpStep onBack={() => setStep('landing')} />;
  }
}
