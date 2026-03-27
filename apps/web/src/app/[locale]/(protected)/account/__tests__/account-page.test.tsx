import { render, screen } from '@testing-library/react';
import AccountPage from '../page';

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock('@/modules/core/constants/routes-map.constants', () => ({
  ROUTES_MAP: {
    login: '/fr/login',
    account: {
      orders: '/fr/account/orders',
      quotes: '/fr/account/quotes',
      order: (uuid: string) => `/fr/account/orders/${uuid}`,
      quote: (uuid: string) => `/fr/account/quotes/${uuid}`,
    },
  },
}));

jest.mock('@/modules/core/lib/cn', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

const mockUseOrders = jest.fn();
const mockUseQuotes = jest.fn();

jest.mock('@/modules/orders/hooks/use-orders', () => ({
  useOrders: (...args: unknown[]) => mockUseOrders(...args),
}));

jest.mock('@/modules/quotes/hooks/use-quotes', () => ({
  useQuotes: (...args: unknown[]) => mockUseQuotes(...args),
}));

const mockOrder = {
  uuid: 'order-1',
  ref: 'CMD-2026-001',
  status: 'PENDING' as const,
  totalAmount: 129.9,
  createdAt: '2026-03-01T10:00:00Z',
};

const mockQuote = {
  uuid: 'quote-1',
  ref: 'DEV-2026-001',
  status: 'NEW' as const,
  createdAt: '2026-03-02T10:00:00Z',
};

beforeEach(() => {
  mockUseOrders.mockReturnValue({
    data: { data: [mockOrder], meta: { total: 5 } },
    isLoading: false,
    error: null,
  });
  mockUseQuotes.mockReturnValue({
    data: { data: [mockQuote], meta: { total: 2 } },
    isLoading: false,
    error: null,
  });
});

describe('AccountPage', () => {
  it('renders the page heading', () => {
    render(<AccountPage />);
    expect(
      screen.getByRole('heading', { name: /Mon compte/i }),
    ).toBeInTheDocument();
  });

  it('shows order and quote totals in summary cards', () => {
    render(<AccountPage />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows loading placeholder while orders are loading', () => {
    mockUseOrders.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<AccountPage />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it('shows empty message when there are no orders', () => {
    mockUseOrders.mockReturnValue({
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      error: null,
    });
    render(<AccountPage />);
    expect(
      screen.getByText(/Aucune commande pour le moment/i),
    ).toBeInTheDocument();
  });

  it('renders recent order with ref and status badge', () => {
    render(<AccountPage />);
    expect(screen.getByText('CMD-2026-001')).toBeInTheDocument();
    expect(screen.getByText('En attente')).toBeInTheDocument();
    expect(screen.getByText('129.90 TND')).toBeInTheDocument();
  });

  it('renders recent quote with ref and status badge', () => {
    render(<AccountPage />);
    expect(screen.getByText('DEV-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
  });

  it('renders "Voir tout" links for orders and quotes', () => {
    render(<AccountPage />);
    const links = screen.getAllByText('Voir tout');
    expect(links).toHaveLength(2);
  });

  it('shows empty state when there are no quotes', () => {
    mockUseQuotes.mockReturnValue({
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      error: null,
    });
    render(<AccountPage />);
    expect(screen.getByText(/Aucun devis pour le moment/i)).toBeInTheDocument();
  });
});
