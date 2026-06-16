import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { isValidPhone, phoneDigits } from '@helpers';
import { getRoleRoute, useAuth } from '@services';
import { Button, Flex, Input, RouteLink, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, Form, FormError, PageLoader } from '@molecules';
import { AppShell } from '@templates';

type RegisterRole = 'psychologist' | 'patient';

const resolveRegisterRole = (
  value: string | string[] | undefined
): RegisterRole => (value === 'patient' ? 'patient' : 'psychologist');

export const RegisterPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading, registerPublicAccount } = useAuth();
  const registerRole = resolveRegisterRole(router.query.role);
  const isPatientRegister = registerRole === 'patient';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading || !session) return;
    void router.replace(getRoleRoute(session.role));
  }, [loading, session, router]);

  useEffect(() => {
    if (!router.isReady || registerRole !== 'patient') {
      return;
    }

    const codeFromQuery = router.query.code;
    if (typeof codeFromQuery === 'string' && codeFromQuery.trim()) {
      setInviteCode(codeFromQuery.trim().toUpperCase());
    }
  }, [router.isReady, router.query.code, registerRole]);

  if (loading || session) {
    return (
      <AppShell
        title={t('APP_TITLE')}
        subtitle={
          isPatientRegister
            ? t('REGISTER_PATIENT_SUBTITLE')
            : t('REGISTER_PSYCHOLOGIST_SUBTITLE')
        }
        variant='auth'
      >
        <PageLoader />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t('APP_TITLE')}
      subtitle={
        isPatientRegister
          ? t('REGISTER_PATIENT_SUBTITLE')
          : t('REGISTER_PSYCHOLOGIST_SUBTITLE')
      }
      variant='auth'
    >
      <Card padding='lg' shadow='md'>
        <Title fs3 fw3 mb2>
          {isPatientRegister
            ? t('REGISTER_PATIENT_TITLE')
            : t('REGISTER_PSYCHOLOGIST_TITLE')}
        </Title>
        <Title s2 gray mb4 block leadingRelaxed>
          {isPatientRegister
            ? t('REGISTER_PATIENT_HINT')
            : t('REGISTER_PSYCHOLOGIST_HINT')}
        </Title>
        <Form
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');

            if (isPatientRegister && !fullName.trim()) {
              setError(t('REGISTER_ERROR_FULL_NAME_REQUIRED'));
              return;
            }

            if (!email.trim()) {
              setError(t('REGISTER_ERROR_EMAIL_REQUIRED'));
              return;
            }

            if (!isValidPhone(phone)) {
              setError(t('REGISTER_ERROR_PHONE_REQUIRED'));
              return;
            }

            if (!password.trim()) {
              setError(t('REGISTER_ERROR_PASSWORD_REQUIRED'));
              return;
            }

            try {
              await registerPublicAccount({
                email: email.trim(),
                phone: phoneDigits(phone),
                password,
                role: registerRole,
                provider: 'password',
                fullName: isPatientRegister ? fullName.trim() : undefined,
                inviteCode:
                  isPatientRegister && inviteCode.trim()
                    ? inviteCode.trim()
                    : undefined,
              });
              void router.replace('/?registered=1');
            } catch (registerError) {
              setError(
                registerError instanceof Error
                  ? registerError.message
                  : t('REGISTER_ERROR_GENERIC')
              );
            }
          }}
        >
          {isPatientRegister ? (
            <Input
              placeholder={t('REGISTER_FULL_NAME_PLACEHOLDER')}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          ) : null}
          <Input
            placeholder={t('EMAIL')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            phone
            placeholder={t('REGISTER_PHONE_PLACEHOLDER')}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Title s2 gray block>
            {t('REGISTER_PHONE_HELP')}
          </Title>
          <Input
            placeholder={t('PASSWORD')}
            password
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {isPatientRegister ? (
            <Input
              placeholder={t('REGISTER_INVITE_CODE_PLACEHOLDER')}
              value={inviteCode}
              onChange={(event) =>
                setInviteCode(event.target.value.toUpperCase())
              }
            />
          ) : null}
          {isPatientRegister ? (
            <Title s2 gray block>
              {t('REGISTER_INVITE_CODE_HELP')}
            </Title>
          ) : null}
          <FormError error={error}>
            <Button type='submit' wFull>
              {isPatientRegister
                ? t('CREATE_PATIENT_ACCOUNT')
                : t('CREATE_PSYCHOLOGIST_ACCOUNT')}
            </Button>
          </FormError>
        </Form>
        <Flex col wFull mt6 gap4 alignCenter>
          <Flex row justifyCenter alignCenter wrap gap2 wFull>
            <Title s1 gray center>
              {t('AUTH_OR')}
            </Title>
            <RouteLink href='/' inline>
              {t('AUTH_LOGIN_LINK')}
            </RouteLink>
          </Flex>
          <Flex row justifyCenter alignCenter wrap gap2 wFull>
            <Title s1 gray center>
              {isPatientRegister
                ? t('REGISTER_SWITCH_PSYCHOLOGIST_PROMPT')
                : t('REGISTER_SWITCH_PATIENT_PROMPT')}
            </Title>
            <RouteLink
              href={isPatientRegister ? '/register' : '/register?role=patient'}
              inline
            >
              {isPatientRegister
                ? t('AUTH_REGISTER_PSYCHOLOGIST_LINK')
                : t('AUTH_REGISTER_PATIENT_LINK')}
            </RouteLink>
          </Flex>
        </Flex>
      </Card>
    </AppShell>
  );
};
