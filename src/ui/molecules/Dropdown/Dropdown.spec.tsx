import { render } from '@test';
import { Dropdown } from './Dropdown';

describe('/ui/molecules/Dropdown', () => {
  describe('Dropdown component test', () => {
    it('Have Dropdown', async () => {
      const { container: dropdownNode } = render(<Dropdown options={[]} />);
      expect(typeof dropdownNode).toEqual(typeof (<Dropdown options={[]} />));
    });

    it('Have Dropdown with options', async () => {
      const options = [
        { id: 1, label: 'Option 1' },
        { id: 2, label: 'Option 2' }
      ];
      
      const { getByText } = render(
        <Dropdown 
          options={options} 
          keyOfLabel="label"
          placeholder="Select option"
        />
      );
      
      expect(getByText('Select option')).toBeInTheDocument();
    });

    it('Have Dropdown with selected value', async () => {
      const options = [
        { id: 1, label: 'Option 1' },
        { id: 2, label: 'Option 2' }
      ];
      
      const selectedValue = { id: 1, label: 'Option 1' };
      
      const { getByText } = render(
        <Dropdown 
          options={options} 
          keyOfLabel="label"
          value={selectedValue}
        />
      );
      
      expect(getByText('Option 1')).toBeInTheDocument();
    });
  });
});
