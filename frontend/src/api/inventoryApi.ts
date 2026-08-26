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

function inventoryRequestBody(item: InventoryItem) {
  return {
    name: item.name,
    category: item.category,
    organization: item.org,
    location: item.location,
    quantity: item.quantity,
    lastUsed: item.lastUsed === '—' ? null : item.lastUsed,
    shared: item.shared,
  };
}

async function responseError(response: Response): Promise<Error> {
  try {
    const data: { message?: string } = await response.json();
    if (data.message) return new Error(data.message);
  } catch {
    // The response did not contain a JSON error body.
  }

  return new Error(`Inventory request failed (${response.status})`);
}

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await fetch(`${API_URL}/api/inventory`);

  if (!response.ok) {
    throw await responseError(response);
  }

  const data: InventoryItemResponse[] = await response.json();
  return data.map(toInventoryItem);
}

export async function createInventoryItem(
  item: InventoryItem
): Promise<InventoryItem> {
  const response = await fetch(`${API_URL}/api/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      qrCode: item.qrCode,
      ...inventoryRequestBody(item),
    }),
  });

  if (!response.ok) {
    throw await responseError(response);
  }

  const data: InventoryItemResponse = await response.json();
  return toInventoryItem(data);
}

export async function updateInventoryItem(
  item: InventoryItem
): Promise<InventoryItem> {
  const response = await fetch(`${API_URL}/api/inventory/${item.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inventoryRequestBody(item)),
  });

  if (!response.ok) {
    throw await responseError(response);
  }

  const data: InventoryItemResponse = await response.json();
  return toInventoryItem(data);
}

export async function deleteInventoryItem(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/inventory/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await responseError(response);
  }
}

export async function checkoutInventoryItem(
  id: number,
  purpose: string,
  dueDate: string
): Promise<InventoryItem> {
  const response = await fetch(`${API_URL}/api/inventory/${id}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ purpose, dueDate }),
  });

  if (!response.ok) {
    throw await responseError(response);
  }

  const data: InventoryItemResponse = await response.json();
  return toInventoryItem(data);
}

export async function checkinInventoryItem(id: number): Promise<InventoryItem> {
  const response = await fetch(`${API_URL}/api/inventory/${id}/checkin`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw await responseError(response);
  }

  const data: InventoryItemResponse = await response.json();
  return toInventoryItem(data);
}
