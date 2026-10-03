'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { PsychologistChatShortcutDto } from '@api';
import { Button, Flex, Icon, Input, Loading, Title } from '@atoms';
import { translateTemplate, useI18n } from '@i18n';
import {
  Card,
  ConfirmModal,
  FormActions,
  FormGroup,
  Table,
  Tooltip,
} from '@molecules';
import { DashboardSectionTitle } from '@templates';
import {
  resolveChatShortcutTranslation,
  usePsychologistChatShortcuts,
} from '@services';

type ShortcutFormState = {
  label: string;
  message: string;
};

type PendingShortcutDraft = ShortcutFormState & {
  id: string;
};

type ShortcutTableRow = {
  id: string;
  label: string;
  message: string;
  actions: ReactNode;
};

const emptyForm = (): ShortcutFormState => ({
  label: '',
  message: '',
});

const createPendingId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const parseForm = (form: ShortcutFormState): ShortcutFormState | null => {
  const label = form.label.trim();
  const message = form.message.trim();
  if (!label || !message) {
    return null;
  }
  return { label, message };
};

export const PsychologistChatShortcutsSettingsPanel = () => {
  const { t, language } = useI18n();
  const {
    shortcuts,
    loading,
    saving,
    error,
    createShortcuts,
    updateShortcut,
    removeShortcut,
  } = usePsychologistChatShortcuts();
  const [formOpen, setFormOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] =
    useState<PsychologistChatShortcutDto | null>(null);
  const [form, setForm] = useState<ShortcutFormState>(emptyForm);
  const [pendingDrafts, setPendingDrafts] = useState<PendingShortcutDraft[]>(
    []
  );
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] =
    useState<PsychologistChatShortcutDto | null>(null);

  const isCreateMode = formOpen && !editingShortcut;
  const pendingSaveCount =
    pendingDrafts.length + (isCreateMode && parseForm(form) ? 1 : 0);

  const openCreateForm = () => {
    setEditingShortcut(null);
    setForm(emptyForm());
    setPendingDrafts([]);
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = useCallback((shortcut: PsychologistChatShortcutDto) => {
    const translation = resolveChatShortcutTranslation(shortcut, language);
    setEditingShortcut(shortcut);
    setPendingDrafts([]);
    setForm({
      label: translation.label,
      message: translation.message,
    });
    setFormError('');
    setFormOpen(true);
  }, [language]);

  const closeForm = useCallback(() => {
    if (saving) {
      return;
    }
    setFormOpen(false);
    setEditingShortcut(null);
    setForm(emptyForm());
    setPendingDrafts([]);
    setFormError('');
  }, [saving]);

  const handleAddToList = () => {
    const parsed = parseForm(form);
    if (!parsed) {
      setFormError(t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_FORM_REQUIRED'));
      return;
    }

    setFormError('');
    setPendingDrafts((current) => [
      ...current,
      {
        id: createPendingId(),
        ...parsed,
      },
    ]);
    setForm(emptyForm());
  };

  const handleRemovePendingDraft = (draftId: string) => {
    if (saving) {
      return;
    }
    setPendingDrafts((current) =>
      current.filter((draft) => draft.id !== draftId)
    );
  };

  const handleSubmit = async () => {
    if (editingShortcut) {
      const parsed = parseForm(form);
      if (!parsed) {
        setFormError(t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_FORM_REQUIRED'));
        return;
      }

      setFormError('');
      try {
        await updateShortcut(editingShortcut.id, {
          ...parsed,
          sourceLanguage: language,
        });
        closeForm();
      } catch {
        // error state handled by hook
      }
      return;
    }

    const drafts = [...pendingDrafts];
    const currentDraft = parseForm(form);
    if (currentDraft) {
      drafts.push({
        id: createPendingId(),
        ...currentDraft,
      });
    }

    if (!drafts.length) {
      setFormError(t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_BATCH_REQUIRED'));
      return;
    }

    setFormError('');
    try {
      await createShortcuts(
        drafts.map((draft) => ({
          label: draft.label,
          message: draft.message,
          sourceLanguage: language,
        }))
      );
      closeForm();
    } catch {
      // error state handled by hook
    }
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await removeShortcut(deleteTarget.id);
      setDeleteTarget(null);
      if (editingShortcut?.id === deleteTarget.id) {
        closeForm();
      }
    } catch {
      // error state handled by hook
    }
  }, [deleteTarget, editingShortcut?.id, removeShortcut, closeForm]);

  const buildRowActions = useCallback(
    (shortcut: PsychologistChatShortcutDto) => (
      <Flex row gap2>
        <Tooltip title={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_EDIT')} top>
          <Button
            type='button'
            icon
            variant='secondary'
            clickable={!saving}
            title={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_EDIT')}
            onClick={() => openEditForm(shortcut)}
          >
            <Icon.Pencil nm />
          </Button>
        </Tooltip>
        <Tooltip title={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_DELETE')} top>
          <Button
            type='button'
            icon
            variant='danger'
            clickable={!saving}
            title={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_DELETE')}
            onClick={() => setDeleteTarget(shortcut)}
          >
            <Icon.TrashEmpty nm />
          </Button>
        </Tooltip>
      </Flex>
    ),
    [openEditForm, saving, t]
  );

  const tableData = useMemo((): ShortcutTableRow[] => {
    return shortcuts.map((shortcut) => {
      const translation = resolveChatShortcutTranslation(shortcut, language);
      return {
        id: shortcut.id,
        label: translation.label,
        message: translation.message,
        actions: buildRowActions(shortcut),
      };
    });
  }, [buildRowActions, language, shortcuts]);

  const columns = useMemo(
    () => [
      {
        key: 'label' as const,
        label: t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_LABEL'),
        customCellRender: (row: ShortcutTableRow) => (
          <Title s2 fw3 block>
            {row.label}
          </Title>
        ),
      },
      {
        key: 'message' as const,
        label: t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_MESSAGE'),
        disableSort: true,
        customCellRender: (row: ShortcutTableRow) => (
          <Title s1 gray block leadingRelaxed>
            {row.message}
          </Title>
        ),
      },
      {
        key: 'actions' as const,
        label: t('PSYCHOLOGIST_PATIENTS_COL_ACTIONS'),
        disableSort: true,
      },
    ],
    [t]
  );

  return (
    <div id='chat-shortcuts'>
    <Card padding='lg' shadow='md'>
      <Flex col wFull gap4>
        <Flex row wFull wrap alignStart justifySpaceBetween gap4>
          <Flex col wFull gap2 flex1>
            <DashboardSectionTitle
              title={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_TITLE')}
              tooltip={t('TOOLTIP_PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS')}
            />
            <Title hint gray block leadingRelaxed>
              {t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_HINT')}
            </Title>
          </Flex>
          <Button
            type='button'
            variant='primary'
            clickable={!saving && !formOpen}
            onClick={openCreateForm}
          >
            {t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_ADD')}
          </Button>
        </Flex>

        {loading ? (
          <Flex row wFull alignCenter gap2>
            <Loading />
          </Flex>
        ) : error && !shortcuts.length ? (
          <Title s2 error block>
            {error}
          </Title>
        ) : shortcuts.length === 0 ? (
          <Title s1 gray block>
            {t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_EMPTY')}
          </Title>
        ) : (
          <Table<ShortcutTableRow>
            variant='dark'
            columns={columns}
            dataSource={tableData}
          />
        )}

        {error && shortcuts.length > 0 ? (
          <Title s2 error block>
            {error}
          </Title>
        ) : null}

        {formOpen ? (
          <div className='w-full rounded-xl border border-mb-accent/30 bg-mb-accent/5 p-4'>
            <Flex col wFull gap4>
              <Title fs4 fw3 block>
                {editingShortcut
                  ? t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_EDIT')
                  : t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_ADD')}
              </Title>
              <Title hint gray block leadingRelaxed>
                {editingShortcut
                  ? t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_FORM_HINT')
                  : t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_BATCH_HINT')}
              </Title>

              {formError ? (
                <Title s2 error block>
                  {formError}
                </Title>
              ) : null}

              {isCreateMode && pendingDrafts.length > 0 ? (
                <Flex col wFull alignStretch gap4>
                  <Title s2 fw3 block>
                    {translateTemplate(
                      t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_PENDING_TITLE'),
                      {
                        count: pendingDrafts.length,
                      }
                    )}
                  </Title>
                  {pendingDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className='w-full rounded-xl border border-dashed border-mb-border/80 bg-mb-bg/40 p-4'
                    >
                      <Flex row wFull alignStart justifySpaceBetween gap4>
                        <Flex col wFull gap1 flex1>
                          <Title s2 fw3 block>
                            {draft.label}
                          </Title>
                          <Title s1 gray block leadingRelaxed>
                            {draft.message}
                          </Title>
                        </Flex>
                        <Tooltip
                          title={t(
                            'PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_REMOVE_PENDING'
                          )}
                          top
                        >
                          <span className='inline-flex h-8 w-8 items-center justify-center'>
                            <Button
                              type='button'
                              xs
                              sm
                              circle
                              variant='secondary'
                              outlined
                              clickable={!saving}
                              title={t(
                                'PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_REMOVE_PENDING'
                              )}
                              onClick={() => handleRemovePendingDraft(draft.id)}
                            >
                              <Icon.TrashEmpty sm white />
                            </Button>
                          </span>
                        </Tooltip>
                      </Flex>
                    </div>
                  ))}
                </Flex>
              ) : null}

              <FormGroup
                label={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_LABEL')}
                target='psychologist-chat-shortcut-label'
                required
              >
                <Input
                  id='psychologist-chat-shortcut-label'
                  value={form.label}
                  disabled={saving}
                  maxLength={120}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      label: event.target.value,
                    }));
                    setFormError('');
                  }}
                />
              </FormGroup>

              <FormGroup
                label={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_MESSAGE')}
                target='psychologist-chat-shortcut-message'
                required
              >
                <Input.TextArea
                  id='psychologist-chat-shortcut-message'
                  rows={4}
                  value={form.message}
                  disabled={saving}
                  maxLength={2000}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }));
                    setFormError('');
                  }}
                />
              </FormGroup>

              {saving ? (
                <Flex row wFull alignCenter gap2>
                  <Loading />
                  <Title hint gray block>
                    {t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_TRANSLATING')}
                  </Title>
                </Flex>
              ) : null}

              <FormActions>
                <Button
                  type='button'
                  variant='secondary'
                  outlined
                  clickable={!saving}
                  onClick={closeForm}
                >
                  {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                </Button>
                {isCreateMode ? (
                  <Button
                    type='button'
                    variant='secondary'
                    outlined
                    clickable={!saving}
                    onClick={handleAddToList}
                  >
                    {t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_ADD_TO_LIST')}
                  </Button>
                ) : null}
                <Button
                  type='button'
                  variant='primary'
                  clickable={
                    !saving && (editingShortcut ? true : pendingSaveCount > 0)
                  }
                  onClick={() => void handleSubmit()}
                >
                  {isCreateMode && pendingSaveCount > 0
                    ? translateTemplate(
                        t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_SAVE_COUNT'),
                        {
                          count: pendingSaveCount,
                        }
                      )
                    : t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_SAVE')}
                </Button>
              </FormActions>
            </Flex>
          </div>
        ) : null}
      </Flex>

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_DELETE')}
        message={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_DELETE_CONFIRM')}
        confirmLabel={t('PSYCHOLOGIST_SETTINGS_CHAT_SHORTCUTS_DELETE')}
        cancelLabel={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
        confirmVariant='danger'
        onClose={() => {
          if (!saving) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </Card>
    </div>
  );
};
