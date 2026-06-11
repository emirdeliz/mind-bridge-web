import { useEffect, useState } from "react";

import type { PatientPaymentRowDto } from "@api";
import { Button, Flex, Icon, Overlay, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form, InputForm } from "@molecules";

type PatientPaymentRegisterModalProps = {
  visible: boolean;
  patient: PatientPaymentRowDto | null;
  billingMonth: string;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (amountCents: number, notes: string) => void | Promise<void>;
};

export const PatientPaymentRegisterModal = ({
  visible,
  patient,
  billingMonth,
  saving = false,
  onClose,
  onConfirm,
}: PatientPaymentRegisterModalProps) => {
  const { t } = useI18n();
  const [amount, setAmount] = useState<number | string>(0);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!visible) {
      return;
    }
    setAmount(patient?.payment?.amountCents ? patient.payment.amountCents / 100 : 0);
    setNotes(patient?.payment?.notes ?? "");
    setFormError("");
  }, [visible, patient]);

  if (!visible || !patient) {
    return null;
  }

  const patientLabel = patient.fullName?.trim() || patient.email || patient.patientId;

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
                  {patient.payment
                    ? t("PSYCHOLOGIST_PATIENT_PAYMENTS_MODAL_EDIT_TITLE")
                    : t("PSYCHOLOGIST_PATIENT_PAYMENTS_MODAL_REGISTER_TITLE")}
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
                const parsed =
                  typeof amount === "number"
                    ? amount
                    : Number(
                        String(amount)
                          .replace(/\./g, "")
                          .replace(",", ".")
                          .replace(/[^\d.]/g, ""),
                      );
                if (!parsed || parsed <= 0) {
                  setFormError(t("PSYCHOLOGIST_PATIENT_PAYMENTS_ERROR_AMOUNT"));
                  return;
                }
                setFormError("");
                void onConfirm(Math.round(parsed * 100), notes.trim());
              }}
            >
              <Flex col wFull gap4>
                <InputForm currency value={amount} onChange={setAmount}>
                  {t("PSYCHOLOGIST_PATIENT_PAYMENTS_AMOUNT_LABEL")}
                </InputForm>
                <InputForm
                  textarea
                  rows={3}
                  value={notes}
                  onChange={(value) => setNotes(String(value))}
                >
                  {t("PSYCHOLOGIST_PATIENT_PAYMENTS_NOTES_LABEL")}
                </InputForm>
                {formError ? (
                  <Title s2 error block>
                    {formError}
                  </Title>
                ) : null}
                <Title s2 gray block>
                  {t("PSYCHOLOGIST_PATIENT_PAYMENTS_MODAL_MONTH_HINT")} {billingMonth.slice(0, 7)}
                </Title>
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
                    <Button type="submit" wFull clickable={!saving}>
                      {saving
                        ? t("PSYCHOLOGIST_PATIENTS_SAVING")
                        : t("PSYCHOLOGIST_PATIENT_PAYMENTS_MODAL_SAVE")}
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
