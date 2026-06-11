"use client";

import { useEffect, useState } from "react";

import type { PsychologistSchedulingSettingsDto, SchedulingBreakIntervalDto } from "@api";
import { Button, Flex, Icon, Overlay, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form, InputForm } from "@molecules";

type SchedulingSettingsModalProps = {
  visible: boolean;
  settings: PsychologistSchedulingSettingsDto | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: {
    sessionDurationMinutes: number;
    dayStartTime: string;
    dayEndTime: string;
    breakIntervals: SchedulingBreakIntervalDto[];
  }) => void | Promise<void>;
};

const emptyBreak = (): SchedulingBreakIntervalDto => ({
  startTime: "12:00",
  endTime: "13:00",
});

export const SchedulingSettingsModal = ({
  visible,
  settings,
  saving = false,
  onClose,
  onSave,
}: SchedulingSettingsModalProps) => {
  const { t } = useI18n();
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(50);
  const [dayStartTime, setDayStartTime] = useState("08:00");
  const [dayEndTime, setDayEndTime] = useState("20:00");
  const [breakIntervals, setBreakIntervals] = useState<SchedulingBreakIntervalDto[]>([
    emptyBreak(),
  ]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!visible || !settings) {
      return;
    }
    setSessionDurationMinutes(settings.sessionDurationMinutes);
    setDayStartTime(settings.dayStartTime);
    setDayEndTime(settings.dayEndTime);
    setBreakIntervals(
      settings.breakIntervals.length ? settings.breakIntervals : [emptyBreak()],
    );
    setFormError("");
  }, [visible, settings]);

  if (!visible || !settings) {
    return null;
  }

  return (
    <Overlay visible={visible} zIndex={40} onClick={saving ? undefined : onClose}>
      <div
        className="w-full max-w-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <Card padding="lg" shadow="xl">
          <Flex col wFull gap5>
            <Flex row wFull alignStart justifySpaceBetween gap4>
              <Flex col wFull gap2 flex1>
                <Title fs3 fw3 block leadingRelaxed>
                  {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_TITLE")}
                </Title>
                <Title s2 gray block leadingRelaxed>
                  {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_SUBTITLE")}
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
                const duration = Number(sessionDurationMinutes);
                if (!Number.isFinite(duration) || duration <= 0) {
                  setFormError(t("PSYCHOLOGIST_SCHEDULING_SETTINGS_DURATION_ERROR"));
                  return;
                }
                if (dayStartTime >= dayEndTime) {
                  setFormError(t("PSYCHOLOGIST_SCHEDULING_SETTINGS_HOURS_ERROR"));
                  return;
                }
                setFormError("");
                void onSave({
                  sessionDurationMinutes: duration,
                  dayStartTime,
                  dayEndTime,
                  breakIntervals,
                });
              }}
            >
              <Flex col wFull gap4>
                <InputForm
                  type="number"
                  value={sessionDurationMinutes}
                  onChange={(value) => setSessionDurationMinutes(Number(value))}
                  required
                >
                  {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_DURATION")}
                </InputForm>
                <Flex row wFull gap4>
                  <Flex flex1 wFull>
                    <InputForm
                      type="time"
                      value={dayStartTime}
                      onChange={(value) => setDayStartTime(String(value))}
                      required
                    >
                      {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_DAY_START")}
                    </InputForm>
                  </Flex>
                  <Flex flex1 wFull>
                    <InputForm
                      type="time"
                      value={dayEndTime}
                      onChange={(value) => setDayEndTime(String(value))}
                      required
                    >
                      {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_DAY_END")}
                    </InputForm>
                  </Flex>
                </Flex>

                <Flex col wFull gap4>
                  <Title s2 fw3 block>
                    {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_BREAKS")}
                  </Title>
                  {breakIntervals.map((interval, index) => (
                    <Flex key={`break-${index}`} row wFull gap4 alignEnd>
                      <Flex flex1 wFull>
                        <InputForm
                          type="time"
                          value={interval.startTime}
                          onChange={(value) => {
                            setBreakIntervals((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, startTime: String(value) }
                                  : item,
                              ),
                            );
                          }}
                        >
                          {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_BREAK_START")}
                        </InputForm>
                      </Flex>
                      <Flex flex1 wFull>
                        <InputForm
                          type="time"
                          value={interval.endTime}
                          onChange={(value) => {
                            setBreakIntervals((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, endTime: String(value) }
                                  : item,
                              ),
                            );
                          }}
                        >
                          {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_BREAK_END")}
                        </InputForm>
                      </Flex>
                      <Button
                        type="button"
                        variant="danger"
                        outlined
                        circle
                        clickable={!saving && breakIntervals.length > 1}
                        title={t("PSYCHOLOGIST_SCHEDULING_SETTINGS_REMOVE_BREAK")}
                        onClick={() => {
                          setBreakIntervals((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          );
                        }}
                      >
                        <Icon.TrashEmpty sm white />
                      </Button>
                    </Flex>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    outlined
                    clickable={!saving}
                    onClick={() => setBreakIntervals((current) => [...current, emptyBreak()])}
                  >
                    {t("PSYCHOLOGIST_SCHEDULING_SETTINGS_ADD_BREAK")}
                  </Button>
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
  );
};
