import { fireEvent } from '@testing-library/react';
import { render } from '@test';
import { Button } from './Button';

describe('Button component test', () => {
  it('Have button', async () => {
    const { container: buttonNode } = render(<Button />);
    expect(typeof buttonNode.firstChild).toEqual(typeof (<button />));
  });

  it('Have button info variant', async () => {
    const { container: buttonNode } = render(<Button variant="info" />);
    const button = buttonNode.firstChild as HTMLElement;
    expect(button).toBeInTheDocument();
    // Verificar se o botão tem as classes do variant info
    expect(button.className).toContain('bg-cyan-600');
    expect(button.className).toContain('text-white');
  });

  it('Have button not clickable', async () => {
    const { container: buttonNode } = render(<Button clickable={false} />);
    const button = buttonNode.firstChild as HTMLElement;
    expect(button).toBeInTheDocument();
    // Verificar se o botão tem as classes de disabled
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('cursor-not-allowed');
    expect(button).toHaveAttribute('disabled');
  });

  it('Have button sm', async () => {
    const { container: buttonNode } = render(<Button sm />);
    const button = buttonNode.firstChild as HTMLElement;
    expect(button).toBeInTheDocument();
    // Verificar se o botão tem as classes de tamanho sm
    expect(button.className).toContain('px-3');
    expect(button.className).toContain('py-1.5');
    expect(button.className).toContain('text-sm');
  });

  it('Have button click', async () => {
    const click = jest.fn();
    const { container: buttonNode } = render(<Button onClick={click} />);
    fireEvent.click(buttonNode.firstChild as Element);
    fireEvent.click(buttonNode.firstChild as Element);
    fireEvent.click(buttonNode.firstChild as Element);
    expect(click.mock.calls.length).toEqual(3);
  });
});
