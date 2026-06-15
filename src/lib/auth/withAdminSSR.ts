import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { getRoleRoute } from '../../services/auth/roleRoute';

import { getPublicSessionProps, getServerSession } from './session.server';

export const withAdminSSR = (): GetServerSideProps => {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<{ auth: { session: unknown; loading: boolean } }>> => {
    const sessionResult = await getServerSession(ctx.req, ctx.res);

    if (!sessionResult) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    if (!sessionResult.user.isAdmin) {
      return {
        redirect: {
          destination: getRoleRoute(sessionResult.user.role),
          permanent: false,
        },
      };
    }

    return {
      props: getPublicSessionProps(sessionResult.user),
    };
  };
};
