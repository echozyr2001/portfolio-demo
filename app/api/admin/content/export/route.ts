import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentImportExportService, ExportOptions } from "@/lib/content-import-export";

// 导出请求验证schema
const exportRequestSchema = z.object({
  includeMetadata: z.boolean().default(true),
  format: z.enum(["zip", "individual"]).default("zip"),
  contentTypes: z.array(z.enum(["posts", "projects"])).min(1, "At least one content type must be selected"),
  status: z.array(z.enum(["draft", "published", "archived"])).optional(),
});

/**
 * 导出内容为MDX文件
 * POST /api/admin/content/export
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = exportRequestSchema.parse(body);

    // 执行导出
    const exportOptions: ExportOptions = {
      includeMetadata: config.includeMetadata,
      format: config.format,
      contentTypes: config.contentTypes,
      status: config.status,
    };

    const result = await contentImportExportService.exportContent(exportOptions);

    if (!result.success) {
      return NextResponse.json(
        { error: "Export failed" },
        { status: 500 }
      );
    }

    // 返回文件下载响应
    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": result.buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Export error:", error);
    
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
        error: "Export failed", 
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * 获取导出配置选项
 * GET /api/admin/content/export
 */
export async function GET() {
  try {
    // 返回导出配置选项和统计信息
    return NextResponse.json({
      success: true,
      data: {
        formats: ["zip"],
        contentTypes: ["posts", "projects"],
        statusOptions: ["draft", "published", "archived"],
        exportOptions: {
          includeMetadata: {
            description: "Include creation and modification timestamps",
            default: true,
          },
          format: {
            description: "Export format",
            options: ["zip"],
            default: "zip",
          },
        },
      },
    });
  } catch (error) {
    console.error("Get export info error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get export information",
        message: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}