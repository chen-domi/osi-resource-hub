import React, { useState, useEffect } from 'react';
import { Search, Package, Recycle, ArrowLeftRight, Plus, Globe } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import ImpactDashboard from './components/ImpactDashboard';
import QRScannerModal from './components/QRScannerModal';
import InventoryTable from './components/InventoryTable';
import SharingMarketplace from './components/SharingMarketplace';
import LoginPage from './components/LoginPage';
import AddItemModal from './components/AddItemModal';
import { inventoryItems } from './data/inventory';
import { InventoryItem, ScanResult } from './types';

type Tab = 'club-inventory' | 'global-inventory' | 'marketplace';

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <MainApp />;
}

function MainApp() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);
  const [activeTab, setActiveTab] = useState<Tab>('club-inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [checkedOutItems, setCheckedOutItems] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const isAdmin = !!user?.isOSIAdmin;
  const userRole = user?.organizations[0]?.role ?? 'member';
  const canAdd = isAdmin || userRole === 'eboard';

  // Auto-close scanner 2s after scan
  useEffect(() => {
    if (!scanResult) return;
    const t = setTimeout(() => { setScanResult(null); setShowScanner(false); }, 2000);
    return () => clearTimeout(t);
  }, [scanResult]);

  // Reset search on tab change
  useEffect(() => { setSearchTerm(''); }, [activeTab]);

  const handleSaveItem = (saved: InventoryItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === saved.id)
        ? prev.map((i) => (i.id === saved.id ? saved : i))
        : [...prev, saved]
    );
    setShowAddItem(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const handleToggleShare = (id: number, shared: boolean) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, shared } : i)));

  const handleScan = (qrCode: string) => {
    const item = items.find((i) => i.qrCode === qrCode);
    if (!item) return;
    const isOut = checkedOutItems.includes(qrCode);
    setCheckedOutItems((prev) => isOut ? prev.filter((q) => q !== qrCode) : [...prev, qrCode]);
    setScanResult({ item, action: isOut ? 'Checked In' : 'Checked Out' });
  };

  const handleTableQRClick = (qrCode: string) => {
    setScanResult(null);
    setShowScanner(true);
    setTimeout(() => handleScan(qrCode), 500);
  };

  const applySearch = (list: InventoryItem[]) => {
    const q = searchTerm.toLowerCase();
    if (!q) return list;
    return list.filter(({ name, org, category, qrCode }) =>
      name.toLowerCase().includes(q) || org.toLowerCase().includes(q) ||
      category.toLowerCase().includes(q) || qrCode.toLowerCase().includes(q)
    );
  };

  // Club inventory = own org (or all for admin)
  const clubItems = isAdmin ? items : items.filter((i) => i.org === user?.currentOrg);
  const globalItems = items;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'club-inventory',   label: 'Club Inventory',   icon: <Package size={15} />,       count: clubItems.length },
    { key: 'global-inventory', label: 'Global Inventory', icon: <Globe size={15} />,          count: globalItems.length },
    { key: 'marketplace',      label: 'Marketplace',      icon: <ArrowLeftRight size={15} />, count: items.filter((i) => i.shared).length },
  ];

  const showToolbar = activeTab !== 'marketplace';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f4ee' }}>
      <Header onScanClick={() => { setScanResult(null); setShowScanner(true); }} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <ImpactDashboard
          items={items}
          onAddItem={() => { setActiveTab('club-inventory'); setEditingItem(null); setShowAddItem(true); }}
          onGoToMarketplace={() => setActiveTab('marketplace')}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0"
                style={activeTab === tab.key
                  ? { borderColor: '#8B0000', color: '#8B0000' }
                  : { borderColor: 'transparent', color: '#6b7280' }}>
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-0.5"
                    style={activeTab === tab.key
                      ? { backgroundColor: '#8B0000', color: 'white' }
                      : { backgroundColor: '#e5e7eb', color: '#6b7280' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          {showToolbar && (
            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search items, orgs, categories…"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#CFB87C' } as React.CSSProperties} />
              </div>
              {canAdd && activeTab === 'club-inventory' && (
                <button onClick={() => { setEditingItem(null); setShowAddItem(true); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
                  style={{ backgroundColor: '#8B0000' }}>
                  <Plus size={15} />
                  Add Item
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            {activeTab === 'club-inventory' && (
              <InventoryTable
                items={applySearch(clubItems)}
                checkedOutItems={checkedOutItems}
                viewMode="club"
                onScanClick={handleTableQRClick}
                onEdit={(item) => { setEditingItem(item); setShowAddItem(true); }}
                onDelete={handleDeleteItem}
                onToggleShare={handleToggleShare}
              />
            )}
            {activeTab === 'global-inventory' && (
              <InventoryTable
                items={applySearch(globalItems)}
                checkedOutItems={checkedOutItems}
                viewMode="global"
                onScanClick={handleTableQRClick}
                onEdit={(item) => { setEditingItem(item); setShowAddItem(true); }}
                onDelete={handleDeleteItem}
                onToggleShare={handleToggleShare}
              />
            )}
            {activeTab === 'marketplace' && (
              <SharingMarketplace items={items} checkedOutItems={checkedOutItems} />
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><Recycle size={13} />Reducing waste across Boston College</span>
          <span className="hidden sm:block">&bull;</span>
          <span>300+ Student Organizations</span>
          <span className="hidden sm:block">&bull;</span>
          <span>Spring 2025</span>
        </div>
      </main>

      {showAddItem && (
        <AddItemModal
          item={editingItem ?? undefined}
          nextId={items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1}
          onSave={handleSaveItem}
          onClose={() => { setShowAddItem(false); setEditingItem(null); }}
        />
      )}

      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
          scanResult={scanResult}
          checkedOutItems={checkedOutItems}
        />
      )}
    </div>
  );
}
