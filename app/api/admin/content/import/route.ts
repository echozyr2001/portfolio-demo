import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentImportExportService, ImportOptions } from "@/lib/content-import-export";

// 导入请求验证schema
const importRequestSchema = z.object({
  contentType: z.enum(["posts", "projects"]),
  conflictResolution: z.enum(["skip", "overwrite", "rename"]).default("skip"),
  validateContent: z.boolean().default(true),
  createMissingCategories: z.boolean().default(true),
  createMissingTags: z.boolean().default(true),
});

/**
 * 批量导入MDX文件
 * POST /api/admin/content/import
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 获取配置参数
    const configData = formData.get("config") as string;
    if (!configData) {
      return NextResponse.json(
        { error: "Missing configuration data" },
        { status: 400 }
      );
    }

    const config = importRequestSchema.parse(JSON.parse(configData));
    
    // 获取上传的文件
    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const invalidFiles = files.filter(file => 
      !file.name.match(/\.(md|mdx)$/i)
    );
    
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { 
          error: "Invalid file types", 
          details: `Only .md and .mdx files are allowed. Invalid files: ${invalidFiles.map(f => f.name).join(", ")}` 
        },
        { status: 400 }
      );
    }

    // 读取文件内容
    const fileContents = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        content: await file.text(),
      }))
    );

    // 执行导入
    const importOptions: ImportOptions = {
      conflictResolution: config.conflictResolution,
      validateContent: config.validateContent,
      createMissingCategories: config.createMissingCategories,
      createMissingTags: config.createMissingTags,
    };

    const result = await contentImportExportService.importMDXFiles(
      fileContents,
      config.contentType,
      importOptions
    );

    return NextResponse.json({
      success: result.success,
      message: `Import completed. ${result.imported} imported, ${result.skipped} skipped, ${result.errors.length} errors.`,
      data: result,
    });

  } catch (error) {
    console.error("Import error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Import failed", 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * 获取导入状态和历史
 * GET /api/admin/content/import
 */
export async function GET() {
  try {
    // 这里可以返回导入历史、统计信息等
    // 目前返回基本的导入配置选项
    return NextResponse.json({
      success: true,
      data: {
        supportedFormats: [".md", ".mdx"],
        maxFileSize: "10MB",
        conflictResolutionOptions: ["skip", "overwrite", "rename"],
        contentTypes: ["posts", "projects"],
      },
    });
  } catch (error) {
    console.error("Get import info error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get import information",
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}