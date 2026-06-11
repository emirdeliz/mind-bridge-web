import { apiRequest } from '../../http/apiClient';

type LinkInviteCodeResponse = {
  ok: boolean;
};

export const linkPatientInviteCodeApi = async (
  inviteCode: string
): Promise<void> => {
  await apiRequest<LinkInviteCodeResponse>('/patient/invite-code', {
    method: 'POST',
    body: { inviteCode: inviteCode.trim() },
  });
};
