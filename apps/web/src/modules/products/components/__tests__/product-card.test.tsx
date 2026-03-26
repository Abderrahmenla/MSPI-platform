import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../product-card';
import type { Product } from '../../types/product.types';

// Mock navigation Link
jest.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/modules/core/constants', () => ({
  ROUTES_MAP: {
    product: (slug: string) => `/products/${slug}`,
  },
}));

const mockMutate = jest.fn();
jest.mock('@/modules/cart/hooks/use-add-to-cart', () => ({
  useAddToCart: () => ({ mutate: mockMutate, isPending: false }),
}));

const baseProduct: Product = {
  id: 1,
  uuid: 'uuid-1',
  sku: 'EXT-ABC',
  slug: 'extincteur-abc',
  nameAr: 'طفاية حريق',
  nameFr: 'Extincteur ABC',
  nameEn: 'ABC Extinguisher',
  descAr: null,
  descFr: null,
  descEn: null,
  category: 'extincteurs',
  price: '49.99',
  stock: 10,
  active: true,
  images: [],
};

describe('ProductCard', () => {
  beforeEach(() => mockMutate.mockClear());

  it('renders product name in Arabic', () => {
    render(<ProductCard product={baseProduct} locale="ar" />);
    expect(screen.getByText('طفاية حريق')).toBeInTheDocument();
  });

  it('renders product name in French', () => {
    render(<ProductCard product={baseProduct} locale="fr" />);
    expect(screen.getByText('Extincteur ABC')).toBeInTheDocument();
  });

  it('shows in-stock badge when stock > 5', () => {
    render(<ProductCard product={baseProduct} locale="en" />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('shows low-stock badge when stock 1–5', () => {
    render(<ProductCard product={{ ...baseProduct, stock: 3 }} locale="en" />);
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('shows out-of-stock badge when stock = 0', () => {
    render(<ProductCard product={{ ...baseProduct, stock: 0 }} locale="en" />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('disables add-to-cart button when out of stock', () => {
    render(<ProductCard product={{ ...baseProduct, stock: 0 }} locale="en" />);
    expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeDisabled();
  });

  it('calls addToCart with product id and qty 1 on button click', () => {
    render(<ProductCard product={baseProduct} locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    expect(mockMutate).toHaveBeenCalledWith({ productId: 1, qty: 1 });
  });

  it('links to the product detail page', () => {
    render(<ProductCard product={baseProduct} locale="en" />);
    const links = screen.getAllByRole('link');
    expect(
      links.some((l) => l.getAttribute('href') === '/products/extincteur-abc'),
    ).toBe(true);
  });

  it('shows placeholder SVG when no images', () => {
    const { container } = render(
      <ProductCard product={baseProduct} locale="en" />,
    );
    // No <img> tag when images are empty
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('shows thumbnail when images are present', () => {
    const withImage = {
      ...baseProduct,
      images: [{ id: 1, url: '/uploads/test.jpg', position: 0 }],
    };
    const { container } = render(
      <ProductCard product={withImage} locale="en" />,
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/uploads/test.jpg');
  });
});
