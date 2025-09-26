import type { CollectionConfig } from 'payload';

export const Weeklies: CollectionConfig = {
  slug: 'weeklies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
    description: 'Weekly reports on what I have learned and done.',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return { status: { equals: 'published' } };
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (data?.title && !value) {
              return data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'text',
      required: true,
      admin: {
        description: 'MDX content of the weekly report.',
        components: {
          Field: '@/components/cms/EnhancedMonacoFieldWrapper#EnhancedMonacoFieldWrapper',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ value, data, originalDoc }) => {
            if (data?.status === 'published' && !value && originalDoc?.status !== 'published') {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
  ],
  timestamps: true,
};