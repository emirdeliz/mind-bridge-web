export { RegisterPage as default } from '@components';

import { withPublicSSR } from '@lib/auth/withAuthSSR';

export const getServerSideProps = withPublicSSR();
