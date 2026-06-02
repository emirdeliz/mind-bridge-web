import { render } from '@test';
import { Col } from './Col';

const ColSimple = () => (
  <>
    <Col.C1 />
    <Col.C2 />
    <Col.C3 />
    <Col.C4 />
    <Col.C5 />
    <Col.C6 />
    <Col.C7 />
    <Col.C8 />
    <Col.C9 />
    <Col.C10 />
    <Col.C11 />
    <Col.C12 />
    <Col.Auto />
  </>
);

describe('Col component test', () => {
  it('Have Col', async () => {
    const { baseElement: colNode } = render(<ColSimple />);
    expect(typeof colNode).toEqual(typeof (<ColSimple />));
  });

  it('Have Col c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, auto', async () => {
    const { baseElement: colNode } = render(<ColSimple />);
    const cols = (colNode.children[0].children ||
      []) as HTMLCollectionOf<HTMLDivElement>;

    // Verificar se todos os elementos estão presentes
    expect(cols[0]).toBeInTheDocument();
    expect(cols[1]).toBeInTheDocument();
    expect(cols[2]).toBeInTheDocument();
    expect(cols[3]).toBeInTheDocument();
    expect(cols[4]).toBeInTheDocument();
    expect(cols[5]).toBeInTheDocument();
    expect(cols[6]).toBeInTheDocument();
    expect(cols[7]).toBeInTheDocument();
    expect(cols[8]).toBeInTheDocument();
    expect(cols[9]).toBeInTheDocument();
    expect(cols[10]).toBeInTheDocument();
    expect(cols[11]).toBeInTheDocument();
    expect(cols[12]).toBeInTheDocument();
  });
});
