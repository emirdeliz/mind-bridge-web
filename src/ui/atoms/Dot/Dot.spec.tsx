import { render } from '@test';
import { Dot } from './Dot';

describe('Dot component test', () => {
  it('Have Dot', async () => {
    const { baseElement: dotNode } = render(<Dot />);
    expect(typeof dotNode).toEqual(typeof (<Dot />));
  });

  it('Have Dot xss', async () => {
    const { container: dotNode } = render(<Dot.Xss />);
    expect(dotNode.firstChild).toBeInTheDocument();
  });

  it('Have Dot xs', async () => {
    const { container: dotNode } = render(<Dot.Xs />);
    expect(dotNode.firstChild).toBeInTheDocument();
  });

  it('Have Dot Sm', async () => {
    const { container: dotNode } = render(<Dot.Sm />);
    expect(dotNode.firstChild).toBeInTheDocument();
  });

  it('Have Dot Nm', async () => {
    const { container: dotNode } = render(<Dot.Nm />);
    expect(dotNode.firstChild).toBeInTheDocument();
  });

  it('Have Dot outlined', async () => {
    const { container: dotNode } = render(<Dot.Sm outlined p1 />);
    expect(dotNode.firstChild).toBeInTheDocument();
  });
});
