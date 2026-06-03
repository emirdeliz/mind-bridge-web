import { useCallback, useEffect, useState } from 'react';

import type { PsychologistPatientSaveOrUpdateDto, PsychologistPatientViewDto } from '@api';
import {
  deletePsychologistPatientApi,
  getPsychologistPatientsApi,
  saveOrEditPsychologistPatientApi,
} from '@api';
import {
  filterMockPatients,
  MOCK_PSYCHOLOGIST_PATIENTS,
} from '@constants';
import { useI18n } from '@i18n';
import { isAuthBypassEnabled, useAuth } from '@services';

const phoneDigits = (phone: string | null | undefined) =>
  (phone ?? '').replace(/\D/g, '');

const isValidPhone = (phone: string | null | undefined) => {
  const digits = phoneDigits(phone);
  return digits.length >= 10 && digits.length <= 11;
};

const emptyForm = (): PsychologistPatientSaveOrUpdateDto => ({
  fullName: '',
  phone: '',
  email: '',
  password: '',
});

export const usePsychologistPatients = () => {
  const { t } = useI18n();
  const { session } = useAuth();
  const isDemoMode = isAuthBypassEnabled();
  const [demoPatients, setDemoPatients] = useState<PsychologistPatientViewDto[]>(
    () => [...MOCK_PSYCHOLOGIST_PATIENTS]
  );
  const [patients, setPatients] = useState<PsychologistPatientViewDto[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PsychologistPatientSaveOrUpdateDto>(emptyForm());

  const apiUnavailable = isDemoMode || !session?.accessToken;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadPatients = useCallback(async () => {
    if (isDemoMode) {
      setLoading(true);
      setError('');
      setPatients(
        filterMockPatients(demoPatients, debouncedSearch, includeDeleted)
      );
      setLoading(false);
      return;
    }

    if (!session?.accessToken) {
      setPatients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const list = await getPsychologistPatientsApi(
        session.accessToken,
        debouncedSearch,
        includeDeleted
      );
      setPatients(list);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load patients'
      );
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, demoPatients, session?.accessToken, debouncedSearch, includeDeleted]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const openCreateModal = useCallback(() => {
    setForm(emptyForm());
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((patient: PsychologistPatientViewDto) => {
    setForm({
      id: patient.id,
      fullName: patient.fullName ?? '',
      phone: patient.phone ?? '',
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setForm(emptyForm());
  }, []);

  const updateForm = useCallback(
    (patch: Partial<PsychologistPatientSaveOrUpdateDto>) => {
      setForm((current) => ({ ...current, ...patch }));
    },
    []
  );

  const savePatient = useCallback(async () => {
    if (!form.fullName?.trim()) {
      setError(t('PSYCHOLOGIST_PATIENTS_ERROR_NAME_REQUIRED'));
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError(t('PSYCHOLOGIST_PATIENTS_ERROR_PHONE_REQUIRED'));
      return;
    }

    const normalizedPhone = phoneDigits(form.phone);

    if (isDemoMode) {
      setSaving(true);
      setError('');

      if (form.id) {
        setDemoPatients((current) =>
          current.map((patient) =>
            patient.id === form.id
              ? {
                  ...patient,
                  fullName: form.fullName,
                  phone: normalizedPhone,
                }
              : patient
          )
        );
      } else {
        const newPatient: PsychologistPatientViewDto = {
          id: `demo-patient-${crypto.randomUUID()}`,
          fullName: form.fullName,
          phone: normalizedPhone,
          lastConsultationAt: null,
          isDeleted: false,
        };
        setDemoPatients((current) => [...current, newPatient]);
      }

      closeModal();
      setSaving(false);
      return;
    }

    if (!session?.accessToken) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      await saveOrEditPsychologistPatientApi(session.accessToken, {
        ...form,
        phone: normalizedPhone,
      });
      closeModal();
      await loadPatients();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to save patient'
      );
    } finally {
      setSaving(false);
    }
  }, [isDemoMode, form, closeModal, loadPatients, session?.accessToken, t]);

  const deletePatient = useCallback(
    async (patientId: string) => {
      setError('');

      if (isDemoMode) {
        setDemoPatients((current) =>
          current.map((patient) =>
            patient.id === patientId ? { ...patient, isDeleted: true } : patient
          )
        );
        return;
      }

      if (!session?.accessToken) {
        return;
      }

      try {
        await deletePsychologistPatientApi(session.accessToken, patientId);
        await loadPatients();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : 'Failed to delete patient'
        );
      }
    },
    [isDemoMode, session?.accessToken, loadPatients]
  );

  return {
    patients,
    search,
    setSearch,
    includeDeleted,
    setIncludeDeleted,
    loading,
    saving,
    error,
    modalOpen,
    form,
    apiUnavailable,
    isDemoMode,
    openCreateModal,
    openEditModal,
    closeModal,
    updateForm,
    savePatient,
    deletePatient,
  };
};
