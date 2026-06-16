'use client';

import { useEffect, useMemo, useState } from 'react';

import type { PsychologistAppointmentDto } from '@api';
import { Button, Flex, Icon, Input, Overlay, Select, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, ConfirmModal, Form, FormGroup } from '@molecules';
import {
  combineLocalDateAndTime,
  getWeekDateKeys,
  personalDurationMinutesFromSlotRange,
  personalEndSlotTimeFromDuration,
  toLocalDateKey,
  toLocalTime,
} from '@services';

export type SchedulingAppointmentSaveInput =
  | {
      kind: 'patient';
      startsAt: string;
    }
  | {
      kind: 'personal';
      startsAt: string;
      durationMinutes: number;
      personalDescription: string;
    };

type SchedulingAppointmentModalProps = {
  visible: boolean;
  appointment: PsychologistAppointmentDto | null;
  weekStart: string;
  slotTimes: string[];
  sessionDurationMinutes: number;
  tzOffset: number;
  saving?: boolean;
  onClose: () => void;
  onSave: (input: SchedulingAppointmentSaveInput) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
};

export const SchedulingAppointmentModal = ({
  visible,
  appointment,
  weekStart,
  slotTimes,
  sessionDurationMinutes,
  tzOffset,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: SchedulingAppointmentModalProps) => {
  const { t } = useI18n();
  const [dateKey, setDateKey] = useState('');
  const [time, setTime] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [personalDescription, setPersonalDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const weekDateKeys = useMemo(
    () => getWeekDateKeys(weekStart, tzOffset),
    [weekStart, tzOffset]
  );

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
    if (!visible || !appointment) {
      return;
    }
    const appointmentDateKey = toLocalDateKey(
      new Date(appointment.startsAt),
      tzOffset
    );
    const appointmentStartTime = toLocalTime(
      new Date(appointment.startsAt),
      tzOffset
    );

    setDateKey(appointmentDateKey);
    setTime(appointmentStartTime);
    setStartTime(appointmentStartTime);
    setEndTime(
      personalEndSlotTimeFromDuration(
        appointmentStartTime,
        appointment.durationMinutes,
        slotTimes,
        sessionDurationMinutes
      )
    );
    setPersonalDescription(appointment.notes?.trim() ?? '');
    setFormError('');
    setDeleteConfirmOpen(false);
  }, [visible, appointment, sessionDurationMinutes, slotTimes, tzOffset]);

  if (!visible || !appointment) {
    return null;
  }

  const isPersonal = appointment.isPersonalCommitment;
  const appointmentLabel = isPersonal
    ? appointment.notes?.trim() ||
      t('PSYCHOLOGIST_SCHEDULING_PERSONAL_COMMITMENT')
    : appointment.patientFullName?.trim() ||
      appointment.patientEmail ||
      appointment.patientId ||
      '';

  const dateOptions = weekDateKeys.map((key) => ({
    value: key,
    label: key.split('-').reverse().join('/'),
  }));

  const timeOptions = slotTimes.map((slot) => ({
    value: slot,
    label: slot,
  }));

  return (
    <>
      <Overlay
        visible={visible && !deleteConfirmOpen}
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
                    {isPersonal
                      ? t('PSYCHOLOGIST_SCHEDULING_PERSONAL_EDIT_TITLE')
                      : t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_TITLE')}
                  </Title>
                  {!isPersonal ? (
                    <Title s2 gray block leadingRelaxed>
                      {appointmentLabel}
                    </Title>
                  ) : null}
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

                  if (!dateKey) {
                    setFormError(
                      t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DATE_ERROR')
                    );
                    return;
                  }

                  if (isPersonal) {
                    const description = personalDescription.trim();
                    const durationMinutes =
                      personalDurationMinutesFromSlotRange(
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
                    void onSave({
                      kind: 'personal',
                      startsAt: combineLocalDateAndTime(
                        dateKey,
                        startTime,
                        tzOffset
                      ).toISOString(),
                      durationMinutes,
                      personalDescription: description,
                    });
                    return;
                  }

                  if (!time) {
                    setFormError(
                      t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DATE_ERROR')
                    );
                    return;
                  }
                  if (!slotTimes.includes(time)) {
                    setFormError(
                      t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_TIME_ERROR')
                    );
                    return;
                  }
                  setFormError('');
                  void onSave({
                    kind: 'patient',
                    startsAt: combineLocalDateAndTime(
                      dateKey,
                      time,
                      tzOffset
                    ).toISOString(),
                  });
                }}
              >
                <Flex col wFull gap4>
                  <Flex col wFull gap2>
                    <Title s2 fw3 block>
                      {t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DATE')}
                    </Title>
                    <Select
                      value={dateKey}
                      disabled={saving}
                      options={dateOptions}
                      onChange={(value) => setDateKey(String(value))}
                    />
                  </Flex>

                  {isPersonal ? (
                    <>
                      <Flex row wFull gap5>
                        <Flex flex1 wFull>
                          <FormGroup
                            label={t(
                              'PSYCHOLOGIST_SCHEDULING_CREATE_PERSONAL_START'
                            )}
                            target='scheduling-edit-personal-start'
                            required
                          >
                            <Select
                              id='scheduling-edit-personal-start'
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
                            target='scheduling-edit-personal-end'
                            required
                          >
                            <Select
                              id='scheduling-edit-personal-end'
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
                        target='scheduling-edit-personal-description'
                        required
                      >
                        <Input.TextArea
                          id='scheduling-edit-personal-description'
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
                    <Flex col wFull gap2>
                      <Title s2 fw3 block>
                        {t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_TIME')}
                      </Title>
                      <Select
                        value={time}
                        disabled={saving}
                        options={[
                          {
                            label: t(
                              'PSYCHOLOGIST_SCHEDULING_APPOINTMENT_SELECT_TIME'
                            ),
                            value: '',
                          },
                          ...timeOptions,
                        ]}
                        onChange={(value) => setTime(String(value))}
                      />
                    </Flex>
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
                        variant='danger'
                        outlined
                        wFull
                        clickable={!saving}
                        onClick={() => setDeleteConfirmOpen(true)}
                      >
                        {t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DELETE')}
                      </Button>
                    </Flex>
                    <Flex flex1 wFull>
                      <Button
                        type='submit'
                        variant='primary'
                        wFull
                        clickable={!saving}
                      >
                        {t('SAVE')}
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </Form>
            </Flex>
          </Card>
        </div>
      </Overlay>

      <ConfirmModal
        visible={deleteConfirmOpen}
        title={t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DELETE_TITLE')}
        message={t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DELETE_MESSAGE')}
        confirmLabel={t('PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DELETE_CONFIRM')}
        cancelLabel={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
        confirmVariant='danger'
        onClose={() => {
          if (!saving) {
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={() => {
          void onDelete();
        }}
      />
    </>
  );
};
