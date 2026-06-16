import type { LikertDimensionId } from '@api';

export const likertQuestionKey = (dimension: LikertDimensionId): string =>
  `LIKERT_QUESTION_${dimension.toUpperCase()}`;

export const likertAnchorLowKey = (dimension: LikertDimensionId): string =>
  `LIKERT_ANCHOR_${dimension.toUpperCase()}_LOW`;

export const likertAnchorHighKey = (dimension: LikertDimensionId): string =>
  `LIKERT_ANCHOR_${dimension.toUpperCase()}_HIGH`;

export const countLikertAnswers = (
  scores: Partial<Record<LikertDimensionId, number>>,
  dimensions: readonly LikertDimensionId[]
): number =>
  dimensions.filter((dimension) => typeof scores[dimension] === 'number')
    .length;
