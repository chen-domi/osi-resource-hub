export interface InventoryItem {
  id: number;
  qrCode: string;
  name: string;
  category: string;
  org: string;
  location: string;
  quantity: number;
  lastUsed: string;
  shared: boolean;
  createdAt?: string;
  checkedOutTo?: {
    name: string;
    email: string;
    date: string;
    expectedReturn: string;
  };
}

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  organizations: Array<{
    org: string;
    role: 'member' | 'eboard';
  }>;
  currentOrg: string;
  isOSIAdmin: boolean;
}

export interface ScanResult {
  item: InventoryItem;
  action: 'Checked Out' | 'Checked In';
}
