'use client';

import { useCallback, useMemo, type MouseEvent, type ReactNode } from 'react';
import { useRouter } from 'next/router';

import type { PsychologistPatientViewDto } from '@api';
import { usePsychologistPatients } from '@services';
import { Button, Checkbox, Flex, Icon, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, InputSearch, Table, Tooltip } from '@molecules';
import { AppShell } from '@templates';

import { PsychologistPatientFormModal } from './PsychologistPatientFormModal';
import { usePsychologistGuard } from './usePsychologistGuard';

type PatientTableRow = PsychologistPatientViewDto & {
  actions: ReactNode;
};

const stopRowClick = (event: MouseEvent) => {
  event.stopPropagation();
};

export const PsychologistPatientsPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();
  const {
    patients,
    search,
    setSearch,
    includeDeleted,
    setIncludeDeleted,
    loading,
    saving,
    error,
    modalOpen,
    form,
    openCreateModal,
    openEditModal,
    closeModal,
    updateForm,
    savePatient,
    deletePatient,
  } = usePsychologistPatients();

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

  const buildRowActions = useCallback(
    (row: PsychologistPatientViewDto): ReactNode => (
      <div
        className="flex flex-row items-center justify-center gap-2"
        onClick={stopRowClick}
        role="presentation"
      >
        <Tooltip title={t('PSYCHOLOGIST_PATIENTS_ACTION_SESSION')} top minWidth={10}>
          <span className="inline-block">
            <Button
              type="button"
              xs
              sm
              circle
              variant="primary"
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
              <Icon.Chat sm white />
            </Button>
          </span>
        </Tooltip>
        <Tooltip title={t('PSYCHOLOGIST_PATIENTS_ACTION_EDIT')} top minWidth={10}>
          <span className="inline-block">
            <Button
              type="button"
              xs
              sm
              circle
              variant="secondary"
              outlined
              clickable={!row.isDeleted}
              onClick={() => openEditModal(row)}
            >
              <Icon.Pencil sm white />
            </Button>
          </span>
        </Tooltip>
        <Tooltip title={t('PSYCHOLOGIST_PATIENTS_ACTION_DELETE')} top minWidth={10}>
          <span className="inline-block">
            <Button
              type="button"
              xs
              sm
              circle
              variant="danger"
              outlined
              clickable={!row.isDeleted}
              onClick={() => {
                if (window.confirm(t('PSYCHOLOGIST_PATIENTS_DELETE_CONFIRM'))) {
                  void deletePatient(row.id);
                }
              }}
            >
              <Icon.TrashEmpty sm white />
            </Button>
          </span>
        </Tooltip>
      </div>
    ),
    [t, router, openEditModal, deletePatient]
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

  if (guardLoading || !isPsychologist) {
    return null;
  }

  return (
    <AppShell
      title={t('PSYCHOLOGIST_PATIENTS_TITLE')}
      subtitle={t('PSYCHOLOGIST_PATIENTS_SUBTITLE')}
      variant="dashboard"
    >
      <Flex row wFull wrap alignCenter justifySpaceBetween gap4>
        <Flex row flex1 wFull gap4 alignCenter>
          <div className="min-w-0 flex-1 w-full">
            <InputSearch value={search} onChange={setSearch} />
          </div>
          <Button variant="primary" onClick={openCreateModal}>
            {t('PSYCHOLOGIST_PATIENTS_ADD')}
          </Button>
        </Flex>
        <Checkbox
          checked={includeDeleted}
          label={t('PSYCHOLOGIST_PATIENTS_SHOW_DELETED')}
          onChange={setIncludeDeleted}
        />
      </Flex>

      <Title s2 gray>
        {t('PSYCHOLOGIST_PATIENTS_ROW_HINT')}
      </Title>

      {error ? (
        <Title s1 gray>
          {error}
        </Title>
      ) : null}

      {loading ? (
        <Title s1 gray>
          {t('PSYCHOLOGIST_PATIENTS_LOADING')}
        </Title>
      ) : tableData.length === 0 ? (
        <Card padding="md" shadow="sm">
          <Title s1 gray>
            {t('PSYCHOLOGIST_PATIENTS_EMPTY')}
          </Title>
        </Card>
      ) : (
        <Table<PatientTableRow>
          variant="dark"
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

      <PsychologistPatientFormModal
        visible={modalOpen}
        form={form}
        saving={saving}
        onClose={closeModal}
        onConfirm={() => void savePatient()}
        onChange={updateForm}
      />
    </AppShell>
  );
};
