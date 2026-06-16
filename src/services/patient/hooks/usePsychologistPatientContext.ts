import { useCallback, useState } from 'react';

import type { PsychologistPatientViewDto } from '@api';
import {
  getPsychologistPatientClinicalContentApi,
  savePsychologistPatientClinicalContentApi,
} from '@api';
import { useI18n } from '@i18n';

type ContextModalPatient = Pick<PsychologistPatientViewDto, 'id' | 'fullName'>;

export const usePsychologistPatientContext = () => {
  const { t } = useI18n();
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [contextPatient, setContextPatient] =
    useState<ContextModalPatient | null>(null);
  const [contextValue, setContextValue] = useState('');
  const [loadingContext, setLoadingContext] = useState(false);
  const [savingContext, setSavingContext] = useState(false);
  const [contextError, setContextError] = useState('');

  const openContextModal = useCallback(
    async (patient: ContextModalPatient) => {
      setContextPatient(patient);
      setContextModalOpen(true);
      setContextValue('');
      setContextError('');
      setLoadingContext(true);

      try {
        const content = await getPsychologistPatientClinicalContentApi(
          patient.id
        );
        setContextValue(content.sessionContext ?? '');
      } catch (loadError) {
        setContextError(
          loadError instanceof Error
            ? loadError.message
            : t('PSYCHOLOGIST_PATIENTS_CONTEXT_LOAD_ERROR')
        );
      } finally {
        setLoadingContext(false);
      }
    },
    [t]
  );

  const closeContextModal = useCallback(() => {
    setContextModalOpen(false);
    setContextPatient(null);
    setContextValue('');
    setContextError('');
    setLoadingContext(false);
    setSavingContext(false);
  }, []);

  const updateContext = useCallback((value: string) => {
    setContextValue(value);
    setContextError('');
  }, []);

  const saveContext = useCallback(async () => {
    if (!contextPatient || savingContext || loadingContext) {
      return;
    }

    setSavingContext(true);
    setContextError('');

    try {
      await savePsychologistPatientClinicalContentApi(contextPatient.id, {
        sessionContext: contextValue,
      });
      closeContextModal();
    } catch (saveError) {
      setContextError(
        saveError instanceof Error
          ? saveError.message
          : t('PSYCHOLOGIST_PATIENTS_CONTEXT_SAVE_ERROR')
      );
    } finally {
      setSavingContext(false);
    }
  }, [
    contextPatient,
    contextValue,
    savingContext,
    loadingContext,
    closeContextModal,
    t,
  ]);

  return {
    contextModalOpen,
    contextPatient,
    contextValue,
    loadingContext,
    savingContext,
    contextError,
    openContextModal,
    closeContextModal,
    updateContext,
    saveContext,
  };
};
