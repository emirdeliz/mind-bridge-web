import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';

import type { UserRole } from '@api';
import { getHomeRoute } from '@services';

import { getPublicSessionProps, getServerSession } from './session.server';

type WithAuthSSROptions = {
  role?: UserRole;
};

export const withAuthSSR = (
  options: WithAuthSSROptions = {}
): GetServerSideProps => {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<
    GetServerSidePropsResult<{ auth: { session: unknown; loading: boolean } }>
  > => {
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
          destination: getHomeRoute({
            role: sessionResult.user.role,
            isAdmin: sessionResult.user.isAdmin,
          }),
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
          destination: getHomeRoute({
            role: sessionResult.user.role,
            isAdmin: sessionResult.user.isAdmin,
          }),
          permanent: false,
        },
      };
    }

    return {
      props: getPublicSessionProps(null),
    };
  };
};
