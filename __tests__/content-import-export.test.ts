import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ContentImportExportService } from "@/lib/content-import-export";
import { db } from "@/lib/db";
import { posts, projects, categories, tags } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test-id-123"),
}));

describe("ContentImportExportService", () => {
  let service: ContentImportExportService;

  beforeEach(() => {
    service = new ContentImportExportService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("importMDXFiles", () => {
    it("should successfully import valid MDX files", async () => {
      const mockFiles = [
        {
          filename: "test-post.mdx",
          content: `---
title: "Test Post"
slug: "test-post"
status: "published"
tags: ["test", "mdx"]
---

# Test Content

This is a test post.`,
        },
      ];

      // Mock database responses
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No existing content
          }),
        }),
      });

      const mockDbInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      (db.select as any).mockImplementation(mockDbSelect);
      (db.insert as any).mockImplementation(mockDbInsert);

      const result = await service.importMDXFiles(mockFiles, "posts", {
        conflictResolution: "skip",
        validateContent: false, // Skip validation for test
        createMissingCategories: true,
        createMissingTags: true,
      });

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle invalid MDX files", async () => {
      const mockFiles = [
        {
          filename: "invalid.txt", // Wrong extension
          content: "Invalid content",
        },
      ];

      const result = await service.importMDXFiles(mockFiles, "posts", {
        conflictResolution: "skip",
        validateContent: true,
        createMissingCategories: true,
        createMissingTags: true,
      });

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].filename).toBe("invalid.txt");
    });

    it("should handle conflict resolution - skip", async () => {
      const mockFiles = [
        {
          filename: "existing-post.mdx",
          content: `---
title: "Existing Post"
slug: "existing-post"
---

# Content`,
        },
      ];

      // Mock existing content
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "existing-id" }]),
          }),
        }),
      });

      (db.select as any).mockImplementation(mockDbSelect);

      const result = await service.importMDXFiles(mockFiles, "posts", {
        conflictResolution: "skip",
        validateContent: false,
        createMissingCategories: true,
        createMissingTags: true,
      });

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it("should handle conflict resolution - overwrite", async () => {
      const mockFiles = [
        {
          filename: "existing-post.mdx",
          content: `---
title: "Updated Post"
slug: "existing-post"
---

# Updated Content`,
        },
      ];

      // Mock existing content
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "existing-id" }]),
          }),
        }),
      });

      const mockDbUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const mockDbDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      (db.select as any).mockImplementation(mockDbSelect);
      (db.update as any).mockImplementation(mockDbUpdate);
      (db.delete as any).mockImplementation(mockDbDelete);

      const result = await service.importMDXFiles(mockFiles, "posts", {
        conflictResolution: "overwrite",
        validateContent: false,
        createMissingCategories: true,
        createMissingTags: true,
      });

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
    });

    it("should create missing categories and tags", async () => {
      const mockFiles = [
        {
          filename: "post-with-new-category.mdx",
          content: `---
title: "Post with New Category"
slug: "post-with-new-category"
category: "New Category"
tags: ["new-tag-1", "new-tag-2"]
---

# Content`,
        },
      ];

      // Mock no existing content, category, or tags
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const mockDbInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });

      (db.select as any).mockImplementation(mockDbSelect);
      (db.insert as any).mockImplementation(mockDbInsert);

      const result = await service.importMDXFiles(mockFiles, "posts", {
        conflictResolution: "skip",
        validateContent: false,
        createMissingCategories: true,
        createMissingTags: true,
      });

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      
      // Should have called insert for category, tags, and post
      expect(mockDbInsert).toHaveBeenCalledTimes(4); // 1 category + 2 tags + 1 post
    });
  });

  describe("exportContent", () => {
    it("should export posts as ZIP file", async () => {
      const mockPosts = [
        {
          id: "post-1",
          title: "Test Post 1",
          slug: "test-post-1",
          mdxContent: "# Test Content 1",
          status: "published",
          publishedAt: new Date("2024-01-01"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ];

      // Mock database query
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockPosts),
      });

      (db.select as any).mockImplementation(mockDbSelect);

      const result = await service.exportContent({
        includeMetadata: true,
        format: "zip",
        contentTypes: ["posts"],
        status: ["published"],
      });

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/content-export-\d{4}-\d{2}-\d{2}\.zip/);
      expect(result.contentType).toBe("application/zip");
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it("should export projects as ZIP file", async () => {
      const mockProjects = [
        {
          id: "project-1",
          title: "Test Project 1",
          slug: "test-project-1",
          mdxContent: "# Test Project Content",
          githubUrl: "https://github.com/test/repo",
          liveUrl: "https://test.com",
          technologies: ["React", "TypeScript"],
          featured: true,
          status: "published",
          publishedAt: new Date("2024-01-01"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ];

      // Mock database query
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockProjects),
      });

      (db.select as any).mockImplementation(mockDbSelect);

      const result = await service.exportContent({
        includeMetadata: true,
        format: "zip",
        contentTypes: ["projects"],
      });

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/content-export-\d{4}-\d{2}-\d{2}\.zip/);
      expect(result.contentType).toBe("application/zip");
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it("should handle empty export", async () => {
      // Mock empty database query
      const mockDbSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue([]),
      });

      (db.select as any).mockImplementation(mockDbSelect);

      const result = await service.exportContent({
        includeMetadata: true,
        format: "zip",
        contentTypes: ["posts"],
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe("utility methods", () => {
    it("should generate slug from filename", async () => {
      const service = new ContentImportExportService();
      
      // Access private method through type assertion for testing
      const generateSlugFromFilename = (service as any).generateSlugFromFilename;
      
      expect(generateSlugFromFilename("test-post.mdx")).toBe("test-post");
      expect(generateSlugFromFilename("My Great Post.md")).toBe("my-great-post");
      expect(generateSlugFromFilename("post_with_underscores.mdx")).toBe("post-with-underscores");
    });

    it("should generate slug from title", async () => {
      const service = new ContentImportExportService();
      
      // Access private method through type assertion for testing
      const generateSlugFromTitle = (service as any).generateSlugFromTitle;
      
      expect(generateSlugFromTitle("My Great Post")).toBe("my-great-post");
      expect(generateSlugFromTitle("Post with Special Characters!@#")).toBe("post-with-special-characters");
      expect(generateSlugFromTitle("中文标题")).toBe("中文标题");
    });
  });
});