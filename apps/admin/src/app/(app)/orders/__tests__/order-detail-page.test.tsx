import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderDetailPage from '../[uuid]/page';

jest.mock('next/navigation', () => ({
  useParams: () => ({ uuid: 'order-abc' }),
}));

jest.mock('@/modules/core/lib/cn', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/modules/core/constants', () => ({
  ADMIN_ROUTES: {
    orders: '/orders',
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

const mockMutateAsync = jest.fn();
let mockUpdateState = { mutateAsync: mockMutateAsync, isPending: false };

jest.mock('@/modules/orders/hooks/use-update-order-status', () => ({
  useUpdateOrderStatus: () => mockUpdateState,
}));

const mockUseOrder = jest.fn();
jest.mock('@/modules/orders/hooks/use-order', () => ({
  useOrder: (...args: unknown[]) => mockUseOrder(...args),
}));

const MOCK_ORDER = {
  uuid: 'order-abc',
  ref: 'ORD-0099',
  status: 'CONFIRMED',
  totalAmount: 450.75,
  createdAt: '2026-03-20T09:00:00.000Z',
  customer: { name: 'Karim Mansouri', email: 'karim@example.com' },
  addressSnapshot: {
    name: 'Karim Mansouri',
    phone: '21698765432',
    address: '12 Rue Habib Bourguiba',
    city: 'Tunis',
  },
  items: [
    {
      id: 1,
      product: { name: 'Détecteur incendie XL200' },
      qty: 2,
      unitPrice: 225.375,
      totalPrice: 450.75,
    },
  ],
  trackingNumber: null,
  notes: [],
};

describe('OrderDetailPage', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
    mockUpdateState = { mutateAsync: mockMutateAsync, isPending: false };
    mockUseOrder.mockReturnValue({
      data: MOCK_ORDER,
      isLoading: false,
      isError: false,
    });
  });

  it('renders customer name and email', () => {
    render(<OrderDetailPage />);
    // Name appears in both customer section and addressSnapshot
    expect(screen.getAllByText('Karim Mansouri').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getByText('karim@example.com')).toBeInTheDocument();
  });

  it('renders order ref', () => {
    render(<OrderDetailPage />);
    expect(screen.getByText('ORD-0099')).toBeInTheDocument();
  });

  it('renders current status badge', () => {
    render(<OrderDetailPage />);
    expect(screen.getAllByText('Confirmée').length).toBeGreaterThanOrEqual(1);
  });

  it('renders order items', () => {
    render(<OrderDetailPage />);
    expect(screen.getByText('Détecteur incendie XL200')).toBeInTheDocument();
  });

  it('renders status update form with select and submit button', () => {
    render(<OrderDetailPage />);
    expect(screen.getByText(/Mettre à jour le statut/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Mettre à jour/i }),
    ).toBeInTheDocument();
  });

  it('disables submit button when no status selected', () => {
    render(<OrderDetailPage />);
    expect(
      screen.getByRole('button', { name: /Mettre à jour/i }),
    ).toBeDisabled();
  });

  it('enables submit button when status is selected', () => {
    render(<OrderDetailPage />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'SHIPPED' } });
    expect(
      screen.getByRole('button', { name: /Mettre à jour/i }),
    ).not.toBeDisabled();
  });

  it('calls mutateAsync on form submit', async () => {
    mockMutateAsync.mockResolvedValue({});
    render(<OrderDetailPage />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'SHIPPED' } });
    fireEvent.click(screen.getByRole('button', { name: /Mettre à jour/i }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'order-abc', status: 'SHIPPED' }),
      );
    });
  });

  it('shows success message after update', async () => {
    mockMutateAsync.mockResolvedValue({});
    render(<OrderDetailPage />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'DELIVERED' } });
    fireEvent.click(screen.getByRole('button', { name: /Mettre à jour/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Statut mis à jour avec succès/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error message when update fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'));
    render(<OrderDetailPage />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'CANCELLED' } });
    fireEvent.click(screen.getByRole('button', { name: /Mettre à jour/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Erreur lors de la mise à jour/i),
      ).toBeInTheDocument();
    });
  });

  it('shows loading skeleton when isLoading', () => {
    mockUseOrder.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const { container } = render(<OrderDetailPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    );
  });

  it('shows error state with back link when isError', () => {
    mockUseOrder.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<OrderDetailPage />);
    expect(screen.getByText(/Commande introuvable/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Retour/i })).toHaveAttribute(
      'href',
      '/orders',
    );
  });

  it('renders back link to orders list', () => {
    render(<OrderDetailPage />);
    const backLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href') === '/orders');
    expect(backLinks.length).toBeGreaterThanOrEqual(1);
  });
});
