import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "publishedAt", "updatedAt"],
    preview: (doc) => {
      return `${process.env.NEXT_PUBLIC_SERVER_URL}/blog/${doc.slug}`;
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Public can read published posts, admin can read all
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
      name: "content",
      type: "textarea",
      required: true,
      admin: {
        description: "Write your blog post content in MDX format",
        rows: 20,
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 300,
      admin: {
        description:
          "Brief summary of the post (optional, will be auto-generated if empty)",
        rows: 3,
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
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
        condition: (data) => data.status === "published",
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData.status === "published" && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "tags",
      type: "array",
      maxRows: 10,
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
      admin: {
        description: "Tags for categorizing the post",
      },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        {
          name: "title",
          type: "text",
          maxLength: 60,
          admin: {
            description:
              "SEO title (max 60 characters). If empty, will use post title.",
          },
        },
        {
          name: "description",
          type: "textarea",
          maxLength: 160,
          admin: {
            description:
              "SEO description (max 160 characters). If empty, will use excerpt.",
            rows: 3,
          },
        },
      ],
      admin: {
        position: "sidebar",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate excerpt from content if not provided
        if (!data.excerpt && data.content) {
          // Remove MDX syntax and get first 200 characters
          const plainText = data.content
            .replace(/```[\s\S]*?```/g, "") // Remove code blocks
            .replace(/`[^`]*`/g, "") // Remove inline code
            .replace(/#{1,6}\s/g, "") // Remove headers
            .replace(/\*\*([^*]*)\*\*/g, "$1") // Remove bold
            .replace(/\*([^*]*)\*/g, "$1") // Remove italic
            .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Remove links
            .replace(/\n/g, " ") // Replace newlines with spaces
            .trim();

          data.excerpt =
            plainText.length > 200
              ? plainText.substring(0, 200) + "..."
              : plainText;
        }

        // Auto-generate SEO fields if not provided
        if (!data.seo?.title && data.title) {
          data.seo = { ...data.seo, title: data.title };
        }

        if (!data.seo?.description && data.excerpt) {
          data.seo = { ...data.seo, description: data.excerpt };
        }

        return data;
      },
    ],
  },
  versions: {
    drafts: true,
  },
};
