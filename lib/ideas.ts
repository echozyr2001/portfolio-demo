import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ideasDirectory = path.join(process.cwd(), 'content/ideas');

export type IdeaData = {
  slug: string;
  title: string;
  category: string;
  status: string;
  description: string;
  [key: string]: any;
};

export function getSortedIdeasData(): IdeaData[] {
  const fileNames = fs.readdirSync(ideasDirectory);
  const allIdeasData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(ideasDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        ...(data as {
          title: string;
          category: string;
          status: string;
          description: string;
        }),
      };
    });

  return allIdeasData.sort((a, b) => a.title.localeCompare(b.title));
}

export function getAllIdeaCategories(): string[] {
    const ideas = getSortedIdeasData();
    const allCategories = ideas.reduce((acc, idea) => {
        if (idea.category) {
            acc.add(idea.category);
        }
        return acc;
    }, new Set<string>());

    return ['All Categories', ...Array.from(allCategories)];
}

export function getAllIdeaStatuses(): string[] {
    const ideas = getSortedIdeasData();
    const allStatuses = ideas.reduce((acc, idea) => {
        if (idea.status) {
            acc.add(idea.status);
        }
        return acc;
    }, new Set<string>());

    return ['All Statuses', ...Array.from(allStatuses)];
}
