import { getAllContent, getUniqueFrontmatterValues } from './content';

export type GadgetFrontmatter = {
  title: string;
  category: string;
  url: string;
  notes?: string;
};

const CONTENT_TYPE = 'gadgets';

export const getSortedGadgets = () => {
  const allGadgets = getAllContent<GadgetFrontmatter>(CONTENT_TYPE);
  return allGadgets.map(gadget => {
    // The 'notes' in frontmatter can be supplemented by the main content
    if (!gadget.frontmatter.notes) {
      gadget.frontmatter.notes = gadget.content;
    }
    return gadget;
  }).sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
};

export const getAllGadgetCategories = () => {
  return ['All', ...getUniqueFrontmatterValues(CONTENT_TYPE, 'category')];
};