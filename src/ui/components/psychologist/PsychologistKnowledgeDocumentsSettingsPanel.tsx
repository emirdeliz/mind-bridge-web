"use client";

import { useMemo, useState, type ReactNode } from "react";

import type { KnowledgeDocumentDto } from "@api";
import { Button, Flex, Icon, Loading, Title } from "@atoms";
import { formatDateAsDDMMYYYYAndTime, formatKnowledgeMaxFileSizeMb, isKnowledgeFileWithinSizeLimit } from "@helpers";
import { useI18n, translateTemplate } from "@i18n";
import { Card, ConfirmModal, PageLoader, Table, Tooltip } from "@molecules";
import { DashboardSectionTitle } from "@templates";
import {
  useKnowledgeFilePicker,
  usePsychologistKnowledgeDocuments,
} from "@services";

type KnowledgeDocumentTableRow = {
  id: string;
  fileName: string;
  updatedAt: string;
  actions: ReactNode;
};

const isPdfFile = (file: File): boolean =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const PsychologistKnowledgeDocumentsSettingsPanel = () => {
  const { t } = useI18n();
  const {
    documents,
    maxFileBytes,
    loading,
    uploading,
    error,
    uploadDocument,
    removeDocument,
  } = usePsychologistKnowledgeDocuments();
  const { inputRef, pickFile, handleChange } = useKnowledgeFilePicker();
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeDocumentDto | null>(null);
  const [actionError, setActionError] = useState("");

  const maxSizeMb = formatKnowledgeMaxFileSizeMb(maxFileBytes);

  const validateSelectedFile = (file: File): string | null => {
    if (!isPdfFile(file)) {
      return t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_PDF_ONLY");
    }

    if (!isKnowledgeFileWithinSizeLimit(file.size, maxFileBytes)) {
      return translateTemplate(t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_FILE_TOO_LARGE"), {
        maxSizeMb,
      });
    }

    return null;
  };

  const handleUpload = async () => {
    const file = await pickFile();
    if (!file) {
      return;
    }

    const validationError = validateSelectedFile(file);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setActionError("");
    try {
      await uploadDocument(file);
    } catch {
      // error state handled by hook
    }
  };

  const handleUpdate = async (document: KnowledgeDocumentDto) => {
    const file = await pickFile();
    if (!file) {
      return;
    }

    const validationError = validateSelectedFile(file);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    if (file.name.toLowerCase() !== document.fileName.toLowerCase()) {
      setActionError(
        translateTemplate(t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_UPDATE_SAME_NAME"), {
          fileName: document.fileName,
        }),
      );
      return;
    }

    setActionError("");
    try {
      await uploadDocument(file);
    } catch {
      // error state handled by hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await removeDocument(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error state handled by hook
    }
  };

  const tableData = useMemo<KnowledgeDocumentTableRow[]>(
    () =>
      documents.map((document) => ({
        id: document.id,
        fileName: document.fileName,
        updatedAt: formatDateAsDDMMYYYYAndTime(document.updatedAt),
        actions: (
          <Flex row gap2 wrap>
            <Tooltip title={t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_UPDATE")} top>
              <span className="inline-flex h-8 w-8 items-center justify-center">
                <Button
                  type="button"
                  xs
                  sm
                  circle
                  variant="secondary"
                  outlined
                  clickable={!uploading}
                  title={t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_UPDATE")}
                  onClick={() => void handleUpdate(document)}
                >
                  <Icon.Edit sm white />
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_DELETE")} top>
              <span className="inline-flex h-8 w-8 items-center justify-center">
                <Button
                  type="button"
                  xs
                  sm
                  circle
                  variant="secondary"
                  outlined
                  clickable={!uploading}
                  title={t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_DELETE")}
                  onClick={() => setDeleteTarget(document)}
                >
                  <Icon.TrashEmpty sm white />
                </Button>
              </span>
            </Tooltip>
          </Flex>
        ),
      })),
    [documents, t, uploading],
  );

  const columns = useMemo(
    () => [
      {
        key: "fileName" as const,
        label: t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_COL_FILE"),
        customCellRender: (row: KnowledgeDocumentTableRow) => (
          <Title s2 fw3 block>
            {row.fileName}
          </Title>
        ),
      },
      {
        key: "updatedAt" as const,
        label: t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_COL_UPDATED_AT"),
        customCellRender: (row: KnowledgeDocumentTableRow) => (
          <Title s1 gray block leadingRelaxed>
            {row.updatedAt}
          </Title>
        ),
      },
      {
        key: "actions" as const,
        label: t("PSYCHOLOGIST_PATIENTS_COL_ACTIONS"),
        disableSort: true,
      },
    ],
    [t],
  );

  const displayError = actionError || error;

  return (
    <Card padding="lg" shadow="md">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleChange}
      />

      <Flex col wFull gap4>
        <Flex row wFull wrap alignStart justifySpaceBetween gap4>
          <Flex col wFull gap2 flex1>
            <DashboardSectionTitle
              title={t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_TITLE")}
              tooltip={t("TOOLTIP_PSYCHOLOGIST_SETTINGS_KNOWLEDGE")}
            />
            <Title s2 gray block leadingRelaxed>
              {translateTemplate(t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_HINT"), {
                maxSizeMb,
              })}
            </Title>
          </Flex>
          <Button
            type="button"
            variant="primary"
            clickable={!uploading}
            onClick={() => void handleUpload()}
          >
            {t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_ADD")}
          </Button>
        </Flex>

        {uploading ? (
          <Flex row wFull alignCenter gap2>
            <Loading />
            <Title s2 gray block>
              {t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_UPLOADING")}
            </Title>
          </Flex>
        ) : null}

        {loading ? (
          <PageLoader />
        ) : displayError && !documents.length ? (
          <Title s2 error block>
            {displayError}
          </Title>
        ) : documents.length === 0 ? (
          <Title s1 gray block>
            {t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_EMPTY")}
          </Title>
        ) : (
          <Table<KnowledgeDocumentTableRow>
            variant="dark"
            columns={columns}
            dataSource={tableData}
          />
        )}

        {displayError && documents.length > 0 ? (
          <Title s2 error block>
            {displayError}
          </Title>
        ) : null}
      </Flex>

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title={t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_DELETE")}
        message={t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_DELETE_CONFIRM")}
        confirmLabel={t("PSYCHOLOGIST_SETTINGS_KNOWLEDGE_DELETE")}
        cancelLabel={t("PSYCHOLOGIST_PATIENTS_MODAL_CANCEL")}
        confirmVariant="danger"
        onClose={() => {
          if (!uploading) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </Card>
  );
};
