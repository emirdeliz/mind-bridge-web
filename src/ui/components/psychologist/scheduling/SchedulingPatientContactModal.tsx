'use client';

import { useEffect, useState } from 'react';

import type { PsychologistAppointmentDto } from '@api';
import { getPsychologistPatientsApi } from '@api';
import { Button, Flex, Icon, Loading, Overlay, Title } from '@atoms';
import { maskPhone } from '@helpers';
import { useI18n } from '@i18n';
import { Card } from '@molecules';

type SchedulingPatientContactModalProps = {
  visible: boolean;
  appointment: PsychologistAppointmentDto | null;
  onClose: () => void;
};

export const SchedulingPatientContactModal = ({
  visible,
  appointment,
  onClose,
}: SchedulingPatientContactModalProps) => {
  const { t } = useI18n();
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !appointment) {
      return;
    }

    setLoading(true);
    setPhone(null);
    void getPsychologistPatientsApi('', false)
      .then((patients) => {
        const patient = patients.find(
          (item) => item.id === appointment.patientId
        );
        setPhone(patient?.phone ?? null);
      })
      .catch(() => setPhone(null))
      .finally(() => setLoading(false));
  }, [visible, appointment]);

  if (!visible || !appointment) {
    return null;
  }

  const name =
    appointment.patientFullName?.trim() ||
    appointment.patientEmail ||
    appointment.patientId;

  return (
    <Overlay visible={visible} zIndex={40} onClick={onClose}>
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
                  {t('PSYCHOLOGIST_SCHEDULING_CONTACT_TITLE')}
                </Title>
                <Title hint gray block leadingRelaxed>
                  {name}
                </Title>
              </Flex>
              <Button
                type='button'
                variant='secondary'
                outlined
                circle
                title={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                onClick={onClose}
              >
                <Icon.Close sm />
              </Button>
            </Flex>

            <Flex col wFull gap4>
              <Flex col wFull gap1>
                <Title hint gray block>
                  {t('PSYCHOLOGIST_SCHEDULING_CONTACT_EMAIL')}
                </Title>
                <Title s2 block>
                  {appointment.patientEmail?.trim() || '—'}
                </Title>
              </Flex>
              <Flex col wFull gap1>
                <Title hint gray block>
                  {t('PSYCHOLOGIST_SCHEDULING_CONTACT_PHONE')}
                </Title>
                {loading ? (
                  <Flex row alignCenter py1>
                    <Loading />
                  </Flex>
                ) : (
                  <Title s2 block>
                    {phone?.trim() ? maskPhone(phone) : '—'}
                  </Title>
                )}
              </Flex>
            </Flex>

            <Button
              type='button'
              variant='secondary'
              outlined
              wFull
              onClick={onClose}
            >
              {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
            </Button>
          </Flex>
        </Card>
      </div>
    </Overlay>
  );
};
