import { render } from '@test';
import { Icon } from './Icon';

describe('Icon component test', () => {
  it('Have Icon', async () => {
    const { container: iconNode } = render(<Icon />);
    expect(typeof iconNode).toEqual(typeof (<Icon />));
  });

  it('Have Icon bank', async () => {
    const { container: iconNode } = render(<Icon bank />);
    const icon = iconNode.firstChild as HTMLElement;
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('icon-bank');
  });

  it('Have Icon check', async () => {
    const { container: iconNode } = render(<Icon check />);
    const icon = iconNode.firstChild as HTMLElement;
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('icon-check');
  });

  it('Have Icon arrow back', async () => {
    const { container: iconNode } = render(<Icon arrowBack />);
    const icon = iconNode.firstChild as HTMLElement;
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('icon-arrow-back');
  });
});
