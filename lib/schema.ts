import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Posts table - Extended for MDX content management
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  
  // Legacy content field (keeping for backward compatibility)
  content: blob("content", { mode: "json" }), // Tiptap JSON格式
  
  // MDX content storage strategy
  contentStorageType: text("content_storage_type", { 
    enum: ["database", "s3"] 
  }).notNull().default("database"),
  
  // Database storage (primary)
  mdxContent: text("mdx_content"), // Complete MDX document
  
  // S3 storage (reserved for future expansion)
  s3Bucket: text("s3_bucket"),
  s3Key: text("s3_key"), // e.g., "posts/2024/01/post-123.mdx"
  s3Url: text("s3_url"),
  
  // Parsed metadata (for query optimization)
  excerpt: text("excerpt"),
  readingTime: integer("reading_time"), // Estimated reading time (minutes)
  wordCount: integer("word_count"), // Word count
  
  // Status management
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),

  // Relations
  categoryId: text("category_id").references(() => categories.id),
});

// Projects table - New table for project showcase
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  
  // Content storage strategy
  contentStorageType: text("content_storage_type", { 
    enum: ["database", "s3"] 
  }).notNull().default("database"),
  
  // Database storage (primary)
  mdxContent: text("mdx_content"), // Project description MDX
  
  // S3 storage (reserved for future expansion)
  s3Bucket: text("s3_bucket"),
  s3Key: text("s3_key"), // e.g., "projects/project-123.mdx"
  s3Url: text("s3_url"),
  
  // Project-specific fields
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  imageUrl: text("image_url"),
  
  // Technology stack
  technologies: text("technologies", { mode: "json" }), // JSON array
  
  // Status and timing
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  featured: integer("featured", { mode: "boolean" }).default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Categories table
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Tags table
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Post-Tags junction table (many-to-many relationship)
export const postTags = sqliteTable("post_tags", {
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

// Project-Tags junction table (many-to-many relationship)
export const projectTags = sqliteTable("project_tags", {
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

// Comments table
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default(
    "pending"
  ),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

  // 访客信息
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),

  // 关联
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),
});

// Media table - Extended for Base64 and S3 storage
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // Original file size
  
  // Legacy URL field (keeping for backward compatibility)
  url: text("url").notNull(),
  
  // Storage strategy fields
  storageType: text("storage_type", { 
    enum: ["base64", "s3"] 
  }).notNull().default("base64"),
  
  // Base64 storage fields (primary)
  base64Data: text("base64_data"), // Optimized Base64 data
  thumbnailBase64: text("thumbnail_base64"), // Thumbnail Base64
  
  // S3 storage fields (reserved for future expansion)
  s3Bucket: text("s3_bucket"),
  s3Key: text("s3_key"),
  s3Url: text("s3_url"),
  
  // Image metadata
  width: integer("width"),
  height: integer("height"),
  blurhash: text("blurhash"), // Placeholder
  alt: text("alt"),
  
  // Optimization information
  compressionRatio: real("compression_ratio"), // Compression ratio
  optimizedSize: integer("optimized_size"), // Optimized size
  
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Relations definitions
export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  tags: many(postTags),
  comments: many(comments),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  tags: many(projectTags),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
  projects: many(projectTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, {
    relationName: "commentReplies",
  }),
}));

// TypeScript types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
