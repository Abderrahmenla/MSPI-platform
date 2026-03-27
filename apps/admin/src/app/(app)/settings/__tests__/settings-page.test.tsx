import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../page';

const mockMutateAsync = jest.fn();
let mockCreateState = { mutateAsync: mockMutateAsync, isPending: false };

const mockToggleMutateAsync = jest.fn();
let mockToggleState = {
  mutateAsync: mockToggleMutateAsync,
  isPending: false,
};

const mockUseStaff = jest.fn();

jest.mock('@/modules/staff/hooks/use-staff', () => ({
  useStaff: () => mockUseStaff(),
}));

jest.mock('@/modules/staff/hooks/use-create-staff', () => ({
  useCreateStaff: () => mockCreateState,
}));

jest.mock('@/modules/staff/hooks/use-toggle-staff', () => ({
  useToggleStaff: () => mockToggleState,
}));

const MOCK_STAFF = [
  {
    id: 1,
    name: 'Admin Principal',
    email: 'admin@mspi.tn',
    role: 'admin' as const,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Support Agent',
    email: 'support@mspi.tn',
    role: 'support' as const,
    isActive: false,
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

describe('SettingsPage', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
    mockToggleMutateAsync.mockClear();
    mockCreateState = { mutateAsync: mockMutateAsync, isPending: false };
    mockToggleState = { mutateAsync: mockToggleMutateAsync, isPending: false };
    mockUseStaff.mockReturnValue({
      data: MOCK_STAFF,
      isLoading: false,
      isError: false,
    });
  });

  it('renders page heading', () => {
    render(<SettingsPage />);
    expect(
      screen.getByRole('heading', { name: /Paramètres/i }),
    ).toBeInTheDocument();
  });

  it('renders staff section heading', () => {
    render(<SettingsPage />);
    expect(screen.getByText(/Équipe/i)).toBeInTheDocument();
  });

  it('renders staff member rows', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Admin Principal')).toBeInTheDocument();
    expect(screen.getByText('admin@mspi.tn')).toBeInTheDocument();
    expect(screen.getByText('Support Agent')).toBeInTheDocument();
  });

  it('renders role badges', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Administrateur')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders active/inactive status badges', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Actif')).toBeInTheDocument();
    expect(screen.getByText('Inactif')).toBeInTheDocument();
  });

  it('renders toggle buttons for each staff member', () => {
    render(<SettingsPage />);
    expect(
      screen.getByRole('button', { name: /Désactiver/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Réactiver/i }),
    ).toBeInTheDocument();
  });

  it('calls toggleStaff when Désactiver is clicked', async () => {
    mockToggleMutateAsync.mockResolvedValue({});
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Désactiver/i }));
    await waitFor(() => {
      expect(mockToggleMutateAsync).toHaveBeenCalledWith({
        id: 1,
        activate: false,
      });
    });
  });

  it('calls toggleStaff when Réactiver is clicked', async () => {
    mockToggleMutateAsync.mockResolvedValue({});
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Réactiver/i }));
    await waitFor(() => {
      expect(mockToggleMutateAsync).toHaveBeenCalledWith({
        id: 2,
        activate: true,
      });
    });
  });

  it('shows "Nouveau membre" button', () => {
    render(<SettingsPage />);
    expect(
      screen.getByRole('button', { name: /Nouveau membre/i }),
    ).toBeInTheDocument();
  });

  it('shows create form when "Nouveau membre" is clicked', () => {
    const { container } = render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Nouveau membre/i }));
    expect(screen.getByText('Créer un membre')).toBeInTheDocument();
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(
      container.querySelector('input[name="password"]'),
    ).toBeInTheDocument();
  });

  it('hides create form when Annuler is clicked', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Nouveau membre/i }));
    expect(screen.getByText('Créer un membre')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(screen.queryByText('Créer un membre')).toBeNull();
  });

  it('calls createStaff.mutateAsync on valid form submit', async () => {
    mockMutateAsync.mockResolvedValue({});
    const { container } = render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Nouveau membre/i }));

    fireEvent.change(container.querySelector('input[name="name"]')!, {
      target: { value: 'Nouveau Manager' },
    });
    fireEvent.change(container.querySelector('input[name="email"]')!, {
      target: { value: 'manager@mspi.tn' },
    });
    fireEvent.change(container.querySelector('input[name="password"]')!, {
      target: { value: 'securepass123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Créer$/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nouveau Manager',
          email: 'manager@mspi.tn',
          password: 'securepass123',
        }),
      );
    });
  });

  it('shows loading skeleton when isLoading', () => {
    mockUseStaff.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const { container } = render(<SettingsPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    );
  });

  it('shows error message when isError', () => {
    mockUseStaff.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<SettingsPage />);
    expect(screen.getByText(/Erreur lors du chargement/i)).toBeInTheDocument();
  });
});
