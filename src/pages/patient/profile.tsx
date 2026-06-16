import { ProfilePage } from '@components';
import { withAuthSSR } from '@lib/auth/withAuthSSR';

export default function PatientProfilePage() {
  return <ProfilePage area='patient' />;
}

export const getServerSideProps = withAuthSSR({ role: 'patient' });
