import { useCallback, useEffect, useState } from 'react';

import type { PsychologistPatientSaveOrUpdateDto, PsychologistPatientViewDto } from '@api';
import {
  deletePsychologistPatientApi,
  getPsychologistPatientsApi,
  saveOrEditPsychologistPatientApi,
} from '@api';
import { isValidPhone, phoneDigits } from '@helpers';
import { useI18n } from '@i18n';
import { useAuth } from '@services';

const emptyForm = (): PsychologistPatientSaveOrUpdateDto => ({
  fullName: '',
  phone: '',
  email: '',
  password: '',
});

export const usePsychologistPatients = () => {
  const { t } = useI18n();
  const { session } = useAuth();
  const [patients, setPatients] = useState<PsychologistPatientViewDto[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PsychologistPatientSaveOrUpdateDto>(emptyForm());

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadPatients = useCallback(async () => {
    if (!session) {
      setPatients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const list = await getPsychologistPatientsApi(debouncedSearch, includeDeleted);
      setPatients(list);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load patients'
      );
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [session, debouncedSearch, includeDeleted]);

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
      password: '',
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

    if (!form.id) {
      if (!form.email?.trim()) {
        setError(t('PSYCHOLOGIST_PATIENTS_ERROR_EMAIL_REQUIRED'));
        return;
      }
      if (!/^\d{5}$/.test(form.password ?? '')) {
        setError(t('PSYCHOLOGIST_PATIENTS_ERROR_PASSWORD_INVALID'));
        return;
      }
    }

    if (form.id && form.password?.trim() && form.password.trim().length < 5) {
      setError(t('PSYCHOLOGIST_PATIENTS_ERROR_RESET_PASSWORD_SHORT'));
      return;
    }

    if (!session) {
      setError(t('PSYCHOLOGIST_PATIENTS_API_UNAVAILABLE'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Patient account via API — psychologist session stays active (no public register redirect).
      await saveOrEditPsychologistPatientApi({
        ...form,
        phone: normalizedPhone,
        password: form.password?.trim() || undefined,
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
  }, [form, closeModal, loadPatients, session, t]);

  const deletePatient = useCallback(
    async (patientId: string) => {
      if (!session) {
        setError(t('PSYCHOLOGIST_PATIENTS_API_UNAVAILABLE'));
        return;
      }

      setError('');

      try {
        await deletePsychologistPatientApi(patientId);
        await loadPatients();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : 'Failed to delete patient'
        );
      }
    },
    [session, loadPatients, t]
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
    openCreateModal,
    openEditModal,
    closeModal,
    updateForm,
    savePatient,
    deletePatient,
  };
};
