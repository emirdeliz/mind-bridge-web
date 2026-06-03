import { useState } from "react";

import type { UserProfile } from "@api";
import { Button, Flex, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form, InputForm } from "@molecules";

interface ProfileFormProps {
  initialData: UserProfile;
  onSave: (data: UserProfile) => void;
}

export const ProfileForm = ({ initialData, onSave }: ProfileFormProps) => (
  <ProfileFormContent initialData={initialData} onSave={onSave} />
);

const ProfileFormContent = ({ initialData, onSave }: ProfileFormProps) => {
  const { t } = useI18n();
  const [data, setData] = useState<UserProfile>(initialData);

  return (
    <Card padding="lg" shadow="md">
      <Title fs3 fw3 mb2>
        {t("PROFILE_IDENTIFICATION")}
      </Title>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(data);
        }}
      >
        <InputForm
          value={data.fullName}
          placeholder={t("PROFILE_FULL_NAME_PLACEHOLDER")}
          onChange={(value) => setData({ ...data, fullName: String(value) })}
        >
          {t("PROFILE_FULL_NAME_PLACEHOLDER")}
        </InputForm>
        <Flex row wrap wFull gap4 alignStretch>
          <Flex flex1 wFull>
            <InputForm
              value={data.age}
              placeholder={t("PROFILE_AGE_PLACEHOLDER")}
              onChange={(value) => setData({ ...data, age: String(value) })}
            >
              {t("PROFILE_AGE_PLACEHOLDER")}
            </InputForm>
          </Flex>
          <Flex flex1 wFull>
            <InputForm
              value={data.phone}
              placeholder={t("PROFILE_PHONE_PLACEHOLDER")}
              onChange={(value) => setData({ ...data, phone: String(value) })}
            >
              {t("PROFILE_PHONE_PLACEHOLDER")}
            </InputForm>
          </Flex>
        </Flex>
        <InputForm
          value={data.address}
          placeholder={t("PROFILE_ADDRESS_PLACEHOLDER")}
          onChange={(value) => setData({ ...data, address: String(value) })}
        >
          {t("PROFILE_ADDRESS_PLACEHOLDER")}
        </InputForm>
        <Button type="submit" wFull>
          {t("SAVE_PROFILE")}
        </Button>
      </Form>
    </Card>
  );
};
