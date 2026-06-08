'use client';

import type { FormEvent, MouseEvent } from 'react';

import type { PsychologistPatientSaveOrUpdateDto } from '@api';
import { Button, Flex, Icon, Overlay, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, InputForm } from '@molecules';

type PsychologistPatientFormModalProps = {
  visible: boolean;
  form: PsychologistPatientSaveOrUpdateDto;
  saving: boolean;
  formError?: string;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (patch: Partial<PsychologistPatientSaveOrUpdateDto>) => void;
};

export const PsychologistPatientFormModal = ({
  visible,
  form,
  saving,
  formError,
  onClose,
  onConfirm,
  onChange,
}: PsychologistPatientFormModalProps) => {
  const { t } = useI18n();
  const isEdit = Boolean(form.id);
  const showCreateAccount = !isEdit;
  const showEditPasswordReset = isEdit;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!saving) {
      onConfirm();
    }
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

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
                  <Icon.User nm white />
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

            <form className="w-full" onSubmit={handleSubmit} noValidate>
              {formError ? (
                <div
                  className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm font-medium text-mb-danger"
                  role="alert"
                >
                  {formError}
                </div>
              ) : null}

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
                  onChange={(value) => onChange({ phone: String(value) })}
                >
                  {t('PSYCHOLOGIST_PATIENTS_COL_PHONE')}
                </InputForm>

                {showCreateAccount ? (
                  <InputForm
                    required
                    type="email"
                    autoComplete="email"
                    value={form.email ?? ''}
                    placeholder={t('EMAIL')}
                    onChange={(value) => onChange({ email: String(value) })}
                  >
                    {t('EMAIL')}
                  </InputForm>
                ) : (
                  <InputForm
                    readOnly
                    type="email"
                    value={form.email ?? ''}
                    placeholder={t('EMAIL')}
                    onChange={() => undefined}
                  >
                    {t('EMAIL')}
                  </InputForm>
                )}

                {showCreateAccount ? (
                  <>
                    <div className="my-2 h-px w-full bg-mb-border/50" aria-hidden />
                    <Title s2 textAccent mb2 block>
                      {t('PSYCHOLOGIST_PATIENTS_MODAL_ACCOUNT_SECTION')}
                    </Title>
                    <Title s2 gray block leadingRelaxed mb2>
                      {t('PSYCHOLOGIST_PATIENTS_MODAL_ACCOUNT_HELP')}
                    </Title>
                    <InputForm
                      required
                      password
                      value={form.password ?? ''}
                      maxLength={5}
                      autoComplete="new-password"
                      placeholder={t('PSYCHOLOGIST_PATIENTS_MODAL_INITIAL_PASSWORD')}
                      onChange={(value) => onChange({ password: String(value) })}
                    >
                      {t('PSYCHOLOGIST_PATIENTS_MODAL_INITIAL_PASSWORD')}
                    </InputForm>
                    <Title s2 gray block leadingRelaxed>
                      {t('PSYCHOLOGIST_PATIENTS_MODAL_INITIAL_PASSWORD_HELP')}
                    </Title>
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
