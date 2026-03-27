import { render, screen, fireEvent } from '@testing-library/react';
import CustomersPage from '../page';

jest.mock('@/modules/core/constants', () => ({
  ADMIN_ROUTES: {
    customer: (uuid: string) => `/customers/${uuid}`,
  },
}));

const mockUseCustomers = jest.fn();
jest.mock('@/modules/customers/hooks/use-customers', () => ({
  useCustomers: (...args: unknown[]) => mockUseCustomers(...args),
}));

const MOCK_CUSTOMERS = [
  {
    uuid: 'cust-1',
    name: 'Leila Chahed',
    email: 'leila@example.com',
    avatar: null,
    createdAt: '2026-01-10T00:00:00.000Z',
    _count: { orders: 3, quotes: 1 },
  },
  {
    uuid: 'cust-2',
    name: 'Youssef Zayani',
    email: 'youssef@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: '2026-02-20T00:00:00.000Z',
    _count: { orders: 0, quotes: 2 },
  },
];

describe('CustomersPage', () => {
  beforeEach(() => {
    mockUseCustomers.mockReturnValue({
      data: { data: MOCK_CUSTOMERS, meta: { total: 2, page: 1, limit: 20 } },
      isLoading: false,
      isError: false,
    });
  });

  it('renders page heading', () => {
    render(<CustomersPage />);
    expect(
      screen.getByRole('heading', { name: /Clients/i }),
    ).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<CustomersPage />);
    expect(
      screen.getByPlaceholderText(/Rechercher par nom ou email/i),
    ).toBeInTheDocument();
  });

  it('renders customer rows', () => {
    render(<CustomersPage />);
    expect(screen.getByText('Leila Chahed')).toBeInTheDocument();
    expect(screen.getByText('leila@example.com')).toBeInTheDocument();
    expect(screen.getByText('Youssef Zayani')).toBeInTheDocument();
  });

  it('renders avatar initials for customers without avatar', () => {
    render(<CustomersPage />);
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('renders order and quote counts', () => {
    render(<CustomersPage />);
    const threes = screen.getAllByText('3');
    expect(threes.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Voir links for each customer', () => {
    render(<CustomersPage />);
    const links = screen.getAllByRole('link', { name: /Voir/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/customers/cust-1');
  });

  it('shows loading skeleton when isLoading', () => {
    mockUseCustomers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const { container } = render(<CustomersPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    );
  });

  it('shows error message when isError', () => {
    mockUseCustomers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<CustomersPage />);
    expect(
      screen.getByText(/Erreur lors du chargement des clients/i),
    ).toBeInTheDocument();
  });

  it('shows empty state when no customers', () => {
    mockUseCustomers.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20 } },
      isLoading: false,
      isError: false,
    });
    render(<CustomersPage />);
    expect(screen.getByText(/Aucun client trouvé/i)).toBeInTheDocument();
  });

  it('shows pagination when total exceeds page limit', () => {
    mockUseCustomers.mockReturnValue({
      data: {
        data: MOCK_CUSTOMERS,
        meta: { total: 60, page: 1, limit: 20 },
      },
      isLoading: false,
      isError: false,
    });
    render(<CustomersPage />);
    expect(
      screen.getByRole('button', { name: /Suivant/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('60 clients au total')).toBeInTheDocument();
  });

  it('updates search input on change', () => {
    render(<CustomersPage />);
    const input = screen.getByPlaceholderText(/Rechercher par nom ou email/i);
    fireEvent.change(input, { target: { value: 'Leila' } });
    expect((input as HTMLInputElement).value).toBe('Leila');
  });
});
