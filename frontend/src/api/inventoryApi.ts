import { InventoryItem } from '../types';

const API_URL = process.env.REACT_APP_API_URL ?? '';

interface InventoryItemResponse {
  id: number;
  qrCode: string;
  name: string;
  category: string;
  organization: string;
  location: string;
  quantity: number;
  lastUsed: string | null;
  shared: boolean;
  checkedOut: boolean;
  borrowCount: number | null;
  checkoutPurpose: string | null;
  checkoutDueDate: string | null;
  createdAt: string | null;
}

function toInventoryItem(response: InventoryItemResponse): InventoryItem {
  return {
    id: response.id,
    qrCode: response.qrCode,
    name: response.name,
    category: response.category,
    org: response.organization,
    location: response.location,
    quantity: response.quantity,
    lastUsed: response.lastUsed ?? '',
    shared: response.shared,
    checkedOut: response.checkedOut,
    borrowCount: response.borrowCount ?? 0,
    checkoutPurpose: response.checkoutPurpose ?? undefined,
    checkoutDueDate: response.checkoutDueDate ?? undefined,
    createdAt: response.createdAt ?? undefined,
  };
}

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await fetch(`${API_URL}/api/inventory`);

  if (!response.ok) {
    throw new Error(`Could not load inventory (${response.status})`);
  }

  const data: InventoryItemResponse[] = await response.json();
  return data.map(toInventoryItem);
}
