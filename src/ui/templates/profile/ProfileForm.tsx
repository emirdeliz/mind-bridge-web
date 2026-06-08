import { useState } from "react";

import type { UserProfile } from "@api";
import { Button, Flex, Title } from "@atoms";
import { DEFAULT_APP_LANGUAGE, useI18n } from "@i18n";
import { Card, Form, FormGroup, InputForm, LanguageSelect } from "@molecules";

interface ProfileFormProps {
  initialData: UserProfile;
  onSave: (data: UserProfile) => void | Promise<void>;
}

export const ProfileForm = ({ initialData, onSave }: ProfileFormProps) => (
  <ProfileFormContent initialData={initialData} onSave={onSave} />
);

const ProfileFormContent = ({ initialData, onSave }: ProfileFormProps) => {
  const { t, language: activeLanguage } = useI18n();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<UserProfile>({
    ...initialData,
    language: initialData.language ?? activeLanguage ?? DEFAULT_APP_LANGUAGE,
  });

  return (
    <Card padding="lg" shadow="md">
      <Title fs3 fw3 mb2>
        {t("PROFILE_IDENTIFICATION")}
      </Title>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          if (saving) return;
          setSaving(true);
          void Promise.resolve(onSave(data)).finally(() => setSaving(false));
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
        <FormGroup label={t("PROFILE_LANGUAGE")} helpText={t("PROFILE_LANGUAGE_HELP")}>
          <LanguageSelect
            value={data.language ?? DEFAULT_APP_LANGUAGE}
            onChange={(language) => setData({ ...data, language })}
          />
        </FormGroup>
        <Button type="submit" wFull clickable={!saving}>
          {t("SAVE_PROFILE")}
        </Button>
      </Form>
    </Card>
  );
};
