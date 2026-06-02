import { useState } from "react";

import type { UserProfile } from "@api/dto/auth/AuthDto";
import { Button, Flex } from "@atoms";
import { Card, Form, InputForm } from "@molecules";

interface ProfileFormProps {
  initialData: UserProfile;
  onSave: (data: UserProfile) => void;
}

export const ProfileForm = ({ initialData, onSave }: ProfileFormProps) => (
  <ProfileFormContent initialData={initialData} onSave={onSave} />
);

const ProfileFormContent = ({ initialData, onSave }: ProfileFormProps) => {
  const [data, setData] = useState<UserProfile>(initialData);

  return (
    <Card padding="lg" shadow="md">
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(data);
        }}
      >
        <InputForm
          value={data.fullName}
          placeholder="Full name"
          onChange={(value) => setData({ ...data, fullName: String(value) })}
        >
          Full name
        </InputForm>
        <Flex row wrap gap={16}>
          <Flex flex1>
            <InputForm value={data.age} placeholder="Age" onChange={(value) => setData({ ...data, age: String(value) })}>
              Age
            </InputForm>
          </Flex>
          <Flex flex1>
            <InputForm
              value={data.phone}
              placeholder="Phone"
              onChange={(value) => setData({ ...data, phone: String(value) })}
            >
              Phone
            </InputForm>
          </Flex>
        </Flex>
        <InputForm
          value={data.address}
          placeholder="Address"
          onChange={(value) => setData({ ...data, address: String(value) })}
        >
          Address
        </InputForm>
        <Button type="submit" wFull>
          Save profile
        </Button>
      </Form>
    </Card>
  );
};
