import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getHomeRoute, getRoleRoute, useAuth } from '@services';
import { Button, Flex, Input, RouteLink, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Form, FormError, LanguageSwitcher, PageLoader } from '@molecules';
import { AuthFormCard } from '@templates';
import { AppShell, LoginSplitLayout } from '@templates';

import loginBgImage from './assets/bg.png';

export const HomePage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const {
    session,
    loading,
    loginWithPassword,
    requestPasswordReset,
    enterBypass,
    isAuthBypassEnabled,
  } = useAuth();
  const authBypass = isAuthBypassEnabled();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const registeredSuccess = router.query.registered === '1';

  useEffect(() => {
    if (loading || !session) return;
    void router.replace(
      getHomeRoute({ role: session.role, isAdmin: session.isAdmin })
    );
  }, [loading, session, router]);

  const navigateAfterLogin = (user: {
    role: 'patient' | 'psychologist';
    isAdmin?: boolean;
  }) => {
    void router.replace(
      getHomeRoute({ role: user.role, isAdmin: user.isAdmin })
    );
  };

  const handleForgotPassword = async () => {
    setError('');
    setForgotMessage('');
    setForgotSending(true);

    const result = await requestPasswordReset(email);

    setForgotSending(false);

    if (authBypass) {
      setForgotMessage(t('FORGOT_PASSWORD_UNAVAILABLE'));
      return;
    }

    if (!result.ok) {
      setError(result.message ?? t('FORGOT_PASSWORD_ERROR'));
      return;
    }

    setForgotMessage(t('FORGOT_PASSWORD_SUCCESS'));
  };

  const loginForm = loading || session ? (
    <PageLoader />
  ) : (
    <AuthFormCard logoAlt={t('APP_TITLE')} appName={t('APP_BRAND_NAME')}>
        {forgotMode ? (
          <Title fs3 fw3 mb2>
            {t('FORGOT_PASSWORD_TITLE')}
          </Title>
        ) : null}

        {registeredSuccess && !forgotMode ? (
          <Title s2 textAccent mb2 block leadingRelaxed>
            {t('REGISTER_SUCCESS_LOGIN')}
          </Title>
        ) : null}

        {forgotMode ? (
          <Form
            onSubmit={async (event) => {
              event.preventDefault();
              await handleForgotPassword();
            }}
          >
            <Title hint gray mb2 block leadingRelaxed>
              {t('FORGOT_PASSWORD_HINT')}
            </Title>
            <Input
              placeholder={t('EMAIL')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {forgotMessage ? (
              <Title s2 textAccent block>
                {forgotMessage}
              </Title>
            ) : null}
            <FormError error={error}>
              <Button type='submit' wFull clickable={!forgotSending}>
                {forgotSending
                  ? t('FORGOT_PASSWORD_SENDING')
                  : t('FORGOT_PASSWORD_SEND')}
              </Button>
            </FormError>
            <Button
              type='button'
              variant='secondary'
              outlined
              wFull
              onClick={() => {
                setForgotMode(false);
                setForgotMessage('');
                setError('');
              }}
            >
              {t('FORGOT_PASSWORD_BACK')}
            </Button>
          </Form>
        ) : (
          <>
            <Form
              onSubmit={async (event) => {
                event.preventDefault();
                setError('');
                try {
                  const user = await loginWithPassword(email, password);
                  if (!user?.role) {
                    setError(t('INVALID_CREDENTIALS'));
                    return;
                  }
                  navigateAfterLogin(user);
                } catch (loginError) {
                  setError(
                    loginError instanceof Error
                      ? loginError.message
                      : t('INVALID_CREDENTIALS')
                  );
                }
              }}
            >
              <Input
                placeholder={t('EMAIL')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                placeholder={t('PASSWORD')}
                password
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Flex row justifyEnd wFull>
                <button
                  type='button'
                  className='mb-auth-text-link text-sm'
                  onClick={() => {
                    setForgotMode(true);
                    setError('');
                    setForgotMessage('');
                  }}
                >
                  {t('FORGOT_PASSWORD')}
                </button>
              </Flex>
              <FormError error={error}>
                <Button type='submit' wFull>
                  {t('LOGIN_WITH_PASSWORD')}
                </Button>
              </FormError>
            </Form>
            <Flex row justifyCenter alignCenter wrap gap2 mt6 wFull>
              <Title hint gray center>
                {t('AUTH_REGISTER_PROMPT_PREFIX')}
              </Title>
              <RouteLink href='/register' inline>
                {t('AUTH_REGISTER_AS_PSYCHOLOGIST')}
              </RouteLink>
              <Title hint gray center>
                {t('AUTH_OR')}
              </Title>
              <RouteLink href='/register?role=patient' inline>
                {t('AUTH_REGISTER_AS_PATIENT')}
              </RouteLink>
            </Flex>
          </>
        )}

        {authBypass ? (
          <Flex col wFull mt6 gap4>
            <Title hint gray center>
              {t('AUTH_BYPASS_HINT')}
            </Title>
            <Button
              variant='secondary'
              outlined
              wFull
              onClick={async () => {
                await enterBypass('patient');
                void router.push('/patient');
              }}
            >
              {t('AUTH_BYPASS_PATIENT')}
            </Button>
            <Button
              variant='secondary'
              outlined
              wFull
              onClick={async () => {
                await enterBypass('psychologist');
                void router.push('/psychologist/patients');
              }}
            >
              {t('AUTH_BYPASS_PSYCHOLOGIST')}
            </Button>
          </Flex>
        ) : null}
      </AuthFormCard>
  );

  return (
    <AppShell
      title={t('APP_TITLE')}
      subtitle={t('HOME_SUBTITLE')}
      variant='auth'
    >
      <LoginSplitLayout
        formHeader={<LanguageSwitcher />}
        imageSrc={loginBgImage.src}
        imageAlt={t('APP_TITLE')}
      >
        {loginForm}
      </LoginSplitLayout>
    </AppShell>
  );
};
