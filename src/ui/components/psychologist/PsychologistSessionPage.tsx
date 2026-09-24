import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type { ClinicalChatMessageDto } from '@api';
import {
  endPsychologistSessionApi,
  savePsychologistPatientClinicalContentApi,
} from '@api';
import {
  resolveChatShortcutTranslation,
  useAiAgent,
  usePsychologistChatShortcuts,
  usePsychologistClinicalContent,
} from '@services';
import { Button, Flex, Title } from '@atoms';
import { useI18n } from '@i18n';
import {
  Card,
  ConfirmModal,
  PageLoader,
  TextAreaWithSave,
} from '@molecules';
import { AppShell, ChatPanel, DashboardSectionTitle, InteractionSummaryBody } from '@templates';

import {
  AGENTIC_SUMMARY_PAGE_SIZE,
  getCurrentSessionNoteIndex,
  getPreviousSessionsAgenticSummaries,
} from './psychologistSessionTypes';
import { SessionHistoryNavButtons } from './SessionHistoryNavButtons';
import { SessionInsightBody } from './SessionInsightBody';
import { usePsychologistGuard } from './usePsychologistGuard';

const toChatMessages = (seed: ClinicalChatMessageDto[]) =>
  seed.map((item) => ({
    id: item.id,
    sender: item.sender,
    text: item.text,
    createdAt: item.createdAt,
  }));

export const PsychologistSessionPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();
  const patientId =
    typeof router.query.patientId === 'string'
      ? router.query.patientId
      : undefined;
  const patientName =
    typeof router.query.patientName === 'string' &&
    router.query.patientName.trim()
      ? router.query.patientName
      : undefined;

  const {
    content,
    loading: contentLoading,
    reload: reloadContent,
  } = usePsychologistClinicalContent(patientId);
  const sessionNotes = content?.sessionNotes ?? [];
  const [psychologistContext, setPsychologistContext] = useState('');
  const [sessionNotesById, setSessionNotesById] = useState<
    Record<string, string>
  >({});
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [agenticSummaryPage, setAgenticSummaryPage] = useState(0);
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [endSessionModalVisible, setEndSessionModalVisible] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  const currentSessionNoteIndex = getCurrentSessionNoteIndex(sessionNotes);
  const currentSessionNote =
    currentSessionNoteIndex >= 0
      ? sessionNotes[currentSessionNoteIndex]
      : undefined;
  const currentSessionConsiderations = currentSessionNote
    ? (sessionNotesById[currentSessionNote.id] ??
      currentSessionNote.content ??
      '')
    : '';

  const { messages, sendMessage, setMessages, sending } = useAiAgent({
    mode: 'psychologist',
    patientId,
    clinicalContext: psychologistContext,
    sessionConsiderations: currentSessionConsiderations,
  });

  const { shortcuts: psychologistShortcutRecords } =
    usePsychologistChatShortcuts();

  const psychologistChatShortcuts = useMemo(
    () =>
      psychologistShortcutRecords.map((shortcut) => {
        const translation = resolveChatShortcutTranslation(shortcut, language);
        return {
          id: shortcut.id,
          label: translation.label,
          message: translation.message,
        };
      }),
    [language, psychologistShortcutRecords]
  );

  useEffect(() => {
    if (!content) return;
    setPsychologistContext(content.sessionContext ?? '');
    setSessionNotesById(
      Object.fromEntries(
        content.sessionNotes.map((entry) => [entry.id, entry.content])
      )
    );
    const currentIndex = getCurrentSessionNoteIndex(content.sessionNotes);
    setSelectedSessionIndex(currentIndex >= 0 ? currentIndex : 0);
    const seedMessages = toChatMessages(content.psychologistChatSeed);
    setMessages((prev) => {
      if (
        !seedMessages.length ||
        !prev.length ||
        seedMessages.length >= prev.length
      ) {
        return seedMessages;
      }
      return prev;
    });
  }, [content, setMessages]);

  const chatMessages = messages;

  const selectedSession = sessionNotes[selectedSessionIndex];
  const isViewingPreviousSession = Boolean(
    selectedSession && selectedSession.isCurrent !== true
  );
  const sessionNotesValue = selectedSession
    ? (sessionNotesById[selectedSession.id] ?? selectedSession.content ?? '')
    : '';
  const canGoToOlderSession = selectedSessionIndex < sessionNotes.length - 1;
  const canGoToNewerSession = selectedSessionIndex > 0;
  const olderSession = canGoToOlderSession
    ? sessionNotes[selectedSessionIndex + 1]
    : undefined;
  const newerSession = canGoToNewerSession
    ? sessionNotes[selectedSessionIndex - 1]
    : undefined;

  const previousSessionsAgenticSummaries =
    getPreviousSessionsAgenticSummaries(sessionNotes);
  const agenticSummaryMaxPage = Math.max(
    0,
    Math.ceil(
      previousSessionsAgenticSummaries.length / AGENTIC_SUMMARY_PAGE_SIZE
    ) - 1
  );
  const canGoAgenticOlder = agenticSummaryPage < agenticSummaryMaxPage;
  const canGoAgenticNewer = agenticSummaryPage > 0;
  const agenticWindowStart = agenticSummaryPage * AGENTIC_SUMMARY_PAGE_SIZE;
  const visibleAgenticSummaries = previousSessionsAgenticSummaries.slice(
    agenticWindowStart,
    agenticWindowStart + AGENTIC_SUMMARY_PAGE_SIZE
  );
  const agenticRangeLabel =
    visibleAgenticSummaries.length > 0
      ? `${visibleAgenticSummaries[0].sessionDate} – ${visibleAgenticSummaries[visibleAgenticSummaries.length - 1].sessionDate}`
      : '';
  const olderAgenticBatch =
    previousSessionsAgenticSummaries[
      agenticWindowStart + AGENTIC_SUMMARY_PAGE_SIZE
    ];
  const newerAgenticBatch =
    previousSessionsAgenticSummaries[
      agenticWindowStart - AGENTIC_SUMMARY_PAGE_SIZE
    ];

  const saveSessionConsiderations = useCallback(async () => {
    if (
      !patientId ||
      isViewingPreviousSession ||
      !selectedSession ||
      savingNotes
    ) {
      return;
    }

    setSavingNotes(true);
    setSaveError('');

    try {
      await savePsychologistPatientClinicalContentApi(patientId, {
        currentSessionNoteContent:
          sessionNotesById[selectedSession.id] ?? selectedSession.content ?? '',
        language,
      });
      await reloadContent({ silent: true });
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : t('SESSION_SAVE_ERROR')
      );
    } finally {
      setSavingNotes(false);
    }
  }, [
    patientId,
    isViewingPreviousSession,
    selectedSession,
    savingNotes,
    sessionNotesById,
    language,
    reloadContent,
    t,
  ]);

  const confirmEndSession = useCallback(async () => {
    if (!patientId || endingSession) {
      return;
    }

    setEndingSession(true);
    setSaveError('');

    try {
      const considerationsForEndSession =
        currentSessionNote && !isViewingPreviousSession
          ? (sessionNotesById[currentSessionNote.id] ??
            currentSessionNote.content ??
            '')
          : currentSessionConsiderations;

      await endPsychologistSessionApi(patientId, {
        currentSessionNoteContent: considerationsForEndSession,
        language,
      });
      setEndSessionModalVisible(false);
      setMessages([]);
      setSelectedSessionIndex(0);
      setAgenticSummaryPage(0);
      await reloadContent({ silent: true });
    } catch (error) {
      setEndSessionModalVisible(false);
      setSaveError(
        error instanceof Error ? error.message : t('SESSION_END_ERROR')
      );
    } finally {
      setEndingSession(false);
    }
  }, [
    patientId,
    endingSession,
    currentSessionConsiderations,
    currentSessionNote,
    isViewingPreviousSession,
    sessionNotesById,
    language,
    reloadContent,
    setMessages,
    t,
  ]);

  if (!isPsychologist && !guardLoading) {
    return null;
  }

  if (!patientId && !guardLoading) {
    return null;
  }

  const showFullPageLoader =
    guardLoading || !patientId || (contentLoading && !content);

  const sessionSubtitle = patientName
    ? `${t('PSYCHOLOGIST_SESSION_SUBTITLE')} — ${patientName}`
    : t('PSYCHOLOGIST_SESSION_SUBTITLE');

  const insights = content?.sessionInsights ?? [];
  const interactionSummaryText =
    content?.patientSummary?.trim() ||
    content?.psychologistSummary?.trim() ||
    '';
  const hasInteractionSummary = Boolean(interactionSummaryText);

  return (
    <AppShell
      title={t('PSYCHOLOGIST_SESSION_TITLE')}
      subtitle={sessionSubtitle}
      variant='dashboard'
      breadcrumbs={[
        {
          label: t('PSYCHOLOGIST_PATIENTS_NAV'),
          href: '/psychologist/patients',
        },
        ...(patientName
          ? [
              {
                label: patientName,
                href: `/psychologist?patientId=${encodeURIComponent(patientId ?? '')}&patientName=${encodeURIComponent(patientName)}`,
              },
            ]
          : []),
        { label: t('PSYCHOLOGIST_SESSION_TITLE') },
      ]}
    >
      <Flex row wFull alignCenter justifyEnd wrap gap4>
        <Button
          type='button'
          clickable={!endingSession}
          onClick={() => setEndSessionModalVisible(true)}
        >
          {endingSession ? t('SESSION_ENDING') : t('END_SESSION')}
        </Button>
      </Flex>

      {showFullPageLoader ? (
        <PageLoader />
      ) : (
        <>
          <ConfirmModal
            visible={endSessionModalVisible}
            title={t('END_SESSION_CONFIRM_TITLE')}
            message={t('END_SESSION_CONFIRM_MESSAGE')}
            confirmLabel={t('END_SESSION')}
            cancelLabel={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
            confirmVariant='danger'
            onClose={() => {
              if (!endingSession) {
                setEndSessionModalVisible(false);
              }
            }}
            onConfirm={() => void confirmEndSession()}
          />
          {saveError ? (
            <Title s1 gray>
              {saveError}
            </Title>
          ) : null}
          <Flex col wFull gap4>
            <Card padding='lg' shadow='md'>
              <DashboardSectionTitle
                title={t('SESSION_CONSIDERATIONS')}
                tooltip={t('TOOLTIP_PSYCHOLOGIST_SESSION_NOTES')}
              />
              <Flex row wFull alignCenter justifySpaceBetween wrap gap4 mb4>
                <Title s1 gray>
                  {selectedSession?.label}
                </Title>
                <SessionHistoryNavButtons
                  canGoOlder={canGoToOlderSession}
                  canGoNewer={canGoToNewerSession}
                  onGoOlder={() =>
                    setSelectedSessionIndex((index) =>
                      Math.min(sessionNotes.length - 1, index + 1)
                    )
                  }
                  onGoNewer={() =>
                    setSelectedSessionIndex((index) => Math.max(0, index - 1))
                  }
                  olderTooltip={
                    olderSession
                      ? `${t('SESSION_NOTES_PREVIOUS')}: ${olderSession.label}`
                      : t('SESSION_NOTES_PREVIOUS')
                  }
                  newerTooltip={
                    newerSession
                      ? `${t('SESSION_NOTES_NEXT')}: ${newerSession.label}`
                      : t('SESSION_NOTES_NEXT')
                  }
                />
              </Flex>
              {isViewingPreviousSession ? (
                <Title hint gray mb4>
                  {t('SESSION_NOTES_READONLY_HINT')}
                </Title>
              ) : null}
              <Flex col wFull>
                <TextAreaWithSave
                  rows={6}
                  placeholder={t('SESSION_CONSIDERATIONS_PLACEHOLDER')}
                  value={sessionNotesValue}
                  readOnly={isViewingPreviousSession}
                  saveLabel={t('SAVE')}
                  onSave={
                    isViewingPreviousSession
                      ? undefined
                      : () => void saveSessionConsiderations()
                  }
                  onChange={(event) => {
                    if (isViewingPreviousSession || !selectedSession) return;
                    setSessionNotesById((prev) => ({
                      ...prev,
                      [selectedSession.id]: event.target.value,
                    }));
                  }}
                />
              </Flex>
            </Card>
            <ChatPanel
              messages={chatMessages}
              onSend={sendMessage}
              sending={sending}
              tallScroll
              speechAudience='psychologist'
              sectionTooltip={t('TOOLTIP_PSYCHOLOGIST_CHAT')}
              shortcuts={psychologistChatShortcuts}
              shortcutsManageHref='/psychologist/settings#chat-shortcuts'
            />
            <Card padding='lg' shadow='md'>
              <DashboardSectionTitle
                title={t('INTERACTION_SUMMARY')}
                tooltip={t('TOOLTIP_PSYCHOLOGIST_SUMMARY')}
              />
              {hasInteractionSummary ? (
                <InteractionSummaryBody text={interactionSummaryText} />
              ) : (
                <Title s1 gray>
                  {t('AI_SUMMARY_NO_INTERACTIONS')}
                </Title>
              )}
            </Card>
            <Card padding='lg' shadow='md'>
              <DashboardSectionTitle
                title={t('PSYCHOLOGIST_INSIGHTS_TITLE')}
                tooltip={t('TOOLTIP_PSYCHOLOGIST_INSIGHTS')}
              />
              <Flex col wFull gap4>
                {insights.length ? (
                  insights.map((insight) => (
                    <Flex col wFull key={insight.title} gap1>
                      <Title s2 textAccent>
                        {insight.title}
                      </Title>
                      <SessionInsightBody
                        title={insight.title}
                        body={insight.body}
                      />
                    </Flex>
                  ))
                ) : (
                  <Title s1 gray>
                    {t('AI_SUMMARY_NO_INTERACTIONS')}
                  </Title>
                )}
              </Flex>
            </Card>
            {previousSessionsAgenticSummaries.length > 0 ? (
              <Card padding='lg' shadow='md'>
                <DashboardSectionTitle
                  title={t('SESSION_NOTES_AGENTIC_SUMMARY')}
                  tooltip={t('TOOLTIP_SESSION_NOTES_AGENTIC_SUMMARY')}
                />
                <Flex row wFull alignCenter justifySpaceBetween wrap gap4 mb4>
                  <Title s1 gray>
                    {agenticRangeLabel}
                  </Title>
                  <SessionHistoryNavButtons
                    canGoOlder={canGoAgenticOlder}
                    canGoNewer={canGoAgenticNewer}
                    onGoOlder={() =>
                      setAgenticSummaryPage((page) =>
                        Math.min(agenticSummaryMaxPage, page + 1)
                      )
                    }
                    onGoNewer={() =>
                      setAgenticSummaryPage((page) => Math.max(0, page - 1))
                    }
                    olderTooltip={
                      olderAgenticBatch
                        ? `${t('SESSION_NOTES_PREVIOUS')}: ${olderAgenticBatch.sessionDate}`
                        : t('SESSION_NOTES_PREVIOUS')
                    }
                    newerTooltip={
                      newerAgenticBatch
                        ? `${t('SESSION_NOTES_NEXT')}: ${newerAgenticBatch.sessionDate}`
                        : t('SESSION_NOTES_NEXT')
                    }
                  />
                </Flex>
                <Flex col wFull gap4>
                  {visibleAgenticSummaries.map((entry) => (
                    <Flex col wFull key={entry.id} gap1>
                      <Title s2 textAccent>
                        {entry.label}
                      </Title>
                      <Title s1 gray>
                        {entry.agenticSummary}
                      </Title>
                    </Flex>
                  ))}
                </Flex>
              </Card>
            ) : null}
          </Flex>
        </>
      )}
    </AppShell>
  );
};
