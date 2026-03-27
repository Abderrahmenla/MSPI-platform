import { render, screen, fireEvent } from '@testing-library/react';
import OrdersPage from '../page';

jest.mock('@/modules/core/lib/cn', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/modules/core/constants', () => ({
  ADMIN_ROUTES: {
    order: (uuid: string) => `/orders/${uuid}`,
  },
}));

jest.mock('@/modules/orders/constants/order-status.constants', () => ({
  ORDER_STATUS_CLASSES: {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  },
  ORDER_STATUS_LABELS: {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
  },
}));

const mockUseOrders = jest.fn();
jest.mock('@/modules/orders/hooks/use-orders', () => ({
  useOrders: (...args: unknown[]) => mockUseOrders(...args),
}));

const MOCK_ORDERS = [
  {
    uuid: 'order-1',
    ref: 'ORD-0001',
    customer: { name: 'Ali Ben Salem', email: 'ali@example.com' },
    status: 'PENDING',
    totalAmount: 150.5,
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    uuid: 'order-2',
    ref: 'ORD-0002',
    customer: { name: 'Sonia Triki', email: 'sonia@example.com' },
    status: 'DELIVERED',
    totalAmount: 320.0,
    createdAt: '2026-03-15T14:30:00.000Z',
  },
];

describe('OrdersPage', () => {
  beforeEach(() => {
    mockUseOrders.mockReturnValue({
      data: { data: MOCK_ORDERS, meta: { total: 2, page: 1, limit: 20 } },
      isLoading: false,
      isError: false,
    });
  });

  it('renders page heading', () => {
    render(<OrdersPage />);
    expect(
      screen.getByRole('heading', { name: /Commandes/i }),
    ).toBeInTheDocument();
  });

  it('renders search input and status filter', () => {
    render(<OrdersPage />);
    expect(
      screen.getByPlaceholderText(/Rechercher par réf ou client/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /Tous les statuts/i }),
    ).toBeInTheDocument();
  });

  it('renders order rows with ref and customer name', () => {
    render(<OrdersPage />);
    expect(screen.getByText('ORD-0001')).toBeInTheDocument();
    expect(screen.getByText('Ali Ben Salem')).toBeInTheDocument();
    expect(screen.getByText('ORD-0002')).toBeInTheDocument();
    expect(screen.getByText('Sonia Triki')).toBeInTheDocument();
  });

  it('renders status badges', () => {
    render(<OrdersPage />);
    // Status labels appear in both the filter <option> and the badge <span>
    expect(screen.getAllByText('En attente').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Livrée').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Voir links for each order', () => {
    render(<OrdersPage />);
    const links = screen.getAllByRole('link', { name: /Voir/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/orders/order-1');
  });

  it('shows loading skeleton when isLoading is true', () => {
    mockUseOrders.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const { container } = render(<OrdersPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    );
  });

  it('shows error message when isError is true', () => {
    mockUseOrders.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<OrdersPage />);
    expect(
      screen.getByText(/Erreur lors du chargement des commandes/i),
    ).toBeInTheDocument();
  });

  it('shows empty state when no orders', () => {
    mockUseOrders.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20 } },
      isLoading: false,
      isError: false,
    });
    render(<OrdersPage />);
    expect(screen.getByText(/Aucune commande trouvée/i)).toBeInTheDocument();
  });

  it('does not show pagination when total fits one page', () => {
    render(<OrdersPage />);
    expect(screen.queryByRole('button', { name: /Précédent/i })).toBeNull();
  });

  it('shows pagination when total exceeds page limit', () => {
    mockUseOrders.mockReturnValue({
      data: { data: MOCK_ORDERS, meta: { total: 45, page: 1, limit: 20 } },
      isLoading: false,
      isError: false,
    });
    render(<OrdersPage />);
    expect(
      screen.getByRole('button', { name: /Précédent/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Suivant/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('45 commandes au total')).toBeInTheDocument();
  });

  it('updates search input value on change', () => {
    render(<OrdersPage />);
    const input = screen.getByPlaceholderText(/Rechercher par réf ou client/i);
    fireEvent.change(input, { target: { value: 'Ali' } });
    expect((input as HTMLInputElement).value).toBe('Ali');
  });
});
