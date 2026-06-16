import type { PsychologistInviteCodeDto } from '../../dto/invite/InviteCodeDto';
import { apiRequest } from '../../http/apiClient';

type InviteCodeResponse = {
  code: string;
};

export const getPsychologistInviteCodeApi =
  async (): Promise<PsychologistInviteCodeDto> => {
    const data = await apiRequest<InviteCodeResponse>(
      '/psychologist/invite-code'
    );
    return { code: data.code };
  };

export const regeneratePsychologistInviteCodeApi =
  async (): Promise<PsychologistInviteCodeDto> => {
    const data = await apiRequest<InviteCodeResponse>(
      '/psychologist/invite-code/regenerate',
      { method: 'POST' }
    );
    return { code: data.code };
  };
