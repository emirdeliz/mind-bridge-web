"use client";

import { useEffect, useState } from "react";

import type { PsychologistPatientViewDto } from "@api";
import { getPsychologistPatientsApi } from "@api";
import { Button, Flex, Icon, Overlay, Select, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form, FormGroup } from "@molecules";

type SchedulingCreateAppointmentModalProps = {
  visible: boolean;
  dateKey: string | null;
  time: string | null;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (patientId: string) => void | Promise<void>;
};

export const SchedulingCreateAppointmentModal = ({
  visible,
  dateKey,
  time,
  saving = false,
  onClose,
  onConfirm,
}: SchedulingCreateAppointmentModalProps) => {
  const { t } = useI18n();
  const [patients, setPatients] = useState<PsychologistPatientViewDto[]>([]);
  const [patientId, setPatientId] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }
    setPatientId("");
    setFormError("");
    setLoadingPatients(true);
    void getPsychologistPatientsApi("", false)
      .then((data) => setPatients(data))
      .catch(() => setPatients([]))
      .finally(() => setLoadingPatients(false));
  }, [visible]);

  if (!visible || !dateKey || !time) {
    return null;
  }

  const slotLabel = `${dateKey.split("-").reverse().join("/")} ${time}`;

  return (
    <Overlay visible={visible} zIndex={40} onClick={saving ? undefined : onClose}>
      <div
        className="w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <Card padding="lg" shadow="xl">
          <Flex col wFull gap5>
            <Flex row wFull alignStart justifySpaceBetween gap4>
              <Flex col wFull gap2 flex1>
                <Title fs3 fw3 block leadingRelaxed>
                  {t("PSYCHOLOGIST_SCHEDULING_CREATE_TITLE")}
                </Title>
                <Title s2 gray block leadingRelaxed>
                  {slotLabel}
                </Title>
              </Flex>
              <Button
                type="button"
                variant="secondary"
                outlined
                circle
                clickable={!saving}
                title={t("PSYCHOLOGIST_PATIENTS_MODAL_CANCEL")}
                onClick={onClose}
              >
                <Icon.Close sm />
              </Button>
            </Flex>

            <Form
              onSubmit={(event) => {
                event.preventDefault();
                if (!patientId) {
                  setFormError(t("PSYCHOLOGIST_SCHEDULING_CREATE_PATIENT_ERROR"));
                  return;
                }
                setFormError("");
                void onConfirm(patientId);
              }}
            >
              <Flex col wFull gap4>
                <FormGroup
                  label={t("PSYCHOLOGIST_SCHEDULING_CREATE_PATIENT")}
                  target="scheduling-patient"
                  required
                >
                  <Select
                    id="scheduling-patient"
                    value={patientId}
                    disabled={loadingPatients || saving}
                    options={[
                      {
                        label: loadingPatients
                          ? t("PSYCHOLOGIST_SCHEDULING_CREATE_LOADING_PATIENTS")
                          : t("PSYCHOLOGIST_SCHEDULING_CREATE_SELECT_PATIENT"),
                        value: "",
                      },
                      ...patients.map((patient) => ({
                        label: patient.fullName?.trim() || patient.email || patient.id,
                        value: patient.id,
                      })),
                    ]}
                    onChange={(value) => setPatientId(String(value))}
                  />
                </FormGroup>

                {formError ? (
                  <Title s2 error block>
                    {formError}
                  </Title>
                ) : null}

                <Flex row wFull gap4>
                  <Flex flex1 wFull>
                    <Button
                      type="button"
                      variant="secondary"
                      outlined
                      wFull
                      clickable={!saving}
                      onClick={onClose}
                    >
                      {t("PSYCHOLOGIST_PATIENTS_MODAL_CANCEL")}
                    </Button>
                  </Flex>
                  <Flex flex1 wFull>
                    <Button type="submit" variant="primary" wFull clickable={!saving}>
                      {t("PSYCHOLOGIST_SCHEDULING_CREATE_CONFIRM")}
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
