import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import type { ChatMessage } from "@services";
import { getRoleRoute, isAuthBypassEnabled, useAiAgent, useAuth } from "@services";
import { Button, Flex, Icon, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, TextAreaWithSave, Tooltip } from "@molecules";
import { AppShell, ChatPanel, DashboardSectionTitle } from "@templates";

const MOCK_PSYCHOLOGIST_CONTEXT =
  "Paciente: Ana M., 32 anos. Abordagem TCC com foco em ansiedade antecipatória e higiene do sono. Meta atual: reduzir evitação em contextos laborais e aumentar adesão ao diário de humor (meta ≥ 5 registros/semana).";

type SessionNoteEntry = {
  id: string;
  label: string;
  sessionDate: string;
  content: string;
  agenticSummary?: string;
  isCurrent?: boolean;
};

const MOCK_SESSION_NOTES_HISTORY: SessionNoteEntry[] = [
  {
    id: "session-2026-06-03",
    label: "Sessão 03/06/2026 (atual)",
    sessionDate: "03/06/2026",
    content:
      "Próxima sessão: revisar experimento comportamental da semana 3. Validar uso da respiração 4-7-8. Explorar crença central sobre desempenho profissional. Considerar escala de ansiedade (GAD-7) na abertura.",
    isCurrent: true,
  },
  {
    id: "session-2026-05-27",
    label: "Sessão 27/05/2026",
    sessionDate: "27/05/2026",
    agenticSummary:
      "Leve melhora do sono com rotina sem telas às 22h; exposição gradual no trabalho mantida. Adesão ao diário ainda abaixo da meta (3x/semana). Sem alertas de risco.",
    content:
      "Paciente relatou melhora leve no sono após rotina de desligar telas às 22h. Revisado registro de pensamentos; mantida exposição gradual no ambiente de trabalho. Combinado envio de diário de humor 3x na semana.",
  },
  {
    id: "session-2026-05-20",
    label: "Sessão 20/05/2026",
    sessionDate: "20/05/2026",
    agenticSummary:
      "Mapeamento inicial de gatilhos em reuniões; psicoeducação sobre ciclo ansiedade–evitação. Paciente aderiu ao experimento de check-in emocional pré-apresentações. Sem indicadores de risco na sessão.",
    content:
      "Primeira elaboração de gatilhos de ansiedade em reuniões. Psicoeducação sobre ciclo ansiedade–evitação. Paciente aceitou experimento de check-in emocional antes de apresentações. Sem indicadores de risco na sessão.",
  },
];

const previousSessionsAgenticSummaries = MOCK_SESSION_NOTES_HISTORY.filter(
  (entry) => !entry.isCurrent && entry.agenticSummary,
);

const CURRENT_SESSION_NOTE_INDEX = MOCK_SESSION_NOTES_HISTORY.findIndex((entry) => entry.isCurrent);

const MOCK_PSYCHOLOGIST_CHAT: ChatMessage[] = [
  {
    id: "mock-psy-1",
    sender: "user",
    text: "Consolidar interações da paciente Ana M. nos últimos 7 dias e destacar padrões clínicos.",
    createdAt: "2026-06-02T13:50:00.000Z",
  },
  {
    id: "mock-psy-2",
    sender: "agent",
    text: "Insight 1 — Engajamento: 6 interações na semana (+20% vs. semana anterior). Horários de pico: 08h–10h e 21h–23h. Canal predominante: texto (67%).",
    createdAt: "2026-06-02T13:51:00.000Z",
  },
  {
    id: "mock-psy-3",
    sender: "agent",
    text: "Insight 2 — Humor e sintomas: média de humor 4,2/10 (↓ 0,8). Termos recorrentes: “aperto no peito”, “não dormi”, “reunião”. Correlação sugerida entre eventos laborais e queixas somáticas.",
    createdAt: "2026-06-02T13:52:00.000Z",
  },
  {
    id: "mock-psy-4",
    sender: "user",
    text: "Há indicadores de risco ou sinais de descompensação nas mensagens recentes?",
    createdAt: "2026-06-02T13:55:00.000Z",
  },
  {
    id: "mock-psy-5",
    sender: "agent",
    text: "Insight 3 — Risco: nenhuma menção explícita a autolesão ou ideação suicida nas últimas 48h. Risco emocional classificado como moderado (ansiedade + sono). Recomenda-se checagem direta de segurança na próxima sessão.",
    createdAt: "2026-06-02T13:56:00.000Z",
  },
  {
    id: "mock-psy-6",
    sender: "agent",
    text: "Insight 4 — Adesão ao plano: diário de humor preenchido 2/7 dias. Técnica de respiração citada 1 vez pelo paciente; reforço pelo agente 3 vezes. Oportunidade: renegociar meta para 3 registros/semana com lembretes às 20h.",
    createdAt: "2026-06-02T13:57:00.000Z",
  },
  {
    id: "mock-psy-7",
    sender: "user",
    text: "Sugerir foco para a próxima sessão de 50 minutos.",
    createdAt: "2026-06-02T14:00:00.000Z",
  },
  {
    id: "mock-psy-8",
    sender: "agent",
    text: "Insight 5 — Pauta sugerida: (1) mapear gatilhos pré-reunião; (2) revisar experimento de exposição gradual; (3) monitorar sono com registro de despertares; (4) fechar com escala GAD-7 e plano de crise se ansiedade ≥ 8/10.",
    createdAt: "2026-06-02T14:01:00.000Z",
  },
  {
    id: "mock-psy-9",
    sender: "agent",
    text: "Insight 6 — Prognóstico assistido por IA: tendência de estabilização se adesão ao diário subir para ≥ 50% nos próximos 10 dias. Caso contrário, escalar para contato de check-in em 72h.",
    createdAt: "2026-06-02T14:02:00.000Z",
  },
];

const MOCK_PSYCHOLOGIST_SUMMARY =
  "Resumo agentico (7 dias): 6 interações, humor médio 4,2/10, sono fragmentado e ansiedade situacional ligada ao trabalho. Risco moderado sem alertas de segurança imediatos. Adesão ao diário abaixo da meta (29%). Prioridades: reforçar regulação pré-evento, revisar experimento TCC e aplicar GAD-7 na sessão.";

const MOCK_PSYCHOLOGIST_INSIGHTS = [
  {
    title: "Indicadores-chave",
    body: "Engajamento +20% · Humor médio 4,2/10 · Sono prejudicado em 4/7 noites · Adesão ao diário 29% · 3 reforços de respiração pelo agente",
  },
  {
    title: "Padrões detectados",
    body: "Pico de ansiedade 1–2h antes de reuniões · Sintomas somáticos (aperto no peito) co-ocorrem com relatos de insônia · Menos interações nos fins de semana",
  },
  {
    title: "Alertas para supervisão",
    body: "Risco emocional moderado — sem linguagem de risco imediato nas últimas 48h · Queda de humor vs. semana anterior · Meta terapêutica de diário não atingida",
  },
  {
    title: "Ações recomendadas",
    body: "Abrir sessão com GAD-7 · Validar protocolo de segurança · Ajustar meta do diário para 3x/semana com lembrete às 20h · Revisar exposição gradual no contexto laboral",
  },
] as const;

export const PsychologistPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading } = useAuth();
  const [psychologistContext, setPsychologistContext] = useState(MOCK_PSYCHOLOGIST_CONTEXT);
  const [sessionNotesById, setSessionNotesById] = useState(() =>
    Object.fromEntries(MOCK_SESSION_NOTES_HISTORY.map((entry) => [entry.id, entry.content])),
  );
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(
    CURRENT_SESSION_NOTE_INDEX >= 0 ? CURRENT_SESSION_NOTE_INDEX : 0,
  );
  const { messages, sendMessage } = useAiAgent(psychologistContext);
  const chatMessages = [...MOCK_PSYCHOLOGIST_CHAT, ...messages];

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void router.replace("/");
      return;
    }
    if (session.role !== "psychologist" && !isAuthBypassEnabled()) {
      void router.replace(getRoleRoute(session.role));
    }
  }, [loading, session, router]);

  if (loading || !session || (session.role !== "psychologist" && !isAuthBypassEnabled())) {
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
    <AppShell title={t("PSYCHOLOGIST_AREA_TITLE")} subtitle={t("PSYCHOLOGIST_AREA_SUBTITLE")} variant="dashboard">
      <Flex col wFull gap4>
        <Card padding="lg" shadow="md">
          <DashboardSectionTitle
            title={t("SESSION_NOTES_AGENTIC_SUMMARY")}
            tooltip={t("TOOLTIP_SESSION_NOTES_AGENTIC_SUMMARY")}
          />
          <Flex col wFull gap5>
            {previousSessionsAgenticSummaries.map((entry) => (
              <Flex col wFull key={entry.id}>
                <Title fs3 fw3 mb1>
                  {entry.sessionDate}
                </Title>
                <Title s1 gray leadingRelaxed>
                  {entry.agenticSummary}
                </Title>
              </Flex>
            ))}
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
            <Flex row alignCenter gap2>
              <Tooltip
                title={
                  olderSession
                    ? `${t("SESSION_NOTES_PREVIOUS")}: ${olderSession.label}`
                    : t("SESSION_NOTES_PREVIOUS")
                }
                top
                width={280}
              >
                <span className="inline-block">
                  <Button
                    type="button"
                    xs
                    sm
                    circle
                    variant="secondary"
                    outlined
                    clickable={canGoToOlderSession}
                    onClick={() =>
                      setSelectedSessionIndex((index) =>
                        Math.min(MOCK_SESSION_NOTES_HISTORY.length - 1, index + 1),
                      )
                    }
                  >
                    <Icon.LeftOpen sm />
                  </Button>
                </span>
              </Tooltip>
              <Tooltip
                title={
                  newerSession ? `${t("SESSION_NOTES_NEXT")}: ${newerSession.label}` : t("SESSION_NOTES_NEXT")
                }
                top
                width={280}
              >
                <span className="inline-block">
                  <Button
                    type="button"
                    xs
                    sm
                    circle
                    variant="secondary"
                    outlined
                    clickable={canGoToNewerSession}
                    onClick={() => setSelectedSessionIndex((index) => Math.max(0, index - 1))}
                  >
                    <Icon.RightOpen sm />
                  </Button>
                </span>
              </Tooltip>
            </Flex>
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
          title="Insights para o psicólogo"
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
