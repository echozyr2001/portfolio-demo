import { NextRequest, NextResponse } from 'next/server';
import { mediaService } from '@/lib/media-service';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (you may want to add proper auth check here)
    // For now, we'll assume the admin routes are protected by middleware

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Process and store the file
    const mediaRecord = await mediaService.processAndStore(file);

    return NextResponse.json({
      success: true,
      data: mediaRecord,
    });

  } catch (error) {
    console.error('Media upload error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB.' },
          { status: 413 }
        );
      }
      
      if (error.message.includes('File type not allowed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 415 }
        );
      }

      if (error.message.includes('File is empty')) {
        return NextResponse.json(
          { error: 'File is empty.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}

// Get all media files with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const mediaFiles = await mediaService.getAllMedia(limit, offset);

    return NextResponse.json({
      success: true,
      data: mediaFiles,
      pagination: {
        limit,
        offset,
        total: mediaFiles.length,
      },
    });

  } catch (error) {
    console.error('Failed to fetch media files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
}