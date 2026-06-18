import { useCallback, useState } from 'react';

import type { ClinicalChatMessageDto, PsychologistPatientViewDto } from '@api';
import { getPsychologistPatientClinicalContentApi } from '@api';
import { useI18n } from '@i18n';

type ChatHistoryModalPatient = Pick<PsychologistPatientViewDto, 'id' | 'fullName'>;

export const usePsychologistPatientChatHistory = () => {
  const { t, language } = useI18n();
  const [chatHistoryModalOpen, setChatHistoryModalOpen] = useState(false);
  const [chatHistoryPatient, setChatHistoryPatient] =
    useState<ChatHistoryModalPatient | null>(null);
  const [chatHistoryMessages, setChatHistoryMessages] = useState<
    ClinicalChatMessageDto[]
  >([]);
  const [loadingChatHistory, setLoadingChatHistory] = useState(false);
  const [chatHistoryError, setChatHistoryError] = useState('');

  const openChatHistoryModal = useCallback(
    async (patient: ChatHistoryModalPatient) => {
      setChatHistoryPatient(patient);
      setChatHistoryModalOpen(true);
      setChatHistoryMessages([]);
      setChatHistoryError('');
      setLoadingChatHistory(true);

      try {
        const content = await getPsychologistPatientClinicalContentApi(
          patient.id,
          language
        );
        setChatHistoryMessages(content.patientChatSeed ?? []);
      } catch (loadError) {
        setChatHistoryError(
          loadError instanceof Error
            ? loadError.message
            : t('PSYCHOLOGIST_PATIENTS_CHAT_HISTORY_LOAD_ERROR')
        );
      } finally {
        setLoadingChatHistory(false);
      }
    },
    [language, t]
  );

  const closeChatHistoryModal = useCallback(() => {
    setChatHistoryModalOpen(false);
    setChatHistoryPatient(null);
    setChatHistoryMessages([]);
    setChatHistoryError('');
    setLoadingChatHistory(false);
  }, []);

  return {
    chatHistoryModalOpen,
    chatHistoryPatient,
    chatHistoryMessages,
    loadingChatHistory,
    chatHistoryError,
    openChatHistoryModal,
    closeChatHistoryModal,
  };
};
