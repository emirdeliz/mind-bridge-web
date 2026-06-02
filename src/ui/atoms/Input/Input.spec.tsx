import { fireEvent, render, screen } from '@test';
import {
  InputCnpj,
  InputCpf,
  InputNumber,
  InputPhone,
  InputDate,
  InputText,
  InputTextArea,
} from '@stories';
import { StoryFn } from '@storybook/nextjs';
import { InputProps } from '..';
import { Input } from './Input';

const renderInput = async (input: StoryFn<InputProps>, props?: InputProps) => {
  const Input = input;
  const { container } = render(<Input {...input.args} {...props} />);
  const inputNode = (await screen.findByRole(
    'textbox',
    container
  )) as HTMLInputElement;
  return inputNode;
};

describe('Input component test', () => {
  it('Have Input', async () => {
    const { container: inputNode } = render(<Input />);
    expect(typeof inputNode).toEqual(typeof (<Input />));
  });

  it('Have Input cnpj', async () => {
    const inputNode = await renderInput(InputCnpj);
    fireEvent.change(inputNode, { target: { value: 'ABC83432203000184' } });
    expect(inputNode.value).toBe('83.432.203/0001-84');
  });

  it('Have Input cpf', async () => {
    const inputNode = await renderInput(InputCpf);
    fireEvent.change(inputNode, { target: { value: 'ABC34475807042' } });
    expect(inputNode.value).toBe('344.758.070-42');
  });

  it('Have Input number', async () => {
    const inputNode = await renderInput(InputNumber);
    fireEvent.change(inputNode, { target: { value: 'ABC123' } });
    expect(inputNode.value).toBe('123');
  });

  it('Have Input date', async () => {
    const inputNode = await renderInput(InputDate);
    fireEvent.change(inputNode, { target: { value: '21082022' } });
    expect(inputNode.value).toBe('21/08/2022');
  });

  it('Have Input phone', async () => {
    const inputNode = await renderInput(InputPhone);
    fireEvent.change(inputNode, { target: { value: 'ABC47999234455' } });
    expect(inputNode.value).toBe('(47) 99923-4455');
  });

  it('Have Input text', async () => {
    const inputNode = await renderInput(InputText);
    fireEvent.change(inputNode, { target: { value: 'ABC123' } });
    expect(inputNode.value).toBe('ABC123');
  });

  it('Have Input textarea', async () => {
    const inputNode = await renderInput(InputTextArea);
    fireEvent.change(inputNode, { target: { value: 'ABC123' } });
    expect(inputNode.value).toBe('ABC123');
  });

  it('Have Input number with max length 5', async () => {
    const inputNode = await renderInput(InputNumber, { maxLength: 5 });
    expect(inputNode.maxLength).toBe(5);
  });

  it('Have Input text with max length 10', async () => {
    const inputNode = await renderInput(InputText, { maxLength: 10 });
    expect(inputNode.maxLength).toBe(10);
  });

  it('Have Input textarea with max length 12', async () => {
    const inputNode = await renderInput(InputTextArea, { maxLength: 12 });
    expect(inputNode.maxLength).toBe(12);
  });
});
