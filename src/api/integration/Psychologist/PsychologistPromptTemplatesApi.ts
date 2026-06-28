import type {
  AiPromptTemplateListItemDto,
  AiPromptTokenDefinitionDto,
  SaveAiPromptTemplateBodyDto,
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

export const getPsychologistPromptTemplatesApi = async (): Promise<
  AiPromptTemplateListItemDto[]
> => {
  const response = await apiRequest<AiPromptTemplatesResponse>(
    '/psychologist/prompt-templates'
  );
  return keysToCamel<AiPromptTemplatesResponse>(response).templates;
};

export const getPsychologistPromptTokensApi = async (): Promise<
  AiPromptTokenDefinitionDto[]
> => {
  const response = await apiRequest<AiPromptTokensResponse>(
    '/psychologist/prompt-templates/tokens'
  );
  return keysToCamel<AiPromptTokensResponse>(response).tokens;
};

export const savePsychologistPromptTemplateApi = async (
  key: string,
  body: SaveAiPromptTemplateBodyDto
): Promise<AiPromptTemplateListItemDto> => {
  const response = await apiRequest<AiPromptTemplateResponse>(
    `/psychologist/prompt-templates/${encodeURIComponent(key)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );
  return keysToCamel<AiPromptTemplateResponse>(response).template;
};

export const restorePsychologistPromptTemplateApi = async (
  key: string
): Promise<AiPromptTemplateListItemDto> => {
  const response = await apiRequest<AiPromptTemplateResponse>(
    `/psychologist/prompt-templates/${encodeURIComponent(key)}/restore`,
    {
      method: 'POST',
    }
  );
  return keysToCamel<AiPromptTemplateResponse>(response).template;
};
