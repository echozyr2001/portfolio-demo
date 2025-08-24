import type { CollectionConfig } from "payload";
import React from "react";
import { EnhancedMonacoEditor } from "../components/cms/EnhancedMonacoEditor";

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "featured", "order", "updatedAt"],
  },
  access: {
    // Only authenticated users can access for management
    read: ({ req: { user } }) => {
      // Public can read published projects, admin can read all
      if (user) return true;
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
      admin: {
        description: "The title of the project",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly version of the title",
      },
      hooks: {
        beforeValidate: [
          ({ value, originalDoc, data }) => {
            if (data?.title && !value) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
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
      admin: {
        description: "Brief description for project cards and previews",
        rows: 2,
      },
    },
    {
      name: "description",
      type: "text",
      required: true,
      admin: {
        description: "Full MDX description of the project with Monaco Editor",
        components: {
          Field: 'components/cms/EnhancedMonacoField#EnhancedMonacoField',
        }
      },
    },
    {
      name: "technologies",
      type: "array",
      required: true,
      fields: [
        {
          name: "technology",
          type: "text",
          required: true,
        },
      ],
      admin: {
        description: "Technologies and tools used in this project",
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
      admin: {
        description: "Main image for the project",
      },
    },
    {
      name: "images",
      type: "array",
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
        description: "Additional images for the project gallery",
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
        description: "Publication status of the project",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Mark as featured project for homepage display",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Display order (lower numbers appear first)",
      },
    },
  ],
  timestamps: true,
};
