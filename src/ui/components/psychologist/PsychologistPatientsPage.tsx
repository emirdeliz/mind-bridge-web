'use client';

import {
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/router';

import type { PsychologistPatientViewDto } from '@api';
import {
  usePsychologistPatientChatHistory,
  usePsychologistPatientContext,
  usePsychologistPatients,
} from '@services';
import { Button, Checkbox, Flex, Icon, Title } from '@atoms';
import { translateTemplate, useI18n } from '@i18n';
import {
  Card,
  ConfirmModal,
  InputSearch,
  PageLoader,
  Switch,
  Table,
  Tooltip,
} from '@molecules';
import { AppShell } from '@templates';

import { PsychologistInviteCodePanel } from './PsychologistInviteCodePanel';
import { PsychologistPatientChatHistoryModal } from './PsychologistPatientChatHistoryModal';
import { PsychologistPatientContextModal } from './PsychologistPatientContextModal';
import { PsychologistPatientFormModal } from './PsychologistPatientFormModal';
import { usePsychologistGuard } from './usePsychologistGuard';

type PatientTableRow = PsychologistPatientViewDto & {
  actions: ReactNode;
};

const stopRowClick = (event: MouseEvent) => {
  event.stopPropagation();
};

type PatientToggleConfirmAction = 'enable' | 'disable';

export const PsychologistPatientsPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();
  const [toggleConfirmPatient, setToggleConfirmPatient] =
    useState<PsychologistPatientViewDto | null>(null);
  const [toggleConfirmAction, setToggleConfirmAction] =
    useState<PatientToggleConfirmAction | null>(null);
  const [toggleConfirmLoading, setToggleConfirmLoading] = useState(false);
  const {
    patients,
    search,
    setSearch,
    includeDeleted,
    setIncludeDeleted,
    loading,
    saving,
    error,
    formError,
    modalOpen,
    form,
    anamnesis,
    loadingAnamnesis,
    openCreateModal,
    openEditModal,
    closeModal,
    updateForm,
    updateAnamnesis,
    savePatient,
    deletePatient,
    restorePatient,
  } = usePsychologistPatients();
  const {
    contextModalOpen,
    contextPatient,
    contextValue,
    loadingContext,
    savingContext,
    contextError,
    openContextModal,
    closeContextModal,
    updateContext,
    saveContext,
  } = usePsychologistPatientContext();
  const {
    chatHistoryModalOpen,
    chatHistoryPatient,
    chatHistoryMessages,
    loadingChatHistory,
    chatHistoryError,
    openChatHistoryModal,
    closeChatHistoryModal,
  } = usePsychologistPatientChatHistory();

  const openPatientDashboard = useCallback(
    (patient: PsychologistPatientViewDto) => {
      void router.push({
        pathname: '/psychologist',
        query: {
          patientId: patient.id,
          patientName: patient.fullName ?? '',
        },
      });
    },
    [router]
  );

  const handlePatientActiveChange = useCallback(
    (patient: PsychologistPatientViewDto, active: boolean) => {
      setToggleConfirmPatient(patient);
      setToggleConfirmAction(active ? 'enable' : 'disable');
    },
    []
  );

  const closeToggleConfirm = useCallback(() => {
    if (toggleConfirmLoading) {
      return;
    }
    setToggleConfirmPatient(null);
    setToggleConfirmAction(null);
  }, [toggleConfirmLoading]);

  const confirmPatientToggle = useCallback(async () => {
    if (!toggleConfirmPatient || !toggleConfirmAction || toggleConfirmLoading) {
      return;
    }

    setToggleConfirmLoading(true);
    try {
      if (toggleConfirmAction === 'enable') {
        await restorePatient(toggleConfirmPatient.id);
      } else {
        await deletePatient(toggleConfirmPatient.id);
      }
      setToggleConfirmPatient(null);
      setToggleConfirmAction(null);
    } finally {
      setToggleConfirmLoading(false);
    }
  }, [
    toggleConfirmPatient,
    toggleConfirmAction,
    toggleConfirmLoading,
    restorePatient,
    deletePatient,
  ]);

  const buildRowActions = useCallback(
    (row: PsychologistPatientViewDto): ReactNode => (
      <div
        className='flex flex-row items-center justify-center gap-2'
        onClick={stopRowClick}
        role='presentation'
      >
        <Tooltip
          title={t('PSYCHOLOGIST_PATIENTS_ACTION_SESSION')}
          top
          minWidth={10}
        >
          <Button
            type='button'
            icon
            variant='primary'
            clickable={!row.isDeleted}
            onClick={() => {
              void router.push({
                pathname: '/psychologist/session',
                query: {
                  patientId: row.id,
                  patientName: row.fullName ?? '',
                },
              });
            }}
          >
            <Icon.Chat nm />
          </Button>
        </Tooltip>
        <Tooltip
          title={t('PSYCHOLOGIST_PATIENTS_ACTION_CHAT_HISTORY')}
          top
          minWidth={10}
        >
          <Button
            type='button'
            icon
            variant='secondary'
            clickable={!row.isDeleted}
            onClick={() => {
              void openChatHistoryModal({
                id: row.id,
                fullName: row.fullName,
              });
            }}
          >
            <Icon.History nm />
          </Button>
        </Tooltip>
        <Tooltip
          title={t('PSYCHOLOGIST_PATIENTS_ACTION_CONTEXT')}
          top
          minWidth={10}
        >
          <Button
            type='button'
            icon
            variant='secondary'
            clickable={!row.isDeleted}
            onClick={() => {
              void openContextModal({
                id: row.id,
                fullName: row.fullName,
              });
            }}
          >
            <Icon.Cog nm />
          </Button>
        </Tooltip>
        <Tooltip
          title={t('PSYCHOLOGIST_PATIENTS_ACTION_EDIT')}
          top
          minWidth={10}
        >
          <Button
            type='button'
            icon
            variant='secondary'
            clickable={!row.isDeleted}
            onClick={() => openEditModal(row)}
          >
            <Icon.Pencil nm />
          </Button>
        </Tooltip>
        <Tooltip
          title={
            row.isDeleted
              ? t('PSYCHOLOGIST_PATIENTS_SWITCH_INACTIVE')
              : t('PSYCHOLOGIST_PATIENTS_SWITCH_ACTIVE')
          }
          top
          minWidth={10}
        >
          <span className='ml-1.5 inline-flex items-center justify-center'>
            <Switch
              sm
              id={`patient-active-${row.id}`}
              selected={!row.isDeleted}
              onChange={(active) => handlePatientActiveChange(row, active)}
            />
          </span>
        </Tooltip>
      </div>
    ),
    [t, router, openChatHistoryModal, openContextModal, openEditModal, handlePatientActiveChange]
  );

  const tableData = useMemo((): PatientTableRow[] => {
    return patients.map((patient) => ({
      ...patient,
      actions: buildRowActions(patient),
    }));
  }, [patients, buildRowActions]);

  const columns = useMemo(
    () => [
      {
        key: 'fullName' as const,
        label: t('PSYCHOLOGIST_PATIENTS_COL_NAME'),
      },
      {
        key: 'phone' as const,
        label: t('PSYCHOLOGIST_PATIENTS_COL_PHONE'),
        phone: true,
      },
      {
        key: 'lastConsultationAt' as const,
        label: t('PSYCHOLOGIST_PATIENTS_COL_LAST_CONSULTATION'),
        date: true,
      },
      {
        key: 'actions' as const,
        label: t('PSYCHOLOGIST_PATIENTS_COL_ACTIONS'),
        disableSort: true,
      },
    ],
    [t]
  );

  if (!isPsychologist && !guardLoading) {
    return null;
  }

  const toggleConfirmPatientName =
    toggleConfirmPatient?.fullName?.trim() || toggleConfirmPatient?.email || '';

  const isEnableConfirm = toggleConfirmAction === 'enable';

  return (
    <AppShell
      title={t('PSYCHOLOGIST_PATIENTS_TITLE')}
      subtitle={t('PSYCHOLOGIST_PATIENTS_SUBTITLE')}
      variant='dashboard'
    >
      {guardLoading ? (
        <PageLoader />
      ) : (
        <>
          <PsychologistInviteCodePanel />
          <Flex row wFull wrap alignCenter justifySpaceBetween gap4 mt4>
            <Flex row flex1 wFull gap4 alignCenter>
              <div className='min-w-0 flex-1 w-full'>
                <InputSearch value={search} onChange={setSearch} />
              </div>
              <Button variant='primary' onClick={openCreateModal}>
                {t('PSYCHOLOGIST_PATIENTS_ADD')}
              </Button>
            </Flex>
            <Checkbox
              checked={includeDeleted}
              label={t('PSYCHOLOGIST_PATIENTS_SHOW_DELETED')}
              onChange={setIncludeDeleted}
            />
          </Flex>

          <Title hint gray>
            {t('PSYCHOLOGIST_PATIENTS_ROW_HINT')}
          </Title>

          {error ? (
            <Title s1 gray>
              {error}
            </Title>
          ) : null}

          {loading && patients.length === 0 ? (
            <PageLoader />
          ) : tableData.length === 0 ? (
            <Card padding='md' shadow='sm'>
              <Title s1 gray>
                {t('PSYCHOLOGIST_PATIENTS_EMPTY')}
              </Title>
            </Card>
          ) : (
            <Table<PatientTableRow>
              variant='dark'
              columns={columns}
              dataSource={tableData}
              sortable
              onRowClick={(row) => {
                if (!row.isDeleted) {
                  openPatientDashboard(row);
                }
              }}
            />
          )}

          <ConfirmModal
            visible={Boolean(toggleConfirmPatient && toggleConfirmAction)}
            title={t(
              isEnableConfirm
                ? 'PSYCHOLOGIST_PATIENTS_ENABLE_CONFIRM_TITLE'
                : 'PSYCHOLOGIST_PATIENTS_DISABLE_CONFIRM_TITLE'
            )}
            message={
              toggleConfirmPatientName
                ? translateTemplate(
                    t(
                      isEnableConfirm
                        ? 'PSYCHOLOGIST_PATIENTS_ENABLE_CONFIRM_MESSAGE_NAMED'
                        : 'PSYCHOLOGIST_PATIENTS_DISABLE_CONFIRM_MESSAGE_NAMED'
                    ),
                    { name: toggleConfirmPatientName }
                  )
                : t(
                    isEnableConfirm
                      ? 'PSYCHOLOGIST_PATIENTS_ENABLE_CONFIRM_MESSAGE'
                      : 'PSYCHOLOGIST_PATIENTS_DISABLE_CONFIRM_MESSAGE'
                  )
            }
            confirmLabel={t(
              isEnableConfirm
                ? 'PSYCHOLOGIST_PATIENTS_ENABLE_CONFIRM_ACTION'
                : 'PSYCHOLOGIST_PATIENTS_DISABLE_CONFIRM_ACTION'
            )}
            cancelLabel={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
            confirmVariant={isEnableConfirm ? 'primary' : 'danger'}
            onClose={closeToggleConfirm}
            onConfirm={() => void confirmPatientToggle()}
          />

          <PsychologistPatientFormModal
            visible={modalOpen}
            form={form}
            anamnesis={anamnesis}
            loadingAnamnesis={loadingAnamnesis}
            saving={saving}
            formError={formError}
            onClose={closeModal}
            onConfirm={() => void savePatient()}
            onChange={updateForm}
            onAnamnesisChange={updateAnamnesis}
          />

          <PsychologistPatientContextModal
            visible={contextModalOpen}
            patientName={contextPatient?.fullName}
            value={contextValue}
            loading={loadingContext}
            saving={savingContext}
            error={contextError}
            onClose={closeContextModal}
            onConfirm={() => void saveContext()}
            onChange={updateContext}
          />

          <PsychologistPatientChatHistoryModal
            visible={chatHistoryModalOpen}
            patientName={chatHistoryPatient?.fullName}
            messages={chatHistoryMessages}
            loading={loadingChatHistory}
            error={chatHistoryError}
            onClose={closeChatHistoryModal}
          />
        </>
      )}
    </AppShell>
  );
};
