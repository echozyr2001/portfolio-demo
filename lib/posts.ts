import { getAllContent, getContentBySlug } from './content';

export type PostFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  featuredImage?: string;
  tags?: string[];
};

const CONTENT_TYPE = 'blog';

export const getSortedPosts = () => {
  const allPosts = getAllContent<PostFrontmatter>(CONTENT_TYPE);
  return allPosts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
};

export const getPostBySlug = (slug: string) => {
  return getContentBySlug<PostFrontmatter>(CONTENT_TYPE, slug);
};

export const getAllPostSlugs = () => {
  const allPosts = getAllContent(CONTENT_TYPE);
  return allPosts.map((post) => post.slug);
};