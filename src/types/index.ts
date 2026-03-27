export interface InventoryItem {
  id: number;
  qrCode: string;
  name: string;
  category: string;
  org: string;
  location: string;
  quantity: number;
  lastUsed: string;
}

export interface ScanResult {
  item: InventoryItem;
  action: 'Checked Out' | 'Checked In';
}
