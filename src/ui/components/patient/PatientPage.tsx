import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import type { ClinicalChatMessageDto, LikertCheckInDto } from '@api';
import {
  type ChatMessage,
  getRoleRoute,
  useAiAgent,
  useAuth,
  usePatientClinicalContent,
} from '@services';
import { Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, InteractionSummaryBody, PageLoader } from '@molecules';
import { AppShell, ChatPanel, DashboardSectionTitle } from '@templates';

import { PatientLikertCheckInPanel } from './PatientLikertCheckInPanel';

const toChatMessages = (seed: ClinicalChatMessageDto[]): ChatMessage[] =>
  seed.map((item) => ({
    id: item.id,
    sender: item.sender,
    text: item.text,
    createdAt: item.createdAt,
    interactionId: item.interactionId,
    isInteractionStart: item.isInteractionStart,
    isInteractionEnd: item.isInteractionEnd,
  }));

export const PatientPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading } = useAuth();
  const { content, loading: contentLoading, reload } = usePatientClinicalContent();
  const [likertCheckIn, setLikertCheckIn] = useState<LikertCheckInDto | null>(
    null
  );
  const { messages, sendMessage, setMessages, sending } = useAiAgent({
    mode: 'patient',
    onChatComplete: () => {
      void reload({ silent: true });
    },
  });

  useEffect(() => {
    setLikertCheckIn(content?.likertCheckIn ?? null);
  }, [content?.likertCheckIn?.updatedAt]);

  useEffect(() => {
    if (!content?.patientChatSeed) {
      return;
    }

    const seedMessages = toChatMessages(content.patientChatSeed);
    setMessages((prev) => {
      if (!prev.length) {
        return seedMessages;
      }

      if (seedMessages.length > prev.length) {
        return seedMessages;
      }

      return prev;
    });
  }, [content, setMessages]);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void router.replace('/');
      return;
    }
    if (session.role !== 'patient') {
      void router.replace(getRoleRoute(session.role));
    }
  }, [loading, session, router]);

  const isPatient = session?.role === 'patient';
  if (!isPatient && !loading) {
    return null;
  }

  const showFullPageLoader =
    loading || (contentLoading && !content) || !isPatient;

  const patientSummaryText = content?.patientSummary?.trim() ?? '';
  const hasPatientSummary = Boolean(patientSummaryText);

  return (
    <AppShell
      title={t('PATIENT_CHAT_NAV')}
      subtitle={t('PATIENT_AREA_SUBTITLE')}
      variant='dashboard'
    >
      {showFullPageLoader ? (
        <PageLoader />
      ) : (
        <>
          <PatientLikertCheckInPanel
            checkIn={likertCheckIn}
            onCheckInChange={setLikertCheckIn}
          />
          <ChatPanel
            messages={messages}
            onSend={(text) => void sendMessage(text)}
            sending={sending}
            showInteractionDividers
            sectionTooltip={t('TOOLTIP_PATIENT_CHAT')}
          />
          <Card padding='lg' shadow='md'>
            <DashboardSectionTitle
              title={t('INTERACTION_SUMMARY')}
              tooltip={t('TOOLTIP_PATIENT_SUMMARY')}
            />
            {hasPatientSummary ? (
              <InteractionSummaryBody text={patientSummaryText} />
            ) : (
              <Title s1 gray>
                {t('AI_SUMMARY_NO_INTERACTIONS')}
              </Title>
            )}
          </Card>
        </>
      )}
    </AppShell>
  );
};
