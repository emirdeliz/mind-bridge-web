import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  PatientAnamnesisDto,
  PsychologistPatientSaveOrUpdateDto,
  PsychologistPatientViewDto,
} from '@api';
import {
  deletePsychologistPatientApi,
  getPsychologistPatientClinicalContentApi,
  getPsychologistPatientsApi,
  restorePsychologistPatientApi,
  saveOrEditPsychologistPatientApi,
  savePsychologistPatientAnamnesisApi,
} from '@api';
import {
  isValidPatientInitialPassword,
  isValidPhone,
  phoneDigits,
} from '@helpers';
import { useI18n } from '@i18n';
import { emptyPatientAnamnesis } from '../../clinical/clinicalContentDefaults';
import { shouldSilentReload, type ReloadOptions } from '@helpers';
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
  const [formError, setFormError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] =
    useState<PsychologistPatientSaveOrUpdateDto>(emptyForm());
  const [anamnesis, setAnamnesis] = useState<PatientAnamnesisDto>(
    emptyPatientAnamnesis()
  );
  const [loadingAnamnesis, setLoadingAnamnesis] = useState(false);
  const patientsRef = useRef(patients);
  patientsRef.current = patients;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadPatients = useCallback(
    async (options?: ReloadOptions) => {
      if (!session) {
        setPatients([]);
        setLoading(false);
        return;
      }

      const silent = shouldSilentReload(
        options,
        patientsRef.current.length > 0
      );
      if (!silent) {
        setLoading(true);
      }
      setError('');

      try {
        const list = await getPsychologistPatientsApi(
          debouncedSearch,
          includeDeleted
        );
        setPatients(list);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load patients'
        );
        setPatients([]);
      } finally {
        setLoading(false);
      }
    },
    [session, debouncedSearch, includeDeleted]
  );

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const openCreateModal = useCallback(() => {
    setForm(emptyForm());
    setAnamnesis(emptyPatientAnamnesis());
    setLoadingAnamnesis(false);
    setFormError('');
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback(
    async (patient: PsychologistPatientViewDto) => {
      setForm({
        id: patient.id,
        fullName: patient.fullName ?? '',
        email: patient.email ?? '',
        phone: patient.phone ?? '',
        password: '',
      });
      setAnamnesis(emptyPatientAnamnesis());
      setFormError('');
      setModalOpen(true);
      setLoadingAnamnesis(true);

      try {
        const content = await getPsychologistPatientClinicalContentApi(
          patient.id
        );
        setAnamnesis(content.anamnesis ?? emptyPatientAnamnesis());
      } catch (loadError) {
        setFormError(
          loadError instanceof Error
            ? loadError.message
            : t('PSYCHOLOGIST_PATIENTS_ANAMNESIS_LOAD_ERROR')
        );
      } finally {
        setLoadingAnamnesis(false);
      }
    },
    [t]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setForm(emptyForm());
    setAnamnesis(emptyPatientAnamnesis());
    setLoadingAnamnesis(false);
    setFormError('');
  }, []);

  const updateForm = useCallback(
    (patch: Partial<PsychologistPatientSaveOrUpdateDto>) => {
      setForm((current) => ({ ...current, ...patch }));
      setFormError('');
    },
    []
  );

  const updateAnamnesis = useCallback((patch: Partial<PatientAnamnesisDto>) => {
    setAnamnesis((current) => ({ ...current, ...patch }));
    setFormError('');
  }, []);

  const savePatient = useCallback(async () => {
    if (!form.fullName?.trim()) {
      setFormError(t('PSYCHOLOGIST_PATIENTS_ERROR_NAME_REQUIRED'));
      return;
    }

    if (!isValidPhone(form.phone)) {
      setFormError(t('PSYCHOLOGIST_PATIENTS_ERROR_PHONE_REQUIRED'));
      return;
    }

    const normalizedPhone = phoneDigits(form.phone);

    if (!form.id) {
      if (!form.email?.trim()) {
        setFormError(t('PSYCHOLOGIST_PATIENTS_ERROR_EMAIL_REQUIRED'));
        return;
      }
      if (!isValidPatientInitialPassword(form.password)) {
        setFormError(t('PSYCHOLOGIST_PATIENTS_ERROR_PASSWORD_INVALID'));
        return;
      }
    }

    if (form.id && form.password?.trim() && form.password.trim().length < 5) {
      setFormError(t('PSYCHOLOGIST_PATIENTS_ERROR_RESET_PASSWORD_SHORT'));
      return;
    }

    if (!session) {
      setFormError(t('PSYCHOLOGIST_PATIENTS_API_UNAVAILABLE'));
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      await saveOrEditPsychologistPatientApi({
        ...form,
        phone: normalizedPhone,
        password: form.password?.trim() || undefined,
      });

      if (form.id) {
        await savePsychologistPatientAnamnesisApi(form.id, anamnesis);
      }

      closeModal();
      await loadPatients({ silent: true });
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : 'Failed to save patient'
      );
    } finally {
      setSaving(false);
    }
  }, [form, anamnesis, closeModal, loadPatients, session, t]);

  const deletePatient = useCallback(
    async (patientId: string) => {
      if (!session) {
        setError(t('PSYCHOLOGIST_PATIENTS_API_UNAVAILABLE'));
        return;
      }

      setError('');

      try {
        await deletePsychologistPatientApi(patientId);
        await loadPatients({ silent: true });
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

  const restorePatient = useCallback(
    async (patientId: string) => {
      if (!session) {
        setError(t('PSYCHOLOGIST_PATIENTS_API_UNAVAILABLE'));
        return;
      }

      setError('');

      try {
        await restorePsychologistPatientApi(patientId);
        await loadPatients({ silent: true });
      } catch (restoreError) {
        setError(
          restoreError instanceof Error
            ? restoreError.message
            : 'Failed to restore patient'
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
    formError,
    modalOpen,
    form,
    anamnesis,
    loadingAnamnesis,
    openCreateModal,
    openEditModal,
    closeModal,
    updateForm,
    updateAnamnesis,
    savePatient,
    deletePatient,
    restorePatient,
  };
};
