import { getAllContent, getUniqueFrontmatterValues } from './content';

export type IdeaFrontmatter = {
  title: string;
  category: string;
  status: string;
  description: string;
};

const CONTENT_TYPE = 'ideas';

export const getSortedIdeas = () => {
  const allIdeas = getAllContent<IdeaFrontmatter>(CONTENT_TYPE);
  return allIdeas.sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
};

export const getAllIdeaCategories = () => {
  return ['All Categories', ...getUniqueFrontmatterValues(CONTENT_TYPE, 'category')];
};

export const getAllIdeaStatuses = () => {
  return ['All Statuses', ...getUniqueFrontmatterValues(CONTENT_TYPE, 'status')];
};