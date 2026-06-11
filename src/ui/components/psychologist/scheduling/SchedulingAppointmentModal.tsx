"use client";

import { useEffect, useMemo, useState } from "react";

import type { PsychologistAppointmentDto } from "@api";
import { Button, Flex, Icon, Overlay, Select, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, ConfirmModal, Form } from "@molecules";
import {
  combineLocalDateAndTime,
  getWeekDateKeys,
  toLocalDateKey,
  toLocalTime,
} from "@services";

type SchedulingAppointmentModalProps = {
  visible: boolean;
  appointment: PsychologistAppointmentDto | null;
  weekStart: string;
  slotTimes: string[];
  tzOffset: number;
  saving?: boolean;
  onClose: () => void;
  onSave: (startsAt: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
};

export const SchedulingAppointmentModal = ({
  visible,
  appointment,
  weekStart,
  slotTimes,
  tzOffset,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: SchedulingAppointmentModalProps) => {
  const { t } = useI18n();
  const [dateKey, setDateKey] = useState("");
  const [time, setTime] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const weekDateKeys = useMemo(
    () => getWeekDateKeys(weekStart, tzOffset),
    [weekStart, tzOffset],
  );

  useEffect(() => {
    if (!visible || !appointment) {
      return;
    }
    setDateKey(toLocalDateKey(new Date(appointment.startsAt), tzOffset));
    setTime(toLocalTime(new Date(appointment.startsAt), tzOffset));
    setFormError("");
    setDeleteConfirmOpen(false);
  }, [visible, appointment, tzOffset]);

  if (!visible || !appointment) {
    return null;
  }

  const patientLabel =
    appointment.patientFullName?.trim() ||
    appointment.patientEmail ||
    appointment.patientId;

  const dateOptions = weekDateKeys.map((key) => ({
    value: key,
    label: key.split("-").reverse().join("/"),
  }));

  const timeOptions = slotTimes.map((slot) => ({
    value: slot,
    label: slot,
  }));

  return (
    <>
      <Overlay visible={visible && !deleteConfirmOpen} zIndex={40} onClick={saving ? undefined : onClose}>
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
                    {t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_TITLE")}
                  </Title>
                  <Title s2 gray block leadingRelaxed>
                    {patientLabel}
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
                  if (!dateKey || !time) {
                    setFormError(t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DATE_ERROR"));
                    return;
                  }
                  if (!slotTimes.includes(time)) {
                    setFormError(t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_TIME_ERROR"));
                    return;
                  }
                  setFormError("");
                  const startsAt = combineLocalDateAndTime(dateKey, time, tzOffset).toISOString();
                  void onSave(startsAt);
                }}
              >
                <Flex col wFull gap4>
                  <Flex col wFull gap2>
                    <Title s2 fw3 block>
                      {t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DATE")}
                    </Title>
                    <Select
                      value={dateKey}
                      disabled={saving}
                      options={dateOptions}
                      onChange={(value) => setDateKey(String(value))}
                    />
                  </Flex>

                  <Flex col wFull gap2>
                    <Title s2 fw3 block>
                      {t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_TIME")}
                    </Title>
                    <Select
                      value={time}
                      disabled={saving}
                      options={[
                        {
                          label: t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_SELECT_TIME"),
                          value: "",
                        },
                        ...timeOptions,
                      ]}
                      onChange={(value) => setTime(String(value))}
                    />
                  </Flex>

                  {formError ? (
                    <Title s2 error block>
                      {formError}
                    </Title>
                  ) : null}

                  <Flex row wFull gap4>
                    <Flex flex1 wFull>
                      <Button
                        type="button"
                        variant="danger"
                        outlined
                        wFull
                        clickable={!saving}
                        onClick={() => setDeleteConfirmOpen(true)}
                      >
                        {t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DELETE")}
                      </Button>
                    </Flex>
                    <Flex flex1 wFull>
                      <Button type="submit" variant="primary" wFull clickable={!saving}>
                        {t("SAVE")}
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
        title={t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DELETE_TITLE")}
        message={t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DELETE_MESSAGE")}
        confirmLabel={t("PSYCHOLOGIST_SCHEDULING_APPOINTMENT_DELETE_CONFIRM")}
        cancelLabel={t("PSYCHOLOGIST_PATIENTS_MODAL_CANCEL")}
        confirmVariant="danger"
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
