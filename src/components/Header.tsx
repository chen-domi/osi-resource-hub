import React from 'react';
import { Package, QrCode, MapPin } from 'lucide-react';

interface HeaderProps {
  onScanClick: () => void;
}

export default function Header({ onScanClick }: HeaderProps) {
  return (
    <header style={{ background: 'linear-gradient(135deg, #8B0000 0%, #5a0000 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title block */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                style={{ backgroundColor: '#CFB87C' }}
              >
                <Package size={22} style={{ color: '#8B0000' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    OSI Resource Hub
                  </h1>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#CFB87C', color: '#8B0000' }}
                  >
                    BETA
                  </span>
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

          {/* Scan button */}
          <button
            onClick={onScanClick}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-xl transition-all hover:scale-105 active:scale-95 self-start sm:self-auto flex-shrink-0"
            style={{ backgroundColor: 'white', color: '#8B0000' }}
          >
            <QrCode size={18} />
            Scan QR Code
          </button>
        </div>
      </div>
    </header>
  );
}
