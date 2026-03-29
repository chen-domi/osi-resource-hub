import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ArrowLeft, AlertCircle, Search, X, ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BC_CLUBS } from '../data/clubs';

type Role = 'eboard' | 'osi_admin';
type Step = 'landing' | 'login' | 'signup';

const EBOARD_PIN = '5678';
const OSI_PIN    = '2026';

// ── localStorage profile store ────────────────────────────────────────────────

interface StoredProfile {
  name: string;
  email: string;
  password: string;
  organizations: Array<{ org: string; role: 'eboard' }>;
  currentOrg: string;
  isOSIAdmin: boolean;
}

function profileKey(email: string) { return `commons_profile_${email.toLowerCase()}`; }
function saveProfile(p: StoredProfile) { localStorage.setItem(profileKey(p.email), JSON.stringify(p)); }
function loadProfile(email: string): StoredProfile | null {
  try { return JSON.parse(localStorage.getItem(profileKey(email)) ?? 'null'); }
  catch { return null; }
}

// ── Shared shell ──────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#6B0000' }}>
      {children}
    </div>
  );
}

// ── Searchable club combobox ──────────────────────────────────────────────────

function ClubCombobox({ value, onChange, exclude = [] }: {
  value: string;
  onChange: (v: string) => void;
  exclude?: string[];
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = (query.trim()
    ? BC_CLUBS.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : BC_CLUBS
  ).filter((c) => !exclude.includes(c));

  function select(club: string) { onChange(club); setQuery(club); setOpen(false); }
  function handleInput(v: string) { setQuery(v); onChange(''); setOpen(true); }
  function handleClear() { setQuery(''); onChange(''); setOpen(false); }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value || '');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [value]);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        <input
          type="text"
          placeholder="Search organizations…"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm text-gray-800 bg-white border-2 border-gray-200 focus:outline-none focus:border-red-800 placeholder-gray-400"
        />
        {query && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 text-gray-400">
            <X size={14} />
          </button>
        )}
      </div>
      {open && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400 text-center">No clubs found</li>
          ) : (
            filtered.map((club) => (
              <li key={club} onMouseDown={() => select(club)}
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-red-50 transition-colors"
                style={{ color: value === club ? '#8B0000' : '#374151', fontWeight: value === club ? 600 : 400 }}>
                {club}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// ── Step 1: Landing ───────────────────────────────────────────────────────────

function LandingStep({ onSignIn, onSignUp }: {
  onSignIn: () => void;
  onSignUp: () => void;
}) {
  return (
    <Shell>
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-2xl font-black shadow-lg"
            style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>BC</div>
          <h1 className="text-3xl font-bold text-white">The Commons</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(207,184,124,0.6)' }}>
            Boston College Student Organizations
          </p>
        </div>

        <div className="space-y-3">
          <button onClick={onSignIn}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>
            Sign In <ChevronRight size={16} />
          </button>
          <button onClick={onSignUp}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 border-2"
            style={{ borderColor: 'rgba(207,184,124,0.5)', color: '#CFB87C', backgroundColor: 'transparent' }}>
            Create Account <ChevronRight size={16} />
          </button>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Only @bc.edu accounts may access this system
        </p>
      </div>
    </Shell>
  );
}

// ── Step 2a: Sign In ──────────────────────────────────────────────────────────

function LoginStep({ onBack }: { onBack: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const lower = email.toLowerCase();
    if (!lower.endsWith('@bc.edu')) { setError('Must be a @bc.edu email address.'); return; }
    const profile = loadProfile(lower);
    if (!profile) { setError('No account found for this email.'); return; }
    if (password !== profile.password) { setError('Incorrect password. Please try again.'); return; }
    login({ name: profile.name, email: profile.email, organizations: profile.organizations, currentOrg: profile.currentOrg, isOSIAdmin: profile.isOSIAdmin });
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent';

  return (
    <Shell>
      <div className="w-full max-w-xs">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl font-black shadow-lg"
            style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>BC</div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(207,184,124,0.55)' }}>
            Sign in to your account
          </p>
        </div>

        <div className="rounded-2xl p-6 border border-white/15 shadow-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
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
            <button type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 mt-1"
              style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}>
              Sign In <ChevronRight size={16} />
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

// ── Step 2b: Sign Up ──────────────────────────────────────────────────────────

function SignupStep({ onBack }: { onBack: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [role, setRole] = useState<Role>('eboard');
  const [orgs, setOrgs] = useState<string[]>([]);
  const [pendingOrg, setPendingOrg] = useState('');
  const [orgError, setOrgError] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function addOrg() {
    if (!pendingOrg) { setOrgError('Please select an organization first.'); return; }
    setOrgs((prev) => [...prev, pendingOrg]);
    setPendingOrg('');
    setOrgError('');
  }

  function removeOrg(org: string) { setOrgs((prev) => prev.filter((o) => o !== org)); }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const lower = email.toLowerCase();
    if (!lower.endsWith('@bc.edu')) { setEmailError('Must be a @bc.edu email address.'); return; }
    if (loadProfile(lower)) { setEmailError('An account already exists for this email.'); return; }

    if (role === 'eboard' && orgs.length === 0) {
      setOrgError('Please add at least one organization.');
      return;
    }

    const expectedPin = role === 'osi_admin' ? OSI_PIN : EBOARD_PIN;
    if (pin !== expectedPin) { setPinError('Incorrect access code. Please try again.'); return; }
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }

    const prefix = lower.split('@')[0];
    const name = prefix.split(/[.\-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const profile: StoredProfile = role === 'osi_admin'
      ? { name, email: lower, password, organizations: [], currentOrg: 'OSI', isOSIAdmin: true }
      : { name, email: lower, password, organizations: orgs.map((org) => ({ org, role: 'eboard' })), currentOrg: orgs[0], isOSIAdmin: false };

    saveProfile(profile);
    login({ name, email: lower, organizations: profile.organizations, currentOrg: profile.currentOrg, isOSIAdmin: profile.isOSIAdmin });
  }

  return (
    <Shell>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-7 shadow-2xl">
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-1 text-sm text-gray-500">You'll only need to do this once.</p>
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

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {([['eboard', 'E-Board'], ['osi_admin', 'OSI Admin']] as [Role, string][]).map(([key, label]) => (
                  <label key={key}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none"
                    style={{
                      borderColor: role === key ? '#6B0000' : '#e5e7eb',
                      backgroundColor: role === key ? '#fff1f2' : 'white',
                    }}>
                    <input type="radio" name="role" value={key} checked={role === key}
                      onChange={() => { setRole(key); setPin(''); setPinError(''); setOrgs([]); setPendingOrg(''); }}
                      className="w-3.5 h-3.5 flex-shrink-0" style={{ accentColor: '#6B0000' }} />
                    <span className="text-sm font-semibold text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Multi-org builder (eboard only) */}
            {role === 'eboard' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Organizations <span className="font-normal text-gray-400">(add all you're E-Board for)</span>
                </label>

                {orgs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {orgs.map((org) => (
                      <span key={org}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: '#fff1f2', color: '#8B0000' }}>
                        {org}
                        <button type="button" onClick={() => removeOrg(org)} className="hover:opacity-70 ml-0.5">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="flex-1">
                    <ClubCombobox value={pendingOrg} onChange={(v) => { setPendingOrg(v); setOrgError(''); }} exclude={orgs} />
                  </div>
                  <button type="button" onClick={addOrg}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: '#6B0000' }}>
                    <Plus size={13} /> Add
                  </button>
                </div>
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

            {/* Create password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Create Password</label>
              <input type="password" placeholder="Min. 6 characters" value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                className="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-200 focus:outline-none focus:border-red-800 placeholder-gray-400 text-gray-800" />
              {passwordError && (
                <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                  <AlertCircle size={12} />{passwordError}
                </p>
              )}
            </div>

            <button type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#6B0000' }}>
              Create Account <ChevronRight size={16} />
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

// ── Coordinator ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [step, setStep] = useState<Step>('landing');

  switch (step) {
    case 'landing':
      return <LandingStep onSignIn={() => setStep('login')} onSignUp={() => setStep('signup')} />;
    case 'login':
      return <LoginStep onBack={() => setStep('landing')} />;
    case 'signup':
      return <SignupStep onBack={() => setStep('landing')} />;
  }
}
