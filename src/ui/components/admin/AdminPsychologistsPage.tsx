'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/router';

import type { AdminPsychologistListItemDto } from '@api';
import { Button, Flex, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, PageLoader, Table } from '@molecules';
import { AppShell, DashboardSectionTitle } from '@templates';
import { useAdminPsychologists } from '@services';

import { useAdminGuard } from './useAdminGuard';

type PsychologistTableRow = AdminPsychologistListItemDto & {
  actions: null;
};

export const AdminPsychologistsPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { loading: guardLoading, isAdmin } = useAdminGuard();
  const { psychologists, loading, error } = useAdminPsychologists();

  const tableData = useMemo(
    (): PsychologistTableRow[] =>
      psychologists.map((psychologist) => ({
        ...psychologist,
        actions: null,
      })),
    [psychologists]
  );

  const columns = useMemo(
    () => [
      {
        key: 'fullName' as const,
        label: t('ADMIN_PSYCHOLOGISTS_COL_NAME'),
        customCellRender: (row: PsychologistTableRow) => (
          <Title s2 fw3 white block>
            {row.fullName ?? '—'}
          </Title>
        ),
      },
      {
        key: 'email' as const,
        label: t('ADMIN_PSYCHOLOGISTS_COL_EMAIL'),
      },
      {
        key: 'activePatientCount' as const,
        label: t('ADMIN_PSYCHOLOGISTS_COL_ACTIVE_PATIENTS'),
      },
      {
        key: 'totalPatientCount' as const,
        label: t('ADMIN_PSYCHOLOGISTS_COL_TOTAL_PATIENTS'),
      },
    ],
    [t]
  );

  if (!isAdmin && !guardLoading) {
    return null;
  }

  return (
    <AppShell
      title={t('ADMIN_PSYCHOLOGISTS_TITLE')}
      subtitle={t('ADMIN_PSYCHOLOGISTS_SUBTITLE')}
      variant='dashboard'
    >
      <Flex col wFull gap5>
        <Button type='button' variant='secondary' onClick={() => router.back()}>
          {t('BACK')}
        </Button>

        {guardLoading || loading ? (
          <PageLoader />
        ) : error ? (
          <Title s2 error block>
            {error}
          </Title>
        ) : (
          <Card padding='lg' shadow='md'>
            <DashboardSectionTitle
              title={t('ADMIN_PSYCHOLOGISTS_TABLE_TITLE')}
              tooltip={t('TOOLTIP_ADMIN_PSYCHOLOGISTS')}
            />
            <Table
              variant='dark'
              dataSource={tableData}
              columns={columns}
              onRowClick={(row) => {
                void router.push(`/admin/psychologists/${row.id}`);
              }}
            />
          </Card>
        )}
      </Flex>
    </AppShell>
  );
};
