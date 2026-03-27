import React from 'react';
import { Camera, X, CheckCircle, QrCode } from 'lucide-react';
import { ScanResult } from '../types';
import { demoScanItems } from '../data/inventory';

interface QRScannerModalProps {
  onClose: () => void;
  onScan: (qrCode: string) => void;
  scanResult: ScanResult | null;
  checkedOutItems: string[];
}

export default function QRScannerModal({
  onClose,
  onScan,
  scanResult,
  checkedOutItems,
}: QRScannerModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Camera size={20} style={{ color: '#8B0000' }} />
            <span className="font-semibold text-gray-800">QR Code Scanner</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {scanResult ? (
          <SuccessScreen scanResult={scanResult} />
        ) : (
          <ScannerView onScan={onScan} checkedOutItems={checkedOutItems} />
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%   { top: 12%; }
          50%  { top: 82%; }
          100% { top: 12%; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SuccessScreen({ scanResult }: { scanResult: ScanResult }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <CheckCircle size={44} className="text-green-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-1">{scanResult.action}!</h3>
      <p className="text-gray-600 font-medium mb-1">{scanResult.item.name}</p>
      <p className="text-sm text-gray-400 mb-2">{scanResult.item.org}</p>
      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
        {scanResult.item.qrCode}
      </span>
    </div>
  );
}

interface ScannerViewProps {
  onScan: (qrCode: string) => void;
  checkedOutItems: string[];
}

function ScannerView({ onScan, checkedOutItems }: ScannerViewProps) {
  return (
    <div className="px-5 py-5">
      {/* Simulated camera */}
      <div
        className="relative rounded-xl overflow-hidden mb-5"
        style={{ backgroundColor: '#111', height: 200 }}
      >
        <div
          className="absolute left-0 right-0 h-px opacity-80"
          style={{
            backgroundColor: '#4ade80',
            animation: 'scan 2s linear infinite',
            top: '50%',
          }}
        />
        {/* Corner brackets */}
        {([
          { t: 'top-5', l: 'left-5', bt: 3, bl: 3, bb: 0, br: 0 },
          { t: 'top-5', l: 'right-5', bt: 3, bl: 0, bb: 0, br: 3 },
          { t: 'bottom-5', l: 'left-5', bt: 0, bl: 3, bb: 3, br: 0 },
          { t: 'bottom-5', l: 'right-5', bt: 0, bl: 0, bb: 3, br: 3 },
        ] as { t: string; l: string; bt: number; bl: number; bb: number; br: number }[]).map(
          (c, i) => (
            <div
              key={i}
              className={`absolute ${c.t} ${c.l} w-7 h-7`}
              style={{
                borderColor: '#CFB87C',
                borderTopWidth: c.bt,
                borderLeftWidth: c.bl,
                borderBottomWidth: c.bb,
                borderRightWidth: c.br,
                borderStyle: 'solid',
              }}
            />
          )
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm select-none">Align QR code within frame</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 text-center">
        Demo — Quick Scan
      </p>

      <div className="space-y-2">
        {demoScanItems.map(({ qr, label, org }) => {
          const isOut = checkedOutItems.includes(qr);
          return (
            <button
              key={qr}
              onClick={() => onScan(qr)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:shadow-md active:scale-95"
              style={{
                borderColor: isOut ? '#ef4444' : '#CFB87C',
                backgroundColor: isOut ? '#fef2f2' : '#fffbeb',
              }}
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{org}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={
                    isOut
                      ? { backgroundColor: '#fee2e2', color: '#dc2626' }
                      : { backgroundColor: '#dcfce7', color: '#16a34a' }
                  }
                >
                  {isOut ? 'Check In' : 'Check Out'}
                </span>
                <QrCode size={15} className="text-gray-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
