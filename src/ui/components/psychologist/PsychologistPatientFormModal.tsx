'use client';

import type { FormEvent, MouseEvent } from 'react';

import type {
  PatientAnamnesisDto,
  PsychologistPatientSaveOrUpdateDto,
} from '@api';
import { Button, Flex, Icon, Input, Overlay, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, FormGroup, InputForm } from '@molecules';

import { PATIENT_ANAMNESIS_FIELDS } from './patientAnamnesisFields';

type PsychologistPatientFormModalProps = {
  visible: boolean;
  form: PsychologistPatientSaveOrUpdateDto;
  anamnesis: PatientAnamnesisDto;
  loadingAnamnesis?: boolean;
  saving: boolean;
  formError?: string;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (patch: Partial<PsychologistPatientSaveOrUpdateDto>) => void;
  onAnamnesisChange: (patch: Partial<PatientAnamnesisDto>) => void;
};

export const PsychologistPatientFormModal = ({
  visible,
  form,
  anamnesis,
  loadingAnamnesis = false,
  saving,
  formError,
  onClose,
  onConfirm,
  onChange,
  onAnamnesisChange,
}: PsychologistPatientFormModalProps) => {
  const { t } = useI18n();
  const isEdit = Boolean(form.id);
  const showCreateAccount = !isEdit;
  const showEditPasswordReset = isEdit;
  const formDisabled = saving || loadingAnamnesis;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formDisabled) {
      onConfirm();
    }
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <Overlay visible={visible} zIndex={40} onClick={onClose}>
      <div
        className="flex w-full max-w-4xl max-h-[90dvh] min-h-0 flex-col overflow-hidden px-2"
        onClick={stopPropagation}
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-form-modal-title"
      >
        <Card padding="lg" shadow="xl" overflowHidden>
          <div className="flex max-h-[calc(90dvh-5rem)] min-h-0 flex-col overflow-hidden">
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

            <div className="my-5 h-px w-full shrink-0 bg-mb-border/70" aria-hidden />

            <form
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1">
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
                    disabled={formDisabled}
                    placeholder={t('PSYCHOLOGIST_PATIENTS_COL_NAME')}
                    onChange={(value) => onChange({ fullName: String(value) })}
                  >
                    {t('PSYCHOLOGIST_PATIENTS_COL_NAME')}
                  </InputForm>

                  <InputForm
                    required
                    phone
                    value={form.phone ?? ''}
                    disabled={formDisabled}
                    placeholder={t('PSYCHOLOGIST_PATIENTS_COL_PHONE')}
                    onChange={(value) => onChange({ phone: String(value) })}
                  >
                    {t('PSYCHOLOGIST_PATIENTS_COL_PHONE')}
                  </InputForm>

                  <InputForm
                    required
                    readOnly={!showCreateAccount}
                    type="email"
                    autoComplete="email"
                    value={form.email ?? ''}
                    disabled={formDisabled}
                    placeholder={t('EMAIL')}
                    onChange={
                      showCreateAccount
                        ? (value) => onChange({ email: String(value) })
                        : undefined
                    }
                  >
                    {t('EMAIL')}
                  </InputForm>

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
                        disabled={formDisabled}
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
                        disabled={formDisabled}
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

                  {isEdit ? (
                    <>
                      <div className="my-4 h-px w-full bg-mb-border/50" aria-hidden />
                      <Title s2 textAccent mb1 block>
                        {t('PSYCHOLOGIST_PATIENTS_ANAMNESIS_SECTION')}
                      </Title>
                      <Title s2 gray block leadingRelaxed mb3>
                        {t('PSYCHOLOGIST_PATIENTS_ANAMNESIS_SECTION_HELP')}
                      </Title>

                      {loadingAnamnesis ? (
                        <Title s2 gray block leadingRelaxed>
                          {t('PSYCHOLOGIST_PATIENTS_ANAMNESIS_LOADING')}
                        </Title>
                      ) : (
                        <Flex col wFull gap4 alignStretch>
                          {PATIENT_ANAMNESIS_FIELDS.map(({ key, labelKey, placeholderKey }) => (
                            <FormGroup
                              key={key}
                              optional
                              label={t(labelKey)}
                              target={`patient-anamnesis-${key}`}
                            >
                              <Input.TextArea
                                id={`patient-anamnesis-${key}`}
                                rows={3}
                                value={anamnesis[key]}
                                disabled={formDisabled}
                                placeholder={t(placeholderKey)}
                                onChange={(event) =>
                                  onAnamnesisChange({ [key]: event.target.value })
                                }
                              />
                            </FormGroup>
                          ))}
                        </Flex>
                      )}
                    </>
                  ) : null}
                </Flex>
              </div>

              <div className="mt-5 shrink-0 border-t border-mb-border/50 pt-5">
                <Flex row wFull gap5>
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
                      clickable={!formDisabled}
                    >
                      {saving
                        ? t('PSYCHOLOGIST_PATIENTS_SAVING')
                        : loadingAnamnesis
                          ? t('PSYCHOLOGIST_PATIENTS_ANAMNESIS_LOADING')
                          : t('PSYCHOLOGIST_PATIENTS_MODAL_SAVE')}
                    </Button>
                  </Flex>
                </Flex>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </Overlay>
  );
};
