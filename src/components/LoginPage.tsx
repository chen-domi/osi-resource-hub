import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ArrowLeft, AlertCircle, Search, X, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../types';
import { useAuth } from '../context/AuthContext';
import { BC_CLUBS } from '../data/clubs';

type Role = 'member' | 'eboard' | 'osi_admin';
type Step = 'credentials' | 'club';

const OSI_PIN = '2026';

// ── Shared shell ──────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#6B0000' }}
    >
      {children}
    </div>
  );
}


// ── Searchable club combobox ──────────────────────────────────────────────────

interface ClubComboboxProps {
  value: string;
  onChange: (v: string) => void;
}

function ClubCombobox({ value, onChange }: ClubComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? BC_CLUBS.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : BC_CLUBS;

  function select(club: string) {
    onChange(club);
    setQuery(club);
    setOpen(false);
  }

  function handleInput(v: string) {
    setQuery(v);
    onChange('');
    setOpen(true);
  }

  function handleClear() {
    setQuery('');
    onChange('');
    setOpen(false);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        if (!value) setQuery('');
        else setQuery(value);
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
          className="w-full pl-9 pr-8 py-3 rounded-xl text-sm text-gray-800 bg-white border-2 border-gray-200 focus:outline-none focus:border-red-800 placeholder-gray-400"
        />
        {query && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 text-gray-400">
            <X size={14} />
          </button>
        )}
      </div>
      {open && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400 text-center">No clubs found</li>
          ) : (
            filtered.map((club) => (
              <li
                key={club}
                onMouseDown={() => select(club)}
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-red-50 transition-colors"
                style={{ color: value === club ? '#8B0000' : '#374151', fontWeight: value === club ? 600 : 400 }}
              >
                {club}
              </li>
            ))
          )}
        </ul>
      )}
      {value && (
        <p className="text-xs mt-1.5 font-medium text-gray-500">
          Selected: <span className="font-semibold text-gray-800">{value}</span>
        </p>
      )}
    </div>
  );
}

// ── Step 1: Credentials ───────────────────────────────────────────────────────

interface CredentialsStepProps {
  onNext: (name: string, email: string) => void;
}

function CredentialsStep({ onNext }: CredentialsStepProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@bc.edu')) {
      setError('Must be a @bc.edu email address.');
      return;
    }
    const prefix = email.split('@')[0];
    const name = prefix.split(/[.\-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    onNext(name, email.toLowerCase());
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent';

  return (
    <Shell>
      <div className="w-full max-w-xs">
        {/* Logo + title above card */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl font-black shadow-lg"
            style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}
          >
            BC
          </div>
          <h1 className="text-2xl font-bold text-white">OSI Resource Hub</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(207,184,124,0.55)' }}>
            Boston College Student Organizations
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-6 border border-white/15 shadow-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-base font-bold text-white mb-5 text-center">Sign in with Boston College</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="username@bc.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                className={inputClass}
                style={{ '--tw-ring-color': '#CFB87C' } as React.CSSProperties}
              />
              {error && (
                <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: '#CFB87C' }}>
                  <AlertCircle size={12} />{error}
                </p>
              )}
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
              style={{ '--tw-ring-color': '#CFB87C' } as React.CSSProperties}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 mt-1"
              style={{ backgroundColor: '#CFB87C', color: '#6B0000' }}
            >
              Continue <ChevronRight size={16} />
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Only @bc.edu accounts may access this system
        </p>
      </div>
    </Shell>
  );
}

// ── Step 2: Club + Role ───────────────────────────────────────────────────────

interface ClubStepProps {
  displayName: string;
  onLogin: (user: AuthUser) => void;
  onBack: () => void;
  email: string;
}

function ClubStep({ displayName, email, onLogin, onBack }: ClubStepProps) {
  const [club, setClub] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [clubError, setClubError] = useState('');

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (role !== 'osi_admin' && !club) {
      setClubError('Please select your organization.');
      return;
    }
    setClubError('');

    if (role === 'osi_admin') {
      if (pin !== OSI_PIN) {
        setPinError('Incorrect PIN. Please try again.');
        return;
      }
      onLogin({
        name: displayName,
        email,
        organizations: [],
        currentOrg: 'OSI',
        isOSIAdmin: true,
      });
      return;
    }

    onLogin({
      name: displayName,
      email,
      organizations: [{ org: club, role }],
      currentOrg: club,
      isOSIAdmin: false,
    });
  }

  const roles: { key: Role; label: string; desc: string }[] = [
    { key: 'member',    label: 'Member',     desc: 'Browse & request items' },
    { key: 'eboard',    label: 'E-Board',    desc: 'Manage your club inventory' },
    { key: 'osi_admin', label: 'OSI Admin',  desc: 'Full access + all orgs' },
  ];

  return (
    <Shell>
      <div className="w-full max-w-sm">
        {/* White card */}
        <div className="bg-white rounded-2xl p-7 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-900">Welcome, {displayName}!</h2>
            <p className="mt-1 text-sm text-gray-500">Which organization are you with?</p>
            <p className="text-xs text-gray-400 mt-0.5">You'll only need to do this once.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Club selector */}
            {role !== 'osi_admin' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Organization
                </label>
                <ClubCombobox value={club} onChange={(v) => { setClub(v); setClubError(''); }} />
                {clubError && (
                  <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                    <AlertCircle size={12} />{clubError}
                  </p>
                )}
              </div>
            )}

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Role
              </label>
              <div className="space-y-1.5">
                {roles.map((r) => (
                  <label
                    key={r.key}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all select-none"
                    style={{
                      borderColor: role === r.key ? '#6B0000' : '#e5e7eb',
                      backgroundColor: role === r.key ? '#fff1f2' : 'white',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.key}
                      checked={role === r.key}
                      onChange={() => { setRole(r.key); setPin(''); setPinError(''); }}
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ accentColor: '#6B0000' }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                      <p className="text-xs text-gray-400">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* OSI Admin PIN */}
            {role === 'osi_admin' && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                  <ShieldCheck size={13} /> Admin PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                  className="w-full px-4 py-3 rounded-xl text-lg border-2 border-gray-200 focus:outline-none focus:border-red-800 tracking-[0.6em] text-center font-bold placeholder-gray-300 text-gray-800"
                />
                {pinError && (
                  <p className="flex items-center gap-1.5 text-xs mt-1.5 text-red-600">
                    <AlertCircle size={12} />{pinError}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#6B0000' }}
            >
              Continue <ChevronRight size={16} />
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs mt-4 mx-auto transition-colors hover:opacity-80"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <ArrowLeft size={13} /> Back
        </button>
      </div>
    </Shell>
  );
}

// ── Coordinator ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>('credentials');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleCredentials(resolvedName: string, resolvedEmail: string) {
    setName(resolvedName);
    setEmail(resolvedEmail);
    setStep('club');
  }

  switch (step) {
    case 'credentials':
      return <CredentialsStep onNext={handleCredentials} />;
    case 'club':
      return (
        <ClubStep
          displayName={name}
          email={email}
          onLogin={login}
          onBack={() => setStep('credentials')}
        />
      );
  }
}
