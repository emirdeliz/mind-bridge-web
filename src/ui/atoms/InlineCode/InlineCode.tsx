import type { ReactNode } from 'react';

/** Texto monoespaçado inline (ex.: caminhos de API, nomes de arquivos). */
export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className='rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-800'>
      {children}
    </code>
  );
}
