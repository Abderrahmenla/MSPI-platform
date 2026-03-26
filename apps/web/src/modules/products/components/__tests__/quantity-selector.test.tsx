import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuantitySelector } from '../quantity-selector';

describe('QuantitySelector', () => {
  it('renders current value', () => {
    render(<QuantitySelector value={3} max={10} onChange={jest.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange with incremented value on + click', async () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={2} max={10} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onChange with decremented value on − click', async () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={3} max={10} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables − button at min value', () => {
    render(<QuantitySelector value={1} max={10} onChange={jest.fn()} />);
    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
  });

  it('disables + button at max value', () => {
    render(<QuantitySelector value={5} max={5} onChange={jest.fn()} />);
    expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
  });

  it('does not call onChange when + is clicked at max', async () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} max={5} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase quantity'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when − is clicked at min', async () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={1} max={5} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease quantity'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
