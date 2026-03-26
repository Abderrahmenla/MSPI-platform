import { render, screen } from '@testing-library/react';
import { TrustBadges } from '../trust-badges';

describe('TrustBadges', () => {
  it('renders 4 badges in Arabic', () => {
    render(<TrustBadges locale="ar" />);
    expect(screen.getByText('الدفع عند الاستلام')).toBeInTheDocument();
    expect(screen.getByText('توصيل لكامل تونس')).toBeInTheDocument();
    expect(screen.getByText('منتجات معتمدة')).toBeInTheDocument();
    expect(screen.getByText('دعم واتساب مباشر')).toBeInTheDocument();
  });

  it('renders 4 badges in French', () => {
    render(<TrustBadges locale="fr" />);
    expect(screen.getByText('Paiement à la livraison')).toBeInTheDocument();
    expect(
      screen.getByText('Livraison dans toute la Tunisie'),
    ).toBeInTheDocument();
    expect(screen.getByText('Produits certifiés')).toBeInTheDocument();
    expect(screen.getByText('Support WhatsApp direct')).toBeInTheDocument();
  });

  it('renders 4 badges in English', () => {
    render(<TrustBadges locale="en" />);
    expect(screen.getByText('Cash on Delivery')).toBeInTheDocument();
    expect(screen.getByText('Tunisia-wide Delivery')).toBeInTheDocument();
    expect(screen.getByText('Certified Products')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp Support')).toBeInTheDocument();
  });

  it('accepts an extra className', () => {
    const { container } = render(
      <TrustBadges locale="en" className="extra-class" />,
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
