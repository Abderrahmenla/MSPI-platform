const GUEST_CART_KEY = 'mspi_guest_cart';

export interface GuestCartItem {
  productId: number;
  qty: number;
}

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GuestCartItem[];
  } catch {
    return [];
  }
}

export function setGuestCart(items: GuestCartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function addGuestCartItem(productId: number, qty: number): void {
  const items = getGuestCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    setGuestCart(
      items.map((i) =>
        i.productId === productId ? { ...i, qty: i.qty + qty } : i,
      ),
    );
  } else {
    setGuestCart([...items, { productId, qty }]);
  }
}

export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}
