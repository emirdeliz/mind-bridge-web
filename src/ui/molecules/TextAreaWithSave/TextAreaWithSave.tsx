import { Button, Icon, Input, type InputProps } from '@atoms';

export interface TextAreaWithSaveProps extends InputProps {
  onSave?: () => void;
  saveLabel?: string;
}

export const TextAreaWithSave = ({
  onSave,
  saveLabel,
  ...textareaProps
}: TextAreaWithSaveProps) => {
  const shellClass = onSave
    ? 'mb-field-with-action mb-field-with-action--has-save'
    : 'w-full';

  return (
    <div className={shellClass}>
      <Input.TextArea {...textareaProps} />
      {onSave ? (
        <div className='mb-field-with-action-save'>
          <Button
            type='button'
            xs
            sm
            circle
            variant='secondary'
            outlined
            title={saveLabel}
            onClick={onSave}
          >
            <Icon.Floppy sm />
          </Button>
        </div>
      ) : null}
    </div>
  );
};
