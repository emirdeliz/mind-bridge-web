import { isValidPatientInitialPassword } from './index';
import { filterDOMProps, filterInputDomProps } from './filterDomProps';

describe('isValidPatientInitialPassword', () => {
  it('accepts 5 alphanumeric characters', () => {
    expect(isValidPatientInitialPassword('a1B2c')).toBe(true);
    expect(isValidPatientInitialPassword('12345')).toBe(true);
  });

  it('rejects non-alphanumeric or wrong length', () => {
    expect(isValidPatientInitialPassword('12@45')).toBe(false);
    expect(isValidPatientInitialPassword('1234')).toBe(false);
    expect(isValidPatientInitialPassword('123456')).toBe(false);
  });
});

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

  it('removes digitsOnly flag', () => {
    const dom = filterInputDomProps({ digitsOnly: true, id: 'pin' });
    expect(dom).toEqual({ id: 'pin' });
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
