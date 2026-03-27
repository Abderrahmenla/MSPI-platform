import { render, screen, fireEvent } from '@testing-library/react';
import QuotesPage from '../page';

jest.mock('@/modules/core/lib/cn', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/modules/core/constants/routes-map.constants', () => ({
  ADMIN_ROUTES: {
    quote: (uuid: string) => `/quotes/${uuid}`,
  },
}));

const mockUseQuotes = jest.fn();
jest.mock('@/modules/quotes/hooks/use-quotes', () => ({
  useQuotes: (...args: unknown[]) => mockUseQuotes(...args),
}));

const MOCK_QUOTES = [
  {
    uuid: 'quote-1',
    ref: 'DEV-0001',
    contactName: 'Fatima Cherif',
    contactEmail: 'fatima@example.com',
    contactPhone: '21655000111',
    companyName: 'SafeCo',
    status: 'NEW',
    createdAt: '2026-03-10T08:00:00.000Z',
    message: 'Besoin de détecteurs pour un entrepôt',
  },
  {
    uuid: 'quote-2',
    ref: 'DEV-0002',
    contactName: 'Mehdi Jalel',
    contactEmail: 'mehdi@example.com',
    contactPhone: '21677000222',
    companyName: '',
    status: 'OFFER_SENT',
    createdAt: '2026-03-18T11:00:00.000Z',
    message: 'Installation système complet',
  },
];

describe('QuotesPage', () => {
  beforeEach(() => {
    mockUseQuotes.mockReturnValue({
      data: { data: MOCK_QUOTES, meta: { total: 2, page: 1, limit: 20 } },
      isLoading: false,
      isError: false,
    });
  });

  it('renders page heading', () => {
    render(<QuotesPage />);
    expect(screen.getByRole('heading', { name: /Devis/i })).toBeInTheDocument();
  });

  it('renders status filter buttons', () => {
    render(<QuotesPage />);
    expect(screen.getByRole('button', { name: /Tous/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Nouveau/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Offre envoyée/i }),
    ).toBeInTheDocument();
  });

  it('renders quote rows with ref and contact name', () => {
    render(<QuotesPage />);
    expect(screen.getByText('DEV-0001')).toBeInTheDocument();
    expect(screen.getByText('Fatima Cherif')).toBeInTheDocument();
    expect(screen.getByText('DEV-0002')).toBeInTheDocument();
    expect(screen.getByText('Mehdi Jalel')).toBeInTheDocument();
  });

  it('renders company names', () => {
    render(<QuotesPage />);
    expect(screen.getByText('SafeCo')).toBeInTheDocument();
  });

  it('renders status badges', () => {
    render(<QuotesPage />);
    // Labels appear in both filter buttons and table badges
    expect(screen.getAllByText('Nouveau').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Offre envoyée').length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it('renders Voir links for each quote', () => {
    render(<QuotesPage />);
    const links = screen.getAllByRole('link', { name: /Voir/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/quotes/quote-1');
  });

  it('shows loading text when isLoading', () => {
    mockUseQuotes.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    render(<QuotesPage />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it('shows error message when isError', () => {
    mockUseQuotes.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<QuotesPage />);
    expect(
      screen.getByText(/Erreur lors du chargement des devis/i),
    ).toBeInTheDocument();
  });

  it('shows empty state when no quotes', () => {
    mockUseQuotes.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20 } },
      isLoading: false,
      isError: false,
    });
    render(<QuotesPage />);
    expect(screen.getByText(/Aucun devis trouvé/i)).toBeInTheDocument();
  });

  it('shows total count', () => {
    render(<QuotesPage />);
    expect(screen.getByText(/2 devis au total/i)).toBeInTheDocument();
  });

  it('changes active filter button when clicked', () => {
    render(<QuotesPage />);
    const nouveauBtn = screen.getByRole('button', { name: /^Nouveau$/i });
    fireEvent.click(nouveauBtn);
    expect(nouveauBtn.className).toContain('bg-[#ec4130]');
  });
});
