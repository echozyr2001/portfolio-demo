import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: "filename",
  },
  upload: {
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
      {
        name: "tablet",
        width: 1024,
        height: undefined,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "application/pdf", "video/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Alternative text for accessibility (required for images)",
      },
    },
    {
      name: "caption",
      type: "textarea",
      admin: {
        description: "Optional caption or description for the media",
        rows: 2,
      },
    },
    {
      name: "focalX",
      type: "number",
      admin: {
        description: "Focal point X coordinate (0-100)",
        step: 1,
        condition: (data, siblingData) => {
          return siblingData?.mimeType?.startsWith("image/");
        },
      },
      min: 0,
      max: 100,
    },
    {
      name: "focalY",
      type: "number",
      admin: {
        description: "Focal point Y coordinate (0-100)",
        step: 1,
        condition: (data, siblingData) => {
          return siblingData?.mimeType?.startsWith("image/");
        },
      },
      min: 0,
      max: 100,
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Security validation for file uploads
        if (req.file) {
          const { mimetype, size } = req.file;

          // File size limits (in bytes)
          const maxSizes: Record<string, number> = {
            image: 10 * 1024 * 1024, // 10MB for images
            video: 100 * 1024 * 1024, // 100MB for videos
            application: 5 * 1024 * 1024, // 5MB for documents
          };

          const fileType = mimetype.split("/")[0];
          const maxSize = maxSizes[fileType] || 5 * 1024 * 1024;

          if (size > maxSize) {
            throw new Error(
              `File size too large. Maximum allowed: ${Math.round(maxSize / 1024 / 1024)}MB`
            );
          }

          // Allowed MIME types
          const allowedTypes = [
            // Images
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
            // Documents
            "application/pdf",
            // Videos
            "video/mp4",
            "video/webm",
            "video/ogg",
          ];

          if (!allowedTypes.includes(mimetype)) {
            throw new Error(`File type not allowed: ${mimetype}`);
          }
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, req }) => {
        // Auto-generate alt text if not provided for images
        if (!doc.alt && doc.mimeType?.startsWith("image/")) {
          // Generate basic alt text from filename
          const filename = doc.filename || "image";
          const altText = filename
            .replace(/\.[^/.]+$/, "") // Remove extension
            .replace(/[-_]/g, " ") // Replace dashes and underscores with spaces
            .replace(/\b\w/g, (l: string) => l.toUpperCase()); // Capitalize first letter of each word

          // Update the document with generated alt text
          req.payload.update({
            collection: "media",
            id: doc.id,
            data: {
              alt: altText,
            },
          });
        }

        return doc;
      },
    ],
  },
};
