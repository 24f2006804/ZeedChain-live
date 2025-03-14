// src/lib/mdx-utils.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import rehypePrettyCode from 'rehype-pretty-code';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

interface Frontmatter {
  title: string;
  date?: string;
  excerpt?: string;
  [key: string]: any;
}

export async function getMarkdownContent(filePath: string): Promise<{
  frontmatter: Frontmatter;
  content: MDXRemoteSerializeResult;
}> {
  // Read the file
  const fullPath = path.join(process.cwd(), filePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Parse frontmatter
  const { data, content } = matter(fileContents);
  
  // Serialize the content with MDX
  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [
        [rehypePrettyCode, {
          theme: 'github-dark',
        }],
      ],
    },
  });
  
  return {
    frontmatter: data as Frontmatter,
    content: mdxSource,
  };
}