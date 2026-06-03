export interface PsychologistPatientViewDto {
  id: string;
  fullName: string | null;
  phone: string | null;
  lastConsultationAt: string | null;
  isDeleted: boolean;
}

export interface PsychologistPatientSaveOrUpdateDto {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  age?: string | null;
  address?: string | null;
  language?: 'en' | 'es' | 'pt';
}

export interface PsychologistPatientDeleteDto {
  id: string;
}
