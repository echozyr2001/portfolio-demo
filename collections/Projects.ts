import type { CollectionConfig } from "payload";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "featured", "order", "updatedAt"],
    preview: (doc) => {
      return `${process.env.NEXT_PUBLIC_SERVER_URL}/projects/${doc.slug}`;
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Public can read published projects, admin can read all
      if (user) {
        return true;
      }
      return {
        status: {
          equals: "published",
        },
      };
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      maxLength: 100,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, originalDoc, data }) => {
            if (data?.title && !value) {
              return data.title
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "");
            }
            return value;
          },
        ],
      },
    },
    {
      name: "shortDescription",
      type: "textarea",
      required: true,
      maxLength: 200,
      admin: {
        description: "Brief description for project cards and listings",
        rows: 3,
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: {
        description: "Full project description in MDX format",
        rows: 15,
      },
    },
    {
      name: "technologies",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: "technology",
          type: "text",
          required: true,
        },
      ],
      admin: {
        description: "Technologies used in this project",
      },
    },
    {
      name: "projectUrl",
      type: "text",
      admin: {
        description: "Live project URL (optional)",
      },
      validate: (value: string | null | undefined) => {
        if (value && !value.match(/^https?:\/\/.+/)) {
          return "Please enter a valid URL starting with http:// or https://";
        }
        return true;
      },
    },
    {
      name: "githubUrl",
      type: "text",
      admin: {
        description: "GitHub repository URL (optional)",
      },
      validate: (value: string | null | undefined) => {
        if (value && !value.match(/^https?:\/\/(www\.)?github\.com\/.+/)) {
          return "Please enter a valid GitHub URL";
        }
        return true;
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        position: "sidebar",
        description: "Main project image for cards and hero sections",
      },
    },
    {
      name: "images",
      type: "array",
      maxRows: 10,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "caption",
          type: "text",
          admin: {
            description: "Optional caption for the image",
          },
        },
      ],
      admin: {
        description:
          "Additional project images for galleries and detailed views",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        {
          label: "Draft",
          value: "draft",
        },
        {
          label: "Published",
          value: "published",
        },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Mark as featured project to highlight on homepage",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Display order (lower numbers appear first)",
        step: 1,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Ensure featured projects have a reasonable order
        if (data.featured && (data.order === undefined || data.order === 0)) {
          data.order = 1;
        }

        return data;
      },
    ],
  },
  versions: {
    drafts: true,
  },
};
