import type { CollectionConfig } from 'payload';

export const Gadgets: CollectionConfig = {
  slug: 'gadgets',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'updatedAt'],
    description: 'Interesting libraries, tools, and other gadgets.',
  },
  access: {
    read: () => true, // Publicly readable
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      admin: {
        description: 'Link to the library, tool, or resource.',
      },
    },
    {
      name: 'notes',
      type: 'text',
      required: true,
      admin: {
        description: 'MDX content for notes and thoughts on the gadget.',
        components: {
          Field: '@/components/cms/EnhancedMonacoFieldWrapper#EnhancedMonacoFieldWrapper',
        },
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
};