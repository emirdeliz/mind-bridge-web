import { render } from '@test';
import { DropdownForm } from './DropdownForm';

describe('/ui/organisms/DropdownForm', () => {
  describe('DropdownForm component test', () => {
    it('Have DropdownForm', async () => {
      const { container: dropdownFormNode } = render(
        <DropdownForm options={[]} />
      );
      expect(typeof dropdownFormNode).toEqual(typeof (<DropdownForm options={[]} />));
    });

    it('Have DropdownForm with label', async () => {
      const { getByText } = render(
        <DropdownForm 
          options={[
            { id: 1, label: 'Option 1' },
            { id: 2, label: 'Option 2' }
          ]}
          keyOfLabel="label"
        >
          Categoria
        </DropdownForm>
      );
      
      const label = getByText('Categoria');
      expect(label).toBeInTheDocument();
    });

    it('Have DropdownForm with placeholder', async () => {
      const { getByText } = render(
        <DropdownForm 
          options={[]}
          placeholder="Selecione uma categoria"
        >
          Categoria
        </DropdownForm>
      );
      
      const placeholder = getByText('Selecione uma categoria');
      expect(placeholder).toBeInTheDocument();
    });
  });
});
