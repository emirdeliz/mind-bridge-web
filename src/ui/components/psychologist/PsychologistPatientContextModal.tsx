'use client';

import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';

import { Button, Flex, Icon, Input, Overlay, Select, Title } from '@atoms';
import { translateTemplate, useI18n } from '@i18n';
import { Card, FormGroup } from '@molecules';

import {
  PSYCHOLOGIST_PATIENT_CONTEXT_EXAMPLE_IDS,
  psychologistPatientContextExampleI18nKey,
} from './psychologistPatientContextExamples';

type PsychologistPatientContextModalProps = {
  visible: boolean;
  patientName?: string | null;
  value: string;
  loading?: boolean;
  saving: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (value: string) => void;
};

export const PsychologistPatientContextModal = ({
  visible,
  patientName,
  value,
  loading = false,
  saving,
  error,
  onClose,
  onConfirm,
  onChange,
}: PsychologistPatientContextModalProps) => {
  const { t } = useI18n();
  const [selectedExampleId, setSelectedExampleId] = useState('');

  useEffect(() => {
    if (!visible) {
      setSelectedExampleId('');
    }
  }, [visible]);

  const exampleSelectOptions = useMemo(
    () => [
      {
        value: '',
        label: t('PSYCHOLOGIST_PATIENTS_CONTEXT_EXAMPLE_SELECT_PLACEHOLDER'),
      },
      ...PSYCHOLOGIST_PATIENT_CONTEXT_EXAMPLE_IDS.map((id) => ({
        value: id,
        label: t(psychologistPatientContextExampleI18nKey(id, 'LABEL')),
      })),
    ],
    [t],
  );

  const handleExampleSelect = (rawValue: string | number) => {
    const exampleId = String(rawValue);
    setSelectedExampleId(exampleId);
    if (!exampleId) {
      return;
    }
    onChange(
      t(
        psychologistPatientContextExampleI18nKey(
          exampleId as (typeof PSYCHOLOGIST_PATIENT_CONTEXT_EXAMPLE_IDS)[number],
          'TEXT',
        ),
      ),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!saving && !loading) {
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
        aria-labelledby="patient-context-modal-title"
      >
        <Card padding="lg" shadow="xl">
          <Flex col wFull gap5>
            <Flex row wFull alignCenter justifySpaceBetween gap4>
              <Flex row alignCenter gap4 flex1>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-mb-primary/30 bg-mb-primary/15 shadow-glow"
                  aria-hidden
                >
                  <Icon.Cog nm white />
                </div>
                <div className="min-w-0 flex-1">
                  <Flex col wFull gap1>
                    <span id="patient-context-modal-title" className="sr-only">
                      {t('PSYCHOLOGIST_PATIENTS_CONTEXT_MODAL_TITLE')}
                    </span>
                    <Title fs3 fw3 block noWrap ellipsis>
                      {t('PSYCHOLOGIST_PATIENTS_CONTEXT_MODAL_TITLE')}
                    </Title>
                    <Title s2 gray block leadingRelaxed>
                      {patientName
                        ? translateTemplate(
                            t('PSYCHOLOGIST_PATIENTS_CONTEXT_MODAL_SUBTITLE_NAMED'),
                            { name: patientName },
                          )
                        : t('PSYCHOLOGIST_PATIENTS_CONTEXT_MODAL_SUBTITLE')}
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
              {error ? (
                <div
                  className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm font-medium text-mb-danger"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <FormGroup
                label={t('PSYCHOLOGIST_PATIENTS_CONTEXT_EXAMPLE_SELECT_LABEL')}
                helpText={t('PSYCHOLOGIST_PATIENTS_CONTEXT_EXAMPLE_SELECT_HELP')}
              >
                <Select
                  value={selectedExampleId}
                  disabled={loading}
                  options={exampleSelectOptions}
                  onChange={handleExampleSelect}
                />
              </FormGroup>

              <Flex col wFull gap2>
                <Title s2 fw3 block>
                  {t('PSYCHOLOGIST_CONTEXT_FOR_AI')}
                </Title>
                <Title s2 gray block leadingRelaxed mb2>
                  {t('TOOLTIP_PSYCHOLOGIST_CONTEXT')}
                </Title>
                <Input.TextArea
                  rows={6}
                  value={value}
                  disabled={loading}
                  placeholder={t('PSYCHOLOGIST_PATIENTS_CONTEXT_PLACEHOLDER')}
                  onChange={(event) => onChange(event.target.value)}
                />
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
                    clickable={!saving && !loading}
                  >
                    {saving
                      ? t('PSYCHOLOGIST_PATIENTS_SAVING')
                      : loading
                        ? t('PSYCHOLOGIST_PATIENTS_CONTEXT_LOADING')
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
