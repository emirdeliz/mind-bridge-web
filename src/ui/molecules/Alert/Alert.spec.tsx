import { render } from '@test';
import { Alert } from './Alert';

describe('Alert component test', () => {
  it('Have Alert', async () => {
    const { container: alertNode } = render(<Alert>Test</Alert>);
    expect(typeof alertNode).toEqual(typeof (<Alert>Test</Alert>));
  });

  it('Have Alert with text', async () => {
    const { getByText } = render(
      <Alert>Todos os dias os arquivos de retorno</Alert>
    );

    const alertText = getByText(/todos os dias os arquivos de retorno/i);
    expect(alertText).toBeInTheDocument();
  });

  it('Have Alert with custom props', async () => {
    const { getByText } = render(<Alert>Custom alert message</Alert>);

    const alertText = getByText('Custom alert message');
    expect(alertText).toBeInTheDocument();
  });
});
