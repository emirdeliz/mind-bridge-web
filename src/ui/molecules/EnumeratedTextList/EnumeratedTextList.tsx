type EnumeratedTextListProps = {
  items: string[];
};

export const EnumeratedTextList = ({ items }: EnumeratedTextListProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <ol className='m-0 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mb-muted'>
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
