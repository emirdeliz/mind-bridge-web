import type {
  LikertCheckInDto,
  LikertDimensionId,
} from '../../dto/clinical/ClinicalContentDto';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type LikertCheckInResponse = {
  content: {
    likertCheckIn: LikertCheckInDto | null;
  };
};

export const savePatientLikertCheckInApi = async (
  scores: Partial<Record<LikertDimensionId, number>>
): Promise<LikertCheckInDto | null> => {
  const response = await apiRequest<LikertCheckInResponse>(
    '/patient/likert-check-in',
    {
      method: 'PATCH',
      body: { scores },
    }
  );
  return (
    keysToCamel<LikertCheckInResponse>(response).content.likertCheckIn ?? null
  );
};
