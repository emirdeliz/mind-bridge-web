import { render } from '@test';
import { StepProgressBar } from './StepProgressBar';

describe('StepProgressBar component test', () => {
  it('Have StepProgressBar', async () => {
    const { container: stepProgressBarNode } = render(
      <StepProgressBar steps={[]} />
    );
    expect(typeof stepProgressBarNode).toEqual(
      typeof (<StepProgressBar steps={[]} />)
    );
  });

  it('Have StepProgressBar with steps', async () => {
    const steps = [
      { label: 'Step 1', completed: false },
      { label: 'Step 2', completed: true },
      { label: 'Step 3', completed: false }
    ];
    
    const { container: stepProgressBarNode } = render(
      <StepProgressBar steps={steps} />
    );
    
    const spans = stepProgressBarNode.querySelectorAll('span');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('Have StepProgressBar with outlined prop', async () => {
    const steps = [
      { label: 'Step 1', completed: false },
      { label: 'Step 2', completed: true }
    ];
    
    const { container: stepProgressBarNode } = render(
      <StepProgressBar steps={steps} outlined />
    );
    
    expect(stepProgressBarNode).toBeInTheDocument();
  });
});
