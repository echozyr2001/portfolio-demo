import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  access: {
    // Public can read media files, only admin can manage
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    // File upload configuration
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ],
    // Security: File size limit handled by server configuration
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility and SEO',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Optional caption for the media file',
        rows: 2,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of the media content',
        rows: 3,
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for organizing media files',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        {
          label: 'Project Images',
          value: 'project',
        },
        {
          label: 'Blog Images',
          value: 'blog',
        },
        {
          label: 'Profile Images',
          value: 'profile',
        },
        {
          label: 'Icons',
          value: 'icon',
        },
        {
          label: 'Documents',
          value: 'document',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'Category for organizing media files',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'photographer',
          type: 'text',
          admin: {
            description: 'Photographer or creator credit',
          },
        },
        {
          name: 'license',
          type: 'select',
          options: [
            {
              label: 'All Rights Reserved',
              value: 'all-rights-reserved',
            },
            {
              label: 'Creative Commons',
              value: 'creative-commons',
            },
            {
              label: 'Public Domain',
              value: 'public-domain',
            },
            {
              label: 'Personal Use',
              value: 'personal-use',
            },
          ],
          admin: {
            description: 'License information for the media',
          },
        },
        {
          name: 'source',
          type: 'text',
          admin: {
            description: 'Source URL or attribution',
          },
        },
      ],
      admin: {
        description: 'Additional metadata for the media file',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Security: Validate file types more strictly
        if (data?.mimeType) {
          const allowedTypes = [
            'image/jpeg',
            'image/png', 
            'image/webp',
            'image/gif',
            'image/svg+xml',
            'application/pdf',
            'video/mp4',
            'video/webm',
          ]
          
          if (!allowedTypes.includes(data.mimeType)) {
            throw new Error(`File type ${data.mimeType} is not allowed`)
          }
        }
        
        return data
      },
    ],
    afterChange: [
      ({ doc, req }) => {
        // Log media uploads for security monitoring
        if (req.user) {
          console.log(`Media uploaded: ${doc.filename} by user ${req.user.email}`)
        }
      },
    ],
  },
  timestamps: true,
}