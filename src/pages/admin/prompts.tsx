export { AdminPromptsPage as default } from '../../ui/components/admin/AdminPromptsPage';

import { withAdminSSR } from '@lib/auth/withAdminSSR';

export const getServerSideProps = withAdminSSR();
