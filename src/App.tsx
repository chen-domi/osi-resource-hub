import React, { useState, useEffect } from 'react';
import { Search, Package, Recycle, ArrowLeftRight } from 'lucide-react';

import Header from './components/Header';
import ImpactDashboard from './components/ImpactDashboard';
import QRScannerModal from './components/QRScannerModal';
import InventoryTable from './components/InventoryTable';
import SharingMarketplace from './components/SharingMarketplace';
import { inventoryItems } from './data/inventory';
import { ScanResult } from './types';

type Tab = 'inventory' | 'marketplace';

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'inventory', label: 'Inventory Tracker', icon: <Package size={15} /> },
  { key: 'marketplace', label: 'Sharing Marketplace', icon: <ArrowLeftRight size={15} /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [checkedOutItems, setCheckedOutItems] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Auto-close modal 2s after a successful scan
  useEffect(() => {
    if (!scanResult) return;
    const t = setTimeout(() => {
      setScanResult(null);
      setShowScanner(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [scanResult]);

  const handleScan = (qrCode: string) => {
    const item = inventoryItems.find((i) => i.qrCode === qrCode);
    if (!item) return;
    const isOut = checkedOutItems.includes(qrCode);
    setCheckedOutItems((prev) =>
      isOut ? prev.filter((q) => q !== qrCode) : [...prev, qrCode]
    );
    setScanResult({ item, action: isOut ? 'Checked In' : 'Checked Out' });
  };

  // Clicking a QR badge in the table opens the modal, then auto-scans
  const handleTableQRClick = (qrCode: string) => {
    setScanResult(null);
    setShowScanner(true);
    setTimeout(() => handleScan(qrCode), 500);
  };

  const openScanner = () => {
    setScanResult(null);
    setShowScanner(true);
  };

  const filteredItems = inventoryItems.filter(({ name, org, category, qrCode }) => {
    const q = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      org.toLowerCase().includes(q) ||
      category.toLowerCase().includes(q) ||
      qrCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f4ee' }}>
      <Header onScanClick={openScanner} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <ImpactDashboard />

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px"
                style={
                  activeTab === tab.key
                    ? { borderColor: '#8B0000', color: '#8B0000' }
                    : { borderColor: 'transparent', color: '#6b7280' }
                }
              >
                {tab.icon}
                {tab.label}
                {tab.key === 'inventory' && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full ml-0.5"
                    style={{ backgroundColor: '#8B0000', color: 'white' }}
                  >
                    {inventoryItems.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search bar (inventory only) */}
          {activeTab === 'inventory' && (
            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
              <div className="relative max-w-sm">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search items, orgs, categories…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#CFB87C' } as React.CSSProperties}
                />
              </div>
            </div>
          )}

          {/* Tab content */}
          <div className="p-5">
            {activeTab === 'inventory' ? (
              <InventoryTable
                items={filteredItems}
                checkedOutItems={checkedOutItems}
                onScanClick={handleTableQRClick}
              />
            ) : (
              <SharingMarketplace
                items={inventoryItems}
                checkedOutItems={checkedOutItems}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Recycle size={13} />
            Reducing waste across Boston College
          </span>
          <span className="hidden sm:block">&bull;</span>
          <span>300+ Student Organizations</span>
          <span className="hidden sm:block">&bull;</span>
          <span>Spring 2025</span>
        </div>
      </main>

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
