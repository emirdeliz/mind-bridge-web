type EnumeratedTextListProps = {
  items: string[];
  /** Match Title s1 gray (summary/insights). Default true. */
  muted?: boolean;
};

export const EnumeratedTextList = ({
  items,
  muted = true,
}: EnumeratedTextListProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <ol
      className={[
        'm-0 list-decimal space-y-2 pl-5 text-sm leading-relaxed',
        muted ? 'text-mb-muted' : 'text-mb-text',
      ].join(' ')}
    >
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className='break-words whitespace-pre-wrap'
        >
          {item}
        </li>
      ))}
    </ol>
  );
};
