import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Package, QrCode, MapPin, Pencil, Trash2, Lock, Eye, Printer } from 'lucide-react';
import { InventoryItem } from '../types';
import { categoryColors } from '../data/inventory';
import { useAuth } from '../context/AuthContext';

interface InventoryTableProps {
  items: InventoryItem[];
  checkedOutItems: string[];
  viewMode: 'global' | 'club';          // global = all orgs; club = own org only
  onScanClick: (qrCode: string) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  onToggleShare: (id: number, shared: boolean) => void;
}

export default function InventoryTable({
  items, checkedOutItems, viewMode, onScanClick, onEdit, onDelete, onToggleShare,
}: InventoryTableProps) {
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Package size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-medium">
          {viewMode === 'club' ? 'No items in your club inventory yet.' : 'No items match your search.'}
        </p>
      </div>
    );
  }

  const globalCols = ['QR Code', 'Item', 'Organization', 'Location', 'Status', 'Qty', 'Last Used', ''];
  const clubCols   = ['QR Code', 'Item', 'Location', 'Status', 'Qty', 'Marketplace', 'Last Used', ''];

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {(viewMode === 'club' ? clubCols : globalCols).map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => {
            const canEdit =
              user?.isOSIAdmin ||
              (user?.organizations.find((o) => o.org === item.org)?.role === 'eboard');
            const canToggle = canEdit;
            return (
              <InventoryRow
                key={item.id}
                item={item}
                isCheckedOut={checkedOutItems.includes(item.qrCode)}
                viewMode={viewMode}
                canEdit={!!canEdit}
                canToggle={!!canToggle}
                onScanClick={onScanClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleShare={onToggleShare}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface RowProps {
  item: InventoryItem;
  isCheckedOut: boolean;
  viewMode: 'global' | 'club';
  canEdit: boolean;
  canToggle: boolean;
  onScanClick: (qrCode: string) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  onToggleShare: (id: number, shared: boolean) => void;
}

function QRPopover({ qrCode }: { qrCode: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handlePrint() {
    const win = window.open('', '_blank', 'width=300,height=350');
    if (!win) return;
    win.document.write(`
      <html><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace;gap:12px">
        <div id="qr"></div>
        <p style="font-size:12px;color:#555">${qrCode}</p>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
        <script>new QRCode(document.getElementById('qr'),{text:'${qrCode}',width:180,height:180});<\/script>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 800);
  }

  return (
    <div ref={ref} className="relative inline-block">
      <div className="flex items-center gap-1">
        <button onClick={() => { }} title="Scan item"
          className="flex items-center gap-1.5 font-mono text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all hover:shadow-sm active:scale-95"
          style={{ borderColor: '#CFB87C', color: '#8B0000', backgroundColor: '#fffbeb' }}>
          <QrCode size={12} />{qrCode}
        </button>
        <button onClick={() => setOpen((o) => !o)} title="View QR code"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Eye size={13} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex flex-col items-center gap-2"
          style={{ minWidth: 180 }}>
          <QRCodeSVG value={qrCode} size={140} bgColor="#ffffff" fgColor="#6B0000" />
          <p className="text-xs font-mono text-gray-500 text-center">{qrCode}</p>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-90 text-white w-full justify-center"
            style={{ backgroundColor: '#8B0000' }}>
            <Printer size={12} /> Print
          </button>
        </div>
      )}
    </div>
  );
}

function InventoryRow({ item, isCheckedOut, viewMode, canEdit, canToggle, onScanClick, onEdit, onDelete, onToggleShare }: RowProps) {
  return (
    <tr className="bg-white hover:bg-amber-50 transition-colors">
      {/* QR Code */}
      <td className="px-4 py-3">
        <QRPopover qrCode={item.qrCode} />
      </td>

      {/* Name + category */}
      <td className="px-4 py-3">
        <p className="font-medium text-gray-800">{item.name}</p>
        <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
          {item.category}
        </span>
      </td>

      {/* Org (global only) */}
      {viewMode === 'global' && <td className="px-4 py-3 text-gray-600">{item.org}</td>}

      {/* Location */}
      <td className="px-4 py-3">
        <span className="flex items-center gap-1 text-gray-500 text-xs">
          <MapPin size={11} />{item.location}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
          style={isCheckedOut ? { backgroundColor: '#fee2e2', color: '#dc2626' } : { backgroundColor: '#dcfce7', color: '#16a34a' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isCheckedOut ? '#dc2626' : '#16a34a' }} />
          {isCheckedOut ? 'Checked Out' : 'Available'}
        </span>
      </td>

      {/* Qty */}
      <td className="px-4 py-3 text-center font-semibold text-gray-700">
        {isCheckedOut ? <span className="text-red-400 line-through">{item.quantity}</span> : item.quantity}
      </td>

      {/* Marketplace toggle (club view only) */}
      {viewMode === 'club' && (
        <td className="px-4 py-3">
          {canToggle ? (
            <button onClick={() => onToggleShare(item.id, !item.shared)}
              className="flex items-center gap-2 text-xs font-semibold transition-all"
              title={item.shared ? 'Remove from marketplace' : 'List on marketplace'}>
              <span className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors"
                style={{ backgroundColor: item.shared ? '#8B0000' : '#d1d5db' }}>
                <span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: item.shared ? 'translateX(16px)' : 'translateX(0)' }} />
              </span>
              <span style={{ color: item.shared ? '#8B0000' : '#9ca3af' }}>
                {item.shared ? 'Listed' : 'Not listed'}
              </span>
            </button>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={item.shared ? { backgroundColor: '#fff1f2', color: '#8B0000' } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
              {item.shared ? 'Listed' : 'Not listed'}
            </span>
          )}
        </td>
      )}

      {/* Last Used */}
      <td className="px-4 py-3 text-xs text-gray-400">{item.lastUsed}</td>

      {/* Actions */}
      <td className="px-4 py-3">
        {canEdit ? (
          <div className="flex items-center gap-1">
            <button title="Edit" onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Pencil size={14} />
            </button>
            <button title="Delete" onClick={() => { if (window.confirm(`Delete "${item.name}"?`)) onDelete(item.id); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <span title="View only" className="text-gray-300"><Lock size={13} /></span>
        )}
      </td>
    </tr>
  );
}
