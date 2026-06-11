import type {
  PsychologistPatientSaveOrUpdateDto,
  PsychologistPatientViewDto,
} from '../../dto/patient/PatientDto';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type PatientsListResponse = {
  patients: PsychologistPatientViewDto[];
};

type PatientResponse = {
  patient: PsychologistPatientViewDto;
};

export const getPsychologistPatientsApi = async (
  search: string,
  includeDeleted: boolean
): Promise<PsychologistPatientViewDto[]> => {
  const response = await apiRequest<PatientsListResponse>('/psychologist/patients', {
    query: {
      name: search.trim() || undefined,
      includeDeleted,
    },
  });

  const data = keysToCamel<PatientsListResponse>(response);
  return data.patients ?? [];
};

export const saveOrEditPsychologistPatientApi = async (
  data: PsychologistPatientSaveOrUpdateDto
): Promise<PsychologistPatientViewDto> => {
  if (data.id) {
    const password = data.password?.trim();
    const response = await apiRequest<PatientResponse>(
      `/psychologist/patients/${data.id}`,
      {
        method: 'PATCH',
        body: {
          fullName: data.fullName,
          phone: data.phone,
          ...(password ? { password } : {}),
          age: data.age ?? null,
          address: data.address ?? null,
          language: data.language,
        },
      }
    );
    return keysToCamel<PatientResponse>(response).patient;
  }

  const response = await apiRequest<PatientResponse>('/psychologist/patients', {
    method: 'POST',
    body: {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      password: data.password,
      age: data.age ?? null,
      address: data.address ?? null,
      language: data.language,
    },
  });

  return keysToCamel<PatientResponse>(response).patient;
};

export const deletePsychologistPatientApi = async (
  patientId: string
): Promise<void> => {
  await apiRequest<void>(`/psychologist/patients/${patientId}`, {
    method: 'DELETE',
  });
};

export const restorePsychologistPatientApi = async (
  patientId: string
): Promise<PsychologistPatientViewDto> => {
  const response = await apiRequest<PatientResponse>(
    `/psychologist/patients/${patientId}/restore`,
    { method: 'POST' }
  );
  return keysToCamel<PatientResponse>(response).patient;
};
