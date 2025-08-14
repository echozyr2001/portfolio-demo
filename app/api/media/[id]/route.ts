import { NextRequest, NextResponse } from 'next/server';
import { mediaService } from '@/lib/media-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const thumbnail = searchParams.get('thumbnail') === 'true';

    // Get media record from database
    const mediaRecord = await mediaService.getMediaById(id);

    if (!mediaRecord) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Return JSON metadata if requested
    if (searchParams.get('info') === 'true') {
      return NextResponse.json({
        success: true,
        data: {
          id: mediaRecord.id,
          filename: mediaRecord.filename,
          originalName: mediaRecord.originalName,
          mimeType: mediaRecord.mimeType,
          size: mediaRecord.size,
          width: mediaRecord.width,
          height: mediaRecord.height,
          alt: mediaRecord.alt,
          blurhash: mediaRecord.blurhash,
          createdAt: mediaRecord.createdAt,
        },
      });
    }

    // Serve the actual image data
    const base64Data = thumbnail 
      ? mediaRecord.thumbnailBase64 
      : mediaRecord.base64Data;

    if (!base64Data) {
      return NextResponse.json(
        { error: 'Image data not available' },
        { status: 404 }
      );
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', mediaRecord.mimeType);
    headers.set('Content-Length', imageBuffer.length.toString());
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year
    headers.set('ETag', `"${mediaRecord.id}"`);

    // Check if client has cached version
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === `"${mediaRecord.id}"`) {
      return new NextResponse(null, { status: 304, headers });
    }

    return new NextResponse(imageBuffer, { headers });

  } catch (error) {
    console.error('Failed to serve media:', error);
    return NextResponse.json(
      { error: 'Failed to serve media' },
      { status: 500 }
    );
  }
}

// Update media metadata (alt text, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Currently only support updating alt text
    if (body.alt !== undefined) {
      await mediaService.updateAltText(id, body.alt);
    }

    return NextResponse.json({
      success: true,
      message: 'Media updated successfully',
    });

  } catch (error) {
    console.error('Failed to update media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

// Delete media file
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

    // Delete from database
    await mediaService.deleteMedia(id);

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });

  } catch (error) {
    console.error('Failed to delete media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}