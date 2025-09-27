import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const weekliesDirectory = path.join(process.cwd(), 'content/weeklies');

export type WeeklyData = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  [key: string]: any;
};

export function getSortedWeekliesData(): WeeklyData[] {
  const fileNames = fs.readdirSync(weekliesDirectory);
  const allWeekliesData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(weekliesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        ...(matterResult.data as {
          title: string;
          date: string;
          excerpt: string;
        }),
      };
    });

  return allWeekliesData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllWeeklySlugs() {
  const fileNames = fs.readdirSync(weekliesDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => ({
      params: {
        slug: fileName.replace(/\.mdx$/, ''),
      },
    }));
}

export async function getWeeklyData(slug: string) {
  const fullPath = path.join(weekliesDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  return {
    slug,
    frontmatter: data,
    content,
  };
}
