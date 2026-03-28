import React from 'react';
import { Package, QrCode, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onScanClick: () => void;
}

const ROLE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  member:    { label: 'Member',    bg: '#e0e7ff', color: '#3730a3' },
  eboard:    { label: 'E-Board',   bg: '#fef9c3', color: '#854d0e' },
  osi_admin: { label: 'OSI Admin', bg: '#CFB87C', color: '#8B0000' },
};

export default function Header({ onScanClick }: HeaderProps) {
  const { user, logout } = useAuth();

  const roleKey = user?.isOSIAdmin
    ? 'osi_admin'
    : (user?.organizations[0]?.role ?? 'member');
  const badge = ROLE_BADGE[roleKey];

  return (
    <header style={{ background: 'linear-gradient(135deg, #8B0000 0%, #5a0000 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title block */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                style={{ backgroundColor: '#CFB87C' }}>
                <Package size={22} style={{ color: '#8B0000' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white tracking-tight">OSI Resource Hub</h1>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#CFB87C', color: '#8B0000' }}>BETA</span>
                </div>
                <p className="text-sm text-red-200 mt-0.5">
                  Smart Inventory &amp; Sharing Marketplace for BC Student Organizations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1.5 ml-14 text-xs text-red-300">
              <MapPin size={11} />
              <span>Carney Hall, Suite 147 &bull; Powered by MyBC</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* User badge */}
            {user && (
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-2 justify-end">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-red-300 mt-0.5">{user.currentOrg}</p>
              </div>
            )}

            <button
              onClick={onScanClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'white', color: '#8B0000' }}
            >
              <QrCode size={17} />
              Scan QR
            </button>

            {user && (
              <button
                onClick={logout}
                title="Sign out"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
