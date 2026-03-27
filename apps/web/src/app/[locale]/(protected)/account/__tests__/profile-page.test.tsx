import { render, screen } from '@testing-library/react';
import ProfilePage from '../profile/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/modules/core/constants/routes-map.constants', () => ({
  ROUTES_MAP: { login: '/fr/login' },
}));

const mockUseProfile = jest.fn();

jest.mock('@/modules/users/hooks/use-profile', () => ({
  useProfile: () => mockUseProfile(),
}));

const mockProfile = {
  name: 'Mohamed Ben Ali',
  email: 'mohamed@example.com',
  avatar: null,
};

beforeEach(() => {
  mockUseProfile.mockReturnValue({
    data: { data: mockProfile },
    isLoading: false,
    error: null,
  });
});

describe('ProfilePage', () => {
  it('renders the page heading', () => {
    render(<ProfilePage />);
    expect(
      screen.getByRole('heading', { name: /Mon profil/i }),
    ).toBeInTheDocument();
  });

  it('shows initials avatar when no avatar image', () => {
    render(<ProfilePage />);
    expect(screen.getByText('MB')).toBeInTheDocument();
  });

  it('shows avatar image when profile has one', () => {
    mockUseProfile.mockReturnValue({
      data: {
        data: { ...mockProfile, avatar: 'https://example.com/avatar.jpg' },
      },
      isLoading: false,
      error: null,
    });
    render(<ProfilePage />);
    const img = screen.getByRole('img', { name: /Mohamed Ben Ali/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders the user name', () => {
    render(<ProfilePage />);
    const names = screen.getAllByText('Mohamed Ben Ali');
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  it('renders email when present', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('mohamed@example.com')).toBeInTheDocument();
  });

  it('does not render email row when email is absent', () => {
    mockUseProfile.mockReturnValue({
      data: { data: { ...mockProfile, email: null } },
      isLoading: false,
      error: null,
    });
    render(<ProfilePage />);
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('shows Facebook account badge', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Compte Facebook')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<ProfilePage />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it('renders nothing when profile data is missing', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    const { container } = render(<ProfilePage />);
    expect(container).toBeEmptyDOMElement();
  });
});
