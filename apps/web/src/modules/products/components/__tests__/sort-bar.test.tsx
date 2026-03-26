import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortBar } from '../sort-bar';

describe('SortBar', () => {
  it('renders sort label and current value in Arabic', () => {
    render(<SortBar value="default" onChange={jest.fn()} locale="ar" />);
    expect(screen.getByText('ترتيب حسب:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('الافتراضي')).toBeInTheDocument();
  });

  it('renders sort label in French', () => {
    render(<SortBar value="default" onChange={jest.fn()} locale="fr" />);
    expect(screen.getByText('Trier par :')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Par défaut')).toBeInTheDocument();
  });

  it('renders all 3 sort options', () => {
    render(<SortBar value="default" onChange={jest.fn()} locale="en" />);
    const select = screen.getByRole('combobox');
    const options = Array.from((select as HTMLSelectElement).options).map(
      (o) => o.value,
    );
    expect(options).toEqual(['default', 'price_asc', 'price_desc']);
  });

  it('calls onChange when user selects a different option', async () => {
    const onChange = jest.fn();
    render(<SortBar value="default" onChange={onChange} locale="en" />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'price_asc');
    expect(onChange).toHaveBeenCalledWith('price_asc');
  });

  it('reflects the currently selected value', () => {
    render(<SortBar value="price_desc" onChange={jest.fn()} locale="en" />);
    expect(screen.getByDisplayValue('Price: High to Low')).toBeInTheDocument();
  });
});
