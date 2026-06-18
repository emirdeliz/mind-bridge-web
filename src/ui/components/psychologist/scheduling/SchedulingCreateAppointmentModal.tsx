'use client';

import { useEffect, useMemo, useState } from 'react';

import type { PsychologistPatientViewDto } from '@api';
import { getPsychologistPatientsApi } from '@api';
import { Button, Flex, Icon, Input, Overlay, Select, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, Form, FormGroup } from '@molecules';
import { SwitchForm } from '@organisms';
import {
  combineLocalDateAndTime,
  personalDurationMinutesFromSlotRange,
} from '@services';

type SchedulingCreateAppointmentModalProps = {
  visible: boolean;
  dateKey: string | null;
  time: string | null;
  slotTimes: string[];
  sessionDurationMinutes: number;
  tzOffset: number;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (input: CreateSchedulingAppointmentInput) => void | Promise<void>;
};

export type CreateSchedulingAppointmentInput =
  | {
      kind: 'patient';
      patientId: string;
      startsAt: string;
    }
  | {
      kind: 'personal';
      startsAt: string;
      durationMinutes: number;
      personalDescription: string;
    };

export const SchedulingCreateAppointmentModal = ({
  visible,
  dateKey,
  time,
  slotTimes,
  sessionDurationMinutes,
  tzOffset,
  saving = false,
  onClose,
  onConfirm,
}: SchedulingCreateAppointmentModalProps) => {
  const { t } = useI18n();
  const [patients, setPatients] = useState<PsychologistPatientViewDto[]>([]);
  const [patientId, setPatientId] = useState('');
  const [isPersonalCommitment, setIsPersonalCommitment] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [personalDescription, setPersonalDescription] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [formError, setFormError] = useState('');

  const slotOptions = useMemo(
    () => slotTimes.map((slot) => ({ value: slot, label: slot })),
    [slotTimes]
  );

  const endSlotOptions = useMemo(() => {
    const startIndex = slotTimes.indexOf(startTime);
    if (startIndex < 0) {
      return slotOptions;
    }
    return slotTimes
      .slice(startIndex)
      .map((slot) => ({ value: slot, label: slot }));
  }, [slotOptions, slotTimes, startTime]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setPatientId('');
    setIsPersonalCommitment(false);
    setStartTime(time ?? '');
    setEndTime(time ?? '');
    setPersonalDescription('');
    setFormError('');
    setLoadingPatients(true);
    void getPsychologistPatientsApi('', false)
      .then((data) => setPatients(data))
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false));
  }, [visible, time]);

  if (!visible || !dateKey || !time) {
    return null;
  }

  const slotLabel = `${dateKey.split('-').reverse().join('/')} ${time}`;
  const personalSlotLabel = isPersonalCommitment
    ? `${dateKey.split('-').reverse().join('/')} ${startTime} – ${endTime}`
    : slotLabel;

  return (
    <Overlay
      visible={visible}
      zIndex={40}
      onClick={saving ? undefined : onClose}
    >
      <div
        className='w-full max-w-md'
        onClick={(event) => event.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        <Card padding='lg' shadow='xl'>
          <Flex col wFull gap5>
            <Flex row wFull alignStart justifySpaceBetween gap4>
              <Flex col wFull gap2 flex1>
                <Title fs3 fw3 block leadingRelaxed>
                  {t('PSYCHOLOGIST_SCHEDULING_CREATE_TITLE')}
                </Title>
                <Title hint gray block leadingRelaxed>
                  {personalSlotLabel}
                </Title>
              </Flex>
              <Button
                type='button'
                variant='secondary'
                outlined
                circle
                clickable={!saving}
                title={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                onClick={onClose}
              >
                <Icon.Close sm />
              </Button>
            </Flex>

            <Form
              onSubmit={(event) => {
                event.preventDefault();

                if (isPersonalCommitment) {
                  const description = personalDescription.trim();
                  const durationMinutes = personalDurationMinutesFromSlotRange(
                    startTime,
                    endTime,
                    slotTimes,
                    sessionDurationMinutes
                  );

                  if (!startTime || !endTime || durationMinutes === null) {
                    setFormError(
                      t('PSYCHOLOGIST_SCHEDULING_CREATE_PERSONAL_TIME_ERROR')
                    );
                    return;
                  }
                  if (!description) {
                    setFormError(
                      t(
                        'PSYCHOLOGIST_SCHEDULING_CREATE_PERSONAL_DESCRIPTION_ERROR'
                      )
                    );
                    return;
                  }
                  setFormError('');
                  const startsAt = combineLocalDateAndTime(
                    dateKey,
                    startTime,
                    tzOffset
                  ).toISOString();
                  void onConfirm({
                    kind: 'personal',
                    startsAt,
                    durationMinutes,
                    personalDescription: description,
                  });
                  return;
                }

                const startsAt = combineLocalDateAndTime(
                  dateKey,
                  time,
                  tzOffset
                ).toISOString();
                if (!patientId) {
                  setFormError(
                    t('PSYCHOLOGIST_SCHEDULING_CREATE_PATIENT_ERROR')
                  );
                  return;
                }
                setFormError('');
                void onConfirm({
                  kind: 'patient',
                  patientId,
                  startsAt,
                });
              }}
            >
              <Flex col wFull gap4>
                <SwitchForm
                  row
                  selected={isPersonalCommitment}
                  disabled={saving}
                  onChange={(selected) => {
                    setIsPersonalCommitment(selected);
                    if (selected) {
                      setStartTime(time);
                      setEndTime(time);
                    }
                    setFormError('');
                  }}
                >
                  {t('PSYCHOLOGIST_SCHEDULING_CREATE_PERSONAL_SWITCH')}
                </SwitchForm>

                {isPersonalCommitment ? (
                  <>
                    <Flex row wFull gap5>
                      <Flex flex1 wFull>
                        <FormGroup
                          label={t(
                            'PSYCHOLOGIST_SCHEDULING_CREATE_PERSONAL_START'
                          )}
                          target='scheduling-personal-start'
                          required
                        >
                          <Select
                            id='scheduling-personal-start'
                            value={startTime}
                            disabled={saving}
                            options={slotOptions}
                            onChange={(value) => {
                              const nextStart = String(value);
                              setStartTime(nextStart);
                              const startIndex = slotTimes.indexOf(nextStart);
                              const endIndex = slotTimes.indexOf(endTime);
                              if (startIndex < 0 || endIndex < startIndex) {
                                setEndTime(nextStart);
                              }
                            }}
                          />
                        </FormGroup>
                      </Flex>
                      <Flex flex1 wFull>
                        <FormGroup
                          label={t(
                            'PSYCHOLOGIST_SCHEDULING_CREATE_PERSONAL_END'
                          )}
                          target='scheduling-personal-end'
                          required
                        >
                          <Select
                            id='scheduling-personal-end'
                            value={endTime}
                            disabled={saving}
                            options={endSlotOptions}
                            onChange={(value) => setEndTime(String(value))}
                          />
                        </FormGroup>
                      </Flex>
                    </Flex>

                    <FormGroup
                      label={t(
                        'PSYCHOLOGIST_SCHEDULING_CREATE_PERSONAL_DESCRIPTION'
                      )}
                      target='scheduling-personal-description'
                      required
                    >
                      <Input.TextArea
                        id='scheduling-personal-description'
                        rows={3}
                        value={personalDescription}
                        disabled={saving}
                        placeholder={t(
                          'PSYCHOLOGIST_SCHEDULING_CREATE_PERSONAL_DESCRIPTION_PLACEHOLDER'
                        )}
                        onChange={(event) =>
                          setPersonalDescription(event.target.value)
                        }
                      />
                    </FormGroup>
                  </>
                ) : (
                  <FormGroup
                    label={t('PSYCHOLOGIST_SCHEDULING_CREATE_PATIENT')}
                    target='scheduling-patient'
                    required
                  >
                    <Select
                      id='scheduling-patient'
                      value={patientId}
                      disabled={loadingPatients || saving}
                      options={[
                        {
                          label: loadingPatients
                            ? t(
                                'PSYCHOLOGIST_SCHEDULING_CREATE_LOADING_PATIENTS'
                              )
                            : t(
                                'PSYCHOLOGIST_SCHEDULING_CREATE_SELECT_PATIENT'
                              ),
                          value: '',
                        },
                        ...patients.map((patient) => ({
                          label:
                            patient.fullName?.trim() ||
                            patient.email ||
                            patient.id,
                          value: patient.id,
                        })),
                      ]}
                      onChange={(value) => setPatientId(String(value))}
                    />
                  </FormGroup>
                )}

                {formError ? (
                  <Title s2 error block>
                    {formError}
                  </Title>
                ) : null}

                <Flex row wFull gap4>
                  <Flex flex1 wFull>
                    <Button
                      type='button'
                      variant='secondary'
                      outlined
                      wFull
                      clickable={!saving}
                      onClick={onClose}
                    >
                      {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                    </Button>
                  </Flex>
                  <Flex flex1 wFull>
                    <Button
                      type='submit'
                      variant='primary'
                      wFull
                      clickable={!saving}
                    >
                      {t('PSYCHOLOGIST_SCHEDULING_CREATE_CONFIRM')}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Form>
          </Flex>
        </Card>
      </div>
    </Overlay>
  );
};
