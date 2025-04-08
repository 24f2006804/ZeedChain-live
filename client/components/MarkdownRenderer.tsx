// src/components/MarkdownRenderer.tsx
import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';

interface MarkdownRendererProps {
  source: string;
};

const components = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-6 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4">
      {children}
    </h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-2">
      {children}
    </h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a 
      href={href} 
      className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-500"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mt-6 border-l-2 border-slate-300 pl-6 italic text-slate-800 dark:border-slate-600 dark:text-slate-200">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="relative rounded bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-4 mt-6 overflow-x-auto rounded-lg bg-slate-900 p-4 dark:bg-slate-800">
      {children}
    </pre>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border px-4 py-2 text-left font-bold">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border px-4 py-2 text-left">
      {children}
    </td>
  ),
  hr: () => <hr className="my-6 border-slate-200 dark:border-slate-700" />,
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ source }) => {
  const [mdxSource, setMdxSource] = React.useState<any>(null);

  React.useEffect(() => {
    const loadMDX = async () => {
      const serializedContent = await serialize(source);
      setMdxSource(serializedContent);
    };
    
    loadMDX();
  }, [source]);

  if (!mdxSource) {
    return <div className="max-w-none">Loading...</div>;
  }

  return (
    <div className="max-w-none">
      <MDXRemote {...mdxSource} components={components} />
    </div>
  );
};

export default MarkdownRenderer;