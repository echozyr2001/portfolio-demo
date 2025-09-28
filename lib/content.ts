import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

// Define a generic type for frontmatter data
export type Frontmatter = {
  [key: string]: any;
};

// Define a generic type for content data
export type Content<T extends Frontmatter> = {
  slug: string;
  frontmatter: T;
  content: string;
};

const contentDirectory = path.join(process.cwd(), 'content');

// Generic function to get all content for a given type
export const getAllContent = cache(<T extends Frontmatter>(type: string): Content<T>[] => {
  const typeDirectory = path.join(contentDirectory, type);
  if (!fs.existsSync(typeDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(typeDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(typeDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        frontmatter: data as T,
        content,
      };
    });
});

// Generic function to get a single piece of content by slug
export const getContentBySlug = <T extends Frontmatter>(type: string, slug: string): Content<T> | undefined => {
  const allContent = getAllContent<T>(type);
  return allContent.find((item) => item.slug === slug);
};

// Generic function to get unique values for a given frontmatter key
export const getUniqueFrontmatterValues = <T extends Frontmatter>(type: string, key: keyof T): string[] => {
  const allContent = getAllContent<T>(type);
  const values = new Set<string>();

  allContent.forEach((item) => {
    const value = item.frontmatter[key];
    if (typeof value === 'string' && value) {
      values.add(value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => typeof v === 'string' && v && values.add(v));
    }
  });

  return Array.from(values).sort();
};
