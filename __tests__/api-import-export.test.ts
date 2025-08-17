import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as importPOST, GET as importGET } from "@/app/api/admin/content/import/route";
import { POST as exportPOST, GET as exportGET } from "@/app/api/admin/content/export/route";

// Mock the import/export service
vi.mock("@/lib/content-import-export", () => ({
  contentImportExportService: {
    importMDXFiles: vi.fn(),
    exportContent: vi.fn(),
  },
}));

describe("Import/Export API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Import API", () => {
    describe("POST /api/admin/content/import", () => {
      it("should successfully import files", async () => {
        const { contentImportExportService } = await import("@/lib/content-import-export");
        
        // Mock successful import
        (contentImportExportService.importMDXFiles as any).mockResolvedValue({
          success: true,
          imported: 2,
          skipped: 0,
          errors: [],
          warnings: [],
        });

        // Create mock FormData
        const formData = new FormData();
        formData.append("config", JSON.stringify({
          contentType: "posts",
          conflictResolution: "skip",
          validateContent: true,
          createMissingCategories: true,
          createMissingTags: true,
        }));

        // Create mock files
        const file1 = new File(["# Test Post 1"], "post1.mdx", { type: "text/markdown" });
        const file2 = new File(["# Test Post 2"], "post2.mdx", { type: "text/markdown" });
        formData.append("files", file1);
        formData.append("files", file2);

        const request = new NextRequest("http://localhost:3000/api/admin/content/import", {
          method: "POST",
          body: formData,
        });

        const response = await importPOST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.imported).toBe(2);
        expect(contentImportExportService.importMDXFiles).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ filename: "post1.mdx" }),
            expect.objectContaining({ filename: "post2.mdx" }),
          ]),
          "posts",
          expect.objectContaining({
            conflictResolution: "skip",
            validateContent: true,
          })
        );
      });

      it("should return error for missing config", async () => {
        const formData = new FormData();
        const file = new File(["# Test"], "test.mdx", { type: "text/markdown" });
        formData.append("files", file);

        const request = new NextRequest("http://localhost:3000/api/admin/content/import", {
          method: "POST",
          body: formData,
        });

        const response = await importPOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Missing configuration data");
      });

      it("should return error for no files", async () => {
        const formData = new FormData();
        formData.append("config", JSON.stringify({
          contentType: "posts",
          conflictResolution: "skip",
        }));

        const request = new NextRequest("http://localhost:3000/api/admin/content/import", {
          method: "POST",
          body: formData,
        });

        const response = await importPOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("No files provided");
      });

      it("should return error for invalid file types", async () => {
        const formData = new FormData();
        formData.append("config", JSON.stringify({
          contentType: "posts",
          conflictResolution: "skip",
        }));

        const invalidFile = new File(["content"], "test.txt", { type: "text/plain" });
        formData.append("files", invalidFile);

        const request = new NextRequest("http://localhost:3000/api/admin/content/import", {
          method: "POST",
          body: formData,
        });

        const response = await importPOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid file types");
        expect(data.details).toContain("test.txt");
      });

      it("should handle import service errors", async () => {
        const { contentImportExportService } = await import("@/lib/content-import-export");
        
        // Mock service error
        (contentImportExportService.importMDXFiles as any).mockRejectedValue(
          new Error("Import service error")
        );

        const formData = new FormData();
        formData.append("config", JSON.stringify({
          contentType: "posts",
          conflictResolution: "skip",
        }));

        const file = new File(["# Test"], "test.mdx", { type: "text/markdown" });
        formData.append("files", file);

        const request = new NextRequest("http://localhost:3000/api/admin/content/import", {
          method: "POST",
          body: formData,
        });

        const response = await importPOST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Import failed");
        expect(data.message).toBe("Import service error");
      });
    });

    describe("GET /api/admin/content/import", () => {
      it("should return import configuration options", async () => {
        const request = new NextRequest("http://localhost:3000/api/admin/content/import");
        const response = await importGET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty("supportedFormats");
        expect(data.data).toHaveProperty("conflictResolutionOptions");
        expect(data.data).toHaveProperty("contentTypes");
        expect(data.data.supportedFormats).toEqual([".md", ".mdx"]);
        expect(data.data.conflictResolutionOptions).toEqual(["skip", "overwrite", "rename"]);
        expect(data.data.contentTypes).toEqual(["posts", "projects"]);
      });
    });
  });

  describe("Export API", () => {
    describe("POST /api/admin/content/export", () => {
      it("should successfully export content", async () => {
        const { contentImportExportService } = await import("@/lib/content-import-export");
        
        // Mock successful export
        const mockBuffer = Buffer.from("mock zip content");
        (contentImportExportService.exportContent as any).mockResolvedValue({
          success: true,
          filename: "content-export-2024-01-01.zip",
          buffer: mockBuffer,
          contentType: "application/zip",
        });

        const request = new NextRequest("http://localhost:3000/api/admin/content/export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            includeMetadata: true,
            format: "zip",
            contentTypes: ["posts"],
            status: ["published"],
          }),
        });

        const response = await exportPOST(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/zip");
        expect(response.headers.get("Content-Disposition")).toContain("content-export-2024-01-01.zip");
        
        const buffer = await response.arrayBuffer();
        expect(Buffer.from(buffer)).toEqual(mockBuffer);

        expect(contentImportExportService.exportContent).toHaveBeenCalledWith({
          includeMetadata: true,
          format: "zip",
          contentTypes: ["posts"],
          status: ["published"],
        });
      });

      it("should return error for invalid request data", async () => {
        const request = new NextRequest("http://localhost:3000/api/admin/content/export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Missing required contentTypes
            includeMetadata: true,
            format: "zip",
          }),
        });

        const response = await exportPOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid request data");
        expect(data.details).toBeDefined();
      });

      it("should return error for empty content types", async () => {
        const request = new NextRequest("http://localhost:3000/api/admin/content/export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            includeMetadata: true,
            format: "zip",
            contentTypes: [], // Empty array
          }),
        });

        const response = await exportPOST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid request data");
      });

      it("should handle export service errors", async () => {
        const { contentImportExportService } = await import("@/lib/content-import-export");
        
        // Mock service error
        (contentImportExportService.exportContent as any).mockRejectedValue(
          new Error("Export service error")
        );

        const request = new NextRequest("http://localhost:3000/api/admin/content/export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            includeMetadata: true,
            format: "zip",
            contentTypes: ["posts"],
          }),
        });

        const response = await exportPOST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Export failed");
        expect(data.message).toBe("Export service error");
      });
    });

    describe("GET /api/admin/content/export", () => {
      it("should return export configuration options", async () => {
        const response = await exportGET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty("formats");
        expect(data.data).toHaveProperty("contentTypes");
        expect(data.data).toHaveProperty("statusOptions");
        expect(data.data).toHaveProperty("exportOptions");
        expect(data.data.formats).toEqual(["zip"]);
        expect(data.data.contentTypes).toEqual(["posts", "projects"]);
        expect(data.data.statusOptions).toEqual(["draft", "published", "archived"]);
      });
    });
  });
});