import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuoteForm } from '../quote-form';

jest.mock('@/modules/core/lib/cn', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

// Mutable state so individual tests can override the hook return value
const mockMutate = jest.fn();
let mockHookState = {
  mutate: mockMutate,
  isPending: false,
  isError: false,
};

jest.mock('@/modules/quotes/hooks', () => ({
  useCreateQuote: () => mockHookState,
}));

// Placeholder for the message textarea (no associated label id in the component)
const MESSAGE_PLACEHOLDER =
  /Installation de détecteurs incendie pour un entrepôt de 500 m²/i;

describe('QuoteForm', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockHookState = { mutate: mockMutate, isPending: false, isError: false };
  });

  it('renders all required and optional fields', () => {
    render(<QuoteForm />);
    expect(screen.getByText('Nom complet')).toBeInTheDocument();
    expect(screen.getByText('Téléphone')).toBeInTheDocument();
    expect(screen.getByText('Entreprise')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Décrivez votre besoin')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<QuoteForm />);
    expect(
      screen.getByRole('button', { name: /Envoyer ma demande/i }),
    ).toBeInTheDocument();
  });

  it('shows required field errors when submitting empty form', async () => {
    render(<QuoteForm />);
    fireEvent.click(
      screen.getByRole('button', { name: /Envoyer ma demande/i }),
    );
    await waitFor(() => {
      const errors = screen.getAllByText('Champ obligatoire');
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('shows minLength validation error when message is too short', async () => {
    render(<QuoteForm />);

    fireEvent.change(screen.getByPlaceholderText(/Ex : Mohamed Ben Ali/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex : 21612345678/i), {
      target: { value: '21699999999' },
    });
    fireEvent.change(screen.getByPlaceholderText(MESSAGE_PLACEHOLDER), {
      target: { value: 'Trop court' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Envoyer ma demande/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Minimum 20 caractères')).toBeInTheDocument();
    });
  });

  it('shows invalid email error when email format is wrong', async () => {
    render(<QuoteForm />);

    fireEvent.change(screen.getByPlaceholderText(/Ex : Mohamed Ben Ali/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex : 21612345678/i), {
      target: { value: '21699999999' },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/Ex : contact@entreprise\.com/i),
      { target: { value: 'not-an-email' } },
    );
    fireEvent.change(screen.getByPlaceholderText(MESSAGE_PLACEHOLDER), {
      target: {
        value: 'Installation de détecteurs incendie pour un entrepôt',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Envoyer ma demande/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Adresse email invalide')).toBeInTheDocument();
    });
  });

  it('calls mutate with correct DTO on valid submit', async () => {
    mockMutate.mockImplementation(
      (_dto: unknown, opts: { onSuccess?: () => void }) => opts?.onSuccess?.(),
    );
    render(<QuoteForm />);

    fireEvent.change(screen.getByPlaceholderText(/Ex : Mohamed Ben Ali/i), {
      target: { value: 'Mohamed Ben Ali' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex : 21612345678/i), {
      target: { value: '21612345678' },
    });
    fireEvent.change(screen.getByPlaceholderText(MESSAGE_PLACEHOLDER), {
      target: {
        value: 'Installation de détecteurs incendie pour un entrepôt de 500 m²',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Envoyer ma demande/i }),
    );

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          contactName: 'Mohamed Ben Ali',
          contactPhone: '21612345678',
          message:
            'Installation de détecteurs incendie pour un entrepôt de 500 m²',
        }),
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  it('shows success banner after successful submit', async () => {
    mockMutate.mockImplementation(
      (_dto: unknown, opts: { onSuccess?: () => void }) => opts?.onSuccess?.(),
    );
    render(<QuoteForm />);

    fireEvent.change(screen.getByPlaceholderText(/Ex : Mohamed Ben Ali/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex : 21612345678/i), {
      target: { value: '21699887766' },
    });
    fireEvent.change(screen.getByPlaceholderText(MESSAGE_PLACEHOLDER), {
      target: {
        value: 'Besoin détaillé pour une installation complète de sécurité',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Envoyer ma demande/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('Votre demande a été envoyée !'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Notre équipe vous contactera sous 24h.'),
      ).toBeInTheDocument();
    });
  });

  it('resets form and allows new submission after success', async () => {
    mockMutate.mockImplementation(
      (_dto: unknown, opts: { onSuccess?: () => void }) => opts?.onSuccess?.(),
    );
    render(<QuoteForm />);

    fireEvent.change(screen.getByPlaceholderText(/Ex : Mohamed Ben Ali/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex : 21612345678/i), {
      target: { value: '21699887766' },
    });
    fireEvent.change(screen.getByPlaceholderText(MESSAGE_PLACEHOLDER), {
      target: {
        value: 'Description suffisamment longue pour passer la validation',
      },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Envoyer ma demande/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Soumettre une nouvelle demande/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Envoyer ma demande/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows generic error banner when mutation fails', () => {
    mockHookState = { ...mockHookState, isError: true };
    render(<QuoteForm />);
    expect(screen.getByText(/Une erreur s'est produite/i)).toBeInTheDocument();
  });

  it('disables all inputs and button while isPending', () => {
    mockHookState = { ...mockHookState, isPending: true };
    render(<QuoteForm />);
    expect(
      screen.getByRole('button', { name: /Envoi en cours/i }),
    ).toBeDisabled();
    screen.getAllByRole('textbox').forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
