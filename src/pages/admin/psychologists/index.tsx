export { AdminPsychologistsPage as default } from '@components';

import { withAdminSSR } from '@lib/auth/withAdminSSR';

export const getServerSideProps = withAdminSSR();
