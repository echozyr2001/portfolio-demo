import { NextRequest, NextResponse } from 'next/server';
import { mediaService } from '@/lib/media-service';

// Get media information (admin endpoint with full details)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get media record from database
    const mediaRecord = await mediaService.getMediaById(id);

    if (!mediaRecord) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Return full media information for admin
    return NextResponse.json({
      success: true,
      data: mediaRecord,
    });

  } catch (error) {
    console.error('Failed to get media:', error);
    return NextResponse.json(
      { error: 'Failed to get media information' },
      { status: 500 }
    );
  }
}

// Update media metadata (admin endpoint)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if media exists
    const mediaRecord = await mediaService.getMediaById(id);
    if (!mediaRecord) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Update alt text if provided
    if (body.alt !== undefined) {
      await mediaService.updateAltText(id, body.alt);
    }

    // Get updated record
    const updatedRecord = await mediaService.getMediaById(id);

    return NextResponse.json({
      success: true,
      message: 'Media updated successfully',
      data: updatedRecord,
    });

  } catch (error) {
    console.error('Failed to update media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

// Delete media file (admin endpoint)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if media exists
    const mediaRecord = await mediaService.getMediaById(id);
    if (!mediaRecord) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // TODO: Check if media is being used in any posts or projects
    // This would require scanning MDX content for references to this media ID
    // For now, we'll allow deletion but this should be implemented for production

    // Delete from database
    await mediaService.deleteMedia(id);

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
      data: {
        id: mediaRecord.id,
        filename: mediaRecord.filename,
        originalName: mediaRecord.originalName,
      },
    });

  } catch (error) {
    console.error('Failed to delete media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}