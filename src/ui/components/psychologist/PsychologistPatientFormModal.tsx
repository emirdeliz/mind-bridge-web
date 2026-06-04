'use client';

import type { FormEvent, MouseEvent } from 'react';
import { useCallback, useState } from 'react';

import type { PsychologistPatientSaveOrUpdateDto } from '@api';
import { Button, Flex, Icon, Input, Overlay, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, FormGroup, InputForm } from '@molecules';

type PsychologistPatientFormModalProps = {
  visible: boolean;
  form: PsychologistPatientSaveOrUpdateDto;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (patch: Partial<PsychologistPatientSaveOrUpdateDto>) => void;
  onRegeneratePassword?: () => void;
};

export const PsychologistPatientFormModal = ({
  visible,
  form,
  saving,
  onClose,
  onConfirm,
  onChange,
  onRegeneratePassword,
}: PsychologistPatientFormModalProps) => {
  const { t } = useI18n();
  const isEdit = Boolean(form.id);
  const showCreateAccount = !isEdit;
  const showEditPasswordReset = isEdit;
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!saving) {
      onConfirm();
    }
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const copyGeneratedPassword = useCallback(async () => {
    const password = form.password ?? '';
    if (!password || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(password);
      setPasswordCopied(true);
      window.setTimeout(() => setPasswordCopied(false), 2000);
    } catch {
      setPasswordCopied(false);
    }
  }, [form.password]);

  return (
    <Overlay visible={visible} zIndex={40} onClick={onClose}>
      <div
        className="w-full max-w-lg"
        onClick={stopPropagation}
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-form-modal-title"
      >
        <Card padding="lg" shadow="xl">
          <Flex col wFull gap5>
            <Flex row wFull alignCenter justifySpaceBetween gap4>
              <Flex row alignCenter gap4 flex1>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-mb-accent/30 bg-mb-accent/15 shadow-glow"
                  aria-hidden
                >
                  <Icon.User lg white />
                </div>
                <div className="min-w-0 flex-1">
                  <Flex col wFull gap1>
                    <span id="patient-form-modal-title" className="sr-only">
                      {isEdit
                        ? t('PSYCHOLOGIST_PATIENTS_MODAL_TITLE_EDIT')
                        : t('PSYCHOLOGIST_PATIENTS_MODAL_TITLE_ADD')}
                    </span>
                    <Title fs3 fw3 block noWrap ellipsis>
                      {isEdit
                        ? t('PSYCHOLOGIST_PATIENTS_MODAL_TITLE_EDIT')
                        : t('PSYCHOLOGIST_PATIENTS_MODAL_TITLE_ADD')}
                    </Title>
                    <Title s2 gray block leadingRelaxed>
                      {isEdit
                        ? t('PSYCHOLOGIST_PATIENTS_MODAL_SUBTITLE_EDIT')
                        : t('PSYCHOLOGIST_PATIENTS_MODAL_SUBTITLE_ADD')}
                    </Title>
                  </Flex>
                </div>
              </Flex>
              <Button
                type="button"
                variant="secondary"
                outlined
                circle
                title={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                onClick={onClose}
              >
                <Icon.Close sm />
              </Button>
            </Flex>

            <div className="h-px w-full bg-mb-border/70" aria-hidden />

            <form className="w-full" onSubmit={handleSubmit}>
              <Flex col wFull gap1 alignStretch>
                <InputForm
                  required
                  value={form.fullName}
                  placeholder={t('PSYCHOLOGIST_PATIENTS_COL_NAME')}
                  onChange={(value) => onChange({ fullName: String(value) })}
                >
                  {t('PSYCHOLOGIST_PATIENTS_COL_NAME')}
                </InputForm>

                <InputForm
                  required
                  phone
                  value={form.phone ?? ''}
                  placeholder={t('PSYCHOLOGIST_PATIENTS_COL_PHONE')}
                  helpText={t('PSYCHOLOGIST_PATIENTS_MODAL_PHONE_HELP')}
                  onChange={(value) => onChange({ phone: String(value) })}
                >
                  {t('PSYCHOLOGIST_PATIENTS_COL_PHONE')}
                </InputForm>

                {showCreateAccount ? (
                  <>
                    <div className="my-2 h-px w-full bg-mb-border/50" aria-hidden />
                    <Title s2 textAccent mb2 block>
                      {t('PSYCHOLOGIST_PATIENTS_MODAL_ACCOUNT_SECTION')}
                    </Title>
                    <InputForm
                      required
                      value={form.email ?? ''}
                      placeholder={t('EMAIL')}
                      onChange={(value) => onChange({ email: String(value) })}
                    >
                      {t('EMAIL')}
                    </InputForm>
                    <FormGroup
                      label={t('PSYCHOLOGIST_PATIENTS_MODAL_GENERATED_PASSWORD')}
                      helpText={t(
                        'PSYCHOLOGIST_PATIENTS_MODAL_GENERATED_PASSWORD_HELP'
                      )}
                      required
                    >
                      <Flex row wFull alignCenter gap3>
                        <div className="min-w-0 flex-1">
                          <Input
                            readOnly
                            value={form.password ?? ''}
                            placeholder={t('PASSWORD')}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          outlined
                          circle
                          title={t('PSYCHOLOGIST_PATIENTS_COPY_PASSWORD')}
                          onClick={() => void copyGeneratedPassword()}
                        >
                          <Icon.Docs sm />
                        </Button>
                        {onRegeneratePassword ? (
                          <Button
                            type="button"
                            variant="secondary"
                            outlined
                            circle
                            title={t(
                              'PSYCHOLOGIST_PATIENTS_REGENERATE_PASSWORD'
                            )}
                            onClick={onRegeneratePassword}
                          >
                            <Icon.Cog sm />
                          </Button>
                        ) : null}
                      </Flex>
                      {passwordCopied ? (
                        <Title s2 textAccent mt2 block>
                          {t('PSYCHOLOGIST_PATIENTS_PASSWORD_COPIED')}
                        </Title>
                      ) : null}
                    </FormGroup>
                  </>
                ) : null}

                {showEditPasswordReset ? (
                  <>
                    <div className="my-2 h-px w-full bg-mb-border/50" aria-hidden />
                    <Title s2 textAccent mb2 block>
                      {t('PSYCHOLOGIST_PATIENTS_MODAL_RESET_PASSWORD_SECTION')}
                    </Title>
                    <InputForm
                      optional
                      password
                      value={form.password ?? ''}
                      placeholder={t('PSYCHOLOGIST_PATIENTS_MODAL_RESET_PASSWORD')}
                      helpText={t(
                        'PSYCHOLOGIST_PATIENTS_MODAL_RESET_PASSWORD_HELP'
                      )}
                      onChange={(value) => onChange({ password: String(value) })}
                    >
                      {t('PSYCHOLOGIST_PATIENTS_MODAL_RESET_PASSWORD')}
                    </InputForm>
                  </>
                ) : null}
              </Flex>

              <Flex row wFull gap5 mt6>
                <Flex flex1 wFull>
                  <Button
                    type="button"
                    variant="secondary"
                    outlined
                    wFull
                    onClick={onClose}
                  >
                    {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                  </Button>
                </Flex>
                <Flex flex1 wFull>
                  <Button
                    type="submit"
                    variant="primary"
                    wFull
                    clickable={!saving}
                  >
                    {saving
                      ? t('PSYCHOLOGIST_PATIENTS_SAVING')
                      : t('PSYCHOLOGIST_PATIENTS_MODAL_SAVE')}
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Flex>
        </Card>
      </div>
    </Overlay>
  );
};
