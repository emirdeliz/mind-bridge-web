import { render } from '@test';
import { Title } from './Title';

describe('Title component test', () => {
  it('Have Title', async () => {
    const titleNode = render(<Title />);
    expect(typeof titleNode).toEqual(typeof (<Title />));
  });

  it('Have Title with children', async () => {
    const { getByText } = render(<Title>Hello World</Title>);
    expect(getByText('Hello World')).toBeInTheDocument();
  });

  it('Have Title with custom props', async () => {
    const { getByText } = render(<Title>Custom Title</Title>);
    expect(getByText('Custom Title')).toBeInTheDocument();
  });
});
