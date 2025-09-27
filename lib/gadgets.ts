import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const gadgetsDirectory = path.join(process.cwd(), 'content/gadgets');

export type GadgetData = {
  slug: string;
  title: string;
  category: string;
  url: string;
  notes: string;
  [key: string]: any;
};

export function getSortedGadgetsData(): GadgetData[] {
  const fileNames = fs.readdirSync(gadgetsDirectory);
  const allGadgetsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(gadgetsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      // The 'notes' in frontmatter can be supplemented by the main content
      const notes = data.notes || content;

      return {
        slug,
        notes,
        ...(data as {
          title: string;
          category: string;
          url: string;
        }),
      };
    });

  return allGadgetsData.sort((a, b) => a.title.localeCompare(b.title));
}

export function getAllGadgetCategories(): string[] {
    const gadgets = getSortedGadgetsData();
    const allCategories = gadgets.reduce((acc, gadget) => {
        if (gadget.category) {
            acc.add(gadget.category);
        }
        return acc;
    }, new Set<string>());

    return ['All', ...Array.from(allCategories)];
}
