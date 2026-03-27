import React from 'react';
import { Package, QrCode, MapPin } from 'lucide-react';
import { InventoryItem } from '../types';
import { categoryColors } from '../data/inventory';

interface InventoryTableProps {
  items: InventoryItem[];
  checkedOutItems: string[];
  onScanClick: (qrCode: string) => void;
}

const columns = ['QR Code', 'Item', 'Organization', 'Location', 'Status', 'Qty', 'Last Used'];

export default function InventoryTable({
  items,
  checkedOutItems,
  onScanClick,
}: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Package size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-medium">No items match your search.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {columns.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              isCheckedOut={checkedOutItems.includes(item.qrCode)}
              onScanClick={onScanClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface InventoryRowProps {
  item: InventoryItem;
  isCheckedOut: boolean;
  onScanClick: (qrCode: string) => void;
}

function InventoryRow({ item, isCheckedOut, onScanClick }: InventoryRowProps) {
  return (
    <tr className="bg-white hover:bg-amber-50 transition-colors">
      {/* QR Code */}
      <td className="px-4 py-3">
        <button
          onClick={() => onScanClick(item.qrCode)}
          title="Click to simulate scan"
          className="flex items-center gap-1.5 font-mono text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all hover:shadow-sm active:scale-95"
          style={{ borderColor: '#CFB87C', color: '#8B0000', backgroundColor: '#fffbeb' }}
        >
          <QrCode size={12} />
          {item.qrCode}
        </button>
      </td>

      {/* Name + category */}
      <td className="px-4 py-3">
        <p className="font-medium text-gray-800">{item.name}</p>
        <span
          className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
            categoryColors[item.category] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {item.category}
        </span>
      </td>

      {/* Org */}
      <td className="px-4 py-3 text-gray-600">{item.org}</td>

      {/* Location */}
      <td className="px-4 py-3">
        <span className="flex items-center gap-1 text-gray-500 text-xs">
          <MapPin size={11} />
          {item.location}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
          style={
            isCheckedOut
              ? { backgroundColor: '#fee2e2', color: '#dc2626' }
              : { backgroundColor: '#dcfce7', color: '#16a34a' }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: isCheckedOut ? '#dc2626' : '#16a34a' }}
          />
          {isCheckedOut ? 'Checked Out' : 'Available'}
        </span>
      </td>

      {/* Qty */}
      <td className="px-4 py-3 text-center font-semibold text-gray-700">
        {isCheckedOut ? (
          <span className="text-red-400 line-through">{item.quantity}</span>
        ) : (
          item.quantity
        )}
      </td>

      {/* Last Used */}
      <td className="px-4 py-3 text-xs text-gray-400">{item.lastUsed}</td>
    </tr>
  );
}
