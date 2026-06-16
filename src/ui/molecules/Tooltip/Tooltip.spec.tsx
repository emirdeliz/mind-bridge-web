import { fireEvent, render } from '@test';
import { Tooltip } from './Tooltip';

describe('Tooltip component test', () => {
  it('Have Tooltip', async () => {
    const { container: tooltipNode } = render(
      <Tooltip title='Tooltip message example!' />
    );
    expect(typeof tooltipNode).toEqual(
      typeof (<Tooltip title='Hello world!' />)
    );
  });

  it('Have Tooltip with title', async () => {
    const { getByText } = render(
      <Tooltip title='Hello world!'>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = getByText('Hover me');
    expect(button).toBeInTheDocument();
  });

  it('Have Tooltip with different positions', async () => {
    const { getByText } = render(
      <div>
        <Tooltip title='Top tooltip' position='top'>
          <button>Top</button>
        </Tooltip>
        <Tooltip title='Bottom tooltip' position='bottom'>
          <button>Bottom</button>
        </Tooltip>
        <Tooltip title='Left tooltip' position='left'>
          <button>Left</button>
        </Tooltip>
        <Tooltip title='Right tooltip' position='right'>
          <button>Right</button>
        </Tooltip>
      </div>
    );

    expect(getByText('Top')).toBeInTheDocument();
    expect(getByText('Bottom')).toBeInTheDocument();
    expect(getByText('Left')).toBeInTheDocument();
    expect(getByText('Right')).toBeInTheDocument();
  });
});
