import { render, screen } from '@testing-library/react';
import { CartSummary } from '../cart-summary';
import type { CartItem } from '../../types/cart.types';

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('@/modules/core/constants', () => ({
  ROUTES_MAP: {
    products: '/products',
    checkout: '/checkout',
  },
}));

const makeItem = (
  productId: number,
  price: string,
  qty: number,
  stock = 10,
): CartItem => ({
  id: productId,
  qty,
  product: {
    id: productId,
    uuid: `uuid-${productId}`,
    sku: `SKU-${productId}`,
    slug: `product-${productId}`,
    nameAr: 'منتج',
    nameFr: 'Produit',
    nameEn: 'Product',
    descAr: null,
    descFr: null,
    descEn: null,
    category: null,
    price,
    stock,
    active: true,
    images: [],
  },
});

describe('CartSummary', () => {
  it('calculates and displays total correctly', () => {
    const items = [makeItem(1, '50.00', 2), makeItem(2, '30.00', 1)];
    render(<CartSummary items={items} locale="en" />);
    // 2×50 + 1×30 = 130
    expect(screen.getByText('130.00')).toBeInTheDocument();
  });

  it('renders checkout link', () => {
    render(<CartSummary items={[makeItem(1, '10.00', 1)]} locale="en" />);
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('renders continue shopping link', () => {
    render(<CartSummary items={[makeItem(1, '10.00', 1)]} locale="fr" />);
    expect(screen.getByText('← Continuer les achats')).toBeInTheDocument();
  });

  it('disables checkout when an item is out of stock', () => {
    const items = [makeItem(1, '10.00', 1, 0)]; // OOS
    render(<CartSummary items={items} locale="en" />);
    const checkoutLink = screen.getByText('Proceed to Checkout').closest('a');
    expect(checkoutLink).toHaveClass('pointer-events-none');
  });

  it('shows COD label in Arabic', () => {
    render(<CartSummary items={[makeItem(1, '10.00', 1)]} locale="ar" />);
    expect(screen.getByText('الدفع عند الاستلام')).toBeInTheDocument();
  });

  it('shows total label in French', () => {
    render(<CartSummary items={[makeItem(1, '25.00', 4)]} locale="fr" />);
    expect(screen.getByText('Total :')).toBeInTheDocument();
  });
});
