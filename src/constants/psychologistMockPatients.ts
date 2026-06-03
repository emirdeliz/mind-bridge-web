import type { PsychologistPatientViewDto } from '@api';

export const MOCK_PSYCHOLOGIST_PATIENTS: PsychologistPatientViewDto[] = [
  {
    id: 'demo-patient-ana',
    fullName: 'Ana M.',
    phone: '11987654321',
    lastConsultationAt: '2026-05-28T14:00:00.000Z',
    isDeleted: false,
  },
  {
    id: 'demo-patient-bruno',
    fullName: 'Bruno Costa',
    phone: '11976543210',
    lastConsultationAt: '2026-05-20T10:30:00.000Z',
    isDeleted: false,
  },
  {
    id: 'demo-patient-carla',
    fullName: 'Carla Mendes',
    phone: '21999887766',
    lastConsultationAt: '2026-04-15T16:00:00.000Z',
    isDeleted: false,
  },
  {
    id: 'demo-patient-diego',
    fullName: 'Diego Ribeiro',
    phone: '31988776655',
    lastConsultationAt: null,
    isDeleted: false,
  },
  {
    id: 'demo-patient-elisa',
    fullName: 'Elisa Ferreira',
    phone: '41977665544',
    lastConsultationAt: '2026-03-10T09:00:00.000Z',
    isDeleted: true,
  },
];

export const filterMockPatients = (
  patients: PsychologistPatientViewDto[],
  search: string,
  includeDeleted: boolean
): PsychologistPatientViewDto[] => {
  const term = search.trim().toLowerCase();

  return patients.filter((patient) => {
    if (!includeDeleted && patient.isDeleted) {
      return false;
    }
    if (!term) {
      return true;
    }
    return (patient.fullName ?? '').toLowerCase().includes(term);
  });
};
