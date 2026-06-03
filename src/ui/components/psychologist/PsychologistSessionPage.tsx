import { useState } from "react";

import { useAiAgent } from "@services";
import { Flex, RouteLink, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, TextAreaWithSave } from "@molecules";
import { AppShell, ChatPanel, DashboardSectionTitle } from "@templates";

import {
  AGENTIC_SUMMARY_PAGE_SIZE,
  CURRENT_SESSION_NOTE_INDEX,
  MOCK_PSYCHOLOGIST_CHAT,
  MOCK_PSYCHOLOGIST_CONTEXT,
  MOCK_PSYCHOLOGIST_INSIGHTS,
  MOCK_PSYCHOLOGIST_SUMMARY,
  MOCK_SESSION_NOTES_HISTORY,
  previousSessionsAgenticSummaries,
} from "./psychologistMockData";
import { SessionHistoryNavButtons } from "./SessionHistoryNavButtons";
import { usePsychologistGuard } from "./usePsychologistGuard";

export const PsychologistSessionPage = () => {
  const { t } = useI18n();
  const { loading, isPsychologist } = usePsychologistGuard();
  const [psychologistContext, setPsychologistContext] = useState(MOCK_PSYCHOLOGIST_CONTEXT);
  const [sessionNotesById, setSessionNotesById] = useState(() =>
    Object.fromEntries(MOCK_SESSION_NOTES_HISTORY.map((entry) => [entry.id, entry.content])),
  );
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(
    CURRENT_SESSION_NOTE_INDEX >= 0 ? CURRENT_SESSION_NOTE_INDEX : 0,
  );
  const [agenticSummaryPage, setAgenticSummaryPage] = useState(0);
  const { messages, sendMessage } = useAiAgent(psychologistContext);
  const chatMessages = [...MOCK_PSYCHOLOGIST_CHAT, ...messages];

  if (loading || !isPsychologist) {
    return null;
  }

  const selectedSession = MOCK_SESSION_NOTES_HISTORY[selectedSessionIndex];
  const isCurrentSession = Boolean(selectedSession?.isCurrent);
  const sessionNotesValue = selectedSession ? (sessionNotesById[selectedSession.id] ?? "") : "";
  const canGoToOlderSession = selectedSessionIndex < MOCK_SESSION_NOTES_HISTORY.length - 1;
  const canGoToNewerSession = selectedSessionIndex > 0;
  const olderSession = canGoToOlderSession
    ? MOCK_SESSION_NOTES_HISTORY[selectedSessionIndex + 1]
    : undefined;
  const newerSession = canGoToNewerSession
    ? MOCK_SESSION_NOTES_HISTORY[selectedSessionIndex - 1]
    : undefined;

  const agenticSummaryMaxPage = Math.max(
    0,
    Math.ceil(previousSessionsAgenticSummaries.length / AGENTIC_SUMMARY_PAGE_SIZE) - 1,
  );
  const canGoAgenticOlder = agenticSummaryPage < agenticSummaryMaxPage;
  const canGoAgenticNewer = agenticSummaryPage > 0;
  const agenticWindowStart = agenticSummaryPage * AGENTIC_SUMMARY_PAGE_SIZE;
  const visibleAgenticSummaries = previousSessionsAgenticSummaries.slice(
    agenticWindowStart,
    agenticWindowStart + AGENTIC_SUMMARY_PAGE_SIZE,
  );
  const agenticRangeLabel =
    visibleAgenticSummaries.length > 0
      ? `${visibleAgenticSummaries[0].sessionDate} – ${visibleAgenticSummaries[visibleAgenticSummaries.length - 1].sessionDate}`
      : "";
  const olderAgenticBatch = previousSessionsAgenticSummaries[agenticWindowStart + AGENTIC_SUMMARY_PAGE_SIZE];
  const newerAgenticBatch = previousSessionsAgenticSummaries[agenticWindowStart - AGENTIC_SUMMARY_PAGE_SIZE];

  const savePsychologistContext = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mb.psychologist.aiContext", psychologistContext);
    }
  };

  const saveSessionNotes = () => {
    if (!selectedSession?.isCurrent || typeof window === "undefined") return;
    window.localStorage.setItem("mb.psychologist.sessionNotes", sessionNotesValue);
  };

  return (
    <AppShell
      title={t("PSYCHOLOGIST_SESSION_TITLE")}
      subtitle={t("PSYCHOLOGIST_SESSION_SUBTITLE")}
      variant="dashboard"
    >
      <RouteLink href="/psychologist" inline>
        {t("BACK_TO_PSYCHOLOGIST_DASHBOARD")}
      </RouteLink>
      <Flex col wFull gap4>
        <Card padding="lg" shadow="md">
          <DashboardSectionTitle
            title={t("SESSION_NOTES_AGENTIC_SUMMARY")}
            tooltip={t("TOOLTIP_SESSION_NOTES_AGENTIC_SUMMARY")}
          />
          <Flex row wFull alignCenter justifySpaceBetween wrap gap4 mb4>
            <Title s1 gray>
              {agenticRangeLabel}
            </Title>
            <SessionHistoryNavButtons
              canGoOlder={canGoAgenticOlder}
              canGoNewer={canGoAgenticNewer}
              onGoOlder={() => setAgenticSummaryPage((page) => Math.min(agenticSummaryMaxPage, page + 1))}
              onGoNewer={() => setAgenticSummaryPage((page) => Math.max(0, page - 1))}
              olderTooltip={
                olderAgenticBatch
                  ? `${t("SESSION_NOTES_PREVIOUS")}: ${olderAgenticBatch.sessionDate}`
                  : t("SESSION_NOTES_PREVIOUS")
              }
              newerTooltip={
                newerAgenticBatch
                  ? `${t("SESSION_NOTES_NEXT")}: ${newerAgenticBatch.sessionDate}`
                  : t("SESSION_NOTES_NEXT")
              }
            />
          </Flex>
          <Flex col wFull gap5>
            {Array.from({ length: AGENTIC_SUMMARY_PAGE_SIZE }, (_, slotIndex) => {
              const entry = visibleAgenticSummaries[slotIndex];
              if (!entry) {
                return (
                  <Flex col wFull key={`agentic-empty-${agenticSummaryPage}-${slotIndex}`} gap2>
                    <Title fs3 fw3 mb1 gray>
                      —
                    </Title>
                    <Title s1 gray leadingRelaxed>
                      —
                    </Title>
                  </Flex>
                );
              }
              return (
                <Flex col wFull key={entry.id}>
                  <Title fs3 fw3 mb1>
                    {entry.sessionDate}
                  </Title>
                  <Title s1 gray leadingRelaxed>
                    {entry.agenticSummary}
                  </Title>
                </Flex>
              );
            })}
          </Flex>
        </Card>
        <Card padding="lg" shadow="md">
          <DashboardSectionTitle
            title={t("SESSION_CONSIDERATIONS")}
            tooltip={t("TOOLTIP_PSYCHOLOGIST_SESSION_NOTES")}
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
                  Math.min(MOCK_SESSION_NOTES_HISTORY.length - 1, index + 1),
                )
              }
              onGoNewer={() => setSelectedSessionIndex((index) => Math.max(0, index - 1))}
              olderTooltip={
                olderSession
                  ? `${t("SESSION_NOTES_PREVIOUS")}: ${olderSession.label}`
                  : t("SESSION_NOTES_PREVIOUS")
              }
              newerTooltip={
                newerSession ? `${t("SESSION_NOTES_NEXT")}: ${newerSession.label}` : t("SESSION_NOTES_NEXT")
              }
            />
          </Flex>
          {!isCurrentSession ? (
            <Title s1 gray mb4>
              {t("SESSION_NOTES_READONLY_HINT")}
            </Title>
          ) : null}
          <Flex col wFull>
            <TextAreaWithSave
              rows={6}
              placeholder={t("SESSION_CONSIDERATIONS_PLACEHOLDER")}
              value={sessionNotesValue}
              readOnly={!isCurrentSession}
              saveLabel={t("SAVE")}
              onSave={isCurrentSession ? saveSessionNotes : undefined}
              onChange={(event) => {
                if (!selectedSession?.isCurrent) return;
                setSessionNotesById((prev) => ({
                  ...prev,
                  [selectedSession.id]: event.target.value,
                }));
              }}
            />
          </Flex>
        </Card>
      </Flex>
      <ChatPanel
        messages={chatMessages}
        onSend={sendMessage}
        tallScroll
        showAudio={false}
        sectionTooltip={t("TOOLTIP_PSYCHOLOGIST_CHAT")}
      />
      <Card padding="lg" shadow="md">
        <DashboardSectionTitle
          title={t("PSYCHOLOGIST_CONTEXT_FOR_AI")}
          tooltip={t("TOOLTIP_PSYCHOLOGIST_CONTEXT")}
        />
        <Flex col wFull>
          <TextAreaWithSave
            rows={4}
            value={psychologistContext}
            saveLabel={t("SAVE")}
            onSave={savePsychologistContext}
            onChange={(event) => setPsychologistContext(event.target.value)}
          />
        </Flex>
      </Card>
      <Card padding="lg" shadow="md">
        <DashboardSectionTitle
          title={t("AGENTIC_INTERACTION_SUMMARY")}
          tooltip={t("TOOLTIP_PSYCHOLOGIST_SUMMARY")}
        />
        <Title s1 gray leadingRelaxed>
          {MOCK_PSYCHOLOGIST_SUMMARY}
        </Title>
      </Card>
      <Card padding="lg" shadow="md">
        <DashboardSectionTitle
          title={t("PSYCHOLOGIST_INSIGHTS_TITLE")}
          tooltip={t("TOOLTIP_PSYCHOLOGIST_INSIGHTS")}
        />
        <Flex col wFull gap5>
          {MOCK_PSYCHOLOGIST_INSIGHTS.map((insight) => (
            <Flex col wFull key={insight.title}>
              <Title fs3 fw3 mb1>
                {insight.title}
              </Title>
              <Title s1 gray leadingRelaxed>
                {insight.body}
              </Title>
            </Flex>
          ))}
        </Flex>
      </Card>
    </AppShell>
  );
};
