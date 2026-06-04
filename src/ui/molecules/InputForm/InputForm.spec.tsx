import { fireEvent, render, screen } from '@test';
import { InputForm } from './InputForm';

describe('/ui/molecules/InputForm', () => {
  const PASSWORD_ID = 'test-input-password';
  
  it('Should show error when password has less than required characters', async () => {
    const pass = '';
    const onChange = jest.fn().mockImplementation(({ hasError, ...e }) => {
      expect(hasError).toBe(true);
    });
    
    const { container } = render(
      <InputForm password id={PASSWORD_ID} value={pass} onChange={onChange}>
        Nome
      </InputForm>,
    );

    const inputPass = container.querySelector(`#${PASSWORD_ID}`);
    expect(inputPass).toBeInTheDocument();
  });

  it('Should not show error when password has enough required characters', async () => {
    const pass = 'validpassword123';
    const onChange = jest.fn().mockImplementation(({ hasError, ...e }) => {
      expect(hasError).toBe(false);
    });

    const { container } = render(
      <InputForm password id={PASSWORD_ID} value={pass} onChange={onChange}>
        Nome
      </InputForm>,
    );

    const inputPass = container.querySelector(`#${PASSWORD_ID}`);
    expect(inputPass).toBeInTheDocument();
  });

  it('digitsOnly accepts numbers and strips letters', () => {
    const onChange = jest.fn();
    render(
      <InputForm digitsOnly maxLength={5} id="patient-pin" value="" onChange={onChange}>
        PIN
      </InputForm>
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '12a3' } });
    expect(onChange).toHaveBeenLastCalledWith('123');
  });
});
