import type {
  AiPromptTemplateListItemDto,
  AiPromptTokenDefinitionDto,
  SaveAiPromptTemplateBodyDto,
  TestPromptTemplateBodyDto,
  TestPromptTemplateResultDto,
} from '@api';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type AiPromptTemplatesResponse = {
  templates: AiPromptTemplateListItemDto[];
};

type AiPromptTemplateResponse = {
  template: AiPromptTemplateListItemDto;
};

type AiPromptTokensResponse = {
  tokens: AiPromptTokenDefinitionDto[];
};

export const getAdminPromptTemplatesApi = async (): Promise<
  AiPromptTemplateListItemDto[]
> => {
  const response = await apiRequest<AiPromptTemplatesResponse>(
    '/admin/prompt-templates'
  );
  return keysToCamel<AiPromptTemplatesResponse>(response).templates;
};

export const getAdminPromptTokensApi = async (): Promise<
  AiPromptTokenDefinitionDto[]
> => {
  const response = await apiRequest<AiPromptTokensResponse>(
    '/admin/prompt-templates/tokens'
  );
  return keysToCamel<AiPromptTokensResponse>(response).tokens;
};

export const testAdminPromptTemplateApi = async (
  key: string,
  body: TestPromptTemplateBodyDto
): Promise<TestPromptTemplateResultDto> => {
  const response = await apiRequest<TestPromptTemplateResultDto>(
    `/admin/prompt-templates/${encodeURIComponent(key)}/test`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
  return keysToCamel<TestPromptTemplateResultDto>(response);
};

export const saveAdminPromptTemplateApi = async (
  key: string,
  body: SaveAiPromptTemplateBodyDto
): Promise<AiPromptTemplateListItemDto> => {
  const response = await apiRequest<AiPromptTemplateResponse>(
    `/admin/prompt-templates/${encodeURIComponent(key)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );
  return keysToCamel<AiPromptTemplateResponse>(response).template;
};

export const restoreAdminPromptTemplateApi = async (
  key: string
): Promise<AiPromptTemplateListItemDto> => {
  const response = await apiRequest<AiPromptTemplateResponse>(
    `/admin/prompt-templates/${encodeURIComponent(key)}/restore`,
    {
      method: 'POST',
    }
  );
  return keysToCamel<AiPromptTemplateResponse>(response).template;
};
