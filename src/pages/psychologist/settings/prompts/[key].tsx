export { PsychologistPromptTemplateEditPage as default } from '@components';

import { withAuthSSR } from '@lib/auth/withAuthSSR';

export const getServerSideProps = withAuthSSR({ role: 'psychologist' });
