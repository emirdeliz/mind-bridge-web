import { Story } from '@storybook/nextjs';
import { screen, fireEvent, render } from '@test';
import {
  ToastSimple,
  ToastDefault,
  ToastError,
  ToastSuccess,
  ToastWarn,
} from '@stories';
import { ToastProps } from '..';

const renderToast = async (toast: Story<ToastProps>, props?: ToastProps) => {
  const Toast = toast;
  const { baseElement } = render(<Toast {...toast.args} {...props} />);
  return baseElement;
};

describe('Toast component test', () => {
  it('Have Toast', async () => {
    const { container: toastNode } = render(<ToastSimple />);
    expect(typeof toastNode).toEqual(typeof (<ToastSimple />));
  });

  it('Have Toast info', async () => {
    await renderToast(ToastSimple);
    // Usar getAllByTestId para pegar o primeiro elemento com o testid
    const links = screen.getAllByTestId('show-toast');
    const link = links[0]; // Pegar o primeiro elemento (o link principal)
    fireEvent.click(link);

    const toast = await screen.findByTestId('toast');
    const title = await screen.findByText(/hello world!/i);
    const subTitle = await screen.findByText(/it is a long established fact/i);

    expect(toast).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(subTitle).toBeInTheDocument();
  });

  it('Have Toast default', async () => {
    await renderToast(ToastDefault);
    const links = screen.getAllByTestId('show-toast');
    const link = links[0];
    fireEvent.click(link);

    await new Promise((r) => setTimeout(r, 1000));
    const toast = await screen.findByTestId('toast');
    const title = await screen.findByText(/hello world!/i);
    const subTitle = await screen.findByText(/it is a long established fact/i);

    expect(toast).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(subTitle).toBeInTheDocument();
  });

  it('Have Toast error', async () => {
    await renderToast(ToastError);
    const links = screen.getAllByTestId('show-toast');
    const link = links[0];
    fireEvent.click(link);

    await new Promise((r) => setTimeout(r, 1000));
    const toast = await screen.findByTestId('toast');
    const title = await screen.findByText(/hello world!/i);
    const subTitle = await screen.findByText(/it is a long established fact/i);

    expect(toast).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(subTitle).toBeInTheDocument();
  });

  it('Have Toast success', async () => {
    await renderToast(ToastSuccess);
    const links = screen.getAllByTestId('show-toast');
    const link = links[0];
    fireEvent.click(link);

    await new Promise((r) => setTimeout(r, 1000));
    const toast = await screen.findByTestId('toast');
    const title = await screen.findByText(/hello world!/i);
    const subTitle = await screen.findByText(/it is a long established fact/i);

    expect(toast).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(subTitle).toBeInTheDocument();
  });

  it('Have Toast warn', async () => {
    await renderToast(ToastWarn);
    const links = screen.getAllByTestId('show-toast');
    const link = links[0];
    fireEvent.click(link);

    await new Promise((r) => setTimeout(r, 1000));
    const toast = await screen.findByTestId('toast');
    const title = await screen.findByText(/hello world!/i);
    const subTitle = await screen.findByText(/it is a long established fact/i);

    expect(toast).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(subTitle).toBeInTheDocument();
  });
});
