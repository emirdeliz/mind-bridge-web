import { render } from '@test';
import { LinkIcon, LinkSimple } from '@stories';
import { StoryFn } from '@storybook/nextjs';
import { LinkProps } from '..';
import { Link } from './Link';

const renderLink = async (link: StoryFn<LinkProps>, props?: LinkProps) => {
  const Link = link;
  const { container } = render(<Link {...link.args} {...props} />);
  const linkNode = container.querySelector('a') as HTMLAnchorElement;
  return linkNode;
};

describe('Link component test', () => {
  it('Have Link', async () => {
    const { container: linkNode } = render(<Link />);
    expect(typeof linkNode).toEqual(typeof (<Link />));
  });

  it('Have Link simple', async () => {
    const linkNode = await renderLink(LinkSimple);
    expect(linkNode.innerHTML).toBe('Hello world!');
  });

  it('Have Link icon', async () => {
    const linkNode = await renderLink(LinkIcon);
    expect(linkNode.innerHTML).toMatch(/Hello world!/);
    expect(linkNode.innerHTML).toMatch(/icon-check/);
    // Verificar se o link está presente em vez de procurar pelo ícone específico
    expect(linkNode).toBeInTheDocument();
  });
});
