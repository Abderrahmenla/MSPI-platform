import { render, screen } from '@testing-library/react';
import { OrderSummary } from '../order-summary';
import type { CartItem } from '@/modules/cart/types/cart.types';

jest.mock('@/modules/core/lib/cn', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

const makeItem = (id: number, price: string, qty: number): CartItem => ({
  id,
  qty,
  product: {
    id,
    uuid: `uuid-${id}`,
    sku: `SKU-${id}`,
    slug: `product-${id}`,
    nameAr: 'طفاية حريق',
    nameFr: 'Extincteur ABC',
    nameEn: 'ABC Extinguisher',
    descAr: null,
    descFr: null,
    descEn: null,
    category: null,
    price,
    stock: 10,
    active: true,
    images: [],
  },
});

describe('OrderSummary', () => {
  it('renders the order summary heading in English', () => {
    render(<OrderSummary items={[makeItem(1, '50.00', 1)]} locale="en" />);
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  it('renders the order summary heading in French', () => {
    render(<OrderSummary items={[makeItem(1, '50.00', 1)]} locale="fr" />);
    expect(screen.getByText('Récapitulatif')).toBeInTheDocument();
  });

  it('renders the order summary heading in Arabic', () => {
    render(<OrderSummary items={[makeItem(1, '50.00', 1)]} locale="ar" />);
    expect(screen.getByText('ملخص الطلب')).toBeInTheDocument();
  });

  it('renders product name in English', () => {
    render(<OrderSummary items={[makeItem(1, '50.00', 2)]} locale="en" />);
    expect(screen.getByText('ABC Extinguisher')).toBeInTheDocument();
  });

  it('renders product name in French', () => {
    render(<OrderSummary items={[makeItem(1, '50.00', 1)]} locale="fr" />);
    expect(screen.getByText('Extincteur ABC')).toBeInTheDocument();
  });

  it('renders product name in Arabic', () => {
    render(<OrderSummary items={[makeItem(1, '50.00', 1)]} locale="ar" />);
    expect(screen.getByText('طفاية حريق')).toBeInTheDocument();
  });

  it('renders all cart items', () => {
    const items = [makeItem(1, '20.00', 1), makeItem(2, '30.00', 2)];
    render(<OrderSummary items={items} locale="en" />);
    const names = screen.getAllByText('ABC Extinguisher');
    expect(names).toHaveLength(2);
  });

  it('shows COD badge with English label', () => {
    render(<OrderSummary items={[makeItem(1, '10.00', 1)]} locale="en" />);
    expect(screen.getByText('Cash on Delivery')).toBeInTheDocument();
  });

  it('shows COD badge in French', () => {
    render(<OrderSummary items={[makeItem(1, '10.00', 1)]} locale="fr" />);
    expect(screen.getByText('Paiement à la livraison')).toBeInTheDocument();
  });

  it('shows COD badge in Arabic', () => {
    render(<OrderSummary items={[makeItem(1, '10.00', 1)]} locale="ar" />);
    expect(screen.getByText('الدفع عند الاستلام')).toBeInTheDocument();
  });

  it('shows DT currency label for non-Arabic locales', () => {
    render(<OrderSummary items={[makeItem(1, '25.00', 1)]} locale="en" />);
    const dtLabels = screen.getAllByText('DT');
    expect(dtLabels.length).toBeGreaterThan(0);
  });

  it('shows Arabic currency label for ar locale', () => {
    render(<OrderSummary items={[makeItem(1, '25.00', 1)]} locale="ar" />);
    const labels = screen.getAllByText('د.ت');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('shows Subtotal label in English', () => {
    render(<OrderSummary items={[makeItem(1, '10.00', 1)]} locale="en" />);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
  });

  it('shows Total label', () => {
    render(<OrderSummary items={[makeItem(1, '10.00', 1)]} locale="en" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
