import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const projectsDirectory = path.join(process.cwd(), 'content/projects');

export type ProjectData = {
  slug: string;
  title: string;
  shortDescription: string;
  technologies: string[];
  featuredImage?: string;
  images?: { src: string; alt: string; caption?: string }[];
  featured?: boolean;
  order?: number;
  projectUrl?: string;
  githubUrl?: string;
  date?: string;
  [key: string]: any;
};

function getProjectsData(): ProjectData[] {
  const fileNames = fs.readdirSync(projectsDirectory);
  const allProjectsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        ...(matterResult.data as {
          title: string;
          shortDescription: string;
          technologies: string[];
          featuredImage?: string;
          images?: { src: string; alt: string; caption?: string }[];
          featured?: boolean;
          order?: number;
          projectUrl?: string;
          githubUrl?: string;
          date?: string;
        }),
      };
    });
  return allProjectsData;
}


export function getSortedProjectsData(): ProjectData[] {
    const allProjects = getProjectsData();
    return allProjects.sort((a, b) => ((a.order || 99) > (b.order || 99) ? 1 : -1));
}

export function getFeaturedProjects(): ProjectData[] {
  const allProjects = getProjectsData();
  return allProjects
    .filter((project) => project.featured)
    .sort((a, b) => ((a.order || 99) > (b.order || 99) ? 1 : -1));
}

// I will also need functions for the individual project pages later.
export function getAllProjectSlugs() {
  const fileNames = fs.readdirSync(projectsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => ({
      params: {
        slug: fileName.replace(/\.mdx$/, ''),
      },
    }));
}

export async function getProjectData(slug: string) {
  const fullPath = path.join(projectsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  return {
    slug,
    frontmatter: data,
    content,
  };
}
