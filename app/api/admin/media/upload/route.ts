import { NextRequest, NextResponse } from 'next/server';
import { mediaService } from '@/lib/media-service';

// File upload validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (you may want to add proper auth check here)
    // For now, we'll assume the admin routes are protected by middleware

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string | null;

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { 
          error: 'No file provided',
          code: 'NO_FILE'
        },
        { status: 400 }
      );
    }

    // Pre-validation before processing
    const validationError = validateFileBeforeProcessing(file);
    if (validationError) {
      return NextResponse.json(validationError.response, { status: validationError.status });
    }

    // Process and store the file
    const mediaRecord = await mediaService.processAndStore(file);

    // Update alt text if provided
    if (alt && alt.trim()) {
      await mediaService.updateAltText(mediaRecord.id, alt.trim());
      mediaRecord.alt = alt.trim();
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: mediaRecord.id,
        filename: mediaRecord.filename,
        originalName: mediaRecord.originalName,
        mimeType: mediaRecord.mimeType,
        size: mediaRecord.size,
        optimizedSize: mediaRecord.optimizedSize,
        compressionRatio: mediaRecord.compressionRatio,
        width: mediaRecord.width,
        height: mediaRecord.height,
        url: mediaRecord.url,
        alt: mediaRecord.alt,
        blurhash: mediaRecord.blurhash,
        createdAt: mediaRecord.createdAt,
      },
    });

  } catch (error) {
    console.error('Media upload error:', error);

    // Handle specific error types with detailed error codes
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return NextResponse.json(
          { 
            error: 'File too large. Maximum size is 5MB.',
            code: 'FILE_TOO_LARGE',
            maxSize: MAX_FILE_SIZE,
            maxSizeMB: MAX_FILE_SIZE / (1024 * 1024)
          },
          { status: 413 }
        );
      }
      
      if (error.message.includes('File type not allowed')) {
        return NextResponse.json(
          { 
            error: error.message,
            code: 'INVALID_FILE_TYPE',
            allowedTypes: ALLOWED_TYPES
          },
          { status: 415 }
        );
      }

      if (error.message.includes('File is empty')) {
        return NextResponse.json(
          { 
            error: 'File is empty.',
            code: 'EMPTY_FILE'
          },
          { status: 400 }
        );
      }

      if (error.message.includes('Failed to process image')) {
        return NextResponse.json(
          { 
            error: 'Failed to process image. The file may be corrupted.',
            code: 'IMAGE_PROCESSING_ERROR'
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to upload file. Please try again.',
        code: 'UPLOAD_ERROR'
      },
      { status: 500 }
    );
  }
}

// Validate file before processing
function validateFileBeforeProcessing(file: File): { response: any; status: number } | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      response: {
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        code: 'FILE_TOO_LARGE',
        fileSize: file.size,
        maxSize: MAX_FILE_SIZE,
        maxSizeMB: MAX_FILE_SIZE / (1024 * 1024)
      },
      status: 413
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      response: {
        error: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        code: 'INVALID_FILE_TYPE',
        fileType: file.type,
        allowedTypes: ALLOWED_TYPES
      },
      status: 415
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      response: {
        error: 'File is empty.',
        code: 'EMPTY_FILE'
      },
      status: 400
    };
  }

  // Check filename
  if (!file.name || file.name.trim() === '') {
    return {
      response: {
        error: 'Invalid filename.',
        code: 'INVALID_FILENAME'
      },
      status: 400
    };
  }

  return null;
}

// Get all media files with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 items
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || ''; // Filter by MIME type prefix (e.g., 'image/')

    const mediaFiles = await mediaService.getAllMedia(limit, offset);

    // Apply client-side filtering (in production, this should be done in the database query)
    let filteredFiles = mediaFiles;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredFiles = filteredFiles.filter(file => 
        file.originalName.toLowerCase().includes(searchLower) ||
        file.filename.toLowerCase().includes(searchLower) ||
        (file.alt && file.alt.toLowerCase().includes(searchLower))
      );
    }

    if (type) {
      filteredFiles = filteredFiles.filter(file => 
        file.mimeType.startsWith(type)
      );
    }

    // Calculate total storage usage
    const totalSize = filteredFiles.reduce((sum, file) => sum + (file.optimizedSize || file.size), 0);
    const totalOriginalSize = filteredFiles.reduce((sum, file) => sum + file.size, 0);

    return NextResponse.json({
      success: true,
      data: filteredFiles,
      pagination: {
        limit,
        offset,
        total: filteredFiles.length,
        hasMore: filteredFiles.length === limit,
      },
      stats: {
        totalFiles: filteredFiles.length,
        totalSize,
        totalOriginalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
        totalOriginalSizeMB: Math.round(totalOriginalSize / (1024 * 1024) * 100) / 100,
        averageCompressionRatio: filteredFiles.length > 0 
          ? filteredFiles.reduce((sum, file) => sum + (file.compressionRatio || 1), 0) / filteredFiles.length
          : 1,
      },
      filters: {
        search,
        type,
      },
    });

  } catch (error) {
    console.error('Failed to fetch media files:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch media files',
        code: 'FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}