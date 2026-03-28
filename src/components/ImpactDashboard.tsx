import React from 'react';
import { Package, Bell, Zap, Lightbulb, Plus, ArrowLeftRight, CheckCircle2, Clock } from 'lucide-react';
import { InventoryItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface ImpactDashboardProps {
  items: InventoryItem[];
  onAddItem: () => void;
  onGoToMarketplace: () => void;
}

export default function ImpactDashboard({ items, onAddItem, onGoToMarketplace }: ImpactDashboardProps) {
  const { user } = useAuth();
  const isAdmin = !!user?.isOSIAdmin;
  const canAdd = isAdmin || user?.organizations[0]?.role === 'eboard';

  const myItems = isAdmin ? items : items.filter((i) => i.org === user?.currentOrg);
  const myShared = myItems.filter((i) => i.shared);
  const tipItem = myItems.find((i) => !i.shared) ?? null;

  // Demo notification counts
  const pendingRequests = 2;
  const approvedBorrows = 1;

  return (
    <div className="mb-6 space-y-3">
      {/* 3-column row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Your Org */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#fff1f2', color: '#8B0000' }}>
              <Package size={16} />
            </div>
            <span className="text-sm font-bold text-gray-700 truncate">
              {isAdmin ? 'All Organizations' : (user?.currentOrg ?? 'Your Org')}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{myItems.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">{myItems.length === 1 ? 'item' : 'items'} in inventory</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{myShared.length} on marketplace</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
              <Bell size={16} />
            </div>
            <span className="text-sm font-bold text-gray-700">Notifications</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-amber-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{pendingRequests}</span> pending requests
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{approvedBorrows}</span> approved borrow
              </span>
            </div>
          </div>
          <button onClick={onGoToMarketplace}
            className="mt-3 pt-3 border-t border-gray-100 w-full text-left text-xs font-semibold transition-colors hover:opacity-70"
            style={{ color: '#8B0000' }}>
            View all activity →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
              <Zap size={16} />
            </div>
            <span className="text-sm font-bold text-gray-700">Quick Actions</span>
          </div>
          <div className="space-y-2">
            {canAdd && (
              <button onClick={onAddItem}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#8B0000' }}>
                <Plus size={14} /> Add item
              </button>
            )}
            <button onClick={onGoToMarketplace}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <ArrowLeftRight size={14} /> View requests
            </button>
          </div>
        </div>
      </div>

      {/* Tip row */}
      {tipItem && canAdd && (
        <div className="flex items-start gap-3 px-5 py-3.5 rounded-2xl border"
          style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
          <Lightbulb size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-amber-800 flex-1 min-w-0">
            <span className="font-semibold">Tip:</span> Your org has items not used in 6+ months.
            Consider sharing on marketplace:{' '}
            <span className="font-semibold">{tipItem.name}</span>
          </span>
          <button onClick={onGoToMarketplace}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors hover:opacity-90"
            style={{ backgroundColor: '#8B0000', color: 'white' }}>
            List it
          </button>
        </div>
      )}
    </div>
  );
}
