export { AdminPromptDefaultsPage as default } from '../../ui/components/admin/AdminPromptDefaultsPage';

import { withAdminSSR } from '@lib/auth/withAdminSSR';

export const getServerSideProps = withAdminSSR();
