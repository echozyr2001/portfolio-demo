import { getAllContent, getContentBySlug } from './content';

export type WeeklyFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
};

const CONTENT_TYPE = 'weeklies';

export const getSortedWeeklies = () => {
  const allWeeklies = getAllContent<WeeklyFrontmatter>(CONTENT_TYPE);
  return allWeeklies.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
};

export const getWeeklyBySlug = (slug: string) => {
  return getContentBySlug<WeeklyFrontmatter>(CONTENT_TYPE, slug);
};

export const getAllWeeklySlugs = () => {
  const allWeeklies = getAllContent(CONTENT_TYPE);
  return allWeeklies.map((weekly) => weekly.slug);
};