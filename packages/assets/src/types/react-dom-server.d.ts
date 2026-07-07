// `@types/react-dom` is not part of this package's preinstalled dependency
// set (see package.json: only @types/react is a devDependency). This is a
// minimal ambient declaration for the one export the test file needs.
declare module 'react-dom/server' {
  import type { ReactNode } from 'react';
  export function renderToStaticMarkup(node: ReactNode): string;
}
