import { Label, Title } from '@atoms';
import { ShowSkeleton } from '@molecules';

export interface ContentInfoRowProps {
  title: string;
  info?: string;
  loading: boolean;
}

export const ContentInfoRow = ({
  loading,
  title,
  info,
}: ContentInfoRowProps) => {
  const contentInfoClasses = [
    'flex flex-col gap-2',
    'p-3',
  ].join(' ');

  return (
    <div className={contentInfoClasses}>
      <Title s1 n2>
        {title}
      </Title>
      <ShowSkeleton when={loading} width="200px" height="14px">
        <Label fs3 fw3>
          {info}
        </Label>
      </ShowSkeleton>
    </div>
  );
};
