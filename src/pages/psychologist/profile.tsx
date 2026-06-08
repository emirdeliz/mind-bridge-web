import { ProfilePage } from '@components';
import { withAuthSSR } from '@lib/auth/withAuthSSR';

export default function PsychologistProfilePage() {
  return <ProfilePage area="psychologist" />;
}

export const getServerSideProps = withAuthSSR({ role: 'psychologist' });
