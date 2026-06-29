import type {
  AiPromptTemplateDefaultListItemDto,
  SaveAiPromptTemplateBodyDto,
  TestPromptTemplateBodyDto,
  TestPromptTemplateResultDto,
} from '@api';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type AiPromptTemplateDefaultsResponse = {
  templates: AiPromptTemplateDefaultListItemDto[];
};

type AiPromptTemplateDefaultResponse = {
  template: AiPromptTemplateDefaultListItemDto;
};

export const getAdminPromptTemplateDefaultsApi = async (): Promise<
  AiPromptTemplateDefaultListItemDto[]
> => {
  const response = await apiRequest<AiPromptTemplateDefaultsResponse>(
    '/admin/prompt-template-defaults'
  );
  return keysToCamel<AiPromptTemplateDefaultsResponse>(response).templates;
};

export const testAdminPromptTemplateDefaultApi = async (
  key: string,
  body: TestPromptTemplateBodyDto
): Promise<TestPromptTemplateResultDto> => {
  const response = await apiRequest<TestPromptTemplateResultDto>(
    `/admin/prompt-template-defaults/${encodeURIComponent(key)}/test`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
  return keysToCamel<TestPromptTemplateResultDto>(response);
};

export const saveAdminPromptTemplateDefaultApi = async (
  key: string,
  body: SaveAiPromptTemplateBodyDto
): Promise<AiPromptTemplateDefaultListItemDto> => {
  const response = await apiRequest<AiPromptTemplateDefaultResponse>(
    `/admin/prompt-template-defaults/${encodeURIComponent(key)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );
  return keysToCamel<AiPromptTemplateDefaultResponse>(response).template;
};
