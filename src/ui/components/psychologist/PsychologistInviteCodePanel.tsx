import { useCallback, useEffect, useState } from 'react';

import {
  getPsychologistInviteCodeApi,
  // regeneratePsychologistInviteCodeApi,
} from '@api';
import { Button, Flex, Loading, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card } from '@molecules';

export const PsychologistInviteCodePanel = () => {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  // const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const loadCode = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPsychologistInviteCodeApi();
      setCode(data.code);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t('PSYCHOLOGIST_INVITE_CODE_LOAD_ERROR')
      );
      setCode('');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadCode();
  }, [loadCode]);

  const handleCopy = async () => {
    if (!code || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  // const handleRegenerate = async () => {
  //   if (
  //     !window.confirm(t("PSYCHOLOGIST_INVITE_CODE_REGENERATE_CONFIRM"))
  //   ) {
  //     return;
  //   }
  //
  //   setRegenerating(true);
  //   setError("");
  //   try {
  //     const data = await regeneratePsychologistInviteCodeApi();
  //     setCode(data.code);
  //   } catch (regenerateError) {
  //     setError(
  //       regenerateError instanceof Error
  //         ? regenerateError.message
  //         : t("PSYCHOLOGIST_INVITE_CODE_REGENERATE_ERROR")
  //     );
  //   } finally {
  //     setRegenerating(false);
  //   }
  // };

  return (
    <Card padding='md' shadow='sm'>
      <Flex col wFull gap4>
        <Flex col wFull gap2>
          <Title fs4 fw3 block>
            {t('PSYCHOLOGIST_INVITE_CODE_TITLE')}
          </Title>
          <Title hint gray block leadingRelaxed>
            {t('PSYCHOLOGIST_INVITE_CODE_HINT')}
          </Title>
        </Flex>
        {loading ? (
          <Flex row wFull alignCenter py2>
            <Loading />
          </Flex>
        ) : error ? (
          <Title s2 error block>
            {error}
          </Title>
        ) : (
          <Flex row wFull wrap alignCenter gap2>
            <code className='inline-flex items-center rounded-md border-2 border-mb-accent/30 bg-mb-accent/10 px-4 py-2 text-sm font-semibold tracking-[0.2em] text-mb-accent'>
              {code}
            </code>
            <Button
              type='button'
              variant='secondary'
              outlined
              onClick={() => void handleCopy()}
            >
              {copied
                ? t('PSYCHOLOGIST_INVITE_CODE_COPIED')
                : t('PSYCHOLOGIST_INVITE_CODE_COPY')}
            </Button>
            {/* <Button
              type="button"
              variant="secondary"
              outlined
              clickable={!regenerating}
              onClick={() => void handleRegenerate()}
            >
              {regenerating
                ? t("PSYCHOLOGIST_INVITE_CODE_REGENERATING")
                : t("PSYCHOLOGIST_INVITE_CODE_REGENERATE")}
            </Button> */}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};
