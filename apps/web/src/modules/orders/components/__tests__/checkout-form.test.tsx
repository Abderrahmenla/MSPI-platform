import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutForm } from '../checkout-form';

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/modules/core/constants', () => ({
  ROUTES_MAP: { login: '/login' },
}));

jest.mock('@/modules/core/lib/cn', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

// Mutable state so individual tests can override the hook return value
const mockMutate = jest.fn();
let mockHookState = {
  mutate: mockMutate,
  isPending: false,
  isError: false,
  error: null as null | { response?: { status?: number } },
};

jest.mock('@/modules/orders/hooks/use-create-order', () => ({
  useCreateOrder: () => mockHookState,
}));

describe('CheckoutForm', () => {
  const defaultProps = { idempotencyKey: 'test-key-123', locale: 'en' };

  beforeEach(() => {
    mockMutate.mockClear();
    mockHookState = {
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    };
  });

  it('renders phone, address, city, and label fields', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Label (optional)')).toBeInTheDocument();
  });

  it('renders the submit button with correct label in English', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /Place Order/i }),
    ).toBeInTheDocument();
  });

  it('renders labels in French when locale is fr', () => {
    render(<CheckoutForm idempotencyKey="key" locale="fr" />);
    expect(screen.getByText('Téléphone')).toBeInTheDocument();
    expect(screen.getByText('Adresse')).toBeInTheDocument();
    expect(screen.getByText('Ville')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Confirmer la commande/i }),
    ).toBeInTheDocument();
  });

  it('renders labels in Arabic when locale is ar', () => {
    render(<CheckoutForm idempotencyKey="key" locale="ar" />);
    expect(screen.getByText('رقم الهاتف')).toBeInTheDocument();
    expect(screen.getByText('العنوان')).toBeInTheDocument();
    expect(screen.getByText('المدينة')).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    render(<CheckoutForm {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Place Order/i }));
    await waitFor(() => {
      const errors = screen.getAllByText('Required');
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('calls mutate with correct payload on valid submit', async () => {
    render(<CheckoutForm {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 21612345678/i), {
      target: { value: '21623456789' },
    });
    const textInputs = screen
      .getAllByRole('textbox')
      .filter((el) => (el as HTMLInputElement).type === 'text');
    fireEvent.change(textInputs[0], { target: { value: '12 Rue de la Paix' } });
    fireEvent.change(textInputs[1], { target: { value: 'Tunis' } });

    fireEvent.click(screen.getByRole('button', { name: /Place Order/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        idempotencyKey: 'test-key-123',
        phone: '21623456789',
        address: { address: '12 Rue de la Paix', city: 'Tunis' },
      });
    });
  });

  it('disables the submit button while isPending is true', () => {
    mockHookState = { ...mockHookState, isPending: true };
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Place Order/i })).toBeDisabled();
  });

  it('shows generic error message when mutation fails (non-401)', () => {
    mockHookState = {
      ...mockHookState,
      isError: true,
      error: { response: { status: 500 } },
    };
    render(<CheckoutForm {...defaultProps} />);
    expect(
      screen.getByText(/An error occurred\. Please try again\./i),
    ).toBeInTheDocument();
  });
});
