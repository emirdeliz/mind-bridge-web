import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { UserRole } from '@api';
import { getRoleRoute } from '../../services/auth/roleRoute';

import { getPublicSessionProps, getServerSession } from './session.server';

type WithAuthSSROptions = {
  role?: UserRole;
};

export const withAuthSSR = (
  options: WithAuthSSROptions = {}
): GetServerSideProps => {
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

    if (options.role && sessionResult.user.role !== options.role) {
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

export const withPublicSSR = (): GetServerSideProps => {
  return async (ctx) => {
    const sessionResult = await getServerSession(ctx.req, ctx.res);

    if (sessionResult) {
      return {
        redirect: {
          destination: getRoleRoute(sessionResult.user.role),
          permanent: false,
        },
      };
    }

    return {
      props: getPublicSessionProps(null),
    };
  };
};
