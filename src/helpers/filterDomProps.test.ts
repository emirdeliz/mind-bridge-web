import { filterDOMProps, filterInputDomProps } from './filterDomProps';

describe('filterInputDomProps', () => {
  it('removes custom boolean flags before spreading on input', () => {
    const dom = filterInputDomProps({
      phone: true,
      password: true,
      required: true,
      placeholder: 'Nome',
      id: 'name',
    });

    expect(dom).toEqual({
      required: true,
      placeholder: 'Nome',
      id: 'name',
    });
    expect(dom).not.toHaveProperty('phone');
    expect(dom).not.toHaveProperty('password');
  });

  it('removes FormGroup props such as helpText', () => {
    const dom = filterInputDomProps({
      helpText: 'Informe o DDD',
      id: 'phone',
      value: '',
    });

    expect(dom).toEqual({ id: 'phone', value: '' });
  });
});

describe('filterDOMProps', () => {
  it('removes field props leaked through FormGroup rest spread', () => {
    const dom = filterDOMProps({
      phone: true,
      helpText: 'DDD',
      className: 'extra',
    });

    expect(dom).toEqual({ className: 'extra' });
  });
});
