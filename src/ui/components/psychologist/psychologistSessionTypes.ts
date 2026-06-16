import type { SessionNoteEntryDto } from '@api';

export type SessionNoteEntry = SessionNoteEntryDto;

export const AGENTIC_SUMMARY_PAGE_SIZE = 3;

export const getPreviousSessionsAgenticSummaries = (
  notes: SessionNoteEntry[]
) => notes.filter((entry) => !entry.isCurrent && entry.agenticSummary);

export const getCurrentSessionNoteIndex = (notes: SessionNoteEntry[]) =>
  notes.findIndex((entry) => entry.isCurrent);
