import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tags, postTags } from "@/lib/schema";
import { updateTagSchema, idParamSchema } from "@/lib/validations";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleValidationError,
  getCurrentTimestamp
} from "@/lib/utils";
import { eq, and, count, ne } from "drizzle-orm";
import { ZodError } from "zod";

// GET /api/tags/[id] - Get a single tag by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = idParamSchema.parse(await params);
    
    // Get tag with post count
    const tagResult = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        createdAt: tags.createdAt,
        postCount: count(postTags.postId),
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .where(eq(tags.id, id))
      .groupBy(tags.id)
      .limit(1);
    
    if (tagResult.length === 0) {
      return createErrorResponse(
        'NOT_FOUND',
        'Tag not found',
        404
      );
    }
    
    return createSuccessResponse(tagResult[0]);
    
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    
    console.error('Error fetching tag:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch tag',
      500
    );
  }
}

// PUT /api/tags/[id] - Update a tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = idParamSchema.parse(await params);
    const body = await request.json();
    const validatedData = updateTagSchema.parse(body);
    
    // Check if tag exists
    const existingTag = await db
      .select({ 
        id: tags.id, 
        name: tags.name,
        slug: tags.slug
      })
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);
    
    if (existingTag.length === 0) {
      return createErrorResponse(
        'NOT_FOUND',
        'Tag not found',
        404
      );
    }
    
    const currentTag = existingTag[0];
    
    // Prepare update data
    const updateData: any = {};
    
    // Check for name conflicts
    if (validatedData.name && validatedData.name !== currentTag.name) {
      const nameConflict = await db
        .select({ id: tags.id })
        .from(tags)
        .where(and(
          eq(tags.name, validatedData.name),
          ne(tags.id, id) // Exclude current tag
        ))
        .limit(1);
      
      if (nameConflict.length > 0) {
        return createErrorResponse(
          'CONFLICT',
          'A tag with this name already exists',
          409
        );
      }
      
      updateData.name = validatedData.name;
    }
    
    // Check for slug conflicts
    if (validatedData.slug && validatedData.slug !== currentTag.slug) {
      const slugConflict = await db
        .select({ id: tags.id })
        .from(tags)
        .where(and(
          eq(tags.slug, validatedData.slug),
          ne(tags.id, id) // Exclude current tag
        ))
        .limit(1);
      
      if (slugConflict.length > 0) {
        return createErrorResponse(
          'CONFLICT',
          'A tag with this slug already exists',
          409
        );
      }
      
      updateData.slug = validatedData.slug;
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      // No changes, return current tag
      const currentTagWithCount = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          createdAt: tags.createdAt,
          postCount: count(postTags.postId),
        })
        .from(tags)
        .leftJoin(postTags, eq(tags.id, postTags.tagId))
        .where(eq(tags.id, id))
        .groupBy(tags.id)
        .limit(1);
      
      return createSuccessResponse(
        currentTagWithCount[0],
        'No changes made'
      );
    }
    
    // Update the tag
    await db
      .update(tags)
      .set(updateData)
      .where(eq(tags.id, id));
    
    // Fetch the updated tag with post count
    const updatedTag = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        createdAt: tags.createdAt,
        postCount: count(postTags.postId),
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .where(eq(tags.id, id))
      .groupBy(tags.id)
      .limit(1);
    
    return createSuccessResponse(
      updatedTag[0],
      'Tag updated successfully'
    );
    
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    
    console.error('Error updating tag:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to update tag',
      500
    );
  }
}

// DELETE /api/tags/[id] - Delete a tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = idParamSchema.parse(await params);
    
    // Check if tag exists
    const existingTag = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);
    
    if (existingTag.length === 0) {
      return createErrorResponse(
        'NOT_FOUND',
        'Tag not found',
        404
      );
    }
    
    // Delete tag relations first (cascade will handle this, but explicit is better)
    await db
      .delete(postTags)
      .where(eq(postTags.tagId, id));
    
    // Delete the tag
    await db
      .delete(tags)
      .where(eq(tags.id, id));
    
    return createSuccessResponse(
      null,
      'Tag deleted successfully'
    );
    
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error);
    }
    
    console.error('Error deleting tag:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to delete tag',
      500
    );
  }
}